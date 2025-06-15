import { Pool, PoolClient } from 'pg';
import { supabase } from '../integrations/supabase/client';
import { systemMonitor } from '../services/systemMonitoringService';
import { analytics } from '../integrations/analytics';

export interface DatabaseConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeout: number;
  createTimeout: number;
  destroyTimeout: number;
  idleTimeout: number;
  reapInterval: number;
  createRetryInterval: number;
}

export interface QueryOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class DatabaseConnectionPool {
  private pool: Pool;
  private static instance: DatabaseConnectionPool;
  private readonly DEFAULT_CONFIG: DatabaseConfig = {
    maxConnections: 100,
    minConnections: 10,
    acquireTimeout: 5000,
    createTimeout: 3000,
    destroyTimeout: 5000,
    idleTimeout: 30000,
    reapInterval: 1000,
    createRetryInterval: 200
  };

  private constructor() {
    this.initializePool();
    this.startHealthMonitoring();
  }

  public static getInstance(): DatabaseConnectionPool {
    if (!DatabaseConnectionPool.instance) {
      DatabaseConnectionPool.instance = new DatabaseConnectionPool();
    }
    return DatabaseConnectionPool.instance;
  }

  private initializePool(): void {
    const config = this.DEFAULT_CONFIG;
    this.pool = new Pool({
      max: config.maxConnections,
      min: config.minConnections,
      acquireTimeoutMillis: config.acquireTimeout,
      createTimeoutMillis: config.createTimeout,
      destroyTimeoutMillis: config.destroyTimeout,
      idleTimeoutMillis: config.idleTimeout,
      reapIntervalMillis: config.reapInterval,
      createRetryIntervalMillis: config.createRetryInterval
    });

    // Add connection event listeners
    this.pool.on('connect', (client) => {
      analytics.track('database_connection_established', {
        connectionId: client.id,
        timestamp: Date.now()
      });
    });

    this.pool.on('error', (error) => {
      analytics.track('database_connection_error', {
        error: error.message,
        timestamp: Date.now()
      });
      systemMonitor.triggerEmergencyShutdown();
    });
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      try {
        const stats = await this.pool.query('SELECT * FROM pg_stat_activity');
        const activeConnections = stats.rows.length;
        
        if (activeConnections > this.DEFAULT_CONFIG.maxConnections * 0.8) {
          systemMonitor.trackPerformance('database_connection_warning', {
            activeConnections,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Database health monitoring failed:', error);
      }
    }, 10000); // Check every 10 seconds
  }

  public async query<T>(
    query: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    const { retries = 3, retryDelay = 1000, timeout = 5000 } = options;
    
    return this.executeWithRetry(query, params, retries, retryDelay, timeout);
  }

  private async executeWithRetry(
    query: string,
    params: any[],
    retries: number,
    retryDelay: number,
    timeout: number
  ): Promise<any[]> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < retries) {
      try {
        const client = await this.pool.connect();
        
        try {
          const result = await Promise.race([
            client.query(query, params),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Query timeout')), timeout)
            )
          ]);

          client.release();
          return result.rows;
        } catch (error) {
          client.release();
          throw error;
        }
      } catch (error) {
        lastError = error;
        attempts++;
        
        if (attempts === retries) throw lastError;
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempts) * retryDelay)
        );
      }
    }

    throw lastError;
  }

  public async transaction<T>(
    operations: ((client: PoolClient) => Promise<T>),
    options: QueryOptions = {}
  ): Promise<T> {
    const { retries = 3, retryDelay = 1000 } = options;

    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < retries) {
      try {
        const client = await this.pool.connect();
        
        try {
          await client.query('BEGIN');
          const result = await operations(client);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      } catch (error) {
        lastError = error;
        attempts++;
        
        if (attempts === retries) throw lastError;
        
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempts) * retryDelay)
        );
      }
    }

    throw lastError;
  }

  public async close(): Promise<void> {
    try {
      await this.pool.end();
      analytics.track('database_pool_closed', {
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to close database pool:', error);
    }
  }
}

export const dbPool = DatabaseConnectionPool.getInstance();

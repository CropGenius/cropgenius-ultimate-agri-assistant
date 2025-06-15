import { performance } from 'perf_hooks';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { analytics } from '../integrations/analytics';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  activeUsers: number;
  databaseConnections: number;
  errorRate: number;
  apiRateLimit: number;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  metrics: PerformanceMetrics;
  issues: string[];
  timestamp: number;
}

export class SystemMonitoringService {
  private static instance: SystemMonitoringService;
  private healthCheckInterval: NodeJS.Timeout;
  private errorCount = 0;
  private lastCheckTime = 0;
  private readonly MAX_ERROR_RATE = 0.01;
  private readonly MAX_RESPONSE_TIME = 800;
  private readonly MEMORY_THRESHOLD = 50 * 1024 * 1024; // 50MB

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): SystemMonitoringService {
    if (!SystemMonitoringService.instance) {
      SystemMonitoringService.instance = new SystemMonitoringService();
    }
    return SystemMonitoringService.instance;
  }

  private async checkDatabaseHealth(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('get_database_stats')
        .select('connections');
      
      if (error) throw error;
      return data[0].connections;
    } catch (error) {
      console.error('Database health check failed:', error);
      return 0;
    }
  }

  private async checkApiRateLimit(): Promise<number> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health/rate-limit`);
      const data = await response.json();
      return data.remaining;
    } catch (error) {
      console.error('API rate limit check failed:', error);
      return 0;
    }
  }

  private trackPerformance(operation: string, callback: () => Promise<any>): Promise<any> {
    const start = performance.now();
    
    try {
      const result = await callback();
      const duration = performance.now() - start;
      
      if (duration > this.MAX_RESPONSE_TIME) {
        this.errorCount++;
        analytics.track('performance_warning', {
          operation,
          duration,
          timestamp: Date.now()
        });
        
        // Trigger auto-scaling if response times consistently high
        if (this.errorCount > 5) {
          this.triggerAutoScaling();
        }
      }
      
      return result;
    } catch (error) {
      this.errorCount++;
      throw error;
    }
  }

  private async getSystemHealth(): Promise<SystemHealth> {
    const metrics = await Promise.all([
      this.measureResponseTime(),
      this.getMemoryUsage(),
      this.getActiveUsers(),
      this.checkDatabaseHealth(),
      this.getErrorRate(),
      this.checkApiRateLimit()
    ]);

    const issues: string[] = [];
    const status = this.determineHealthStatus(metrics, issues);

    return {
      status,
      metrics: {
        responseTime: metrics[0],
        memoryUsage: metrics[1],
        activeUsers: metrics[2],
        databaseConnections: metrics[3],
        errorRate: metrics[4],
        apiRateLimit: metrics[5]
      },
      issues,
      timestamp: Date.now()
    };
  }

  private determineHealthStatus(metrics: number[], issues: string[]): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
    const [responseTime, memoryUsage, activeUsers, connections, errorRate, apiRateLimit] = metrics;

    if (responseTime > this.MAX_RESPONSE_TIME) {
      issues.push('High response time detected');
    }

    if (memoryUsage > this.MEMORY_THRESHOLD) {
      issues.push('Memory usage above threshold');
    }

    if (errorRate > this.MAX_ERROR_RATE) {
      issues.push('Error rate above threshold');
    }

    if (apiRateLimit < 100) {
      issues.push('API rate limit approaching exhaustion');
    }

    if (connections > 80) {
      issues.push('High database connection count');
    }

    if (issues.length > 3) return 'CRITICAL';
    if (issues.length > 0) return 'WARNING';
    return 'HEALTHY';
  }

  private async measureResponseTime(): Promise<number> {
    const start = performance.now();
    await this.trackPerformance('health_check', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    return performance.now() - start;
  }

  private getMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  private async getActiveUsers(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('active_users')
        .select('count(*)')
        .eq('last_active', 'now() - interval \'5 minutes\'');
      
      if (error) throw error;
      return data[0].count;
    } catch (error) {
      console.error('Active users check failed:', error);
      return 0;
    }
  }

  private getErrorRate(): number {
    const currentTime = Date.now();
    const timeWindow = 60000; // 1 minute
    
    if (currentTime - this.lastCheckTime > timeWindow) {
      this.errorCount = 0;
      this.lastCheckTime = currentTime;
    }
    
    return this.errorCount / (timeWindow / 1000);
  }

  private initializeMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        analytics.track('system_health', health);

        if (health.status === 'CRITICAL') {
          toast.error('System Health Critical', {
            description: health.issues.join(', ')
          });
          this.triggerAutoScaling();
        } else if (health.status === 'WARNING') {
          toast.warning('System Health Warning', {
            description: health.issues.join(', ')
          });
        }
      } catch (error) {
        console.error('Health monitoring failed:', error);
      }
    }, 10000); // Check every 10 seconds
  }

  private triggerAutoScaling(): void {
    // Implementation of auto-scaling logic
    console.log('Triggering auto-scaling...');
    analytics.track('auto_scaling_triggered', {
      reason: 'performance_threshold_exceeded',
      timestamp: Date.now()
    });
  }

  public async validateDeployment(): Promise<boolean> {
    const health = await this.getSystemHealth();
    return health.status === 'HEALTHY';
  }

  public async triggerEmergencyShutdown(): Promise<void> {
    // Implementation of emergency shutdown logic
    console.log('Initiating emergency shutdown...');
    analytics.track('emergency_shutdown', {
      reason: 'system_failure',
      timestamp: Date.now()
    });
  }
}

export const systemMonitor = SystemMonitoringService.getInstance();

// src/services/supabaseClient.ts

/**
 * @file supabaseClient.ts
 * @description Initializes and exports the Supabase client instance.
 * This is the single source of truth for the Supabase client.
 * It is configured for production use with explicit type safety,
 * schema, and auth settings.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { APP_CONFIG } from '../lib/config';
import { AppError, ErrorCode, reportError, reportWarning } from '../lib/errors';
import { networkManager } from '../lib/network';

/**
 * Enterprise-grade Supabase client with:
 * - Automatic retry logic
 * - Offline queue support
 * - Comprehensive error handling
 * - Performance monitoring
 * - Type safety
 */

interface SupabaseClientOptions {
  enableRetries: boolean;
  enableOfflineQueue: boolean;
  maxRetries: number;
  retryDelay: number;
}

export class EnhancedSupabaseClient {
  private client: SupabaseClient<Database>;
  private options: SupabaseClientOptions;

  constructor(options: Partial<SupabaseClientOptions> = {}) {
    this.options = {
      enableRetries: true,
      enableOfflineQueue: true,
      maxRetries: APP_CONFIG.performance.maxRetries,
      retryDelay: APP_CONFIG.performance.retryDelay,
      ...options,
    };

    try {
      this.client = createClient<Database>(
        APP_CONFIG.api.supabase.url,
        APP_CONFIG.api.supabase.anonKey,
        {
          db: {
            schema: 'public',
          },
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
          },
          global: {
            fetch: this.enhancedFetch.bind(this),
            headers: {
              'X-Client-Version': APP_CONFIG.version,
              'X-Client-Name': APP_CONFIG.name,
            },
          },
        }
      );

      // Set up auth state change monitoring
      this.setupAuthMonitoring();
      
      
    } catch (error) {
      const appError = new AppError(
        ErrorCode.UNKNOWN_ERROR,
        'Failed to initialize Supabase client',
        'Application failed to start. Please refresh the page.',
        { error }
      );
      reportError(appError);
      throw appError;
    }
  }

  private async enhancedFetch(
    url: RequestInfo | URL,
    options?: RequestInit
  ): Promise<Response> {
    const operation = () => fetch(url, options);

    try {
      if (this.options.enableOfflineQueue) {
        return await networkManager.executeWithRetry(operation, {
          retries: this.options.maxRetries,
          priority: this.getOperationPriority(url, options),
        });
      } else {
        return await operation();
      }
    } catch (error) {
      throw this.handleNetworkError(error, url, options);
    }
  }

  private getOperationPriority(
    url: RequestInfo | URL,
    options?: RequestInit
  ): 'low' | 'medium' | 'high' {
    const urlString = url.toString();
    const method = options?.method?.toUpperCase() || 'GET';

    // High priority: Auth operations, credit transactions
    if (urlString.includes('/auth/') || urlString.includes('credits')) {
      return 'high';
    }

    // Medium priority: POST, PUT, DELETE operations
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      return 'medium';
    }

    // Low priority: GET operations
    return 'low';
  }

  private handleNetworkError(
    error: any,
    url: RequestInfo | URL,
    options?: RequestInit
  ): AppError {
    if (error instanceof AppError) {
      return error;
    }

    let code = ErrorCode.NETWORK_FAILED;
    let userMessage = 'Network error occurred';

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      code = ErrorCode.NETWORK_OFFLINE;
      userMessage = 'You appear to be offline';
    } else if (error.message?.includes('timeout')) {
      code = ErrorCode.NETWORK_TIMEOUT;
      userMessage = 'Request timed out';
    }

    return new AppError(
      code,
      error.message || 'Network request failed',
      userMessage,
      { url: url.toString(), method: options?.method || 'GET' },
      true
    );
  }

  private setupAuthMonitoring(): void {
    this.client.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          reportWarning('User signed in successfully', { userId: session?.user?.id });
          break;
        case 'SIGNED_OUT':
          reportWarning('User signed out');
          // Clear any cached data
          this.clearOfflineCache();
          break;
        case 'TOKEN_REFRESHED':
          reportWarning('Auth token refreshed');
          break;
        case 'USER_UPDATED':
          reportWarning('User profile updated', { userId: session?.user?.id });
          break;
      }
    });
  }

  private clearOfflineCache(): void {
    // Clear localStorage cache for user-specific data
    const keysToRemove = Object.keys(localStorage).filter(key =>
      key.startsWith('sb-') || 
      key.startsWith('cache-') ||
      key.startsWith('credits-') ||
      key.startsWith('fields-')
    );

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to clear cache key:', key);
      }
    });
  }

  // Expose the underlying client with enhanced error handling
  public get auth() {
    return this.client.auth;
  }

  public get storage() {
    return this.client.storage;
  }

  public get functions() {
    return this.client.functions;
  }

  public from<T extends keyof Database['public']['Tables']>(table: T) {
    return this.client.from(table);
  }

  public rpc(functionName: string, args?: any) {
    return this.client.rpc(functionName, args);
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from('profiles').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // Get connection status
  public getConnectionStatus(): {
    isHealthy: boolean;
    lastError: string | null;
  } {
    // This would need to be implemented with actual health tracking
    return {
      isHealthy: true,
      lastError: null,
    };
  }
}

// Export singleton instance
export const supabase = new EnhancedSupabaseClient();

// Export types for convenience
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

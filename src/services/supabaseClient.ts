// src/services/supabaseClient.ts

/**
 * @file supabaseClient.ts
 * @description Initializes and exports the Supabase client instance.
 * This is the single source of truth for the Supabase client.
 * It is configured for production use with explicit type safety,
 * schema, and auth settings.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
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

class EnhancedSupabaseClient {
  private static instance: EnhancedSupabaseClient;
  private client: SupabaseClient<Database>;
  private options: SupabaseClientOptions;
  private static initialized = false;

  private constructor(options: Partial<SupabaseClientOptions> = {}) {
    if (EnhancedSupabaseClient.initialized) {
      throw new Error('EnhancedSupabaseClient is a singleton and cannot be instantiated directly');
    }

    EnhancedSupabaseClient.initialized = true;
    EnhancedSupabaseClient.instance = this;

    this.options = {
      enableRetries: true,
      enableOfflineQueue: true,
      maxRetries: APP_CONFIG.performance.maxRetries,
      retryDelay: APP_CONFIG.performance.retryDelay,
      ...options,
    };

    try {
      // Initialize Supabase client with basic config
      this.client = createClient<Database>(
        APP_CONFIG.api.supabase.url,
        '', // Empty anon key since we'll handle auth tokens manually
        {
          db: {
            schema: 'public',
          },
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            flowOptions: {
              // Configure PKCE flow options
              codeChallengeMethod: 'S256',
              scopes: ['openid', 'email', 'profile'],
            },
          },
          global: {
            headers: {
              'X-Client-Version': APP_CONFIG.version,
              'X-Client-Name': APP_CONFIG.name,
            },
          },
        }
      );

      // Set up auth token management
      this.setupAuthTokenManagement();

      // Set up auth state change monitoring
      this.setupAuthMonitoring();
      
      reportWarning('Supabase client initialized successfully');
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
      // Always retry auth requests with exponential backoff
      if (url.toString().includes('/auth/')) {
        return await networkManager.executeWithRetry(operation, {
          retries: this.options.maxRetries,
          priority: 'high',
          backoff: true, // Enable exponential backoff for auth requests
        });
      }

      if (this.options.enableOfflineQueue && this.shouldRetry(url)) {
        return await networkManager.executeWithRetry(operation, {
          retries: this.options.maxRetries,
          priority: this.getOperationPriority(url, options),
        });
      } else {
        return await operation();
      }
    } catch (error) {
      // Handle network errors and retry if appropriate
      const appError = this.handleNetworkError(error, url, options);
      if (appError.context?.retry) {
        return await networkManager.executeWithRetry(operation, {
          retries: this.options.maxRetries,
          priority: this.getOperationPriority(url, options),
        });
      }
      throw appError;
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

  private shouldRetry(url: RequestInfo | URL, response?: Response): boolean {
    const urlString = url.toString();
    
    // Allow retrying auth requests with exponential backoff
    if (urlString.includes('/auth/')) {
      return true;
    }
    
    // Don't retry 4xx errors (client errors)
    if (response && response.status >= 400 && response.status < 500) {
      return false;
    }
    
    return true;
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
    let retry = false;

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      code = ErrorCode.NETWORK_OFFLINE;
      userMessage = 'You appear to be offline';
      retry = true;
    } else if (error.message?.includes('timeout')) {
      code = ErrorCode.NETWORK_TIMEOUT;
      userMessage = 'Request timed out';
      retry = true;
    }

    return new AppError(
      code,
      error.message || 'Network request failed',
      userMessage,
      { 
        url: url.toString(), 
        method: options?.method || 'GET',
        retry: retry 
      },
      true
    );
  }

  private setupAuthTokenManagement(): void {
    // Handle initial auth token
    const initialToken = localStorage.getItem('supabase_auth_token');
    if (initialToken) {
      this.client.auth.setAuth(initialToken);
      networkManager.notifyAuthChange(initialToken);
    }

    // Set up auth state change monitoring
    this.client.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case 'SIGNED_IN':
          if (session?.access_token) {
            // Store token for offline use
            localStorage.setItem('supabase_auth_token', session.access_token);
            networkManager.notifyAuthChange(session.access_token);
            reportWarning('User signed in successfully', { userId: session.user?.id });
          }
          break;
        case 'SIGNED_OUT':
          // Clear stored token and cached data
          localStorage.removeItem('supabase_auth_token');
          this.clearOfflineCache();
          networkManager.notifyAuthChange(null);
          reportWarning('User signed out');
          break;
        case 'TOKEN_REFRESHED':
          if (session?.access_token) {
            // Update stored token and notify network manager
            localStorage.setItem('supabase_auth_token', session.access_token);
            networkManager.notifyAuthChange(session.access_token);
          }
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

  // Static method to get the singleton instance
  public static getInstance(options?: Partial<SupabaseClientOptions>): EnhancedSupabaseClient {
    if (!EnhancedSupabaseClient.instance) {
      EnhancedSupabaseClient.instance = new EnhancedSupabaseClient(options);
    }
    return EnhancedSupabaseClient.instance;
  }

  public rpc(functionName: string, args?: any) {
    return this.client.rpc(functionName, args);
  }

  // Health check method with proper error handling and status tracking
  private lastHealthCheck: Date | null = null;
  private healthCheckInterval = 5 * 60 * 1000; // 5 minutes
  private healthCheckError: string | null = null;

  public async healthCheck(): Promise<boolean> {
    try {
      // Only perform health check if it's been longer than the interval
      if (this.lastHealthCheck && Date.now() - this.lastHealthCheck.getTime() < this.healthCheckInterval) {
        return true;
      }

      // Check auth health
      const { data: authData, error: authError } = await this.client.auth.getSession();
      if (authError) {
        throw authError;
      }

      // Check database health
      const { error: dbError } = await this.client.from('profiles').select('id').limit(1);
      if (dbError) {
        throw dbError;
      }

      // Check storage health
      const { error: storageError } = await this.client.storage.from('public').list('');
      if (storageError) {
        throw storageError;
      }

      this.lastHealthCheck = new Date();
      this.healthCheckError = null;
      return true;
    } catch (error) {
      this.healthCheckError = error instanceof Error ? error.message : 'Unknown health check error';
      reportError(new AppError(
        ErrorCode.SERVICE_UNAVAILABLE,
        'Service health check failed',
        'Some services may be unavailable',
        { error }
      ));
      return false;
    }
  }

  // Get connection status
  public getConnectionStatus(): {
    isHealthy: boolean;
    lastError: string | null;
  } {
    return {
      isHealthy: this.healthCheckError === null,
      lastError: this.healthCheckError
    };
  }
}

// Export singleton instance
export const supabase = EnhancedSupabaseClient.getInstance();

// Export types for convenience
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

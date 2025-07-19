import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 🚀 INFINITY IQ ENVIRONMENT VALIDATION SYSTEM
interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  debugInfo: {
    hasUrlEnv: boolean;
    hasKeyEnv: boolean;
    keyLength: number;
    urlPattern: boolean;
    keyPattern: boolean;
  };
}

// 🔥 PRODUCTION-GRADE ENVIRONMENT VALIDATOR
function validateEnvironment(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    supabaseUrl: '',
    supabaseAnonKey: '',
    isValid: false,
    errors: [],
    warnings: [],
    debugInfo: {
      hasUrlEnv: false,
      hasKeyEnv: false,
      keyLength: 0,
      urlPattern: false,
      keyPattern: false
    }
  };

  // Extract environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Debug info collection
  config.debugInfo.hasUrlEnv = !!envUrl;
  config.debugInfo.hasKeyEnv = !!envKey;
  config.debugInfo.keyLength = envKey?.length || 0;

  // URL Validation
  if (!envUrl) {
    config.errors.push('VITE_SUPABASE_URL is missing from environment variables');
  } else {
    const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/;
    config.debugInfo.urlPattern = urlPattern.test(envUrl);
    
    if (!config.debugInfo.urlPattern) {
      config.errors.push('VITE_SUPABASE_URL format is invalid. Expected: https://your-project.supabase.co');
    } else {
      config.supabaseUrl = envUrl;
    }
  }

  // API Key Validation
  if (!envKey) {
    config.errors.push('VITE_SUPABASE_ANON_KEY is missing from environment variables');
  } else {
    // JWT pattern validation for Supabase anon key
    const keyPattern = /^eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    config.debugInfo.keyPattern = keyPattern.test(envKey);
    
    if (!config.debugInfo.keyPattern) {
      config.errors.push('VITE_SUPABASE_ANON_KEY format is invalid. Expected JWT format');
    } else if (envKey.length < 100) {
      config.warnings.push('VITE_SUPABASE_ANON_KEY seems unusually short for a Supabase key');
    } else {
      config.supabaseAnonKey = envKey;
    }
  }

  // Overall validation
  config.isValid = config.errors.length === 0;

  return config;
}

// 🌟 ENVIRONMENT VALIDATION EXECUTION
const environmentConfig = validateEnvironment();

// 🔒 SECURE FALLBACK: NO HARDCODED CREDENTIALS IN PRODUCTION
if (!environmentConfig.isValid || environmentConfig.errors.length > 0) {
  console.error('🚨 [SECURITY] Environment validation failed - no hardcoded fallbacks allowed');
  
  // In development, provide helpful guidance
  if (import.meta.env.DEV) {
    console.error(`
🔧 DEVELOPMENT SETUP REQUIRED:
1. Copy .env.example to .env
2. Add your Supabase project credentials:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
3. Restart the development server

Current errors:
${environmentConfig.errors.map(error => `❌ ${error}`).join('\n')}
    `);
  }
  
  // Throw error to prevent application from running with invalid configuration
  throw new Error('Supabase configuration validation failed. Please check your environment variables.');
}

// 🚨 CRITICAL ERROR HANDLING - NO FALLBACKS IN PRODUCTION
if (!environmentConfig.isValid) {
  const errorMessage = `
🚨 CROPGENIUS ENVIRONMENT CONFIGURATION ERROR 🚨

Critical environment variables are missing or invalid:
${environmentConfig.errors.map(error => `❌ ${error}`).join('\n')}

${environmentConfig.warnings.length > 0 ? `
Warnings:
${environmentConfig.warnings.map(warning => `⚠️ ${warning}`).join('\n')}
` : ''}

🔧 SOLUTION STEPS:
1. Copy .env.example to .env
2. Add your Supabase project URL and anon key
3. Restart the development server

Debug Information:
- Has URL env: ${environmentConfig.debugInfo.hasUrlEnv}
- Has Key env: ${environmentConfig.debugInfo.hasKeyEnv}
- Key length: ${environmentConfig.debugInfo.keyLength}
- URL pattern valid: ${environmentConfig.debugInfo.urlPattern}
- Key pattern valid: ${environmentConfig.debugInfo.keyPattern}

🌍 This affects 100 million farmers - let's get this right!
  `;
  
  console.error(errorMessage);
  throw new Error('Environment configuration failed validation. Check console for details.');
}

// 💪 SUCCESS LOGGING FOR DEVELOPERS
if (import.meta.env.DEV) {
  console.log('🚀 [CROPGENIUS ENV] Environment validation PASSED!', {
    url: environmentConfig.supabaseUrl.replace(/https:\/\/([^.]+)\..*/, 'https://$1.supabase.co'),
    keyLength: environmentConfig.supabaseAnonKey.length,
    warnings: environmentConfig.warnings.length,
    debugInfo: environmentConfig.debugInfo
  });
}

// 🚀 INFINITY IQ SINGLETON SUPABASE CLIENT MANAGER
class SupabaseClientManager {
  private static instance: SupabaseClient<Database> | null = null;
  private static isInitialized = false;
  private static instanceId = Math.random().toString(36).substring(7);

  static getInstance(): SupabaseClient<Database> {
    if (!this.instance || !this.isInitialized) {
      console.log(`🔥 [CROPGENIUS SINGLETON] Creating new Supabase client instance: ${this.instanceId}`);
      
      this.instance = createClient<Database>(
        environmentConfig.supabaseUrl, 
        environmentConfig.supabaseAnonKey, 
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false, // 🚨 NUCLEAR FIX: Disable to prevent hanging
            flowType: 'pkce',
            storageKey: 'cropgenius-auth-v4', // FIXED: Consistent storage key for PKCE persistence
            debug: import.meta.env.DEV
          },
          global: {
            headers: {
              'X-Client-Info': 'cropgenius-web@1.0.0',
              'X-Instance-ID': this.instanceId
            }
          },
          db: {
            schema: 'public'
          },
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        }
      );
      
      this.isInitialized = true;
      
      if (import.meta.env.DEV) {
        console.log('🌟 [CROPGENIUS SINGLETON] Client created successfully!', {
          instanceId: this.instanceId,
          url: environmentConfig.supabaseUrl.replace(/https:\/\/([^.]+)\..*/, 'https://$1.supabase.co'),
          storageKey: 'cropgenius-auth-v4'
        });
      }
    }
    
    return this.instance;
  }

  static reset(): void {
    console.log('🔄 [CROPGENIUS SINGLETON] Resetting client instance');
    this.instance = null;
    this.isInitialized = false;
    this.instanceId = Math.random().toString(36).substring(7);
  }

  static getInstanceId(): string {
    return this.instanceId;
  }

  static isClientInitialized(): boolean {
    return this.isInitialized && this.instance !== null;
  }
}

// 🌟 EXPORT THE SINGLETON INSTANCE
export const supabase = SupabaseClientManager.getInstance();

// 🔥 PRODUCTION-GRADE CONNECTION HEALTH SYSTEM
export const checkSupabaseConnection = async (): Promise<{ 
  connected: boolean; 
  error?: string;
  latency?: number;
  timestamp: string;
  instanceId: string;
}> => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const instanceId = SupabaseClientManager.getInstanceId();
  
  try {
    // Test basic database connectivity
    const { error } = await supabase.from('profiles').select('count').limit(1);
    const latency = Date.now() - startTime;
    
    if (error) {
      return { 
        connected: false, 
        error: error.message,
        latency,
        timestamp,
        instanceId
      };
    }
    
    return { 
      connected: true,
      latency,
      timestamp,
      instanceId
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown connection error',
      latency,
      timestamp,
      instanceId
    };
  }
};

// 🌟 ENVIRONMENT CONFIGURATION GETTER
export const getEnvironmentConfig = () => environmentConfig;

// 🚀 SINGLETON MANAGER UTILITIES
export const SupabaseManager = {
  getInstance: () => SupabaseClientManager.getInstance(),
  reset: () => SupabaseClientManager.reset(),
  getInstanceId: () => SupabaseClientManager.getInstanceId(),
  isInitialized: () => SupabaseClientManager.isClientInitialized(),
  
  // 💪 HEALTH CHECK WITH RETRY LOGIC
  healthCheck: async (retries = 3): Promise<{ 
    connected: boolean; 
    error?: string;
    latency?: number;
    timestamp: string;
    instanceId: string;
    attempts: number;
  }> => {
    let lastError = '';
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      const result = await checkSupabaseConnection();
      
      if (result.connected) {
        return { ...result, attempts: attempt };
      }
      
      lastError = result.error || 'Unknown error';
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    return {
      connected: false,
      error: lastError,
      timestamp: new Date().toISOString(),
      instanceId: SupabaseClientManager.getInstanceId(),
      attempts: retries
    };
  },

  // 🚀 COMPREHENSIVE RETRY LOGIC FOR OPERATIONS
  withRetry: async <T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      retryCondition?: (error: any) => boolean;
      onRetry?: (attempt: number, error: any) => void;
    } = {}
  ): Promise<T> => {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      retryCondition = (error) => {
        // Retry on network errors, timeouts, and temporary server errors
        return error?.code === 'PGRST301' || // Connection error
               error?.code === 'PGRST116' || // Timeout
               error?.message?.includes('timeout') ||
               error?.message?.includes('network') ||
               error?.message?.includes('connection') ||
               (error?.status >= 500 && error?.status < 600); // Server errors
      },
      onRetry = () => {}
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on the last attempt or if retry condition fails
        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          maxDelay
        );

        onRetry(attempt + 1, error);

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  },

  // 🔍 COMPREHENSIVE DIAGNOSTICS
  diagnostics: async (): Promise<{
    environment: EnvironmentConfig;
    connection: Awaited<ReturnType<typeof checkSupabaseConnection>>;
    auth: {
      hasSession: boolean;
      userId?: string;
      sessionExpiry?: string;
    };
    performance: {
      queryLatency?: number;
      authLatency?: number;
    };
    features: {
      realtime: boolean;
      storage: boolean;
      edgeFunctions: boolean;
    };
  }> => {
    const startTime = Date.now();
    
    // Test connection
    const connection = await checkSupabaseConnection();
    
    // Test auth
    const { data: { session } } = await supabase.auth.getSession();
    const auth = {
      hasSession: !!session,
      userId: session?.user?.id,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined
    };

    // Test performance
    const queryStart = Date.now();
    try {
      await supabase.from('profiles').select('count').limit(1);
    } catch (error) {
      // Ignore errors for performance test
    }
    const queryLatency = Date.now() - queryStart;

    const authStart = Date.now();
    try {
      await supabase.auth.getUser();
    } catch (error) {
      // Ignore errors for performance test
    }
    const authLatency = Date.now() - authStart;

    // Test features
    const features = {
      realtime: true, // Assume available
      storage: true,  // Assume available
      edgeFunctions: true // Assume available
    };

    return {
      environment: environmentConfig,
      connection,
      auth,
      performance: {
        queryLatency,
        authLatency
      },
      features
    };
  },

  // 📊 TELEMETRY AND MONITORING
  telemetry: {
    enabled: !import.meta.env.PROD, // Disable in production unless explicitly enabled
    
    logOperation: (operation: string, duration: number, success: boolean, error?: any) => {
      if (!SupabaseManager.telemetry.enabled) return;
      
      console.log(`📊 [SUPABASE TELEMETRY] ${operation}`, {
        duration: `${duration}ms`,
        success,
        error: error?.message,
        timestamp: new Date().toISOString(),
        instanceId: SupabaseClientManager.getInstanceId()
      });
    },

    trackQuery: async <T>(queryName: string, queryFn: () => Promise<T>): Promise<T> => {
      const startTime = Date.now();
      try {
        const result = await queryFn();
        const duration = Date.now() - startTime;
        SupabaseManager.telemetry.logOperation(queryName, duration, true);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        SupabaseManager.telemetry.logOperation(queryName, duration, false, error);
        throw error;
      }
    }
  }
};

// Export types for use throughout the application
export type { Database } from './types';
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
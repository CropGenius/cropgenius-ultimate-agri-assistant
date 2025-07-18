// 🚀 CROPGENIUS INFINITY IQ AUTH CONFIGURATION MANAGER
// Production-ready authentication configuration for 100 MILLION FARMERS! 🌍💪

import { OAuthFlowType } from './oauthFlowManager';
import { logAuthEvent, AuthEventType } from './authDebugger';

// 🔥 AUTHENTICATION CONFIGURATION INTERFACE
export interface AuthConfig {
  // OAuth Flow Configuration
  oauth: {
    preferredFlow: OAuthFlowType;
    fallbackEnabled: boolean;
    autoSelectOptimal: boolean;
    
    // PKCE Configuration
    pkce: {
      codeVerifierLength: number;
      codeChallengeMethod: 'S256';
      stateLength: number;
      expirationMinutes: number;
      storageKeyPrefix: string;
      cleanupInterval: number; // milliseconds
    };
    
    // Implicit Flow Configuration
    implicit: {
      enabled: boolean;
      scopes: string[];
      queryParams: Record<string, string>;
    };
    
    // Redirect Configuration
    redirects: {
      signInCallback: string;
      signOutCallback: string;
      defaultPostAuth: string;
      onboardingRequired: string;
    };
  };
  
  // Storage Configuration
  storage: {
    primaryMethod: 'localStorage' | 'sessionStorage';
    enableFallbacks: boolean;
    keyPrefix: string;
    supabaseStorageKey: string;
    enableMemoryFallback: boolean;
  };
  
  // Security Configuration
  security: {
    enforceHTTPS: boolean;
    validateOrigin: boolean;
    allowedOrigins: string[];
    requireNonce: boolean;
    maxRetries: number;
    rateLimitWindow: number; // milliseconds
    maxAttemptsPerWindow: number;
  };
  
  // Debug Configuration
  debug: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    includeTimings: boolean;
    includeSensitiveData: boolean;
    enableDebugDashboard: boolean;
    exportDiagnostics: boolean;
  };
  
  // Environment Configuration
  environment: {
    isDevelopment: boolean;
    isProduction: boolean;
    isStaging: boolean;
    apiUrl: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
  };
  
  // Feature Flags
  features: {
    enablePKCE: boolean;
    enableImplicit: boolean;
    enableHybrid: boolean;
    enableAutoCleanup: boolean;
    enableHealthChecks: boolean;
    enablePerformanceTracking: boolean;
  };
}

// 🌟 DEFAULT CONFIGURATION - PRODUCTION READY
const DEFAULT_CONFIG: AuthConfig = {
  oauth: {
    preferredFlow: OAuthFlowType.AUTO,
    fallbackEnabled: true,
    autoSelectOptimal: true,
    
    pkce: {
      codeVerifierLength: 128,
      codeChallengeMethod: 'S256',
      stateLength: 32,
      expirationMinutes: 10,
      storageKeyPrefix: 'cropgenius-pkce-',
      cleanupInterval: 5 * 60 * 1000 // 5 minutes
    },
    
    implicit: {
      enabled: true,
      scopes: ['openid', 'email', 'profile'],
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    },
    
    redirects: {
      signInCallback: '/auth/callback',
      signOutCallback: '/auth',
      defaultPostAuth: '/',
      onboardingRequired: '/onboarding'
    }
  },
  
  storage: {
    primaryMethod: 'localStorage',
    enableFallbacks: true,
    keyPrefix: 'cropgenius-auth-',
    supabaseStorageKey: 'cropgenius-auth-v4',
    enableMemoryFallback: true
  },
  
  security: {
    enforceHTTPS: true,
    validateOrigin: true,
    allowedOrigins: [
      'https://cropgenius.africa',
      'https://www.cropgenius.africa',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173'
    ],
    requireNonce: false,
    maxRetries: 3,
    rateLimitWindow: 60 * 1000, // 1 minute
    maxAttemptsPerWindow: 5
  },
  
  debug: {
    enabled: false, // Will be overridden by environment
    logLevel: 'info',
    includeTimings: true,
    includeSensitiveData: false, // Will be overridden by environment
    enableDebugDashboard: false, // Will be overridden by environment
    exportDiagnostics: false // Will be overridden by environment
  },
  
  environment: {
    isDevelopment: false, // Will be set by environment detection
    isProduction: true, // Will be set by environment detection
    isStaging: false, // Will be set by environment detection
    apiUrl: '', // Will be set from environment variables
    supabaseUrl: '', // Will be set from environment variables
    supabaseAnonKey: '' // Will be set from environment variables
  },
  
  features: {
    enablePKCE: true,
    enableImplicit: true,
    enableHybrid: true,
    enableAutoCleanup: true,
    enableHealthChecks: true,
    enablePerformanceTracking: true
  }
};

// 🚀 ENVIRONMENT DETECTION AND CONFIGURATION
function detectEnvironment(): Partial<AuthConfig['environment']> {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  const isStaging = window.location.hostname.includes('staging');
  
  return {
    isDevelopment,
    isProduction,
    isStaging,
    apiUrl: window.location.origin,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
}

// 💪 ENVIRONMENT-SPECIFIC OVERRIDES
function getEnvironmentOverrides(): Partial<AuthConfig> {
  const env = detectEnvironment();
  
  const overrides: Partial<AuthConfig> = {
    environment: env
  };
  
  // Development overrides
  if (env.isDevelopment) {
    overrides.debug = {
      enabled: true,
      logLevel: 'debug',
      includeTimings: true,
      includeSensitiveData: true,
      enableDebugDashboard: true,
      exportDiagnostics: true
    };
    
    overrides.security = {
      ...DEFAULT_CONFIG.security,
      enforceHTTPS: false, // Allow HTTP in development
      validateOrigin: false // More lenient in development
    };
  }
  
  // Staging overrides
  if (env.isStaging) {
    overrides.debug = {
      enabled: true,
      logLevel: 'info',
      includeTimings: true,
      includeSensitiveData: false,
      enableDebugDashboard: true,
      exportDiagnostics: true
    };
  }
  
  // Production overrides
  if (env.isProduction) {
    overrides.debug = {
      enabled: false,
      logLevel: 'error',
      includeTimings: false,
      includeSensitiveData: false,
      enableDebugDashboard: false,
      exportDiagnostics: false
    };
    
    overrides.security = {
      ...DEFAULT_CONFIG.security,
      enforceHTTPS: true,
      validateOrigin: true
    };
  }
  
  return overrides;
}

// 🔥 CONFIGURATION MANAGER - INFINITY IQ SINGLETON
export class AuthConfigManager {
  private static instance: AuthConfigManager | null = null;
  private config: AuthConfig;
  private listeners: Array<(config: AuthConfig) => void> = [];
  
  private constructor() {
    this.config = this.buildConfig();
    this.logConfiguration();
  }
  
  static getInstance(): AuthConfigManager {
    if (!this.instance) {
      this.instance = new AuthConfigManager();
      logAuthEvent(AuthEventType.INITIALIZATION, 'Auth Configuration Manager initialized with INFINITY IQ');
    }
    return this.instance;
  }
  
  private buildConfig(): AuthConfig {
    const envOverrides = getEnvironmentOverrides();
    
    // Deep merge configuration
    const config = this.deepMerge(DEFAULT_CONFIG, envOverrides) as AuthConfig;
    
    // Apply environment variable overrides
    if (import.meta.env.VITE_AUTH_PREFERRED_FLOW) {
      config.oauth.preferredFlow = import.meta.env.VITE_AUTH_PREFERRED_FLOW as OAuthFlowType;
    }
    
    if (import.meta.env.VITE_AUTH_DEBUG_ENABLED) {
      config.debug.enabled = import.meta.env.VITE_AUTH_DEBUG_ENABLED === 'true';
    }
    
    if (import.meta.env.VITE_AUTH_ENFORCE_HTTPS) {
      config.security.enforceHTTPS = import.meta.env.VITE_AUTH_ENFORCE_HTTPS === 'true';
    }
    
    return config;
  }
  
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  private logConfiguration(): void {
    if (this.config.debug.enabled) {
      logAuthEvent(AuthEventType.INITIALIZATION, 'Auth configuration loaded', {
        environment: this.config.environment.isDevelopment ? 'development' : 
                    this.config.environment.isStaging ? 'staging' : 'production',
        preferredFlow: this.config.oauth.preferredFlow,
        debugEnabled: this.config.debug.enabled,
        httpsEnforced: this.config.security.enforceHTTPS,
        featuresEnabled: Object.entries(this.config.features)
          .filter(([_, enabled]) => enabled)
          .map(([feature, _]) => feature)
      });
    }
  }
  
  // 🌟 PUBLIC API
  getConfig(): AuthConfig {
    return { ...this.config }; // Return copy to prevent mutations
  }
  
  updateConfig(updates: Partial<AuthConfig>): void {
    const oldConfig = { ...this.config };
    this.config = this.deepMerge(this.config, updates);
    
    logAuthEvent(AuthEventType.INITIALIZATION, 'Auth configuration updated', {
      updatedKeys: Object.keys(updates)
    });
    
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.config);
      } catch (error) {
        console.error('Auth config listener error:', error);
      }
    });
  }
  
  subscribe(listener: (config: AuthConfig) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  // 🔥 CONVENIENCE GETTERS
  get oauth() { return this.config.oauth; }
  get storage() { return this.config.storage; }
  get security() { return this.config.security; }
  get debug() { return this.config.debug; }
  get environment() { return this.config.environment; }
  get features() { return this.config.features; }
  
  // 💪 VALIDATION METHODS
  validateConfiguration(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate environment variables
    if (!this.config.environment.supabaseUrl) {
      errors.push('VITE_SUPABASE_URL is required');
    }
    
    if (!this.config.environment.supabaseAnonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required');
    }
    
    // Validate security settings
    if (this.config.environment.isProduction && !this.config.security.enforceHTTPS) {
      warnings.push('HTTPS should be enforced in production');
    }
    
    if (this.config.environment.isProduction && this.config.debug.includeSensitiveData) {
      errors.push('Sensitive data should not be included in production logs');
    }
    
    // Validate OAuth configuration
    if (this.config.oauth.pkce.expirationMinutes < 1) {
      errors.push('PKCE expiration must be at least 1 minute');
    }
    
    if (this.config.oauth.pkce.codeVerifierLength < 43) {
      errors.push('PKCE code verifier must be at least 43 characters');
    }
    
    // Validate allowed origins
    if (this.config.security.validateOrigin && this.config.security.allowedOrigins.length === 0) {
      errors.push('At least one allowed origin must be specified when origin validation is enabled');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // 🌟 DIAGNOSTICS
  getDiagnostics(): {
    config: AuthConfig;
    validation: ReturnType<typeof this.validateConfiguration>;
    environment: {
      userAgent: string;
      url: string;
      timestamp: string;
      capabilities: {
        webCrypto: boolean;
        localStorage: boolean;
        sessionStorage: boolean;
        https: boolean;
      };
    };
  } {
    return {
      config: this.getConfig(),
      validation: this.validateConfiguration(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        capabilities: {
          webCrypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          https: window.location.protocol === 'https:'
        }
      }
    };
  }
  
  // 🚀 EXPORT CONFIGURATION
  exportConfig(): string {
    const diagnostics = this.getDiagnostics();
    return JSON.stringify(diagnostics, null, 2);
  }
}

// 🌟 SINGLETON INSTANCE
export const authConfig = AuthConfigManager.getInstance();

// 🔥 CONVENIENCE FUNCTIONS
export const getAuthConfig = () => authConfig.getConfig();
export const updateAuthConfig = (updates: Partial<AuthConfig>) => authConfig.updateConfig(updates);
export const subscribeToAuthConfig = (listener: (config: AuthConfig) => void) => authConfig.subscribe(listener);
export const validateAuthConfig = () => authConfig.validateConfiguration();
export const getAuthDiagnostics = () => authConfig.getDiagnostics();
export const exportAuthConfig = () => authConfig.exportConfig();

// 🚀 INITIALIZE CONFIGURATION ON LOAD
if (typeof window !== 'undefined') {
  // Validate configuration on startup
  const validation = authConfig.validateConfiguration();
  
  if (!validation.isValid) {
    console.error('🚨 [AUTH CONFIG] Configuration validation failed:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ [AUTH CONFIG] Configuration warnings:', validation.warnings);
  }
  
  if (authConfig.debug.enabled) {
    console.log('🚀 [AUTH CONFIG] Configuration loaded successfully', {
      environment: authConfig.environment.isDevelopment ? 'development' : 
                  authConfig.environment.isStaging ? 'staging' : 'production',
      validation: validation.isValid ? 'passed' : 'failed'
    });
  }
}
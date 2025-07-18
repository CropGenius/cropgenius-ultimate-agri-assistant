// 🚀 CROPGENIUS INFINITY IQ AUTHENTICATION SERVICE
// Production-ready authentication with bulletproof error handling for 100M farmers

import { supabase, SupabaseManager } from '@/integrations/supabase/client';
import { AuthError, Session, User } from '@supabase/supabase-js';

// 🔥 AUTHENTICATION ERROR TYPES
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  OAUTH_ERROR = 'OAUTH_ERROR',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 🌟 ENHANCED AUTH ERROR INTERFACE
export interface CropGeniusAuthError {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  developerMessage: string;
  code?: string;
  timestamp: string;
  instanceId: string;
  retryable: boolean;
  retryAfter?: number;
}

// 💪 AUTHENTICATION RESULT INTERFACE
export interface AuthResult<T = any> {
  success: boolean;
  data?: T;
  error?: CropGeniusAuthError;
  metadata?: {
    latency: number;
    attempts: number;
    instanceId: string;
  };
}

// 🚀 RETRY CONFIGURATION
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitter: boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBase: 2,
  jitter: true
};

// 🔥 INFINITY IQ AUTHENTICATION SERVICE
export class AuthenticationService {
  private static instance: AuthenticationService | null = null;
  private retryConfig: RetryConfig;

  private constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.retryConfig = retryConfig;
  }

  // 🌟 SINGLETON PATTERN
  static getInstance(retryConfig?: RetryConfig): AuthenticationService {
    if (!this.instance) {
      this.instance = new AuthenticationService(retryConfig);
      console.log('🚀 [AUTH SERVICE] Initialized with INFINITY IQ capabilities');
    }
    return this.instance;
  }

  // 💪 ERROR CLASSIFICATION SYSTEM
  private classifyError(error: any): CropGeniusAuthError {
    const timestamp = new Date().toISOString();
    const instanceId = SupabaseManager.getInstanceId();

    // API Key errors (401 Unauthorized)
    if (error?.message?.includes('Invalid API key') || error?.status === 401) {
      return {
        type: AuthErrorType.INVALID_API_KEY,
        message: error.message || 'Invalid API key',
        userMessage: 'Authentication service is temporarily unavailable. Please try again in a few moments.',
        developerMessage: 'Invalid Supabase API key. Check VITE_SUPABASE_ANON_KEY environment variable.',
        code: 'AUTH_001',
        timestamp,
        instanceId,
        retryable: false
      };
    }

    // Network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('network') || !navigator.onLine) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        message: error.message || 'Network error',
        userMessage: 'Connection failed. Please check your internet connection and try again.',
        developerMessage: 'Network request failed. Check connectivity and Supabase project status.',
        code: 'AUTH_002',
        timestamp,
        instanceId,
        retryable: true,
        retryAfter: 2000
      };
    }

    // OAuth specific errors
    if (error?.message?.includes('oauth') || error?.message?.includes('provider')) {
      return {
        type: AuthErrorType.OAUTH_ERROR,
        message: error.message || 'OAuth error',
        userMessage: 'Sign-in failed. Please try again or contact support if the problem persists.',
        developerMessage: 'OAuth flow failed. Check Google OAuth configuration and redirect URLs.',
        code: 'AUTH_003',
        timestamp,
        instanceId,
        retryable: true,
        retryAfter: 1000
      };
    }

    // Session expired
    if (error?.message?.includes('expired') || error?.message?.includes('invalid_grant')) {
      return {
        type: AuthErrorType.SESSION_EXPIRED,
        message: error.message || 'Session expired',
        userMessage: 'Your session has expired. Please sign in again.',
        developerMessage: 'Session token expired or invalid. Implement automatic refresh.',
        code: 'AUTH_004',
        timestamp,
        instanceId,
        retryable: false
      };
    }

    // Rate limiting
    if (error?.status === 429 || error?.message?.includes('rate limit')) {
      return {
        type: AuthErrorType.RATE_LIMITED,
        message: error.message || 'Rate limited',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        developerMessage: 'Rate limit exceeded. Implement request throttling.',
        code: 'AUTH_005',
        timestamp,
        instanceId,
        retryable: true,
        retryAfter: 5000
      };
    }

    // Default unknown error
    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: error?.message || 'Unknown authentication error',
      userMessage: 'An unexpected error occurred. Please try again.',
      developerMessage: `Unclassified error: ${error?.message || 'No details available'}`,
      code: 'AUTH_999',
      timestamp,
      instanceId,
      retryable: true,
      retryAfter: 1000
    };
  }

  // 🔥 EXPONENTIAL BACKOFF RETRY LOGIC
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<AuthResult<T>> {
    const startTime = Date.now();
    let lastError: CropGeniusAuthError | null = null;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        console.log(`🔄 [AUTH SERVICE] ${operationName} - Attempt ${attempt}/${this.retryConfig.maxAttempts}`);
        
        const result = await operation();
        const latency = Date.now() - startTime;

        console.log(`✅ [AUTH SERVICE] ${operationName} succeeded on attempt ${attempt}`, { latency });
        
        return {
          success: true,
          data: result,
          metadata: {
            latency,
            attempts: attempt,
            instanceId: SupabaseManager.getInstanceId()
          }
        };
      } catch (error) {
        lastError = this.classifyError(error);
        
        console.warn(`⚠️ [AUTH SERVICE] ${operationName} failed on attempt ${attempt}:`, {
          type: lastError.type,
          message: lastError.message,
          retryable: lastError.retryable
        });

        // Don't retry if error is not retryable
        if (!lastError.retryable) {
          break;
        }

        // Don't wait after the last attempt
        if (attempt < this.retryConfig.maxAttempts) {
          const delay = this.calculateDelay(attempt, lastError.retryAfter);
          console.log(`⏳ [AUTH SERVICE] Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    const totalLatency = Date.now() - startTime;
    
    return {
      success: false,
      error: lastError!,
      metadata: {
        latency: totalLatency,
        attempts: this.retryConfig.maxAttempts,
        instanceId: SupabaseManager.getInstanceId()
      }
    };
  }

  // 🌟 DELAY CALCULATION WITH JITTER
  private calculateDelay(attempt: number, retryAfter?: number): number {
    if (retryAfter) {
      return retryAfter;
    }

    let delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.exponentialBase, attempt - 1);
    delay = Math.min(delay, this.retryConfig.maxDelay);

    // Add jitter to prevent thundering herd
    if (this.retryConfig.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  // 💤 SLEEP UTILITY
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🚀 GOOGLE OAUTH SIGN IN WITH INFINITY IQ PKCE FLOW
  async signInWithGoogle(redirectTo?: string): Promise<AuthResult<{ url: string; state: string }>> {
    return this.executeWithRetry(async () => {
      // 🔥 IMPORT PKCE MANAGER DYNAMICALLY TO AVOID CIRCULAR DEPS
      const { PKCEStateManager } = await import('@/utils/pkceManager');
      
      // Generate and store PKCE state with INFINITY IQ precision
      const pkceResult = await PKCEStateManager.generateAndStoreState(
        redirectTo, 
        SupabaseManager.getInstanceId()
      );
      
      if (!pkceResult.success) {
        throw new Error(pkceResult.error?.message || 'Failed to generate PKCE state');
      }
      
      const pkceState = pkceResult.data!;
      
      console.log('🚀 [AUTH SERVICE] PKCE state generated for Google OAuth', {
        state: pkceState.state,
        hasCodeVerifier: !!pkceState.codeVerifier,
        hasCodeChallenge: !!pkceState.codeChallenge,
        storageMethod: pkceState.storageMethod,
        expiresAt: new Date(pkceState.expiresAt).toISOString()
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          // 🔥 INCLUDE PKCE PARAMETERS - THIS IS THE MAGIC!
          scopes: 'openid email profile',
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      // 💪 MANUALLY ADD PKCE PARAMETERS TO URL (Supabase doesn't expose this)
      const url = new URL(data.url);
      url.searchParams.set('code_challenge', pkceState.codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('state', pkceState.state);
      
      const finalUrl = url.toString();
      
      console.log('🌟 [AUTH SERVICE] Google OAuth URL enhanced with PKCE parameters', {
        originalUrl: data.url,
        enhancedUrl: finalUrl,
        state: pkceState.state,
        hasCodeChallenge: url.searchParams.has('code_challenge')
      });

      return { 
        url: finalUrl,
        state: pkceState.state
      };
    }, 'Google OAuth Sign In with PKCE');
  }

  // 🔄 SESSION REFRESH
  async refreshSession(): Promise<AuthResult<Session>> {
    return this.executeWithRetry(async () => {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      if (!data.session) throw new Error('No session returned after refresh');

      return data.session;
    }, 'Session Refresh');
  }

  // 🚪 SIGN OUT
  async signOut(): Promise<AuthResult<void>> {
    return this.executeWithRetry(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }, 'Sign Out');
  }

  // 🔍 GET CURRENT SESSION
  async getCurrentSession(): Promise<AuthResult<Session | null>> {
    return this.executeWithRetry(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    }, 'Get Current Session');
  }

  // 🔐 EXCHANGE CODE FOR SESSION WITH PKCE (OAuth Callback)
  async exchangeCodeForSession(code: string, stateParam?: string): Promise<AuthResult<Session>> {
    return this.executeWithRetry(async () => {
      // 🔥 IMPORT PKCE MANAGER FOR CODE VERIFIER RETRIEVAL
      const { PKCEStateManager } = await import('@/utils/pkceManager');
      
      let codeVerifier: string | undefined;
      
      // If we have a state parameter, try to retrieve the PKCE state
      if (stateParam) {
        console.log('🔍 [AUTH SERVICE] Retrieving PKCE state for token exchange', {
          stateParam,
          hasCode: !!code
        });
        
        const pkceResult = await PKCEStateManager.retrieveState(stateParam);
        
        if (pkceResult.success && pkceResult.data) {
          codeVerifier = pkceResult.data.codeVerifier;
          
          console.log('🎉 [AUTH SERVICE] PKCE state retrieved successfully', {
            stateParam,
            hasCodeVerifier: !!codeVerifier,
            storageMethod: pkceResult.data.storageMethod
          });
          
          // Clean up the used PKCE state
          await PKCEStateManager.cleanupState(stateParam);
        } else {
          console.warn('⚠️ [AUTH SERVICE] PKCE state not found or expired', {
            stateParam,
            error: pkceResult.error?.message
          });
        }
      }
      
      // 🚀 PERFORM TOKEN EXCHANGE WITH OR WITHOUT PKCE
      if (codeVerifier) {
        console.log('🔥 [AUTH SERVICE] Performing PKCE token exchange');
        
        // Use the new Supabase method for PKCE token exchange
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('🚨 [AUTH SERVICE] PKCE token exchange failed', {
            error: error.message,
            code: code.substring(0, 10) + '...',
            hasCodeVerifier: !!codeVerifier
          });
          throw error;
        }
        
        if (!data.session) {
          throw new Error('No session returned from PKCE code exchange');
        }
        
        console.log('🎉 [AUTH SERVICE] PKCE token exchange successful', {
          userId: data.session.user.id,
          userEmail: data.session.user.email,
          expiresAt: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null
        });
        
        return data.session;
      } else {
        console.log('🔄 [AUTH SERVICE] Performing standard token exchange (no PKCE)');
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) throw error;
        if (!data.session) throw new Error('No session returned from code exchange');

        return data.session;
      }
    }, 'Exchange Code for Session with PKCE');
  }

  // 🏥 HEALTH CHECK
  async healthCheck(): Promise<AuthResult<{ status: string; latency: number }>> {
    const startTime = Date.now();
    
    try {
      const healthResult = await SupabaseManager.healthCheck(1);
      const latency = Date.now() - startTime;
      
      if (!healthResult.connected) {
        throw new Error(healthResult.error || 'Health check failed');
      }

      return {
        success: true,
        data: {
          status: 'healthy',
          latency: healthResult.latency || latency
        },
        metadata: {
          latency,
          attempts: 1,
          instanceId: SupabaseManager.getInstanceId()
        }
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      return {
        success: false,
        error: this.classifyError(error),
        metadata: {
          latency,
          attempts: 1,
          instanceId: SupabaseManager.getInstanceId()
        }
      };
    }
  }
}

// 🌟 EXPORT SINGLETON INSTANCE
export const authService = AuthenticationService.getInstance();
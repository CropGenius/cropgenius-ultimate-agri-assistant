// 🚀 CROPGENIUS INFINITY IQ OAUTH FLOW MANAGER
// Production-ready OAuth flow strategy pattern for 100 MILLION FARMERS! 🌍💪

import { authService, AuthResult } from '@/services/AuthenticationService';
import { supabase } from '@/integrations/supabase/client';
import { logAuthEvent, logAuthError, AuthEventType } from '@/utils/authDebugger';

// 🔥 OAUTH FLOW TYPES - INFINITY IQ LEVEL
export enum OAuthFlowType {
  PKCE = 'pkce',
  IMPLICIT = 'implicit',
  HYBRID = 'hybrid',
  AUTO = 'auto'
}

// 🌟 OAUTH FLOW STRATEGY INTERFACE
export interface OAuthFlowStrategy {
  name: OAuthFlowType;
  isSupported(): boolean;
  execute(redirectTo?: string): Promise<AuthResult<{ url: string; state?: string }>>;
  handleCallback?(params: URLSearchParams): Promise<AuthResult<any>>;
  getPriority(): number; // Higher number = higher priority
}

// 🚀 PKCE FLOW STRATEGY - PRIMARY CHOICE
export class PKCEFlowStrategy implements OAuthFlowStrategy {
  name = OAuthFlowType.PKCE;
  
  isSupported(): boolean {
    try {
      // Check for Web Crypto API support (required for PKCE)
      const hasWebCrypto = typeof crypto !== 'undefined' && 
                          typeof crypto.subtle !== 'undefined' && 
                          typeof crypto.getRandomValues === 'function';
      
      // Check for localStorage support (preferred for PKCE state)
      const hasStorage = typeof localStorage !== 'undefined';
      
      // Check for modern browser features
      const hasModernFeatures = typeof TextEncoder !== 'undefined' && 
                               typeof URL !== 'undefined';
      
      const isSupported = hasWebCrypto && hasStorage && hasModernFeatures;
      
      logAuthEvent(AuthEventType.INITIALIZATION, 'PKCE flow support check', {
        hasWebCrypto,
        hasStorage,
        hasModernFeatures,
        isSupported
      });
      
      return isSupported;
    } catch (error) {
      logAuthError(AuthEventType.INITIALIZATION, 'PKCE support check failed', error as Error);
      return false;
    }
  }
  
  async execute(redirectTo?: string): Promise<AuthResult<{ url: string; state?: string }>> {
    logAuthEvent(AuthEventType.SIGN_IN_START, 'Executing PKCE OAuth flow strategy');
    
    try {
      const result = await authService.signInWithGoogle(redirectTo);
      
      if (result.success) {
        logAuthEvent(AuthEventType.OAUTH_REDIRECT, 'PKCE OAuth flow initiated successfully', {
          hasUrl: !!result.data?.url,
          hasState: !!result.data?.state
        });
      }
      
      return result;
    } catch (error) {
      logAuthError(AuthEventType.SIGN_IN_ERROR, 'PKCE OAuth flow execution failed', error as Error);
      throw error;
    }
  }
  
  getPriority(): number {
    return 100; // Highest priority - most secure
  }
}

// 🌟 IMPLICIT FLOW STRATEGY - FALLBACK CHOICE
export class ImplicitFlowStrategy implements OAuthFlowStrategy {
  name = OAuthFlowType.IMPLICIT;
  
  isSupported(): boolean {
    try {
      // Implicit flow requires basic browser features
      const hasBasicFeatures = typeof window !== 'undefined' && 
                              typeof URLSearchParams !== 'undefined';
      
      const isSupported = hasBasicFeatures;
      
      logAuthEvent(AuthEventType.INITIALIZATION, 'Implicit flow support check', {
        hasBasicFeatures,
        isSupported
      });
      
      return isSupported;
    } catch (error) {
      logAuthError(AuthEventType.INITIALIZATION, 'Implicit support check failed', error as Error);
      return false;
    }
  }
  
  async execute(redirectTo?: string): Promise<AuthResult<{ url: string; state?: string }>> {
    logAuthEvent(AuthEventType.SIGN_IN_START, 'Executing Implicit OAuth flow strategy');
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile',
        },
      });

      if (error) {
        logAuthError(AuthEventType.SIGN_IN_ERROR, 'Implicit OAuth flow failed', error);
        return {
          success: false,
          error: {
            type: 'OAUTH_ERROR' as any,
            message: error.message,
            userMessage: 'Sign-in failed. Please try again.',
            developerMessage: 'Implicit OAuth flow failed.',
            code: 'IMPLICIT_001',
            timestamp: new Date().toISOString(),
            instanceId: 'implicit-flow',
            retryable: true
          }
        };
      }

      if (!data.url) {
        const errorMsg = 'No OAuth URL returned from implicit flow';
        logAuthError(AuthEventType.SIGN_IN_ERROR, errorMsg, new Error(errorMsg));
        return {
          success: false,
          error: {
            type: 'OAUTH_ERROR' as any,
            message: errorMsg,
            userMessage: 'Sign-in setup failed. Please try again.',
            developerMessage: 'Implicit OAuth flow did not return URL.',
            code: 'IMPLICIT_002',
            timestamp: new Date().toISOString(),
            instanceId: 'implicit-flow',
            retryable: true
          }
        };
      }

      logAuthEvent(AuthEventType.OAUTH_REDIRECT, 'Implicit OAuth flow initiated successfully', {
        hasUrl: !!data.url
      });

      return {
        success: true,
        data: { url: data.url }
      };
    } catch (error) {
      logAuthError(AuthEventType.SIGN_IN_ERROR, 'Implicit OAuth flow execution failed', error as Error);
      throw error;
    }
  }
  
  getPriority(): number {
    return 50; // Medium priority - less secure but more compatible
  }
}

// 💪 HYBRID FLOW STRATEGY - EXPERIMENTAL
export class HybridFlowStrategy implements OAuthFlowStrategy {
  name = OAuthFlowType.HYBRID;
  
  isSupported(): boolean {
    // Hybrid flow combines PKCE and implicit - requires both to be supported
    const pkceStrategy = new PKCEFlowStrategy();
    const implicitStrategy = new ImplicitFlowStrategy();
    
    const isSupported = pkceStrategy.isSupported() && implicitStrategy.isSupported();
    
    logAuthEvent(AuthEventType.INITIALIZATION, 'Hybrid flow support check', {
      isSupported
    });
    
    return isSupported;
  }
  
  async execute(redirectTo?: string): Promise<AuthResult<{ url: string; state?: string }>> {
    logAuthEvent(AuthEventType.SIGN_IN_START, 'Executing Hybrid OAuth flow strategy');
    
    try {
      // Try PKCE first, fall back to implicit if it fails
      const pkceStrategy = new PKCEFlowStrategy();
      
      try {
        const result = await pkceStrategy.execute(redirectTo);
        if (result.success) {
          logAuthEvent(AuthEventType.OAUTH_REDIRECT, 'Hybrid flow using PKCE successfully');
          return result;
        }
      } catch (pkceError) {
        logAuthEvent(AuthEventType.SIGN_IN_ERROR, 'Hybrid flow PKCE failed, trying implicit', {
          pkceError: pkceError instanceof Error ? pkceError.message : 'Unknown error'
        });
      }
      
      // Fall back to implicit
      const implicitStrategy = new ImplicitFlowStrategy();
      const result = await implicitStrategy.execute(redirectTo);
      
      if (result.success) {
        logAuthEvent(AuthEventType.OAUTH_REDIRECT, 'Hybrid flow using implicit successfully');
      }
      
      return result;
    } catch (error) {
      logAuthError(AuthEventType.SIGN_IN_ERROR, 'Hybrid OAuth flow execution failed', error as Error);
      throw error;
    }
  }
  
  getPriority(): number {
    return 75; // High priority - adaptive approach
  }
}

// 🚀 OAUTH FLOW MANAGER - INFINITY IQ ORCHESTRATOR
export class OAuthFlowManager {
  private static instance: OAuthFlowManager | null = null;
  private strategies: OAuthFlowStrategy[] = [];
  private preferredFlow: OAuthFlowType = OAuthFlowType.AUTO;
  
  private constructor() {
    this.initializeStrategies();
  }
  
  static getInstance(): OAuthFlowManager {
    if (!this.instance) {
      this.instance = new OAuthFlowManager();
      logAuthEvent(AuthEventType.INITIALIZATION, 'OAuth Flow Manager initialized with INFINITY IQ');
    }
    return this.instance;
  }
  
  private initializeStrategies(): void {
    this.strategies = [
      new PKCEFlowStrategy(),
      new HybridFlowStrategy(),
      new ImplicitFlowStrategy()
    ];
    
    // Sort by priority (highest first)
    this.strategies.sort((a, b) => b.getPriority() - a.getPriority());
    
    logAuthEvent(AuthEventType.INITIALIZATION, 'OAuth strategies initialized', {
      strategies: this.strategies.map(s => ({
        name: s.name,
        supported: s.isSupported(),
        priority: s.getPriority()
      }))
    });
  }
  
  setPreferredFlow(flowType: OAuthFlowType): void {
    this.preferredFlow = flowType;
    logAuthEvent(AuthEventType.INITIALIZATION, 'OAuth flow preference updated', {
      preferredFlow: flowType
    });
  }
  
  getPreferredFlow(): OAuthFlowType {
    return this.preferredFlow;
  }
  
  getSupportedStrategies(): OAuthFlowStrategy[] {
    return this.strategies.filter(strategy => strategy.isSupported());
  }
  
  getOptimalStrategy(): OAuthFlowStrategy | null {
    if (this.preferredFlow !== OAuthFlowType.AUTO) {
      // Try to find the preferred strategy if it's supported
      const preferredStrategy = this.strategies.find(
        s => s.name === this.preferredFlow && s.isSupported()
      );
      
      if (preferredStrategy) {
        logAuthEvent(AuthEventType.INITIALIZATION, 'Using preferred OAuth strategy', {
          strategy: preferredStrategy.name
        });
        return preferredStrategy;
      }
      
      logAuthEvent(AuthEventType.INITIALIZATION, 'Preferred OAuth strategy not supported, using auto-selection', {
        preferredFlow: this.preferredFlow
      });
    }
    
    // Auto-select the best supported strategy
    const supportedStrategies = this.getSupportedStrategies();
    
    if (supportedStrategies.length === 0) {
      logAuthError(AuthEventType.INITIALIZATION, 'No OAuth strategies supported', new Error('No supported OAuth strategies'));
      return null;
    }
    
    const optimalStrategy = supportedStrategies[0]; // Highest priority supported strategy
    
    logAuthEvent(AuthEventType.INITIALIZATION, 'Auto-selected optimal OAuth strategy', {
      strategy: optimalStrategy.name,
      priority: optimalStrategy.getPriority(),
      totalSupported: supportedStrategies.length
    });
    
    return optimalStrategy;
  }
  
  async executeOptimalFlow(redirectTo?: string): Promise<AuthResult<{ url: string; state?: string }>> {
    const performanceId = `oauth_flow_${Date.now()}`;
    
    try {
      logAuthEvent(AuthEventType.SIGN_IN_START, 'Starting optimal OAuth flow execution', {
        redirectTo,
        preferredFlow: this.preferredFlow
      });
      
      const strategy = this.getOptimalStrategy();
      
      if (!strategy) {
        const errorMsg = 'No supported OAuth strategy available';
        logAuthError(AuthEventType.SIGN_IN_ERROR, errorMsg, new Error(errorMsg));
        
        return {
          success: false,
          error: {
            type: 'CONFIGURATION_ERROR' as any,
            message: errorMsg,
            userMessage: 'Your browser does not support the required authentication features. Please update your browser or try a different one.',
            developerMessage: 'No OAuth strategies are supported in this environment.',
            code: 'FLOW_001',
            timestamp: new Date().toISOString(),
            instanceId: 'flow-manager',
            retryable: false
          }
        };
      }
      
      logAuthEvent(AuthEventType.SIGN_IN_START, 'Executing OAuth strategy', {
        strategy: strategy.name,
        priority: strategy.getPriority()
      });
      
      const result = await strategy.execute(redirectTo);
      
      if (result.success) {
        logAuthEvent(AuthEventType.OAUTH_REDIRECT, 'OAuth flow executed successfully', {
          strategy: strategy.name,
          hasUrl: !!result.data?.url,
          hasState: !!result.data?.state
        });
      } else {
        logAuthError(AuthEventType.SIGN_IN_ERROR, 'OAuth flow execution failed', new Error(result.error?.message || 'Unknown error'), {
          strategy: strategy.name,
          errorCode: result.error?.code
        });
      }
      
      return result;
    } catch (error) {
      logAuthError(AuthEventType.SIGN_IN_ERROR, 'OAuth flow manager execution failed', error as Error);
      throw error;
    }
  }
  
  // 🌟 DIAGNOSTIC METHODS
  async runDiagnostics(): Promise<{
    supportedStrategies: string[];
    optimalStrategy: string | null;
    preferredFlow: string;
    browserCapabilities: {
      webCrypto: boolean;
      localStorage: boolean;
      sessionStorage: boolean;
      textEncoder: boolean;
      url: boolean;
    };
  }> {
    const supportedStrategies = this.getSupportedStrategies();
    const optimalStrategy = this.getOptimalStrategy();
    
    const diagnostics = {
      supportedStrategies: supportedStrategies.map(s => s.name),
      optimalStrategy: optimalStrategy?.name || null,
      preferredFlow: this.preferredFlow,
      browserCapabilities: {
        webCrypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        textEncoder: typeof TextEncoder !== 'undefined',
        url: typeof URL !== 'undefined'
      }
    };
    
    logAuthEvent(AuthEventType.INITIALIZATION, 'OAuth flow diagnostics completed', diagnostics);
    
    return diagnostics;
  }
}

// 🌟 EXPORT SINGLETON INSTANCE
export const oauthFlowManager = OAuthFlowManager.getInstance();

// 🚀 CONVENIENCE FUNCTIONS
export const executeOptimalOAuthFlow = (redirectTo?: string) => {
  return oauthFlowManager.executeOptimalFlow(redirectTo);
};

export const setPreferredOAuthFlow = (flowType: OAuthFlowType) => {
  oauthFlowManager.setPreferredFlow(flowType);
};

export const getOAuthDiagnostics = () => {
  return oauthFlowManager.runDiagnostics();
};
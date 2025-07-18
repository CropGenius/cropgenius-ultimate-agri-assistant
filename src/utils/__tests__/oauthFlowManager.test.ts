// 🚀 CROPGENIUS INFINITY IQ OAUTH FLOW MANAGER TESTS
// Production-ready tests for OAuth flow strategies! 🔥💪

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  OAuthFlowManager, 
  PKCEFlowStrategy, 
  ImplicitFlowStrategy, 
  HybridFlowStrategy,
  OAuthFlowType,
  executeOptimalOAuthFlow,
  setPreferredOAuthFlow,
  getOAuthDiagnostics
} from '../oauthFlowManager';

// 🔥 MOCK AUTH SERVICE
vi.mock('@/services/AuthenticationService', () => ({
  authService: {
    signInWithGoogle: vi.fn()
  }
}));

// 🌟 MOCK SUPABASE CLIENT
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn()
    }
  }
}));

// 💪 MOCK CRYPTO API
const mockCrypto = {
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    digest: vi.fn()
  }
};

describe('🚀 OAuth Flow Manager - INFINITY IQ Tests', () => {
  let flowManager: OAuthFlowManager;

  beforeEach(() => {
    // Setup mocks
    global.crypto = mockCrypto as any;
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    } as any;
    global.window = {
      location: {
        origin: 'https://cropgenius.africa'
      }
    } as any;
    global.TextEncoder = vi.fn() as any;
    global.URL = vi.fn() as any;

    // Reset singleton
    (OAuthFlowManager as any).instance = null;
    flowManager = OAuthFlowManager.getInstance();
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('🔥 PKCE Flow Strategy', () => {
    let pkceStrategy: PKCEFlowStrategy;

    beforeEach(() => {
      pkceStrategy = new PKCEFlowStrategy();
    });

    it('should detect PKCE support correctly', () => {
      expect(pkceStrategy.isSupported()).toBe(true);
      expect(pkceStrategy.getPriority()).toBe(100);
      expect(pkceStrategy.name).toBe(OAuthFlowType.PKCE);
    });

    it('should detect PKCE not supported when crypto is missing', () => {
      global.crypto = undefined as any;
      expect(pkceStrategy.isSupported()).toBe(false);
    });

    it('should detect PKCE not supported when localStorage is missing', () => {
      global.localStorage = undefined as any;
      expect(pkceStrategy.isSupported()).toBe(false);
    });

    it('should execute PKCE flow successfully', async () => {
      const { authService } = await import('@/services/AuthenticationService');
      (authService.signInWithGoogle as any).mockResolvedValue({
        success: true,
        data: { url: 'https://oauth.url', state: 'test-state' }
      });

      const result = await pkceStrategy.execute('/dashboard');
      
      expect(result.success).toBe(true);
      expect(result.data?.url).toBe('https://oauth.url');
      expect(result.data?.state).toBe('test-state');
      expect(authService.signInWithGoogle).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle PKCE flow execution failure', async () => {
      const { authService } = await import('@/services/AuthenticationService');
      (authService.signInWithGoogle as any).mockRejectedValue(new Error('PKCE failed'));

      await expect(pkceStrategy.execute()).rejects.toThrow('PKCE failed');
    });
  });

  describe('🌟 Implicit Flow Strategy', () => {
    let implicitStrategy: ImplicitFlowStrategy;

    beforeEach(() => {
      implicitStrategy = new ImplicitFlowStrategy();
    });

    it('should detect implicit support correctly', () => {
      expect(implicitStrategy.isSupported()).toBe(true);
      expect(implicitStrategy.getPriority()).toBe(50);
      expect(implicitStrategy.name).toBe(OAuthFlowType.IMPLICIT);
    });

    it('should execute implicit flow successfully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: { url: 'https://implicit.oauth.url' },
        error: null
      });

      const result = await implicitStrategy.execute('/dashboard');
      
      expect(result.success).toBe(true);
      expect(result.data?.url).toBe('https://implicit.oauth.url');
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: '/dashboard',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'openid email profile',
        },
      });
    });

    it('should handle implicit flow error', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: null,
        error: { message: 'OAuth failed' }
      });

      const result = await implicitStrategy.execute();
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('IMPLICIT_001');
    });

    it('should handle missing URL in response', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: { url: null },
        error: null
      });

      const result = await implicitStrategy.execute();
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('IMPLICIT_002');
    });
  });

  describe('💪 Hybrid Flow Strategy', () => {
    let hybridStrategy: HybridFlowStrategy;

    beforeEach(() => {
      hybridStrategy = new HybridFlowStrategy();
    });

    it('should detect hybrid support correctly', () => {
      expect(hybridStrategy.isSupported()).toBe(true);
      expect(hybridStrategy.getPriority()).toBe(75);
      expect(hybridStrategy.name).toBe(OAuthFlowType.HYBRID);
    });

    it('should execute PKCE first in hybrid flow', async () => {
      const { authService } = await import('@/services/AuthenticationService');
      (authService.signInWithGoogle as any).mockResolvedValue({
        success: true,
        data: { url: 'https://pkce.url', state: 'pkce-state' }
      });

      const result = await hybridStrategy.execute('/dashboard');
      
      expect(result.success).toBe(true);
      expect(result.data?.url).toBe('https://pkce.url');
      expect(authService.signInWithGoogle).toHaveBeenCalledWith('/dashboard');
    });

    it('should fallback to implicit when PKCE fails', async () => {
      const { authService } = await import('@/services/AuthenticationService');
      const { supabase } = await import('@/integrations/supabase/client');
      
      (authService.signInWithGoogle as any).mockRejectedValue(new Error('PKCE failed'));
      (supabase.auth.signInWithOAuth as any).mockResolvedValue({
        data: { url: 'https://implicit.fallback.url' },
        error: null
      });

      const result = await hybridStrategy.execute('/dashboard');
      
      expect(result.success).toBe(true);
      expect(result.data?.url).toBe('https://implicit.fallback.url');
      expect(authService.signInWithGoogle).toHaveBeenCalled();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalled();
    });
  });

  describe('🚀 OAuth Flow Manager', () => {
    it('should initialize with correct strategies', () => {
      const supportedStrategies = flowManager.getSupportedStrategies();
      
      expect(supportedStrategies.length).toBeGreaterThan(0);
      expect(supportedStrategies.some(s => s.name === OAuthFlowType.PKCE)).toBe(true);
      expect(supportedStrategies.some(s => s.name === OAuthFlowType.IMPLICIT)).toBe(true);
      expect(supportedStrategies.some(s => s.name === OAuthFlowType.HYBRID)).toBe(true);
    });

    it('should select optimal strategy automatically', () => {
      const optimalStrategy = flowManager.getOptimalStrategy();
      
      expect(optimalStrategy).toBeDefined();
      expect(optimalStrategy?.name).toBe(OAuthFlowType.PKCE); // Highest priority
    });

    it('should respect preferred flow setting', () => {
      flowManager.setPreferredFlow(OAuthFlowType.IMPLICIT);
      
      expect(flowManager.getPreferredFlow()).toBe(OAuthFlowType.IMPLICIT);
      
      const optimalStrategy = flowManager.getOptimalStrategy();
      expect(optimalStrategy?.name).toBe(OAuthFlowType.IMPLICIT);
    });

    it('should fallback to auto-selection when preferred is not supported', () => {
      // Mock PKCE as not supported
      global.crypto = undefined as any;
      
      flowManager.setPreferredFlow(OAuthFlowType.PKCE);
      const optimalStrategy = flowManager.getOptimalStrategy();
      
      expect(optimalStrategy?.name).not.toBe(OAuthFlowType.PKCE);
    });

    it('should execute optimal flow successfully', async () => {
      const { authService } = await import('@/services/AuthenticationService');
      (authService.signInWithGoogle as any).mockResolvedValue({
        success: true,
        data: { url: 'https://optimal.url', state: 'optimal-state' }
      });

      const result = await flowManager.executeOptimalFlow('/dashboard');
      
      expect(result.success).toBe(true);
      expect(result.data?.url).toBe('https://optimal.url');
    });

    it('should handle no supported strategies', async () => {
      // Mock all capabilities as unavailable
      global.crypto = undefined as any;
      global.localStorage = undefined as any;
      global.window = undefined as any;
      
      // Reset manager to pick up new environment
      (OAuthFlowManager as any).instance = null;
      const newManager = OAuthFlowManager.getInstance();
      
      const result = await newManager.executeOptimalFlow();
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FLOW_001');
    });

    it('should run diagnostics correctly', async () => {
      const diagnostics = await flowManager.runDiagnostics();
      
      expect(diagnostics).toBeDefined();
      expect(diagnostics.supportedStrategies).toBeInstanceOf(Array);
      expect(diagnostics.optimalStrategy).toBeDefined();
      expect(diagnostics.preferredFlow).toBeDefined();
      expect(diagnostics.browserCapabilities).toBeDefined();
      expect(diagnostics.browserCapabilities.webCrypto).toBe(true);
      expect(diagnostics.browserCapabilities.localStorage).toBe(true);
    });
  });

  describe('🌟 Convenience Functions', () => {
    it('should execute optimal OAuth flow', async () => {
      const { authService } = await import('@/services/AuthenticationService');
      (authService.signInWithGoogle as any).mockResolvedValue({
        success: true,
        data: { url: 'https://convenience.url' }
      });

      const result = await executeOptimalOAuthFlow('/test');
      
      expect(result.success).toBe(true);
      expect(result.data?.url).toBe('https://convenience.url');
    });

    it('should set preferred OAuth flow', () => {
      setPreferredOAuthFlow(OAuthFlowType.IMPLICIT);
      
      const manager = OAuthFlowManager.getInstance();
      expect(manager.getPreferredFlow()).toBe(OAuthFlowType.IMPLICIT);
    });

    it('should get OAuth diagnostics', async () => {
      const diagnostics = await getOAuthDiagnostics();
      
      expect(diagnostics).toBeDefined();
      expect(diagnostics.supportedStrategies).toBeInstanceOf(Array);
    });
  });

  describe('🔥 Error Handling', () => {
    it('should handle strategy execution errors gracefully', async () => {
      const { authService } = await import('@/services/AuthenticationService');
      (authService.signInWithGoogle as any).mockRejectedValue(new Error('Network error'));

      await expect(flowManager.executeOptimalFlow()).rejects.toThrow('Network error');
    });

    it('should handle diagnostics errors gracefully', async () => {
      // Mock a scenario that might cause diagnostics to fail
      const originalConsoleError = console.error;
      console.error = vi.fn();

      const diagnostics = await flowManager.runDiagnostics();
      
      expect(diagnostics).toBeDefined();
      console.error = originalConsoleError;
    });
  });

  describe('💪 Edge Cases', () => {
    it('should handle missing browser features gracefully', () => {
      global.TextEncoder = undefined as any;
      global.URL = undefined as any;
      
      const pkceStrategy = new PKCEFlowStrategy();
      expect(pkceStrategy.isSupported()).toBe(false);
    });

    it('should handle crypto API errors in support detection', () => {
      global.crypto = {
        getRandomValues: () => {
          throw new Error('Crypto error');
        }
      } as any;
      
      const pkceStrategy = new PKCEFlowStrategy();
      expect(pkceStrategy.isSupported()).toBe(false);
    });

    it('should handle window object variations', () => {
      global.window = {
        location: undefined
      } as any;
      
      const implicitStrategy = new ImplicitFlowStrategy();
      expect(implicitStrategy.isSupported()).toBe(true); // Should still work
    });
  });
});
import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, SupabaseManager } from '@/integrations/supabase/client';
import { authService, AuthErrorType, CropGeniusAuthError } from '@/services/AuthenticationService';
import { Loader2, AlertTriangle, RefreshCw, Shield, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authDebugger, AuthEventType, DebugLevel, logAuthEvent, logAuthError } from '@/utils/authDebugger';

// 🚀 INFINITY IQ ENHANCED AUTH STATE
export interface EnhancedAuthState {
  // Core Authentication
  user: User | null;
  session: Session | null;
  profile: any | null; // Will be typed properly when profile system is enhanced
  
  // Granular Loading States
  isLoading: boolean;
  isInitializing: boolean;
  isSigningIn: boolean;
  isSigningOut: boolean;
  isRefreshing: boolean;
  isLoadingProfile: boolean;
  
  // Authentication Status
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  hasProfile: boolean;
  
  // Error Management
  error: CropGeniusAuthError | null;
  lastError: CropGeniusAuthError | null;
  
  // System Health
  isOnline: boolean;
  connectionHealth: 'healthy' | 'degraded' | 'offline' | 'unknown';
  
  // Debug Information (development only)
  debugInfo?: {
    instanceId: string;
    lastAuthEvent: string;
    configurationStatus: 'valid' | 'invalid' | 'unknown';
    initializationTime: number;
    lastHealthCheck: string;
  };
}

// 🔥 ENHANCED AUTH CONTEXT
interface AuthContextType extends EnhancedAuthState {
  // Authentication Actions
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  
  // Error Management
  clearError: () => void;
  retryLastOperation: () => Promise<void>;
  
  // System Health
  checkHealth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<EnhancedAuthState>({
    // Core Authentication
    user: null,
    session: null,
    profile: null,
    
    // Granular Loading States
    isLoading: true,
    isInitializing: true,
    isSigningIn: false,
    isSigningOut: false,
    isRefreshing: false,
    isLoadingProfile: false,
    
    // Authentication Status
    isAuthenticated: false,
    isOnboardingComplete: false,
    hasProfile: false,
    
    // Error Management
    error: null,
    lastError: null,
    
    // System Health
    isOnline: navigator.onLine,
    connectionHealth: 'unknown',
    
    // Debug Information
    debugInfo: import.meta.env.DEV ? {
      instanceId: SupabaseManager.getInstanceId(),
      lastAuthEvent: 'INITIALIZING',
      configurationStatus: 'unknown',
      initializationTime: Date.now(),
      lastHealthCheck: new Date().toISOString()
    } : undefined
  });

  const [retryCount, setRetryCount] = useState(0);
  const [lastFailedOperation, setLastFailedOperation] = useState<(() => Promise<void>) | null>(null);

  // 🌟 NETWORK STATUS MONITORING
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast.success('Connection restored');
      // Trigger health check when coming back online
      checkHealth();
    };

    const handleOffline = () => {
      setState(prev => ({ 
        ...prev, 
        isOnline: false, 
        connectionHealth: 'offline' 
      }));
      toast.error('Connection lost - working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 🔥 HEALTH CHECK SYSTEM
  const checkHealth = useCallback(async () => {
    try {
      const healthResult = await authService.healthCheck();
      
      setState(prev => ({
        ...prev,
        connectionHealth: healthResult.success ? 'healthy' : 'degraded',
        debugInfo: prev.debugInfo ? {
          ...prev.debugInfo,
          lastHealthCheck: new Date().toISOString()
        } : undefined
      }));

      if (!healthResult.success && healthResult.error) {
        console.warn('🏥 [AUTH PROVIDER] Health check failed:', healthResult.error);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        connectionHealth: 'degraded'
      }));
    }
  }, []);

  // 🚀 AUTHENTICATION INITIALIZATION WITH INFINITY IQ DEBUGGING
  useEffect(() => {
    let mounted = true;
    const initStartTime = Date.now();
    const performanceId = `auth_init_${Date.now()}`;

    const initializeAuth = async () => {
      try {
        // 🔥 START PERFORMANCE TRACKING
        authDebugger.startPerformanceTracking(performanceId, AuthEventType.INITIALIZATION, 'AuthProvider initialization');
        logAuthEvent(AuthEventType.INITIALIZATION, 'Starting INFINITY IQ authentication initialization', {
          instanceId: SupabaseManager.getInstanceId(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          isOnline: navigator.onLine
        });
        
        // Update debug info
        if (import.meta.env.DEV) {
          setState(prev => ({
            ...prev,
            debugInfo: prev.debugInfo ? {
              ...prev.debugInfo,
              lastAuthEvent: 'INITIALIZING',
              configurationStatus: 'valid'
            } : undefined
          }));
        }

        // 🔍 SESSION CHECK WITH DEBUGGING
        logAuthEvent(AuthEventType.SESSION_CHECK, 'Checking for existing session');
        const sessionResult = await authService.getCurrentSession();
        
        if (!mounted) {
          logAuthEvent(AuthEventType.INITIALIZATION, 'Component unmounted during initialization');
          return;
        }

        if (sessionResult.success && sessionResult.data) {
          const session = sessionResult.data;
          
          // 🎉 SESSION RESTORED SUCCESS
          logAuthEvent(AuthEventType.SIGN_IN_SUCCESS, 'Session restored successfully', {
            userId: session.user.id,
            userEmail: session.user.email,
            sessionDuration: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'unknown'
          });
          
          setState(prev => ({
            ...prev,
            session,
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
            isInitializing: false,
            debugInfo: prev.debugInfo ? {
              ...prev.debugInfo,
              lastAuthEvent: 'SESSION_RESTORED',
              initializationTime: Date.now() - initStartTime
            } : undefined
          }));

          // 👤 PROFILE LOADING
          logAuthEvent(AuthEventType.PROFILE_LOAD, 'Starting profile load for restored session', {
            userId: session.user.id
          });
          
          // TODO: Load user profile here when profile system is enhanced
          
        } else {
          // ℹ️ NO SESSION FOUND
          logAuthEvent(AuthEventType.SESSION_CHECK, 'No existing session found', {
            error: sessionResult.error?.message
          });
          
          setState(prev => ({
            ...prev,
            session: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitializing: false,
            debugInfo: prev.debugInfo ? {
              ...prev.debugInfo,
              lastAuthEvent: 'NO_SESSION',
              initializationTime: Date.now() - initStartTime
            } : undefined
          }));
        }

        // 🏥 INITIAL HEALTH CHECK
        logAuthEvent(AuthEventType.HEALTH_CHECK, 'Starting initial health check');
        await checkHealth();

        // 🔥 END PERFORMANCE TRACKING
        authDebugger.endPerformanceTracking(performanceId, AuthEventType.INITIALIZATION, 'AuthProvider initialization completed', {
          hasSession: !!sessionResult.data,
          initializationTime: Date.now() - initStartTime
        });

      } catch (error) {
        // 🚨 INITIALIZATION ERROR
        logAuthError(AuthEventType.INITIALIZATION, 'Authentication initialization failed', error as Error, {
          initializationTime: Date.now() - initStartTime,
          mounted
        });
        
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isInitializing: false,
            error: error as CropGeniusAuthError,
            debugInfo: prev.debugInfo ? {
              ...prev.debugInfo,
              lastAuthEvent: 'INIT_ERROR',
              initializationTime: Date.now() - initStartTime
            } : undefined
          }));
        }

        // End performance tracking on error
        authDebugger.endPerformanceTracking(performanceId, AuthEventType.INITIALIZATION, 'AuthProvider initialization failed');
      }
    };

    // 🔥 SET UP AUTH STATE CHANGE LISTENER WITH INFINITY IQ DEBUGGING
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          logAuthEvent(AuthEventType.INITIALIZATION, 'Auth state change ignored - component unmounted', { event });
          return;
        }

        // 🌟 LOG ALL AUTH STATE CHANGES
        logAuthEvent(AuthEventType.INITIALIZATION, `Auth state changed: ${event}`, {
          event,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          hasSession: !!session,
          sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        });

        setState(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          isAuthenticated: !!session?.user,
          debugInfo: prev.debugInfo ? {
            ...prev.debugInfo,
            lastAuthEvent: event
          } : undefined
        }));

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              // 🎉 SUCCESSFUL SIGN IN
              logAuthEvent(AuthEventType.SIGN_IN_SUCCESS, 'User successfully signed in', {
                userId: session.user.id,
                userEmail: session.user.email,
                provider: session.user.app_metadata?.provider,
                sessionExpiry: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
              });
              
              toast.success(`Welcome back, ${session.user.email}!`);
              
              // 👤 START PROFILE LOADING
              logAuthEvent(AuthEventType.PROFILE_LOAD, 'Starting profile load after sign in', {
                userId: session.user.id
              });
              // TODO: Load user profile here when profile system is enhanced
            }
            break;

          case 'SIGNED_OUT':
            // 👋 SIGN OUT EVENT
            logAuthEvent(AuthEventType.SIGN_OUT_SUCCESS, 'User signed out successfully');
            
            setState(prev => ({
              ...prev,
              profile: null,
              error: null,
              lastError: null
            }));
            break;

          case 'TOKEN_REFRESHED':
            // 🔄 TOKEN REFRESH
            logAuthEvent(AuthEventType.TOKEN_REFRESH, 'Session token refreshed successfully', {
              userId: session?.user?.id,
              newExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
            });
            break;

          case 'USER_UPDATED':
            // 👤 USER UPDATE
            logAuthEvent(AuthEventType.PROFILE_LOAD, 'User data updated', {
              userId: session?.user?.id,
              userEmail: session?.user?.email
            });
            break;

          case 'PASSWORD_RECOVERY':
            // 🔑 PASSWORD RECOVERY
            logAuthEvent(AuthEventType.INITIALIZATION, 'Password recovery initiated', {
              userId: session?.user?.id
            });
            break;

          default:
            // 📝 UNKNOWN EVENT
            logAuthEvent(AuthEventType.INITIALIZATION, `Unknown auth event: ${event}`, {
              event,
              hasSession: !!session
            });
            break;
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkHealth]);

  // 🔥 AUTHENTICATION ACTIONS WITH INFINITY IQ DEBUGGING
  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    const performanceId = `google_signin_${Date.now()}`;
    
    // 🚀 START SIGN IN PROCESS
    authDebugger.startPerformanceTracking(performanceId, AuthEventType.SIGN_IN_START, 'Google sign-in initiated');
    logAuthEvent(AuthEventType.SIGN_IN_START, 'Starting Google OAuth sign-in flow', {
      redirectTo,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent,
      isOnline: navigator.onLine
    });

    setState(prev => ({ ...prev, isSigningIn: true, error: null }));
    setLastFailedOperation(() => () => signInWithGoogle(redirectTo));

    try {
      // 🔍 CALL AUTH SERVICE
      logAuthEvent(AuthEventType.OAUTH_REDIRECT, 'Calling authService.signInWithGoogle');
      const result = await authService.signInWithGoogle(redirectTo);
      
      if (result.success && result.data?.url) {
        // 🎉 SUCCESS - REDIRECT TO OAUTH
        logAuthEvent(AuthEventType.OAUTH_REDIRECT, 'Google OAuth URL generated successfully', {
          redirectUrl: result.data.url,
          provider: 'google'
        });
        
        authDebugger.endPerformanceTracking(performanceId, AuthEventType.SIGN_IN_START, 'Google sign-in redirect initiated', {
          redirectUrl: result.data.url
        });
        
        // Redirect to Google OAuth
        window.location.href = result.data.url;
      } else {
        // 🚨 SERVICE ERROR
        const errorMessage = result.error?.message || 'Failed to initiate Google sign-in';
        logAuthError(AuthEventType.SIGN_IN_ERROR, 'Google sign-in service failed', new Error(errorMessage), {
          serviceResult: result,
          redirectTo
        });
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      // 🚨 SIGN IN ERROR
      const authError = error as CropGeniusAuthError;
      
      logAuthError(AuthEventType.SIGN_IN_ERROR, 'Google sign-in failed', authError, {
        redirectTo,
        errorType: authError.type,
        errorCode: authError.code,
        retryable: authError.retryable
      });
      
      setState(prev => ({ 
        ...prev, 
        isSigningIn: false, 
        error: authError,
        lastError: authError
      }));
      
      toast.error(authError.userMessage || 'Sign-in failed');
      
      // End performance tracking on error
      authDebugger.endPerformanceTracking(performanceId, AuthEventType.SIGN_IN_ERROR, 'Google sign-in failed');
    }
  }, []);

  const signOut = useCallback(async () => {
    const performanceId = `signout_${Date.now()}`;
    
    // 🚪 START SIGN OUT PROCESS
    authDebugger.startPerformanceTracking(performanceId, AuthEventType.SIGN_OUT_START, 'User sign-out initiated');
    logAuthEvent(AuthEventType.SIGN_OUT_START, 'Starting user sign-out process', {
      userId: state.user?.id,
      userEmail: state.user?.email,
      sessionId: state.session?.access_token?.slice(0, 16),
      currentUrl: window.location.href
    });

    setState(prev => ({ ...prev, isSigningOut: true, error: null }));
    setLastFailedOperation(() => signOut);

    try {
      // 🔍 CALL AUTH SERVICE
      logAuthEvent(AuthEventType.SIGN_OUT_START, 'Calling authService.signOut');
      const result = await authService.signOut();
      
      if (result.success) {
        // 🎉 SIGN OUT SUCCESS
        logAuthEvent(AuthEventType.SIGN_OUT_SUCCESS, 'User signed out successfully', {
          userId: state.user?.id,
          signOutDuration: authDebugger.endPerformanceTracking ? 'tracked' : 'unknown'
        });
        
        toast.success('You have been signed out');
        setState(prev => ({ ...prev, isSigningOut: false }));
        
        // End performance tracking on success
        authDebugger.endPerformanceTracking(performanceId, AuthEventType.SIGN_OUT_SUCCESS, 'Sign-out completed successfully');
      } else {
        // 🚨 SERVICE ERROR
        const errorMessage = result.error?.message || 'Failed to sign out';
        logAuthError(AuthEventType.SIGN_OUT_ERROR, 'Sign-out service failed', new Error(errorMessage), {
          serviceResult: result,
          userId: state.user?.id
        });
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      // 🚨 SIGN OUT ERROR
      const authError = error as CropGeniusAuthError;
      
      logAuthError(AuthEventType.SIGN_OUT_ERROR, 'Sign-out failed', authError, {
        userId: state.user?.id,
        errorType: authError.type,
        errorCode: authError.code,
        retryable: authError.retryable
      });
      
      setState(prev => ({ 
        ...prev, 
        isSigningOut: false, 
        error: authError,
        lastError: authError
      }));
      
      toast.error(authError.userMessage || 'Sign-out failed');
      
      // End performance tracking on error
      authDebugger.endPerformanceTracking(performanceId, AuthEventType.SIGN_OUT_ERROR, 'Sign-out failed');
    }
  }, [state.user]);

  const refreshSession = useCallback(async () => {
    const performanceId = `session_refresh_${Date.now()}`;
    
    // 🔄 START SESSION REFRESH
    authDebugger.startPerformanceTracking(performanceId, AuthEventType.TOKEN_REFRESH, 'Session refresh initiated');
    logAuthEvent(AuthEventType.TOKEN_REFRESH, 'Starting session refresh', {
      userId: state.user?.id,
      sessionId: state.session?.access_token?.slice(0, 16),
      currentExpiry: state.session?.expires_at ? new Date(state.session.expires_at * 1000).toISOString() : null
    });

    setState(prev => ({ ...prev, isRefreshing: true, error: null }));
    setLastFailedOperation(() => refreshSession);

    try {
      // 🔍 CALL AUTH SERVICE
      logAuthEvent(AuthEventType.TOKEN_REFRESH, 'Calling authService.refreshSession');
      const result = await authService.refreshSession();
      
      if (result.success) {
        // 🎉 REFRESH SUCCESS
        logAuthEvent(AuthEventType.TOKEN_REFRESH, 'Session refreshed successfully', {
          userId: state.user?.id,
          refreshDuration: authDebugger.endPerformanceTracking ? 'tracked' : 'unknown'
        });
        
        setState(prev => ({ ...prev, isRefreshing: false }));
        
        // End performance tracking on success
        authDebugger.endPerformanceTracking(performanceId, AuthEventType.TOKEN_REFRESH, 'Session refresh completed successfully');
      } else {
        // 🚨 SERVICE ERROR
        const errorMessage = result.error?.message || 'Failed to refresh session';
        logAuthError(AuthEventType.SESSION_EXPIRED, 'Session refresh service failed', new Error(errorMessage), {
          serviceResult: result,
          userId: state.user?.id
        });
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      // 🚨 REFRESH ERROR
      const authError = error as CropGeniusAuthError;
      
      logAuthError(AuthEventType.SESSION_EXPIRED, 'Session refresh failed', authError, {
        userId: state.user?.id,
        errorType: authError.type,
        errorCode: authError.code,
        retryable: authError.retryable
      });
      
      setState(prev => ({ 
        ...prev, 
        isRefreshing: false, 
        error: authError,
        lastError: authError
      }));
      
      // End performance tracking on error
      authDebugger.endPerformanceTracking(performanceId, AuthEventType.SESSION_EXPIRED, 'Session refresh failed');
    }
  }, [state.user, state.session]);

  // 🌟 ERROR MANAGEMENT
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const retryLastOperation = useCallback(async () => {
    if (lastFailedOperation) {
      setRetryCount(prev => prev + 1);
      await lastFailedOperation();
    }
  }, [lastFailedOperation]);

  // 🚀 LOADING STATES WITH TIMEOUT
  useEffect(() => {
    if (state.isInitializing) {
      const timeout = setTimeout(() => {
        console.warn('🚨 [AUTH PROVIDER] Initialization timeout');
        setState(prev => ({
          ...prev,
          isInitializing: false,
          isLoading: false,
          error: {
            type: AuthErrorType.CONFIGURATION_ERROR,
            message: 'Initialization timeout',
            userMessage: 'CropGenius is taking longer than expected to load.',
            developerMessage: 'Authentication initialization timed out after 15 seconds.',
            code: 'AUTH_TIMEOUT',
            timestamp: new Date().toISOString(),
            instanceId: SupabaseManager.getInstanceId(),
            retryable: true
          }
        }));
      }, 15000);

      return () => clearTimeout(timeout);
    }
  }, [state.isInitializing]);

  // 🎨 BEAUTIFUL LOADING UI
  if (state.isInitializing || (state.isLoading && !state.error)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <div className="text-center max-w-md p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
          <div className="relative mb-6">
            <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto" />
            <Shield className="h-6 w-6 text-green-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            Initializing CropGenius
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Preparing your agricultural intelligence platform...
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {state.isOnline ? (
              <>
                <Wifi className="h-3 w-3" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </>
            )}
            {import.meta.env.DEV && state.debugInfo && (
              <>
                <span>•</span>
                <span>ID: {state.debugInfo.instanceId.slice(0, 6)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 🚨 ERROR STATE WITH RECOVERY
  if (state.error && !state.isInitializing) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
        <div className="text-center max-w-md p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            {state.error.userMessage}
          </p>
          <div className="space-y-3">
            {state.error.retryable && (
              <Button onClick={retryLastOperation} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Reload Page
            </Button>
          </div>
          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>Error Code: {state.error.code}</p>
            <p>Attempt: {retryCount + 1}</p>
            {import.meta.env.DEV && (
              <p>Instance: {state.debugInfo?.instanceId.slice(0, 8)}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 🌟 SUCCESS - RENDER CHILDREN
  console.log('🚀 [AUTH PROVIDER] Rendering children with INFINITY IQ context');
  
  return (
    <AuthContext.Provider value={{ 
      ...state,
      signInWithGoogle,
      signOut,
      refreshSession,
      clearError,
      retryLastOperation,
      checkHealth
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

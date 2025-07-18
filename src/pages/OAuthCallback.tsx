// 🚀 CROPGENIUS INFINITY IQ OAUTH CALLBACK HANDLER
// Production-ready OAuth callback with bulletproof error recovery for 100M farmers

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, SupabaseManager } from '@/integrations/supabase/client';
import { authService, AuthErrorType } from '@/services/AuthenticationService';
import { Loader2, AlertTriangle, CheckCircle, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { authDebugger, AuthEventType, logAuthEvent, logAuthError } from '@/utils/authDebugger';

// 🔥 CALLBACK PROCESSING STATES
enum CallbackState {
  INITIALIZING = 'INITIALIZING',
  VALIDATING_URL = 'VALIDATING_URL',
  EXCHANGING_CODE = 'EXCHANGING_CODE',
  LOADING_PROFILE = 'LOADING_PROFILE',
  REDIRECTING = 'REDIRECTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

interface CallbackError {
  type: AuthErrorType;
  message: string;
  userMessage: string;
  code: string;
  retryable: boolean;
  timestamp: string;
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState(CallbackState.INITIALIZING);
  const [error, setError] = useState<CallbackError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef(Date.now());

  // 🌟 URL VALIDATION AND SANITIZATION
  const validateCallbackUrl = (): { isValid: boolean; code?: string; error?: string; errorDescription?: string } => {
    try {
      console.log('🔍 [OAUTH CALLBACK] Validating URL:', window.location.href);
      
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      
      // Check for OAuth errors first
      const errorParam = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (errorParam) {
        return {
          isValid: false,
          error: errorParam,
          errorDescription: errorDescription || undefined
        };
      }
      
      // Look for authorization code
      const code = urlParams.get('code');
      
      if (!code && !hash.includes('access_token')) {
        return {
          isValid: false,
          error: 'missing_code',
          errorDescription: 'No authorization code or access token found in callback URL'
        };
      }
      
      return {
        isValid: true,
        code: code || undefined
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'url_parse_error',
        errorDescription: 'Failed to parse callback URL'
      };
    }
  };

  // 🔥 PROFILE LOADING WITH FALLBACK
  const loadUserProfile = async (userId: string): Promise<any> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('🔧 [OAUTH CALLBACK] Creating new profile for user:', userId);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            onboarding_completed: false,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.warn('⚠️ [OAUTH CALLBACK] Profile creation failed:', createError);
          return null; // Continue without profile
        }

        return newProfile;
      }

      if (error) {
        console.warn('⚠️ [OAUTH CALLBACK] Profile fetch failed:', error);
        return null; // Continue without profile
      }

      return profile;
    } catch (error) {
      console.warn('⚠️ [OAUTH CALLBACK] Profile loading error:', error);
      return null; // Continue without profile
    }
  };

  // 🚀 NAVIGATION LOGIC
  const navigateToDestination = (profile: any) => {
    const destination = profile?.onboarding_completed === false ? '/onboarding' : '/';
    console.log('🎯 [OAUTH CALLBACK] Navigating to:', destination);
    
    // Use full page reload for clean state
    window.location.href = `${window.location.origin}${destination}`;
  };

  // 💪 MAIN CALLBACK PROCESSING WITH INFINITY IQ DEBUGGING
  const processCallback = async () => {
    const performanceId = `oauth_callback_${Date.now()}`;
    
    try {
      // 🚀 STEP 1: INITIALIZE WITH DEBUGGING
      setState(CallbackState.INITIALIZING);
      setProgress(10);
      
      authDebugger.startPerformanceTracking(performanceId, AuthEventType.OAUTH_CALLBACK, 'OAuth callback processing');
      logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'Starting INFINITY IQ OAuth callback processing', {
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        instanceId: SupabaseManager.getInstanceId(),
        retryAttempt: retryCount,
        startTime: startTime.current
      });
      
      // 🔍 STEP 2: VALIDATE URL WITH DEBUGGING
      setState(CallbackState.VALIDATING_URL);
      setProgress(20);
      
      logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'Validating OAuth callback URL', {
        fullUrl: window.location.href,
        search: window.location.search,
        hash: window.location.hash
      });
      
      const urlValidation = validateCallbackUrl();
      
      if (!urlValidation.isValid) {
        // 🚨 URL VALIDATION FAILED
        logAuthError(AuthEventType.OAUTH_CALLBACK, 'OAuth callback URL validation failed', new Error(urlValidation.error || 'Invalid URL'), {
          error: urlValidation.error,
          errorDescription: urlValidation.errorDescription,
          url: window.location.href
        });
        
        throw {
          type: AuthErrorType.OAUTH_ERROR,
          message: urlValidation.error || 'Invalid callback URL',
          userMessage: urlValidation.errorDescription || 'OAuth callback failed. Please try signing in again.',
          code: 'CALLBACK_001',
          retryable: true,
          timestamp: new Date().toISOString()
        };
      }

      // ✅ URL VALIDATION SUCCESS
      logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'OAuth callback URL validated successfully', {
        hasCode: !!urlValidation.code,
        codeLength: urlValidation.code?.length
      });

      // 🔄 STEP 3: EXCHANGE CODE FOR SESSION WITH DEBUGGING
      setState(CallbackState.EXCHANGING_CODE);
      setProgress(40);
      
      let sessionResult;
      
      if (urlValidation.code) {
        logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'Exchanging authorization code for session', {
          codeLength: urlValidation.code.length,
          codePrefix: urlValidation.code.slice(0, 8)
        });
        
        sessionResult = await authService.exchangeCodeForSession(urlValidation.code);
      } else {
        logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'Getting current session (no code found)');
        sessionResult = await authService.getCurrentSession();
      }

      if (!sessionResult.success || !sessionResult.data) {
        // 🚨 SESSION EXCHANGE FAILED
        logAuthError(AuthEventType.OAUTH_CALLBACK, 'Session exchange failed', new Error(sessionResult.error?.message || 'Session exchange failed'), {
          serviceResult: sessionResult,
          hasCode: !!urlValidation.code
        });
        
        throw {
          type: AuthErrorType.OAUTH_ERROR,
          message: sessionResult.error?.message || 'Session exchange failed',
          userMessage: 'Failed to complete sign-in. Please try again.',
          code: 'CALLBACK_002',
          retryable: true,
          timestamp: new Date().toISOString()
        };
      }

      const session = sessionResult.data;
      
      // ✅ SESSION EXCHANGE SUCCESS
      logAuthEvent(AuthEventType.SIGN_IN_SUCCESS, 'OAuth session established successfully', {
        userId: session.user.id,
        userEmail: session.user.email,
        provider: session.user.app_metadata?.provider,
        sessionExpiry: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
      });

      // 👤 STEP 4: LOAD USER PROFILE WITH DEBUGGING
      setState(CallbackState.LOADING_PROFILE);
      setProgress(70);
      
      logAuthEvent(AuthEventType.PROFILE_LOAD, 'Loading user profile after OAuth success', {
        userId: session.user.id
      });
      
      const profile = await loadUserProfile(session.user.id);
      
      if (profile) {
        logAuthEvent(AuthEventType.PROFILE_LOAD, 'User profile loaded successfully', {
          userId: session.user.id,
          onboardingCompleted: profile.onboarding_completed,
          hasFullName: !!profile.full_name
        });
      } else {
        logAuthEvent(AuthEventType.PROFILE_LOAD, 'User profile not found or failed to load', {
          userId: session.user.id
        });
      }
      
      // 🎉 STEP 5: SUCCESS WITH DEBUGGING
      setState(CallbackState.SUCCESS);
      setProgress(90);
      
      logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'OAuth callback processing completed successfully', {
        userId: session.user.id,
        userEmail: session.user.email,
        hasProfile: !!profile,
        processingTime: Date.now() - startTime.current
      });
      
      toast.success(`Welcome back, ${session.user.email}!`, {
        description: 'Successfully signed in to CropGenius',
        duration: 3000
      });

      // 🎯 STEP 6: NAVIGATE WITH DEBUGGING
      setState(CallbackState.REDIRECTING);
      setProgress(100);
      
      const destination = profile?.onboarding_completed === false ? '/onboarding' : '/';
      
      logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'Redirecting user after successful OAuth', {
        destination,
        userId: session.user.id,
        onboardingRequired: profile?.onboarding_completed === false
      });
      
      // End performance tracking on success
      authDebugger.endPerformanceTracking(performanceId, AuthEventType.OAUTH_CALLBACK, 'OAuth callback completed successfully', {
        totalTime: Date.now() - startTime.current,
        destination
      });
      
      // Small delay for user feedback
      setTimeout(() => {
        navigateToDestination(profile);
      }, 1000);

    } catch (error: any) {
      // 🚨 CALLBACK PROCESSING ERROR
      logAuthError(AuthEventType.OAUTH_CALLBACK, 'OAuth callback processing failed', error, {
        state: state,
        progress: progress,
        retryCount: retryCount,
        processingTime: Date.now() - startTime.current,
        url: window.location.href
      });
      
      const callbackError: CallbackError = {
        type: error.type || AuthErrorType.OAUTH_ERROR,
        message: error.message || 'Unknown callback error',
        userMessage: error.userMessage || 'Authentication failed. Please try again.',
        code: error.code || 'CALLBACK_999',
        retryable: error.retryable !== false,
        timestamp: new Date().toISOString()
      };
      
      setError(callbackError);
      setState(CallbackState.ERROR);
      
      // End performance tracking on error
      authDebugger.endPerformanceTracking(performanceId, AuthEventType.OAUTH_CALLBACK, 'OAuth callback failed');
      
      // Auto-redirect to auth page after delay if not retryable
      if (!callbackError.retryable) {
        logAuthEvent(AuthEventType.OAUTH_CALLBACK, 'Auto-redirecting to auth page (non-retryable error)', {
          errorCode: callbackError.code,
          redirectDelay: 5000
        });
        
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 5000);
      }
    }
  };

  // 🔄 RETRY MECHANISM
  const retryCallback = async () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setProgress(0);
    await processCallback();
  };

  // 🚀 INITIALIZATION
  useEffect(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Start processing with small delay
    timeoutRef.current = setTimeout(() => {
      processCallback();
    }, 100);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 🎨 BEAUTIFUL UI STATES
  const renderContent = () => {
    switch (state) {
      case CallbackState.ERROR:
        return (
          <div className="text-center max-w-md p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Authentication Failed
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {error?.userMessage}
            </p>
            <div className="space-y-3">
              {error?.retryable && (
                <Button onClick={retryCallback} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth', { replace: true })} 
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>Error Code: {error?.code}</p>
              <p>Attempt: {retryCount + 1}</p>
              <p>Time: {Math.round((Date.now() - startTime.current) / 1000)}s</p>
            </div>
          </div>
        );

      case CallbackState.SUCCESS:
        return (
          <div className="text-center max-w-md p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-200 dark:border-green-800">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Welcome to CropGenius!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Authentication successful. Redirecting you now...
            </p>
            <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '100%' }}></div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center max-w-md p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-800">
            <div className="relative mb-6">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
              <Shield className="h-6 w-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Completing Sign-In
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              {getStateMessage()}
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {retryCount > 0 && <span>Attempt {retryCount + 1} • </span>}
              Instance: {SupabaseManager.getInstanceId().slice(0, 6)}
            </div>
          </div>
        );
    }
  };

  const getStateMessage = (): string => {
    switch (state) {
      case CallbackState.INITIALIZING:
        return 'Initializing authentication...';
      case CallbackState.VALIDATING_URL:
        return 'Validating callback parameters...';
      case CallbackState.EXCHANGING_CODE:
        return 'Exchanging authorization code...';
      case CallbackState.LOADING_PROFILE:
        return 'Loading your profile...';
      case CallbackState.REDIRECTING:
        return 'Redirecting to your dashboard...';
      default:
        return 'Processing authentication...';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
      {renderContent()}
    </div>
  );
}

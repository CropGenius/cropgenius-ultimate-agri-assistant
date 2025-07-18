// 🚀 CROPGENIUS INFINITY IQ AUTHENTICATION PAGE
// Production-ready authentication with bulletproof error handling for 100M farmers

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuthContext } from '@/providers/AuthProvider';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Loader2, Shield, Sparkles, Leaf, TrendingUp, Wifi, WifiOff, CheckCircle2 } from "lucide-react";
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🚀 INFINITY IQ AUTH CONTEXT
  const { 
    user, 
    isLoading, 
    isSigningIn, 
    error, 
    signInWithGoogle, 
    clearError,
    retryLastOperation,
    connectionHealth,
    isOnline
  } = useAuthContext();
  
  const from = (location.state as { from: string })?.from || "/";
  
  // 🌟 DEBUG LOGGING WITH INFINITY IQ
  useEffect(() => {
    console.log('[Auth Debug] Current URL:', window.location.href);
    console.log('[Auth Debug] Origin:', window.location.origin);
    console.log('[Auth Debug] Has search params:', !!window.location.search);
    console.log("Auth page loaded with redirect target:", from);
    
    // Clear any previous auth errors
    clearError();
  }, [clearError, from]);
  
  // 🎯 REDIRECT AUTHENTICATED USERS
  useEffect(() => {
    if (user && !isLoading) {
      console.log("Auth page: User already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

  // 🔥 GOOGLE SIGN IN HANDLER
  const handleGoogleSignIn = async () => {
    try {
      console.log("Starting Google sign in flow with redirect to:", `${window.location.origin}/auth/callback`);
      await signInWithGoogle(`${window.location.origin}/auth/callback`);
      // Redirect happens via OAuth callback
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error("Sign-in failed", { 
        description: error.userMessage || "Please try again or contact support if the problem persists." 
      });
    }
  };

  // 🔄 RETRY HANDLER
  const handleRetry = async () => {
    try {
      await retryLastOperation();
      toast.success("Retrying authentication...");
    } catch (error: any) {
      console.error("Retry failed:", error);
      toast.error("Retry failed", { 
        description: "Please refresh the page and try again." 
      });
    }
  };

  // 🎨 CONNECTION STATUS INDICATOR
  const getConnectionStatus = () => {
    if (!isOnline) {
      return { color: 'bg-red-500', text: 'Offline', icon: WifiOff };
    }
    
    switch (connectionHealth) {
      case 'healthy':
        return { color: 'bg-green-500', text: 'Connected', icon: Wifi };
      case 'degraded':
        return { color: 'bg-yellow-500', text: 'Slow Connection', icon: Wifi };
      case 'offline':
        return { color: 'bg-red-500', text: 'Offline', icon: WifiOff };
      default:
        return { color: 'bg-gray-500', text: 'Checking...', icon: Wifi };
    }
  };

  const connectionStatus = getConnectionStatus();
  const ConnectionIcon = connectionStatus.icon;

  return (
    <AuthErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950 dark:via-blue-950 dark:to-purple-950 px-4">
        <div className="w-full max-w-md">
          {/* 🌟 CONNECTION STATUS */}
          <div className="mb-4 flex items-center justify-center">
            <Badge variant="outline" className={`${connectionStatus.color} text-white border-none`}>
              <ConnectionIcon className="h-3 w-3 mr-1" />
              {connectionStatus.text}
            </Badge>
          </div>

          {/* 🚀 MAIN AUTH CARD */}
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 shadow-2xl border border-white/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  CropGenius
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  AI-Powered Agriculture for 100M+ Farmers
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 🚨 ERROR ALERT */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex flex-col gap-3">
                    <span className="font-medium">{error.userMessage}</span>
                    {error.retryable && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 self-end"
                        onClick={handleRetry}
                        disabled={isSigningIn}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Try Again
                      </Button>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* 🌟 FEATURES SHOWCASE */}
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-xs font-medium">99.7% Accuracy</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium">Boost Yields</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-2">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-xs font-medium">AI Insights</p>
                </div>
              </div>

              {/* 🔥 GOOGLE SIGN IN BUTTON */}
              <Button 
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || isLoading}
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="currentColor"
                        opacity="0.8"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="currentColor"
                        opacity="0.8"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>

              {/* 🌟 BENEFITS LIST */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Instant crop disease detection with AI</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Real-time weather and market insights</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span>Personalized farming recommendations</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="text-center">
              <p className="text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <span className="text-green-600 hover:underline cursor-pointer">Terms of Service</span>
                {" "}and{" "}
                <span className="text-green-600 hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </CardFooter>
          </Card>

          {/* 🌟 FOOTER STATS */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Trusted by <span className="font-bold text-green-600">100M+ farmers</span> across Africa
            </p>
          </div>
        </div>
      </div>
    </AuthErrorBoundary>
  );
}

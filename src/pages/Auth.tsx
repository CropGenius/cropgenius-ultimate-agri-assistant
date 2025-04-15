import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, debugAuthState } from "@/utils/authService";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Auth() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshSession } = useAuth();
  
  const from = (location.state as { from: string })?.from || "/";
  
  // Log auth debug info when component loads
  useEffect(() => {
    debugAuthState();
    console.log("Auth page loaded with redirect target:", from);
    
    // Clear any previous auth errors
    setAuthError(null);
  }, [from]);
  
  // If user is already authenticated, redirect to intended destination
  useEffect(() => {
    if (user) {
      console.log("Auth page: User already authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      console.log("Attempting login with:", data.email);
      const { data: authData, error } = await signInWithEmail(data.email, data.password);
      
      if (error) {
        console.error("Login error:", error);
        setAuthError(error);
        toast.error("Login failed", { description: error });
        return;
      }
      
      console.log("Login successful:", authData?.user?.id);
      // No need to redirect here, AuthProvider will handle it
    } catch (e: any) {
      console.error("Unexpected login error:", e.message);
      setAuthError(e.message);
      toast.error("Login failed", { description: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      console.log("Attempting signup with:", data.email);
      const { data: authData, error } = await signUpWithEmail(data.email, data.password, data.fullName);
      
      if (error) {
        console.error("Signup error:", error);
        setAuthError(error);
        toast.error("Signup failed", { description: error });
        return;
      }
      
      if (authData?.user) {
        console.log("Signup successful:", authData.user.id);
        toast.success("Account created successfully!", { 
          description: authData.session ? "You are now signed in." : "Please check your email to confirm your account."
        });
      } else {
        console.log("Signup returned without error but no user");
        toast.info("Signup successful", { 
          description: "Please check your email to confirm your account."
        });
      }
      
      // No need to redirect here, AuthProvider will handle it if session exists
    } catch (e: any) {
      console.error("Unexpected signup error:", e.message);
      setAuthError(e.message);
      toast.error("Signup failed", { description: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      console.log("Initiating Google sign in");
      await signInWithGoogle();
      // Redirect happens via callback
    } catch (e: any) {
      console.error("Google sign in error:", e.message);
      setAuthError(e.message);
      toast.error("Google sign in failed", { description: e.message });
    }
  };
  
  const handleAuthRetry = async () => {
    setIsRetrying(true);
    try {
      await refreshSession();
      toast.info("Session refreshed");
      
      // Short timeout to let the session refresh before checking
      setTimeout(() => {
        if (user) {
          navigate(from, { replace: true });
        } else {
          setAuthError("Still unable to authenticate. Please try logging in again.");
        }
        setIsRetrying(false);
      }, 1500);
    } catch (e: any) {
      console.error("Auth retry failed:", e);
      setAuthError("Authentication retry failed. Please try logging in again.");
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">CROPGenius AI</CardTitle>
          <CardDescription>Enter your details to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth Error Alert */}
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col gap-2">
                <span>{authError}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 self-end"
                  onClick={handleAuthRetry}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Fixing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
                      Retry Authentication
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}
        
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isSubmitting || isRetrying}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isSubmitting ? "Processing..." : "Google"}
          </Button>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground text-center">
          By continuing, you agree to CROPGenius Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  );
}

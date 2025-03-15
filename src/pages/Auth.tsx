
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { 
  ArrowRight, 
  LockKeyhole, 
  Mail, 
  User, 
  Fingerprint, 
  Shield, 
  Smartphone,
  Leaf,
  BarChart4,
  ShieldCheck,
  CloudSun,
  Tractor,
  Loader,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [mainCrop, setMainCrop] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [farmProfiles, setFarmProfiles] = useState<any[]>([]);
  const [aiAnalyzingFarm, setAiAnalyzingFarm] = useState(false);
  const [formStage, setFormStage] = useState(1);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Simulate loading analytics data for the testimonials section
    setTimeout(() => {
      setAnalyticsData({
        farmsManaged: 12453,
        hectaresOptimized: 178450,
        yieldIncrease: 32,
        countries: 14,
      });
    }, 1500);

    // Simulate AI-suggested farm profiles for quick signup
    setTimeout(() => {
      setFarmProfiles([
        { region: "Central Kenya", mainCrops: ["Maize", "Coffee", "Beans"], soilType: "Loam", averageRainfall: "Medium" },
        { region: "Tanzania - Lake Zone", mainCrops: ["Rice", "Sorghum"], soilType: "Clay", averageRainfall: "High" },
        { region: "Ethiopia Highlands", mainCrops: ["Teff", "Wheat"], soilType: "Volcanic", averageRainfall: "Medium" },
        { region: "Uganda - Central", mainCrops: ["Bananas", "Cassava"], soilType: "Clay Loam", averageRainfall: "High" },
      ]);
    }, 2000);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error("Authentication failed", {
          description: error.message,
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        });
      } else {
        toast.success("Authentication successful", {
          description: "AI is analyzing your farm data...",
          icon: <Tractor className="h-5 w-5 text-green-500" />,
        });
        
        // Simulate AI analyzing farm data before redirecting
        setAiAnalyzingFarm(true);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    const errors: {[key: string]: string} = {};
    if (!email) errors.email = "Email is required";
    if (!password || password.length < 6) errors.password = "Password must be at least 6 characters";
    if (formStage === 2 && !farmLocation) errors.farmLocation = "Farm location is required";
    if (formStage === 2 && !mainCrop) errors.mainCrop = "Main crop is required";
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // If still on first stage, move to second
    if (formStage === 1) {
      setFormStage(2);
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            farmLocation,
            mainCrop,
          },
        },
      });
      
      if (error) {
        toast.error("Signup failed", {
          description: error.message,
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        });
      } else {
        toast.success("Account created successfully", {
          description: "AI is configuring your farm profile...",
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        });
        
        // Simulate AI analyzing farm data before redirecting
        setAiAnalyzingFarm(true);
        setTimeout(() => {
          toast.info("AI farm analysis completed", {
            description: "Your personalized dashboard is ready",
          });
          navigate("/");
        }, 3000);
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    toast.info("Accessing as guest", {
      description: "Limited AI features available. Create an account for full access.",
    });
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const selectFarmProfile = (profile: any) => {
    setFarmLocation(profile.region);
    setMainCrop(profile.mainCrops[0]);
    toast.success("AI farm profile selected", {
      description: `Optimized for ${profile.region} with ${profile.soilType} soil type`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 dark:from-green-950/40 dark:via-emerald-950/40 dark:to-cyan-950/40">
      {/* AI Farm Analysis Overlay */}
      {aiAnalyzingFarm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <Loader className="h-12 w-12 text-emerald-500 animate-spin" />
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl -z-10"></div>
              </div>
              <h2 className="text-2xl font-bold mb-2">AI Farm System Initializing</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                CropGenius AI is analyzing satellite data for your farm location
              </p>
              
              <div className="w-full space-y-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing soil conditions</span>
                    <span className="text-emerald-500">Complete</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing weather patterns</span>
                    <span className="text-emerald-500">Complete</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Configuring crop recommendations</span>
                    <span>73%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-pulse w-[73%]"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Building optimal farm management plan</span>
                    <span>48%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-pulse w-[48%]"></div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Please wait while CropGenius AI configures your autonomous farm management system
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Section - Auth Forms */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="mb-8 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-2 rounded-lg">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h1 className="ml-3 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500">
                  CROPGenius
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Africa's #1 AI-Powered Farm Intelligence System
              </p>
            </div>

            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signin" | "signup")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <Card className="border-emerald-100 dark:border-emerald-900/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Sign In to CROPGenius</CardTitle>
                    <CardDescription>
                      Access your AI-powered farm intelligence system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="password">Password</Label>
                          <a href="#" className="text-xs text-emerald-600 hover:text-emerald-500">
                            Forgot password?
                          </a>
                        </div>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            Authenticating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Access Farm Dashboard
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4 pt-0">
                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" onClick={() => toast.info("Google integration coming soon")}>
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" onClick={() => toast.info("Phone auth integration coming soon")}>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Phone
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="text-sm mt-4" 
                      onClick={handleGuestAccess}
                    >
                      Continue as Guest (Limited Access)
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="signup">
                <Card className="border-emerald-100 dark:border-emerald-900/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {formStage === 1 ? (
                        <>Create Your AI Farm Account</>
                      ) : (
                        <>Configure AI Farm Assistant</>
                      )}
                      <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500">Free Trial</Badge>
                    </CardTitle>
                    <CardDescription>
                      {formStage === 1
                        ? "Set up your account to access the AI farm intelligence system"
                        : "Provide farm details for AI to optimize your experience"
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
                      {formStage === 1 ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="your.email@example.com"
                                className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  setValidationErrors({...validationErrors, email: ''});
                                }}
                              />
                              {validationErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative">
                              <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                className={`pl-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                                value={password}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  setValidationErrors({...validationErrors, password: ''});
                                }}
                              />
                              <button
                                type="button"
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? "Hide" : "Show"}
                              </button>
                              {validationErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4">
                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Farm Data Privacy
                            </h3>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                              Your farm data is encrypted and used only for AI-powered optimizations.
                              We never share your information with third parties.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="farmLocation">Farm Location Region</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="farmLocation"
                                placeholder="e.g., Central Kenya, Northern Nigeria"
                                className={`pl-10 ${validationErrors.farmLocation ? 'border-red-500' : ''}`}
                                value={farmLocation}
                                onChange={(e) => {
                                  setFarmLocation(e.target.value);
                                  setValidationErrors({...validationErrors, farmLocation: ''});
                                }}
                              />
                              {validationErrors.farmLocation && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.farmLocation}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="mainCrop">Primary Crop</Label>
                            <div className="relative">
                              <Wheat className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="mainCrop"
                                placeholder="e.g., Maize, Rice, Coffee"
                                className={`pl-10 ${validationErrors.mainCrop ? 'border-red-500' : ''}`}
                                value={mainCrop}
                                onChange={(e) => {
                                  setMainCrop(e.target.value);
                                  setValidationErrors({...validationErrors, mainCrop: ''});
                                }}
                              />
                              {validationErrors.mainCrop && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.mainCrop}</p>
                              )}
                            </div>
                          </div>
                          
                          {farmProfiles.length > 0 && (
                            <div className="mt-4">
                              <Label className="text-sm text-gray-500 dark:text-gray-400">
                                AI-Suggested Farm Profiles:
                              </Label>
                              <div className="mt-2 space-y-2">
                                {farmProfiles.map((profile, index) => (
                                  <Button
                                    key={index}
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between text-left px-3 py-3 h-auto"
                                    onClick={() => selectFarmProfile(profile)}
                                  >
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">{profile.region}</span>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {profile.mainCrops.join(", ")} | {profile.soilType} soil
                                      </span>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Badge className={profile.averageRainfall === "High" 
                                        ? "bg-blue-500" 
                                        : profile.averageRainfall === "Medium"
                                          ? "bg-emerald-500"
                                          : "bg-amber-500"
                                      }>
                                        {profile.averageRainfall} Rain
                                      </Badge>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader className="h-4 w-4 animate-spin" />
                            Processing...
                          </span>
                        ) : formStage === 1 ? (
                          <span className="flex items-center gap-2">
                            Continue
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Activate AI Farm System
                            <Leaf className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                  {formStage === 2 && (
                    <CardFooter className="flex justify-between pt-0">
                      <Button 
                        variant="ghost" 
                        onClick={() => setFormStage(1)}
                      >
                        Back
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
            
            <p className="text-center text-xs text-gray-500 mt-6">
              By accessing CROPGenius, you agree to our 
              <a href="#" className="text-emerald-600 hover:underline ml-1">Terms of Service</a>
              <span className="mx-1">and</span>
              <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
        
        {/* Right Section - Benefits & Testimonials */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 text-white p-4 md:p-8 lg:p-12 hidden md:flex items-center justify-center">
          <div className="max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Africa's Most Advanced AI Farm Intelligence System
            </h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI-Powered Crop Analysis</h3>
                  <p className="text-white/80 mt-1">
                    Real-time disease detection and treatment recommendations from our AI system
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CloudSun className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Hyperlocal Weather Intelligence</h3>
                  <p className="text-white/80 mt-1">
                    Farm-specific weather forecasts with AI-powered action recommendations
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <BarChart4 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Market Access</h3>
                  <p className="text-white/80 mt-1">
                    AI-optimized crop pricing and direct connections to premium buyers
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Tractor className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Autonomous Farm Management</h3>
                  <p className="text-white/80 mt-1">
                    Daily AI-generated farm plans optimized for soil, weather, and market conditions
                  </p>
                </div>
              </div>
            </div>
            
            {analyticsData && (
              <div className="grid grid-cols-2 gap-4 my-8">
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{analyticsData.farmsManaged.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Farms Managed</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{analyticsData.hectaresOptimized.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Hectares Optimized</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">+{analyticsData.yieldIncrease}%</div>
                  <div className="text-sm text-white/70">Average Yield Increase</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{analyticsData.countries}</div>
                  <div className="text-sm text-white/70">African Countries</div>
                </div>
              </div>
            )}
            
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 bg-white/20 h-10 w-10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium">David Mwangi</h4>
                    <Badge className="ml-2 bg-amber-400 text-amber-900">Verified Farmer</Badge>
                  </div>
                  <p className="text-sm text-white/80 mt-1 italic">
                    "CROPGenius AI has revolutionized how I farm. The disease detection alone saved my entire tomato crop last season, and the market insights helped me increase profits by 40%."
                  </p>
                  <div className="text-xs text-white/60 mt-1">Nyeri County, Kenya</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}

// Add these components since they don't seem to be imported yet
function MapPin(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Wheat(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 22 16 8" />
      <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M15.47 8.53 17 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L17 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M19.47 12.53 21 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L21 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
    </svg>
  );
}

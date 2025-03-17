
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import TodaysFarmPlan from "@/components/home/TodaysFarmPlan";
import CropScannerPreview from "@/components/home/CropScannerPreview";
import WeatherPreview from "@/components/home/WeatherPreview";
import MarketPreview from "@/components/home/MarketPreview";
import AIChatPreview from "@/components/home/AIChatPreview";
import FeatureLink from "@/components/home/FeatureLink";
import { 
  Leaf, 
  CloudSun, 
  BarChart4, 
  ShoppingCart, 
  MessageSquareText, 
  AlertTriangle, 
  Users, 
  Gift, 
  Award,
  Lock,
  Zap,
  Bot,
  LockKeyhole,
  BadgeCheck
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);
  const [marketInsight, setMarketInsight] = useState<string | null>(null);
  const [yieldPrediction, setYieldPrediction] = useState<number | null>(null);

  useEffect(() => {
    // Check for user session
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          
          // Show toast for location detection
          toast.success("Farm location detected", {
            description: "AI is analyzing your local conditions"
          });
          
          // Generate simulated farm location based on coordinates
          simulateLocationDetection(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Failed to get location
          setLocation(null);
          // Use random location for demo
          simulateLocationDetection(null, null);
        }
      );
    } else {
      // Use random location for demo
      simulateLocationDetection(null, null);
    }

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        // Show welcome message on login
        if (event === 'SIGNED_IN') {
          toast.success("Welcome to CropGenius", {
            description: "AI is analyzing your farm data"
          });
        }
      }
    );

    // Randomly show the auth prompt after some activity to encourage signup
    const promptTimer = setTimeout(() => {
      if (!user) {
        setShowAuthPrompt(true);
      }
    }, 20000); // Show after 20 seconds

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(promptTimer);
    };
  }, []);

  // Simulate AI detecting location and generating insights
  const simulateLocationDetection = (lat: number | null, lng: number | null) => {
    // Generate a realistic location based on Africa
    const regions = [
      "Central Kenya 🇰🇪",
      "Northern Nigeria 🇳🇬", 
      "Eastern Uganda 🇺🇬", 
      "Southern Tanzania 🇹🇿",
      "Western Ghana 🇬🇭",
      "Zambia Valley 🇿🇲"
    ];
    
    const detectedRegion = regions[Math.floor(Math.random() * regions.length)];
    setDetectedLocation(detectedRegion);
    
    // Generate weather alert for the region
    const weatherAlerts = [
      "🌧️ Rain expected in 48 hours. AI will adjust irrigation plans.",
      "☀️ Dry spell predicted. AI recommends water conservation.",
      "🌡️ Temperature rising 3°C above normal. AI suggesting crop protection.",
      "💨 Strong winds forecasted next week. Secure crops and equipment."
    ];
    setWeatherAlert(weatherAlerts[Math.floor(Math.random() * weatherAlerts.length)]);
    
    // Generate market insight
    const marketInsights = [
      "📈 Maize prices up 12% this week. AI predicts optimal selling time.",
      "🌽 Crop demand increasing in nearby urban markets. Connect with buyers.",
      "💰 Price trend analysis shows 9% better margins with delayed selling.",
      "🚜 Local processing facility offering premium rates this month."
    ];
    setMarketInsight(marketInsights[Math.floor(Math.random() * marketInsights.length)]);
    
    // Generate yield prediction
    setYieldPrediction(Math.floor(Math.random() * 25) + 20); // 20-45% increase
  };

  // Prompt user for signup when they try to access premium features
  const handlePremiumFeatureClick = (e: React.MouseEvent, path: string) => {
    if (!user) {
      e.preventDefault();
      toast.info("AI Farm Intelligence Required", {
        description: "Create your free account to access personalized AI insights",
        action: {
          label: "Sign Up",
          onClick: () => navigate("/auth")
        },
        icon: <Bot className="h-5 w-5" />,
        duration: 5000
      });
      
      // After showing toast, give user option to continue or sign up
      navigate("/auth", { state: { returnTo: path } });
    }
  };

  const featuresData = [
    {
      to: "/scan",
      icon: <Leaf className="h-8 w-8" />,
      title: "AI Crop Scanner",
      description: "Identify diseases and get instant treatment recommendations",
    },
    {
      to: "/weather",
      icon: <CloudSun className="h-8 w-8" />,
      title: "Weather AI",
      description: "Get hyperlocal forecasts and smart farming advisories",
    },
    {
      to: "/farm-plan",
      icon: <BarChart4 className="h-8 w-8" />,
      title: "AI Farm Plan",
      description: "AI-generated plans optimized for your farm conditions",
    },
    {
      to: "/market",
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Smart Market",
      description: "Find buyers, track prices, and maximize your profits",
    },
    {
      to: "/chat",
      icon: <MessageSquareText className="h-8 w-8" />,
      title: "AI Assistant",
      description: "Get answers to any farming questions in seconds",
    },
    {
      to: "/alerts",
      icon: <AlertTriangle className="h-8 w-8" />,
      title: "AI Alerts",
      description: "Receive timely alerts for weather, pests, and market changes",
    },
    {
      to: "/community",
      icon: <Users className="h-8 w-8" />,
      title: "Farmer Network",
      description: "Connect with farmers and share knowledge",
    },
    {
      to: "/referrals",
      icon: <Gift className="h-8 w-8" />,
      title: "Referrals",
      description: "Invite farmers and earn points for premium features",
    },
    {
      to: "/challenges",
      icon: <Award className="h-8 w-8" />,
      title: "Farm Challenges",
      description: "Complete farming challenges to unlock rewards",
    },
  ];

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        {/* AI-Detected Location Banner - Show before login */}
        {!user && detectedLocation && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  AI Location Detection
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    LIVE
                  </Badge>
                </h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                  CROPGenius AI has detected you're in {detectedLocation}. 
                  Farm intelligence is being customized for your region.
                </p>
                
                {/* Show AI-generated insights based on location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {weatherAlert && (
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                      <CloudSun className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">WEATHER ALERT</p>
                        <p className="text-sm">{weatherAlert}</p>
                      </div>
                    </div>
                  )}
                  
                  {marketInsight && (
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                      <BarChart4 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">MARKET INSIGHT</p>
                        <p className="text-sm">{marketInsight}</p>
                      </div>
                    </div>
                  )}
                  
                  {yieldPrediction && (
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                      <Leaf className="h-5 w-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">AI YIELD PREDICTION</p>
                        <p className="text-sm">AI system can boost your farm yield by <span className="font-bold text-emerald-600 dark:text-emerald-400">+{yieldPrediction}%</span></p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* CTA for signup */}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button 
                    onClick={() => navigate("/auth")}
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Activate AI Farm Intelligence
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAuthPrompt(false)}
                    className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                  >
                    Explore First
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auth Prompt Modal - Shows after user interaction if not logged in */}
        {showAuthPrompt && !user && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white dark:bg-gray-900 border-green-100 dark:border-green-900/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-2 rounded-full">
                    <LockKeyhole className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">Unlock AI Farm Power</CardTitle>
                </div>
                <CardDescription>
                  Create your free CROPGenius account to access personalized AI farming insights tailored to your region.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-start gap-3">
                  <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300 text-sm">
                      AI is ready to optimize your farm
                    </p>
                    <p className="text-green-700 dark:text-green-400 text-sm">
                      Your farm could see a <span className="font-bold">+{yieldPrediction || 32}% yield increase</span> with AI-powered decisions.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <CloudSun className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1" />
                    <p className="font-medium text-blue-800 dark:text-blue-300">Weather AI</p>
                    <p className="text-blue-700 dark:text-blue-400 text-xs">Predictive alerts prevent crop losses</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <BarChart4 className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-1" />
                    <p className="font-medium text-purple-800 dark:text-purple-300">Market AI</p>
                    <p className="text-purple-700 dark:text-purple-400 text-xs">Best prices and optimal selling time</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  onClick={() => navigate("/auth")}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Smart Farming Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAuthPrompt(false)}
                >
                  Continue Exploring
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300">
            AI-Powered Farming Intelligence
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Increase yields, prevent diseases, and maximize profits with real-time AI insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {loading ? (
              <Button disabled>
                <span className="animate-pulse">Loading...</span>
              </Button>
            ) : user ? (
              <Button size="lg" onClick={() => navigate("/scan")} className="relative group overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Start Scanning Your Crops
                </span>
                <div className="absolute inset-0 bg-green-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="relative group overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Activate AI Farm System
                  </span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/scan")} 
                  className="group"
                >
                  <span className="flex items-center gap-2">
                    Try Without Account
                    <Award className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* AI-Powered Premium Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/scan")}>
            <CropScannerPreview />
            {!user && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Unlock AI Crop Scanner
                </Button>
              </div>
            )}
          </div>
          <div className="relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/weather")}>
            <WeatherPreview />
            {!user && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Unlock AI Weather
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* AI-Powered Premium Features - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-1 relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/farm-plan")}>
            <TodaysFarmPlan />
            {!user && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Unlock AI Farm Plan
                </Button>
              </div>
            )}
          </div>
          <div className="lg:col-span-1 relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/market")}>
            <MarketPreview />
            {!user && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Unlock AI Market Data
                </Button>
              </div>
            )}
          </div>
          <div className="lg:col-span-1 relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/chat")}>
            <AIChatPreview />
            {!user && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Unlock AI Assistant
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* CTA Banner Before Features Grid */}
        {!user && (
          <div className="mb-10 relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 p-6 md:p-8 text-white">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Join 12,000+ Farmers Using CROPGenius AI
              </h2>
              <p className="mb-6 text-green-100 max-w-3xl">
                Our AI farm intelligence system is helping farmers across Africa increase yields by 32% on average while reducing water usage and maximizing profits.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                  className="bg-white text-green-700 hover:bg-green-50 flex items-center gap-2"
                >
                  <Zap className="h-5 w-5" />
                  Activate AI Farm System
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => navigate("/scan")}
                >
                  Try AI Features First
                </Button>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transform"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 transform"></div>
          </div>
        )}

        {/* Feature Links Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 text-center">All CropGenius Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => (
              <div 
                key={index} 
                className="relative group" 
                onClick={(e) => !user && handlePremiumFeatureClick(e, feature.to)}
              >
                <FeatureLink {...feature} />
                {!user && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                      <Lock className="h-3 w-3" />
                      Unlock Feature
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

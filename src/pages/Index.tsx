
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import TodaysFarmPlan from "@/components/home/TodaysFarmPlan";
import CropScannerPreview from "@/components/home/CropScannerPreview";
import WeatherPreview from "@/components/home/WeatherPreview";
import MarketPreview from "@/components/home/MarketPreview";
import AIChatPreview from "@/components/home/AIChatPreview";
import FeatureLink from "@/components/home/FeatureLink";
import FarmScoreCard from "@/components/weather/FarmScoreCard";
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
  const isMobile = useIsMobile();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);
  const [marketInsight, setMarketInsight] = useState<string | null>(null);
  const [yieldPrediction, setYieldPrediction] = useState<number | null>(null);
  const [farmScore, setFarmScore] = useState<number>(68);
  const [scoreChange, setScoreChange] = useState<number>(4);
  const [showScoreAnimation, setShowScoreAnimation] = useState<boolean>(false);
  const [taskStats, setTaskStats] = useState({
    completed: 3,
    total: 5,
    efficiencyGain: 12,
    yieldBoost: 17
  });

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
    
    // Simulate score animation
    setTimeout(() => {
      setShowScoreAnimation(true);
      setTimeout(() => setShowScoreAnimation(false), 3000);
    }, 2000);

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
      toast.info("AI Farm Intelligence Ready", {
        description: "Create your free account to access personalized AI insights",
        action: {
          label: "Start Now",
          onClick: () => navigate("/auth")
        },
        icon: <Bot className="h-5 w-5" />,
        duration: 5000
      });
      
      // After showing toast, give user option to continue or sign up
      navigate("/auth", { state: { returnTo: path } });
    }
  };

  // Main features for mobile grid
  const mainFeatures = [
    {
      to: "/scan",
      icon: <Leaf className="h-6 w-6" />,
      title: "AI Crop Scanner",
      description: "Scan & treat crop issues instantly",
    },
    {
      to: "/weather",
      icon: <CloudSun className="h-6 w-6" />,
      title: "Weather AI",
      description: "Smart forecasts & farm actions",
    },
    {
      to: "/farm-plan",
      icon: <BarChart4 className="h-6 w-6" />,
      title: "AI Farm Plan",
      description: "Optimize your daily farm tasks",
    },
    {
      to: "/market",
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Smart Market",
      description: "Best prices & selling times",
    },
  ];

  // All features for expanded grid
  const allFeatures = [
    ...mainFeatures,
    {
      to: "/chat",
      icon: <MessageSquareText className="h-6 w-6" />,
      title: "AI Assistant",
      description: "Get expert farming answers 24/7",
    },
    {
      to: "/alerts",
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "AI Alerts",
      description: "Never miss critical farm events",
    },
    {
      to: "/community",
      icon: <Users className="h-6 w-6" />,
      title: "Farmer Network",
      description: "Connect & share knowledge",
    },
    {
      to: "/referrals",
      icon: <Gift className="h-6 w-6" />,
      title: "Referrals",
      description: "Earn rewards for inviting farmers",
    },
  ];

  return (
    <Layout>
      <div className="container py-4 md:py-6 px-4 md:px-6">
        {/* SECTION 1: AI FARM INTELLIGENCE HEADER */}
        <section className="mb-6">
          {/* AI-Detected Location Banner */}
          {!user && detectedLocation && (
            <div className="mb-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full flex-shrink-0">
                  <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 text-sm flex items-center gap-2">
                    AI Location Detection
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] py-0">
                      LIVE
                    </Badge>
                  </h3>
                  <p className="text-blue-700 dark:text-blue-400 text-xs mt-1">
                    CROPGenius AI has detected you're in {detectedLocation}
                  </p>
                  
                  {/* AI-generated insights based on location - Mobile Optimized */}
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {weatherAlert && (
                      <div className="bg-white dark:bg-gray-900 p-2 rounded-md border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                        <CloudSun className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">WEATHER ALERT</p>
                          <p className="text-xs">{weatherAlert}</p>
                        </div>
                      </div>
                    )}
                    
                    {marketInsight && (
                      <div className="bg-white dark:bg-gray-900 p-2 rounded-md border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                        <BarChart4 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">MARKET INSIGHT</p>
                          <p className="text-xs">{marketInsight}</p>
                        </div>
                      </div>
                    )}
                    
                    {yieldPrediction && (
                      <div className="bg-white dark:bg-gray-900 p-2 rounded-md border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                        <Leaf className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">AI YIELD PREDICTION</p>
                          <p className="text-xs">AI can boost your farm yield by <span className="font-bold text-emerald-600 dark:text-emerald-400">+{yieldPrediction}%</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* CTA for signup - Mobile Optimized */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button 
                      onClick={() => navigate("/auth")}
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 h-8 text-xs"
                    >
                      <Zap className="h-3 w-3" />
                      Start Using AI For Free
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAuthPrompt(false)}
                      className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 h-8 text-xs"
                    >
                      Explore First
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section - Mobile Optimized */}
          <div className="text-center mb-6 mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300">
              AI-Powered Farming
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Increase yields, prevent diseases, and maximize profits
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {loading ? (
                <Button disabled className="w-full sm:w-auto">
                  <span className="animate-pulse">Loading...</span>
                </Button>
              ) : user ? (
                <Button onClick={() => navigate("/scan")} className="w-full sm:w-auto bg-primary flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Start Scanning Crops
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate("/auth")} 
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Start Using AI For Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: FARM SCORE & AI FARM PLAN */}
        <section className="mb-5">
          <FarmScoreCard 
            farmScore={farmScore} 
            scoreChange={scoreChange} 
            showScoreAnimation={showScoreAnimation}
            taskStats={taskStats}
          />
          
          <div className="relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/farm-plan")}>
            <TodaysFarmPlan />
            {!user && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Try AI Farm Plan Now
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: MAIN FEATURES GRID - MOBILE OPTIMIZED */}
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3">AI Farm Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            {mainFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="relative group" 
                onClick={(e) => !user && handlePremiumFeatureClick(e, feature.to)}
              >
                <FeatureLink {...feature} />
                {!user && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs px-2 h-8 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Try Now
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: AI CROP SCANNER - EMPHASIZED */}
        <section className="mb-6">
          <div className="relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/scan")}>
            <CropScannerPreview />
            {!user && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Try AI Crop Scanner
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5: WEATHER & MARKET - SIDE BY SIDE ON LARGER SCREENS */}
        <section className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/weather")}>
              <WeatherPreview />
              {!user && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Try AI Weather
                  </Button>
                </div>
              )}
            </div>

            <div className="relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/market")}>
              <MarketPreview />
              {!user && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Try AI Market
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 6: AI CHAT */}
        <section className="mb-6">
          <div className="relative group" onClick={(e) => !user && handlePremiumFeatureClick(e, "/chat")}>
            <AIChatPreview />
            {!user && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Try AI Assistant
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner - Mobile Optimized */}
        {!user && (
          <section className="mb-6">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 p-4 text-white">
              <div className="relative z-10">
                <h2 className="text-lg md:text-xl font-bold mb-2">
                  Join 12,000+ Farmers Using CROPGenius
                </h2>
                <p className="mb-4 text-green-100 text-sm">
                  Our AI system helps farmers increase yields by 32% on average while maximizing profits.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => navigate("/auth")}
                    className="bg-white text-green-700 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Start Using AI For Free
                  </Button>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transform"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 transform"></div>
            </div>
          </section>
        )}
        
        {/* SECTION 7: ALL FEATURES - MOBILE OPTIMIZED GRID */}
        <section className="mb-4">
          <h2 className="text-lg font-bold mb-3">All AI Features</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="relative group" 
                onClick={(e) => !user && handlePremiumFeatureClick(e, feature.to)}
              >
                <FeatureLink {...feature} />
                {!user && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-lg">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs px-2 h-8 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Try Now
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Auth Prompt Modal - Mobile Optimized */}
      {showAuthPrompt && !user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white dark:bg-gray-900 border-green-100 dark:border-green-900/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-2 rounded-full">
                  <LockKeyhole className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">Start Using AI For Free</CardTitle>
              </div>
              <CardDescription>
                Create your free CROPGenius account to access personalized AI farming insights for your region.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-start gap-3">
                <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300 text-sm">
                    AI is ready to optimize your farm
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-xs">
                    Your farm could see a <span className="font-bold">+{yieldPrediction || 32}% yield increase</span> with AI-powered decisions.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <CloudSun className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-1" />
                  <p className="font-medium text-blue-800 dark:text-blue-300">Weather AI</p>
                  <p className="text-blue-700 dark:text-blue-400 text-[10px]">Predictive alerts prevent crop losses</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <BarChart4 className="h-4 w-4 text-purple-600 dark:text-purple-400 mb-1" />
                  <p className="font-medium text-purple-800 dark:text-purple-300">Market AI</p>
                  <p className="text-purple-700 dark:text-purple-400 text-[10px]">Best prices and optimal selling time</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                onClick={() => navigate("/auth")}
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Using AI For Free
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAuthPrompt(false)}
              >
                Explore First
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Layout>
  );
}

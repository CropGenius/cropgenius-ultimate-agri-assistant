
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { 
  ArrowRight, 
  LockKeyhole, 
  Mail, 
  User, 
  Smartphone,
  Leaf,
  BarChart4,
  CloudSun,
  Tractor,
  Loader,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Bot,
  ThermometerSun,
  ThermometerSnowflake,
  Droplets,
  Wind,
  AreaChart,
  Clock,
  BadgeCheck,
  Zap,
  Star,
  Sprout,
  BellRing,
  WifiOff,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Define region types for better AI suggestions
interface FarmRegion {
  id: string;
  name: string;
  country: string;
  flag: string;
  weather: {
    condition: string;
    temperature: number;
    nextRain: string;
    humidity: number;
  };
  crops: string[];
  marketTrend: {
    status: "rising" | "falling" | "stable";
    percent: number;
    insight: string;
  };
  soilType: string;
  averageRainfall: "High" | "Medium" | "Low";
  aiInsight: string;
  yieldIncrease: number;
}

// Define crop type for better AI suggestions
interface CropType {
  id: string;
  name: string;
  icon: string;
  soilRequirements: string[];
  growthPeriod: string;
  waterNeeds: "High" | "Medium" | "Low";
  market: {
    demand: "High" | "Medium" | "Low";
    priceChange: number;
    trend: string;
  };
  aiTips: string[];
}

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [mainCrop, setMainCrop] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [farmingGoals, setFarmingGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [farmProfiles, setFarmProfiles] = useState<FarmRegion[]>([]);
  const [cropSuggestions, setCropSuggestions] = useState<CropType[]>([]);
  const [aiAnalyzingFarm, setAiAnalyzingFarm] = useState(false);
  const [formStage, setFormStage] = useState(1);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [weatherAlert, setWeatherAlert] = useState<string | null>(null);
  const [marketInsight, setMarketInsight] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [signupProgress, setSignupProgress] = useState(25);
  const [predictedYield, setPredictedYield] = useState<number | null>(null);
  const [aiGenerating, setAiGenerating] = useState(true);
  const [returningUser, setReturningUser] = useState(false);
  const [showRealTimeValue, setShowRealTimeValue] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }));
  
  // Reference for the value proposition section
  const valuePropositionRef = useRef<HTMLDivElement>(null);

  // Simulate loading initial AI-driven data for the auth experience
  useEffect(() => {
    // Simulate AI detecting user location based on IP
    setTimeout(() => {
      const detectedRegions = ["Central Kenya 🇰🇪", "Northern Nigeria 🇳🇬", "Eastern Uganda 🇺🇬", "Southern Tanzania 🇹🇿"];
      setDetectedLocation(detectedRegions[Math.floor(Math.random() * detectedRegions.length)]);
      
      // Generate weather alert relevant to detected region
      const alerts = [
        "🌧️ AI Weather Alert: Rain expected in 48 hours. Prepare to adjust irrigation.",
        "☀️ AI Weather Alert: Heat wave predicted next week. Crop protection needed.",
        "💨 AI Weather Alert: Strong winds forecasted. Secure young crops.",
        "🌊 AI Weather Alert: Flooding risk rising in your area. AI preparing mitigation plan."
      ];
      setWeatherAlert(alerts[Math.floor(Math.random() * alerts.length)]);
      
      // Generate market insight based on global agricultural trends
      const insights = [
        "📈 Market Alert: Maize prices rising 8% this week. AI recommends holding.",
        "💰 Market Alert: Coffee exports showing 12% premium in your region.",
        "🌱 Market Alert: Organic certification could increase your crop value by 35%.",
        "🚜 Market Alert: Rice demand surging. AI predicts best selling time in 14 days."
      ];
      setMarketInsight(insights[Math.floor(Math.random() * insights.length)]);
      
      // Generate AI-driven farm recommendation
      const recommendations = [
        "🌱 Based on soil analysis from your region, AI predicts 27% yield increase with smart irrigation.",
        "🚜 AI Farm Plan ready: Optimal planting schedule could boost your harvest by 32%.",
        "☀️ Solar-powered irrigation system recommended for your farm size - 47% cost reduction.",
        "🌿 AI Crop Rotation plan could restore soil health and increase yield sustainability by 24%."
      ];
      setAiRecommendation(recommendations[Math.floor(Math.random() * recommendations.length)]);
      
      // Simulate yield prediction based on regional AI analysis
      setPredictedYield(Math.floor(Math.random() * 35) + 20); // 20-55% yield increase
      
      // Show the initial AI analysis is complete
      setAiGenerating(false);
    }, 2000);

    // Simulate loading analytics data for the testimonials section
    setTimeout(() => {
      setAnalyticsData({
        farmsManaged: 12453,
        hectaresOptimized: 178450,
        yieldIncrease: 32,
        countries: 14,
        waterSaved: 47,
        costReduction: 38,
      });
    }, 1500);

    // Simulate AI-suggested farm profiles for quick signup
    setTimeout(() => {
      setFarmProfiles([
        {
          id: "kenya-central",
          name: "Central Kenya Highlands",
          country: "Kenya",
          flag: "🇰🇪",
          weather: {
            condition: "Partly Cloudy",
            temperature: 23,
            nextRain: "48 hours",
            humidity: 65,
          },
          crops: ["Maize", "Coffee", "Beans"],
          marketTrend: {
            status: "rising",
            percent: 7.5,
            insight: "Coffee prices rising due to global shortages"
          },
          soilType: "Loam",
          averageRainfall: "Medium",
          aiInsight: "AI predicts ideal conditions for coffee growing next month.",
          yieldIncrease: 32
        },
        {
          id: "tanzania-lake",
          name: "Tanzania - Lake Zone",
          country: "Tanzania",
          flag: "🇹🇿",
          weather: {
            condition: "Rainy",
            temperature: 26,
            nextRain: "Now",
            humidity: 78,
          },
          crops: ["Rice", "Sorghum"],
          marketTrend: {
            status: "stable",
            percent: 1.2,
            insight: "Rice demand steady with good export opportunities"
          },
          soilType: "Clay",
          averageRainfall: "High",
          aiInsight: "AI detected optimal rice planting window opening next week.",
          yieldIncrease: 41
        },
        {
          id: "ethiopia-high",
          name: "Ethiopia Highlands",
          country: "Ethiopia",
          flag: "🇪🇹",
          weather: {
            condition: "Sunny",
            temperature: 21,
            nextRain: "5 days",
            humidity: 55,
          },
          crops: ["Teff", "Wheat"],
          marketTrend: {
            status: "rising",
            percent: 9.3,
            insight: "Premium prices for your region's wheat quality"
          },
          soilType: "Volcanic",
          averageRainfall: "Medium",
          aiInsight: "AI analysis shows perfect wheat conditions developing.",
          yieldIncrease: 28
        },
        {
          id: "uganda-central",
          name: "Uganda - Central",
          country: "Uganda",
          flag: "🇺🇬",
          weather: {
            condition: "Hot",
            temperature: 29,
            nextRain: "3 days",
            humidity: 67,
          },
          crops: ["Bananas", "Cassava"],
          marketTrend: {
            status: "falling",
            percent: 3.5,
            insight: "AI predicts price recovery in 2 weeks - hold crops if possible"
          },
          soilType: "Clay Loam",
          averageRainfall: "High",
          aiInsight: "AI detected potential disease risk - preventative measures recommended.",
          yieldIncrease: 37
        },
      ]);

      // Add crop suggestions
      setCropSuggestions([
        {
          id: "maize",
          name: "Maize",
          icon: "🌽",
          soilRequirements: ["Loam", "Sandy Loam"],
          growthPeriod: "80-95 days",
          waterNeeds: "Medium",
          market: {
            demand: "High",
            priceChange: 5.3,
            trend: "Rising demand in your region"
          },
          aiTips: [
            "AI recommends early planting this season",
            "Optimal spacing: 75cm between rows",
            "Smart irrigation can increase yield by 28%"
          ]
        },
        {
          id: "tomatoes",
          name: "Tomatoes",
          icon: "🍅",
          soilRequirements: ["Loam", "Clay Loam"],
          growthPeriod: "60-80 days",
          waterNeeds: "High",
          market: {
            demand: "High",
            priceChange: 12.7,
            trend: "Premium prices for quality produce"
          },
          aiTips: [
            "AI detected ideal growing conditions in your area",
            "Smart pest control can save 32% of crop",
            "Greenhouse option increases profit margin by 45%"
          ]
        },
        {
          id: "beans",
          name: "Beans",
          icon: "🫘",
          soilRequirements: ["Sandy", "Loam"],
          growthPeriod: "55-60 days",
          waterNeeds: "Low",
          market: {
            demand: "Medium",
            priceChange: 2.1,
            trend: "Stable prices with good local demand"
          },
          aiTips: [
            "Excellent companion plant with maize",
            "Nitrogen-fixing improves soil quality",
            "AI recommends intercropping for 31% total yield increase"
          ]
        },
        {
          id: "coffee",
          name: "Coffee",
          icon: "☕",
          soilRequirements: ["Volcanic", "Loam"],
          growthPeriod: "3-4 years to maturity",
          waterNeeds: "Medium",
          market: {
            demand: "High",
            priceChange: 8.4,
            trend: "Premium export opportunities emerging"
          },
          aiTips: [
            "AI certification system can increase price by 45%",
            "Shade management optimizes quality",
            "Smart irrigation system reduces water use by 35%"
          ]
        }
      ]);
    }, 2000);

    // Random chance to show a returning user experience
    if (Math.random() > 0.5) {
      setReturningUser(true);
    }

    // Simulate occasional network issue to show offline resilience
    if (Math.random() > 0.8) {
      setTimeout(() => {
        setOfflineMode(true);
        
        toast.warning("Network connection limited", {
          description: "AI will continue to function with cached farm data",
          icon: <WifiOff className="h-5 w-5 text-amber-500" />,
          duration: 4000,
        });
        
        setTimeout(() => {
          setOfflineMode(false);
          toast.success("Connection restored", {
            description: "AI has synced all farm data",
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            duration: 3000,
          });
        }, 8000);
      }, 10000);
    }
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
        toast.success("AI Farm System Access Granted", {
          description: "CROPGenius AI is analyzing your farm data...",
          icon: <Tractor className="h-5 w-5 text-green-500" />,
        });
        
        // Simulate AI analyzing farm data before redirecting
        setAiAnalyzingFarm(true);
        setTimeout(() => {
          navigate("/");
        }, 3500);
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
    
    // Additional validation based on form stage
    if (formStage === 2 && !farmLocation) errors.farmLocation = "Farm location is required";
    if (formStage === 2 && !mainCrop) errors.mainCrop = "Main crop is required";
    if (formStage === 3 && !farmSize) errors.farmSize = "Farm size is required";
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // If on first stage, move to second
    if (formStage === 1) {
      setFormStage(2);
      setSignupProgress(50);
      // Scroll to value proposition to show benefits
      if (valuePropositionRef.current) {
        valuePropositionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    
    // If on second stage, move to third
    if (formStage === 2) {
      setFormStage(3);
      setSignupProgress(75);
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
            farmSize,
            farmingGoals,
          },
        },
      });
      
      if (error) {
        toast.error("AI Farm System Access Denied", {
          description: error.message,
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        });
      } else {
        toast.success("AI Farm System Activated", {
          description: "CROPGenius AI is configuring your farm profile...",
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        });
        
        // Simulate AI analyzing farm data before redirecting
        setAiAnalyzingFarm(true);
        setTimeout(() => {
          toast.info("AI Farm Analysis Complete", {
            description: "Your personalized dashboard is ready",
            icon: <Bot className="h-5 w-5 text-blue-500" />,
          });
          navigate("/");
        }, 4500);
      }
    } catch (error: any) {
      toast.error("AI System Connection Failure", {
        description: error.message,
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    toast.info("Accessing AI Demo Mode", {
      description: "Limited AI features available. Create an account for full access.",
      icon: <Bot className="h-5 w-5 text-blue-500" />,
    });
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const selectFarmProfile = (profile: FarmRegion) => {
    setFarmLocation(profile.name);
    setMainCrop(profile.crops[0]);
    
    // Show AI is thinking about your selection
    setAiGenerating(true);
    
    setTimeout(() => {
      setAiGenerating(false);
      setPredictedYield(profile.yieldIncrease);
      
      toast.success("AI Farm Profile Optimized", {
        description: `${profile.flag} ${profile.name} - ${profile.aiInsight}`,
        icon: <Bot className="h-5 w-5 text-green-500" />,
        duration: 4000,
      });
      
      // Show intelligent follow-up notifications
      setTimeout(() => {
        if (profile.weather.nextRain === "Now" || profile.weather.nextRain === "48 hours") {
          toast.info("AI Weather Alert", {
            description: `Rain expected in ${profile.weather.nextRain}. AI adjusting irrigation plan.`,
            icon: <CloudSun className="h-5 w-5 text-blue-500" />,
            duration: 5000,
          });
        }
        
        if (profile.marketTrend.status === "rising" && profile.marketTrend.percent > 5) {
          toast.success("AI Market Intelligence", {
            description: `${profile.marketTrend.insight}. ${profile.marketTrend.percent}% price increase detected.`,
            icon: <BarChart4 className="h-5 w-5 text-green-500" />,
            duration: 5000,
          });
        }
      }, 2000);
    }, 1500);
  };

  const selectCrop = (crop: CropType) => {
    setMainCrop(crop.name);
    
    // Show AI is thinking about your selection
    setAiGenerating(true);
    
    setTimeout(() => {
      setAiGenerating(false);
      
      toast.success(`AI Crop Analysis: ${crop.icon} ${crop.name}`, {
        description: crop.aiTips[0],
        icon: <Leaf className="h-5 w-5 text-green-500" />,
        duration: 4000,
      });
      
      // Show market insights for this crop
      setTimeout(() => {
        if (crop.market.priceChange > 0) {
          toast.info("AI Market Intelligence", {
            description: `${crop.market.trend}. Prices up ${crop.market.priceChange}% this month.`,
            icon: <BarChart4 className="h-5 w-5 text-blue-500" />,
            duration: 5000,
          });
        }
        
        // Show another intelligent tip
        setTimeout(() => {
          toast.info("AI Farming Advice", {
            description: crop.aiTips[1],
            icon: <Bot className="h-5 w-5 text-blue-500" />,
            duration: 5000,
          });
        }, 3000);
      }, 2000);
    }, 1500);
  };

  // Function to get current weather icon based on conditions
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'rainy':
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'sunny':
        return <ThermometerSun className="h-5 w-5 text-amber-500" />;
      case 'hot':
        return <ThermometerSun className="h-5 w-5 text-red-500" />;
      case 'cold':
        return <ThermometerSnowflake className="h-5 w-5 text-blue-300" />;
      case 'windy':
        return <Wind className="h-5 w-5 text-gray-500" />;
      default:
        return <CloudSun className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Function to get market trend indicator
  const getMarketTrendIndicator = (trend: "rising" | "falling" | "stable") => {
    switch (trend) {
      case 'rising':
        return <AreaChart className="h-5 w-5 text-green-500" />;
      case 'falling':
        return <AreaChart className="h-5 w-5 text-red-500" />;
      case 'stable':
        return <AreaChart className="h-5 w-5 text-blue-500" />;
      default:
        return <AreaChart className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 dark:from-green-950/40 dark:via-emerald-950/40 dark:to-cyan-950/40">
      {/* Offline Mode Banner */}
      {offlineMode && (
        <div className="w-full bg-amber-500/90 p-2 text-center text-sm text-white flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" /> 
          Limited connectivity - AI using cached data for your farm
          <Button variant="outline" size="sm" className="ml-2 h-7 bg-white/20 border-white/40 text-white hover:bg-white/30">
            Use Offline Mode
          </Button>
        </div>
      )}

      {/* AI Farm Analysis Overlay */}
      {aiAnalyzingFarm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="relative">
                  <Loader className="h-16 w-16 text-emerald-500 animate-spin" />
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-amber-500 text-white">AI</Badge>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl -z-10"></div>
              </div>
              <h2 className="text-2xl font-bold mb-2">AI Farm System Initializing</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                CROPGenius AI is analyzing satellite data and optimizing your farm operations
              </p>
              
              <div className="w-full space-y-6 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <CloudSun className="h-4 w-4 mr-2 text-blue-500" />
                      Analyzing hyperlocal weather patterns
                    </span>
                    <span className="text-emerald-500 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Complete
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-green-500" />
                      Processing soil conditions & crop compatibility
                    </span>
                    <span className="text-emerald-500 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Complete
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <BarChart4 className="h-4 w-4 mr-2 text-purple-500" />
                      Configuring market intelligence algorithms
                    </span>
                    <span className="flex items-center">
                      84%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-pulse w-[84%]"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Tractor className="h-4 w-4 mr-2 text-amber-500" />
                      Building optimal farm management plan
                    </span>
                    <span className="flex items-center">
                      67%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-pulse w-[67%]"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-blue-500" />
                      Training AI assistant with your farm context
                    </span>
                    <span className="flex items-center">
                      42%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full animate-pulse w-[42%]"></div>
                  </div>
                </div>
              </div>
              
              {/* Farm System Benefits */}
              <div className="grid grid-cols-3 gap-4 mb-6 w-full">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">+37%</div>
                  <div className="text-xs text-green-700 dark:text-green-500">Yield Increase</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">-42%</div>
                  <div className="text-xs text-blue-700 dark:text-blue-500">Water Usage</div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">+28%</div>
                  <div className="text-xs text-purple-700 dark:text-purple-500">Profit Margin</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4 animate-pulse" />
                Intelligent farm system activation in progress - Please wait
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Section - Auth Forms */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-md w-full">
            <div className="mb-6 text-center md:text-left">
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

            {/* Real-time Value Before Signup */}
            {showRealTimeValue && (
              <div ref={valuePropositionRef} className={`mb-6 space-y-3 ${aiGenerating ? 'opacity-80' : 'opacity-100'} transition-opacity duration-500`}>
                {aiGenerating ? (
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm animate-pulse">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {detectedLocation && (
                      <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-blue-100 dark:border-blue-900/50">
                        <Bot className="h-5 w-5 text-blue-500" />
                        <AlertTitle className="flex items-center gap-2">
                          AI Location Detection
                          <Badge className="bg-blue-500 text-white">LIVE</Badge>
                        </AlertTitle>
                        <AlertDescription>
                          CROPGenius AI has detected you're in {detectedLocation}. Your farm intelligence system is being customized for this region.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {weatherAlert && (
                      <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-amber-100 dark:border-amber-900/50">
                        <CloudSun className="h-5 w-5 text-amber-500" />
                        <AlertTitle className="flex items-center gap-2">
                          AI Weather Alert
                          <Badge className="bg-amber-500 text-white">URGENT</Badge>
                        </AlertTitle>
                        <AlertDescription>
                          {weatherAlert}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {marketInsight && (
                      <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-green-100 dark:border-green-900/50">
                        <BarChart4 className="h-5 w-5 text-green-500" />
                        <AlertTitle className="flex items-center gap-2">
                          AI Market Intelligence
                          <Badge className="bg-green-500 text-white">LIVE</Badge>
                        </AlertTitle>
                        <AlertDescription>
                          {marketInsight}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {aiRecommendation && (
                      <Alert className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40 border-purple-100 dark:border-purple-900/50">
                        <Zap className="h-5 w-5 text-purple-500" />
                        <AlertTitle className="flex items-center gap-2">
                          AI Farm Recommendation
                          <Badge variant="outline" className="border-purple-500 text-purple-500">PREMIUM</Badge>
                        </AlertTitle>
                        <AlertDescription>
                          {aiRecommendation}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {predictedYield && (
                      <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-white/20 rounded-full">
                              <Percent className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-white font-semibold">AI Yield Prediction</span>
                          </div>
                          <Badge className="bg-white/20 text-white">AI ANALYSIS</Badge>
                        </div>
                        <div className="mt-2 flex items-end gap-2">
                          <span className="text-4xl font-bold text-white">+{predictedYield}%</span>
                          <span className="text-white/90 text-sm mb-1">yield increase</span>
                        </div>
                        <div className="mt-1 text-xs text-white/80">
                          Based on AI analysis of soil, weather, and crop data in your region
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                  onClick={() => {
                    setShowRealTimeValue(false);
                    setAuthMode("signup");
                  }}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Unlock Full AI Farm Intelligence System
                </Button>
              </div>
            )}

            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signin" | "signup")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">
                  {returningUser ? (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Welcome Back
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </TabsTrigger>
                <TabsTrigger value="signup">
                  <span className="flex items-center gap-1">
                    <Zap className="h-4 w-4" /> 
                    Start AI Farming
                  </span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <Card className="border-emerald-100 dark:border-emerald-900/50">
                  <CardHeader className="pb-4">
                    {returningUser ? (
                      <>
                        <CardTitle className="text-xl flex items-center gap-2">
                          Welcome Back to CROPGenius
                          <Badge className="bg-amber-500">AI Updates Ready</Badge>
                        </CardTitle>
                        <CardDescription>
                          Your AI farm assistant has been analyzing your crops while you were away
                        </CardDescription>
                        
                        {/* Real-time updates for returning users */}
                        <div className="mt-4 space-y-3">
                          <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-green-100 dark:border-green-900/50">
                            <Leaf className="h-5 w-5 text-green-500" />
                            <AlertTitle className="text-green-800 dark:text-green-400">Crop Growth Update</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-500">
                              Your maize crop is showing +12% better growth than regional average. AI has adjusted your nutrition plan.
                            </AlertDescription>
                          </Alert>
                          
                          <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-amber-100 dark:border-amber-900/50">
                            <CloudSun className="h-5 w-5 text-amber-500" />
                            <AlertTitle className="text-amber-800 dark:text-amber-400">Weather Alert</AlertTitle>
                            <AlertDescription className="text-amber-700 dark:text-amber-500">
                              Heavy rain expected in 36 hours. AI has updated your irrigation schedule to compensate.
                            </AlertDescription>
                          </Alert>
                          
                          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-100 dark:border-blue-900/50">
                            <BarChart4 className="h-5 w-5 text-blue-500" />
                            <AlertTitle className="text-blue-800 dark:text-blue-400">Market Opportunity</AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-500">
                              Premium buyer interested in your maize crop. Offering 8% above market value. Sign in to review.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </>
                    ) : (
                      <>
                        <CardTitle className="text-xl">Access Your AI Farm System</CardTitle>
                        <CardDescription>
                          Sign in to continue managing your farm with AI assistance
                        </CardDescription>
                      </>
                    )}
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
                            Activating AI Farm System...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            {returningUser ? "Resume AI Farm Management" : "Access AI Farm Dashboard"}
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
                      <Bot className="h-4 w-4 mr-2 text-emerald-500" />
                      Try AI Demo Mode (Limited Access)
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="signup">
                <Card className="border-emerald-100 dark:border-emerald-900/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {formStage === 1 ? (
                        <>Activate Your AI Farm System</>
                      ) : formStage === 2 ? (
                        <>Configure Your AI Assistant</>
                      ) : (
                        <>Finalize AI Farm Setup</>
                      )}
                      <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500">Free Trial</Badge>
                    </CardTitle>
                    <CardDescription>
                      {formStage === 1
                        ? "Set up your account to access the AI farm intelligence system"
                        : formStage === 2
                        ? "Tell us about your farm for personalized AI insights"
                        : "Final details to optimize your AI farm management system"
                      }
                    </CardDescription>
                    <Progress value={signupProgress} className="mt-4 h-2" />
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
                      ) : formStage === 2 ? (
                        <>
                          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4">
                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              AI Farm Data Security
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
                              <Leaf className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
                            <div className="mt-6">
                              <Label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                <Bot className="h-4 w-4 text-emerald-500" />
                                AI-Suggested Farm Profiles:
                              </Label>
                              <div className="space-y-3">
                                {farmProfiles.map((profile, index) => (
                                  <Button
                                    key={index}
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-between text-left px-3 py-4 h-auto border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
                                    onClick={() => selectFarmProfile(profile)}
                                  >
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium flex items-center gap-1.5">
                                        <span>{profile.flag}</span>
                                        {profile.name}
                                      </span>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center">
                                          {getWeatherIcon(profile.weather.condition)}
                                          {profile.weather.temperature}°C
                                        </span>
                                        <span>•</span>
                                        <span>{profile.soilType} soil</span>
                                        <span>•</span>
                                        <span className="flex items-center">
                                          {getMarketTrendIndicator(profile.marketTrend.status)}
                                          {profile.marketTrend.status === 'rising' ? '+' : profile.marketTrend.status === 'falling' ? '-' : ''}
                                          {profile.marketTrend.percent}%
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {profile.crops.map((crop, i) => (
                                          <Badge key={i} variant="outline" className="text-xs px-1.5 py-0.5">
                                            {crop}
                                          </Badge>
                                        ))}
                                      </div>
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
                          
                          {cropSuggestions.length > 0 && mainCrop && (
                            <div className="mt-6">
                              <Label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                                AI Crop Analysis:
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                {cropSuggestions.filter(crop => crop.name.toLowerCase().includes(mainCrop.toLowerCase()) || mainCrop.toLowerCase().includes(crop.name.toLowerCase())).slice(0, 2).map((crop, index) => (
                                  <Button
                                    key={index}
                                    type="button"
                                    variant="outline"
                                    className="flex-col items-center justify-center px-3 py-3 h-auto border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-gray-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
                                    onClick={() => selectCrop(crop)}
                                  >
                                    <div className="text-xl mb-1">{crop.icon}</div>
                                    <div className="font-medium">{crop.name}</div>
                                    <div className="flex items-center gap-1 mt-1 text-xs">
                                      <Badge className={
                                        crop.market.demand === "High" 
                                          ? "bg-green-500" 
                                          : crop.market.demand === "Medium"
                                            ? "bg-blue-500"
                                            : "bg-amber-500"
                                      }>
                                        {crop.market.demand} Demand
                                      </Badge>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                      {crop.market.priceChange > 0 ? `+${crop.market.priceChange}%` : `${crop.market.priceChange}%`} price trend
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg mb-4">
                            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              AI Farm Analysis
                            </h3>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                              Based on your location and crop selection, CROPGenius AI is ready to analyze your farm in detail and build a personalized plan.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="farmSize">Farm Size (hectares or acres)</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                              <Input
                                id="farmSize"
                                placeholder="e.g., 5 hectares, 12 acres"
                                className={`pl-10 ${validationErrors.farmSize ? 'border-red-500' : ''}`}
                                value={farmSize}
                                onChange={(e) => {
                                  setFarmSize(e.target.value);
                                  setValidationErrors({...validationErrors, farmSize: ''});
                                }}
                              />
                              {validationErrors.farmSize && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.farmSize}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="farmingGoals">Your Farming Goals</Label>
                            <Textarea
                              id="farmingGoals"
                              placeholder="e.g., Increase yield, reduce costs, try new crops..."
                              className="min-h-[100px]"
                              value={farmingGoals}
                              onChange={(e) => setFarmingGoals(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              This helps the AI system understand your priorities and customize recommendations
                            </p>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg mt-4">
                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                              <Star className="h-4 w-4 text-amber-500" />
                              AI Features You'll Unlock
                            </h3>
                            <div className="mt-3 grid grid-cols-1 gap-3">
                              <div className="flex items-start gap-2">
                                <div className="bg-green-100 dark:bg-green-800/30 p-1.5 rounded-full mt-0.5">
                                  <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-green-800 dark:text-green-300">AI Crop Scanner</p>
                                  <p className="text-xs text-green-700 dark:text-green-400">Instant disease detection and treatment recommendations</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <div className="bg-blue-100 dark:bg-blue-800/30 p-1.5 rounded-full mt-0.5">
                                  <CloudSun className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300">AI Weather Engine</p>
                                  <p className="text-xs text-blue-700 dark:text-blue-400">Hyperlocal forecasts with AI action recommendations</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <div className="bg-purple-100 dark:bg-purple-800/30 p-1.5 rounded-full mt-0.5">
                                  <BarChart4 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-purple-800 dark:text-purple-300">AI Smart Market</p>
                                  <p className="text-xs text-purple-700 dark:text-purple-400">Price predictions and optimal selling strategy</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <div className="bg-amber-100 dark:bg-amber-800/30 p-1.5 rounded-full mt-0.5">
                                  <Tractor className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-amber-800 dark:text-amber-300">AI Farm Plan</p>
                                  <p className="text-xs text-amber-700 dark:text-amber-400">Daily AI-optimized farming tasks and schedules</p>
                                </div>
                              </div>
                            </div>
                          </div>
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
                            Activating AI Farm System...
                          </span>
                        ) : formStage === 1 ? (
                          <span className="flex items-center gap-2">
                            Continue
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        ) : formStage === 2 ? (
                          <span className="flex items-center gap-2">
                            Next: Final Setup
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Activate AI Farm System
                            <Zap className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                  {formStage > 1 && (
                    <CardFooter className="flex justify-between pt-0">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          setFormStage(formStage - 1);
                          setSignupProgress(signupProgress - 25);
                        }}
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
        <div className="w-full md:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 text-white p-4 md:p-8 lg:p-12 hidden md:flex items-center justify-center relative overflow-hidden">
          {/* Large AI symbol in the background */}
          <div className="absolute -right-10 top-0 text-[300px] font-bold opacity-5 select-none">AI</div>
          
          <div className="max-w-md z-10">
            <div className="bg-white/10 p-4 rounded-lg mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <BellRing className="h-5 w-5" />
                </div>
                <div className="font-medium">AI Update • {currentDate}</div>
              </div>
              <p className="text-sm text-white/90">
                CROPGenius AI has detected exceptional growing conditions for key crops in East Africa. Farmers using AI recommendations are reporting a 37% average yield increase this season.
              </p>
            </div>
            
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
              <div className="grid grid-cols-3 gap-4 my-8">
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
                  <div className="text-sm text-white/70">Yield Increase</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">{analyticsData.countries}</div>
                  <div className="text-sm text-white/70">African Countries</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">-{analyticsData.waterSaved}%</div>
                  <div className="text-sm text-white/70">Water Usage</div>
                </div>
                <div className="bg-white/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold">-{analyticsData.costReduction}%</div>
                  <div className="text-sm text-white/70">Cost Reduction</div>
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
            
            <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 p-4 rounded-lg mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="h-5 w-5 text-white" />
                <h4 className="font-medium">AI-Powered Growth</h4>
              </div>
              <p className="text-sm text-white/90">
                "Access to AI farming technologies through CROPGenius has transformed our community. What used to be inconsistent harvests are now reliable, profitable yields."
              </p>
              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-white/60">Grace Okonkwo</div>
                <Badge className="bg-white/20">Nigeria</Badge>
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

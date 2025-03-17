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
  MapPin as MapPinIcon,
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
                    
                    {weather

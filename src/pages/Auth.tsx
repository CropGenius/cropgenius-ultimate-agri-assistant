
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
                    
                    {weatherAlert && (
                      <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 border-amber-100 dark:border-amber-900/50">
                        <CloudSun className="h-5 w-5 text-amber-500" />
                        <AlertTitle className="flex items-center gap-2">
                          AI Weather Intelligence
                          <Badge className="bg-amber-500 text-white">LIVE</Badge>
                        </AlertTitle>
                        <AlertDescription>
                          {weatherAlert}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {marketInsight && (
                      <Alert className="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/40 border-purple-100 dark:border-purple-900/50">
                        <BarChart4 className="h-5 w-5 text-purple-500" />
                        <AlertTitle className="flex items-center gap-2">
                          AI Market Intelligence
                          <Badge className="bg-purple-500 text-white">LIVE</Badge>
                        </AlertTitle>
                        <AlertDescription>
                          {marketInsight}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {aiRecommendation && (
                      <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-green-100 dark:border-green-900/50">
                        <Zap className="h-5 w-5 text-green-500" />
                        <AlertTitle className="flex items-center gap-2">
                          AI Farm Recommendation
                          <Badge className="bg-green-500/90 text-white">PREMIUM</Badge>
                        </AlertTitle>
                        <AlertDescription>
                          {aiRecommendation}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {predictedYield && (
                      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 border-emerald-100 dark:border-emerald-900/50">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                              <Badge className="bg-white text-emerald-600 hover:bg-white">AI PREDICTION</Badge>
                              Yield Increase Potential
                            </div>
                            <div className="font-bold text-2xl text-emerald-600">+{predictedYield}%</div>
                          </div>
                          <Progress value={predictedYield} max={100} className="h-2 bg-emerald-100 dark:bg-emerald-900/40">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                          </Progress>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                            AI has analyzed soil conditions, weather patterns, and crop data in your region to predict potential yield increase with smart farming.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Auth Tabs */}
            <Tabs defaultValue={authMode} onValueChange={(value) => setAuthMode(value as "signin" | "signup")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Register Farm</TabsTrigger>
              </TabsList>
              
              {/* Sign In Content */}
              <TabsContent value="signin" className="mt-0">
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">
                      {returningUser ? "Welcome Back, Farmer!" : "Access Your AI Farm System"}
                    </CardTitle>
                    <CardDescription>
                      {returningUser 
                        ? "Your AI farm assistant has been monitoring your crops while you were away." 
                        : "Sign in to access your personalized AI farm intelligence tools."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {returningUser && (
                      <Alert className="bg-blue-50 dark:bg-blue-950/40 mb-4 border-blue-100 dark:border-blue-900/50">
                        <Bot className="h-5 w-5 text-blue-500" />
                        <AlertTitle>AI Farm Update</AlertTitle>
                        <AlertDescription className="text-sm">
                          Your crops need attention. AI has detected 3 tasks that require your action today.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="farmer@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LockKeyhole className="h-4 w-4 text-gray-400" />
                          </div>
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "Hide" : "Show"}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Connecting to AI Farm System...
                          </>
                        ) : (
                          <>
                            {returningUser ? "Continue to AI Dashboard" : "Sign In to AI Farm System"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4 pt-0">
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center w-full">
                      Don't have an account yet?{" "}
                      <Button variant="link" className="p-0 h-auto text-green-600 dark:text-green-400" onClick={() => setAuthMode("signup")}>
                        Register your farm
                      </Button>
                    </div>
                    
                    <Button variant="outline" className="w-full" onClick={handleGuestAccess}>
                      <Bot className="mr-2 h-4 w-4" />
                      Try Demo Mode (Limited AI Features)
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Sign Up Content */}
              <TabsContent value="signup" className="mt-0">
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span>Register Your Farm for AI Optimization</span>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">FREE TRIAL</Badge>
                    </CardTitle>
                    <CardDescription>
                      Set up your farm profile and unlock the power of AI-driven agriculture
                    </CardDescription>
                    
                    {/* Signup Progress */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AI Farm System Setup: Stage {formStage} of 3</span>
                        <span className="text-green-600 dark:text-green-400">{signupProgress}%</span>
                      </div>
                      <Progress value={signupProgress} max={100} className="h-2">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      </Progress>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      {formStage === 1 && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="signup-email">Email</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input 
                                id="signup-email" 
                                type="email" 
                                placeholder="farmer@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                              />
                              {validationErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="signup-password">Password</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <LockKeyhole className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input 
                                id="signup-password" 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Create a strong password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`pl-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                              />
                              {validationErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                              )}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? "Hide" : "Show"}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {formStage === 2 && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="farm-location">Farm Location</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <MapPinIcon className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input 
                                id="farm-location" 
                                type="text" 
                                placeholder="e.g. Central Kenya" 
                                value={farmLocation}
                                onChange={(e) => setFarmLocation(e.target.value)}
                                className={`pl-10 ${validationErrors.farmLocation ? 'border-red-500' : ''}`}
                              />
                              {validationErrors.farmLocation && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.farmLocation}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="main-crop">Main Crop</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Leaf className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input 
                                id="main-crop" 
                                type="text" 
                                placeholder="e.g. Maize, Coffee, Rice" 
                                value={mainCrop}
                                onChange={(e) => setMainCrop(e.target.value)}
                                className={`pl-10 ${validationErrors.mainCrop ? 'border-red-500' : ''}`}
                              />
                              {validationErrors.mainCrop && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.mainCrop}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Farm Profile Suggestions */}
                          <div className="space-y-2 mt-4">
                            <Label>
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-green-500" />
                                AI-Suggested Farm Profiles
                              </div>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {farmProfiles.map((profile) => (
                                <Card 
                                  key={profile.id} 
                                  className={`cursor-pointer transition-all hover:border-green-500 hover:shadow-md ${
                                    farmLocation === profile.name ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
                                  }`}
                                  onClick={() => selectFarmProfile(profile)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="font-semibold text-sm flex items-center gap-1">
                                        <span>{profile.flag}</span> {profile.name}
                                      </div>
                                      {getWeatherIcon(profile.weather.condition)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Main crops: {profile.crops.join(", ")}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 rounded px-1.5 py-0.5 text-xs text-green-700 dark:text-green-400">
                                        <Percent className="h-3 w-3" />
                                        +{profile.yieldIncrease}% yield
                                      </div>
                                      <div className="flex items-center gap-1 text-xs">
                                        {getMarketTrendIndicator(profile.marketTrend.status)}
                                        {profile.marketTrend.status}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                          
                          {/* Crop Suggestions */}
                          <div className="space-y-2 mt-4">
                            <Label>
                              <div className="flex items-center gap-2">
                                <Sprout className="h-4 w-4 text-green-500" />
                                AI-Suggested Crops for Your Region
                              </div>
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              {cropSuggestions.map((crop) => (
                                <Card 
                                  key={crop.id} 
                                  className={`cursor-pointer transition-all hover:border-green-500 hover:shadow-md ${
                                    mainCrop === crop.name ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''
                                  }`}
                                  onClick={() => selectCrop(crop)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="text-lg">{crop.icon}</div>
                                      <div className="font-semibold text-sm">{crop.name}</div>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                      <Droplets className="h-3 w-3" /> 
                                      Water: {crop.waterNeeds}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 rounded px-1.5 py-0.5 text-xs text-blue-700 dark:text-blue-400">
                                        <BarChart4 className="h-3 w-3" />
                                        {crop.market.demand} demand
                                      </div>
                                      <div className={`flex items-center gap-1 text-xs ${
                                        crop.market.priceChange > 0 ? 'text-green-600' : 'text-red-500'
                                      }`}>
                                        {crop.market.priceChange > 0 ? '+' : ''}{crop.market.priceChange}%
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                      
                      {formStage === 3 && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="farm-size">Farm Size (Hectares/Acres)</Label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <MapPinIcon className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input 
                                id="farm-size" 
                                type="text" 
                                placeholder="e.g. 5 hectares" 
                                value={farmSize}
                                onChange={(e) => setFarmSize(e.target.value)}
                                className={`pl-10 ${validationErrors.farmSize ? 'border-red-500' : ''}`}
                              />
                              {validationErrors.farmSize && (
                                <p className="text-red-500 text-xs mt-1">{validationErrors.farmSize}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="farming-goals">Your Farming Goals (Optional)</Label>
                            <Textarea 
                              id="farming-goals" 
                              placeholder="Tell us what you want to achieve with your farm. AI will create a personalized plan." 
                              value={farmingGoals}
                              onChange={(e) => setFarmingGoals(e.target.value)}
                              rows={3}
                              className="resize-none"
                            />
                          </div>
                          
                          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30">
                            <BadgeCheck className="h-5 w-5 text-amber-600" />
                            <AlertTitle>AI Farm System Ready</AlertTitle>
                            <AlertDescription className="text-sm">
                              Your profile is ready for AI optimization. Activate now to get personalized recommendations and increase your yield by up to {predictedYield || 35}%.
                            </AlertDescription>
                          </Alert>
                        </>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Activating AI Farm System...
                          </>
                        ) : (
                          <>
                            {formStage === 3 ? (
                              <>Activate AI Farm System <Star className="ml-2 h-4 w-4" /></>
                            ) : (
                              <>Continue to Next Step <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* AI Testimonials */}
            {analyticsData && (
              <div className="mt-6">
                <Separator className="my-4" />
                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                    <BellRing className="h-4 w-4 text-emerald-500" />
                    Transforming African Agriculture with AI
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {analyticsData.farmsManaged.toLocaleString()}+
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Farms Managed</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        +{analyticsData.yieldIncrease}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Avg. Yield Increase</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {analyticsData.countries}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">African Countries</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Section - Preview of AI Features */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-emerald-500/90 to-green-600/90 p-8 text-white">
          <div className="h-full flex flex-col">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">CROPGenius AI Farm System</h2>
              <p className="text-emerald-100">
                Africa's most advanced agricultural AI system optimizing farms across the continent
              </p>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-600 rounded-full">
                    <CloudSun className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Weather Intelligence</h3>
                    <p className="text-sm text-emerald-100">Hyperlocal farm-specific weather predictions</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded p-3 flex items-center gap-3">
                    <ThermometerSun className="h-5 w-5 text-amber-300" />
                    <div className="text-sm">
                      <p className="font-medium">Heat wave predicted in 3 days</p>
                      <p className="text-xs text-emerald-100">AI recommends protective irrigation schedule</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded p-3 flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-blue-300" />
                    <div className="text-sm">
                      <p className="font-medium">45% chance of rain in 48 hours</p>
                      <p className="text-xs text-emerald-100">AI will notify you when to adjust irrigation</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-600 rounded-full">
                    <BarChart4 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Market Intelligence</h3>
                    <p className="text-sm text-emerald-100">Real-time price tracking and optimal selling time</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded p-3 flex items-center gap-3">
                    <ArrowRight className="h-5 w-5 text-green-300" />
                    <div className="text-sm">
                      <p className="font-medium">Maize prices rising 6.3% this week</p>
                      <p className="text-xs text-emerald-100">AI recommends holding for 7 more days</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded p-3 flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-blue-300" />
                    <div className="text-sm">
                      <p className="font-medium">3 new buyers in your region</p>
                      <p className="text-xs text-emerald-100">AI has matched them with your crop profile</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-600 rounded-full">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Crop Management</h3>
                    <p className="text-sm text-emerald-100">Precision farming with AI-optimized schedules</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 rounded p-3 flex items-center gap-3">
                    <Bot className="h-5 w-5 text-purple-300" />
                    <div className="text-sm">
                      <p className="font-medium">Disease predicted 9 days before symptoms</p>
                      <p className="text-xs text-emerald-100">AI provides early treatment plan</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded p-3 flex items-center gap-3">
                    <Tractor className="h-5 w-5 text-amber-300" />
                    <div className="text-sm">
                      <p className="font-medium">Custom planting schedule created</p>
                      <p className="text-xs text-emerald-100">AI optimized for your soil and climate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-emerald-100">
                {currentDate} • Africa's #1 AI-Powered Farming Intelligence System
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}

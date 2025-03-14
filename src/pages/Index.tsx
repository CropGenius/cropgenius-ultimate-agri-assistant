
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
import { Leaf, CloudSun, BarChart4, ShoppingCart, MessageSquareText, AlertTriangle, Users, Gift, Award } from "lucide-react";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

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
        },
        () => {
          // Failed to get location
          setLocation(null);
        }
      );
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
                <Button size="lg" onClick={() => navigate("/auth")} className="relative group overflow-hidden">
                  <span className="relative z-10">Login / Sign Up</span>
                  <div className="absolute inset-0 bg-green-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/scan")} className="group">
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
          <div className="lg:col-span-2">
            <CropScannerPreview />
          </div>
          <div>
            <WeatherPreview />
          </div>
        </div>

        {/* AI-Powered Premium Features - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-1">
            <TodaysFarmPlan />
          </div>
          <div className="lg:col-span-1">
            <MarketPreview />
          </div>
          <div className="lg:col-span-1">
            <AIChatPreview />
          </div>
        </div>

        {/* Feature Links Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 text-center">All CropGenius Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresData.map((feature, index) => (
              <FeatureLink key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

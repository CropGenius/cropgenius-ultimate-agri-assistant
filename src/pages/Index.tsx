
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { ArrowUpRight, Leaf, CloudSun, BarChart4, ShoppingCart, MessageSquareText, AlertTriangle, Users, Gift, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface FeatureLinkProps {
  to: string;
  icon: JSX.Element;
  title: string;
  description: string;
}

const FeatureLink = ({ to, icon, title, description }: FeatureLinkProps) => (
  <Link to={to} className="block">
    <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
      <CardContent className="pt-6">
        <div className="mb-4 text-primary">{icon}</div>
        <h3 className="text-xl font-medium mb-2 flex items-center gap-2">
          {title} <ArrowUpRight className="h-4 w-4" />
        </h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

export default function Index() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
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
      title: "Scan Crop",
      description: "Identify diseases and get instant treatment recommendations",
    },
    {
      to: "/weather",
      icon: <CloudSun className="h-8 w-8" />,
      title: "Weather",
      description: "Get hyperlocal forecasts and smart farming advisories",
    },
    {
      to: "/farm-plan",
      icon: <BarChart4 className="h-8 w-8" />,
      title: "Farm Plan",
      description: "AI-generated plans optimized for your farm conditions",
    },
    {
      to: "/market",
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Market",
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
      title: "Alerts",
      description: "Receive timely alerts for weather, pests, and market changes",
    },
    {
      to: "/community",
      icon: <Users className="h-8 w-8" />,
      title: "Community",
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
      title: "Challenges",
      description: "Complete farming challenges to unlock rewards",
    },
  ];

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            AI-Powered Farming Assistant
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Increase yields, prevent diseases, and maximize profits with real-time AI insights
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {loading ? (
              <Button disabled>
                <span className="animate-pulse">Loading...</span>
              </Button>
            ) : user ? (
              <Button size="lg" onClick={() => navigate("/scan")}>
                Start Scanning Your Crops
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate("/auth")}>
                  Login / Sign Up
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/scan")}>
                  Try Without Account
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresData.map((feature, index) => (
            <FeatureLink key={index} {...feature} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

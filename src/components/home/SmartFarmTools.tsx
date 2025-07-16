
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Leaf, 
  CloudSun, 
  BarChart4, 
  MessageSquare, 
  AlertTriangle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext as useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';

// Helper function to get time-appropriate greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

// Helper function to get weather description based on time and random conditions
const getWeatherDescription = () => {
  const descriptions = [
    "Clear skies today—perfect for fieldwork.",
    "Mild temperatures—ideal for crop inspection.",
    "Light breeze—good day for spraying.",
    "Partly cloudy—great day for harvesting.",
    "Sunny conditions—monitor irrigation needs."
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// Component for each tool card
interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  actionText: string;
  color: string;
  delay: number;
}

const ToolCard = ({ title, description, icon, link, actionText, color, delay }: ToolCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100 + delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.info("AI Farm Intelligence Ready", {
        description: "Create your free account to access personalized AI insights",
        action: {
          label: "Start Now",
          onClick: () => navigate("/auth")
        },
        icon: <Zap className="h-5 w-5 text-amber-500" />,
        duration: 5000
      });
      
      // After showing toast, give user option to continue or sign up
      navigate("/auth", { state: { returnTo: link } });
    }
  };
  
  return (
    <Link to={link} onClick={handleClick}>
      <Card className={cn(
        "mb-3 overflow-hidden border shadow-md hover:shadow-lg transition-all duration-300",
        "transform hover:-translate-y-1",
        "opacity-0 translate-y-4",
        isVisible && "opacity-100 translate-y-0 transition-all duration-500 ease-out"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>
              {icon}
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">{title}</h3>
              <p className="text-muted-foreground text-sm mb-2">{description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary flex items-center">
                  {actionText} <Zap className="h-3.5 w-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// Alert ticker item component
interface AlertTickerItemProps {
  message: string;
  type: 'success' | 'warning' | 'info';
  icon?: React.ReactNode;
}

const AlertTickerItem = ({ message, type, icon }: AlertTickerItemProps) => {
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    }
  };
  
  return (
    <div className={`flex-shrink-0 rounded-full py-1.5 px-3 mr-2 flex items-center ${getBgColor()}`}>
      {icon && <span className="mr-1.5">{icon}</span>}
      <span className="text-xs font-medium whitespace-nowrap">{message}</span>
    </div>
  );
};

// Main component
const SmartFarmTools = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer';
  const greeting = getGreeting();
  const weatherDesc = getWeatherDescription();
  
  // Sample alerts for the ticker
  const alerts = [
    { 
      message: 'Maize prices up 12% this week', 
      type: 'success' as const,
      icon: <BarChart4 className="h-3.5 w-3.5" />
    },
    { 
      message: 'Heavy rain expected in 3 hrs', 
      type: 'warning' as const,
      icon: <AlertTriangle className="h-3.5 w-3.5" />
    },
    { 
      message: 'Best time to harvest: 2 days', 
      type: 'info' as const,
      icon: <Zap className="h-3.5 w-3.5" />
    },
    { 
      message: 'Possible leaf rust detected in Field 3', 
      type: 'warning' as const,
      icon: <Leaf className="h-3.5 w-3.5" /> 
    }
  ];

  const tools = [
    {
      title: 'Scan & Protect Crops',
      description: 'Instantly identify diseases & get AI treatment plans',
      icon: <Leaf className="h-6 w-6 text-white" />,
      link: '/scan',
      actionText: 'Scan now',
      color: 'bg-emerald-500',
      delay: 0
    },
    {
      title: 'Weather Intelligence',
      description: 'Farm-specific forecasts with action recommendations',
      icon: <CloudSun className="h-6 w-6 text-white" />,
      link: '/weather',
      actionText: 'View forecast',
      color: 'bg-blue-500',
      delay: 100
    },
    {
      title: 'Market Maximizer',
      description: 'Know exactly when to sell for maximum profit',
      icon: <BarChart4 className="h-6 w-6 text-white" />,
      link: '/market',
      actionText: 'Check prices',
      color: 'bg-purple-500',
      delay: 200
    },
    {
      title: 'Expert AI Assistant',
      description: 'Get instant answers to any farming question',
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      link: '/chat',
      actionText: 'Ask now',
      color: 'bg-amber-500',
      delay: 300
    }
  ];
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Personalized Banner */}
      <div className="bg-gradient-to-r from-primary/80 to-primary rounded-xl p-4 text-white shadow-md mb-4">
        <h2 className="text-xl font-bold">
          {greeting}, {userName}.
        </h2>
        <p className="text-primary-foreground/90">
          {weatherDesc}
        </p>
      </div>
      
      {/* Tool Cards */}
      <div>
        <h2 className="text-lg font-bold mb-3">Smart Farm Tools</h2>
        <div className="space-y-3">
          {tools.map((tool, index) => (
            <ToolCard
              key={index}
              {...tool}
            />
          ))}
        </div>
      </div>
      
      {/* Real-time Alerts Ticker */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          REAL-TIME FARM UPDATES
        </h3>
        <div className="overflow-x-auto pb-3 mask-gradient-right">
          <div className="flex animate-scroll-slow py-1">
            {alerts.map((alert, index) => (
              <AlertTickerItem
                key={index}
                message={alert.message}
                type={alert.type}
                icon={alert.icon}
              />
            ))}
            {/* Duplicate alerts for continuous scrolling effect */}
            {alerts.map((alert, index) => (
              <AlertTickerItem
                key={`dup-${index}`}
                message={alert.message}
                type={alert.type}
                icon={alert.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFarmTools;


import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  User, CloudSun, CloudRain, Sun, CloudLightning, Snowflake, Circle, 
  TrendingUp, TrendingDown, ArrowUp, ArrowDown, Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { isOnline } from '@/utils/isOnline';
import { cn } from '@/lib/utils';
import { addOnlineStatusListener } from '@/utils/isOnline';

interface PowerHeaderProps {
  location?: string;
  temperature?: number;
  weatherCondition?: string;
  farmScore?: number;
  synced?: boolean;
}

export default function PowerHeader({ 
  location = 'Detecting location...',
  temperature = 0,
  weatherCondition = 'checking...',
  farmScore = 0,
  synced = false
}: PowerHeaderProps) {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const [currentStatus, setCurrentStatus] = useState(synced ? 'All fields synced' : 'Syncing...');
  const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());
  const [farmValue, setFarmValue] = useState({value: 125300, change: 8200});
  const [farmScoreChange, setFarmScoreChange] = useState(6);
  const [aiTip, setAiTip] = useState('Rain in 2 days. Sell maize before prices drop.');
  const [isAiTipVisible, setIsAiTipVisible] = useState(false);
  
  useEffect(() => {
    // Set fixed greeting to prevent flashing
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
    
    // Get user profile if logged in
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setUserName(data.full_name || user.email?.split('@')[0] || 'Chief');
        } else {
          setUserName(user.email?.split('@')[0] || 'Chief');
        }
      };
      
      fetchProfile();
    }
    
    // Listen for online/offline status changes
    const cleanup = addOnlineStatusListener(setIsOnlineStatus);
    
    // Show AI tip immediately (no delay)
    setIsAiTipVisible(true);
    
    return () => {
      cleanup();
      // No more timer to clear
    };
  }, [user]);
  
  // Update status based on sync and online state
  useEffect(() => {
    if (!isOnlineStatus) {
      setCurrentStatus('Offline mode');
    } else if (synced) {
      setCurrentStatus('All fields synced');
    } else {
      setCurrentStatus('Syncing fields...');
    }
  }, [synced, isOnlineStatus]);
  
  // Get weather icon based on condition
  const getWeatherIcon = () => {
    const condition = weatherCondition.toLowerCase();
    
    if (condition.includes('rain')) {
      return <CloudRain className="h-5 w-5 text-blue-500" />;
    } else if (condition.includes('sun') || condition.includes('clear')) {
      return <Sun className="h-5 w-5 text-yellow-500" />;
    } else if (condition.includes('cloud')) {
      return <CloudSun className="h-5 w-5 text-gray-500" />;
    } else if (condition.includes('storm') || condition.includes('thunder')) {
      return <CloudLightning className="h-5 w-5 text-purple-500" />;
    } else if (condition.includes('snow')) {
      return <Snowflake className="h-5 w-5 text-blue-300" />;
    }
    
    return <CloudSun className="h-5 w-5 text-gray-500" />;
  };

  const getFarmScoreColor = (score: number) => {
    if (score > 70) return "text-green-500 bg-green-500/10";
    if (score > 50) return "text-amber-500 bg-amber-500/10";
    return "text-red-500 bg-red-500/10";
  };

  const getScoreTrendIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="h-3 w-3 text-green-500" /> : 
      <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Subtle parallax background - would be a video in production */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent opacity-20 z-0"></div>
      
      <div className="p-4 pb-2 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold flex items-center">
              <span className="mr-1">{greeting},</span>
              <span className="text-primary font-bold animate-fade-in">{userName}.</span>
            </h1>
            
            <p className="text-sm text-muted-foreground mt-1">
              Let's grow your wealth today.
            </p>
            
            <div className="flex items-center mt-3 gap-3">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-lg font-bold">₦{farmValue.value.toLocaleString()}</span>
                  <span className={`ml-1 text-xs flex items-center ${farmValue.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {farmValue.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    ₦{Math.abs(farmValue.change).toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Today's Farm Value</span>
              </div>
              
              <Badge 
                className={cn(
                  "font-medium flex items-center gap-1 py-1.5 animate-pulse", 
                  getFarmScoreColor(farmScore)
                )}
              >
                Farm Score: {farmScore}%
                <span className="text-xs flex items-center">
                  {farmScoreChange >= 0 ? "↑" : "↓"} {Math.abs(farmScoreChange)}%
                </span>
              </Badge>
            </div>
            
            {/* AI Chat Tip */}
            {isAiTipVisible && (
              <div className="mt-3 bg-primary/10 p-2 rounded-lg border border-primary/20 flex items-start gap-2">
                <div className="bg-primary/20 rounded-full p-1 mt-0.5">
                  <Star className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium">CropGenius Tip:</p>
                  <p className="text-xs">{aiTip}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center mt-3 gap-2">
              <div className="flex items-center text-sm text-muted-foreground">
                {getWeatherIcon()}
                <span className="ml-1">
                  {location} — {temperature > 0 ? `${temperature}°C` : ''} {weatherCondition}
                </span>
              </div>
              
              <span className="text-xs text-muted-foreground flex items-center ml-auto">
                <Circle className={`h-2 w-2 mr-1 ${isOnlineStatus ? 'text-green-500' : 'text-orange-500'} fill-current`} />
                {currentStatus}
              </span>
            </div>
          </div>
          
          <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
            <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, CloudSun, CloudRain, Sun, CloudLightning, Snowflake, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { isOnline, addOnlineStatusListener } from '@/utils/isOnline';

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
  
  useEffect(() => {
    // Set greeting based on time of day
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
    
    return () => {
      cleanup();
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

  return (
    <div className="p-4 pb-2">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">
            {greeting}, <span className="text-primary">{userName}</span>.
          </h1>
          
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            {getWeatherIcon()}
            <span className="ml-1">
              {location} — {temperature > 0 ? `${temperature}°C` : ''} {weatherCondition}
            </span>
          </div>
          
          <div className="flex items-center mt-3 gap-2">
            <Badge variant={farmScore > 70 ? "success" : farmScore > 50 ? "warning" : "destructive"} className="font-medium">
              Farm Health: {farmScore}%
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center">
              <Circle className={`h-2 w-2 mr-1 ${isOnlineStatus ? 'text-green-500' : 'text-orange-500'} fill-current`} />
              {currentStatus}
            </span>
          </div>
        </div>
        
        <Avatar className="h-12 w-12 border-2 border-primary/20">
          <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={userName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

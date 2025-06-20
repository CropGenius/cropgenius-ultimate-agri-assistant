import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabaseClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { isOnline, addOnlineStatusListener } from "@/utils/isOnline";
import { reverseGeocode } from '@/utils/location';
import { fetchJSON } from '@/utils/network';
import { RefreshCcw } from 'lucide-react';

// Import our new components
import PowerHeader from "@/components/dashboard/PowerHeader";
import MissionControl from "@/components/dashboard/MissionControl";
import FieldIntelligence from "@/components/dashboard/FieldIntelligence";
import MoneyZone from "@/components/dashboard/MoneyZone";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memory } = useMemoryStore();
  
  // Fallback actions when no tasks are available or on error
  const FALLBACK_ACTIONS = [
    {
      id: 'fallback-1',
      title: 'Water Field A — Moisture 17%',
      description: 'Low soil moisture detected. Irrigation recommended today.',
      type: 'water',
      urgent: true
    },
    {
      id: 'fallback-2',
      title: 'Harvest Alert — Maize ready in 2 fields',
      description: 'Optimal harvest window in the next 5 days.',
      type: 'harvest',
      urgent: false
    },
    {
      id: 'fallback-3', 
      title: 'Crop Prices: Beans up +11% this week',
      description: 'Good time to sell. Local markets showing high demand.',
      type: 'market',
      urgent: false
    }
  ];
  
  // Prevent loading screens by setting loading to false by default
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [weatherInfo, setWeatherInfo] = useState({
    location: "Detecting location...",
    temperature: 0,
    condition: "checking..."
  });
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [farmScore, setFarmScore] = useState<number>(68);
  const [allSynced, setAllSynced] = useState<boolean>(true);
  
  // Mission Control: Genius actions
  const [actions, setActions] = useState<any[]>([]);
  const [actionsLoading, setActionsLoading] = useState(true);
  
  // Safety timeout to prevent infinite loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (actionsLoading) {
        console.log('Safety timeout: Resetting actionsLoading state');
        setActionsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [actionsLoading]);
  
  // Field Intelligence: Fields data
  const [fields, setFields] = useState<any[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);

  useEffect(() => {
    // Ensure component is never in a loading state
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check for user session and load data
    const loadData = async () => {
      try {
        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
              
              // Generate simulated location and weather based on coordinates
              setRealLocationAndWeather(position.coords.latitude, position.coords.longitude);
            },
            () => {
              // Failed to get location, use random location for demo
              setRealLocationAndWeather(null, null);
            }
          );
        } else {
          // Use random location for demo if geolocation not available
          setRealLocationAndWeather(null, null);
        }
        
        if (user) {
          // Load user's fields
          await loadUserFields();
          
          // Load genius actions
          await loadGeniusActions();
          
          // Load farm score data
          await loadFarmScore();
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, [user]);
  
  // Load user's fields from Supabase or localStorage
  const loadUserFields = async () => {
    setFieldsLoading(true);
    
    try {
      if (!user) return;
      
      let fieldsData = [];
      
      if (isOnline()) {
        // Get fields from Supabase
        const { data, error } = await supabase
          .from('fields')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        fieldsData = data || [];
        
        // Save to localStorage for offline use
        localStorage.setItem('user_fields', JSON.stringify(fieldsData));
      } else {
        // Get fields from localStorage
        const storedFields = localStorage.getItem('user_fields');
        fieldsData = storedFields ? JSON.parse(storedFields) : [];
      }
      
      // Transform field data for display
      const displayFields = fieldsData.map((field: any) => ({
        id: field.id,
        name: field.name,
        size: field.size || 0,
        size_unit: field.size_unit || 'hectares',
        crop: 'Maize', // Would come from field_crops table in a real app
        health: Math.random() > 0.7 ? 'warning' : Math.random() > 0.9 ? 'danger' : 'good',
        lastRain: '2 days ago', // Would come from weather_data in a real app
        moistureLevel: Math.floor(Math.random() * 30) + 10,
      }));
      
      setFields(displayFields);
    } catch (err) {
      console.error("Error loading fields:", err);
      // Try to load from localStorage as fallback
      const storedFields = localStorage.getItem('user_fields');
      if (storedFields) {
        setFields(JSON.parse(storedFields));
      }
    } finally {
      setFieldsLoading(false);
    }
  };
  
  // Load genius actions (personalized recommendations)
  const loadGeniusActions = async () => {
    setActionsLoading(true);
    
    try {
      if (!user) {
        setActions([]);
        return;
      }

      // First check if any tasks exist
      const { count, error: countError } = await supabase
        .from('farm_tasks')
        .select('id', { count: 'exact', head: true });

      // If no tasks exist, create a default task for testing
      if (count === 0 || countError) {
        console.log('No tasks found, creating default task');
        
        // First get a farm plan to associate with the task
        const { data: plans } = await supabase
          .from('farm_plans')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
          
        if (plans && plans.length > 0) {
          // Create a default task
          await supabase.from('farm_tasks').insert({
            plan_id: plans[0].id,
            title: 'Water Field A — Moisture 17%',
            description: 'Low soil moisture detected. Irrigation recommended today.',
            priority: 'high',
            status: 'pending',
            due_date: new Date().toISOString().split('T')[0],
            ai_recommended: true
          });
        }
      }

      const { data, error } = await supabase
        .from('farm_tasks')
        .select('id,title,description,priority,status')
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true })
        .limit(20);

      if (error) throw error;

      const parsedActions = (data || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || 'No description',
        type: t.priority === 'high' ? 'alert' : t.title.toLowerCase().includes('harvest') ? 'harvest' : t.title.toLowerCase().includes('water') ? 'water' : 'market',
        urgent: t.priority === 'high',
      }));

      // If no tasks found, add fallback tasks
      if (parsedActions.length === 0) {
        setActions(FALLBACK_ACTIONS);
      } else {
        setActions(parsedActions);
      }
    } catch (err) {
      console.error("Error loading genius actions:", err);
      // Provide fallback actions on error
      setActions(FALLBACK_ACTIONS);
    } finally {
      setActionsLoading(false);
    }
  };
  
  // Load farm health score
  const loadFarmScore = async () => {
    try {
      // In a real app, this would come from an AI model or analytics service
      // Generate a score between 50 and 95 for now
      const randomScore = Math.floor(Math.random() * 45) + 50;
      setFarmScore(randomScore);
      
      // Check if all fields are synced
      setAllSynced(Math.random() > 0.2);
    } catch (err) {
      console.error("Error loading farm score:", err);
    }
  };
  
  // === REAL location + weather ===
  const setRealLocationAndWeather = async (lat: number | null, lng: number | null) => {
    try {
      if (lat == null || lng == null) {
        // fallback random African city if coords unavailable
        const fallback = [
          { name: 'Nairobi, Kenya', lat: -1.286389, lng: 36.817223 },
          { name: 'Lagos, Nigeria', lat: 6.524379, lng: 3.379206 },
          { name: 'Accra, Ghana', lat: 5.603717, lng: -0.186964 },
          { name: 'Dar es Salaam, Tanzania', lat: -6.792354, lng: 39.208328 },
        ];
        const city = fallback[Math.floor(Math.random() * fallback.length)];
        setWeatherInfo({ location: city.name, temperature: 0, condition: 'Unknown' });
        setDetectedLocation(city.name);
        return;
      }
      // 1. Reverse geocode
      const placeName = await reverseGeocode({ lat, lng });
      setDetectedLocation(placeName);

      // 2. Fetch current weather via OpenWeather (with fallback)
      const openWeatherKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
      
      if (!openWeatherKey) {
        console.warn('[Weather] OPENWEATHERMAP key missing; using simulated weather data');
        // Generate realistic weather data for demo
        const temps = [18, 22, 25, 28, 30, 32, 35];
        const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'partly cloudy', 'light rain'];
        
        setWeatherInfo({ 
          location: placeName, 
          temperature: temps[Math.floor(Math.random() * temps.length)], 
          condition: conditions[Math.floor(Math.random() * conditions.length)]
        });
        return;
      }

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${openWeatherKey}`;
      const w = await fetchJSON<{ main: { temp: number }; weather: Array<{ description: string }> }>(weatherUrl);
      setWeatherInfo({
        location: placeName,
        temperature: Math.round(w.main.temp),
        condition: w.weather?.[0]?.description ?? 'Clear',
      });
    } catch (err) {
      console.error('[Index] setRealLocationAndWeather failed', err);
      // Fallback to simulated data on error
      const temps = [20, 25, 30];
      const conditions = ['partly cloudy', 'sunny', 'clear'];
      
      setWeatherInfo({
        location: detectedLocation || 'Your Location',
        temperature: temps[Math.floor(Math.random() * temps.length)],
        condition: conditions[Math.floor(Math.random() * conditions.length)]
      });
    }
  };

  // Show Pro upgrade modal
  const handleShowProUpgrade = () => {
    toast.info("CropGenius Pro Features", {
      description: "Get AI predictions, market insights and weather alerts",
      action: {
        label: "Learn More",
        onClick: () => navigate("/referrals")
      },
      duration: 5000
    });
    
    navigate("/referrals");
  };

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      if (!user) return;
      
      // Update task status in Supabase
      const { error } = await supabase
        .from('farm_tasks')
        .update({ status: 'completed' })
        .eq('id', taskId);
      
      if (error) throw error;
      
      // Update local state
      setActions(prev => prev.filter(task => task.id !== taskId));
      
      // Show success message
      toast.success('Task completed!', {
        description: 'Your farm task has been marked as complete.'
      });
    } catch (err) {
      console.error('Error completing task:', err);
      toast.error('Failed to complete task', {
        description: 'Please try again later.'
      });
    }
  };

  return (
    <Layout>
      {/* POWER HEADER */}
      <PowerHeader 
        location={weatherInfo.location}
        temperature={weatherInfo.temperature}
        weatherCondition={weatherInfo.condition}
        farmScore={farmScore}
        synced={allSynced}
      />
      
      {/* MISSION CONTROL */}
      <div className="px-4 py-2">
        <h2 className="text-xl font-semibold mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
              <RefreshCcw size={18} />
            </span>
            Mission Control
          </div>
          <button 
            onClick={() => {
              setActionsLoading(true);
              loadGeniusActions();
            }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <RefreshCcw size={14} />
            <span>Refresh</span>
          </button>
        </h2>
        <MissionControl
          title="🧠 Today's Genius Actions"
          actions={actions}
          loading={actionsLoading}
          onComplete={handleCompleteTask}
        />
      </div>
      
      {/* FIELD INTELLIGENCE */}
      <FieldIntelligence 
        fields={fields}
        loading={fieldsLoading}
      />
      
      {/* MONEY ZONE */}
      <MoneyZone 
        onUpgrade={handleShowProUpgrade}
      />
    </Layout>
  );
}

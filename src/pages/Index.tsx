import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { isOnline, addOnlineStatusListener } from "@/utils/isOnline";
import { reverseGeocode } from '@/utils/location';
import { fetchJSON } from '@/utils/network';

// Import our new components
import PowerHeader from "@/components/dashboard/PowerHeader";
import MissionControl from "@/components/dashboard/MissionControl";
import FieldIntelligence from "@/components/dashboard/FieldIntelligence";
import MoneyZone from "@/components/dashboard/MoneyZone";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memory } = useMemoryStore();
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

      setActions(parsedActions);
    } catch (err) {
      console.error("Error loading genius actions:", err);
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

      // 2. Fetch current weather via OpenWeather
      if (!import.meta.env.VITE_OPENWEATHERMAP_API_KEY) {
        console.warn('[Weather] OPENWEATHERMAP key missing; using placeholder temp');
        setWeatherInfo({ location: placeName, temperature: 0, condition: 'Unknown' });
        return;
      }

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${import.meta.env.VITE_OPENWEATHERMAP_API_KEY}`;
      const w = await fetchJSON<{ main: { temp: number }; weather: Array<{ description: string }> }>(weatherUrl);
      setWeatherInfo({
        location: placeName,
        temperature: Math.round(w.main.temp),
        condition: w.weather?.[0]?.description ?? 'Clear',
      });
    } catch (err) {
      console.error('[Index] setRealLocationAndWeather failed', err);
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
      <MissionControl 
        actions={actions}
        loading={actionsLoading}
      />
      
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

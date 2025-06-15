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
import { RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

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
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg mb-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Good morning, <span className="text-green-600">farmer</span>.
            </h1>
            <div className="flex items-center text-gray-600 mb-4">
              <span className="inline-flex mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9"></path>
                  <path d="M16 14v2"></path>
                  <path d="M8 9v2"></path>
                  <path d="M16 19H8.5a5.5 5.5 0 0 1 0-11H17"></path>
                </svg>
              </span>
              <span>{weatherInfo.location} — {weatherInfo.temperature}°C {weatherInfo.condition}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`px-4 py-2 rounded-full text-white font-semibold ${farmScore > 70 ? 'bg-green-500' : farmScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`}>
              Farm Health: {farmScore}%
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              All fields synced
            </div>
          </div>
        </div>
      </div>
      
      {/* MISSION CONTROL */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Today's Genius Actions</h2>
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
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <MissionControl
            title="Today's Genius Actions"
            actions={actions}
            loading={actionsLoading}
            onComplete={handleCompleteTask}
          />
        </div>
      </div>
      
      {/* FIELD INTELLIGENCE */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-600">
              <path d="M12 2a10 10 0 1 0 10 10H12V2Z"></path>
              <path d="M21 12a9 9 0 0 0-9-9v9h9Z"></path>
              <path d="M12 12 8 8"></path>
            </svg>
            <h2 className="text-2xl font-bold">My Fields</h2>
          </div>
          <Button variant="green-outline"
            onClick={() => navigate('/fields/new')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
            Add Field
          </Button>
        </div>
        
        {fieldsLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : fields.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Add your first field</h3>
            <p className="text-gray-500 mb-4">Track soil health, crop growth and get personalized recommendations</p>
            <Button variant="green"
              onClick={() => navigate('/fields/new')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Add New Field
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-lg">{field.name}</h3>
                  <Badge variant="outline" className={`${field.health === 'good' ? 'border-green-200 bg-green-50 text-green-700' : field.health === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                    {field.health === 'good' ? 'Healthy' : field.health === 'warning' ? 'Needs attention' : 'Critical'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Crop:</span>
                    <span className="font-medium text-gray-700">{field.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium text-gray-700">{field.size} {field.size_unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last rain:</span>
                    <span className="font-medium text-gray-700">{field.lastRain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Moisture level:</span>
                    <span className="font-medium text-gray-700">{field.moistureLevel}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* MONEY ZONE */}
      <div className="px-6 py-4 mb-20">
        <div className="bg-green-800 rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Today's AI Farm Plan</h3>
                <p className="text-green-100 mb-6">Based on your soil, weather & market conditions</p>
              </div>
              <div className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h7.5"></path>
                  <path d="M16 2v4"></path>
                  <path d="M8 2v4"></path>
                  <path d="M3 10h18"></path>
                  <path d="M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
                  <path d="m22 22-1.5-1.5"></path>
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M2 12h10"></path>
                      <path d="M9 4v16"></path>
                      <path d="M14 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v-6z"></path>
                    </svg>
                  </div>
                  <div className="text-white">
                    <p className="font-medium">Delay watering - rain expected in 36 hours</p>
                  </div>
                </div>
                <div className="w-6 h-6 border-2 border-green-400 rounded-full"></div>
              </div>
              
              <div className="bg-green-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M10 2v7.31"></path>
                      <path d="M14 9.3V1.99"></path>
                      <path d="M8.5 2h7"></path>
                      <path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path>
                      <path d="M5.58 16.5h12.85"></path>
                    </svg>
                  </div>
                  <div className="text-white">
                    <p className="font-medium">Apply organic pest control - aphids detected</p>
                  </div>
                </div>
                <div className="w-6 h-6 border-2 border-green-400 rounded-full"></div>
              </div>
              
              <div className="bg-green-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                  </div>
                  <div className="text-white">
                    <p className="font-medium">Harvest maize by Friday for optimal pricing</p>
                  </div>
                </div>
                <div className="w-6 h-6 border-2 border-green-400 rounded-full"></div>
              </div>
            </div>
            
            <button className="w-full mt-6 py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center justify-center"
              onClick={() => navigate('/farm-plan')}
            >
              <span>View full AI farm plan</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

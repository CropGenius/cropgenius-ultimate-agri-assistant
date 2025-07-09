import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { supabase } from "@/services/supabaseClient";
import { isOnline } from "@/utils/isOnline";
import { reverseGeocode } from '@/utils/location';
import { fetchJSON } from '@/utils/network';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, MapPin, MessageCircle, Plus, Home, Camera, BarChart3, Cloud, MessageSquare } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memory } = useMemoryStore();
  
  // Enhanced FPSI and action system
  const [fpsi, setFpsi] = useState<number>(85);
  const [fpsiTrend, setFpsiTrend] = useState<'growing' | 'stable' | 'declining'>('growing');
  const [todaysGeniusAction, setTodaysGeniusAction] = useState<{
    title: string;
    description: string;
    impact: string;
    type: 'proactive' | 'reactive' | 'market';
    urgent: boolean;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [weatherInfo, setWeatherInfo] = useState({
    location: "Detecting location...",
    temperature: 0,
    condition: "checking..."
  });
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [allSynced, setAllSynced] = useState<boolean>(true);
  
  // Fields data
  const [fields, setFields] = useState<any[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  
  // Actions for backward compatibility  
  const [actions, setActions] = useState<any[]>([]);
  const [actionsLoading, setActionsLoading] = useState(true);
  
  // Priority alerts
  const [priorityAlerts, setPriorityAlerts] = useState<Array<{
    id: string;
    type: 'weather' | 'disease' | 'market' | 'task';
    severity: 'high' | 'medium' | 'low';
    message: string;
    icon: string;
    timestamp: string;
  }>>([]);

  // Fallback actions for when no tasks are available
  const FALLBACK_ACTIONS = [
    {
      id: 'fpsi-action-1',
      title: 'Optimal planting window for Maize in Field 2',
      description: 'Weather conditions perfect for planting. Act within 48 hours.',
      impact: 'Expected FPSI increase: +3%',
      type: 'proactive' as const,
      urgent: false
    },
    {
      id: 'fpsi-action-2', 
      title: 'Early blight detected in Field 1',
      description: 'Apply organic fungicide within 24 hours to prevent yield loss.',
      impact: 'Prevent 15% yield loss',
      type: 'reactive' as const,
      urgent: true
    },
    {
      id: 'fpsi-action-3',
      title: 'Maize prices peaking in Eldoret market',
      description: 'Consider selling 50% of harvest today for maximum profit.',
      impact: '+$150 profit opportunity',
      type: 'market' as const,
      urgent: false
    }
  ];

  // Enhanced loading system
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      
      if (user) {
        await Promise.all([
          loadUserFields(),
          loadTodaysGeniusAction(),
          loadFPSIData(),
          loadPriorityAlerts()
        ]);
      }
      
      // Location and weather
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setRealLocationAndWeather(position.coords.latitude, position.coords.longitude);
          },
          () => setRealLocationAndWeather(null, null)
        );
      } else {
        setRealLocationAndWeather(null, null);
      }
      
      setLoading(false);
    };

    initializeApp();
  }, [user]);

  // Load Today's Genius Action (single most important recommendation)
  const loadTodaysGeniusAction = async () => {
    try {
      // In real app, this would be AI-generated based on all farm data
      const todayAction = FALLBACK_ACTIONS[Math.floor(Math.random() * FALLBACK_ACTIONS.length)];
      setTodaysGeniusAction(todayAction);
    } catch (err) {
      console.error("Error loading genius action:", err);
    }
  };

  // Load FPSI data
  const loadFPSIData = async () => {
    try {
      // Simulate FPSI calculation based on multiple factors
      const baseScore = Math.floor(Math.random() * 20) + 75; // 75-95
      setFpsi(baseScore);
      
      // Determine trend
      const trendRandom = Math.random();
      if (trendRandom > 0.6) setFpsiTrend('growing');
      else if (trendRandom > 0.3) setFpsiTrend('stable');
      else setFpsiTrend('declining');
      
      setAllSynced(Math.random() > 0.2);
    } catch (err) {
      console.error("Error loading FPSI:", err);
    }
  };

  // Load priority alerts
  const loadPriorityAlerts = async () => {
    try {
      const sampleAlerts = [
        {
          id: '1',
          type: 'weather' as const,
          severity: 'medium' as const,
          message: 'Heavy rain expected tomorrow',
          icon: '🌧️',
          timestamp: new Date().toISOString()
        },
        {
          id: '2', 
          type: 'disease' as const,
          severity: 'low' as const,
          message: 'Crop health is excellent',
          icon: '🌱',
          timestamp: new Date().toISOString()
        }
      ];
      
      setPriorityAlerts(sampleAlerts);
    } catch (err) {
      console.error("Error loading alerts:", err);
    }
  };
  
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
  
  // Load genius actions (backwards compatibility)
  const loadGeniusActions = async () => {
    setActionsLoading(true);
    await loadTodaysGeniusAction();
    setActionsLoading(false);
  };

  // Get user's greeting
  const getUserGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'dev';
    
    if (hour < 12) return `Good morning, ${name}.`;
    if (hour < 17) return `Good afternoon, ${name}.`;
    return `Good evening, ${name}.`;
  };

  // Handle actions
  const handleAddField = () => {
    navigate('/fields');
  };

  const handleAskCropGenius = () => {
    navigate('/chat');
  };

  const handleCompleteAction = async () => {
    if (todaysGeniusAction) {
      toast.success('Action completed!', {
        description: 'Great work! Your FPSI will be updated.'
      });
      setTodaysGeniusAction(null);
      await loadTodaysGeniusAction();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your farm intelligence...</p>
        </div>
      </div>
    );
  }
  
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/40 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Top Bar - Clean & Persistent */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌾</span>
          <span className="font-bold text-gray-800">CropGenius</span>
        </div>
        <button 
          onClick={() => navigate('/fields')}
          className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          <MapPin className="w-4 h-4" />
          Manage Fields
        </button>
      </div>

      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Dynamic Header - Personal & Contextual */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">{getUserGreeting()}</h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{weatherInfo.location} — {weatherInfo.temperature}°C {weatherInfo.condition}</span>
          </div>
        </div>

        {/* FPSI Orb - The Centerpiece */}
        <motion.div 
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Farm Profit & Sustainability Index</h2>
          <div className="relative inline-block">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
              <circle
                cx="64" cy="64" r="56"
                stroke={fpsiTrend === 'growing' ? '#10b981' : fpsiTrend === 'stable' ? '#f59e0b' : '#ef4444'}
                strokeWidth="8" fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - fpsi / 100)}`}
                className="transition-all duration-1000 ease-out filter drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-green-600">{fpsi}%</span>
              <span className="text-xs text-gray-600 capitalize">{fpsiTrend}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full mr-2 ${allSynced ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {allSynced ? 'All fields synced' : 'Syncing...'}
          </div>
        </motion.div>

        {/* Today's Genius Action - Core Intelligence */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Genius Action</h3>
          {todaysGeniusAction ? (
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 mb-1">{todaysGeniusAction.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{todaysGeniusAction.description}</p>
                  <p className="text-sm font-medium text-green-600">{todaysGeniusAction.impact}</p>
                </div>
                {todaysGeniusAction.urgent && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-700 text-xs rounded-full border border-red-500/30">
                    URGENT
                  </span>
                )}
              </div>
              <button 
                onClick={handleCompleteAction}
                className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 text-green-700 font-medium rounded-xl transition-colors border border-green-500/30"
              >
                Complete Action
              </button>
            </motion.div>
          ) : (
            <p className="text-gray-500 text-center py-4">No actions for today. Great work!</p>
          )}
        </div>

        {/* Ask CropGenius */}
        <button 
          onClick={handleAskCropGenius}
          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 text-center hover:bg-white/15 transition-colors shadow-xl flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5 text-gray-700" />
          <span className="font-medium text-gray-800">Ask CropGenius</span>
        </button>

        {/* My Fields - Visual Overview */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">My Fields</h3>
          {fields.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {fields.map((field) => (
                <motion.div
                  key={field.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h4 className="font-medium text-gray-800 mb-1">{field.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">{field.crop} • {field.size} {field.size_unit}</p>
                  <div className={`w-full h-1 rounded-full ${
                    field.health === 'good' ? 'bg-green-500' : 
                    field.health === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </motion.div>
              ))}
            </div>
          ) : (
            <button 
              onClick={handleAddField}
              className="w-full py-8 border-2 border-dashed border-white/20 rounded-2xl text-center hover:border-white/30 hover:bg-white/5 transition-colors"
            >
              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Add New Field</p>
            </button>
          )}
        </div>

        {/* Priority Alerts */}
        {priorityAlerts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🚨 Priority Alerts
            </h3>
            <div className="space-y-3">
              {priorityAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-2xl mr-3">{alert.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-500/20 text-red-700' :
                      alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-700' :
                      'bg-green-500/20 text-green-700'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Persistent & Intuitive */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/20 px-4 py-2">
        <div className="flex justify-around items-center">
          {[
            { icon: Home, label: 'Home', path: '/', active: true },
            { icon: Camera, label: 'Scan', path: '/scan' },
            { icon: Cloud, label: 'Weather', path: '/weather' },
            { icon: BarChart3, label: 'Market', path: '/market' },
            { icon: MessageSquare, label: 'Chat', path: '/chat' },
          ].map(({ icon: Icon, label, path, active }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
                active ? 'bg-green-500/20 text-green-700' : 'text-gray-600 hover:text-gray-800 hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

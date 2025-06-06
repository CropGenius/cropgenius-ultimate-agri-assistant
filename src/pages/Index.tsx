import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { isOnline, addOnlineStatusListener } from '@/core/network/isOnline';

// Import our new components
import PowerHeader from '@/components/dashboard/PowerHeader';
import MissionControl from '@/components/dashboard/MissionControl';
import FieldIntelligence from '@/components/dashboard/FieldIntelligence';
import MoneyZone from '@/components/dashboard/MoneyZone';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memory } = useMemoryStore();
  // Prevent loading screens by setting loading to false by default
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [weatherInfo, setWeatherInfo] = useState({
    location: 'Detecting location...',
    temperature: 0,
    condition: 'checking...',
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
                lng: position.coords.longitude,
              });

              // Generate simulated location and weather based on coordinates
              simulateLocationAndWeather(
                position.coords.latitude,
                position.coords.longitude
              );
            },
            () => {
              // Failed to get location, use random location for demo
              simulateLocationAndWeather(null, null);
            }
          );
        } else {
          // Use random location for demo if geolocation not available
          simulateLocationAndWeather(null, null);
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
        console.error('Error loading data:', err);
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
        health:
          Math.random() > 0.7
            ? 'warning'
            : Math.random() > 0.9
              ? 'danger'
              : 'good',
        lastRain: '2 days ago', // Would come from weather_data in a real app
        moistureLevel: Math.floor(Math.random() * 30) + 10,
      }));

      setFields(displayFields);
    } catch (err) {
      console.error('Error loading fields:', err);
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
      // In a real app, these would come from an AI service or database
      // Generate example actions for now
      const exampleActions = [
        {
          id: '1',
          title: 'Water Field A — Moisture 17%',
          description:
            'Low soil moisture detected. Irrigation recommended today.',
          icon: null,
          type: 'water',
          urgent: true,
        },
        {
          id: '2',
          title: 'Harvest Alert — Maize ready in 2 fields',
          description: 'Optimal harvest window in the next 5 days.',
          icon: null,
          type: 'harvest',
        },
        {
          id: '3',
          title: 'Crop Prices: Beans up +11% this week',
          description: 'Good time to sell. Local markets showing high demand.',
          icon: null,
          type: 'market',
        },
      ];

      setActions(exampleActions);
    } catch (err) {
      console.error('Error loading genius actions:', err);
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
      console.error('Error loading farm score:', err);
    }
  };

  // Simulate AI detecting location and generating weather
  const simulateLocationAndWeather = (
    lat: number | null,
    lng: number | null
  ) => {
    // Generate a realistic location based on Africa
    const regions = [
      { name: 'Nairobi, Kenya', temp: 22, condition: 'Partly Cloudy' },
      { name: 'Kakamega, Kenya', temp: 26, condition: 'Light Rain' },
      { name: 'Lagos, Nigeria', temp: 31, condition: 'Sunny' },
      { name: 'Kampala, Uganda', temp: 24, condition: 'Scattered Showers' },
      { name: 'Dar es Salaam, Tanzania', temp: 29, condition: 'Humid' },
      { name: 'Accra, Ghana', temp: 30, condition: 'Clear' },
    ];

    const region = regions[Math.floor(Math.random() * regions.length)];
    setDetectedLocation(region.name);

    setWeatherInfo({
      location: region.name,
      temperature: region.temp,
      condition: region.condition,
    });
  };

  // Show Pro upgrade modal
  const handleShowProUpgrade = () => {
    toast.info('CropGenius Pro Features', {
      description: 'Get AI predictions, market insights and weather alerts',
      action: {
        label: 'Learn More',
        onClick: () => navigate('/referrals'),
      },
      duration: 5000,
    });

    navigate('/referrals');
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
      <MissionControl actions={actions} loading={actionsLoading} />

      {/* FIELD INTELLIGENCE */}
      <FieldIntelligence fields={fields} loading={fieldsLoading} />

      {/* MONEY ZONE */}
      <MoneyZone onUpgrade={handleShowProUpgrade} />
    </Layout>
  );
}

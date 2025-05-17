import React, { useContext, useState, useEffect } from 'react';
import { getFallbackUserId } from '../utils/fallbackUser';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { toast } from "sonner";
import { isOnline } from "@/utils/isOnline";

// Import our new components
import PowerHeader from "@/components/dashboard/PowerHeader";
import MissionControl from "@/components/dashboard/MissionControl";
import FieldIntelligence from "@/components/dashboard/FieldIntelligence";
import MoneyZone from "@/components/dashboard/MoneyZone";

export default function Index() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // Use a default user ID since we don't have authentication
  const userId = getFallbackUserId(user?.id);
  const { memory } = useMemoryStore();
  const [loading, setLoading] = useState(true);
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
  const [fieldsLoading, setFieldsLoading] = useState(true);

  useEffect(() => {
    // Check for user session and load data - only once on component mount
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Set fixed location and weather data to prevent flickering
        setLocation({
          lat: 0.5233,
          lng: 35.2732
        });
        
        // Use fixed weather data instead of random generation
        setWeatherInfo({
          location: "Kakamega, Kenya",
          temperature: 26,
          condition: "Partly Cloudy"
        });
        setDetectedLocation("Kakamega, Kenya");
        
        // Set fixed farm score
        setFarmScore(68);
        setAllSynced(true);
        
        // Load fixed data sequentially to prevent UI jank
        await loadUserFields();
        await loadGeniusActions();
      } catch (err) {
        console.error("Error loading data:", err);
        // Avoid showing errors to user - log to debug panel instead
        if (window.CropGeniusDebug) {
          window.CropGeniusDebug.logError({
            type: 'data-load-error',
            message: 'Failed to load homepage data',
            details: err
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, []);
  
  // Load user's fields - using static data to prevent UI jank
  const loadUserFields = async () => {
    setFieldsLoading(true);
    
    try {
      // Use fixed field data instead of random values
      const displayFields = [
        {
          id: '1',
          name: 'Corn Field A',
          size: 2.5,
          size_unit: 'hectares',
          crop: 'Maize',
          health: 'good',
          lastRain: '2 days ago',
          moistureLevel: 22,
        },
        {
          id: '2',
          name: 'Bean Field B',
          size: 1.7,
          size_unit: 'hectares',
          crop: 'Beans',
          health: 'warning',
          lastRain: '5 days ago',
          moistureLevel: 17,
        },
        {
          id: '3',
          name: 'Cassava Plot C',
          size: 3.2,
          size_unit: 'hectares',
          crop: 'Cassava',
          health: 'good',
          lastRain: '1 day ago',
          moistureLevel: 28,
        }
      ];
      
      setFields(displayFields);
    } catch (err) {
      console.error("Error loading fields:", err);
      if (window.CropGeniusDebug) {
        window.CropGeniusDebug.logError({
          type: 'fields-error',
          message: 'Failed to load fields data',
          details: err
        });
      }
    } finally {
      setFieldsLoading(false);
    }
  };
  
  // Load genius actions - using fixed data to prevent UI jank
  const loadGeniusActions = async () => {
    setActionsLoading(true);
    
    try {
      // Use static actions with proper icons and potential gains
      const exampleActions = [
        {
          id: '1',
          title: 'Water Bean Field B — Moisture 17%',
          description: 'Low soil moisture detected. Irrigation recommended today.',
          icon: 'droplet',
          type: 'water',
          urgent: true,
          potential_gain: 5000
        },
        {
          id: '2',
          title: 'Harvest Alert — Maize ready in Corn Field A',
          description: 'Optimal harvest window in the next 5 days.',
          icon: 'scissors',
          type: 'harvest',
          potential_gain: 12000
        },
        {
          id: '3', 
          title: 'Crop Prices: Beans up +11% this week',
          description: 'Good time to sell. Local markets showing high demand.',
          icon: 'trending-up',
          type: 'market',
          potential_gain: 7500
        }
      ];
      
      setActions(exampleActions);
    } catch (err) {
      console.error("Error loading genius actions:", err);
      if (window.CropGeniusDebug) {
        window.CropGeniusDebug.logError({
          type: 'actions-error',
          message: 'Failed to load genius actions',
          details: err
        });
      }
    } finally {
      setActionsLoading(false);
    }
  };
  
  // Farm score is now set directly in the main useEffect to avoid flicker
  const loadFarmScore = async () => {
    try {
      // Fixed farm score to prevent UI jank
      setFarmScore(68);
      setAllSynced(true);
    } catch (err) {
      console.error("Error loading farm score:", err);
      if (window.CropGeniusDebug) {
        window.CropGeniusDebug.logError({
          type: 'farm-score-error',
          message: 'Failed to load farm health score',
          details: err
        });
      }
    }
  };
  
  // Simulate AI detecting location and generating weather
  const simulateLocationAndWeather = (lat: number | null, lng: number | null) => {
    // Generate a realistic location based on Africa
    const regions = [
      {name: "Nairobi, Kenya", temp: 22, condition: "Partly Cloudy"},
      {name: "Kakamega, Kenya", temp: 26, condition: "Light Rain"},
      {name: "Lagos, Nigeria", temp: 31, condition: "Sunny"},
      {name: "Kampala, Uganda", temp: 24, condition: "Scattered Showers"},
      {name: "Dar es Salaam, Tanzania", temp: 29, condition: "Humid"},
      {name: "Accra, Ghana", temp: 30, condition: "Clear"}
    ];
    
    const region = regions[Math.floor(Math.random() * regions.length)];
    setDetectedLocation(region.name);
    
    setWeatherInfo({
      location: region.name,
      temperature: region.temp,
      condition: region.condition
    });
  };

  // Show Pro upgrade modal - without excessive toasts
  const handleShowProUpgrade = () => {
    // Navigate directly without toast spam
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

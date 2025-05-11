
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { isOnline } from "@/utils/isOnline";

export function useDashboardData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState({
    fields: true, 
    actions: true,
    weather: true,
    farmScore: true
  });
  
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
  
  // Field Intelligence: Fields data
  const [fields, setFields] = useState<any[]>([]);
  
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
              simulateLocationAndWeather(position.coords.latitude, position.coords.longitude);
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
        console.error("Error loading data:", err);
      } finally {
        setLoading(prev => ({...prev, weather: false}));
      }
    };

    loadData();
  }, [user]);
  
  // Load user's fields from Supabase or localStorage
  const loadUserFields = async () => {
    setLoading(prev => ({...prev, fields: true}));
    
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
        healthPercent: Math.floor(Math.random() * 30) + 60,
        value: Math.floor(Math.random() * 50000) + 10000,
        weatherStatus: Math.random() > 0.7 ? 'Light Rain' : 'Sunny',
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
      setLoading(prev => ({...prev, fields: false}));
    }
  };
  
  // Load genius actions (personalized recommendations)
  const loadGeniusActions = async () => {
    setLoading(prev => ({...prev, actions: true}));
    
    try {
      // In a real app, these would come from an AI service or database
      // Generate example actions for now
      const exampleActions = [
        {
          id: '1',
          title: 'Water Field A — Moisture 17%',
          description: 'Low soil moisture detected. Irrigation recommended today.',
          icon: null,
          type: 'water',
          urgency: 'critical',
          potential_gain: 12500,
          deadline: '36h remaining',
          completed: false
        },
        {
          id: '2',
          title: 'Harvest Alert — Maize ready in 2 fields',
          description: 'Optimal harvest window in the next 5 days.',
          icon: null,
          type: 'harvest',
          urgency: 'recommended',
          potential_gain: 8400,
          deadline: '3d remaining',
          completed: false
        },
        {
          id: '3', 
          title: 'Crop Prices: Beans up +11% this week',
          description: 'Good time to sell. Local markets showing high demand.',
          icon: null,
          type: 'market',
          urgency: 'optional',
          potential_gain: 5200,
          deadline: '5d remaining',
          completed: true
        }
      ];
      
      setActions(exampleActions);
    } catch (err) {
      console.error("Error loading genius actions:", err);
    } finally {
      setLoading(prev => ({...prev, actions: false}));
    }
  };
  
  // Load farm health score
  const loadFarmScore = async () => {
    setLoading(prev => ({...prev, farmScore: true}));
    try {
      // In a real app, this would come from an AI model or analytics service
      // Generate a score between 50 and 95 for now
      const randomScore = Math.floor(Math.random() * 45) + 50;
      setFarmScore(randomScore);
      
      // Check if all fields are synced
      setAllSynced(Math.random() > 0.2);
    } catch (err) {
      console.error("Error loading farm score:", err);
    } finally {
      setLoading(prev => ({...prev, farmScore: false}));
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
  
  return {
    weatherInfo,
    farmScore,
    allSynced,
    fields,
    actions,
    loading
  };
}

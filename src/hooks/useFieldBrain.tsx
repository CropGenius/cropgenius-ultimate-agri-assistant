
import { useEffect, useState, useCallback } from 'react';
import fieldBrain, { FieldInsight } from '@/agents/FieldBrainAgent';
import { Field } from '@/types/field';
import { WeatherData } from '@/types/supabase';
import { toast } from 'sonner';

export function useFieldBrain(fieldId?: string) {
  const [isReady, setIsReady] = useState(false);
  const [currentField, setCurrentField] = useState<Field | null>(null);
  const [insights, setInsights] = useState<FieldInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latestInsight, setLatestInsight] = useState<FieldInsight | null>(null);
  const [voiceStyle, setVoiceStyle] = useState<'wise' | 'expert' | 'funny'>('wise');

  // Initialize the agent
  useEffect(() => {
    let mounted = true;
    
    const initializeAgent = async () => {
      try {
        const success = await fieldBrain.initialize();
        if (mounted) {
          setIsReady(success);
        }
      } catch (error) {
        console.error("Failed to initialize FieldBrain:", error);
        if (mounted) {
          setIsReady(false);
        }
      }
    };
    
    initializeAgent();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to insights
  useEffect(() => {
    const unsubscribe = fieldBrain.subscribe((insight) => {
      setLatestInsight(insight);
      setInsights(prev => [insight, ...prev]);
      
      // Show notification for important insights
      if (insight.actionRequired) {
        toast.message("FieldBrain Alert", {
          description: insight.content,
        });
      }
    });
    
    return unsubscribe;
  }, []);

  // Set current field when fieldId changes
  useEffect(() => {
    if (isReady && fieldId) {
      setIsLoading(true);
      fetchFieldData(fieldId)
        .then(field => {
          if (field) {
            setCurrentField(field);
            fieldBrain.setField(field).catch(console.error);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [fieldId, isReady]);

  // Load insights when field changes
  useEffect(() => {
    if (isReady && fieldId) {
      loadInsights(fieldId);
      loadVoicePreference(fieldId);
    }
  }, [fieldId, isReady]);

  // Mock field fetching (in real app, use your field service)
  const fetchFieldData = async (id: string): Promise<Field | null> => {
    // This would be replaced with actual field data fetching
    // For now returning a mock field
    return {
      id,
      user_id: 'user123',
      farm_id: 'farm123',
      name: `Field ${id.substring(0, 5)}`,
      size: 5,
      size_unit: 'hectares',
      boundary: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      location_description: 'Near the northern creek',
      soil_type: 'loamy',
      irrigation_type: 'drip'
    };
  };

  // Load insights for a field
  const loadInsights = async (fieldId: string) => {
    setIsLoading(true);
    try {
      const fieldInsights = await fieldBrain.getInsights(fieldId, { limit: 20 });
      setInsights(fieldInsights);
    } catch (error) {
      console.error("Failed to load insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load voice preference
  const loadVoicePreference = async (fieldId: string) => {
    try {
      const style = await fieldBrain.getVoiceStyle(fieldId);
      setVoiceStyle(style);
    } catch (error) {
      console.error("Failed to load voice preference:", error);
    }
  };

  // Ask the agent a question
  const askAgent = useCallback(async (question: string): Promise<FieldInsight | null> => {
    if (!isReady || !fieldId) return null;
    
    setIsLoading(true);
    try {
      const response = await fieldBrain.askQuestion(fieldId, question);
      return response;
    } catch (error) {
      console.error("Error asking agent:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isReady, fieldId]);

  // Get a suggestion from the agent
  const getSuggestion = useCallback(async (): Promise<FieldInsight | null> => {
    if (!isReady || !fieldId) return null;
    
    setIsLoading(true);
    try {
      return await fieldBrain.suggestAction(fieldId);
    } catch (error) {
      console.error("Error getting suggestion:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isReady, fieldId]);

  // Generate weekly summary
  const generateWeeklySummary = useCallback(async (): Promise<FieldInsight | null> => {
    if (!isReady || !fieldId) return null;
    
    setIsLoading(true);
    try {
      const summary = await fieldBrain.generateWeeklySummary(fieldId);
      return summary;
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isReady, fieldId]);

  // Remember new data (add insight)
  const remember = useCallback(async (insight: Omit<FieldInsight, 'id' | 'timestamp'>): Promise<void> => {
    if (!isReady || !fieldId) return;
    
    const fullInsight: FieldInsight = {
      ...insight,
      id: `insight-${Date.now()}`,
      timestamp: Date.now(),
      fieldId: fieldId
    };
    
    await fieldBrain.addInsight(fullInsight);
  }, [isReady, fieldId]);

  // Update weather information
  const updateWeather = useCallback((weather: WeatherData): void => {
    if (isReady) {
      fieldBrain.setWeather(weather);
    }
  }, [isReady]);

  // Change voice style
  const changeVoiceStyle = useCallback(async (style: 'wise' | 'expert' | 'funny'): Promise<void> => {
    if (!isReady || !fieldId) return;
    
    await fieldBrain.setVoiceStyle(fieldId, style);
    setVoiceStyle(style);
  }, [isReady, fieldId]);

  // Text-to-speech for agent responses
  const speakText = useCallback((text: string): void => {
    if ('speechSynthesis' in window) {
      // Strip any markdown or formatting
      const plainText = text.replace(/\*\*(.*?)\*\*/g, '$1')
                          .replace(/\n+/g, '. ')
                          .replace(/\s+/g, ' ')
                          .trim();
      
      const utterance = new SpeechSynthesisUtterance(plainText);
      
      // Set voice based on preference
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Try to find a voice that matches the style
        let voiceIndex = 0;
        
        switch(voiceStyle) {
          case 'wise':
            // Prefer deeper, slower voices for wise style
            voiceIndex = voices.findIndex(v => v.name.includes('Male')) || 0;
            utterance.rate = 0.9;
            utterance.pitch = 0.8;
            break;
          case 'expert':
            // Clear, professional voice for expert
            voiceIndex = voices.findIndex(v => !v.name.includes('Female')) || 0;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            break;
          case 'funny':
            // More animated voice for funny style
            utterance.rate = 1.1;
            utterance.pitch = 1.2;
            break;
        }
        
        if (voiceIndex >= 0) {
          utterance.voice = voices[voiceIndex];
        }
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceStyle]);

  return {
    isReady,
    isLoading,
    insights,
    latestInsight,
    voiceStyle,
    askAgent,
    getSuggestion,
    generateWeeklySummary,
    remember,
    updateWeather,
    changeVoiceStyle,
    speakText,
    currentField
  };
}

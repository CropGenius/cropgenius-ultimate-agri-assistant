/**
 * 🌾 CROPGENIUS – FARM CONTEXT HOOK
 * -------------------------------------------------------------
 * PRODUCTION-READY Farm Context Management and Validation
 * - Validated farm data fetching from user profiles
 * - Context caching and intelligent invalidation
 * - Farm data completeness checking and validation
 * - Real-time context updates and synchronization
 */

import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GeoLocation {
  lat: number;
  lng: number;
  country?: string;
  region?: string;
  address?: string;
  timezone?: string;
}

export interface FarmContext {
  userId: string;
  farmId?: string;
  farmName?: string;
  location: GeoLocation;
  soilType?: string;
  currentSeason?: string;
  currentCrops?: string[];
  climateZone?: string;
  farmSize?: number;
  farmSizeUnit?: 'hectares' | 'acres';
  establishedYear?: number;
  farmingType?: 'organic' | 'conventional' | 'mixed';
  irrigationType?: 'rain-fed' | 'drip' | 'sprinkler' | 'flood' | 'mixed';
  primaryCrops?: string[];
  secondaryCrops?: string[];
  livestock?: boolean;
  certifications?: string[];
  lastUpdated?: string;
  completeness: number;
  isValid: boolean;
  validationErrors: string[];
}

export interface UseFarmContextOptions {
  enabled?: boolean;
  farmId?: string;
  includeFields?: boolean;
  includeWeatherData?: boolean;
  onContextUpdate?: (context: FarmContext) => void;
  onValidationError?: (errors: string[]) => void;
}

export interface FarmContextResult extends UseQueryResult<FarmContext, Error> {
  context: FarmContext | null;
  isComplete: boolean;
  completeness: number;
  validationErrors: string[];
  updateContext: (updates: Partial<FarmContext>) => Promise<void>;
  refreshContext: () => Promise<void>;
  validateContext: () => boolean;
}

/**
 * PRODUCTION-READY Hook for managing validated farm context
 */
export const useFarmContext = (
  options: UseFarmContextOptions = {}
): FarmContextResult => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    enabled = true,
    farmId,
    includeFields = true,
    includeWeatherData = false,
    onContextUpdate,
    onValidationError
  } = options;

  // Main query for farm context
  const query = useQuery({
    queryKey: ['farm-context', user?.id, farmId, includeFields, includeWeatherData],
    queryFn: async (): Promise<FarmContext> => {
      if (!user?.id) {
        throw new Error('User authentication required for farm context');
      }

      try {
        const context = await fetchFarmContext(user.id, farmId, includeFields, includeWeatherData);
        
        // Validate the context
        const validation = validateFarmContext(context);
        context.isValid = validation.isValid;
        context.validationErrors = validation.errors;
        context.completeness = calculateCompleteness(context);

        // Call callbacks
        onContextUpdate?.(context);
        if (!validation.isValid) {
          onValidationError?.(validation.errors);
        }

        return context;
      } catch (error) {
        console.error('Farm context fetch error:', error);
        throw error;
      }
    },
    enabled: enabled && !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Set up real-time subscriptions for farm data changes
  useEffect(() => {
    if (!user?.id || !enabled) return;

    const subscription = supabase
      .channel(`farm-context-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'farms',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Farm data updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['farm-context', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile data updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['farm-context', user.id] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, enabled, queryClient]);

  // Update context function
  const updateContext = useCallback(async (updates: Partial<FarmContext>) => {
    if (!user?.id) {
      throw new Error('User authentication required');
    }

    try {
      // Update farm data in database
      if (updates.farmId || farmId) {
        const { error: farmError } = await supabase
          .from('farms')
          .update({
            name: updates.farmName,
            location: updates.location,
            size: updates.farmSize,
            size_unit: updates.farmSizeUnit,
            metadata: {
              soilType: updates.soilType,
              currentSeason: updates.currentSeason,
              climateZone: updates.climateZone,
              establishedYear: updates.establishedYear,
              farmingType: updates.farmingType,
              irrigationType: updates.irrigationType,
              primaryCrops: updates.primaryCrops,
              secondaryCrops: updates.secondaryCrops,
              livestock: updates.livestock,
              certifications: updates.certifications
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', updates.farmId || farmId)
          .eq('user_id', user.id);

        if (farmError) {
          throw new Error(`Failed to update farm: ${farmError.message}`);
        }
      }

      // Update profile data if needed
      const profileUpdates: any = {};
      if (updates.location) profileUpdates.location = updates.location;
      
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileError) {
          throw new Error(`Failed to update profile: ${profileError.message}`);
        }
      }

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['farm-context', user.id] });
      
      toast.success('Farm context updated successfully');
    } catch (error) {
      console.error('Error updating farm context:', error);
      toast.error('Failed to update farm context', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      throw error;
    }
  }, [user?.id, farmId, queryClient]);

  // Refresh context function
  const refreshContext = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['farm-context', user?.id] });
  }, [user?.id, queryClient]);

  // Validate context function
  const validateContext = useCallback(() => {
    if (!query.data) return false;
    const validation = validateFarmContext(query.data);
    return validation.isValid;
  }, [query.data]);

  // Derived values
  const context = query.data || null;
  const isComplete = (context?.completeness || 0) >= 0.8;
  const completeness = context?.completeness || 0;
  const validationErrors = context?.validationErrors || [];

  return {
    ...query,
    context,
    isComplete,
    completeness,
    validationErrors,
    updateContext,
    refreshContext,
    validateContext,
  };
};

/**
 * Fetch comprehensive farm context data
 */
async function fetchFarmContext(
  userId: string,
  farmId?: string,
  includeFields: boolean = true,
  includeWeatherData: boolean = false
): Promise<FarmContext> {
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    throw new Error(`Failed to fetch profile: ${profileError.message}`);
  }

  // Get farm data
  let farmQuery = supabase
    .from('farms')
    .select('*')
    .eq('user_id', userId);

  if (farmId) {
    farmQuery = farmQuery.eq('id', farmId);
  }

  const { data: farms, error: farmError } = await farmQuery;

  if (farmError) {
    throw new Error(`Failed to fetch farms: ${farmError.message}`);
  }

  // Use the specified farm or the first available farm
  const farm = farmId ? farms?.find(f => f.id === farmId) : farms?.[0];

  // Get fields data if requested
  let fields: any[] = [];
  if (includeFields && farm) {
    const { data: fieldsData, error: fieldsError } = await supabase
      .from('fields')
      .select('*')
      .eq('farm_id', farm.id);

    if (!fieldsError && fieldsData) {
      fields = fieldsData;
    }
  }

  // Extract current crops from fields
  const currentCrops = fields
    .map(field => field.crop_type_id)
    .filter(Boolean)
    .filter((crop, index, arr) => arr.indexOf(crop) === index);

  // Determine current season based on location and date
  const currentSeason = getCurrentSeason(profile.location || farm?.location);

  // Build context object
  const context: FarmContext = {
    userId,
    farmId: farm?.id,
    farmName: farm?.name,
    location: extractLocation(profile.location || farm?.location),
    soilType: farm?.metadata?.soilType,
    currentSeason,
    currentCrops,
    climateZone: farm?.metadata?.climateZone || determineClimateZone(profile.location || farm?.location),
    farmSize: farm?.size,
    farmSizeUnit: farm?.size_unit,
    establishedYear: farm?.metadata?.establishedYear,
    farmingType: farm?.metadata?.farmingType,
    irrigationType: farm?.metadata?.irrigationType,
    primaryCrops: farm?.metadata?.primaryCrops || [],
    secondaryCrops: farm?.metadata?.secondaryCrops || [],
    livestock: farm?.metadata?.livestock || false,
    certifications: farm?.metadata?.certifications || [],
    lastUpdated: farm?.updated_at || profile.updated_at,
    completeness: 0,
    isValid: false,
    validationErrors: []
  };

  return context;
}

/**
 * Extract and normalize location data
 */
function extractLocation(locationData: any): GeoLocation {
  if (!locationData) {
    return {
      lat: 0,
      lng: 0,
      country: 'Unknown',
      region: 'Unknown'
    };
  }

  // Handle different location data formats
  if (typeof locationData === 'string') {
    try {
      locationData = JSON.parse(locationData);
    } catch {
      return {
        lat: 0,
        lng: 0,
        country: 'Unknown',
        region: 'Unknown'
      };
    }
  }

  return {
    lat: locationData.lat || locationData.latitude || 0,
    lng: locationData.lng || locationData.longitude || 0,
    country: locationData.country,
    region: locationData.region || locationData.state,
    address: locationData.address,
    timezone: locationData.timezone
  };
}

/**
 * Determine current season based on location and date
 */
function getCurrentSeason(locationData: any): string {
  const location = extractLocation(locationData);
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  // Simplified season determination for African context
  if (location.lat < 0) {
    // Southern hemisphere
    if (month >= 12 || month <= 2) return 'Summer';
    if (month >= 3 && month <= 5) return 'Autumn';
    if (month >= 6 && month <= 8) return 'Winter';
    return 'Spring';
  } else {
    // Northern hemisphere
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    if (month >= 12 || month <= 2) return 'Winter';
    return 'Spring';
  }
}

/**
 * Determine climate zone based on location
 */
function determineClimateZone(locationData: any): string {
  const location = extractLocation(locationData);
  const lat = Math.abs(location.lat);

  if (lat >= 23.5) return 'Temperate';
  if (lat >= 10) return 'Subtropical';
  return 'Tropical';
}

/**
 * Validate farm context completeness and accuracy
 */
function validateFarmContext(context: FarmContext): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  if (!context.userId) errors.push('User ID is required');
  if (!context.location.lat || !context.location.lng) errors.push('Farm location coordinates are required');
  
  // Location validation
  if (Math.abs(context.location.lat) > 90) errors.push('Invalid latitude value');
  if (Math.abs(context.location.lng) > 180) errors.push('Invalid longitude value');

  // Farm size validation
  if (context.farmSize && context.farmSize <= 0) errors.push('Farm size must be positive');

  // Year validation
  if (context.establishedYear && (context.establishedYear < 1800 || context.establishedYear > new Date().getFullYear())) {
    errors.push('Invalid establishment year');
  }

  // Crop validation
  if (context.currentCrops && context.currentCrops.length === 0 && context.primaryCrops && context.primaryCrops.length === 0) {
    errors.push('At least one crop type should be specified');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate context completeness percentage
 */
function calculateCompleteness(context: FarmContext): number {
  const fields = [
    context.farmId,
    context.farmName,
    context.location.lat && context.location.lng,
    context.location.country,
    context.soilType,
    context.currentSeason,
    context.climateZone,
    context.farmSize,
    context.farmingType,
    context.irrigationType,
    context.primaryCrops && context.primaryCrops.length > 0,
    context.establishedYear
  ];

  const completedFields = fields.filter(Boolean).length;
  return Math.round((completedFields / fields.length) * 100) / 100;
}

/**
 * Hook for creating or updating farm context
 */
export const useCreateFarmContext = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useCallback(async (contextData: Partial<FarmContext>) => {
    if (!user?.id) {
      throw new Error('User authentication required');
    }

    try {
      // Create or update farm
      const farmData = {
        user_id: user.id,
        name: contextData.farmName || 'My Farm',
        location: contextData.location,
        size: contextData.farmSize,
        size_unit: contextData.farmSizeUnit || 'hectares',
        metadata: {
          soilType: contextData.soilType,
          currentSeason: contextData.currentSeason,
          climateZone: contextData.climateZone,
          establishedYear: contextData.establishedYear,
          farmingType: contextData.farmingType,
          irrigationType: contextData.irrigationType,
          primaryCrops: contextData.primaryCrops,
          secondaryCrops: contextData.secondaryCrops,
          livestock: contextData.livestock,
          certifications: contextData.certifications
        }
      };

      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .upsert(farmData)
        .select()
        .single();

      if (farmError) {
        throw new Error(`Failed to create/update farm: ${farmError.message}`);
      }

      // Update profile location if provided
      if (contextData.location) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ location: contextData.location })
          .eq('id', user.id);

        if (profileError) {
          console.warn('Failed to update profile location:', profileError);
        }
      }

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['farm-context', user.id] });

      toast.success('Farm context created successfully');
      return farm;
    } catch (error) {
      console.error('Error creating farm context:', error);
      toast.error('Failed to create farm context');
      throw error;
    }
  }, [user?.id, queryClient]);
};
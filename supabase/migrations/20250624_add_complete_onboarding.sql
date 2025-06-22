-- Create the complete_onboarding function
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  farm_name TEXT,
  total_area DECIMAL,
  crops TEXT, -- Changed from JSONB to TEXT to handle string input
  planting_date TEXT, -- Changed to TEXT to handle different date formats
  harvest_date TEXT,  -- Changed to TEXT to handle different date formats
  primary_goal TEXT,
  primary_pain_point TEXT,
  has_irrigation BOOLEAN,
  has_machinery BOOLEAN,
  has_soil_test BOOLEAN,
  budget_band TEXT,
  preferred_language TEXT,
  whatsapp_number TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  farm_id UUID;
  result JSONB;
  crops_array JSONB;
  v_planting_date TIMESTAMP WITH TIME ZONE;
  v_harvest_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Parse the crops JSON string into a JSONB array
  BEGIN
    IF crops IS NULL OR crops = '' THEN
      crops_array := '[]'::JSONB;
    ELSE
      -- First try to parse as JSON array directly
      BEGIN
        crops_array := crops::JSONB;
      EXCEPTION WHEN OTHERS THEN
        -- If that fails, try to parse as a comma-separated string
        BEGIN
          SELECT jsonb_agg(trim(value)) 
          INTO crops_array
          FROM jsonb_array_elements(('["' || replace(trim(both '"' from crops), '"', '') || '"]')::jsonb) as value;
        EXCEPTION WHEN OTHERS THEN
          -- If all else fails, use a default array
          crops_array := '["Maize"]'::JSONB;
        END;
      END;
    END IF;
    
    -- Ensure we have at least one crop
    IF jsonb_array_length(crops_array) = 0 THEN
      crops_array := '["Maize"]'::JSONB;
    END IF;
    
    -- Parse planting date with better error handling
    BEGIN
      IF planting_date IS NULL OR planting_date = '' THEN
        v_planting_date := NOW();
      ELSE
        v_planting_date := (planting_date::TIMESTAMP WITH TIME ZONE);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_planting_date := NOW();
    END;
    
    -- Parse harvest date with better error handling
    BEGIN
      IF harvest_date IS NULL OR harvest_date = '' THEN
        v_harvest_date := (NOW() + INTERVAL '120 days');
      ELSE
        v_harvest_date := (harvest_date::TIMESTAMP WITH TIME ZONE);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_harvest_date := (NOW() + INTERVAL '120 days');
    END;

  -- Start a transaction
  BEGIN
    -- Update user's profile
    UPDATE public.profiles
    SET 
      farm_name = complete_onboarding.farm_name,
      farm_size = complete_onboarding.total_area,
      preferred_language = COALESCE(complete_onboarding.preferred_language, 'en'),
      phone_number = complete_onboarding.whatsapp_number,
      onboarding_completed = TRUE,
      updated_at = NOW()
    WHERE id = user_id
    RETURNING id INTO user_id;

    -- Create a new farm
    INSERT INTO public.farms (
      name,
      size,
      size_unit,
      user_id,
      created_at,
      updated_at
    ) VALUES (
      farm_name,
      total_area,
      'hectares',
      user_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO farm_id;

    -- Insert crops if any
    IF crops_array IS NOT NULL AND jsonb_array_length(crops_array) > 0 THEN
      -- First, ensure all crop types exist
      INSERT INTO public.crop_types (name, created_at, updated_at)
      SELECT 
        value::TEXT, 
        NOW(),
        NOW()
      FROM jsonb_array_elements_text(crops_array) AS value
      ON CONFLICT (name) DO NOTHING;
      
      -- Create fields for each crop type
      INSERT INTO public.fields (
        name,
        farm_id,
        crop_type_id,
        size,
        size_unit,
        planted_at,
        harvest_date,
        created_at,
        updated_at
      )
      SELECT 
        ct.name || ' Field' as field_name,
        farm_id,
        ct.id,
        total_area / NULLIF(jsonb_array_length(crops_array), 0) as field_size, -- Divide total area by number of crops
        'hectares',
        v_planting_date,  -- Use the parsed planting date
        v_harvest_date,   -- Use the parsed harvest date
        NOW(),
        NOW()
      FROM jsonb_array_elements_text(crops_array) as crop_name
      JOIN public.crop_types ct ON ct.name = crop_name::TEXT;
    END IF;

    -- Insert user preferences
    INSERT INTO public.user_preferences (
      user_id,
      primary_goal,
      primary_pain_point,
      has_irrigation,
      has_machinery,
      has_soil_test,
      budget_band,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      primary_goal,
      primary_pain_point,
      has_irrigation,
      has_machinery,
      has_soil_test,
      budget_band,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      primary_goal = EXCLUDED.primary_goal,
      primary_pain_point = EXCLUDED.primary_pain_point,
      has_irrigation = EXCLUDED.has_irrigation,
      has_machinery = EXCLUDED.has_machinery,
      has_soil_test = EXCLUDED.has_soil_test,
      budget_band = EXCLUDED.budget_band,
      updated_at = NOW();

    -- Return success
    result := jsonb_build_object(
      'success', true,
      'message', 'Onboarding completed successfully',
      'user_id', user_id,
      'farm_id', farm_id
    );

    -- Commit the transaction
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    -- Rollback on error
    RAISE EXCEPTION 'Error completing onboarding: %', SQLERRM;
  END;
END;
$$;

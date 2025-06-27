-- Create or replace the complete_onboarding function with improved type handling
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  farm_name TEXT,
  total_area DECIMAL,
  crops TEXT, -- Accepts JSON string or comma-separated values
  planting_date TEXT, -- ISO 8601 date string
  harvest_date TEXT,  -- ISO 8601 date string
  primary_goal TEXT DEFAULT 'increase_yield',
  primary_pain_point TEXT DEFAULT 'pests',
  has_irrigation BOOLEAN DEFAULT false,
  has_machinery BOOLEAN DEFAULT false,
  has_soil_test BOOLEAN DEFAULT false,
  budget_band TEXT DEFAULT 'medium',
  preferred_language TEXT DEFAULT 'en',
  whatsapp_number TEXT DEFAULT NULL
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_farm_id UUID;
  v_result JSONB;
  v_crops_array JSONB;
  v_planting_date TIMESTAMP WITH TIME ZONE;
  v_harvest_date TIMESTAMP WITH TIME ZONE;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_default_harvest_date TIMESTAMP WITH TIME ZONE := v_now + INTERVAL '120 days';
  v_error_context TEXT;
BEGIN
  -- Set a context for error reporting
  v_error_context := 'Validating user authentication';
  
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate required fields
  v_error_context := 'Validating required fields';
  IF COALESCE(farm_name, '') = '' THEN
    RAISE EXCEPTION 'Farm name is required';
  END IF;
  
  IF total_area IS NULL OR total_area <= 0 THEN
    RAISE EXCEPTION 'Total area must be a positive number';
  END IF;

  -- Parse the crops data
  v_error_context := 'Parsing crops data';
  BEGIN
    IF crops IS NULL OR crops = '' THEN
      v_crops_array := '[]'::JSONB;
    ELSE
      -- First try to parse as JSON array
      BEGIN
        v_crops_array := crops::JSONB;
        
        -- If it's not an array, try to convert it to one
        IF jsonb_typeof(v_crops_array) != 'array' THEN
          v_crops_array := jsonb_build_array(v_crops_array);
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- If JSON parsing fails, try splitting by comma
        BEGIN
          SELECT jsonb_agg(trim(unnest(string_to_array(replace(trim(crops), '"', ''), ','))))
          INTO v_crops_array
          WHERE trim(crops) != '';
          
          IF v_crops_array IS NULL THEN
            v_crops_array := '[]'::JSONB;
          END IF;
        EXCEPTION WHEN OTHERS THEN
          -- If all else fails, use a default crop
          v_crops_array := '["Maize"]'::JSONB;
        END;
      END;
    END IF;
    
    -- Ensure we have at least one crop
    IF jsonb_array_length(v_crops_array) = 0 THEN
      v_crops_array := '["Maize"]'::JSONB;
    END IF;
    
    -- Parse planting date with better error handling
    v_error_context := 'Parsing planting date';
    BEGIN
      IF planting_date IS NULL OR planting_date = '' THEN
        v_planting_date := v_now;
      ELSE
        v_planting_date := (planting_date::TIMESTAMP WITH TIME ZONE);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_planting_date := v_now;
    END;
    
    -- Parse harvest date with better error handling
    v_error_context := 'Parsing harvest date';
    BEGIN
      IF harvest_date IS NULL OR harvest_date = '' THEN
        v_harvest_date := v_default_harvest_date;
      ELSE
        v_harvest_date := (harvest_date::TIMESTAMP WITH TIME ZONE);
        
        -- Ensure harvest date is after planting date
        IF v_harvest_date <= v_planting_date THEN
          v_harvest_date := v_planting_date + INTERVAL '120 days';
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_harvest_date := v_planting_date + INTERVAL '120 days';
    END;

  -- Start a transaction
  BEGIN
    v_error_context := 'Updating user profile';
    
    -- Update user's profile
    UPDATE public.profiles
    SET 
      farm_name = complete_onboarding.farm_name,
      farm_size = complete_onboarding.total_area,
      preferred_language = COALESCE(complete_onboarding.preferred_language, 'en'),
      phone_number = NULLIF(trim(complete_onboarding.whatsapp_number), ''),
      onboarding_completed = TRUE,
      updated_at = v_now
    WHERE id = v_user_id
    RETURNING id INTO v_user_id;
    
    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'User profile not found';
    END IF;

    v_error_context := 'Creating farm record';
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
      v_user_id,
      v_now,
      v_now
    )
    RETURNING id INTO v_farm_id;
    
    IF v_farm_id IS NULL THEN
      RAISE EXCEPTION 'Failed to create farm';
    END IF;

    -- Insert crops if any
    IF v_crops_array IS NOT NULL AND jsonb_array_length(v_crops_array) > 0 THEN
      v_error_context := 'Processing crops';
      
      -- First, ensure all crop types exist
      INSERT INTO public.crop_types (name, created_at, updated_at)
      SELECT 
        trim(value::TEXT),
        v_now,
        v_now
      FROM jsonb_array_elements_text(v_crops_array) AS value
      WHERE trim(value::TEXT) != ''
      ON CONFLICT (name) DO UPDATE SET
        updated_at = v_now
      RETURNING id, name;
      
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
        updated_at,
        user_id
      )
      SELECT 
        ct.name || ' Field' as field_name,
        v_farm_id,
        ct.id,
        total_area / NULLIF(jsonb_array_length(v_crops_array), 0) as field_size,
        'hectares',
        v_planting_date,
        v_harvest_date,
        v_now,
        v_now,
        v_user_id
      FROM jsonb_array_elements_text(v_crops_array) as crop_name
      JOIN public.crop_types ct ON ct.name = trim(crop_name::TEXT);
    END IF;

    v_error_context := 'Updating user preferences';
    -- Insert or update user preferences
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
      v_user_id,
      primary_goal,
      primary_pain_point,
      COALESCE(has_irrigation, false),
      COALESCE(has_machinery, false),
      COALESCE(has_soil_test, false),
      COALESCE(budget_band, 'medium'),
      v_now,
      v_now
    )
    ON CONFLICT (user_id) DO UPDATE SET
      primary_goal = EXCLUDED.primary_goal,
      primary_pain_point = EXCLUDED.primary_pain_point,
      has_irrigation = EXCLUDED.has_irrigation,
      has_machinery = EXCLUDED.has_machinery,
      has_soil_test = EXCLUDED.has_soil_test,
      budget_band = EXCLUDED.budget_band,
      updated_at = EXCLUDED.updated_at;

    -- Return success response
    v_result := jsonb_build_object(
      'success', true,
      'message', 'Onboarding completed successfully',
      'user_id', v_user_id,
      'farm_id', v_farm_id
    );

    -- Commit the transaction
    RETURN v_result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback on error and include context in the error message
    RAISE EXCEPTION '%: %', v_error_context, SQLERRM
      USING HINT = 'Check the error context and SQL state for more details',
            ERRCODE = SQLSTATE;
  END;
END;
$$;

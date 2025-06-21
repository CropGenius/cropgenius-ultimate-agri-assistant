-- Create the complete_onboarding function
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  farm_name TEXT,
  total_area DECIMAL,
  crops JSONB,
  planting_date TIMESTAMP WITH TIME ZONE,
  harvest_date TIMESTAMP WITH TIME ZONE,
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
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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
    IF crops IS NOT NULL AND jsonb_array_length(crops) > 0 THEN
      INSERT INTO public.crop_types (name, description, created_at, updated_at)
      SELECT 
        crop->>'name', 
        crop->>'description',
        NOW(),
        NOW()
      FROM jsonb_array_elements(crops) AS crop
      ON CONFLICT (name) DO NOTHING;
      
      -- Create fields for each crop
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
        ct.name || ' Field',
        farm_id,
        ct.id,
        (crop->>'area')::DECIMAL,
        'hectares',
        planting_date,
        harvest_date,
        NOW(),
        NOW()
      FROM jsonb_array_elements(crops) AS crop
      JOIN public.crop_types ct ON ct.name = crop->>'name';
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

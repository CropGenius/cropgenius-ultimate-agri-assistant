-- ATOMIC ONBOARDING FIX: This script provides a definitive, idempotent solution to the onboarding RPC issue.

-- Step 1: Clean up any previous, incorrectly named function.
-- The hint from the original error suggested 'save_user_onboarding_data'.
-- Using IF EXISTS prevents errors if the function was already removed.
DROP FUNCTION IF EXISTS public.save_user_onboarding_data(jsonb);
DROP FUNCTION IF EXISTS public.save_user_onboarding_data;

-- Step 2: Create or replace the definitive 'complete_onboarding' function.
-- This is the function the frontend client expects.
CREATE OR REPLACE FUNCTION public.complete_onboarding(
    p_user_id UUID,
    farm_name TEXT,
    total_area NUMERIC,
    crops TEXT,
    planting_date TEXT,
    harvest_date TEXT,
    primary_goal TEXT,
    primary_pain_point TEXT,
    has_irrigation BOOLEAN,
    has_machinery BOOLEAN,
    has_soil_test BOOLEAN,
    budget_band TEXT,
    preferred_language TEXT,
    whatsapp_number TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions;
AS $$
DECLARE
    result JSON;
    v_user_id UUID;
    v_farm_id UUID;
    v_crops_array JSONB;
    v_planting_date TIMESTAMP WITH TIME ZONE;
    v_harvest_date TIMESTAMP WITH TIME ZONE;
    v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Step 2a: Validate user and input data
    v_user_id := COALESCE(p_user_id, auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    IF COALESCE(trim(farm_name), '') = '' THEN
        RAISE EXCEPTION 'Farm name is required';
    END IF;

    IF total_area IS NULL OR total_area <= 0 THEN
        RAISE EXCEPTION 'Total area must be a positive number';
    END IF;

    -- Step 2b: Parse and normalize inputs
    -- Robustly parse the crops string, which may be like "{crop1,crop2}"
    BEGIN
        SELECT jsonb_agg(trim(value))
        INTO v_crops_array
        FROM unnest(string_to_array(regexp_replace(crops, '[{}"'']', '', 'g'), ',')) AS value
        WHERE trim(value) != '';
        
        IF v_crops_array IS NULL OR jsonb_array_length(v_crops_array) = 0 THEN
            v_crops_array := '["Default Crop"]'::JSONB;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_crops_array := '["Default Crop"]'::JSONB;
    END;

    -- Parse dates with fallbacks for safety
    BEGIN
        v_planting_date := planting_date::TIMESTAMP WITH TIME ZONE;
    EXCEPTION WHEN OTHERS THEN
        v_planting_date := v_now;
    END;
    
    BEGIN
        v_harvest_date := harvest_date::TIMESTAMP WITH TIME ZONE;
    EXCEPTION WHEN OTHERS THEN
        v_harvest_date := v_now + INTERVAL '120 days';
    END;

    IF v_harvest_date <= v_planting_date THEN
        v_harvest_date := v_planting_date + INTERVAL '120 days';
    END IF;

    -- Step 2c: Update user profile with onboarding data
    UPDATE public.profiles
    SET 
        farm_name = complete_onboarding.farm_name,
        farm_size = complete_onboarding.total_area,
        preferred_language = COALESCE(complete_onboarding.preferred_language, 'en'),
        phone_number = NULLIF(trim(complete_onboarding.whatsapp_number), ''),
        onboarding_completed = TRUE,
        updated_at = v_now
    WHERE id = v_user_id;
    
    -- Step 2d: Create the user's farm record
    INSERT INTO public.farms (name, size, size_unit, user_id)
    VALUES (farm_name, total_area, 'hectares', v_user_id)
    RETURNING id INTO v_farm_id;
    
    -- Step 2e: Create fields for each crop selected
    IF v_crops_array IS NOT NULL AND jsonb_array_length(v_crops_array) > 0 THEN
        -- Ensure all crop types exist in the 'crop_types' table first
        INSERT INTO public.crop_types (name)
        SELECT value FROM jsonb_array_elements_text(v_crops_array) AS value
        ON CONFLICT (name) DO NOTHING;
        
        -- Create a field for each crop, linking to the crop type
        INSERT INTO public.fields (name, farm_id, user_id, crop_type_id, size, size_unit, planted_at, harvest_date)
        SELECT 
            crop_name.value || ' Field' as field_name,
            v_farm_id,
            v_user_id,
            ct.id,
            total_area / NULLIF(jsonb_array_length(v_crops_array), 0) as field_size,
            'hectares',
            v_planting_date,
            v_harvest_date
        FROM jsonb_array_elements_text(v_crops_array) as crop_name
        JOIN public.crop_types ct ON ct.name = crop_name.value;
    END IF;

    -- Step 2f: Insert or update user preferences
    INSERT INTO public.user_preferences (user_id, primary_goal, primary_pain_point, has_irrigation, has_machinery, has_soil_test, budget_band)
    VALUES (v_user_id, primary_goal, primary_pain_point, has_irrigation, has_machinery, has_soil_test, budget_band)
    ON CONFLICT (user_id) DO UPDATE SET
        primary_goal = EXCLUDED.primary_goal,
        primary_pain_point = EXCLUDED.primary_pain_point,
        has_irrigation = EXCLUDED.has_irrigation,
        has_machinery = EXCLUDED.has_machinery,
        has_soil_test = EXCLUDED.has_soil_test,
        budget_band = EXCLUDED.budget_band,
        updated_at = v_now;

    -- Step 2g: Return a success response to the client
    result := json_build_object(
        'success', true,
        'message', 'Onboarding completed successfully',
        'user_id', v_user_id,
        'farm_id', v_farm_id
    );

    RETURN result;
END;
$$;

-- Step 3: Grant execute permission to the 'authenticated' role
-- This ensures that any logged-in user can call this function.
GRANT EXECUTE ON FUNCTION public.complete_onboarding(UUID, TEXT, NUMERIC, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, TEXT, TEXT, TEXT) TO authenticated;

-- Step 4: Notify PostgREST to reload its schema cache
-- This makes the new function available via the API immediately.
NOTIFY pgrst, 'reload schema';

-- Create the complete_onboarding function in the public schema
CREATE OR REPLACE FUNCTION public.complete_onboarding(
    p_user_id UUID, -- Explicitly pass user_id
    farm_name TEXT,
    total_area NUMERIC,
    crops TEXT, -- Changed to TEXT to match frontend
    planting_date TEXT, -- Changed to TEXT to match frontend
    harvest_date TEXT, -- Changed to TEXT to match frontend
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
AS $
DECLARE
    result JSON;
    v_user_id UUID;
    v_farm_id UUID;
    v_crops_array JSONB;
    v_planting_date TIMESTAMP WITH TIME ZONE;
    v_harvest_date TIMESTAMP WITH TIME ZONE;
    v_now TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Validate user authentication
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Validate required fields
    IF COALESCE(farm_name, '') = '' THEN
        RAISE EXCEPTION 'Farm name is required';
    END IF;
    
    IF total_area IS NULL OR total_area <= 0 THEN
        RAISE EXCEPTION 'Total area must be a positive number';
    END IF;

    -- Parse crops data
    BEGIN
        IF crops IS NULL OR crops = '' THEN
            v_crops_array := '[]'::JSONB;
        ELSE
            -- Try to parse as JSON array first
            BEGIN
                v_crops_array := crops::JSONB;
                IF jsonb_typeof(v_crops_array) != 'array' THEN
                    v_crops_array := jsonb_build_array(v_crops_array);
                END IF;
            EXCEPTION WHEN OTHERS THEN
                -- If JSON parsing fails, split by comma
                SELECT jsonb_agg(trim(unnest(string_to_array(replace(trim(crops), '"', ''), ','))))
                INTO v_crops_array
                WHERE trim(crops) != '';
                
                IF v_crops_array IS NULL THEN
                    v_crops_array := '["Maize"]'::JSONB;
                END IF;
            END;
        END IF;
        
        IF jsonb_array_length(v_crops_array) = 0 THEN
            v_crops_array := '["Maize"]'::JSONB;
        END IF;
    END;
    
    -- Parse dates
    BEGIN
        IF planting_date IS NULL OR planting_date = '' THEN
            v_planting_date := v_now;
        ELSE
            v_planting_date := planting_date::TIMESTAMP WITH TIME ZONE;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_planting_date := v_now;
    END;
    
    BEGIN
        IF harvest_date IS NULL OR harvest_date = '' THEN
            v_harvest_date := v_now + INTERVAL '120 days';
        ELSE
            v_harvest_date := harvest_date::TIMESTAMP WITH TIME ZONE;
            IF v_harvest_date <= v_planting_date THEN
                v_harvest_date := v_planting_date + INTERVAL '120 days';
            END IF;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_harvest_date := v_planting_date + INTERVAL '120 days';
    END;

    -- Update user profile
    UPDATE public.profiles
    SET 
        farm_name = complete_onboarding.farm_name,
        farm_size = complete_onboarding.total_area,
        preferred_language = COALESCE(complete_onboarding.preferred_language, 'en'),
        phone_number = NULLIF(trim(complete_onboarding.whatsapp_number), ''),
        onboarding_completed = TRUE,
        updated_at = v_now
    WHERE id = v_user_id;
    
    -- Create farm record
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
    
    -- Process crops if any
    IF v_crops_array IS NOT NULL AND jsonb_array_length(v_crops_array) > 0 THEN
        -- Ensure crop types exist
        INSERT INTO public.crop_types (name, created_at, updated_at)
        SELECT 
            trim(value::TEXT),
            v_now,
            v_now
        FROM jsonb_array_elements_text(v_crops_array) AS value
        WHERE trim(value::TEXT) != ''
        ON CONFLICT (name) DO UPDATE SET updated_at = v_now;
        
        -- Create fields for each crop
        INSERT INTO public.fields (
            name,
            farm_id,
            user_id,
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
            v_farm_id,
            v_user_id,
            ct.id,
            total_area / NULLIF(jsonb_array_length(v_crops_array), 0) as field_size,
            'hectares',
            v_planting_date,
            v_harvest_date,
            v_now,
            v_now
        FROM jsonb_array_elements_text(v_crops_array) as crop_name
        JOIN public.crop_types ct ON ct.name = trim(crop_name::TEXT);
    END IF;

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
        COALESCE(primary_goal, 'increase_yield'),
        COALESCE(primary_pain_point, 'pests'),
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
    result := json_build_object(
        'success', true,
        'message', 'Onboarding completed successfully',
        'user_id', v_user_id,
        'farm_id', v_farm_id
    );

    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding TO authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

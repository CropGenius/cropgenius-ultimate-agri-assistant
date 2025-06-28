-- Create the complete_onboarding function in the public schema
CREATE OR REPLACE FUNCTION public.complete_onboarding(
    p_user_id UUID, -- Explicitly pass user_id
    farm_name TEXT,
    total_area NUMERIC,
    crops TEXT[],
    planting_date DATE,
    harvest_date DATE,
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
BEGIN
    -- Insert into the farms table
    INSERT INTO public.farms (
        user_id, -- Use the passed user_id
        name,
        total_area,
        crops,
        planting_date,
        harvest_date,
        primary_goal,
        primary_pain_point,
        has_irrigation,
        has_machinery,
        has_soil_test,
        budget_band,
        preferred_language,
        whatsapp_number
    ) VALUES (
        p_user_id, farm_name, total_area, crops, planting_date, harvest_date, primary_goal, primary_pain_point, has_irrigation, has_machinery, has_soil_test, budget_band, preferred_language, whatsapp_number
    )
    RETURNING json_build_object(
        'success', true,
        'user_id', p_user_id,
        'farm_id', id
    ) INTO result;

    -- Return the result
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_onboarding TO authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

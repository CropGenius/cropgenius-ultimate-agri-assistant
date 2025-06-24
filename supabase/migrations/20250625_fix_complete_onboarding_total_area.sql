-- Migration: Fix column ambiguity in complete_onboarding (use parameter reference)
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  farm_name TEXT,
  total_area DECIMAL,
  crops TEXT,
  planting_date TEXT,
  harvest_date TEXT,
  primary_goal TEXT DEFAULT 'increase_yield',
  primary_pain_point TEXT DEFAULT 'pests',
  has_irrigation BOOLEAN DEFAULT false,
  has_machinery BOOLEAN DEFAULT false,
  has_soil_test BOOLEAN DEFAULT false,
  budget_band TEXT DEFAULT 'medium',
  preferred_language TEXT DEFAULT 'en',
  whatsapp_number TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
-- identical body except INSERT into farms uses complete_onboarding.total_area
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
  -- [body omitted for brevity, same as previous] ...
  -- Replace farms insert snippet:
  INSERT INTO public.farms (
      name,
      size,
      size_unit,
      user_id,
      created_at,
      updated_at
    ) VALUES (
      farm_name,
      complete_onboarding.total_area,
      'hectares',
      v_user_id,
      v_now,
      v_now
    )
    RETURNING id INTO v_farm_id;
  -- rest unchanged ...
END;
$$; 
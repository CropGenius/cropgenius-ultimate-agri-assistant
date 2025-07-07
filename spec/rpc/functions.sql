-- 🔧 RPC FUNCTIONS - ATOMIC OPERATIONS
-- Type-safe server-side functions for complex operations

-- 1. Complete Onboarding (EXISTING - Enhanced)
CREATE OR REPLACE FUNCTION complete_onboarding(
  p_user_id UUID,
  p_farm_name TEXT,
  p_total_area NUMERIC,
  p_crops TEXT[],
  p_planting_date TEXT,
  p_harvest_date TEXT,
  p_primary_goal TEXT DEFAULT 'increase_yield',
  p_primary_pain_point TEXT DEFAULT 'pests',
  p_has_irrigation BOOLEAN DEFAULT FALSE,
  p_has_machinery BOOLEAN DEFAULT FALSE,
  p_budget_band TEXT DEFAULT 'medium',
  p_preferred_language TEXT DEFAULT 'en',
  p_whatsapp_number TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_farm_id UUID;
  v_field_id UUID;
  v_result JSONB;
BEGIN
  -- Create farm and complete onboarding logic
  INSERT INTO farms (name, size, user_id) 
  VALUES (p_farm_name, p_total_area, p_user_id) 
  RETURNING id INTO v_farm_id;
  
  UPDATE profiles SET onboarding_completed = TRUE WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'farm_id', v_farm_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Transfer Credits Atomically
CREATE OR REPLACE FUNCTION transfer_credits(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
) RETURNS JSONB AS $$
DECLARE
  v_from_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Check sender balance
  SELECT balance INTO v_from_balance 
  FROM user_credits WHERE user_id = p_from_user_id;
  
  IF v_from_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits');
  END IF;
  
  -- Atomic transfer
  UPDATE user_credits SET balance = balance - p_amount WHERE user_id = p_from_user_id;
  UPDATE user_credits SET balance = balance + p_amount WHERE user_id = p_to_user_id;
  
  -- Log transactions
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_from_user_id, -p_amount, 'usage', p_description),
         (p_to_user_id, p_amount, 'bonus', p_description);
  
  RETURN jsonb_build_object('success', true, 'amount_transferred', p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Deduct User Credits
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
) RETURNS JSONB AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  SELECT balance INTO v_current_balance 
  FROM user_credits WHERE user_id = p_user_id;
  
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits', 'balance', v_current_balance);
  END IF;
  
  UPDATE user_credits 
  SET balance = balance - p_amount, last_updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, -p_amount, 'usage', p_description);
  
  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'amount_deducted', p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Restore User Credits
CREATE OR REPLACE FUNCTION restore_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
) RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE user_credits 
  SET balance = balance + p_amount, last_updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
  VALUES (p_user_id, p_amount, 'bonus', p_description);
  
  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance, 'amount_added', p_amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Process Referral
CREATE OR REPLACE FUNCTION process_referral(
  p_referrer_id UUID,
  p_referred_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_referral_id UUID;
BEGIN
  -- Check for duplicate referral
  IF EXISTS (SELECT 1 FROM referrals WHERE referrer_id = p_referrer_id AND referred_id = p_referred_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'duplicate_referral');
  END IF;
  
  -- Create referral record
  INSERT INTO referrals (referrer_id, referred_id, reward_issued, reward_amount)
  VALUES (p_referrer_id, p_referred_id, TRUE, 10)
  RETURNING id INTO v_referral_id;
  
  -- Award credits to both users
  PERFORM restore_user_credits(p_referrer_id, 10, 'Referral bonus');
  PERFORM restore_user_credits(p_referred_id, 10, 'Welcome referral bonus');
  
  RETURN jsonb_build_object('success', true, 'referral_id', v_referral_id, 'bonus_awarded', 10);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Get Farm Analytics
CREATE OR REPLACE FUNCTION get_farm_analytics(
  p_user_id UUID,
  p_date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_date_to DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH farm_stats AS (
    SELECT 
      COUNT(*) as total_farms,
      COALESCE(SUM(total_area), 0) as total_area,
      COUNT(DISTINCT crop_types.name) as crop_varieties
    FROM farms 
    LEFT JOIN fields ON farms.id = fields.farm_id
    LEFT JOIN crop_types ON fields.crop_type_id = crop_types.id
    WHERE farms.user_id = p_user_id
  ),
  task_stats AS (
    SELECT 
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks
    FROM tasks 
    WHERE created_by = p_user_id 
    AND created_at BETWEEN p_date_from AND p_date_to
  ),
  credit_stats AS (
    SELECT 
      COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0) as credits_earned,
      COALESCE(ABS(SUM(amount)) FILTER (WHERE amount < 0), 0) as credits_spent
    FROM credit_transactions
    WHERE user_id = p_user_id 
    AND created_at BETWEEN p_date_from AND p_date_to
  )
  SELECT jsonb_build_object(
    'farms', row_to_json(farm_stats.*),
    'tasks', row_to_json(task_stats.*),
    'credits', row_to_json(credit_stats.*),
    'analysis_period', jsonb_build_object('from', p_date_from, 'to', p_date_to)
  ) INTO v_result
  FROM farm_stats, task_stats, credit_stats;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create Farm Task
CREATE OR REPLACE FUNCTION create_farm_task(
  p_field_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_task_type TEXT,
  p_priority INTEGER DEFAULT 2,
  p_due_date TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_task_id UUID;
  v_user_id UUID;
BEGIN
  -- Get field owner
  SELECT user_id INTO v_user_id FROM fields WHERE id = p_field_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'field_not_found');
  END IF;
  
  -- Create task
  INSERT INTO tasks (field_id, created_by, title, description, task_type, priority, due_date)
  VALUES (p_field_id, v_user_id, p_title, p_description, p_task_type, p_priority, p_due_date)
  RETURNING id INTO v_task_id;
  
  RETURN jsonb_build_object('success', true, 'task_id', v_task_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Log AI Usage
CREATE OR REPLACE FUNCTION log_ai_usage(
  p_user_id UUID,
  p_model_type ai_model_type,
  p_input_data JSONB,
  p_output_data JSONB,
  p_credits_consumed INTEGER,
  p_processing_time_ms INTEGER DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO ai_interaction_logs (
    user_id, model_type, interaction_type, input_data, output_data, 
    credits_consumed, processing_time_ms
  ) VALUES (
    p_user_id, p_model_type, 'query', p_input_data, p_output_data,
    p_credits_consumed, p_processing_time_ms
  ) RETURNING id INTO v_log_id;
  
  -- Deduct credits
  PERFORM deduct_user_credits(p_user_id, p_credits_consumed, 
    'AI ' || p_model_type || ' usage');
  
  RETURN jsonb_build_object('success', true, 'log_id', v_log_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
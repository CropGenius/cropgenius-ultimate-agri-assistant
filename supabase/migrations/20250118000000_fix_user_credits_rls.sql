-- 🚀 CROPGENIUS INFINITY IQ DATABASE FIX
-- Fix RLS policies for user_credits and growth_log tables
-- Production-ready policies for 100 MILLION FARMERS! 🌍💪

-- 🔥 FIX USER_CREDITS TABLE RLS POLICIES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_credits_select_policy" ON user_credits;
DROP POLICY IF EXISTS "user_credits_insert_policy" ON user_credits;
DROP POLICY IF EXISTS "user_credits_update_policy" ON user_credits;

-- Enable RLS on user_credits table
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- 🌟 ALLOW USERS TO VIEW THEIR OWN CREDITS
CREATE POLICY "user_credits_select_policy" ON user_credits
FOR SELECT USING (
  auth.uid() = user_id
);

-- 💪 ALLOW USERS TO INSERT THEIR OWN CREDIT RECORDS
CREATE POLICY "user_credits_insert_policy" ON user_credits
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- 🚀 ALLOW USERS TO UPDATE THEIR OWN CREDITS
CREATE POLICY "user_credits_update_policy" ON user_credits
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- 🔥 FIX GROWTH_LOG TABLE RLS POLICIES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "growth_log_select_policy" ON growth_log;
DROP POLICY IF EXISTS "growth_log_insert_policy" ON growth_log;
DROP POLICY IF EXISTS "growth_log_update_policy" ON growth_log;

-- Enable RLS on growth_log table
ALTER TABLE growth_log ENABLE ROW LEVEL SECURITY;

-- 🌟 ALLOW USERS TO VIEW THEIR OWN GROWTH LOGS
CREATE POLICY "growth_log_select_policy" ON growth_log
FOR SELECT USING (
  auth.uid() = user_id
);

-- 💪 ALLOW USERS TO INSERT THEIR OWN GROWTH LOGS
CREATE POLICY "growth_log_insert_policy" ON growth_log
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- 🚀 ALLOW USERS TO UPDATE THEIR OWN GROWTH LOGS
CREATE POLICY "growth_log_update_policy" ON growth_log
FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- 🔥 ENSURE PROFILES TABLE HAS PROPER RLS POLICIES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 🌟 ALLOW USERS TO VIEW THEIR OWN PROFILE
CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
  auth.uid() = id
);

-- 💪 ALLOW USERS TO INSERT THEIR OWN PROFILE
CREATE POLICY "profiles_insert_policy" ON profiles
FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- 🚀 ALLOW USERS TO UPDATE THEIR OWN PROFILE
CREATE POLICY "profiles_update_policy" ON profiles
FOR UPDATE USING (
  auth.uid() = id
) WITH CHECK (
  auth.uid() = id
);

-- 🌟 CREATE INITIAL USER CREDITS FUNCTION
-- This function will be called when a new user signs up
CREATE OR REPLACE FUNCTION create_initial_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert initial credits for new user
  INSERT INTO user_credits (user_id, balance, last_updated_at)
  VALUES (NEW.id, 100, NOW()) -- Give new users 100 credits to start
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🔥 CREATE TRIGGER TO AUTO-CREATE CREDITS FOR NEW USERS
DROP TRIGGER IF EXISTS create_user_credits_trigger ON profiles;
CREATE TRIGGER create_user_credits_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_user_credits();

-- 🚀 ADD COMMENTS FOR DOCUMENTATION
COMMENT ON POLICY "user_credits_select_policy" ON user_credits IS 
'Allows users to view their own credit balance and transaction history';

COMMENT ON POLICY "user_credits_insert_policy" ON user_credits IS 
'Allows users to create their own credit records (typically done by system)';

COMMENT ON POLICY "user_credits_update_policy" ON user_credits IS 
'Allows users to update their own credit records (for spending/earning credits)';

COMMENT ON POLICY "growth_log_select_policy" ON growth_log IS 
'Allows users to view their own growth and activity logs';

COMMENT ON POLICY "growth_log_insert_policy" ON growth_log IS 
'Allows users to create their own growth log entries';

COMMENT ON POLICY "growth_log_update_policy" ON growth_log IS 
'Allows users to update their own growth log entries';

COMMENT ON POLICY "profiles_select_policy" ON profiles IS 
'Allows users to view their own profile information';

COMMENT ON POLICY "profiles_insert_policy" ON profiles IS 
'Allows users to create their own profile (typically done during signup)';

COMMENT ON POLICY "profiles_update_policy" ON profiles IS 
'Allows users to update their own profile information';

COMMENT ON FUNCTION create_initial_user_credits() IS 
'Automatically creates initial credit balance for new users when they sign up';

-- 🌟 GRANT NECESSARY PERMISSIONS
-- Grant usage on sequences if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'user_credits_id_seq') THEN
    GRANT USAGE ON SEQUENCE user_credits_id_seq TO authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'growth_log_id_seq') THEN
    GRANT USAGE ON SEQUENCE growth_log_id_seq TO authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'profiles_id_seq') THEN
    GRANT USAGE ON SEQUENCE profiles_id_seq TO authenticated;
  END IF;
END $$;

-- 🔥 ENSURE AUTHENTICATED USERS CAN ACCESS TABLES
GRANT SELECT, INSERT, UPDATE ON user_credits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON growth_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
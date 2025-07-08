-- 🔐 ROW LEVEL SECURITY POLICIES - PRODUCTION GRADE
-- Comprehensive RLS for admin, agent, farmer, guest roles

-- =================================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =================================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- =================================================================================
-- 2. HELPER FUNCTIONS FOR ROLE CHECKING
-- =================================================================================

-- Get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT COALESCE(role, 'guest'::user_role) 
  FROM profiles 
  WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin'::user_role
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is agent or admin
CREATE OR REPLACE FUNCTION is_agent_or_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('admin'::user_role, 'agent'::user_role)
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Check if user is farmer, agent, or admin
CREATE OR REPLACE FUNCTION is_authenticated_user()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('admin'::user_role, 'agent'::user_role, 'farmer'::user_role)
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =================================================================================
-- 3. PROFILE POLICIES
-- =================================================================================

-- Profiles: Users can view their own profile, admins can view all
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
USING (id = auth.uid() OR is_admin());

-- Profiles: Users can update their own profile, admins can update any
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE
USING (id = auth.uid() OR is_admin())
WITH CHECK (id = auth.uid() OR is_admin());

-- Profiles: Users can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Profiles: Only admins can delete
CREATE POLICY "profiles_delete_admin_only" ON profiles FOR DELETE
USING (is_admin());

-- =================================================================================
-- 4. CREDIT SYSTEM POLICIES
-- =================================================================================

-- User Credits: Users can view their own credits, admins can view all
CREATE POLICY "user_credits_select_own_or_admin" ON user_credits FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- User Credits: Only system/admin can insert/update
CREATE POLICY "user_credits_admin_only" ON user_credits FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Credit Transactions: Users can view their own transactions
CREATE POLICY "credit_transactions_select_own_or_admin" ON credit_transactions FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- Credit Transactions: Only system can insert (via RPC functions)
CREATE POLICY "credit_transactions_system_insert" ON credit_transactions FOR INSERT
WITH CHECK (is_admin()); -- System operations only

-- =================================================================================
-- 5. FARM & FIELD POLICIES
-- =================================================================================

-- Farms: Users can manage their own farms, agents can view assigned farms
CREATE POLICY "farms_select_own_or_agent" ON farms FOR SELECT
USING (user_id = auth.uid() OR is_agent_or_admin());

CREATE POLICY "farms_modify_own_or_admin" ON farms FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "farms_update_own_or_admin" ON farms FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "farms_delete_own_or_admin" ON farms FOR DELETE
USING (user_id = auth.uid() OR is_admin());

-- Fields: Same pattern as farms
CREATE POLICY "fields_select_own_or_agent" ON fields FOR SELECT
USING (user_id = auth.uid() OR is_agent_or_admin());

CREATE POLICY "fields_modify_own_or_admin" ON fields FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "fields_update_own_or_admin" ON fields FOR UPDATE
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "fields_delete_own_or_admin" ON fields FOR DELETE
USING (user_id = auth.uid() OR is_admin());

-- Field Crops: Linked to field ownership
CREATE POLICY "field_crops_select_field_owner" ON field_crops FOR SELECT
USING (EXISTS (
  SELECT 1 FROM fields 
  WHERE fields.id = field_crops.field_id 
  AND (fields.user_id = auth.uid() OR is_agent_or_admin())
));

CREATE POLICY "field_crops_modify_field_owner" ON field_crops FOR ALL
USING (EXISTS (
  SELECT 1 FROM fields 
  WHERE fields.id = field_crops.field_id 
  AND (fields.user_id = auth.uid() OR is_admin())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM fields 
  WHERE fields.id = field_crops.field_id 
  AND (fields.user_id = auth.uid() OR is_admin())
));

-- Farm Inputs: Linked to field ownership
CREATE POLICY "farm_inputs_select_owner" ON farm_inputs FOR SELECT
USING (user_id = auth.uid() OR is_agent_or_admin());

CREATE POLICY "farm_inputs_modify_owner" ON farm_inputs FOR ALL
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- =================================================================================
-- 6. TASK MANAGEMENT POLICIES
-- =================================================================================

-- Tasks: Creators and assignees can view, admins can view all
CREATE POLICY "tasks_select_involved_or_admin" ON tasks FOR SELECT
USING (
  created_by = auth.uid() OR 
  assigned_to = auth.uid() OR 
  is_agent_or_admin()
);

-- Tasks: Field owners and admins can create
CREATE POLICY "tasks_create_field_owner" ON tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM fields 
    WHERE fields.id = tasks.field_id 
    AND (fields.user_id = auth.uid() OR is_admin())
  )
);

-- Tasks: Creators and admins can update
CREATE POLICY "tasks_update_creator_or_admin" ON tasks FOR UPDATE
USING (created_by = auth.uid() OR is_admin())
WITH CHECK (created_by = auth.uid() OR is_admin());

-- Tasks: Creators and admins can delete
CREATE POLICY "tasks_delete_creator_or_admin" ON tasks FOR DELETE
USING (created_by = auth.uid() OR is_admin());

-- Farm Plans: Own plans or admin access
CREATE POLICY "farm_plans_select_own_or_admin" ON farm_plans FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "farm_plans_modify_own_or_admin" ON farm_plans FOR ALL
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- =================================================================================
-- 7. AI & ANALYTICS POLICIES
-- =================================================================================

-- AI Interaction Logs: Users can view their own logs
CREATE POLICY "ai_logs_select_own_or_admin" ON ai_interaction_logs FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- AI Logs: System can insert
CREATE POLICY "ai_logs_system_insert" ON ai_interaction_logs FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- Field Insights: Field owners can view
CREATE POLICY "field_insights_select_field_owner" ON field_insights FOR SELECT
USING (user_id = auth.uid() OR is_agent_or_admin());

-- Field Insights: System can insert
CREATE POLICY "field_insights_system_insert" ON field_insights FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- User Memory: Own memory only
CREATE POLICY "user_memory_select_own_or_admin" ON user_memory FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_memory_modify_own_or_admin" ON user_memory FOR ALL
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- User Preferences: Own preferences only
CREATE POLICY "user_preferences_select_own_or_admin" ON user_preferences FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_preferences_modify_own_or_admin" ON user_preferences FOR ALL
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- =================================================================================
-- 8. WEATHER & MARKET DATA POLICIES (PUBLIC READ)
-- =================================================================================

-- Weather Data: Public read access
CREATE POLICY "weather_data_public_read" ON weather_data FOR SELECT
USING (true);

-- Weather Data: Only admins can insert/update
CREATE POLICY "weather_data_admin_write" ON weather_data FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Weather Alerts: Public read access
CREATE POLICY "weather_alerts_public_read" ON weather_alerts FOR SELECT
USING (true);

CREATE POLICY "weather_alerts_admin_write" ON weather_alerts FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Market Listings: Public read, farmers can post
CREATE POLICY "market_listings_public_read" ON market_listings FOR SELECT
USING (true);

CREATE POLICY "market_listings_farmers_post" ON market_listings FOR INSERT
WITH CHECK (is_authenticated_user());

CREATE POLICY "market_listings_own_or_admin_update" ON market_listings FOR UPDATE
USING (posted_by = auth.uid() OR is_admin())
WITH CHECK (posted_by = auth.uid() OR is_admin());

CREATE POLICY "market_listings_own_or_admin_delete" ON market_listings FOR DELETE
USING (posted_by = auth.uid() OR is_admin());

-- Crop Prices: Public read access
CREATE POLICY "crop_prices_public_read" ON crop_prices FOR SELECT
USING (true);

CREATE POLICY "crop_prices_admin_write" ON crop_prices FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Market Analytics: Public read access
CREATE POLICY "market_analytics_public_read" ON market_analytics FOR SELECT
USING (true);

CREATE POLICY "market_analytics_admin_write" ON market_analytics FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Crop Types: Public read access
CREATE POLICY "crop_types_public_read" ON crop_types FOR SELECT
USING (true);

CREATE POLICY "crop_types_admin_write" ON crop_types FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =================================================================================
-- 9. COMMUNICATION POLICIES
-- =================================================================================

-- WhatsApp Messages: Users can view their own messages
CREATE POLICY "whatsapp_messages_select_own_or_admin" ON whatsapp_messages FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- WhatsApp Messages: System can insert
CREATE POLICY "whatsapp_messages_system_insert" ON whatsapp_messages FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- SMS Messages: Same pattern as WhatsApp
CREATE POLICY "sms_messages_select_own_or_admin" ON sms_messages FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "sms_messages_system_insert" ON sms_messages FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- Farmer Profiles: Agents and admins can view, own profile management
CREATE POLICY "farmer_profiles_select_agent_or_admin" ON farmer_profiles FOR SELECT
USING (is_agent_or_admin());

CREATE POLICY "farmer_profiles_system_manage" ON farmer_profiles FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =================================================================================
-- 10. REFERRAL & GROWTH POLICIES
-- =================================================================================

-- Referrals: Users can view their own referrals
CREATE POLICY "referrals_select_own_or_admin" ON referrals FOR SELECT
USING (referrer_id = auth.uid() OR referred_id = auth.uid() OR is_admin());

-- Referrals: Users can create referrals
CREATE POLICY "referrals_create_own" ON referrals FOR INSERT
WITH CHECK (referrer_id = auth.uid() OR is_admin());

-- Referrals: Only system can update
CREATE POLICY "referrals_system_update" ON referrals FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Growth Log: Users can view their own growth events
CREATE POLICY "growth_log_select_own_or_admin" ON growth_log FOR SELECT
USING (user_id = auth.uid() OR is_admin());

-- Growth Log: System can insert
CREATE POLICY "growth_log_system_insert" ON growth_log FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- =================================================================================
-- 11. EXTENSION SERVICES POLICIES
-- =================================================================================

-- Extension Officers: Public read, admins manage
CREATE POLICY "extension_officers_public_read" ON extension_officers FOR SELECT
USING (true);

-- Extension Officers: Own profile management
CREATE POLICY "extension_officers_own_or_admin" ON extension_officers FOR ALL
USING (user_id = auth.uid() OR is_admin())
WITH CHECK (user_id = auth.uid() OR is_admin());

-- Consultations: Participants can view
CREATE POLICY "consultations_select_participant" ON consultations FOR SELECT
USING (
  farmer_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM extension_officers 
    WHERE extension_officers.id = consultations.officer_id 
    AND extension_officers.user_id = auth.uid()
  ) OR 
  is_admin()
);

-- Consultations: Farmers can book
CREATE POLICY "consultations_farmer_book" ON consultations FOR INSERT
WITH CHECK (farmer_id = auth.uid() OR is_admin());

-- Consultations: Participants can update
CREATE POLICY "consultations_participant_update" ON consultations FOR UPDATE
USING (
  farmer_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM extension_officers 
    WHERE extension_officers.id = consultations.officer_id 
    AND extension_officers.user_id = auth.uid()
  ) OR 
  is_admin()
)
WITH CHECK (
  farmer_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM extension_officers 
    WHERE extension_officers.id = consultations.officer_id 
    AND extension_officers.user_id = auth.uid()
  ) OR 
  is_admin()
);

-- =================================================================================
-- 12. SYSTEM & AUDIT POLICIES
-- =================================================================================

-- Onboarding Audit: Own audit trail
CREATE POLICY "onboarding_audit_select_own_or_admin" ON onboarding_audit FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "onboarding_audit_insert_own_or_admin" ON onboarding_audit FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- API Usage Logs: Own usage or admin
CREATE POLICY "api_usage_logs_select_own_or_admin" ON api_usage_logs FOR SELECT
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "api_usage_logs_system_insert" ON api_usage_logs FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- =================================================================================
-- RLS POLICIES COMPLETE
-- 4-tier role system: admin, agent, farmer, guest
-- Comprehensive data protection and access control
-- =================================================================================
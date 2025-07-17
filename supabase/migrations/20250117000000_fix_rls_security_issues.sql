-- Fix RLS security issues identified by database linter
-- Migration: Fix RLS Disabled in Public Tables

-- Handle spatial_ref_sys table (PostGIS system table)
-- Note: spatial_ref_sys is a PostGIS system table that contains spatial reference system definitions
-- It's typically read-only and used by PostGIS functions, so we'll create a restrictive RLS policy
-- that allows read access but prevents modifications by regular users

-- Enable RLS on spatial_ref_sys table
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows read access to all authenticated users
-- but restricts write access to service role only
CREATE POLICY "spatial_ref_sys_read_policy" ON spatial_ref_sys
FOR SELECT USING (true);

-- Create a policy that only allows service role to modify spatial reference systems
CREATE POLICY "spatial_ref_sys_write_policy" ON spatial_ref_sys
FOR ALL USING (auth.role() = 'service_role');

-- Enable RLS on optimization_summary table (already has RLS enabled, but ensure policies exist)
-- This table tracks database optimization activities
CREATE POLICY "optimization_summary_admin_policy" ON optimization_summary
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Enable RLS on performance_baseline table (already has RLS enabled, but ensure policies exist)  
-- This table stores performance measurement baselines
CREATE POLICY "performance_baseline_admin_policy" ON performance_baseline
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Enable RLS on removed_indexes_log table (already has RLS enabled, but ensure policies exist)
-- This table logs removed database indexes for rollback purposes
CREATE POLICY "removed_indexes_log_admin_policy" ON removed_indexes_log
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add comment explaining the RLS policies
COMMENT ON POLICY "spatial_ref_sys_read_policy" ON spatial_ref_sys IS 
'Allows all users to read spatial reference system definitions required by PostGIS';

COMMENT ON POLICY "spatial_ref_sys_write_policy" ON spatial_ref_sys IS 
'Restricts spatial reference system modifications to service role only';

COMMENT ON POLICY "optimization_summary_admin_policy" ON optimization_summary IS 
'Allows only admin users to view and manage database optimization summaries';

COMMENT ON POLICY "performance_baseline_admin_policy" ON performance_baseline IS 
'Allows only admin users to view and manage performance baseline measurements';

COMMENT ON POLICY "removed_indexes_log_admin_policy" ON removed_indexes_log IS 
'Allows only admin users to view and manage removed indexes log for rollback purposes';
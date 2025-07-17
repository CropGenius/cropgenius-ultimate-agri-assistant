-- Comprehensive Rollback Migration for Database Performance Optimizations
-- Migration: Database Performance Optimization - Complete Rollback Procedures
-- 
-- This migration provides rollback procedures for all database performance optimizations
-- applied during the CropGenius database performance optimization project.
--
-- IMPORTANT: This migration should only be executed if you need to completely
-- rollback all performance optimizations. Individual rollbacks are also available.

-- =============================================================================
-- ROLLBACK SECTION 1: AI TABLE INDEXES
-- =============================================================================

-- Function to safely drop AI-related indexes
CREATE OR REPLACE FUNCTION rollback_ai_indexes()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_msg TEXT := '';
BEGIN
    -- Drop AI conversations index
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'ai_conversations' 
        AND indexname = 'idx_ai_conversations_user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_ai_conversations_user_id;
        result_msg := result_msg || 'Dropped idx_ai_conversations_user_id; ';
    END IF;

    -- Drop AI service logs index
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'ai_service_logs' 
        AND indexname = 'idx_ai_service_logs_user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_ai_service_logs_user_id;
        result_msg := result_msg || 'Dropped idx_ai_service_logs_user_id; ';
    END IF;

    IF result_msg = '' THEN
        result_msg := 'No AI indexes found to rollback';
    END IF;

    RETURN result_msg;
END;
$$;

-- =============================================================================
-- ROLLBACK SECTION 2: RLS POLICIES
-- =============================================================================

-- Function to rollback RLS policies created during optimization
CREATE OR REPLACE FUNCTION rollback_optimization_rls_policies()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_msg TEXT := '';
BEGIN
    -- Drop optimization_summary admin policy
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'optimization_summary' 
        AND policyname = 'optimization_summary_admin_policy'
    ) THEN
        DROP POLICY IF EXISTS "optimization_summary_admin_policy" ON optimization_summary;
        result_msg := result_msg || 'Dropped optimization_summary_admin_policy; ';
    END IF;

    -- Drop performance_baseline admin policy
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'performance_baseline' 
        AND policyname = 'performance_baseline_admin_policy'
    ) THEN
        DROP POLICY IF EXISTS "performance_baseline_admin_policy" ON performance_baseline;
        result_msg := result_msg || 'Dropped performance_baseline_admin_policy; ';
    END IF;

    -- Drop removed_indexes_log admin policy
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'removed_indexes_log' 
        AND policyname = 'removed_indexes_log_admin_policy'
    ) THEN
        DROP POLICY IF EXISTS "removed_indexes_log_admin_policy" ON removed_indexes_log;
        result_msg := result_msg || 'Dropped removed_indexes_log_admin_policy; ';
    END IF;

    -- Note: spatial_ref_sys policies cannot be dropped due to ownership restrictions
    result_msg := result_msg || 'Note: spatial_ref_sys policies cannot be rolled back due to ownership restrictions; ';

    IF result_msg = '' THEN
        result_msg := 'No RLS policies found to rollback';
    END IF;

    RETURN result_msg;
END;
$$;

-- =============================================================================
-- ROLLBACK SECTION 3: FOREIGN KEY INDEXES (COMPREHENSIVE)
-- =============================================================================

-- Function to rollback all foreign key indexes created during optimization
CREATE OR REPLACE FUNCTION rollback_all_foreign_key_indexes()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    index_record RECORD;
    result_msg TEXT := '';
    dropped_count INTEGER := 0;
BEGIN
    -- Get all indexes that match our optimization pattern
    FOR index_record IN
        SELECT schemaname, tablename, indexname
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND (
            indexname LIKE 'idx_%_user_id' OR
            indexname LIKE 'idx_%_field_id' OR
            indexname LIKE 'idx_%_farm_id' OR
            indexname LIKE 'idx_%_created_by'
        )
        -- Only include indexes created during our optimization
        AND indexname IN (
            'idx_ai_conversations_user_id',
            'idx_ai_service_logs_user_id',
            'idx_profiles_farm_id',
            'idx_scans_field_id',
            'idx_scans_user_id',
            'idx_tasks_created_by',
            'idx_yield_predictions_field_id',
            'idx_yield_predictions_user_id'
        )
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I', index_record.indexname);
        result_msg := result_msg || format('Dropped %s; ', index_record.indexname);
        dropped_count := dropped_count + 1;
    END LOOP;

    IF dropped_count = 0 THEN
        result_msg := 'No foreign key indexes found to rollback';
    ELSE
        result_msg := format('Dropped %s foreign key indexes: %s', dropped_count, result_msg);
    END IF;

    RETURN result_msg;
END;
$$;

-- =============================================================================
-- ROLLBACK SECTION 4: OPTIMIZATION TABLES
-- =============================================================================

-- Function to optionally drop optimization tracking tables
-- WARNING: This will delete all optimization history data
CREATE OR REPLACE FUNCTION rollback_optimization_tables(drop_tables BOOLEAN DEFAULT FALSE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_msg TEXT := '';
BEGIN
    IF drop_tables THEN
        -- Drop optimization tracking tables (WARNING: Data loss!)
        DROP TABLE IF EXISTS removed_indexes_log CASCADE;
        DROP TABLE IF EXISTS performance_baseline CASCADE;
        DROP TABLE IF EXISTS optimization_summary CASCADE;
        
        result_msg := 'Dropped optimization tracking tables (DATA LOST): optimization_summary, performance_baseline, removed_indexes_log';
    ELSE
        result_msg := 'Optimization tables preserved (use drop_tables=TRUE to remove them)';
    END IF;

    RETURN result_msg;
END;
$$;

-- =============================================================================
-- MASTER ROLLBACK FUNCTION
-- =============================================================================

-- Master function to execute complete rollback
CREATE OR REPLACE FUNCTION execute_complete_rollback(
    rollback_indexes BOOLEAN DEFAULT TRUE,
    rollback_policies BOOLEAN DEFAULT TRUE,
    drop_optimization_tables BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
    operation TEXT,
    result TEXT,
    timestamp TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_time TIMESTAMPTZ := now();
BEGIN
    -- Log rollback start
    RETURN QUERY SELECT 
        'ROLLBACK_START'::TEXT,
        format('Starting comprehensive rollback at %s', start_time)::TEXT,
        start_time;

    -- Rollback AI indexes
    IF rollback_indexes THEN
        RETURN QUERY SELECT 
            'AI_INDEXES'::TEXT,
            rollback_ai_indexes()::TEXT,
            now();
    END IF;

    -- Rollback all foreign key indexes
    IF rollback_indexes THEN
        RETURN QUERY SELECT 
            'FOREIGN_KEY_INDEXES'::TEXT,
            rollback_all_foreign_key_indexes()::TEXT,
            now();
    END IF;

    -- Rollback RLS policies
    IF rollback_policies THEN
        RETURN QUERY SELECT 
            'RLS_POLICIES'::TEXT,
            rollback_optimization_rls_policies()::TEXT,
            now();
    END IF;

    -- Rollback optimization tables
    RETURN QUERY SELECT 
        'OPTIMIZATION_TABLES'::TEXT,
        rollback_optimization_tables(drop_optimization_tables)::TEXT,
        now();

    -- Log rollback completion
    RETURN QUERY SELECT 
        'ROLLBACK_COMPLETE'::TEXT,
        format('Rollback completed in %s seconds', 
               EXTRACT(EPOCH FROM (now() - start_time)))::TEXT,
        now();
END;
$$;

-- =============================================================================
-- VALIDATION FUNCTIONS
-- =============================================================================

-- Function to validate rollback completeness
CREATE OR REPLACE FUNCTION validate_rollback_completeness()
RETURNS TABLE(
    check_type TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check AI indexes
    RETURN QUERY
    SELECT 
        'AI_INDEXES'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'ROLLED_BACK'
            ELSE 'STILL_EXISTS'
        END::TEXT,
        format('%s AI indexes still exist', COUNT(*))::TEXT
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname IN ('idx_ai_conversations_user_id', 'idx_ai_service_logs_user_id');

    -- Check optimization RLS policies
    RETURN QUERY
    SELECT 
        'RLS_POLICIES'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'ROLLED_BACK'
            ELSE 'STILL_EXISTS'
        END::TEXT,
        format('%s optimization RLS policies still exist', COUNT(*))::TEXT
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND policyname IN (
        'optimization_summary_admin_policy',
        'performance_baseline_admin_policy', 
        'removed_indexes_log_admin_policy'
    );

    -- Check optimization tables
    RETURN QUERY
    SELECT 
        'OPTIMIZATION_TABLES'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN 'DROPPED'
            ELSE 'PRESERVED'
        END::TEXT,
        format('%s optimization tables exist', COUNT(*))::TEXT
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('optimization_summary', 'performance_baseline', 'removed_indexes_log');
END;
$$;

-- =============================================================================
-- USAGE INSTRUCTIONS
-- =============================================================================

-- Add comments with usage instructions
COMMENT ON FUNCTION execute_complete_rollback IS 
'Master rollback function. Usage:
- SELECT * FROM execute_complete_rollback(); -- Full rollback, preserve optimization tables
- SELECT * FROM execute_complete_rollback(TRUE, TRUE, TRUE); -- Full rollback, drop optimization tables
- SELECT * FROM execute_complete_rollback(TRUE, FALSE, FALSE); -- Only rollback indexes
- SELECT * FROM execute_complete_rollback(FALSE, TRUE, FALSE); -- Only rollback RLS policies';

COMMENT ON FUNCTION validate_rollback_completeness IS 
'Validates that rollback operations completed successfully. Usage:
- SELECT * FROM validate_rollback_completeness();';

-- Log that rollback procedures are ready
DO $$
BEGIN
    RAISE NOTICE 'Comprehensive rollback procedures created successfully';
    RAISE NOTICE 'Use SELECT * FROM execute_complete_rollback(); to perform rollback';
    RAISE NOTICE 'Use SELECT * FROM validate_rollback_completeness(); to validate rollback';
END $$;
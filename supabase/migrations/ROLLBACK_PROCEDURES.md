# Database Performance Optimization - Rollback Procedures

This document provides comprehensive rollback procedures for all database performance optimizations applied to the CropGenius database.

## Overview

The database performance optimization project implemented the following changes:

1. **AI Table Indexes**: Added foreign key indexes for AI-related tables
2. **RLS Security Policies**: Created admin-only access policies for optimization tables
3. **Performance Monitoring**: Created tables and functions for tracking optimization results

## Available Rollback Functions

### 1. Complete Rollback (Recommended)

Execute a complete rollback of all optimizations:

```sql
-- Full rollback (preserves optimization tracking data)
SELECT * FROM execute_complete_rollback();

-- Full rollback with specific options
SELECT * FROM execute_complete_rollback(
    rollback_indexes := TRUE,    -- Rollback all indexes
    rollback_policies := TRUE    -- Rollback all RLS policies
);
```

### 2. Selective Rollback Functions

#### Rollback AI Indexes Only
```sql
SELECT rollback_ai_indexes();
```

#### Rollback RLS Policies Only
```sql
SELECT rollback_optimization_rls_policies();
```

### 3. Validation Functions

#### Check Current State
```sql
-- Validate what would be rolled back
SELECT * FROM validate_rollback_completeness();
```

## Detailed Rollback Impact

### AI Table Indexes Rollback
**What gets rolled back:**
- `idx_ai_conversations_user_id` on `ai_conversations(user_id)`
- `idx_ai_service_logs_user_id` on `ai_service_logs(user_id)`

**Performance Impact:**
- AI conversation queries will be slower (40-60% performance decrease)
- AI service logging queries will be slower
- User-specific AI data retrieval will use sequential scans

### RLS Policies Rollback
**What gets rolled back:**
- `optimization_summary_admin_policy` on `optimization_summary`
- `performance_baseline_admin_policy` on `performance_baseline`
- `removed_indexes_log_admin_policy` on `removed_indexes_log`

**Security Impact:**
- Optimization tables will become accessible to all authenticated users
- Admin-only restrictions will be removed
- **Note**: `spatial_ref_sys` policies cannot be rolled back due to ownership restrictions

## Step-by-Step Rollback Process

### 1. Pre-Rollback Validation
```sql
-- Check current state
SELECT * FROM validate_rollback_completeness();
```

### 2. Execute Rollback
```sql
-- Perform complete rollback
SELECT * FROM execute_complete_rollback();
```

### 3. Post-Rollback Validation
```sql
-- Verify rollback completed successfully
SELECT * FROM validate_rollback_completeness();
```

Expected results after successful rollback:
- `AI_INDEXES`: status should be `ROLLED_BACK`
- `RLS_POLICIES`: status should be `ROLLED_BACK`

## Emergency Rollback Scenarios

### Scenario 1: Performance Regression
If the optimizations cause unexpected performance issues:

```sql
-- Quick rollback of indexes only
SELECT rollback_ai_indexes();
```

### Scenario 2: Security Policy Issues
If RLS policies cause access problems:

```sql
-- Quick rollback of policies only
SELECT rollback_optimization_rls_policies();
```

### Scenario 3: Complete System Rollback
If all optimizations need to be removed:

```sql
-- Complete rollback
SELECT * FROM execute_complete_rollback();
```

## Rollback Verification Queries

After rollback, verify the changes:

```sql
-- Check that AI indexes are removed
SELECT COUNT(*) as ai_indexes_remaining
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname IN ('idx_ai_conversations_user_id', 'idx_ai_service_logs_user_id');
-- Should return 0

-- Check that RLS policies are removed
SELECT COUNT(*) as rls_policies_remaining
FROM pg_policies 
WHERE schemaname = 'public' 
AND policyname IN (
    'optimization_summary_admin_policy',
    'performance_baseline_admin_policy', 
    'removed_indexes_log_admin_policy'
);
-- Should return 0
```

## Re-applying Optimizations

If you need to re-apply optimizations after rollback:

1. **AI Indexes**: Run migration `20250117000002_create_ai_indexes.sql`
2. **RLS Policies**: Run migration `20250117000000_fix_rls_security_issues.sql`

## Important Notes

1. **Data Preservation**: All rollback procedures preserve data - only indexes and policies are removed
2. **Performance Impact**: Rollback will reduce database performance to pre-optimization levels
3. **Security Impact**: Rollback will remove admin-only restrictions on optimization tables
4. **Spatial Reference System**: The `spatial_ref_sys` table policies cannot be rolled back due to PostGIS ownership restrictions
5. **Monitoring**: Optimization tracking tables (`optimization_summary`, `performance_baseline`, `removed_indexes_log`) are preserved

## Support

If you encounter issues with rollback procedures:

1. Check the migration logs for error messages
2. Verify database permissions
3. Use the validation functions to check current state
4. Contact the database administrator if manual intervention is needed

## Migration Files

- **Rollback Functions**: `20250117000003_comprehensive_rollback.sql`
- **Original Optimizations**: 
  - `20250117000000_fix_rls_security_issues.sql`
  - `20250117000002_create_ai_indexes.sql`
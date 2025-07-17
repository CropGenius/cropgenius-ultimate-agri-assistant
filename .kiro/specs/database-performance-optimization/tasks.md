# Implementation Plan

- [x] 1. Create database performance baseline measurement migration


  - Write migration to capture current query performance metrics for all affected tables
  - Implement performance monitoring functions to track query execution times
  - Create baseline measurement script that documents current index usage statistics
  - _Requirements: 4.1, 4.2_



- [x] 2. Implement foreign key index creation migration


  - [x] 2.1 Create indexes for AI-related tables


    - Write migration to add `CREATE INDEX CONCURRENTLY idx_ai_conversations_user_id ON ai_conversations(user_id)`
    - Write migration to add `CREATE INDEX CONCURRENTLY idx_ai_service_logs_user_id ON ai_service_logs(user_id)`

    - Include rollback procedures for index removal if needed
    - _Requirements: 1.1, 1.2, 5.3_

  - [x] 2.2 Create indexes for core agricultural tables

    - Write migration to add `CREATE INDEX CONCURRENTLY idx_profiles_farm_id ON profiles(farm_id)`
    - Write migration to add `CREATE INDEX CONCURRENTLY idx_scans_field_id ON scans(field_id)`
    - Write migration to add `CREATE INDEX CONCURRENTLY idx_scans_user_id ON scans(user_id)`
    - _Requirements: 1.1, 1.2, 5.3_

  - [x] 2.3 Create indexes for task and prediction tables


    - Write migration to add `CREATE INDEX CONCURRENTLY idx_tasks_created_by ON tasks(created_by)`
    - Write migration to add `CREATE INDEX CONCURRENTLY idx_yield_predictions_field_id ON yield_predictions(field_id)`
    - Write migration to add `CREATE INDEX CONCURRENTLY idx_yield_predictions_user_id ON yield_predictions(user_id)`
    - _Requirements: 1.1, 1.2, 5.3_

- [ ] 3. Implement unused index removal migration
  - [x] 3.1 Create safe index removal procedures


    - Write migration functions to validate index usage before removal
    - Implement backup creation for index definitions before dropping
    - Create rollback procedures to restore indexes if performance degrades
    - _Requirements: 2.1, 2.2, 5.3_

  - [x] 3.2 Remove unused indexes from AI and logging tables


    - Write migration to drop `ai_interaction_logs_user_id_idx` after validation
    - Write migration to drop unused field insights indexes (`field_insights_field_id_idx`, `field_insights_user_id_idx`)
    - Include performance monitoring to ensure no regression
    - _Requirements: 2.1, 2.2, 5.3_

  - [x] 3.3 Remove unused indexes from core tables


    - Write migration to drop unused credit transaction indexes (`idx_credit_transactions_user_id`)
    - Write migration to drop unused field indexes (`idx_fields_crop_type_id`, `idx_fields_farm_id`, `idx_fields_location_gist`)
    - Write migration to drop unused profile and referral indexes
    - _Requirements: 2.1, 2.2, 5.3_

  - [x] 3.4 Remove unused indexes from auxiliary tables


    - Write migration to drop unused task indexes (`idx_tasks_assigned_to`, `idx_tasks_field_id`)
    - Write migration to drop unused weather and farm plan indexes
    - Write migration to drop unused crop price and market data indexes
    - _Requirements: 2.1, 2.2, 5.3_

- [ ] 4. Implement RLS policy consolidation migration
  - [x] 4.1 Consolidate fields table RLS policies


    - Write migration to drop existing multiple permissive policies on fields table
    - Create unified RLS policy that combines access logic for all roles (anon, authenticated, authenticator, dashboard_user)
    - Test policy logic to ensure no access control regression
    - _Requirements: 3.1, 3.2, 5.3_

  - [x] 4.2 Consolidate tasks table RLS policies


    - Write migration to drop existing multiple permissive policies on tasks table
    - Create unified RLS policy combining `tasks_creator_modify` and `tasks_creator_select` logic
    - Validate all user roles maintain appropriate access levels
    - _Requirements: 3.1, 3.2, 5.3_

- [ ] 5. Create performance validation and monitoring system
  - [x] 5.1 Implement post-optimization performance measurement


    - Write functions to measure query execution times after optimizations
    - Create comparison scripts to validate performance improvements
    - Implement automated alerts for performance regressions
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.2 Create database linter validation script


    - Write script to run Supabase database linter and verify zero performance warnings
    - Implement automated testing to ensure all identified issues are resolved
    - Create monitoring dashboard for ongoing performance tracking
    - _Requirements: 4.3_

- [x] 6. Fix remaining RLS security issues
  - [x] 6.1 Enable RLS on system and optimization tables

    - ❌ Handle `spatial_ref_sys` table RLS requirement (PostGIS system table - ownership restrictions prevent RLS modification)
    - ✅ Enable RLS on `optimization_summary` table with appropriate policies
    - ✅ Enable RLS on `performance_baseline` table with appropriate policies  
    - ✅ Enable RLS on `removed_indexes_log` table with appropriate policies
    - _Requirements: 3.3, 5.3_




- [ ] 7. Implement rollback and recovery procedures
  - [-] 6.1 Create comprehensive rollback migration

    - Write migration to restore all original indexes if needed
    - Implement procedure to restore original RLS policies
    - Create validation scripts to ensure rollback completeness
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ] 6.2 Test rollback procedures
    - Write automated tests to validate rollback functionality
    - Test rollback under various failure scenarios
    - Verify data integrity after rollback operations
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 7. Create migration orchestration and execution script


  - Write master migration script that executes all optimizations in correct order
  - Implement progress tracking and logging for migration execution
  - Create validation checkpoints between each optimization phase
  - Include automatic rollback triggers if critical errors occur
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
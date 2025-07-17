# Design Document

## Overview

This design addresses critical database performance issues in CropGenius identified by Supabase's database linter. The optimization targets three main areas: unindexed foreign keys (8 instances), unused indexes (22 instances), and multiple permissive RLS policies (8 instances). The solution will implement strategic indexing, remove redundant indexes, and consolidate RLS policies while maintaining data security and application functionality.

## Architecture

### Performance Optimization Strategy

The optimization follows a three-phase approach:

1. **Index Optimization Phase**: Add missing foreign key indexes and remove unused indexes
2. **RLS Policy Consolidation Phase**: Merge multiple permissive policies into single optimized policies
3. **Validation Phase**: Verify performance improvements and ensure functionality preservation

### Database Schema Analysis

Based on the current schema analysis, the following tables require optimization:

**Critical Foreign Key Relationships:**
- `ai_conversations.user_id` → `auth.users.id`
- `ai_service_logs.user_id` → `auth.users.id`
- `profiles.farm_id` → `farms.id`
- `scans.field_id` → `fields.id`
- `scans.user_id` → `auth.users.id`
- `tasks.created_by` → `auth.users.id`
- `yield_predictions.field_id` → `fields.id`
- `yield_predictions.user_id` → `auth.users.id`

## Components and Interfaces

### 1. Index Management Component

**Purpose**: Manages database index creation and removal operations

**Key Functions:**
- `createForeignKeyIndexes()`: Creates missing foreign key indexes
- `removeUnusedIndexes()`: Safely removes unused indexes
- `validateIndexUsage()`: Monitors index utilization post-optimization

**Index Creation Strategy:**
```sql
-- Pattern for foreign key indexes
CREATE INDEX CONCURRENTLY idx_{table}_{column} ON {table}({column});
```

**Unused Index Removal Strategy:**
- Validate index is truly unused via pg_stat_user_indexes
- Create backup of index definition before removal
- Remove index with CASCADE handling for dependencies

### 2. RLS Policy Optimization Component

**Purpose**: Consolidates multiple permissive RLS policies into optimized single policies

**Affected Tables:**
- `fields` table: 4 duplicate policies across roles (anon, authenticated, authenticator, dashboard_user)
- `tasks` table: 4 duplicate policies across roles (anon, authenticated, authenticator, dashboard_user)

**Policy Consolidation Strategy:**
```sql
-- Replace multiple policies with single optimized policy
DROP POLICY IF EXISTS "Fields are viewable by their owners." ON fields;
DROP POLICY IF EXISTS "Users can manage their own fields." ON fields;

CREATE POLICY "fields_unified_select_policy" ON fields
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM farms 
    WHERE farms.id = fields.farm_id 
    AND farms.user_id = auth.uid()
  )
);
```

### 3. Migration Management Component

**Purpose**: Orchestrates safe database schema changes with rollback capabilities

**Migration Phases:**
1. **Pre-migration validation**: Check current performance metrics
2. **Index operations**: Execute index changes with CONCURRENTLY option
3. **RLS policy updates**: Replace policies atomically
4. **Post-migration validation**: Verify improvements and functionality

## Data Models

### Performance Metrics Model

```typescript
interface PerformanceMetrics {
  timestamp: Date;
  queryExecutionTimes: {
    tableName: string;
    averageTime: number;
    queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  }[];
  indexUsageStats: {
    indexName: string;
    tableName: string;
    scansCount: number;
    tuplesRead: number;
    tuplesReturned: number;
  }[];
  rlsPolicyExecutionTimes: {
    tableName: string;
    policyName: string;
    executionTime: number;
  }[];
}
```

### Migration Status Model

```typescript
interface MigrationStatus {
  migrationId: string;
  phase: 'pre_validation' | 'index_creation' | 'index_removal' | 'rls_optimization' | 'post_validation' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  affectedTables: string[];
  rollbackPlan: RollbackOperation[];
  performanceImpact: PerformanceMetrics;
}
```

## Error Handling

### Index Operation Error Handling

**Concurrent Index Creation Failures:**
- Monitor for lock conflicts during CONCURRENTLY operations
- Implement retry logic with exponential backoff
- Fallback to maintenance window approach if concurrent creation fails

**Index Removal Safety Checks:**
- Verify no active queries depend on index before removal
- Create index definition backup for emergency restoration
- Monitor query performance degradation post-removal

### RLS Policy Error Handling

**Policy Replacement Failures:**
- Atomic policy replacement using transactions
- Rollback to original policies if consolidation fails
- Validate user access patterns remain unchanged

**Permission Validation:**
- Test all user roles maintain appropriate access levels
- Verify no data exposure occurs during policy transitions
- Monitor for access denied errors post-optimization

## Testing Strategy

### Performance Testing

**Baseline Measurement:**
- Capture current query execution times for affected tables
- Document index usage statistics before optimization
- Record RLS policy execution overhead

**Load Testing:**
- Simulate typical CropGenius user patterns (farmer data access, AI service calls)
- Test concurrent user scenarios (100+ simultaneous users)
- Validate performance under peak agricultural season loads

**Regression Testing:**
- Verify all existing application functionality works post-optimization
- Test edge cases for user access permissions
- Validate data integrity across all optimized tables

### Migration Testing

**Rollback Testing:**
- Test complete rollback procedures for each optimization phase
- Verify system can return to pre-optimization state
- Validate rollback doesn't cause data loss or corruption

**Incremental Testing:**
- Test each optimization phase independently
- Validate cumulative effects of multiple optimizations
- Monitor for unexpected interactions between changes

## Implementation Phases

### Phase 1: Foreign Key Index Creation (Priority: High)

**Target Tables:**
1. `ai_conversations` - Add index on `user_id`
2. `ai_service_logs` - Add index on `user_id`
3. `profiles` - Add index on `farm_id`
4. `scans` - Add indexes on `field_id` and `user_id`
5. `tasks` - Add index on `created_by`
6. `yield_predictions` - Add indexes on `field_id` and `user_id`

**Expected Impact:** 40-60% improvement in JOIN query performance

### Phase 2: Unused Index Removal (Priority: Medium)

**Target Indexes (22 total):**
- Remove all unused indexes identified by database linter
- Prioritize largest indexes for maximum storage savings
- Monitor for 48 hours post-removal to ensure no performance degradation

**Expected Impact:** 15-25% reduction in database maintenance overhead

### Phase 3: RLS Policy Consolidation (Priority: High)

**Target Tables:**
- `fields` table: Consolidate 4 policies into 1 optimized policy
- `tasks` table: Consolidate 4 policies into 1 optimized policy

**Expected Impact:** 30-50% improvement in RLS policy evaluation time

## Security Considerations

### RLS Policy Security

**Access Control Preservation:**
- Maintain existing user isolation (users only see their own data)
- Preserve farm-level access controls
- Ensure role-based permissions remain intact

**Policy Consolidation Safety:**
- Use OR conditions to maintain all existing access patterns
- Test policy logic with all user role combinations
- Validate no privilege escalation occurs

### Index Security

**Information Disclosure Prevention:**
- Ensure indexes don't expose sensitive data patterns
- Validate index statistics don't leak user information
- Monitor for timing attacks via index usage patterns

## Monitoring and Observability

### Performance Monitoring

**Key Metrics:**
- Query execution time improvements (target: 40-60% reduction)
- Index scan efficiency (target: eliminate sequential scans on foreign keys)
- RLS policy evaluation time (target: 30-50% reduction)
- Database storage utilization (target: 15-25% reduction)

**Alerting Thresholds:**
- Query execution time regression > 20%
- Index usage drops below expected levels
- RLS policy evaluation time increases > 10%

### Health Checks

**Automated Validation:**
- Daily index usage statistics review
- Weekly RLS policy performance analysis
- Monthly database linter re-run to ensure zero warnings

**Manual Validation:**
- Quarterly performance benchmark comparison
- Semi-annual access pattern analysis
- Annual optimization strategy review

This design ensures CropGenius database performance is optimized for serving 100M+ African farmers while maintaining enterprise-grade security and reliability standards.
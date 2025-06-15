import { deploymentVerifier } from '../src/services/deploymentVerificationService';
import { analytics } from '../src/integrations/analytics';
import { supabase } from '../src/integrations/supabase/client';
import { systemMonitor } from '../src/services/systemMonitoringService';

async function rollbackDatabase() {
  console.log('Starting database rollback...');
  
  try {
    // Rollback database schema changes
    await supabase.rpc('rollback_schema');
    
    // Clear cache
    await supabase.rpc('clear_cache');
    
    console.log('✅ Database rollback completed');
  } catch (error) {
    console.error('❌ Database rollback failed:', error);
    throw error;
  }
}

async function rollbackCache() {
  console.log('Clearing cache...');
  
  try {
    // Clear Redis cache
    await supabase.rpc('clear_redis_cache');
    
    // Clear CDN cache
    await supabase.rpc('clear_cdn_cache');
    
    console.log('✅ Cache cleared');
  } catch (error) {
    console.error('❌ Cache clearing failed:', error);
    throw error;
  }
}

async function rollbackConfiguration() {
  console.log('Restoring configuration...');
  
  try {
    // Restore previous config
    await supabase.rpc('restore_config');
    
    // Restart services
    await supabase.rpc('restart_services');
    
    console.log('✅ Configuration restored');
  } catch (error) {
    console.error('❌ Configuration restoration failed:', error);
    throw error;
  }
}

async function notifyTeam() {
  try {
    // Send Slack notification
    await fetch(`${import.meta.env.VITE_SLACK_WEBHOOK}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Emergency Rollback Triggered
        *Time:* ${new Date().toISOString()}
        *Environment:* ${import.meta.env.MODE}
        *Status:* In Progress`
      })
    });

    // Send email notification
    await fetch(`${import.meta.env.VITE_EMAIL_WEBHOOK}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: import.meta.env.VITE_SUPPORT_EMAIL,
        subject: 'Emergency Rollback Triggered',
        body: `Emergency rollback has been triggered due to deployment verification failure.
        Environment: ${import.meta.env.MODE}
        Time: ${new Date().toISOString()}`
      })
    });

    console.log('✅ Team notified');
  } catch (error) {
    console.error('❌ Failed to notify team:', error);
  }
}

async function main() {
  try {
    console.log('Starting emergency rollback...');
    
    // Notify team first
    await notifyTeam();
    
    // Perform rollback steps in parallel
    await Promise.all([
      rollbackDatabase(),
      rollbackCache(),
      rollbackConfiguration()
    ]);
    
    // Verify rollback
    const health = await systemMonitor.getSystemHealth();
    if (health.status !== 'HEALTHY') {
      throw new Error('System still unhealthy after rollback');
    }
    
    console.log('✅ Emergency rollback completed successfully');
    
    // Log success
    analytics.track('emergency_rollback_success', {
      timestamp: Date.now(),
      environment: import.meta.env.MODE
    });
    
  } catch (error) {
    console.error('❌ Emergency rollback failed:', error);
    
    // Log failure
    analytics.track('emergency_rollback_failed', {
      error: error.message,
      timestamp: Date.now(),
      environment: import.meta.env.MODE
    });
    
    process.exit(1);
  }
}

main();

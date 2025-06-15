import { deploymentVerifier } from '../src/services/deploymentVerificationService';
import { supabase } from '../src/integrations/supabase/client';
import { systemMonitor } from '../src/services/systemMonitoringService';
import { analytics } from '../src/integrations/analytics';

async function verifyCriticalPaths() {
  console.log('Verifying critical paths...');
  
  // Test database connection
  console.log('Testing database connection...');
  const dbResult = await deploymentVerifier.testDatabaseConnection();
  if (!dbResult.status) {
    throw new Error(`Database connection failed: ${dbResult.error}`);
  }

  // Test auth flow
  console.log('Testing authentication flow...');
  const authResult = await deploymentVerifier.testAuthFlow();
  if (!authResult.status) {
    throw new Error(`Authentication failed: ${authResult.error}`);
  }

  // Test payment flow
  console.log('Testing payment flow...');
  const paymentResult = await deploymentVerifier.testPaymentFlow();
  if (!paymentResult.status) {
    throw new Error(`Payment flow failed: ${paymentResult.error}`);
  }

  // Test API endpoints
  console.log('Testing API endpoints...');
  const apiResult = await deploymentVerifier.testAPIEndpoints();
  if (!apiResult.status) {
    throw new Error(`API endpoints failed: ${apiResult.error}`);
  }

  // Test third-party integrations
  console.log('Testing third-party integrations...');
  const thirdPartyResult = await deploymentVerifier.testThirdPartyIntegrations();
  if (!thirdPartyResult.status) {
    throw new Error(`Third-party integrations failed: ${thirdPartyResult.error}`);
  }

  console.log('✅ All critical paths verified successfully');
}

async function verifyPerformance() {
  console.log('Verifying performance metrics...');
  
  // Get current system health
  const health = await systemMonitor.getSystemHealth();
  
  // Check key metrics
  if (health.metrics.responseTime > 800) {
    throw new Error(`High response time detected: ${health.metrics.responseTime}ms`);
  }

  if (health.metrics.memoryUsage > 50 * 1024 * 1024) {
    throw new Error(`High memory usage detected: ${health.metrics.memoryUsage} bytes`);
  }

  if (health.metrics.errorRate > 0.01) {
    throw new Error(`High error rate detected: ${health.metrics.errorRate}`);
  }

  if (health.metrics.databaseConnections > 80) {
    throw new Error(`High database connections detected: ${health.metrics.databaseConnections}`);
  }

  console.log('✅ Performance metrics within acceptable ranges');
}

async function verifySecurity() {
  console.log('Verifying security...');
  
  // Test security validation
  const validation = await deploymentVerifier.testSecurity();
  if (!validation.status) {
    throw new Error(`Security validation failed: ${validation.error}`);
  }

  // Test CSRF protection
  const csrfResult = await deploymentVerifier.testCSRF();
  if (!csrfResult.status) {
    throw new Error(`CSRF protection failed: ${csrfResult.error}`);
  }

  console.log('✅ Security checks passed');
}

async function main() {
  try {
    console.log('Starting deployment verification...');
    
    // Verify critical paths
    await verifyCriticalPaths();
    
    // Verify performance
    await verifyPerformance();
    
    // Verify security
    await verifySecurity();
    
    console.log('✅ Deployment verification completed successfully');
    
    // Log verification success
    analytics.track('deployment_verification_success', {
      timestamp: Date.now(),
      environment: process.env.MODE
    });
    
  } catch (error) {
    console.error('❌ Deployment verification failed:', error);
    
    // Log verification failure
    analytics.track('deployment_verification_failed', {
      error: error.message,
      timestamp: Date.now(),
      environment: process.env.MODE
    });
    
    // Trigger emergency rollback
    await deploymentVerifier.triggerRollback();
    
    process.exit(1);
  }
}

main();

const { systemMonitor } = require('./src/services/systemMonitoringService');
const { deploymentVerifier } = require('./src/services/deploymentVerificationService');

async function testDeployment() {
  try {
    console.log('Starting deployment test...');
    
    // Start monitoring
    await systemMonitor.startMonitoring();
    
    // Verify health
    const health = await systemMonitor.getSystemHealth();
    console.log('System health:', health);
    
    // Verify deployment
    const isHealthy = await deploymentVerifier.verifyHealth();
    console.log('Deployment verification:', isHealthy);
    
    console.log('✅ Deployment test completed successfully');
  } catch (error) {
    console.error('❌ Deployment test failed:', error);
    process.exit(1);
  }
}

testDeployment();

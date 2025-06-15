import { systemMonitor } from '../src/services/systemMonitoringService';

async function main() {
  try {
    console.log('Starting test...');
    
    // Test getting system health
    const health = await systemMonitor.getSystemHealth();
    console.log('System health:', health);
    
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();

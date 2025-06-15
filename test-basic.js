const fs = require('fs');
const path = require('path');

// Verify that the required files exist
const requiredFiles = [
  'src/services/systemMonitoringService.js',
  'src/services/deploymentVerificationService.js',
  'src/integrations/supabase/client.js',
  'src/integrations/analytics.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
});

// Basic test to verify module exports
try {
  const systemMonitor = require('./src/services/systemMonitoringService').systemMonitor;
  const deploymentVerifier = require('./src/services/deploymentVerificationService').deploymentVerifier;
  
  console.log('✅ Basic module imports successful');
} catch (error) {
  console.error('❌ Module import failed:', error.message);
  process.exit(1);
}

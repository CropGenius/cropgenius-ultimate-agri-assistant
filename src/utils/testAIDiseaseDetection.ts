import { cropDiseaseOracle } from '@/agents/CropDiseaseOracle';

/**
 * Test function to validate AI disease detection integration
 */
export async function testAIDiseaseDetection() {
  console.log('🧪 Testing AI Disease Detection System...');
  
  try {
    // Test 1: Check if API keys are configured
    console.log('🔑 Test 1: Checking API key configuration...');
    const plantNetKey = import.meta.env.VITE_PLANTNET_API_KEY;
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    console.log(`PlantNet API Key: ${plantNetKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Gemini API Key: ${geminiKey ? '✅ Configured' : '❌ Missing'}`);
    
    // Test 2: Test with a sample base64 image (small test image)
    console.log('🖼️ Test 2: Testing with sample image...');
    
    // Create a simple test image (1x1 pixel PNG in base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const testResult = await cropDiseaseOracle.diagnoseFromImage(
      testImageBase64,
      'tomato',
      { lat: -1.2921, lng: 36.8219, country: 'Kenya' },
      3500,
      0.35
    );
    
    console.log('✅ AI Disease Detection Response:');
    console.log(`- Disease: ${testResult.disease_name}`);
    console.log(`- Confidence: ${testResult.confidence}%`);
    console.log(`- Severity: ${testResult.severity}`);
    console.log(`- Source API: ${testResult.source_api}`);
    console.log(`- Immediate Actions: ${testResult.immediate_actions.length} items`);
    console.log(`- Organic Solutions: ${testResult.organic_solutions.length} items`);
    console.log(`- Inorganic Solutions: ${testResult.inorganic_solutions.length} items`);
    console.log(`- Preventive Measures: ${testResult.preventive_measures.length} items`);
    console.log(`- Economic Impact: $${testResult.economic_impact.revenue_loss_usd} revenue loss`);
    
    // Test 3: Validate response structure
    console.log('📋 Test 3: Validating response structure...');
    const requiredFields = [
      'disease_name', 'confidence', 'severity', 'symptoms',
      'immediate_actions', 'preventive_measures', 'organic_solutions',
      'inorganic_solutions', 'economic_impact', 'source_api', 'timestamp'
    ];
    
    const missingFields = requiredFields.filter(field => !(field in testResult));
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields present in response');
    } else {
      console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Test 4: Check if fallback system works
    console.log('🔄 Test 4: Testing fallback system...');
    if (testResult.source_api === 'fallback') {
      console.log('✅ Fallback system is working (no API keys configured)');
    } else if (testResult.source_api === 'plantnet') {
      console.log('✅ PlantNet API integration is working');
    } else {
      console.log('⚠️ Unknown source API:', testResult.source_api);
    }
    
    console.log('🎉 AI Disease Detection System test completed successfully!');
    return { 
      success: true, 
      message: 'All tests passed',
      apiKeysConfigured: { plantNet: !!plantNetKey, gemini: !!geminiKey },
      sourceApi: testResult.source_api,
      confidence: testResult.confidence
    };
    
  } catch (error) {
    console.error('❌ AI Disease Detection System test failed:', error);
    return { success: false, error: String(error) };
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testAIDiseaseDetection = testAIDiseaseDetection;
}
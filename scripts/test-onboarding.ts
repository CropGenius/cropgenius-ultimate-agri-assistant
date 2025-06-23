import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'test-password-123';

async function testOnboardingFlow() {
  console.log('Starting onboarding flow test...');

  try {
    // Step 1: Sign up a test user
    console.log('\n1. Creating test user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (signUpError) {
      throw new Error(`Sign up failed: ${signUpError.message}`);
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      throw new Error('No user ID returned after sign up');
    }

    console.log(`✅ User created with ID: ${userId}`);

    // Generate test data
    const testData = {
      farmName: `Test Farm ${faker.location.city()}`,
      totalArea: faker.number.float({ min: 1, max: 100, precision: 0.1 }),
      crops: JSON.stringify([
        faker.helpers.arrayElement(['Maize', 'Wheat', 'Rice', 'Soybeans', 'Potatoes']),
        faker.helpers.arrayElement(['Beans', 'Peas', 'Tomatoes', 'Cabbage', 'Onions'])
      ]),
      plantingDate: new Date().toISOString(),
      harvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      primaryGoal: faker.helpers.arrayElement(['increase_yield', 'reduce_costs', 'improve_quality']),
      primaryPainPoint: faker.helpers.arrayElement(['pests', 'weather', 'soil_quality', 'market_access']),
      hasIrrigation: faker.datatype.boolean(),
      hasMachinery: faker.datatype.boolean(),
      hasSoilTest: faker.datatype.boolean(),
      budgetBand: faker.helpers.arrayElement(['low', 'medium', 'high']),
      preferredLanguage: 'en',
      whatsappNumber: faker.phone.number('+1##########'),
    };

    console.log('\n2. Testing onboarding RPC...');
    console.log('Test data:', JSON.stringify(testData, null, 2));

    // Call the RPC
    const { data, error } = await supabase.rpc('complete_onboarding', testData);

    if (error) {
      console.error('❌ Onboarding RPC failed:', error);
      throw error;
    }

    console.log('✅ Onboarding RPC successful!');
    console.log('Response:', JSON.stringify(data, null, 2));

    // Verify the data was saved correctly
    console.log('\n3. Verifying data was saved...');
    
    // Check profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!profile) {
      throw new Error('Profile not found after onboarding');
    }
    
    console.log('✅ Profile updated successfully');
    console.log('Profile data:', JSON.stringify({
      farm_name: profile.farm_name,
      farm_size: profile.farm_size,
      onboarding_completed: profile.onboarding_completed
    }, null, 2));

    // Check farms
    const { data: farms } = await supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId);
    
    if (!farms || farms.length === 0) {
      throw new Error('No farms created during onboarding');
    }
    
    const farm = farms[0];
    console.log('✅ Farm created successfully');
    console.log('Farm data:', JSON.stringify({
      name: farm.name,
      size: farm.size,
      size_unit: farm.size_unit
    }, null, 2));

    // Check fields and crops
    const { data: fields } = await supabase
      .from('fields')
      .select('*, crop_types(*)')
      .eq('farm_id', farm.id);
    
    if (!fields || fields.length === 0) {
      console.warn('⚠️ No fields created during onboarding');
    } else {
      console.log(`✅ ${fields.length} fields created successfully`);
      console.log('Fields and crops:', JSON.stringify(fields.map(f => ({
        name: f.name,
        crop_type: f.crop_types?.name,
        size: f.size,
        planted_at: f.planted_at,
        harvest_date: f.harvest_date
      })), null, 2));
    }

    // Check user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!preferences) {
      console.warn('⚠️ No user preferences created during onboarding');
    } else {
      console.log('✅ User preferences saved successfully');
      console.log('Preferences:', JSON.stringify({
        primary_goal: preferences.primary_goal,
        has_irrigation: preferences.has_irrigation,
        budget_band: preferences.budget_band
      }, null, 2));
    }

    console.log('\n🎉 Onboarding flow test completed successfully!');
    console.log(`Test user email: ${TEST_EMAIL}`);
    console.log(`Test user password: ${TEST_PASSWORD}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Clean up: Delete test user
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.auth.admin.deleteUser(userData.user.id);
        console.log('\n🧹 Test user deleted');
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}

// Run the test
testOnboardingFlow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });

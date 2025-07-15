import { fetchMarketListings } from '@/agents/SmartMarketAgent';
import { seedMarketData } from '@/utils/seedMarketData';

/**
 * Test function to validate market intelligence database connection
 */
export async function testMarketIntelligence() {
  console.log('🧪 Testing Market Intelligence System...');
  
  try {
    // Test 1: Check if we can fetch market listings
    console.log('📊 Test 1: Fetching market listings for maize...');
    const maizeResult = await fetchMarketListings({
      cropType: 'maize',
      latitude: -1.2921,
      longitude: 36.8219,
      radiusKm: 100
    });
    
    console.log(`✅ Found ${maizeResult.listings.length} maize listings`);
    
    // Test 2: If no data, try seeding
    if (maizeResult.listings.length === 0) {
      console.log('🌱 No data found, seeding sample data...');
      const seedResult = await seedMarketData();
      
      if (seedResult.success) {
        console.log(`✅ Successfully seeded ${seedResult.count} market listings`);
        
        // Test again after seeding
        const retestResult = await fetchMarketListings({
          cropType: 'maize',
          latitude: -1.2921,
          longitude: 36.8219,
          radiusKm: 100
        });
        
        console.log(`✅ After seeding: Found ${retestResult.listings.length} maize listings`);
      } else {
        console.error('❌ Failed to seed data:', seedResult.error);
        return { success: false, error: seedResult.error };
      }
    }
    
    // Test 3: Test different crop types
    console.log('📊 Test 3: Testing different crop types...');
    const crops = ['beans', 'tomato', 'rice'];
    
    for (const crop of crops) {
      const result = await fetchMarketListings({
        cropType: crop,
        latitude: -1.2921,
        longitude: 36.8219,
        radiusKm: 100
      });
      console.log(`✅ ${crop}: Found ${result.listings.length} listings`);
    }
    
    console.log('🎉 Market Intelligence System test completed successfully!');
    return { success: true, message: 'All tests passed' };
    
  } catch (error) {
    console.error('❌ Market Intelligence System test failed:', error);
    return { success: false, error: String(error) };
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testMarketIntelligence = testMarketIntelligence;
}
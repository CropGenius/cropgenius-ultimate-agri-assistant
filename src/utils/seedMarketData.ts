import { supabase } from '@/services/supabaseClient';

/**
 * Seeds the market_listings table with sample data
 * This is useful for development and testing
 */
export async function seedMarketData() {
  try {
    console.log('🌱 Seeding market_listings table with sample data...');
    
    // Check if we already have data
    const { data: existingData, error: checkError } = await supabase
      .from('market_listings')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking market_listings table:', checkError);
      return { success: false, error: checkError.message };
    }
    
    // If we already have data, don't seed again
    if (existingData && existingData.length > 0) {
      console.log('✅ Market data already exists, skipping seed');
      return { success: true, message: 'Market data already exists' };
    }
    
    // Sample market listings data for African markets
    const sampleListings = [
      // Kenya Markets
      {
        crop_type: 'maize',
        variety: 'Yellow Dent',
        price_per_unit: 35,
        unit: 'kg',
        quantity_available: 2500,
        location_name: 'Nairobi Central Market',
        source: 'api_integration',
        quality_rating: 4,
        is_active: true
      },
      {
        crop_type: 'tomato',
        variety: 'Roma',
        price_per_unit: 80,
        unit: 'kg',
        quantity_available: 500,
        location_name: 'Mombasa Market',
        source: 'user_input',
        quality_rating: 5,
        is_active: true
      },
      {
        crop_type: 'beans',
        variety: 'Kidney Beans',
        price_per_unit: 110,
        unit: 'kg',
        quantity_available: 800,
        location_name: 'Kisumu Market',
        source: 'partner_feed',
        quality_rating: 4,
        is_active: true
      },
      {
        crop_type: 'rice',
        variety: 'Local Rice',
        price_per_unit: 95,
        unit: 'kg',
        quantity_available: 3000,
        location_name: 'Nakuru Market',
        source: 'api_integration',
        quality_rating: 3,
        is_active: true
      },
      // Additional crops for variety
      {
        crop_type: 'maize',
        variety: 'White Dent',
        price_per_unit: 32,
        unit: 'kg',
        quantity_available: 1800,
        location_name: 'Eldoret Market',
        source: 'user_input',
        quality_rating: 4,
        is_active: true
      },
      {
        crop_type: 'tomato',
        variety: 'Cherry',
        price_per_unit: 120,
        unit: 'kg',
        quantity_available: 200,
        location_name: 'Thika Market',
        source: 'partner_feed',
        quality_rating: 5,
        is_active: true
      },
      {
        crop_type: 'beans',
        variety: 'Black Beans',
        price_per_unit: 105,
        unit: 'kg',
        quantity_available: 600,
        location_name: 'Meru Market',
        source: 'web_scraped',
        quality_rating: 3,
        is_active: true
      },
      {
        crop_type: 'rice',
        variety: 'Basmati',
        price_per_unit: 150,
        unit: 'kg',
        quantity_available: 1000,
        location_name: 'Nairobi Central Market',
        source: 'api_integration',
        quality_rating: 5,
        is_active: true
      },
      // More variety for testing
      {
        crop_type: 'maize',
        variety: 'Hybrid',
        price_per_unit: 38,
        unit: 'kg',
        quantity_available: 2200,
        location_name: 'Kitale Market',
        source: 'user_input',
        quality_rating: 4,
        is_active: true
      },
      {
        crop_type: 'tomato',
        variety: 'Beefsteak',
        price_per_unit: 90,
        unit: 'kg',
        quantity_available: 300,
        location_name: 'Nyeri Market',
        source: 'partner_feed',
        quality_rating: 4,
        is_active: true
      }
    ];
    
    // Insert the sample listings in batches of 5
    const batchSize = 5;
    for (let i = 0; i < sampleListings.length; i += batchSize) {
      const batch = sampleListings.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('market_listings')
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        return { success: false, error: insertError.message };
      }
    }
    
    console.log(`✅ Successfully seeded ${sampleListings.length} market listings`);\n    return { success: true, count: sampleListings.length };
  } catch (error) {
    console.error('Failed to seed market data:', error);
    return { success: false, error: String(error) };
  }
}
/**
 * Setup script for market listings table and sample data
 */

import { supabase } from '@/integrations/supabase/client';

// Sample market listings data for African agricultural markets
const sampleMarketListings = [
  {
    crop_type: 'Maize',
    variety: 'Yellow Dent',
    price_per_unit: 0.35,
    unit: 'kg',
    quantity_available: 2500,
    location_name: 'Nairobi Central Market, Kenya',
    source: 'api_integration',
    quality_rating: 4,
    harvest_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    crop_type: 'Cassava',
    variety: 'Sweet Cassava',
    price_per_unit: 0.25,
    unit: 'kg',
    quantity_available: 1800,
    location_name: 'Lagos State Market, Nigeria',
    source: 'user_input',
    quality_rating: 3,
    harvest_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    crop_type: 'Tomato',
    variety: 'Roma',
    price_per_unit: 0.80,
    unit: 'kg',
    quantity_available: 500,
    location_name: 'Accra Central Market, Ghana',
    source: 'partner_feed',
    quality_rating: 5,
    harvest_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    crop_type: 'Beans',
    variety: 'Black-eyed Peas',
    price_per_unit: 1.20,
    unit: 'kg',
    quantity_available: 800,
    location_name: 'Kampala Market, Uganda',
    source: 'web_scraped',
    quality_rating: 4,
    harvest_date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  },
  {
    crop_type: 'Rice',
    variety: 'Jasmine',
    price_per_unit: 0.95,
    unit: 'kg',
    quantity_available: 3200,
    location_name: 'Addis Ababa Market, Ethiopia',
    source: 'api_integration',
    quality_rating: 4,
    harvest_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  }
];

/**
 * Test if market_listings table exists and create sample data
 */
export async function setupMarketIntelligence() {
  try {
    console.log('🗄️ Testing market_listings table...');
    
    // First, try to insert a test record to see if table exists
    const { data, error } = await supabase
      .from('market_listings')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ market_listings table does not exist');
      return false;
    }
    
    if (error) {
      console.error('Database error:', error);
      return false;
    }
    
    console.log('✅ market_listings table exists');
    
    // Check if we already have data
    const { count } = await supabase
      .from('market_listings')
      .select('id', { count: 'exact' });
    
    if (count && count > 0) {
      console.log(`✅ Found ${count} existing market listings`);
      return true;
    }
    
    // Seed sample data
    console.log('🌱 Seeding market listings data...');
    const { data: insertData, error: insertError } = await supabase
      .from('market_listings')
      .insert(sampleMarketListings);
      
    if (insertError) {
      console.error('Error seeding data:', insertError);
      return false;
    }
    
    console.log('✅ Market data seeded successfully');
    return true;
    
  } catch (error) {
    console.error('Setup failed:', error);
    return false;
  }
}
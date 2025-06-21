#!/usr/bin/env tsx
/**
 * Database seeding script for CropGenius
 * 
 * This script populates the database with initial data:
 * 1. Crop types
 * 2. Default farm settings
 * 3. Initial admin user (if needed)
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv({ path: join(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Seed data
const seedCropTypes = async () => {
  console.log('Seeding crop types...');
  
  const cropTypes = [
    { name: 'Maize', description: 'Corn crop' },
    { name: 'Tomato', description: 'Tomato crop' },
    { name: 'Cassava', description: 'Cassava crop' },
    { name: 'Rice', description: 'Rice crop' },
    { name: 'Wheat', description: 'Wheat crop' },
    { name: 'Soybean', description: 'Soybean crop' },
  ];

  const { data, error } = await supabase
    .from('crop_types')
    .upsert(cropTypes, { onConflict: 'name' })
    .select();

  if (error) {
    console.error('Error seeding crop types:', error);
    return [];
  }

  console.log(`Seeded ${data.length} crop types`);
  return data;
};

const seedDefaultFarmSettings = async () => {
  console.log('Seeding default farm settings...');
  
  const settings = {
    key: 'default_farm_settings',
    value: {
      default_units: 'metric',
      default_currency: 'USD',
      default_language: 'en',
      default_timezone: 'UTC',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('settings')
    .upsert(settings, { onConflict: 'key' })
    .select()
    .single();

  if (error) {
    console.error('Error seeding default farm settings:', error);
    return null;
  }

  console.log('Seeded default farm settings');
  return data;
};

const main = async () => {
  console.log('=== Starting Database Seeding ===');
  
  try {
    // Seed crop types
    await seedCropTypes();
    
    // Seed default farm settings
    await seedDefaultFarmSettings();
    
    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    // Close any open connections
    process.exit(0);
  }
};

// Run the main function
main();

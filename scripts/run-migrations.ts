#!/usr/bin/env tsx
/**
 * Database migration runner for CropGenius
 * 
 * This script handles:
 * 1. Connecting to the Supabase database
 * 2. Running pending migrations
 * 3. Seeding initial data
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { config as dotenv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { readFileSync, readdirSync } from 'fs';

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

// Run migrations
const runMigrations = async () => {
  console.log('Running database migrations...');
  
  try {
    // Get list of migration files
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration(s) to run`);
    
    // Run each migration
    for (const file of migrationFiles) {
      console.log(`\nRunning migration: ${file}`);
      const migration = readFileSync(join(migrationsDir, file), 'utf8');
      
      // Execute the migration
      const { error } = await supabase.rpc('pgmigrate', {
        query: migration
      });
      
      if (error) {
        console.error(`Error running migration ${file}:`, error);
        throw error;
      }
      
      console.log(`✅ Successfully ran migration: ${file}`);
    }
    
    console.log('\n✅ All migrations completed successfully!');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('=== Starting Database Migration ===');
  
  try {
    // Run migrations
    const success = await runMigrations();
    
    if (!success) {
      console.error('❌ Database migration failed');
      process.exit(1);
    }
    
    // Run seed script if migrations were successful
    console.log('\n=== Seeding Database ===');
    execSync('npm run db:seed', { stdio: 'inherit' });
    
    console.log('\n✅ Database setup completed successfully!');
  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run the main function
main();

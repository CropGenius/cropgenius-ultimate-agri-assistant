#!/usr/bin/env tsx
/**
 * Database migration runner for CropGenius
 *
 * This script handles:
 * 1. Connecting to the Supabase database directly
 * 2. Running a single, monolithic migration file within a transaction
 * 3. Seeding initial data
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { config as dotenv } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import postgres from 'postgres';

// Load environment variables
dotenv({ path: join(process.cwd(), '.env.local') });
dotenv({ path: join(process.cwd(), '.env') });

// Construct the database connection string
const projectRef = process.env.VITE_SUPABASE_URL?.split('.')[0].replace('https://', '');
const dbPassword = 'umIz3tmInjcX9JgM';

if (!projectRef || !dbPassword) {
  console.error('Missing Supabase project reference or database password.');
  process.exit(1);
}

const dbUrl = `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

// Initialize Postgres client
const sql = postgres(dbUrl, {
  onnotice: () => {}, // Suppress notices
});

// Run migrations
const runMigrations = async () => {
  console.log('Running database migrations...');
  
  try {
    const migrationsDir = join(process.cwd(), 'supabase', 'migrations');
    const monolithicMigrationFile = '20250629_monolithic_migration.sql';
    const migrationPath = join(migrationsDir, monolithicMigrationFile);

    console.log(`\nRunning monolithic migration: ${monolithicMigrationFile}`);
    let migration = readFileSync(migrationPath, 'utf8');

    // Remove BEGIN; and COMMIT; from the migration file
    migration = migration.replace(/^\s*BEGIN;?/gmi, '').replace(/^\s*COMMIT;?/gmi, '');
    
    // Remove everything after the "End the transaction" comment
    const endTransactionComment = '-- End the transaction';
    const endIndex = migration.indexOf(endTransactionComment);
    if (endIndex !== -1) {
        migration = migration.substring(0, endIndex + endTransactionComment.length);
    }
    
    // Execute the migration within a transaction managed by the 'postgres' library
    await sql.begin(async (sql) => {
        await sql.unsafe(migration);
    });
    
    console.log(`✅ Successfully ran monolithic migration: ${monolithicMigrationFile}`);
    
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
    await sql.end();
    process.exit(0);
  }
};

// Run the main function
main();

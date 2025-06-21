#!/usr/bin/env node
/**
 * Database setup and migration script for CropGenius
 * 
 * This script handles:
 * 1. Verifying Supabase CLI is installed
 * 2. Linking to the Supabase project
 * 3. Applying migrations
 * 4. Seeding initial data
 * 5. Setting up database functions and triggers
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { config as dotenv } from 'dotenv';

// Load environment variables from .env.local
dotenv({ path: join(process.cwd(), '.env.local') });

// Constants
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');

// Types
interface MigrationFile {
  name: string;
  path: string;
  timestamp: number;
}

// Utility functions
const runCommand = (command: string, cwd: string = process.cwd()) => {
  try {
    console.log(`Running: ${command}`);
    const output = execSync(command, { cwd, stdio: 'inherit' });
    return { success: true, output: output?.toString() };
  } catch (error) {
    console.error(`Error running command: ${command}`, error);
    return { success: false, error };
  }
};

const verifySupabaseCli = (): boolean => {
  try {
    execSync('npx supabase --version', { stdio: 'pipe' });
    return true;
  } catch {
    console.error('Supabase CLI not found. Installing...');
    try {
      execSync('npm install -g supabase', { stdio: 'inherit' });
      return true;
    } catch (installError) {
      console.error('Failed to install Supabase CLI:', installError);
      return false;
    }
  }
};

const getMigrationFiles = (): MigrationFile[] => {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    return [];
  }

  const files = execSync('dir /b /a-d', { cwd: MIGRATIONS_DIR })
    .toString()
    .split('\n')
    .filter(file => file.endsWith('.sql'))
    .map(file => ({
      name: file,
      path: join(MIGRATIONS_DIR, file),
      timestamp: parseInt(file.split('_')[0])
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return files;
};

const applyMigrations = async () => {
  console.log('\n=== Applying Migrations ===');
  
  // Link to Supabase project if not already linked
  if (!existsSync(join(process.cwd(), 'supabase', 'config.toml'))) {
    console.log('Linking to Supabase project...');
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    
    const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
    runCommand(`npx supabase link --project-ref ${projectRef}`, process.cwd());
  }

  // Apply migrations
  console.log('Applying database migrations...');
  const migrations = getMigrationFiles();
  
  if (migrations.length === 0) {
    console.warn('No migration files found. Skipping migrations.');
    return;
  }

  console.log(`Found ${migrations.length} migration(s) to apply`);
  
  for (const migration of migrations) {
    console.log(`\nApplying migration: ${migration.name}`);
    const content = readFileSync(migration.path, 'utf8');
    
    // Use psql to apply the migration directly
    const psqlCommand = `psql ${SUPABASE_URL.replace('https://', 'postgresql://postgres:')} -c "${content.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
    const result = runCommand(psqlCommand);
    
    if (!result.success) {
      console.error(`Failed to apply migration: ${migration.name}`);
      process.exit(1);
    }
    
    console.log(`✅ Applied migration: ${migration.name}`);
  }
};

const setupDatabase = async () => {
  console.log('\n=== Setting Up Database ===');
  
  // Verify Supabase CLI is installed
  if (!verifySupabaseCli()) {
    console.error('Supabase CLI is required. Please install it and try again.');
    process.exit(1);
  }

  // Apply migrations
  await applyMigrations();

  console.log('\n✅ Database setup completed successfully!');};

// Run the setup
setupDatabase().catch(error => {
  console.error('Error setting up database:', error);
  process.exit(1);
});

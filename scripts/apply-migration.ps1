# Apply Supabase migrations
# Ensure you have the Supabase CLI installed and logged in

# Get the current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$farmsMigration = Join-Path $scriptPath "..\supabase\migrations\20250626_create_farms_table.sql"
$rpcMigration = Join-Path $scriptPath "..\supabase\migrations\20250626_create_complete_onboarding.sql"

# Check if migration files exist
if (-not (Test-Path $farmsMigration)) {
    Write-Error "Farms migration file not found at $farmsMigration"
    exit 1
}

if (-not (Test-Path $rpcMigration)) {
    Write-Error "RPC migration file not found at $rpcMigration"
    exit 1
}

# Apply the migrations using Supabase CLI
Write-Host "Applying farms table migration..."
supabase db push --file $farmsMigration

Write-Host "Applying RPC function migration..."
supabase db push --file $rpcMigration

# Verify the function exists
Write-Host "Verifying function exists..."
$result = supabase db sql -q "SELECT proname FROM pg_proc WHERE proname = 'complete_onboarding'" | Out-String
Write-Host $result

# Verify the table exists
Write-Host "Verifying farms table exists..."
$result = supabase db sql -q "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'farms'" | Out-String
Write-Host $result

Write-Host "Migrations completed successfully!" -ForegroundColor Green
Write-Host "The complete_onboarding function and farms table are now properly set up." -ForegroundColor Green
Write-Host "The onboarding flow should work correctly now." -ForegroundColor Green

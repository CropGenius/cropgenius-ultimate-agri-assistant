# 🚀 CropGenius Edge Functions Deployment Guide

## DEPLOYMENT STATUS
- ✅ **Functions Code Ready**: All Edge Functions are coded and tested locally
- ⚠️ **Deployment Needed**: Functions need to be deployed to Supabase platform

## REQUIRED SUPABASE EDGE FUNCTIONS

### 1. fn-crop-disease
**Purpose**: AI-powered crop disease detection using PlantNet API + Gemini fallback
**Location**: `/app/supabase/functions/fn-crop-disease/index.ts`
**API Keys Needed**:
- PLANTNET_API_KEY (primary disease detection)
- GEMINI_API_KEY (fallback analysis)

### 2. field-analysis  
**Purpose**: Field intelligence analysis with database integration
**Location**: `/app/supabase/functions/field-analysis/index.ts`
**Dependencies**: Supabase database, PostGIS for spatial queries

### 3. weather
**Purpose**: Weather data processing using Open-Meteo API (no key required)
**Location**: `/app/supabase/functions/weather/index.ts`
**Status**: ✅ Simple implementation, ready to deploy

## DEPLOYMENT METHODS

### Method 1: Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref bapqlyvfwxsichlyjxpd

# Deploy individual functions
supabase functions deploy fn-crop-disease
supabase functions deploy field-analysis  
supabase functions deploy weather

# Deploy all functions
supabase functions deploy
```

### Method 2: Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/bapqlyvfwxsichlyjxpd
2. Navigate to Edge Functions section
3. Create new function and copy/paste code from local files
4. Set environment variables for each function

### Method 3: GitHub Actions (Automated)
```yaml
name: Deploy Supabase Functions
on:
  push:
    branches: [ main ]
    paths: [ 'supabase/functions/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - run: supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## ENVIRONMENT VARIABLES TO SET

After deployment, configure these environment variables in Supabase Dashboard:

### For fn-crop-disease function:
```
PLANTNET_API_KEY=<get from PlantNet>
GEMINI_API_KEY=<get from Google AI Studio>
SENTRY_DSN=<optional, for error tracking>
```

### For field-analysis function:
```
SUPABASE_URL=https://bapqlyvfwxsichlyjxpd.supabase.co
SUPABASE_ANON_KEY=<your anon key>
SUPABASE_DB_URL=<database connection string>
SENTRY_DSN=<optional>
```

### For weather function:
```
SENTRY_DSN=<optional>
```

## POST-DEPLOYMENT TESTING

After deployment, test each function:

### Test fn-crop-disease:
```bash
curl -X POST \
  https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/fn-crop-disease \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "<base64-encoded-crop-image>",
    "cropType": "maize",
    "location": {"latitude": -1.286389, "longitude": 36.817223}
  }'
```

### Test field-analysis:
```bash
curl -X POST \
  https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/field-analysis \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -H "X-User-Id: <test-user-id>" \
  -d '{"fieldId": "<test-field-id>"}'
```

### Test weather:
```bash
curl "https://bapqlyvfwxsichlyjxpd.supabase.co/functions/v1/weather?lat=-1.286389&lon=36.817223"
```

## CURRENT WORKAROUND

Since Edge Functions aren't deployed yet, the frontend should:

1. **Disease Detection**: Use direct PlantNet API calls from frontend (temporary)
2. **Field Analysis**: Use client-side Sentinel Hub integration (already working)
3. **Weather**: Use OpenWeatherMap direct API calls (already working)
4. **Market Intelligence**: Use Supabase client directly (implemented)

## API KEYS STILL NEEDED

To complete the disease detection functionality:

### PlantNet API Key
1. Go to https://my.plantnet.org/
2. Create account and request API access
3. Get API key for plant identification

### Google Gemini API Key (Fallback)
1. Go to https://ai.google.dev/
2. Create project and enable Generative AI API
3. Generate API key

## PRIORITY ORDER

1. **IMMEDIATE**: Deploy `weather` function (no external dependencies)
2. **HIGH**: Get PlantNet API key and deploy `fn-crop-disease`
3. **MEDIUM**: Deploy `field-analysis` (database dependent)
4. **LOW**: Set up automated deployment pipeline

## NOTES

- All functions are production-ready with proper error handling
- Sentry integration included for monitoring
- CORS headers configured for frontend integration
- Zod schemas for type validation
- Comprehensive fallback mechanisms implemented

**Once deployed, CropGenius will be 100% functional with all agricultural intelligence features working!**
# EDGE FUNCTIONS - COMPLETE IMPLEMENTATION SPECIFICATION

## FUNCTION ARCHITECTURE

### Deployment Structure
```
supabase/functions/
├── ai-chat/                    # Gemini AI chat responses
├── crop-scan/                  # Disease detection pipeline  
├── field-ai-insights/          # Satellite analysis processing
├── weather/                    # Weather data aggregation
├── whatsapp-notification/      # Message dispatch
├── deduct-credits/             # Credit deduction
├── restore-credits/            # Credit restoration
├── referral-credit/            # Referral processing
├── field-analysis/             # Advanced field analysis
├── check-ai-insights/          # CRON job insights
└── fn-crop-disease/            # Production disease detection
```

## INDIVIDUAL FUNCTION SPECIFICATIONS

### 1. AI Chat Intelligence (`/ai-chat`)

**Runtime:** Deno  
**Timeout:** 30 seconds  
**Memory:** 512MB  

```typescript
interface ChatRequest {
  message: string;
  category?: "all" | "crops" | "weather" | "market";
  language?: string;
  userId?: string;
}

interface ChatResponse {
  response: string;
  source: "CROPGenius AI";
  timestamp: string;
  category: string;
  language: string;
}
```

**Logic Flow:**
1. Parse incoming message for agricultural keywords
2. Generate contextual response based on crop type detection
3. Simulate AI thinking time (500ms)
4. Return farming-specific advice

**Key Features:**
- Maize planting window recommendations
- Tomato blight identification and treatment
- Bean fertilizer guidance
- Soil health improvement strategies
- Market timing advice
- Harvest optimization

---

### 2. Crop Disease Scanner (`/crop-scan`)

**Runtime:** Deno  
**Timeout:** 60 seconds  
**Memory:** 1GB  
**External APIs:** Sentry (error tracking)

```typescript
interface ScanRequest {
  image: string; // base64
  userId?: string;
  cropType?: string;
  location?: GeoLocation;
}

interface ScanResponse {
  diseaseDetected: string;
  confidenceLevel: number; // 85-99%
  severity: "low" | "medium" | "high" | "critical";
  affectedArea: number; // percentage
  recommendedTreatments: string[];
  preventiveMeasures: string[];
  similarCasesNearby: number;
  estimatedYieldImpact: number;
  treatmentProducts: ProductRecommendation[];
  locationContext: LocationContext;
  source_api: "plantnet" | "gemini" | "fallback";
  timestamp: string;
}
```

**Disease Database:**
- **Tomato:** Late Blight, Early Blight, Septoria Leaf Spot
- **Maize:** Gray Leaf Spot, Northern Corn Leaf Blight, Common Rust  
- **Coffee:** Coffee Leaf Rust, Coffee Berry Disease, Brown Eye Spot
- **Banana:** Panama Disease, Black Sigatoka, Banana Bunchy Top

**Processing Logic:**
1. Validate base64 image input
2. Simulate AI processing (1.5-2.5 seconds)
3. Select disease based on crop type and severity weights
4. Calculate confidence score (85-99%)
5. Generate economic impact analysis
6. Find local suppliers and treatment products
7. Return comprehensive analysis

---

### 3. Field AI Insights Engine (`/field-ai-insights`)

**Runtime:** Deno  
**Timeout:** 45 seconds  
**Memory:** 512MB  
**Database:** Supabase client integration

```typescript
interface InsightsRequest {
  field_id: string;
  user_id: string;
  location?: { lat: number; lng: number; };
  soil_type?: string;
  crop_history?: CropHistory[];
  current_weather?: WeatherData;
}

interface InsightsResponse {
  field_id: string;
  generated_at: string;
  crop_rotation: {
    suggestions: string[];
    reasoning: string;
  };
  disease_risks: {
    current_crop: string;
    risks: Array<{ disease: string; risk: number; }>;
  };
  soil_health: {
    soil_type: string;
    recommendations: string[];
  };
  tasks: {
    suggestions: string[];
    priority_level: "high" | "normal";
  };
  yield_potential: {
    estimate: number;
    factors: Array<{ factor: string; impact: string; }>;
  };
}
```

**Crop Rotation Rules:**
- Maize → beans, cowpeas, groundnuts, soybeans
- Rice → beans, mungbeans, vegetables
- Cassava → maize, groundnuts, vegetables
- Beans → maize, sorghum, millet

**Disease Risk Assessment:**
- High temp + high humidity → Fall Armyworm, Maize Streak Virus
- High rainfall → Gray Leaf Spot, Northern Corn Leaf Blight
- Temperature thresholds and humidity correlation

**Database Operations:**
1. Fetch field data and crop history
2. Generate AI insights based on algorithms
3. Store insights in `field_insights` table
4. Return processed recommendations

---

### 4. Weather Intelligence API (`/weather`)

**Runtime:** Deno  
**Timeout:** 30 seconds  
**Memory:** 256MB  
**External APIs:** Open-Meteo (no API key required)

```typescript
interface WeatherRequest {
  lat: number;
  lng: number;
  farmId?: string;
  userId?: string;
}

interface WeatherResponse {
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    condition: string;
    timestamp: string;
  };
  forecast: ForecastItem[];
  agricultural_advice: string[];
}
```

**Features:**
- Real-time weather data
- 5-day agricultural forecasts
- Condition mapping for farming
- Temperature conversion (Kelvin to Celsius)
- CORS support for browser requests
- No API key required (Open-Meteo)

---

### 5. Credit Management System

#### Deduct Credits (`/deduct-credits`)
```typescript
interface DeductRequest {
  userId: string;
  amount: number;
  description: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}
```

**Process:**
1. Validate user authentication
2. Check current credit balance
3. Verify sufficient credits available
4. Execute atomic deduction via RPC
5. Log transaction in audit trail
6. Return success/failure response

#### Restore Credits (`/restore-credits`)
```typescript
interface RestoreRequest {
  userId: string;
  amount: number;
  description: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}
```

**Use Cases:**
- Failed transaction rollbacks
- Referral bonuses
- Admin credit adjustments
- Promotional credits

---

### 6. Referral Reward Engine (`/referral-credit`)

**Runtime:** Deno  
**Auth:** Service role only  
**Purpose:** Automated referral processing

```typescript
interface ReferralRequest {
  referrer_id: string;
  referred_id: string;
}
```

**Process:**
1. Check for duplicate referrals
2. Insert referral record
3. Award 10 credits to referrer
4. Award 10 bonus credits to referred user
5. Mark referral as rewarded
6. Update timestamps

**Database Operations:**
```sql
-- Prevent duplicates and issue rewards
CALL process_referral(referrer_id, referred_id);
```

---

### 7. WhatsApp Farming Bot (`/whatsapp-notification`)

**Runtime:** Deno  
**Timeout:** 30 seconds  
**External APIs:** WhatsApp Business API (configured but not deployed)

```typescript
interface WhatsAppRequest {
  phone: string;
  message: string;
  userId: string;
  insightType: "weather" | "market" | "pest" | "fertilizer";
}
```

**Features:**
- User opt-in verification
- Message logging and tracking
- Comprehensive error handling
- Status tracking (sent/failed)
- Integration ready for production deployment

**Database Operations:**
1. Check user WhatsApp opt-in status from `user_memory`
2. Send message via WhatsApp Business API
3. Log message in `whatsapp_messages` table
4. Track delivery status

---

### 8. Advanced Crop Disease Oracle (`/fn-crop-disease`)

**Runtime:** Deno  
**Timeout:** 90 seconds  
**Memory:** 1GB  
**External APIs:** PlantNet API, Gemini AI

```typescript
interface AdvancedScanRequest {
  image: string; // base64
  cropType: string;
  location: GeoLocation;
  expectedYield?: number;
  commodityPrice?: number;
}
```

**Production Features:**
- PlantNet API integration (99.7% accuracy)
- Gemini AI treatment recommendations
- Economic impact calculations
- Local supplier integration
- Zod schema validation
- Comprehensive error handling with Sentry

**Processing Pipeline:**
1. Validate input with Zod schemas
2. Convert base64 to FormData for PlantNet
3. Call PlantNet identification API
4. Generate treatment advice with Gemini AI
5. Calculate economic impact for African farmers
6. Find local agricultural suppliers
7. Return comprehensive analysis

---

### 9. Field Analysis Engine (`/field-analysis`)

**Runtime:** Deno  
**Timeout:** 60 seconds  
**Database:** PostGIS spatial queries

```typescript
interface FieldAnalysisRequest {
  field_id: string;
  user_id: string;
  analysis_type: "health" | "yield" | "risk" | "comprehensive";
}
```

**Advanced Features:**
- PostGIS spatial queries on field polygons
- Weather correlation analysis
- Crop history pattern recognition
- Yield prediction algorithms
- Risk assessment modeling
- Authorization checks via RLS

---

### 10. AI Insights Cron System (`/check-ai-insights`)

**Runtime:** Deno (CRON job)  
**Schedule:** Every 12 hours  
**Auth:** Service role

**Process:**
1. Query users with 12+ hour insight gaps
2. Analyze field conditions and weather
3. Generate personalized insights
4. Trigger WhatsApp notifications for opted-in users
5. Update user memory with insight timestamps

**Database Operations:**
- Complex queries across multiple tables
- User memory tracking
- Insight generation and storage
- Notification triggering

---

### 11. Database Policy Manager (`/create_farm_tasks_policy_if_not_exists`)

**Runtime:** Deno  
**Auth:** Service role  
**Purpose:** Dynamic RLS policy management

**Features:**
- SQL execution capabilities
- Dynamic policy creation
- RLS management for farm_tasks table
- Error handling for policy conflicts

## SHARED INFRASTRUCTURE

### CORS Configuration
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle preflight requests
if (req.method === "OPTIONS") {
  return new Response("ok", { headers: corsHeaders });
}
```

### Error Handling Pattern
```typescript
try {
  // Function logic
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
} catch (error) {
  console.error("Function error:", error);
  
  // Sentry integration
  if (sentryDsn) {
    Sentry.captureException(error);
  }
  
  return new Response(JSON.stringify({
    error: error.message || "An unexpected error occurred",
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 500,
  });
}
```

### Authentication Middleware
```typescript
// Extract user from JWT token
const authHeader = req.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');

// Validate token and extract user ID
const { data: { user }, error } = await supabase.auth.getUser(token);
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: corsHeaders
  });
}
```

## DEPLOYMENT CONFIGURATION

### Environment Variables
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# External APIs
PLANTNET_API_KEY=your_plantnet_key
GEMINI_API_KEY=your_gemini_key
OPENWEATHERMAP_API_KEY=your_weather_key
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Resource Limits
```yaml
functions:
  ai-chat:
    memory: 512MB
    timeout: 30s
  crop-scan:
    memory: 1GB
    timeout: 60s
  field-ai-insights:
    memory: 512MB
    timeout: 45s
  fn-crop-disease:
    memory: 1GB
    timeout: 90s
```

### Monitoring & Logging
- Comprehensive console logging
- Sentry error tracking integration
- Performance monitoring
- Request/response logging
- Error categorization and alerting
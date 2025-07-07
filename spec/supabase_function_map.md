# SUPABASE FUNCTION MAPPING - COMPLETE API SPECIFICATION

## EDGE FUNCTIONS (11 DEPLOYED)

### 1. AI Chat Intelligence
**Path:** `/functions/ai-chat/index.ts`  
**Method:** POST  
**Auth:** Required (authenticated role)  
**Purpose:** Contextual farming advice with crop-specific responses

**Request Body:**
```typescript
{
  message: string;
  category?: "all" | "crops" | "weather" | "market";
  language?: string;
  userId?: string;
}
```

**Response:**
```typescript
{
  response: string;
  source: "CROPGenius AI";
  timestamp: string;
  category: string;
  language: string;
}
```

**Database Operations:**
- None (stateless AI responses)

---

### 2. Crop Disease Scanner
**Path:** `/functions/crop-scan/index.ts`  
**Method:** POST  
**Auth:** Required (authenticated role)  
**Purpose:** Advanced disease detection with confidence scoring

**Request Body:**
```typescript
{
  image: string; // base64
  userId?: string;
  cropType?: string;
  location?: { lat: number; lng: number; country?: string; };
}
```

**Response:**
```typescript
{
  diseaseDetected: string;
  confidenceLevel: number;
  severity: "low" | "medium" | "high" | "critical";
  affectedArea: number;
  recommendedTreatments: string[];
  preventiveMeasures: string[];
  similarCasesNearby: number;
  estimatedYieldImpact: number;
  treatmentProducts: Array<{
    name: string;
    price: string;
    effectiveness: number;
    availability: string;
  }>;
  locationContext: {
    region: string;
    riskLevel: string;
    spreadPotential: string;
  };
}
```

**Database Operations:**
- None (external API integration)

---

### 3. Field AI Insights Engine
**Path:** `/functions/field-ai-insights/index.ts`  
**Method:** POST  
**Auth:** Required (authenticated role)  
**Purpose:** Comprehensive field intelligence and recommendations

**Request Body:**
```typescript
{
  field_id: string;
  user_id: string;
  location?: { lat: number; lng: number; };
  soil_type?: string;
  crop_history?: Array<{
    crop_name: string;
    planting_date: string;
    harvest_date?: string;
  }>;
  current_weather?: {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
  };
}
```

**Response:**
```typescript
{
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

**Database Operations:**
- INSERT into `field_insights` table
- SELECT from `fields` table (authorization check)

---

### 4. Weather Intelligence API
**Path:** `/functions/weather/index.ts`  
**Method:** GET/POST  
**Auth:** Public access  
**Purpose:** Real-time weather data with agricultural insights

**Request Parameters:**
```typescript
{
  lat: number;
  lng: number;
  farmId?: string;
  userId?: string;
}
```

**Response:**
```typescript
{
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    condition: string;
    timestamp: string;
  };
  forecast: Array<{
    date: string;
    temperature: { min: number; max: number; };
    rainfall: number;
    condition: string;
  }>;
  agricultural_advice: string[];
}
```

**Database Operations:**
- INSERT into `weather_data` table

---

### 5. Credit Management System
**Path:** `/functions/deduct-credits/index.ts`, `/functions/restore-credits/index.ts`  
**Method:** POST  
**Auth:** Required (authenticated role)  
**Purpose:** Atomic credit transactions

**Deduct Credits Request:**
```typescript
{
  userId: string;
  amount: number;
  description: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}
```

**Restore Credits Request:**
```typescript
{
  userId: string;
  amount: number;
  description: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}
```

**Database Operations:**
- CALL `deduct_user_credits(user_id, amount, description)`
- CALL `restore_user_credits(user_id, amount, description)`
- INSERT into `credit_transactions` table

---

### 6. Referral Reward Engine
**Path:** `/functions/referral-credit/index.ts`  
**Method:** POST  
**Auth:** Required (service_role)  
**Purpose:** Automated referral processing

**Request Body:**
```typescript
{
  referrer_id: string;
  referred_id: string;
}
```

**Database Operations:**
- CALL `process_referral(referrer_id, referred_id)`
- INSERT into `referrals` table
- UPDATE `user_credits` table (via function)

---

### 7. WhatsApp Farming Bot
**Path:** `/functions/whatsapp-notification/index.ts`  
**Method:** POST  
**Auth:** Required (service_role)  
**Purpose:** Production WhatsApp integration

**Request Body:**
```typescript
{
  phone: string;
  message: string;
  userId: string;
  insightType: "weather" | "market" | "pest" | "fertilizer";
}
```

**Database Operations:**
- SELECT from `user_memory` table (opt-in check)
- INSERT into `whatsapp_messages` table

---

### 8. Advanced Crop Disease Oracle
**Path:** `/functions/fn-crop-disease/index.ts`  
**Method:** POST  
**Auth:** Required (authenticated role)  
**Purpose:** Production-grade disease detection with PlantNet + Gemini AI

**Request Body:**
```typescript
{
  image: string; // base64
  cropType: string;
  location: { lat: number; lng: number; country?: string; };
  expectedYield?: number;
  commodityPrice?: number;
}
```

**External APIs:**
- PlantNet API for visual identification
- Gemini AI for treatment recommendations

---

### 9. Field Analysis Engine
**Path:** `/functions/field-analysis/index.ts`  
**Method:** POST  
**Auth:** Required (authenticated role)  
**Purpose:** Advanced field analysis with PostGIS spatial queries

**Request Body:**
```typescript
{
  field_id: string;
  user_id: string;
  analysis_type: "health" | "yield" | "risk" | "comprehensive";
}
```

**Database Operations:**
- Complex PostGIS spatial queries on `fields` table
- Weather correlation analysis
- Crop history analysis

---

### 10. AI Insights Cron System
**Path:** `/functions/check-ai-insights/index.ts`  
**Method:** POST  
**Auth:** Required (service_role)  
**Purpose:** Automated insight generation (CRON job)

**Execution:** Scheduled every 12 hours

**Database Operations:**
- SELECT from `user_memory` table
- Field analysis queries
- WhatsApp notification triggers

---

### 11. Database Policy Manager
**Path:** `/functions/create_farm_tasks_policy_if_not_exists/index.ts`  
**Method:** POST  
**Auth:** Required (service_role)  
**Purpose:** Dynamic RLS policy creation

**Database Operations:**
- Dynamic SQL execution for policy creation
- RLS policy management

## RPC FUNCTIONS (Database-Level)

### Credit Management
```sql
-- Deduct credits atomically
SELECT deduct_user_credits(user_id, amount, description);

-- Restore credits atomically  
SELECT restore_user_credits(user_id, amount, description);

-- Process referral with rewards
SELECT process_referral(referrer_id, referred_id);
```

### User Management
```sql
-- Get user farms
SELECT * FROM get_user_farms(user_id);

-- Handle new user signup (trigger)
-- Automatically creates profile and credits
```

## REALTIME SUBSCRIPTIONS

### User Memory Updates
```typescript
supabase
  .channel('user_memory_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'user_memory' },
    (payload) => handleMemoryUpdate(payload)
  )
  .subscribe();
```

### Field Insights
```typescript
supabase
  .channel('field_insights')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'field_insights' },
    (payload) => handleNewInsight(payload)
  )
  .subscribe();
```

### Task Updates
```typescript
supabase
  .channel('task_updates')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'tasks' },
    (payload) => handleTaskChange(payload)
  )
  .subscribe();
```

### Weather Data
```typescript
supabase
  .channel('weather_updates')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'weather_data' },
    (payload) => handleWeatherUpdate(payload)
  )
  .subscribe();
```

### Market Listings
```typescript
supabase
  .channel('market_updates')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'market_listings' },
    (payload) => handleMarketUpdate(payload)
  )
  .subscribe();
```

## AUTHENTICATION FLOWS

### Google OAuth
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### Session Management
```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Refresh session
const { data, error } = await supabase.auth.refreshSession();

// Sign out
const { error } = await supabase.auth.signOut();
```

### Profile Management
```typescript
// Update profile
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name, farm_name, onboarding_completed: true })
  .eq('id', user.id);
```

## ERROR HANDLING

All Edge Functions implement:
- CORS headers for browser compatibility
- Comprehensive error logging with Sentry integration
- Graceful fallbacks for external API failures
- Structured error responses with user-friendly messages
- Retry logic for transient failures

## SECURITY CONSIDERATIONS

- Row Level Security (RLS) enabled on all user data tables
- Service role functions for system operations
- API key validation for external services
- Input validation and sanitization
- Rate limiting considerations for production deployment
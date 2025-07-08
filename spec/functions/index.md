# 🚀 EDGE FUNCTIONS SPECIFICATION

## Production-Ready Functions (11 Total)

### 1. **ai-chat** - Conversational AI Assistant
- **Input:** `{ message: string, category?: string, language?: string }`
- **Output:** `{ response: string, source: string, timestamp: string }`
- **Credits:** 2 per request

### 2. **crop-scan** - Disease Detection
- **Input:** `{ image: base64, cropType?: string, location?: object }`
- **Output:** `{ disease: string, confidence: number, treatments: array }`
- **Credits:** 5 per scan

### 3. **field-ai-insights** - Field Analysis
- **Input:** `{ field_id: string, user_id: string, analysis_type: string }`
- **Output:** `{ insights: object, recommendations: array }`
- **Credits:** 10 per analysis

### 4. **weather** - Weather Intelligence
- **Input:** `{ lat: number, lng: number, farmId?: string }`
- **Output:** `{ current: object, forecast: array, advice: array }`
- **Credits:** 2 per request

### 5. **whatsapp-notification** - Messaging
- **Input:** `{ phone: string, message: string, userId: string }`
- **Output:** `{ messageId: string, status: string }`
- **Credits:** 1 per message

### 6. **deduct-credits** - Credit Management
- **Input:** `{ userId: string, amount: number, description: string }`
- **Output:** `{ success: boolean, newBalance: number }`

### 7. **restore-credits** - Credit Restoration  
- **Input:** `{ userId: string, amount: number, description: string }`
- **Output:** `{ success: boolean, newBalance: number }`

### 8. **referral-credit** - Referral Processing
- **Input:** `{ referrer_id: string, referred_id: string }`
- **Output:** `{ success: boolean, rewards: object }`

### 9. **field-analysis** - Advanced Field Analytics
- **Input:** `{ field_id: string, analysis_type: string }`
- **Output:** `{ health: number, yield: number, recommendations: array }`

### 10. **check-ai-insights** - CRON Job
- **Schedule:** Every 12 hours
- **Purpose:** Generate automated insights for active users

### 11. **fn-crop-disease** - Production Disease Detection
- **Input:** `{ image: base64, cropType: string, location: object }`
- **Output:** `{ analysis: object, treatments: array, economic: object }`
- **External APIs:** PlantNet + Gemini AI
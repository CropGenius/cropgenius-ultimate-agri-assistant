# PRD Section 2: System Feature Matrix

This document maps every major feature in CropGenius to its corresponding UI components, Supabase interactions, and backend logic.

| Feature | UI Component(s) | Backend Agent(s) / Service(s) | Supabase Interaction(s) | Input -> Output Flow |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `AuthGuard.tsx`, `AuthFallback.tsx`, `Login.tsx`, `Signup.tsx` | `authService.ts` | `supabase.auth.signInWith...`, `supabase.auth.signUp`, `supabase.auth.onAuthStateChange`, `profiles` table, RLS Policies | **Input:** User credentials (email/pass, OAuth).<br>**Output:** Authenticated session, JWT, user profile data. |
| **Onboarding Wizard** | `Onboarding.tsx` (multi-step) | `onboardingService.ts` | `rpc('complete_onboarding')`, `profiles` table (update) | **Input:** User farm details (name, loc, size, crops, etc.).<br>**Output:** Completed user profile, redirection to dashboard. |
| **Dashboard** | `Dashboard.tsx`, `WeatherCard.tsx`, `NDVICard.tsx`, `MarketCard.tsx` | `WeatherAgent.ts`, `SmartMarketAgent.ts` | `weather` table, `market_prices` table, `farm_plans` table | **Input:** User ID.<br>**Output:** Aggregated view of weather, NDVI, market data, and AI farm plan. |
| **Crop Scan** | `CropScan.tsx`, `ImageUploader.tsx`, `ScanResult.tsx` | `CropScanAgent.ts`, `CropDiseaseIntelligence.ts` | `supabase.storage.upload`, `rpc('scan_crop')`, `scans` table | **Input:** Uploaded crop image.<br>**Output:** Disease identification, confidence score, symptoms, and Gemini treatment plan. |
| **AI Farm Plan** | `FarmPlanner.tsx`, `PlanSection.tsx` | `AIFarmPlanAgent.ts` | `edge_functions.invoke('generate-plan')`, `farm_plans` table | **Input:** User farm data.<br>**Output:** Collapsible, detailed farm plan. |
| **AI Chat** | `AIChatWidget.tsx` | `GenieAgent.ts` | `edge_functions.invoke('ai-chat')` | **Input:** User query.<br>**Output:** Contextual AI-generated response. |
| **Smart Market** | `Marketplace.tsx`, `PriceChart.tsx`, `SupplierList.tsx` | `SmartMarketAgent.ts` | `market_listings` table, `rpc('get_regional_prices')` | **Input:** Selected crops, user location.<br>**Output:** Price trends, supplier information. |
| **User Profile** | `Profile.tsx`, `MyFarm.tsx` | `profileService.ts` | `profiles` table (select, update) | **Input:** User ID.<br>**Output:** Editable user and farm details. |
| **Navigation** | `BottomNav.tsx`, `AppRoutes.tsx` | `react-router-dom` | N/A | **Input:** User click on nav item.<br>**Output:** Rendered view for the selected route. |

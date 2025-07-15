# Requirements Document

## Introduction

The CropGenius UI represents a catastrophic failure of software engineering - a polished facade that systematically deceives 100 million African farmers with fake data, non-functional buttons, and theatrical loading states that mask complete backend disconnection. This is not a user interface; it is a lie rendered in pixels that betrays the trust of smallholder farmers who depend on accurate agricultural intelligence for their livelihoods.

Every component, every interaction, every piece of data displayed represents a broken promise to farmers who need real-time crop disease detection, accurate weather forecasts, live market prices, and functional task management. The current state constitutes a systematic fraud where:

- Dashboards display hardcoded placeholder data while real Supabase tables remain empty
- Buttons trigger animations but perform no database operations
- Loading spinners rotate indefinitely because no actual network requests occur
- Success toasts celebrate mutations that never happened
- Real-time subscriptions exist in comments but never execute
- AI agents return mock responses while actual APIs remain uncalled
- Credit systems show fake balances while payment processing is disconnected
- Offline capabilities cache nothing because online functionality doesn't exist

This audit will forensically examine every line of code, every component, every hook, every service, and every integration to document the complete scope of deception and provide a surgical fix plan that transforms this UI theater into a functional agricultural intelligence platform.

## Requirements

### Requirement 1: Complete File-by-File UI Component Dissection

**User Story:** As a forensic auditor, I need every single UI component in the CropGenius codebase analyzed line-by-line to expose what each file pretends to do versus what it actually does, so that no deceptive UI element escapes detection.

#### Acceptance Criteria

1. WHEN examining src/components/dashboard/EnhancedDashboard.tsx THEN the audit SHALL document that it displays hardcoded farmHealth (85), fake weatherData, and mock marketData while claiming to show real farm intelligence
2. WHEN analyzing src/components/weather/WeatherWidget.tsx THEN the audit SHALL identify that it calls useOpenWeather hook which fails silently when VITE_OPENWEATHER_API_KEY is missing, showing error states to farmers
3. WHEN reviewing src/components/market/MarketIntelligenceDashboard.tsx THEN the audit SHALL trace that it calls MarketIntelligenceEngine which returns mock data instead of real market prices from the market_listings table
4. WHEN inspecting src/components/farms/SatelliteFarmCard.tsx THEN the audit SHALL flag that it calls getSatelliteImageUrl and getNDVIScore which return fallback mock data when Sentinel Hub API fails
5. WHEN examining src/agents/CropDiseaseOracle.ts THEN the audit SHALL verify that without VITE_PLANTNET_API_KEY and VITE_GEMINI_API_KEY, it returns generateFallbackAnalysis with fake disease detection results
6. WHEN reviewing src/hooks/useCredits.ts THEN the audit SHALL document that it simulates credit balance (100 default) because user_credits table exists but components don't properly connect to it
7. WHEN analyzing src/services/sentinelHubService.ts THEN the audit SHALL identify that it returns mock NDVI scores and fallback Mapbox URLs when Sentinel Hub authentication fails

### Requirement 2: Comprehensive Backend Integration Failure Analysis

**User Story:** As a technical investigator, I need every missing Supabase connection, broken query, and failed mutation documented with forensic precision, so that the complete scope of backend disconnection is exposed.

#### Acceptance Criteria

1. WHEN examining Supabase queries THEN the audit SHALL document every `from()` call that lacks proper `.select()`, `.filter()`, or `.order()` methods
2. WHEN analyzing database mutations THEN the audit SHALL identify every `.insert()`, `.update()`, and `.delete()` that fails to trigger UI updates or show proper error handling
3. WHEN reviewing real-time subscriptions THEN the audit SHALL document every `.channel()` that is created but never properly subscribed to or immediately unsubscribed
4. WHEN inspecting user authentication THEN the audit SHALL trace every `user.id` filter that is missing from queries, allowing data leakage or empty results
5. WHEN examining error handling THEN the audit SHALL document every missing `.catch()`, `.finally()`, and error state that causes silent failures
6. WHEN analyzing data refetching THEN the audit SHALL identify every mutation that succeeds but fails to trigger `.refetch()` or `.invalidateQueries()`
7. WHEN reviewing Row Level Security THEN the audit SHALL document every query that bypasses RLS or fails due to improper user context

### Requirement 3: Dead Interactive Element Identification

**User Story:** As a user experience auditor, I need every non-functional button, form, and interactive element documented with the specific reason for its failure, so that no farmer is deceived by clickable elements that perform no action.

#### Acceptance Criteria

1. WHEN examining buttons THEN the audit SHALL document every button without a proper onClick handler or with handlers that perform no backend operations
2. WHEN analyzing forms THEN the audit SHALL identify every form submission that updates local state but never persists to the database
3. WHEN reviewing input fields THEN the audit SHALL document every input that accepts user data but never saves it anywhere
4. WHEN inspecting navigation elements THEN the audit SHALL identify every link or navigation that appears functional but leads nowhere or to empty pages
5. WHEN examining modal dialogs THEN the audit SHALL document every modal with "Save" or "Submit" buttons that perform no actual operations
6. WHEN analyzing dropdown menus THEN the audit SHALL identify every dropdown that shows options but doesn't filter or update any data
7. WHEN reviewing toggle switches THEN the audit SHALL document every toggle that changes visual state but doesn't persist the change

### Requirement 4: Fake Data and Placeholder Content Exposure

**User Story:** As a data integrity auditor, I need every instance of hardcoded data, mock responses, and placeholder content identified and traced to its source, so that farmers are never shown false information.

#### Acceptance Criteria

1. WHEN examining dashboard components THEN the audit SHALL document every hardcoded number, fake percentage, and static chart data
2. WHEN analyzing data displays THEN the audit SHALL identify every "Field A", "Farm 1", "Total: 0", and similar placeholder labels
3. WHEN reviewing API responses THEN the audit SHALL document every mock response, fake JSON data, and hardcoded return values
4. WHEN inspecting user profiles THEN the audit SHALL identify every fake user name, placeholder avatar, and static profile information
5. WHEN examining weather data THEN the audit SHALL document every hardcoded temperature, fake forecast, and static weather icon
6. WHEN analyzing market prices THEN the audit SHALL identify every fake price, static percentage change, and mock market data
7. WHEN reviewing AI responses THEN the audit SHALL document every canned response, fake analysis result, and mock recommendation

### Requirement 5: Silent Failure and Error State Documentation

**User Story:** As a reliability auditor, I need every silent failure, missing error handler, and broken error state documented, so that farmers receive proper feedback when operations fail.

#### Acceptance Criteria

1. WHEN examining try-catch blocks THEN the audit SHALL document every catch block that logs errors but doesn't inform the user
2. WHEN analyzing loading states THEN the audit SHALL identify every loading spinner that spins forever due to failed requests
3. WHEN reviewing success notifications THEN the audit SHALL document every toast or notification that shows "Success" when no operation actually occurred
4. WHEN inspecting error boundaries THEN the audit SHALL identify every missing error boundary that could cause white screens of death
5. WHEN examining network requests THEN the audit SHALL document every request that fails silently without user notification
6. WHEN analyzing form validation THEN the audit SHALL identify every validation that prevents submission but doesn't explain why
7. WHEN reviewing offline handling THEN the audit SHALL document every offline scenario that breaks the UI without proper fallbacks

### Requirement 6: Real-time Subscription and State Management Failures

**User Story:** As a real-time systems auditor, I need every broken subscription, failed state update, and disconnected real-time feature documented, so that farmers receive live updates as promised.

#### Acceptance Criteria

1. WHEN examining useEffect hooks THEN the audit SHALL document every effect that sets up subscriptions but never properly cleans them up
2. WHEN analyzing React Query usage THEN the audit SHALL identify every query key that never changes, preventing proper cache invalidation
3. WHEN reviewing state updates THEN the audit SHALL document every setState call that updates local state but doesn't reflect in the UI
4. WHEN inspecting WebSocket connections THEN the audit SHALL identify every connection that is established but never receives or processes messages
5. WHEN examining real-time listeners THEN the audit SHALL document every listener that is registered but never triggers UI updates
6. WHEN analyzing context providers THEN the audit SHALL identify every context that provides stale data or never updates
7. WHEN reviewing component re-renders THEN the audit SHALL document every component that should re-render on data changes but doesn't

### Requirement 7: AI Agent and External API Integration Failures

**User Story:** As an AI systems auditor, I need every broken AI agent call, failed external API integration, and mock AI response documented, so that farmers receive real AI assistance instead of fake responses.

#### Acceptance Criteria

1. WHEN examining AI agent calls THEN the audit SHALL document every agent invocation that returns mock data instead of real AI analysis
2. WHEN analyzing image upload functionality THEN the audit SHALL identify every image upload that appears to process but never calls disease detection APIs
3. WHEN reviewing weather API integration THEN the audit SHALL document every weather display that shows fake data instead of real API responses
4. WHEN inspecting satellite imagery THEN the audit SHALL identify every NDVI display that shows mock data instead of real Sentinel Hub results
5. WHEN examining chat functionality THEN the audit SHALL document every AI chat response that is hardcoded instead of generated
6. WHEN analyzing recommendation systems THEN the audit SHALL identify every recommendation that is static instead of dynamically generated
7. WHEN reviewing API error handling THEN the audit SHALL document every external API failure that is hidden from users

### Requirement 8: Authentication and User Context Failures

**User Story:** As a security auditor, I need every authentication bypass, missing user context, and broken user session documented, so that user data is properly isolated and secured.

#### Acceptance Criteria

1. WHEN examining user authentication THEN the audit SHALL document every component that displays data without verifying user authentication
2. WHEN analyzing user context THEN the audit SHALL identify every query that fails to filter by user ID, potentially showing other users' data
3. WHEN reviewing session management THEN the audit SHALL document every session that persists fake data instead of real user information
4. WHEN inspecting protected routes THEN the audit SHALL identify every route that appears protected but allows unauthorized access
5. WHEN examining user profiles THEN the audit SHALL document every profile field that shows placeholder data instead of real user information
6. WHEN analyzing user permissions THEN the audit SHALL identify every permission check that is bypassed or incorrectly implemented
7. WHEN reviewing logout functionality THEN the audit SHALL document every logout that fails to clear user data or redirect properly

### Requirement 9: Mobile and Offline Functionality Failures

**User Story:** As a mobile experience auditor, I need every broken offline feature, failed PWA capability, and mobile-specific failure documented, so that farmers can use the app reliably in remote locations.

#### Acceptance Criteria

1. WHEN examining PWA functionality THEN the audit SHALL document every service worker feature that is registered but non-functional
2. WHEN analyzing offline caching THEN the audit SHALL identify every cache that is empty or contains stale data
3. WHEN reviewing mobile responsiveness THEN the audit SHALL document every component that breaks on mobile devices
4. WHEN inspecting touch interactions THEN the audit SHALL identify every touch gesture that is implemented but non-functional
5. WHEN examining offline sync THEN the audit SHALL document every sync operation that fails to upload cached changes
6. WHEN analyzing mobile navigation THEN the audit SHALL identify every navigation pattern that is broken on mobile
7. WHEN reviewing mobile performance THEN the audit SHALL document every performance issue that makes the app unusable on mobile

### Requirement 10: Comprehensive Fix Implementation Plan

**User Story:** As a development team lead, I need a detailed, file-by-file implementation plan that specifies exactly what to delete, what to replace, and what to implement, so that every identified issue can be systematically resolved.

#### Acceptance Criteria

1. WHEN creating fix plans THEN the audit SHALL provide specific file paths, line numbers, and exact code changes needed
2. WHEN prioritizing fixes THEN the audit SHALL rank issues by user impact, implementation complexity, and dependency relationships
3. WHEN specifying implementations THEN the audit SHALL provide exact Supabase queries, mutations, and subscriptions needed
4. WHEN documenting deletions THEN the audit SHALL identify every line of fake code, mock data, and placeholder content to remove
5. WHEN planning replacements THEN the audit SHALL specify exact React Query hooks, Supabase calls, and error handlers to implement
6. WHEN estimating effort THEN the audit SHALL provide realistic time estimates for each fix category and implementation phase
7. WHEN defining success criteria THEN the audit SHALL specify exact tests, validations, and user scenarios that must pass
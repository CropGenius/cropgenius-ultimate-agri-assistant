# PRD Section 3: Full User Journey Map

This document outlines the screen-by-screen user flow for all major interactions within the CropGenius application.

## Flow 1: New User Registration & Onboarding

1.  **Screen: Landing/Login (`Login.tsx`)**
    - **User Action:** Clicks "Sign Up".
    - **System Response:** Navigates to the registration screen.

2.  **Screen: Registration (`Signup.tsx`)**
    - **User Action:** Enters email, password, and confirms. Clicks "Create Account".
    - **System Response:** Calls `supabase.auth.signUp`. On success, creates a new user and a corresponding entry in the `profiles` table. Redirects to the Onboarding wizard.

3.  **Screen: Onboarding Wizard (`Onboarding.tsx`)**
    - **Step 1:** Language + Phone.
    - **Step 2:** Farm Name + Location (Map interaction).
    - **Step 3:** Farm Size + Crops (Multi-select).
    - **Step 4:** Planting/Harvest Dates.
    - **Step 5:** Irrigation, Machinery, Soil Test details.
    - **Step 6:** Goals & Pain Points + Visual Summary.
    - **User Action:** Completes all steps and clicks "Finish".
    - **System Response:** Calls `rpc('complete_onboarding')` to persist all data to the `profiles` table. Navigates to the main Dashboard.

## Flow 2: Existing User Login

1.  **Screen: Login (`Login.tsx`)**
    - **User Action:** Enters email and password. Clicks "Login".
    - **System Response:** Calls `supabase.auth.signInWithPassword`. On success, establishes a session and navigates to the Dashboard.

## Flow 3: Core Application Usage (Post-Login)

-   **Entry Point: Dashboard (`Dashboard.tsx`)**
    - **Description:** The central hub displaying weather, NDVI, market insights, and a summary of the AI Farm Plan.
    - **Navigation:** Uses the `BottomNav.tsx` component for primary navigation.

-   **Journey A: Crop Scanning**
    1.  **Action:** Clicks "Scan Crop" on the bottom navigation.
    2.  **Screen: `CropScan.tsx`**
        - **Action:** User uploads or captures an image of a crop.
        - **Response:** Image is uploaded to Supabase Storage. `rpc('scan_crop')` is called.
    3.  **Screen: `ScanResult.tsx`**
        - **Response:** Displays disease name, confidence, symptoms, and a Gemini-generated treatment plan.

-   **Journey B: AI Farm Plan**
    1.  **Action:** Clicks the "AI Farm Plan" card on the Dashboard.
    2.  **Screen: `FarmPlanner.tsx`**
        - **Response:** Displays the detailed, collapsible farm plan fetched from the `farm_plans` table.

-   **Journey C: AI Chat**
    1.  **Action:** Clicks "AI Chat" on the bottom navigation.
    2.  **Screen: `AIChatWidget.tsx`**
        - **Action:** User types a question and sends.
        - **Response:** Invokes the `ai-chat` Edge Function and displays the AI's response.

-   **Journey D: My Farm / Profile**
    1.  **Action:** Clicks "My Farm" or "Profile" on the bottom navigation.
    2.  **Screen: `MyFarm.tsx` / `Profile.tsx`**
        - **Response:** Displays the user's farm and profile information, allowing for edits.

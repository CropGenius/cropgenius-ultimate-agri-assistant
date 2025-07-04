# PRD Section 10: Functional Flowchain Mapping

This document provides a granular, step-by-step trace of key user interactions, mapping the entire chain of events from UI to database and back.

## Flowchain 1: New User Onboarding & First Login

**Objective:** Trace the journey of a new user from the sign-up form to their first authenticated view of the dashboard.

| Step | User Action | UI Component & Handler | Hook / State Change | Service Function Call | Supabase API Call | DB Effect | UI Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Clicks "Sign Up" | `LoginScreen.tsx` -> `<Link to="/signup">` | N/A (Routing) | N/A | N/A | N/A | Navigates to `/signup`. |
| 2 | Fills form, clicks "Create Account" | `SignupScreen.tsx` -> `onSubmit()` | `useForm` validation, `useMutation` for signup | `authService.signup(email, pass)` | `supabase.auth.signUp()` | Inserts a new user into `auth.users`. A trigger creates a corresponding row in `public.profiles`. | Shows loading spinner. On success, navigates to `/onboarding`. On error, shows toast message. |
| 3 | Completes Onboarding Step 1 (Phone) | `Onboarding.tsx` -> `handleNext()` | `useState` to update form data object. | N/A | N/A | N/A | Renders Step 2 of the wizard with transition. |
| 4 | Completes Final Onboarding Step | `Onboarding.tsx` -> `handleFinish()` | `useMutation` for completion | `onboardingService.complete(formData)` | `rpc('complete_onboarding', { p_profile_id, p_farm_data })` | Updates the user's row in `public.profiles`. Creates rows in `public.farms` and `public.fields`. | Shows success animation. Navigates to `/dashboard`. |
| 5 | App loads Dashboard | `Dashboard.tsx` | `useQuery` for weather, `useQuery` for farm plan | `weatherService.getForecast()`, `farmService.getPlan()` | `select * from weather`, `select * from farm_plans` | N/A | Displays loading skeletons, then populates cards with data. |

## Flowchain 2: Crop Scan

**Objective:** Trace the process of a user scanning a crop and receiving an AI-driven treatment plan.

| Step | User Action | UI Component & Handler | Hook / State Change | Service Function Call | Supabase API Call / Edge Function | DB Effect | UI Response |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Clicks "Scan Crop" | `BottomNav.tsx` | N/A (Routing) | N/A | N/A | N/A | Navigates to `/scan`. |
| 2 | Uploads image | `ImageUploader.tsx` -> `onFileChange()` | `useState` to hold the file object. | `storageService.upload(file)` | `supabase.storage.from('scans').upload()` | Inserts file into `scans` storage bucket. | Shows image preview and a "Scan Now" button. |
| 3 | Clicks "Scan Now" | `CropScan.tsx` -> `handleScan()` | `useMutation` for scanning | `cropScanService.scan(imageUrl)` | `supabase.functions.invoke('scan-crop')` | Edge Function calls external AI (PlantNet), then Gemini. Inserts a new row into the `scans` table with the result. | Displays loading state. On success, renders the `ScanResult.tsx` component with the returned data. |

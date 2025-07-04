# PRD Section 12: Security & Auth

This document outlines the comprehensive security model for the CropGenius application, covering authentication, authorization (Row Level Security), and secret management.

## 1. Authentication

-   **Provider:** Supabase Auth is the sole authentication provider.
-   **Methods:**
    -   Email/Password: Standard sign-up and sign-in.
    -   Social Logins (Future): Google, Apple.
-   **JWT Management:** Supabase's built-in JWT handling is used to manage user sessions. The JWT contains the `user_id`, which is fundamental for all RLS policies.
-   **Flow:**
    1.  User signs up or logs in via the client-side `supabase-js` library.
    2.  Supabase issues a JWT, which is stored securely in the browser's local storage.
    3.  Every subsequent request to the Supabase backend includes this JWT in the `Authorization` header.

## 2. Authorization: Row Level Security (RLS)

RLS is enabled on all tables containing user-specific data to ensure strict data isolation.

### RLS Policy: `profiles` Table

-   **`SELECT`:** Users can only view their own profile.
    -   `USING (auth.uid() = id)`
-   **`UPDATE`:** Users can only update their own profile.
    -   `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`
-   **`INSERT` / `DELETE`:** Not allowed via the API. Profile creation is handled by a trigger on `auth.users` insertion.

### RLS Policy: `farms` Table

-   **`SELECT`:** Users can only view their own farms.
    -   `USING (auth.uid() = user_id)`
-   **`INSERT`:** Users can only create farms linked to their own `user_id`.
    -   `WITH CHECK (auth.uid() = user_id)`
-   **`UPDATE`:** Users can only update their own farms.
    -   `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
-   **`DELETE`:** Users can only delete their own farms.
    -   `USING (auth.uid() = user_id)`

*This same pattern is applied to all other user-data tables, such as `fields`, `scans`, and `farm_plans`.*

## 3. Secret & API Key Management

**Golden Rule:** No secrets, API keys, or other credentials will ever be exposed on the client-side (the React application).

-   **Mechanism:** All interactions with third-party services (Gemini, PlantNet, OpenWeatherMap) are proxied through **Supabase Edge Functions**.
-   **Storage:** API keys are stored securely as **environment variables** within the Supabase project settings.
-   **Access:** Edge Functions access these keys via `Deno.env.get('API_KEY_NAME')`. The client application never has access to them.
-   **Example Flow (Crop Scan):**
    1.  Client invokes the `scan-crop` Edge Function.
    2.  The Edge Function retrieves the `PLANTNET_API_KEY` from its environment variables.
    3.  The Edge Function makes the secure, server-to-server call to the PlantNet API.
    4.  The result is returned to the client.

This architecture ensures that all sensitive credentials remain confidential, mitigating the risk of unauthorized access.

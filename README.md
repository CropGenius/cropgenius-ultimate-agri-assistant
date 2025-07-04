# 🌾 CROPGENIUS - AGRICULTURAL SUPERINTELLIGENCE PLATFORM

## 🧠 Section 1: AI-AWARE SYSTEM CONTEXT

**CropGenius is a precision agriculture platform designed to provide smallholder farmers in Africa with real-time, AI-powered intelligence.** Our mission is to make every farmer feel like they have a dedicated team of agronomists, meteorologists, and market analysts in their pocket.

*   **Product Summary:** CropGenius transforms farming with data-driven recommendations, from satellite-based field analysis to AI-powered disease diagnosis and market optimization.
*   **Target Users:** Smallholder farmers across Africa. The platform is built with a **mobile-first, offline-first** mindset to accommodate low-connectivity environments.
*   **Core Features:**
    *   **Satellite Field Intelligence:** AI-powered analysis of satellite imagery (NDVI) to monitor crop health, detect stress, and predict yield.
    *   **Crop Disease Oracle:** Instant crop disease identification from images, with AI-generated treatment plans and local supplier lookups.
    *   **Weather Prophecy Engine:** Hyper-local weather forecasting with actionable farming-specific insights (e.g., planting windows, irrigation schedules).
    *   **Market Intelligence Oracle:** Real-time market price tracking and profit optimization strategies.
    *   **WhatsApp Farming Genius:** 24/7 access to agricultural expertise via a natural language WhatsApp bot.
*   **Repo Contents:** This monorepo contains the entire CropGenius stack:
    *   **Frontend:** Vite + React + TypeScript application.
    *   **Backend:** Supabase, including Postgres database, Edge Functions, and RPCs.

---

## 🧪 Section 2: ENVIRONMENT SETUP

Follow these steps to get your local development environment running.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/cropgenius-africa.git
    cd cropgenius-africa
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    *   Install the Supabase CLI: `npm install -g supabase`
    *   Log in: `supabase login`
    *   Link your project (replace `PROJECT_ID` with your actual Supabase project ID): `supabase link --project-ref PROJECT_ID`
    *   Pull remote database changes: `supabase db pull`

4.  **Configure Environment Secrets:**
    *   Create a `.env` file by copying the example: `cp .env.example .env`
    *   Fill in **all** the required secrets in the `.env` file. These include keys for Supabase, PlantNet, weather APIs, Sentinel Hub, and WhatsApp Business. Each variable is documented in `.env.example`.

5.  **Run Migrations & Start Dev Server:**
    *   Apply the latest database migrations: `npm run db:migrate`
    *   Start the development server: `npm run dev`

---

## 📁 Section 3: MONOREPO FILE STRUCTURE

The repository is organized to separate concerns and facilitate both human and AI agent interaction.

*   `/src/features`: Self-contained feature modules (e.g., `onboarding`, `auth`, `fields`).
*   `/src/services`: External API clients (e.g., weather, market data).
*   `/src/intelligence`: Core AI logic for the various oracles and engines.
*   `/src/hooks`: Reusable React hooks for accessing context and services.
*   `/src/components`: Shared, reusable UI components.
*   `/supabase/functions`: Serverless Edge Functions for backend logic.
*   `/supabase/migrations`: Database schema history.

---

## ⚙️ Section 4: SUPABASE SPEC

*   **Project URL:** `https://<YOUR_PROJECT_ID>.supabase.co`
*   **Edge Functions:** Deployed from `/supabase/functions`. These handle real-time, intensive backend tasks.
    *   `field-ai-insights`: Processes satellite data.
    *   `fn-crop-disease`: Handles image analysis for crop health.
    *   `whatsapp-notification`: Manages WhatsApp message dispatch.
*   **RPC Functions:** Used for database-intensive operations that can be called securely from the client. Check the migrations for schema details.
*   **RLS (Row-Level Security):** RLS is **ENABLED** on all tables containing user data. Policies ensure that users can only access their own data. Review policies in the Supabase dashboard or migration files.
*   **Local Connection:** The `npm run dev` command uses the Supabase CLI to proxy the remote database, allowing you to work with real data securely.

---

## 🔄 Section 5: ONBOARDING FLOW MAP

The user onboarding wizard is a critical multi-step process that gathers essential farm data.

1.  **Farm Vitals (`StepOneFarmVitals.tsx`):** User defines farm location and size.
2.  **Crop Seasons (`StepTwoCropSeasons.tsx`):** User inputs their primary crops and planting/harvest cycles.
3.  **Goals (`StepThreeGoals.tsx`):** User selects their main objectives (e.g., increase yield, reduce costs).
4.  **State Management:** Onboarding state is managed via `useOnboarding` hook and persisted to `localStorage` to survive refreshes.
5.  **Data Commit:** Upon completion, the wizard calls a Supabase RPC function (`create_initial_farm_profile`) to write all the data to the `profiles`, `farms`, and `farm_crops` tables.

---

## 🤖 Section 6: AI AGENT DIRECTORY

The platform's intelligence is driven by a series of specialized AI agents.

*   **AIFarmPlanAgent:**
    *   **Purpose:** Generates daily task lists for farmers.
    *   **Connects to:** `field-ai-insights` Edge Function.
    *   **Logic Flow:** Fetches weather forecast, soil moisture from satellite data, and crop growth stage -> generates tasks like "Irrigate Sector B" or "Scout for blight."
*   **SmartMarketAgent:**
    *   **Purpose:** Provides selling recommendations.
    *   **Connects to:** `market-intelligence` RPC.
    *   **Logic Flow:** Fetches prices from multiple market APIs -> calculates transport costs -> recommends best market and timing to maximize profit.
*   **CropScanAgent:**
    *   **Purpose:** Diagnoses crop disease from an image.
    *   **Connects to:** `fn-crop-disease` Edge Function.
    *   **Logic Flow:** Receives image -> sends to PlantNet API -> retrieves diagnosis -> queries treatment database -> finds local suppliers.

---

## 🔌 Section 7: DEPLOYMENT INSTRUCTIONS

*   **Provider:** The frontend is deployed on Vercel.
*   **Supabase Deploy:**
    1.  Commit your migration files.
    2.  Run `supabase functions deploy <function-name>` for any updated Edge Functions.
    3.  Run `supabase db push` to apply new migrations to the production database.
*   **CI/CD:** A GitHub Action automatically deploys the Vercel frontend on pushes to the `main` branch.

---

## ✍️ Section 8: CONTRIBUTION GUIDE (FOR AI + DEV)

*   **Feature Workflow:** Create a new feature branch -> implement feature in its own `/src/features` directory -> write tests -> update documentation -> submit PR.
*   **AI-Readable Comments:** Use structured comments to guide AI agents.
    *   `// @agent: AIFarmPlanAgent - This function fetches the latest NDVI data.`
    *   `// step: 1 - Get user coordinates from profile.`
*   **Code Standards:**
    *   **Naming:** Use `camelCase` for functions/variables, `PascalCase` for components/types.
    *   **Styling:** Use Tailwind CSS utility classes directly in components.
    *   **Testing:** All new logic must have corresponding tests in the `__tests__` directory.

---

## 📊 Section 9: DEBUGGING & LOGGING GUIDE

*   **Client-Side Logs:** View logs in the browser's developer console.
*   **Supabase Logs:** View Edge Function and database logs in the Supabase Dashboard under `Project -> Logs`.
*   **Simulating Users:** Use the "GoTrue" tab in the Supabase local dev dashboard (`http://localhost:54323`) to create test users and simulate sessions.
*   **Common Failures:** If a Supabase call fails, first check the RLS policy for the target table. Then, check the function logs.

---

## ✅ Section 10: DONE = DEFINED

A feature is not "done" until it meets this checklist:

*   [ ] Component renders correctly on mobile and desktop.
*   [ ] All user input is validated.
*   [ ] Data flows correctly to/from Supabase.
*   [ ] Edge Functions/RPCs are protected by auth and RLS.
*   [ ] The result of any AI operation is logged for analytics.
*   [ ] The UI provides clear feedback for success, loading, and error states.
*   [ ] Unit and integration tests pass.
*   [ ] TypeScript types are fully defined and there are no `any` types.

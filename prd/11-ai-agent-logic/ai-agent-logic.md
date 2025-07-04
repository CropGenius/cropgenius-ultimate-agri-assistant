# PRD Section 11: AI Agent Dispatch Logic

This document details the architecture and data flow for the backend AI agents that power CropGenius's intelligent features. These agents are typically invoked via secure Supabase Edge Functions.

## Agent 1: `CropScanAgent`

-   **Purpose:** To analyze an image of a plant and identify potential diseases, providing a diagnosis and treatment plan.
-   **Trigger:** Invoked by the `scan-crop` Edge Function when a user uploads an image in the Crop Scan feature.
-   **Input:**
    -   `imageUrl`: Public URL of the image stored in Supabase Storage.
    -   `fieldId`: The ID of the field where the scan was taken.
-   **Logic Flow:**
    1.  Receives the `imageUrl`.
    2.  Dispatches the image to a primary identification service (e.g., PlantNet API).
    3.  If the primary service fails or returns low confidence, it may use a fallback model (`CropDiseaseOracle`).
    4.  The identified disease name is then passed to the `CropDiseaseIntelligence` agent.
    5.  `CropDiseaseIntelligence` queries a knowledge base or a generative AI (like Gemini) to fetch detailed symptoms and generate a step-by-step treatment plan.
-   **Output:** A JSON object containing `{ diseaseName, confidenceScore, symptoms, treatmentPlan }`.
-   **Persistence:** The final output is saved to the `scans` table, linked to the `fieldId`.

## Agent 2: `AIFarmPlanAgent`

-   **Purpose:** To generate a comprehensive, long-term farm management plan.
-   **Trigger:** Invoked by the `generate-plan` Edge Function, typically after onboarding or when requested by the user.
-   **Input:**
    -   `farmId`: The ID of the user's farm.
-   **Logic Flow:**
    1.  Fetches all relevant data for the given `farmId` from the database (e.g., location, size, crops, soil data).
    2.  Constructs a detailed prompt for a generative AI (Gemini).
    3.  The prompt requests a plan broken down into sections: soil preparation, planting schedule, fertilization, irrigation, pest control, and harvesting.
    4.  Parses the AI's response into a structured JSON object.
-   **Output:** A JSON object representing the full farm plan.
-   **Persistence:** The generated plan is saved to the `farm_plans` table.

## Agent 3: `GenieAgent`

-   **Purpose:** To provide conversational AI support to the user.
-   **Trigger:** Invoked by the `ai-chat` Edge Function whenever a user sends a message in the `AIChatWidget`.
-   **Input:**
    -   `message`: The user's query.
    -   `chatHistory`: The preceding conversation for context.
-   **Logic Flow:**
    1.  Combines the new message with the chat history.
    2.  Sends the context-rich query to a conversational AI model (Gemini).
    3.  Returns the model's response directly.
-   **Output:** A string containing the AI's answer.
-   **Persistence:** Chat history is managed on the client-side and sent with each request.

## Agent 4: `SmartMarketAgent`

-   **Purpose:** To provide real-time, location-based market intelligence.
-   **Trigger:** Invoked when a user accesses the Smart Market feature.
-   **Input:**
    -   `userId`: The ID of the user to get their location and preferred crops.
-   **Logic Flow:**
    1.  Fetches the user's farm location and crop list from the `profiles` and `farms` tables.
    2.  Queries the `market_listings` table for recent prices of those crops.
    3.  Performs geospatial filtering to prioritize listings near the user's location.
    4.  Can also be used to find suppliers of farm inputs.
-   **Output:** A JSON object containing `{ priceTrends, nearbyListings }`.
-   **Persistence:** N/A (data is read-only).

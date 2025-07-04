# PRD Section 6: API & Supabase Schema

This document defines the complete database schema, API contracts, and data validation rules for the CropGenius application.

## 1. Database Tables

| Table Name | Column | Data Type | Description |
| :--- | :--- | :--- | :--- |
| **`profiles`** | `id` | `uuid` (Primary Key, Foreign Key to `auth.users.id`) | User's unique identifier. |
| | `email` | `text` | User's email address. |
| | `full_name` | `text` | User's full name. |
| | `phone_number` | `text` | User's WhatsApp-validated phone number. |
| | `onboarding_status` | `text` (e.g., 'pending', 'complete') | Tracks user's onboarding progress. |
| | `preferences` | `jsonb` | User-specific preferences (e.g., language, notifications). |
| **`farms`** | `id` | `uuid` (Primary Key) | Farm's unique identifier. |
| | `profile_id` | `uuid` (Foreign Key to `profiles.id`) | Owning user's ID. |
| | `name` | `text` | Name of the farm. |
| | `location` | `geography(Point, 4326)` | Geographic location of the farm. |
| | `total_area` | `numeric` | Total area of the farm. |
| **`fields`** | `id` | `uuid` (Primary Key) | Field's unique identifier. |
| | `farm_id` | `uuid` (Foreign Key to `farms.id`) | Owning farm's ID. |
| | `crop_id` | `uuid` (Foreign Key to `crops.id`) | Currently planted crop. |
| | `boundaries` | `geography(Polygon, 4326)` | Geographic boundaries of the field. |
| **`scans`** | `id` | `uuid` (Primary Key) | Scan's unique identifier. |
| | `field_id` | `uuid` (Foreign Key to `fields.id`) | Field where the scan was taken. |
| | `image_url` | `text` | URL of the scanned image in Supabase Storage. |
| | `result` | `jsonb` | AI-generated scan result (disease, confidence, etc.). |
| **`farm_plans`** | `id` | `uuid` (Primary Key) | Plan's unique identifier. |
| | `farm_id` | `uuid` (Foreign Key to `farms.id`) | Owning farm's ID. |
| | `plan_content` | `jsonb` | Detailed AI-generated farm plan. |
| **`market_listings`** | `id` | `uuid` (Primary Key) | Listing's unique identifier. |
| | `crop_id` | `uuid` (Foreign Key to `crops.id`) | Crop being sold. |
| | `price` | `numeric` | Price per unit. |
| | `location` | `geography(Point, 4326)` | Location of the seller. |

## 2. Remote Procedure Calls (RPCs)

| RPC Name | Parameters | Return Value | Description |
| :--- | :--- | :--- | :--- |
| **`complete_onboarding`** | `p_profile_id uuid`, `p_farm_data jsonb` | `void` | Updates the user's profile and creates their farm/field entries upon completion of the onboarding wizard. |
| **`get_regional_prices`** | `p_crop_id uuid`, `p_user_location geography` | `TABLE(price numeric, location geography)` | Fetches market prices for a specific crop within a certain radius of the user. |

## 3. Edge Functions

| Function Name | Method | Route | Description |
| :--- | :--- | :--- | :--- |
| **`generate-plan`** | `POST` | `/generate-plan` | **Secure.** Accepts a `farm_id` and invokes the `AIFarmPlanAgent` to generate a farm plan. Stores the result in the `farm_plans` table. |
| **`scan-crop`** | `POST` | `/scan-crop` | **Secure.** Accepts an `image_url` and `field_id`. Invokes the `CropScanAgent` to analyze the image and returns the result. |
| **`ai-chat`** | `POST` | `/ai-chat` | **Secure.** Accepts a user query and chat history. Invokes the `GenieAgent` to get a contextual response. |

## 4. Data Validation (Zod Schemas)

- All API payloads (RPCs and Edge Functions) will be validated at runtime using Zod schemas defined in `src/types/api.ts`. This ensures type safety and prevents malformed data from reaching the backend.

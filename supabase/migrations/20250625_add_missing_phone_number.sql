-- Migration: Ensure phone_number column exists on profiles
-- This safeguards the complete_onboarding RPC which references the column.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT; 
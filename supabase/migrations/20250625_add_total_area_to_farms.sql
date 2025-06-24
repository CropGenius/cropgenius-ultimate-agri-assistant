-- Migration: ensure total_area column exists for backward compatibility
ALTER TABLE public.farms
ADD COLUMN IF NOT EXISTS total_area DECIMAL; 
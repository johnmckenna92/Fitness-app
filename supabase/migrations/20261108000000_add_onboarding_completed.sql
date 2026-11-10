-- ==============================================================================
-- ADD ONBOARDING_COMPLETED TO PROFILES
-- Migration: 20261108000000_add_onboarding_completed.sql
-- ==============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Backfill profiles that already have a name from web invite/signup or metrics
UPDATE public.profiles
SET onboarding_completed = true
WHERE (full_name IS NOT NULL AND trim(full_name) <> '')
   OR (height IS NOT NULL AND weight IS NOT NULL);

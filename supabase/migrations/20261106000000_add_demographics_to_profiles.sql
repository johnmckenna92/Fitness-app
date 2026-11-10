-- Add demographic fields directly to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT NULL;

-- ==============================================================================
-- ZERO-TRUST DATABASE ARCHITECTURE & ROW LEVEL SECURITY (RLS)
-- Migration: 20261105000000_zero_trust_security.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PUBLIC.RECIPES SECURITY HARDENING
-- Read-only SELECT access for public (anon) and authenticated users.
-- Explicitly blocks client-side INSERT, UPDATE, and DELETE via default-deny RLS.
-- ------------------------------------------------------------------------------

-- Ensure Row Level Security is enabled on recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Allow read-only access to recipes for authenticated and anon users" ON public.recipes;
DROP POLICY IF EXISTS "Allow public read access to recipes" ON public.recipes;

-- Enforce read-only SELECT for public/authenticated users
CREATE POLICY "Allow read-only access to recipes for authenticated and anon users"
ON public.recipes
FOR SELECT
TO anon, authenticated
USING (true);

-- No INSERT, UPDATE, or DELETE policies are granted to anon or authenticated users.
-- Any client write attempt will be rejected by PostgreSQL with an RLS violation.


-- ------------------------------------------------------------------------------
-- 2. PUBLIC.PROFILES SECURITY HARDENING
-- Authenticated users may ONLY select and update their own record (auth.uid() = id).
-- Direct client-side INSERT and DELETE are strictly disallowed.
-- ------------------------------------------------------------------------------

-- Ensure Row Level Security is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;

-- Allow authenticated users to SELECT strictly where auth.uid() = id
CREATE POLICY "Allow authenticated users to read their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to UPDATE strictly where auth.uid() = id
CREATE POLICY "Allow authenticated users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- No INSERT or DELETE policies exist for clients. Creation is delegated strictly
-- to the auth trigger below.


-- ------------------------------------------------------------------------------
-- 3. PROFILE CREATION TRIGGER (DATABASE-DRIVEN INSERTION)
-- Automatically inserts a new profile row on user registration in auth.users.
-- Prevents unauthorized client manipulation and guarantees schema integrity.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    target_calories,
    target_protein,
    target_carbs,
    target_fats,
    meals_per_day,
    subscription_status,
    is_pro,
    goals
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'target_calories')::integer, 2200),
    COALESCE((NEW.raw_user_meta_data->>'target_protein')::integer, 140),
    COALESCE((NEW.raw_user_meta_data->>'target_carbs')::integer, 200),
    COALESCE((NEW.raw_user_meta_data->>'target_fats')::integer, 65),
    COALESCE((NEW.raw_user_meta_data->>'meals_per_day')::integer, 4),
    'free',
    false,
    CASE 
      WHEN NEW.raw_user_meta_data->'goals' IS NOT NULL AND jsonb_typeof(NEW.raw_user_meta_data->'goals') = 'array'
      THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'goals'))
      ELSE ARRAY[]::text[]
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- B2B2C MULTI-TENANCY, RBAC & UK GDPR HEALTH DATA RLS HARDENING
-- Migration: 20261107000000_b2b_multi_tenant_rls.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SCHEMA EXTENSIONS (PUBLIC.PROFILES)
-- Support RBAC (client / trainer), trainer assignment, and Stripe billing
-- ------------------------------------------------------------------------------

-- Add role column with check constraint ('client' or 'trainer')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'trainer'));
    END IF;
END $$;

-- Add or confirm trainer_id (self-referencing FK to public.profiles)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add stripe_customer_id and subscription_tier
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT NULL;

-- Create indexes for performance on RBAC and multi-tenant lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_trainer_id ON public.profiles(trainer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- Update profile creation trigger to populate role from auth metadata if supplied
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
    goals,
    height,
    weight,
    role,
    subscription_tier
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
      WHEN NEW.raw_user_meta_data->'goals' IS NOT NULL AND jsonb_typeof(NEW.raw_user_meta_data->'goals') = 'array' AND jsonb_array_length(NEW.raw_user_meta_data->'goals') > 0
      THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'goals'))
      ELSE NULL
    END,
    NULL,
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.raw_user_meta_data->>'subscription_tier'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) POLICIES FOR PUBLIC.PROFILES
-- Clients restricted to auth.uid() = id.
-- Trainers allowed to access profiles where trainer_id = auth.uid().
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Clean up any legacy or overlapping policies
DROP POLICY IF EXISTS "Allow authenticated users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Trainers can read client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Trainers can update client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile or assigned clients" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or assigned clients" ON public.profiles;

-- SELECT policy: Users read their own profile; Trainers read assigned client profiles
CREATE POLICY "Users can read own profile or assigned clients"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    auth.uid() = id
    OR trainer_id = auth.uid()
);

-- UPDATE policy: Users update their own profile; Trainers update assigned client profiles
CREATE POLICY "Users can update own profile or assigned clients"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    auth.uid() = id
    OR trainer_id = auth.uid()
)
WITH CHECK (
    auth.uid() = id
    OR trainer_id = auth.uid()
);


-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR PUBLIC.DAILY_LOGS
-- UK GDPR Special Category Health Data Isolation
-- Clients restricted to auth.uid() = user_id.
-- Trainers allowed where client's trainer_id = auth.uid().
-- ------------------------------------------------------------------------------
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Clean up existing daily_logs policies
DROP POLICY IF EXISTS "Users can read own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can insert own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can delete own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Trainers can read client daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users and trainers can read daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users and trainers can update daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Daily logs select policy" ON public.daily_logs;
DROP POLICY IF EXISTS "Daily logs insert policy" ON public.daily_logs;
DROP POLICY IF EXISTS "Daily logs update policy" ON public.daily_logs;
DROP POLICY IF EXISTS "Daily logs delete policy" ON public.daily_logs;

-- SELECT: Client reads own logs; Trainer reads logs for clients linked to them
CREATE POLICY "Users and trainers can read daily logs"
ON public.daily_logs
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = daily_logs.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
);

-- INSERT: Only the authenticated user can insert their own daily logs
CREATE POLICY "Users can insert own daily logs"
ON public.daily_logs
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
);

-- UPDATE: Users can update own logs; Trainers can update assigned client logs
CREATE POLICY "Users and trainers can update daily logs"
ON public.daily_logs
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = daily_logs.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
)
WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = daily_logs.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
);

-- DELETE: Only the log owner can delete their daily logs
CREATE POLICY "Users can delete own daily logs"
ON public.daily_logs
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id
);


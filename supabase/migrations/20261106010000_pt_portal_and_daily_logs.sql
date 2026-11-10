-- ==============================================================================
-- METADIRECTIVE 1/3: DATABASE ARCHITECTURE (PT PORTAL & FOOD LOGS)
-- Migration: 20261106010000_pt_portal_and_daily_logs.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADD TRAINER_ID TO PROFILES
-- Links clients to personal trainers (self-referencing public.profiles)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Index to optimize trainer client lookups and RLS evaluation
CREATE INDEX IF NOT EXISTS idx_profiles_trainer_id ON public.profiles(trainer_id);

-- ------------------------------------------------------------------------------
-- 2. CREATE DAILY_LOGS TABLE
-- Food tracking system powered by FatSecret / manual logs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    food_name TEXT NOT NULL,
    barcode TEXT,
    calories INTEGER NOT NULL,
    protein NUMERIC NOT NULL,
    carbs NUMERIC NOT NULL,
    fats NUMERIC NOT NULL,
    serving_size NUMERIC NOT NULL,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes for date/user lookups
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON public.daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_logged_at ON public.daily_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, logged_at);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts on rerun
DROP POLICY IF EXISTS "Users can read own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can insert own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can update own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Users can delete own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Trainers can read client daily logs" ON public.daily_logs;

-- Policy 1: Users can read their own daily logs
CREATE POLICY "Users can read own daily logs"
ON public.daily_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own daily logs
CREATE POLICY "Users can insert own daily logs"
ON public.daily_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own daily logs
CREATE POLICY "Users can update own daily logs"
ON public.daily_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own daily logs
CREATE POLICY "Users can delete own daily logs"
ON public.daily_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 5: Trainers can read their linked clients' daily logs
CREATE POLICY "Trainers can read client daily logs"
ON public.daily_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = daily_logs.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
);

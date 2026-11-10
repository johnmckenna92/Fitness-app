-- ==============================================================================
-- SHOPPING LIST PERSISTENCE & TRAINER ANALYTICS
-- Migration: 20261107010000_shopping_lists_persistence_and_analytics.sql
-- ==============================================================================

-- 1. CREATE SHOPPING LISTS TABLE
CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    raw_ingredients TEXT[] DEFAULT '{}',
    sections JSONB DEFAULT '[]'::jsonb,
    total_items INT DEFAULT 0,
    checked_items INT DEFAULT 0,
    adherence_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT shopping_lists_user_id_key UNIQUE (user_id)
);

-- 2. INDEXES FOR FAST CLIENT & TRAINER ANALYTICS LOOKUPS
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON public.shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_updated_at ON public.shopping_lists(updated_at DESC);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Users can read own shopping list" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users and trainers can read shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can insert own shopping list" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can update own shopping list" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users and trainers can update shopping lists" ON public.shopping_lists;
DROP POLICY IF EXISTS "Users can delete own shopping list" ON public.shopping_lists;

-- SELECT: Client can read own list; Trainer can read list of assigned clients
CREATE POLICY "Users and trainers can read shopping lists"
ON public.shopping_lists
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = shopping_lists.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
);

-- INSERT: User inserts own shopping list
CREATE POLICY "Users can insert own shopping list"
ON public.shopping_lists
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
);

-- UPDATE: User updates own list; Trainer can update assigned client list
CREATE POLICY "Users and trainers can update shopping lists"
ON public.shopping_lists
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = shopping_lists.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
)
WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = shopping_lists.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
);

-- DELETE: User deletes own shopping list
CREATE POLICY "Users can delete own shopping list"
ON public.shopping_lists
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id
);

-- ==============================================================================
-- PHASE 3: B2B2C MULTI-TENANT TIERING, ACCOUNT LOCKING, SECURE STORAGE,
-- RECIPE CACHING, AND HISTORICAL DATA PERSISTENCE
-- Migration: 20261107020000_phase_3_b2b_locking_and_caching.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFILES EXTENSIONS: ACCOUNT STATUS & TRAINER BIO
-- ------------------------------------------------------------------------------

-- Add account_status column for account revocation/locking
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'account_status'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active'
        CHECK (account_status IN ('active', 'locked_trainer_revoked'));
    END IF;
END $$;

-- Add trainer_bio column for trainer branding profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trainer_bio TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- ------------------------------------------------------------------------------
-- 2. RECIPES TABLE EXTENSION: FATSECRET CACHING
-- ------------------------------------------------------------------------------

ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS fatsecret_recipe_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_recipes_fatsecret_id ON public.recipes(fatsecret_recipe_id);

-- ------------------------------------------------------------------------------
-- 3. HISTORICAL SHOPPING LISTS TABLE & RLS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.shopping_list_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    raw_ingredients TEXT[] DEFAULT '{}',
    sections JSONB DEFAULT '[]'::jsonb,
    total_items INT DEFAULT 0,
    checked_items INT DEFAULT 0,
    adherence_rate NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shopping_list_history_user_id ON public.shopping_list_history(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_history_created_at ON public.shopping_list_history(created_at DESC);

ALTER TABLE public.shopping_list_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and trainers can read shopping list history" ON public.shopping_list_history;
DROP POLICY IF EXISTS "Users can insert own shopping list history" ON public.shopping_list_history;
DROP POLICY IF EXISTS "Users can delete own shopping list history" ON public.shopping_list_history;

CREATE POLICY "Users and trainers can read shopping list history"
ON public.shopping_list_history
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = shopping_list_history.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own shopping list history"
ON public.shopping_list_history
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id
);

CREATE POLICY "Users can delete own shopping list history"
ON public.shopping_list_history
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id
);

-- ------------------------------------------------------------------------------
-- 4. CHAT SESSIONS & MESSAGES PERSISTENCE & RLS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Coaching Chat',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON public.chat_sessions(updated_at DESC);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users and trainers can read chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON public.chat_sessions;

CREATE POLICY "Users and trainers can read chat sessions"
ON public.chat_sessions
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = chat_sessions.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own chat sessions"
ON public.chat_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
ON public.chat_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
ON public.chat_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at ASC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and trainers can read chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_messages;

CREATE POLICY "Users and trainers can read chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE public.profiles.id = chat_messages.user_id
          AND public.profiles.trainer_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own chat messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. SECURE STORAGE BUCKETS (GDPR COMPLIANCE)
-- Hardening avatars bucket: private access with signed URL or RLS requirement
-- ------------------------------------------------------------------------------

-- Ensure avatars bucket is private
UPDATE storage.buckets
SET public = false
WHERE id = 'avatars';

-- Clean up any prior avatar storage policies
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Read Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Insert Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Update Policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Delete Policy" ON storage.objects;
DROP POLICY IF EXISTS "Secure Avatar Select" ON storage.objects;
DROP POLICY IF EXISTS "Secure Avatar Insert" ON storage.objects;
DROP POLICY IF EXISTS "Secure Avatar Update" ON storage.objects;
DROP POLICY IF EXISTS "Secure Avatar Delete" ON storage.objects;

-- RLS: Authenticated user can read own avatar, trainer can read client's avatar, client can read trainer's avatar
CREATE POLICY "Secure Avatar Select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE (public.profiles.id::text = (storage.foldername(name))[1] AND public.profiles.trainer_id = auth.uid())
               OR (public.profiles.trainer_id::text = (storage.foldername(name))[1] AND public.profiles.id = auth.uid())
        )
    )
);

-- RLS: User can only upload into their own folder (e.g. {userId}/avatar_*.jpg)
CREATE POLICY "Secure Avatar Insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: User can update own avatar
CREATE POLICY "Secure Avatar Update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: User can delete own avatar
CREATE POLICY "Secure Avatar Delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);


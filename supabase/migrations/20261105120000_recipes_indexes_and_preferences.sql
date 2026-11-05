-- ==============================================================================
-- RECIPES PERFORMANCE INDEXING & USER PREFERENCES ENGINE
-- Migration: 20261105120000_recipes_indexes_and_preferences.sql
-- ==============================================================================

-- 1. Performance Indexes for 91,762-row recipes table
-- Eliminates sequential table scan timeouts (57014) on sorting & filtering
CREATE INDEX IF NOT EXISTS idx_recipes_calories ON public.recipes (calories DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_n_ingredients ON public.recipes (n_ingredients ASC);
CREATE INDEX IF NOT EXISTS idx_recipes_cook_time ON public.recipes (cook_time ASC);
CREATE INDEX IF NOT EXISTS idx_recipes_protein ON public.recipes (protein DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_tags_gin ON public.recipes USING gin (tags);

-- 2. User Preferences Engine Table
-- Stores "Look-Alikes" dictionary, liked/disliked vectors for Tinder-style Swiper
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_recipe_ids BIGINT[] DEFAULT '{}',
  disliked_recipe_ids BIGINT[] DEFAULT '{}',
  liked_tags TEXT[] DEFAULT '{}',
  disliked_tags TEXT[] DEFAULT '{}',
  liked_ingredients TEXT[] DEFAULT '{}',
  disliked_ingredients TEXT[] DEFAULT '{}',
  look_alike_dictionary JSONB DEFAULT '{"preferredCuisines": [], "preferredTags": [], "preferredIngredients": [], "avgCalories": 0, "avgProtein": 0}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop and recreate RLS policies for user_preferences
DROP POLICY IF EXISTS "Users can read own preferences" ON public.user_preferences;
CREATE POLICY "Users can read own preferences"
ON public.user_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
ON public.user_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
ON public.user_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

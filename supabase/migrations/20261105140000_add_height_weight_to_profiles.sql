-- Migration: 20261105140000_add_height_weight_to_profiles.sql
-- Add standardized metric columns (height in cm, weight in kg) to public.profiles

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS height NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT NULL;

-- Allow goals to be null on initial creation
ALTER TABLE public.profiles 
  ALTER COLUMN goals DROP NOT NULL;

-- Update trigger function to allow null goals for new registrations
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
    weight
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
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Function: handle_new_user()
-- Trigger: on_auth_user_created
-- Description: Automatically creates a public.profiles row when a new user signs up.
-- Maps user metadata:
--   - raw_user_meta_data->>'full_name' -> full_name
--   - raw_user_meta_data->'goals' -> goals (text[])
-- ==============================================================================

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


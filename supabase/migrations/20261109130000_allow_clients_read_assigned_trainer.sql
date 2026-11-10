-- ------------------------------------------------------------------------------
-- ALLOW CLIENTS TO READ ASSIGNED TRAINER PROFILE
-- ------------------------------------------------------------------------------

-- Safely get the current authenticated user's trainer_id using a SECURITY DEFINER
-- function to prevent RLS recursion on public.profiles.
CREATE OR REPLACE FUNCTION public.get_my_trainer_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT trainer_id FROM public.profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "Clients can read assigned trainer profile" ON public.profiles;

CREATE POLICY "Clients can read assigned trainer profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    id = public.get_my_trainer_id()
);

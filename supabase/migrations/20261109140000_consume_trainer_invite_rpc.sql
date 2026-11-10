-- Migration: Atomic Trainer Invite Consumption RPC
-- Enforces atomic lookup, validation, profile linkage, and single-use consumption.
-- Runs with SECURITY DEFINER to bypass client-level RLS restrictions safely.

CREATE OR REPLACE FUNCTION public.consume_trainer_invite(
  p_invite_code TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
BEGIN
  -- 1. Lookup and lock active, non-expired invite
  SELECT * INTO v_invite
  FROM public.trainer_invites
  WHERE invite_code = TRIM(p_invite_code)
    AND status = 'active'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invite code.';
  END IF;

  -- 2. Update user profile with trainer_id UUID
  UPDATE public.profiles
  SET trainer_id = v_invite.trainer_id
  WHERE id = p_user_id;

  -- 3. Mark invite code as used
  UPDATE public.trainer_invites
  SET
    status = 'used',
    used_by_id = p_user_id,
    used_at = now()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'success', true,
    'trainer_id', v_invite.trainer_id
  );
END;
$$;

-- Grant execute permissions to anon and authenticated users for signup flows
GRANT EXECUTE ON FUNCTION public.consume_trainer_invite(TEXT, UUID) TO anon, authenticated, service_role;

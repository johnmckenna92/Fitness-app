-- ==============================================================================
-- RATE LIMITING ARCHITECTURE (UNLOGGED TABLE & ATOMIC RPC)
-- Migration: 20261108020000_api_rate_limiting.sql
-- ==============================================================================

-- 1. Create UNLOGGED table to bypass WAL for high-throughput rate limit tracking
CREATE UNLOGGED TABLE IF NOT EXISTS public.api_rate_limits (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, endpoint)
);

-- Enable RLS on api_rate_limits
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- 2. Create atomic rate limiter function (RPC)
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
    p_user_id UUID,
    p_endpoint TEXT,
    p_limit INTEGER,
    p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_now TIMESTAMPTZ := clock_timestamp();
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Ensure initial record exists
    INSERT INTO public.api_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 0, v_now)
    ON CONFLICT (user_id, endpoint) DO NOTHING;

    -- Lock row for atomic read & update
    SELECT request_count, window_start
    INTO v_count, v_window_start
    FROM public.api_rate_limits
    WHERE user_id = p_user_id AND endpoint = p_endpoint
    FOR UPDATE;

    -- Check if the time window has expired
    IF v_now >= v_window_start + (p_window_seconds || ' seconds')::INTERVAL THEN
        -- Window expired: Reset counter to 1 and update window_start to current timestamp
        UPDATE public.api_rate_limits
        SET request_count = 1,
            window_start = v_now
        WHERE user_id = p_user_id AND endpoint = p_endpoint;

        RETURN 1 <= p_limit;
    ELSIF v_count < p_limit THEN
        -- Window active and within threshold: Increment counter and allow request
        UPDATE public.api_rate_limits
        SET request_count = request_count + 1
        WHERE user_id = p_user_id AND endpoint = p_endpoint;

        RETURN TRUE;
    ELSE
        -- Limit exceeded: Block request
        RETURN FALSE;
    END IF;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(UUID, TEXT, INTEGER, INTEGER) TO anon, authenticated, service_role;

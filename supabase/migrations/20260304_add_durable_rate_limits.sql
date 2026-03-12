-- Migration: Add durable rate limits
-- Description: Moves rate-limit state into Postgres so throttling survives restarts and multi-instance deployments.

BEGIN;

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
    action TEXT NOT NULL,
    identifier TEXT NOT NULL,
    hit_count INTEGER NOT NULL DEFAULT 0 CHECK (hit_count >= 0),
    reset_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    PRIMARY KEY (action, identifier)
);

CREATE INDEX IF NOT EXISTS rate_limit_buckets_reset_at_idx
    ON public.rate_limit_buckets (reset_at);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.rate_limit_buckets FROM PUBLIC;
REVOKE ALL ON public.rate_limit_buckets FROM anon;
REVOKE ALL ON public.rate_limit_buckets FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_limit_buckets TO service_role;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
    p_action TEXT,
    p_identifier TEXT,
    p_limit INTEGER,
    p_window_seconds INTEGER
)
RETURNS TABLE (
    allowed BOOLEAN,
    remaining INTEGER,
    reset_at TIMESTAMPTZ,
    limit_count INTEGER,
    current_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_now TIMESTAMPTZ := timezone('utc', now());
    v_window_seconds INTEGER := GREATEST(COALESCE(p_window_seconds, 1), 1);
    v_limit INTEGER := GREATEST(COALESCE(p_limit, 1), 1);
BEGIN
    IF COALESCE(trim(p_action), '') = '' THEN
        RAISE EXCEPTION 'p_action is required';
    END IF;

    IF COALESCE(trim(p_identifier), '') = '' THEN
        RAISE EXCEPTION 'p_identifier is required';
    END IF;

    RETURN QUERY
    WITH upserted AS (
        INSERT INTO public.rate_limit_buckets AS buckets (
            action,
            identifier,
            hit_count,
            reset_at,
            created_at,
            updated_at
        )
        VALUES (
            trim(p_action),
            lower(trim(p_identifier)),
            1,
            v_now + make_interval(secs => v_window_seconds),
            v_now,
            v_now
        )
        ON CONFLICT (action, identifier) DO UPDATE
        SET hit_count = CASE
                WHEN buckets.reset_at <= v_now THEN 1
                ELSE buckets.hit_count + 1
            END,
            reset_at = CASE
                WHEN buckets.reset_at <= v_now THEN v_now + make_interval(secs => v_window_seconds)
                ELSE buckets.reset_at
            END,
            updated_at = v_now
        RETURNING hit_count, reset_at
    )
    SELECT
        upserted.hit_count <= v_limit AS allowed,
        GREATEST(0, v_limit - upserted.hit_count) AS remaining,
        upserted.reset_at,
        v_limit AS limit_count,
        upserted.hit_count AS current_count
    FROM upserted;
END;
$$;

COMMENT ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER)
    IS 'Atomically consumes a rate-limit bucket in Postgres and returns whether the request is allowed.';

GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limit_buckets()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted_count INTEGER := 0;
BEGIN
    WITH deleted_rows AS (
        DELETE FROM public.rate_limit_buckets
        WHERE reset_at <= timezone('utc', now())
        RETURNING 1
    )
    SELECT COUNT(*)::INTEGER
    INTO v_deleted_count
    FROM deleted_rows;

    RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_rate_limit_buckets()
    IS 'Deletes expired durable rate-limit buckets and returns the number removed.';

GRANT EXECUTE ON FUNCTION public.cleanup_expired_rate_limit_buckets() TO service_role;

COMMIT;

-- Migration: Ensure Guest Submission Schema
-- Description:
-- 1. Allow user_id to be NULL in ideas table (for guest submissions).
-- 2. Add submitter_email column to ideas table (for guest contact).
-- 3. Add submitter_name and submitter_role if missing.

-- 1. Allow user_id to be nullable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ideas'
        AND column_name = 'user_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE ideas ALTER COLUMN user_id DROP NOT NULL;
    END IF;
END $$;

-- 2. Add submitter_email column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ideas'
        AND column_name = 'submitter_email'
    ) THEN
        ALTER TABLE ideas ADD COLUMN submitter_email text;
    END IF;
END $$;

-- 3. Add submitter_name column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ideas'
        AND column_name = 'submitter_name'
    ) THEN
        ALTER TABLE ideas ADD COLUMN submitter_name text;
    END IF;
END $$;

-- 4. Add submitter_role column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'ideas'
        AND column_name = 'submitter_role'
    ) THEN
        ALTER TABLE ideas ADD COLUMN submitter_role text;
    END IF;
END $$;

-- Script to check and fix user setup for Teklogic757@gmail.com
-- Run this in Supabase SQL Editor

-- Step 1: Check if the organization exists
SELECT id, name, slug FROM organizations WHERE slug = 'teklogic';

-- Step 2: Check Auth users
SELECT id, email FROM auth.users WHERE email = 'teklogic757@gmail.com';

-- Step 3: Check if user exists in public.users table
SELECT id, organization_id, email, role FROM users WHERE email = 'teklogic757@gmail.com';

-- Step 4: If the user doesn't exist in public.users, insert them
-- IMPORTANT: Replace 'USER_ID_FROM_AUTH' with the actual UUID from Step 2
-- IMPORTANT: Replace 'ORG_ID_FROM_STEP_1' with the actual UUID from Step 1

/*
INSERT INTO users (id, organization_id, email, full_name, job_role, role)
VALUES (
    'USER_ID_FROM_AUTH',  -- Copy from Step 2
    'ORG_ID_FROM_STEP_1', -- Copy from Step 1
    'teklogic757@gmail.com',
    'Justin Tek',
    'CEO',
    'super_admin'
)
ON CONFLICT (id) DO UPDATE
SET
    organization_id = EXCLUDED.organization_id,
    email = EXCLUDED.email,
    role = EXCLUDED.role;
*/

-- Step 5: Verify the user is now set up correctly
SELECT
    u.id,
    u.email,
    u.organization_id,
    u.role,
    o.slug as org_slug
FROM users u
JOIN organizations o ON o.id = u.organization_id
WHERE u.email = 'teklogic757@gmail.com';

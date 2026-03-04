-- Complete setup script for Teklogic user and organization
-- Run this entire script in Supabase SQL Editor

-- =============================================================================
-- STEP 1: Create or verify the Teklogic organization exists
-- =============================================================================

INSERT INTO organizations (
    name,
    slug,
    domain,
    industry,
    brand_voice,
    marketing_strategy,
    annual_it_budget,
    estimated_revenue,
    employee_count
) VALUES (
    'Teklogic',
    'teklogic',
    'teklogic.net',
    'Technology Consulting',
    'Professional, innovative, client-focused',
    'Thought leadership through AI workshops and education',
    '500000',
    '5000000',
    '50'
)
ON CONFLICT (slug) DO UPDATE
SET
    name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    brand_voice = EXCLUDED.brand_voice,
    marketing_strategy = EXCLUDED.marketing_strategy,
    annual_it_budget = EXCLUDED.annual_it_budget,
    estimated_revenue = EXCLUDED.estimated_revenue,
    employee_count = EXCLUDED.employee_count;

-- =============================================================================
-- STEP 2: Get the organization ID (you'll need this for next step)
-- =============================================================================

SELECT id, name, slug FROM organizations WHERE slug = 'teklogic';
-- Copy the 'id' value from the result (UUID format)

-- =============================================================================
-- STEP 3: Check if your auth user exists
-- =============================================================================

SELECT id, email FROM auth.users WHERE email = 'teklogic757@gmail.com';
-- Copy the 'id' value from the result

-- =============================================================================
-- STEP 4: Link your user to the organization
-- IMPORTANT: Replace the placeholder IDs below with actual values from Steps 2 & 3
-- =============================================================================

-- First, declare variables with your actual IDs
DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
BEGIN
    -- Get the organization ID
    SELECT id INTO v_org_id FROM organizations WHERE slug = 'teklogic';

    -- Get the auth user ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'teklogic757@gmail.com';

    -- Insert or update the user record
    IF v_user_id IS NOT NULL AND v_org_id IS NOT NULL THEN
        INSERT INTO users (id, organization_id, email, full_name, job_role, role)
        VALUES (
            v_user_id,
            v_org_id,
            'teklogic757@gmail.com',
            'Justin',
            'CEO',
            'super_admin'
        )
        ON CONFLICT (id) DO UPDATE
        SET
            organization_id = EXCLUDED.organization_id,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            job_role = EXCLUDED.job_role;

        RAISE NOTICE 'User setup complete!';
    ELSE
        RAISE EXCEPTION 'Could not find user or organization. Check that teklogic757@gmail.com exists in auth.users';
    END IF;
END $$;

-- =============================================================================
-- STEP 5: Verify everything is set up correctly
-- =============================================================================

SELECT
    u.id as user_id,
    u.email,
    u.full_name,
    u.job_role,
    u.role,
    o.id as org_id,
    o.name as org_name,
    o.slug as org_slug
FROM users u
JOIN organizations o ON o.id = u.organization_id
WHERE u.email = 'teklogic757@gmail.com';

-- You should see:
-- - email: teklogic757@gmail.com
-- - role: super_admin
-- - org_slug: teklogic
-- If you see this, you're all set! Try logging in again.

-- =============================================================================
-- TROUBLESHOOTING: If the user doesn't exist in auth.users
-- =============================================================================

-- If Step 3 returned no results, you need to create the auth user first
-- Go to Supabase Dashboard → Authentication → Users → "Add user"
-- Or run this to check all users:
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

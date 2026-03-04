-- Auto-fix script for teklogic757@gmail.com
-- Links user to 'teklogic' organization and sets super_admin role

DO $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
BEGIN
    -- 1. Get Organization ID
    SELECT id INTO v_org_id FROM organizations WHERE slug = 'teklogic';
    
    -- 2. Get Auth User ID link
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'teklogic757@gmail.com';

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Organization "teklogic" not found';
    END IF;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User "teklogic757@gmail.com" not found in auth.users';
    END IF;

    -- 3. Upsert into public.users
    INSERT INTO public.users (id, organization_id, email, full_name, role, job_role)
    VALUES (
        v_user_id,
        v_org_id,
        'teklogic757@gmail.com',
        'Justin',
        'super_admin',
        'Admin'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        organization_id = EXCLUDED.organization_id,
        role = 'super_admin';

    RAISE NOTICE 'Fixed user teklogic757@gmail.com linked to org %', v_org_id;
END $$;

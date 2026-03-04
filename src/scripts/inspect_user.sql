
-- Check user existence and org link
SELECT 
    u.id, 
    u.email, 
    u.role, 
    u.organization_id, 
    o.slug as org_slug
FROM users u
LEFT JOIN organizations o ON o.id = u.organization_id
WHERE u.email = 'teklogic757@gmail.com';

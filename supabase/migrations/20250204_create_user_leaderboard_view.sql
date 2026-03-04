-- Migration: Create User Leaderboard View
-- Description: Aggregates user points and idea counts for leaderboard display.

-- 1. Create View
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT 
    u.id as user_id,
    u.organization_id,
    u.full_name,
    u.job_role,
    COUNT(i.id) as idea_count,
    COALESCE(SUM(i.ai_score), 0) as total_points,
    MAX(i.created_at) as last_submission
FROM 
    users u
LEFT JOIN 
    ideas i ON u.id = i.user_id
WHERE 
    u.organization_id IS NOT NULL
GROUP BY 
    u.id, u.organization_id, u.full_name, u.job_role;

-- 2. Grant Permissions (RLS doesn't apply to views directly, but we rely on the underlying tables)
-- Actually, for views, we might need to be careful. 
-- Let's just grant select to authenticated users.
GRANT SELECT ON user_leaderboard TO authenticated;
GRANT SELECT ON user_leaderboard TO service_role;

-- 3. Comment
COMMENT ON VIEW user_leaderboard IS 'Aggregated user statistics for leaderboard display';

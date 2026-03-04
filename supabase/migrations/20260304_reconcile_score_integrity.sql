-- Migration: Reconcile score integrity for canonical rubric scoring
-- Description: Backfills recoverable idea scores from stored rubric criteria and realigns user totals/views to canonical ai_score.

BEGIN;

-- Recompute ai_score for rows where the weighted rubric inputs were stored.
-- Rows without full criteria data are intentionally left untouched because the
-- canonical score cannot be reconstructed safely from incomplete analysis JSON.
WITH canonical_scores AS (
    SELECT
        i.id,
        ROUND(
            LEAST(
                100,
                GREATEST(
                    0,
                    (
                        (jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Originality', 'score'))::numeric * 0.30 +
                        (jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Impact Potential', 'score'))::numeric * 0.25 +
                        (jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Company Specificity', 'score'))::numeric * 0.20 +
                        (jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Feasibility', 'score'))::numeric * 0.15 +
                        (jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Clarity', 'score'))::numeric * 0.10
                    )
                )
            )
        )::integer AS canonical_score
    FROM public.ideas i
    WHERE jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Originality', 'score') IS NOT NULL
      AND jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Impact Potential', 'score') IS NOT NULL
      AND jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Company Specificity', 'score') IS NOT NULL
      AND jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Feasibility', 'score') IS NOT NULL
      AND jsonb_extract_path_text(i.ai_analysis_json, 'criteria_scores', 'Clarity', 'score') IS NOT NULL
)
UPDATE public.ideas i
SET ai_score = canonical_scores.canonical_score
FROM canonical_scores
WHERE i.id = canonical_scores.id
  AND i.ai_score IS DISTINCT FROM canonical_scores.canonical_score;

-- Realign cached user totals to the persisted canonical ai_score field.
WITH user_totals AS (
    SELECT
        u.id AS user_id,
        COALESCE(SUM(COALESCE(i.ai_score, 0)), 0)::integer AS canonical_total_points
    FROM public.users u
    LEFT JOIN public.ideas i ON i.user_id = u.id
    GROUP BY u.id
)
UPDATE public.users u
SET total_points = user_totals.canonical_total_points
FROM user_totals
WHERE u.id = user_totals.user_id
  AND COALESCE(u.total_points, 0) IS DISTINCT FROM user_totals.canonical_total_points;

-- Ensure the shared leaderboard view reads from the canonical persisted score.
-- `CREATE OR REPLACE VIEW` cannot change an existing column type, so drop the
-- old view first before recreating it with the corrected integer total.
DROP VIEW IF EXISTS public.user_leaderboard;

CREATE VIEW public.user_leaderboard AS
SELECT
    u.id AS user_id,
    u.organization_id,
    u.full_name,
    u.job_role,
    COUNT(i.id) AS idea_count,
    COALESCE(SUM(COALESCE(i.ai_score, 0)), 0)::integer AS total_points,
    MAX(i.created_at) AS last_submission
FROM public.users u
LEFT JOIN public.ideas i ON i.user_id = u.id
WHERE u.organization_id IS NOT NULL
  AND u.is_active = true
GROUP BY u.id, u.organization_id, u.full_name, u.job_role;

GRANT SELECT ON public.user_leaderboard TO authenticated;
GRANT SELECT ON public.user_leaderboard TO service_role;

COMMENT ON VIEW public.user_leaderboard IS 'Aggregated user statistics for leaderboard display using canonical ideas.ai_score values.';

COMMIT;

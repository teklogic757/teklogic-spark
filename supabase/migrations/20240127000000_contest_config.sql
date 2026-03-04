-- Add contest configuration fields to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS contest_starts_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS contest_config JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.organizations.contest_starts_at IS 'Start date/time for the organization contest';
COMMENT ON COLUMN public.organizations.contest_config IS 'JSON configuration for contest including title, description, prizes, and rules';

-- Update Acme Corporation with mock contest data (14 days from now)
UPDATE public.organizations
SET
    contest_starts_at = NOW(),
    contest_ends_at = NOW() + INTERVAL '14 days',
    contest_config = '{
        "title": "Spark AI Innovation Challenge",
        "description": "Submit your best automation ideas and compete for prizes! The top contributors will be rewarded based on the quality and impact of their ideas as scored by our AI system.",
        "prizes": [
            {"place": 1, "description": "$100 Amazon Gift Card", "value": "$100"},
            {"place": 2, "description": "$50 Amazon Gift Card", "value": "$50"}
        ],
        "rules": [
            "All ideas must be original and not previously submitted",
            "Ideas are scored by AI based on impact, feasibility, and innovation",
            "Points are earned for each submission based on AI score",
            "Bonus points may be awarded by administrators for exceptional ideas",
            "Winners will be announced within 48 hours of contest end",
            "Employees must be active members of the organization to participate",
            "Gift cards will be delivered electronically to the winners email address"
        ],
        "is_active": true
    }'::jsonb,
    is_leaderboard_enabled = true
WHERE slug = 'acme-corporation';

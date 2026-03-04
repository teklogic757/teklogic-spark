-- Migration: Add contextual fields to ideas table
-- Date: 2026-01-28
-- Purpose: Add department, problem, and solution fields for richer idea context

-- Add new columns to ideas table
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS problem_statement TEXT,
ADD COLUMN IF NOT EXISTS proposed_solution TEXT;

-- Add comments for documentation
COMMENT ON COLUMN ideas.department IS 'The department or team this idea is for (e.g., Sales, Marketing, Operations)';
COMMENT ON COLUMN ideas.problem_statement IS 'Description of the problem this idea solves';
COMMENT ON COLUMN ideas.proposed_solution IS 'Brief description of what might be possible or how it could work';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ideas'
AND column_name IN ('department', 'problem_statement', 'proposed_solution')
ORDER BY column_name;

-- Allow ideas to be submitted without a registered user_id (for Workshop Guests)
ALTER TABLE ideas ALTER COLUMN user_id DROP NOT NULL;

-- Optional: Create a specific 'guest' user to track them instead?
-- For now, NULL user_id with a 'submitter_name' field (which we might need to add) is cleaner for "anonymous" ideas.

-- Add columns to capture guest details if they don't have a user profile
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS submitter_name TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS submitter_email TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS submitter_role TEXT;

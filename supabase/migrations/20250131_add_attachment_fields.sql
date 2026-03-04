-- Migration: Add attachment fields to ideas table
-- Issue: Files are uploaded to storage but path is not saved
-- Fix: Add columns to store attachment path and description

-- Add attachment_path column to store the file path in Supabase Storage
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS attachment_path TEXT DEFAULT NULL;

-- Add attachment_description column for user to describe what they attached
ALTER TABLE public.ideas
ADD COLUMN IF NOT EXISTS attachment_description TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.ideas.attachment_path IS 'Path to file in Supabase Storage (idea-attachments bucket)';
COMMENT ON COLUMN public.ideas.attachment_description IS 'User-provided description of the attached file(s)';

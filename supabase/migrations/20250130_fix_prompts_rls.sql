-- Migration: Fix Prompts Table RLS
-- Issue: Prompts table has NO RLS policies, allowing any authenticated user to read/write all prompts
-- Fix: Enable RLS and create org-scoped policies

-- Enable Row Level Security on prompts table
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view prompts from their organization
CREATE POLICY "Users can view prompts from their org"
  ON prompts
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- Policy: Users can create prompts in their organization
CREATE POLICY "Users can create prompts in their org"
  ON prompts
  FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- Policy: Super admins can manage all prompts
CREATE POLICY "Super admins can manage all prompts"
  ON prompts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Note: Run this migration against your Supabase database
-- Command: supabase db push (if using Supabase CLI)
-- Or execute directly in Supabase SQL Editor

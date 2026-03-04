-- Migration: Add Ideas Update/Delete Policies for Admin Management
-- Issue: Ideas table missing DELETE/UPDATE policies for admin management
-- Fix: Add policies allowing admins to manage ideas in their organization

-- Policy: Super admins can update any idea
CREATE POLICY "Super admins can update ideas"
  ON ideas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Policy: Super admins can delete ideas (for removing spam/inappropriate content)
CREATE POLICY "Super admins can delete ideas"
  ON ideas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Policy: Users can update their own ideas (optional - for editing)
CREATE POLICY "Users can update own ideas"
  ON ideas
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Note: Run this migration against your Supabase database
-- Command: supabase db push (if using Supabase CLI)
-- Or execute directly in Supabase SQL Editor

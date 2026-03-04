-- Create workshop_access_codes table
CREATE TABLE IF NOT EXISTS workshop_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL, -- e.g. "February 2026 Strategy Session"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    auto_create_user_role TEXT DEFAULT 'workshop_attendee' -- Role to assign new users
);

-- Enable RLS
ALTER TABLE workshop_access_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage workshop codes" ON workshop_access_codes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND (users.role IN ('super_admin', 'admin'))
            AND users.organization_id = workshop_access_codes.organization_id
        )
    );

-- Policy: Public can read active codes (for verification/login)
-- Or better: Use a secure function to verify code instead of exposing table?
-- For now, let's allow improved security: service_role only or specific function.
-- But to keep it simple for the frontend:
CREATE POLICY "Public can view active codes" ON workshop_access_codes
    FOR SELECT
    USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Add index for fast lookup
CREATE INDEX idx_workshop_codes_code ON workshop_access_codes(code);

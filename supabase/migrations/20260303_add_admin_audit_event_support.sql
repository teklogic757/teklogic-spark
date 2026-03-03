-- Phase 4 foundation: durable audit events for privileged admin mutations

CREATE TABLE IF NOT EXISTS public.admin_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  actor_email TEXT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NULL,
  target_label TEXT NULL,
  metadata JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.admin_audit_events IS
  'Durable audit trail for privileged admin-side mutations';

COMMENT ON COLUMN public.admin_audit_events.action IS
  'Normalized action identifier such as organization.updated or user.created';

COMMENT ON COLUMN public.admin_audit_events.target_type IS
  'Entity category affected by the admin mutation';

CREATE INDEX IF NOT EXISTS admin_audit_events_created_at_idx
  ON public.admin_audit_events (created_at DESC);

CREATE INDEX IF NOT EXISTS admin_audit_events_actor_user_id_idx
  ON public.admin_audit_events (actor_user_id);

CREATE INDEX IF NOT EXISTS admin_audit_events_target_lookup_idx
  ON public.admin_audit_events (target_type, target_id);

ALTER TABLE public.admin_audit_events ENABLE ROW LEVEL SECURITY;

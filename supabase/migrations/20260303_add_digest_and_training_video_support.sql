-- Phase 3 foundation: weekly digest cadence + admin-managed training video content

ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS last_contest_digest_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.organizations.last_contest_digest_sent_at IS
  'Last time the weekly contest digest was successfully delivered for this organization';

CREATE TABLE IF NOT EXISTS public.training_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_video_id TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  created_by UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.training_videos IS
  'Admin-managed AI learning videos shown in the shared dashboard training library';

CREATE UNIQUE INDEX IF NOT EXISTS training_videos_youtube_video_id_key
  ON public.training_videos (youtube_video_id);

CREATE INDEX IF NOT EXISTS training_videos_created_at_idx
  ON public.training_videos (created_at DESC);

ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;

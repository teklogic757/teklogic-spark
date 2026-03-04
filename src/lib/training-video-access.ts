import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'
import {
  isVisibleToOrganization,
  parseScopedTrainingVideoRecord,
  toTrainingVideoListItem,
  type TrainingVideoListItem,
} from '@/lib/training-videos'

export async function getTrainingVideosForOrganization(
  organizationId: string
): Promise<TrainingVideoListItem[]> {
  const adminClient = await createAdminClient()
  const { data, error } = await adminClient
    .from('training_videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? [])
    .map((row) => parseScopedTrainingVideoRecord(row as Record<string, unknown>))
    .filter((video): video is NonNullable<ReturnType<typeof parseScopedTrainingVideoRecord>> => video !== null)
    .filter((video) => isVisibleToOrganization(video, organizationId))
    .map(toTrainingVideoListItem)
}

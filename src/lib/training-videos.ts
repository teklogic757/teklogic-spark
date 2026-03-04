import type { Database } from '@/lib/types/database.types'

export type TrainingVideoRecord = Database['public']['Tables']['training_videos']['Row']
export type ScopedTrainingVideoRecord = Pick<
  TrainingVideoRecord,
  'id' | 'title' | 'youtube_url' | 'thumbnail_url'
> & {
  organization_id: string | null
}

export interface ParsedYouTubeVideo {
  videoId: string
  canonicalUrl: string
  thumbnailUrl: string
  embedUrl: string
}

export interface TrainingVideoListItem {
  id: string
  title: string
  url: string
  thumbnail: string
}

export interface NormalizeTrainingVideoInput {
  title: string
  url: string
}

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
])

function isValidVideoId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(value)
}

export function buildYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
}

export function parseYouTube(input: string): ParsedYouTubeVideo | null {
  const trimmed = input.trim()
  if (!trimmed) {
    return null
  }

  let url: URL

  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  const host = url.hostname.toLowerCase()
  if (!YOUTUBE_HOSTS.has(host)) {
    return null
  }

  let videoId = ''

  if (host.includes('youtu.be')) {
    videoId = url.pathname.replace(/^\/+/, '').split('/')[0] ?? ''
  } else if (url.pathname === '/watch') {
    videoId = url.searchParams.get('v') ?? ''
  } else if (url.pathname.startsWith('/shorts/')) {
    videoId = url.pathname.split('/')[2] ?? ''
  } else if (url.pathname.startsWith('/embed/')) {
    videoId = url.pathname.split('/')[2] ?? ''
  }

  if (!isValidVideoId(videoId)) {
    return null
  }

  return {
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: buildYouTubeThumbnailUrl(videoId),
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  }
}

export function normalizeTrainingVideo(input: NormalizeTrainingVideoInput) {
  const parsed = parseYouTube(input.url)
  if (!parsed) {
    throw new Error('A valid YouTube URL is required')
  }

  return {
    title: input.title.trim(),
    youtube_url: parsed.canonicalUrl,
    youtube_video_id: parsed.videoId,
    thumbnail_url: parsed.thumbnailUrl,
  }
}

export function toTrainingVideoListItem(
  video: Pick<TrainingVideoRecord, 'id' | 'title' | 'youtube_url' | 'thumbnail_url'>
): TrainingVideoListItem {
  return {
    id: video.id,
    title: video.title,
    url: video.youtube_url,
    thumbnail: video.thumbnail_url,
  }
}

function parseScopedTrainingVideoRecord(
  row: Record<string, unknown>
): ScopedTrainingVideoRecord | null {
  if (
    typeof row.id !== 'string' ||
    typeof row.title !== 'string' ||
    typeof row.youtube_url !== 'string' ||
    typeof row.thumbnail_url !== 'string'
  ) {
    return null
  }

  return {
    id: row.id,
    title: row.title,
    youtube_url: row.youtube_url,
    thumbnail_url: row.thumbnail_url,
    organization_id: typeof row.organization_id === 'string' ? row.organization_id : null,
  }
}

function isVisibleToOrganization(
  video: ScopedTrainingVideoRecord,
  organizationId: string
): boolean {
  return video.organization_id === null || video.organization_id === organizationId
}

export { isVisibleToOrganization, parseScopedTrainingVideoRecord }

import 'server-only'

import { createAdminClient } from '@/lib/supabase/server'
import { sendContestDigestEmail, type ContestDigestEmailPayload } from '@/lib/email'
import type { ContestConfig, Database } from '@/lib/types/database.types'
import { getOrganizationLeaderboard } from '@/lib/leaderboard'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']

export interface ContestDigestRunResult {
  organizationId: string
  organizationSlug: string
  status: 'sent' | 'skipped' | 'failed'
  reason?: string
}

export interface ContestDigestRunSummary {
  processed: number
  sent: number
  skipped: number
  failed: number
  results: ContestDigestRunResult[]
}

function hasActiveContestWindow(organization: Pick<OrganizationRow, 'contest_starts_at' | 'contest_ends_at' | 'contest_config' | 'is_leaderboard_enabled'>, now: Date): boolean {
  if (!organization.is_leaderboard_enabled) {
    return false
  }

  const config = organization.contest_config as ContestConfig | null
  if (config && config.is_active === false) {
    return false
  }

  if (!organization.contest_starts_at || !organization.contest_ends_at) {
    return false
  }

  const startsAt = new Date(organization.contest_starts_at)
  const endsAt = new Date(organization.contest_ends_at)

  return startsAt <= now && endsAt >= now
}

function isDigestDue(lastSentAt: string | null, now: Date): boolean {
  if (!lastSentAt) {
    return true
  }

  const lastSentTime = new Date(lastSentAt).getTime()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

  return Number.isFinite(lastSentTime) && now.getTime() - lastSentTime >= sevenDaysMs
}

async function buildDigestPayload(
  organization: Pick<
    OrganizationRow,
    'id' | 'name' | 'slug' | 'contest_starts_at' | 'contest_ends_at'
  >
): Promise<ContestDigestEmailPayload | null> {
  const adminClient = await createAdminClient()

  const { data: recipientsData, error: recipientsError } = await adminClient
    .from('users')
    .select('email')
    .eq('organization_id', organization.id)
    .eq('role', 'super_admin')
    .eq('is_active', true)

  if (recipientsError) {
    throw recipientsError
  }

  const recipientRows = (recipientsData ?? []) as Array<{ email: string | null }>
  const recipients = recipientRows
    .map(user => user.email?.trim())
    .filter((email): email is string => Boolean(email))

  if (recipients.length === 0) {
    return null
  }

  const leaderboardEntries = await getOrganizationLeaderboard(adminClient, organization.id, 5)

  let ideasQuery = adminClient
    .from('ideas')
    .select('title, ai_score, created_at, users(full_name)')
    .eq('organization_id', organization.id)
    .order('ai_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  if (organization.contest_starts_at) {
    ideasQuery = ideasQuery.gte('created_at', organization.contest_starts_at)
  }

  if (organization.contest_ends_at) {
    ideasQuery = ideasQuery.lte('created_at', organization.contest_ends_at)
  }

  const { data: ideasData, error: ideasError } = await ideasQuery

  if (ideasError) {
    throw ideasError
  }

  const ideas = ((ideasData ?? []) as Array<{
    title: string
    ai_score: number | null
    created_at: string
    users: { full_name: string | null } | { full_name: string | null }[] | null
  }>).map(idea => {
    const author = Array.isArray(idea.users) ? idea.users[0] : idea.users

    return {
      title: idea.title,
      score: idea.ai_score,
      submittedAt: idea.created_at,
      submittedBy: author?.full_name ?? 'Anonymous',
    }
  })

  return {
    organizationName: organization.name,
    organizationSlug: organization.slug,
    recipients,
    contestEndsAt: organization.contest_ends_at,
    leaderboard: leaderboardEntries.map((user, index) => ({
      rank: index + 1,
      name: user.fullName || 'Unnamed User',
      role: user.jobRole,
      points: user.totalPoints,
    })),
    ideas,
  }
}

export async function sendWeeklyContestDigests(): Promise<ContestDigestRunSummary> {
  const adminClient = await createAdminClient()
  const now = new Date()

  const { data: organizations, error } = await adminClient
    .from('organizations')
    .select('id, name, slug, contest_starts_at, contest_ends_at, contest_config, is_leaderboard_enabled, last_contest_digest_sent_at')
    .eq('is_leaderboard_enabled', true)

  if (error) {
    throw error
  }

  const summary: ContestDigestRunSummary = {
    processed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    results: [],
  }

  for (const organization of (organizations ?? []) as OrganizationRow[]) {
    summary.processed += 1

    if (!hasActiveContestWindow(organization, now)) {
      summary.skipped += 1
      summary.results.push({
        organizationId: organization.id,
        organizationSlug: organization.slug,
        status: 'skipped',
        reason: 'No active contest window',
      })
      continue
    }

    if (!isDigestDue(organization.last_contest_digest_sent_at, now)) {
      summary.skipped += 1
      summary.results.push({
        organizationId: organization.id,
        organizationSlug: organization.slug,
        status: 'skipped',
        reason: 'Digest already sent within the last 7 days',
      })
      continue
    }

    try {
      const payload = await buildDigestPayload(organization)

      if (!payload) {
        summary.skipped += 1
        summary.results.push({
          organizationId: organization.id,
          organizationSlug: organization.slug,
          status: 'skipped',
          reason: 'No super admin recipients configured',
        })
        continue
      }

      const result = await sendContestDigestEmail(payload)

      if (result.status !== 'delivered') {
        summary.failed += 1
        summary.results.push({
          organizationId: organization.id,
          organizationSlug: organization.slug,
          status: 'failed',
          reason: result.error || result.warning || 'Digest email was not delivered',
        })
        continue
      }

      const { error: updateError } = await (adminClient
        .from('organizations') as any)
        .update({ last_contest_digest_sent_at: now.toISOString() })
        .eq('id', organization.id)

      if (updateError) {
        throw updateError
      }

      summary.sent += 1
      summary.results.push({
        organizationId: organization.id,
        organizationSlug: organization.slug,
        status: 'sent',
      })
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : 'Unknown error'

      summary.failed += 1
      summary.results.push({
        organizationId: organization.id,
        organizationSlug: organization.slug,
        status: 'failed',
        reason: message,
      })
    }
  }

  return summary
}

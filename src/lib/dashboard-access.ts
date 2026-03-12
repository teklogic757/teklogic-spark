import 'server-only'

import { trainingVideos as fallbackTrainingVideos } from '@/data/training-videos'
import { getOrganizationLeaderboard, getUserLeaderboardEntry } from '@/lib/leaderboard'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { getTrainingVideosForOrganization } from '@/lib/training-video-access'
import type { ContestConfig, Database } from '@/lib/types/database.types'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']
type UserRow = Database['public']['Tables']['users']['Row']
type IdeaRow = Database['public']['Tables']['ideas']['Row']

type DashboardOrganization = Pick<
  OrganizationRow,
  'id' | 'name' | 'slug' | 'contest_starts_at' | 'contest_ends_at' | 'is_leaderboard_enabled'
> & {
  contest_config: ContestConfig | null
}

type DashboardUserProfile = Pick<UserRow, 'organization_id' | 'role' | 'full_name'>

type DashboardIdeaAuthor = {
  full_name: string | null
  job_role: string | null
}

type DashboardIdeaAnalysis = {
  criteria_scores?: Record<string, number | { score: number; reasoning: string }>
  related_suggestions?: (string | { title: string; rationale: string; description: string })[]
  key_benefits?: string[]
  evaluated_at?: string
}

type DashboardIdea = Pick<
  IdeaRow,
  | 'id'
  | 'title'
  | 'description'
  | 'status'
  | 'created_at'
  | 'ai_score'
  | 'ai_reframed_text'
  | 'ai_feedback'
> & {
  ai_analysis_json: DashboardIdeaAnalysis | null
  department?: string | null
  problem_statement?: string | null
  proposed_solution?: string | null
  users?: DashboardIdeaAuthor
}

type DashboardIdeaQueryRow = DashboardIdea & {
  users: DashboardIdeaAuthor | DashboardIdeaAuthor[] | null
}

export interface TenantRequestContext {
  clientId: string
  supabase: Awaited<ReturnType<typeof createClient>>
  user: {
    id: string
    email: string | null
  }
  userProfile: DashboardUserProfile
  organization: DashboardOrganization
  redirectTo: string | null
  redirectReason: 'missing_user_profile' | 'missing_user_organization' | 'wrong_tenant' | null
}

export interface DashboardPageData {
  tenant: TenantRequestContext
  userIdeas: DashboardIdea[]
  topIdeas: DashboardIdea[]
  currentUserScore: Awaited<ReturnType<typeof getUserLeaderboardEntry>>
  leaderboardEntries: Awaited<ReturnType<typeof getOrganizationLeaderboard>>
  trainingResourceVideos: Awaited<ReturnType<typeof getTrainingVideosForOrganization>>
}

function mapOrganization(row: Pick<
  OrganizationRow,
  'id' | 'name' | 'slug' | 'contest_starts_at' | 'contest_ends_at' | 'contest_config' | 'is_leaderboard_enabled'
>): DashboardOrganization {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    contest_starts_at: row.contest_starts_at,
    contest_ends_at: row.contest_ends_at,
    contest_config: row.contest_config,
    is_leaderboard_enabled: row.is_leaderboard_enabled,
  }
}

function mapIdeaRow(row: DashboardIdeaQueryRow): DashboardIdea {
  const author = Array.isArray(row.users) ? row.users[0] ?? null : row.users
  const parsedAnalysis =
    row.ai_analysis_json && typeof row.ai_analysis_json === 'object' && !Array.isArray(row.ai_analysis_json)
      ? (row.ai_analysis_json as DashboardIdeaAnalysis)
      : null

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    created_at: row.created_at,
    ai_score: row.ai_score,
    ai_reframed_text: row.ai_reframed_text,
    ai_feedback: row.ai_feedback,
    ai_analysis_json: parsedAnalysis,
    department: row.department,
    problem_statement: row.problem_statement,
    proposed_solution: row.proposed_solution,
    users: author
      ? {
          full_name: author.full_name,
          job_role: author.job_role,
        }
      : undefined,
  }
}

async function getOrganizationBySlug(
  clientId: string,
  userClient: Awaited<ReturnType<typeof createClient>>
): Promise<DashboardOrganization | null> {
  const selectFields =
    'id, name, slug, contest_starts_at, contest_ends_at, contest_config, is_leaderboard_enabled'

  const userScopedResult = await userClient
    .from('organizations')
    .select(selectFields)
    .eq('slug', clientId)
    .maybeSingle()
  const userScopedRow = userScopedResult.data as Pick<
    OrganizationRow,
    'id' | 'name' | 'slug' | 'contest_starts_at' | 'contest_ends_at' | 'contest_config' | 'is_leaderboard_enabled'
  > | null

  if (userScopedRow) {
    return mapOrganization(userScopedRow)
  }

  const adminClient = await createAdminClient()
  const adminScopedResult = await adminClient
    .from('organizations')
    .select(selectFields)
    .eq('slug', clientId)
    .maybeSingle()
  const adminScopedRow = adminScopedResult.data as Pick<
    OrganizationRow,
    'id' | 'name' | 'slug' | 'contest_starts_at' | 'contest_ends_at' | 'contest_config' | 'is_leaderboard_enabled'
  > | null

  if (!adminScopedRow) {
    return null
  }

  return mapOrganization(adminScopedRow)
}

async function getOrganizationById(
  organizationId: string,
  userClient: Awaited<ReturnType<typeof createClient>>
): Promise<DashboardOrganization | null> {
  const selectFields =
    'id, name, slug, contest_starts_at, contest_ends_at, contest_config, is_leaderboard_enabled'

  const userScopedResult = await userClient
    .from('organizations')
    .select(selectFields)
    .eq('id', organizationId)
    .maybeSingle()
  const userScopedRow = userScopedResult.data as Pick<
    OrganizationRow,
    'id' | 'name' | 'slug' | 'contest_starts_at' | 'contest_ends_at' | 'contest_config' | 'is_leaderboard_enabled'
  > | null

  if (userScopedRow) {
    return mapOrganization(userScopedRow)
  }

  const adminClient = await createAdminClient()
  const adminScopedResult = await adminClient
    .from('organizations')
    .select(selectFields)
    .eq('id', organizationId)
    .maybeSingle()
  const adminScopedRow = adminScopedResult.data as Pick<
    OrganizationRow,
    'id' | 'name' | 'slug' | 'contest_starts_at' | 'contest_ends_at' | 'contest_config' | 'is_leaderboard_enabled'
  > | null

  if (!adminScopedRow) {
    return null
  }

  return mapOrganization(adminScopedRow)
}

async function getCurrentUserProfile(
  userId: string,
  userClient: Awaited<ReturnType<typeof createClient>>
): Promise<DashboardUserProfile | null> {
  const selectFields = 'organization_id, role, full_name'

  const userScopedResult = await userClient
    .from('users')
    .select(selectFields)
    .eq('id', userId)
    .maybeSingle()
  const userScopedRow = userScopedResult.data as DashboardUserProfile | null

  if (userScopedRow) {
    return userScopedRow
  }

  const adminClient = await createAdminClient()
  const adminScopedResult = await adminClient
    .from('users')
    .select(selectFields)
    .eq('id', userId)
    .maybeSingle()
  const adminScopedRow = adminScopedResult.data as DashboardUserProfile | null

  return adminScopedRow
}

async function getDashboardIdeas(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: { organizationId?: string; userId?: string },
  limit?: number
): Promise<DashboardIdea[]> {
  let query = supabase
    .from('ideas')
    .select(
      'id, title, description, status, created_at, ai_score, ai_reframed_text, ai_feedback, ai_analysis_json, users(full_name, job_role)'
    )
    .order(filters.organizationId ? 'ai_score' : 'created_at', { ascending: false })

  if (filters.organizationId) {
    query = query.eq('organization_id', filters.organizationId)
  }

  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (typeof limit === 'number') {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => mapIdeaRow(row as DashboardIdeaQueryRow))
}

export async function getTenantRequestContext(clientId: string): Promise<TenantRequestContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const parsedUserProfile = await getCurrentUserProfile(user.id, supabase)

  if (!parsedUserProfile) {
    const routeOrganization = await getOrganizationBySlug(clientId, supabase)
    if (!routeOrganization) {
      return null
    }

    return {
      clientId,
      supabase,
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      userProfile: {
        organization_id: routeOrganization.id,
        role: 'user',
        full_name: null,
      },
      organization: routeOrganization,
      redirectTo: '/login',
      redirectReason: 'missing_user_profile',
    }
  }

  const userOrganization = await getOrganizationById(parsedUserProfile.organization_id, supabase)
  if (!userOrganization) {
    const routeOrganization = await getOrganizationBySlug(clientId, supabase)
    if (!routeOrganization) {
      return null
    }

    return {
      clientId,
      supabase,
      user: {
        id: user.id,
        email: user.email ?? null,
      },
      userProfile: parsedUserProfile,
      organization: routeOrganization,
      redirectTo: '/login',
      redirectReason: 'missing_user_organization',
    }
  }

  const redirectTo =
    userOrganization.slug === clientId
      ? null
      : `/${userOrganization.slug}/dashboard`

  return {
    clientId,
    supabase,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
    userProfile: parsedUserProfile,
    organization: userOrganization,
    redirectTo,
    redirectReason: redirectTo ? 'wrong_tenant' : null,
  }
}

export async function getDashboardPageData(tenant: TenantRequestContext): Promise<DashboardPageData> {
  const [topIdeas, userIdeas, currentUserScore, leaderboardEntries, scopedTrainingVideos] =
    await Promise.all([
      getDashboardIdeas(tenant.supabase, { organizationId: tenant.organization.id }, 10),
      getDashboardIdeas(tenant.supabase, { userId: tenant.user.id }),
      getUserLeaderboardEntry(tenant.supabase, tenant.organization.id, tenant.user.id),
      getOrganizationLeaderboard(tenant.supabase, tenant.organization.id, 10),
      getTrainingVideosForOrganization(tenant.organization.id),
    ])

  return {
    tenant,
    userIdeas,
    topIdeas,
    currentUserScore,
    leaderboardEntries,
    trainingResourceVideos:
      scopedTrainingVideos.length > 0 ? scopedTrainingVideos : fallbackTrainingVideos,
  }
}

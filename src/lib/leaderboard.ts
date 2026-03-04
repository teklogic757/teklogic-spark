import 'server-only'

import type { Database } from '@/lib/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface LeaderboardEntry {
    id: string
    organizationId: string
    fullName: string | null
    jobRole: string | null
    ideaCount: number
    totalPoints: number
    lastSubmission: string | null
}

type LeaderboardRow = Database['public']['Views']['user_leaderboard']['Row']
type AppSupabaseClient = SupabaseClient<Database>

function mapLeaderboardRow(row: LeaderboardRow): LeaderboardEntry {
    return {
        id: row.user_id,
        organizationId: row.organization_id,
        fullName: row.full_name,
        jobRole: row.job_role,
        ideaCount: row.idea_count,
        totalPoints: row.total_points,
        lastSubmission: row.last_submission,
    }
}

export async function getOrganizationLeaderboard(
    supabase: AppSupabaseClient,
    organizationId: string,
    limit?: number
): Promise<LeaderboardEntry[]> {
    let query = supabase
        .from('user_leaderboard')
        .select('user_id, organization_id, full_name, job_role, idea_count, total_points, last_submission')
        .eq('organization_id', organizationId)
        .order('total_points', { ascending: false })
        .order('last_submission', { ascending: false })

    if (typeof limit === 'number') {
        query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
        throw error
    }

    return (data ?? []).map(mapLeaderboardRow)
}

export async function getUserLeaderboardEntry(
    supabase: AppSupabaseClient,
    organizationId: string,
    userId: string
): Promise<LeaderboardEntry | null> {
    const { data, error } = await supabase
        .from('user_leaderboard')
        .select('user_id, organization_id, full_name, job_role, idea_count, total_points, last_submission')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        throw error
    }

    if (!data) {
        return null
    }

    return mapLeaderboardRow(data)
}

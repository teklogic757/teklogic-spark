import Image from 'next/image'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StatsGrid } from '@/components/features/dashboard/StatsGrid'
import { IdeaList } from '@/components/features/ideas/IdeaList'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import { TopIdeas } from '@/components/TopIdeas'
import { Leaderboard } from '@/components/features/dashboard/Leaderboard'
import { TrainingResources } from '@/components/features/dashboard/TrainingResources'
import { PromptHubTeaser } from '@/components/features/dashboard/PromptHubTeaser'
import { ContestBanner } from '@/components/features/contest/ContestBanner'
import { PromptQuickSearch } from '@/components/features/prompts/PromptQuickSearch'
import { ContestConfig } from '@/lib/types/database.types'
import { trainingVideos as fallbackTrainingVideos } from '@/data/training-videos'
import { toTrainingVideoListItem } from '@/lib/training-videos'
import { errorLog } from '@/lib/server-log'



export default async function DashboardPage({ params }: { params: Promise<{ client_id: string }> }) {
    const { client_id } = await params

    // Standard client for user-scoped operations (enforces RLS)
    const supabase = await createClient()

    // Admin client for privileged operations (bypasses RLS)
    // REQUIRED: Used to fetch Organization details which might be blocked by restrictive RLS
    // policies for standard users, resolving the "Organization Not Found" redirect loop.
    const adminClient = await createAdminClient()


    // 1. Verify Authentication
    // We strictly enforce authentication here. Next.js middleware should catch this,
    // but this serves as a double-check.
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
        errorLog('dashboard.auth_failed', authError, { clientId: client_id })
    }

    if (!user) {
        redirect(`/${client_id}/login`)
    }


    // 2. Organization Check
    // uses adminClient to ensure we can find the organization even if RLS is broken/restrictive.
    // This was the root cause of the "Infinite Redirect Loop".
    const { data: organization, error: orgError } = await adminClient
        .from('organizations')
        .select('*')
        .eq('slug', client_id)
        .single()

    if (orgError) {
        errorLog('dashboard.organization_lookup_failed', orgError, { clientId: client_id })
    }

    if (!organization) {
        redirect(`/${client_id}/login`)
    }

    // Explicitly cast or ensure type to avoid 'never' if inference fails
    const org = organization as any // Quick fix for 'never' issue if types aren't aligning perfectly with adminClient

    // 3. Verify User Belongs to This Organization
    // SECURITY: Users must only access their own organization's dashboard
    const { data: currentUserData } = await adminClient
        .from('users')
        .select('organization_id, role, total_points')
        .eq('id', user.id)
        .single()

    if (!currentUserData) {
        errorLog('dashboard.user_profile_missing', 'User profile missing', { userId: user.id })
        redirect(`/login`)
    }

    // Type cast to handle TypeScript inference issues with admin client
    const currentUser = currentUserData as { organization_id: string; role: string; total_points: number }

    // If user is trying to access a different organization's dashboard, redirect them to their own
    if (currentUser.organization_id !== org.id) {
        const { data: userOrgData } = await adminClient
            .from('organizations')
            .select('slug')
            .eq('id', currentUser.organization_id)
            .single()

        const userOrg = userOrgData as { slug: string } | null
        if (userOrg?.slug) {
            redirect(`/${userOrg.slug}/dashboard`)
        } else {
            redirect(`/login`)
        }
    }

    const userRole = currentUser.role || 'user'

    // 4. Fetch Top 10 Ideas (with all fields for modal display)
    const { data: topIdeas } = await supabase
        .from('ideas')
        .select('*, users(full_name, job_role)')
        .eq('organization_id', org.id)
        .order('ai_score', { ascending: false })
        .limit(10)

    // 5. Fetch User's Ideas (with all fields for modal display)
    const { data: fetchedIdeas } = await supabase
        .from('ideas')
        .select('*, users(full_name, job_role)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const userIdeas = fetchedIdeas || []

    // 6. Fetch Leaderboard Users (users in this org sorted by total_points)
    const { data: leaderboardUsers } = await adminClient
        .from('users')
        .select('id, full_name, job_role, total_points')
        .eq('organization_id', org.id)
        .eq('is_active', true)
        .order('total_points', { ascending: false })
        .limit(10)

    const { data: trainingVideoRows } = await adminClient
        .from('training_videos')
        .select('id, title, youtube_url, thumbnail_url')
        .order('created_at', { ascending: false })

    const trainingResourceVideos = trainingVideoRows && trainingVideoRows.length > 0
        ? trainingVideoRows.map(toTrainingVideoListItem)
        : fallbackTrainingVideos

    return (
        <div className="flex min-h-screen flex-col bg-[#00080D]">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#00080D]/80 backdrop-blur-xl">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href={`/${client_id}/dashboard`} className="relative h-10 w-48 transition-opacity hover:opacity-90">
                            <Image
                                src="/logo.svg"
                                alt="Teklogic Spark AI"
                                fill
                                className="object-contain object-left mix-blend-screen"
                                priority
                            />
                        </Link>
                        <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />
                        <span className="text-xs text-slate-400 font-medium tracking-wider uppercase hidden md:block">
                            {org.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Contest Timer - between company name and user info */}
                        <ContestBanner
                            contestStartsAt={org.contest_starts_at}
                            contestEndsAt={org.contest_ends_at}
                            contestConfig={org.contest_config as ContestConfig | null}
                        />

                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-medium text-white">{user.email}</span>
                            <span className="text-[10px] text-primary">
                                {userRole === 'super_admin' ? 'Master Admin' : 'Staff Member'}
                            </span>
                        </div>

                        {/* Admin Portal Link for Super Admins */}
                        {userRole === 'super_admin' && (
                            <Link href="/admin">
                                <Button variant="ghost" size="sm" className="hidden md:flex text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 mr-2">
                                    Admin Portal
                                </Button>
                            </Link>
                        )}

                        <form action={signOut.bind(null, client_id)}>
                            <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-slate-400">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="container mx-auto flex-1 p-4 md:p-8 space-y-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                        <p className="text-slate-400">Track your automation impact and compete for the top spot.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PromptQuickSearch clientId={client_id} />
                        <Link href={`/${client_id}/submit`}>
                            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 text-base px-6 py-5">
                                <Plus className="mr-2 h-5 w-5" /> Submit New Idea
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Top Section: Top Ideas + Leaderboard side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <TopIdeas ideas={topIdeas || []} />
                    </div>
                    <div>
                        <Leaderboard users={leaderboardUsers || []} currentUserId={user.id} />
                    </div>
                </div>

                {/* Stats Grid */}
                <StatsGrid ideasCount={userIdeas.length} contestEndsAt={org.contest_ends_at} totalPoints={currentUser.total_points || 0} />

                {/* Training Resources & Prompt Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrainingResources videos={trainingResourceVideos} />
                    <PromptHubTeaser clientId={client_id} />
                </div>

                {/* Your Ideas Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">Your Ideas</h2>
                    </div>
                    <IdeaList ideas={userIdeas} clientId={client_id} />
                </div>

            </main>
        </div>
    )
}

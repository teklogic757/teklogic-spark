import Image from 'next/image'
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
import { errorLog } from '@/lib/server-log'
import { getDashboardPageData, getTenantRequestContext } from '@/lib/dashboard-access'



export default async function DashboardPage({ params }: { params: Promise<{ client_id: string }> }) {
    const { client_id } = await params

    const tenantContext = await getTenantRequestContext(client_id)

    if (!tenantContext?.user) {
        redirect(`/${client_id}/login`)
    }

    if (tenantContext.redirectTo) {
        if (tenantContext.redirectTo === '/login') {
            errorLog('dashboard.user_profile_missing', 'User profile missing', { userId: tenantContext.user.id })
        }

        redirect(tenantContext.redirectTo)
    }

    const dashboardData = await getDashboardPageData(tenantContext)
    const {
        tenant,
        topIdeas,
        userIdeas,
        currentUserScore,
        leaderboardEntries,
        trainingResourceVideos,
    } = dashboardData
    const { organization: org, user, userProfile } = tenant
    const userRole = userProfile.role || 'user'

    const leaderboardUsers = leaderboardEntries.map(entry => ({
        id: entry.id,
        full_name: entry.fullName,
        job_role: entry.jobRole,
        total_points: entry.totalPoints,
    }))

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
                            contestConfig={org.contest_config}
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
                <StatsGrid ideasCount={userIdeas.length} contestEndsAt={org.contest_ends_at} totalPoints={currentUserScore?.totalPoints || 0} />

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

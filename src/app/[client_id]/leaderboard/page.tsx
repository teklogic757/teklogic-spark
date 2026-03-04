import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import { Trophy, Medal, Star, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrganizationLeaderboard } from '@/lib/leaderboard'
import { getTenantRequestContext } from '@/lib/dashboard-access'

export default async function LeaderboardPage({ params }: { params: Promise<{ client_id: string }> }) {
    const { client_id } = await params

    const tenantContext = await getTenantRequestContext(client_id)

    if (!tenantContext) {
        redirect(`/${client_id}/login`)
    }

    if (tenantContext.redirectTo) {
        redirect(tenantContext.redirectTo)
    }

    const rankings = await getOrganizationLeaderboard(
        tenantContext.supabase,
        tenantContext.organization.id
    )

    // Find current user rank
    const userRankIndex = rankings.findIndex(r => r.id === tenantContext.user.id)
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '-'
    const org = tenantContext.organization

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
                        <form action={signOut.bind(null, client_id)}>
                            <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-slate-400">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="container mx-auto flex-1 p-4 md:p-8 space-y-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link href={`/${client_id}/dashboard`} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center">
                                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Trophy className="h-8 w-8 text-yellow-500" />
                            Leaderboard
                        </h1>
                        <p className="text-slate-400">Top contributors driving innovation at {org.name}.</p>
                    </div>

                    {/* User Rank Card */}
                    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/30 min-w-[200px]">
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-indigo-300 font-medium uppercase tracking-wider">Your Rank</span>
                            <div className="text-3xl font-bold text-white mt-1">
                                #{userRank}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Leaderboard Table */}
                <Card className="bg-card border-white/5 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-white">Organization Rankings</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 w-20 text-center">Rank</th>
                                    <th className="px-6 py-4">Innovator</th>
                                    <th className="px-6 py-4 hidden md:table-cell">Role</th>
                                    <th className="px-6 py-4 text-center">Ideas</th>
                                    <th className="px-6 py-4 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {rankings.map((r, index: number) => {
                                    const rank = index + 1
                                    const isCurrentUser = r.id === tenantContext.user.id

                                    return (
                                        <tr key={r.id} className={`group transition-colors hover:bg-white/5 ${isCurrentUser ? 'bg-indigo-500/10 hover:bg-indigo-500/20' : ''}`}>
                                            <td className="px-6 py-4 text-center font-bold text-slate-500">
                                                {rank === 1 && <Medal className="h-6 w-6 text-yellow-500 mx-auto" />}
                                                {rank === 2 && <Medal className="h-6 w-6 text-slate-400 mx-auto" />}
                                                {rank === 3 && <Medal className="h-6 w-6 text-amber-700 mx-auto" />}
                                                {rank > 3 && <span className="text-slate-500">#{rank}</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white flex items-center gap-2">
                                                    {r.fullName || 'Anonymous User'}
                                                    {isCurrentUser && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">YOU</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 hidden md:table-cell">
                                                {r.jobRole || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center text-slate-300">
                                                {r.ideaCount}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-white flex items-center justify-end gap-1">
                                                    {r.totalPoints}
                                                    <Star className="h-3 w-3 text-yellow-500 mb-0.5" />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}

                                {rankings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No ranked users yet. Be the first to submit an idea!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>
        </div>
    )
}

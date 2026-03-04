import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trophy, Medal } from 'lucide-react'
import { DesktopToggle } from '@/components/mobile/DesktopToggle'
import { getOrganizationLeaderboard } from '@/lib/leaderboard'
import { getTenantRequestContext } from '@/lib/dashboard-access'

export default async function MobileLeaderboardPage({ params }: { params: Promise<{ client_id: string }> }) {
    const { client_id } = await params
    const tenantContext = await getTenantRequestContext(client_id)

    if (!tenantContext) {
        redirect(`/${client_id}/login`)
    }

    if (tenantContext.redirectTo) {
        redirect(tenantContext.redirectTo)
    }

    const { organization, supabase, user } = tenantContext
    const leaderboardEntries = await getOrganizationLeaderboard(supabase, organization.id, 20)

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#00080D]">
                <div className="flex h-14 items-center justify-between px-4">
                    <Link href={`/${client_id}/m/`} className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm">Back</span>
                    </Link>
                    <div className="relative h-6 w-24">
                        <Image
                            src="/logo.svg"
                            alt="Teklogic"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="w-16" />
                </div>
            </header>

            {/* Leaderboard */}
            <main className="flex-1 px-4 py-6">
                <div className="flex items-center gap-2 mb-6">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <h1 className="text-xl font-bold text-white">Leaderboard</h1>
                </div>

                {leaderboardEntries.length > 0 ? (
                    <div className="space-y-2">
                        {leaderboardEntries.map((u, index) => {
                            const isCurrentUser = u.id === user.id
                            return (
                                <div
                                    key={u.id}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg transition-colors
                                        ${isCurrentUser
                                            ? 'bg-primary/10 border border-primary/30'
                                            : 'bg-white/[0.02] border border-white/5'
                                        }
                                    `}
                                >
                                    {/* Rank */}
                                    <div className={`
                                        flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm shrink-0
                                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                            index === 1 ? 'bg-zinc-400/20 text-zinc-400' :
                                                index === 2 ? 'bg-amber-700/20 text-amber-700' :
                                                    'bg-slate-800 text-slate-400'}
                                    `}>
                                        {index < 3 ? (
                                            <Medal className="h-4 w-4" />
                                        ) : (
                                            `#${index + 1}`
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                            {u.fullName || 'Anonymous'}
                                            {isCurrentUser && <span className="text-xs ml-2 opacity-70">(You)</span>}
                                        </p>
                                        {u.jobRole && (
                                            <p className="text-xs text-slate-500 truncate">{u.jobRole}</p>
                                        )}
                                    </div>

                                    {/* Points */}
                                    <div className="text-right shrink-0">
                                        <span className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                            {u.totalPoints || 0}
                                        </span>
                                        <p className="text-xs text-slate-500">pts</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-400">No participants yet.</p>
                        <p className="text-slate-500 text-sm mt-1">Be the first to submit an idea!</p>
                    </div>
                )}

                {/* Submit CTA */}
                <div className="mt-8">
                    <Link href={`/${client_id}/m/submit`}>
                        <Button className="w-full h-12 bg-primary hover:bg-primary/90">
                            Submit an Idea
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#00080D]">
                <div className="flex justify-center">
                    <DesktopToggle clientId={client_id} />
                </div>
            </footer>
        </div>
    )
}

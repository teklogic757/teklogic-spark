import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Trophy, LogOut } from 'lucide-react'
import { signOut } from '@/app/login/actions'
import { DesktopToggle } from '@/components/mobile/DesktopToggle'
import { getUserLeaderboardEntry } from '@/lib/leaderboard'
import { getTenantRequestContext } from '@/lib/dashboard-access'

export default async function MobileHomePage({ params }: { params: Promise<{ client_id: string }> }) {
    const { client_id } = await params
    const tenantContext = await getTenantRequestContext(client_id)

    if (!tenantContext) {
        redirect(`/${client_id}/login`)
    }

    if (tenantContext.redirectTo) {
        redirect(tenantContext.redirectTo)
    }

    const { organization, user, userProfile, supabase } = tenantContext
    const currentUserScore = await getUserLeaderboardEntry(supabase, organization.id, user.id)

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#00080D]">
                <div className="flex h-14 items-center justify-between px-4">
                    <div className="relative h-8 w-32">
                        <Image
                            src="/logo.svg"
                            alt="Teklogic Spark AI"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>

                    <form action={signOut.bind(null, client_id)}>
                        <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white h-9 px-3"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </form>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                {/* Welcome */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Welcome{userProfile.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}!
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {organization.name}
                    </p>
                    {currentUserScore && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                            <Trophy className="h-4 w-4" />
                            {currentUserScore.totalPoints} points
                        </div>
                    )}
                </div>

                {/* Primary Action */}
                <Link href={`/${client_id}/m/submit`} className="w-full max-w-xs">
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Submit New Idea
                    </Button>
                </Link>

                {/* Secondary Action */}
                <Link
                    href={`/${client_id}/m/leaderboard`}
                    className="mt-6 text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                >
                    <Trophy className="h-4 w-4" />
                    View Leaderboard
                </Link>
            </main>

            {/* Footer with Desktop Toggle */}
            <footer className="border-t border-white/5 bg-[#00080D]">
                <div className="flex justify-center">
                    <DesktopToggle clientId={client_id} />
                </div>
            </footer>
        </div>
    )
}

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Plus, Trophy, Mail } from 'lucide-react'
import { DesktopToggle } from '@/components/mobile/DesktopToggle'

export default async function MobileSuccessPage({ params }: { params: Promise<{ client_id: string }> }) {
    const { client_id } = await params

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="border-b border-white/10 bg-[#00080D]">
                <div className="flex h-14 items-center justify-center px-4">
                    <div className="relative h-8 w-32">
                        <Image
                            src="/logo.svg"
                            alt="Teklogic Spark AI"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </header>

            {/* Success Message */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">
                    Idea Submitted!
                </h1>

                <p className="text-slate-400 mb-2 max-w-xs">
                    Thank you for your submission. Your idea is being evaluated.
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Mail className="h-4 w-4" />
                    <span>We'll email you with feedback shortly.</span>
                </div>

                {/* Actions */}
                <div className="w-full max-w-xs space-y-3">
                    <Link href={`/${client_id}/m/submit`} className="block">
                        <Button
                            size="lg"
                            className="w-full h-12 bg-primary hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Submit Another Idea
                        </Button>
                    </Link>

                    <Link href={`/${client_id}/m/leaderboard`} className="block">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full h-12 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                        >
                            <Trophy className="mr-2 h-5 w-5" />
                            View Leaderboard
                        </Button>
                    </Link>

                    <Link
                        href={`/${client_id}/m/`}
                        className="block text-center text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors"
                    >
                        Back to Home
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

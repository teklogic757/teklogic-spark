import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SubmitIdeaForm } from '@/components/submit-idea-form'

export const dynamic = 'force-dynamic'

export default async function SubmitIdeaPage({ params }: { params: Promise<{ client_id: string }> }) {
    // Await params in Next.js 15
    const { client_id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If there is no user, they are a guest (allowed by middleware/cookie)
    const isGuest = !user

    return (
        <div className="container mx-auto max-w-3xl p-4 md:p-8">
            <Link
                href={`/${client_id}/dashboard`}
                className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>

            <div className="flex justify-center mb-6">
                <div className="relative w-48 h-16">
                    <Image
                        src="/logo.svg"
                        alt="Teklogic Spark AI"
                        fill
                        className="object-contain mix-blend-screen"
                        priority
                    />
                </div>
            </div>

            <SubmitIdeaForm clientId={client_id} isGuest={isGuest} />

            {/* Help Section */}
            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2">💡 What makes a great idea submission?</h3>
                <ul className="text-xs text-slate-400 space-y-1.5 ml-4">
                    <li className="list-disc"><strong className="text-slate-300">Be specific:</strong> Clear problem statements get better AI evaluations</li>
                    <li className="list-disc"><strong className="text-slate-300">Show impact:</strong> Explain how this saves time, money, or improves quality</li>
                    <li className="list-disc"><strong className="text-slate-300">Add visuals:</strong> Screenshots and diagrams help illustrate your concept</li>
                    <li className="list-disc"><strong className="text-slate-300">Think practical:</strong> Focus on what's feasible with current or near-future technology</li>
                </ul>
            </div>
        </div>
    )
}

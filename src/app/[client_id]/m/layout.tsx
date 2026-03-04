import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MobileLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ client_id: string }>
}) {
    const { client_id } = await params
    const supabase = await createClient()

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/${client_id}/login`)
    }

    return (
        <div className="min-h-screen bg-[#00080D] text-white">
            {children}
        </div>
    )
}

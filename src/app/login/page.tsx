import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDashboardUrl } from './actions'
import GlobalLoginForm from './login-form'

export default async function GlobalLoginPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
        const dashboardUrl = await getUserDashboardUrl(session.user.id)
        if (dashboardUrl) {
            redirect(dashboardUrl)
        }
    }

    return <GlobalLoginForm />
}

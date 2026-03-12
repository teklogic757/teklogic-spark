import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDashboardUrl } from './actions'
import GlobalLoginForm from './login-form'

export default async function GlobalLoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const dashboardUrl = await getUserDashboardUrl(user.id)
        if (dashboardUrl) {
            redirect(dashboardUrl)
        }
    }

    return <GlobalLoginForm />
}

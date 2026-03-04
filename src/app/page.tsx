import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDashboardUrl } from './login/actions'

export default async function Home() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    const dashboardUrl = await getUserDashboardUrl(session.user.id)
    if (dashboardUrl) {
      redirect(dashboardUrl)
    }
  }

  redirect('/login')
}

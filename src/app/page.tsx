import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserDashboardUrl } from './login/actions'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const dashboardUrl = await getUserDashboardUrl(user.id)
    if (dashboardUrl) {
      redirect(dashboardUrl)
    }
  }

  redirect('/login')
}

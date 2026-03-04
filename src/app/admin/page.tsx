import { redirect } from 'next/navigation'

export default function AdminDashboard() {
    // Redirect to Organizations list as the default "Dashboard" view
    redirect('/admin/organizations')
}

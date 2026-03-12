import { createClient } from '@/lib/supabase/server'
import { getCanonicalSiteOrigin } from '@/lib/site-url'
import WorkshopsPage from './workshops-client'

export const dynamic = 'force-dynamic'

type WorkshopUserProfile = {
    organization_id: string
}

type WorkshopCode = {
    id: string
    code: string
    name: string
    is_active: boolean
}

export default async function Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    // Get user's org
    const { data: userProfileData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    const userProfile = userProfileData as WorkshopUserProfile | null

    if (!userProfile?.organization_id) return <div>No organization found</div>

    const { data: codesData } = await supabase
        .from('workshop_access_codes')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

    const codes = (codesData as WorkshopCode[] | null) || []

    const baseUrl = getCanonicalSiteOrigin()

    return <WorkshopsPage codes={codes} baseUrl={baseUrl} />
}

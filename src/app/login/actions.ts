'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { rateLimitAction } from '@/lib/rate-limiter'
import { LoginQuerySchema, validateInput } from '@/lib/validators'
import { headers } from 'next/headers'

export async function findOrganization(prevState: any, formData: FormData) {
    const query = formData.get('query') as string

    // Rate limiting by IP (no user ID available yet)
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const rateLimitResult = rateLimitAction('findOrganization', ip)
    if (rateLimitResult) {
        return { error: rateLimitResult.error }
    }

    // Validate input
    const validation = validateInput(LoginQuerySchema, query)
    if (!validation.success) {
        return { error: validation.error }
    }

    const supabase = await createClient()
    const sanitizedQuery = validation.data

    // 1. Try exact Slug match
    let { data } = await supabase
        .from('organizations')
        .select('slug')
        .eq('slug', sanitizedQuery.toLowerCase())
        .maybeSingle()

    if (data) {
        const slug = (data as any).slug
        redirect(`/${slug}/login`)
    }

        // 2. Try Domain match
        ({ data } = await supabase
            .from('organizations')
            .select('slug')
            .eq('domain', sanitizedQuery.toLowerCase())
            .maybeSingle())

    if (data) {
        const slug = (data as any).slug
        redirect(`/${slug}/login`)
    }

        // 3. Try Name match (ilike)
        // using maybeSingle() to avoid error on multiple matches, though it picks one arbitrarily if multiple exist.
        // Ideally we list matches or force exactness. For now, we pick the first.
        ({ data } = await supabase
            .from('organizations')
            .select('slug')
            .ilike('name', sanitizedQuery)
            .limit(1)
            .maybeSingle())

    if (data) {
        const slug = (data as any).slug
        redirect(`/${slug}/login`)
    }

    return { error: `We couldn't find an organization matching "${sanitizedQuery}".` }
}

export async function getUserDashboardUrl(userId: string): Promise<string | null> {
    // Use centralized admin client to bypass RLS for this lookup
    const supabase = await createAdminClient()

    // 1. Get user's organization_id
    const { data: userDataRaw } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', userId)
        .single()

    const userData = userDataRaw as { organization_id: string; role: string } | null

    if (!userData?.organization_id) {
        console.error('[getUserDashboardUrl] No organization_id for user:', userId)
        return null
    }

    // 2. Get organization slug
    const { data: orgDataRaw } = await supabase
        .from('organizations')
        .select('slug')
        .eq('id', userData.organization_id)
        .single()

    const orgData = orgDataRaw as { slug: string } | null

    if (!orgData?.slug) {
        console.error('[getUserDashboardUrl] No slug for org:', userData.organization_id)
        return null
    }

    // 3. Return organization dashboard URL
    // Note: Super admins land on their org dashboard and can access Admin Portal via header link
    return `/${orgData.slug}/dashboard`
}

export async function signOut(formData?: FormData | string) {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // If formData is a string, it's the slug passed directly (via bind)
    // If it's pure FormData (unlikely here but good to be safe), we default to login.
    let redirectPath = '/login'

    if (typeof formData === 'string') {
        redirectPath = `/${formData}/login`
    }

    redirect(redirectPath)
}

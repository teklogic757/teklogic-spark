'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SignupSchema, validateInput } from '@/lib/validators'

type JoinActionState = {
    error?: string
    success?: boolean
    message?: string
}

type WorkshopRecord = {
    id: string
    organization_id: string
    code: string
    is_active: boolean
    expires_at: string | null
}

type OrganizationSlug = {
    slug: string
}

type InviteLookup = {
    email: string
    organization_id: string
    organization_name: string
}

export async function joinWorkshop(prevState: JoinActionState | null, formData: FormData) {
    const code = formData.get('code') as string

    if (!code || code.length < 6) {
        return { error: 'Invalid code format' }
    }

    const supabase = await createClient()

    // 1. Validate Code
    const { data: workshop, error } = await supabase
        .from('workshop_access_codes')
        .select('id, organization_id, code, is_active, expires_at')
        .eq('code', code.toUpperCase())
        .eq('code', code.toUpperCase())
        .single()

    const workshopData = workshop as WorkshopRecord | null

    if (error || !workshopData) {
        return { error: 'Invalid workshop code.' }
    }

    if (!workshopData.is_active) {
        return { error: 'This workshop link has expired.' }
    }

    if (workshopData.expires_at && new Date(workshopData.expires_at) < new Date()) {
        return { error: 'This workshop link has expired.' }
    }

    // 2. Set Session Cookie (Workshop Access Token)
    // We try to sign in anonymously. If it fails (e.g. disabled in Supabase), we proceed with just the cookie.
    const { data: { user }, error: authError } = await supabase.auth.signInAnonymously()

    if (authError) {
        console.warn('Anon Auth Warning (proceeding with cookie only):', authError.message)
    }

    // 3. Link anonymous user to the organization via metadata or a profile entry
    // Since we can't easily update auth.users metadata from client without service role,
    // we might need a trusted backend function or just rely on the 'Client ID' being passed to the submit form.

    // Allow the user to proceed. We will pass the organization_id in the URL 
    // or store it in a cookie for the submit page to pick up.

    (await cookies()).set('teklogic_workshop_org', workshopData.organization_id, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 // 24 hours
    })

    // Get the org slug for redirection (Use Admin Client to bypass RLS if org is not public)
    const supabaseAdmin = await createAdminClient()
    const { data: orgData } = await supabaseAdmin.from('organizations').select('slug').eq('id', workshopData.organization_id).single()
    const org = orgData as OrganizationSlug | null

    if (!org) return { error: 'Configuration error: Organization not found.' }

    redirect(`/${org.slug}/submit?source=workshop`)
}

export async function signupWithInvite(prevState: JoinActionState | null, formData: FormData) {
    const token = formData.get('token') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string

    const validation = validateInput(SignupSchema, {
        token,
        password,
        full_name,
    })

    if (!validation.success) {
        return { error: validation.error }
    }

    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: invitePayload, error: inviteError } = await (supabaseAdmin.rpc as any)('get_invite_by_token', {
        token_input: token,
    })

    const invite = invitePayload as InviteLookup | null

    if (inviteError || !invite) {
        return { error: 'This invitation is invalid or has already been used.' }
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: invite.email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role: 'user' },
    })

    if (authError || !authUser.user) {
        return { error: authError?.message || 'Unable to create account.' }
    }

    const { error: profileError } = await (supabaseAdmin.from('users') as any).upsert({
        id: authUser.user.id,
        email: invite.email,
        full_name,
        organization_id: invite.organization_id,
        role: 'user',
    })

    if (profileError) {
        return { error: 'Your account was created, but the profile setup failed.' }
    }

    await (supabaseAdmin.rpc as any)('accept_invite', {
        token_input: token,
        user_id: authUser.user.id,
    })

    const signInResult = await supabase.auth.signInWithPassword({
        email: invite.email,
        password,
    })

    if (signInResult.error) {
        redirect('/login')
    }

    redirect('/login')
}

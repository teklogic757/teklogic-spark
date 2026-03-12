import { createAdminClient, createClient } from '@/lib/supabase/server'
import { resolveAuthRedirect } from '@/lib/auth-redirect'
import { NextResponse } from 'next/server'
import { errorLog, warnLog } from '@/lib/server-log'

async function getPostAuthFallbackPath(userId: string | undefined) {
    if (!userId) {
        return '/login'
    }

    const supabaseAdmin = await createAdminClient()
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

    const organizationId = (userData as { organization_id: string } | null)?.organization_id
    if (!organizationId) {
        return '/login'
    }

    const { data: organizationData } = await supabaseAdmin
        .from('organizations')
        .select('slug')
        .eq('id', organizationId)
        .single()

    const slug = (organizationData as { slug: string } | null)?.slug
    return slug ? `/${slug}/dashboard` : '/login'
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next')
    const errorSearchParams = new URLSearchParams()
    const errorRedirectPath = '/auth/auth-code-error'

    if (code) {
        const supabase = await createClient()

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            const fallbackPath = await getPostAuthFallbackPath(user?.id)
            const redirectTarget = resolveAuthRedirect(next, {
                request,
                fallbackPath,
            })

            if (redirectTarget.rejectedReason) {
                warnLog('auth.callback_invalid_redirect', {
                    fallbackPath,
                    next,
                    reason: redirectTarget.rejectedReason,
                    userId: user?.id ?? null,
                })
            }

            return NextResponse.redirect(redirectTarget.destination)
        } else {
            errorLog('auth.callback_exchange_failed', error, {
                next,
            })

            errorSearchParams.set('error', error.name)
            errorSearchParams.set('description', error.message)
            const errorRedirect = resolveAuthRedirect(`${errorRedirectPath}?${errorSearchParams.toString()}`, {
                request,
                fallbackPath: errorRedirectPath,
            })
            return NextResponse.redirect(errorRedirect.destination)
        }
    }

    errorSearchParams.set('error', 'NoCode')
    errorSearchParams.set('description', 'No auth code provided')

    const missingCodeRedirect = resolveAuthRedirect(`${errorRedirectPath}?${errorSearchParams.toString()}`, {
        request,
        fallbackPath: errorRedirectPath,
    })

    return NextResponse.redirect(missingCodeRedirect.destination)
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { errorLog } from '@/lib/server-log'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // "next" check for security, ensure it starts with /
    let next = searchParams.get('next') ?? '/dashboard'
    if (!next.startsWith('/')) {
        next = '/dashboard'
    }

    if (code) {
        const supabase = await createClient()

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            errorLog('auth.callback_exchange_failed', error, {
                next,
            })

            // Redirect to error page with details
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.name)}&description=${encodeURIComponent(error.message)}`)
        }
    }

    // No code present
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=NoCode&description=No+auth+code+provided`)
}

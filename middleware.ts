
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
    applyPublicSecurityHeaders,
    getPublicAuthCookieOptions,
    isRequestHttps,
} from '@/lib/security-headers'

// Mobile device detection regex (includes tablets)
const MOBILE_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|tablet/i

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isHttps = isRequestHttps(request)

    // Detect mobile device
    const userAgent = request.headers.get('user-agent') || ''
    const isMobileDevice = MOBILE_REGEX.test(userAgent)

    // Check for desktop preference cookie (allows mobile users to opt into desktop)
    const preferDesktop = request.cookies.get('prefer-desktop')?.value === 'true'

    // Determine if this request should be treated as mobile
    const isMobile = isMobileDevice && !preferDesktop

    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create Supabase client for auth
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: getPublicAuthCookieOptions({ isHttps }),
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Auth Guard & Session Refresh
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Workshop Access Check
    const workshopOrgId = request.cookies.get('teklogic_workshop_org')?.value

    // Allow access to submit page if workshop cookie is present, even if no user
    if (!user && workshopOrgId && pathname.includes('/submit')) {
        // Optionally validate the orgId format or just let it pass to the page which will validate
        return applyPublicSecurityHeaders(supabaseResponse, { isHttps })
    }

    // Set device type header for downstream components
    supabaseResponse.headers.set('x-device-type', isMobile ? 'mobile' : 'desktop')

    // Mobile redirect logic (only for authenticated users on specific routes)
    if (isMobile && user) {
        // Extract client_id from path like /teklogic/dashboard
        const pathParts = pathname.split('/')
        const clientId = pathParts[1]

        // Skip if already on mobile routes, login, or auth routes
        if (clientId && !pathname.includes('/m/') && !pathname.includes('/login') && !pathname.includes('/auth')) {

            // Redirect /[client_id]/dashboard to /[client_id]/m/
            if (pathname === `/${clientId}/dashboard`) {
                const mobileUrl = new URL(`/${clientId}/m/`, request.url)
                return applyPublicSecurityHeaders(NextResponse.redirect(mobileUrl), { isHttps })
            }

            // Redirect /[client_id]/submit to /[client_id]/m/submit
            if (pathname === `/${clientId}/submit`) {
                const mobileUrl = new URL(`/${clientId}/m/submit`, request.url)
                return applyPublicSecurityHeaders(NextResponse.redirect(mobileUrl), { isHttps })
            }
        }
    }

    return applyPublicSecurityHeaders(supabaseResponse, { isHttps })
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

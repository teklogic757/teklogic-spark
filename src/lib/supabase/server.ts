
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types/database.types'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for Server Components with cookie handling.
 * This client is scoped to the current user's session (if it exists).
 * Use this for most operations where RLS policies should enforce user access.
 */
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

/**
 * Creates a Supabase Admin client with the Service Role Key.
 * THIS CLIENT BYPASSES ROW LEVEL SECURITY (RLS).
 * 
 * Use this client ONLY for:
 * 1. Admin-only operations (e.g., inviting users, creating organizations).
 * 2. Fetching narrowly-scoped tenant data that is wrongly blocked by RLS
 *    (for example organization slug resolution when authenticated users
 *    cannot read their own org row).
 * 
 * It does NOT have access to the user's session/cookies.
 */
export async function createAdminClient() {
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

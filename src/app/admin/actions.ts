'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { rateLimitAction } from '@/lib/rate-limiter'
import {
    CreateUserSchema,
    InvitationSchema,
    TrainingVideoCreateSchema,
    TrainingVideoDeleteSchema,
    validateInput,
} from '@/lib/validators'
import { sendWelcomeEmail, type EmailResult } from '@/lib/email'
import { normalizeTrainingVideo } from '@/lib/training-videos'
import { writeAdminAuditEvent } from '@/lib/audit-log'
import { errorLog, warnLog } from '@/lib/server-log'

function logNotificationResult(label: string, result: EmailResult) {
    if (result.status === 'skipped') {
        warnLog('email.skipped', {
            label,
            reason: result.warning || result.error || 'Skipped',
        })
        return
    }

    if (result.status === 'failed') {
        errorLog('email.failed', result.error || 'Unknown email error', { label })
    }
}

/**
 * Verifies if the current user has 'super_admin' privileges.
 * Used as a security guard clause at the start of Admin Server Actions.
 */
export async function verifyAdmin() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return false
    }

    const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    const userInfo = userData as { role: string } | null
    return userInfo?.role === 'super_admin'
}

// ORGANIZATIONS
export async function getOrganizations() {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('organizations')
        .select('*') // Get all fields
        .order('name')

    if (error) throw error
    return data
}

export async function getOrganizationById(id: string) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function updateOrganization(prevState: any, formData: FormData) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) return { error: 'Unauthorized' }

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const domain = formData.get('domain') as string
    const industry = formData.get('industry') as string
    const brand_voice = formData.get('brand_voice') as string
    const annual_it_budget = formData.get('annual_it_budget') as string
    const estimated_revenue = formData.get('estimated_revenue') as string
    const marketing_strategy = formData.get('marketing_strategy') as string
    const employee_count = formData.get('employee_count') as string

    // Convert color input to JSON if needed, for simplicity treating as strings/text?
    // Let's assume input names 'color_primary', 'color_secondary'
    // Storing as jsonb: { primary: "#...", secondary: "#..." }
    const color_primary = formData.get('color_primary') as string
    const color_secondary = formData.get('color_secondary') as string

    const brand_colors = {
        primary: color_primary,
        secondary: color_secondary
    }

    // Contest settings
    const contest_enabled = formData.get('contest_enabled') === 'true'
    const contest_starts_at = formData.get('contest_starts_at') as string || null
    const contest_ends_at = formData.get('contest_ends_at') as string || null
    const contest_title = formData.get('contest_title') as string || 'Spark AI Innovation Challenge'
    const contest_description = formData.get('contest_description') as string || ''
    const contest_first_prize = formData.get('contest_first_prize') as string || '$100 Amazon Gift Card'
    const contest_second_prize = formData.get('contest_second_prize') as string || '$50 Amazon Gift Card'

    // Build contest_config JSON
    const contest_config = contest_enabled ? {
        title: contest_title,
        description: contest_description || 'Submit your best automation ideas and compete for prizes!',
        prizes: [
            { place: 1, description: contest_first_prize, value: contest_first_prize.match(/\$[\d,]+/)?.[0] || '$100' },
            { place: 2, description: contest_second_prize, value: contest_second_prize.match(/\$[\d,]+/)?.[0] || '$50' }
        ],
        rules: [
            'All ideas must be original and not previously submitted',
            'Ideas are scored by AI based on impact, feasibility, and innovation',
            'Points are earned for each submission based on AI score',
            'Bonus points may be awarded by administrators for exceptional ideas',
            'Winners will be announced within 48 hours of contest end',
            'Employees must be active members of the organization to participate',
            'Gift cards will be delivered electronically to the winner\'s email address'
        ],
        is_active: true
    } : null

    const supabase = await createClient()
    const { error } = await (supabase
        .from('organizations') as any)
        .update({
            name,
            domain,
            industry,
            brand_voice,
            annual_it_budget,
            estimated_revenue,
            marketing_strategy,
            employee_count,
            brand_colors,
            contest_starts_at: contest_enabled ? contest_starts_at : null,
            contest_ends_at: contest_enabled ? contest_ends_at : null,
            contest_config,
            is_leaderboard_enabled: contest_enabled
        })
        .eq('id', id)

    if (error) return { error: error.message }

    try {
        await writeAdminAuditEvent({
            action: 'organization.updated',
            targetType: 'organization',
            targetId: id,
            targetLabel: name,
            metadata: {
                domain: domain || null,
                contest_enabled,
            },
        })
    } catch (auditError) {
        return {
            error: auditError instanceof Error
                ? auditError.message
                : 'Organization updated but audit logging failed.',
        }
    }

    revalidatePath('/admin/organizations')
    return { success: 'Organization updated successfully' }
}

export async function createOrganization(prevState: any, formData: FormData) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const domain = formData.get('domain') as string
    const industry = formData.get('industry') as string
    const brand_voice = formData.get('brand_voice') as string
    const annual_it_budget = formData.get('annual_it_budget') as string
    const estimated_revenue = formData.get('estimated_revenue') as string
    const marketing_strategy = formData.get('marketing_strategy') as string
    const employee_count = formData.get('employee_count') as string

    // Simple slug generation
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Colors
    const color_primary = formData.get('color_primary') as string
    const color_secondary = formData.get('color_secondary') as string
    const brand_colors = {
        primary: color_primary || '#000000',
        secondary: color_secondary || '#ffffff'
    }

    const supabase = await createClient()
    const { data: createdOrganization, error } = await (supabase
        .from('organizations') as any)
        .insert({
            name,
            slug,
            domain,
            industry,
            brand_voice,
            annual_it_budget,
            estimated_revenue,
            marketing_strategy,
            employee_count,
            brand_colors
        })
        .select('id, name, slug')
        .single()

    if (error) return { error: error.message }

    const createdOrg = createdOrganization as { id: string; name: string; slug: string } | null

    try {
        await writeAdminAuditEvent({
            action: 'organization.created',
            targetType: 'organization',
            targetId: createdOrg?.id ?? null,
            targetLabel: createdOrg?.name ?? name,
            metadata: {
                slug: createdOrg?.slug ?? slug,
                domain: domain || null,
            },
        })
    } catch (auditError) {
        throw new Error(
            auditError instanceof Error
                ? auditError.message
                : 'Organization created but audit logging failed.'
        )
    }

    revalidatePath('/admin/organizations')
    redirect('/admin/organizations')
}


// USERS
export async function getUsers() {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    // Join with organizations to show Org Name
    const { data, error } = await supabase
        .from('users')
        .select('*, organizations(name)')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
    revalidatePath('/admin/users')
    return { success: 'User updated successfully' }
}

/**
 * Creates a new user in both Supabase Auth and the public 'users' table.
 * 
 * NOTE: This action uses the Service Role Key via `createServerClient` inline
 * because standard admins do not have permission to `auth.admin.createUser()`.
 * This effectively elevates privileges for this specific operation.
 */
export async function createUser(prevState: any, formData: FormData) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) return { error: 'Unauthorized' }

    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const organization_id = formData.get('organization_id') as string
    const role = formData.get('role') as string || 'user'
    const job_role = formData.get('job_role') as string
    const ai_context = formData.get('ai_context') as string

    // Validate input with Zod
    const validation = validateInput(CreateUserSchema, {
        email,
        password,
        full_name,
        organization_id,
        role,
        job_role: job_role || null,
        ai_context: ai_context || null
    })

    if (!validation.success) {
        return { error: validation.error }
    }

    // Use centralized admin client for admin operations
    const supabaseAdmin = await createAdminClient()

    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role }
    })

    if (authError) return { error: authError.message }
    if (!authUser.user) return { error: 'Failed to create user' }

    // 2. Insert into public.users (if not handled by trigger, but let's be safe/explicit or update it)
    // The trigger might handle insertion, but we need to set organization_id and job_role.
    // Safest is to UPDATE the record that the trigger created, or INSERT if the trigger is weak.
    // Assuming our trigger "on_auth_user_created" inserts a row. Let's wait/retry or just Update.
    // Actually, usually we insert directly if we can, or update.
    // Let's try to Update the user record assuming the trigger created it. 
    // If the trigger allows us to set org_id via metadata, that would be better, but we don't have that logic verified.
    // So we will Upsert (Insert with conflict on ID) to ensure fields are set.

    // Wait a brief moment for trigger? Or just Upsert.
    const { error: dbError } = await (supabaseAdmin
        .from('users') as any)
        .upsert({
            id: authUser.user.id,
            email,
            full_name,
            organization_id,
            role,
            job_role,
            ai_context
        })

    if (dbError) {
        errorLog('admin.user_profile_upsert_failed', dbError, { email, organization_id })
        // Attempt cleanup?
        return { error: 'User created but failed to save profile: ' + dbError.message }
    }

    try {
        await writeAdminAuditEvent({
            action: 'user.created',
            targetType: 'user',
            targetId: authUser.user.id,
            targetLabel: full_name,
            metadata: {
                organization_id,
                role,
            },
        })
    } catch (auditError) {
        return {
            error: auditError instanceof Error
                ? auditError.message
                : 'User created but audit logging failed.',
        }
    }

    // 3. Fetch organization details for welcome email
    const { data: orgData } = await (supabaseAdmin
        .from('organizations') as any)
        .select('name, slug')
        .eq('id', organization_id)
        .single()

    const orgInfo = orgData as { name: string; slug: string } | null

    // 4. Send welcome email (async - don't block the redirect)
    if (orgInfo) {
        sendWelcomeEmail(
            email,
            full_name,
            orgInfo.name,
            orgInfo.slug
        ).then(result => {
            logNotificationResult('Welcome Email', result)
        }).catch(err => {
            errorLog('email.exception', err, {
                label: 'Welcome Email',
                recipient: email,
            })
        })
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}

export async function getUserById(id: string) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function updateUser(prevState: any, formData: FormData) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) return { error: 'Unauthorized' }

    const id = formData.get('id') as string
    const full_name = formData.get('full_name') as string
    const role = formData.get('role') as string // 'super_admin' or 'user'
    const job_role = formData.get('job_role') as string // Contextual Job Role
    const organization_id = formData.get('organization_id') as string
    const ai_context = formData.get('ai_context') as string // Additional AI personalization context

    const supabase = await createClient()

    // Update public.users
    const { error } = await (supabase
        .from('users') as any)
        .update({
            full_name,
            role,
            job_role,
            organization_id,
            ai_context
        })
        .eq('id', id)

    if (error) return { error: error.message }

    try {
        await writeAdminAuditEvent({
            action: 'user.updated',
            targetType: 'user',
            targetId: id,
            targetLabel: full_name,
            metadata: {
                organization_id,
                role,
            },
        })
    } catch (auditError) {
        return {
            error: auditError instanceof Error
                ? auditError.message
                : 'User updated but audit logging failed.',
        }
    }

    // Ideally we also update auth.users metadata for sync, but for now public table is the source of truth for app logic.
    // Syncing back to auth metadata is good practice but not strictly required if we read from public.users.

    revalidatePath('/admin/users')
    return { success: 'User updated successfully' }
}

// INVITES
export async function createInvitation(prevState: any, formData: FormData) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) {
        return { error: 'Unauthorized' }
    }

    // Get current user for rate limiting
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Rate limiting
    const rateLimitResult = rateLimitAction('createInvitation', user?.id)
    if (rateLimitResult) {
        return { error: rateLimitResult.error }
    }

    const email = formData.get('email') as string
    const orgId = formData.get('organization_id') as string
    const role = formData.get('role') as string || 'user'

    // Validate input with Zod
    const validation = validateInput(InvitationSchema, {
        email,
        organization_id: orgId,
        role
    })

    if (!validation.success) {
        return { error: validation.error }
    }

    // Generate a simple token (could be more robust)
    const token = crypto.randomUUID()

    const { data: invitation, error } = await (supabase.from('invitations') as any).insert({
        email,
        organization_id: orgId,
        token,
        role: role,
        status: 'pending'
    })
        .select('id')
        .single()

    if (error) {
        errorLog('admin.invitation_create_failed', error, {
            organizationId: orgId,
            role,
        })
        return { error: error.message }
    }

    const createdInvitation = invitation as { id: string } | null

    try {
        await writeAdminAuditEvent({
            action: 'invitation.created',
            targetType: 'invitation',
            targetId: createdInvitation?.id ?? null,
            targetLabel: email,
            metadata: {
                organization_id: orgId,
                role,
            },
        })
    } catch (auditError) {
        return {
            error: auditError instanceof Error
                ? auditError.message
                : 'Invitation created but audit logging failed.',
        }
    }

    revalidatePath('/admin/invites')
    return { success: true, message: `Invitation created. Link: /join?token=${token}` }
}

// -----------------------------------------------------------------------------
// IDEAS & ANALYTICS
// -----------------------------------------------------------------------------
export async function getOrganizationIdeas(organizationId: string) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    // 1. Fetch Top Ideas (Leaderboard)
    const { data: topIdeas, error: topError } = await supabase
        .from('ideas')
        .select('*, users(full_name)')
        .eq('organization_id', organizationId)
        .order('ai_score', { ascending: false })
        .limit(10)

    // 2. Fetch Recent Ideas (including attachment fields)
    const { data: recentIdeas, error: recentError } = await supabase
        .from('ideas')
        .select('*, users(full_name)')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10)

    if (topError) throw topError
    if (recentError) throw recentError

    return {
        topIdeas: topIdeas || [],
        recentIdeas: recentIdeas || []
    }
}

/**
 * Generate a signed URL for downloading an attachment from Supabase Storage.
 * The URL is valid for 1 hour.
 */
export async function getAttachmentDownloadUrl(attachmentPath: string): Promise<{ url?: string; error?: string }> {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) return { error: 'Unauthorized' }

    if (!attachmentPath) {
        return { error: 'No attachment path provided' }
    }

    const supabaseAdmin = await createAdminClient()

    // Generate a signed URL that expires in 1 hour (3600 seconds)
    const { data, error } = await supabaseAdmin
        .storage
        .from('idea-attachments')
        .createSignedUrl(attachmentPath, 3600)

    if (error) {
        errorLog('admin.attachment_signed_url_failed', error, { attachmentPath })
        return { error: error.message }
    }

    return { url: data.signedUrl }
}

// -----------------------------------------------------------------------------
// TRAINING VIDEOS
// -----------------------------------------------------------------------------
export async function getTrainingVideos() {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const supabaseAdmin = await createAdminClient()
    const { data, error } = await (supabaseAdmin
        .from('training_videos') as any)
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function createTrainingVideo(formData: FormData) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const title = formData.get('title') as string
    const url = formData.get('url') as string

    const validation = validateInput(TrainingVideoCreateSchema, { title, url })
    if (!validation.success) {
        throw new Error(validation.error)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const supabaseAdmin = await createAdminClient()

    const normalized = normalizeTrainingVideo(validation.data)

    const { data: createdTrainingVideo, error } = await (supabaseAdmin
        .from('training_videos') as any)
        .insert({
            ...normalized,
            created_by: user?.id ?? null,
        })
        .select('id, title')
        .single()

    if (error) {
        throw new Error(error.message)
    }

    const trainingVideo = createdTrainingVideo as { id: string; title: string } | null

    await writeAdminAuditEvent({
        action: 'training_video.created',
        targetType: 'training_video',
        targetId: trainingVideo?.id ?? null,
        targetLabel: trainingVideo?.title ?? title,
        metadata: {
            youtube_video_id: normalized.youtube_video_id,
        },
    })

    revalidatePath('/admin/training')
    revalidatePath('/', 'layout')
}

export async function deleteTrainingVideo(formData: FormData) {
    const isSuperAdmin = await verifyAdmin()
    if (!isSuperAdmin) throw new Error('Unauthorized')

    const id = formData.get('id') as string
    const validation = validateInput(TrainingVideoDeleteSchema, { id })

    if (!validation.success) {
        throw new Error(validation.error)
    }

    const supabaseAdmin = await createAdminClient()
    const { data: existingVideo } = await (supabaseAdmin
        .from('training_videos') as any)
        .select('id, title')
        .eq('id', validation.data.id)
        .single()

    const { error } = await (supabaseAdmin
        .from('training_videos') as any)
        .delete()
        .eq('id', validation.data.id)

    if (error) {
        throw new Error(error.message)
    }

    const trainingVideo = existingVideo as { id: string; title: string } | null

    await writeAdminAuditEvent({
        action: 'training_video.deleted',
        targetType: 'training_video',
        targetId: validation.data.id,
        targetLabel: trainingVideo?.title ?? null,
    })

    revalidatePath('/admin/training')
    revalidatePath('/', 'layout')
}

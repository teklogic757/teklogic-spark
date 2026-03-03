'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { writeAdminAuditEvent } from '@/lib/audit-log'
import { errorLog } from '@/lib/server-log'

const CreateCodeSchema = z.object({
    name: z.string().min(1, "Name is required"),
})

type WorkshopActionState = {
    error?: string
    success?: boolean
    message?: string
}

type WorkshopAdminProfile = {
    role: string
    organization_id: string
}

async function getWorkshopAdminContext() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' as const }
    }

    const { data: userProfileData } = await supabase
        .from('users')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()

    const userProfile = userProfileData as WorkshopAdminProfile | null

    if (!userProfile || !['super_admin', 'admin'].includes(userProfile.role)) {
        return { error: 'Unauthorized' as const }
    }

    return {
        supabase,
        user,
        userProfile,
    }
}

export async function generateWorkshopCode(prevState: WorkshopActionState | null, formData: FormData) {
    const name = formData.get('name') as string

    const validation = CreateCodeSchema.safeParse({ name })
    if (!validation.success) {
        return { error: validation.error.flatten().fieldErrors.name?.[0] || 'Invalid input' }
    }

    const context = await getWorkshopAdminContext()
    if ('error' in context) {
        return { error: context.error }
    }

    const { supabase, userProfile } = context

    // Generate unique 6-char code (alphanumeric uppercase)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data: workshopCodeRecord, error } = await (supabase.from('workshop_access_codes') as any).insert({
        organization_id: userProfile.organization_id,
        name,
        code,
        is_active: true,
        auto_create_user_role: 'workshop_attendee'
    })
        .select('id, code')
        .single()

    if (error) {
        errorLog('admin.workshop_code_create_failed', error, {
            organizationId: userProfile.organization_id,
        })
        return { error: 'Failed to create code' }
    }

    const createdWorkshopCode = workshopCodeRecord as { id: string; code: string } | null

    try {
        await writeAdminAuditEvent({
            action: 'workshop_access_code.created',
            targetType: 'workshop_access_code',
            targetId: createdWorkshopCode?.id ?? null,
            targetLabel: name,
            metadata: {
                code: createdWorkshopCode?.code ?? code,
                organization_id: userProfile.organization_id,
            },
        })
    } catch (auditError) {
        return {
            error: auditError instanceof Error
                ? auditError.message
                : 'Workshop code created but audit logging failed.',
        }
    }

    revalidatePath('/admin/workshops')
    return { success: true, message: 'Workshop code created!' }
}

export async function toggleCodeStatus(codeId: string, isActive: boolean) {
    const context = await getWorkshopAdminContext()
    if ('error' in context) {
        return { error: context.error }
    }

    const { supabase, userProfile } = context

    const { error } = await (supabase
        .from('workshop_access_codes') as any)
        .update({ is_active: isActive })
        .eq('id', codeId)

    if (error) return { error: 'Failed to update status' }

    try {
        await writeAdminAuditEvent({
            action: 'workshop_access_code.status_updated',
            targetType: 'workshop_access_code',
            targetId: codeId,
            metadata: {
                is_active: isActive,
                organization_id: userProfile.organization_id,
            },
        })
    } catch (auditError) {
        return {
            error: auditError instanceof Error
                ? auditError.message
                : 'Workshop code updated but audit logging failed.',
        }
    }

    revalidatePath('/admin/workshops')
    return { success: true }
}

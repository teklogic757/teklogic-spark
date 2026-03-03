import 'server-only'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import type { Database, Json } from '@/lib/types/database.types'
import { errorLog } from '@/lib/server-log'

type AuditMetadataValue = boolean | number | string | null

export type AdminAuditEventInput = {
    action: string
    targetType: string
    targetId?: string | null
    targetLabel?: string | null
    metadata?: Record<string, AuditMetadataValue | undefined>
    actorUserId?: string | null
    actorEmail?: string | null
}

type AdminAuditInsert = Database['public']['Tables']['admin_audit_events']['Insert']
type AdminAuditInsertResult = {
    error: Error | { message: string } | null
}
type AdminAuditEventsTable = {
    insert: (values: AdminAuditInsert) => Promise<AdminAuditInsertResult>
}

function sanitizeAuditMetadata(metadata?: AdminAuditEventInput['metadata']): Json | null {
    if (!metadata) {
        return null
    }

    const sanitizedEntries = Object.entries(metadata)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => {
            if (typeof value === 'string' && value.length > 160) {
                return [key, `${value.slice(0, 160)}...`] as const
            }

            return [key, value ?? null] as const
        })

    if (sanitizedEntries.length === 0) {
        return null
    }

    return Object.fromEntries(sanitizedEntries)
}

async function resolveActor(input: AdminAuditEventInput) {
    if (input.actorUserId || input.actorEmail) {
        return {
            actorUserId: input.actorUserId ?? null,
            actorEmail: input.actorEmail ?? null,
        }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return {
        actorUserId: user?.id ?? null,
        actorEmail: user?.email ?? null,
    }
}

export async function writeAdminAuditEvent(input: AdminAuditEventInput) {
    const actor = await resolveActor(input)
    const payload: AdminAuditInsert = {
        actor_user_id: actor.actorUserId,
        actor_email: actor.actorEmail,
        action: input.action,
        target_type: input.targetType,
        target_id: input.targetId ?? null,
        target_label: input.targetLabel ?? null,
        metadata: sanitizeAuditMetadata(input.metadata),
    }

    const supabaseAdmin = await createAdminClient()
    const auditEventsTable = supabaseAdmin.from('admin_audit_events') as unknown as AdminAuditEventsTable
    const { error } = await auditEventsTable.insert(payload)

    if (error) {
        errorLog('admin_audit.write_failed', error, {
            action: input.action,
            targetType: input.targetType,
            targetId: input.targetId ?? null,
        })

        throw new Error('Failed to record admin audit event.')
    }
}

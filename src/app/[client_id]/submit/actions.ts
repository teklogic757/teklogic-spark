'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { evaluateIdea, generateEvaluationEmail, type IdeaSubmission, type OrganizationContext } from '@/lib/ai-evaluator'
import { sendAdminNotification, sendEvaluationEmail, type EmailResult } from '@/lib/email'
import { rateLimitAction } from '@/lib/rate-limiter'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { errorLog, warnLog } from '@/lib/server-log'
import { IdeaSubmissionSchema, validateFileUpload, validateInput } from '@/lib/validators'

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

async function getOrganizationAdminRecipients(supabaseAdmin: any, organizationId: string): Promise<string[]> {
    const { data, error } = await (supabaseAdmin
        .from('users') as any)
        .select('email')
        .eq('organization_id', organizationId)
        .eq('role', 'super_admin')

    if (error) {
        errorLog('submit.admin_recipients_load_failed', error, { organizationId })
        return []
    }

    const recipients = ((data as Array<{ email?: string | null }> | null) || [])
        .map(item => item.email?.trim())
        .filter((email): email is string => Boolean(email))

    return [...new Set(recipients)]
}

async function incrementUserPointsWithFallback(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    currentTotalPoints: number,
    canonicalScore: number
) {
    const { error: pointsError } = await (supabase.rpc as any)('increment_user_points', {
        user_id: userId,
        points_to_add: canonicalScore,
    })

    if (!pointsError) {
        return
    }

    warnLog('submit.points_increment_failed', {
        error: pointsError,
        userId,
        points: canonicalScore,
    })

    const { error: directUpdateError } = await (supabase
        .from('users') as any)
        .update({ total_points: currentTotalPoints + canonicalScore })
        .eq('id', userId)

    if (directUpdateError) {
        warnLog('submit.points_fallback_failed', {
            error: directUpdateError,
            userId,
            points: canonicalScore,
        })
    }
}

export async function submitIdea(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    const workshopOrgId = (await cookies()).get('teklogic_workshop_org')?.value
    const isWorkshopSubmission = !user && !!workshopOrgId

    if ((authError || !user) && !isWorkshopSubmission) {
        return { error: 'You must be logged in to submit an idea.' }
    }

    if (user) {
        const rateLimitResult = rateLimitAction('submitIdea', user.id)
        if (rateLimitResult) {
            return { error: rateLimitResult.error }
        }
    }

    const title = formData.get('title') as string
    const department = formData.get('department') as string
    const problemStatement = formData.get('problem_statement') as string
    const proposedSolution = formData.get('proposed_solution') as string
    const description = (formData.get('description') as string) || ''
    const clientId = formData.get('client_id') as string
    const attachment = formData.get('attachment') as File | null
    const attachmentDescription = (formData.get('attachment_description') as string) || null

    const guestName = (formData.get('guest_name') as string) || null
    const guestEmail = (formData.get('guest_email') as string) || null

    const validation = validateInput(IdeaSubmissionSchema, {
        title,
        department,
        problem_statement: problemStatement,
        proposed_solution: proposedSolution,
        description: description || null,
        client_id: clientId,
    })

    if (!validation.success) {
        return { error: validation.error }
    }

    if (attachment && attachment.size > 0) {
        const fileValidation = validateFileUpload(attachment)
        if (!fileValidation.valid) {
            return { error: fileValidation.error }
        }
    }

    let orgIdToUse = ''
    let submitterName = 'Guest'
    let submitterRole = 'Workshop Participant'
    let submitterAiContext = ''
    let userProfile: {
        organization_id: string
        full_name: string | null
        job_role: string | null
        ai_context: string | null
        total_points: number
    } | null = null

    if (user) {
        const { data: userProfileData } = await supabase
            .from('users')
            .select('organization_id, full_name, job_role, ai_context, total_points')
            .eq('id', user.id)
            .single()

        userProfile = userProfileData as {
            organization_id: string
            full_name: string | null
            job_role: string | null
            ai_context: string | null
            total_points: number
        } | null

        if (!userProfile?.organization_id) {
            return { error: 'User organization not found.' }
        }

        orgIdToUse = userProfile.organization_id
        submitterName = userProfile.full_name || 'Unknown'
        submitterRole = userProfile.job_role || 'Employee'
        submitterAiContext = userProfile.ai_context || ''
    } else if (isWorkshopSubmission) {
        orgIdToUse = workshopOrgId!
        submitterName = 'Workshop Guest'
    }

    if (user?.is_anonymous) {
        const workshopCookie = (await cookies()).get('teklogic_workshop_org')?.value
        if (!workshopCookie) {
            return { error: 'Workshop session expired.' }
        }
        orgIdToUse = workshopCookie
    }

    const supabaseAdmin = await createAdminClient()
    const { data: organization, error: orgError } = await supabaseAdmin
        .from('organizations')
        .select('id, slug, name, industry, brand_voice, marketing_strategy, annual_it_budget, estimated_revenue, employee_count')
        .eq('id', orgIdToUse)
        .single()

    const org = organization as {
        id: string
        slug: string
        name: string
        industry: string | null
        brand_voice: string | null
        marketing_strategy: string | null
        annual_it_budget: string | null
        estimated_revenue: string | null
        employee_count: string | null
    } | null

    if (orgError || !org) {
        errorLog('submit.organization_load_failed', orgError || 'Organization missing', {
            clientId,
            organizationId: orgIdToUse,
        })
        return { error: 'Organization not found.' }
    }

    const userInfo = userProfile ? {
        full_name: userProfile.full_name,
        job_role: userProfile.job_role,
        ai_context: userProfile.ai_context,
    } : {
        full_name: guestName || submitterName,
        job_role: submitterRole,
        ai_context: submitterAiContext,
        email: guestEmail || user?.email || undefined,
    }

    let aiScore = 0
    let aiReframedText = ''
    let aiAnalysisJson: any = null
    let evaluationSummary = ''
    let emailHtml = ''

    try {
        const orgContext: OrganizationContext = {
            name: org.name,
            industry: org.industry,
            brand_voice: org.brand_voice,
            marketing_strategy: org.marketing_strategy,
            annual_it_budget: org.annual_it_budget,
            estimated_revenue: org.estimated_revenue,
            employee_count: org.employee_count,
        }

        const ideaSubmission: IdeaSubmission = {
            title,
            description: `**Department:** ${department}\n\n**Problem:** ${problemStatement}\n\n**Proposed Solution:** ${proposedSolution}${description ? `\n\n**Additional Context:** ${description}` : ''}`,
            submitter_name: userInfo?.full_name,
            submitter_role: userInfo?.job_role,
            submitter_ai_context: userInfo?.ai_context,
            department,
            problem_statement: problemStatement,
            proposed_solution: proposedSolution,
        }

        const evaluation = await evaluateIdea(ideaSubmission, orgContext)

        aiScore = evaluation.overall_score
        aiReframedText = `${evaluation.reframed_idea.title}\n\n${evaluation.reframed_idea.description}`
        evaluationSummary = evaluation.evaluation_summary
        aiAnalysisJson = {
            criteria_scores: evaluation.criteria_scores,
            related_suggestions: evaluation.related_suggestions,
            key_benefits: evaluation.reframed_idea.key_benefits,
            score_details: evaluation.canonical_score_details ?? null,
            model_overall_score: evaluation.model_overall_score ?? null,
            evaluated_at: new Date().toISOString(),
        }

        emailHtml = generateEvaluationEmail(ideaSubmission, evaluation, userInfo?.full_name || 'there')
    } catch (err) {
        warnLog('submit.ai_evaluation_failed', {
            error: err,
            organizationId: org.id,
        })
        aiScore = 0
        aiReframedText = ''
        evaluationSummary = 'AI Evaluation unavailable at this time. Your idea has been saved and will be reviewed manually.'
    }

    let attachmentPath = null
    let attachmentBuffer: Buffer | null = null
    let attachmentFilename: string | null = null
    let attachmentContentType: string | null = null

    if (attachment && attachment.size > 0) {
        const arrayBuffer = await attachment.arrayBuffer()
        attachmentBuffer = Buffer.from(arrayBuffer)
        attachmentFilename = attachment.name
        attachmentContentType = attachment.type

        const bucketName = 'idea-attachments'
        const { data: buckets } = await supabaseAdmin.storage.listBuckets()
        const bucketExists = buckets?.find((bucket: any) => bucket.name === bucketName)

        if (!bucketExists) {
            await supabaseAdmin.storage.createBucket(bucketName, { public: false })
        }

        const fileName = `${org.id}/${Date.now()}_${attachment.name}`
        const { error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, attachmentBuffer, {
                contentType: attachment.type,
                upsert: false,
            })

        if (uploadError) {
            errorLog('submit.attachment_upload_failed', uploadError, { organizationId: org.id })
            return { error: 'Failed to upload attachment.' }
        }

        attachmentPath = fileName
    }

    const fullDescription = `**Department:** ${department}\n\n**Problem:** ${problemStatement}\n\n**Proposed Solution:** ${proposedSolution}${description ? `\n\n**Additional Context:** ${description}` : ''}`

    const { error } = await supabaseAdmin.from('ideas').insert({
        organization_id: org.id,
        user_id: user?.id || null,
        submitter_name: guestName || submitterName,
        submitter_role: submitterRole,
        submitter_email: guestEmail,
        title,
        description: fullDescription,
        department,
        problem_statement: problemStatement,
        proposed_solution: proposedSolution,
        status: (aiAnalysisJson ? 'processed' : 'new') as 'new' | 'processed',
        ai_score: aiScore,
        ai_reframed_text: aiReframedText || null,
        ai_feedback: evaluationSummary || null,
        ai_analysis_json: aiAnalysisJson as any,
        attachment_path: attachmentPath,
        attachment_description: attachmentDescription,
    } as any)

    if (error) {
        errorLog('submit.idea_insert_failed', error, { organizationId: org.id })
        return { error: 'Failed to submit idea. Please try again.' }
    }

    if (aiScore > 0 && user && userProfile) {
        await incrementUserPointsWithFallback(
            supabase,
            user.id,
            userProfile.total_points || 0,
            aiScore
        )
    }

    const evaluationRecipient = guestEmail || user?.email || null
    if (emailHtml && aiScore > 0 && evaluationRecipient) {
        sendEvaluationEmail(
            evaluationRecipient,
            userInfo?.full_name || 'Guest',
            title,
            aiScore,
            emailHtml
        ).then(result => {
            logNotificationResult(`Evaluation Email: ${title}`, result)
        }).catch(err => {
            errorLog('email.exception', err, {
                label: `Evaluation Email: ${title}`,
            })
        })
    } else if (emailHtml && aiScore > 0) {
        warnLog('email.skipped', {
            label: `Evaluation Email: ${title}`,
            reason: 'No submitter email available',
        })
    }

    const adminRecipients = await getOrganizationAdminRecipients(supabaseAdmin, org.id)
    const submitterEmailLabel = guestEmail || user?.email || 'No email provided'

    sendAdminNotification(
        title,
        userInfo?.full_name || 'Guest User',
        submitterEmailLabel,
        org.name,
        department,
        problemStatement,
        proposedSolution,
        aiScore,
        attachmentDescription,
        attachmentBuffer && attachmentFilename && attachmentContentType
            ? { filename: attachmentFilename, content: attachmentBuffer, contentType: attachmentContentType }
            : null,
        adminRecipients.length > 0 ? adminRecipients : undefined
    ).then(result => {
        logNotificationResult(`Admin Notification: ${title}`, result)
    }).catch(err => {
        errorLog('email.exception', err, {
            label: `Admin Notification: ${title}`,
        })
    })

    revalidatePath(`/${org.slug}/dashboard`)
    redirect(`/${org.slug}/dashboard`)
}

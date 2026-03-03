'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { evaluateIdea, generateEvaluationEmail, type IdeaSubmission, type OrganizationContext } from '@/lib/ai-evaluator'
import { sendAdminNotification, sendEvaluationEmail, type EmailResult } from '@/lib/email'
import { rateLimitAction } from '@/lib/rate-limiter'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { errorLog, warnLog } from '@/lib/server-log'
import { IdeaSubmissionSchema, validateInput } from '@/lib/validators'

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
        errorLog('submit.mobile_admin_recipients_load_failed', error, { organizationId })
        return []
    }

    const recipients = ((data as Array<{ email?: string | null }> | null) || [])
        .map(item => item.email?.trim())
        .filter((email): email is string => Boolean(email))

    return [...new Set(recipients)]
}

export async function submitIdeaMobile(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'You must be logged in to submit an idea.' }
    }

    const rateLimitResult = rateLimitAction('submitIdea', user.id)
    if (rateLimitResult) {
        return { error: rateLimitResult.error }
    }

    const title = formData.get('title') as string
    const department = formData.get('department') as string
    const problemStatement = formData.get('problem_statement') as string
    const proposedSolution = formData.get('proposed_solution') as string
    const clientId = formData.get('client_id') as string

    const validation = validateInput(IdeaSubmissionSchema, {
        title,
        department,
        problem_statement: problemStatement,
        proposed_solution: proposedSolution,
        description: null,
        client_id: clientId,
    })

    if (!validation.success) {
        return { error: validation.error }
    }

    const { data: userProfileData } = await supabase
        .from('users')
        .select('organization_id, full_name, job_role, ai_context, total_points')
        .eq('id', user.id)
        .single()

    const userProfile = userProfileData as {
        organization_id: string
        full_name: string | null
        job_role: string | null
        ai_context: string | null
        total_points: number
    } | null

    if (!userProfile?.organization_id) {
        return { error: 'User organization not found.' }
    }

    const supabaseAdmin = await createAdminClient()
    const { data: organization, error: orgError } = await supabaseAdmin
        .from('organizations')
        .select('id, slug, name, industry, brand_voice, marketing_strategy, annual_it_budget, estimated_revenue, employee_count')
        .eq('id', userProfile.organization_id)
        .single()

    if (orgError || !organization) {
        errorLog('submit.mobile_organization_load_failed', orgError || 'Organization missing', {
            organizationId: userProfile.organization_id,
        })
        return { error: 'Organization not found.' }
    }

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
    }

    const userInfo = userProfile as {
        full_name: string | null
        job_role: string | null
        ai_context: string | null
        total_points: number
    } | null

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
            description: `**Department:** ${department}\n\n**Problem:** ${problemStatement}\n\n**Proposed Solution:** ${proposedSolution}`,
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
            evaluated_at: new Date().toISOString(),
        }

        emailHtml = generateEvaluationEmail(ideaSubmission, evaluation, userInfo?.full_name || 'there')
    } catch (err) {
        warnLog('submit.mobile_ai_evaluation_failed', {
            error: err,
            organizationId: org.id,
        })
        aiScore = 0
        aiReframedText = ''
        evaluationSummary = 'Your idea has been saved and will be reviewed.'
    }

    const fullDescription = `**Department:** ${department}\n\n**Problem:** ${problemStatement}\n\n**Proposed Solution:** ${proposedSolution}`

    const { error } = await supabase.from('ideas').insert({
        organization_id: org.id,
        user_id: user.id,
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
    } as any)

    if (error) {
        errorLog('submit.mobile_idea_insert_failed', error, { organizationId: org.id })
        return { error: 'Failed to submit idea. Please try again.' }
    }

    if (aiScore > 0 && userInfo) {
        const { error: pointsError } = await (supabase.rpc as any)('increment_user_points', {
            user_id: user.id,
            points_to_add: aiScore,
        })

        if (pointsError) {
            warnLog('submit.mobile_points_increment_failed', {
                error: pointsError,
                userId: user.id,
                points: aiScore,
            })
            await (supabase
                .from('users') as any)
                .update({ total_points: userInfo.total_points + aiScore })
                .eq('id', user.id)
        }
    }

    if (emailHtml && aiScore > 0 && user.email) {
        sendEvaluationEmail(
            user.email,
            userInfo?.full_name || 'there',
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

    sendAdminNotification(
        title,
        userInfo?.full_name || 'Unknown User',
        user.email || 'No email provided',
        org.name,
        department,
        problemStatement,
        proposedSolution,
        aiScore,
        null,
        null,
        adminRecipients.length > 0 ? adminRecipients : undefined
    ).then(result => {
        logNotificationResult(`Admin Notification: ${title}`, result)
    }).catch(err => {
        errorLog('email.exception', err, {
            label: `Admin Notification: ${title}`,
        })
    })

    revalidatePath(`/${org.slug}/dashboard`)
    redirect(`/${org.slug}/m/submit/success`)
}

import 'server-only'

import { cookies } from 'next/headers'

import {
    evaluateIdea,
    generateEvaluationEmail,
    type EvaluationResult,
    type IdeaSubmission,
    type OrganizationContext,
} from '@/lib/ai-evaluator'
import {
    sendCombinedIdeaReviewEmail,
    summarizeEmailResult,
    type EmailResult,
} from '@/lib/email'
import { findRelevantRedditLinks } from '@/lib/reddit-links'
import {
    buildScopedRateLimitIdentifier,
    getClientIpRateLimitIdentifier,
    rateLimitAction,
} from '@/lib/rate-limiter'
import { errorLog, warnLog } from '@/lib/server-log'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { IdeaSubmissionSchema, validateFileUpload, validateInput } from '@/lib/validators'

type SubmitRoute = 'desktop' | 'mobile'
type SubmitUserClient = Awaited<ReturnType<typeof createClient>>
type SubmitAdminClient = Awaited<ReturnType<typeof createAdminClient>>

type AuthenticatedUser = {
    id: string
    email?: string | null
    is_anonymous?: boolean
}

type SubmitUserProfile = {
    organization_id: string
    full_name: string | null
    job_role: string | null
    ai_context: string | null
    total_points: number
}

type SubmitOrganization = {
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

type NormalizedSubmitInput = {
    title: string
    department: string
    problemStatement: string
    proposedSolution: string
    description: string | null
    clientId: string
    attachment: File | null
    attachmentDescription: string | null
    guestName: string | null
    guestEmail: string | null
}

type SubmitterContext = {
    kind: 'authenticated' | 'workshop_guest'
    user: AuthenticatedUser | null
    profile: SubmitUserProfile | null
    organizationId: string
    rateLimitIdentifier: string | null
    name: string
    role: string
    aiContext: string
    email: string | null
}

type SubmissionEvaluation = {
    aiScore: number
    aiReframedText: string | null
    aiAnalysisJson: Record<string, unknown> | null
    evaluationSummary: string
    emailSubject: string | null
    ideaSubmission: IdeaSubmission
    fullEvaluation: EvaluationResult | null
}

type PreparedSubmit = {
    route: SubmitRoute
    supabase: SubmitUserClient
    supabaseAdmin: SubmitAdminClient
    input: NormalizedSubmitInput
    submitter: SubmitterContext
    organization: SubmitOrganization
    fullDescription: string
    evaluation: SubmissionEvaluation
}

type PersistedSubmit = {
    aiScore: number
    attachmentBuffer: Buffer | null
    attachmentFilename: string | null
    attachmentContentType: string | null
}

type PostPersistStatus = 'delivered' | 'skipped' | 'failed'

export type PostPersistOutcome = {
    label: string
    status: PostPersistStatus
    detail: string
}

type SubmitSuccessResult = {
    ok: true
    organizationSlug: string
    postPersistOutcomes: PostPersistOutcome[]
}

type SubmitErrorResult = {
    ok: false
    error: string
}

export type SubmitFlowResult = SubmitSuccessResult | SubmitErrorResult

const isSubmitError = (value: unknown): value is SubmitErrorResult => {
    return typeof value === 'object'
        && value !== null
        && 'ok' in value
        && (value as { ok?: boolean }).ok === false
}

const readString = (formData: FormData, key: string): string => {
    const value = formData.get(key)
    return typeof value === 'string' ? value : ''
}

const readOptionalString = (formData: FormData, key: string): string | null => {
    const value = formData.get(key)
    if (typeof value !== 'string') {
        return null
    }

    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
}

const readAttachment = (formData: FormData): File | null => {
    const value = formData.get('attachment')
    return value instanceof File && value.size > 0 ? value : null
}

const buildIdeaDescription = (input: Pick<NormalizedSubmitInput, 'department' | 'problemStatement' | 'proposedSolution' | 'description'>): string => {
    return `**Department:** ${input.department}\n\n**Problem:** ${input.problemStatement}\n\n**Proposed Solution:** ${input.proposedSolution}${input.description ? `\n\n**Additional Context:** ${input.description}` : ''}`
}

const normalizeSubmitInput = (formData: FormData, route: SubmitRoute): NormalizedSubmitInput | SubmitErrorResult => {
    const normalizedInput: NormalizedSubmitInput = {
        title: readString(formData, 'title'),
        department: readString(formData, 'department'),
        problemStatement: readString(formData, 'problem_statement'),
        proposedSolution: readString(formData, 'proposed_solution'),
        description: route === 'desktop' ? readOptionalString(formData, 'description') : null,
        clientId: readString(formData, 'client_id'),
        attachment: route === 'desktop' ? readAttachment(formData) : null,
        attachmentDescription: route === 'desktop' ? readOptionalString(formData, 'attachment_description') : null,
        guestName: route === 'desktop' ? readOptionalString(formData, 'guest_name') : null,
        guestEmail: route === 'desktop' ? readOptionalString(formData, 'guest_email') : null,
    }

    const validation = validateInput(IdeaSubmissionSchema, {
        title: normalizedInput.title,
        department: normalizedInput.department,
        problem_statement: normalizedInput.problemStatement,
        proposed_solution: normalizedInput.proposedSolution,
        description: normalizedInput.description,
        client_id: normalizedInput.clientId,
    })

    if (!validation.success) {
        return { ok: false, error: validation.error }
    }

    if (normalizedInput.attachment) {
        const fileValidation = validateFileUpload(normalizedInput.attachment)
        if (!fileValidation.valid) {
            return { ok: false, error: fileValidation.error || 'Invalid attachment.' }
        }
    }

    return normalizedInput
}

const loadAuthenticatedProfile = async (supabase: SubmitUserClient, userId: string): Promise<SubmitUserProfile | null> => {
    const { data } = await supabase
        .from('users')
        .select('organization_id, full_name, job_role, ai_context, total_points')
        .eq('id', userId)
        .single()

    return (data as SubmitUserProfile | null) ?? null
}

const resolveSubmitter = async (
    supabase: SubmitUserClient,
    route: SubmitRoute,
    input: NormalizedSubmitInput
): Promise<SubmitterContext | SubmitErrorResult> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const authenticatedUser = user as AuthenticatedUser | null
    const workshopOrgId = route === 'desktop' ? (await cookies()).get('teklogic_workshop_org')?.value ?? null : null
    const isWorkshopGuest = route === 'desktop' && (!authenticatedUser || authenticatedUser.is_anonymous === true) && !!workshopOrgId

    if (route === 'mobile' && (authError || !authenticatedUser)) {
        return { ok: false, error: 'You must be logged in to submit an idea.' }
    }

    if (!authenticatedUser && !isWorkshopGuest) {
        return { ok: false, error: 'You must be logged in to submit an idea.' }
    }

    if (authenticatedUser && !isWorkshopGuest) {
        const rateLimitResult = await rateLimitAction('submitIdea', `user:${authenticatedUser.id}`)
        if (rateLimitResult) {
            return { ok: false, error: rateLimitResult.error }
        }

        const profile = await loadAuthenticatedProfile(supabase, authenticatedUser.id)
        if (!profile?.organization_id) {
            return { ok: false, error: 'User organization not found.' }
        }

        return {
            kind: 'authenticated',
            user: authenticatedUser,
            profile,
            organizationId: profile.organization_id,
            rateLimitIdentifier: `user:${authenticatedUser.id}`,
            name: profile.full_name || 'Unknown',
            role: profile.job_role || 'Employee',
            aiContext: profile.ai_context || '',
            email: authenticatedUser.email?.trim() || null,
        }
    }

    if (!workshopOrgId) {
        return { ok: false, error: 'Workshop session expired.' }
    }

    const clientIp = await getClientIpRateLimitIdentifier()
    const guestRateLimitIdentifier = buildScopedRateLimitIdentifier(
        `workshop:${workshopOrgId}`,
        clientIp
    )
    const guestRateLimitResult = await rateLimitAction('submitIdeaGuest', guestRateLimitIdentifier)
    if (guestRateLimitResult) {
        return { ok: false, error: guestRateLimitResult.error }
    }

    return {
        kind: 'workshop_guest',
        user: null,
        profile: null,
        organizationId: workshopOrgId,
        rateLimitIdentifier: guestRateLimitIdentifier,
        name: input.guestName || 'Workshop Guest',
        role: 'Workshop Participant',
        aiContext: '',
        email: input.guestEmail,
    }
}

const loadOrganization = async (
    supabaseAdmin: SubmitAdminClient,
    organizationId: string,
    route: SubmitRoute,
    clientId: string
): Promise<SubmitOrganization | SubmitErrorResult> => {
    const { data, error } = await supabaseAdmin
        .from('organizations')
        .select('id, slug, name, industry, brand_voice, marketing_strategy, annual_it_budget, estimated_revenue, employee_count')
        .eq('id', organizationId)
        .single()

    if (error || !data) {
        errorLog(
            route === 'mobile' ? 'submit.mobile_organization_load_failed' : 'submit.organization_load_failed',
            error || 'Organization missing',
            {
                clientId,
                organizationId,
            }
        )

        return { ok: false, error: 'Organization not found.' }
    }

    return data as SubmitOrganization
}

const evaluateSubmission = async (
    route: SubmitRoute,
    input: NormalizedSubmitInput,
    submitter: SubmitterContext,
    organization: SubmitOrganization
): Promise<SubmissionEvaluation> => {
    const ideaSubmission: IdeaSubmission = {
        title: input.title,
        description: buildIdeaDescription(input),
        submitter_name: submitter.name,
        submitter_role: submitter.role,
        submitter_ai_context: submitter.aiContext,
        department: input.department,
        problem_statement: input.problemStatement,
        proposed_solution: input.proposedSolution,
    }

    const orgContext: OrganizationContext = {
        name: organization.name,
        industry: organization.industry,
        brand_voice: organization.brand_voice,
        marketing_strategy: organization.marketing_strategy,
        annual_it_budget: organization.annual_it_budget,
        estimated_revenue: organization.estimated_revenue,
        employee_count: organization.employee_count,
    }

    try {
        const evaluation = await evaluateIdea(ideaSubmission, orgContext)

        return {
            aiScore: evaluation.overall_score,
            aiReframedText: `${evaluation.reframed_idea.title}\n\n${evaluation.reframed_idea.description}`,
            evaluationSummary: evaluation.evaluation_summary,
            aiAnalysisJson: {
                criteria_scores: evaluation.criteria_scores,
                related_suggestions: evaluation.related_suggestions,
                coaching_feedback: evaluation.coaching_feedback,
                improvement_checklist: evaluation.improvement_checklist,
                resource_topics: evaluation.resource_topics,
                key_benefits: evaluation.reframed_idea.key_benefits,
                score_details: evaluation.canonical_score_details ?? null,
                model_overall_score: evaluation.model_overall_score ?? null,
                evaluated_at: new Date().toISOString(),
            },
            emailSubject: `${evaluation.overall_score >= 80 ? 'Great job' : evaluation.overall_score >= 60 ? 'Idea review' : 'Needs work'}: "${input.title}" scored ${evaluation.overall_score}/100`,
            ideaSubmission,
            fullEvaluation: evaluation,
        }
    } catch (error) {
        warnLog(
            route === 'mobile' ? 'submit.mobile_ai_evaluation_failed' : 'submit.ai_evaluation_failed',
            {
                error,
                organizationId: organization.id,
            }
        )

        return {
            aiScore: 0,
            aiReframedText: null,
            aiAnalysisJson: null,
            evaluationSummary: route === 'mobile'
                ? 'Your idea has been saved and will be reviewed.'
                : 'AI Evaluation unavailable at this time. Your idea has been saved and will be reviewed manually.',
            emailSubject: null,
            ideaSubmission,
            fullEvaluation: null,
        }
    }
}

export const prepareSubmit = async (
    formData: FormData,
    route: SubmitRoute
): Promise<PreparedSubmit | SubmitErrorResult> => {
    const input = normalizeSubmitInput(formData, route)
    if (isSubmitError(input)) {
        return input
    }

    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()
    const submitter = await resolveSubmitter(supabase, route, input)

    if (isSubmitError(submitter)) {
        return submitter
    }

    if (input.attachment) {
        const attachmentRateLimitResult = await rateLimitAction(
            'submitIdeaAttachment',
            submitter.rateLimitIdentifier
        )
        if (attachmentRateLimitResult) {
            return { ok: false, error: attachmentRateLimitResult.error }
        }
    }

    const organization = await loadOrganization(supabaseAdmin, submitter.organizationId, route, input.clientId)
    if (isSubmitError(organization)) {
        return organization
    }

    const evaluation = await evaluateSubmission(route, input, submitter, organization)

    return {
        route,
        supabase,
        supabaseAdmin,
        input,
        submitter,
        organization,
        fullDescription: buildIdeaDescription(input),
        evaluation,
    }
}

const uploadAttachmentIfNeeded = async (prepared: PreparedSubmit): Promise<{
    attachmentPath: string | null
    attachmentBuffer: Buffer | null
    attachmentFilename: string | null
    attachmentContentType: string | null
} | SubmitErrorResult> => {
    if (!prepared.input.attachment) {
        return {
            attachmentPath: null,
            attachmentBuffer: null,
            attachmentFilename: null,
            attachmentContentType: null,
        }
    }

    const attachment = prepared.input.attachment
    const arrayBuffer = await attachment.arrayBuffer()
    const attachmentBuffer = Buffer.from(arrayBuffer)
    const attachmentFilename = attachment.name
    const attachmentContentType = attachment.type
    const bucketName = 'idea-attachments'
    const { data: buckets } = await prepared.supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.find(bucket => bucket.name === bucketName)

    if (!bucketExists) {
        await prepared.supabaseAdmin.storage.createBucket(bucketName, { public: false })
    }

    const fileName = `${prepared.organization.id}/${Date.now()}_${attachmentFilename}`
    const { error: uploadError } = await prepared.supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, attachmentBuffer, {
            contentType: attachmentContentType,
            upsert: false,
        })

    if (uploadError) {
        errorLog('submit.attachment_upload_failed', uploadError, {
            organizationId: prepared.organization.id,
        })

        return { ok: false, error: 'Failed to upload attachment.' }
    }

    return {
        attachmentPath: fileName,
        attachmentBuffer,
        attachmentFilename,
        attachmentContentType,
    }
}

const incrementUserPointsWithFallback = async (
    prepared: PreparedSubmit,
    canonicalScore: number
): Promise<void> => {
    if (
        canonicalScore <= 0 ||
        prepared.submitter.kind !== 'authenticated' ||
        !prepared.submitter.user ||
        !prepared.submitter.profile
    ) {
        return
    }

    const logPrefix = prepared.route === 'mobile' ? 'submit.mobile' : 'submit'
    const { error: pointsError } = await (prepared.supabase.rpc as any)('increment_user_points', {
        user_id: prepared.submitter.user.id,
        points_to_add: canonicalScore,
    })

    if (!pointsError) {
        return
    }

    warnLog(`${logPrefix}_points_increment_failed`, {
        error: pointsError,
        userId: prepared.submitter.user.id,
        points: canonicalScore,
    })

    const { error: directUpdateError } = await (prepared.supabase
        .from('users') as any)
        .update({ total_points: prepared.submitter.profile.total_points + canonicalScore })
        .eq('id', prepared.submitter.user.id)

    if (directUpdateError) {
        warnLog(`${logPrefix}_points_fallback_failed`, {
            error: directUpdateError,
            userId: prepared.submitter.user.id,
            points: canonicalScore,
        })
    }
}

export const persistIdeaSubmission = async (
    prepared: PreparedSubmit
): Promise<PersistedSubmit | SubmitErrorResult> => {
    const attachmentUpload = await uploadAttachmentIfNeeded(prepared)
    if (isSubmitError(attachmentUpload)) {
        return attachmentUpload
    }

    const submissionStatus = prepared.evaluation.aiAnalysisJson
        ? (prepared.evaluation.aiScore <= 35 ? 'needs_improvement' : 'processed')
        : 'new'

    const payload = {
        organization_id: prepared.organization.id,
        user_id: prepared.submitter.user?.id || null,
        submitter_name: prepared.submitter.name,
        submitter_role: prepared.submitter.role,
        submitter_email: prepared.submitter.kind === 'workshop_guest' ? prepared.submitter.email : null,
        title: prepared.input.title,
        description: prepared.fullDescription,
        department: prepared.input.department,
        problem_statement: prepared.input.problemStatement,
        proposed_solution: prepared.input.proposedSolution,
        status: submissionStatus,
        ai_score: prepared.evaluation.aiScore,
        ai_reframed_text: prepared.evaluation.aiReframedText,
        ai_feedback: prepared.evaluation.evaluationSummary,
        ai_analysis_json: prepared.evaluation.aiAnalysisJson as any,
        attachment_path: attachmentUpload.attachmentPath,
        attachment_description: prepared.input.attachmentDescription,
    }

    const insertClient = prepared.route === 'mobile' ? prepared.supabase : prepared.supabaseAdmin
    const { error } = await insertClient.from('ideas').insert(payload as any)

    if (error) {
        errorLog(
            prepared.route === 'mobile' ? 'submit.mobile_idea_insert_failed' : 'submit.idea_insert_failed',
            error,
            {
                organizationId: prepared.organization.id,
            }
        )

        return { ok: false, error: 'Failed to submit idea. Please try again.' }
    }

    await incrementUserPointsWithFallback(prepared, prepared.evaluation.aiScore)

    return {
        aiScore: prepared.evaluation.aiScore,
        attachmentBuffer: attachmentUpload.attachmentBuffer,
        attachmentFilename: attachmentUpload.attachmentFilename,
        attachmentContentType: attachmentUpload.attachmentContentType,
    }
}

const getOrganizationAdminRecipients = async (
    supabaseAdmin: SubmitAdminClient,
    organizationId: string,
    route: SubmitRoute
): Promise<string[]> => {
    const { data, error } = await (supabaseAdmin
        .from('users') as any)
        .select('email')
        .eq('organization_id', organizationId)
        .eq('role', 'super_admin')

    if (error) {
        errorLog(
            route === 'mobile' ? 'submit.mobile_admin_recipients_load_failed' : 'submit.admin_recipients_load_failed',
            error,
            {
                organizationId,
            }
        )

        return []
    }

    const recipients = ((data as Array<{ email?: string | null }> | null) || [])
        .map(item => item.email?.trim())
        .filter((email): email is string => Boolean(email))

    return [...new Set(recipients)]
}

const toPostPersistOutcome = (label: string, result: EmailResult): PostPersistOutcome => {
    return {
        label,
        status: result.status,
        detail: summarizeEmailResult(result),
    }
}

const logPostPersistOutcome = (outcome: PostPersistOutcome): void => {
    if (outcome.status === 'delivered') {
        return
    }

    if (outcome.status === 'skipped') {
        warnLog('email.skipped', {
            label: outcome.label,
            reason: outcome.detail,
        })
        return
    }

    errorLog('email.failed', outcome.detail, { label: outcome.label })
}

export const runPostPersist = async (
    prepared: PreparedSubmit,
    persisted: PersistedSubmit
): Promise<PostPersistOutcome[]> => {
    const outcomes: PostPersistOutcome[] = []
    const adminRecipients = await getOrganizationAdminRecipients(
        prepared.supabaseAdmin,
        prepared.organization.id,
        prepared.route
    )
    const userRecipient = prepared.submitter.email?.trim() || null

    if (prepared.evaluation.fullEvaluation && prepared.evaluation.emailSubject && persisted.aiScore > 0 && userRecipient) {
        try {
            const redditLinks = await findRelevantRedditLinks({
                title: prepared.input.title,
                department: prepared.input.department,
                problemStatement: prepared.input.problemStatement,
                proposedSolution: prepared.input.proposedSolution,
                resourceTopics: prepared.evaluation.fullEvaluation.resource_topics,
                maxLinks: 5,
            })

            const reviewHtml = generateEvaluationEmail(
                prepared.evaluation.ideaSubmission,
                prepared.evaluation.fullEvaluation,
                prepared.submitter.name || 'there',
                {
                    externalLinks: redditLinks.map((link) => ({
                        title: link.title,
                        url: link.url,
                        source: link.source,
                    })),
                }
            )

            const result = await sendCombinedIdeaReviewEmail({
                to: userRecipient,
                bcc: adminRecipients.length > 0 ? adminRecipients : undefined,
                subject: prepared.evaluation.emailSubject,
                html: reviewHtml,
            })
            outcomes.push(toPostPersistOutcome(`Idea Review Email: ${prepared.input.title}`, result))
        } catch (error) {
            outcomes.push({
                label: `Idea Review Email: ${prepared.input.title}`,
                status: 'failed',
                detail: error instanceof Error ? error.message : 'Unknown email exception',
            })
        }
    } else if (prepared.evaluation.emailSubject && persisted.aiScore > 0) {
        outcomes.push({
            label: `Idea Review Email: ${prepared.input.title}`,
            status: 'skipped',
            detail: 'No submitter email available',
        })
    }

    for (const outcome of outcomes) {
        logPostPersistOutcome(outcome)
    }

    return outcomes
}

export const submitIdeaFlow = async (
    formData: FormData,
    route: SubmitRoute
): Promise<SubmitFlowResult> => {
    const prepared = await prepareSubmit(formData, route)
    if (isSubmitError(prepared)) {
        return prepared
    }

    const persisted = await persistIdeaSubmission(prepared)
    if (isSubmitError(persisted)) {
        return persisted
    }

    const postPersistOutcomes = await runPostPersist(prepared, persisted)

    return {
        ok: true,
        organizationSlug: prepared.organization.slug,
        postPersistOutcomes,
    }
}

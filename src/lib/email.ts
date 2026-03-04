/**
 * Email Service using SMTP (Gmail) or Resend
 *
 * Handles sending evaluation result emails to users.
 * Uses TEST_EMAIL_OVERRIDE (or EMAIL_TO) for development/testing.
 *
 * Configure via environment variables:
 * - NOTIFICATION_PROVIDER=smtp for Gmail SMTP
 * - NOTIFICATION_PROVIDER=resend for Resend API
 */

import nodemailer from 'nodemailer'

export interface EmailAttachment {
    filename: string
    content: Buffer | string
    contentType?: string
}

export type EmailRecipient = string | string[]

export interface SendEmailOptions {
    to: EmailRecipient
    subject: string
    html: string
    replyTo?: string
    attachments?: EmailAttachment[]
}

export type EmailDeliveryStatus = 'delivered' | 'skipped' | 'failed'

export interface EmailResult {
    status: EmailDeliveryStatus
    success: boolean
    id?: string
    error?: string
    warning?: string
    provider: string
    recipient: EmailRecipient
    originalRecipient: EmailRecipient
}

export const summarizeEmailResult = (result: EmailResult): string => {
    const recipientLabel = formatRecipientLabel(result.recipient)

    if (result.status === 'delivered') {
        return `Delivered via ${result.provider} to ${recipientLabel}`
    }

    if (result.status === 'skipped') {
        return result.warning || result.error || `Skipped via ${result.provider}`
    }

    return result.error || `Failed via ${result.provider}`
}

export interface ContestDigestLeaderboardEntry {
    rank: number
    name: string
    role: string | null
    points: number
}

export interface ContestDigestIdeaEntry {
    title: string
    score: number | null
    submittedAt: string
    submittedBy: string
}

export interface ContestDigestEmailPayload {
    organizationName: string
    organizationSlug: string
    recipients: string[]
    contestEndsAt: string | null
    leaderboard: ContestDigestLeaderboardEntry[]
    ideas: ContestDigestIdeaEntry[]
}

// Create SMTP transporter for Gmail
function createSmtpTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_USE_SSL === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    })
}

function normalizeRecipients(recipient: EmailRecipient): string[] {
    const recipients = Array.isArray(recipient) ? recipient : [recipient]
    return recipients.map(value => value.trim()).filter(Boolean)
}

function createEmailResult(params: {
    status: EmailDeliveryStatus
    provider: string
    recipient: EmailRecipient
    originalRecipient: EmailRecipient
    id?: string
    error?: string
    warning?: string
}): EmailResult {
    return {
        status: params.status,
        success: params.status === 'delivered',
        id: params.id,
        error: params.error,
        warning: params.warning,
        provider: params.provider,
        recipient: params.recipient,
        originalRecipient: params.originalRecipient,
    }
}

function formatRecipientLabel(recipient: EmailRecipient): string {
    return normalizeRecipients(recipient).join(', ')
}

/**
 * Send an email via SMTP (Gmail) or Resend
 * In development, emails are redirected to TEST_EMAIL_OVERRIDE/EMAIL_TO if set
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    const originalRecipients = normalizeRecipients(options.to)
    if (originalRecipients.length === 0) {
        return createEmailResult({
            status: 'failed',
            provider: 'none',
            recipient: options.to,
            originalRecipient: options.to,
            error: 'Recipient email is required',
        })
    }

    // Use test override if configured (for development)
    const testOverride = process.env.TEST_EMAIL_OVERRIDE || process.env.EMAIL_TO
    const recipientEmail: EmailRecipient = testOverride || options.to
    const isOverridden = !!testOverride && !originalRecipients.includes(testOverride)

    const provider = process.env.NOTIFICATION_PROVIDER || 'smtp'

    if (provider === 'smtp') {
        return sendViaSMTP(options, recipientEmail, isOverridden)
    } else if (provider === 'resend') {
        return sendViaResend(options, recipientEmail, isOverridden)
    } else {
        console.warn(`[Email] Unknown provider: ${provider}`)
        return createEmailResult({
            status: 'failed',
            provider,
            recipient: recipientEmail,
            originalRecipient: options.to,
            error: `Unknown email provider: ${provider}`,
        })
    }
}

/**
 * Send email via SMTP (Gmail)
 */
async function sendViaSMTP(
    options: SendEmailOptions,
    recipientEmail: EmailRecipient,
    isOverridden: boolean
): Promise<EmailResult> {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('[Email] SMTP credentials not configured - email not sent')
        console.log(`[Email] Would have sent to: ${formatRecipientLabel(recipientEmail)}`)
        console.log(`[Email] Subject: ${options.subject}`)
        return createEmailResult({
            status: 'skipped',
            provider: 'smtp',
            recipient: recipientEmail,
            originalRecipient: options.to,
            error: 'SMTP credentials not configured',
            warning: 'Notification skipped because SMTP credentials are missing',
        })
    }

    try {
        const transporter = createSmtpTransporter()
        const originalLabel = formatRecipientLabel(options.to)

        const subject = isOverridden
            ? `[TEST - Original: ${originalLabel}] ${options.subject}`
            : options.subject

        const info = await transporter.sendMail({
            from: `"Teklogic Spark AI" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: subject,
            html: options.html,
            replyTo: options.replyTo || 'support@teklogic.net',
            attachments: options.attachments?.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType,
            })),
        })

        console.log(`[Email] Sent successfully via SMTP to ${formatRecipientLabel(recipientEmail)}${isOverridden ? ` (redirected from ${originalLabel})` : ''}`)
        console.log(`[Email] Message ID: ${info.messageId}`)
        return createEmailResult({
            status: 'delivered',
            provider: 'smtp',
            recipient: recipientEmail,
            originalRecipient: options.to,
            id: info.messageId,
        })
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('[Email] SMTP Exception:', errorMessage)
        return createEmailResult({
            status: 'failed',
            provider: 'smtp',
            recipient: recipientEmail,
            originalRecipient: options.to,
            error: errorMessage,
        })
    }
}

/**
 * Send email via Resend API (fallback/alternative)
 */
async function sendViaResend(
    options: SendEmailOptions,
    recipientEmail: EmailRecipient,
    isOverridden: boolean
): Promise<EmailResult> {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not configured - email not sent')
        console.log(`[Email] Would have sent to: ${formatRecipientLabel(recipientEmail)}`)
        console.log(`[Email] Subject: ${options.subject}`)
        return createEmailResult({
            status: 'skipped',
            provider: 'resend',
            recipient: recipientEmail,
            originalRecipient: options.to,
            error: 'Resend API key not configured',
            warning: 'Notification skipped because the Resend API key is missing',
        })
    }

    try {
        // Dynamic import to avoid loading Resend if not using it
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const originalLabel = formatRecipientLabel(options.to)

        const { data, error } = await resend.emails.send({
            from: 'Teklogic Spark AI <noreply@teklogic.net>',
            to: recipientEmail,
            subject: isOverridden
                ? `[TEST - Original: ${originalLabel}] ${options.subject}`
                : options.subject,
            html: options.html,
            replyTo: options.replyTo || 'support@teklogic.net',
            attachments: options.attachments?.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType,
            })),
        })

        if (error) {
            console.error('[Email] Resend failed:', error)
            return createEmailResult({
                status: 'failed',
                provider: 'resend',
                recipient: recipientEmail,
                originalRecipient: options.to,
                error: error.message,
            })
        }

        console.log(`[Email] Sent successfully via Resend to ${formatRecipientLabel(recipientEmail)}${isOverridden ? ` (redirected from ${originalLabel})` : ''}`)
        return createEmailResult({
            status: 'delivered',
            provider: 'resend',
            recipient: recipientEmail,
            originalRecipient: options.to,
            id: data?.id ?? undefined,
        })
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('[Email] Resend Exception:', errorMessage)
        return createEmailResult({
            status: 'failed',
            provider: 'resend',
            recipient: recipientEmail,
            originalRecipient: options.to,
            error: errorMessage,
        })
    }
}

/**
 * Send idea evaluation results to user
 */
export async function sendEvaluationEmail(
    userEmail: string,
    userName: string,
    ideaTitle: string,
    score: number,
    emailHtml: string
): Promise<EmailResult> {
    const scoreEmoji = score >= 80 ? '🌟' : score >= 60 ? '✨' : score >= 40 ? '💡' : '📝'

    return sendEmail({
        to: userEmail,
        subject: `${scoreEmoji} Your Idea "${ideaTitle}" Scored ${score}/100`,
        html: emailHtml,
    })
}

/**
 * Generate welcome email HTML
 */
function generateWelcomeEmailHtml(
    userName: string,
    organizationName: string,
    loginUrl: string
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { margin-bottom: 25px; }
            .section-title { color: #667eea; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
            .tip-card { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
            .tip-card strong { color: #667eea; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Spark AI!</h1>
                <p>Your account has been created for ${organizationName}</p>
            </div>
    
            <div class="content">
                <p>Hi ${userName},</p>
                <p>Great news! Your Teklogic Spark AI account is ready. You can now start submitting your AI and automation ideas.</p>
    
                <div class="section">
                    <div class="section-title">Getting Started</div>
    
                    <div class="tip-card">
                        <strong>1. Submit Your First Idea</strong>
                        <p>Think about repetitive tasks in your daily work that could be automated. Share your ideas and our AI will evaluate them instantly!</p>
                    </div>
    
                    <div class="tip-card">
                        <strong>2. Explore AI Prompts</strong>
                        <p>Browse our library of AI prompts to spark inspiration for automation opportunities in your role.</p>
                    </div>
    
                    <div class="tip-card">
                        <strong>3. Learn & Grow</strong>
                        <p>Check out the video library for tips on AI tools and automation best practices.</p>
                    </div>
    
                    <div class="tip-card">
                        <strong>4. Compete & Win</strong>
                        <p>If a contest is running, your ideas earn points based on AI scores. Top contributors can win prizes!</p>
                    </div>
                </div>
    
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${loginUrl}" class="cta-button">Log In to Your Dashboard</a>
                </div>
    
                <p style="margin-top: 30px; color: #666;">Questions? Reply to this email and we'll help you get started.</p>
            </div>
    
            <div class="footer">
                <p>Teklogic Spark AI</p>
                <p>Transforming ideas into automation</p>
            </div>
        </div>
    </body>
    </html>
        `.trim()
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
    userEmail: string,
    userName: string,
    organizationName: string,
    organizationSlug: string
): Promise<EmailResult> {
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const loginUrl = `${baseUrl}/${organizationSlug}/login`

    const emailHtml = generateWelcomeEmailHtml(userName, organizationName, loginUrl)

    return sendEmail({
        to: userEmail,
        subject: `Welcome to Teklogic Spark AI - ${organizationName}`,
        html: emailHtml,
    })
}

/**
 * Generate admin notification email HTML
 */
function generateAdminNotificationHtml(
    ideaTitle: string,
    submitterName: string,
    submitterEmail: string,
    organizationName: string,
    department: string,
    problemStatement: string,
    proposedSolution: string,
    aiScore: number,
    attachmentDescription: string | null,
    hasAttachment: boolean
): string {
    const scoreColor = aiScore >= 80 ? '#22c55e' : aiScore >= 60 ? '#eab308' : aiScore >= 40 ? '#f97316' : '#ef4444'

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 20px; }
            .score-badge { display: inline-block; background: ${scoreColor}; color: white; padding: 5px 15px; border-radius: 15px; font-weight: bold; font-size: 16px; margin-top: 10px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 15px; }
            .field-label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 3px; }
            .field-value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #667eea; }
            .attachment-notice { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 5px; margin-top: 15px; }
            .footer { text-align: center; color: #999; font-size: 11px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Idea Submitted</h1>
                <div class="score-badge">AI Score: ${aiScore}/100</div>
            </div>
    
            <div class="content">
                <div class="field">
                    <div class="field-label">Idea Title</div>
                    <div class="field-value"><strong>${ideaTitle}</strong></div>
                </div>
    
                <div class="field">
                    <div class="field-label">Submitted By</div>
                    <div class="field-value">${submitterName} (${submitterEmail})</div>
                </div>
    
                <div class="field">
                    <div class="field-label">Organization</div>
                    <div class="field-value">${organizationName}</div>
                </div>
    
                <div class="field">
                    <div class="field-label">Department</div>
                    <div class="field-value">${department}</div>
                </div>
    
                <div class="field">
                    <div class="field-label">Problem Statement</div>
                    <div class="field-value">${problemStatement}</div>
                </div>
    
                <div class="field">
                    <div class="field-label">Proposed Solution</div>
                    <div class="field-value">${proposedSolution}</div>
                </div>
    
                ${hasAttachment ? `
                <div class="attachment-notice">
                    <strong>📎 Attachment Included</strong>
                    ${attachmentDescription ? `<p style="margin: 5px 0 0 0; font-size: 14px;">${attachmentDescription}</p>` : ''}
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">File attached to this email.</p>
                </div>
                ` : ''}
            </div>
    
            <div class="footer">
                <p>Teklogic Spark AI - Admin Notification</p>
            </div>
        </div>
    </body>
    </html>
        `.trim()
}

/**
 * Send admin notification when new idea is submitted
 */
export async function sendAdminNotification(
    ideaTitle: string,
    submitterName: string,
    submitterEmail: string,
    organizationName: string,
    department: string,
    problemStatement: string,
    proposedSolution: string,
    aiScore: number,
    attachmentDescription: string | null,
    attachment?: { filename: string; content: Buffer; contentType: string } | null,
    adminEmail?: EmailRecipient
): Promise<EmailResult> {
    const adminRecipient = adminEmail || process.env.ADMIN_NOTIFICATION_EMAIL || 'justin@teklogic.net'

    const emailHtml = generateAdminNotificationHtml(
        ideaTitle,
        submitterName,
        submitterEmail,
        organizationName,
        department,
        problemStatement,
        proposedSolution,
        aiScore,
        attachmentDescription,
        !!attachment
    )

    const attachments: EmailAttachment[] = []
    if (attachment) {
        attachments.push({
            filename: attachment.filename,
            content: attachment.content,
            contentType: attachment.contentType,
        })
    }

    return sendEmail({
        to: adminRecipient,
        subject: `[New Idea] ${ideaTitle} - Score: ${aiScore}/100`,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
    })
}

/**
 * Generate guest welcome email HTML
 */
function generateGuestWelcomeEmailHtml(
    userName: string,
    organizationName: string,
    signupUrl: string
): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Idea Received! 🚀</h1>
            <p>${organizationName} thanks you for your contribution.</p>
        </div>

        <div class="content">
            <p>Hi ${userName},</p>
            <p>We successfully received your automation idea. Our AI is already analyzing it to see how we can bring it to life.</p>

            <p><strong>Want to track your idea's progress?</strong></p>
            <p>Create a free account to see your idea on the leaderboard, earn points, and submit more ideas easily.</p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${signupUrl}" class="cta-button">Create My Account</a>
            </div>

            <p style="margin-top: 30px; color: #666;">If you didn't submit this idea, please ignore this email.</p>
        </div>

        <div class="footer">
            <p>Teklogic Spark AI</p>
        </div>
    </div>
</body>
</html>
    `.trim()
}

/**
 * Send welcome email to guest submitter
 */
export async function sendGuestWelcomeEmail(
    userEmail: string,
    userName: string,
    organizationName: string,
    organizationSlug: string
): Promise<EmailResult> {
    const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const signupUrl = `${baseUrl}/${organizationSlug}/login` // Direct them to login/signup page

    const emailHtml = generateGuestWelcomeEmailHtml(userName, organizationName, signupUrl)

    return sendEmail({
        to: userEmail,
        subject: `Start your journey with Teklogic Spark AI - ${organizationName}`,
        html: emailHtml,
    })
}

function generateContestDigestHtml(payload: ContestDigestEmailPayload): string {
    const contestEndsCopy = payload.contestEndsAt
        ? new Date(payload.contestEndsAt).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
        : 'TBD'

    const leaderboardRows = payload.leaderboard.length > 0
        ? payload.leaderboard.map(entry => `
            <tr>
                <td style="padding: 8px 0; font-weight: 600;">#${entry.rank}</td>
                <td style="padding: 8px 0;">${entry.name}</td>
                <td style="padding: 8px 0; color: #64748b;">${entry.role || 'Team Member'}</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 700;">${entry.points}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="4" style="padding: 12px 0; color: #64748b;">No leaderboard activity yet this week.</td></tr>'

    const ideaCards = payload.ideas.length > 0
        ? payload.ideas.map(idea => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; gap: 12px;">
                    <strong style="color: #0f172a;">${idea.title}</strong>
                    <span style="white-space: nowrap; color: #2563eb; font-weight: 700;">${idea.score ?? 'N/A'}/100</span>
                </div>
                <p style="margin: 8px 0 0 0; color: #475569; font-size: 14px;">
                    Submitted by ${idea.submittedBy} on ${new Date(idea.submittedAt).toLocaleDateString('en-US')}
                </p>
            </div>
        `).join('')
        : '<p style="color: #64748b;">No ideas have been submitted during the current contest window yet.</p>'

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #0f172a; background: #f8fafc; }
        .container { max-width: 640px; margin: 0 auto; padding: 24px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%); color: white; padding: 28px; border-radius: 18px 18px 0 0; }
        .content { background: white; padding: 28px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 18px 18px; }
        .section-title { font-size: 18px; font-weight: 700; margin: 24px 0 12px; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; }
        .meta { color: #cbd5e1; font-size: 13px; }
        .footer { color: #64748b; font-size: 12px; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Weekly Contest Digest</h1>
            <p style="margin: 8px 0 0 0;">${payload.organizationName}</p>
            <p class="meta" style="margin: 6px 0 0 0;">Contest window ends: ${contestEndsCopy}</p>
        </div>
        <div class="content">
            <p style="margin-top: 0;">Here is this week's snapshot of leaderboard momentum and the strongest recent ideas.</p>

            <div class="section-title">Leaderboard</div>
            <table>
                <thead>
                    <tr style="color: #64748b; font-size: 12px; text-transform: uppercase;">
                        <th align="left">Rank</th>
                        <th align="left">User</th>
                        <th align="left">Role</th>
                        <th align="right">Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboardRows}
                </tbody>
            </table>

            <div class="section-title">Top Ideas</div>
            ${ideaCards}

            <p class="footer">
                This digest was generated automatically for ${payload.organizationSlug}. Digests run only while a contest is active and no more than once every 7 days.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim()
}

export async function sendContestDigestEmail(payload: ContestDigestEmailPayload): Promise<EmailResult> {
    const emailHtml = generateContestDigestHtml(payload)

    return sendEmail({
        to: payload.recipients,
        subject: `Weekly Contest Digest: ${payload.organizationName}`,
        html: emailHtml,
    })
}

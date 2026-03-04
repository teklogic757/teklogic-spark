
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

// Load env vars from .env.local
dotenv.config({ path: resolve(__dirname, '../../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

// Create Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const ACME_SLUG = 'acme-corp'

async function seed() {
    console.log('Starting seed...')

    // 1. Create Organization
    console.log(`Checking/Creating Organization: ${ACME_SLUG}`)
    let { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', ACME_SLUG)
        .single()

    if (!org) {
        const { data: newOrg, error: createError } = await supabase
            .from('organizations')
            .insert({
                name: 'Acme Corporation',
                slug: ACME_SLUG,
                domain: 'acme.com',
                industry: 'Accounting',
                brand_voice: 'Professional, Efficient, Accurate',
                is_leaderboard_enabled: true
            })
            .select()
            .single()

        if (createError) {
            // If it fails on unique constraint (domain), try to fetch it again or careful fail
            console.error('Error creating org:', createError)
            return
        }
        org = newOrg
        console.log('Created Org:', org.id)
    } else {
        console.log('Found Org:', org.id)
    }

    // 2. Create Users
    const users = [
        { email: 'coo@acme.com', name: 'Alice Chief', role: 'user', job_role: 'Chief Operating Officer' },
        { email: 'ops@acme.com', name: 'Bob Ops', role: 'user', job_role: 'Operations Manager' },
        { email: 'cpa@acme.com', name: 'Charlie CPA', role: 'user', job_role: 'Senior CPA' }
    ]

    const userIds: string[] = []

    for (const user of users) {
        console.log(`Processing User: ${user.email}`)
        // Check if auth user exists
        const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()
        let authUser = authUsers.find(u => u.email === user.email)

        if (!authUser) {
            const { data: newUser, error: createAuthError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: 'password123',
                email_confirm: true,
                user_metadata: {
                    full_name: user.name,
                    organization_id: org.id
                }
            })
            if (createAuthError) {
                console.error(`Error creating auth user ${user.email}:`, createAuthError)
                continue
            }
            authUser = newUser.user
            console.log(`Created Auth User: ${user.email}`)
        } else {
            console.log(`Auth User exists: ${user.email}`)
        }

        if (!authUser) continue

        // Ensure public user record exists and is correct
        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                id: authUser.id,
                email: user.email,
                full_name: user.name,
                organization_id: org.id,
                job_role: user.job_role,
                role: user.role
            })

        if (upsertError) console.error(`Error updating public profile for ${user.email}:`, upsertError)
        else userIds.push(authUser.id)
    }

    // 3. Create Ideas
    if (userIds.length === 0) {
        console.error('No users available to create ideas')
        return
    }

    const ideasData = [
        { title: 'Automated Expense Categorization', description: 'Use AI to automatically categorize client expenses from bank feeds, reducing manual entry time by 80%.', userIdx: 2, votes: 15, score: 92 },
        { title: 'Client Portal Chatbot', description: 'Deploy a chatbot on the client portal to answer common tax deadline and document questions 24/7.', userIdx: 1, votes: 12, score: 85 },
        { title: 'Tax Return OCR Scanning', description: 'Implement OCR to scan and extract data from W-2s and 1099s directly into the tax software.', userIdx: 2, votes: 20, score: 95 },
        { title: 'Audit Risk Analyzer', description: 'Analyze client data to flag potential audit risks before filing, improving compliance rates.', userIdx: 0, votes: 18, score: 88 },
        { title: 'Automated Appointment Scheduling', description: 'Sync CPA calendars with client booking system to eliminate back-and-forth emails during tax season.', userIdx: 1, votes: 8, score: 75 },
        { title: 'Payroll Variance Alerts', description: 'Notify clients automatically when payroll runs deviate significantly from averages.', userIdx: 2, votes: 5, score: 70 },
        { title: 'Onboarding Workflow Automation', description: 'Streamline new client onboarding with automated document requests and status updates.', userIdx: 1, votes: 10, score: 82 },
        { title: 'Quarterly Tax Estimator Tool', description: 'Simple tool for clients to estimate quarterly payments based on real-time QBO data.', userIdx: 0, votes: 22, score: 98 },
        { title: 'Secure Document Exchange API', description: 'Direct API integration with major banks for secure statement retrieval.', userIdx: 2, votes: 7, score: 65 },
        { title: 'Internal Knowledge Base', description: 'Searchable AI database of tax code changes and firm memos for staff.', userIdx: 0, votes: 14, score: 89 },
    ]

    console.log('Seeding Ideas...')
    for (const idea of ideasData) {
        const userId = userIds[idea.userIdx % userIds.length] // Fallback

        const { error } = await supabase
            .from('ideas')
            .insert({
                organization_id: org.id,
                user_id: userId,
                title: idea.title,
                description: idea.description,
                ai_score: idea.score,
                status: 'new'
            })

        if (error) console.error(`Error inserting idea ${idea.title}:`, error)
        else console.log(`Created idea: ${idea.title}`)
    }

    console.log('Seed Complete!')
}

seed().catch(console.error)

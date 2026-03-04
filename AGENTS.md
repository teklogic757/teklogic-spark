# AI Agent Context File for Teklogic Spark AI

**Last Updated:** 2026-01-28
**Project:** Teklogic Spark AI
**Location:** `c:\Users\justi\Dropbox\antigravity\Teklogic_Project1\teklogic-ideas`

## 1. Project Vision & Goals

**Teklogic Spark AI** is a lightweight, gamified system that keeps the energy of AI workshops alive inside your organization.

*   **Core Narrative:** It gives employees a simple way to submit AI ideas, examples, and documents that are specific to their role and environment. Over a focused period (like 14 days), people earn points, climb a leaderboard, and compete for rewards based on the relevance and quality of their ideas.
*   **Transformational Goal:** This turns AI adoption from an abstract initiative into a concrete, fun, and measurable team activity.
*   **Long-term Value:** Over time, Spark AI becomes a living backlog of validated, organization-specific AI opportunities that you can prioritize and implement.

## 2. Technical Architecture

The application is a modern **Next.js 15** Full Stack app using **Supabase** for backend services.

*   **Framework:** Next.js 15.5 (App Router, downgraded from 16 due to Turbopack Windows issues)
*   **Database:** Supabase (PostgreSQL)
*   **Auth:** Supabase Auth (Email/Password & Magic Link)
*   **AI:** OpenAI GPT-4o-mini for automated idea evaluation
*   **Styling:** Tailwind CSS 4 + Shadcn/UI (Glassmorphism/Dark Mode Aesthetic)
*   **Deployment:** Vercel-ready

### Key Architectural Patterns

1.  **Server Components (>90%):** We prefer fetching data in Server Components (`page.tsx`, `layout.tsx`)
2.  **Server Actions:** All mutations (Login, Submit Idea, Update functions) are handled via Next.js Server Actions
3.  **Client Components:** Used only for interactivity (Form hooks, Framer Motion animations)
4.  **Middleware:** Manages session cookies and protects routes

### Version Note: Next.js 15 vs 16

**Important:** This project runs on Next.js 15, not 16.

*   **Issue:** Next.js 16 with Turbopack had critical Windows path resolution bugs that caused "nul" file errors
*   **Solution:** Downgraded to Next.js 15.5 which uses stable webpack builds
*   **Impact:** Slightly slower hot reload, but 100% stable on Windows

## 3. Critical Context & "Gotchas"

### The "Admin Client" & RLS Bypass

We faced a critical issue where restrictive **Row-Level Security (RLS)** policies on the `organizations` table caused an **infinite redirect loop** on the dashboard.

*   **Problem:** Authenticated users could not fetch `organization` details causing the app to think the org didn't exist → Redirect to Login → Login Success → Redirect to Dashboard → Repeat
*   **Solution:** We implemented `createAdminClient` in `src/lib/supabase/server.ts`
    *   **Mechanism:** It uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS
    *   **Usage:** Used **ONLY** for specific server-side organization lookups (`[client_id]/dashboard/page.tsx`) to guarantee the dashboard loads
    *   **Rule:** Do NOT use this for standard user operations (like fetching their own ideas) unless absolutely necessary to bypass confirmed RLS bugs

### Windows/PowerShell Environment

*   **Constraint:** The development environment is Windows
*   **Issue:** Many `npx` or `npm` scripts that try to pipe input or handle complex quoting fail in PowerShell
*   **Solution:** We prefer verifying Logic/Database via `src/app/admin/actions.ts` or simple SQL queries rather than complex CLI tools if they prove flaky

### Server Restart Best Practice

Due to HMR issues and port conflicts on Windows:

*   **Best Practice:** Always kill existing Node processes before restarting dev server
*   **Tool:** Use `kill_server.ps1` PowerShell script
*   **Command:** `powershell -ExecutionPolicy Bypass -File kill_server.ps1`
*   **Then:** Run `npm run dev`

## 4. Current State & Functionality

### Authentication Flow

*   **Global Login:** `/login` - Users log in with email/password or magic link
*   **No Organization Selection:** Users are pre-affiliated with organizations; no need to select
*   **Auto-Routing:** After login, `getUserDashboardUrl` determines the user's organization and redirects to `/{client_id}/dashboard`
*   **Multi-Tenant:** Each organization has its own dashboard at `/{client_id}/dashboard`

### AI Evaluation System ✨ **NEW**

**Location:** `src/lib/ai-evaluator.ts`

Every submitted idea is automatically evaluated by OpenAI GPT-4o-mini using organization-specific context.

**Evaluation Criteria (Weighted):**
1. **Impact Potential** (30%) - How significantly could this improve efficiency, reduce costs, or enhance quality?
2. **Feasibility** (25%) - How realistic is implementation given technical/organizational constraints?
3. **Scalability** (20%) - Can this solution scale across departments or benefit multiple teams?
4. **Innovation** (15%) - Does this represent a creative or novel approach?
5. **Clarity** (10%) - How well-defined is the problem and proposed solution?

**Process:**
1. User submits idea via `/[client_id]/submit`
2. System fetches organization context (industry, brand_voice, budget, employee count, etc.)
3. OpenAI evaluates idea against criteria
4. Returns:
   - Overall score (0-100)
   - Reframed idea (improved title + description)
   - Key benefits (3-5 bullet points)
   - Related suggestions (3 automation ideas)
   - Criterion-by-criterion scoring
5. Results saved to `ideas` table (`ai_score`, `ai_reframed_text`, `ai_feedback`, `ai_analysis_json`)
6. HTML email generated and logged (ready for email service integration)

**Environment Variables:**
```env
OPENAI_API_KEY=your_key_here
TEST_EMAIL_OVERRIDE=justin@teklogic.net  # For testing, overrides actual user email
```

### Core Features

*   **Dashboard:** Displays User Stats, "Your Ideas" (List), and "Top Ideas" (Sidebar)
*   **Submission:** Users submit ideas with AI evaluation via `/[client_id]/submit`
*   **Admin Area:** `/admin` path exists for Super Admins to manage Organizations and Users
*   **API/Data:**
    *   `organizations`: Stores branding, domain, settings, and context for AI evaluation
    *   `users`: Public profile table synced with Auth Users
    *   `ideas`: Core domain entity with AI evaluation fields

## 5. Database Schema

### Ideas Table (AI Fields)

```sql
-- Core fields
id UUID PRIMARY KEY
organization_id UUID (FK)
user_id UUID (FK)
title TEXT
description TEXT
status TEXT DEFAULT 'new'
created_at TIMESTAMPTZ

-- AI Evaluation fields
ai_score INTEGER  -- 0-100 overall score
ai_reframed_text TEXT  -- AI-improved idea description
ai_feedback TEXT  -- Evaluation summary
ai_analysis_json JSONB  -- Full evaluation data:
  {
    "criteria_scores": [
      {"criterion": "Impact Potential", "score": 85, "reasoning": "..."},
      ...
    ],
    "related_suggestions": [
      {"title": "...", "description": "..."},
      ...
    ],
    "key_benefits": ["...", "...", "..."],
    "evaluated_at": "2026-01-28T..."
  }
```

### Organizations Table (Context Fields)

```sql
-- AI Evaluation context
industry TEXT
brand_voice TEXT
marketing_strategy TEXT
annual_it_budget TEXT
estimated_revenue TEXT
employee_count TEXT
```

## 6. Roadmap

### Recently Completed ✅

- [x] **AI Evaluation System** - Automated scoring with organization context
- [x] **Email Generation** - HTML emails with evaluation results
- [x] **Global Login** - Simplified auth flow with auto-routing
- [x] **Next.js 15** - Stable Windows builds (downgraded from 16)
- [x] **Multi-Tenant Architecture** - Dynamic routes with RLS
- [x] **Admin Area** - Organization and user management

### Immediate Priorities

1.  **Email Service Integration** - Connect to Resend/SendGrid/Postmark for actual email delivery
2.  **Data Validation** - Frontend validation for idea submission (min/max lengths, file types)
3.  **UI Polish** - Ensure consistent glassmorphism design across all pages

### Future Features

*   **Voting System** - Allow users to upvote ideas
*   **Leaderboards** - Track top contributors with points
*   **Comments** - Discussion threads on ideas
*   **Campaign Management** - Time-bound submission periods (14-day sprints)
*   **Idea Status Flow** - Workflow states (new → reviewing → approved → implementing → completed)
*   **Analytics Dashboard** - Admin insights on submission trends, top categories, etc.

## 7. Essence of Previous Decisions

*   **"Fix it now, perfect RLS later":** We chose to use the Service Role Key to fix dashboard access immediately rather than spending days debugging complex recursive RLS policies
*   **"Manual over Magic":** We implemented manual `createAdminClient` functionality rather than relying on third-party auth helpers that might obscure the logic
*   **Multi-tenancy via Path:** The `[client_id]` dynamic route is the source of truth for the current organization context
*   **AI Evaluation First:** Rather than building voting/leaderboards first, we prioritized intelligent idea evaluation to provide immediate value
*   **Organization Context Matters:** AI evaluations consider industry, budget, and strategy to ensure relevance
*   **Webpack over Turbopack:** Stability on Windows > faster HMR (for now)

## 8. File Structure Key

```
src/
├── app/
│   ├── [client_id]/          # Multi-tenant routes
│   │   ├── dashboard/        # User dashboard (uses admin client for org fetch)
│   │   ├── submit/           # Idea submission with AI evaluation
│   │   │   └── actions.ts    # Server action with AI evaluation logic
│   │   └── login/            # Client-specific login (legacy)
│   ├── login/                # Global login page (primary entry)
│   │   ├── page.tsx          # Server component
│   │   ├── login-form.tsx    # Client component with auth logic
│   │   └── actions.ts        # getUserDashboardUrl server action
│   ├── admin/                # Super admin area
│   │   ├── actions.ts        # Admin server actions
│   │   ├── organizations/    # Organization CRUD
│   │   └── users/            # User management
│   └── auth/
│       └── callback/         # Supabase auth callback handler
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   └── server.ts         # Server client + createAdminClient (RLS bypass)
│   ├── ai-evaluator.ts       # AI evaluation engine ⭐ NEW
│   └── utils.ts              # Utility functions
├── components/
│   └── ui/                   # Shadcn/UI components
└── scripts/                  # Database migrations
    ├── 001_initial_schema.sql
    ├── 002_add_ai_fields.sql
    └── ...
```

## 9. Important Server Actions

### `getUserDashboardUrl(userId: string)` - src/app/login/actions.ts

*   Fetches user's organization_id
*   Returns `/{organization_slug}/dashboard`
*   Used by global login to redirect users to their org

### `submitIdea(formData)` - src/app/[client_id]/submit/actions.ts

*   Validates idea submission
*   Fetches organization context for AI
*   Calls `evaluateIdea()` from ai-evaluator
*   Saves idea with AI evaluation data
*   Generates and logs HTML email
*   Redirects to dashboard

### `evaluateIdea(submission, orgContext)` - src/lib/ai-evaluator.ts

*   Sends structured prompt to OpenAI
*   Returns full evaluation object
*   Includes weighted scoring, reframing, suggestions

## 10. Environment Variables Reference

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # For createAdminClient (RLS bypass)

# OpenAI
OPENAI_API_KEY=  # For idea evaluation

# Testing
TEST_EMAIL_OVERRIDE=justin@teklogic.net  # Route all eval emails here for testing
```

## 11. Debugging Tips

### Login Issues

*   Check console logs in login-form.tsx (comprehensive error logging added)
*   Verify user exists in `users` table with correct `organization_id`
*   Check `getUserDashboardUrl` returns valid organization slug

### AI Evaluation Not Working

*   Check OpenAI API key is valid
*   Verify organization has context fields populated (industry, brand_voice, etc.)
*   Check console for detailed evaluation logs in submit/actions.ts

### Infinite Redirects

*   Usually RLS policy issue
*   Verify `createAdminClient` is used for organization fetch in dashboard
*   Check middleware isn't blocking legitimate routes

### Module Resolution Errors

*   Clear `.next` folder: `rm -rf .next`
*   Reinstall: `rm -rf node_modules package-lock.json && npm install`
*   Restart server cleanly: `.\kill_server.ps1 && npm run dev`

## 12. Testing Credentials

*   Contact justin@teklogic.net for test accounts
*   Default organization slug: `teklogic`
*   Admin access: Via `users.role = 'super_admin'`

> ⚠️ **SECURITY WARNING:** Test users were created with default password "123".
> **BEFORE PUBLISHING:** Change all test user passwords to complex values via Supabase Dashboard > Authentication > Users.

---

**Quick Reference:**
- AI Evaluation: `src/lib/ai-evaluator.ts`
- Submit Action: `src/app/[client_id]/submit/actions.ts`
- Login Flow: `src/app/login/`
- Admin Client: `src/lib/supabase/server.ts` → `createAdminClient()`
- Email Override: `.env.local` → `TEST_EMAIL_OVERRIDE`

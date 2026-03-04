# Teklogic Spark AI - Product Roadmap

**Last Updated:** 2026-01-31
**Project Phase:** MVP → Production Ready

---

## 🎯 Vision

Transform AI adoption from abstract workshops into concrete, measurable team activities through gamification, intelligent evaluation, and organization-specific context.

---

## 🚨 PRODUCTION CHECKLIST (Before Go-Live)

> **CRITICAL:** Complete these items before any client deployment.

- [ ] **Change Default Test User Passwords**
  - Test users were created with password "123"
  - Action: Update via Supabase Dashboard > Authentication > Users

- [ ] **Remove Email Test Redirect**
  - Currently all emails redirect to `justin@teklogic.net` via `TEST_EMAIL_OVERRIDE`
  - Action: Remove `TEST_EMAIL_OVERRIDE` from production `.env` on Vercel
  - Keep for development/staging environments

- [ ] **Credential Rotation**
  - Rotate OpenAI API key
  - Rotate Supabase Service Role key
  - Update Gmail App Password
  - Update production environment variables

---

## ✅ Completed Features

### Phase 1: Core Platform (Completed 2026-01-27)

- [x] **Multi-Tenant Architecture**
  - Dynamic routing with `[client_id]` paths
  - Organization-specific branding and settings
  - Row-Level Security (RLS) policies
  - Admin client bypass for critical organization fetches

- [x] **Authentication System**
  - Email/Password authentication
  - Magic link (passwordless) authentication
  - Session persistence with Supabase Auth
  - Protected routes via middleware
  - Global login with auto-routing to user's organization

- [x] **User Dashboard**
  - User stats (ideas submitted, avg score)
  - "Your Ideas" list with status and scores
  - "Top Ideas" sidebar showing highest-rated submissions
  - Responsive glassmorphism design

- [x] **Idea Submission**
  - Multi-field form (title, description, file upload)
  - Server-side validation
  - File upload to Supabase Storage
  - Status tracking (new, under_review, approved, etc.)

- [x] **Admin Panel**
  - Organization CRUD operations
  - User management (create, edit, delete)
  - Role assignment (user, admin, super_admin)
  - Invitation system for new users

### Phase 2: AI Intelligence (Completed 2026-01-28)

- [x] **AI-Powered Idea Evaluation**
  - Integration with OpenAI GPT-4o-mini
  - Weighted scoring criteria (5 dimensions)
  - 0-100 point overall score calculation
  - Organization-specific context awareness

- [x] **Intelligent Idea Reframing**
  - AI rewrites ideas for clarity and impact
  - Generates improved titles and descriptions
  - Extracts 3-5 key benefits
  - Suggests 3 related automation opportunities

- [x] **Organization Context System**
  - Industry-specific evaluation
  - Brand voice consideration
  - Budget constraints awareness (annual IT budget)
  - Company size context (employee count, revenue)
  - Marketing strategy alignment

- [x] **Email Notification System**
  - HTML email generation with gradient design
  - Evaluation results delivery
  - Testing override for development (`TEST_EMAIL_OVERRIDE`)
  - SMTP (Gmail) integration

- [x] **Enhanced Idea Submission Form** (Completed 2026-01-29)
  - Structured input fields (Department, Problem, Solution)
  - Department tracking for better organization
  - Clear problem/solution separation for AI context
  - Optional additional context field
  - Enhanced file upload with image support (.png, .jpg, .jpeg, .gif)
  - Inline help text and validation messages
  - Professional UI with lightbulb icon and help section
  - Minimum character requirements for quality submissions

- [x] **Prompt Library** (Completed)
  - Searchable database of AI prompts
  - Category/tag filtering
  - "Prompt of the Day" - random prompts on dashboard
  - Admin interface to manage/import prompts

- [x] **Learning Library** (Completed)
  - YouTube video library
  - Video preview cards with thumbnails

- [x] **Contest System** (Completed)
  - Contest start/end dates
  - Countdown timer display
  - Prize configuration (1st, 2nd place)
  - Leaderboard enable/disable per organization

---

## 🔄 Current Sprint

### Phase 3: Email & Notifications (Priority: HIGH)

- [ ] **Welcome Emails for New Users**
  - Send welcome email when user account is created
  - Include organization name, login link, getting started tips
  - Respect TEST_EMAIL_OVERRIDE for development

- [ ] **Weekly Digest During Contest**
  - Send weekly summary of top ideas during active contest
  - Include leaderboard standings
  - Only send while contest is running

- [ ] **Admin Notifications**
  - Email admin (justin@teklogic.net) on new idea submissions
  - Include idea title, submitter name, AI score

### Phase 3B: Admin Enhancements

- [ ] **YouTube Video Management in Admin**
  - Add ability to paste YouTube URL and add to video library
  - Simple form: URL input, auto-fetch title/thumbnail
  - Delete videos from library

---

## 📋 Next Up

### Phase 4: Points & Leaderboard (Simplified)

- [ ] **Points System**
  - Users start at 0 points
  - Points = sum of AI scores from all submitted ideas
  - Display total points on user dashboard

- [ ] **Organization Leaderboard**
  - Overall leaderboard showing all users in organization
  - Ranked by total points
  - Users only see their own organization's leaderboard
  - Show during contest period

- [ ] **AI Scoring Refinement**
  - Review and improve scoring criteria
  - Ensure scores are well-distributed (not all clustered)
  - Add more nuance to evaluation prompts

### Phase 4B: Prize Display

- [ ] **Configurable Prizes**
  - Admin can set 1st, 2nd, 3rd place prize amounts
  - Display as Amazon Gift Card values
  - 3rd place optional (for larger organizations)
  - Show prizes prominently during contest

---

## 🔒 Security

### Completed ✅

- [x] Environment Variable Validation
- [x] In-Memory Rate Limiting (sufficient for <10 concurrent users)
- [x] Input Validation (Zod schemas)
- [x] File Upload Validation
- [x] RLS Policy Fixes
- [x] Admin Client Centralization
- [x] Dropped unused document tables (security fix 2026-01-31)
- [x] Prompt Injection Protection (Completed 2026-01-31)
  - Input sanitization via `src/lib/prompt-sanitizer.ts`
  - Detects and neutralizes injection patterns
  - Defensive system prompt instructions

### Pending

- [ ] **Audit Logging** (Priority: MEDIUM)
  - Track admin operations (user create/edit/delete)
  - Log sensitive data access
  - Store in database table for review

> **Note:** Redis-based rate limiting NOT needed. Expected load: <10 concurrent users, <300 total users.

---

## 🐛 Technical Debt (High Priority Only)

- [ ] Remove console.logs from production code
- [ ] Implement proper error boundaries
- [ ] Add loading states for all async operations
- [ ] Improve mobile responsiveness on submit page
- [ ] Add comprehensive frontend validation

---

## 🔮 Future Ideas (Parking Lot)

Features deprioritized for now but may revisit later:

- In-app notifications (toast, notification center)
- Voting/upvote system
- Badges and achievements
- Hall of Fame
- Comment system on ideas
- Discussion boards
- Collaboration features (co-submit, idea merging)
- Campaign themes
- Implementation tracking (Kanban, Gantt)
- API & Webhooks
- Slack/Teams integration
- PWA mobile app
- Advanced permissions/roles
- White-label customization

---

## 📊 Success Metrics

### Platform Adoption
- Active users (weekly/monthly)
- Ideas submitted per user
- Time to first idea submission
- Return user rate

### Engagement
- Average session duration
- Contest participation rate

### Business Value
- Ideas implemented (count)
- Estimated ROI from implemented ideas

### Quality
- Average AI evaluation score
- Ideas approved for implementation (%)

---

## 🚀 Deployment Milestones

### Milestone 1: Internal Beta (Current)
- **Target:** End of January 2026
- **Users:** Teklogic team only
- **Features:** Core platform + AI evaluation
- **Goal:** Validate core functionality, gather feedback

### Milestone 2: First Client Pilot
- **Target:** February 2026
- **Users:** 1 pilot organization (50-100 users)
- **Features:** +Welcome emails +Leaderboard +Refined scoring
- **Goal:** Prove value proposition, refine UX

### Milestone 3: Multi-Client Launch
- **Target:** March 2026
- **Users:** 3-5 organizations
- **Features:** +Weekly digest +Admin notifications
- **Goal:** Scale infrastructure, validate multi-tenancy

### Milestone 4: Production v1.0
- **Target:** Q2 2026
- **Users:** 10+ organizations
- **Features:** Stable, polished platform
- **Goal:** Production-ready, sustainable growth

---

## 📞 Feedback & Prioritization

This roadmap is a living document. Priority order may shift based on:
- User feedback and requests
- Technical dependencies
- Business opportunities
- Resource availability

**Contact:** justin@teklogic.net for roadmap discussions and feature requests.

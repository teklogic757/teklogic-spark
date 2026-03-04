# 🚀 Start Here - Quick Reference

**Welcome back!** This document helps you quickly orient yourself and get started.

**Last Updated:** 2026-01-28 (Evening session)

---

## 📋 Project Status

### ✅ What's Working

- **Authentication** - Global login with email/password and magic link
- **Dashboard** - User stats, idea lists, responsive design
- **Idea Submission** - Multi-field form with file upload
- **AI Evaluation** - Automatic scoring with organization context (OpenAI GPT-4o-mini)
- **Admin Panel** - Organization and user management
- **Multi-Tenancy** - Dynamic routing with `[client_id]`
- **Email Generation** - HTML emails ready (not sent yet, just logged)

### 🔧 Current Tech Stack

- **Next.js 15.5** (downgraded from 16 due to Turbopack Windows issues)
- **React 19.2** (Server Components)
- **Supabase** (PostgreSQL + Auth)
- **OpenAI GPT-4o-mini** (Idea evaluation)
- **Tailwind CSS 4** + Shadcn/UI
- **TypeScript** (Strict mode)

### 🎯 What's Next

See [ROADMAP.md](../ROADMAP.md) for full details. Top priorities:
1. **Email Service Integration** (Resend/SendGrid)
2. **Voting System** for ideas
3. **Leaderboard** with points tracking
4. **Campaign Management** (time-bound sprints)

---

## 📚 Documentation Map

### For Development

1. **[README.md](../README.md)** - Start here for project overview
   - What is Spark AI?
   - Features and capabilities
   - Quick start guide

2. **[AGENTS.md](../AGENTS.md)** - Technical context for AI assistants
   - Architecture decisions
   - Critical "gotchas" and solutions
   - File structure
   - Debugging tips

3. **[SETUP.md](./SETUP.md)** - Complete setup instructions
   - Environment setup
   - Database migrations
   - Supabase configuration
   - First-time setup checklist

4. **[ENVIRONMENT.md](./ENVIRONMENT.md)** - Environment variables reference
   - Required vs optional variables
   - Security best practices
   - Troubleshooting env issues

### For Planning

5. **[ROADMAP.md](../ROADMAP.md)** - Product roadmap and feature planning
   - Completed features
   - In-progress work
   - Planned features by phase
   - Success metrics

---

## 🔑 Key Files to Know

### Core Application

```
src/
├── app/
│   ├── login/              # Global login (primary entry point)
│   │   ├── page.tsx        # Server component
│   │   ├── login-form.tsx  # Client component with auth
│   │   └── actions.ts      # getUserDashboardUrl
│   │
│   ├── [client_id]/        # Multi-tenant routes
│   │   ├── dashboard/      # User dashboard
│   │   └── submit/         # Idea submission + AI evaluation
│   │       └── actions.ts  # ⭐ AI evaluation logic here
│   │
│   └── admin/              # Super admin panel
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server + admin client
│   │
│   └── ai-evaluator.ts     # ⭐ AI evaluation engine
│
└── components/ui/          # Shadcn components
```

### Configuration

- **package.json** - Dependencies (Next.js 15, not 16!)
- **.env.local** - Your secrets (gitignored)
- **tsconfig.json** - TypeScript config (excludes src/scripts)
- **next.config.ts** - Next.js config (minimal)

### Database

- **src/scripts/** - Database migrations
  - `001_initial_schema.sql` - Base tables + RLS
  - `002_add_ai_fields.sql` - AI evaluation columns

---

## 🛠️ Common Commands

### Development

```bash
# Start dev server (Windows)
.\kill_server.ps1 && npm run dev

# Or without killing first
npm run dev

# Access at: http://localhost:3000
```

### Database

```bash
# Run migrations: Copy SQL files from src/scripts/ to Supabase SQL Editor
# No CLI migrations - use Supabase dashboard
```

### Build

```bash
# Production build
npm run build

# Test production build locally
npm run start
```

---

## 🐛 Quick Troubleshooting

### Server won't start?

```bash
.\kill_server.ps1
rm -rf .next
npm run dev
```

### Module not found errors?

```bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Login not working?

1. Check user exists in `users` table with `organization_id`
2. Check console logs in browser (F12 → Console)
3. Verify `.env.local` has correct Supabase credentials

### AI evaluation failing?

1. Check `OPENAI_API_KEY` in `.env.local`
2. Verify OpenAI account has billing set up
3. Check organization has context fields (industry, brand_voice, etc.)

---

## 🎯 Where We Left Off (2026-01-28 Evening)

### Completed This Session

1. ✅ Fixed Next.js 16 Turbopack Windows issues (downgraded to 15)
2. ✅ Cleaned up module resolution errors (fresh npm install)
3. ✅ Verified login working correctly
4. ✅ Updated all documentation:
   - Comprehensive README
   - Updated AGENTS.md with AI evaluation details
   - Created detailed ROADMAP
   - Created SETUP guide
   - Created ENVIRONMENT reference
5. ✅ Server running stable at `http://localhost:3000`

### Ready for Tomorrow

- Server is running and stable
- All documentation is current and comprehensive
- Login works perfectly
- AI evaluation is fully functional
- Codebase is clean and ready for new features

### Next Session Priorities

See [ROADMAP.md](../ROADMAP.md) Phase 3:
1. **Integrate email service** (Resend recommended)
2. **Add frontend validation** on idea submission
3. **Implement voting system**
4. **Build leaderboard**

---

## 💡 Pro Tips

### Daily Workflow

1. **Start fresh:**
   ```bash
   .\kill_server.ps1 && npm run dev
   ```

2. **Check server output** for errors/warnings

3. **Test in browser** with console open (F12)

4. **Commit often** with descriptive messages

### When Stuck

1. Check **[AGENTS.md](../AGENTS.md)** Section 11: Debugging Tips
2. Review console logs (both terminal and browser)
3. Check Supabase logs (Dashboard → Logs)
4. Verify environment variables (`.env.local`)

### Before Deploying

1. Review **Security Checklist** in [SETUP.md](./SETUP.md)
2. Test production build locally: `npm run build && npm run start`
3. Check all environment variables are set in Vercel
4. Remove `TEST_EMAIL_OVERRIDE` for production

---

## 📬 Support

**Email:** justin@teklogic.net

**GitHub Issues:** (when repo is set up)

**Documentation:**
- Technical: [AGENTS.md](../AGENTS.md)
- Setup: [SETUP.md](./SETUP.md)
- Planning: [ROADMAP.md](../ROADMAP.md)

---

## 🎉 You're All Set!

Everything is documented, tested, and ready for continued development.

**Tomorrow morning:**
1. Read this document (START_HERE.md)
2. Review [ROADMAP.md](../ROADMAP.md) for next priorities
3. Start dev server: `.\kill_server.ps1 && npm run dev`
4. Start building! 🚀

---

**Happy Coding!**

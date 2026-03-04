# Teklogic Spark AI - Complete Setup Guide

This guide will walk you through setting up Teklogic Spark AI from scratch.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager
- **Git** for version control
- **Supabase Account** ([Sign up](https://supabase.com))
- **OpenAI API Key** ([Get one](https://platform.openai.com/api-keys))
- **Windows PowerShell** (for Windows development)

---

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd teklogic-ideas
```

---

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15.5
- React 19
- Supabase clients
- OpenAI SDK
- Tailwind CSS
- Shadcn/UI components

---

## Step 3: Set Up Supabase

### 3.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Project name: `teklogic-spark-ai`
   - Database password: (generate a strong password)
   - Region: Choose closest to you
4. Wait for project creation (~2 minutes)

### 3.2 Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1...`
   - **service_role key**: `eyJhbGciOiJIUzI1...` (reveal and copy)

### 3.3 Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Run each migration file in order:

#### Migration 1: Base Schema

```sql
-- Find this in src/scripts/001_initial_schema.sql
-- Copy and paste the entire file into SQL Editor
-- Click "Run"
```

#### Migration 2: AI Evaluation Fields

```sql
-- Find this in src/scripts/002_add_ai_fields.sql
-- Copy and paste the entire file into SQL Editor
-- Click "Run"
```

### 3.4 Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "New bucket"
3. Name: `idea-attachments`
4. Public bucket: ✅ Yes
5. Click "Create bucket"

### 3.5 Set Storage Policies

In SQL Editor, run:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'idea-attachments');

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'idea-attachments');
```

---

## Step 4: Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API keys**
4. Click "Create new secret key"
5. Name it: `teklogic-spark-ai`
6. Copy the key (starts with `sk-proj-...`)

**Important:** Add billing information to OpenAI account to use GPT-4.

---

## Step 5: Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
# Copy the example
cp .env.example .env.local

# Or create manually
touch .env.local
```

2. Edit `.env.local` and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Testing Configuration (Optional)
TEST_EMAIL_OVERRIDE=your-email@example.com
```

**Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## Step 6: Seed Initial Data

### 6.1 Create Your First Organization

In Supabase SQL Editor:

```sql
INSERT INTO organizations (
    name,
    slug,
    domain,
    industry,
    brand_voice,
    marketing_strategy,
    annual_it_budget,
    estimated_revenue,
    employee_count
) VALUES (
    'Teklogic',
    'teklogic',
    'teklogic.net',
    'Technology Consulting',
    'Professional, innovative, client-focused',
    'Thought leadership through AI workshops and education',
    '500000',
    '5000000',
    '50'
);
```

### 6.2 Create Your First User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user"
3. Enter:
   - Email: `your-email@example.com`
   - Password: (choose a secure password)
   - Auto Confirm User: ✅ Yes
4. Click "Create user"
5. Copy the **User UID** (looks like `a1b2c3d4-...`)

### 6.3 Link User to Organization

In SQL Editor:

```sql
-- Replace USER_UID and ORG_ID with your actual IDs
INSERT INTO users (
    id,
    organization_id,
    email,
    full_name,
    job_role,
    role
) VALUES (
    'a1b2c3d4-...', -- Your user UID from Auth
    (SELECT id FROM organizations WHERE slug = 'teklogic'),
    'your-email@example.com',
    'Your Name',
    'CEO',
    'super_admin'
);
```

---

## Step 7: Start the Development Server

### Windows (Recommended)

```powershell
# Kill any existing server
.\kill_server.ps1

# Start dev server
npm run dev
```

### Mac/Linux

```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Start dev server
npm run dev
```

The server should start at [http://localhost:3000](http://localhost:3000)

---

## Step 8: Verify Installation

### 8.1 Test Login

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. You should be redirected to `/login`
3. Enter your credentials
4. You should be redirected to `/teklogic/dashboard` (or your org slug)

### 8.2 Test Idea Submission

1. Click "Submit Idea" or navigate to `/teklogic/submit`
2. Fill in the form:
   - Title: "Test Idea"
   - Description: (at least 50 characters)
3. Click "Submit Idea"
4. Wait for AI evaluation (~5-10 seconds)
5. You should see a success message and be redirected to dashboard
6. Check console for email output (HTML email generated)

### 8.3 Test AI Evaluation

Check the console output after submission. You should see:

```
╔════════════════════════════════════════════════════════════════════
║ EMAIL READY FOR DELIVERY
╠════════════════════════════════════════════════════════════════════
║ To: your-email@example.com [TEST OVERRIDE]
║ Subject: Your AI Idea Evaluation Results - 75/100
╠════════════════════════════════════════════════════════════════════
║ HTML Content Generated (12345 chars)
║ Score: 75/100
║ Suggestions: 3 related ideas
╚════════════════════════════════════════════════════════════════════
```

---

## Step 9: Set Up Admin Access

### 9.1 Access Admin Panel

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)

You should see:
- Organizations list
- Users list
- Create new organization/user buttons

### 9.2 Create Additional Users

1. Click "Create User" in admin panel
2. Fill in the form
3. User will receive credentials via email (when email service is integrated)

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

### Issue: Infinite redirect loop

**Cause:** User not linked to organization properly

**Solution:**
```sql
-- Check if user exists in users table
SELECT * FROM users WHERE email = 'your-email@example.com';

-- If missing, insert user record (see Step 6.3)
```

### Issue: AI evaluation fails

**Causes:**
1. Invalid OpenAI API key
2. No billing set up on OpenAI account
3. Organization missing context fields

**Solution:**
```bash
# Check OpenAI key in .env.local
cat .env.local | grep OPENAI

# Test OpenAI directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check organization has context
SELECT industry, brand_voice FROM organizations WHERE slug = 'teklogic';
```

### Issue: File upload fails

**Cause:** Storage bucket not configured

**Solution:** See Step 3.4 and 3.5 to create and configure storage bucket

### Issue: Port 3000 already in use

**Solution:**
```bash
# Windows
.\kill_server.ps1

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: TypeScript errors

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# If still failing, check tsconfig.json
```

---

## Next Steps

Now that your environment is set up:

1. **Read the Documentation**
   - [README.md](../README.md) - Project overview
   - [AGENTS.md](../AGENTS.md) - Technical context
   - [ROADMAP.md](../ROADMAP.md) - Feature planning

2. **Customize Your Organization**
   - Update organization branding (logo, colors)
   - Set organization context for better AI evaluations
   - Invite team members

3. **Integrate Email Service**
   - See [EMAIL_INTEGRATION.md](./EMAIL_INTEGRATION.md) (coming soon)
   - Options: Resend, SendGrid, Postmark

4. **Deploy to Production**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) (coming soon)
   - Recommended: Vercel

---

## Development Workflow

### Daily Development

```bash
# 1. Start server
.\kill_server.ps1 && npm run dev

# 2. Make changes
# Files hot-reload automatically

# 3. Restart if needed (config/env changes)
# Use kill_server.ps1 + npm run dev
```

### Database Changes

```bash
# 1. Make SQL changes in Supabase dashboard
# 2. Save migration file in src/scripts/
# 3. Document in migration log
```

### Testing Changes

```bash
# 1. Test locally
npm run dev

# 2. Build for production
npm run build

# 3. Test production build
npm run start
```

---

## Support

For issues or questions:
- Email: justin@teklogic.net
- Check [AGENTS.md](../AGENTS.md) for debugging tips
- Review console logs for detailed error messages

---

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Rotate Supabase service role key
- [ ] Set up Supabase RLS policies properly
- [ ] Review and restrict admin access
- [ ] Enable Supabase auth email verification
- [ ] Set up monitoring and logging
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Review all environment variables
- [ ] Set up backup strategy

---

**Setup Complete!** 🎉

You now have a fully functional Teklogic Spark AI installation ready for development.

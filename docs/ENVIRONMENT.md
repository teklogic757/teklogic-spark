# Environment Variables Reference

Complete guide to all environment variables used in Teklogic Spark AI.

---

## Required Variables

These variables MUST be set for the application to function:

### Supabase Configuration

```env
# Your Supabase project URL
# Format: https://xxxxx.supabase.co
# Find: Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL=

# Supabase anonymous/public key (safe to expose in browser)
# Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Find: Supabase Dashboard → Settings → API → Project API keys → anon/public
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase service role key (KEEP SECRET - server-side only)
# Format: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Find: Supabase Dashboard → Settings → API → Project API keys → service_role
# Usage: Bypasses RLS policies for admin operations
SUPABASE_SERVICE_ROLE_KEY=
```

### OpenAI Configuration

```env
# OpenAI API key for AI evaluation
# Format: sk-proj-xxxxxxxxxxxxx
# Find: platform.openai.com → API keys
# Usage: Powers idea evaluation, scoring, and reframing
OPENAI_API_KEY=
```

---

## Optional Variables

These variables are optional but recommended for development/testing:

### Testing & Development

```env
# Override recipient email for all idea evaluations
# Useful for testing without spamming real users
# Format: any valid email address
# Example: TEST_EMAIL_OVERRIDE=justin@teklogic.net
TEST_EMAIL_OVERRIDE=

# Enable Next.js debug mode (shows detailed error messages)
# Values: true | false
# Default: false in production, true in development
DEBUG=false

# Node environment
# Values: development | production | test
# Default: Set automatically by Next.js
NODE_ENV=development
```

---

## Security Best Practices

### DO NOT expose in browser:

- ❌ `SUPABASE_SERVICE_ROLE_KEY` - Server-side only
- ❌ `OPENAI_API_KEY` - Server-side only

### Safe to expose in browser:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Public URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Client-safe key with RLS protection

### Protection Mechanisms:

1. **`.env.local` is in `.gitignore`** - Never committed to version control
2. **Next.js prefix convention** - Only `NEXT_PUBLIC_*` variables are exposed to browser
3. **Supabase RLS** - Even with anon key, Row-Level Security restricts data access
4. **Service role used sparingly** - Only for specific admin operations, not exposed to client

---

## Environment Files

### `.env.local` (Development)

Your local development environment variables. This file:
- ✅ Is gitignored
- ✅ Takes precedence over `.env`
- ✅ Should contain your actual credentials

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
OPENAI_API_KEY=sk-proj-xxxxx
TEST_EMAIL_OVERRIDE=justin@teklogic.net
```

### `.env.example` (Template)

Template file showing required variables (no actual values):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Testing
TEST_EMAIL_OVERRIDE=your_test_email@example.com
```

### Production Environment (Vercel)

Set these in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL` - Production Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Production anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Production service role (encrypted)
   - `OPENAI_API_KEY` - Production OpenAI key (encrypted)

**DO NOT** set `TEST_EMAIL_OVERRIDE` in production.

---

## Usage in Code

### Accessing Environment Variables

#### Client-Side (Browser)

```typescript
// Only NEXT_PUBLIC_* variables are accessible
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ❌ These will be undefined in browser:
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // undefined!
const openaiKey = process.env.OPENAI_API_KEY // undefined!
```

#### Server-Side (Server Components, API Routes, Server Actions)

```typescript
// All variables are accessible
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Works
const openaiKey = process.env.OPENAI_API_KEY // ✅ Works
```

### Type Safety

For better type safety, add to `next-env.d.ts`:

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    OPENAI_API_KEY: string
    TEST_EMAIL_OVERRIDE?: string
  }
}
```

---

## Variable Validation

### Runtime Validation

Add to `src/lib/env.ts`:

```typescript
function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY'
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Call at app startup
validateEnv()
```

---

## Troubleshooting

### Issue: Environment variables not loading

**Solutions:**

1. **Restart dev server** - Changes to `.env.local` require restart:
   ```bash
   .\kill_server.ps1 && npm run dev
   ```

2. **Check file name** - Must be exactly `.env.local` (not `.env.local.txt`)

3. **Check file location** - Must be in project root (same level as `package.json`)

4. **Check syntax** - No spaces around `=`:
   ```env
   # ✅ Correct
   OPENAI_API_KEY=sk-proj-xxx

   # ❌ Wrong
   OPENAI_API_KEY = sk-proj-xxx
   ```

### Issue: Variable is `undefined` in code

**Causes:**
1. **Client-side access to server-only variable** - Use `NEXT_PUBLIC_` prefix or move to server
2. **Typo in variable name**
3. **Server not restarted after adding variable**

### Issue: API key not working

**Solutions:**

1. **OpenAI API Key:**
   - Verify key starts with `sk-proj-`
   - Check billing is set up on OpenAI account
   - Test key directly: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

2. **Supabase Keys:**
   - Verify URL format: `https://xxxxx.supabase.co`
   - Check keys are from correct project
   - Regenerate keys if compromised

---

## Key Rotation

If keys are compromised:

### 1. Supabase Keys

1. Go to Supabase Dashboard → Settings → API
2. Click "Regenerate" next to the compromised key
3. Update `.env.local` with new key
4. Update production environment (Vercel)
5. Restart all services

### 2. OpenAI Key

1. Go to platform.openai.com → API keys
2. Revoke compromised key
3. Create new key
4. Update `.env.local` and production
5. Restart services

---

## Production Checklist

Before deploying to production:

- [ ] All required variables are set in Vercel
- [ ] Production keys are different from development
- [ ] `TEST_EMAIL_OVERRIDE` is NOT set in production
- [ ] `NODE_ENV=production` is set
- [ ] Service role key is encrypted in Vercel
- [ ] OpenAI key is encrypted in Vercel
- [ ] `.env.local` is in `.gitignore`
- [ ] No hardcoded secrets in code

---

## References

- [Next.js Environment Variables Docs](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Keys and Security](https://supabase.com/docs/guides/api/api-keys)
- [OpenAI API Keys](https://platform.openai.com/docs/quickstart)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated:** 2026-01-28

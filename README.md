# Teklogic Spark AI

A gamified AI idea submission platform that transforms AI adoption from an abstract initiative into a concrete, fun, and measurable team activity.

## 🎯 What is Spark AI?

Teklogic Spark AI is a lightweight system that keeps the energy of AI workshops alive inside your organization. It enables employees to submit AI ideas, examples, and documents specific to their role and environment. Over a focused period (like 14 days), people earn points, climb leaderboards, and compete for rewards based on the relevance and quality of their ideas.

### Key Value Propositions

- **Engagement**: Gamified submission process with points and leaderboards
- **AI-Powered Evaluation**: Automatic scoring and reframing of ideas using OpenAI GPT-4
- **Organization-Specific Context**: AI evaluations consider your industry, brand voice, and strategic context
- **Living Backlog**: Build a validated collection of AI opportunities specific to your organization
- **Multi-Tenant Architecture**: Support multiple organizations with customized branding

## 🏗️ Technical Stack

- **Framework**: Next.js 15.5 (App Router with Server Components)
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth (Email/Password + Magic Link)
- **AI**: OpenAI GPT-4o-mini for idea evaluation
- **Styling**: Tailwind CSS 4 + Shadcn/UI components
- **Deployment**: Vercel-ready

### Key Technologies

- React 19.2 (Server Components)
- TypeScript (Strict mode)
- Framer Motion (Animations)
- Sonner (Toast notifications)
- Next Themes (Dark mode support)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account
- OpenAI API key

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd teklogic-ideas
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Testing (Optional)
TEST_EMAIL_OVERRIDE=your_test_email@example.com
```

4. Set up the database:
```bash
# Run migrations using the Supabase CLI or SQL files in src/scripts/
# See SETUP.md for detailed database setup instructions
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
teklogic-ideas/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [client_id]/          # Multi-tenant routes
│   │   │   ├── dashboard/        # User dashboard
│   │   │   ├── submit/           # Idea submission
│   │   │   └── login/            # Client-specific login
│   │   ├── admin/                # Super admin area
│   │   ├── login/                # Global login page
│   │   └── auth/                 # Auth callbacks
│   ├── components/               # Reusable UI components
│   │   └── ui/                   # Shadcn components
│   ├── lib/
│   │   ├── supabase/             # Supabase client factories
│   │   │   ├── client.ts         # Browser client
│   │   │   └── server.ts         # Server client + admin client
│   │   ├── ai-evaluator.ts       # AI evaluation engine
│   │   └── utils.ts              # Utility functions
│   └── scripts/                  # Database migrations
├── public/                       # Static assets
├── supabase/                     # Supabase migrations
└── docs/                         # Additional documentation
```

## 🧠 AI Evaluation System

Spark AI includes a comprehensive AI evaluation system that automatically scores and enhances submitted ideas.

### Evaluation Criteria (Weighted)

1. **Impact Potential** (30%) - Efficiency gains, cost reduction, quality enhancement
2. **Feasibility** (25%) - Technical constraints and organizational readiness
3. **Scalability** (20%) - Cross-department benefits and process scaling
4. **Innovation** (15%) - Creativity and novel approaches
5. **Clarity** (10%) - Problem and solution definition quality

### Features

- **Automatic Scoring**: 0-100 point scale based on weighted criteria
- **Idea Reframing**: AI rewrites ideas for clarity and impact
- **Key Benefits**: Extracts 3-5 core benefits of implementation
- **Related Suggestions**: Generates 3 related automation ideas
- **Email Delivery**: HTML email with evaluation results
- **Organization Context**: Considers industry, brand voice, budget, and strategy

### How It Works

When a user submits an idea:

1. System fetches organization context (industry, budget, employee count, etc.)
2. OpenAI GPT-4o-mini evaluates the idea against standard criteria
3. AI generates:
   - Overall score (0-100)
   - Criterion-by-criterion breakdown
   - Reframed idea title and description
   - Key benefits list
   - 3 related automation suggestions
4. Results are saved to the database
5. Email is sent to the submitter with detailed evaluation

## 🔐 Authentication & Multi-Tenancy

### Global vs. Client-Specific Login

- **Global Login** (`/login`): Users log in with email/password or magic link
- **Auto-Routing**: System determines user's organization and redirects to their dashboard
- Users are pre-affiliated with organizations (no organization selection needed)

### Multi-Tenant Architecture

- **Dynamic Routes**: `[client_id]` parameter provides organization context
- **Row-Level Security**: Supabase RLS policies restrict data access by organization
- **Service Role Client**: Special admin client bypasses RLS for critical operations (see AGENTS.md)

## 🎨 UI/UX Design

### Design System

- **Theme**: Dark mode with cyan (#00A4E4) and navy (#003E57) accents
- **Style**: Glassmorphism with subtle grid backgrounds
- **Animations**: Framer Motion for smooth transitions
- **Typography**: Geist Sans and Geist Mono fonts
- **Components**: Custom Shadcn/UI components with Teklogic branding

### Key Pages

1. **Login Page**: Clean, centered login form with magic link option
2. **Dashboard**: User stats, idea list, and top ideas sidebar
3. **Submit Page**: Multi-step form with file upload support
4. **Admin Area**: Organization and user management

## 🛠️ Development

### Database Migrations

Database migrations are located in `src/scripts/`. Key files:

- `001_initial_schema.sql` - Base tables and RLS policies
- `002_add_ai_fields.sql` - AI evaluation columns
- `003_*.sql` - Additional migrations

### Key Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📊 Database Schema

### Core Tables

- **organizations**: Multi-tenant organization data with branding and context
- **users**: Public user profiles linked to Supabase Auth
- **ideas**: Submitted ideas with AI evaluation data
- **invites**: Organization invitation system

### AI Evaluation Fields

Each idea includes:
- `ai_score`: Overall score (0-100)
- `ai_reframed_text`: AI-enhanced idea description
- `ai_feedback`: Evaluation summary
- `ai_analysis_json`: Detailed criteria scores and suggestions

## 🚧 Known Issues & Limitations

### Turbopack Compatibility (Resolved)

- **Issue**: Next.js 16 with Turbopack had Windows path resolution bugs
- **Solution**: Downgraded to Next.js 15 (stable webpack-based builds)

### RLS and Admin Client

- **Issue**: Restrictive RLS policies can cause infinite redirect loops
- **Solution**: Service role client (`createAdminClient`) bypasses RLS for critical reads
- **Best Practice**: Use admin client sparingly, only for organization lookups

## 🗺️ Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed feature planning.

### Recently Completed ✅

- [x] AI-powered idea evaluation with organization context
- [x] Email delivery of evaluation results
- [x] Global login with auto-routing to user's organization
- [x] Multi-tenant architecture with dynamic routing
- [x] Admin area for organization/user management

### Up Next 🔜

- [ ] Voting system for ideas
- [ ] Comment threads on ideas
- [ ] Leaderboard with points tracking
- [ ] Campaign management (time-bound submission periods)

## 📚 Additional Documentation

- [AGENTS.md](./AGENTS.md) - Detailed technical context for AI agents
- [SETUP.md](./docs/SETUP.md) - Complete setup guide

## 🤝 Contributing

This is a private project for Teklogic. For questions or support, contact justin@teklogic.net.

## 📄 License

Proprietary - © 2026 Teklogic

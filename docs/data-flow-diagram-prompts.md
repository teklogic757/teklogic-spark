# Data Flow Diagram Prompts

These prompts are written for image-generation or diagram-generation tools. They describe the software as it exists today, not the future-state roadmap.

## Executive Overview Prompt

Create a polished executive-level data flow diagram for a software platform called "Teklogic Spark AI." The diagram should be clean, modern, presentation-ready, and easy for non-technical business leaders to understand. Show the product as a multi-tenant web platform that helps organizations capture and evaluate employee AI ideas after workshops.

Include these main entities and flows:

- Employees and workshop participants enter the platform through login or workshop access.
- Users submit AI and automation ideas through a web application.
- The platform sends each idea through an AI evaluation layer that scores the idea, rewrites it for clarity, and generates feedback.
- The evaluated idea is stored in the platform database as part of an organization-specific idea backlog.
- Results appear in dashboards, leaderboards, and contest views for engagement.
- Administrators manage organizations, users, invites, workshop access, and training content through an admin portal.
- The platform sends emails such as welcome emails, idea review emails, admin notifications, and contest digest emails.

Show the system as these major blocks:

- Users
- Spark AI Web Platform
- AI Evaluation Engine
- Organization Database
- Admin Portal
- Email Delivery

Use arrows with plain-English labels such as "submit idea," "score and enrich idea," "store idea and feedback," "show dashboards and rankings," and "send notifications." Keep the diagram high-level, strategic, and visually clear. Avoid low-level implementation details like APIs, tables, cookies, or specific libraries.

## Technical Overview Prompt

Create a detailed technical data flow diagram for a system called "Teklogic Spark AI." The style should be clean, modern, and suitable for engineering documentation. Show the software as it exists today, using a web application built with Next.js, Supabase, OpenAI, and email providers. The diagram should emphasize request flow, core services, and data movement between components.

Include these actors and components:

- Authenticated employee user
- Workshop guest user
- Super admin user
- Browser client
- Next.js App Router application
- Middleware layer
- Server components and server actions
- Tenant routing using client_id organization slug
- Supabase Auth
- Supabase Postgres database
- Supabase Storage for attachments
- OpenAI evaluation service
- Email service layer using SMTP or Resend
- Contest digest cron route

Show these main flows:

1. Login flow:
- user enters global login
- Next.js server action checks Supabase Auth
- user is routed to the correct tenant dashboard

2. Tenant dashboard flow:
- request enters middleware
- tenant context is resolved
- dashboard server component loads organization, user, ideas, leaderboard, and training resources from Supabase

3. Idea submission flow:
- user or workshop guest submits idea form
- server action normalizes and validates input
- rate limiter checks submission eligibility
- organization context is loaded
- OpenAI evaluates the idea
- attachment is uploaded to Supabase Storage if present
- idea record is stored in Supabase Postgres
- user score is updated
- post-persist email workflow sends review/admin notifications

4. Admin flow:
- super admin accesses admin routes
- admin actions manage organizations, users, invites, workshops, training videos, and attachment access
- audit events are recorded for sensitive admin operations

5. Background flow:
- cron route triggers weekly contest digest generation
- digest reads leaderboard and idea data
- digest emails are sent through the email service

Also show supporting cross-cutting components:

- env validation and site URL policy
- prompt sanitization before AI calls
- leaderboard service
- training video access service
- audit log service

Label the main storage areas clearly:

- organizations
- users
- ideas
- invitations
- workshop access codes
- training videos

Make the diagram structured in layers from top to bottom:

- users
- browser/client
- Next.js application layer
- service layer
- external systems and storage

Use directional arrows and technical labels like "auth session lookup," "tenant resolution," "AI evaluation request," "persist idea," "upload attachment," "send email," "read leaderboard data," and "write audit event." Keep it detailed, but visually organized and readable.

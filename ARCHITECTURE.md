# Architecture

> SkaiScraper — AI Command Center for Storm Restoration & Trades Operations

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js App Router (React 18 + Server Components)       │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌────────────────────┐ │   │
│  │  │ Pro Dashboard│ │Client Portal│ │ Marketing / Public │ │   │
│  │  │  (app)       │ │  portal/    │ │  (marketing)       │ │   │
│  │  └──────┬──────┘ └──────┬──────┘ └────────────────────┘ │   │
│  │         │               │                                │   │
│  │  ┌──────┴───────────────┴──────────────────────────────┐ │   │
│  │  │           Clerk Middleware (Identity Router)          │ │   │
│  │  │  • Pro users → /dashboard, /claims, /trades          │ │   │
│  │  │  • Clients  → /portal                                │ │   │
│  │  │  • Public   → /, /features, /sign-in                 │ │   │
│  │  └──────────────────────┬──────────────────────────────┘ │   │
│  └─────────────────────────┼────────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐   ┌───────▼──────┐   ┌──────▼──────┐
    │  Supabase  │   │   OpenAI     │   │   Stripe    │
    │  Postgres  │   │   GPT-4o     │   │  Payments   │
    │  + Storage │   │   Vision     │   │  Billing    │
    └───────────┘   └──────────────┘   └─────────────┘
```

## Tech Stack

| Layer          | Technology               | Purpose                                  |
| -------------- | ------------------------ | ---------------------------------------- |
| **Framework**  | Next.js 14 (App Router)  | Full-stack React with RSC                |
| **Language**   | TypeScript               | Type safety across the stack             |
| **Styling**    | Tailwind CSS + shadcn/ui | Design system + component library        |
| **Auth**       | Clerk                    | Identity, MFA, session management        |
| **Database**   | PostgreSQL (Supabase)    | 243 Prisma models                        |
| **ORM**        | Prisma                   | Type-safe database access                |
| **Storage**    | Supabase Storage         | Photos, documents, uploads               |
| **AI**         | OpenAI GPT-4o + Vision   | Damage narratives, supplements, analysis |
| **Payments**   | Stripe                   | Subscriptions, token packs, invoicing    |
| **Email**      | Resend + React Email     | Transactional notifications              |
| **Monitoring** | Sentry                   | Error tracking (server, edge, client)    |
| **Hosting**    | Vercel                   | Edge deployment, serverless functions    |
| **Animation**  | Framer Motion            | Marketing page interactions              |

## Core Modules

### 1. AI Damage Builder

- Upload property photos → GPT-4o Vision analysis
- Generates structured damage narratives with measurements
- Auto-saves to claim records, exports to branded PDF

### 2. Weather Intelligence

- Iowa Mesonet + NOAA radar integration
- Property-level storm verification with confidence scoring
- Date-of-loss validation for insurance claims

### 3. Claims Workspace

- Full claim lifecycle: intake → inspection → AI analysis → supplement → close
- Multi-tab workspace: Overview, Photos, AI Narrative, Weather, Timeline
- Ready Folder with digital signatures and document packaging

### 4. Smart Supplements

- AI-assisted supplement generation for carrier negotiations
- Code compliance checking, missed-trade detection
- Appeal history tracking

### 5. Trades Network (Procurement)

- Vendor marketplace with 93+ seeded professionals
- AI-powered contractor matching by trade, proximity, rating
- Materials ordering + job-to-vendor attachment

### 6. Client Portal

- Branded portal for homeowners/property owners
- Project tracking, photo uploads, messaging, approvals
- Social profile with activity feed

### 7. Built-in Messaging

- Real-time messaging between pros and clients
- Thread-based conversations per claim/job
- File attachments and read receipts

### 8. Batch Proposals & Reports

- Template-based proposal generation with brand customization
- PDF export engine with digital signatures
- Report history and version tracking

### 9. Billing & Tokens

- Stripe subscription management (plans, trials, upgrades)
- Token-based AI usage metering
- Usage analytics and billing history

## Multi-Tenant Architecture

```
Organization (Prisma)
├── Users (Pro members via Clerk)
├── Claims
│   ├── Photos & Documents (Supabase Storage)
│   ├── AI Narratives (GPT-4o)
│   ├── Weather Reports (NOAA)
│   └── Timeline Events
├── Jobs (Retail + Insurance)
├── Leads & Pipeline
├── Vendor Connections
├── Templates & Branding
└── Billing (Stripe Customer)
```

All data queries are scoped to the authenticated user's organization via Prisma middleware. No cross-tenant data leakage is possible at the ORM layer.

## Route Architecture

| Surface         | Route Group     | Auth       | Purpose                    |
| --------------- | --------------- | ---------- | -------------------------- |
| Pro Dashboard   | `(app)/*`       | Required   | Main contractor workspace  |
| Client Portal   | `portal/*`      | Required   | Homeowner/client view      |
| Marketing       | `(marketing)/*` | Public     | Landing, features, pricing |
| Public Profiles | `(public)/*`    | Public     | Vendor/trade public pages  |
| API             | `api/*`         | Mixed      | Backend endpoints          |
| Admin           | `admin/*`       | Admin only | System administration      |

## AI Orchestration

```
User Input (photos, property data, scope)
        │
        ▼
┌───────────────────┐
│  AI Router        │ ← Determines which AI pipeline to invoke
├───────────────────┤
│ • Damage Builder  │ → GPT-4o Vision + structured narrative
│ • Supplement Gen  │ → GPT-4o + code compliance rules
│ • Weather Verify  │ → NOAA API + confidence scoring
│ • Vendor Match    │ → Proximity + trade + rating algorithm
│ • PDF Generation  │ → Template engine + brand overlay
└───────────────────┘
        │
        ▼
  Stored in claim record → Available in workspace → Exportable as PDF
```

## Platform Expansion: SkaiStack™

SkaiScraper is the first product in the **SkaiStack Intelligence Platform**:

| Product          | Status         | Description                             |
| ---------------- | -------------- | --------------------------------------- |
| **SkaiScraper**  | ✅ Live        | AI command center for trades operations |
| **EyAi Inspect** | 🔜 Coming Soon | Drone + satellite damage detection      |
| **BirdsEyAi**    | 🔜 Coming Soon | Aerial property intelligence            |

## Database Schema

- **243 Prisma models** covering claims, jobs, leads, vendors, users, organizations, billing, templates, messages, and more
- PostgreSQL with Row-Level Security (RLS) via Supabase
- Migrations managed via raw SQL files in `db/migrations/`

## Infrastructure

```
GitHub (main branch)
    │
    ▼ (auto-deploy)
Vercel Production
    ├── Edge Middleware (auth + routing)
    ├── Serverless Functions (API routes)
    ├── Static Assets (marketing pages)
    └── ISR (Incremental Static Regeneration)
```

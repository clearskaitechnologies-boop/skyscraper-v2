# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in SkaiScraper, please report it responsibly:

**Email:** security@clearskaitechnologies.com

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment

We will acknowledge receipt within 48 hours and provide a detailed response within 5 business days.

## Security Architecture

### Authentication

- **Provider:** [Clerk](https://clerk.com) (SOC 2 Type II certified)
- **Method:** Identity-based routing via middleware — Pro users, Client portal users, and public visitors are routed to isolated surfaces
- **Session Management:** Clerk-managed JWTs with automatic refresh
- **MFA:** Supported via Clerk configuration

### Authorization

- **Middleware Layer:** Single authority for route protection — no layout-level redirects across surfaces
- **API Routes:** Return JSON 401 for unauthenticated requests (no HTML redirect leaks)
- **Role Isolation:** Pro dashboard, Client portal, and Admin surfaces are fully separated
- **Organization Scoping:** All data queries are scoped to the authenticated user's organization via Prisma

### Environment & Secrets

- All secrets are stored in environment variables (Vercel project settings)
- No hardcoded API keys, tokens, or secrets in source code
- `.env.example` documents all required variables without exposing values
- Secrets are never logged or included in client bundles (`NEXT_PUBLIC_` prefix is only used for non-sensitive config)

### Debug & Development Routes

- All debug, diagnostic, and test routes are **disabled in production** via filesystem isolation (`_disabled/` convention)
- Routes prefixed with `_disabled/` are excluded from Next.js App Router builds
- No development tooling is accessible on the production domain

### Data Protection

- **Database:** PostgreSQL via Supabase with Row-Level Security (RLS) policies
- **ORM:** Prisma with organization-scoped queries
- **File Storage:** Supabase Storage with authenticated upload/download policies
- **Encryption:** TLS in transit (Vercel edge), AES-256 at rest (Supabase)

### Third-Party Integrations

| Service  | Purpose             | Security Posture                    |
| -------- | ------------------- | ----------------------------------- |
| Clerk    | Authentication      | SOC 2 Type II                       |
| Supabase | Database + Storage  | SOC 2 Type II                       |
| Stripe   | Payments            | PCI DSS Level 1                     |
| OpenAI   | AI processing       | Enterprise API, no training on data |
| Resend   | Transactional email | SOC 2                               |
| Sentry   | Error monitoring    | SOC 2 Type II                       |
| Vercel   | Hosting + Edge      | SOC 2 Type II                       |

### Monitoring & Incident Response

- **Error Tracking:** Sentry with source maps (server + edge + client)
- **Health Endpoints:** `/api/health/live` and `/api/health/ready` for uptime monitoring
- **Audit Trail:** Claim edits, AI outputs, and procurement events are logged with timestamps and user IDs

### Security Headers

- Configured via `next.config.mjs` and `security-headers.js`
- Content Security Policy (CSP)
- Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### Compliance Roadmap

- [x] Authentication with MFA support
- [x] Organization-scoped data isolation
- [x] Secrets management via environment variables
- [x] Debug routes disabled in production
- [x] Security headers configured
- [x] Error monitoring with Sentry
- [ ] SOC 2 Type II audit (planned)
- [ ] Penetration testing (planned)
- [ ] GDPR data export/deletion workflows (planned)

## Known Lint Warnings

The following lint warnings are **expected and intentional**:

- **Dynamic inline styles** (16 instances): Runtime-computed values for progress bars, dynamic brand colors, and map container heights require inline `style` attributes. These cannot be converted to static Tailwind classes.
- **ARIA numeric values** (1 instance): React correctly passes numeric values to `aria-valuenow`, `aria-valuemin`, `aria-valuemax` attributes. The ESLint rule flags these as false positives.

## Supported Versions

| Version       | Supported |
| ------------- | --------- |
| Latest (main) | ✅        |
| Older commits | ❌        |

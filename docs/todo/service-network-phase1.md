# Service Network — Phase 1 (Plans, Tokens, Billing) — TODO

Summary
Implement token packs, token ledger, billing integration (Stripe), and plan enforcement.

High-level tasks

- DB migrations (plans, token_packs, token_ledger, usage_events) — done (see scripts/migrations)
- Prisma schema and client wiring — prisma/schema.prisma (added)
- API endpoints
  - /api/tokens/purchase.ts — purchase/credit token packs (this repo)
  - /api/tokens/consume.ts — consume/debit tokens for usage
  - /api/messages/send.ts — messaging endpoint that debits tokens
- Stripe integration
  - Create /api/payments/create-session
  - Webhook handler to validate and credit token_ledger
- Tests
  - scripts/verify-token-flow.js — basic smoke flow (added)
  - Playwright E2E to cover job posting, message sending, ledger changes

Acceptance criteria

- Token purchases create TokenLedger rows and update balances
- Token consumes create TokenLedger rows and prevent negative balances
- Messaging consumes tokens and inserts messages
- Sentry + audit logs capture server errors and ledger changes

Estimates & owners

- Backend: 2 engineers (2w)
- Frontend: 1 engineer (1w)
- QA: 1 engineer (0.5w)

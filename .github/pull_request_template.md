## Goal

Wire Intake A cover → PDF parity, branding co-logo, DOL/AI usage + overage billing.

## Checks

- [ ] RLS blocks cross-org
- [ ] DOL count vs plan limits
- [ ] AI mockup overage charges
- [ ] Cover preview == PDF (tokens)
- [ ] Stripe webhook updates plan + resets pending

Describe changes and any manual steps required for deploy or migration.

Notes:

- Supabase functions deployed: dol-pull, generate-mockup, generate-pdf, stripe-webhook
- Buckets required: branding, team, mockups, documents

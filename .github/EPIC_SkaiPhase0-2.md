# EPIC: SkaiScraper™ Phase 0–2 — UI polish, Pricing+Tokens, Service Network MVP

## Executive Summary

Deliver investor-ready UI, enforce pricing/usage with tokens, and launch the Service Network™ MVP (Arizona pilot). Preserve PDF ↔ Preview parity, carrier logic, and weather/DOL integrations. Instrument the product with observability, CI gates and runbooks so production is supportable.

## Scope

- Phase 0: Public UI polish, top-nav restructure, branded A–F previews, accessibility and asset versioning
- Phase 1: Plans & token economy, token packs + Stripe Checkout skeleton, usage metering and enforcement
- Phase 2: Service Network MVP — directory, job posts, bidding, messaging, and connections (AZ pilot)

## Success Criteria

- Lighthouse score ≥ 90 on `/reports/preview`
- CI brand-guard: no occurrences of the typo "SkaiScrape" (ripgrep check)
- Token & plan gates reliably block or allow actions (posts/outreach/meetings) per plan limits
- Network: searchable contractor directory + job posting + messaging with connection state (AZ pilot)

## Links

- Design/briefs: (add link)
- Tech spec: (add link)
- Roadmap doc: (add link)

## Sub-issues

- [ ] Phase 0: UI polish & nav
- [ ] Phase 0: A–F preview asset integration
- [ ] Phase 1: Plans + token ledger + usage_events
- [ ] Phase 1: Stripe + token packs
- [ ] Phase 2: Contractor directory + profiles
- [ ] Phase 2: Job posts + bids + outreach limits
- [ ] Phase 2: Messaging + connection state (free after connect)
- [ ] S3/MinIO storage for PDFs & previews
- [ ] CI: ripgrep brand guard, Playwright baselines, LHCI ≥ 90
- [ ] Observability: logs, metrics, traces, alerts
- [ ] Security: least-privileged tokens, secrets scanning

## Labels

type:epic, area:ui, area:billing, area:network, priority:P0

## Owner

@DamienWillingham

---

Create this EPIC as a parent issue and then create and link the sub-issues under Development → Link issues. Use the GH CLI script in `scripts/GH_CLI_commands_create_issues_and_milestones.sh` to create sub-issues and milestones quickly.

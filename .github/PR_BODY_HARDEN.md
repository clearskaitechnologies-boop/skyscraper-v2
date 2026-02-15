### Summary

Phase0/1 integration: signed uploads, worker harness (STOP_AFTER_ONE), token APIs (credit/debit), A–F preview parity components, TopNav, migrations, and ops/runbooks.

### Verification

- `pnpm install && npx prisma generate`
- Apply migrations (see VS Code Tasks → 02)
- `pnpm dev` (http://localhost:3000)
- Insert test row (Task 05), run worker once (Task 04)
- Tokens: call purchase/consume (Tasks 06/07)
- Storybook & Playwright baselines (Tasks 08/09)
- LHCI ≥ 90 (Task 10)

### Notes

- Stripe/Webhooks skeleton present; do not enable in prod until keys + test pass
- MOCK_LOVABLE flag to simulate AI provider

# API Endpoints Audit Report

**Generated:** 2025-12-25T13:12:49.341Z

## Summary

- Total Endpoints: 735
- Protected: 578
- Unprotected: 157
- Edge Runtime: 0
- Node.js Runtime: 735
- Issues: 185

## ⚠️ HIGH Priority Issues

- **/api/_meta**: No try-catch error handling
- **/api/activity/claim/:id**: Claim endpoint without claim access verification
- **/api/activity/list**: No try-catch error handling
- **/api/agents/claims-analysis**: Claim endpoint without claim access verification
- **/api/ai/claim-assistant**: Claim endpoint without claim access verification
- **/api/ai/claim-writer**: Claim endpoint without claim access verification
- **/api/ai/dispatch/:claimId**: Claim endpoint without claim access verification
- **/api/ai/estimate/:claimId**: Claim endpoint without claim access verification
- **/api/ai/health**: No try-catch error handling
- **/api/ai/orchestrate/:claimId**: Claim endpoint without claim access verification
- **/api/ai/supplement/:claimId**: Claim endpoint without claim access verification
- **/api/analytics/claims-status**: Claim endpoint without claim access verification
- **/api/analytics/claims-timeline**: Claim endpoint without claim access verification
- **/api/approvals/claim/:id**: Claim endpoint without claim access verification
- **/api/auth/debug**: No try-catch error handling
- **/api/billing/token-pack/checkout**: No try-catch error handling
- **/api/billing/tokens/checkout**: No try-catch error handling
- **/api/branding**: No try-catch error handling
- **/api/build-info**: No try-catch error handling
- **/api/build-verify**: No try-catch error handling
- **/api/carrier/export/zip**: No try-catch error handling
- **/api/carrier/track/:trackingId/:action**: No try-catch error handling
- **/api/checkout**: No try-catch error handling
- **/api/checkout/token-pack**: No try-catch error handling
- **/api/claim-approvals**: Claim endpoint without claim access verification
- **/api/claims/:claimId/ai/rebuttal**: Claim endpoint without claim access verification
- **/api/claims/:claimId/ai**: Claim endpoint without claim access verification
- **/api/claims/:claimId/ai/summary**: Claim endpoint without claim access verification
- **/api/claims/:claimId/ai-reports**: Claim endpoint without claim access verification
- **/api/claims/:claimId/appeal**: Claim endpoint without claim access verification
- **/api/claims/:claimId/assets-with-meta**: Claim endpoint without claim access verification
- **/api/claims/:claimId/attach-contact**: Claim endpoint without claim access verification
- **/api/claims/:claimId/automation/analyze**: Claim endpoint without claim access verification
- **/api/claims/:claimId/bad-faith**: Claim endpoint without claim access verification
- **/api/claims/:claimId/carrier-summary**: Claim endpoint without claim access verification
- **/api/claims/:claimId/code**: Claim endpoint without claim access verification
- **/api/claims/:claimId/context**: Claim endpoint without claim access verification
- **/api/claims/:claimId/cover-photo**: Claim endpoint without claim access verification
- **/api/claims/:claimId/depreciation/export**: Claim endpoint without claim access verification
- **/api/claims/:claimId/dol**: Claim endpoint without claim access verification
- **/api/claims/:claimId/events**: Claim endpoint without claim access verification
- **/api/claims/:claimId/evidence/collections/:sectionKey**: Claim endpoint without claim access verification
- **/api/claims/:claimId/evidence**: Claim endpoint without claim access verification
- **/api/claims/:claimId/evidence/upload**: Claim endpoint without claim access verification
- **/api/claims/:claimId/files/:fileId**: Claim endpoint without claim access verification
- **/api/claims/:claimId/generate-report**: Claim endpoint without claim access verification
- **/api/claims/:claimId/import**: Claim endpoint without claim access verification
- **/api/claims/:claimId/invite**: Claim endpoint without claim access verification
- **/api/claims/:claimId/invite-client**: Claim endpoint without claim access verification
- **/api/claims/:claimId/messages**: Claim endpoint without claim access verification
- **/api/claims/:claimId/narrative**: Claim endpoint without claim access verification
- **/api/claims/:claimId/notes**: Claim endpoint without claim access verification
- **/api/claims/:claimId/permissions**: Claim endpoint without claim access verification
- **/api/claims/:claimId/predict**: Claim endpoint without claim access verification
- **/api/claims/:claimId/rebuttal-builder**: Claim endpoint without claim access verification
- **/api/claims/:claimId/report/pdf**: Claim endpoint without claim access verification
- **/api/claims/:claimId/report**: Claim endpoint without claim access verification
- **/api/claims/:claimId**: Claim endpoint without claim access verification
- **/api/claims/:claimId/send-to-adjuster**: Claim endpoint without claim access verification
- **/api/claims/:claimId/status**: Claim endpoint without claim access verification
- **/api/claims/:claimId/supplement/:supplementId/download**: Claim endpoint without claim access verification
- **/api/claims/:claimId/supplement/:supplementId/excel**: Claim endpoint without claim access verification
- **/api/claims/:claimId/supplement**: Claim endpoint without claim access verification
- **/api/claims/:claimId/supplements/items**: No try-catch error handling
- **/api/claims/:claimId/supplements/items**: Claim endpoint without claim access verification
- **/api/claims/:claimId/supplements**: Claim endpoint without claim access verification
- **/api/claims/:claimId/tasks/from-actions**: Claim endpoint without claim access verification
- **/api/claims/:claimId/tasks**: Claim endpoint without claim access verification
- **/api/claims/:claimId/timeline**: Claim endpoint without claim access verification
- **/api/claims/:claimId/toggle-visibility**: Claim endpoint without claim access verification
- **/api/claims/:claimId/trade-partners/:id**: Claim endpoint without claim access verification
- **/api/claims/:claimId/trade-partners**: Claim endpoint without claim access verification
- **/api/claims/:claimId/trades**: Claim endpoint without claim access verification
- **/api/claims/:claimId/weather/refresh**: Claim endpoint without claim access verification
- **/api/claims/:claimId/weather**: Claim endpoint without claim access verification
- **/api/claims/:claimId/workspace**: Claim endpoint without claim access verification
- **/api/claims/ai/build**: Claim endpoint without claim access verification
- **/api/claims/ai/detect**: Claim endpoint without claim access verification
- **/api/claims/create**: Claim endpoint without claim access verification
- **/api/claims/document/upload**: Claim endpoint without claim access verification
- **/api/claims/files/upload**: Claim endpoint without claim access verification
- **/api/claims/generate-packet**: Claim endpoint without claim access verification
- **/api/claims/intake**: Claim endpoint without claim access verification
- **/api/claims/list**: Claim endpoint without claim access verification
- **/api/claims/list-lite**: Claim endpoint without claim access verification
- **/api/claims/materials**: No try-catch error handling
- **/api/claims/materials**: Claim endpoint without claim access verification
- **/api/claims/resume**: Claim endpoint without claim access verification
- **/api/claims**: Claim endpoint without claim access verification
- **/api/claims/save**: Claim endpoint without claim access verification
- **/api/claims/start**: Claim endpoint without claim access verification
- **/api/claims/state**: Claim endpoint without claim access verification
- **/api/claims/timeline/add**: Claim endpoint without claim access verification
- **/api/claims/update**: Claim endpoint without claim access verification
- **/api/claims/weather/auto**: Claim endpoint without claim access verification
- **/api/config**: No try-catch error handling
- **/api/dashboard/metrics**: No try-catch error handling
- **/api/debug/env-check**: No try-catch error handling
- **/api/deploy-info/_deploy**: No try-catch error handling
- **/api/deploy-info**: No try-catch error handling
- **/api/dev/throw**: No try-catch error handling
- **/api/diag/ai**: No try-catch error handling
- **/api/diag/env**: No try-catch error handling
- **/api/diag/ping**: No try-catch error handling
- **/api/diag/ready**: No try-catch error handling
- **/api/diagnostics/routes**: No try-catch error handling
- **/api/dol-check**: No try-catch error handling
- **/api/dol-pull**: No try-catch error handling
- **/api/generate-mockup**: No try-catch error handling
- **/api/generate-pdf**: No try-catch error handling
- **/api/geocode**: No try-catch error handling
- **/api/headers-debug**: No try-catch error handling
- **/api/health/drift-metrics**: No try-catch error handling
- **/api/health/env**: No try-catch error handling
- **/api/health/maps**: No try-catch error handling
- **/api/health/startup**: No try-catch error handling
- **/api/health-check/maps**: No try-catch error handling
- **/api/intel/claims-packet**: Claim endpoint without claim access verification
- **/api/legal/status**: No try-catch error handling
- **/api/me/network-metrics**: No try-catch error handling
- **/api/notifications/mark-all**: No try-catch error handling
- **/api/notifications**: No try-catch error handling
- **/api/notify/send**: No try-catch error handling
- **/api/pdf/generate**: No try-catch error handling
- **/api/portal/resolve-token**: No try-catch error handling
- **/api/reports/claims/:claimId/pdf**: Claim endpoint without claim access verification
- **/api/retail/items**: No try-catch error handling
- **/api/routes/optimize**: No try-catch error handling
- **/api/share/create**: No try-catch error handling
- **/api/test-rate-limit**: No try-catch error handling
- **/api/tokens/balance**: No try-catch error handling
- **/api/trades/attach-to-claim**: Claim endpoint without claim access verification
- **/api/trades/connections**: No try-catch error handling
- **/api/trades/engage**: No try-catch error handling
- **/api/trades/list**: No try-catch error handling
- **/api/trades/messages**: No try-catch error handling
- **/api/trades/onboard**: No try-catch error handling
- **/api/trades/posts**: No try-catch error handling
- **/api/trades/update**: No try-catch error handling
- **/api/weather/cron-daily**: No try-catch error handling

## All Endpoints

| Path | Methods | Auth | Runtime | Issues |
|------|---------|------|---------|--------|
| /api/__truth | GET | ❌ | nodejs | ⚠️ 1 |
| /api/_build | GET | ❌ | nodejs | ⚠️ 1 |
| /api/_demo/seed | GET, POST | ✅ | nodejs | ✅ |
| /api/_diag | GET | ✅ | nodejs | ✅ |
| /api/_meta | GET | ❌ | nodejs | ⚠️ 2 |
| /api/_wip/report | GET, PATCH | ✅ | nodejs | ✅ |
| /api/_wip/report/pdf | GET | ✅ | nodejs | ✅ |
| /api/activity | GET, POST | ✅ | nodejs | ✅ |
| /api/activity/claim/:id | GET | ✅ | nodejs | ⚠️ 1 |
| /api/activity/list | GET | ❌ | nodejs | ⚠️ 1 |
| /api/admin/force-open | POST | ✅ | nodejs | ✅ |
| /api/admin/launch-status | GET | ✅ | nodejs | ✅ |
| /api/admin/metrics | GET | ✅ | nodejs | ✅ |
| /api/admin/purge-cache | POST | ✅ | nodejs | ✅ |
| /api/admin/report-metrics | GET | ✅ | nodejs | ✅ |
| /api/admin/revalidate | POST | ✅ | nodejs | ✅ |
| /api/admin/tokens | GET | ✅ | nodejs | ✅ |
| /api/admin/tokens/refill | POST | ✅ | nodejs | ✅ |
| /api/admin/tokens/reset | POST | ✅ | nodejs | ✅ |
| /api/admin/tokens/simulate-reset | POST | ✅ | nodejs | ✅ |
| /api/admin/wallet | POST | ✅ | nodejs | ✅ |
| /api/agents/claims-analysis | POST | ✅ | nodejs | ⚠️ 1 |
| /api/ai/3d | GET, POST | ✅ | nodejs | ✅ |
| /api/ai/agents | GET, POST | ✅ | nodejs | ✅ |
| /api/ai/analyze-damage | POST | ✅ | nodejs | ✅ |
| /api/ai/assistant | POST | ✅ | nodejs | ✅ |
| /api/ai/chat | POST | ✅ | nodejs | ✅ |
| /api/ai/claim-assistant | POST | ✅ | nodejs | ⚠️ 1 |
| /api/ai/claim-writer | POST | ✅ | nodejs | ⚠️ 1 |
| /api/ai/damage | POST | ✅ | nodejs | ✅ |
| /api/ai/damage-builder |  | ✅ | nodejs | ✅ |
| /api/ai/damage/analyze | POST | ✅ | nodejs | ✅ |
| /api/ai/damage/export | POST | ✅ | nodejs | ✅ |
| /api/ai/damage/upload | POST | ✅ | nodejs | ✅ |
| /api/ai/dashboard-assistant | POST | ✅ | nodejs | ✅ |
| /api/ai/depreciation/export-pdf | POST | ✅ | nodejs | ✅ |
| /api/ai/dispatch/:claimId | POST | ✅ | nodejs | ⚠️ 1 |
| /api/ai/domain | GET, POST | ✅ | nodejs | ✅ |
| /api/ai/enhanced-report-builder | POST | ✅ | nodejs | ✅ |
| /api/ai/estimate-value | POST | ✅ | nodejs | ✅ |
| /api/ai/estimate/:claimId | POST | ✅ | nodejs | ⚠️ 1 |
| /api/ai/geometry/detect-slopes | POST | ✅ | nodejs | ✅ |
| /api/ai/health | GET | ❌ | nodejs | ⚠️ 2 |
| /api/ai/history | GET | ✅ | nodejs | ✅ |
| /api/ai/insights | GET | ✅ | nodejs | ✅ |
| /api/ai/insights/real | GET | ✅ | nodejs | ✅ |
| /api/ai/insights/snapshot/generate | POST | ✅ | nodejs | ✅ |
| /api/ai/insights/snapshot/latest | GET | ✅ | nodejs | ✅ |
| /api/ai/inspect | POST | ✅ | nodejs | ✅ |
| /api/ai/logs | GET | ✅ | nodejs | ✅ |
| /api/ai/mockup |  | ✅ | nodejs | ✅ |
| /api/ai/orchestrate/:claimId | GET | ✅ | nodejs | ⚠️ 1 |
| /api/ai/product-context | GET | ❌ | nodejs | ✅ |
| /api/ai/proposals/run | POST | ✅ | nodejs | ✅ |
| /api/ai/rebuttal | POST | ✅ | nodejs | ✅ |
| /api/ai/rebuttal/export-pdf | POST | ✅ | nodejs | ✅ |
| /api/ai/recommendations | GET | ✅ | nodejs | ✅ |
| /api/ai/recommendations/refresh | POST | ✅ | nodejs | ✅ |
| /api/ai/report-builder | POST | ✅ | nodejs | ✅ |
| /api/ai/router | GET, POST | ✅ | nodejs | ✅ |
| /api/ai/run | POST | ✅ | nodejs | ✅ |
| /api/ai/skills | GET | ✅ | nodejs | ✅ |
| /api/ai/status | GET | ✅ | nodejs | ✅ |
| /api/ai/suggest-status | POST | ✅ | nodejs | ✅ |
| /api/ai/supplement/:claimId | POST | ✅ | nodejs | ⚠️ 1 |
| /api/ai/supplement/export-pdf | POST | ✅ | nodejs | ✅ |
| /api/ai/usage | GET | ✅ | nodejs | ✅ |
| /api/ai/video | GET, POST | ✅ | nodejs | ✅ |
| /api/ai/video/stream | POST | ✅ | nodejs | ✅ |
| /api/ai/vision/analyze | POST | ✅ | nodejs | ✅ |
| /api/ai/vision/selftest | GET | ❌ | nodejs | ✅ |
| /api/ai/weather/run | POST | ✅ | nodejs | ✅ |
| /api/analytics/batch | GET | ✅ | nodejs | ✅ |
| /api/analytics/claims-status | GET | ✅ | nodejs | ⚠️ 1 |
| /api/analytics/claims-timeline | GET | ✅ | nodejs | ⚠️ 1 |
| /api/analytics/lead-sources | GET | ✅ | nodejs | ✅ |
| /api/appointments/:id | DELETE | ✅ | nodejs | ✅ |
| /api/approvals/claim/:id | GET | ✅ | nodejs | ⚠️ 1 |
| /api/approvals/request | POST | ✅ | nodejs | ✅ |
| /api/approvals/respond | POST | ✅ | nodejs | ✅ |
| /api/artifacts | GET, POST | ✅ | nodejs | ✅ |
| /api/artifacts/:id | GET, PATCH, DELETE | ✅ | nodejs | ✅ |
| /api/artifacts/:id/export-pdf | POST | ✅ | nodejs | ✅ |
| /api/artifacts/:id/regenerate | POST | ✅ | nodejs | ✅ |
| /api/ask-dominus | POST | ✅ | nodejs | ✅ |
| /api/assistant/query | POST | ✅ | nodejs | ✅ |
| /api/audit/job/:jobId | GET | ❌ | nodejs | ✅ |
| /api/audit/log | POST | ✅ | nodejs | ✅ |
| /api/auth/debug | GET | ❌ | nodejs | ⚠️ 1 |
| /api/auth/health | GET | ✅ | nodejs | ⚠️ 1 |
| /api/auth/me | GET | ✅ | nodejs | ✅ |
| /api/automation/alert/dismiss | POST | ✅ | nodejs | ✅ |
| /api/automation/intelligence | GET | ✅ | nodejs | ✅ |
| /api/automation/recommendation/accept | POST | ✅ | nodejs | ✅ |
| /api/automation/run | POST | ✅ | nodejs | ✅ |
| /api/automation/task/complete | POST | ✅ | nodejs | ✅ |
| /api/batch-proposals | GET | ✅ | nodejs | ✅ |
| /api/batch-proposals/:id | GET | ✅ | nodejs | ✅ |
| /api/batch-proposals/:id/approve | POST | ✅ | nodejs | ✅ |
| /api/batch-proposals/:id/process | POST | ✅ | nodejs | ✅ |
| /api/batch-proposals/create | POST | ✅ | nodejs | ✅ |
| /api/batch/generate-addresses | POST | ✅ | nodejs | ✅ |
| /api/batch/generate-per-address-pdfs | POST | ✅ | nodejs | ✅ |
| /api/billing/auto-refill | POST | ✅ | nodejs | ✅ |
| /api/billing/checkout | POST | ✅ | nodejs | ✅ |
| /api/billing/full-access/checkout | POST | ✅ | nodejs | ✅ |
| /api/billing/full-access/status | GET, DELETE | ✅ | nodejs | ✅ |
| /api/billing/info | GET | ✅ | nodejs | ✅ |
| /api/billing/portal | POST | ✅ | nodejs | ✅ |
| /api/billing/purchases | GET | ✅ | nodejs | ✅ |
| /api/billing/report-credits/balance | GET | ✅ | nodejs | ✅ |
| /api/billing/report-credits/checkout | GET, POST | ✅ | nodejs | ✅ |
| /api/billing/status | GET | ✅ | nodejs | ✅ |
| /api/billing/stripe/webhook | POST | ❌ | nodejs | ⚠️ 1 |
| /api/billing/subscription | GET | ✅ | nodejs | ✅ |
| /api/billing/token-pack/checkout | POST | ✅ | nodejs | ⚠️ 1 |
| /api/billing/tokens/checkout | GET | ❌ | nodejs | ⚠️ 1 |
| /api/branding | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/branding/get | GET | ✅ | nodejs | ✅ |
| /api/branding/save | POST | ✅ | nodejs | ✅ |
| /api/branding/setup | GET, POST | ✅ | nodejs | ✅ |
| /api/branding/status | GET | ✅ | nodejs | ✅ |
| /api/branding/upload | POST | ✅ | nodejs | ✅ |
| /api/branding/upsert | POST | ✅ | nodejs | ✅ |
| /api/build-info | GET | ❌ | nodejs | ⚠️ 2 |
| /api/build-verify | GET | ❌ | nodejs | ⚠️ 2 |
| /api/bulk-actions | POST | ❌ | nodejs | ✅ |
| /api/calendar/events | GET | ✅ | nodejs | ✅ |
| /api/carrier/compliance | POST | ✅ | nodejs | ✅ |
| /api/carrier/export/zip | POST | ❌ | nodejs | ⚠️ 1 |
| /api/carrier/track/:trackingId/:action | GET | ❌ | nodejs | ⚠️ 1 |
| /api/carriers/presets | GET | ✅ | nodejs | ✅ |
| /api/checkout | POST | ✅ | nodejs | ⚠️ 1 |
| /api/checkout/token-pack | GET | ❌ | nodejs | ⚠️ 1 |
| /api/claim-approvals | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims |  | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId |  | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/ai | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/ai-reports | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/ai/rebuttal | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/ai/summary | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/appeal | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/artifacts | GET, POST | ✅ | nodejs | ✅ |
| /api/claims/:claimId/artifacts/:artifactId | PATCH, DELETE | ✅ | nodejs | ✅ |
| /api/claims/:claimId/artifacts/:artifactId/export-pdf | POST | ✅ | nodejs | ✅ |
| /api/claims/:claimId/assets-with-meta | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/attach-contact | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/automation/analyze | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/bad-faith | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/carrier-summary | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/code | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/context | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/cover-photo |  | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/depreciation/export | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/documents | GET | ✅ | nodejs | ✅ |
| /api/claims/:claimId/documents/:documentId | GET, DELETE | ✅ | nodejs | ✅ |
| /api/claims/:claimId/dol | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/events | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/evidence | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/evidence/collections/:sectionKey | PATCH | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/evidence/upload | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/files/:fileId | PATCH | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/generate-report | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/import | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/invite |  | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/invite-client | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/messages | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/narrative | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/notes | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/permissions | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/photos | GET, POST | ✅ | nodejs | ✅ |
| /api/claims/:claimId/photos/:photoId | GET, DELETE | ✅ | nodejs | ✅ |
| /api/claims/:claimId/predict | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/rebuttal-builder | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/report | GET, POST, PATCH | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/report/pdf | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/reports |  | ✅ | nodejs | ✅ |
| /api/claims/:claimId/send-to-adjuster | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/status | PATCH | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/supplement | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/supplement/:supplementId/download | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/supplement/:supplementId/excel | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/supplements | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/supplements/items | GET, POST | ✅ | nodejs | ⚠️ 2 |
| /api/claims/:claimId/tasks | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/tasks/from-actions | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/timeline | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/toggle-visibility | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/trade-partners | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/trade-partners/:id | DELETE | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/trades | GET, POST, DELETE | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/update | PATCH | ✅ | nodejs | ✅ |
| /api/claims/:claimId/weather | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/weather/refresh | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/:claimId/workspace | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/ai/build | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/ai/detect |  | ✅ | nodejs | ⚠️ 1 |
| /api/claims/create | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/document/upload | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/files/upload | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/generate-packet | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/intake | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/list | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/list-lite | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/materials | GET, POST | ✅ | nodejs | ⚠️ 2 |
| /api/claims/resume | GET | ✅ | nodejs | ⚠️ 1 |
| /api/claims/save | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/start | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/state | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/timeline/add | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/update | POST | ✅ | nodejs | ⚠️ 1 |
| /api/claims/weather/auto | GET | ✅ | nodejs | ⚠️ 1 |
| /api/client-follows | POST | ❌ | nodejs | ✅ |
| /api/client-messages/send | POST | ✅ | nodejs | ✅ |
| /api/client-messages/thread | GET | ✅ | nodejs | ✅ |
| /api/client-notifications | GET | ❌ | nodejs | ✅ |
| /api/client-notifications/create | POST | ❌ | nodejs | ✅ |
| /api/client-notifications/mark-read | POST | ❌ | nodejs | ✅ |
| /api/client-portal/invite | POST | ✅ | nodejs | ✅ |
| /api/client-profile | PATCH | ✅ | nodejs | ✅ |
| /api/client-requests | POST | ✅ | nodejs | ✅ |
| /api/client/auth/request | POST | ❌ | nodejs | ✅ |
| /api/client/claims | GET | ✅ | nodejs | ✅ |
| /api/client/claims/:claimId | GET | ✅ | nodejs | ✅ |
| /api/clients |  | ✅ | nodejs | ✅ |
| /api/clients/create | POST | ✅ | nodejs | ✅ |
| /api/community-orders/create | POST | ✅ | nodejs | ✅ |
| /api/community-reports/purchase | GET, POST | ✅ | nodejs | ✅ |
| /api/community/create | POST | ✅ | nodejs | ✅ |
| /api/community/map | GET | ✅ | nodejs | ✅ |
| /api/company-docs/list | GET | ✅ | nodejs | ✅ |
| /api/company-docs/upload | POST | ✅ | nodejs | ✅ |
| /api/completion/update | GET, POST | ✅ | nodejs | ✅ |
| /api/completion/upload-doc | GET, POST | ✅ | nodejs | ✅ |
| /api/completion/upload-photo | GET, POST | ✅ | nodejs | ✅ |
| /api/config | GET | ❌ | nodejs | ⚠️ 2 |
| /api/connections/accept | POST | ✅ | nodejs | ✅ |
| /api/connections/connect | POST | ✅ | nodejs | ✅ |
| /api/connections/decline | POST | ✅ | nodejs | ✅ |
| /api/connections/my | GET | ✅ | nodejs | ✅ |
| /api/connections/request | POST | ✅ | nodejs | ✅ |
| /api/connections/revoke | POST | ✅ | nodejs | ✅ |
| /api/connections/search | GET | ✅ | nodejs | ✅ |
| /api/connections/share-document | POST | ✅ | nodejs | ✅ |
| /api/connections/thread | POST | ✅ | nodejs | ✅ |
| /api/contact | POST | ❌ | nodejs | ✅ |
| /api/contacts | GET | ✅ | nodejs | ✅ |
| /api/contacts/:contactId |  | ✅ | nodejs | ✅ |
| /api/contacts/search |  | ✅ | nodejs | ✅ |
| /api/contractor-packet | GET, POST | ✅ | nodejs | ✅ |
| /api/contractor-packet/:id/status | GET | ✅ | nodejs | ✅ |
| /api/conversion/track | POST | ✅ | nodejs | ✅ |
| /api/correlate/damage | POST | ✅ | nodejs | ✅ |
| /api/cron/ai-insights | POST | ❌ | nodejs | ⚠️ 1 |
| /api/cron/daily | GET | ❌ | nodejs | ⚠️ 1 |
| /api/cron/email-retry | GET | ❌ | nodejs | ✅ |
| /api/cron/process-batch-jobs | GET | ❌ | nodejs | ⚠️ 1 |
| /api/cron/stripe-reconcile | GET | ❌ | nodejs | ✅ |
| /api/cron/trials/sweep | GET | ❌ | nodejs | ⚠️ 1 |
| /api/cron/user-columns | GET | ❌ | nodejs | ⚠️ 1 |
| /api/damage | GET, POST | ✅ | nodejs | ✅ |
| /api/damage/:id | GET, DELETE | ✅ | nodejs | ✅ |
| /api/damage/build | POST | ✅ | nodejs | ✅ |
| /api/dashboard/activities | GET | ✅ | nodejs | ✅ |
| /api/dashboard/charts | GET | ✅ | nodejs | ✅ |
| /api/dashboard/kpis | GET | ✅ | nodejs | ✅ |
| /api/dashboard/metrics | GET | ❌ | nodejs | ⚠️ 1 |
| /api/dashboard/stats | GET | ✅ | nodejs | ✅ |
| /api/db/health | GET | ❌ | nodejs | ✅ |
| /api/debug-db | GET | ❌ | nodejs | ✅ |
| /api/debug/all-claims | GET | ✅ | nodejs | ✅ |
| /api/debug/billing-status | GET | ✅ | nodejs | ✅ |
| /api/debug/claims | GET | ✅ | nodejs | ✅ |
| /api/debug/db-tables | GET | ❌ | nodejs | ✅ |
| /api/debug/env-check | GET | ❌ | nodejs | ⚠️ 2 |
| /api/debug/force-seed | POST | ✅ | nodejs | ✅ |
| /api/debug/org | GET | ✅ | nodejs | ✅ |
| /api/debug/org-status | GET | ✅ | nodejs | ✅ |
| /api/debug/permissions | GET | ✅ | nodejs | ✅ |
| /api/debug/reseed | POST | ✅ | nodejs | ✅ |
| /api/debug/seed-demo | POST | ✅ | nodejs | ✅ |
| /api/debug/whoami | GET | ✅ | nodejs | ⚠️ 1 |
| /api/demo/setup | POST | ✅ | nodejs | ✅ |
| /api/deploy-info | GET | ❌ | nodejs | ⚠️ 2 |
| /api/deploy-info/_deploy | GET | ❌ | nodejs | ⚠️ 2 |
| /api/dev/bootstrap-org | GET | ✅ | nodejs | ✅ |
| /api/dev/create-demo-claim-report | POST | ✅ | nodejs | ✅ |
| /api/dev/fix-org | GET | ❌ | nodejs | ✅ |
| /api/dev/send-email | POST | ❌ | nodejs | ✅ |
| /api/dev/sentry-test | GET | ❌ | nodejs | ⚠️ 1 |
| /api/dev/throw | GET | ❌ | nodejs | ⚠️ 2 |
| /api/diag | GET | ✅ | nodejs | ⚠️ 1 |
| /api/diag/ai | GET | ❌ | nodejs | ⚠️ 2 |
| /api/diag/clerk | GET | ❌ | nodejs | ✅ |
| /api/diag/db | GET | ❌ | nodejs | ✅ |
| /api/diag/env | GET | ❌ | nodejs | ⚠️ 2 |
| /api/diag/nav | GET | ❌ | nodejs | ⚠️ 1 |
| /api/diag/org | GET | ✅ | nodejs | ✅ |
| /api/diag/ping | GET | ❌ | nodejs | ⚠️ 1 |
| /api/diag/prisma | GET, POST | ❌ | nodejs | ⚠️ 1 |
| /api/diag/ready | GET | ❌ | nodejs | ⚠️ 2 |
| /api/diag/storage | GET | ❌ | nodejs | ⚠️ 1 |
| /api/diag/version |  | ❌ | nodejs | ⚠️ 1 |
| /api/diagnostics/routes | GET | ❌ | nodejs | ⚠️ 1 |
| /api/documents/share | GET, POST | ❌ | nodejs | ✅ |
| /api/dol-check | POST | ✅ | nodejs | ⚠️ 1 |
| /api/dol-pull | POST | ✅ | nodejs | ⚠️ 1 |
| /api/esign/envelopes/:envelopeId | GET | ❌ | nodejs | ✅ |
| /api/esign/envelopes/:envelopeId/finalize | POST | ✅ | nodejs | ✅ |
| /api/esign/envelopes/:envelopeId/send | POST | ✅ | nodejs | ✅ |
| /api/esign/envelopes/:envelopeId/signers/:signerId/signature | POST | ✅ | nodejs | ✅ |
| /api/esign/envelopes/create | POST | ✅ | nodejs | ✅ |
| /api/estimate/export | POST | ✅ | nodejs | ✅ |
| /api/estimate/priced | POST | ✅ | nodejs | ✅ |
| /api/estimates | GET, POST | ✅ | nodejs | ✅ |
| /api/estimates/:id | GET, PUT, DELETE | ✅ | nodejs | ✅ |
| /api/estimates/:id/draft-email | POST | ✅ | nodejs | ✅ |
| /api/estimates/:id/export/json | GET | ✅ | nodejs | ✅ |
| /api/estimates/:id/send-packet | POST | ✅ | nodejs | ✅ |
| /api/estimates/build | POST | ✅ | nodejs | ✅ |
| /api/estimates/save | POST | ✅ | nodejs | ✅ |
| /api/evidence/:assetId | PATCH | ✅ | nodejs | ✅ |
| /api/evidence/:assetId/signed-url | GET | ✅ | nodejs | ✅ |
| /api/export/complete-packet | POST | ✅ | nodejs | ✅ |
| /api/export/pdf | GET, POST | ✅ | nodejs | ✅ |
| /api/exports/:id/retry | POST | ✅ | nodejs | ✅ |
| /api/exports/queue | GET | ✅ | nodejs | ✅ |
| /api/feedback | POST | ✅ | nodejs | ✅ |
| /api/files | GET | ✅ | nodejs | ✅ |
| /api/files/:id/readUrl | GET | ✅ | nodejs | ✅ |
| /api/files/:id/url | GET | ✅ | nodejs | ✅ |
| /api/flags/:key |  | ✅ | nodejs | ✅ |
| /api/flags/config/:key |  | ❌ | nodejs | ✅ |
| /api/flags/export |  | ❌ | nodejs | ✅ |
| /api/flags/import |  | ❌ | nodejs | ✅ |
| /api/flags/invalidate/:key | POST | ❌ | nodejs | ✅ |
| /api/flags/list |  | ❌ | nodejs | ✅ |
| /api/flags/metrics |  | ❌ | nodejs | ✅ |
| /api/follow/company | POST | ✅ | nodejs | ✅ |
| /api/follow/trade | POST | ✅ | nodejs | ✅ |
| /api/generate-mockup | POST | ✅ | nodejs | ⚠️ 1 |
| /api/generate-pdf | POST | ✅ | nodejs | ⚠️ 1 |
| /api/generate-test-docx | POST | ❌ | nodejs | ✅ |
| /api/geocode | POST | ❌ | nodejs | ⚠️ 1 |
| /api/headers-debug | GET | ❌ | nodejs | ⚠️ 1 |
| /api/health | GET | ❌ | nodejs | ⚠️ 1 |
| /api/health-check/db | GET | ❌ | nodejs | ✅ |
| /api/health-check/maps | GET | ❌ | nodejs | ⚠️ 2 |
| /api/health/agents | GET | ❌ | nodejs | ⚠️ 1 |
| /api/health/ai | GET | ❌ | nodejs | ✅ |
| /api/health/claims | GET | ✅ | nodejs | ✅ |
| /api/health/comprehensive | GET | ✅ | nodejs | ⚠️ 1 |
| /api/health/database | GET | ❌ | nodejs | ✅ |
| /api/health/db | GET | ❌ | nodejs | ✅ |
| /api/health/drift-metrics | GET | ❌ | nodejs | ⚠️ 1 |
| /api/health/env | GET | ❌ | nodejs | ⚠️ 2 |
| /api/health/full | GET | ❌ | nodejs | ✅ |
| /api/health/live | GET | ❌ | nodejs | ⚠️ 1 |
| /api/health/maps | GET | ❌ | nodejs | ⚠️ 2 |
| /api/health/ready | GET | ❌ | nodejs | ✅ |
| /api/health/report | GET | ❌ | nodejs | ⚠️ 1 |
| /api/health/startup | GET | ❌ | nodejs | ⚠️ 1 |
| /api/health/storage | GET | ❌ | nodejs | ✅ |
| /api/health/summary | GET | ✅ | nodejs | ⚠️ 1 |
| /api/health/tenant | GET | ✅ | nodejs | ⚠️ 1 |
| /api/health/user-columns | GET | ❌ | nodejs | ✅ |
| /api/health/voice | GET | ❌ | nodejs | ✅ |
| /api/hoa/notices | GET, POST | ✅ | nodejs | ✅ |
| /api/hoa/notices/:id | GET | ✅ | nodejs | ✅ |
| /api/hoa/notices/:id/send | POST | ✅ | nodejs | ✅ |
| /api/homeowner/profile | GET, POST | ✅ | nodejs | ✅ |
| /api/import-export | POST | ❌ | nodejs | ✅ |
| /api/intel/automation/run | POST | ✅ | nodejs | ✅ |
| /api/intel/claims-packet | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/intel/material-forensics | GET, POST | ✅ | nodejs | ✅ |
| /api/intel/super-packet | GET, POST | ✅ | nodejs | ✅ |
| /api/intel/supplements/run | POST | ✅ | nodejs | ✅ |
| /api/intelligence/generate | POST | ✅ | nodejs | ✅ |
| /api/job-cost/:jobId | GET | ✅ | nodejs | ✅ |
| /api/job-cost/upsert | POST | ✅ | nodejs | ✅ |
| /api/jobs/:jobId | GET | ❌ | nodejs | ✅ |
| /api/jobs/status |  | ✅ | nodejs | ✅ |
| /api/jobs/stream | GET | ❌ | nodejs | ✅ |
| /api/leads |  | ✅ | nodejs | ✅ |
| /api/leads/:id |  | ✅ | nodejs | ✅ |
| /api/leads/:id/notes/from-ai |  | ✅ | nodejs | ✅ |
| /api/leads/:id/timeline |  | ✅ | nodejs | ✅ |
| /api/leads/map-snapshot |  | ✅ | nodejs | ✅ |
| /api/legal/accept | POST | ✅ | nodejs | ✅ |
| /api/legal/pending | GET | ✅ | nodejs | ✅ |
| /api/legal/status | GET | ✅ | nodejs | ⚠️ 1 |
| /api/mailers/batches | GET | ✅ | nodejs | ✅ |
| /api/mailers/send | POST | ✅ | nodejs | ✅ |
| /api/maps/geocode | POST | ❌ | nodejs | ⚠️ 1 |
| /api/maps/onboard | POST | ✅ | nodejs | ✅ |
| /api/maps/reverse | POST | ❌ | nodejs | ✅ |
| /api/materials/orders | GET, POST | ❌ | nodejs | ✅ |
| /api/me/branding | GET | ✅ | nodejs | ✅ |
| /api/me/init | POST | ✅ | nodejs | ✅ |
| /api/me/network-metrics | GET | ✅ | nodejs | ⚠️ 1 |
| /api/me/notifications | GET, POST, PATCH | ✅ | nodejs | ✅ |
| /api/messages/:threadId | GET, POST | ✅ | nodejs | ✅ |
| /api/messages/:threadId/:messageId/read | PATCH | ✅ | nodejs | ✅ |
| /api/messages/conversations | GET | ✅ | nodejs | ✅ |
| /api/messages/create | POST | ✅ | nodejs | ✅ |
| /api/messages/post-update | POST | ✅ | nodejs | ✅ |
| /api/messages/send | POST | ✅ | nodejs | ✅ |
| /api/messages/threads | GET | ✅ | nodejs | ✅ |
| /api/metrics/ai-performance | GET | ✅ | nodejs | ✅ |
| /api/mockups/generate | POST | ✅ | nodejs | ✅ |
| /api/nav/badges | GET | ✅ | nodejs | ✅ |
| /api/network/clients | GET, POST | ✅ | nodejs | ✅ |
| /api/network/clients/:slug | GET, PATCH | ✅ | nodejs | ✅ |
| /api/network/clients/:slug/activity | GET, POST | ✅ | nodejs | ✅ |
| /api/network/connect | POST | ✅ | nodejs | ✅ |
| /api/network/integrate | GET, POST | ✅ | nodejs | ✅ |
| /api/network/trades | GET, POST | ✅ | nodejs | ✅ |
| /api/notes | GET, POST | ✅ | nodejs | ✅ |
| /api/notes/:id | PATCH, DELETE | ✅ | nodejs | ✅ |
| /api/notifications | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/notifications/:id | DELETE | ✅ | nodejs | ✅ |
| /api/notifications/:id/read | PATCH | ✅ | nodejs | ✅ |
| /api/notifications/email | POST | ❌ | nodejs | ✅ |
| /api/notifications/mark-all | POST | ❌ | nodejs | ⚠️ 1 |
| /api/notifications/mark-all-read | POST | ✅ | nodejs | ✅ |
| /api/notifications/mark-read | POST | ✅ | nodejs | ✅ |
| /api/notifications/sms | POST | ❌ | nodejs | ✅ |
| /api/notifications/v2 | GET, POST | ✅ | nodejs | ✅ |
| /api/notify/send | POST | ❌ | nodejs | ⚠️ 1 |
| /api/ocr/image | POST | ❌ | nodejs | ✅ |
| /api/ocr/pdf | POST | ❌ | nodejs | ✅ |
| /api/onboarding/complete | POST | ✅ | nodejs | ✅ |
| /api/onboarding/create-sample | POST, DELETE | ✅ | nodejs | ✅ |
| /api/onboarding/init | POST | ✅ | nodejs | ✅ |
| /api/onboarding/progress | GET | ✅ | nodejs | ✅ |
| /api/ops/ai-stats | GET | ✅ | nodejs | ✅ |
| /api/ops/errors | GET | ✅ | nodejs | ✅ |
| /api/ops/funnel-stats | GET | ✅ | nodejs | ✅ |
| /api/ops/upload-stats | GET | ✅ | nodejs | ✅ |
| /api/org/initialize | POST | ✅ | nodejs | ✅ |
| /api/org/plan | GET | ✅ | nodejs | ✅ |
| /api/org/tokens | GET | ✅ | nodejs | ✅ |
| /api/partners | GET, POST | ✅ | nodejs | ✅ |
| /api/partners/:id | GET, PATCH, DELETE | ✅ | nodejs | ✅ |
| /api/pdf/generate | POST | ❌ | nodejs | ⚠️ 1 |
| /api/permissions | GET | ❌ | nodejs | ✅ |
| /api/photos | GET, POST | ❌ | nodejs | ✅ |
| /api/pipeline | GET, PUT | ✅ | nodejs | ✅ |
| /api/pipelines/summary | GET | ✅ | nodejs | ✅ |
| /api/portal/claims | GET | ✅ | nodejs | ✅ |
| /api/portal/claims/:claimId | GET | ✅ | nodejs | ✅ |
| /api/portal/claims/:claimId/access | GET | ✅ | nodejs | ✅ |
| /api/portal/claims/:claimId/artifacts | GET | ✅ | nodejs | ✅ |
| /api/portal/claims/:claimId/documents | POST | ✅ | nodejs | ✅ |
| /api/portal/claims/:claimId/events | GET | ❌ | nodejs | ✅ |
| /api/portal/claims/:claimId/files | GET | ❌ | nodejs | ✅ |
| /api/portal/claims/:claimId/files/:fileId/comments | POST | ❌ | nodejs | ✅ |
| /api/portal/claims/:claimId/photos | GET, POST | ✅ | nodejs | ✅ |
| /api/portal/claims/create | POST | ✅ | nodejs | ✅ |
| /api/portal/client/upload | POST | ❌ | nodejs | ✅ |
| /api/portal/generate-access | POST | ✅ | nodejs | ✅ |
| /api/portal/invite | POST | ✅ | nodejs | ✅ |
| /api/portal/messages | GET, POST | ✅ | nodejs | ✅ |
| /api/portal/messages/:threadId | GET | ✅ | nodejs | ✅ |
| /api/portal/messages/:threadId/send | POST | ✅ | nodejs | ✅ |
| /api/portal/messages/create-thread | POST | ✅ | nodejs | ✅ |
| /api/portal/profile | GET, POST | ✅ | nodejs | ✅ |
| /api/portal/resolve-token | GET | ❌ | nodejs | ⚠️ 1 |
| /api/portal/work-request | POST | ✅ | nodejs | ✅ |
| /api/portal/work-requests | POST | ✅ | nodejs | ✅ |
| /api/pricing | GET | ✅ | nodejs | ✅ |
| /api/profile/me | GET | ✅ | nodejs | ✅ |
| /api/profile/update | PUT | ✅ | nodejs | ✅ |
| /api/profile/upload-photo | POST | ✅ | nodejs | ✅ |
| /api/project/materials/add | POST | ❌ | nodejs | ✅ |
| /api/projects | GET, POST | ✅ | nodejs | ✅ |
| /api/projects/:id | GET, PUT, DELETE | ✅ | nodejs | ✅ |
| /api/properties | GET | ✅ | nodejs | ✅ |
| /api/properties/map | GET | ✅ | nodejs | ✅ |
| /api/proposals | GET, POST | ✅ | nodejs | ✅ |
| /api/proposals/:id | GET | ✅ | nodejs | ✅ |
| /api/proposals/:id/publish | POST | ✅ | nodejs | ✅ |
| /api/proposals/:id/status | GET | ✅ | nodejs | ✅ |
| /api/proposals/build | POST | ✅ | nodejs | ✅ |
| /api/proposals/health | GET | ❌ | nodejs | ✅ |
| /api/proposals/render | POST | ✅ | nodejs | ✅ |
| /api/proposals/run | POST | ❌ | nodejs | ✅ |
| /api/public/contractor/:slug | GET | ❌ | nodejs | ✅ |
| /api/public/reports/:id/accept | POST | ❌ | nodejs | ✅ |
| /api/public/reports/:id/decline | POST | ❌ | nodejs | ✅ |
| /api/public/search | GET | ❌ | nodejs | ✅ |
| /api/public/submit | POST | ❌ | nodejs | ✅ |
| /api/qr/generate | GET | ❌ | nodejs | ✅ |
| /api/queue/echo | POST | ❌ | nodejs | ✅ |
| /api/quota/status | GET | ✅ | nodejs | ✅ |
| /api/rate-limit/usage |  | ✅ | nodejs | ✅ |
| /api/rbac/me | GET | ✅ | nodejs | ✅ |
| /api/realtime | GET, POST | ❌ | nodejs | ✅ |
| /api/referral/invite | POST | ✅ | nodejs | ✅ |
| /api/referral/link | GET | ✅ | nodejs | ✅ |
| /api/referrals/create | POST | ❌ | nodejs | ✅ |
| /api/report-templates | GET, POST | ✅ | nodejs | ✅ |
| /api/report-templates/:id | DELETE | ✅ | nodejs | ✅ |
| /api/reports | GET | ✅ | nodejs | ✅ |
| /api/reports/:reportId | GET | ✅ | nodejs | ✅ |
| /api/reports/:reportId/ai/:sectionKey | GET, POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/approve | POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/draft | GET, POST, DELETE | ✅ | nodejs | ✅ |
| /api/reports/:reportId/draft-email | POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/export | POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/export/adjuster-json | GET | ✅ | nodejs | ✅ |
| /api/reports/:reportId/export/homeowner-json | GET | ✅ | nodejs | ✅ |
| /api/reports/:reportId/export/json | GET | ✅ | nodejs | ✅ |
| /api/reports/:reportId/regenerate-links | POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/reject | POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/resend | POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/save | POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/send | POST | ✅ | nodejs | ✅ |
| /api/reports/:reportId/send-packet | POST | ✅ | nodejs | ✅ |
| /api/reports/build | POST | ✅ | nodejs | ✅ |
| /api/reports/build-draft | POST | ✅ | nodejs | ✅ |
| /api/reports/build-smart | POST | ✅ | nodejs | ✅ |
| /api/reports/build-smart/export-json | POST | ✅ | nodejs | ✅ |
| /api/reports/certificate | POST | ✅ | nodejs | ✅ |
| /api/reports/claims/:claimId/pdf | POST | ✅ | nodejs | ⚠️ 1 |
| /api/reports/community/generate | GET, POST | ✅ | nodejs | ✅ |
| /api/reports/compose | POST | ✅ | nodejs | ✅ |
| /api/reports/context | POST | ✅ | nodejs | ✅ |
| /api/reports/custom | GET, POST | ✅ | nodejs | ✅ |
| /api/reports/depreciation | POST | ✅ | nodejs | ✅ |
| /api/reports/email | POST | ❌ | nodejs | ✅ |
| /api/reports/export | GET | ✅ | nodejs | ✅ |
| /api/reports/generate | POST | ✅ | nodejs | ✅ |
| /api/reports/generate-from-template | POST | ✅ | nodejs | ✅ |
| /api/reports/history |  | ✅ | nodejs | ✅ |
| /api/reports/list | GET | ✅ | nodejs | ✅ |
| /api/reports/presets | GET, POST | ✅ | nodejs | ✅ |
| /api/reports/preview | POST | ✅ | nodejs | ✅ |
| /api/reports/quick | POST | ✅ | nodejs | ✅ |
| /api/reports/recent | GET | ✅ | nodejs | ✅ |
| /api/reports/retail/:estimateId/pdf | POST | ✅ | nodejs | ✅ |
| /api/reports/retail/generate | POST | ✅ | nodejs | ✅ |
| /api/reports/save | GET, POST | ✅ | nodejs | ✅ |
| /api/reports/share | POST, DELETE | ✅ | nodejs | ✅ |
| /api/reports/summary | GET | ✅ | nodejs | ✅ |
| /api/reports/supplement | POST | ✅ | nodejs | ✅ |
| /api/reports/view/:id | GET, PUT, DELETE | ✅ | nodejs | ✅ |
| /api/reports/view/:id/pdf | POST | ✅ | nodejs | ✅ |
| /api/retail-jobs | GET, POST | ❌ | nodejs | ✅ |
| /api/retail/items | POST | ✅ | nodejs | ⚠️ 1 |
| /api/retail/list | GET | ✅ | nodejs | ✅ |
| /api/retail/resume | GET | ✅ | nodejs | ✅ |
| /api/retail/save | POST | ✅ | nodejs | ✅ |
| /api/retail/start | POST | ✅ | nodejs | ✅ |
| /api/routes-manifest | GET | ❌ | nodejs | ✅ |
| /api/routes-manifest/_routes | GET | ❌ | nodejs | ✅ |
| /api/routes/optimize | POST | ❌ | nodejs | ⚠️ 1 |
| /api/search/clients | POST | ✅ | nodejs | ✅ |
| /api/search/global | GET | ✅ | nodejs | ✅ |
| /api/search/pros | POST | ✅ | nodejs | ✅ |
| /api/seed/test-data | POST | ✅ | nodejs | ✅ |
| /api/service-requests | GET, POST | ✅ | nodejs | ✅ |
| /api/share/create | POST | ❌ | nodejs | ⚠️ 1 |
| /api/signatures/request | POST | ✅ | nodejs | ✅ |
| /api/signatures/respond | POST | ✅ | nodejs | ✅ |
| /api/signatures/save | POST | ❌ | nodejs | ✅ |
| /api/status | GET | ❌ | nodejs | ⚠️ 1 |
| /api/storage/signed-read | POST | ✅ | nodejs | ✅ |
| /api/storage/signed-upload | POST | ✅ | nodejs | ✅ |
| /api/storm-intake/:id | GET | ✅ | nodejs | ✅ |
| /api/storm-intake/:id/complete | POST | ✅ | nodejs | ✅ |
| /api/storm-intake/:id/save | POST | ✅ | nodejs | ✅ |
| /api/storm-intake/:id/upload | POST | ✅ | nodejs | ✅ |
| /api/storm-intake/start | POST | ✅ | nodejs | ✅ |
| /api/stripe/checkout | GET, POST | ✅ | nodejs | ✅ |
| /api/stripe/checkout/topup | GET | ✅ | nodejs | ✅ |
| /api/stripe/ensure-customer | POST | ✅ | nodejs | ✅ |
| /api/stripe/prices | GET | ❌ | nodejs | ✅ |
| /api/stripe/webhook | POST | ❌ | nodejs | ✅ |
| /api/supplement/generate | POST | ❌ | nodejs | ✅ |
| /api/supplements | GET, POST | ✅ | nodejs | ✅ |
| /api/supplements/:id | GET, PUT, DELETE | ✅ | nodejs | ✅ |
| /api/supplements/:id/approve | POST | ✅ | nodejs | ✅ |
| /api/supplements/:id/deny | POST | ✅ | nodejs | ✅ |
| /api/supplements/:id/draft-email | POST | ✅ | nodejs | ✅ |
| /api/supplements/:id/email/adjuster | GET | ✅ | nodejs | ✅ |
| /api/supplements/:id/email/homeowner | GET | ✅ | nodejs | ✅ |
| /api/supplements/:id/export/homeowner-json | GET | ✅ | nodejs | ✅ |
| /api/supplements/:id/export/json | GET | ✅ | nodejs | ✅ |
| /api/supplements/:id/send-packet | POST | ✅ | nodejs | ✅ |
| /api/supplements/build | POST | ✅ | nodejs | ✅ |
| /api/supplements/from-damage | POST | ✅ | nodejs | ✅ |
| /api/supplements/generate | POST | ✅ | nodejs | ✅ |
| /api/supplements/save | POST | ✅ | nodejs | ✅ |
| /api/support/tickets | GET, POST | ✅ | nodejs | ✅ |
| /api/system/demo-ids | GET | ✅ | nodejs | ✅ |
| /api/system/health | GET | ❌ | nodejs | ✅ |
| /api/system/sample-ids | GET | ✅ | nodejs | ✅ |
| /api/system/storage-check | GET | ❌ | nodejs | ⚠️ 1 |
| /api/system/truth | GET | ❌ | nodejs | ⚠️ 1 |
| /api/system/whoami | GET | ✅ | nodejs | ✅ |
| /api/tasks | GET, POST | ✅ | nodejs | ✅ |
| /api/tasks/:taskId | PUT, DELETE | ✅ | nodejs | ✅ |
| /api/tasks/:taskId/complete | POST | ✅ | nodejs | ✅ |
| /api/team/activity | GET, POST | ✅ | nodejs | ✅ |
| /api/team/invitations | GET, POST | ✅ | nodejs | ✅ |
| /api/team/invitations/:id/resend | POST | ✅ | nodejs | ✅ |
| /api/team/invitations/:id/revoke | POST | ✅ | nodejs | ✅ |
| /api/team/invitations/accept | POST | ✅ | nodejs | ✅ |
| /api/team/member/:memberId |  | ✅ | nodejs | ✅ |
| /api/team/posts | GET, POST | ✅ | nodejs | ✅ |
| /api/teams/elevate-manager | POST | ✅ | nodejs | ✅ |
| /api/teams/invite |  | ✅ | nodejs | ✅ |
| /api/telemetry/carrier-export-complete | POST | ✅ | nodejs | ✅ |
| /api/telemetry/damage-complete | POST | ✅ | nodejs | ✅ |
| /api/telemetry/mockup-complete | POST | ✅ | nodejs | ✅ |
| /api/telemetry/wizard-complete | POST | ✅ | nodejs | ✅ |
| /api/templates | GET, POST | ✅ | nodejs | ✅ |
| /api/templates/:templateId | PATCH, DELETE | ✅ | nodejs | ✅ |
| /api/templates/:templateId/duplicate | POST | ✅ | nodejs | ✅ |
| /api/templates/:templateId/generate-assets | POST | ❌ | nodejs | ✅ |
| /api/templates/:templateId/generate-pdf |  | ✅ | nodejs | ✅ |
| /api/templates/:templateId/preview |  | ✅ | nodejs | ✅ |
| /api/templates/:templateId/public | GET | ❌ | nodejs | ✅ |
| /api/templates/:templateId/sections/:sectionId | PATCH | ✅ | nodejs | ✅ |
| /api/templates/:templateId/set-default | POST | ✅ | nodejs | ✅ |
| /api/templates/:templateId/validate | POST | ❌ | nodejs | ✅ |
| /api/templates/add-from-marketplace | POST | ✅ | nodejs | ✅ |
| /api/templates/add-to-company | POST | ✅ | nodejs | ✅ |
| /api/templates/categories | GET | ❌ | nodejs | ✅ |
| /api/templates/company | GET | ✅ | nodejs | ✅ |
| /api/templates/create | POST | ✅ | nodejs | ✅ |
| /api/templates/duplicate | POST | ✅ | nodejs | ✅ |
| /api/templates/generate | POST | ✅ | nodejs | ✅ |
| /api/templates/list | GET | ✅ | nodejs | ✅ |
| /api/templates/marketplace | GET | ❌ | nodejs | ✅ |
| /api/templates/marketplace/:slug | GET | ❌ | nodejs | ✅ |
| /api/templates/marketplace/:slug/preview-pdf | GET | ❌ | nodejs | ✅ |
| /api/templates/org | GET | ✅ | nodejs | ✅ |
| /api/templates/org/add | POST | ✅ | nodejs | ✅ |
| /api/templates/verify-all | GET | ❌ | nodejs | ✅ |
| /api/test-email | GET | ❌ | nodejs | ✅ |
| /api/test-rate-limit | GET | ❌ | nodejs | ⚠️ 1 |
| /api/test-sentry | GET | ❌ | nodejs | ⚠️ 1 |
| /api/tokens | GET, POST | ✅ | nodejs | ✅ |
| /api/tokens/adjust | POST | ✅ | nodejs | ✅ |
| /api/tokens/balance | GET | ✅ | nodejs | ⚠️ 1 |
| /api/tokens/buy | POST | ✅ | nodejs | ✅ |
| /api/tokens/consume | POST | ✅ | nodejs | ✅ |
| /api/tokens/purchase | POST | ✅ | nodejs | ✅ |
| /api/tokens/status | GET | ✅ | nodejs | ✅ |
| /api/trades | GET, POST | ✅ | nodejs | ✅ |
| /api/trades/:id | GET, PATCH, DELETE | ✅ | nodejs | ✅ |
| /api/trades/accept | POST | ✅ | nodejs | ✅ |
| /api/trades/add-service | POST | ✅ | nodejs | ✅ |
| /api/trades/apply | POST | ✅ | nodejs | ✅ |
| /api/trades/attach-to-claim | POST | ✅ | nodejs | ⚠️ 1 |
| /api/trades/cancel-subscription | POST | ✅ | nodejs | ✅ |
| /api/trades/companies | GET | ❌ | nodejs | ✅ |
| /api/trades/connect | POST | ✅ | nodejs | ✅ |
| /api/trades/connections | POST, DELETE | ✅ | nodejs | ⚠️ 1 |
| /api/trades/decline | POST | ✅ | nodejs | ✅ |
| /api/trades/engage | POST | ✅ | nodejs | ⚠️ 1 |
| /api/trades/feed | GET, POST | ✅ | nodejs | ✅ |
| /api/trades/inbox | GET | ✅ | nodejs | ✅ |
| /api/trades/list | GET | ✅ | nodejs | ⚠️ 1 |
| /api/trades/match | GET | ❌ | nodejs | ✅ |
| /api/trades/membership | GET | ✅ | nodejs | ✅ |
| /api/trades/messages | GET, POST | ✅ | nodejs | ⚠️ 1 |
| /api/trades/onboard | POST | ✅ | nodejs | ⚠️ 1 |
| /api/trades/onboarding | GET, POST | ✅ | nodejs | ✅ |
| /api/trades/opportunities | GET, POST | ✅ | nodejs | ✅ |
| /api/trades/posts | GET, POST, DELETE | ✅ | nodejs | ⚠️ 1 |
| /api/trades/posts/:postId/comments | GET, POST | ✅ | nodejs | ✅ |
| /api/trades/profile | GET, POST, PUT, PATCH | ✅ | nodejs | ✅ |
| /api/trades/profile-new | GET, POST, PATCH | ✅ | nodejs | ✅ |
| /api/trades/profile/:id | GET | ✅ | nodejs | ✅ |
| /api/trades/profile/:id/public | GET | ❌ | nodejs | ✅ |
| /api/trades/profile/portfolio | POST | ✅ | nodejs | ✅ |
| /api/trades/remove-service/:serviceId | DELETE | ✅ | nodejs | ✅ |
| /api/trades/review | POST | ✅ | nodejs | ✅ |
| /api/trades/reviews | GET, POST | ✅ | nodejs | ✅ |
| /api/trades/search | GET | ❌ | nodejs | ✅ |
| /api/trades/send-message | POST | ✅ | nodejs | ✅ |
| /api/trades/subscribe | POST | ✅ | nodejs | ✅ |
| /api/trades/thread/:id | GET | ✅ | nodejs | ✅ |
| /api/trades/update | POST | ✅ | nodejs | ⚠️ 1 |
| /api/trial/status | GET | ✅ | nodejs | ✅ |
| /api/upload/avatar | POST | ✅ | nodejs | ✅ |
| /api/upload/portfolio | POST | ✅ | nodejs | ✅ |
| /api/uploads | POST | ✅ | nodejs | ✅ |
| /api/uploadthing |  | ❌ | nodejs | ✅ |
| /api/user/notifications | GET, PATCH | ✅ | nodejs | ✅ |
| /api/vendors | GET | ❌ | nodejs | ✅ |
| /api/vendors/:slug | GET | ❌ | nodejs | ✅ |
| /api/vendors/products | GET, POST | ✅ | nodejs | ✅ |
| /api/vendors/products/:id | GET, PUT, DELETE | ❌ | nodejs | ✅ |
| /api/vendors/search |  | ✅ | nodejs | ✅ |
| /api/vendors/usage | GET | ✅ | nodejs | ✅ |
| /api/verify-session | GET | ✅ | nodejs | ✅ |
| /api/verify/damage | POST | ❌ | nodejs | ✅ |
| /api/video-access | GET | ✅ | nodejs | ✅ |
| /api/video-reports/:id/revoke | POST | ✅ | nodejs | ✅ |
| /api/video-reports/:id/share | POST | ✅ | nodejs | ✅ |
| /api/video/create | POST | ✅ | nodejs | ✅ |
| /api/wallet/balance | GET | ✅ | nodejs | ✅ |
| /api/wallet/check | POST | ✅ | nodejs | ✅ |
| /api/wallet/reset-monthly | POST | ❌ | nodejs | ⚠️ 1 |
| /api/wallet/spend | POST | ✅ | nodejs | ✅ |
| /api/wallet/topup | POST | ✅ | nodejs | ✅ |
| /api/weather/analyze | POST | ✅ | nodejs | ✅ |
| /api/weather/build-smart | POST | ✅ | nodejs | ✅ |
| /api/weather/cron-daily | GET | ❌ | nodejs | ⚠️ 1 |
| /api/weather/export | POST | ✅ | nodejs | ✅ |
| /api/weather/get | GET | ✅ | nodejs | ✅ |
| /api/weather/quick-dol | POST | ✅ | nodejs | ✅ |
| /api/weather/report | POST | ✅ | nodejs | ✅ |
| /api/weather/share | POST | ✅ | nodejs | ✅ |
| /api/weather/share/:token | GET | ❌ | nodejs | ✅ |
| /api/weather/verify |  | ✅ | nodejs | ✅ |
| /api/webhooks/clerk | GET, POST | ❌ | nodejs | ✅ |
| /api/webhooks/lob | POST | ❌ | nodejs | ✅ |
| /api/webhooks/manage | GET, POST | ✅ | nodejs | ✅ |
| /api/webhooks/stripe | POST | ❌ | nodejs | ✅ |
| /api/webhooks/trades | POST | ❌ | nodejs | ✅ |
| /api/wizard/save | POST | ✅ | nodejs | ✅ |
| /api/workflow/trigger | POST | ✅ | nodejs | ✅ |
| /api/workflows | GET, POST | ❌ | nodejs | ✅ |
| /api/workspace/init | POST | ✅ | nodejs | ✅ |
| /api/xdebug/claims-recovery | GET | ✅ | nodejs | ✅ |
| /api/xdebug/db | GET | ❌ | nodejs | ✅ |
| /api/xdebug/portal-health | GET | ✅ | nodejs | ✅ |
| /api/xdebug/repair-org | POST | ✅ | nodejs | ✅ |
| /api/xdebug/session | GET | ✅ | nodejs | ✅ |
| /api/xdebug/truth | GET | ✅ | nodejs | ⚠️ 1 |

# Required Environment Variables

Generated: 2025-12-25T13:57:22.751Z

## Summary

Total unique variables: 314

## Clerk Auth

| Variable | Public | Files |
|----------|--------|-------|
| `CLERK_PUBLISHABLE_KEY` |  | 1 |
| `CLERK_SECRET_KEY` |  | 15 |
| `CLERK_WEBHOOK_SECRET` |  | 1 |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | ✅ | 4 |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | ✅ | 4 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | 21 |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | 4 |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | 4 |
| `VITE_CLERK_PUBLISHABLE_KEY` |  | 1 |

### `CLERK_PUBLISHABLE_KEY`

Used in:

- `/src/app/api/diag/env/route.ts`

### `CLERK_SECRET_KEY`

Used in:

- `/src/app/api/_diag/route.ts`
- `/src/app/api/auth/debug/route.ts`
- `/src/app/api/auth/health/route.ts`
- `/src/app/api/config/route.ts`
- `/src/app/api/debug/env-check/route.ts`
- `/src/app/api/diag/clerk/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/nav/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/report/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/lib/env/clerk.ts`
- `/src/lib/validateEnv.ts`

### `CLERK_WEBHOOK_SECRET`

Used in:

- `/src/app/api/webhooks/clerk/route.ts`

### `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/auth/debug/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/clerk-debug/page.tsx`
- `/src/lib/env/clerk.ts`

### `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/auth/debug/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/clerk-debug/page.tsx`
- `/src/lib/env/clerk.ts`

### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/_diag/route.ts`
- `/src/app/api/auth/debug/route.ts`
- `/src/app/api/auth/health/route.ts`
- `/src/app/api/config/route.ts`
- `/src/app/api/debug/env-check/route.ts`
- `/src/app/api/diag/clerk/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/nav/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/live/route.ts`
- `/src/app/api/health/report/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/status/route.ts`
- `/src/app/clerk-debug/page.tsx`
- `/src/app/clerk-test/page.tsx`
- `/src/app/layout.tsx`
- `/src/components/providers/ClerkProviders.tsx`
- `/src/lib/env/clerk.ts`
- `/src/lib/validateEnv.ts`

### `NEXT_PUBLIC_CLERK_SIGN_IN_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/auth/debug/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/clerk-debug/page.tsx`
- `/src/lib/env/clerk.ts`

### `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/auth/debug/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/clerk-debug/page.tsx`
- `/src/lib/env/clerk.ts`

### `VITE_CLERK_PUBLISHABLE_KEY`

Used in:

- `/src/app/api/diag/env/route.ts`

## Database

| Variable | Public | Files |
|----------|--------|-------|
| `DATABASE_URL` |  | 23 |
| `DIRECT_URL` |  | 1 |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | 48 |
| `POSTGRES_URL_NON_POOLING` |  | 1 |
| `SUPABASE_URL` |  | 5 |

### `DATABASE_URL`

Used in:

- `/src/app/api/__truth/route.ts`
- `/src/app/api/_diag/route.ts`
- `/src/app/api/debug/env-check/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/nav/route.ts`
- `/src/app/api/diag/prisma/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/flags/[key]/route.ts`
- `/src/app/api/flags/config/[key]/route.ts`
- `/src/app/api/health/agents/route.ts`
- `/src/app/api/health/live/route.ts`
- `/src/app/api/health/ready/route.ts`
- `/src/app/api/health/report/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/xdebug/db/route.ts`
- `/src/app/api/xdebug/session/route.ts`
- `/src/app/api/xdebug/truth/route.ts`
- `/src/lib/backup/recovery.ts`
- `/src/lib/db/index.ts`
- `/src/lib/diagnostics/claimsIntegrity.ts`
- `/src/lib/queue/index.ts`
- `/src/lib/validateEnv.ts`

### `DIRECT_URL`

Used in:

- `/src/app/api/health/startup/route.ts`

### `NEXT_PUBLIC_SUPABASE_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/claims/list/route.ts`
- `/src/app/api/claims/resume/route.ts`
- `/src/app/api/claims/save/route.ts`
- `/src/app/api/claims/start/route.ts`
- `/src/app/api/config/route.ts`
- `/src/app/api/export/complete-packet/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/mockups/generate/route.ts`
- `/src/app/api/reports/generate/route.ts`
- `/src/app/api/retail/list/route.ts`
- `/src/app/api/retail/resume/route.ts`
- `/src/app/api/retail/save/route.ts`
- `/src/app/api/retail/start/route.ts`
- `/src/app/api/storage/signed-read/route.ts`
- `/src/app/api/storage/signed-upload/route.ts`
- `/src/app/api/supplements/generate/route.ts`
- `/src/app/api/upload/avatar/route.ts`
- `/src/app/api/upload/portfolio/route.ts`
- `/src/app/api/verify/damage/route.ts`
- `/src/client/ClientDashboard.tsx`
- `/src/components/CreatePublicLinkButton.tsx`
- `/src/components/pages/AdminFunnels.tsx`
- `/src/components/pages/AdminOpsDashboard.tsx`
- `/src/components/pages/PublicSign.tsx`
- `/src/components/pages/PublicView.tsx`
- `/src/components/pages/StatusCheck.tsx`
- `/src/components/sections/WeatherHailSection.tsx`
- `/src/components/workbench/PhotoActions.tsx`
- `/src/hooks/useRealtimeMessages.ts`
- `/src/hooks/useSSEChat.ts`
- `/src/integrations/supabase/client.ts`
- `/src/lib/ai/useAnnotate.ts`
- `/src/lib/aiFillers.ts`
- `/src/lib/export/zipBuilder.ts`
- `/src/lib/featureFlags.ts`
- `/src/lib/notify.ts`
- `/src/lib/reports/pdf-utils.ts`
- `/src/lib/storage/claim-files.ts`
- `/src/lib/storage/getSignedUrl.ts`
- `/src/lib/storage/uploadPdf.ts`
- `/src/lib/storage-docs.ts`
- `/src/lib/storage.ts`
- `/src/lib/supabase-server.ts`
- `/src/lib/supabaseAdmin.ts`
- `/src/utils/supabase/server.ts`
- `/src/worker/helpers/storage.ts`

### `POSTGRES_URL_NON_POOLING`

Used in:

- `/src/app/api/diag/ready/route.ts`

### `SUPABASE_URL`

Used in:

- `/src/app/api/system/truth/route.ts`
- `/src/lib/storage-docs.ts`
- `/src/lib/storage-server.ts`
- `/src/lib/supabase-server.ts`
- `/src/utils/supabase/server.ts`

## Email

| Variable | Public | Files |
|----------|--------|-------|
| `NEXT_PUBLIC_RESEND_API_KEY` | ✅ | 1 |
| `NEXT_PUBLIC_RESEND_CONFIGURED` | ✅ | 1 |
| `RESEND_API_KEY` |  | 24 |
| `RESEND_FROM_EMAIL` |  | 6 |
| `RESEND_REPLY_TO` |  | 1 |
| `SENDGRID_API_KEY` |  | 1 |

### `NEXT_PUBLIC_RESEND_API_KEY`

**Public variable** (exposed to browser)

Used in:

- `/src/components/pages/StatusCheck.tsx`

### `NEXT_PUBLIC_RESEND_CONFIGURED`

**Public variable** (exposed to browser)

Used in:

- `/src/app/dev/email-preview/page.tsx`

### `RESEND_API_KEY`

Used in:

- `/src/app/api/claims/[claimId]/send-to-adjuster/route.ts`
- `/src/app/api/client/auth/request/route.ts`
- `/src/app/api/cron/email-retry/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/referral/invite/route.ts`
- `/src/app/api/reports/email/route.ts`
- `/src/app/api/test-email/route.ts`
- `/src/components/pages/StatusCheck.tsx`
- `/src/lib/email/esignInvite.ts`
- `/src/lib/email/invitations.ts`
- `/src/lib/email/resend.ts`
- `/src/lib/intel/automation/executors/email.ts`
- `/src/lib/intel/emailDeliveryChannel.ts`
- `/src/lib/mail.ts`
- `/src/lib/mailer.ts`
- `/src/lib/notifications/claimNotifications.ts`
- `/src/lib/notifications/sendNotification.ts`
- `/src/lib/notify.ts`
- `/src/lib/services/notifications.ts`
- `/src/lib/storm-intake/email-notifications.ts`
- `/src/lib/workflow/automationEngine.ts`

### `RESEND_FROM_EMAIL`

Used in:

- `/src/lib/config/constants.ts`
- `/src/lib/email/esignInvite.ts`
- `/src/lib/email/invitations.ts`
- `/src/lib/email/resend.ts`
- `/src/lib/notifications/claimNotifications.ts`
- `/src/lib/storm-intake/email-notifications.ts`

### `RESEND_REPLY_TO`

Used in:

- `/src/lib/email/resend.ts`

### `SENDGRID_API_KEY`

Used in:

- `/src/lib/email.ts`

## Maps

| Variable | Public | Files |
|----------|--------|-------|
| `MAPBOX_ACCESS_TOKEN` |  | 6 |
| `MAPBOX_API_KEY` |  | 1 |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | ✅ | 1 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | 28 |

### `MAPBOX_ACCESS_TOKEN`

Used in:

- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/maps/route.ts`
- `/src/app/api/health-check/maps/route.ts`
- `/src/lib/storm/generateOverlay.ts`

### `MAPBOX_API_KEY`

Used in:

- `/src/lib/debug/mapboxDebug.ts`

### `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/system/truth/route.ts`

### `NEXT_PUBLIC_MAPBOX_TOKEN`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/company-map/CompanyMapClient.tsx`
- `/src/app/(app)/jobs/map/page.tsx`
- `/src/app/(app)/map/ui/MapClient.tsx`
- `/src/app/(app)/maps/view/page.tsx`
- `/src/app/(public)/find/components/ContractorMap.tsx`
- `/src/app/(public)/find/page.tsx`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/nav/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/geocode/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/maps/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/health-check/maps/route.ts`
- `/src/app/api/leads/map-snapshot/route.ts`
- `/src/app/api/maps/geocode/route.ts`
- `/src/app/api/maps/reverse/route.ts`
- `/src/app/api/routes/optimize/route.ts`
- `/src/app/api/system/truth/route.ts`
- `/src/components/MapView.tsx`
- `/src/components/maps/CommunityMapDraw.tsx`
- `/src/components/maps/LeadMap.tsx`
- `/src/components/maps/MapViewV2.tsx`
- `/src/components/maps/legacy/MapClientLegacy.tsx`
- `/src/components/maps/legacy/MapboxMapLegacy.tsx`
- `/src/components/pages/MapPage.tsx`
- `/src/lib/debug/mapboxDebug.ts`
- `/src/lib/geocode/geocodeAddress.ts`

## OpenAI

| Variable | Public | Files |
|----------|--------|-------|
| `OPENAI_API_KEY` |  | 66 |

### `OPENAI_API_KEY`

Used in:

- `/src/app/api/ai/assistant/route.ts`
- `/src/app/api/ai/chat/route.ts`
- `/src/app/api/ai/claim-assistant/route.ts`
- `/src/app/api/ai/damage/route.ts`
- `/src/app/api/ai/damage-builder/route.ts`
- `/src/app/api/ai/estimate/[claimId]/route.ts`
- `/src/app/api/ai/health/route.ts`
- `/src/app/api/ai/insights/route.ts`
- `/src/app/api/ai/insights/snapshot/generate/route.ts`
- `/src/app/api/ai/inspect/route.ts`
- `/src/app/api/ai/supplement/[claimId]/route.ts`
- `/src/app/api/ai/vision/selftest/route.ts`
- `/src/app/api/ask-dominus/route.ts`
- `/src/app/api/assistant/query/route.ts`
- `/src/app/api/claims/[claimId]/ai/route.ts`
- `/src/app/api/claims/[claimId]/appeal/route.ts`
- `/src/app/api/cron/ai-insights/route.ts`
- `/src/app/api/debug/env-check/route.ts`
- `/src/app/api/diag/ai/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/nav/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/agents/route.ts`
- `/src/app/api/health/ai/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/report/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/health/voice/route.ts`
- `/src/app/api/mockups/generate/route.ts`
- `/src/app/api/proposals/health/route.ts`
- `/src/app/api/reports/compose/route.ts`
- `/src/app/api/system/health/route.ts`
- `/src/app/api/system/truth/route.ts`
- `/src/lib/ai/aiAssistant.ts`
- `/src/lib/ai/batfEngine.ts`
- `/src/lib/ai/callOpenAI.ts`
- `/src/lib/ai/claimWriter.ts`
- `/src/lib/ai/client.ts`
- `/src/lib/ai/core-router.ts`
- `/src/lib/ai/dominusVideo.ts`
- `/src/lib/ai/embeddings.ts`
- `/src/lib/ai/engines/timelineEngine.ts`
- `/src/lib/ai/generateRebuttal.ts`
- `/src/lib/ai/generateSupplement.ts`
- `/src/lib/ai/geometry.ts`
- `/src/lib/ai/openai-vision.ts`
- `/src/lib/ai/photo-caption-generator.ts`
- `/src/lib/ai/pricing.ts`
- `/src/lib/ai/realtime.ts`
- `/src/lib/ai/reportGenerator.ts`
- `/src/lib/ai/supplementBuilder.ts`
- `/src/lib/ai/supplementEngine.ts`
- `/src/lib/ai/video/createVideoFromScript.ts`
- `/src/lib/ai/video-generator.ts`
- `/src/lib/ai/vision.ts`
- `/src/lib/ai.ts`
- `/src/lib/claims/predictor.ts`
- `/src/lib/claims/reconstructor.ts`
- `/src/lib/denial/appealEngine.ts`
- `/src/lib/featureFlags.ts`
- `/src/lib/proposals/ai.ts`
- `/src/lib/services/ai-inspection.ts`
- `/src/lib/weather/ai.ts`
- `/src/lib/weather/report.ts`
- `/src/modules/ingest/core/extract.ts`

## Other

| Variable | Public | Files |
|----------|--------|-------|
| `__BUILD_TIME__` |  | 1 |
| `ADMIN_HEALTH_TOKEN` |  | 1 |
| `AI_MAX_TOKENS` |  | 1 |
| `AI_MODEL` |  | 1 |
| `AI_PROVIDER` |  | 1 |
| `AI_REQUEST_TIMEOUT` |  | 1 |
| `AI_TEMPERATURE` |  | 1 |
| `AI_TOKENS_DOL_LIMIT` |  | 1 |
| `AI_TOKENS_MOCKUP_LIMIT` |  | 1 |
| `AI_TOKENS_WEATHER_LIMIT` |  | 1 |
| `ANTHROPIC_API_KEY` |  | 1 |
| `APP_URL` |  | 2 |
| `ARTIFACT_SIGNING_SECRET` |  | 1 |
| `ASSET_VERSION` |  | 1 |
| `ATTOM_API_KEY` |  | 1 |
| `AUTO_CREATE_TENANT` |  | 1 |
| `AZURE_CONTAINER` |  | 1 |
| `BACKUP_BUCKET` |  | 1 |
| `BACKUP_CONTAINER` |  | 1 |
| `BACKUP_ENCRYPTION_KEY` |  | 1 |
| `BUILD_PHASE` |  | 4 |
| `BUILD_TIME` |  | 2 |
| `CAP_API_BASE` |  | 1 |
| `CARRIER_EMAIL_FROM` |  | 1 |
| `CI` |  | 1 |
| `CORELOGIC_API_KEY` |  | 1 |
| `CORELOGIC_HAZARD_API_KEY` |  | 1 |
| `CRON_SECRET` |  | 7 |
| `DATABASE_ENCRYPTION_KEY` |  | 1 |
| `DEMO_ALLOWED_CLAIMS` |  | 1 |
| `DEMO_AUTO_RESET` |  | 1 |
| `DEMO_MODE` |  | 1 |
| `DEMO_READ_ONLY` |  | 1 |
| `DEMO_RESET_INTERVAL` |  | 1 |
| `DEV_BRANDING_AUTOFALLBACK` |  | 1 |
| `DOMINUS_AI_API_KEY` |  | 1 |
| `DOMINUS_AI_VISION_ENDPOINT` |  | 1 |
| `EMAIL_FROM` |  | 6 |
| `EMERGENCY_DEMO_MODE` |  | 2 |
| `EMERGENCY_MODE` |  | 1 |
| `ENABLE_DEMO_TOOLS` |  | 1 |
| `ENABLE_REPORT_EMAIL_NOTIFICATIONS` |  | 1 |
| `ENABLE_SCHEDULER` |  | 1 |
| `ENABLE_UNIVERSAL_REPORTS` |  | 2 |
| `ENCRYPTION_KEY` |  | 2 |
| `ENVIRONMENT` |  | 1 |
| `EXPORT_URL_TTL_SECONDS` |  | 3 |
| `FEATURE_AI_ANALYSIS` |  | 1 |
| `FEATURE_AI_ASSISTANT` |  | 1 |
| `FEATURE_AUTOSAVE` |  | 3 |
| `FEATURE_CLAIMS_WIZARD` |  | 1 |
| `FEATURE_MOCKUPS` |  | 2 |
| `FEATURE_PDF_EXPORT` |  | 1 |
| `FEATURE_PDF_GENERATION` |  | 2 |
| `FEATURE_PUPPETEER` |  | 1 |
| `FEATURE_RETAIL_WIZARD` |  | 1 |
| `FEATURE_SUPPLEMENTS` |  | 1 |
| `FEATURE_TEST_PAGES` |  | 1 |
| `FEATURE_ZIP_EXPORT` |  | 1 |
| `FIREBASE_ADMIN_CLIENT_EMAIL` |  | 1 |
| `FIREBASE_ADMIN_PRIVATE_KEY` |  | 1 |
| `FIREBASE_ADMIN_PROJECT_ID` |  | 1 |
| `FIREBASE_API_KEY` |  | 1 |
| `FIREBASE_APP_ID` |  | 1 |
| `FIREBASE_AUTH_DOMAIN` |  | 1 |
| `FIREBASE_CLIENT_EMAIL` |  | 3 |
| `FIREBASE_PRIVATE_KEY` |  | 3 |
| `FIREBASE_PROJECT_ID` |  | 7 |
| `FIREBASE_SENDER_ID` |  | 1 |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` |  | 1 |
| `FIRST_STREET_API_KEY` |  | 1 |
| `FLAG_SPIKE_THRESHOLD` |  | 1 |
| `FREE_BETA` |  | 5 |
| `FROM_EMAIL` |  | 1 |
| `GCS_BUCKET` |  | 1 |
| `GOOGLE_CLIENT_ID` |  | 2 |
| `INLINE_AGENT_PROCESSOR` |  | 1 |
| `INTERNAL_RENDER_BASE` |  | 1 |
| `JE_MOCK` |  | 1 |
| `JE_SHAW_API_TOKEN` |  | 1 |
| `JE_SHAW_API_URL` |  | 1 |
| `JWT_REFRESH_SECRET` |  | 1 |
| `JWT_SECRET` |  | 1 |
| `LOB_API_KEY` |  | 1 |
| `LOB_TEMPLATE_LETTER_ID` |  | 1 |
| `LOB_TEMPLATE_POSTCARD_BACK_ID` |  | 1 |
| `LOB_TEMPLATE_POSTCARD_FRONT_ID` |  | 1 |
| `LOB_WEBHOOK_SECRET` |  | 1 |
| `LOCAL_BRANDING_TEST_USER` |  | 1 |
| `LOG_LEVEL` |  | 3 |
| `MAINTENANCE_MODE` |  | 1 |
| `MESONET_API_BASE` |  | 1 |
| `NEXT_PHASE` |  | 5 |
| `NEXT_PUBLIC_ADMIN_FLAGS_KEY` | ✅ | 1 |
| `NEXT_PUBLIC_AI_TOOLS_ENABLED` | ✅ | 1 |
| `NEXT_PUBLIC_ANALYTICS_DISABLED` | ✅ | 1 |
| `NEXT_PUBLIC_ANNOUNCE_ENABLED` | ✅ | 1 |
| `NEXT_PUBLIC_ANNOUNCE_TEXT` | ✅ | 1 |
| `NEXT_PUBLIC_API_BASE_URL` | ✅ | 3 |
| `NEXT_PUBLIC_APP_URL` | ✅ | 60 |
| `NEXT_PUBLIC_APP_VERSION` | ✅ | 2 |
| `NEXT_PUBLIC_ASSISTANT_ENABLED` | ✅ | 1 |
| `NEXT_PUBLIC_ASSISTANT_VARIANT` | ✅ | 1 |
| `NEXT_PUBLIC_BASE_URL` | ✅ | 11 |
| `NEXT_PUBLIC_BETA_MODE` | ✅ | 3 |
| `NEXT_PUBLIC_BRANCH` | ✅ | 1 |
| `NEXT_PUBLIC_BUILD_SHA` | ✅ | 2 |
| `NEXT_PUBLIC_COMMIT_SHA` | ✅ | 5 |
| `NEXT_PUBLIC_DEMO_MODE` | ✅ | 5 |
| `NEXT_PUBLIC_DEMO_URL` | ✅ | 1 |
| `NEXT_PUBLIC_DEV_ORG` | ✅ | 1 |
| `NEXT_PUBLIC_EMERGENCY_DEMO_MODE` | ✅ | 1 |
| `NEXT_PUBLIC_ENABLE_DEMO_TOOLS` | ✅ | 1 |
| `NEXT_PUBLIC_ENABLE_UNIVERSAL_REPORTS` | ✅ | 3 |
| `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` | ✅ | 1 |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | 2 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | 1 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | 1 |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ✅ | 1 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | 1 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | 2 |
| `NEXT_PUBLIC_GIT_SHA` | ✅ | 2 |
| `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` | ✅ | 2 |
| `NEXT_PUBLIC_INVITE_ONLY` | ✅ | 1 |
| `NEXT_PUBLIC_JE_MOCK` | ✅ | 1 |
| `NEXT_PUBLIC_JE_SHAW_API_TOKEN` | ✅ | 1 |
| `NEXT_PUBLIC_JE_SHAW_API_URL` | ✅ | 1 |
| `NEXT_PUBLIC_MAINTENANCE_MESSAGE` | ✅ | 1 |
| `NEXT_PUBLIC_MAINTENANCE_MODE` | ✅ | 1 |
| `NEXT_PUBLIC_POSTHOG_HOST` | ✅ | 2 |
| `NEXT_PUBLIC_POSTHOG_KEY` | ✅ | 2 |
| `NEXT_PUBLIC_PRICE_BUSINESS` | ✅ | 1 |
| `NEXT_PUBLIC_PRICE_ENTERPRISE` | ✅ | 1 |
| `NEXT_PUBLIC_PRICE_PRO` | ✅ | 1 |
| `NEXT_PUBLIC_PRICE_SOLO` | ✅ | 1 |
| `NEXT_PUBLIC_PRICE_TOKENS_100` | ✅ | 1 |
| `NEXT_PUBLIC_PRICE_TOKENS_1000` | ✅ | 1 |
| `NEXT_PUBLIC_PRICE_TOKENS_500` | ✅ | 1 |
| `NEXT_PUBLIC_REPORT_BUILDER_ENABLED` | ✅ | 1 |
| `NEXT_PUBLIC_SENTRY_DSN` | ✅ | 3 |
| `NEXT_PUBLIC_SHOW_DEBUG_STRIP` | ✅ | 1 |
| `NEXT_PUBLIC_SHOW_SECOND_SCREEN` | ✅ | 1 |
| `NEXT_PUBLIC_SIGNUPS_ENABLED` | ✅ | 1 |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 6 |
| `NEXT_PUBLIC_STATUS_ENABLED` | ✅ | 1 |
| `NEXT_PUBLIC_SUBSCRIPTIONS_OPEN_AT` | ✅ | 6 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | 9 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | 1 |
| `NEXT_PUBLIC_TEST_MODE` | ✅ | 2 |
| `NEXT_PUBLIC_TOKEN_PACK_ENTERPRISE_PRICE_ID` | ✅ | 1 |
| `NEXT_PUBLIC_TOKEN_PACK_PRO_PRICE_ID` | ✅ | 1 |
| `NEXT_PUBLIC_TOKEN_PACK_STARTER_PRICE_ID` | ✅ | 1 |
| `NEXT_PUBLIC_UPLOADS_ENABLED` | ✅ | 1 |
| `NEXT_PUBLIC_USE_FIREBASE_EMULATOR` | ✅ | 1 |
| `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR` | ✅ | 1 |
| `NEXT_PUBLIC_VERCEL_ENV` | ✅ | 4 |
| `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` | ✅ | 4 |
| `NODE_ENV` |  | 81 |
| `OPENAI_ASSISTANT_ID` |  | 1 |
| `OPENAI_DEFAULT_MODEL` |  | 1 |
| `OPENAI_KEY` |  | 2 |
| `OPENAI_MODEL` |  | 1 |
| `OPENAI_VIDEO_MODEL` |  | 1 |
| `PDF_DEV_KEY` |  | 1 |
| `PDF_RENDER_TIMEOUT` |  | 1 |
| `PGPOOL_MAX` |  | 1 |
| `QUICKBOOKS_CLIENT_ID` |  | 2 |
| `R2_ACCOUNT_ID` |  | 1 |
| `R2_BUCKET` |  | 1 |
| `REDIS_HOST` |  | 2 |
| `REDIS_PASSWORD` |  | 2 |
| `REDIS_PORT` |  | 2 |
| `REDIS_STRICT_MODE` |  | 1 |
| `REDIS_TLS` |  | 1 |
| `REDIS_TOKEN` |  | 1 |
| `REDIS_URL` |  | 6 |
| `REDIS_USERNAME` |  | 1 |
| `REFERRAL_TOKEN_REWARD` |  | 1 |
| `REPLICATE_API_TOKEN` |  | 8 |
| `REPORTS_BUCKET` |  | 1 |
| `SALESFORCE_CLIENT_ID` |  | 1 |
| `SENTRY_DSN` |  | 1 |
| `SENTRY_TEST` |  | 1 |
| `SERVICE_KEY` |  | 1 |
| `SERVICE_TOKEN_SECRET` |  | 1 |
| `SLACK_ALERT_WEBHOOK_URL` |  | 1 |
| `STABILITY_API_KEY` |  | 1 |
| `SUBSCRIPTIONS_FORCE_OPEN` |  | 3 |
| `SUPABASE_ANON_KEY` |  | 1 |
| `SUPABASE_SERVICE_ROLE_KEY` |  | 35 |
| `SYNTHESIA_API_KEY` |  | 1 |
| `TEST_AUTH_BYPASS` |  | 4 |
| `TEST_AUTH_ORG_ID` |  | 3 |
| `TEST_AUTH_USER_ID` |  | 3 |
| `TIMEOUT_AI_ANALYSIS` |  | 1 |
| `TIMEOUT_PDF_GENERATION` |  | 1 |
| `TRADES_SERVICE_URL` |  | 2 |
| `TRADES_WEBHOOK_SECRET` |  | 1 |
| `TWILIO_ACCOUNT_SID` |  | 3 |
| `TWILIO_AUTH` |  | 1 |
| `TWILIO_AUTH_TOKEN` |  | 3 |
| `TWILIO_NUMBER` |  | 1 |
| `TWILIO_PHONE_NUMBER` |  | 3 |
| `TWILIO_SID` |  | 1 |
| `UPSTASH_REDIS_REST_TOKEN` |  | 7 |
| `UPSTASH_REDIS_REST_URL` |  | 10 |
| `VAPID_PRIVATE_KEY` |  | 1 |
| `VAPID_PUBLIC_KEY` |  | 1 |
| `VAULT_ENCRYPTION_KEY` |  | 1 |
| `VERCEL` |  | 6 |
| `VERCEL_BUILD_TIME` |  | 2 |
| `VERCEL_CRON_SECRET` |  | 1 |
| `VERCEL_ENV` |  | 21 |
| `VERCEL_GIT_COMMIT_MESSAGE` |  | 1 |
| `VERCEL_GIT_COMMIT_REF` |  | 6 |
| `VERCEL_GIT_COMMIT_SHA` |  | 21 |
| `VERCEL_PROJECT_PRODUCTION_URL` |  | 1 |
| `VERCEL_REGION` |  | 3 |
| `VERCEL_REQUEST_ID` |  | 1 |
| `VERCEL_URL` |  | 10 |
| `VIDEO_MOCK_MODE` |  | 1 |
| `VIDEO_REAL_ENABLED` |  | 1 |
| `VISUAL_CROSSING_API_KEY` |  | 5 |
| `VISUALCROSSING_API_KEY` |  | 7 |
| `WEATHER_DEV_KEY` |  | 1 |
| `WEATHER_STACK_API_KEY` |  | 6 |
| `WEATHERSTACK_API_KEY` |  | 9 |
| `WHITELISTED_IP_RANGES` |  | 1 |
| `WHITELISTED_IPS` |  | 1 |

### `__BUILD_TIME__`

Used in:

- `/src/app/api/diag/version/route.ts`

### `ADMIN_HEALTH_TOKEN`

Used in:

- `/src/app/api/health/report/route.ts`

### `AI_MAX_TOKENS`

Used in:

- `/src/lib/ai/aiAssistant.ts`

### `AI_MODEL`

Used in:

- `/src/lib/ai/aiAssistant.ts`

### `AI_PROVIDER`

Used in:

- `/src/lib/ai/aiAssistant.ts`

### `AI_REQUEST_TIMEOUT`

Used in:

- `/src/lib/featureFlags.ts`

### `AI_TEMPERATURE`

Used in:

- `/src/lib/ai/aiAssistant.ts`

### `AI_TOKENS_DOL_LIMIT`

Used in:

- `/src/modules/ai/core/tokens.ts`

### `AI_TOKENS_MOCKUP_LIMIT`

Used in:

- `/src/modules/ai/core/tokens.ts`

### `AI_TOKENS_WEATHER_LIMIT`

Used in:

- `/src/modules/ai/core/tokens.ts`

### `ANTHROPIC_API_KEY`

Used in:

- `/src/lib/ai/aiAssistant.ts`

### `APP_URL`

Used in:

- `/src/features/reports/renderEngine.ts`
- `/src/lib/integrations/advanced.ts`

### `ARTIFACT_SIGNING_SECRET`

Used in:

- `/src/lib/artifacts/signedUrls.ts`

### `ASSET_VERSION`

Used in:

- `/src/utils/assetVersion.ts`

### `ATTOM_API_KEY`

Used in:

- `/src/lib/services/county-assessor.ts`

### `AUTO_CREATE_TENANT`

Used in:

- `/src/lib/auth/tenant.ts`

### `AZURE_CONTAINER`

Used in:

- `/src/lib/storage/fileManager.ts`

### `BACKUP_BUCKET`

Used in:

- `/src/lib/backup/recovery.ts`

### `BACKUP_CONTAINER`

Used in:

- `/src/lib/backup/recovery.ts`

### `BACKUP_ENCRYPTION_KEY`

Used in:

- `/src/lib/security/backupEncryption.ts`

### `BUILD_PHASE`

Used in:

- `/src/instrumentation-client.ts`
- `/src/instrumentation.ts`
- `/src/lib/buildPhase.ts`
- `/src/lib/net/guardedFetch.ts`

### `BUILD_TIME`

Used in:

- `/src/app/api/_meta/route.ts`
- `/src/app/api/build-info/route.ts`

### `CAP_API_BASE`

Used in:

- `/src/lib/weather/cap.ts`

### `CARRIER_EMAIL_FROM`

Used in:

- `/src/lib/intel/emailDeliveryChannel.ts`

### `CI`

Used in:

- `/src/lib/buildPhase.ts`

### `CORELOGIC_API_KEY`

Used in:

- `/src/lib/services/county-assessor.ts`

### `CORELOGIC_HAZARD_API_KEY`

Used in:

- `/src/lib/services/weather-hazard.ts`

### `CRON_SECRET`

Used in:

- `/src/app/api/cron/ai-insights/route.ts`
- `/src/app/api/cron/daily/route.ts`
- `/src/app/api/cron/email-retry/route.ts`
- `/src/app/api/cron/process-batch-jobs/route.ts`
- `/src/app/api/cron/stripe-reconcile/route.ts`
- `/src/app/api/cron/trials/sweep/route.ts`
- `/src/app/api/wallet/reset-monthly/route.ts`

### `DATABASE_ENCRYPTION_KEY`

Used in:

- `/src/lib/encryption/dataEncryption.ts`

### `DEMO_ALLOWED_CLAIMS`

Used in:

- `/src/lib/demo/config.ts`

### `DEMO_AUTO_RESET`

Used in:

- `/src/lib/demo/config.ts`

### `DEMO_MODE`

Used in:

- `/src/lib/demoMode.ts`

### `DEMO_READ_ONLY`

Used in:

- `/src/lib/demo/config.ts`

### `DEMO_RESET_INTERVAL`

Used in:

- `/src/lib/demo/config.ts`

### `DEV_BRANDING_AUTOFALLBACK`

Used in:

- `/src/app/api/branding/status/route.ts`

### `DOMINUS_AI_API_KEY`

Used in:

- `/src/app/api/ai/analyze-damage/route.ts`

### `DOMINUS_AI_VISION_ENDPOINT`

Used in:

- `/src/app/api/ai/analyze-damage/route.ts`

### `EMAIL_FROM`

Used in:

- `/src/app/api/cron/email-retry/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/referral/invite/route.ts`
- `/src/app/api/test-email/route.ts`
- `/src/lib/email/sendPacketEmail.ts`
- `/src/lib/mailer.ts`

### `EMERGENCY_DEMO_MODE`

Used in:

- `/src/app/api/demo/setup/route.ts`
- `/src/lib/workspace/demoWorkspaceReady.ts`

### `EMERGENCY_MODE`

Used in:

- `/src/lib/feature-flags.ts`

### `ENABLE_DEMO_TOOLS`

Used in:

- `/src/app/api/dev/create-demo-claim-report/route.ts`

### `ENABLE_REPORT_EMAIL_NOTIFICATIONS`

Used in:

- `/src/lib/notifications/reportNotifications.ts`

### `ENABLE_SCHEDULER`

Used in:

- `/src/worker/scheduler.ts`

### `ENABLE_UNIVERSAL_REPORTS`

Used in:

- `/src/app/(app)/claims/[claimId]/report/page.tsx`
- `/src/app/api/admin/report-metrics/route.ts`

### `ENCRYPTION_KEY`

Used in:

- `/src/lib/encryption/dataEncryption.ts`
- `/src/lib/security/backupEncryption.ts`

### `ENVIRONMENT`

Used in:

- `/src/app/api/diag/nav/route.ts`

### `EXPORT_URL_TTL_SECONDS`

Used in:

- `/src/app/api/mockups/generate/route.ts`
- `/src/app/api/reports/generate/route.ts`
- `/src/app/api/supplements/generate/route.ts`

### `FEATURE_AI_ANALYSIS`

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`

### `FEATURE_AI_ASSISTANT`

Used in:

- `/src/lib/featureFlags.ts`

### `FEATURE_AUTOSAVE`

Used in:

- `/src/app/api/claims/resume/route.ts`
- `/src/app/api/retail/resume/route.ts`
- `/src/lib/env.ts`

### `FEATURE_CLAIMS_WIZARD`

Used in:

- `/src/lib/env.ts`

### `FEATURE_MOCKUPS`

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`
- `/src/lib/featureFlags.ts`

### `FEATURE_PDF_EXPORT`

Used in:

- `/src/lib/env.ts`

### `FEATURE_PDF_GENERATION`

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`
- `/src/lib/featureFlags.ts`

### `FEATURE_PUPPETEER`

Used in:

- `/src/lib/featureFlags.ts`

### `FEATURE_RETAIL_WIZARD`

Used in:

- `/src/lib/env.ts`

### `FEATURE_SUPPLEMENTS`

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`

### `FEATURE_TEST_PAGES`

Used in:

- `/src/lib/env.ts`

### `FEATURE_ZIP_EXPORT`

Used in:

- `/src/lib/env.ts`

### `FIREBASE_ADMIN_CLIENT_EMAIL`

Used in:

- `/src/app/api/health/comprehensive/route.ts`

### `FIREBASE_ADMIN_PRIVATE_KEY`

Used in:

- `/src/app/api/health/comprehensive/route.ts`

### `FIREBASE_ADMIN_PROJECT_ID`

Used in:

- `/src/app/api/health/comprehensive/route.ts`

### `FIREBASE_API_KEY`

Used in:

- `/src/lib/storage/firebaseClient.ts`

### `FIREBASE_APP_ID`

Used in:

- `/src/lib/storage/firebaseClient.ts`

### `FIREBASE_AUTH_DOMAIN`

Used in:

- `/src/lib/storage/firebaseClient.ts`

### `FIREBASE_CLIENT_EMAIL`

Used in:

- `/src/lib/firebase-admin-safe.ts`
- `/src/lib/firebase-admin.ts`
- `/src/lib/firebaseAdmin.ts`

### `FIREBASE_PRIVATE_KEY`

Used in:

- `/src/lib/firebase-admin-safe.ts`
- `/src/lib/firebase-admin.ts`
- `/src/lib/firebaseAdmin.ts`

### `FIREBASE_PROJECT_ID`

Used in:

- `/src/app/api/diag/ai/route.ts`
- `/src/app/api/diag/storage/route.ts`
- `/src/lib/firebase-admin-safe.ts`
- `/src/lib/firebase-admin.ts`
- `/src/lib/firebaseAdmin.ts`
- `/src/lib/storage/firebaseClient.ts`
- `/src/lib/storage.ts`

### `FIREBASE_SENDER_ID`

Used in:

- `/src/lib/storage/firebaseClient.ts`

### `FIREBASE_SERVICE_ACCOUNT_BASE64`

Used in:

- `/src/lib/firebase-admin-safe.ts`

### `FIRST_STREET_API_KEY`

Used in:

- `/src/lib/services/weather-hazard.ts`

### `FLAG_SPIKE_THRESHOLD`

Used in:

- `/src/app/api/flags/metrics/route.ts`

### `FREE_BETA`

Used in:

- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/me/init/route.ts`
- `/src/app/api/stripe/checkout/route.ts`
- `/src/lib/db/tokens.ts`
- `/src/lib/usage/quotas.ts`

### `FROM_EMAIL`

Used in:

- `/src/lib/email.ts`

### `GCS_BUCKET`

Used in:

- `/src/lib/storage/fileManager.ts`

### `GOOGLE_CLIENT_ID`

Used in:

- `/src/lib/integrations/advanced.ts`
- `/src/lib/integrations/marketplace.ts`

### `INLINE_AGENT_PROCESSOR`

Used in:

- `/src/lib/agent/inlineProcessor.ts`

### `INTERNAL_RENDER_BASE`

Used in:

- `/src/lib/pdf/renderEngine.ts`

### `JE_MOCK`

Used in:

- `/src/components/pages/StatusCheck.tsx`

### `JE_SHAW_API_TOKEN`

Used in:

- `/src/components/pages/StatusCheck.tsx`

### `JE_SHAW_API_URL`

Used in:

- `/src/components/pages/StatusCheck.tsx`

### `JWT_REFRESH_SECRET`

Used in:

- `/src/lib/mobile/auth.ts`

### `JWT_SECRET`

Used in:

- `/src/lib/mobile/auth.ts`

### `LOB_API_KEY`

Used in:

- `/src/lib/lob/client.ts`

### `LOB_TEMPLATE_LETTER_ID`

Used in:

- `/src/lib/lob/client.ts`

### `LOB_TEMPLATE_POSTCARD_BACK_ID`

Used in:

- `/src/lib/lob/client.ts`

### `LOB_TEMPLATE_POSTCARD_FRONT_ID`

Used in:

- `/src/lib/lob/client.ts`

### `LOB_WEBHOOK_SECRET`

Used in:

- `/src/app/api/webhooks/lob/route.ts`

### `LOCAL_BRANDING_TEST_USER`

Used in:

- `/src/app/api/branding/status/route.ts`

### `LOG_LEVEL`

Used in:

- `/src/lib/monitoring/logger.ts`
- `/src/lib/observability/logger.ts`
- `/src/worker/scheduler.ts`

### `MAINTENANCE_MODE`

Used in:

- `/src/lib/feature-flags.ts`

### `MESONET_API_BASE`

Used in:

- `/src/lib/weather/mesonet.ts`

### `NEXT_PHASE`

Used in:

- `/src/app/api/dev/fix-org/route.ts`
- `/src/lib/auth/tenant.ts`
- `/src/lib/buildPhase.ts`
- `/src/lib/fetchSafe.ts`
- `/src/lib/net/guardedFetch.ts`

### `NEXT_PUBLIC_ADMIN_FLAGS_KEY`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/admin/flags/page.tsx`

### `NEXT_PUBLIC_AI_TOOLS_ENABLED`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/feature-flags.ts`

### `NEXT_PUBLIC_ANALYTICS_DISABLED`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/analytics/track.ts`

### `NEXT_PUBLIC_ANNOUNCE_ENABLED`

**Public variable** (exposed to browser)

Used in:

- `/src/components/AnnouncementBar.tsx`

### `NEXT_PUBLIC_ANNOUNCE_TEXT`

**Public variable** (exposed to browser)

Used in:

- `/src/components/AnnouncementBar.tsx`

### `NEXT_PUBLIC_API_BASE_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/components/pages/RetailBuild.tsx`
- `/src/lib/api.ts`
- `/src/lib/storage.ts`

### `NEXT_PUBLIC_APP_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/property-profiles/[id]/page.tsx`
- `/src/app/actions/addTokens.ts`
- `/src/app/api/_wip/report/pdf/route.ts`
- `/src/app/api/billing/checkout/route.ts`
- `/src/app/api/billing/full-access/checkout/route.ts`
- `/src/app/api/billing/portal/route.ts`
- `/src/app/api/billing/report-credits/checkout/route.ts`
- `/src/app/api/billing/token-pack/checkout/route.ts`
- `/src/app/api/billing/tokens/checkout/route.ts`
- `/src/app/api/checkout/route.ts`
- `/src/app/api/claims/[claimId]/rebuttal-builder/route.ts`
- `/src/app/api/claims/[claimId]/report/pdf/route.ts`
- `/src/app/api/claims/route.ts`
- `/src/app/api/client/auth/request/route.ts`
- `/src/app/api/client-portal/invite/route.ts`
- `/src/app/api/cron/trials/sweep/route.ts`
- `/src/app/api/dev/send-email/route.ts`
- `/src/app/api/diag/version/route.ts`
- `/src/app/api/esign/envelopes/[envelopeId]/send/route.ts`
- `/src/app/api/estimates/[id]/draft-email/route.ts`
- `/src/app/api/estimates/[id]/send-packet/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/env/route.ts`
- `/src/app/api/portal/invite/route.ts`
- `/src/app/api/proposals/[id]/publish/route.ts`
- `/src/app/api/public/reports/[id]/accept/route.ts`
- `/src/app/api/qr/generate/route.ts`
- `/src/app/api/reports/[reportId]/draft-email/route.ts`
- `/src/app/api/reports/[reportId]/regenerate-links/route.ts`
- `/src/app/api/reports/[reportId]/send-packet/route.ts`
- `/src/app/api/reports/share/route.ts`
- `/src/app/api/stripe/checkout/route.ts`
- `/src/app/api/stripe/checkout/topup/route.ts`
- `/src/app/api/supplements/[id]/draft-email/route.ts`
- `/src/app/api/supplements/[id]/send-packet/route.ts`
- `/src/app/api/support/tickets/route.ts`
- `/src/app/api/team/invitations/[id]/resend/route.ts`
- `/src/app/api/team/invitations/route.ts`
- `/src/app/api/teams/invite/route.ts`
- `/src/app/api/tokens/buy/route.ts`
- `/src/app/api/trades/subscribe/route.ts`
- `/src/app/api/webhooks/stripe/route.ts`
- `/src/app/api/xdebug/truth/route.ts`
- `/src/app/dev/email-preview/page.tsx`
- `/src/lib/billing/autoRefill.ts`
- `/src/lib/billing/portal.ts`
- `/src/lib/client-portal/authentication.ts`
- `/src/lib/email/invitations.ts`
- `/src/lib/email/resend.ts`
- `/src/lib/mail.ts`
- `/src/lib/notifications/claimNotifications.ts`
- `/src/lib/notifications/sendNotification.ts`
- `/src/lib/proposals/render.ts`
- `/src/lib/qr/generator.ts`
- `/src/lib/realtime/collaboration.ts`
- `/src/lib/security/cors.ts`
- `/src/lib/templates/generateTemplatePDF.ts`
- `/src/lib/utils/publicId.ts`
- `/src/lib/websocket/server.ts`
- `/src/lib/websocket/useClaimWebSocket.ts`

### `NEXT_PUBLIC_APP_VERSION`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/diag/version/route.ts`
- `/src/components/FooterStatus.tsx`

### `NEXT_PUBLIC_ASSISTANT_ENABLED`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/status/route.ts`

### `NEXT_PUBLIC_ASSISTANT_VARIANT`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/status/route.ts`

### `NEXT_PUBLIC_BASE_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/checkout/route.ts`
- `/src/app/api/claims/[claimId]/invite/route.ts`
- `/src/app/api/export/pdf/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/reports/generate/route.ts`
- `/src/app/api/system/health/route.ts`
- `/src/app/api/trades/onboarding/route.ts`
- `/src/app/api/weather/share/route.ts`
- `/src/lib/artifacts/signedUrls.ts`
- `/src/lib/auth.ts`
- `/src/lib/config/constants.ts`

### `NEXT_PUBLIC_BETA_MODE`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/settings/billing/page.tsx`
- `/src/app/(marketing)/pricing/page.tsx`
- `/src/lib/beta.ts`

### `NEXT_PUBLIC_BRANCH`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/deploy-info/route.ts`

### `NEXT_PUBLIC_BUILD_SHA`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/build-info/route.ts`
- `/src/app/api/status/route.ts`

### `NEXT_PUBLIC_COMMIT_SHA`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`
- `/src/app/api/build-info/route.ts`
- `/src/app/api/deploy-info/_deploy/route.ts`
- `/src/app/api/deploy-info/route.ts`
- `/src/components/BuildFingerprint.tsx`

### `NEXT_PUBLIC_DEMO_MODE`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/layout.tsx`
- `/src/components/demo/DemoModeBanner.tsx`
- `/src/lib/demo/config.ts`
- `/src/lib/demoMode.ts`
- `/src/lib/flags.ts`

### `NEXT_PUBLIC_DEMO_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/components/marketing/LaunchBanner.tsx`

### `NEXT_PUBLIC_DEV_ORG`

**Public variable** (exposed to browser)

Used in:

- `/src/components/pages/network/post-job.tsx`

### `NEXT_PUBLIC_EMERGENCY_DEMO_MODE`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/workspace/demoWorkspaceReady.ts`

### `NEXT_PUBLIC_ENABLE_DEMO_TOOLS`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/admin/demo-tools/page.tsx`

### `NEXT_PUBLIC_ENABLE_UNIVERSAL_REPORTS`

**Public variable** (exposed to browser)

Used in:

- `/src/components/admin/ReportMetricsWidget.tsx`
- `/src/components/claims/UniversalReportSection.tsx`
- `/src/components/portal/ClientReportDocumentsCard.tsx`

### `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/health/comprehensive/route.ts`

### `NEXT_PUBLIC_FIREBASE_API_KEY`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/health/comprehensive/route.ts`
- `/src/lib/firebase.ts`

### `NEXT_PUBLIC_FIREBASE_APP_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/firebase.ts`

### `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/firebase.ts`

### `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/firebase.ts`

### `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/firebase.ts`

### `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/health/comprehensive/route.ts`
- `/src/lib/firebase.ts`

### `NEXT_PUBLIC_GIT_SHA`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/_meta/route.ts`
- `/src/components/BuildStamp.tsx`

### `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/components/auth/GoogleOneTap.tsx`
- `/src/components/pages/StatusCheck.tsx`

### `NEXT_PUBLIC_INVITE_ONLY`

**Public variable** (exposed to browser)

Used in:

- `/src/components/pages/AuthLogin.tsx`

### `NEXT_PUBLIC_JE_MOCK`

**Public variable** (exposed to browser)

Used in:

- `/src/components/pages/StatusCheck.tsx`

### `NEXT_PUBLIC_JE_SHAW_API_TOKEN`

**Public variable** (exposed to browser)

Used in:

- `/src/components/pages/StatusCheck.tsx`

### `NEXT_PUBLIC_JE_SHAW_API_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/components/pages/StatusCheck.tsx`

### `NEXT_PUBLIC_MAINTENANCE_MESSAGE`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/feature-flags.ts`

### `NEXT_PUBLIC_MAINTENANCE_MODE`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/feature-flags.ts`

### `NEXT_PUBLIC_POSTHOG_HOST`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/analytics/posthog.ts`
- `/src/lib/analytics.tsx`

### `NEXT_PUBLIC_POSTHOG_KEY`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/analytics/posthog.ts`
- `/src/lib/analytics.tsx`

### `NEXT_PUBLIC_PRICE_BUSINESS`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/config/route.ts`

### `NEXT_PUBLIC_PRICE_ENTERPRISE`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/config/route.ts`

### `NEXT_PUBLIC_PRICE_PRO`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/config/route.ts`

### `NEXT_PUBLIC_PRICE_SOLO`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/config/route.ts`

### `NEXT_PUBLIC_PRICE_TOKENS_100`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/settings/billing/page.tsx`

### `NEXT_PUBLIC_PRICE_TOKENS_1000`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/settings/billing/page.tsx`

### `NEXT_PUBLIC_PRICE_TOKENS_500`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/settings/billing/page.tsx`

### `NEXT_PUBLIC_REPORT_BUILDER_ENABLED`

**Public variable** (exposed to browser)

Used in:

- `/src/middleware.admin-features.ts`

### `NEXT_PUBLIC_SENTRY_DSN`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/health/comprehensive/route.ts`
- `/src/instrumentation-client.ts`
- `/src/lib/monitoring/errorTracking.ts`

### `NEXT_PUBLIC_SHOW_DEBUG_STRIP`

**Public variable** (exposed to browser)

Used in:

- `/src/config/version.ts`

### `NEXT_PUBLIC_SHOW_SECOND_SCREEN`

**Public variable** (exposed to browser)

Used in:

- `/src/modules/ui/controls/ModeToggles.tsx`

### `NEXT_PUBLIC_SIGNUPS_ENABLED`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/feature-flags.ts`

### `NEXT_PUBLIC_SITE_URL`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(public)/c/[slug]/page.tsx`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/reports/[reportId]/resend/route.ts`
- `/src/app/api/share/create/route.ts`
- `/src/env/index.ts`
- `/src/lib/validateEnv.ts`

### `NEXT_PUBLIC_STATUS_ENABLED`

**Public variable** (exposed to browser)

Used in:

- `/src/components/pages/StatusCheck.tsx`

### `NEXT_PUBLIC_SUBSCRIPTIONS_OPEN_AT`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/admin/launch-status/route.ts`
- `/src/app/api/billing/checkout/route.ts`
- `/src/app/api/checkout/route.ts`
- `/src/components/BetaCountdownBanner.tsx`
- `/src/components/CheckoutButton.tsx`
- `/src/components/SubscriptionsChip.tsx`

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/config/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/components/pages/StatusCheck.tsx`
- `/src/hooks/useRealtimeMessages.ts`
- `/src/integrations/supabase/client.ts`
- `/src/lib/storage/claim-files.ts`
- `/src/lib/storage-docs.ts`
- `/src/lib/supabase-server.ts`

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Public variable** (exposed to browser)

Used in:

- `/src/components/workbench/PhotoActions.tsx`

### `NEXT_PUBLIC_TEST_MODE`

**Public variable** (exposed to browser)

Used in:

- `/src/components/billing/UpgradeCTA.tsx`
- `/src/lib/testMode.ts`

### `NEXT_PUBLIC_TOKEN_PACK_ENTERPRISE_PRICE_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/config/tokens.ts`

### `NEXT_PUBLIC_TOKEN_PACK_PRO_PRICE_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/config/tokens.ts`

### `NEXT_PUBLIC_TOKEN_PACK_STARTER_PRICE_ID`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/config/tokens.ts`

### `NEXT_PUBLIC_UPLOADS_ENABLED`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/feature-flags.ts`

### `NEXT_PUBLIC_USE_FIREBASE_EMULATOR`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/firebase.ts`

### `NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR`

**Public variable** (exposed to browser)

Used in:

- `/src/lib/functionsClient.ts`

### `NEXT_PUBLIC_VERCEL_ENV`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/settings/production-verification/page.tsx`
- `/src/app/api/diag/version/route.ts`
- `/src/instrumentation-client.ts`
- `/src/lib/log.ts`

### `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`

**Public variable** (exposed to browser)

Used in:

- `/src/app/(app)/settings/production-verification/page.tsx`
- `/src/app/(app)/support/page.tsx`
- `/src/instrumentation-client.ts`
- `/src/lib/log.ts`

### `NODE_ENV`

Used in:

- `/src/app/(app)/dashboard/page.tsx`
- `/src/app/(app)/settings/security-audit/page.tsx`
- `/src/app/(client-portal)/error.tsx`
- `/src/app/api/__truth/route.ts`
- `/src/app/api/_build/route.ts`
- `/src/app/api/_diag/route.ts`
- `/src/app/api/_meta/route.ts`
- `/src/app/api/ai/rebuttal/route.ts`
- `/src/app/api/auth/debug/route.ts`
- `/src/app/api/auth/health/route.ts`
- `/src/app/api/branding/upsert/route.ts`
- `/src/app/api/build-info/route.ts`
- `/src/app/api/build-verify/route.ts`
- `/src/app/api/claims/create/route.ts`
- `/src/app/api/debug/env-check/route.ts`
- `/src/app/api/dev/bootstrap-org/route.ts`
- `/src/app/api/dev/send-email/route.ts`
- `/src/app/api/dev/throw/route.ts`
- `/src/app/api/diag/clerk/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/nav/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/env/route.ts`
- `/src/app/api/health/report/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/tenant/route.ts`
- `/src/app/api/me/network-metrics/route.ts`
- `/src/app/api/messages/threads/route.ts`
- `/src/app/api/reports/claims/[claimId]/pdf/route.ts`
- `/src/app/api/status/route.ts`
- `/src/app/api/test-sentry/route.ts`
- `/src/app/api/weather/quick-dol/route.ts`
- `/src/app/api/weather/report/route.ts`
- `/src/app/api/xdebug/claims-recovery/route.ts`
- `/src/app/api/xdebug/session/route.ts`
- `/src/app/api/xdebug/truth/route.ts`
- `/src/app/boot-test/page.tsx`
- `/src/app/dev/email-preview/page.tsx`
- `/src/app/dev-dashboard/page.tsx`
- `/src/app/global-error.tsx`
- `/src/components/AppHeader.tsx`
- `/src/components/ErrorBoundary.tsx`
- `/src/components/ProtectedRoute.tsx`
- `/src/components/SKaiAssistant.tsx`
- `/src/components/errors/ApiErrorBoundary.tsx`
- `/src/components/errors/AuthErrorBoundary.tsx`
- `/src/components/errors/PaymentErrorBoundary.tsx`
- `/src/components/errors/SmartErrorBoundary.tsx`
- `/src/components/errors/UploadErrorBoundary.tsx`
- `/src/components/onboarding/GettingStartedCard.tsx`
- `/src/env/index.ts`
- `/src/instrumentation-client.ts`
- `/src/lib/ai/router.ts`
- `/src/lib/analytics/posthog.ts`
- `/src/lib/api/response.ts`
- `/src/lib/api/safeResponse.ts`
- `/src/lib/buildPhase.ts`
- `/src/lib/db/index.ts`
- `/src/lib/debug/mapboxDebug.ts`
- `/src/lib/email.ts`
- `/src/lib/env/clerk.ts`
- `/src/lib/env.ts`
- `/src/lib/fetchSafe.ts`
- `/src/lib/firebase.ts`
- `/src/lib/log.ts`
- `/src/lib/logger.ts`
- `/src/lib/mail.ts`
- `/src/lib/monitoring/healthCheck.ts`
- `/src/lib/monitoring/logger.ts`
- `/src/lib/pdf/weatherTemplate.ts`
- `/src/lib/performance.ts`
- `/src/lib/permissions/verify.ts`
- `/src/lib/prisma.ts`
- `/src/lib/security/cors.ts`
- `/src/lib/security/secrets.ts`
- `/src/lib/templates/renderer.ts`
- `/src/lib/validateEnv.ts`
- `/src/middleware/ipWhitelist.ts`
- `/src/pdf/weatherTemplate.ts`
- `/src/worker/index.ts`

### `OPENAI_ASSISTANT_ID`

Used in:

- `/src/app/api/assistant/query/route.ts`

### `OPENAI_DEFAULT_MODEL`

Used in:

- `/src/lib/ai/client.ts`

### `OPENAI_KEY`

Used in:

- `/src/lib/ai/classifyDocument.ts`
- `/src/lib/ai/messageAssistant.ts`

### `OPENAI_MODEL`

Used in:

- `/src/app/api/ai/health/route.ts`

### `OPENAI_VIDEO_MODEL`

Used in:

- `/src/lib/ai/video/createVideoFromScript.ts`

### `PDF_DEV_KEY`

Used in:

- `/src/app/api/reports/claims/[claimId]/pdf/route.ts`

### `PDF_RENDER_TIMEOUT`

Used in:

- `/src/lib/featureFlags.ts`

### `PGPOOL_MAX`

Used in:

- `/src/lib/db/index.ts`

### `QUICKBOOKS_CLIENT_ID`

Used in:

- `/src/lib/integrations/advanced.ts`
- `/src/lib/integrations/marketplace.ts`

### `R2_ACCOUNT_ID`

Used in:

- `/src/lib/storage/fileManager.ts`

### `R2_BUCKET`

Used in:

- `/src/lib/storage/fileManager.ts`

### `REDIS_HOST`

Used in:

- `/src/agents/runtime/queue/bullmqClient.ts`
- `/src/lib/redis.ts`

### `REDIS_PASSWORD`

Used in:

- `/src/agents/runtime/queue/bullmqClient.ts`
- `/src/lib/redis.ts`

### `REDIS_PORT`

Used in:

- `/src/agents/runtime/queue/bullmqClient.ts`
- `/src/lib/redis.ts`

### `REDIS_STRICT_MODE`

Used in:

- `/src/lib/redis.ts`

### `REDIS_TLS`

Used in:

- `/src/lib/redis.ts`

### `REDIS_TOKEN`

Used in:

- `/src/lib/rateLimit/system.ts`

### `REDIS_URL`

Used in:

- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/lib/agent/queues.ts`
- `/src/lib/rateLimit/system.ts`

### `REDIS_USERNAME`

Used in:

- `/src/lib/redis.ts`

### `REFERRAL_TOKEN_REWARD`

Used in:

- `/src/lib/referrals/config.ts`

### `REPLICATE_API_TOKEN`

Used in:

- `/src/app/api/ai/mockup/route.ts`
- `/src/app/api/diag/ai/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/lib/ai/batfEngine.ts`
- `/src/lib/video/renderVideo.ts`

### `REPORTS_BUCKET`

Used in:

- `/src/lib/pdf/renderEngine.ts`

### `SALESFORCE_CLIENT_ID`

Used in:

- `/src/lib/integrations/advanced.ts`

### `SENTRY_DSN`

Used in:

- `/src/instrumentation-client.ts`

### `SENTRY_TEST`

Used in:

- `/src/app/api/dev/sentry-test/route.ts`

### `SERVICE_KEY`

Used in:

- `/src/lib/auth.ts`

### `SERVICE_TOKEN_SECRET`

Used in:

- `/src/lib/services/tradesService.ts`

### `SLACK_ALERT_WEBHOOK_URL`

Used in:

- `/src/app/api/cron/user-columns/route.ts`

### `STABILITY_API_KEY`

Used in:

- `/src/app/api/ai/mockup/route.ts`

### `SUBSCRIPTIONS_FORCE_OPEN`

Used in:

- `/src/app/api/admin/launch-status/route.ts`
- `/src/app/api/billing/checkout/route.ts`
- `/src/app/api/checkout/route.ts`

### `SUPABASE_ANON_KEY`

Used in:

- `/src/lib/storage-docs.ts`

### `SUPABASE_SERVICE_ROLE_KEY`

Used in:

- `/src/app/api/claims/list/route.ts`
- `/src/app/api/claims/resume/route.ts`
- `/src/app/api/claims/save/route.ts`
- `/src/app/api/claims/start/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/export/complete-packet/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/mockups/generate/route.ts`
- `/src/app/api/reports/generate/route.ts`
- `/src/app/api/retail/list/route.ts`
- `/src/app/api/retail/resume/route.ts`
- `/src/app/api/retail/save/route.ts`
- `/src/app/api/retail/start/route.ts`
- `/src/app/api/storage/signed-read/route.ts`
- `/src/app/api/storage/signed-upload/route.ts`
- `/src/app/api/supplements/generate/route.ts`
- `/src/app/api/system/truth/route.ts`
- `/src/app/api/upload/avatar/route.ts`
- `/src/app/api/upload/portfolio/route.ts`
- `/src/app/api/verify/damage/route.ts`
- `/src/lib/auth.ts`
- `/src/lib/export/zipBuilder.ts`
- `/src/lib/featureFlags.ts`
- `/src/lib/reports/pdf-utils.ts`
- `/src/lib/storage/claim-files.ts`
- `/src/lib/storage/getSignedUrl.ts`
- `/src/lib/storage/uploadPdf.ts`
- `/src/lib/storage-server.ts`
- `/src/lib/supabase-server.ts`
- `/src/lib/supabaseAdmin.ts`
- `/src/utils/supabase/server.ts`
- `/src/worker/helpers/storage.ts`

### `SYNTHESIA_API_KEY`

Used in:

- `/src/lib/ai/video/createVideoFromScript.ts`

### `TEST_AUTH_BYPASS`

Used in:

- `/src/components/dashboard/AICardsGrid.tsx`
- `/src/lib/org/getActiveOrgContext.ts`
- `/src/lib/permissions.ts`
- `/src/lib/safeOrgContext.ts`

### `TEST_AUTH_ORG_ID`

Used in:

- `/src/lib/org/getActiveOrgContext.ts`
- `/src/lib/permissions.ts`
- `/src/lib/safeOrgContext.ts`

### `TEST_AUTH_USER_ID`

Used in:

- `/src/lib/org/getActiveOrgContext.ts`
- `/src/lib/permissions.ts`
- `/src/lib/safeOrgContext.ts`

### `TIMEOUT_AI_ANALYSIS`

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`

### `TIMEOUT_PDF_GENERATION`

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`

### `TRADES_SERVICE_URL`

Used in:

- `/src/lib/config/constants.ts`
- `/src/lib/services/tradesService.ts`

### `TRADES_WEBHOOK_SECRET`

Used in:

- `/src/app/api/webhooks/trades/route.ts`

### `TWILIO_ACCOUNT_SID`

Used in:

- `/src/app/api/notifications/sms/route.ts`
- `/src/lib/notifications/sms.ts`
- `/src/lib/services/notifications.ts`

### `TWILIO_AUTH`

Used in:

- `/src/lib/notify.ts`

### `TWILIO_AUTH_TOKEN`

Used in:

- `/src/app/api/notifications/sms/route.ts`
- `/src/lib/notifications/sms.ts`
- `/src/lib/services/notifications.ts`

### `TWILIO_NUMBER`

Used in:

- `/src/lib/notify.ts`

### `TWILIO_PHONE_NUMBER`

Used in:

- `/src/app/api/notifications/sms/route.ts`
- `/src/lib/notifications/sms.ts`
- `/src/lib/services/notifications.ts`

### `TWILIO_SID`

Used in:

- `/src/lib/notify.ts`

### `UPSTASH_REDIS_REST_TOKEN`

Used in:

- `/src/lib/artifacts/aiRateLimit.ts`
- `/src/lib/flagCache.ts`
- `/src/lib/jobs/pdfQueue.ts`
- `/src/lib/rate-limit.ts`
- `/src/lib/ratelimit.ts`
- `/src/lib/security/ratelimit.ts`
- `/src/lib/upstash.ts`

### `UPSTASH_REDIS_REST_URL`

Used in:

- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/lib/artifacts/aiRateLimit.ts`
- `/src/lib/flagCache.ts`
- `/src/lib/jobs/pdfQueue.ts`
- `/src/lib/rate-limit.ts`
- `/src/lib/ratelimit.ts`
- `/src/lib/security/ratelimit.ts`
- `/src/lib/upstash.ts`

### `VAPID_PRIVATE_KEY`

Used in:

- `/src/lib/notifications/push.ts`

### `VAPID_PUBLIC_KEY`

Used in:

- `/src/lib/notifications/push.ts`

### `VAULT_ENCRYPTION_KEY`

Used in:

- `/src/lib/secrets/vault.ts`

### `VERCEL`

Used in:

- `/src/app/api/diag/clerk/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/system/health/route.ts`
- `/src/lib/db/index.ts`
- `/src/lib/templates/renderer.ts`
- `/src/lib/validateEnv.ts`

### `VERCEL_BUILD_TIME`

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`
- `/src/app/api/diag/route.ts`

### `VERCEL_CRON_SECRET`

Used in:

- `/src/app/api/cron/trials/sweep/route.ts`

### `VERCEL_ENV`

Used in:

- `/src/app/api/_build/route.ts`
- `/src/app/api/_diag/route.ts`
- `/src/app/api/_meta/route.ts`
- `/src/app/api/auth/debug/route.ts`
- `/src/app/api/build-info/route.ts`
- `/src/app/api/build-verify/route.ts`
- `/src/app/api/debug/env-check/route.ts`
- `/src/app/api/debug/whoami/route.ts`
- `/src/app/api/deploy-info/_deploy/route.ts`
- `/src/app/api/deploy-info/route.ts`
- `/src/app/api/dev/throw/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/diag/version/route.ts`
- `/src/app/api/routes-manifest/route.ts`
- `/src/app/api/system/truth/route.ts`
- `/src/app/api/xdebug/claims-recovery/route.ts`
- `/src/app/api/xdebug/session/route.ts`
- `/src/app/api/xdebug/truth/route.ts`
- `/src/lib/env.ts`
- `/src/lib/validateEnv.ts`

### `VERCEL_GIT_COMMIT_MESSAGE`

Used in:

- `/src/app/api/deploy-info/route.ts`

### `VERCEL_GIT_COMMIT_REF`

Used in:

- `/src/app/(app)/settings/deployment/page.tsx`
- `/src/app/api/_build/route.ts`
- `/src/app/api/build-info/route.ts`
- `/src/app/api/debug/whoami/route.ts`
- `/src/app/api/deploy-info/route.ts`
- `/src/app/api/diag/version/route.ts`

### `VERCEL_GIT_COMMIT_SHA`

Used in:

- `/src/app/(app)/dashboard/page.tsx`
- `/src/app/(app)/settings/deployment/page.tsx`
- `/src/app/api/__truth/route.ts`
- `/src/app/api/_build/route.ts`
- `/src/app/api/_meta/route.ts`
- `/src/app/api/build-info/route.ts`
- `/src/app/api/build-verify/route.ts`
- `/src/app/api/debug/whoami/route.ts`
- `/src/app/api/deploy-info/_deploy/route.ts`
- `/src/app/api/deploy-info/route.ts`
- `/src/app/api/diag/route.ts`
- `/src/app/api/diag/version/route.ts`
- `/src/app/api/health/report/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/summary/route.ts`
- `/src/app/api/system/truth/route.ts`
- `/src/app/api/xdebug/session/route.ts`
- `/src/app/api/xdebug/truth/route.ts`
- `/src/app/boot-test/page.tsx`
- `/src/app/dev-dashboard/page.tsx`
- `/src/lib/validateEnv.ts`

### `VERCEL_PROJECT_PRODUCTION_URL`

Used in:

- `/src/app/api/diag/version/route.ts`

### `VERCEL_REGION`

Used in:

- `/src/app/api/_build/route.ts`
- `/src/app/api/deploy-info/_deploy/route.ts`
- `/src/lib/validateEnv.ts`

### `VERCEL_REQUEST_ID`

Used in:

- `/src/lib/apiError.ts`

### `VERCEL_URL`

Used in:

- `/src/app/api/build-info/route.ts`
- `/src/app/api/build-verify/route.ts`
- `/src/app/api/deploy-info/_deploy/route.ts`
- `/src/app/api/health/summary/route.ts`
- `/src/app/api/share/create/route.ts`
- `/src/env/index.ts`
- `/src/instrumentation.ts`
- `/src/lib/env.ts`
- `/src/lib/fetchSafe.ts`
- `/src/lib/security/cors.ts`

### `VIDEO_MOCK_MODE`

Used in:

- `/src/lib/video/renderVideo.ts`

### `VIDEO_REAL_ENABLED`

Used in:

- `/src/lib/video/access.ts`

### `VISUAL_CROSSING_API_KEY`

Used in:

- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/worker/jobs/weather-analyze.ts`

### `VISUALCROSSING_API_KEY`

Used in:

- `/src/app/api/debug/env-check/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/lib/weather/visualcrossing.ts`
- `/src/worker/jobs/weather-analyze.ts`

### `WEATHER_DEV_KEY`

Used in:

- `/src/app/api/weather/quick-dol/route.ts`

### `WEATHER_STACK_API_KEY`

Used in:

- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/lib/weather/weatherstack.ts`
- `/src/worker/jobs/weather-analyze.ts`

### `WEATHERSTACK_API_KEY`

Used in:

- `/src/app/api/ai/weather/run/route.ts`
- `/src/app/api/debug/env-check/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/lib/weather/buildWeatherVerification.ts`
- `/src/lib/weather/weatherstack.ts`
- `/src/worker/jobs/weather-analyze.ts`

### `WHITELISTED_IP_RANGES`

Used in:

- `/src/middleware/ipWhitelist.ts`

### `WHITELISTED_IPS`

Used in:

- `/src/middleware/ipWhitelist.ts`

## Storage

| Variable | Public | Files |
|----------|--------|-------|
| `AWS_ACCESS_KEY_ID` |  | 2 |
| `AWS_REGION` |  | 4 |
| `AWS_S3_BUCKET` |  | 1 |
| `AWS_SECRET_ACCESS_KEY` |  | 2 |
| `AZURE_STORAGE_ACCOUNT` |  | 1 |
| `FIREBASE_STORAGE_BUCKET` |  | 11 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | 2 |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_EXPORTS` | ✅ | 1 |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_TEMPLATES` | ✅ | 1 |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_UPLOADS` | ✅ | 1 |
| `S3_ACCESS_KEY_ID` |  | 1 |
| `S3_BUCKET` |  | 5 |
| `S3_ENDPOINT` |  | 2 |
| `S3_FORCE_PATH_STYLE` |  | 1 |
| `S3_PRESIGN_EXPIRES` |  | 1 |
| `S3_REGION` |  | 1 |
| `S3_SECRET_ACCESS_KEY` |  | 1 |
| `STORAGE_ACCESS_KEY_ID` |  | 1 |
| `STORAGE_BUCKET` |  | 1 |
| `STORAGE_ENABLED` |  | 3 |
| `STORAGE_ENDPOINT` |  | 1 |
| `STORAGE_PROVIDER` |  | 2 |
| `STORAGE_REGION` |  | 1 |
| `STORAGE_SECRET_ACCESS_KEY` |  | 1 |
| `SUPABASE_STORAGE_BUCKET_EXPORTS` |  | 5 |
| `SUPABASE_STORAGE_BUCKET_TEMPLATES` |  | 3 |
| `SUPABASE_STORAGE_BUCKET_UPLOADS` |  | 2 |

### `AWS_ACCESS_KEY_ID`

Used in:

- `/src/lib/pdf/renderEngine.ts`
- `/src/lib/s3.ts`

### `AWS_REGION`

Used in:

- `/src/lib/backup/recovery.ts`
- `/src/lib/pdf/renderEngine.ts`
- `/src/lib/s3.ts`
- `/src/lib/storage/fileManager.ts`

### `AWS_S3_BUCKET`

Used in:

- `/src/lib/storage/fileManager.ts`

### `AWS_SECRET_ACCESS_KEY`

Used in:

- `/src/lib/pdf/renderEngine.ts`
- `/src/lib/s3.ts`

### `AZURE_STORAGE_ACCOUNT`

Used in:

- `/src/lib/storage/fileManager.ts`

### `FIREBASE_STORAGE_BUCKET`

Used in:

- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/diag/storage/route.ts`
- `/src/lib/firebase-admin-safe.ts`
- `/src/lib/firebase-admin.ts`
- `/src/lib/firebaseAdmin.ts`
- `/src/lib/storage/config.ts`
- `/src/lib/storage/files.ts`
- `/src/lib/storage/firebaseClient.ts`
- `/src/lib/storage/getStorageUrl.ts`
- `/src/lib/storage.ts`

### `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/health/comprehensive/route.ts`
- `/src/lib/firebase.ts`

### `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_EXPORTS`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/system/truth/route.ts`

### `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_TEMPLATES`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/system/truth/route.ts`

### `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_UPLOADS`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/system/truth/route.ts`

### `S3_ACCESS_KEY_ID`

Used in:

- `/src/lib/s3.ts`

### `S3_BUCKET`

Used in:

- `/src/app/api/claims/[claimId]/photos/route.ts`
- `/src/app/api/portal/claims/[claimId]/documents/route.ts`
- `/src/app/api/portal/claims/[claimId]/photos/route.ts`
- `/src/lib/pdf/renderEngine.ts`
- `/src/lib/s3.ts`

### `S3_ENDPOINT`

Used in:

- `/src/lib/pdf/renderEngine.ts`
- `/src/lib/s3.ts`

### `S3_FORCE_PATH_STYLE`

Used in:

- `/src/lib/s3.ts`

### `S3_PRESIGN_EXPIRES`

Used in:

- `/src/features/reports/renderEngine.ts`

### `S3_REGION`

Used in:

- `/src/lib/s3.ts`

### `S3_SECRET_ACCESS_KEY`

Used in:

- `/src/lib/s3.ts`

### `STORAGE_ACCESS_KEY_ID`

Used in:

- `/src/lib/storage/advancedStorage.ts`

### `STORAGE_BUCKET`

Used in:

- `/src/lib/storage/advancedStorage.ts`

### `STORAGE_ENABLED`

Used in:

- `/src/app/api/health/comprehensive/route.ts`
- `/src/lib/firebaseAdmin.ts`
- `/src/lib/storage.ts`

### `STORAGE_ENDPOINT`

Used in:

- `/src/lib/storage/advancedStorage.ts`

### `STORAGE_PROVIDER`

Used in:

- `/src/lib/storage/advancedStorage.ts`
- `/src/lib/storage/fileManager.ts`

### `STORAGE_REGION`

Used in:

- `/src/lib/storage/advancedStorage.ts`

### `STORAGE_SECRET_ACCESS_KEY`

Used in:

- `/src/lib/storage/advancedStorage.ts`

### `SUPABASE_STORAGE_BUCKET_EXPORTS`

Used in:

- `/src/app/api/mockups/generate/route.ts`
- `/src/app/api/reports/generate/route.ts`
- `/src/app/api/supplements/generate/route.ts`
- `/src/app/api/system/health/route.ts`
- `/src/app/api/system/truth/route.ts`

### `SUPABASE_STORAGE_BUCKET_TEMPLATES`

Used in:

- `/src/app/api/system/health/route.ts`
- `/src/app/api/system/storage-check/route.ts`
- `/src/app/api/system/truth/route.ts`

### `SUPABASE_STORAGE_BUCKET_UPLOADS`

Used in:

- `/src/app/api/system/health/route.ts`
- `/src/app/api/system/truth/route.ts`

## Stripe

| Variable | Public | Files |
|----------|--------|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | 3 |
| `STRIPE_API_KEY` |  | 1 |
| `STRIPE_BILLING_PORTAL_RETURN_URL` |  | 1 |
| `STRIPE_BUSINESS_ANNUAL_PRICE_ID` |  | 1 |
| `STRIPE_BUSINESS_MONTHLY_PRICE_ID` |  | 1 |
| `STRIPE_ENTERPRISE_ANNUAL_PRICE_ID` |  | 1 |
| `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID` |  | 1 |
| `STRIPE_FULL_ACCESS_PRICE_ID` |  | 1 |
| `STRIPE_PRICE_BUSINESS` |  | 4 |
| `STRIPE_PRICE_ENTERPRISE` |  | 4 |
| `STRIPE_PRICE_FULL_ACCESS` |  | 1 |
| `STRIPE_PRICE_PACK_PRO` |  | 1 |
| `STRIPE_PRICE_PACK_SMALL` |  | 1 |
| `STRIPE_PRICE_PACK_STANDARD` |  | 1 |
| `STRIPE_PRICE_PRO` |  | 1 |
| `STRIPE_PRICE_SOLO` |  | 3 |
| `STRIPE_PRICE_STARTER` |  | 1 |
| `STRIPE_PRICE_TOKENS_10` |  | 1 |
| `STRIPE_PRICE_TOKENS_100` |  | 1 |
| `STRIPE_PRICE_TOKENS_25` |  | 1 |
| `STRIPE_PRICE_TOKENS_50` |  | 1 |
| `STRIPE_PRO_ANNUAL_PRICE_ID` |  | 1 |
| `STRIPE_SECRET_KEY` |  | 28 |
| `STRIPE_SOLO_ANNUAL_PRICE_ID` |  | 1 |
| `STRIPE_SOLO_MONTHLY_PRICE_ID` |  | 1 |
| `STRIPE_TOKEN_PACK_PRICE_100` |  | 4 |
| `STRIPE_TOPUP_100` |  | 1 |
| `STRIPE_TOPUP_2000` |  | 1 |
| `STRIPE_TOPUP_500` |  | 1 |
| `STRIPE_WEBHOOK_SECRET` |  | 8 |

### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Public variable** (exposed to browser)

Used in:

- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/startup/route.ts`

### `STRIPE_API_KEY`

Used in:

- `/src/app/api/checkout/route.ts`

### `STRIPE_BILLING_PORTAL_RETURN_URL`

Used in:

- `/src/lib/billing/portal.ts`

### `STRIPE_BUSINESS_ANNUAL_PRICE_ID`

Used in:

- `/src/lib/stripe/handler.ts`

### `STRIPE_BUSINESS_MONTHLY_PRICE_ID`

Used in:

- `/src/lib/stripe/handler.ts`

### `STRIPE_ENTERPRISE_ANNUAL_PRICE_ID`

Used in:

- `/src/lib/stripe/handler.ts`

### `STRIPE_ENTERPRISE_MONTHLY_PRICE_ID`

Used in:

- `/src/lib/stripe/handler.ts`

### `STRIPE_FULL_ACCESS_PRICE_ID`

Used in:

- `/src/app/api/trades/subscribe/route.ts`

### `STRIPE_PRICE_BUSINESS`

Used in:

- `/src/app/api/checkout/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/lib/billing/priceMap.ts`
- `/src/lib/tokens/planQuotas.ts`

### `STRIPE_PRICE_ENTERPRISE`

Used in:

- `/src/app/api/checkout/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/lib/billing/priceMap.ts`
- `/src/lib/tokens/planQuotas.ts`

### `STRIPE_PRICE_FULL_ACCESS`

Used in:

- `/src/app/api/billing/full-access/checkout/route.ts`

### `STRIPE_PRICE_PACK_PRO`

Used in:

- `/src/app/api/billing/token-pack/checkout/route.ts`

### `STRIPE_PRICE_PACK_SMALL`

Used in:

- `/src/app/api/billing/token-pack/checkout/route.ts`

### `STRIPE_PRICE_PACK_STANDARD`

Used in:

- `/src/app/api/billing/token-pack/checkout/route.ts`

### `STRIPE_PRICE_PRO`

Used in:

- `/src/app/api/checkout/route.ts`

### `STRIPE_PRICE_SOLO`

Used in:

- `/src/app/api/health/comprehensive/route.ts`
- `/src/lib/billing/priceMap.ts`
- `/src/lib/tokens/planQuotas.ts`

### `STRIPE_PRICE_STARTER`

Used in:

- `/src/app/api/checkout/route.ts`

### `STRIPE_PRICE_TOKENS_10`

Used in:

- `/src/app/actions/addTokens.ts`

### `STRIPE_PRICE_TOKENS_100`

Used in:

- `/src/app/actions/addTokens.ts`

### `STRIPE_PRICE_TOKENS_25`

Used in:

- `/src/app/actions/addTokens.ts`

### `STRIPE_PRICE_TOKENS_50`

Used in:

- `/src/app/actions/addTokens.ts`

### `STRIPE_PRO_ANNUAL_PRICE_ID`

Used in:

- `/src/lib/stripe/handler.ts`

### `STRIPE_SECRET_KEY`

Used in:

- `/src/app/actions/addTokens.ts`
- `/src/app/api/billing/checkout/route.ts`
- `/src/app/api/billing/full-access/checkout/route.ts`
- `/src/app/api/billing/full-access/status/route.ts`
- `/src/app/api/billing/report-credits/checkout/route.ts`
- `/src/app/api/billing/stripe/webhook/route.ts`
- `/src/app/api/billing/token-pack/checkout/route.ts`
- `/src/app/api/billing/tokens/checkout/route.ts`
- `/src/app/api/checkout/route.ts`
- `/src/app/api/config/route.ts`
- `/src/app/api/cron/stripe-reconcile/route.ts`
- `/src/app/api/diag/env/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/stripe/checkout/route.ts`
- `/src/app/api/stripe/checkout/topup/route.ts`
- `/src/app/api/stripe/webhook/route.ts`
- `/src/app/api/tokens/buy/route.ts`
- `/src/app/api/trades/cancel-subscription/route.ts`
- `/src/app/api/trades/subscribe/route.ts`
- `/src/app/api/verify-session/route.ts`
- `/src/app/api/webhooks/stripe/route.ts`
- `/src/lib/billing/autoRefill.ts`
- `/src/lib/billing/portal.ts`
- `/src/lib/stripe/customer.ts`
- `/src/lib/stripe.ts`

### `STRIPE_SOLO_ANNUAL_PRICE_ID`

Used in:

- `/src/lib/stripe/handler.ts`

### `STRIPE_SOLO_MONTHLY_PRICE_ID`

Used in:

- `/src/lib/stripe/handler.ts`

### `STRIPE_TOKEN_PACK_PRICE_100`

Used in:

- `/src/app/api/billing/tokens/checkout/route.ts`
- `/src/app/api/tokens/buy/route.ts`
- `/src/app/api/webhooks/stripe/route.ts`
- `/src/lib/billing/autoRefill.ts`

### `STRIPE_TOPUP_100`

Used in:

- `/src/app/api/stripe/checkout/topup/route.ts`

### `STRIPE_TOPUP_2000`

Used in:

- `/src/app/api/stripe/checkout/topup/route.ts`

### `STRIPE_TOPUP_500`

Used in:

- `/src/app/api/stripe/checkout/topup/route.ts`

### `STRIPE_WEBHOOK_SECRET`

Used in:

- `/src/app/api/billing/stripe/webhook/route.ts`
- `/src/app/api/config/route.ts`
- `/src/app/api/diag/ready/route.ts`
- `/src/app/api/health/comprehensive/route.ts`
- `/src/app/api/health/startup/route.ts`
- `/src/app/api/stripe/webhook/route.ts`
- `/src/app/api/webhooks/stripe/route.ts`
- `/src/lib/stripe.ts`

## UploadThing

| Variable | Public | Files |
|----------|--------|-------|
| `UPLOADTHING_APP_ID` |  | 2 |
| `UPLOADTHING_SECRET` |  | 2 |

### `UPLOADTHING_APP_ID`

Used in:

- `/src/app/api/health/claims/route.ts`
- `/src/app/api/uploadthing/route.ts`

### `UPLOADTHING_SECRET`

Used in:

- `/src/app/api/health/claims/route.ts`
- `/src/app/api/uploadthing/route.ts`

## Weather

| Variable | Public | Files |
|----------|--------|-------|
| `NOAA_API_TOKEN` |  | 1 |

### `NOAA_API_TOKEN`

Used in:

- `/src/lib/storm/fetchStormData.ts`


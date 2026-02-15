# PRODUCTION TODO - 100+ ITEMS

**Generated:** December 25, 2025  
**Status:** Post-Deployment Maintenance & Enhancements  
**Deployment:** https://skaiscraper-knn62xgun-damien-willinghams-projects.vercel.app

---

## PRIORITY LEGEND

- **P0:** Critical - Fix within 24 hours (Security/Data Loss)
- **P1:** High - Fix within 1 week (Core functionality)
- **P2:** Medium - Fix within 2 weeks (Quality/UX)
- **P3:** Low - Fix when capacity allows (Nice-to-have)

---

## P0 - CRITICAL (24 Hours) 🔴

### Security & Data Integrity

1. **Add auth to /api/claim-documents/[id] DELETE endpoint**
   - Priority: P0
   - Owner: Backend Dev
   - File: `src/app/api/claim-documents/[id]/route.ts`
   - Acceptance: Endpoint requires `withOrgScope` wrapper, returns 401 without auth
   - Impact: Security vulnerability - anyone can delete documents

2. **Verify UPLOADTHING_SECRET in Vercel production**
   - Priority: P0
   - Owner: DevOps
   - File: Vercel dashboard → Environment Variables
   - Acceptance: Variable present and non-empty, test upload succeeds
   - Impact: Uploads fail without this

3. **Verify UPLOADTHING_APP_ID in Vercel production**
   - Priority: P0
   - Owner: DevOps
   - File: Vercel dashboard → Environment Variables
   - Acceptance: Variable present and matches UploadThing dashboard
   - Impact: Uploads fail without this

---

## P1 - HIGH (1 Week) 🟠

### Storage & File Management

4. **Add DB record deletion to photo delete endpoint**
   - Priority: P1
   - Owner: Backend Dev
   - File: `src/app/api/claims/[claimId]/photos/[photoId]/route.ts`
   - Acceptance: DELETE handler calls `prisma.claim_photos.delete()`
   - Impact: Orphaned DB records accumulate

5. **Add remote file deletion to photo delete endpoint**
   - Priority: P1
   - Owner: Backend Dev
   - File: `src/app/api/claims/[claimId]/photos/[photoId]/route.ts`
   - Acceptance: DELETE handler calls `utapi.deleteFiles([photoKey])`
   - Impact: Storage costs increase, orphaned files

6. **Add DB record deletion to document delete endpoint**
   - Priority: P1
   - Owner: Backend Dev
   - File: `src/app/api/claims/[claimId]/documents/[documentId]/route.ts`
   - Acceptance: DELETE handler calls `prisma.claim_documents.delete()`
   - Impact: Orphaned DB records accumulate

7. **Add remote file deletion to document delete endpoint**
   - Priority: P1
   - Owner: Backend Dev
   - File: `src/app/api/claims/[claimId]/documents/[documentId]/route.ts`
   - Acceptance: DELETE handler calls `utapi.deleteFiles([storageKey])`
   - Impact: Storage costs increase

8. **Add transaction safety to storage delete operations**
   - Priority: P1
   - Owner: Backend Dev
   - File: All delete endpoints
   - Acceptance: DB and file deletes wrapped in try/catch, rollback on failure
   - Impact: Inconsistent state on partial failures

### Environment Variables

9. **Create .env.example with all required vars**
   - Priority: P1
   - Owner: Backend Dev
   - File: `.env.example`
   - Acceptance: File lists all 314 env vars with descriptions
   - Impact: Developer onboarding difficulty

10. **Verify all CLERK\_\* vars in production**
    - Priority: P1
    - Owner: DevOps
    - File: Vercel dashboard
    - Acceptance: All 9 Clerk vars present and correct
    - Impact: Auth breaks

11. **Verify DATABASE_URL in production**
    - Priority: P1
    - Owner: DevOps
    - File: Vercel dashboard
    - Acceptance: Connection string valid and pooling configured
    - Impact: App won't start

12. **Verify OPENAI_API_KEY in production**
    - Priority: P1
    - Owner: DevOps
    - File: Vercel dashboard
    - Acceptance: Key valid, not rate-limited
    - Impact: AI features fail

13. **Verify NEXT_PUBLIC_MAPBOX_TOKEN in production**
    - Priority: P1
    - Owner: DevOps
    - File: Vercel dashboard
    - Acceptance: Token valid, maps load
    - Impact: Maps view fails

---

## P2 - MEDIUM (2 Weeks) 🟡

### Code Quality & Monitoring

14. **Add runtime env var validation**
    - Priority: P2
    - Owner: Backend Dev
    - File: `src/lib/env.ts` (new)
    - Acceptance: Server logs clear error when required var missing
    - Impact: Better debugging

15. **Add Sentry error tracking for failed uploads**
    - Priority: P2
    - Owner: Backend Dev
    - File: `src/app/api/uploadthing/core.ts`
    - Acceptance: Failed uploads logged to Sentry with context
    - Impact: Blind to upload failures

16. **Add Sentry error tracking for failed PDF generation**
    - Priority: P2
    - Owner: Backend Dev
    - File: `src/lib/templates/generateTemplatePDF.ts`
    - Acceptance: PDF errors logged to Sentry with template ID
    - Impact: Blind to PDF failures

17. **Add Sentry error tracking for failed deletes**
    - Priority: P2
    - Owner: Backend Dev
    - File: All delete endpoints
    - Acceptance: Delete errors logged with resource IDs
    - Impact: Blind to delete failures

18. **Create storage cleanup cron job**
    - Priority: P2
    - Owner: Backend Dev
    - File: `src/app/api/cron/cleanup-orphaned-files/route.ts` (new)
    - Acceptance: Cron runs daily, deletes orphaned files, logs count
    - Impact: Storage bloat over time

19. **Create DB cleanup cron job for orphaned records**
    - Priority: P2
    - Owner: Backend Dev
    - File: `src/app/api/cron/cleanup-orphaned-records/route.ts` (new)
    - Acceptance: Cron runs daily, soft-deletes orphaned records
    - Impact: DB bloat over time

### Testing & Validation

20. **Add Playwright test for photo upload/delete flow**
    - Priority: P2
    - Owner: QA/Frontend Dev
    - File: `tests/e2e/photo-upload.spec.ts` (new)
    - Acceptance: Test uploads photo, verifies in UI, deletes, verifies gone
    - Impact: No automated coverage

21. **Add Playwright test for document upload/delete flow**
    - Priority: P2
    - Owner: QA/Frontend Dev
    - File: `tests/e2e/document-upload.spec.ts` (new)
    - Acceptance: Test uploads doc, verifies in UI, deletes, verifies gone
    - Impact: No automated coverage

22. **Add Playwright test for PDF generation**
    - Priority: P2
    - Owner: QA/Frontend Dev
    - File: `tests/e2e/pdf-generation.spec.ts` (new)
    - Acceptance: Test generates PDF, downloads, verifies non-zero size
    - Impact: No automated coverage

23. **Add Playwright test for template marketplace**
    - Priority: P2
    - Owner: QA/Frontend Dev
    - File: `tests/e2e/template-marketplace.spec.ts` (new)
    - Acceptance: Test browses templates, adds to company, verifies in list
    - Impact: No automated coverage

24. **Add unit tests for storage audit script**
    - Priority: P2
    - Owner: Backend Dev
    - File: `scripts/prod-audit/audit_storage.test.ts` (new)
    - Acceptance: Tests cover all detection patterns
    - Impact: False positives/negatives

25. **Add unit tests for route audit script**
    - Priority: P2
    - Owner: Backend Dev
    - File: `scripts/prod-audit/audit_routes.test.ts` (new)
    - Acceptance: Tests cover duplicate detection, missing routes
    - Impact: False positives/negatives

### Documentation

26. **Document UploadThing configuration in README**
    - Priority: P2
    - Owner: Tech Writer
    - File: `docs/UPLOADTHING_SETUP.md` (new)
    - Acceptance: Doc explains env vars, callback setup, testing
    - Impact: Team doesn't know how to configure

27. **Document PDF generation flow in README**
    - Priority: P2
    - Owner: Tech Writer
    - File: `docs/PDF_GENERATION.md` (new)
    - Acceptance: Doc explains template → branding → PDF pipeline
    - Impact: Team doesn't understand flow

28. **Document audit scripts in README**
    - Priority: P2
    - Owner: Tech Writer
    - File: `docs/AUDIT_SCRIPTS.md` (new)
    - Acceptance: Doc explains when/how to run audits
    - Impact: Scripts not used

29. **Create deployment checklist**
    - Priority: P2
    - Owner: Tech Writer
    - File: `docs/DEPLOYMENT_CHECKLIST.md` (new)
    - Acceptance: Checklist covers env vars, DB, tests, smoke tests
    - Impact: Missed steps in deployments

30. **Create incident response playbook**
    - Priority: P2
    - Owner: Tech Writer
    - File: `docs/INCIDENT_RESPONSE.md` (new)
    - Acceptance: Playbook covers common failures, rollback steps
    - Impact: Slow incident recovery

---

## P3 - LOW (Future) 🟢

### Performance & Optimization

31. **Add Redis caching for template previews**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/app/api/templates/[templateId]/preview/route.ts`
    - Acceptance: Preview responses cached for 1 hour
    - Impact: Faster preview loads

32. **Add Redis caching for org branding**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/lib/templates/mergeTemplate.ts`
    - Acceptance: Branding cached per org, invalidated on update
    - Impact: Faster PDF generation

33. **Optimize template list query**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/app/(app)/reports/templates/page.tsx`
    - Acceptance: Query uses select to fetch only needed fields
    - Impact: Faster page loads

34. **Add pagination to template marketplace**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(public)/reports/templates/marketplace/page.tsx`
    - Acceptance: Marketplace shows 20 templates per page, pagination works
    - Impact: Slow loads with many templates

35. **Add search to template marketplace**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(public)/reports/templates/marketplace/page.tsx`
    - Acceptance: Search filters templates by name/category
    - Impact: Hard to find templates

36. **Add image optimization to template thumbnails**
    - Priority: P3
    - Owner: Frontend Dev
    - File: All template card components
    - Acceptance: Thumbnails use Next.js Image component with optimization
    - Impact: Slow page loads

37. **Add lazy loading to template cards**
    - Priority: P3
    - Owner: Frontend Dev
    - File: All template list components
    - Acceptance: Cards load as user scrolls (intersection observer)
    - Impact: Slow initial render with many templates

38. **Add CDN caching headers to PDF exports**
    - Priority: P3
    - Owner: Backend Dev
    - File: All PDF export endpoints
    - Acceptance: Responses include Cache-Control headers
    - Impact: Repeated PDF downloads slow

39. **Add compression to PDF responses**
    - Priority: P3
    - Owner: Backend Dev
    - File: All PDF export endpoints
    - Acceptance: PDFs compressed before sending
    - Impact: Slow downloads

40. **Add streaming to large PDF responses**
    - Priority: P3
    - Owner: Backend Dev
    - File: PDF export endpoints for large PDFs (>5MB)
    - Acceptance: PDFs streamed instead of buffered
    - Impact: High memory usage

### User Experience

41. **Add loading states to template preview modal**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(app)/reports/templates/_components/TemplatePreviewModal.tsx`
    - Acceptance: Modal shows skeleton while loading
    - Impact: User sees blank screen

42. **Add error states to template preview modal**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(app)/reports/templates/_components/TemplatePreviewModal.tsx`
    - Acceptance: Modal shows clear error message on failure
    - Impact: User sees generic error

43. **Add retry button to failed PDF generation**
    - Priority: P3
    - Owner: Frontend Dev
    - File: All PDF generation UIs
    - Acceptance: User can retry without reloading page
    - Impact: User must reload page

44. **Add progress indicator to PDF generation**
    - Priority: P3
    - Owner: Frontend Dev
    - File: All PDF generation UIs
    - Acceptance: Progress shown as percentage or steps
    - Impact: User doesn't know status

45. **Add "Add to Company" confirmation toast**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(public)/reports/templates/marketplace/_components/AddTemplateButton.tsx`
    - Acceptance: Toast shows on success with template name
    - Impact: User unsure if action succeeded

46. **Add template category filters**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(public)/reports/templates/marketplace/page.tsx`
    - Acceptance: User can filter by Insurance, Retail, Contractor, etc.
    - Impact: Hard to find relevant templates

47. **Add template sorting options**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(public)/reports/templates/marketplace/page.tsx`
    - Acceptance: User can sort by Newest, Popular, A-Z
    - Impact: No control over order

48. **Add template preview mode toggle**
    - Priority: P3
    - Owner: Frontend Dev
    - File: Template preview pages
    - Acceptance: User can toggle between preview and edit mode
    - Impact: Can't test template without generating

49. **Add bulk template actions**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(app)/reports/templates/page.tsx`
    - Acceptance: User can select multiple templates, delete/export
    - Impact: Tedious to manage many templates

50. **Add template duplication UI**
    - Priority: P3
    - Owner: Frontend Dev
    - File: Template cards
    - Acceptance: User can duplicate template with one click
    - Impact: Must manually recreate similar templates

### Developer Experience

51. **Add TypeScript types for template schema**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/types/template.ts` (new)
    - Acceptance: All template operations use typed schemas
    - Impact: Runtime errors from schema mismatches

52. **Add Zod validation for template creation**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/lib/validation/template.ts` (new)
    - Acceptance: Create template API validates input with Zod
    - Impact: Invalid templates saved to DB

53. **Add Zod validation for PDF generation input**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/lib/validation/pdf.ts` (new)
    - Acceptance: PDF generation validates input with Zod
    - Impact: Invalid data causes runtime errors

54. **Add ESLint rule to require auth wrappers on API routes**
    - Priority: P3
    - Owner: Backend Dev
    - File: `.eslintrc.js`
    - Acceptance: Linter warns when route.ts has no auth wrapper
    - Impact: Easy to forget auth

55. **Add pre-commit hook to run audit scripts**
    - Priority: P3
    - Owner: Backend Dev
    - File: `.husky/pre-commit` (new)
    - Acceptance: Audits run on commit, fail if issues found
    - Impact: Issues not caught until CI/CD

56. **Add GitHub Actions workflow for audits**
    - Priority: P3
    - Owner: DevOps
    - File: `.github/workflows/audit.yml` (new)
    - Acceptance: Workflow runs audits on PR, comments results
    - Impact: Issues not caught until merge

57. **Add Storybook stories for template components**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(app)/reports/templates/_components/*.stories.tsx` (new)
    - Acceptance: All template components have stories
    - Impact: Hard to develop in isolation

58. **Add Storybook stories for PDF preview components**
    - Priority: P3
    - Owner: Frontend Dev
    - File: PDF component stories
    - Acceptance: PDF preview states documented in Storybook
    - Impact: Hard to develop in isolation

59. **Add component tests for template cards**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(app)/reports/templates/_components/TemplateCard.test.tsx` (new)
    - Acceptance: Tests cover all interactions (preview, edit, delete)
    - Impact: No unit test coverage

60. **Add component tests for upload buttons**
    - Priority: P3
    - Owner: Frontend Dev
    - File: Upload component tests
    - Acceptance: Tests cover upload flow, error states
    - Impact: No unit test coverage

### Database & Schema

61. **Add index on claim_photos.claimId**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma`
    - Acceptance: Index added, migration created
    - Impact: Slow photo queries

62. **Add index on claim_documents.claimId**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma`
    - Acceptance: Index added, migration created
    - Impact: Slow document queries

63. **Add index on claim_documents.orgId**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma`
    - Acceptance: Index added, migration created
    - Impact: Slow org-level document queries

64. **Add cascade delete from claims to photos**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma`
    - Acceptance: Deleting claim deletes photos
    - Impact: Orphaned photos when claim deleted

65. **Add cascade delete from claims to documents**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma`
    - Acceptance: Deleting claim deletes documents
    - Impact: Orphaned documents when claim deleted

66. **Add soft delete to templates**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma`
    - Acceptance: Templates have isDeleted field, queries filter
    - Impact: Can't recover deleted templates

67. **Add version tracking to templates**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma`
    - Acceptance: Templates have version field, history tracked
    - Impact: Can't track template changes

68. **Add audit log for template changes**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma` + new TemplateAuditLog model
    - Acceptance: All template mutations logged with user/timestamp
    - Impact: No accountability for changes

69. **Add usage tracking to templates**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma`
    - Acceptance: Templates track usage count, last used
    - Impact: Can't identify unused templates

70. **Add favorite/star system for templates**
    - Priority: P3
    - Owner: Backend Dev
    - File: `prisma/schema.prisma` + new TemplateFavorite model
    - Acceptance: Users can favorite templates, see favorites first
    - Impact: Hard to find frequently used templates

### API & Integration

71. **Add webhook for template created**
    - Priority: P3
    - Owner: Backend Dev
    - File: Template creation endpoints
    - Acceptance: Webhook sent to configured URL on creation
    - Impact: No external integration

72. **Add webhook for template deleted**
    - Priority: P3
    - Owner: Backend Dev
    - File: Template deletion endpoints
    - Acceptance: Webhook sent to configured URL on deletion
    - Impact: No external integration

73. **Add webhook for PDF generated**
    - Priority: P3
    - Owner: Backend Dev
    - File: PDF generation endpoints
    - Acceptance: Webhook sent with PDF URL on generation
    - Impact: No external integration

74. **Add REST API documentation**
    - Priority: P3
    - Owner: Backend Dev
    - File: `docs/API.md` (new) or OpenAPI spec
    - Acceptance: All public APIs documented with examples
    - Impact: Hard to integrate

75. **Add rate limiting to public endpoints**
    - Priority: P3
    - Owner: Backend Dev
    - File: Middleware or Upstash integration
    - Acceptance: Public endpoints limited to 100 req/min per IP
    - Impact: Vulnerable to abuse

76. **Add API versioning**
    - Priority: P3
    - Owner: Backend Dev
    - File: All API routes
    - Acceptance: Routes prefixed with /v1/, versioning strategy documented
    - Impact: Can't safely change APIs

77. **Add GraphQL API for templates**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/app/api/graphql/route.ts` (new)
    - Acceptance: GraphQL endpoint serves templates with flexible queries
    - Impact: REST API inflexible

78. **Add bulk template import API**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/app/api/templates/bulk-import/route.ts` (new)
    - Acceptance: Accepts JSON array, creates multiple templates
    - Impact: Tedious to import many templates

79. **Add bulk template export API**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/app/api/templates/bulk-export/route.ts` (new)
    - Acceptance: Returns JSON array of all org templates
    - Impact: Hard to backup templates

80. **Add template import from URL**
    - Priority: P3
    - Owner: Backend Dev
    - File: `src/app/api/templates/import-url/route.ts` (new)
    - Acceptance: Accepts URL, fetches and creates template
    - Impact: Must manually upload templates

### Admin & Management

81. **Add admin dashboard for templates**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(app)/admin/templates/page.tsx` (new)
    - Acceptance: Admin can view all templates across orgs
    - Impact: No visibility into template usage

82. **Add admin ability to feature templates**
    - Priority: P3
    - Owner: Backend Dev
    - File: Admin template management
    - Acceptance: Admin can mark templates as featured
    - Impact: Can't promote quality templates

83. **Add admin ability to ban templates**
    - Priority: P3
    - Owner: Backend Dev
    - File: Admin template management
    - Acceptance: Admin can ban inappropriate templates
    - Impact: Can't moderate marketplace

84. **Add template moderation queue**
    - Priority: P3
    - Owner: Backend Dev + Frontend Dev
    - File: `src/app/(app)/admin/moderation/page.tsx` (new)
    - Acceptance: Admin reviews new templates before publish
    - Impact: Inappropriate templates published

85. **Add analytics dashboard for templates**
    - Priority: P3
    - Owner: Frontend Dev
    - File: `src/app/(app)/analytics/templates/page.tsx` (new)
    - Acceptance: Shows usage stats, popular templates
    - Impact: No data-driven decisions

86. **Add cost tracking for PDF generation**
    - Priority: P3
    - Owner: Backend Dev
    - File: PDF generation endpoints
    - Acceptance: Log API costs (OpenAI, storage) per PDF
    - Impact: No visibility into costs

87. **Add cost tracking for storage**
    - Priority: P3
    - Owner: Backend Dev
    - File: Storage endpoints
    - Acceptance: Track storage costs per org
    - Impact: No visibility into costs

88. **Add billing alerts for high usage**
    - Priority: P3
    - Owner: Backend Dev
    - File: Background job
    - Acceptance: Email sent when org exceeds threshold
    - Impact: Surprise bills

89. **Add org-level storage limits**
    - Priority: P3
    - Owner: Backend Dev
    - File: Upload endpoints
    - Acceptance: Uploads fail when org hits limit
    - Impact: Unlimited storage usage

90. **Add org-level PDF generation limits**
    - Priority: P3
    - Owner: Backend Dev
    - File: PDF generation endpoints
    - Acceptance: PDF generation fails when org hits limit
    - Impact: Unlimited API costs

### Monitoring & Observability

91. **Add Datadog APM integration**
    - Priority: P3
    - Owner: DevOps
    - File: `next.config.js`
    - Acceptance: All API routes traced in Datadog
    - Impact: No performance visibility

92. **Add custom metrics for PDF generation time**
    - Priority: P3
    - Owner: Backend Dev
    - File: PDF generation endpoints
    - Acceptance: Metrics logged to monitoring system
    - Impact: Can't identify slow PDFs

93. **Add custom metrics for template load time**
    - Priority: P3
    - Owner: Backend Dev
    - File: Template endpoints
    - Acceptance: Metrics logged to monitoring system
    - Impact: Can't identify slow templates

94. **Add custom metrics for upload success rate**
    - Priority: P3
    - Owner: Backend Dev
    - File: Upload endpoints
    - Acceptance: Metrics logged to monitoring system
    - Impact: Can't identify upload issues

95. **Add alerting for high error rates**
    - Priority: P3
    - Owner: DevOps
    - File: Monitoring system
    - Acceptance: Alert sent when error rate > 5%
    - Impact: Blind to production issues

96. **Add alerting for slow API responses**
    - Priority: P3
    - Owner: DevOps
    - File: Monitoring system
    - Acceptance: Alert sent when p95 > 2s
    - Impact: Blind to performance degradation

97. **Add uptime monitoring for critical endpoints**
    - Priority: P3
    - Owner: DevOps
    - File: External monitoring service
    - Acceptance: /api/health checked every 1 min
    - Impact: Blind to downtime

98. **Add database connection pool monitoring**
    - Priority: P3
    - Owner: DevOps
    - File: Database monitoring
    - Acceptance: Pool size/usage tracked
    - Impact: Blind to connection exhaustion

99. **Add Redis connection monitoring**
    - Priority: P3
    - Owner: DevOps
    - File: Redis monitoring
    - Acceptance: Connection count/latency tracked
    - Impact: Blind to Redis issues

100.  **Add deployment notification to Slack**
      - Priority: P3
      - Owner: DevOps
      - File: GitHub Actions or Vercel webhook
      - Acceptance: Slack message sent on each deployment
      - Impact: Team unaware of deployments

### Security

101. **Add Content Security Policy headers**
     - Priority: P3
     - Owner: Backend Dev
     - File: `next.config.js`
     - Acceptance: CSP headers set, no inline scripts
     - Impact: XSS vulnerability

102. **Add CORS configuration for API routes**
     - Priority: P3
     - Owner: Backend Dev
     - File: Middleware
     - Acceptance: CORS headers set appropriately
     - Impact: Unauthorized cross-origin requests

103. **Add input sanitization for template content**
     - Priority: P3
     - Owner: Backend Dev
     - File: Template endpoints
     - Acceptance: HTML content sanitized before storage
     - Impact: XSS vulnerability

104. **Add file type validation for uploads**
     - Priority: P3
     - Owner: Backend Dev
     - File: UploadThing core
     - Acceptance: Only allowed MIME types accepted
     - Impact: Malicious file uploads

105. **Add file size limits for uploads**
     - Priority: P3
     - Owner: Backend Dev
     - File: UploadThing core
     - Acceptance: Files > 10MB rejected
     - Impact: Storage abuse

106. **Add virus scanning for uploaded files**
     - Priority: P3
     - Owner: Backend Dev
     - File: UploadThing callbacks
     - Acceptance: Files scanned with ClamAV or similar
     - Impact: Malware distribution

107. **Add security headers audit**
     - Priority: P3
     - Owner: DevOps
     - File: CI/CD pipeline
     - Acceptance: Security headers checked on deploy
     - Impact: Missing security headers

108. **Add dependency vulnerability scanning**
     - Priority: P3
     - Owner: DevOps
     - File: GitHub Dependabot
     - Acceptance: PRs created for vulnerable deps
     - Impact: Vulnerable dependencies

109. **Add secret scanning in commits**
     - Priority: P3
     - Owner: DevOps
     - File: GitHub Actions
     - Acceptance: Commits scanned for secrets
     - Impact: Leaked credentials

110. **Add penetration testing**
     - Priority: P3
     - Owner: Security Team
     - File: External engagement
     - Acceptance: Pen test report generated, issues fixed
     - Impact: Unknown vulnerabilities

---

## TOTAL: 110 ITEMS

### By Priority

- **P0 (Critical):** 3 items
- **P1 (High):** 13 items
- **P2 (Medium):** 14 items
- **P3 (Low):** 80 items

### By Category

- **Security:** 13 items
- **Storage:** 10 items
- **Testing:** 9 items
- **Documentation:** 8 items
- **Performance:** 10 items
- **UX:** 10 items
- **Developer Experience:** 10 items
- **Database:** 10 items
- **API:** 10 items
- **Admin:** 10 items
- **Monitoring:** 10 items

---

## RECOMMENDED EXECUTION ORDER

### Week 1 (P0 + Critical P1)

1. Items 1-3 (Auth + UploadThing env vars)
2. Items 4-7 (Delete endpoint fixes)
3. Item 8 (Transaction safety)

### Week 2 (Remaining P1)

4. Items 9-13 (Env var verification)

### Week 3-4 (P2)

5. Items 14-30 (Monitoring, testing, docs)

### Month 2+ (P3)

6. Items 31-110 (Enhancements, nice-to-haves)

---

**Last Updated:** December 25, 2025  
**Owner:** Engineering Team  
**Review Cadence:** Weekly sprint planning

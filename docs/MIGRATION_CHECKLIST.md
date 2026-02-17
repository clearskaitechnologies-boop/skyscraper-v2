# Data Migration Checklist — Enterprise Customer

> **Operational checklist. Print this. Check boxes. Don't skip steps.**

---

## Pre-Migration (Day Before)

- [ ] **Identify source system** (AccuLynx / JobNimbus / CompanyCam / Xactimate / Other)
- [ ] **Request data export from customer**
  - [ ] Contacts/customers CSV
  - [ ] Properties/addresses CSV
  - [ ] Claims/jobs CSV
  - [ ] Leads/opportunities CSV (if applicable)
  - [ ] Photos/documents (if CompanyCam)
- [ ] **Verify CSV format** — open in text editor, check for:
  - [ ] Header row present
  - [ ] Consistent delimiter (comma, not tab/pipe)
  - [ ] No BOM characters (UTF-8 without BOM)
  - [ ] Email addresses in standard format
  - [ ] Phone numbers present (any format — we normalize)
  - [ ] No HTML or rich text in fields
- [ ] **Count records** — `wc -l contacts.csv` — know what to expect
- [ ] **Confirm org exists** in SkaiScraper (org_id ready)
- [ ] **Confirm admin user exists** with write permissions

---

## Dry Run (Day Of, Step 1)

- [ ] **Run preflight check** via Migration Wizard UI or CLI:
  ```
  npx ts-node scripts/enterprise-data-import.ts \
    --source acculynx \
    --org-id <ORG_ID> \
    --contacts contacts.csv \
    --properties properties.csv \
    --claims claims.csv \
    --leads leads.csv \
    --dry-run
  ```
- [ ] **Review dry-run output:**
  - [ ] Total records parsed: \_\_\_
  - [ ] Validation errors: \_\_\_ (target: 0)
  - [ ] Duplicate contacts detected: \_\_\_
  - [ ] Missing required fields: \_\_\_
- [ ] **Fix data issues** in source CSV if errors found
- [ ] **Re-run dry-run** until 0 errors
- [ ] **Customer sign-off** on record count: "We expect X contacts, Y properties, Z claims"

---

## Live Import (Day Of, Step 2)

- [ ] **Take note of current record counts** (before import):
  - Contacts: \_\_\_
  - Properties: \_\_\_
  - Claims: \_\_\_
  - Leads: \_\_\_
- [ ] **Run live import** (remove `--dry-run` flag):
  ```
  npx ts-node scripts/enterprise-data-import.ts \
    --source acculynx \
    --org-id <ORG_ID> \
    --contacts contacts.csv \
    --properties properties.csv \
    --claims claims.csv \
    --leads leads.csv
  ```
- [ ] **Verify record counts** (after import):
  - Contacts: \_\_\_ (should be previous + CSV count)
  - Properties: \_\_\_
  - Claims: \_\_\_
  - Leads: \_\_\_
- [ ] **Spot-check 10 records** with customer:
  - [ ] Record 1: \_\_\_ ✓/✗
  - [ ] Record 2: \_\_\_ ✓/✗
  - [ ] Record 3: \_\_\_ ✓/✗
  - [ ] Record 4: \_\_\_ ✓/✗
  - [ ] Record 5: \_\_\_ ✓/✗
  - [ ] Record 6: \_\_\_ ✓/✗
  - [ ] Record 7: \_\_\_ ✓/✗
  - [ ] Record 8: \_\_\_ ✓/✗
  - [ ] Record 9: \_\_\_ ✓/✗
  - [ ] Record 10: \_\_\_ ✓/✗

---

## Post-Migration Verification (Day Of, Step 3)

- [ ] **Search for a known contact** in SkaiScraper UI — confirm it appears
- [ ] **Open a known claim** — verify all fields populated
- [ ] **Check property addresses** — verify geocoding worked (map pin correct)
- [ ] **Verify no cross-org data leakage** — log in as different org, confirm Titan data is invisible
- [ ] **Run `/api/health/deep`** — confirm DB healthy after bulk insert
- [ ] **Check Sentry** — no new errors from import

---

## Customer Sign-Off

- [ ] Customer champion confirms: "Data looks correct" (verbal or email)
- [ ] Customer champion confirms: "Ready for users to start working"
- [ ] Document any known gaps: "X records intentionally skipped because \_\_\_"
- [ ] Set expectation: "If you find any data issues in the first week, send them to me and I'll fix same-day"

---

## Rollback Plan

If something goes wrong:

1. **Identify scope** — which records are affected?
2. **If < 50 records wrong** — fix manually in UI or via SQL
3. **If widespread data corruption** — rollback:
   ```sql
   -- Delete imported records by created_at timestamp
   DELETE FROM "Contact" WHERE org_id = '<ORG_ID>' AND created_at > '<IMPORT_TIMESTAMP>';
   DELETE FROM "Property" WHERE org_id = '<ORG_ID>' AND created_at > '<IMPORT_TIMESTAMP>';
   DELETE FROM "Claim" WHERE org_id = '<ORG_ID>' AND created_at > '<IMPORT_TIMESTAMP>';
   DELETE FROM "Lead" WHERE org_id = '<ORG_ID>' AND created_at > '<IMPORT_TIMESTAMP>';
   ```
4. **Re-run import** after fixing source data

---

## Supported Source Systems

| Source      | Format     | Mapping Status | Notes                             |
| ----------- | ---------- | -------------- | --------------------------------- |
| AccuLynx    | CSV export | ✅ Tested      | Standard column mapping built-in  |
| JobNimbus   | CSV export | ✅ Tested      | Standard column mapping built-in  |
| CompanyCam  | Photo sync | ✅ Mapped      | Photo-to-property linking         |
| Xactimate   | ESX/CSV    | ✅ Mapped      | Claim cost data import            |
| Generic CSV | Any CSV    | ✅ Flexible    | Custom column mapping via headers |

---

## Time Estimates

| Data Volume          | Dry Run | Live Import | Total                           |
| -------------------- | ------- | ----------- | ------------------------------- |
| <100 records         | <5 sec  | <10 sec     | 15 min (including verification) |
| 100-1,000 records    | <10 sec | <30 sec     | 30 min                          |
| 1,000-10,000 records | <30 sec | <2 min      | 1 hour                          |
| 10,000+ records      | <1 min  | <5 min      | 2 hours                         |

---

_Fast migrations build trust. Every minute of downtime during migration erodes confidence. Aim for "done before lunch."_

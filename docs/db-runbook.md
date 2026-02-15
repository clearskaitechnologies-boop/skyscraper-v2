# Database Operations Runbook

## Overview

This runbook covers database migrations, backups, drift detection, and emergency recovery procedures for the production PostgreSQL database.

---

## 1. Migrations

### Manual Migration Execution

**When to use**: Apply a specific migration file to staging or production.

**Steps**:

1. Navigate to GitHub Actions → "Database Migration" workflow
2. Click "Run workflow"
3. Select environment (staging or production)
4. Enter migration file name (e.g., `20251026_add_organization_branding.sql`)
5. Click "Run workflow"

**Automated backup**: The workflow automatically creates a backup before applying the migration.

### Release-Triggered Migrations

**When to use**: Automatically apply all pending migrations on new releases.

**Trigger**: Publishing a new GitHub release automatically runs all `db/migrations/*.sql` files.

**Idempotency**: Migrations should use `CREATE TABLE IF NOT EXISTS` and similar patterns to safely re-run.

---

## 2. Drift Detection

### What is Schema Drift?

Schema drift occurs when the database schema diverges from the Prisma schema definition. Common causes:

- Manual SQL changes to production database
- Hotfix applied directly to DB without updating schema
- Migration file edited after being applied

### Detecting Drift

**Local detection**:

```bash
pnpm db:diff
```

This generates a SQL script showing differences between `prisma/schema.prisma` and the actual database. Output saved to `db/migrations/drift_YYYYMMDD_HHMMSS.sql`.

**Interpreting results**:

- Empty file → No drift, schema matches database ✅
- SQL statements → Drift detected, review changes ⚠️

**Resolution**:

1. Review the generated drift SQL file
2. If changes are intentional:
   - Update `prisma/schema.prisma` to match
   - Run `npx prisma generate`
3. If changes are accidental:
   - Apply the drift SQL to bring DB back in sync
   - Investigate root cause

---

## 3. Backups

### Automated Backups

**GitHub Actions**: Every migration workflow creates a timestamped backup:

- Stored as workflow artifacts
- Retention: 30 days
- Naming: `backup_YYYYMMDD_HHMMSS.sql`

**Downloading a backup**:

1. Go to GitHub Actions → "Database Migration" → Recent run
2. Scroll to "Artifacts" section
3. Download `db-backup-backup_*.sql`

### Manual Backups

**Local backup**:

```bash
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Production backup** (requires DATABASE_URL secret):

```bash
pg_dump "$PRODUCTION_DATABASE_URL" > prod_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Best practices**:

- Run manual backup before major schema changes
- Store backups in secure location (S3, encrypted drive)
- Test restore procedure quarterly

---

## 4. Restore Procedures

### Restore from Backup

**Full database restore**:

```bash
# WARNING: This drops all tables and data!
psql "$DATABASE_URL" < backup_20250115_143022.sql
```

**Table-level restore**:

```bash
# Extract single table from backup
pg_restore -t organization_branding backup.sql | psql "$DATABASE_URL"
```

**Point-in-time restore** (requires Vercel Postgres or AWS RDS with PITR enabled):

1. Contact Vercel support or use AWS RDS console
2. Specify target timestamp
3. Restore to new database instance
4. Validate data
5. Update DATABASE_URL to point to restored instance

---

## 5. Emergency Procedures

### Scenario: Bad Migration Applied

**Symptoms**:

- Application errors after migration
- Missing columns/tables
- Data integrity violations

**Recovery**:

1. **Stop the bleeding**:
   - Revert deployment to previous version
   - Disable affected features in production (feature flags)

2. **Download pre-migration backup**:
   - Go to GitHub Actions → Failed migration run
   - Download artifact: `db-backup-backup_*.sql`

3. **Restore database**:

   ```bash
   psql "$DATABASE_URL" < db-backup-backup_20250115_120000.sql
   ```

4. **Verify application health**:
   - Check `/api/health/live` → 200 OK
   - Test critical user flows
   - Review Sentry for errors

5. **Root cause analysis**:
   - Review migration SQL for errors
   - Test migration on staging database
   - Update migration file with fix
   - Re-deploy with corrected migration

### Scenario: Accidental Data Deletion

**Symptoms**:

- User reports missing data
- Dashboard shows 0 records
- Database query returns empty results

**Recovery**:

1. **Identify deletion window**:
   - Check application logs for DELETE statements
   - Review audit trail (if enabled)
   - Narrow down time range

2. **Restore from backup**:

   ```bash
   # Restore to temporary database
   createdb temp_restore
   psql "postgresql://localhost/temp_restore" < backup_20250115_100000.sql
   ```

3. **Extract deleted data**:

   ```sql
   -- Copy missing records from temp_restore to production
   INSERT INTO organizations (id, name, created_at, ...)
   SELECT id, name, created_at, ...
   FROM temp_restore.organizations
   WHERE id NOT IN (SELECT id FROM organizations);
   ```

4. **Verify data integrity**:
   - Check foreign key constraints
   - Validate record counts
   - Test application functionality

5. **Post-mortem**:
   - Document incident timeline
   - Update runbook with lessons learned
   - Consider row-level audit logging

---

## 6. Environment Variables

### Required for Migrations

| Variable               | Purpose                  | Example                                  |
| ---------------------- | ------------------------ | ---------------------------------------- |
| `DATABASE_URL`         | Production DB connection | `postgresql://user:pass@host:5432/db`    |
| `STAGING_DATABASE_URL` | Staging DB connection    | `postgresql://user:pass@staging:5432/db` |

### Setting in GitHub Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `DATABASE_URL` or `STAGING_DATABASE_URL`
4. Value: Full PostgreSQL connection string
5. Click "Add secret"

---

## 7. Best Practices

### Migration Files

✅ **DO**:

- Use timestamped filenames: `20251026_description.sql`
- Make migrations idempotent: `CREATE TABLE IF NOT EXISTS`
- Include rollback statements in comments
- Test on staging before production
- Keep migrations small and focused

❌ **DON'T**:

- Edit migration files after they've been applied
- Run `DROP TABLE` without backups
- Apply untested migrations directly to production
- Mix schema changes with data migrations
- Hardcode environment-specific values

### Monitoring

**Health checks**:

- `/api/health/live` → Returns 200 if DB connection healthy
- `/api/health/ready` → Returns 200 if migrations applied

**Database metrics** (if using Vercel Postgres):

- Connection pool utilization
- Query latency (p50, p95, p99)
- Error rate

**Alerts** (see `docs/alerts.md`):

- Set up Vercel Alerts for 5xx errors
- External uptime monitoring for health endpoints

---

## 8. Prisma Workflow

### Updating Schema

**Making schema changes**:

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate Prisma Client
npx prisma generate

# 3. Create migration file
npx prisma migrate dev --name add_user_roles

# 4. Review generated migration in prisma/migrations/
# 5. Copy to db/migrations/ for GitHub Actions workflow
cp prisma/migrations/*/migration.sql db/migrations/20250115_add_user_roles.sql
```

**Pushing schema changes** (development only):

```bash
npx prisma db push
```

⚠️ **WARNING**: `db push` bypasses migrations and can cause data loss. Only use in local development.

### Prisma Studio

**Viewing data locally**:

```bash
npx prisma studio
```

Opens browser at `http://localhost:5555` with GUI for browsing/editing records.

---

## 9. Common Troubleshooting

### Connection Refused

**Error**: `Error: connect ECONNREFUSED`

**Fix**:

1. Verify `DATABASE_URL` is set correctly
2. Check database server is running
3. Confirm network connectivity (firewall rules, VPN)

### Permission Denied

**Error**: `ERROR: permission denied for schema public`

**Fix**:

```sql
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
```

### Migration Already Applied

**Error**: `relation "organizations" already exists`

**Fix**: Migration is idempotent. This is a warning, not an error. Workflow continues.

### Prisma Client Out of Sync

**Error**: `The table `main.User` does not exist in the current database.`

**Fix**:

```bash
npx prisma generate
pnpm install
```

---

## 10. Contacts

| Role             | Responsibility                    | Contact                |
| ---------------- | --------------------------------- | ---------------------- |
| On-call Engineer | First responder for DB incidents  | See PagerDuty rotation |
| Database Admin   | Schema design, performance tuning | dba@example.com        |
| DevOps Lead      | GitHub Actions, CI/CD             | devops@example.com     |
| Vercel Support   | Production database issues        | support.vercel.com     |

---

## Quick Reference

**Create backup**:

```bash
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore backup**:

```bash
psql "$DATABASE_URL" < backup_20250115_143022.sql
```

**Detect drift**:

```bash
pnpm db:diff
```

**Run migration (GitHub Actions)**:

1. Actions → Database Migration → Run workflow
2. Select environment + migration file

**Health check**:

```bash
curl https://skaiscrape.com/api/health/live
```

---

**Last updated**: January 2025  
**Maintainer**: DevOps Team

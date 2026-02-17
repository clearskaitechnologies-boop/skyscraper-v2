# Titan Roofing — 180-Seat Onboarding Runbook

> **Operational document. Not a pitch. This is the plan you execute.**

---

## Pre-Engagement (Before Contract Signature)

### Week -1: Internal Prep

| Task                                                 | Owner  | Time    |
| ---------------------------------------------------- | ------ | ------- |
| Confirm Clerk plan supports 180+ MAU                 | Damien | 15 min  |
| Verify seat enforcement is active in production      | Damien | 5 min   |
| Test CSV bulk invite with 10 test accounts           | Damien | 30 min  |
| Prepare Titan org shell (name, branding, settings)   | Damien | 20 min  |
| Confirm RBAC roles: admin, member, viewer            | Damien | 5 min   |
| Test data migration from AccuLynx with sample export | Damien | 1 hour  |
| Prepare training video (Loom, 5-10 min walkthrough)  | Damien | 2 hours |

---

## Phase 1: Pilot (Day 1-14 — 20 Users)

### Day 1: Account Setup

| Step | Action                                   | Details                          |
| ---- | ---------------------------------------- | -------------------------------- |
| 1    | Create Titan organization in SkaiScraper | Via admin panel or bootstrap CLI |
| 2    | Configure org branding                   | Logo, company name, address      |
| 3    | Set billing to Enterprise ($80/seat)     | Stripe subscription via admin    |
| 4    | Assign Damien as temporary org admin     | For initial setup                |

### Day 1: Champion Identification

Titan needs to designate:

- **1 Executive Sponsor** — signs off on rollout decisions
- **1 Internal Champion** — power user who becomes the go-to
- **2-3 Team Leads** — will train their crews

### Day 2: Pilot User Onboarding

| Step | Action                                             | Details                            |
| ---- | -------------------------------------------------- | ---------------------------------- |
| 1    | Get CSV from Titan IT: name, email, role (20 rows) | Template provided                  |
| 2    | Upload via CSV import API                          | `POST /api/org/members/csv-import` |
| 3    | Each user receives Clerk invite email              | Auto-generated                     |
| 4    | Users sign in, complete onboarding checklist       | 7-step in-app flow                 |
| 5    | Verify all 20 users can access dashboard           | Spot-check                         |

### Day 2: Data Migration

| Step | Action                                    | Details                                   |
| ---- | ----------------------------------------- | ----------------------------------------- |
| 1    | Request AccuLynx CSV export from Titan    | Contacts, properties, claims              |
| 2    | Run preflight check                       | `POST /api/migrations/acculynx/preflight` |
| 3    | Review duplicate detection report         | Share with champion                       |
| 4    | Run dry-run import                        | `--dry-run` flag, verify 0 errors         |
| 5    | Execute import                            | Migration wizard UI                       |
| 6    | Spot-check 10 records with Titan champion | Side-by-side with AccuLynx                |

### Day 3-7: Pilot Execution

| Activity                                         | Frequency  |
| ------------------------------------------------ | ---------- |
| Daily 15-min check-in with champion (Slack/call) | Daily      |
| Monitor error logs in Sentry                     | Daily      |
| Track feature usage via analytics dashboard      | Daily      |
| Collect feedback (what works, what doesn't)      | End of day |
| Fix any blockers same-day                        | As needed  |

### Day 7: Pilot Review

| Question                              | Answer Needed                              |
| ------------------------------------- | ------------------------------------------ |
| Are all 20 users actively logging in? | Yes/No + count                             |
| What's the #1 complaint?              | Document it                                |
| What's the #1 positive?               | Document it (this becomes the testimonial) |
| Any data migration issues?            | Document and fix                           |
| Ready to expand?                      | Go/No-Go decision                          |

---

## Phase 2: Division Rollout (Day 15-28 — 100 Users)

### Day 15: Expand Invitations

| Step | Action                                                   |
| ---- | -------------------------------------------------------- |
| 1    | Get CSV of next 80 users from Titan IT                   |
| 2    | Bulk import via CSV API (80 users, ~2 seconds)           |
| 3    | Send welcome email with training video link              |
| 4    | Team leads run 30-min training sessions with their crews |

### Day 15-21: Parallel Running

- SkaiScraper and AccuLynx run side-by-side
- New claims entered in BOTH systems
- Team leads validate data consistency
- Champion reports daily to executive sponsor

### Day 21: Checkpoint

| Metric                          | Target               |
| ------------------------------- | -------------------- |
| Daily active users              | >60% of 100          |
| Claims processed in SkaiScraper | >50% of daily volume |
| Support tickets                 | <10/day              |
| Critical bugs                   | 0                    |

### Day 28: Division Sign-Off

- Executive sponsor confirms readiness for company-wide
- Set AccuLynx cancellation date (60-day notice typical)
- Document any workflow gaps for Phase 3

---

## Phase 3: Company-Wide (Day 29-56 — 180 Users)

### Day 29: Final Wave

| Step | Action                                                |
| ---- | ----------------------------------------------------- |
| 1    | Get CSV of remaining 80 users                         |
| 2    | Bulk import via CSV API                               |
| 3    | Team leads conduct training (each leads 15-20 people) |
| 4    | AccuLynx becomes read-only (reference only)           |

### Day 29-42: Stabilization

| Activity                                   | Frequency |
| ------------------------------------------ | --------- |
| Monitor daily active users                 | Daily     |
| Weekly 30-min call with champion + sponsor | Weekly    |
| Sentry error monitoring                    | Daily     |
| Performance monitoring (response times)    | Daily     |

### Day 42: Full Cutover

- AccuLynx access revoked
- SkaiScraper is sole system of record
- Champion becomes internal admin
- Damien transitions to monthly check-in cadence

### Day 56: Case Study

- Collect metrics: claims processed, time saved, revenue impact
- Get testimonial quote from executive sponsor
- Photograph team using platform (with permission)
- Publish case study

---

## Support Model During Onboarding

| Tier                           | Channel     | Response Time | Who               |
| ------------------------------ | ----------- | ------------- | ----------------- |
| Urgent (system down)           | Phone/Slack | <1 hour       | Damien            |
| High (can't complete workflow) | Slack/Email | <4 hours      | Damien            |
| Normal (how-to question)       | Email       | <24 hours     | Damien + docs     |
| Low (feature request)          | Email       | <1 week       | Logged to backlog |

### Escalation Path

User → Team Lead → Champion → Damien

**Goal:** 80% of questions answered by team leads and champion. Damien handles <20%.

---

## CSV Template for Bulk Import

```csv
email,firstName,lastName,role
john.smith@titanroofing.com,John,Smith,admin
jane.doe@titanroofing.com,Jane,Doe,member
mike.jones@titanroofing.com,Mike,Jones,member
sarah.wilson@titanroofing.com,Sarah,Wilson,viewer
```

**Accepted roles:** `admin`, `member`, `viewer`

**Role guidance for Titan:**

- `admin` — IT lead, operations manager (2-3 people)
- `member` — project managers, estimators, sales reps, field techs (170+ people)
- `viewer` — finance, executive dashboard access (5-10 people)

---

## Risk Mitigation

| Risk                                       | Mitigation                                          |
| ------------------------------------------ | --------------------------------------------------- |
| Users don't adopt                          | Champion runs daily stand-ups first 2 weeks         |
| AccuLynx data doesn't map cleanly          | Dry-run import + side-by-side validation            |
| Performance degrades at 180 users          | Proven at 500 VUs — 2.7x headroom                   |
| Support overwhelm                          | Team lead pyramid — Damien only handles escalations |
| Champion leaves company                    | Cross-train 2 backup champions in Phase 1           |
| Internet connectivity issues (field crews) | Platform works on mobile, progressive web app       |

---

## Success Metrics (90-Day Report)

| Metric                    | Target              | How Measured                |
| ------------------------- | ------------------- | --------------------------- |
| Daily active users        | >70% (126 of 180)   | Analytics dashboard         |
| Claims processed per week | >100                | Database query              |
| Average claim cycle time  | <35 days (from ~42) | Velocity dashboard          |
| User satisfaction         | >4.0/5.0            | Survey at Day 30 and Day 60 |
| Support tickets per week  | <15                 | Ticket count                |
| System uptime             | >99.5%              | Health monitoring           |

---

_The goal is not to impress Titan with technology. It's to make their 180 people faster at their jobs within 2 weeks._

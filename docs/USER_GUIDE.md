# SkaiScraper User Guide

**Complete guide to using the SkaiScraper roofing contractor management platform**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Claims Management](#claims-management)
3. [AI Features](#ai-features)
4. [Reports & Documents](#reports--documents)
5. [Client Portal](#client-portal)
6. [Business Operations](#business-operations)
7. [Team Management](#team-management)

---

## Getting Started

### First Login

1. Visit your organization's SkaiScraper URL
2. Sign in with your Clerk account (Google/Microsoft SSO or email)
3. Complete onboarding wizard if first-time user
4. Set up organization branding (logo, colors, contact info)

### Dashboard Overview

The dashboard shows:

- **Active Claims**: Current claims requiring attention
- **Recent Activity**: Latest team actions and updates
- **Token Balance**: Available AI processing credits
- **Quick Actions**: Fast access to common tasks

---

## Claims Management

### Creating a New Claim

#### Method 1: Manual Entry

1. Navigate to **Claims** → **New Claim**
2. Fill in property details:
   - Property address
   - Homeowner contact info
   - Insurance carrier & policy number
   - Date of loss
3. Add damage details and photos
4. Click **Create Claim**

#### Method 2: Storm Intake

1. Go to **Dashboard** → **Storm Intakes**
2. Select storm event from NOAA data
3. Batch import affected properties
4. Auto-generate claims from intake data

### Managing Claim Lifecycle

**Claim Statuses:**

- **New**: Just created, needs initial review
- **In Progress**: Actively being worked
- **Inspection Scheduled**: Waiting for site visit
- **Documented**: Photos and damage report complete
- **Submitted**: Sent to insurance adjuster
- **Approved**: Insurance approved payment
- **Completed**: Work finished, payment received

**Key Actions:**

- **Add Photos**: Upload damage photos (AI auto-analyzes)
- **Generate Report**: Create PDF report with AI
- **Send to Adjuster**: Email report to insurance
- **Track Financials**: Monitor RCV, ACV, supplements
- **Timeline**: View all claim events chronologically

### Weather Verification

Get NOAA weather data for any claim:

1. Open claim details
2. Click **Weather Verification**
3. System fetches CAP alerts and Mesonet data
4. AI generates weather report PDF
5. Attach to claim for insurance validation

---

## AI Features

### AI Photo Analysis (GPT-4o Vision)

**Automatically detect damage from photos:**

1. Upload photos to a claim
2. AI analyzes each image for:
   - Hail damage (hits, dents, cracks)
   - Wind damage (lifted shingles, missing tabs)
   - General wear and tear
   - Multiple damage types per image
3. Results appear in damage report within seconds
4. Review and edit AI findings as needed

**Best Practices:**

- Upload high-resolution images (2MB+ recommended)
- Include multiple angles of each damaged area
- Ensure good lighting (avoid shadows/glare)
- Capture overview shots and close-ups

### AI Report Generation (Claude 3.5 Sonnet)

**Create professional PDF reports in 30 seconds:**

1. Go to **Reports** → **New Report**
2. Select claim or lead
3. Choose report type:
   - **Insurance Claim**: For carrier submission
   - **Retail Estimate**: For homeowner quotes
4. AI generates:
   - Executive summary
   - Detailed damage assessment
   - Itemized material list with pricing
   - Repair recommendations
   - Professional formatting with your branding
5. Review, edit if needed, and send

### AI Scope Builder

**Convert photos to detailed line-item scopes:**

1. Upload property photos
2. Click **AI Scope Builder**
3. AI identifies:
   - Roof sections and measurements
   - Required materials (shingles, underlayment, flashing)
   - Labor estimates
   - Xactimate-compatible codes
4. Edit quantities and materials
5. Export to Xactimate or generate PDF

### Bad Faith Detection

**AI reviews claims for potential issues:**

Automatically flags:

- Lowball estimates from adjusters
- Missing damage items
- Unreasonable depreciation
- Policy coverage discrepancies

Access via: **Claims** → **[Claim]** → **Bad Faith Review**

---

## Reports & Documents

### Report Types

1. **Damage Assessment Reports**
   - Comprehensive claim documentation
   - Includes photos, findings, and recommendations
   - Formatted for insurance submission

2. **Weather Verification Reports**
   - NOAA storm data validation
   - Proves damage occurred on date of loss
   - Essential for disputed claims

3. **Scope of Work Reports**
   - Detailed repair specifications
   - Material quantities and costs
   - Labor estimates

4. **Financial Reports**
   - P&L statements
   - Revenue by claim/project
   - Material costs vs. revenue

### Sharing Reports

**Option 1: Email**

- Click **Send Report** → Enter recipient email
- PDF attached automatically
- Tracked in email logs for compliance

**Option 2: Public Link**

- Click **Generate Share Link**
- Set expiration (7, 14, or 30 days)
- Share URL with anyone (no login required)
- Track access count and last viewed

**Option 3: Client Portal**

- Reports automatically available in homeowner portal
- No manual sharing needed

### Document Management

Upload and organize all claim documents:

**Supported Types:**

- Photos (JPEG, PNG, HEIC)
- PDFs (insurance docs, contracts)
- Videos (MP4, MOV - if video plan enabled)
- Spreadsheets (estimates, invoices)

**Organization:**

- Auto-categorized by type
- Tagged by claim/property
- Full-text search enabled
- Cloudflare R2 storage (secure & fast)

---

## Client Portal

### Setting Up Client Access

1. Go to **Claims** → **[Claim]** → **Client Portal**
2. Click **Invite Homeowner**
3. Enter homeowner email
4. System sends magic link (no password needed)
5. Homeowner can access:
   - Claim status updates
   - All reports and photos
   - Financial breakdown (RCV, ACV, deductible)
   - Direct messaging with your team
   - Work progress timeline

### White-Labeling

Customize portal for your brand:

1. Go to **Settings** → **White Label**
2. Upload company logo
3. Set primary and accent colors
4. Add company name and contact info
5. Portal automatically reflects your branding

### Homeowner Features

**What homeowners can do:**

- View real-time claim status
- Download all reports and documents
- Upload additional photos
- Message your team
- See transparent financial breakdown
- Track work completion progress

**What homeowners CANNOT do:**

- Edit claim details
- See your cost margins
- Access other clients' data
- Modify financial information

---

## Business Operations

### CRM & Leads

**Lead Management:**

1. **Leads** → **New Lead**
2. Track lead source (referral, marketing, etc.)
3. Convert to claim or proposal when ready
4. Monitor conversion rates in analytics

**Referral Tracking:**

- Record referral sources
- Track referral fees
- Generate referral performance reports

### Project Management

**Job Boards:**

- Kanban-style boards for active projects
- Drag-and-drop status updates
- Assign crew members to jobs
- Track completion progress

**Scheduling:**

- Crew scheduling calendar
- Conflict detection
- Weather-aware scheduling
- SMS reminders to crew (if Twilio enabled)

### Financial Management

**Track all money:**

- RCV (Replacement Cost Value)
- ACV (Actual Cash Value)
- Deductibles collected
- Supplements filed
- Material costs
- Labor costs
- Profit margins

**Reports:**

- P&L by time period
- Revenue by claim/project
- Material vendor spending
- Crew labor costs

### Quality Control

**Inspections:**

1. Create inspection checklist
2. Assign inspector
3. Photo documentation
4. Pass/fail criteria
5. Completion sign-off

**Photo Requirements:**

- Set minimum photo count per job phase
- Track photo compliance
- Flag incomplete documentation

---

## Team Management

### User Roles

**Admin:**

- Full system access
- Manage users and billing
- Configure integrations
- Access all claims

**Manager:**

- View and edit all claims
- Generate reports
- Assign team members
- Cannot manage billing

**Field Crew:**

- View assigned jobs
- Upload photos
- Update job status
- Limited financial access

**Office Staff:**

- Process claims
- Generate reports
- Customer communication
- Limited field access

### Inviting Team Members

1. Go to **Settings** → **Team**
2. Click **Invite Member**
3. Enter email and select role
4. Member receives invitation email
5. They sign up via Clerk
6. Automatically added to your organization

### Permissions

Fine-grained control over:

- Claim creation/editing
- Financial data visibility
- Report generation
- Client communication
- Settings management
- API access

---

## Tips & Best Practices

### Maximizing AI Accuracy

**For Photo Analysis:**

- Upload 10-15 photos minimum per roof
- Include overview + detail shots
- Capture all roof sections
- Good lighting is critical

**For Report Generation:**

- Fill in all claim details completely
- Provide accurate measurements
- Include homeowner preferences
- Review AI output before sending

### Token Management

**Conserve tokens:**

- Batch upload photos (vs. one-by-one)
- Review drafts before regenerating
- Use cached weather data when possible
- Enable AI deduplication (Settings)

**Token costs:**

- Photo analysis: ~10 tokens per photo
- Report generation: ~50 tokens per report
- Weather verification: ~20 tokens per report
- Scope builder: ~30 tokens per roof

### Claim Workflow Best Practices

1. **Day 1**: Create claim, upload initial photos
2. **Day 2**: AI analysis, generate draft report
3. **Day 3**: Schedule inspection, add detailed photos
4. **Day 4**: Finalize report, send to adjuster
5. **Day 5-10**: Follow up, handle adjuster questions
6. **Day 11+**: Get approval, schedule work

### Common Issues

**"AI not detecting damage":**

- Check photo quality (blur, lighting)
- Ensure close-up shots of damage
- Try different angles
- Manually annotate if AI misses

**"Report missing information":**

- Fill in all claim fields before generating
- Add property measurements
- Include damage notes
- Regenerate report after adding data

**"Client portal not sending":**

- Verify homeowner email is correct
- Check spam folder (magic link might be filtered)
- Resend invitation from claim details
- Contact support if persistent

---

## Support & Resources

**Help Center:** [help.skaiscraper.com](https://help.skaiscraper.com)  
**Video Tutorials:** [youtube.com/skaiscraper](https://youtube.com/skaiscraper)  
**API Documentation:** [docs.skaiscraper.com/api](https://docs.skaiscraper.com/api)  
**Community Forum:** [community.skaiscraper.com](https://community.skaiscraper.com)

**Contact Support:**

- Email: support@skaiscraper.com
- Phone: 1-800-SKAI-CRM
- Live Chat: Available in-app (bottom right)

---

**Last Updated:** December 9, 2025  
**Version:** 1.0 (99.2% Complete Platform)

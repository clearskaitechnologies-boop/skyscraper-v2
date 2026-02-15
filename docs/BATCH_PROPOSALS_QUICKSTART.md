# 🚀 Batch Storm Proposal Engine - Quick Start

## Overview

The **Batch Storm Proposal Engine** allows contractors to order neighborhood-scale storm intelligence packs. Upload 25-500+ addresses, get volume discounts, and receive comprehensive PDF reports for every property.

## Features

✅ **Volume-Based Pricing** - $20/home with discounts up to $5/home at scale  
✅ **4-Step Wizard** - Simple UI for creating batch proposals  
✅ **Address Processing** - Normalizes and geocodes addresses automatically  
✅ **Weather Intelligence** - Fetches historical storm data and calculates impact scores  
✅ **AI-Generated Reports** - Individual PDFs per property + master community report  
✅ **Automated Processing** - Cron worker processes approved jobs every 5 minutes  
✅ **Progress Tracking** - Real-time dashboard showing processing status

## Pricing Structure

| Homes | Price/Home | Total  | Savings |
| ----- | ---------- | ------ | ------- |
| 25    | $20        | $500   | -       |
| 50    | $20        | $1,000 | -       |
| 100   | $19        | $1,900 | $100    |
| 200   | $18        | $3,600 | $400    |
| 300   | $17        | $5,100 | $900    |
| 500   | $15        | $7,500 | $2,500  |

**Formula:** Base $20, minus $1 per 100 homes, max $5 discount, floor $15/home

## How to Create a Batch Proposal

### Step 1: Navigate to Batch Proposals

```
https://skaiscrape.com/batch-proposals
```

### Step 2: Click "Create New Batch Proposal"

### Step 3: Complete the Wizard

#### 📋 Community Details

- **Community Name:** Give your batch a name (e.g., "Oak Hill Subdivision")
- **Storm Type:** Select hail, wind, or both
- **Optional:** Set storm date range

#### 🏠 Address Input

Choose one method:

- **Manual Paste:** Copy/paste addresses (one per line)
- **CSV Upload:** Upload a CSV file with addresses

Example format:

```
123 Main St, Austin, TX 78701
456 Oak Dr, Austin, TX 78702
789 Elm Ave, Austin, TX 78703
```

**Live Pricing:** Watch the total update as you add addresses!

#### ⚙️ Configuration

- **Manufacturer:** Select roofing manufacturer (GAF, Owens Corning, etc.)
- **Optional:** Add branding settings

#### ✅ Review & Submit

- Review pricing breakdown
- See volume savings
- Submit for sales approval

## Sales Approval Process

After submission, the proposal enters **PENDING_SALES_REVIEW** status.

### Manual Approval (via API)

```bash
curl -X POST https://skaiscrape.com/api/batch-proposals/{job-id}/approve \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

Once approved, the job moves to **APPROVED** status and waits for processing.

## Processing Pipeline

### Automatic Processing (Cron)

Every 5 minutes, the system:

1. Finds APPROVED jobs
2. Processes up to 5 jobs in parallel
3. For each address:
   - Normalizes and geocodes
   - Fetches weather data
   - Calculates storm impact score
   - Generates individual PDF report
4. Creates master community report
5. Updates job status to COMPLETE

### Manual Processing (Instant)

On the job detail page, click **"Start Processing Now"** to trigger immediate processing.

## Viewing Results

### Job Dashboard

```
https://skaiscrape.com/batch-proposals
```

Shows all your batch proposals with:

- Status badges (color-coded)
- Home counts
- Total pricing
- Report counts
- Creation dates

### Job Detail Page

```
https://skaiscrape.com/batch-proposals/{job-id}
```

Shows:

- **Progress bar** (processed / total homes)
- **Status overview** (pending, processing, complete)
- **Reports section** (download PDFs)
- **Address list** (with storm impact scores)
- **Manual processing trigger** (if approved)

## Address Status Indicators

| Status        | Icon    | Meaning                       |
| ------------- | ------- | ----------------------------- |
| ⏱️ PENDING    | Clock   | Waiting for processing        |
| 🔄 PROCESSING | Spinner | Currently being processed     |
| ✅ COMPLETE   | Check   | PDF generated, data collected |
| ❌ ERROR      | Alert   | Failed (see error message)    |

## API Endpoints

### Create Batch Proposal

```bash
POST /api/batch-proposals/create
Body: {
  name: "Community Name",
  homeCount: 100,
  stormType: "hail",
  manufacturer: "GAF",
  addressData: { addresses: [...] }
}
```

### List All Jobs

```bash
GET /api/batch-proposals
```

### Get Single Job

```bash
GET /api/batch-proposals/{job-id}
```

### Approve Job

```bash
POST /api/batch-proposals/{job-id}/approve
```

### Manual Processing Trigger

```bash
POST /api/batch-proposals/{job-id}/process
Body: { batchJobId: "job-id" }
```

## Cron Configuration

Vercel cron runs every 5 minutes:

```json
{
  "path": "/api/cron/process-batch-jobs",
  "schedule": "*/5 * * * *"
}
```

Protected by `CRON_SECRET` environment variable.

## Database Schema

### BatchJob Model

- Pricing fields (homeCount, pricePerHome, totalPrice)
- Configuration (stormType, manufacturer, branding)
- Progress tracking (processedCount, errorCount)
- Timestamps (createdAt, approvedAt, startedAt, completedAt)

### BatchJobAddress Model

- Raw and normalized address
- Geocoded coordinates (lat/lng)
- Weather data (JSON)
- Storm impact score (0-100)
- Processing status and timestamps

### BatchJobReport Model

- Report type (individual, master, summary)
- PDF URL
- Metadata

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **PDF Generation:** @react-pdf/renderer
- **AI Content:** OpenAI GPT-4
- **Storage:** Vercel Blob Storage
- **Automation:** Vercel Cron Jobs

## Troubleshooting

### Job Stuck in PENDING_SALES_REVIEW

✅ **Solution:** Manually approve via API endpoint

### Job Not Processing After Approval

✅ **Solution:** Click "Start Processing Now" or wait for next cron run (max 5 minutes)

### Addresses Showing ERROR Status

✅ **Solution:** Check error message in detail page, likely geocoding issue

### No Reports Generated

✅ **Solution:** Ensure `OPENAI_API_KEY` is set, check PDF generation logs

## Future Enhancements

🔜 **Phase 4 (Planned):**

- Real geocoding API integration (Google Maps / Mapbox)
- Real weather API integration (WeatherStack / Visual Crossing)
- Email notifications when jobs complete
- Bulk download all PDFs as ZIP
- Export CSV with all storm impact scores
- Integration with existing report system

## Support

Questions? Issues?

- Check job detail page for error messages
- Review API logs in Vercel dashboard
- Contact support team

---

**Built with ❤️ by RAVEN + EAGLE** 🦅✨

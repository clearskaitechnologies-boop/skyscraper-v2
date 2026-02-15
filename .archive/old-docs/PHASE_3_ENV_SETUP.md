# Phase 3: Environment Variables Configuration

**AI Proposals System - OpenAI + Firebase Storage**

This document lists all environment variables required for the AI Proposals & Claims-Ready Packets system.

---

## Required Environment Variables

### 1. Firebase Storage (Server-Side PDF Upload)

```bash
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADA...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
```

**How to get these values:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **⚙️ Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Download the JSON file and extract values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n` newlines)
   - Bucket: `{project_id}.appspot.com` → `FIREBASE_STORAGE_BUCKET`

**⚠️ Important:**

- The `FIREBASE_PRIVATE_KEY` must preserve `\n` characters for newlines
- Never commit the service account JSON to Git

---

### 2. OpenAI API (AI Content Generation)

```bash
OPENAI_API_KEY="sk-proj-..."
```

**How to get:**

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key (starts with `sk-proj-` or `sk-...`)

**Models used:**

- `gpt-4o-mini` - Fast, cost-effective for proposal generation
- Token cost: 2 tokens per proposal build

---

### 3. Application URL (Required for Puppeteer)

```bash
NEXT_PUBLIC_APP_URL="https://skaiscrape.com"
```

**Development:**

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Why needed:**

- Puppeteer needs to visit `/proposal/print` page to render PDFs
- Must be publicly accessible URL in production
- Localhost works for development

---

## Setting Variables in Vercel

### Via Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable for **Production** and **Preview**

### Via Vercel CLI:

```bash
# Firebase Project ID
vercel env add FIREBASE_PROJECT_ID production
# Enter: your-project-id

# Firebase Client Email
vercel env add FIREBASE_CLIENT_EMAIL production
# Enter: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Firebase Private Key (paste entire key)
vercel env add FIREBASE_PRIVATE_KEY production
# Enter: -----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n

# Firebase Storage Bucket
vercel env add FIREBASE_STORAGE_BUCKET production
# Enter: your-project-id.appspot.com

# OpenAI API Key
vercel env add OPENAI_API_KEY production
# Enter: sk-proj-...

# App URL (production)
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://skaiscrape.com
```

### Apply to Preview Environment:

```bash
# Repeat all commands with "preview" instead of "production"
vercel env add FIREBASE_PROJECT_ID preview
# ... etc
```

---

## Local Development (.env.local)

Create `.env.local` file (add to `.gitignore`):

```bash
# Firebase Storage (get from service account JSON)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"

# OpenAI API
OPENAI_API_KEY="sk-proj-..."

# App URL (local)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database (if using local PostgreSQL)
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Clerk Auth (existing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Existing ENV variables...
```

---

## Verification

### Check ENV Variables are Set:

```bash
# In your terminal or deployment logs
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL
echo $FIREBASE_PRIVATE_KEY | head -c 50
echo $FIREBASE_STORAGE_BUCKET
echo $OPENAI_API_KEY | head -c 10
echo $NEXT_PUBLIC_APP_URL
```

### Test Firebase Connection:

```bash
npx tsx scripts/test-firebase-upload.ts
```

Expected output:

```
✅ Upload successful!
📄 Signed URL: https://storage.googleapis.com/...
🗑️  Test file deleted
```

### Test OpenAI Connection:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq
```

Expected: List of available models including `gpt-4o-mini`

---

## Security Checklist

- [ ] `.env.local` added to `.gitignore`
- [ ] Service account JSON NOT committed to Git
- [ ] Vercel ENV variables set for Production and Preview
- [ ] `FIREBASE_PRIVATE_KEY` preserves `\n` newlines
- [ ] `OPENAI_API_KEY` starts with `sk-`
- [ ] `NEXT_PUBLIC_APP_URL` matches deployed domain
- [ ] Firebase Storage Rules deployed (see FIREBASE_STORAGE_SETUP.md)

---

## Troubleshooting

### Error: "Firebase admin initialization failed"

**Check:**

```bash
# Verify all 4 Firebase variables are set
env | grep FIREBASE

# Ensure private key format is correct (should start with -----)
echo $FIREBASE_PRIVATE_KEY | head -c 100
```

### Error: "OpenAI API key invalid"

**Check:**

```bash
# Verify key format
echo $OPENAI_API_KEY | head -c 10
# Should output: sk-proj-... or sk-...

# Test directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Error: "Puppeteer cannot access print page"

**Check:**

```bash
# Verify app URL is correct
echo $NEXT_PUBLIC_APP_URL

# Test endpoint manually
curl $NEXT_PUBLIC_APP_URL/api/health

# Ensure URL is publicly accessible (not localhost in production)
```

---

## Cost Monitoring

### Firebase Storage:

- Free tier: 5 GB storage, 1 GB/day downloads
- Monitor usage: [Firebase Console](https://console.firebase.google.com) → Storage → Usage

### OpenAI API:

- GPT-4o-mini: ~$0.00015 per proposal (500 tokens @ $0.150/$0.600 per 1M tokens)
- 1,000 proposals = ~$0.15
- Monitor usage: [OpenAI Platform](https://platform.openai.com/usage)

---

## Support

- **Firebase Setup**: See `FIREBASE_STORAGE_SETUP.md`
- **Deployment**: See `PHASE_3_SPRINT_3_DEPLOYMENT.md`
- **Verification**: Run `./scripts/phase3-verify.sh`

---

**Last Updated**: October 31, 2025  
**Phase**: 3 - AI Proposals (OpenAI-only, Firebase Storage)

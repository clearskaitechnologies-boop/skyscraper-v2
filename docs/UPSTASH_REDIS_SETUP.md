# Upstash Redis Setup Guide

**Phase 34 Infrastructure Requirement**

This guide walks you through setting up Upstash Redis for AI caching in PreLoss Vision.

---

## Why Upstash Redis?

PreLoss Vision's Phase 34 AI Performance Engine uses Redis for:

- **30-day caching** for image-based AI (vision, geometry)
- **7-day caching** for text-based AI (analysis, summaries)
- **Request deduplication** to prevent concurrent identical API calls
- **Cost savings** of 60-80% through cache hits

**Upstash Benefits:**

- ✅ Serverless (pay per request)
- ✅ REST API (works in Vercel Edge/serverless)
- ✅ Free tier: 10K commands/day
- ✅ Global replication
- ✅ No connection pooling needed

---

## Step 1: Create Upstash Account

1. Go to **https://upstash.com**
2. Click **Sign Up** (free account)
3. Sign up with GitHub, Google, or email
4. Verify your email if required

---

## Step 2: Create Redis Database

1. After logging in, click **Create Database**
2. Configure your database:
   - **Name**: `preloss-vision-cache` (or any name you prefer)
   - **Type**: Select **Regional** (cheaper) or **Global** (faster worldwide)
   - **Region**: Choose closest to your Vercel deployment region
     - US East (N. Virginia) → `us-east-1`
     - US West (Oregon) → `us-west-1`
     - Europe (Ireland) → `eu-west-1`
     - Asia Pacific (Tokyo) → `ap-northeast-1`
   - **Primary Region**: Select based on your users' location
   - **TLS**: Keep enabled (default)

3. Click **Create**

---

## Step 3: Get Connection Details

After database creation, you'll see the **Database Details** page.

### Copy These Values:

1. **Endpoint (REST URL)**:

   ```
   https://your-db-name-12345.upstash.io
   ```

2. **REST Token** (click "Show" to reveal):
   ```
   AaBbCc...xyz123
   ```

### Important Notes:

- ⚠️ **Use REST API, not Redis SDK** (Vercel serverless requires REST)
- ⚠️ **Keep REST Token secret** (treat like a password)

---

## Step 4: Add to Environment Variables

### Local Development (`.env.local`):

Create/edit `.env.local` in your project root:

```bash
# Upstash Redis (Phase 34 AI Caching)
UPSTASH_REDIS_REST_URL=https://your-db-name-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AaBbCc...xyz123
```

### Vercel Deployment:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add both variables:

   | Name                       | Value                                   | Environment                      |
   | -------------------------- | --------------------------------------- | -------------------------------- |
   | `UPSTASH_REDIS_REST_URL`   | `https://your-db-name-12345.upstash.io` | Production, Preview, Development |
   | `UPSTASH_REDIS_REST_TOKEN` | `AaBbCc...xyz123`                       | Production, Preview, Development |

3. Click **Save**

4. **Redeploy** your application for changes to take effect

---

## Step 5: Verify Configuration

### Test Caching Locally:

1. Start your dev server:

   ```bash
   npm run dev
   ```

2. Navigate to AI Metrics Dashboard:

   ```
   http://localhost:3000/dev/ai-metrics
   ```

3. Run any AI analysis (Dominus, Vision, Geometry)

4. Check the dashboard:
   - **Cache Status**: Should show "HIT" or "MISS"
   - **Response Time**: Cache hits should be <50ms
   - **Cost Tracking**: Should log $0.00 for cache hits

### Test in Upstash Console:

1. Go to **Upstash Dashboard** → Your Database → **Data Browser**

2. You should see keys like:

   ```
   ai:cache:vision:abc123def456...
   ai:cache:geometry:xyz789...
   ai:cache:analyze:lead:...
   ```

3. Keys should have TTL (Time To Live) set:
   - Image keys: 2592000 seconds (30 days)
   - Text keys: 604800 seconds (7 days)

---

## Step 6: Monitor Usage

### Upstash Dashboard:

1. Go to **Database** → **Metrics** tab
2. Monitor:
   - **Requests per Day**: Should stay under free tier (10K/day)
   - **Storage Used**: Image caching can grow (free tier: 256 MB)
   - **Bandwidth**: REST API usage

### PreLoss Vision Dashboard:

1. Navigate to `/dev/ai-metrics`
2. Track:
   - **Cache Hit Rate**: Target >60% after initial usage
   - **Cost Savings**: $$ saved from cached responses
   - **Performance**: Average response time with caching

---

## Troubleshooting

### Error: "Cannot connect to Redis"

**Symptoms**: AI requests fail with Redis errors

**Solutions**:

1. ✅ Verify environment variables are set correctly
2. ✅ Check REST URL format (must start with `https://`)
3. ✅ Confirm REST Token is complete (no truncation)
4. ✅ Ensure database is **Active** in Upstash console
5. ✅ Redeploy after adding environment variables

### Error: "Rate limit exceeded"

**Symptoms**: Caching stops working after high usage

**Solutions**:

1. ✅ Check Upstash dashboard for free tier limits
2. ✅ Upgrade to Pro tier if needed ($10/month for 1M requests)
3. ✅ Reduce cache TTL to save storage (edit `lib/cache.ts`)

### Cache Hit Rate Too Low (<40%)

**Symptoms**: Not seeing cost savings

**Solutions**:

1. ✅ Wait 24-48 hours for cache to populate
2. ✅ Verify cache keys are consistent (check `/dev/ai-metrics`)
3. ✅ Ensure same orgId is used across requests
4. ✅ Check if cache eviction is happening (storage full)

### Slow Performance Despite Caching

**Symptoms**: Cache hits still take >500ms

**Solutions**:

1. ✅ Select **same region** for Upstash and Vercel deployment
2. ✅ Consider upgrading to **Global** database (auto-replication)
3. ✅ Check network latency in Upstash metrics
4. ✅ Verify TLS is enabled (required for security)

---

## Cost Optimization Tips

### Free Tier Limits:

- **10K commands/day** (enough for ~500-1000 AI requests with cache hits)
- **256 MB storage** (holds ~100-200 cached image analyses)
- **Bandwidth**: Usually not a concern with REST API

### Upgrade When:

- You exceed 10K commands/day consistently
- Storage fills up (256 MB)
- Need global replication for multi-region users

### Pro Tier ($10/month):

- **1M commands/day**
- **1 GB storage**
- **Unlimited bandwidth**
- **Global replication**

### Cost Savings Analysis:

- **Without caching**: $0.10 per vision analysis × 100 images = $10/day
- **With 60% cache hits**: $0.10 × 40 images = $4/day
- **Monthly savings**: $180 (pays for Upstash Pro 18x over)

---

## Advanced Configuration

### Custom Cache TTLs:

Edit `lib/cache.ts` to adjust cache durations:

```typescript
// Default TTLs
const DEFAULT_CACHE_TTL = 7 * 24 * 60 * 60; // 7 days for text AI
const IMAGE_CACHE_TTL = 30 * 24 * 60 * 60; // 30 days for images

// Reduce for faster content updates:
const AGGRESSIVE_TTL = 1 * 24 * 60 * 60; // 1 day

// Increase for rarely changing data:
const LONG_TERM_TTL = 90 * 24 * 60 * 60; // 90 days
```

### Enable Cache Compression:

For large responses, enable compression in `lib/cache.ts`:

```typescript
import pako from "pako";

// Before storing
const compressed = pako.deflate(JSON.stringify(data));
await redis.set(key, compressed, { ex: ttl });

// When retrieving
const compressed = await redis.get(key);
const decompressed = pako.inflate(compressed, { to: "string" });
return JSON.parse(decompressed);
```

### Multi-Region Setup:

For global users, upgrade to Global database:

1. Go to Upstash → Database → **Settings**
2. Click **Upgrade to Global**
3. Select additional regions (auto-replication)
4. Cost: +$0.20 per region per day

---

## Security Best Practices

### Never Commit Secrets:

```bash
# Add to .gitignore
.env.local
.env
```

### Rotate Tokens Regularly:

1. Upstash Dashboard → Database → **Settings** → **Regenerate Token**
2. Update environment variables in Vercel
3. Redeploy application

### Use Read-Only Tokens (Optional):

1. Create separate token for monitoring
2. Restrict permissions in Upstash settings
3. Use for non-production environments

---

## Support Resources

### Upstash Documentation:

- **Docs**: https://docs.upstash.com/redis
- **REST API**: https://docs.upstash.com/redis/features/restapi
- **Pricing**: https://upstash.com/pricing

### PreLoss Vision Support:

- **AI Metrics Dashboard**: `/dev/ai-metrics`
- **Cache Implementation**: `lib/cache.ts`
- **Performance Wrapper**: `lib/perf.ts`

### Get Help:

- **Upstash Discord**: https://discord.gg/upstash
- **Vercel Support**: https://vercel.com/support
- **GitHub Issues**: Open an issue in PreLoss Vision repo

---

## Checklist

Before marking this task complete:

- [ ] Created Upstash account
- [ ] Created Redis database (regional or global)
- [ ] Copied REST_URL and REST_TOKEN
- [ ] Added environment variables to `.env.local`
- [ ] Added environment variables to Vercel
- [ ] Redeployed application
- [ ] Verified caching works in `/dev/ai-metrics`
- [ ] Saw cache keys in Upstash Data Browser
- [ ] Cache hit rate >0% after first requests
- [ ] No Redis connection errors in logs

---

**Status**: Once complete, Phase 34 AI caching is fully operational! 🎉

**Next**: Phase 35-37 UI integrations (streaming, vision, geometry panels)

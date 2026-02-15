# 🔐 Environment Variables Required

## Phase 38-40 Dependencies

### Required for Rate Limiting (NEW)

```bash
# Upstash Redis (for distributed rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**How to get these:**

1. Sign up at https://upstash.com
2. Create a new Redis database
3. Copy the REST URL and token from the dashboard
4. Add to `.env.local` for development
5. Add to Vercel environment variables for production

**Note**: Rate limiting gracefully degrades if these are not set (development mode). In production, these should always be configured.

---

## Complete Environment Variables Checklist

### Authentication

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Database

```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

### AI & External APIs

```bash
OPENAI_API_KEY=sk-proj-...
```

### Storage

```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Analytics (Optional)

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Rate Limiting (NEW - Required for Production)

```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Application

```bash
NEXT_PUBLIC_APP_URL=https://skaiscrape.com
NODE_ENV=production
```

---

## Development vs Production

### Development (.env.local)

- Use Clerk test keys (pk*test*_, sk*test*_)
- Use development database
- Rate limiting optional (gracefully degrades)
- PostHog optional

### Staging

- Use Clerk test keys
- Use staging database
- **Rate limiting REQUIRED**
- PostHog recommended

### Production

- Use Clerk live keys (pk*live*_, sk*live*_)
- Use production database
- **Rate limiting REQUIRED**
- **PostHog REQUIRED**
- All variables must be set

---

## Security Notes

1. **Never commit .env files** - already in .gitignore
2. **Rotate keys regularly** - especially after team changes
3. **Use different keys per environment** - never share prod keys with dev
4. **Monitor Upstash usage** - free tier has limits
5. **Review Supabase bucket policies** - ensure signed URLs only

---

## Verification Commands

```bash
# Check all required variables are set
node -e "console.log({
  clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  db: !!process.env.DATABASE_URL,
  openai: !!process.env.OPENAI_API_KEY,
  supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  redis: !!process.env.UPSTASH_REDIS_REST_URL,
})"

# Test Redis connection (if configured)
curl -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
  "$UPSTASH_REDIS_REST_URL/ping"
```

---

**Updated**: November 17, 2025  
**Changes**: Added Upstash Redis variables for rate limiting

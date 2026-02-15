# Netlify Deployment Guide

## Quick Setup (5 minutes)

### 1. Connect GitHub to Netlify

1. Sign in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select your ClearSKai repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: (leave empty)
6. Click "Deploy site"

### 2. Configure Environment Variables

Go to: **Site Settings → Environment Variables → Add a variable**

Add these variables **exactly as shown**:

#### Required Variables

```
VITE_SITE_NAME=ClearSKai
VITE_SITE_TAGLINE=AI Inspection • Claims • Pre-Loss Mapping
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_FACEBOOK_PIXEL_ID=1134366078840350
VITE_ENV=production
```

#### Optional Variables

```
VITE_STATUS_ENABLED=true
VITE_DEBUG_MODE=false
```

#### Server-Only Variables (M2 - JE Shaw Integration)

**Add these WITHOUT the VITE\_ prefix** (keeps them secret from browser):

```
JE_SHAW_API_URL=https://api.jeshaw.example/v1
JE_SHAW_API_TOKEN=to-be-provided-by-jeshaw
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Trigger Deployment

After adding variables:

1. Click **"Save"**
2. Go to **Deploys** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Wait 1-2 minutes for build to complete

### 4. Verify Deployment

Once deployed, visit:

```
https://your-site-name.netlify.app/status-check
```

**Check that:**

- ✅ Environment section shows "Present" for all Supabase variables
- ✅ Auth status displays correctly
- ✅ All route links work
- ✅ CTAs navigate to correct pages

### 5. Custom Domain (Optional)

1. Go to **Site Settings → Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `clearskai.ai`)
4. Follow DNS configuration instructions
5. SSL certificate will auto-provision in ~24 hours

## Troubleshooting

### Build Fails

**Error: "Command failed with exit code 1"**

- Check that `package.json` has correct build script
- Ensure all dependencies are in `package.json` (not just `package-lock.json`)
- Review build logs for specific errors

**TypeScript Errors**

- Run `npm run build` locally first to catch errors
- Fix type errors before pushing to GitHub

### Environment Variables Not Working

**Variables not appearing in app:**

- Ensure variable names start with `VITE_` (for client-side access)
- Redeploy after adding/changing variables
- Clear browser cache or test in incognito mode

**Server-side variables (Edge Functions) not working:**

- Do NOT prefix with `VITE_` (keeps them secret)
- Ensure function is configured in `supabase/config.toml`
- Check function logs for errors

### Routes Return 404

Add this file to fix client-side routing:

**public/\_redirects**

```
/*    /index.html   200
```

### Supabase Connection Issues

1. Verify Supabase URL is correct:
   - Should look like: `https://abcd1234.supabase.co`
   - No trailing slash
2. Check anon key is the **publishable key**, not service role key
3. Test locally with same credentials first

## Performance Optimization

### Enable Build Plugins

1. Go to **Site Settings → Build & deploy → Build plugins**
2. Enable recommended plugins:
   - **Next.js Cache** (if using Next.js in future)
   - **Lighthouse** (automatic performance checks)

### Asset Optimization

Netlify automatically optimizes:

- ✅ Image compression
- ✅ CSS/JS minification
- ✅ Brotli compression
- ✅ HTTP/2 push

### Edge Functions (Coming in M2)

When you add JE Shaw sync:

1. Edge Functions will auto-deploy from `supabase/functions/`
2. Access at: `https://your-site.netlify.app/.netlify/functions/function-name`
3. No additional config needed

## Monitoring

### Deploy Notifications

Set up Slack/Email notifications:

1. **Site Settings → Build & deploy → Deploy notifications**
2. Add webhook or email for:
   - Deploy started
   - Deploy succeeded
   - Deploy failed

### Analytics

View built-in analytics:

- **Analytics** tab in Netlify dashboard
- Shows: Page views, unique visitors, bandwidth
- Upgrade to Pro for detailed analytics

## Security Headers

Add to `netlify.toml` for enhanced security:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Next Steps for M2

Once JE Shaw API credentials are provided:

1. Add `JE_SHAW_API_URL` and `JE_SHAW_API_TOKEN` to Netlify env vars
2. Deploy Edge Function for sync (`/je-sync`)
3. Test admin "Sync Now" button
4. Verify "Load from JE Shaw" in Workbench

---

**Need Help?**

- [Netlify Docs](https://docs.netlify.com)
- [Supabase + Netlify Guide](https://supabase.com/docs/guides/hosting/netlify)
- [Lovable + Netlify](https://docs.lovable.dev)

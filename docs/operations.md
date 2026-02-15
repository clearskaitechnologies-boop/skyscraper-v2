# Operations Guide

This document provides deployment and troubleshooting information for the PreLoss Vision application.

## Storage Configuration

The application supports a degraded mode where Firebase Storage is not yet available. This allows the app to run gracefully while billing verification is pending.

### Storage Modes

#### Degraded Mode (Default)

- **Environment**: `STORAGE_ENABLED=false`
- **Behavior**: Uploads are disabled, UI shows appropriate messaging
- **Use Case**: Initial deployment before Firebase Storage bucket is created

#### Full Storage Mode

- **Environment**: `STORAGE_ENABLED=true`
- **Behavior**: Full upload functionality with Firebase Storage
- **Requirements**: Firebase Storage bucket must exist and be accessible

### Enabling Storage

1. **Create Firebase Storage Bucket**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project "skaiscraper"
   - Navigate to Storage → Get Started
   - Choose "Start in test mode" for development
   - Select region "us-central1" for best performance
   - Click "Done"

2. **Update Environment Variables**:

   ```bash
   STORAGE_ENABLED=true
   FIREBASE_PROJECT_ID=skaiscraper
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@skaiscraper.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_STORAGE_BUCKET=skaiscraper.appspot.com
   ```

3. **Deploy and Verify**:
   - Restart the application
   - Check `/api/health/storage` endpoint
   - Verify uploads work in the UI

## Required Environment Variables

### Production Deployment

#### Authentication (Clerk)

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### Database (PostgreSQL)

```bash
DATABASE_URL="postgres://user:pass@host:5432/db?sslmode=require&schema=app"
```

#### Firebase Storage

```bash
STORAGE_ENABLED=true
FIREBASE_PROJECT_ID=skaiscraper
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@skaiscraper.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=skaiscraper.appspot.com
```

#### Payment Processing (Stripe)

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### AI/ML Services

```bash
OPENAI_API_KEY=sk-proj-...
```

## Health Endpoints

### Storage Status

- **URL**: `/api/health/storage`
- **Response**:
  ```json
  {
    "enabled": true,
    "ready": true,
    "bucket": "skaiscraper.appspot.com"
  }
  ```

### System Summary

- **URL**: `/api/health/summary`
- **Response**:
  ```json
  {
    "storage": {
      "enabled": true,
      "ready": true,
      "bucket": "skaiscraper.appspot.com"
    },
    "tokens": {
      "remaining": 100
    },
    "versions": {
      "commit": "abc1234",
      "deployment": "vercel"
    },
    "timestamp": "2025-10-29T20:00:00.000Z"
  }
  ```

## Common Issues and Solutions

### Storage Not Ready

**Problem**: `/api/health/storage` returns `"ready": false`

**Causes**:

1. Firebase Storage bucket doesn't exist
2. Incorrect Firebase credentials
3. Network connectivity issues

**Solutions**:

1. Create Firebase Storage bucket (see "Enabling Storage" above)
2. Verify environment variables match Firebase project
3. Check Firebase project billing status

### Upload API Returns 503

**Problem**: Upload requests return HTTP 503 with error codes

**Error Codes**:

#### STORAGE_DISABLED

- **Message**: "Uploads temporarily disabled while billing is verified."
- **Cause**: `STORAGE_ENABLED=false` or missing
- **Solution**: Set `STORAGE_ENABLED=true` after creating bucket

#### STORAGE_NOT_READY

- **Message**: "Storage not ready. Try again later."
- **Cause**: Firebase bucket inaccessible
- **Solution**: Verify bucket exists and credentials are correct

### UI Shows "Uploads Disabled"

**Problem**: Token badge shows warning message, uploads are blocked

**Check**:

1. Visit `/api/health/storage` - should return `enabled: true, ready: true`
2. Verify Firebase Console shows bucket exists
3. Check browser console for network errors

**Solution**: Fix storage configuration as described above

### Token Issues

**Problem**: Users can't upload due to insufficient tokens

**Check**:

1. Visit `/api/org/tokens` to see remaining count
2. Check Stripe billing configuration
3. Verify token purchase flow works

**Solution**:

1. Grant tokens manually via database if needed
2. Fix Stripe integration issues
3. Check billing webhook configuration

## Deployment Checklist

### Pre-Deployment

- [ ] All required environment variables set
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Firebase Storage bucket created (if enabling storage)
- [ ] Stripe webhooks configured
- [ ] DNS and SSL certificates ready

### Post-Deployment

- [ ] Health endpoints return success (`/api/health/summary`)
- [ ] Authentication flow works (sign up/sign in)
- [ ] Upload functionality works (if storage enabled)
- [ ] Billing integration works (token purchases)
- [ ] All major user flows tested

### Monitoring

- [ ] Set up alerts for 5xx errors
- [ ] Monitor storage health endpoint
- [ ] Track upload success rates
- [ ] Monitor token usage patterns

## Support

For technical issues:

1. Check health endpoints first (`/api/health/summary`)
2. Review application logs for error details
3. Verify environment variable configuration
4. Test individual components (auth, storage, billing)

For Firebase Storage issues:

1. Verify bucket exists in Firebase Console
2. Check IAM permissions for service account
3. Ensure billing is enabled for the project
4. Test bucket access with Firebase Admin SDK

#!/bin/bash
# 🚀 PreLoss Vision Deployment Configuration Script
# Run this after setting up your Vercel environment variables

echo "🚀 Setting up PreLoss Vision deployment configuration..."

# Local development environment variables
cat >> .env.local << 'EOF'

# === DEPLOYMENT CONFIGURATION ===
# Local Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Price IDs (these should already be set)
NEXT_PUBLIC_PRICE_STARTER=price_1Q34567890abcdef
NEXT_PUBLIC_PRICE_BUSINESS=price_1Q34567890abcdef  
NEXT_PUBLIC_PRICE_ENTERPRISE=price_1Q34567890abcdef

# Stripe Test Mode Keys (replace with your actual test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret_here

EOF

echo "✅ Local environment updated"

# Production deployment checklist
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# 🚀 PreLoss Vision Production Deployment Checklist

## 1. Vercel Environment Variables
Set these in your Vercel dashboard:

```bash
# Production URLs
NEXT_PUBLIC_APP_URL=https://preloss-vision.vercel.app

# Stripe Test Mode (use test keys for now)
STRIPE_SECRET_KEY=sk_test_your_actual_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret

# Price IDs (update with your actual Stripe price IDs)
NEXT_PUBLIC_PRICE_STARTER=price_your_starter_id
NEXT_PUBLIC_PRICE_BUSINESS=price_your_business_id  
NEXT_PUBLIC_PRICE_ENTERPRISE=price_your_enterprise_id

# Clerk (copy from local .env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (copy from local .env.local)
DATABASE_URL=postgres://...

# Supabase (copy from local .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 2. Stripe Webhook Setup
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. URL: `https://preloss-vision.vercel.app/api/stripe/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
5. Copy the Signing secret → Set as `STRIPE_WEBHOOK_SECRET` in Vercel
6. Redeploy your Vercel app

## 3. Final Acceptance Test
1. Visit `https://preloss-vision.vercel.app/sign-in` → sign in
2. Visit `https://preloss-vision.vercel.app/pricing` → click Upgrade
3. Stripe Checkout opens → Pay with `4242 4242 4242 4242`
4. Should redirect to `/dashboard` (not bounce to `/pricing`)
5. Cancel subscription in Stripe Dashboard
6. Reload `/dashboard` → should redirect to `/pricing`

## 4. Test Webhook Events
```bash
# Install Stripe CLI if not installed
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward events to local dev
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Or test production webhook
stripe listen --forward-to https://preloss-vision.vercel.app/api/stripe/webhook
```

EOF

echo "📋 Created DEPLOYMENT_CHECKLIST.md"

# Create one-click deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying PreLoss Vision..."

# Build and deploy
git add .
git commit -m "feat: add Clerk orgId billing integration"
git push

echo "✅ Pushed to GitHub"
echo "🔄 Vercel will auto-deploy from main branch"
echo "🌐 Check: https://vercel.com/your-username/preloss-vision"
echo "📋 Don't forget to set environment variables in Vercel dashboard!"

EOF

chmod +x deploy.sh

echo "✅ Created deploy.sh script"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Update the price IDs in .env.local with your actual Stripe price IDs"
echo "2. Set environment variables in Vercel dashboard (see DEPLOYMENT_CHECKLIST.md)"
echo "3. Run ./deploy.sh to deploy"
echo "4. Set up Stripe webhook (see DEPLOYMENT_CHECKLIST.md)"
echo "5. Run acceptance test"

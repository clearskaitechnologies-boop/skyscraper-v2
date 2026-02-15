#!/usr/bin/env bash
set -euo pipefail

echo "🔐 Enter your Clerk PRODUCTION keys (from Clerk → Production → API Keys)"
read -rp "  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (pk_live_…): " PK_LIVE
read -rp "  CLERK_SECRET_KEY              (sk_live_…): " SK_LIVE

APP_URL_DEFAULT="https://skaiscrape.com"
read -rp "🌐 NEXT_PUBLIC_APP_URL [${APP_URL_DEFAULT}]: " APP_URL
APP_URL="${APP_URL:-$APP_URL_DEFAULT}"

echo "🧾 Writing .env.production.local snapshot…"
grep -v -E '^(NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|CLERK_SECRET_KEY|NEXT_PUBLIC_APP_URL)=' .env.production.local 2>/dev/null > .env.production.local.tmp || true
{
  echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$PK_LIVE"
  echo "CLERK_SECRET_KEY=$SK_LIVE"
  echo "NEXT_PUBLIC_APP_URL=$APP_URL"
} >> .env.production.local.tmp
mv .env.production.local.tmp .env.production.local
echo "   ✓ .env.production.local updated"

echo "⬆️  Updating Vercel Production env…"
echo "$PK_LIVE" | vercel env rm NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --yes >/dev/null 2>&1 || true
echo "$PK_LIVE" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production >/dev/null
echo "$SK_LIVE" | vercel env rm CLERK_SECRET_KEY production --yes >/dev/null 2>&1 || true
echo "$SK_LIVE" | vercel env add CLERK_SECRET_KEY production >/dev/null
echo "$APP_URL" | vercel env rm NEXT_PUBLIC_APP_URL production --yes >/dev/null 2>&1 || true
echo "$APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production >/dev/null
echo "   ✓ Vercel envs set"

echo "🚀 Deploying to Production…"
vercel deploy --prod --force
echo "   ✓ Deploy kicked"

echo "🩺 Health checks…"
sleep 10
curl -fsS "$APP_URL/api/health/live" | python3 -m json.tool
curl -fsS "$APP_URL/api/health/ready" | python3 -m json.tool || echo "(ready endpoint optional)"

echo "🛡️ Rate-limit quick check (expect some 429s after ~10)…"
for i in {1..15}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health/live")
  printf "%s " "$code"
done
echo

echo "✅ Done. Now test in a private window:"
echo "  $APP_URL/pricing  → prices show 29.99 / 139.99 / 399.99"
echo "  $APP_URL/sign-up  → complete signup (email code)"
echo "  $APP_URL/dashboard → renders (not blank)"

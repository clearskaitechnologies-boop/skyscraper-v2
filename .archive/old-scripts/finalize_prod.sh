#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-https://skaiscrape.com}"

echo "🧭 Using APP_URL: $APP_URL"
echo "⬇️  Pulling Vercel Production env to .env.prod…"
vercel env pull .env.prod --environment=production --yes >/dev/null

# Quick grep helpers
getenv () { grep -E "^$1=" .env.prod | sed -E "s/^$1=//" | tr -d '"' | sed 's/\\n//g'; }

PK="$(getenv NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || true)"
SK="$(getenv CLERK_SECRET_KEY || true)"
REDIS_URL="$(getenv UPSTASH_REDIS_REST_URL || true)"
REDIS_TOKEN="$(getenv UPSTASH_REDIS_REST_TOKEN || true)"

echo "�� Clerk key sanity:"
[[ "$PK" == pk_live_* ]] && echo "   ✓ Publishable key is LIVE ($PK)" || echo "   ⚠️ Publishable key NOT LIVE → $PK"
[[ "$SK" == sk_live_* ]] && echo "   ✓ Secret key is LIVE" || echo "   ⚠️ Secret key NOT LIVE"

echo "🔍 Redis sanity:"
[[ -n "${REDIS_URL}" && -n "${REDIS_TOKEN}" ]] && echo "   ✓ Upstash REST URL & TOKEN present" || echo "   ⚠️ Missing Upstash credentials"

echo "🩺 Health checks…"
curl -fsS "$APP_URL/api/health/live"  | python3 -m json.tool
curl -fsS "$APP_URL/api/health/ready" | python3 -m json.tool || echo "(ready endpoint optional)"

echo "🛡️ Rate-limit probe (expect several 429s after ~10 calls)…"
OUT=""
for i in {1..15}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/health/live")
  OUT="$OUT $code"
  sleep 0.15
done
echo "   Codes:$OUT"

echo "🧪 Smoke-test checklist (open in private window):"
echo "   • $APP_URL/pricing   → shows 29.99 / 139.99 / 399.99"
echo "   • $APP_URL/sign-up   → create account (email code)"
echo "   • $APP_URL/dashboard → renders (not blank)"

echo ""
echo "⚙️  (Optional) Add GitHub Actions secrets via gh CLI (edit REPO):"
cat <<'TIP'

# Make sure: gh auth status
# Replace OWNER/REPO below with your repo slug.
REPO=BuildingWithDamien/PreLossVision

# Pull latest prod env to use as truth:
vercel env pull .env.prod --environment=production --yes

# Set required secrets for CI E2E (add/remove as needed)
gh secret set -R $REPO CLERK_PUBLISHABLE_KEY      -b"$(grep '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' .env.prod | cut -d= -f2- | tr -d '"')"
gh secret set -R $REPO CLERK_SECRET_KEY           -b"$(grep '^CLERK_SECRET_KEY=' .env.prod | cut -d= -f2- | tr -d '"' | sed 's/\\n//g')"
gh secret set -R $REPO NEXT_PUBLIC_APP_URL        -b"https://skaiscrape.com"
gh secret set -R $REPO UPSTASH_REDIS_REST_URL     -b"$(grep '^UPSTASH_REDIS_REST_URL=' .env.prod | cut -d= -f2- | tr -d '"')"
gh secret set -R $REPO UPSTASH_REDIS_REST_TOKEN   -b"$(grep '^UPSTASH_REDIS_REST_TOKEN=' .env.prod | cut -d= -f2- | tr -d '"')"
# Optional if you use these in CI:
# gh secret set -R $REPO SENTRY_AUTH_TOKEN       -b"YOUR_TOKEN"
# gh secret set -R $REPO STRIPE_SECRET_KEY       -b"YOUR_TEST_OR_LIVE_KEY"
TIP

echo ""
echo "🔔 Vercel Alerts (do once in dashboard UI):"
echo "   Project → Settings → Alerts → Add:"
echo "   • Build Failed"
echo "   • 5xx Error Rate Spike"
echo "   • Latency Spike"

echo ""
echo "🏷️  Release tagging (when smoke is green):"
echo "   git pull && git tag v1.1.0 -m 'Production cutover complete' && git push origin v1.1.0"

echo ""
echo "✅ DONE. If Clerk shows LIVE keys, health=ok, and rate-limit returns 429s, you are fully production-ready."

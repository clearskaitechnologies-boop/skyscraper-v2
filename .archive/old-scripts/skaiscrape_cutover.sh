#!/usr/bin/env bash
set -euo pipefail

echo "════════════════════════════════════════════════════"
echo " SKaiScraper • Production Cutover (one-shot)"
echo "════════════════════════════════════════════════════"
echo

#---------- Helpers
need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing $1. Please install and re-run."; exit 1; }; }
add_env () {
  local KEY="$1" VAL="$2" SCOPE="$3" # SCOPE=production|preview|development
  # Add to Vercel envs (non-interactively). Falls back to writing .env.production.local as backup.
  if [[ -n "$VAL" ]]; then
    echo "$VAL" | vercel env add "$KEY" "$SCOPE" >/dev/null 2>&1 || true
  fi
}

#---------- Checks
need vercel
need curl

echo "🔎 Checking Vercel project link…"
vercel link --yes >/dev/null 2>&1 || true
PROJECT=$(vercel project ls 2>/dev/null | sed -n '3p' | awk '{print $1}' || echo "preloss-vision-main")
echo "   → Project: ${PROJECT}"
echo

#---------- Gather current envs (pull snapshot)
echo "📥 Pulling current envs → .env.production.local"
vercel env pull .env.production.local --environment=production --yes >/dev/null 2>&1 || true
touch .env.production.local

# Load existing vars safely (skip complex multi-line ones)
EXISTING_CLERK_PK=$(grep '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' .env.production.local 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "")
EXISTING_CLERK_SK=$(grep '^CLERK_SECRET_KEY=' .env.production.local 2>/dev/null | cut -d= -f2- | tr -d '"' | sed 's/\\n//g' || echo "")
EXISTING_UPSTASH_URL=$(grep '^UPSTASH_REDIS_REST_URL=' .env.production.local 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "")
EXISTING_UPSTASH_TOKEN=$(grep '^UPSTASH_REDIS_REST_TOKEN=' .env.production.local 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "")
EXISTING_PRICE_SOLO=$(grep '^NEXT_PUBLIC_PRICE_SOLO=' .env.production.local 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "prod_TIR6Htq30WtVtw")
EXISTING_PRICE_BUSINESS=$(grep '^NEXT_PUBLIC_PRICE_BUSINESS=' .env.production.local 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "prod_TIR7HuPBr30FoZ")
EXISTING_PRICE_ENTERPRISE=$(grep '^NEXT_PUBLIC_PRICE_ENTERPRISE=' .env.production.local 2>/dev/null | cut -d= -f2- | tr -d '"' || echo "prod_TIR8MBIci5bZB5")

DOMAIN_DEFAULT="https://skaiscrape.com"
read -r -p "🌐 Your production domain [default ${DOMAIN_DEFAULT}]: " APP_DOMAIN
APP_DOMAIN="${APP_DOMAIN:-$DOMAIN_DEFAULT}"

echo
echo "🔐 Clerk keys"
echo "    (Leave blank to KEEP your current dev keys for now)"
read -r -p "   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (pk_live_...): " PK_LIVE
read -r -p "   CLERK_SECRET_KEY              (sk_live_...): " SK_LIVE
PK_LIVE="${PK_LIVE:-${EXISTING_CLERK_PK}}"
SK_LIVE="${SK_LIVE:-${EXISTING_CLERK_SK}}"

echo
echo "🧠 Upstash Redis (needed for rate limiting)"
if [[ -z "${EXISTING_UPSTASH_URL}" || -z "${EXISTING_UPSTASH_TOKEN}" ]]; then
  echo "   If you DON'T have these yet:"
  echo "   1) https://console.upstash.com/ → Redis → Create database"
  echo "   2) Copy REST URL and REST TOKEN"
fi
read -r -p "   UPSTASH_REDIS_REST_URL: " REST_URL_IN
read -r -p "   UPSTASH_REDIS_REST_TOKEN: " REST_TOKEN_IN
REST_URL="${REST_URL_IN:-${EXISTING_UPSTASH_URL}}"
REST_TOKEN="${REST_TOKEN_IN:-${EXISTING_UPSTASH_TOKEN}}"

echo
echo "💳 Pricing sanity (Stripe product IDs - press Enter to keep current):"
read -r -p "   NEXT_PUBLIC_PRICE_SOLO [${EXISTING_PRICE_SOLO}]: " PRICE_SOLO_IN
read -r -p "   NEXT_PUBLIC_PRICE_BUSINESS [${EXISTING_PRICE_BUSINESS}]: " PRICE_BUSINESS_IN
read -r -p "   NEXT_PUBLIC_PRICE_ENTERPRISE [${EXISTING_PRICE_ENTERPRISE}]: " PRICE_ENTERPRISE_IN

PRICE_SOLO="${PRICE_SOLO_IN:-${EXISTING_PRICE_SOLO}}"
PRICE_BUSINESS="${PRICE_BUSINESS_IN:-${EXISTING_PRICE_BUSINESS}}"
PRICE_ENTERPRISE="${PRICE_ENTERPRISE_IN:-${EXISTING_PRICE_ENTERPRISE}}"

echo
echo "🧭 Writing .env.production.local snapshot…"
# Build final .env.production.local (idempotent)
grep -v -E '^(NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|CLERK_SECRET_KEY|UPSTASH_REDIS_REST_URL|UPSTASH_REDIS_REST_TOKEN|NEXT_PUBLIC_PRICE_SOLO|NEXT_PUBLIC_PRICE_BUSINESS|NEXT_PUBLIC_PRICE_ENTERPRISE|NEXT_PUBLIC_APP_URL)=' .env.production.local 2>/dev/null > .env.production.local.tmp || true

{
  echo "NEXT_PUBLIC_APP_URL=${APP_DOMAIN}"
  echo "NEXT_PUBLIC_PRICE_SOLO=${PRICE_SOLO}"
  echo "NEXT_PUBLIC_PRICE_BUSINESS=${PRICE_BUSINESS}"
  echo "NEXT_PUBLIC_PRICE_ENTERPRISE=${PRICE_ENTERPRISE}"
} >> .env.production.local.tmp

if [[ -n "${REST_URL:-}" ]]; then echo "UPSTASH_REDIS_REST_URL=${REST_URL}" >> .env.production.local.tmp; fi
if [[ -n "${REST_TOKEN:-}" ]]; then echo "UPSTASH_REDIS_REST_TOKEN=${REST_TOKEN}" >> .env.production.local.tmp; fi

# Only set live keys if provided (lets you keep dev keys today)
if [[ -n "${PK_LIVE:-}" ]]; then echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${PK_LIVE}" >> .env.production.local.tmp; else
  echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}" >> .env.production.local.tmp
fi
if [[ -n "${SK_LIVE:-}" ]]; then echo "CLERK_SECRET_KEY=${SK_LIVE}" >> .env.production.local.tmp; else
  echo "CLERK_SECRET_KEY=${CLERK_SECRET_KEY:-}" >> .env.production.local.tmp
fi

mv .env.production.local.tmp .env.production.local
echo "   ✓ .env.production.local updated"

echo
echo "⬆️  Pushing env vars to Vercel (Production)…"
add_env "NEXT_PUBLIC_APP_URL"          "${APP_DOMAIN}" production
add_env "NEXT_PUBLIC_PRICE_SOLO"      "${PRICE_SOLO}" production
add_env "NEXT_PUBLIC_PRICE_BUSINESS"  "${PRICE_BUSINESS}" production
add_env "NEXT_PUBLIC_PRICE_ENTERPRISE" "${PRICE_ENTERPRISE}" production
[[ -n "${REST_URL:-}" ]]   && add_env "UPSTASH_REDIS_REST_URL"   "${REST_URL}" production
[[ -n "${REST_TOKEN:-}" ]] && add_env "UPSTASH_REDIS_REST_TOKEN" "${REST_TOKEN}" production
[[ -n "${PK_LIVE:-}" ]]    && add_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "${PK_LIVE}" production
[[ -n "${SK_LIVE:-}" ]]    && add_env "CLERK_SECRET_KEY" "${SK_LIVE}" production
echo "   ✓ Vercel envs added (non-interactive)"

echo
echo "🚀 Deploying to Production…"
vercel deploy --prod --force

echo
echo "🩺 Health checks…"
LIVE_URL="${APP_DOMAIN%/}/api/health/live"
READY_URL="${APP_DOMAIN%/}/api/health/ready"

echo "   GET $LIVE_URL"
curl -fsS "$LIVE_URL" | python3 -m json.tool 2>/dev/null || curl -fsS "$LIVE_URL" || { echo "❌ Live check failed"; exit 1; }
echo "   GET $READY_URL"
curl -fsS "$READY_URL" | python3 -m json.tool 2>/dev/null || curl -fsS "$READY_URL" || echo "   (ready endpoint optional)"

echo
echo "🛡️  Rate-limit smoke test (expect some 429s after ~10 hits)…"
LIMIT_URL="${APP_DOMAIN%/}/api/health/live"
HITS=15 FAILS=0
for i in $(seq 1 $HITS); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$LIMIT_URL")
  [[ "$CODE" -eq "429" ]] && ((FAILS++))
  printf "%s " "$CODE"
done
echo
if [[ $FAILS -gt 0 ]]; then
  echo "   ✓ Rate limiting active (saw $FAILS x 429)"
else
  echo "   ⚠️ No 429s detected. If Upstash was blank, you are on in-memory fallback."
fi

echo
echo "🔏 Clerk redirect sanity — make sure these are set in Production instance:"
cat <<TXT
Allowed origins:
  ${APP_DOMAIN}

Authorized redirect URLs:
  ${APP_DOMAIN}/sign-in
  ${APP_DOMAIN}/sign-up
  ${APP_DOMAIN}/sso-callback   (only if you use SSO)

(Optional) Authorized parties (for middleware/auth):
  ${APP_DOMAIN}
TXT

echo
echo "✅ Cutover script finished."
echo "Next:"
echo " 1) Open ${APP_DOMAIN} in a Private window"
echo " 2) Sign up → Dashboard should render"
echo " 3) Visit ${APP_DOMAIN}/pricing → prices show ${PRICE_SOLO} / ${PRICE_BUSINESS} / ${PRICE_ENTERPRISE}"
echo " 4) In Clerk → switch to *Production instance* → add the URLs above → copy pk_live_ / sk_live_ and re-run script if you left them blank"
echo

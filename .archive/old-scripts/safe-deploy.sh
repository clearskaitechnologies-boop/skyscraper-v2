#!/usr/bin/env bash
set -euo pipefail

echo "=== SKaiScraper: Safe Deploy (no weather key) ==="

# 0) Sanity checks
if ! command -v firebase >/dev/null 2>&1; then
  echo "✗ Firebase CLI not found. Install with: npm i -g firebase-tools"
  exit 1
fi
if ! command -v vercel >/dev/null 2>&1; then
  echo "✗ Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

# 1) Functions — deps, env, deploy
echo "→ Functions: install deps"
pushd functions >/dev/null

# Install required deps (idempotent)
npm i openai axios firebase-admin firebase-functions @google-cloud/storage >/dev/null

# Ensure OPENAI key is set (skip if already present)
if firebase functions:config:get openai 2>/dev/null | grep -q '"key"'; then
  echo "✓ OPENAI key already set in functions config"
else
  echo "⚠ OPENAI key not found in functions config."
  echo "   If needed, run: firebase functions:config:set openai.key=\"YOUR_OPENAI_API_KEY\""
fi

# Explicitly DO NOT set weather.api here (per request)
echo "↪ Skipping weather API key setup (you can add it later)."

# Optional: Vertex endpoint (only if you're using Vertex now)
if firebase functions:config:get vertex 2>/dev/null | grep -q '"endpoint_id"'; then
  echo "✓ Vertex endpoint detected (optional)"
else
  echo "↪ No Vertex endpoint configured (that's fine, OpenAI path is primary)."
fi

# Build (if you have a build script; otherwise this will no-op)
npm run build 2>/dev/null || true

echo "→ Deploying Firebase Functions…"
firebase deploy --only functions

popd >/dev/null

# 2) Frontend — deps, cache hints, build, deploy
echo "→ Frontend: install deps"
# Choose one package manager (npm default)
npm i framer-motion firebase @firebase/app @firebase/functions @firebase/firestore >/dev/null || true

# Add cache bypass hints (only if the file exists and not already present)
HOMEPAGE_FILE="src/app/page.tsx"
if [ -f "$HOMEPAGE_FILE" ]; then
  if ! grep -q "export const dynamic" "$HOMEPAGE_FILE"; then
    echo -e "\nexport const dynamic = 'force-dynamic';" >> "$HOMEPAGE_FILE"
    echo "✓ Injected dynamic='force-dynamic' into ${HOMEPAGE_FILE}"
  fi
  if ! grep -q "export const revalidate" "$HOMEPAGE_FILE"; then
    echo -e "\nexport const revalidate = 0;" >> "$HOMEPAGE_FILE"
    echo "✓ Injected revalidate=0 into ${HOMEPAGE_FILE}"
  fi
else
  echo "↪ ${HOMEPAGE_FILE} not found. If your homepage is elsewhere, ensure it revalidates or is dynamic."
fi

echo "→ Building Next.js app"
npm run build

echo "→ Deploying to Vercel (Production)…"
vercel --prod

echo "✅ Safe deploy complete (without weather key)."
echo "   Live site should now reflect Vendor Catalog, AI Annotation, DOL hooks (stubbed), and Template Designer."

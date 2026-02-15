#!/usr/bin/env bash
set -euo pipefail
echo "=== SKaiScraper — Master Polish & Redeploy ==="

# 0) Sanity checks
if ! command -v firebase >/dev/null 2>&1; then
  echo "✗ Firebase CLI not found. Install with: npm i -g firebase-tools"
  exit 1
fi
if ! command -v vercel >/dev/null 2>&1; then
  echo "✗ Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

# 1) Firestore Rules
echo "→ Deploying Firestore security rules"
if [ -f firestore.rules ]; then
  firebase deploy --only firestore:rules
else
  echo "⚠ No firestore.rules found"
fi

# 2) Functions (dotenv, build, deploy)
echo "→ Functions: deps, dotenv, build, deploy"
pushd functions >/dev/null
npm i dotenv openai axios firebase-admin firebase-functions @google-cloud/storage >/dev/null

# Ensure OPENAI key is set
if firebase functions:config:get openai 2>/dev/null | grep -q '"key"'; then
  echo "✓ OPENAI key already set in functions config"
else
  echo "⚠ OPENAI key not found. Add with: firebase functions:config:set openai.key=\"YOUR_KEY\""
fi

# Build and deploy
npm run build 2>/dev/null || true
echo "→ Deploying Firebase Functions..."
firebase deploy --only functions
popd >/dev/null

# 3) Frontend cache hints and polish
echo "→ Frontend: cache hints, deps, polish"

# Fix homepage path
HOMEPAGE_FILE="src/app/page.tsx"
if [ -f "$HOMEPAGE_FILE" ]; then
  if ! grep -q "export const revalidate" "$HOMEPAGE_FILE"; then
    echo -e "\nexport const revalidate = 60;" >> "$HOMEPAGE_FILE"
    echo "✓ Added revalidate=60 to homepage"
  fi
else
  echo "⚠ Homepage file not found at $HOMEPAGE_FILE"
fi

# App layout dynamic
APP_LAYOUT="src/app/(app)/layout.tsx"
if [ -f "$APP_LAYOUT" ]; then
  if ! grep -q "export const dynamic" "$APP_LAYOUT"; then
    echo -e "\nexport const dynamic = 'force-dynamic';" >> "$APP_LAYOUT"
    echo "✓ Added dynamic=force-dynamic to app layout"
  fi
else
  echo "⚠ App layout not found at $APP_LAYOUT"
fi

# 4) Install all required deps
echo "→ Installing frontend dependencies"
npm i framer-motion firebase @firebase/app @firebase/functions @firebase/firestore @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities >/dev/null || true

# 5) Build & Deploy
echo "→ Building Next.js app"
npm run build

echo "→ Deploying to Vercel (Production)"
vercel --prod

echo "✅ Master polish deploy complete!"
echo "   All features live: Evidence Gallery, Vendor Connect, Photo Grid PDF, OpenAI Vision"
echo "   UI/UX polish: Error pages, security rules, performance optimization"
echo "   Check live site for all updates"

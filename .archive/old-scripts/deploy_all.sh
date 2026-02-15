#!/usr/bin/env bash
set -euo pipefail

echo "📦 STAGING ALL CHANGES FOR COMMIT…"
git add .

read -rp "📝 Commit message (default: 'Production activation + key swap + Upstash live'): " MSG
MSG="${MSG:-Production activation + key swap + Upstash live}"

echo "💾 COMMITTING…"
git commit -m "$MSG" || echo "⚠️ Nothing to commit (maybe already clean)"

echo "⬆️ PUSHING TO GITHUB MAIN…"
git push origin main

echo "🚀 DEPLOYING TO VERCEL PRODUCTION…"
vercel deploy --prod --force

echo ""
echo "✅ GIT + VERCEL DEPLOY COMPLETE"
echo "-----------------------------------------"
echo "🔍 Next steps:"
echo "1. Wait 60–90 seconds for deploy to finish"
echo "2. Open https://skaiscrape.com in private window"
echo "3. Test: Pricing → Sign Up → Dashboard"
echo "4. Reply here:  ✅ DEPLOY VERIFIED"
echo ""
echo "When confirmed, I will:"
echo " - Enable 3 Vercel Alerts"
echo " - Add 7 GitHub Action Secrets"
echo " - Run final rate limit test"
echo " - Tag v1.1.0 release"
echo ""
echo "🔥 You are inches from public launch."

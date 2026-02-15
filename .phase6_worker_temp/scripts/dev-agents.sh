#!/usr/bin/env bash
set -euo pipefail
export NODE_OPTIONS="--max-old-space-size=4096"
echo "Starting Next.js dev AND Agent Worker…"
# Start Next in background
pnpm dev &
NEXT_PID=$!
# Start worker
pnpm agent:worker
# Forward exit
kill $NEXT_PID 2>/dev/null || true

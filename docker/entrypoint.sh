#!/usr/bin/env bash
set -e

# Defensively clear NODE_OPTIONS to avoid deprecated loader flags
unset NODE_OPTIONS

echo "→ Prisma migrate deploy"
pnpm prisma migrate deploy || true

echo "→ Starting worker"
exec pnpm start

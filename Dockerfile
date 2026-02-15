ARG NODE_VERSION=22.12.0
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app

# Minimal OS deps (git needed for some postinstall scripts)
RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates git openssl \
  && rm -rf /var/lib/apt/lists/*

# Enable pnpm via Corepack (bundled with Node 20)
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# ---- Copy manifests + pnpm hook files first (cache-friendly) ----
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY .pnpmfile.cjs .npmrc ./
# Copy Prisma schema early so postinstall can generate client
COPY prisma ./prisma

# Install WITH devDependencies so postinstall can run prisma generate
ENV NODE_ENV=development

# Verbose diagnostics before install
RUN node -v && pnpm -v && echo "=== ENV VARS (redacted) ===" && printenv | sort | sed -e 's/=.*$/=<redacted>/' | head -40

# Install with verbose logging to surface any errors
RUN PNPM_LOG_LEVEL=debug pnpm install --frozen-lockfile || (echo "=== PNPM DEBUG LOG ===" && cat /root/.pnpm-debug.log 2>/dev/null && exit 1)

# ---- Now copy the rest of the sources ----
COPY . .

# Copy entrypoint script and make it executable
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Use production at runtime
ENV NODE_ENV=production

# Start the worker via entrypoint (runs Prisma migrate first)
CMD ["/app/entrypoint.sh"]

# --- Build stage to verify Next.js production build under Node 22 ---
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app /app
WORKDIR /app
# Reuse installed node_modules from deps stage; run build to confirm compatibility
ENV NODE_ENV=production
RUN node -v && pnpm -v && pnpm build || (echo "=== BUILD FAILED UNDER NODE ${NODE_VERSION} ===" && exit 1)

# --- Final runtime stage (still Node 22) ---
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app
COPY --from=deps /app /app
ENV NODE_ENV=production
CMD ["/app/entrypoint.sh"]

# Phase 6 Worker Quickstart

## Add to package.json

```json
{
  "scripts": {
    "agent:worker": "tsx scripts/agentWorker.ts",
    "dev:agents": "bash scripts/dev-agents.sh"
  },
  "devDependencies": {
    "tsx": "^4.19.0"
  }
}
```

## Install deps

```bash
pnpm add -D tsx
```

## Env

Ensure `REDIS_URL` is set in `.env.local` or environment.

## Run

```bash
pnpm dev:agents
```

## Prod (PM2 example)

```bash
pnpm build
pm2 start --name skai-agent-worker --interpreter node -- node --loader tsx scripts/agentWorker.ts
```

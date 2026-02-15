// Unified API wrappers: use Upstash singleton to avoid creating multiple REST clients.
import * as Sentry from '@sentry/nextjs';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';
import { upstash } from '@/lib/upstash';

// Create limiter only if Redis is configured; otherwise use a no-op fallback
const limiter: Ratelimit | null = upstash
  ? new Ratelimit({ redis: upstash, limiter: Ratelimit.slidingWindow(20, '1 m') })
  : null;

export type ApiHandler = (req: NextRequest, ctx: any) => Promise<Response>;

export function withSentryApi(handler: ApiHandler): ApiHandler {
  return async (req, ctx) => {
    try { return await handler(req, ctx); } catch (err: any) {
      Sentry.captureException(err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  };
}

export function withRateLimit(handler: ApiHandler): ApiHandler {
  return async (req, ctx) => {
    // If limiter not available, fail open
    if (!limiter) {
      return handler(req, ctx);
    }
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    try {
      const { success, reset, remaining } = await limiter.limit(ip);
      if (!success) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
      }
      const res = await handler(req, ctx);
      res.headers.set('x-ratelimit-remaining', remaining.toString());
      res.headers.set('x-ratelimit-reset', reset.toString());
      return res;
    } catch (e) {
      // Fail open if rate limiter errors
      return handler(req, ctx);
    }
  };
}

export async function resolveAuthOrg(req: NextRequest) {
  // Placeholder: integrate Clerk. For now header-based.
  const orgId = req.headers.get('x-org-id');
  const userId = req.headers.get('x-user-id');
  if (!orgId) throw new Error('ORG_CONTEXT_MISSING');
  return { orgId, userId: userId || 'system' };
}

export function withOrgScope(handler: ApiHandler): ApiHandler {
  return async (req, ctx) => {
    const auth = await resolveAuthOrg(req);
    return handler(req, { ...ctx, auth });
  };
}

export function safeAuth(handler: ApiHandler): ApiHandler {
  return async (req, ctx) => {
    try { return await handler(req, ctx); } catch (e: any) {
      if (e.message === 'ORG_CONTEXT_MISSING') {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
      throw e;
    }
  };
}

export function compose(...layers: ((h: ApiHandler) => ApiHandler)[]): (h: ApiHandler) => ApiHandler {
  return (h: ApiHandler) => layers.reduceRight((acc, layer) => layer(acc), h);
}

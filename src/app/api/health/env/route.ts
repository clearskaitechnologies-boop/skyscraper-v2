import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

// src/app/api/health/env/route.ts

export async function GET() {
  // DB connectivity
  let dbConnected = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  // Env presence (booleans only; never secrets)
  const envPresent = (k: string) => Boolean(process.env[k]);

  const payload = {
    ok: true,
    env: {
      dbConnected,
      clerk: {
        publishableKeyPresent:
          envPresent("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") || envPresent("CLERK_PUBLISHABLE_KEY"),
        secretKeyPresent: envPresent("CLERK_SECRET_KEY"),
      },
      mapboxTokenPresent: envPresent("NEXT_PUBLIC_MAPBOX_TOKEN"),
      stripePresent: envPresent("STRIPE_SECRET_KEY"),
    },
    build: {
      sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || null,
      nodeEnv: process.env.NODE_ENV || null,
    },
  };

  return NextResponse.json(payload);
}

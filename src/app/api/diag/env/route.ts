export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const mask = (v?: string | null) => (v ? true : false);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    // Core Services
    DATABASE_URL: mask(process.env.DATABASE_URL),
    OPENAI_API_KEY: mask(process.env.OPENAI_API_KEY),

    // Weather APIs (check all possible names)
    WEATHERSTACK_API_KEY: mask(process.env.WEATHERSTACK_API_KEY),
    WEATHER_STACK_API_KEY: mask(process.env.WEATHER_STACK_API_KEY),
    VISUALCROSSING_API_KEY: mask(process.env.VISUALCROSSING_API_KEY),
    VISUAL_CROSSING_API_KEY: mask(process.env.VISUAL_CROSSING_API_KEY),

    // AI Services
    REPLICATE_API_TOKEN: mask(process.env.REPLICATE_API_TOKEN),

    // Maps
    MAPBOX_ACCESS_TOKEN: mask(process.env.MAPBOX_ACCESS_TOKEN),
    NEXT_PUBLIC_MAPBOX_TOKEN: mask(process.env.NEXT_PUBLIC_MAPBOX_TOKEN),

    // Clerk variables
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: mask(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    CLERK_SECRET_KEY: mask(process.env.CLERK_SECRET_KEY),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: mask(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: mask(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: mask(process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL),
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: mask(process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL),

    // Storage
    FIREBASE_STORAGE_BUCKET: mask(process.env.FIREBASE_STORAGE_BUCKET),
    SUPABASE_SERVICE_ROLE_KEY: mask(process.env.SUPABASE_SERVICE_ROLE_KEY),

    // Payments
    STRIPE_SECRET_KEY: mask(process.env.STRIPE_SECRET_KEY),

    // Email
    RESEND_API_KEY: mask(process.env.RESEND_API_KEY),

    // Redis
    REDIS_URL: mask(process.env.REDIS_URL),
    UPSTASH_REDIS_REST_URL: mask(process.env.UPSTASH_REDIS_REST_URL),

    // Environment info
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV, // "production" | "preview" | "development"
    VERCEL: process.env.VERCEL, // true when on Vercel

    // Additional Clerk vars that might be set
    VITE_CLERK_PUBLISHABLE_KEY: mask(process.env.VITE_CLERK_PUBLISHABLE_KEY),
    CLERK_PUBLISHABLE_KEY: mask(process.env.CLERK_PUBLISHABLE_KEY),
  });
}

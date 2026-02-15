/**
 * System Truth Endpoint - Single source of truth for production health
 * GET /api/system/truth
 */

import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || "development",
  };

  // 1. Database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.dbOk = true;
  } catch (error) {
    results.dbOk = false;
    results.dbError = error instanceof Error ? error.message : "Unknown error";
  }

  // 2. Published templates count
  try {
    const count = await prisma.template.count({
      where: { isPublished: true },
    });
    results.templatesCountPublished = count;
  } catch (error) {
    results.templatesCountPublished = null;
    results.templatesError = error instanceof Error ? error.message : "Unknown error";
  }

  // 2b. OrgTemplate count (company template instances)
  try {
    const orgTemplateCount = await prisma.orgTemplate.count();
    results.orgTemplateCount = orgTemplateCount;
  } catch (error) {
    results.orgTemplateCount = null;
  }

  // 3. Supabase configuration
  results.supabaseOk = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  // 4. Storage bucket configuration
  results.bucketTemplatesOk = !!(
    process.env.SUPABASE_STORAGE_BUCKET_TEMPLATES ||
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_TEMPLATES
  );
  results.bucketExportsOk = !!(
    process.env.SUPABASE_STORAGE_BUCKET_EXPORTS ||
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_EXPORTS
  );
  results.bucketUploadsOk = !!(
    process.env.SUPABASE_STORAGE_BUCKET_UPLOADS ||
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_UPLOADS
  );

  // 5. AI/OpenAI key present
  results.aiKeyPresent = !!process.env.OPENAI_API_KEY;

  // 6. Mapbox token present
  results.mapboxKeyPresent = !!(
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  );

  // 7. Build info
  results.buildId = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "local";
  results.gitSha = process.env.VERCEL_GIT_COMMIT_SHA || null;

  // 8. Response time
  results.responseTimeMs = Date.now() - startTime;

  // Overall health
  results.healthy = results.dbOk && results.templatesCountPublished >= 0;

  return NextResponse.json(results, {
    status: results.healthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, must-revalidate",
      "Content-Type": "application/json",
    },
  });
}

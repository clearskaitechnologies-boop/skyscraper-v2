import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { supabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    runtime: process.env.VERCEL ? "vercel" : "local",
    domainOk: !process.env.NEXT_PUBLIC_BASE_URL?.includes("skaiscraper"),
    dbOk: false,
    supabaseOk: false,
    templatesBucketWritable: false,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    errors: [] as string[],
  };

  // Domain check
  if (!results.domainOk) {
    results.errors.push(
      "❌ Domain typo: NEXT_PUBLIC_BASE_URL contains 'skaiscraper' instead of 'skaiscrape'"
    );
  }

  // Test 1: Database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.dbOk = true;
  } catch (error) {
    results.errors.push(`DB: ${error instanceof Error ? error.message : "Connection failed"}`);
  }

  // Test 2: Supabase connection
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    results.supabaseOk = true;
  } catch (error) {
    results.errors.push(
      `Supabase: ${error instanceof Error ? error.message : "Connection failed"}`
    );
  }

  // Test 3: Storage buckets accessible
  const bucketsToCheck = [
    process.env.SUPABASE_STORAGE_BUCKET_TEMPLATES || "templates",
    process.env.SUPABASE_STORAGE_BUCKET_EXPORTS || "exports",
    process.env.SUPABASE_STORAGE_BUCKET_UPLOADS || "uploads",
  ];

  try {
    const supabase = supabaseServer();
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET_TEMPLATES || "templates";

    // Try a tiny test upload
    const testContent = new Uint8Array([1, 2, 3]);
    const testPath = `health-check/${Date.now()}.txt`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testContent, {
        upsert: true,
        contentType: "text/plain",
      });

    if (uploadError) throw uploadError;

    // Clean up test file
    await supabase.storage.from(bucketName).remove([testPath]);

    results.templatesBucketWritable = true;
  } catch (error) {
    results.errors.push(`Bucket write: ${error instanceof Error ? error.message : "Failed"}`);
  }

  const allHealthy = results.dbOk && results.supabaseOk && results.templatesBucketWritable;

  return NextResponse.json(
    {
      ok: allHealthy,
      status: allHealthy ? "healthy" : "degraded",
      ...results,
    },
    { status: allHealthy ? 200 : 503 }
  );
}

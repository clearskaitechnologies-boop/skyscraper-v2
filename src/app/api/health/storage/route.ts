export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

import { assertStorageReady, getStorageConfig,isStorageEnabled } from "@/lib/storage";

export async function GET() {
  try {
    const storageStatus = await assertStorageReady();

    return NextResponse.json(storageStatus);
  } catch (error) {
    // Never throw - return degraded state information
    console.error("Storage health check failed:", error);

    return NextResponse.json({
      enabled: false,
      ready: false,
      error: "Health check failed",
    });
  }
}

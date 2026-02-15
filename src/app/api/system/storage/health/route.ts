import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";

// Minimal health check: verifies org resolution and signed upload URL creation per bucket
// (No actual upload performed)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BucketCheck = {
  name: string;
  ok: boolean;
  error?: string;
};

async function checkBucketSignedUrl(bucket: string): Promise<BucketCheck> {
  try {
    // Lazily import storage helper to avoid heavy deps when unused
    const { createSignedUploadUrl } = await import("@/lib/storage/supabase-client");
    // Attempt to create a signed URL for a tiny file path
    const storageKey = `health/${Date.now()}-probe.txt`;
    const url = await createSignedUploadUrl(bucket, storageKey, {
      contentType: "text/plain",
      expiresIn: 60,
    });
    return { name: bucket, ok: Boolean(url) };
  } catch (e: any) {
    return { name: bucket, ok: false, error: e?.message || "signed url error" };
  }
}

export async function GET() {
  const a = await auth();

  const base: any = {
    ok: true,
    signedIn: Boolean(a.userId),
    auth: { userId: a.userId || null },
    org: {},
    buckets: {} as Record<string, BucketCheck>,
  };

  try {
    const ctx = await getActiveOrgContext({ optional: true });
    if (ctx.ok) {
      base.org = { ok: true, orgId: ctx.orgId };
    } else {
      base.org = { ok: false, reason: ctx.reason };
    }

    const bucketNames = ["photos", "documents", "evidence", "reports", "templates", "exports"];
    const checks = await Promise.all(bucketNames.map((b) => checkBucketSignedUrl(b)));
    for (const c of checks) {
      base.buckets[c.name] = c;
    }

    return NextResponse.json(base);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}

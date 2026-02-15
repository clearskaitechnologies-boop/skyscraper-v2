export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

/**
 * Body: { claim_id: string, include: { photos?: boolean, pdf?: boolean, weather?: boolean, codes?: boolean } }
 * Returns: { url: string } — a signed/public URL to the ZIP
 *
 * Implementation roadmap:
 * 1. Install jszip: pnpm add jszip
 * 2. Gather assets from Cloudflare R2 using existing storage utilities
 * 3. Create ZIP in memory using jszip
 * 4. Upload to R2 with public access or signed URL
 * 5. Return download link
 */
export async function POST(req: Request) {
  const { claimId, include = {} } = await req.json();
  if (!claimId) return NextResponse.json({ error: "Missing claimId" }, { status: 400 });

  // Production implementation requires:
  // - jszip package for archive creation
  // - Integration with existing R2 storage (see /src/lib/storage-docs.ts)
  // - Asset gathering from documents table by claimId
  const url = "/api/health"; // placeholder - implement with jszip when needed
  return NextResponse.json({ url });
}

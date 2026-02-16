import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { validatePortalToken } from "@/lib/portalAuth";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });
    const resolved = await validatePortalToken(token);
    if (!resolved) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    // Return claimId only — do not expose full client record (PII)
    return NextResponse.json({ claimId: resolved.claimId });
  } catch (error) {
    console.error("[resolve-token] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

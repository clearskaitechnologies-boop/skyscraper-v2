import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Light test - check if Firebase env vars are configured
    const hasFirebase = !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_STORAGE_BUCKET);

    return NextResponse.json({
      ok: hasFirebase,
      storage: hasFirebase ? "configured" : "not_configured",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[STORAGE HEALTH ERROR]", error);
    return NextResponse.json(
      { ok: false, storage: "error", error: error.message },
      { status: 500 }
    );
  }
}

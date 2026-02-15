import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasReplicate = !!process.env.REPLICATE_API_TOKEN;
  const hasFirebase = !!process.env.FIREBASE_PROJECT_ID;

  // ⚠️ We DO NOT call the real APIs here to avoid cost on each ping.
  // Just report readiness.
  return NextResponse.json({
    ok: hasOpenAI || hasReplicate,
    providers: {
      openai: {
        configured: hasOpenAI,
        status: hasOpenAI ? "ready" : "not_configured",
      },
      replicate: {
        configured: hasReplicate,
        status: hasReplicate ? "ready" : "not_configured",
      },
      firebase: {
        configured: hasFirebase,
        status: hasFirebase ? "ready" : "not_configured",
      },
    },
    timestamp: new Date().toISOString(),
  });
}

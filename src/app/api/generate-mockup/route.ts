export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";

import { makeMockupBrief } from "@/lib/ai";
import { trackAiUsage } from "@/lib/ai/trackUsage";
import { getCurrentUserPermissions } from "@/lib/permissions";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
    });

  const { orgId } = await getCurrentUserPermissions();
  if (!orgId) {
    return new Response(JSON.stringify({ error: "Organization not found" }), {
      status: 404,
    });
  }

  const body = await req.json().catch(() => ({}));
  const context = body?.context ?? "SkaiScraper dashboard hero section with tokens and map panel.";

  try {
    const brief = await makeMockupBrief(context);

    // Track AI usage
    await trackAiUsage({
      orgId,
      feature: "mockup_generator",
      tokens: 1500,
      metadata: { context: context.substring(0, 100) },
    });

    return new Response(JSON.stringify({ data: { type: "mockup-brief", brief } }), { status: 200 });
  } catch (error) {
    console.error("[GENERATE-MOCKUP] Error:", error);
    return new Response(JSON.stringify({ error: "Mockup generation failed" }), { status: 500 });
  }
}

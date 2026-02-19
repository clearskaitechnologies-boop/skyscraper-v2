import { NextResponse } from "next/server";

import { requireApiAuth } from "@/lib/auth/apiAuth";
import { withSentryApi } from "@/lib/monitoring/sentryApi";

export const GET = withSentryApi(async () => {
  // Use unified auth helper instead of direct auth() call
  const authResult = await requireApiAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;
  // Placeholder metrics (wire to BullMQ / pg-boss later)
  return NextResponse.json({
    queues: [{ name: "uploads", depth: 0, stalled: 0 }],
    generatedAt: new Date().toISOString(),
  });
});

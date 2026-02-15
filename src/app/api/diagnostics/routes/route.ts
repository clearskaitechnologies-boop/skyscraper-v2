import { NextResponse } from "next/server";

import { collectRoutes } from "@/lib/diagnostics/routes";

export const runtime = "nodejs";

export async function GET() {
  const inventory = collectRoutes();
  return NextResponse.json({
    status: "ok",
    inventory,
  });
}

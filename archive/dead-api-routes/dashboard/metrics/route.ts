import { NextResponse } from "next/server";
import os from "os";

import { requireAuth } from "@/lib/auth/requireAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const metrics = [
    { key: "CPU Load", value: os.loadavg()[0].toFixed(2) },
    {
      key: "Memory Usage",
      value: ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2) + " GB",
    },
    { key: "Platform", value: os.platform() },
    { key: "Uptime", value: (os.uptime() / 3600).toFixed(1) + " hrs" },
  ];
  return NextResponse.json(metrics);
}

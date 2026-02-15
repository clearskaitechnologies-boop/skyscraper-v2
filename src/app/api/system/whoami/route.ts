import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { APP_URL } from "@/lib/env";
import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authData = await auth();
    const headers = request.headers;
    let org: { id: string; slug?: string | null; name?: string | null } | null = null;

    if (authData?.userId) {
      const ctx = await getActiveOrgContext({ optional: true });
      if (ctx.ok) {
        org = await prisma.org.findUnique({
          where: { id: ctx.orgId },
          select: { id: true, clerkOrgId: true, name: true },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      appUrl: APP_URL,
      auth: {
        userId: authData.userId || null,
        orgId: authData.orgId || null,
      },
      org,
      headers: {
        "x-clerk-auth-status": headers.get("x-clerk-auth-status"),
        host: headers.get("host"),
        "x-forwarded-proto": headers.get("x-forwarded-proto"),
        "x-forwarded-host": headers.get("x-forwarded-host"),
        "user-agent": headers.get("user-agent")?.substring(0, 50),
      },
      request: {
        url: request.url,
        method: request.method,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

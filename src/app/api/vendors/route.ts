import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getActiveOrgContext } from "@/lib/org/getActiveOrgContext";

// GET /api/vendors - Fetch vendor network (Phase 2)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const debug = searchParams.get("debug") === "1";

    const orgCtx = debug ? await getActiveOrgContext({ optional: true }) : null;

    const vendorsRaw = await prisma.vendor.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      include: {
        VendorLocation: {
          where: { isActive: true },
          select: {
            id: true,
            city: true,
            state: true,
          },
        },
        _count: {
          select: {
            VendorLocation: true,
            VendorContact: true,
            VendorResource: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform to match frontend expectations
    const vendors = vendorsRaw.map((v) => ({
      ...v,
      locations: v.VendorLocation,
      _count: {
        locations: v._count.VendorLocation,
        contacts: v._count.VendorContact,
        resources: v._count.VendorResource,
      },
    }));

    if (debug) {
      return NextResponse.json({
        vendors,
        debug: {
          org: orgCtx?.ok
            ? { ok: true, orgId: orgCtx.orgId, userId: orgCtx.userId }
            : { ok: false, reason: orgCtx?.reason || "skipped" },
          count: vendors.length,
        },
      });
    }

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

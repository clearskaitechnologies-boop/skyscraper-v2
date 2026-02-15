/**
 * Job Invoices API - Manage project invoices
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ENHANCEMENT: Implement full invoice system with line items
    return NextResponse.json({ invoices: [] });
  } catch (error) {
    console.error("[Job Invoices] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

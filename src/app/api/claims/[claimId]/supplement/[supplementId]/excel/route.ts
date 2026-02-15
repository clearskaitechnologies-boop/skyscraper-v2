/**
 * PHASE 42: Supplement Excel Export
 * GET /api/claims/[claimId]/supplement/[supplementId]/excel
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { claimId: string; supplementId: string } }
) {
  try {
    const { claimId, supplementId } = params;

    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user & org
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, orgId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Get supplement report
    const supplement = await prisma.supplementReport.findFirst({
      where: {
        id: supplementId,
        claimId,
        orgId: user.orgId,
      },
    });

    if (!supplement) {
      return NextResponse.json({ error: "Supplement not found" }, { status: 404 });
    }

    // 4. Generate CSV (simple Excel-compatible format)
    interface MissingItem {
      code?: string;
      description?: string;
      quantity?: number;
      unit?: string;
      unitPrice?: number;
      totalPrice?: number;
    }
    interface CodeUpgrade {
      itemCode?: string;
      description?: string;
      estimatedCost?: number;
      codeSection?: string;
      reasoning?: string;
    }
    interface QuantityFix {
      difference?: number;
      item?: {
        code?: string;
        description?: string;
        quantity?: number;
        unit?: string;
        unitPrice?: number;
      };
      carrierAmount?: number;
      contractorAmount?: number;
    }
    interface RecommendedTotals {
      subtotal?: number;
      tax?: number;
      total?: number;
    }

    const missingItems = (supplement.missingItems as MissingItem[] | null) || [];
    const codeUpgrades = (supplement.codeUpgrades as CodeUpgrade[] | null) || [];
    const quantityFixes = (supplement.quantityFixes as QuantityFix[] | null) || [];

    let csv = "Type,Item Code,Description,Quantity,Unit,Unit Price,Total Price,Notes\n";

    // Missing items
    missingItems.forEach((item: MissingItem) => {
      csv += `Missing,${item.code || ""},${item.description || ""},${item.quantity || 0},${item.unit || ""},${item.unitPrice || 0},${item.totalPrice || 0},In contractor scope but not carrier scope\n`;
    });

    // Code upgrades
    codeUpgrades.forEach((upgrade: CodeUpgrade) => {
      csv += `Code Upgrade,${upgrade.itemCode || ""},${upgrade.description || ""},1,EA,${upgrade.estimatedCost || 0},${upgrade.estimatedCost || 0},"${upgrade.codeSection || ""} - ${upgrade.reasoning || ""}"\n`;
    });

    // Quantity fixes
    quantityFixes.forEach((fix: QuantityFix) => {
      const diff = fix.difference || 0;
      csv += `Underpaid,${fix.item?.code || ""},${fix.item?.description || ""},${fix.item?.quantity || 0},${fix.item?.unit || ""},${fix.item?.unitPrice || 0},${diff},"Carrier: $${fix.carrierAmount?.toFixed(2) || "0.00"} vs Actual: $${fix.contractorAmount?.toFixed(2) || "0.00"}"\n`;
    });

    // Add totals row
    const recommended = supplement.recommended as RecommendedTotals | null;
    if (recommended && typeof recommended === "object") {
      csv += `\nSummary,,,,,,,\n`;
      csv += `Subtotal,,,,,,$${recommended.subtotal?.toFixed(2) || "0.00"},\n`;
      csv += `Tax,,,,,,$${recommended.tax?.toFixed(2) || "0.00"},\n`;
      csv += `Total Supplement,,,,,,$${recommended.total?.toFixed(2) || "0.00"},\n`;
    }

    // 5. Return CSV
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="supplement-${claimId}-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

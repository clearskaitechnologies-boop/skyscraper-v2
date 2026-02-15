/**
 * PHASE 42: Supplement Download Endpoints
 * GET /api/claims/[claimId]/supplement/[supplementId]/download
 * GET /api/claims/[claimId]/supplement/[supplementId]/excel
 */

import { auth } from "@clerk/nextjs/server";
import { jsPDF } from "jspdf";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/** Shape of the supplement recommended JSON field. */
interface SupplementRecommended {
  subtotal?: number;
  tax?: number;
  total?: number;
}

/** Shape of a missing-item entry (Prisma Json array). */
interface SupplementMissingItem {
  description?: string;
  totalPrice?: number;
}

/** Shape of a code-upgrade entry (Prisma Json array). */
interface SupplementCodeUpgrade {
  description?: string;
  codeSection?: string;
  estimatedCost?: number;
}

/** Shape of an argument entry (Prisma Json array). */
interface SupplementArgument {
  itemDescription?: string;
  difference?: number;
  argument?: string;
}

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
      select: { id: true, orgId: true, name: true, email: true },
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

    // 4. Generate PDF
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(88, 28, 135); // Purple
    doc.text("Insurance Claim Supplement", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Claim ID: ${claimId}`, 20, yPos);
    yPos += 6;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 6;
    doc.text(`Carrier: ${supplement.carrierName || "Unknown"}`, 20, yPos);
    yPos += 15;

    // Financial Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Financial Summary", 20, yPos);
    yPos += 10;

    const recommended = supplement.recommended as SupplementRecommended | null;
    if (recommended && typeof recommended === "object") {
      doc.setFontSize(10);
      doc.text(`Subtotal: $${recommended.subtotal?.toFixed(2) || "0.00"}`, 20, yPos);
      yPos += 6;
      doc.text(`Tax: $${recommended.tax?.toFixed(2) || "0.00"}`, 20, yPos);
      yPos += 6;
      doc.setFontSize(12);
      doc.setTextColor(34, 197, 94); // Green
      doc.text(`Total Supplement: $${recommended.total?.toFixed(2) || "0.00"}`, 20, yPos);
      yPos += 15;
    }

    // Missing Items
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Missing Items", 20, yPos);
    yPos += 10;

    const missingItems = (supplement.missingItems as SupplementMissingItem[] | null) ?? [];
    doc.setFontSize(9);
    missingItems.slice(0, 10).forEach((item: SupplementMissingItem, idx: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${idx + 1}. ${item.description || "N/A"}`, 20, yPos);
      yPos += 5;
      doc.text(`   $${item.totalPrice?.toFixed(2) || "0.00"}`, 25, yPos);
      yPos += 8;
    });

    // Code Upgrades
    yPos += 10;
    doc.setFontSize(14);
    doc.text("Required Code Upgrades", 20, yPos);
    yPos += 10;

    const codeUpgrades = (supplement.codeUpgrades as SupplementCodeUpgrade[] | null) ?? [];
    doc.setFontSize(9);
    codeUpgrades.forEach((upgrade: SupplementCodeUpgrade, idx: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${idx + 1}. ${upgrade.description || "N/A"}`, 20, yPos);
      yPos += 5;
      doc.text(`   Code: ${upgrade.codeSection || "N/A"}`, 25, yPos);
      yPos += 5;
      doc.text(`   Cost: $${upgrade.estimatedCost?.toFixed(2) || "0.00"}`, 25, yPos);
      yPos += 8;
    });

    // Arguments
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 10;
    doc.setFontSize(14);
    doc.text("Supplement Arguments", 20, yPos);
    yPos += 10;

    const args = (supplement.arguments as SupplementArgument[] | null) ?? [];
    doc.setFontSize(8);
    args.slice(0, 5).forEach((arg: SupplementArgument, idx: number) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(
        `${idx + 1}. ${arg.itemDescription || "N/A"} - $${arg.difference?.toFixed(2) || "0.00"}`,
        20,
        yPos
      );
      yPos += 5;
      const lines = doc.splitTextToSize(arg.argument || "No argument provided", 170);
      lines.slice(0, 5).forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 25, yPos);
        yPos += 4;
      });
      yPos += 6;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${totalPages}`, 180, 285);
      doc.text(`Prepared by ${user.name || user.email}`, 20, 285);
    }

    // 5. Return PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="supplement-${claimId}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Download supplement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

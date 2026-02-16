import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { htmlToPdfBuffer, uploadReport } from "@/lib/reports/pdf-utils";
import { buildRetailHtml } from "@/lib/reports/retail-html";

export async function POST(_req: Request, { params }: { params: { estimateId: string } }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const estimateId = params.estimateId;

  try {
    // Fetch estimate with items — verify existence with auth
    const estimate = await prisma.retailEstimate.findUnique({
      where: { id: estimateId },
      include: {
        RetailEstimateItem: {
          include: {
            VendorProduct: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!estimate) {
      return new NextResponse("Estimate not found", { status: 404 });
    }

    // Get org name if available
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      include: { Org: true },
    });

    const orgName = user?.Org?.name || "PreLoss Vision";

    // Build HTML template
    const html = await buildRetailHtml({
      estimateId,
      items: estimate.RetailEstimateItem,
      customerName: (estimate as any).customerName || "Customer",
      customerAddress: (estimate as any).customerAddress || undefined,
      orgName,
      generatedAt: new Date(),
    });

    // Convert to PDF
    const pdfBuffer = await htmlToPdfBuffer(html);

    // Upload to Supabase Storage
    const publicUrl = await uploadReport({
      bucket: "reports-retail",
      key: `${estimateId}.pdf`,
      buffer: pdfBuffer,
    });

    return NextResponse.json({
      url: publicUrl,
      estimateId,
      itemCount: estimate.RetailEstimateItem.length,
    });
  } catch (error) {
    console.error("Retail PDF generation error:", error);
    return new NextResponse(error instanceof Error ? error.message : "Failed to generate PDF", {
      status: 500,
    });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { generateClaimPacket } from "@/lib/claims/generator";
import { ClaimPacketData, PacketVersion } from "@/lib/claims/templates";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { data, version, format, includeWeatherPage } = body as {
      data: ClaimPacketData;
      version: PacketVersion;
      format: "pdf" | "docx";
      includeWeatherPage?: boolean;
    };

    if (!data || !version || !format) {
      return NextResponse.json(
        { error: "Missing required fields: data, version, format" },
        { status: 400 }
      );
    }

    logger.info(`[API:CLAIM_PACKET] Generating ${version} packet for user ${userId}`);

    // Generate packet
    const blob = await generateClaimPacket({
      data,
      version,
      format,
      includeWeatherPage,
    });

    // Return as downloadable file
    const filename = `SkaiScraper_${version === "insurance" ? "Claim_Intelligence_Report" : "Property_Damage_Packet"}.${format}`;

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type":
          format === "docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    logger.error("[API:CLAIM_PACKET] Generation failed:", error);
    Sentry.captureException(error, {
      tags: { component: "claim-packet-api" },
    });
    return NextResponse.json(
      { error: error.message || "Failed to generate claim packet" },
      { status: 500 }
    );
  }
}

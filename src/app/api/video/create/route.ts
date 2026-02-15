// app/api/video/create/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { buildClaimVideoScript } from "@/lib/ai/video/buildClaimVideoScript";
import { buildRetailVideoScript } from "@/lib/ai/video/buildRetailVideoScript";
import { createVideoFromScript } from "@/lib/ai/video/createVideoFromScript";
import prisma from "@/lib/prisma";
import { buildReportData } from "@/lib/reports/buildReportData";
import { uploadVideoToFirebase } from "@/lib/storage/uploadVideoToFirebase";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { claimId, type } = await req.json();

    if (!claimId) {
      return NextResponse.json({ error: "Claim ID is required" }, { status: 400 });
    }

    const claims = await prisma.claims.findUnique({
      where: { id: claimId },
      select: { orgId: true },
    });

    if (!claims) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Build complete report data
    const config = {
      orgId: claims.orgId,
      claimId,
      type: type === "CLAIM_VIDEO" ? "INSURANCE_CLAIM" : "RETAIL_PROPOSAL",
      sections: [
        "COVER",
        "WEATHER_QUICK_DOL",
        "AI_DAMAGE",
        "ESTIMATE_INITIAL",
        "MATERIALS",
        "WARRANTY_DETAILS",
        "TIMELINE",
      ],
    };

    const data = await buildReportData(config as any);

    // Build video script
    const script =
      type === "CLAIM_VIDEO"
        ? await buildClaimVideoScript(data)
        : await buildRetailVideoScript(data);

    // Generate video (using AI video generation)
    const videoBuffer = await createVideoFromScript(script);

    // Upload to Firebase
    const url = await uploadVideoToFirebase(videoBuffer, claims.orgId, claimId, `video-${type}`);

    // Save video record in DB
    await prisma.videoReport.create({
      data: {
        orgId: claims.orgId,
        claimId,
        type,
        url,
      } as any,
    });

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("Video generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to create video" }, { status: 500 });
  }
}

// app/api/generate-test-docx/route.ts
// API endpoint for generating test retail packet with embedded photos

export const runtime = "nodejs"; // CRITICAL: Required for Buffer support
export const dynamic = "force-dynamic";
export const revalidate = 0;

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/requireAuth";
import { generateClaimPacket } from "@/lib/claims/generator";
import { BLANK_PACKET, ClaimPacketData } from "@/lib/claims/templates";

// Sample photo URLs (using Unsplash placeholder images)
const SAMPLE_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&h=600&fit=crop",
    caption: "Roof damage - northeast corner, hail impact visible",
    index: 1,
  },
  {
    url: "https://images.unsplash.com/photo-1591474200742-8e512e6f98f8?w=800&h=600&fit=crop",
    caption: "HVAC unit - soft metal denting, functional damage confirmed",
    index: 2,
  },
  {
    url: "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&h=600&fit=crop",
    caption: "Skylight damage - cracked lens, water intrusion risk",
    index: 3,
  },
  {
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop",
    caption: "Interior ceiling stain - active leak evidence in master bedroom",
    index: 4,
  },
];

// Sample Retail packet data
const SAMPLE_RETAIL_DATA: ClaimPacketData = {
  ...BLANK_PACKET,
  insured_name: "John & Jane Doe",
  propertyAddress: "123 Main Street, Phoenix, AZ 85001",
  dateOfLoss: "2024-07-15",
  reportedCause: "Hail storm event",
  inspectionDate: "2024-07-20",
  preparedBy: "Damien Willingham, ClearSkai Technologies",
  preparedPhone: "(480) 995-5820",
  preparedEmail: "damien@clearskai.com",

  // Event details
  eventType: "hail",
  roofType: "shingle",
  observedDamage: [
    "Storm Damage (Hail/Wind)",
    "Skylight / Flashing Issues",
    "Interior Damage Present",
    "Cracked Tile / Shingle Loss",
  ],
  generalNotes:
    "Extensive hail damage observed on north and east-facing slopes. Multiple impact marks on soft metals (HVAC, vents, skylight frames). Active leak in master bedroom ceiling.",

  // Retail-specific
  estimateType: "retail-cash",
  recommendedRepairAction: "full-replacement",
  estimateRangeLow: 12500,
  estimateRangeHigh: 18500,
  financingAvailable: true,
  warrantyOption: "10yr-labor",

  // Timeline
  timelineInspectionCompleted: "2024-07-20",
  timelineProposalMaterialSelection: "2024-07-25",
  timelineSchedulingPermit: "2024-08-01",
  timelineTearOffInstall: "2024-08-15",
  timelineFinalWalkthrough: "2024-08-20",
  typicalDurationDays: 5,

  // Materials
  materialChoice: "architectural-shingle",
  coolRoofRated: true,
  heatReflectiveCoating: false,
  atticVentilationUpgrade: true,
  radiantBarrierAddOn: false,

  // Warranty
  serviceHotline: "(480) 995-5820",
  warrantyEmail: "support@clearskai.com",

  // Signature
  clientName: "John Doe",
  clientSignatureDate: "2024-07-25",

  // Photos
  photos: SAMPLE_PHOTOS,
};

export async function POST() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const { orgId, userId } = auth;

    console.info("[TEST_DOCX] Generating retail packet with sample photos...");

    const blob = await generateClaimPacket({
      data: SAMPLE_RETAIL_DATA,
      version: "retail",
      format: "docx",
      includeWeatherPage: false,
    });

    // Convert Blob to Buffer for Next.js response
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.info(`[TEST_DOCX] Generation successful (${buffer.length} bytes)`);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Test_Retail_Packet_With_Photos.docx"',
      },
    });
  } catch (error) {
    console.error("[TEST_DOCX] Generation failed:", error);

    Sentry.captureException(error, {
      tags: { component: "test-docx-generator" },
    });

    return NextResponse.json(
      {
        error: "Failed to generate test DOCX",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

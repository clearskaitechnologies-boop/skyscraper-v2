import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

// client_access model only has: id, claimId, email, createdAt
// It doesn't have clerk_userId or clientId - schema needs update
// Client model uses: address, city, state, postal - not addressLine1/2, insuranceCarrier, policyNumber

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This route requires schema fields that don't exist yet
    return NextResponse.json(
      {
        ok: false,
        error: "Feature not implemented",
        deprecated: true,
        message:
          "client_access doesn't have clerk_userId/clientId; Client doesn't have addressLine1/2/insuranceCarrier/policyNumber fields",
      },
      { status: 501 }
    );
  } catch (error) {
    logger.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ============================================================================
// H-10: Onboarding Complete API
// ============================================================================

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Using orgId from auth()
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const body = await request.json();
    const { companyInfo, teamMembers } = body;

    // Update organization with company info
    if (companyInfo) {
      await db.organization.update({
        where: { id: orgId },
        data: {
          name: companyInfo.name || undefined,
        },
      });

      // Update contractor profile if exists
      await db.contractorProfile.upsert({
        where: { orgId: orgId },
        create: {
          id: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          orgId: orgId,
          businessName: companyInfo.name,
          address: companyInfo.address,
          phone: companyInfo.phone,
          website: companyInfo.website,
        },
        update: {
          businessName: companyInfo.name,
          address: companyInfo.address,
          phone: companyInfo.phone,
          website: companyInfo.website,
        },
      });
    }

    // Send team invitations (placeholder - implement email sending)
    if (teamMembers && teamMembers.length > 0) {
      for (const member of teamMembers) {
        if (member.email) {
          // TODO: Send invitation email
          console.log(`[ONBOARDING] Invite sent to ${member.email}`);
        }
      }
    }

    // Mark onboarding as complete (could add onboarding_completed field)
    console.log(`[ONBOARDING] Completed for org ${orgId}`);

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    console.error("[ONBOARDING_ERROR]", error);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { pool } from "@/server/db";

export async function saveBranding(formData: FormData) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const resolvedOrgId = orgId ?? userId;

  const companyName = formData.get("companyName") as string;
  const license = formData.get("license") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const website = formData.get("website") as string;
  const colorPrimary = formData.get("colorPrimary") as string;
  const colorAccent = formData.get("colorAccent") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const teamPhotoUrl = formData.get("teamPhotoUrl") as string;

  try {
    // Call the database UPSERT function
    await pool.query(`SELECT upsert_org_branding($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
      resolvedOrgId,
      userId,
      companyName || "Your Roofing Company LLC",
      license || null,
      phone || null,
      email || null,
      website || null,
      colorPrimary || "#117CFF",
      colorAccent || "#FFC838",
      logoUrl || null,
      teamPhotoUrl || null,
    ]);

    // Revalidate all paths that display branding
    revalidateTag(`branding:${resolvedOrgId}`);
    revalidatePath("/dashboard");
    revalidatePath("/settings/branding");
    revalidatePath("/", "layout"); // Revalidate root layout for header branding

    return { success: true };
  } catch (error: any) {
    console.error("[saveBranding] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function completeBrandingAndRedirect(formData: FormData) {
  const result = await saveBranding(formData);

  if (result.success) {
    redirect("/dashboard?branding=saved");
  } else {
    // Return error instead of throwing in server action
    return { success: false, error: result.error || "Failed to save branding" };
  }
}

// src/lib/db/branding.ts
import { prisma } from "./client";

export async function getBrandingForOrg(orgId: string) {
  const branding = await prisma.org_branding.findFirst({
    where: { orgId },
  });

  return branding || null;
}

import prisma from "@/lib/prisma";

import { slugifyContractorName } from "./slugify";

export async function getContractorProfileForOrg(orgId: string) {
  return prisma.tradesCompanyMember.findFirst({
    where: { orgId },
    include: {
      org: {
        include: {
          users: true, // team members
        },
      },
    },
  });
}

export async function createOrUpdateContractorProfile(orgId: string, data: any) {
  const slug = slugifyContractorName(data.businessName);

  // Check if exists
  const existing = await prisma.tradesCompanyMember.findFirst({
    where: { orgId },
  });

  if (existing) {
    return prisma.tradesCompanyMember.update({
      where: { id: existing.id },
      data: {
        ...data,
        slug,
      },
    });
  }

  return prisma.tradesCompanyMember.create({
    data: {
      ...data,
      slug,
      orgId,
    },
  });
}

export async function getContractorProfileBySlug(slug: string) {
  // Slug is on tradesCompany, not tradesCompanyMember
  // Find company by slug and return first member with company data
  const company = await prisma.tradesCompany.findUnique({
    where: { slug },
    include: {
      members: {
        take: 1,
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!company || company.members.length === 0) {
    return null;
  }

  // Return first member with company attached
  return {
    ...company.members[0],
    company,
  };
}

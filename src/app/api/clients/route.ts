import { NextRequest, NextResponse } from "next/server";

import { compose, safeAuth, withOrgScope, withRateLimit, withSentryApi } from "@/lib/api/wrappers";
import { createForbiddenResponse, requirePermission } from "@/lib/auth/rbac";
import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

/**
 * GET /api/clients
 * List all client contacts for the org
 */
const baseGET = async (req: NextRequest) => {
  const { orgId, userId } = await getCurrentUserPermissions();

  if (!orgId && !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { orgId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clients);
};

/**
 * POST /api/clients
 * Create a new client contact
 */
const basePOST = async (req: NextRequest) => {
  try {
    await requirePermission("claims:create");
  } catch (error: any) {
    return createForbiddenResponse(error.message || "You don't have permission to create clients", {
      currentRole: error.currentRole,
      requiredPermission: "claims:create",
    });
  }

  const { orgId, userId } = await getCurrentUserPermissions();

  if (!orgId && !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, phone, category, notes } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const validCategories = [
    "Homeowner",
    "Business Owner",
    "Broker",
    "Realtor",
    "Property Manager",
    "Landlord",
  ];
  const clientCategory = validCategories.includes(category) ? category : "Homeowner";

  // Generate a unique slug
  const slug = `client-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const client = await prisma.client.create({
    data: {
      id: crypto.randomUUID(),
      orgId: orgId!,
      slug,
      name,
      email: email || null,
      phone: phone || null,
      category: clientCategory,
    },
  });

  return NextResponse.json(client, { status: 201 });
};

const wrap = compose(withSentryApi, withRateLimit, withOrgScope, safeAuth);
export const GET = wrap(baseGET);
export const POST = wrap(basePOST);
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

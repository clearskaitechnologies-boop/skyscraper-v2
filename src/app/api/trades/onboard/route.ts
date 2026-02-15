import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const partner = await prisma.contractors.create({ data: { ...body, orgId } });
  return Response.json(partner);
}

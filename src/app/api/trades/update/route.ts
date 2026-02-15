import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { orgId } = await auth();
  if (!orgId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return new Response("Missing id", { status: 400 });
  const partner = await prisma.contractors.update({ where: { id }, data: updates });
  return Response.json(partner);
}

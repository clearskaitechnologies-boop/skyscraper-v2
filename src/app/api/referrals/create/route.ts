import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const referral = await prisma.referrals.create({ data: body });
    return Response.json(referral);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/health/user-columns
// Returns { ok: boolean, missing: string[], columns: string[] }
export async function GET() {
  try {
    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`;
    const present = rows.map(r => r.column_name);
    const required = [
      'title',
      'phone',
      'headshot_url',
      'public_skills',
      'job_history',
      'client_testimonials',
      'earned_badges',
      'years_experience'
    ];
    const missing = required.filter(c => !present.includes(c));
    return NextResponse.json({ ok: missing.length === 0, missing, columns: present });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown error' }, { status: 500 });
  }
}

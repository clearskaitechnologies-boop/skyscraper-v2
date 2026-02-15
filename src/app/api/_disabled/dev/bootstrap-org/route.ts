import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { getOrCreateCurrentOrganization } from '@/lib/organizations';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'Not available in production' }, { status: 403 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthenticated' }, { status: 401 });
  }
  try {
    const org = await getOrCreateCurrentOrganization({ requireOrg: false, bootstrapIfMissing: true });
    return NextResponse.json({ ok: true, organizationId: org?.id || null, name: org?.name || null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}

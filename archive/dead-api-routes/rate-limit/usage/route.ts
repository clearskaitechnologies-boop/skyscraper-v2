import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { withSentryApi } from '@/lib/monitoring/sentryApi';

export const GET = withSentryApi(async () => {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Placeholder - integrate Upstash analytics
  return NextResponse.json({ endpoints: [], generatedAt: new Date().toISOString() });
});

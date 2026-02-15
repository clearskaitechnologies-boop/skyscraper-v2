export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Phase 5 - Client-side audit log API route
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import { type AuditAction,logAction } from '@/modules/audit/core/logger';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, orgId, jobId, userName, payload } = body;

    if (!action || !orgId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, orgId' },
        { status: 400 }
      );
    }

    await logAction({
      orgId,
      userId,
      userName: userName || 'Unknown User',
      action: action as AuditAction,
      jobId,
      payload,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Audit log POST failed:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

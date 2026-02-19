/**
 * POST /api/integrations/quickbooks/receipts
 *
 * Sync material receipts to QuickBooks as Purchase records.
 *
 * Actions:
 * - sync-one:  Sync a single receipt to QB
 * - sync-claim: Sync all unsynced receipts for a claim
 * - disconnect: Revoke QB OAuth and mark inactive
 */

import { withAuth } from "@/lib/auth/withAuth";
import {
  disconnectQuickBooks,
  syncClaimReceiptsToQuickBooks,
  syncReceiptToQuickBooks,
} from "@/lib/integrations/quickbooks-receipts";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withAuth(async (req: NextRequest, { orgId, userId }) => {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      // ── Sync single receipt ────────────────────────────────────────
      case "sync-one": {
        const { receiptId, vendorName, receiptDate, totalAmount, paymentMethod, lineItems, memo } =
          body;
        if (!receiptId) {
          return NextResponse.json({ error: "receiptId is required" }, { status: 400 });
        }

        const result = await syncReceiptToQuickBooks(orgId, receiptId, {
          vendorName: vendorName || "Unknown Supplier",
          receiptDate: receiptDate || new Date().toISOString().split("T")[0],
          totalAmount: totalAmount || 0,
          paymentMethod: paymentMethod || "Other",
          lineItems: lineItems || [{ description: "Materials", amount: totalAmount || 0 }],
          memo,
        });

        return NextResponse.json({ ok: true, ...result });
      }

      // ── Bulk sync for claim ────────────────────────────────────────
      case "sync-claim": {
        const { claimId } = body;
        if (!claimId) {
          return NextResponse.json({ error: "claimId is required" }, { status: 400 });
        }

        const result = await syncClaimReceiptsToQuickBooks(orgId, claimId);
        return NextResponse.json({ ok: true, ...result });
      }

      // ── Disconnect QuickBooks ──────────────────────────────────────
      case "disconnect": {
        await disconnectQuickBooks(orgId);
        return NextResponse.json({ ok: true, message: "QuickBooks disconnected" });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Use: sync-one, sync-claim, disconnect` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("[QB_RECEIPTS_API]", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Receipt sync failed" },
      { status: 500 }
    );
  }
});

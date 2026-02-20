// NOTE: this module is used in server-side Next API routes and expects
// Node runtime types to be available at build time. If TypeScript complains
// about `process` or `@prisma/client` types, run `pnpm install` and
// `npx prisma generate` locally.
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

declare const process: any;

// Prisma singleton imported from @/lib/db/prisma

async function getPrisma() {
  return prisma;
}

const GRANTS: Record<string, { ai: number; qc: number; full: number }> = {
  solo: { ai: 5000, qc: 5, full: 3 },
  business: { ai: 40000, qc: 20, full: 12 },
  enterprise: { ai: 120000, qc: 40, full: 30 },
};

function buildPriceMap() {
  const map: Record<string, string> = {};
  const maybe = (envKey: string | undefined, plan: string) => {
    if (envKey) map[envKey] = plan;
  };
  maybe(process.env.STRIPE_SOLO_MONTHLY_PRICE_ID, "solo");
  maybe(process.env.STRIPE_SOLO_ANNUAL_PRICE_ID, "solo");
  maybe(process.env.STRIPE_PRO_ANNUAL_PRICE_ID, "pro");
  maybe(process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID, "business");
  maybe(process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID, "business");
  maybe(process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID, "enterprise");
  maybe(process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID, "enterprise");
  return map;
}

async function creditGrantsForOrg(orgId: string, planKey: string, meta: any) {
  const g = GRANTS[planKey];
  if (!g) return;

  try {
    const prisma = await getPrisma();
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO org_usage_balances (org_id, ai_tokens, dol_quickcheck, dol_full, updated_at)
      VALUES ($1::text, $2, $3, $4, now())
      ON CONFLICT (org_id) DO UPDATE
        SET ai_tokens = org_usage_balances.ai_tokens + $2,
            dol_quickcheck = org_usage_balances.dol_quickcheck + $3,
            dol_full = org_usage_balances.dol_full + $4,
            updated_at = now();
    `,
      orgId,
      g.ai,
      g.qc,
      g.full
    );

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO org_usage_ledger (org_id, change_type, ai_tokens_delta, dol_quickcheck_delta, dol_full_delta, meta, created_at)
      VALUES ($1::text, 'grant', $2, $3, $4, $5::jsonb, now())
    `,
      orgId,
      g.ai,
      g.qc,
      g.full,
      JSON.stringify(meta || {})
    );
  } catch (e) {
    console.warn(
      "org_usage upsert failed, falling back to tokens_ledger",
      e instanceof Error ? e.message : String(e)
    );
    try {
      const prisma = await getPrisma();
      const agg: any =
        await prisma.$queryRaw`SELECT COALESCE(SUM(amount_change),0) AS sum FROM tokens_ledger WHERE org_id = ${orgId}::uuid`;
      const current = agg && agg[0] ? parseInt(agg[0].sum, 10) : 0;
      const newBalance = current + g.ai;
      await prisma.$executeRaw`INSERT INTO tokens_ledger (id, org_id, amount_change, balance_after, kind, reason, created_at) VALUES (gen_random_uuid(), ${orgId}::uuid, ${g.ai}, ${newBalance}, 'grant', ${"stripe_grant_" + planKey}, now())`;
    } catch (er) {
      console.error("Fallback tokens_ledger write failed", er);
    }
  }
}

export async function handleStripeEvent(evt: any) {
  const PRICE_MAP = buildPriceMap();

  switch (evt.type) {
    case "checkout.session.completed": {
      const session = evt.data?.object;
      const orgId =
        session?.metadata?.org_id || session?.metadata?.organization_id || session?.metadata?.org;
      const planKey =
        session?.metadata?.plan_key ||
        session?.metadata?.plan ||
        (session?.line_items && session.line_items[0]?.price?.id
          ? PRICE_MAP[session.line_items[0].price.id]
          : undefined);
      const tokens = session?.metadata?.tokens ? parseInt(session.metadata.tokens, 10) : null;
      if (orgId && planKey) {
        await creditGrantsForOrg(orgId, planKey, {
          stripe: { session_id: session?.id, payload: session },
        });
      } else if (orgId && tokens) {
        // Handle token pack purchases
        try {
          const prisma = await getPrisma();

          // Try to update TokenWallet first (new system)
          try {
            await prisma.usage_tokens.upsert({
              where: { orgId },
              update: {
                balance: {
                  increment: tokens,
                },
              },
              create: {
                orgId,
                balance: tokens,
              },
            });

            // Log the transaction in TokenLedger
            await prisma.tokens_ledger.create({
              data: {
                orgId: orgId,
                delta: tokens,
                reason: `stripe_token_purchase_${session?.metadata?.pack_size || "unknown"}`,
                balanceAfter: tokens,
              },
            });

            logger.debug(`Successfully added ${tokens} tokens to wallet for org ${orgId}`);
          } catch (walletError) {
            logger.warn("TokenWallet update failed, falling back to tokens_ledger", walletError);

            // Fallback to legacy tokens_ledger
            const agg: any =
              await prisma.$queryRaw`SELECT COALESCE(SUM(amount_change),0) AS sum FROM tokens_ledger WHERE org_id = ${orgId}::uuid`;
            const current = agg && agg[0] ? parseInt(agg[0].sum, 10) : 0;
            const newBalance = current + tokens;
            await prisma.$executeRaw`INSERT INTO tokens_ledger (id, org_id, amount_change, balance_after, kind, reason, created_at) VALUES (gen_random_uuid(), ${orgId}::uuid, ${tokens}, ${newBalance}, 'purchase', 'stripe_checkout', now())`;
          }
        } catch (e) {
          logger.error("Token purchase processing failed", e);
        }
      }
      break;
    }

    case "invoice.payment_succeeded":
    case "invoice.paid": {
      const invoice = evt.data?.object;
      const orgId =
        invoice?.metadata?.org_id ||
        invoice?.customer_metadata?.org_id ||
        invoice?.lines?.data?.[0]?.metadata?.org_id;
      let planKey: string | undefined;
      if (invoice?.lines && invoice.lines.data && invoice.lines.data.length) {
        for (const line of invoice.lines.data) {
          const pid = line?.price?.id;
          if (pid && PRICE_MAP[pid]) {
            planKey = PRICE_MAP[pid];
            break;
          }
        }
      }
      if (orgId && planKey) {
        await creditGrantsForOrg(orgId, planKey, {
          stripe: { invoice_id: invoice?.id, payload: invoice },
        });
      }
      break;
    }

    case "customer.subscription.created": {
      const sub = evt.data?.object;
      const orgId = sub?.metadata?.org_id || sub?.metadata?.organization_id;
      let planKey: string | undefined;
      if (sub?.items && sub.items.data && sub.items.data.length) {
        for (const item of sub.items.data) {
          const pid = item?.price?.id;
          if (pid && PRICE_MAP[pid]) {
            planKey = PRICE_MAP[pid];
            break;
          }
        }
      }
      if (orgId && planKey) {
        await creditGrantsForOrg(orgId, planKey, {
          stripe: { subscription_id: sub?.id, payload: sub },
        });
      }
      break;
    }

    default:
      // ignore other events
      break;
  }
}

export default handleStripeEvent;

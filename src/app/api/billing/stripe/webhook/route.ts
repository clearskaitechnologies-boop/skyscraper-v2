// src/app/api/billing/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.metadata?.orgId;
    const userId = session.metadata?.userId;
    const tokens = Number(session.metadata?.tokens || 0);
    const productType = session.metadata?.productType; // 'tokens' | 'full_access'

    // Handle token purchase
    if (orgId && tokens > 0 && productType === "tokens") {
      const usage = await prisma.usage_tokens.findFirst({ where: { orgId } });
      if (usage) {
        await prisma.usage_tokens.update({
          where: { id: usage.id },
          data: { balance: { increment: tokens } },
        });
      } else {
        await prisma.usage_tokens.create({
          data: { orgId, balance: tokens, tier: "pack" } as any,
        });
      }
    }

    // Handle Full Access subscription activation
    if (userId && productType === "full_access") {
      const subscriptionId = session.subscription as string;
      await prisma.$executeRaw`
        INSERT INTO tn_memberships (userId, full_access, stripe_subscription_id, updated_at)
        VALUES (${userId}::uuid, true, ${subscriptionId}, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET full_access = true, stripe_subscription_id = ${subscriptionId}, updated_at = NOW()
      `;
    }
  }

  // Handle subscription updates (payment succeeded, renewal)
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;
    const userId = invoice.metadata?.userId;

    if (userId && invoice.billing_reason === "subscription_cycle") {
      await prisma.$executeRaw`
        UPDATE tn_memberships 
        SET full_access = true, updated_at = NOW()
        WHERE user_id = ${userId}::uuid AND stripe_subscription_id = ${subscriptionId}
      `;
    }
  }

  // Handle subscription cancellation
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;

    await prisma.$executeRaw`
      UPDATE tn_memberships 
      SET full_access = false, expires_at = NOW(), updated_at = NOW()
      WHERE stripe_subscription_id = ${subscriptionId}
    `;
  }

  // Handle subscription updates (paused, past_due, etc.)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const isActive = subscription.status === "active";

    await prisma.$executeRaw`
      UPDATE tn_memberships 
      SET full_access = ${isActive}, updated_at = NOW()
      WHERE stripe_subscription_id = ${subscriptionId}
    `;
  }

  return NextResponse.json({ received: true });
}

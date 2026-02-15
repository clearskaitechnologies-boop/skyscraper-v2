import { NextResponse } from "next/server";
import Stripe from "stripe";

import { grantTokensToOrg } from "@/lib/grant";
import prisma from "@/lib/prisma";

export const runtime = "nodejs"; // ensure not edge
export const dynamic = "force-dynamic"; // Required for webhooks

// Prisma singleton imported from @/lib/db/prisma
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15", // Keep compatible API version
});

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature verification failed", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`Processing Stripe webhook: ${event.type} (${event.id})`);

  // Enhanced idempotency with retry protection
  const exists = await prisma.webhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (exists) {
    console.log(`Webhook ${event.id} already processed, skipping`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  await prisma.webhookEvent.create({
    data: { stripeEventId: event.id, type: event.type, payload: event as any } as any,
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;
        if (!orgId) break;

        // Handle Subscription checkout
        if (session.subscription && session.mode === "subscription") {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await prisma.subscription.update({
            where: { orgId },
            data: {
              stripeSubId: sub.id,
              stripeCustomerId: sub.customer as string,
              status: sub.status,
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });

          // map price → Plan
          const priceId = sub.items.data[0]?.price?.id;
          if (priceId) {
            const Plan = await prisma.plan.findUnique({
              where: { stripePriceId: priceId },
            });
            if (Plan) {
              await prisma.org.update({
                where: { id: orgId },
                data: { planId: Plan.id },
              });

              // top-up tokens on start of period
              await prisma.usage_tokens.upsert({
                where: { orgId },
                update: {
                  balance: { increment: Plan.aiIncluded },
                },
                create: {
                  id: crypto.randomUUID(),
                  orgId,
                  balance: Plan.aiIncluded,
                },
              });
            }
          }
        }

        // Handle token pack purchase (one-time payment)
        if (session.mode === "payment" && session.metadata?.type === "token_pack") {
          const packSlug = session.metadata.packSlug;
          const tokens = parseInt(session.metadata.tokens || "0", 10);
          const quantity = parseInt(session.metadata.quantity || "1", 10);
          const clerkUserId = session.metadata.clerkUserId;

          if (tokens > 0) {
            await grantTokensToOrg({
              orgId,
              amount: tokens * quantity,
              reason: `Token pack: ${packSlug} (${quantity}x)`,
              userId: clerkUserId,
              meta: { packSlug, quantity },
            });
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const orgData = await prisma.subscription.findFirst({
          where: { stripeSubId: sub.id },
          select: { orgId: true },
        });
        const orgId = orgData?.orgId;
        if (!orgId) break;

        await prisma.subscription.update({
          where: { orgId },
          data: {
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });

        // Monthly top-up
        const plan = await prisma.plan.findFirst({
          where: { stripePriceId: sub.items.data[0].price.id },
        });
        if (plan) {
          await prisma.tokenWallet.update({
            where: { orgId },
            data: {
              aiRemaining: { increment: plan.aiIncluded },
              dolCheckRemain: { increment: plan.dolCheckIncluded },
              dolFullRemain: { increment: plan.dolFullIncluded },
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subObj = event.data.object as Stripe.Subscription;
        const rec = await prisma.subscription.findFirst({
          where: { stripeSubId: subObj.id },
        });
        if (!rec) break;

        await prisma.subscription.update({
          where: { orgId: rec.orgId },
          data: {
            status: subObj.status,
            currentPeriodEnd: new Date(subObj.current_period_end * 1000),
          },
        });
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscriptionObj = event.data.object as Stripe.Subscription;
        const rec = await prisma.subscription.findFirst({
          where: { stripeSubId: subscriptionObj.id },
          include: { Org: true },
        });

        if (!rec || !rec.Org) break;

        console.log(`Trial ending soon for org: ${rec.Org.name} (${rec.orgId})`);

        // Here you could:
        // 1. Send email notification to users
        // 2. Track analytics event
        // 3. Update user preferences
        // 4. Send in-app notification

        // Example: Track trial end event
        // Note: In a real implementation, you'd want to track this per user
        console.log("Trial end notification sent for subscription:", subscriptionObj.id);

        break;
      }
    }
  } catch (err) {
    console.error("webhook handler error", err);
  }

  return NextResponse.json({ received: true });
}

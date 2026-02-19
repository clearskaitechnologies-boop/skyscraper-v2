export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiOk } from "@/lib/apiError";
import prisma from "@/lib/prisma";
import { safeOrgContext } from "@/lib/safeOrgContext";
import { getStripeClient } from "@/lib/stripe";

// ---------------------------------------------------------------------------
// POST /api/payments/create-link — Create a Stripe Payment Link for a job/invoice
// GET  /api/payments/create-link — List payment records for the org
// ---------------------------------------------------------------------------

const CreatePaymentSchema = z.object({
  invoiceId: z.string().optional(),
  jobId: z.string(),
  amount: z.number().min(100, "Minimum $1.00 (100 cents)"),
  description: z.string().default("Payment for services"),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return apiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const body = await req.json().catch(() => null);
    if (!body) return apiError(400, "INVALID_BODY", "Invalid JSON");

    const parsed = CreatePaymentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(400, "VALIDATION_ERROR", "Validation failed", parsed.error.errors);
    }
    const data = parsed.data;

    // Verify job belongs to this org
    const job = await prisma.crm_jobs.findFirst({
      where: { id: data.jobId, org_id: ctx.orgId },
    });
    if (!job) {
      return apiError(404, "JOB_NOT_FOUND", "Job not found");
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      // Store payment request even without Stripe
      const paymentRecord = await prisma.customer_payments.create({
        data: {
          id: crypto.randomUUID(),
          orgId: ctx.orgId,
          jobId: data.jobId,
          invoiceId: data.invoiceId || null,
          amountCents: data.amount,
          description: data.description,
          customerEmail: data.customerEmail || null,
          customerName: data.customerName || null,
          status: "pending",
          provider: "manual",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      return apiOk(
        {
          payment: paymentRecord,
          paymentUrl: null,
          note: "Stripe not configured — payment recorded for manual collection",
        },
        { status: 201 }
      );
    }

    // Create Stripe Checkout Session
    const stripeClient = getStripeClient();

    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: data.amount,
            product_data: {
              name: data.description,
              metadata: {
                jobId: data.jobId,
                orgId: ctx.orgId,
                ...(data.invoiceId ? { invoiceId: data.invoiceId } : {}),
              },
            },
          },
          quantity: 1,
        },
      ],
      customer_email: data.customerEmail || undefined,
      metadata: {
        orgId: ctx.orgId,
        jobId: data.jobId,
        invoiceId: data.invoiceId || "",
        type: "customer_payment",
        ...data.metadata,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/portal/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/portal/payments/cancelled`,
    });

    // Store the payment record
    const paymentRecord = await prisma.customer_payments.create({
      data: {
        id: crypto.randomUUID(),
        orgId: ctx.orgId,
        jobId: data.jobId,
        invoiceId: data.invoiceId || null,
        amountCents: data.amount,
        description: data.description,
        customerEmail: data.customerEmail || null,
        customerName: data.customerName || null,
        status: "pending",
        provider: "stripe",
        stripeSessionId: session.id,
        paymentUrl: session.url,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return apiOk(
      {
        payment: paymentRecord,
        paymentUrl: session.url,
        sessionId: session.id,
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error("[payments-create]", err);
    return apiError(500, "INTERNAL_ERROR", err.message);
  }
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.orgId) {
      return apiError(401, "UNAUTHORIZED", "Authentication required");
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    const status = url.searchParams.get("status");

    const where: any = { orgId: ctx.orgId };
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;

    const payments = await prisma.customer_payments.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const totals = {
      totalCollected: payments
        .filter((p) => p.status === "paid")
        .reduce((s, p) => s + p.amountCents, 0),
      totalPending: payments
        .filter((p) => p.status === "pending")
        .reduce((s, p) => s + p.amountCents, 0),
      count: payments.length,
    };

    return apiOk({ payments, totals });
  } catch (err) {
    logger.error("[payments-get]", err);
    return apiError(500, "INTERNAL_ERROR", err.message);
  }
}

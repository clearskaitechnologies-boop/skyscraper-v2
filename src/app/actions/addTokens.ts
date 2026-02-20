"use server";

import { auth } from "@clerk/nextjs/server";

import { BETA_PAYMENTS_DISABLED_MESSAGE, isBetaMode } from "@/lib/beta";
import { logger } from "@/lib/logger";
import { getStripeClient } from "@/lib/stripe";

const stripe = getStripeClient();

export async function createTokenCheckout(orgId: string, pack: string) {
  if (isBetaMode()) {
    throw new Error(BETA_PAYMENTS_DISABLED_MESSAGE);
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const tokenPacks = {
    "10": {
      priceId: process.env.STRIPE_PRICE_TOKENS_10!,
      tokens: 1000,
      price: "$10",
    },
    "25": {
      priceId: process.env.STRIPE_PRICE_TOKENS_25!,
      tokens: 2600, // 2500 + 100 bonus
      price: "$25",
    },
    "50": {
      priceId: process.env.STRIPE_PRICE_TOKENS_50!,
      tokens: 5400, // 5000 + 400 bonus
      price: "$50",
    },
    "100": {
      priceId: process.env.STRIPE_PRICE_TOKENS_100!,
      tokens: 11200, // 10000 + 1200 bonus
      price: "$100",
    },
  } as const;

  const packInfo = tokenPacks[pack as keyof typeof tokenPacks];
  if (!packInfo) {
    throw new Error("Invalid token pack selected");
  }

  try {
    const session = await stripe!.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: packInfo.priceId, quantity: 1 }],
      automatic_tax: { enabled: true }, // ✅ Stripe automatic tax
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success&tokens=${packInfo.tokens}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancelled`,
      metadata: {
        orgId,
        userId,
        token_pack_tokens: String(packInfo.tokens),
        type: "token_purchase",
        pack_size: pack,
      },
      client_reference_id: userId,
    });

    return { url: session.url };
  } catch (error) {
    logger.error("Stripe checkout error:", error);
    throw new Error("Failed to create checkout session");
  }
}

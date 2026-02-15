import { requireOrg } from "./org";

export async function assertPaidAccess(minPlan: "Solo" | "Business" | "Enterprise" = "Solo") {
  const org = await requireOrg();

  // BETA MODE: Allow FREE tier access during beta testing
  // TODO: Re-enable strict enforcement after beta when Stripe is activated
  const plan = org.plan?.name ?? "FREE";

  // During beta, FREE tier gets full access
  if (plan === "FREE") {
    return org;
  }

  // For paid tiers (post-beta), enforce normal tier checks
  const status = org.subscription?.status ?? "none";
  if (!["active", "trialing", "past_due"].includes(status)) {
    throw new Error("UNPAID");
  }

  const order = ["Solo", "Business", "Enterprise"];
  if (order.indexOf(plan) < order.indexOf(minPlan)) {
    throw new Error("PLAN_TOO_LOW");
  }

  return org;
}

export async function checkTokenBalance(type: "ai" | "dolCheck" | "dolFull", needed: number = 1) {
  const org = await requireOrg();

  if (!org.tokens) {
    throw new Error("NO_TOKEN_WALLET");
  }

  const balance =
    type === "ai"
      ? org.tokens.aiRemaining
      : type === "dolCheck"
        ? org.tokens.dolCheckRemain
        : org.tokens.dolFullRemain;

  if (balance < needed) {
    throw new Error("INSUFFICIENT_TOKENS");
  }

  return balance;
}

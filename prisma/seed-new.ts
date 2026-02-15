import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Tool catalog: set token costs (≈ your $0.99, $1.99 mapping → pick token equivalents)
const toolCatalog = [
  { key: "mockup", name: "AI Mock-up", costTokens: 100 }, // ~$0.99 equiv
  { key: "dol_pull", name: "DOL Pull", costTokens: 200 }, // ~$1.99 equiv
  {
    key: "weather_claim",
    name: "Claims-Ready Weather Report",
    costTokens: 750,
  }, // heavier task
];

// Plan limits per day (order: weather, mockup, dol as you described: 3-2-1 etc.)
// Also add userSeats per plan.
const planDefs = [
  {
    slug: "solo",
    name: "Solo",
    monthlyTokens: 750,
    limits: {
      userSeats: 1,
      daily: { weather_claim: 3, mockup: 2, dol_pull: 1 },
    },
  },
  {
    slug: "pro",
    name: "Pro",
    monthlyTokens: 2500,
    limits: {
      userSeats: 3,
      daily: { weather_claim: 5, mockup: 3, dol_pull: 2 },
    },
  },
  {
    slug: "business",
    name: "Business",
    monthlyTokens: 6000,
    limits: {
      userSeats: 10,
      daily: { weather_claim: 15, mockup: 5, dol_pull: 3 },
    },
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    monthlyTokens: 20000,
    limits: {
      userSeats: 50,
      daily: { weather_claim: 50, mockup: 15, dol_pull: 10 },
    },
  },
];

async function main() {
  // Upsert plans (assumes Plan has: slug unique, name, monthlyTokens Int, limits Json, monthlyPriceId String?)
  for (const p of planDefs) {
    await prisma.plan.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        monthlyTokens: p.monthlyTokens,
        limits: p.limits as any,
        isActive: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        stripeProductId:
          process.env[`STRIPE_PRODUCT_${p.slug.toUpperCase()}`] ?? `prod_${p.slug}_placeholder`,
        stripePriceId:
          process.env[`STRIPE_PRICE_${p.slug.toUpperCase()}`] ?? `price_${p.slug}_placeholder`,
        monthlyPriceId:
          process.env[`STRIPE_PRICE_${p.slug.toUpperCase()}_MONTHLY`] ??
          `price_${p.slug}_monthly_placeholder`,
        monthlyTokens: p.monthlyTokens,
        limits: p.limits as any,
        isActive: true,
      },
    });
  }

  console.log("Plan limits seeded.");
  console.log(
    "Remember: Tool catalog is defined in code; adjust in src/lib/tools.ts for central control."
  );
}

main().finally(() => prisma.$disconnect());

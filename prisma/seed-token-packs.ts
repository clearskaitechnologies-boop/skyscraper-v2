import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating TokenPack records...");

  // First, clear any existing token packs to avoid conflicts
  await prisma.tokenPack.deleteMany({});

  // Create new token packs with proper structure
  const packs = [
    {
      slug: "small",
      name: "Small Pack",
      tokens: 1000,
      priceCents: 999,
      stripePriceId: process.env.STRIPE_PRICE_PACK_SMALL || null,
    },
    {
      slug: "standard",
      name: "Standard Pack",
      tokens: 3000,
      priceCents: 2499,
      stripePriceId: process.env.STRIPE_PRICE_PACK_STANDARD || null,
    },
    {
      slug: "pro",
      name: "Pro Pack",
      tokens: 10000,
      priceCents: 6999,
      stripePriceId: process.env.STRIPE_PRICE_PACK_PRO || null,
    },
  ];

  for (const pack of packs) {
    await prisma.tokenPack.create({
      data: {
        slug: pack.slug,
        name: pack.name,
        tokens: pack.tokens,
        priceCents: pack.priceCents,
        currency: "usd",
        stripePriceId: pack.stripePriceId,
        isActive: true,
      },
    });
    console.log(`✅ Created ${pack.name}: ${pack.tokens} tokens for $${pack.priceCents / 100}`);
  }

  console.log("🎉 Token packs seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

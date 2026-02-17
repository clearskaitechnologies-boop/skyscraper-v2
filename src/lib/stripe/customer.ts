import prisma from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

const stripe = getStripeClient();

export async function getStripeCustomerIdForUser(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  // Check if user already has a Stripe customer ID
  const user = await prisma.$queryRaw<Array<{ stripe_customer_id: string | null }>>`
    SELECT stripe_customer_id FROM users WHERE id = ${userId}::uuid LIMIT 1
  `;

  const existing = user[0]?.stripe_customer_id;
  if (existing) return existing;

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId },
  });

  // Store customer ID in database
  await prisma.$executeRaw`
    UPDATE users SET stripe_customer_id = ${customer.id} WHERE id = ${userId}::uuid
  `;

  return customer.id;
}

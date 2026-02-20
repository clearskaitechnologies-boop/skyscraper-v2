#!/usr/bin/env node
// Schema Audit - Compare public vs app schemas using Prisma
const { PrismaClient } = require("@prisma/client");

async function main() {
  const p = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_DATABASE_URL } } });

  const tables = [
    "users",
    "claims",
    "Org",
    "leads",
    "user_organizations",
    "tradesCompanyMember",
    "tradesCompany",
    "Message",
    "contacts",
    "Client",
    "jobs",
    "Vendor",
    "Subscription",
    "activities",
    "_prisma_migrations",
    "MessageThread",
    "documents",
    "projects",
    "properties",
    "estimates",
    "TokenWallet",
    "org_branding",
    "token_usage",
    "tokens_ledger",
    "ai_reports",
    "api_keys",
    "weather_events",
    "BillingSettings",
    "Plan",
  ];

  console.log("TABLE                  | PUBLIC | APP    | STATUS");
  console.log("-----------------------+--------+--------+--------");

  for (const t of tables) {
    try {
      const pubRes = await p.$queryRawUnsafe('SELECT count(*)::int as n FROM public."' + t + '"');
      const appRes = await p.$queryRawUnsafe('SELECT count(*)::int as n FROM app."' + t + '"');
      const pub = pubRes[0].n;
      const app = appRes[0].n;
      const status = pub === app ? "SAME" : pub > app ? "PUBLIC > APP" : "APP > PUBLIC";
      const flag = pub !== app ? " !!!" : "";
      console.log(
        t.padEnd(22) +
          " | " +
          String(pub).padEnd(6) +
          " | " +
          String(app).padEnd(6) +
          " | " +
          status +
          flag
      );
    } catch (e) {
      console.log(t.padEnd(22) + " | SKIP - " + e.message.slice(0, 40));
    }
  }

  await p.$disconnect();
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});

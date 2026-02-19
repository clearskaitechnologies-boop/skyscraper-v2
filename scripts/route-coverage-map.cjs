#!/usr/bin/env node

/**
 * Route Coverage Map — Sprint 26
 * ────────────────────────────────
 * Scans all Next.js API routes and reports:
 *   ✅ Auth guard (withAuth / withOrgScope / requireAuth / requirePermission)
 *   ✅ Billing guard (requireActiveSubscription)
 *   ✅ Rate limit (checkRateLimit)
 *   ✅ RBAC (withAdmin / withManager / requirePermission)
 *
 * Usage:  node scripts/route-coverage-map.js
 *         node scripts/route-coverage-map.js --json
 *         node scripts/route-coverage-map.js --unprotected
 */

const fs = require("fs");
const path = require("path");

const API_ROOT = path.join(__dirname, "..", "src", "app", "api");

const AUTH_PATTERNS = [
  /withAuth/,
  /withOrgScope/,
  /withAdmin/,
  /withManager/,
  /requireAuth/,
  /requirePermission/,
  /requireTenant/,
  /auth\(\)/,
  /safeOrgContext/,
  /requireOrgContext/,
  /getActiveOrgContext/,
  /getOrgContext/,
  /CRON_SECRET/,
  /verifyCronSecret/,
  /currentUser\(\)/,
  /requirePortalAuth/,
  /assertPortalAccess/,
  /requireApiAuth/,
  /getSessionOrgUser/,
  /getResolvedOrgId/,
  /withAiBilling/,
  /getTenant/,
  /getSessionUser/,
  /verifySignature/,
  /x-api-key/i,
  /clerkClient/,
  /clerk\.users/,
  /requireAdmin/,
  /ensureRole/,
  /requireRole/,
  /resolveSession/,
  /getAuthenticatedUser/,
  /getRole/,
  /ourFileRouter/,
  /requireApiOrg/,
  /verifyClaimAccess/,
  /createUploadthing/i,
  /verifyHmac/i,
  /verifyWebhook/i,
];

const BILLING_PATTERNS = [/requireActiveSubscription/, /checkSubscription/, /billingGuard/];

const RATE_LIMIT_PATTERNS = [/checkRateLimit/, /rateLimit/, /rateLimiter/];

const RBAC_PATTERNS = [/withAdmin/, /withManager/, /requirePermission/, /roles?\s*[:=]/];

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function findRoutes(dir, routes = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findRoutes(fullPath, routes);
    } else if (entry.name === "route.ts" || entry.name === "route.js") {
      routes.push(fullPath);
    }
  }
  return routes;
}

function analyzeRoute(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(API_ROOT, filePath);
  const routePath = "/api/" + relativePath.replace(/\/route\.(ts|js)$/, "").replace(/\\/g, "/");

  // Detect exported HTTP methods
  const methods = HTTP_METHODS.filter((m) => {
    const re = new RegExp(`export\\s+(async\\s+)?function\\s+${m}\\b`);
    return re.test(content);
  });

  // Detect guards
  const hasAuth = AUTH_PATTERNS.some((p) => p.test(content));
  const hasBilling = BILLING_PATTERNS.some((p) => p.test(content));
  const hasRateLimit = RATE_LIMIT_PATTERNS.some((p) => p.test(content));
  const hasRbac = RBAC_PATTERNS.some((p) => p.test(content));

  // Detect if it's a webhook (special case — shouldn't have user auth)
  const isWebhook = routePath.includes("/webhooks/");
  const isHealth = routePath.includes("/health");
  const isPublic = routePath.includes("/public/") || isHealth;

  return {
    route: routePath,
    methods: methods.length ? methods : ["UNKNOWN"],
    auth: hasAuth,
    billing: hasBilling,
    rateLimit: hasRateLimit,
    rbac: hasRbac,
    isWebhook,
    isPublic,
    file: filePath,
  };
}

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes("--json");
  const unprotectedOnly = args.includes("--unprotected");

  if (!fs.existsSync(API_ROOT)) {
    console.error(`❌  API root not found: ${API_ROOT}`);
    process.exit(1);
  }

  const routeFiles = findRoutes(API_ROOT);
  const routes = routeFiles.map(analyzeRoute).sort((a, b) => a.route.localeCompare(b.route));

  // Stats
  const total = routes.length;
  const withAuth = routes.filter((r) => r.auth).length;
  const withBilling = routes.filter((r) => r.billing).length;
  const withRateLimit = routes.filter((r) => r.rateLimit).length;
  const withRbac = routes.filter((r) => r.rbac).length;
  const webhooks = routes.filter((r) => r.isWebhook).length;
  const publicRoutes = routes.filter((r) => r.isPublic).length;

  const unprotected = routes.filter((r) => !r.auth && !r.isWebhook && !r.isPublic);

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          summary: {
            total,
            withAuth,
            withBilling,
            withRateLimit,
            withRbac,
            webhooks,
            publicRoutes,
            unprotected: unprotected.length,
          },
          routes: unprotectedOnly ? unprotected : routes,
        },
        null,
        2
      )
    );
    return;
  }

  // Human-readable output
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║       ROUTE COVERAGE MAP — SkaiScraper Pro      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  console.log(`  Total API routes:      ${total}`);
  console.log(`  With auth guard:       ${withAuth} (${((withAuth / total) * 100).toFixed(1)}%)`);
  console.log(
    `  With billing guard:    ${withBilling} (${((withBilling / total) * 100).toFixed(1)}%)`
  );
  console.log(
    `  With rate limiting:    ${withRateLimit} (${((withRateLimit / total) * 100).toFixed(1)}%)`
  );
  console.log(`  With RBAC:             ${withRbac} (${((withRbac / total) * 100).toFixed(1)}%)`);
  console.log(`  Webhooks (no user auth): ${webhooks}`);
  console.log(`  Public/health:         ${publicRoutes}`);
  console.log(`  ⚠️  Unprotected:        ${unprotected.length}`);
  console.log("");

  if (unprotectedOnly) {
    if (unprotected.length === 0) {
      console.log("  ✅  All non-webhook, non-public routes have auth guards!\n");
      return;
    }
    console.log("  ⚠️  UNPROTECTED ROUTES (no auth guard, not webhook/public):\n");
    for (const r of unprotected) {
      console.log(`    ${r.methods.join(",")} ${r.route}`);
    }
    console.log("");
    return;
  }

  // Full table
  const pad = (s, n) => s.slice(0, n).padEnd(n);
  const header = `  ${pad("Route", 55)} ${pad("Methods", 12)} Auth  Bill  Rate  RBAC`;
  console.log(header);
  console.log("  " + "─".repeat(header.length - 2));

  for (const r of routes) {
    const flags = [
      r.auth ? "  ✅ " : "  ❌ ",
      r.hasBilling ? "  ✅ " : "  ·  ",
      r.rateLimit ? "  ✅ " : "  ·  ",
      r.rbac ? "  ✅ " : "  ·  ",
    ];
    const prefix = r.isWebhook ? "🔗" : r.isPublic ? "🌐" : "  ";
    console.log(
      `${prefix}${pad(r.route, 55)} ${pad(r.methods.join(","), 12)}${r.auth ? "  ✅ " : "  ❌ "}${r.billing ? "  ✅ " : "  ·  "}${r.rateLimit ? "  ✅ " : "  ·  "}${r.rbac ? "  ✅ " : "  ·  "}`
    );
  }

  console.log("\n  Legend: ✅ = present  ❌ = missing  · = N/A  🔗 = webhook  🌐 = public\n");

  if (unprotected.length > 0) {
    console.log("  ⚠️  UNPROTECTED ROUTES (need review):\n");
    for (const r of unprotected) {
      console.log(`    ❌ ${r.methods.join(",")} ${r.route}`);
    }
    console.log("");
  }
}

main();

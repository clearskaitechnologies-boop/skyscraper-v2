/** tools/validateRoutes.ts - Simple route status validator */

const base = process.env.ROUTE_VALIDATE_BASE || "http://localhost:3000";
const routes = [
  "/dashboard",
  "/claims",
  "/leads",
  "/vendors",
  "/reports",
  "/weather",
  "/map",
  "/teams",
  "/supplement",
  "/depreciation",
  "/materials",
  "/network",
  "/settings",
];

async function run() {
  let failures = 0;
  console.log(`Validating ${routes.length} routes against ${base}`);
  for (const r of routes) {
    try {
      const res = await fetch(base + r, { redirect: "manual" } as any);
      const ok = res.status >= 200 && res.status < 400;
      console.log(`${r} -> ${res.status}${ok ? "" : " ❌"}`);
      if (!ok) failures++;
    } catch (e: any) {
      console.log(`${r} -> ERROR ${e.message}`);
      failures++;
    }
  }
  if (failures > 0) {
    console.error(`Route validation failed for ${failures} route(s).`);
    process.exit(1);
  } else {
    console.log("All routes healthy ✅");
  }
}

run();

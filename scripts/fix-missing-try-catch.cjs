#!/usr/bin/env node

/**
 * Automated script to fix API routes missing try-catch blocks
 * Wraps the entire handler function body in try-catch with proper error logging
 */

const fs = require("fs");
const path = require("path");

// Routes that have been manually fixed already
const SKIP_ROUTES = [
  "src/app/api/webhooks/clerk/route.ts", // Already has try-catch
  "src/app/api/health/live/route.ts", // Already has try-catch
  "src/app/api/homeowner/profile/route.ts", // Just fixed
];

// Critical routes to fix first (from subagent analysis)
const PRIORITY_ROUTES = [
  "src/app/api/claims/[claimId]/ai/route.ts",
  "src/app/api/claims/[claimId]/ai/actions/route.ts",
  "src/app/api/claims/[claimId]/assets/route.ts",
  "src/app/api/claims/[claimId]/contractors/route.ts",
  "src/app/api/billing/portal/route.ts",
  "src/app/api/billing/stripe-link/route.ts",
  "src/app/api/auth/callback/route.ts",
  "src/app/api/auth/logout/route.ts",
];

function wrapHandlerInTryCatch(code, method) {
  const methodPattern = new RegExp(
    `export\\s+async\\s+function\\s+${method}\\s*\\([^)]*\\)\\s*{`,
    "s"
  );

  // Check if already has try-catch at the start
  const match = code.match(methodPattern);
  if (!match) return code;

  const handlerStart = match.index + match[0].length;
  const handlerBody = code.slice(handlerStart);

  // Check if first non-whitespace after { is "try"
  const afterBrace = handlerBody.trimStart();
  if (afterBrace.startsWith("try {")) {
    console.log(`  ✅ ${method} already has try-catch`);
    return code;
  }

  // Find the closing brace of the handler
  let depth = 1;
  let endIndex = 0;
  for (let i = 0; i < handlerBody.length; i++) {
    if (handlerBody[i] === "{") depth++;
    if (handlerBody[i] === "}") depth--;
    if (depth === 0) {
      endIndex = i;
      break;
    }
  }

  if (endIndex === 0) {
    console.log(`  ⚠️  Could not find handler end for ${method}`);
    return code;
  }

  const bodyToWrap = handlerBody.slice(0, endIndex);

  // Build new handler with try-catch
  const newBody = `
  try {${bodyToWrap}
  } catch (error) {
    logger.error('[${method}] Unhandled error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }`;

  const newCode = code.slice(0, handlerStart) + newBody + handlerBody.slice(endIndex);

  console.log(`  ✨ Added try-catch to ${method}`);
  return newCode;
}

function ensureLoggerImport(code) {
  if (code.includes('from "@/lib/logger"')) {
    return code;
  }

  // Find first import statement
  const firstImport = code.indexOf("import ");
  if (firstImport === -1) return code;

  // Insert logger import at the beginning of imports
  const insertion = 'import { logger } from "@/lib/logger";\n';
  return code.slice(0, firstImport) + insertion + code.slice(firstImport);
}

function ensureNextResponseImport(code) {
  if (code.includes("NextResponse")) {
    return code;
  }

  // Check if there's a Next import we can add to
  const nextImportMatch = code.match(/import\s+{([^}]+)}\s+from\s+["']next\/server["']/);
  if (nextImportMatch) {
    const existingImports = nextImportMatch[1];
    const newImports = existingImports + ", NextResponse";
    return code.replace(nextImportMatch[0], `import { ${newImports} } from "next/server"`);
  }

  // Otherwise add new import
  const firstImport = code.indexOf("import ");
  if (firstImport === -1) return code;
  const insertion = 'import { NextResponse } from "next/server";\n';
  return code.slice(0, firstImport) + insertion + code.slice(firstImport);
}

function fixRoute(filePath) {
  console.log(`\n📝 Processing: ${filePath}`);

  if (SKIP_ROUTES.some((skip) => filePath.includes(skip))) {
    console.log(`  ⏭️  Skipping (already fixed)`);
    return { fixed: false, reason: "skipped" };
  }

  let code = fs.readFileSync(filePath, "utf8");
  let modified = false;

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  for (const method of methods) {
    const pattern = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`, "s");
    if (pattern.test(code)) {
      const newCode = wrapHandlerInTryCatch(code, method);
      if (newCode !== code) {
        code = newCode;
        modified = true;
      }
    }
  }

  if (modified) {
    code = ensureLoggerImport(code);
    code = ensureNextResponseImport(code);
    fs.writeFileSync(filePath, code, "utf8");
    console.log(`  ✅ Fixed!`);
    return { fixed: true };
  }

  console.log(`  ℹ️  No changes needed`);
  return { fixed: false, reason: "no-changes" };
}

function main() {
  console.log("🚀 Starting try-catch fix automation\n");
  console.log("=".repeat(60));

  const stats = {
    total: 0,
    fixed: 0,
    skipped: 0,
    noChanges: 0,
    errors: 0,
  };

  // Fix priority routes first
  console.log("\n📌 PRIORITY ROUTES\n");
  for (const route of PRIORITY_ROUTES) {
    const fullPath = path.join(__dirname, "..", route);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Not found: ${route}`);
      continue;
    }
    stats.total++;
    try {
      const result = fixRoute(fullPath);
      if (result.fixed) stats.fixed++;
      else if (result.reason === "skipped") stats.skipped++;
      else stats.noChanges++;
    } catch (error) {
      console.error(`❌ Error processing ${route}:`, error.message);
      stats.errors++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total processed: ${stats.total}`);
  console.log(`✅ Fixed: ${stats.fixed}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);
  console.log(`ℹ️  No changes needed: ${stats.noChanges}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log("\n✨ Done!\n");
}

main();

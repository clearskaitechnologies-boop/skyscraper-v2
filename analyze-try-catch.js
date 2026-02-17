#!/usr/bin/env node
/**
 * Script to analyze API route files for missing try-catch blocks
 * Finds all route.ts files and checks if HTTP handlers have try-catch wrappers
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Find all route.ts files excluding archive folder
const findCommand = 'find src/app/api -name "route.ts" -not -path "*/archive/*"';
const files = execSync(findCommand, { encoding: "utf-8" })
  .trim()
  .split("\n")
  .filter((f) => f.length > 0);

console.log(`\n🔍 Found ${files.length} route files to analyze\n`);

const results = {
  totalRoutes: 0,
  totalHandlers: 0,
  handlersWithTryCatch: 0,
  handlersWithoutTryCatch: 0,
  filesWithIssues: [],
  exampleIssues: [],
};

// HTTP methods to check
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, "utf-8");
    results.totalRoutes++;

    // Find all exported async function handlers
    HTTP_METHODS.forEach((method) => {
      // Match: export async function GET/POST/etc(...)
      const handlerRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\s*\\(`, "g");
      const matches = content.match(handlerRegex);

      if (matches) {
        matches.forEach(() => {
          results.totalHandlers++;

          // Extract the function body
          const functionStartIdx = content.indexOf(`export async function ${method}`);

          // Find the function body by looking for the opening brace
          let braceCount = 0;
          let functionBodyStart = -1;
          let functionBodyEnd = -1;

          for (let i = functionStartIdx; i < content.length; i++) {
            if (content[i] === "{") {
              if (functionBodyStart === -1) functionBodyStart = i;
              braceCount++;
            } else if (content[i] === "}") {
              braceCount--;
              if (braceCount === 0) {
                functionBodyEnd = i;
                break;
              }
            }
          }

          if (functionBodyStart !== -1 && functionBodyEnd !== -1) {
            const functionBody = content.substring(functionBodyStart, functionBodyEnd + 1);

            // Check if the ENTIRE function body is wrapped in try-catch
            // Look for try { at the start (allowing whitespace) and catch at the end
            const lines = functionBody.split("\n");
            const meaningfulLines = lines.filter(
              (l) => l.trim().length > 0 && !l.trim().startsWith("//")
            );

            // Check if first meaningful line after opening brace is 'try'
            let hasTryCatchWrapper = false;
            if (meaningfulLines.length > 2) {
              const firstLine = meaningfulLines[1].trim(); // Skip the opening {
              const hasEarlyTry = firstLine.startsWith("try") || firstLine === "try {";

              // Check if there's a catch block
              const hasCatch = functionBody.includes("catch");

              hasTryCatchWrapper = hasEarlyTry && hasCatch;
            }

            if (hasTryCatchWrapper) {
              results.handlersWithTryCatch++;
            } else {
              results.handlersWithoutTryCatch++;

              // Add to issues list
              const fileIssue = results.filesWithIssues.find((f) => f.file === file);
              if (fileIssue) {
                fileIssue.handlers.push(method);
              } else {
                results.filesWithIssues.push({
                  file,
                  handlers: [method],
                });
              }

              // Store first few examples
              if (results.exampleIssues.length < 3) {
                // Extract a snippet
                const snippet = lines.slice(0, Math.min(15, lines.length)).join("\n");
                results.exampleIssues.push({
                  file,
                  handler: method,
                  snippet,
                });
              }
            }
          }
        });
      }
    });
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

// Print results
console.log("═".repeat(80));
console.log("📊 ANALYSIS RESULTS");
console.log("═".repeat(80));
console.log(`\n✅ Total route files checked: ${results.totalRoutes}`);
console.log(`✅ Total HTTP handlers found: ${results.totalHandlers}`);
console.log(`✅ Handlers WITH try-catch: ${results.handlersWithTryCatch}`);
console.log(`❌ Handlers WITHOUT try-catch: ${results.handlersWithoutTryCatch}`);

const percentageMissing = ((results.handlersWithoutTryCatch / results.totalHandlers) * 100).toFixed(
  1
);
console.log(`\n⚠️  ${percentageMissing}% of handlers are missing try-catch blocks\n`);

console.log("═".repeat(80));
console.log("🚨 FILES WITH MISSING TRY-CATCH BLOCKS");
console.log("═".repeat(80));

if (results.filesWithIssues.length === 0) {
  console.log("\n✅ All handlers have try-catch blocks!\n");
} else {
  console.log(`\nFound ${results.filesWithIssues.length} files with issues:\n`);

  // Group by directory for better readability
  const byDirectory = {};
  results.filesWithIssues.forEach(({ file, handlers }) => {
    const dir = path.dirname(file);
    if (!byDirectory[dir]) byDirectory[dir] = [];
    byDirectory[dir].push({ file: path.basename(file), handlers });
  });

  Object.keys(byDirectory)
    .sort()
    .forEach((dir) => {
      console.log(`\n📁 ${dir}/`);
      byDirectory[dir].forEach(({ file, handlers }) => {
        console.log(`   ❌ ${file} - ${handlers.join(", ")}`);
      });
    });
}

console.log("\n" + "═".repeat(80));
console.log("📝 EXAMPLE CODE SHOWING THE ISSUE");
console.log("═".repeat(80));

results.exampleIssues.forEach(({ file, handler, snippet }, idx) => {
  console.log(`\nExample ${idx + 1}: ${file}`);
  console.log(`Handler: ${handler}\n`);
  console.log("```typescript");
  console.log(snippet);
  console.log("```");
  console.log("\n❌ Missing try-catch wrapper - errors will crash the API route");
});

console.log("\n" + "═".repeat(80));
console.log("💡 RECOMMENDATION");
console.log("═".repeat(80));
console.log(`
All HTTP handlers should be wrapped in try-catch blocks to prevent:
1. Unhandled promise rejections
2. Server crashes  
3. Exposing internal errors to clients
4. Poor error logging

✅ CORRECT PATTERN:

export async function POST(req: NextRequest) {
  try {
    // ... handler logic
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('[Route] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
`);

// Exit with error code if issues found
process.exit(results.handlersWithoutTryCatch > 0 ? 1 : 0);

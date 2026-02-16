#!/usr/bin/env node

/**
 * Console to Logger Codemod
 *
 * Automates replacement of console.* calls with structured logger.
 *
 * Usage:
 *   node scripts/codemod-console-to-logger.js src/app/api
 *   node scripts/codemod-console-to-logger.js src/lib
 *
 * What it does:
 *   - Adds logger import if not present
 *   - console.log(...) -> logger.debug(...)
 *   - console.warn(...) -> logger.warn(...)
 *   - console.error(...) -> logger.error(...)
 *   - console.info(...) -> logger.info(...)
 *
 * Run with --dry-run to preview changes without writing.
 */

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");
const targetDir = process.argv.find(
  (arg) => !arg.startsWith("-") && arg !== process.argv[0] && arg !== process.argv[1]
);

if (!targetDir) {
  console.log("Usage: node scripts/codemod-console-to-logger.js <directory> [--dry-run]");
  process.exit(1);
}

const LOGGER_IMPORT = 'import { logger } from "@/lib/logger";';

const REPLACEMENTS = [
  // console.log with string template or message
  {
    pattern: /console\.log\((["'`].*?["'`])(?:,\s*(.+?))?\);/g,
    replacement: (match, msg, meta) => {
      if (meta) {
        return `logger.debug(${msg}, ${meta});`;
      }
      return `logger.debug(${msg});`;
    },
  },
  // console.log with variable (skip complex expressions)
  {
    pattern: /console\.log\(([a-zA-Z_][a-zA-Z0-9_]*)\);/g,
    replacement: (match, varName) => `logger.debug("${varName}", { ${varName} });`,
  },
  // console.warn
  {
    pattern: /console\.warn\((["'`].*?["'`])(?:,\s*(.+?))?\);/g,
    replacement: (match, msg, meta) => {
      if (meta) {
        return `logger.warn(${msg}, ${meta});`;
      }
      return `logger.warn(${msg});`;
    },
  },
  // console.error with Error object
  {
    pattern: /console\.error\((["'`].*?["'`]),\s*(err|error|e)\);/g,
    replacement: (match, msg, errVar) => `logger.error(${msg}, ${errVar});`,
  },
  // console.error simple
  {
    pattern: /console\.error\((["'`].*?["'`])\);/g,
    replacement: (match, msg) => `logger.error(${msg});`,
  },
  // console.info
  {
    pattern: /console\.info\((["'`].*?["'`])(?:,\s*(.+?))?\);/g,
    replacement: (match, msg, meta) => {
      if (meta) {
        return `logger.info(${msg}, ${meta});`;
      }
      return `logger.info(${msg});`;
    },
  },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;
  let changeCount = 0;

  // Skip if file doesn't have console calls
  if (!content.includes("console.")) {
    return { modified: false, changes: 0 };
  }

  // Skip test files
  if (
    filePath.includes(".test.") ||
    filePath.includes(".spec.") ||
    filePath.includes("__tests__")
  ) {
    return { modified: false, changes: 0 };
  }

  // Apply replacements
  for (const { pattern, replacement } of REPLACEMENTS) {
    const beforeLength = content.length;
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      if (content.length !== beforeLength || content.match(pattern)?.length !== matches.length) {
        changeCount += matches.length;
        modified = true;
      }
    }
  }

  // Add import if we made changes and import doesn't exist
  if (
    modified &&
    !content.includes('from "@/lib/logger"') &&
    !content.includes("from '@/lib/logger'")
  ) {
    // Find the first import statement
    const importMatch = content.match(/^(import .+;?\n)/m);
    if (importMatch) {
      const insertPos = content.indexOf(importMatch[0]) + importMatch[0].length;
      content = content.slice(0, insertPos) + LOGGER_IMPORT + "\n" + content.slice(insertPos);
    } else {
      // No imports, add at top
      content = LOGGER_IMPORT + "\n\n" + content;
    }
  }

  if (modified && !DRY_RUN) {
    fs.writeFileSync(filePath, content);
  }

  return { modified, changes: changeCount };
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Skip node_modules, .git, etc
      if (!file.startsWith(".") && file !== "node_modules") {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// Main
const fullPath = path.resolve(targetDir);
if (!fs.existsSync(fullPath)) {
  console.error(`Directory not found: ${fullPath}`);
  process.exit(1);
}

console.log(`\n🔍 Scanning ${fullPath}${DRY_RUN ? " (DRY RUN)" : ""}...\n`);

const files = walkDir(fullPath);
let totalModified = 0;
let totalChanges = 0;

for (const file of files) {
  const { modified, changes } = processFile(file);
  if (modified) {
    totalModified++;
    totalChanges += changes;
    const relativePath = path.relative(process.cwd(), file);
    console.log(`  ✅ ${relativePath} (${changes} changes)`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files modified: ${totalModified}`);
console.log(`   Total changes: ${totalChanges}`);
if (DRY_RUN) {
  console.log(`\n⚠️  DRY RUN - no files were actually modified.`);
  console.log(`   Run without --dry-run to apply changes.`);
}
console.log("");

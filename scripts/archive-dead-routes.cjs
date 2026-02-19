#!/usr/bin/env node
// Archive all confirmed dead API routes to archive/dead-api-routes/
const fs = require("fs");
const path = require("path");

const deadRoutes = JSON.parse(fs.readFileSync("/tmp/dead-routes.json", "utf8"));
const srcBase = "src/app/api";
const archiveBase = "archive/dead-api-routes";

let moved = 0;
let errors = 0;

function mkdirp(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

for (const r of deadRoutes) {
  const srcDir = path.join(srcBase, r);
  const destDir = path.join(archiveBase, r);

  if (!fs.existsSync(srcDir)) {
    console.log(`SKIP: ${srcDir} does not exist`);
    continue;
  }

  try {
    mkdirp(path.dirname(destDir));
    // Copy entire directory
    fs.cpSync(srcDir, destDir, { recursive: true });
    // Remove source
    fs.rmSync(srcDir, { recursive: true, force: true });
    moved++;
  } catch (e) {
    console.log(`ERROR: ${r} — ${e.message}`);
    errors++;
  }
}

// Clean up empty parent directories
function cleanEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      cleanEmptyDirs(full);
    }
  }
  // Recheck after recursion
  const remaining = fs.readdirSync(dir);
  if (remaining.length === 0 && dir !== srcBase) {
    fs.rmdirSync(dir);
    console.log(`CLEANED empty dir: ${dir}`);
  }
}

cleanEmptyDirs(srcBase);

console.log(`\nDone: ${moved} routes archived, ${errors} errors`);
console.log(`Archived to: ${archiveBase}/`);

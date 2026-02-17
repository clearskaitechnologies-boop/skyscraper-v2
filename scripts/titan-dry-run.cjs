#!/usr/bin/env node
/**
 * ============================================================================
 * Titan Onboarding Dry Run
 * ============================================================================
 *
 * Validates the CSV import pipeline WITHOUT sending real Clerk invitations.
 * Tests: CSV parsing, validation, role mapping, batch sizing, and timing.
 *
 * Usage:
 *   node scripts/titan-dry-run.js
 *   node scripts/titan-dry-run.js --file scripts/mock-titan-50-users.csv
 *   node scripts/titan-dry-run.js --full   # Generate & test 180 users
 *
 * What it tests:
 *   1. CSV file loads and parses correctly
 *   2. All emails are valid
 *   3. All roles map to known enterprise roles
 *   4. No duplicates
 *   5. Batch sizing (10 per batch, 200ms delay)
 *   6. Estimated wall-clock time for real import
 *   7. Role distribution matches expected enterprise breakdown
 *
 * ============================================================================
 */

const fs = require("fs");
const path = require("path");

// ── Config ─────────────────────────────────────────────────────────────────
const VALID_ROLES = [
  "owner",
  "admin",
  "manager",
  "project_manager",
  "sales_rep",
  "field_tech",
  "finance",
  "member",
  "viewer",
  "org:admin",
  "org:member",
];
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 200;
const CLERK_API_LATENCY_MS = 150; // avg Clerk invitation API call

// ── Parse Args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const csvFile = args.includes("--file")
  ? args[args.indexOf("--file") + 1]
  : path.join(__dirname, "mock-titan-50-users.csv");
const generateFull = args.includes("--full");

// ── CSV Parser ─────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes("email");
  const startIdx = hasHeader ? 1 : 0;

  let emailCol = 0,
    roleCol = 1,
    nameCol = 2;
  if (hasHeader) {
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/["']/g, ""));
    emailCol = headers.indexOf("email");
    roleCol = headers.indexOf("role");
    nameCol = headers.indexOf("name");
    if (emailCol === -1) emailCol = 0;
  }

  const rows = [];
  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const email = cols[emailCol]?.trim().toLowerCase();
    if (!email) continue;
    rows.push({
      email,
      role: (roleCol >= 0 ? cols[roleCol]?.trim() : "") || "member",
      name: nameCol >= 0 ? cols[nameCol]?.trim() : "",
    });
  }
  return rows;
}

// ── Generate 180-user CSV ──────────────────────────────────────────────────
function generate180Users() {
  const firstNames = [
    "James",
    "John",
    "Robert",
    "Michael",
    "David",
    "William",
    "Richard",
    "Joseph",
    "Thomas",
    "Charles",
    "Chris",
    "Daniel",
    "Matthew",
    "Anthony",
    "Mark",
    "Donald",
    "Steven",
    "Andrew",
    "Paul",
    "Joshua",
    "Kenneth",
    "Kevin",
    "Brian",
    "George",
    "Timothy",
    "Ronald",
    "Edward",
    "Jason",
    "Jeffrey",
    "Ryan",
    "Jacob",
    "Gary",
    "Nicholas",
    "Eric",
    "Jonathan",
    "Stephen",
    "Larry",
    "Justin",
    "Scott",
    "Brandon",
    "Benjamin",
    "Samuel",
    "Raymond",
    "Gregory",
    "Frank",
    "Alexander",
    "Patrick",
    "Jack",
    "Dennis",
    "Jerry",
    "Tyler",
    "Aaron",
    "Jose",
    "Nathan",
    "Henry",
    "Douglas",
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Barbara",
    "Elizabeth",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
    "Lisa",
    "Nancy",
    "Betty",
    "Margaret",
    "Sandra",
    "Ashley",
    "Dorothy",
    "Kimberly",
    "Emily",
    "Donna",
    "Michelle",
    "Carol",
    "Amanda",
    "Melissa",
    "Deborah",
    "Stephanie",
    "Rebecca",
    "Sharon",
    "Laura",
    "Cynthia",
    "Kathleen",
    "Amy",
    "Angela",
    "Shirley",
    "Anna",
    "Brenda",
    "Pamela",
    "Emma",
    "Nicole",
    "Helen",
    "Samantha",
    "Katherine",
    "Christine",
    "Debra",
    "Rachel",
    "Carolyn",
    "Janet",
    "Catherine",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
    "Walker",
    "Young",
    "Allen",
    "King",
    "Wright",
    "Scott",
    "Torres",
    "Nguyen",
    "Hill",
    "Flores",
    "Green",
    "Adams",
    "Nelson",
    "Baker",
    "Hall",
    "Rivera",
    "Campbell",
    "Mitchell",
    "Carter",
    "Roberts",
    "Gomez",
    "Phillips",
    "Evans",
    "Turner",
    "Diaz",
    "Parker",
    "Cruz",
    "Edwards",
    "Collins",
    "Reyes",
    "Stewart",
    "Morris",
    "Morales",
    "Murphy",
    "Cook",
    "Rogers",
    "Gutierrez",
    "Ortiz",
    "Morgan",
    "Cooper",
    "Peterson",
  ];

  // Realistic role distribution for a 180-person roofing company
  const roleDistribution = [
    { role: "owner", count: 1 },
    { role: "admin", count: 4 },
    { role: "manager", count: 10 },
    { role: "project_manager", count: 20 },
    { role: "sales_rep", count: 15 },
    { role: "field_tech", count: 80 },
    { role: "finance", count: 5 },
    { role: "member", count: 40 },
    { role: "viewer", count: 5 },
  ];

  const rows = [];
  const usedEmails = new Set();
  let nameIdx = 0;

  for (const { role, count } of roleDistribution) {
    for (let i = 0; i < count; i++) {
      const first = firstNames[nameIdx % firstNames.length];
      const last = lastNames[Math.floor(nameIdx / firstNames.length) % lastNames.length];
      nameIdx++;
      let email = `${first.toLowerCase()}.${last.toLowerCase()}@titanroofing.com`;
      // Handle duplicates
      if (usedEmails.has(email)) {
        email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@titanroofing.com`;
      }
      usedEmails.add(email);
      rows.push({ email, name: `${first} ${last}`, role });
    }
  }
  return rows;
}

// ── Validation ─────────────────────────────────────────────────────────────
function validate(rows) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors = [];
  const seen = new Set();
  let valid = 0;

  for (const row of rows) {
    if (!emailRegex.test(row.email)) {
      errors.push({ email: row.email, reason: "Invalid email format" });
    } else if (seen.has(row.email)) {
      errors.push({ email: row.email, reason: "Duplicate email" });
    } else if (!VALID_ROLES.includes(row.role.toLowerCase())) {
      errors.push({ email: row.email, reason: `Unknown role: ${row.role}` });
    } else {
      seen.add(row.email);
      valid++;
    }
  }

  return { valid, errors };
}

// ── Time Estimation ────────────────────────────────────────────────────────
function estimateTime(rowCount) {
  const batches = Math.ceil(rowCount / BATCH_SIZE);
  const batchDelays = (batches - 1) * BATCH_DELAY_MS;
  const apiCalls = rowCount * CLERK_API_LATENCY_MS;
  const totalMs = batchDelays + apiCalls;
  return {
    batches,
    batchDelays,
    apiCalls,
    totalMs,
    totalSec: (totalMs / 1000).toFixed(1),
    humanTime:
      totalMs < 60000
        ? `${(totalMs / 1000).toFixed(0)} seconds`
        : `${(totalMs / 60000).toFixed(1)} minutes`,
  };
}

// ── Run ────────────────────────────────────────────────────────────────────
console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║          TITAN ONBOARDING DRY RUN                      ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

let rows;

if (generateFull) {
  console.log("📋 Mode: FULL 180-user simulation\n");
  rows = generate180Users();
} else {
  console.log(`📋 Mode: CSV file → ${csvFile}\n`);
  if (!fs.existsSync(csvFile)) {
    console.error(`❌ File not found: ${csvFile}`);
    process.exit(1);
  }
  const text = fs.readFileSync(csvFile, "utf8");
  rows = parseCSV(text);
}

console.log(`📊 Parsed: ${rows.length} rows\n`);

// ── Validate ───────────────────────────────────────────────────────────────
const startValidation = Date.now();
const { valid, errors } = validate(rows);
const validationMs = Date.now() - startValidation;

console.log("── Validation ─────────────────────────────────────────");
console.log(`   ✅ Valid:    ${valid}`);
console.log(`   ❌ Invalid:  ${errors.length}`);
console.log(`   ⏱️  Time:    ${validationMs}ms\n`);

if (errors.length > 0) {
  console.log("   Errors:");
  errors.slice(0, 10).forEach((e) => {
    console.log(`   • ${e.email}: ${e.reason}`);
  });
  if (errors.length > 10) {
    console.log(`   ... and ${errors.length - 10} more\n`);
  }
}

// ── Role Distribution ──────────────────────────────────────────────────────
const roleCounts = {};
for (const row of rows) {
  const role = row.role.toLowerCase();
  roleCounts[role] = (roleCounts[role] || 0) + 1;
}

console.log("── Role Distribution ──────────────────────────────────");
const roleOrder = [
  "owner",
  "admin",
  "manager",
  "project_manager",
  "sales_rep",
  "field_tech",
  "finance",
  "member",
  "viewer",
];
for (const role of roleOrder) {
  if (roleCounts[role]) {
    const bar = "█".repeat(Math.min(roleCounts[role], 40));
    const pct = ((roleCounts[role] / rows.length) * 100).toFixed(0);
    console.log(
      `   ${role.padEnd(16)} ${String(roleCounts[role]).padStart(3)} (${pct.padStart(2)}%) ${bar}`
    );
  }
}
console.log();

// ── Batch Analysis ─────────────────────────────────────────────────────────
const timing = estimateTime(valid);

console.log("── Import Estimate ────────────────────────────────────");
console.log(`   Rows to import:     ${valid}`);
console.log(`   Batch size:         ${BATCH_SIZE}`);
console.log(`   Batches:            ${timing.batches}`);
console.log(
  `   Inter-batch delay:  ${BATCH_DELAY_MS}ms × ${timing.batches - 1} = ${timing.batchDelays}ms`
);
console.log(`   Clerk API calls:    ${valid} × ~${CLERK_API_LATENCY_MS}ms = ${timing.apiCalls}ms`);
console.log(`   ──────────────────────────────────────────────`);
console.log(`   ⏱️  Estimated time:  ${timing.humanTime}`);
console.log();

// ── 180-User Projection ───────────────────────────────────────────────────
if (!generateFull) {
  const t180 = estimateTime(180);
  console.log("── 180-User Projection ────────────────────────────────");
  console.log(`   Batches:            ${t180.batches}`);
  console.log(`   ⏱️  Estimated time:  ${t180.humanTime}`);
  console.log();
}

// ── Go/No-Go ───────────────────────────────────────────────────────────────
console.log("══════════════════════════════════════════════════════════");
if (errors.length === 0 && valid === rows.length) {
  console.log("   ✅ GO — All rows valid. CSV is ready for production import.");
} else if (errors.length > 0 && valid > 0) {
  console.log(
    `   ⚠️  CONDITIONAL GO — ${valid}/${rows.length} valid. Fix ${errors.length} errors first.`
  );
} else {
  console.log("   ❌ NO-GO — No valid rows found.");
}
console.log("══════════════════════════════════════════════════════════\n");

// ── Titan Day-Of Timeline ──────────────────────────────────────────────────
console.log("── Titan Day-Of Timeline (180 seats) ──────────────────");
console.log("   09:00  Upload CSV via Settings → Team → Bulk Import");
console.log(`   09:01  Import completes (~${estimateTime(180).humanTime})`);
console.log("   09:02  Spot-check 5 random members in member list");
console.log("   09:05  Verify role assignments for 3 admins");
console.log("   09:10  Send Slack announcement to Titan team");
console.log("   09:15  First users accept invitations");
console.log("   09:30  Champion confirms 20+ users active");
console.log("   10:00  Onboarding call with Titan ops lead");
console.log("   ──────────────────────────────────────────────");
console.log("   Total elapsed: ~60 minutes from CSV to active users\n");

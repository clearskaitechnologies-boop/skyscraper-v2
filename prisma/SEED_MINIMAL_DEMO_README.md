# Minimal Demo Seed Script

## Overview

This script creates a **clean, minimal demo environment** with proper foreign key constraint handling. It's designed to be **safe, repeatable, and production-ready**.

## What It Creates

- ✅ **2 Demo Contacts**: John Smith & Jane Smith
- ✅ **2 Property Profiles**: One in Phoenix, one in Scottsdale
- ✅ **2 Jobs**: One scheduled, one completed
- ✅ **2 Claims**: One open, one approved
- ✅ **2 Estimates**: One draft, one approved
- ✅ **2 Inspections**: One scheduled, one completed
- ✅ **2 Appointments**: One scheduled, one completed

## Why This Script Is Different

### ❌ Old Approach (Caused FK Errors)

```ts
// Only deleted by orgId - missed records linked by propertyId
await prisma.claims.deleteMany({ where: { orgId: org.id } });
await prisma.properties.deleteMany({ where: { orgId: org.id } }); // ❌ FK ERROR!
```

### ✅ New Approach (FK-Safe)

```ts
// 1. Gather all property IDs for the org
const propertyIds = properties.map((p) => p.id);

// 2. Delete dependent records by propertyId FIRST
await prisma.claims.deleteMany({ where: { propertyId: { in: propertyIds } } });
await prisma.estimates.deleteMany({ where: { projectId: { in: propertyIds } } });
await prisma.jobs.deleteMany({ where: { propertyId: { in: propertyIds } } });
await prisma.inspections.deleteMany({ where: { propertyId: { in: propertyIds } } });
await prisma.leads.deleteMany({ where: { propertyId: { in: propertyIds } } });

// 3. Now safe to delete properties
await prisma.properties.deleteMany({ where: { id: { in: propertyIds } } });
```

## Usage

### Run the seed script:

```bash
pnpm run seed:minimal-demo
```

### What happens:

1. **Finds your demo organization** (or uses the first available org)
2. **Safely cleans all existing data** using FK-safe deletion order
3. **Creates fresh minimal demo data** with all relationships intact
4. **Logs every step** so you can verify the data

## Output Example

```
🚀 Starting Minimal Demo Seed (FK-Safe)...

📍 Step 1: Finding/Creating demo organization...
✅ Using organization: My Demo Org (abc-123)

🧹 Step 2: Cleaning existing demo data (FK-safe order)...
   → Gathering property IDs...
   → Found 5 properties to clean
   → Deleting dependent records by propertyId...
      ✓ Deleted 3 appointments
      ✓ Deleted 8 claims
      ✓ Deleted 5 estimates
      ✓ Deleted 12 jobs
      ✓ Deleted 7 inspections
      ✓ Deleted 2 leads
      ✓ Deleted 15 property photos
   → Deleting properties...
      ✓ Deleted 5 properties
   → Deleting contacts and templates...
      ✓ Deleted 10 contacts
      ✓ Deleted 3 templates
✅ Cleanup complete!

👥 Step 3: Creating demo contacts...
✅ Created contact: John Smith (def-456)
✅ Created contact: Jane Smith (ghi-789)

🏠 Step 4: Creating property profiles...
✅ Created property: 123 Main Street (jkl-012)
✅ Created property: 456 Oak Avenue (mno-345)

📋 Step 5: Creating jobs...
✅ Created job: Storm Damage Assessment (pqr-678)
✅ Created job: Roof Inspection (stu-901)

📄 Step 6: Creating claims...
✅ Created claim: Hail Damage - Main Street Residence (vwx-234)
✅ Created claim: Wind Damage - Oak Avenue Property (yza-567)

💰 Step 7: Creating estimates...
✅ Created estimate: Roof Repair - Hail Damage (bcd-890)
✅ Created estimate: Tile Roof Repair - Wind Damage (efg-123)

🔍 Step 8: Creating inspections...
✅ Created inspection: damage_assessment (hij-456)
✅ Created inspection: final_inspection (klm-789)

📅 Step 9: Creating appointments...
✅ Created appointment: Initial Damage Assessment (nop-012)
✅ Created appointment: Final Walkthrough (qrs-345)

============================================================
🎉 MINIMAL DEMO SEED COMPLETE!
============================================================

📊 Summary:
   Organization: My Demo Org
   Contacts: 2 (John Smith, Jane Smith)
   Properties: 2 (Phoenix, Scottsdale)
   Jobs: 2 (1 scheduled, 1 completed)
   Claims: 2 (1 open, 1 approved)
   Estimates: 2 (1 draft, 1 approved)
   Inspections: 2 (1 scheduled, 1 completed)
   Appointments: 2 (1 scheduled, 1 completed)

✅ All foreign key constraints handled safely!
✅ Demo data is clean and repeatable!

💡 You can now run this script anytime to reset to minimal demo state.
```

## Benefits

✅ **No More FK Errors** - Deletes in the correct order every time  
✅ **Repeatable** - Run it multiple times safely  
✅ **Minimal** - Only creates essential demo data  
✅ **Well-Logged** - See exactly what's happening  
✅ **Production-Safe** - Uses proper Prisma patterns

## Troubleshooting

### Error: "No organization found"

**Solution**: Create an organization first through your app, or manually create one in the database.

### Error: "Foreign key constraint violation"

**Solution**: This script should prevent this, but if it happens, check:

1. Are there custom relationships in your schema?
2. Did you add new tables that reference properties?
3. Update the cleanup section to include those tables.

### Want to keep some data?

**Solution**: Modify the cleanup section (Step 2) to skip certain deletions:

```ts
// Comment out to keep existing jobs
// await prisma.jobs.deleteMany({ where: { propertyId: { in: propertyIds } } });
```

## Extending the Script

### Add more demo users:

```ts
const user3 = await prisma.contacts.create({
  data: {
    orgId: demoOrg.id,
    first_name: "Bob",
    last_name: "Johnson",
    email: "bob.johnson@example.com",
    phone: "+1-555-0102",
  },
});
```

### Add more properties:

```ts
const property3 = await prisma.properties.create({
  data: {
    orgId: demoOrg.id,
    contactId: user3.id,
    address: "789 Pine Lane",
    city: "Tempe",
    state: "AZ",
    zip: "85281",
  },
});
```

## Related Scripts

- **`seed:demo`** - Full Arizona Storm demo with extensive data
- **`seed:emergency-demo`** - Quick 2-claim demo seed
- **`seed:vendors`** - Vendor/marketplace seed data

---

**Created**: January 19, 2026  
**Author**: GitHub Copilot  
**Version**: 1.0.0 - FK-Safe Edition

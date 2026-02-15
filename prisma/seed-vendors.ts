import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedVendors() {
  console.log("🌱 Seeding vendors...");

  // GAF
  const gaf = await prisma.vendor.create({
    data: {
      slug: "gaf",
      name: "GAF",
      description:
        "North America's largest roofing manufacturer with advanced roofing systems and warranties for residential and commercial applications.",
      website: "https://www.gaf.com",
      category: "Roofing Manufacturer",
      primaryPhone: "1-877-423-7663",
      primaryEmail: "customercare@gaf.com",
      verifiedAt: new Date(),
    },
  });

  // ABC Supply
  const abc = await prisma.vendor.create({
    data: {
      slug: "abc-supply",
      name: "ABC Supply",
      description:
        "One of the nation's largest wholesale distributors of roofing, siding, windows, and building materials.",
      website: "https://www.abcsupply.com",
      category: "Building Supply",
      primaryPhone: "1-800-786-2305",
      primaryEmail: "customerservice@abcsupply.com",
      verifiedAt: new Date(),
    },
  });

  // Elite Roofing Supply
  const elite = await prisma.vendor.create({
    data: {
      slug: "elite-roofing-supply",
      name: "Elite Roofing Supply",
      description:
        "Premier distributor of roofing materials and building products across Arizona with expert service and competitive pricing.",
      website: "https://www.eliteroofingsupply.com",
      category: "Distributor",
      primaryPhone: "602-272-7663",
      primaryEmail: "info@eliteroofingsupply.com",
      verifiedAt: new Date(),
    },
  });

  // SRS Distribution
  const srs = await prisma.vendor.create({
    data: {
      slug: "srs-distribution",
      name: "SRS Distribution",
      description:
        "Leading residential specialty trade distribution company providing roofing, pool, and landscape products.",
      website: "https://www.srs-roofing.com",
      category: "Distributor",
      primaryPhone: "1-866-480-0920",
      primaryEmail: "info@srsdistribution.com",
      verifiedAt: new Date(),
    },
  });

  // Westlake Royal Building Products
  const westlake = await prisma.vendor.create({
    data: {
      slug: "westlake-royal",
      name: "Westlake Royal Building Products",
      description:
        "Manufacturer of innovative exterior building products including siding, trim, stone veneer, and roofing accessories.",
      website: "https://www.westlakeroyalbuildingproducts.com",
      category: "Building Products Manufacturer",
      primaryPhone: "1-844-787-5878",
      primaryEmail: "info@westlakeroyal.com",
      verifiedAt: new Date(),
    },
  });

  console.log("✅ Created 5 vendors");

  // ABC Supply Locations
  const abcPhoenixNorth = await prisma.vendorLocation.create({
    data: {
      vendorId: abc.id,
      name: "ABC Supply - Phoenix North",
      address: "2102 W Deer Valley Rd",
      city: "Phoenix",
      state: "AZ",
      zip: "85027",
      phone: "602-866-3500",
      hours: {
        mon: "7:00 AM - 5:00 PM",
        tue: "7:00 AM - 5:00 PM",
        wed: "7:00 AM - 5:00 PM",
        thu: "7:00 AM - 5:00 PM",
        fri: "7:00 AM - 5:00 PM",
        sat: "8:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "33.6823",
      lng: "-112.0945",
    },
  });

  const abcPhoenixSouth = await prisma.vendorLocation.create({
    data: {
      vendorId: abc.id,
      name: "ABC Supply - Phoenix South",
      address: "1102 W Jackson St",
      city: "Phoenix",
      state: "AZ",
      zip: "85007",
      phone: "602-257-1184",
      hours: {
        mon: "7:00 AM - 5:00 PM",
        tue: "7:00 AM - 5:00 PM",
        wed: "7:00 AM - 5:00 PM",
        thu: "7:00 AM - 5:00 PM",
        fri: "7:00 AM - 5:00 PM",
        sat: "8:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "33.4526",
      lng: "-112.0862",
    },
  });

  const abcScottsdale = await prisma.vendorLocation.create({
    data: {
      vendorId: abc.id,
      name: "ABC Supply - Scottsdale",
      address: "7330 E Butherus Dr",
      city: "Scottsdale",
      state: "AZ",
      zip: "85260",
      phone: "480-998-8844",
      hours: {
        mon: "7:00 AM - 5:00 PM",
        tue: "7:00 AM - 5:00 PM",
        wed: "7:00 AM - 5:00 PM",
        thu: "7:00 AM - 5:00 PM",
        fri: "7:00 AM - 5:00 PM",
        sat: "8:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "33.4990",
      lng: "-111.9268",
    },
  });

  const abcMesa = await prisma.vendorLocation.create({
    data: {
      vendorId: abc.id,
      name: "ABC Supply - Mesa",
      address: "1855 W Main St",
      city: "Mesa",
      state: "AZ",
      zip: "85201",
      phone: "480-969-4563",
      hours: {
        mon: "7:00 AM - 5:00 PM",
        tue: "7:00 AM - 5:00 PM",
        wed: "7:00 AM - 5:00 PM",
        thu: "7:00 AM - 5:00 PM",
        fri: "7:00 AM - 5:00 PM",
        sat: "8:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "33.4152",
      lng: "-111.8677",
    },
  });

  const abcPrescott = await prisma.vendorLocation.create({
    data: {
      vendorId: abc.id,
      name: "ABC Supply - Prescott",
      address: "3250 Gateway Blvd",
      city: "Prescott",
      state: "AZ",
      zip: "86303",
      phone: "928-445-8701",
      hours: {
        mon: "7:00 AM - 5:00 PM",
        tue: "7:00 AM - 5:00 PM",
        wed: "7:00 AM - 5:00 PM",
        thu: "7:00 AM - 5:00 PM",
        fri: "7:00 AM - 5:00 PM",
        sat: "8:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "34.5400",
      lng: "-112.4685",
    },
  });

  const abcFlagstaff = await prisma.vendorLocation.create({
    data: {
      vendorId: abc.id,
      name: "ABC Supply - Flagstaff",
      address: "2601 E Butler Ave",
      city: "Flagstaff",
      state: "AZ",
      zip: "86004",
      phone: "928-526-2919",
      hours: {
        mon: "7:00 AM - 5:00 PM",
        tue: "7:00 AM - 5:00 PM",
        wed: "7:00 AM - 5:00 PM",
        thu: "7:00 AM - 5:00 PM",
        fri: "7:00 AM - 5:00 PM",
        sat: "8:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "35.1983",
      lng: "-111.6513",
    },
  });

  const abcShowLow = await prisma.vendorLocation.create({
    data: {
      vendorId: abc.id,
      name: "ABC Supply - Show Low",
      address: "1891 S White Mountain Rd",
      city: "Show Low",
      state: "AZ",
      zip: "85901",
      phone: "928-537-8050",
      hours: {
        mon: "7:00 AM - 5:00 PM",
        tue: "7:00 AM - 5:00 PM",
        wed: "7:00 AM - 5:00 PM",
        thu: "7:00 AM - 5:00 PM",
        fri: "7:00 AM - 5:00 PM",
        sat: "8:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "34.2542",
      lng: "-110.0298",
    },
  });

  // Elite Roofing Supply Locations
  const elitePhoenix = await prisma.vendorLocation.create({
    data: {
      vendorId: elite.id,
      name: "Elite Roofing Supply - Phoenix",
      address: "3033 W McDowell Rd",
      city: "Phoenix",
      state: "AZ",
      zip: "85009",
      phone: "602-272-7663",
      hours: {
        mon: "6:00 AM - 5:00 PM",
        tue: "6:00 AM - 5:00 PM",
        wed: "6:00 AM - 5:00 PM",
        thu: "6:00 AM - 5:00 PM",
        fri: "6:00 AM - 5:00 PM",
        sat: "7:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "33.4656",
      lng: "-112.1188",
    },
  });

  const eliteTempe = await prisma.vendorLocation.create({
    data: {
      vendorId: elite.id,
      name: "Elite Roofing Supply - Tempe",
      address: "1750 E Baseline Rd",
      city: "Tempe",
      state: "AZ",
      zip: "85283",
      phone: "480-456-7663",
      hours: {
        mon: "6:00 AM - 5:00 PM",
        tue: "6:00 AM - 5:00 PM",
        wed: "6:00 AM - 5:00 PM",
        thu: "6:00 AM - 5:00 PM",
        fri: "6:00 AM - 5:00 PM",
        sat: "7:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "33.3783",
      lng: "-111.9098",
    },
  });

  // SRS Distribution Locations
  const srsPhoenix = await prisma.vendorLocation.create({
    data: {
      vendorId: srs.id,
      name: "SRS Distribution - Phoenix",
      address: "3410 E Washington St",
      city: "Phoenix",
      state: "AZ",
      zip: "85034",
      phone: "602-275-5515",
      hours: {
        mon: "6:30 AM - 5:00 PM",
        tue: "6:30 AM - 5:00 PM",
        wed: "6:30 AM - 5:00 PM",
        thu: "6:30 AM - 5:00 PM",
        fri: "6:30 AM - 5:00 PM",
        sat: "7:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "33.4484",
      lng: "-112.0166",
    },
  });

  const srsTucson = await prisma.vendorLocation.create({
    data: {
      vendorId: srs.id,
      name: "SRS Distribution - Tucson",
      address: "1850 E 44th St",
      city: "Tucson",
      state: "AZ",
      zip: "85713",
      phone: "520-792-4555",
      hours: {
        mon: "6:30 AM - 5:00 PM",
        tue: "6:30 AM - 5:00 PM",
        wed: "6:30 AM - 5:00 PM",
        thu: "6:30 AM - 5:00 PM",
        fri: "6:30 AM - 5:00 PM",
        sat: "7:00 AM - 12:00 PM",
        sun: "Closed",
      },
      lat: "32.1875",
      lng: "-110.9419",
    },
  });

  console.log("✅ Created 8 locations");

  // Contacts
  await prisma.vendorContact.createMany({
    data: [
      {
        vendorId: abc.id,
        locationId: abcPhoenixNorth.id,
        name: "Mike Johnson",
        title: "Sales Manager",
        email: "mike.johnson@abcsupply.com",
        phone: "602-866-3500",
        territory: ["Phoenix", "North Valley"],
      },
      {
        vendorId: abc.id,
        locationId: abcScottsdale.id,
        name: "Sarah Williams",
        title: "Territory Sales Representative",
        email: "sarah.williams@abcsupply.com",
        phone: "480-998-8844",
        territory: ["Scottsdale", "Paradise Valley", "Cave Creek"],
      },
      {
        vendorId: elite.id,
        locationId: elitePhoenix.id,
        name: "David Martinez",
        title: "Commercial Sales",
        email: "dmartinez@eliteroofingsupply.com",
        phone: "602-272-7663",
        territory: ["Phoenix Metro"],
      },
      {
        vendorId: srs.id,
        locationId: srsPhoenix.id,
        name: "Jennifer Lopez",
        title: "Branch Manager",
        email: "jlopez@srsdistribution.com",
        phone: "602-275-5515",
        territory: ["Phoenix", "Tempe", "Mesa"],
      },
    ],
  });

  console.log("✅ Created 4 contacts");

  // Resources - All hosted internally to prevent 404s
  await prisma.vendorResource.createMany({
    data: [
      // GAF
      {
        vendorId: gaf.id,
        title: "GAF Timberline HDZ Shingles Brochure",
        description: "Product overview of Timberline HDZ shingles with LayerLock technology",
        type: "brochure",
        url: "/vendor-resources/gaf/timberline-hdz-shingles-brochure.pdf",
        format: "PDF",
        fileSize: "2.5 MB",
        category: "Product Literature",
        tags: ["shingles", "residential", "warranty"],
      },
      {
        vendorId: gaf.id,
        title: "GAF System Warranty Guide",
        description: "Comprehensive warranty information for GAF roofing systems",
        type: "warranty",
        url: "/vendor-resources/gaf/system-warranty-guide.pdf",
        format: "PDF",
        fileSize: "1.8 MB",
        category: "Warranty",
        tags: ["warranty", "installation", "system"],
      },
      {
        vendorId: gaf.id,
        title: "Residential Roofing Installation Manual",
        description: "Detailed installation instructions for GAF residential products",
        type: "installation_guide",
        url: "/vendor-resources/gaf/residential-installation-manual.pdf",
        format: "PDF",
        fileSize: "4.2 MB",
        category: "Installation",
        tags: ["installation", "manual", "residential"],
      },
      // ABC Supply
      {
        vendorId: abc.id,
        title: "ABC Supply 2024 Product Catalog",
        description: "Complete catalog of roofing materials, tools, and accessories",
        type: "catalog",
        url: "/vendor-resources/abc-supply/2024-product-catalog.pdf",
        format: "PDF",
        fileSize: "8.5 MB",
        category: "Catalog",
        tags: ["products", "catalog", "tools"],
      },
      {
        vendorId: abc.id,
        title: "Roofing Accessories Guide",
        description: "Comprehensive guide to ventilation, flashing, and roofing accessories",
        type: "catalog",
        url: "/vendor-resources/abc-supply/accessories-guide.pdf",
        format: "PDF",
        fileSize: "3.1 MB",
        category: "Product Guide",
        tags: ["accessories", "ventilation", "flashing"],
      },
      // Elite
      {
        vendorId: elite.id,
        title: "Elite Roofing Product Line Card",
        description: "Overview of all roofing brands and products available through Elite",
        type: "catalog",
        url: "/vendor-resources/elite/product-line-card.pdf",
        format: "PDF",
        fileSize: "1.2 MB",
        category: "Product Overview",
        tags: ["brands", "products", "overview"],
      },
      // SRS
      {
        vendorId: srs.id,
        title: "SRS Residential Roofing Catalog",
        description: "Full catalog of residential roofing products and materials",
        type: "catalog",
        url: "/vendor-resources/srs/residential-catalog.pdf",
        format: "PDF",
        fileSize: "5.7 MB",
        category: "Catalog",
        tags: ["residential", "catalog", "materials"],
      },
      // Westlake
      {
        vendorId: westlake.id,
        title: "Westlake Royal Product Catalog",
        description:
          "Complete catalog of building products including siding, trim, and accessories",
        type: "catalog",
        url: "/vendor-resources/westlake/product-catalog.pdf",
        format: "PDF",
        fileSize: "6.3 MB",
        category: "Catalog",
        tags: ["siding", "trim", "building-products"],
      },
      {
        vendorId: westlake.id,
        title: "Installation Guide - Vinyl Siding",
        description: "Professional installation instructions for Westlake vinyl siding products",
        type: "installation_guide",
        url: "/vendor-resources/westlake/installation-guide-vinyl-siding.pdf",
        format: "PDF",
        fileSize: "2.9 MB",
        category: "Installation",
        tags: ["siding", "installation", "vinyl"],
      },
    ],
  });

  console.log("✅ Created 10 resources");
  console.log("🎉 Phase 2 vendor seeding complete!");
}

seedVendors()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Demo Data Layer
 *
 * Mock data for Tuesday Demo Mode - represents the full Trades Network vision
 * without requiring database migrations.
 *
 * Enable via: NEXT_PUBLIC_DEMO_MODE=true
 */

// ============================================================================
// TYPES
// ============================================================================

export type DemoVendor = {
  id: string;
  slug: string;
  name: string;
  logo: string;
  tagline: string;
  founded: number;
  headquarters: string;
  website: string;
  description: string;
  products: string[];
  locations: DemoLocation[];
  representatives: DemoContact[];
  brochures: DemoBrochure[];
  stats: {
    locationsCount: number;
    yearsInBusiness: number;
    rating: number;
    reviewCount: number;
  };
};

export type DemoLocation = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: string;
  manager: string;
  lat?: number;
  lng?: number;
};

export type DemoContact = {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  territory?: string;
  photo?: string;
};

export type DemoBrochure = {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "catalog" | "technical" | "promo";
};

export type DemoTradesPro = {
  id: string;
  name: string;
  company: string;
  trade: string;
  photo: string;
  bio: string;
  yearsExperience: number;
  certifications: string[];
  rating: number;
  reviewCount: number;
  location: string;
  recentJobs: DemoJob[];
};

export type DemoJob = {
  id: string;
  title: string;
  description: string;
  photo?: string;
  completedDate: string;
  clientName: string;
};

export type DemoClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "homeowner" | "realtor" | "property-manager";
  properties: DemoProperty[];
  savedPros: string[]; // pro IDs
};

export type DemoProperty = {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: "residential" | "commercial";
};

export type DemoMessage = {
  id: string;
  threadId: string;
  fromId: string;
  fromName: string;
  fromType: "client" | "pro" | "vendor";
  content: string;
  timestamp: string;
  read: boolean;
};

export type DemoJobRequest = {
  id: string;
  title: string;
  description: string;
  trade: string;
  status: "open" | "in-progress" | "completed";
  clientId: string;
  clientName: string;
  propertyAddress: string;
  budget?: string;
  timeline: string;
  createdAt: string;
  assignedProId?: string;
  assignedProName?: string;
  responses: DemoJobResponse[];
};

export type DemoJobResponse = {
  id: string;
  proId: string;
  proName: string;
  company: string;
  message: string;
  quote?: string;
  timestamp: string;
};

// ============================================================================
// VENDOR DATA (The Big 5)
// ============================================================================

export const DEMO_VENDORS: DemoVendor[] = [
  {
    id: "vendor-gaf",
    slug: "gaf",
    name: "GAF",
    logo: "/vendors/gaf-logo.png",
    tagline: "North America's Largest Roofing Manufacturer",
    founded: 1886,
    headquarters: "Parsippany, NJ",
    website: "gaf.com",
    description:
      "GAF has been the leading manufacturer of residential and commercial roofing for over 135 years. Known for innovative asphalt shingles, underlayments, and complete roofing systems backed by industry-leading warranties.",
    products: [
      "Asphalt Shingles",
      "Roof Underlayments",
      "Ventilation Systems",
      "Roof Coatings",
      "TPO & EPDM Membranes",
      "Accessories & Components",
    ],
    locations: [
      {
        id: "gaf-phoenix",
        address: "218 E Brook Hollow Dr",
        city: "Phoenix",
        state: "AZ",
        zip: "85022",
        phone: "(602) 555-0100",
        hours: "Mon-Fri 7:00 AM - 5:00 PM",
        manager: "Alan Minker",
        lat: 33.633,
        lng: -112.063,
      },
      {
        id: "gaf-tucson",
        address: "4550 S Palo Verde Rd",
        city: "Tucson",
        state: "AZ",
        zip: "85714",
        phone: "(520) 555-0200",
        hours: "Mon-Fri 7:00 AM - 5:00 PM",
        manager: "Michael Roush",
        lat: 32.185,
        lng: -110.926,
      },
    ],
    representatives: [
      {
        id: "gaf-rep-1",
        name: "Alan Minker",
        title: "Senior Commercial Manager",
        email: "alan.minker@gaf.com",
        phone: "(602) 555-0101",
        territory: "Arizona",
      },
      {
        id: "gaf-rep-2",
        name: "Michael Roush",
        title: "Sales Representative",
        email: "michael.roush@gaf.com",
        phone: "(520) 555-0201",
        territory: "Southern Arizona",
      },
    ],
    brochures: [
      {
        id: "gaf-brochure-1",
        title: "GAF Residential Roofing Catalog 2025",
        description: "Complete product line for residential applications",
        url: "/demo/brochures/gaf-residential-2025.pdf",
        type: "catalog",
      },
      {
        id: "gaf-brochure-2",
        title: "GAF Timberline HDZ Installation Guide",
        description: "Technical specifications and installation instructions",
        url: "/demo/brochures/gaf-timberline-install.pdf",
        type: "technical",
      },
    ],
    stats: {
      locationsCount: 29,
      yearsInBusiness: 139,
      rating: 4.8,
      reviewCount: 2847,
    },
  },
  {
    id: "vendor-abc",
    slug: "abc-supply",
    name: "ABC Supply Co.",
    logo: "/vendors/abc-logo.png",
    tagline: "North America's Leading Wholesale Distributor",
    founded: 1982,
    headquarters: "Beloit, WI",
    website: "abcsupply.com",
    description:
      "ABC Supply is the largest wholesale distributor of roofing and select exterior building products in North America. With over 1,000 locations and 20,000+ associates, ABC Supply offers contractors a complete source for materials and support.",
    products: [
      "Roofing Materials",
      "Siding & Trim",
      "Windows & Doors",
      "Gutters & Accessories",
      "Decking & Railing",
      "Tools & Fasteners",
    ],
    locations: [
      {
        id: "abc-prescott",
        address: "6701 E 1st St",
        city: "Prescott Valley",
        state: "AZ",
        zip: "86314",
        phone: "(928) 555-0300",
        hours: "Mon-Fri 6:30 AM - 5:00 PM, Sat 7:00 AM - 12:00 PM",
        manager: "Brandon Spencer",
        lat: 34.56,
        lng: -112.315,
      },
      {
        id: "abc-mesa",
        address: "107 S Beverly",
        city: "Mesa",
        state: "AZ",
        zip: "85210",
        phone: "(480) 555-0400",
        hours: "Mon-Fri 6:30 AM - 5:00 PM, Sat 7:00 AM - 12:00 PM",
        manager: "Jim Wright",
        lat: 33.415,
        lng: -111.824,
      },
      {
        id: "abc-flagstaff",
        address: "2599 E Butler Ave",
        city: "Flagstaff",
        state: "AZ",
        zip: "86004",
        phone: "(928) 555-0500",
        hours: "Mon-Fri 7:00 AM - 4:00 PM",
        manager: "Jason Dudek",
        lat: 35.198,
        lng: -111.605,
      },
    ],
    representatives: [
      {
        id: "abc-rep-1",
        name: "Brandon Spencer",
        title: "Branch Manager",
        email: "brandon.spencer@abcsupply.com",
        phone: "(928) 555-0301",
        territory: "Prescott Valley",
      },
      {
        id: "abc-rep-2",
        name: "Jim Wright",
        title: "Branch Manager",
        email: "jim.wright@abcsupply.com",
        phone: "(480) 555-0401",
        territory: "Mesa",
      },
      {
        id: "abc-rep-3",
        name: "Jason Dudek",
        title: "Branch Manager",
        email: "jason.dudek@abcsupply.com",
        phone: "(928) 555-0501",
        territory: "Flagstaff",
      },
    ],
    brochures: [
      {
        id: "abc-brochure-1",
        title: "ABC Supply Product Catalog 2025",
        description: "Complete product offerings across all categories",
        url: "/demo/brochures/abc-catalog-2025.pdf",
        type: "catalog",
      },
      {
        id: "abc-brochure-2",
        title: "Credit Application & Terms",
        description: "How to establish a contractor account with ABC Supply",
        url: "/demo/brochures/abc-credit-app.pdf",
        type: "promo",
      },
    ],
    stats: {
      locationsCount: 1056,
      yearsInBusiness: 43,
      rating: 4.6,
      reviewCount: 5234,
    },
  },
  {
    id: "vendor-elite",
    slug: "elite",
    name: "Elite Roofing Supply",
    logo: "/vendors/elite-logo.png",
    tagline: "Local Service, National Resources",
    founded: 2013,
    headquarters: "Glendale, AZ",
    website: "eliteroofingsupply.com",
    description:
      "Elite Roofing Supply is a regional distributor serving the Southwest with a network of independent branches. In 2023, Elite joined Gulfeagle Supply, combining local customer service with nationwide resources and inventory depth.",
    products: [
      "Residential Roofing",
      "Commercial Roofing",
      "Metal Roofing Systems",
      "Tile & Slate",
      "Flat Roof Systems",
      "Tools & Equipment Rental",
    ],
    locations: [
      {
        id: "elite-glendale",
        address: "4600 W Glendale Ave",
        city: "Glendale",
        state: "AZ",
        zip: "85301",
        phone: "(623) 555-0600",
        hours: "Mon-Fri 6:00 AM - 4:30 PM",
        manager: "Brian Merryman",
        lat: 33.539,
        lng: -112.163,
      },
      {
        id: "elite-phoenix",
        address: "2801 E Washington St",
        city: "Phoenix",
        state: "AZ",
        zip: "85034",
        phone: "(602) 555-0700",
        hours: "Mon-Fri 6:00 AM - 4:30 PM",
        manager: "Sarah Chen",
        lat: 33.448,
        lng: -112.025,
      },
    ],
    representatives: [
      {
        id: "elite-rep-1",
        name: "Brian Merryman",
        title: "Co-Founder & Managing Partner",
        email: "brian@eliteroofing.com",
        phone: "(623) 555-0601",
        territory: "Arizona",
      },
      {
        id: "elite-rep-2",
        name: "Sarah Chen",
        title: "Branch Manager",
        email: "schen@eliteroofing.com",
        phone: "(602) 555-0701",
        territory: "Phoenix Metro",
      },
    ],
    brochures: [
      {
        id: "elite-brochure-1",
        title: "Elite Product Line Card 2025",
        description: "Overview of available product lines and manufacturers",
        url: "/demo/brochures/elite-products.pdf",
        type: "catalog",
      },
    ],
    stats: {
      locationsCount: 14,
      yearsInBusiness: 12,
      rating: 4.7,
      reviewCount: 892,
    },
  },
  {
    id: "vendor-srs",
    slug: "srs",
    name: "SRS Distribution",
    logo: "/vendors/srs-logo.png",
    tagline: "A Family of Brands, Powered by The Home Depot",
    founded: 2008,
    headquarters: "McKinney, TX",
    website: "srsdistribution.com",
    description:
      "SRS Distribution is one of the fastest-growing distributors of roofing and building supplies, operating over 760 locations across 47 states. Acquired by The Home Depot in 2024, SRS operates as a 'family of brands' approach with specialized local expertise.",
    products: [
      "Roofing Materials (All Types)",
      "Exterior Building Products",
      "Landscape Supplies",
      "Pool & Hardscape",
      "Metal Fabrication",
      "Specialty Products",
    ],
    locations: [
      {
        id: "srs-prescott",
        address: "2980 Centerpointe East Dr",
        city: "Prescott",
        state: "AZ",
        zip: "86301",
        phone: "(928) 555-0800",
        hours: "Mon-Fri 6:00 AM - 4:00 PM",
        manager: "Jocelyn Moreno-Solis",
        lat: 34.541,
        lng: -112.436,
      },
      {
        id: "srs-tempe",
        address: "625 S Perry Ln",
        city: "Tempe",
        state: "AZ",
        zip: "85281",
        phone: "(480) 555-0900",
        hours: "Mon-Fri 6:00 AM - 4:00 PM",
        manager: "Aileen Serrano",
        lat: 33.411,
        lng: -111.945,
      },
    ],
    representatives: [
      {
        id: "srs-rep-1",
        name: "Jocelyn Moreno-Solis",
        title: "Branch Manager",
        email: "jmoreno@srs.com",
        phone: "(928) 555-0801",
        territory: "Prescott",
      },
      {
        id: "srs-rep-2",
        name: "Aileen Serrano",
        title: "Branch Manager",
        email: "aserrano@srs.com",
        phone: "(480) 555-0901",
        territory: "Tempe",
      },
    ],
    brochures: [
      {
        id: "srs-brochure-1",
        title: "SRS 2025 Promotions",
        description: "Current deals and volume pricing",
        url: "/demo/brochures/srs-promos.pdf",
        type: "promo",
      },
    ],
    stats: {
      locationsCount: 763,
      yearsInBusiness: 17,
      rating: 4.5,
      reviewCount: 3421,
    },
  },
  {
    id: "vendor-westlake",
    slug: "westlake",
    name: "Westlake Royal Roofing Solutions",
    logo: "/vendors/westlake-logo.png",
    tagline: "Premium Roofing Solutions",
    founded: 2022,
    headquarters: "Houston, TX",
    website: "westlake.com",
    description:
      "Westlake Royal Roofing Solutions was formed through Westlake's acquisition of Boral's building products and merger with Royal Building Products. We manufacture premium roofing products including concrete & clay tiles, stone-coated steel, and composite slate/shake under the DaVinci Roofscapes brand.",
    products: [
      "Concrete Roof Tiles",
      "Clay Roof Tiles",
      "Stone-Coated Steel",
      "Composite Slate & Shake",
      "Metal Roofing",
      "Accessories & Underlayments",
    ],
    locations: [
      {
        id: "westlake-phoenix",
        address: "1832 S 51st Ave",
        city: "Phoenix",
        state: "AZ",
        zip: "85043",
        phone: "(602) 555-1000",
        hours: "Mon-Fri 7:00 AM - 4:00 PM, By Appointment",
        manager: "Keaton Mower",
        lat: 33.436,
        lng: -112.162,
      },
    ],
    representatives: [
      {
        id: "westlake-rep-1",
        name: "Keaton Mower",
        title: "Territory Manager",
        email: "keaton.mower@westlake.com",
        phone: "(602) 555-1001",
        territory: "Arizona",
      },
      {
        id: "westlake-rep-2",
        name: "Steve Strick",
        title: "Regional Sales Manager",
        email: "steve.strick@westlake.com",
        phone: "(602) 555-1002",
        territory: "Southwest Region",
      },
      {
        id: "westlake-rep-3",
        name: "Madison Minder",
        title: "Design Consultant",
        email: "madison.minder@westlake.com",
        phone: "(602) 555-1003",
        territory: "Arizona",
      },
    ],
    brochures: [
      {
        id: "westlake-brochure-1",
        title: "Westlake Royal Roofing Catalog",
        description: "Complete product line and color options",
        url: "/demo/brochures/westlake-catalog.pdf",
        type: "catalog",
      },
      {
        id: "westlake-brochure-2",
        title: "Tile Installation Guide",
        description: "Best practices for concrete and clay tile installation",
        url: "/demo/brochures/westlake-install.pdf",
        type: "technical",
      },
    ],
    stats: {
      locationsCount: 42,
      yearsInBusiness: 3,
      rating: 4.9,
      reviewCount: 1247,
    },
  },
];

// ============================================================================
// TRADES PROFESSIONALS DATA
// ============================================================================

export const DEMO_TRADES_PROS: DemoTradesPro[] = [
  {
    id: "pro-1",
    name: "Marcus Rodriguez",
    company: "Apex Roofing Solutions",
    trade: "Roofing",
    photo: "/demo/avatars/pro-1.jpg",
    bio: "Master roofer specializing in tile and shingle installations. GAF Master Elite certified with 18 years of experience serving the Phoenix metro.",
    yearsExperience: 18,
    certifications: ["GAF Master Elite", "OSHA 30", "CertainTeed Shingle Master"],
    rating: 4.9,
    reviewCount: 147,
    location: "Phoenix, AZ",
    recentJobs: [
      {
        id: "job-1",
        title: "Complete Roof Replacement - Scottsdale",
        description: "3,200 sqft tile roof replacement on luxury home",
        photo: "/demo/jobs/roof-1.jpg",
        completedDate: "2025-12-10",
        clientName: "Jennifer M.",
      },
      {
        id: "job-2",
        title: "Storm Damage Repair - Paradise Valley",
        description: "Hail damage repair and insurance claim assistance",
        completedDate: "2025-11-28",
        clientName: "David K.",
      },
    ],
  },
  {
    id: "pro-2",
    name: "Sarah Thompson",
    company: "Desert HVAC Experts",
    trade: "HVAC",
    photo: "/demo/avatars/pro-2.jpg",
    bio: "Licensed HVAC technician with expertise in high-efficiency systems and desert climate optimization. NATE certified.",
    yearsExperience: 12,
    certifications: ["NATE Certified", "EPA 608 Universal", "Carrier Factory Authorized"],
    rating: 4.8,
    reviewCount: 203,
    location: "Tempe, AZ",
    recentJobs: [
      {
        id: "job-3",
        title: "AC System Replacement",
        description: "5-ton high-efficiency system installation",
        completedDate: "2025-12-15",
        clientName: "Robert L.",
      },
    ],
  },
  {
    id: "pro-3",
    name: "James Chen",
    company: "Chen Electrical Services",
    trade: "Electrical",
    photo: "/demo/avatars/pro-3.jpg",
    bio: "Master electrician serving Arizona for 15+ years. Specializing in residential rewires, panel upgrades, and solar integration.",
    yearsExperience: 15,
    certifications: ["AZ Master Electrician", "Solar PV Installer", "EV Charging Specialist"],
    rating: 5.0,
    reviewCount: 89,
    location: "Mesa, AZ",
    recentJobs: [
      {
        id: "job-4",
        title: "Whole Home Rewire - Gilbert",
        description: "Complete electrical system upgrade in 1980s home",
        completedDate: "2025-12-08",
        clientName: "Amanda S.",
      },
    ],
  },
];

// ============================================================================
// CLIENT DATA
// ============================================================================

export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: "client-1",
    name: "Jennifer Martinez",
    email: "jennifer.m@example.com",
    phone: "(480) 555-2001",
    type: "homeowner",
    properties: [
      {
        id: "prop-1",
        address: "8421 E Mountain View Rd",
        city: "Scottsdale",
        state: "AZ",
        zip: "85255",
        type: "residential",
      },
    ],
    savedPros: ["pro-1", "pro-2"],
  },
  {
    id: "client-2",
    name: "David Patel",
    email: "david.patel@example.com",
    phone: "(602) 555-2002",
    type: "property-manager",
    properties: [
      {
        id: "prop-2",
        address: "1234 N Central Ave #100",
        city: "Phoenix",
        state: "AZ",
        zip: "85004",
        type: "commercial",
      },
      {
        id: "prop-3",
        address: "5678 E Baseline Rd",
        city: "Tempe",
        state: "AZ",
        zip: "85283",
        type: "residential",
      },
    ],
    savedPros: ["pro-1", "pro-2", "pro-3"],
  },
];

// ============================================================================
// MESSAGES DATA
// ============================================================================

export const DEMO_MESSAGES: DemoMessage[] = [
  {
    id: "msg-1",
    threadId: "thread-1",
    fromId: "client-1",
    fromName: "Jennifer Martinez",
    fromType: "client",
    content:
      "Hi Marcus, I'd like to get a quote for replacing my tile roof. When would you be available for an inspection?",
    timestamp: "2025-12-18T09:15:00Z",
    read: true,
  },
  {
    id: "msg-2",
    threadId: "thread-1",
    fromId: "pro-1",
    fromName: "Marcus Rodriguez",
    fromType: "pro",
    content:
      "Hi Jennifer! I can come by tomorrow afternoon around 2 PM if that works for you. I'll bring some tile samples and color options.",
    timestamp: "2025-12-18T09:42:00Z",
    read: true,
  },
  {
    id: "msg-3",
    threadId: "thread-1",
    fromId: "client-1",
    fromName: "Jennifer Martinez",
    fromType: "client",
    content: "Perfect! 2 PM works great. See you then!",
    timestamp: "2025-12-18T10:03:00Z",
    read: false,
  },
];

// ============================================================================
// JOB REQUESTS DATA
// ============================================================================

export const DEMO_JOB_REQUESTS: DemoJobRequest[] = [
  {
    id: "jobreq-1",
    title: "Tile Roof Replacement - Scottsdale",
    description:
      "Need a complete tile roof replacement on my 3,200 sqft home. Current roof is 22 years old with some cracked tiles. Looking for quotes from certified roofers familiar with HOA requirements.",
    trade: "Roofing",
    status: "in-progress",
    clientId: "client-1",
    clientName: "Jennifer Martinez",
    propertyAddress: "8421 E Mountain View Rd, Scottsdale, AZ 85255",
    budget: "$25,000 - $35,000",
    timeline: "Next 30-45 days",
    createdAt: "2025-12-15T14:22:00Z",
    assignedProId: "pro-1",
    assignedProName: "Marcus Rodriguez",
    responses: [
      {
        id: "resp-1",
        proId: "pro-1",
        proName: "Marcus Rodriguez",
        company: "Apex Roofing Solutions",
        message:
          "I'd love to help with your tile roof replacement. I've completed several projects in your HOA and am familiar with the architectural guidelines. Can schedule an inspection this week.",
        quote: "$28,500",
        timestamp: "2025-12-15T16:45:00Z",
      },
    ],
  },
  {
    id: "jobreq-2",
    title: "AC System Replacement - Tempe Multi-Family",
    description:
      "12-unit apartment building needs 3 rooftop AC units replaced. Current units are 15+ years old and inefficient.",
    trade: "HVAC",
    status: "open",
    clientId: "client-2",
    clientName: "David Patel",
    propertyAddress: "5678 E Baseline Rd, Tempe, AZ 85283",
    budget: "Request quotes",
    timeline: "January 2026",
    createdAt: "2025-12-17T11:10:00Z",
    responses: [
      {
        id: "resp-2",
        proId: "pro-2",
        proName: "Sarah Thompson",
        company: "Desert HVAC Experts",
        message:
          "We specialize in commercial multi-family HVAC. Can provide a detailed proposal with high-efficiency options and financing.",
        timestamp: "2025-12-17T14:30:00Z",
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getVendorBySlug(slug: string): DemoVendor | undefined {
  return DEMO_VENDORS.find((v) => v.slug === slug);
}

export function getProById(id: string): DemoTradesPro | undefined {
  return DEMO_TRADES_PROS.find((p) => p.id === id);
}

export function getClientById(id: string): DemoClient | undefined {
  return DEMO_CLIENTS.find((c) => c.id === id);
}

export function getJobRequestById(id: string): DemoJobRequest | undefined {
  return DEMO_JOB_REQUESTS.find((j) => j.id === id);
}

export function getMessagesByThreadId(threadId: string): DemoMessage[] {
  return DEMO_MESSAGES.filter((m) => m.threadId === threadId);
}

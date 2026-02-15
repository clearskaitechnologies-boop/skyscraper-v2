export type Vendor = {
  slug: string;
  name: string;
  logoUrl: string;
  website?: string;
  categories: ("Shingle" | "Tile" | "Metal" | "Flat/TPO" | "Coatings" | "Accessories")[];
  warrantyUrl?: string;
  specsUrl?: string;
  docs?: { label: string; url: string }[];
  summary?: string;
  products?: string[];
  phone?: string;
  email?: string;
  productCatalog?: ProductCategory[];
  locations?: VendorLocation[];
};

export type VendorLocation = {
  city: string;
  state: string;
  address: string;
  phone: string;
  hours?: string;
  mapUrl?: string;
};

export type ProductCategory = {
  name: string;
  products: Product[];
};

export type Product = {
  id: string;
  name: string;
  type: string;
  description?: string;
  specs?: ProductSpec[];
  colors?: ColorOption[];
  warranty?: string;
  dataSheetUrl?: string;
  imageUrl?: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ColorOption = {
  name: string;
  hex?: string;
  imageUrl?: string;
};

export const VENDORS: Vendor[] = [
  {
    slug: "gaf",
    name: "GAF",
    logoUrl: "/images/vendors/gaf.png",
    website: "https://www.gaf.com",
    categories: ["Shingle", "Flat/TPO", "Accessories"],
    warrantyUrl: "https://www.gaf.com/en-us/for-homeowners/warranties",
    specsUrl: "https://www.gaf.com/en-us/roofing-materials",
    docs: [
      {
        label: "GAF QuickMeasure",
        url: "https://www.gaf.com/en-us/for-professionals/tools-and-services/quickmeasure",
      },
      {
        label: "GAF Measurements Resources",
        url: "https://www.gaf.com/en-us/for-professionals/tools-and-services",
      },
      {
        label: "Installation Guidelines",
        url: "https://www.gaf.com/en-us/for-professionals/resources/installation-guidelines",
      },
    ],
    summary:
      "North America's largest roofing manufacturer with full residential & commercial systems.",
    products: [
      "Timberline HDZ",
      "Timberline UHDZ",
      "EverGuard TPO",
      "Liberty SBS",
      "WeatherWatch",
      "FeltBuster",
    ],
    phone: "1-877-423-7663",
    email: "gafpro@gaf.com",
    locations: [
      {
        city: "Phoenix",
        state: "AZ",
        address: "3811 E University Dr, Phoenix, AZ 85034",
        phone: "(602) 273-4343",
        hours: "Mon-Fri: 6:00 AM - 5:00 PM, Sat: 7:00 AM - 12:00 PM",
        mapUrl: "https://maps.google.com/?q=3811+E+University+Dr+Phoenix+AZ+85034",
      },
      {
        city: "Tucson",
        state: "AZ",
        address: "4550 S Palo Verde Rd, Tucson, AZ 85714",
        phone: "(520) 889-6603",
        hours: "Mon-Fri: 6:00 AM - 5:00 PM, Sat: 7:00 AM - 12:00 PM",
        mapUrl: "https://maps.google.com/?q=4550+S+Palo+Verde+Rd+Tucson+AZ+85714",
      },
      {
        city: "Flagstaff",
        state: "AZ",
        address: "2626 E Route 66, Flagstaff, AZ 86004",
        phone: "(928) 526-2131",
        hours: "Mon-Fri: 7:00 AM - 5:00 PM, Sat: 8:00 AM - 12:00 PM",
        mapUrl: "https://maps.google.com/?q=2626+E+Route+66+Flagstaff+AZ+86004",
      },
    ],
    productCatalog: [
      {
        name: "Architectural Shingles",
        products: [
          {
            id: "gaf-timberline-hdz",
            name: "Timberline HDZ",
            type: "Architectural Shingle",
            description:
              "High Definition shingles with LayerLock technology and StrikeZone nailing area",
            specs: [
              { label: "Wind Rating", value: "130 mph" },
              { label: "Warranty", value: "Lifetime Limited" },
              { label: "Weight", value: "360 lbs per square" },
              { label: "Exposure", value: "5 5/8 inches" },
            ],
            colors: [
              { name: "Charcoal", hex: "#3C3C3C" },
              { name: "Weathered Wood", hex: "#7D6B5B" },
              { name: "Slate", hex: "#5A5F6B" },
              { name: "Barkwood", hex: "#6B5547" },
              { name: "Hickory", hex: "#8B7355" },
              { name: "Shakewood", hex: "#9C8670" },
              { name: "Mission Brown", hex: "#5C4A42" },
              { name: "Pewter Gray", hex: "#7B8084" },
              { name: "Hunter Green", hex: "#3E5347" },
            ],
            warranty: "Lifetime Limited Warranty with 10-year SureStart PLUS protection",
          },
          {
            id: "gaf-timberline-uhdz",
            name: "Timberline UHDZ",
            type: "Ultra High Definition Shingle",
            description:
              "Premium shingles with ultra-dimensional appearance and advanced protection",
            specs: [
              { label: "Wind Rating", value: "130 mph" },
              { label: "Warranty", value: "Lifetime Limited" },
              { label: "Weight", value: "430 lbs per square" },
              { label: "Exposure", value: "5 5/8 inches" },
            ],
            colors: [
              { name: "Charcoal", hex: "#3C3C3C" },
              { name: "Weathered Wood", hex: "#7D6B5B" },
              { name: "Slate", hex: "#5A5F6B" },
              { name: "Barkwood", hex: "#6B5547" },
            ],
            warranty: "Lifetime Limited Warranty with 10-year SureStart PLUS protection",
          },
        ],
      },
      {
        name: "Ice & Water Shield",
        products: [
          {
            id: "gaf-weatherwatch",
            name: "WeatherWatch Leak Barrier",
            type: "Ice & Water Shield",
            description: "Self-sealing leak barrier for critical roof areas",
            specs: [
              { label: "Coverage", value: "200 sq ft per roll" },
              { label: "Width", value: "3 feet" },
              { label: "Temperature Range", value: "25°F to 240°F" },
              { label: "Application", value: "Self-adhering" },
            ],
            warranty: "15-year limited warranty",
          },
          {
            id: "gaf-stormguard",
            name: "StormGuard Film-Surfaced Leak Barrier",
            type: "Ice & Water Shield",
            description: "Film-surfaced leak barrier with superior walkability",
            specs: [
              { label: "Coverage", value: "225 sq ft per roll" },
              { label: "Width", value: "3 feet" },
              { label: "Temperature Range", value: "25°F to 240°F" },
              { label: "Surface", value: "Film (walkable)" },
            ],
            warranty: "15-year limited warranty",
          },
        ],
      },
      {
        name: "Underlayment",
        products: [
          {
            id: "gaf-feltbuster",
            name: "FeltBuster Synthetic Underlayment",
            type: "Synthetic Underlayment",
            description: "High-traction synthetic underlayment stronger than 30# felt",
            specs: [
              { label: "Coverage", value: "10 squares per roll" },
              { label: "Width", value: "4 feet" },
              { label: "UV Exposure", value: "6 months" },
              { label: "Weight", value: "Lighter than felt" },
            ],
            warranty: "10-year limited warranty",
          },
        ],
      },
    ],
  },
  {
    slug: "abc-supply",
    name: "ABC Supply",
    logoUrl: "/images/vendors/abc.png",
    website: "https://www.abcsupply.com",
    categories: ["Shingle", "Tile", "Metal", "Flat/TPO", "Accessories"],
    summary:
      "Largest wholesale distributor of roofing in North America. Carries all major brands and provides same-day delivery.",
    products: ["All Major Brands", "GAF", "Owens Corning", "CertainTeed", "Tamko", "Atlas"],
    phone: "1-888-222-8211",
    productCatalog: [
      {
        name: "Distribution Services",
        products: [
          {
            id: "abc-gaf-distribution",
            name: "GAF Products",
            type: "Distribution",
            description:
              "Full line of GAF residential and commercial roofing products with same-day delivery",
            specs: [
              { label: "Delivery", value: "Same-day available" },
              { label: "Coverage", value: "Nationwide" },
              { label: "Brands", value: "GAF, Owens Corning, CertainTeed" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "srs-distribution",
    name: "SRS Distribution",
    logoUrl: "/images/vendors/srs.png",
    website: "https://www.srs-d.com",
    categories: ["Shingle", "Tile", "Metal", "Flat/TPO", "Accessories"],
    summary:
      "Leading independent roofing distributor with extensive product selection and delivery fleet.",
    products: ["GAF", "Owens Corning", "CertainTeed", "Tamko", "Malarkey"],
    phone: "1-855-877-3311",
    productCatalog: [
      {
        name: "Distribution Services",
        products: [
          {
            id: "srs-full-service",
            name: "Full-Service Distribution",
            type: "Distribution",
            description: "Complete roofing materials distribution with dedicated sales support",
            specs: [
              { label: "Delivery", value: "Next-day delivery" },
              { label: "Branches", value: "700+ locations" },
              { label: "Services", value: "Estimating, delivery, crane service" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "westlake-royal",
    name: "Westlake Royal Roofing Solutions",
    logoUrl: "/images/vendors/westlake.png",
    website: "https://www.westlakeroyalroofingsolutions.com",
    categories: ["Shingle", "Tile", "Metal", "Accessories"],
    warrantyUrl: "https://www.westlakeroyalroofingsolutions.com/warranties",
    specsUrl: "https://www.westlakeroyalroofingsolutions.com/products",
    summary: "Comprehensive roofing manufacturer including Boral, Eagle, Saxony, and EdCo brands.",
    products: ["Boral Tile", "Eagle Tile", "Saxony Shakes", "EdCo Metal"],
    phone: "1-844-624-7663",
    email: "info@wlrb.com",
    locations: [
      {
        city: "Phoenix",
        state: "AZ",
        address: "2836 W Buckeye Rd, Phoenix, AZ 85009",
        phone: "(602) 272-3551",
        hours: "Mon-Fri: 7:00 AM - 4:00 PM",
        mapUrl: "https://maps.google.com/?q=2836+W+Buckeye+Rd+Phoenix+AZ+85009",
      },
      {
        city: "Tucson",
        state: "AZ",
        address: "4602 E 22nd St, Tucson, AZ 85711",
        phone: "(520) 747-8510",
        hours: "Mon-Fri: 7:00 AM - 4:00 PM",
        mapUrl: "https://maps.google.com/?q=4602+E+22nd+St+Tucson+AZ+85711",
      },
    ],
    productCatalog: [
      {
        name: "Concrete Tile",
        products: [
          {
            id: "westlake-boral-villa",
            name: "Boral Villa Tile",
            type: "Concrete Tile",
            description: "Premium concrete roof tile with authentic Spanish styling",
            specs: [
              { label: "Weight", value: "950 lbs per square" },
              { label: "Warranty", value: "50-year limited" },
              { label: "Wind Rating", value: "Up to 150 mph" },
              { label: "Fire Rating", value: "Class A" },
            ],
            colors: [
              { name: "Mission Red", hex: "#8B4513" },
              { name: "Adobe Blend", hex: "#C19A6B" },
              { name: "Terracotta Blend", hex: "#CD853F" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "elite-roofing-supply",
    name: "Elite Roofing Supply",
    logoUrl: "/images/vendors/elite.png",
    website: "https://www.eliteroofingsupply.com",
    categories: ["Shingle", "Tile", "Metal", "Flat/TPO", "Accessories"],
    warrantyUrl: "https://www.eliteroofingsupply.com/warranties",
    specsUrl: "https://www.eliteroofingsupply.com/products",
    summary: "Regional roofing distributor known for personalized service and technical expertise.",
    products: ["GAF", "Owens Corning", "IKO", "Atlas", "CertainTeed"],
    phone: "1-888-354-8377",
    email: "info@eliteroofingsupply.com",
    locations: [
      {
        city: "Phoenix",
        state: "AZ",
        address: "2150 W McDowell Rd, Phoenix, AZ 85009",
        phone: "(602) 254-7878",
        hours: "Mon-Fri: 6:00 AM - 4:30 PM, Sat: 7:00 AM - 12:00 PM",
        mapUrl: "https://maps.google.com/?q=2150+W+McDowell+Rd+Phoenix+AZ+85009",
      },
      {
        city: "Tucson",
        state: "AZ",
        address: "2502 S Sixth Ave, Tucson, AZ 85713",
        phone: "(520) 624-7001",
        hours: "Mon-Fri: 6:30 AM - 4:30 PM, Sat: 7:00 AM - 12:00 PM",
        mapUrl: "https://maps.google.com/?q=2502+S+Sixth+Ave+Tucson+AZ+85713",
      },
    ],
    productCatalog: [
      {
        name: "Distribution Services",
        products: [
          {
            id: "elite-full-line",
            name: "Full Product Line",
            type: "Distribution",
            description: "Complete roofing materials with expert consultation and support",
            specs: [
              { label: "Delivery", value: "Same-day delivery available" },
              { label: "Support", value: "Technical and estimating help" },
              { label: "Services", value: "Training, warranty registration" },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "certainteed",
    name: "CertainTeed",
    logoUrl: "/images/vendors/certainteed.png",
    website: "https://www.certainteed.com",
    categories: ["Shingle", "Accessories"],
    warrantyUrl: "https://www.certainteed.com/roofing/warranties",
    specsUrl: "https://www.certainteed.com/roofing/products",
    summary: "Premium roofing shingles with industry-leading warranties and energy efficiency.",
    products: ["Landmark", "Presidential Shake", "Grand Manor", "Integrity Roof System"],
    phone: "1-800-233-8990",
    email: "certainteed@saint-gobain.com",
  },
  {
    slug: "owens-corning",
    name: "Owens Corning",
    logoUrl: "/images/vendors/oc.png",
    website: "https://www.owenscorning.com",
    categories: ["Shingle", "Accessories"],
    warrantyUrl: "https://www.owenscorning.com/en-us/roofing/warranty",
    specsUrl: "https://www.owenscorning.com/en-us/roofing",
    summary: "Premium residential shingles and total protection roofing systems.",
    products: ["Duration Series", "Berkshire", "WeatherLock"],
  },
  {
    slug: "tamko",
    name: "TAMKO Building Products",
    logoUrl: "/images/vendors/tamko.png",
    website: "https://www.tamko.com",
    categories: ["Shingle", "Metal", "Accessories"],
    warrantyUrl: "https://www.tamko.com/residential/warranties",
    specsUrl: "https://www.tamko.com/residential/products",
    summary:
      "Premium roofing products including Heritage laminated shingles and MetalWorks systems.",
    products: ["Heritage", "Titan XT", "MetalWorks", "TW Starter"],
    phone: "1-800-641-4691",
    email: "info@tamko.com",
  },
  {
    slug: "eagle-roofing",
    name: "Eagle Roofing Products",
    logoUrl: "/images/vendors/eagle.png",
    website: "https://eagleroofing.com",
    categories: ["Tile"],
    warrantyUrl: "https://eagleroofing.com/warranty/",
    specsUrl: "https://eagleroofing.com/resources/downloads/",
    summary: "Concrete tile systems with profiles for Southwest aesthetics and durability.",
    products: ["Capistrano", "Malibu", "Ponderosa"],
  },
];

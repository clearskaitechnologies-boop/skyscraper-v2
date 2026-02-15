// ClearSKai brand configuration and constants

// Company brand information - exported for use across the app
export const BRAND = {
  name: "ClearSKai",
  company: {
    name: "ClearSKai",
    phone: "(480) 000-0000",
    email: "hello@clearskai.com",
    website: "https://clearskai.com",
    address: "123 Main St, Phoenix, AZ 85001",
  },
  tagline: "AI-Powered Trades Intelligence",
  description:
    "Professional project management and proposal software powered by AI for trades professionals",
  contactEmail: "hello@clearskai.com",
  contactPhone: "(480) 000-0000",
  website: "https://clearskai.com",
  logoUrl: "/logo.png",
  values: {
    vision:
      "Built by tradesmen, for tradesmen. Our mission is to modernize the trades industry with AI-powered tools.",
    principles: ["Customer-first approach", "Data-driven decisions", "Cutting-edge technology"],
  },
};

// Product features configuration - exported for use across the app
export const PRODUCT_FEATURES = {
  instantGeneration: {
    title: "AI Proposal Engine",
    description: "Generate professional proposals in seconds with AI-powered automation",
  },
  features: [
    {
      title: "AI-Powered Analysis",
      description: "Automated damage detection and instant AI summaries",
      icon: "brain",
    },
    {
      title: "Professional Reports",
      description: "Generate comprehensive inspection reports in seconds",
      icon: "file-text",
    },
    {
      title: "Weather Intelligence",
      description: "Historical weather data and hail event tracking",
      icon: "cloud-rain",
    },
    {
      title: "Client Portal",
      description: "Secure portal for clients to view and sign proposals",
      icon: "users",
    },
  ],
};

// Brand fonts for PDF export
export type BrandFonts = {
  headingUrl?: string;
  bodyUrl?: string;
};

export type CoverTemplate = "minimal" | "split" | "photo";

export type CoverOptions = {
  template: CoverTemplate;
  title?: string;
  subtitle?: string;
  address?: string;
  photoUrl?: string;
  logoUrl?: string;
  gradient?: { from: string; to: string };
};

export async function fetchArrayBuffer(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("Fetch failed " + r.status);
  return r.arrayBuffer();
}

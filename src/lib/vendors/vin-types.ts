/**
 * Vendor Intelligence Network — Shared Types & Constants
 *
 * Central type definitions for the VIN system including trade types,
 * vendor types, and all related interfaces.
 */

// ============================================================================
// TRADE TYPES — Every construction trade
// ============================================================================
export const TRADE_TYPES = [
  "roofing",
  "plumbing",
  "electrical",
  "hvac",
  "concrete",
  "drywall",
  "framing",
  "painting",
  "flooring",
  "landscaping",
  "windows_doors",
  "solar",
  "insulation",
  "restoration",
  "water_mold",
  "fire",
  "pools",
  "fencing",
  "foundation",
  "stucco",
  "siding",
  "gutters",
  "cabinets",
  "countertops",
  "appliances",
  "demolition",
  "excavation",
  "masonry",
  "tile",
  "general_contractor",
] as const;

export type TradeType = (typeof TRADE_TYPES)[number];

export const TRADE_TYPE_LABELS: Record<TradeType, string> = {
  roofing: "Roofing",
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  concrete: "Concrete",
  drywall: "Drywall",
  framing: "Framing",
  painting: "Painting",
  flooring: "Flooring",
  landscaping: "Landscaping",
  windows_doors: "Windows & Doors",
  solar: "Solar",
  insulation: "Insulation",
  restoration: "Restoration",
  water_mold: "Water/Mold Remediation",
  fire: "Fire Damage",
  pools: "Pools & Spas",
  fencing: "Fencing",
  foundation: "Foundation",
  stucco: "Stucco",
  siding: "Siding",
  gutters: "Gutters",
  cabinets: "Cabinets",
  countertops: "Countertops",
  appliances: "Appliances",
  demolition: "Demolition",
  excavation: "Excavation",
  masonry: "Masonry",
  tile: "Tile",
  general_contractor: "General Contractor",
};

// ============================================================================
// VENDOR TYPES
// ============================================================================
export const VENDOR_TYPES = [
  "manufacturer",
  "distributor",
  "dealer",
  "supplier",
  "retailer",
  "service_provider",
  "rental_yard",
  "supply_yard",
  "specialty",
  "wholesaler",
] as const;

export type VendorType = (typeof VENDOR_TYPES)[number];

export const VENDOR_TYPE_LABELS: Record<VendorType, string> = {
  manufacturer: "Manufacturer",
  distributor: "Distributor",
  dealer: "Dealer",
  supplier: "Supplier",
  retailer: "Retailer",
  service_provider: "Service Provider",
  rental_yard: "Rental Yard",
  supply_yard: "Supply Yard",
  specialty: "Specialty Vendor",
  wholesaler: "Wholesaler",
};

// ============================================================================
// SUPPLIER CONNECTORS
// ============================================================================
export const SUPPLIERS = [
  "home_depot",
  "lowes",
  "amazon",
  "abc_supply",
  "srs_distribution",
  "beacon",
  "gaf",
  "owens_corning",
  "certainteed",
  "custom",
] as const;

export type SupplierKey = (typeof SUPPLIERS)[number];

export const SUPPLIER_LABELS: Record<SupplierKey, string> = {
  home_depot: "Home Depot",
  lowes: "Lowe's",
  amazon: "Amazon",
  abc_supply: "ABC Supply",
  srs_distribution: "SRS Distribution",
  beacon: "Beacon Building Products",
  gaf: "GAF Materials",
  owens_corning: "Owens Corning",
  certainteed: "CertainTeed",
  custom: "Custom Supplier",
};

export const SUPPLIER_ICONS: Record<SupplierKey, string> = {
  home_depot: "🏠",
  lowes: "🔵",
  amazon: "📦",
  abc_supply: "🏗️",
  srs_distribution: "🔶",
  beacon: "🟢",
  gaf: "🔴",
  owens_corning: "🟠",
  certainteed: "🔷",
  custom: "⚙️",
};

// ============================================================================
// PROGRAM TYPES
// ============================================================================
export const PROGRAM_TYPES = [
  "rebate",
  "financing",
  "certification",
  "warranty_extension",
  "loyalty",
  "volume_discount",
  "trade_credit",
] as const;

export type ProgramType = (typeof PROGRAM_TYPES)[number];

// ============================================================================
// ASSET TYPES
// ============================================================================
export const ASSET_TYPES = [
  "brochure",
  "flyer",
  "pitch_deck",
  "install_guide",
  "code_doc",
  "catalog",
  "spec_sheet",
  "warranty_doc",
  "msds",
  "training_video",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

// ============================================================================
// ORDER / CART STATUS
// ============================================================================
export const ORDER_STATUSES = [
  "draft",
  "submitted",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CART_STATUSES = ["open", "submitted", "ordered", "cancelled"] as const;
export type CartStatus = (typeof CART_STATUSES)[number];

// ============================================================================
// WORKFLOW EVENT TYPES
// ============================================================================
export const WORKFLOW_EVENT_TYPES = [
  "order_placed",
  "order_confirmed",
  "delivery_scheduled",
  "delivery_arrived",
  "receipt_parsed",
  "receipt_verified",
  "vendor_attached",
  "vendor_removed",
  "brochure_sent",
  "client_notified",
  "ai_suggestion",
  "cart_submitted",
  "payment_captured",
] as const;

export type WorkflowEventType = (typeof WORKFLOW_EVENT_TYPES)[number];

// ============================================================================
// INTERFACES
// ============================================================================

export interface VendorListItem {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  category: string | null;
  primaryPhone: string | null;
  primaryEmail: string | null;
  emergencyPhone: string | null;
  tradeTypes: string[];
  vendorTypes: string[];
  serviceRegions: string[];
  rating: number | null;
  reviewCount: number;
  isFeatured: boolean;
  isVerified: boolean;
  financingAvail: boolean;
  rebatesAvail: boolean;
  certifications: string[];
  locationCount: number;
  contactCount: number;
  productCount: number;
  programCount: number;
}

export interface VendorDetail extends VendorListItem {
  coverImage: string | null;
  locations: VendorLocationItem[];
  contacts: VendorContactItem[];
  resources: VendorResourceItem[];
  products: VendorProductItem[];
  assets: VendorAssetItem[];
  programs: VendorProgramItem[];
}

export interface VendorLocationItem {
  id: string;
  name: string;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  phone: string | null;
  email: string | null;
  hours: Record<string, string> | null;
  lat: string | null;
  lng: string | null;
  deliveryRadiusMi: number | null;
  deliveryCutoffTime: string | null;
  localRepName: string | null;
  localRepPhone: string | null;
  emergencyPhone: string | null;
  contacts: VendorContactItem[];
}

export interface VendorContactItem {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  mobilePhone: string | null;
  territory: string[];
  isPrimary: boolean;
}

export interface VendorResourceItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  fileSize: string | null;
  format: string | null;
  category: string | null;
  tags: string[];
  downloads: number;
}

export interface VendorProductItem {
  id: string;
  tradeType: string;
  sku: string | null;
  name: string;
  category: string | null;
  manufacturer: string | null;
  description: string | null;
  brochureUrl: string | null;
  specSheetUrl: string | null;
  warrantyUrl: string | null;
  priceRangeLow: number | null;
  priceRangeHigh: number | null;
  unit: string;
  inStock: boolean;
  leadTimeDays: number | null;
  features: string[];
  imageUrl: string | null;
}

export interface VendorAssetItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  jobUseCase: string | null;
  pdfUrl: string;
  fileSize: string | null;
  tradeType: string | null;
  downloads: number;
}

export interface VendorProgramItem {
  id: string;
  programType: string;
  name: string;
  description: string | null;
  eligibility: string | null;
  amount: number | null;
  percentOff: number | null;
  validFrom: string | null;
  validTo: string | null;
  applicationUrl: string | null;
  terms: string | null;
}

export interface MaterialCartData {
  id: string;
  name: string;
  status: string;
  supplier: string | null;
  claimId: string | null;
  jobId: string | null;
  items: MaterialCartItemData[];
  itemCount: number;
  totalEstimate: number;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialCartItemData {
  id: string;
  productName: string;
  sku: string | null;
  manufacturer: string | null;
  category: string | null;
  color: string | null;
  quantity: number;
  unit: string;
  unitPrice: number | null;
  lineTotal: number | null;
  supplier: string | null;
  supplierUrl: string | null;
  imageUrl: string | null;
  notes: string | null;
}

export interface MaterialReceiptData {
  id: string;
  supplier: string;
  receiptNumber: string | null;
  receiptUrl: string | null;
  purchaseDate: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  paymentMethod: string | null;
  parsedItems: unknown[];
  eta: string | null;
  trackingNumber: string | null;
  status: string;
  createdAt: string;
}

export interface AiVendorSuggestion {
  type: "schedule" | "notification" | "inspection" | "vendor" | "material";
  title: string;
  description: string;
  actionLabel: string;
  actionUrl?: string;
  priority: "high" | "medium" | "low";
  metadata?: Record<string, unknown>;
}

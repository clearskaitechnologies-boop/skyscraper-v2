/**
 * Supplier Integration Types
 *
 * Shared types for supplier connectors (Home Depot, Lowe's, ABC Supply, etc.)
 */

export type SupplierName =
  | "home-depot"
  | "lowes"
  | "abc-supply"
  | "beacon"
  | "srs-distribution"
  | "amazon-business";

export interface SupplierCredentials {
  supplierId: string;
  apiKey?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  accountNumber?: string;
  storeId?: string;
}

export interface SupplierProduct {
  id: string;
  sku: string;
  name: string;
  description?: string;
  manufacturer?: string;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  price: number;
  unit: string;
  inStock: boolean;
  stockQuantity?: number;
  leadTimeDays?: number;
  supplierUrl?: string;
  specs?: Record<string, string>;
}

export interface SupplierSearchParams {
  query: string;
  category?: string;
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface SupplierSearchResult {
  products: SupplierProduct[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
}

export interface SupplierCartItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  imageUrl?: string;
  supplier: SupplierName;
}

export interface SupplierCart {
  id: string;
  supplierId: SupplierName;
  items: SupplierCartItem[];
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  estimatedDelivery?: Date;
}

export interface SupplierOrder {
  id: string;
  orderNumber: string;
  supplierId: SupplierName;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: SupplierCartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  placedAt: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  trackingUrl?: string;
  receiptUrl?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface SupplierReceipt {
  id: string;
  orderId: string;
  supplier: SupplierName;
  receiptNumber: string;
  purchaseDate: Date;
  items: {
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  storeLocation?: string;
  rawText?: string;
  pdfUrl?: string;
}

/**
 * Supplier connector interface - implement for each supplier
 */
export interface ISupplierConnector {
  name: SupplierName;
  displayName: string;
  logoUrl: string;

  // Authentication
  isAuthenticated(): Promise<boolean>;
  authenticate(credentials: Partial<SupplierCredentials>): Promise<boolean>;
  refreshAuth(): Promise<boolean>;
  disconnect(): Promise<void>;

  // Product search
  searchProducts(params: SupplierSearchParams): Promise<SupplierSearchResult>;
  getProduct(productId: string): Promise<SupplierProduct | null>;
  getProductBySku(sku: string): Promise<SupplierProduct | null>;

  // Cart operations (optional - some suppliers don't support carts)
  getCart?(): Promise<SupplierCart | null>;
  addToCart?(productId: string, quantity: number): Promise<SupplierCart>;
  updateCartItem?(productId: string, quantity: number): Promise<SupplierCart>;
  removeFromCart?(productId: string): Promise<SupplierCart>;
  clearCart?(): Promise<void>;

  // Order operations
  placeOrder?(
    cart: SupplierCart,
    deliveryAddress: SupplierOrder["deliveryAddress"]
  ): Promise<SupplierOrder>;
  getOrder?(orderId: string): Promise<SupplierOrder | null>;
  getOrders?(limit?: number): Promise<SupplierOrder[]>;
  cancelOrder?(orderId: string): Promise<boolean>;

  // Receipt operations
  getReceipt?(orderId: string): Promise<SupplierReceipt | null>;
  parseReceipt?(rawText: string): Promise<Partial<SupplierReceipt>>;
}

/**
 * Supplier config for UI display
 */
export const SUPPLIER_CONFIG: Record<
  SupplierName,
  {
    displayName: string;
    logoUrl: string;
    website: string;
    hasApi: boolean;
    apiStatus: "available" | "coming-soon" | "unavailable";
    features: string[];
  }
> = {
  "home-depot": {
    displayName: "Home Depot Pro",
    logoUrl: "/suppliers/home-depot-logo.png",
    website: "https://www.homedepot.com",
    hasApi: true,
    apiStatus: "coming-soon",
    features: ["Product Search", "Pricing", "Pro Account Integration"],
  },
  lowes: {
    displayName: "Lowe's for Pros",
    logoUrl: "/suppliers/lowes-logo.png",
    website: "https://www.lowes.com",
    hasApi: true,
    apiStatus: "coming-soon",
    features: ["Product Search", "Pricing", "Pro Account Integration"],
  },
  "abc-supply": {
    displayName: "ABC Supply",
    logoUrl: "/vendors/abc-supply-logo.png",
    website: "https://www.abcsupply.com",
    hasApi: false,
    apiStatus: "coming-soon",
    features: ["Digital Ordering", "Delivery Tracking"],
  },
  beacon: {
    displayName: "Beacon Building Products",
    logoUrl: "/vendors/beacon-logo.png",
    website: "https://www.becn.com",
    hasApi: false,
    apiStatus: "coming-soon",
    features: ["TrueBlue Integration", "Delivery Tracking"],
  },
  "srs-distribution": {
    displayName: "SRS Distribution",
    logoUrl: "/vendors/srs-logo.png",
    website: "https://www.srsdistribution.com",
    hasApi: false,
    apiStatus: "coming-soon",
    features: ["Digital Ordering"],
  },
  "amazon-business": {
    displayName: "Amazon Business",
    logoUrl: "/suppliers/amazon-logo.png",
    website: "https://business.amazon.com",
    hasApi: true,
    apiStatus: "coming-soon",
    features: ["Product Search", "Pricing", "Prime Delivery"],
  },
};

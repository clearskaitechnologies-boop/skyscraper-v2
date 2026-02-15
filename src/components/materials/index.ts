/**
 * Materials Components - Barrel Export
 *
 * Components for the Live Materials Order & Job Flow feature
 */

export { CartDrawer } from "./CartDrawer";
export { ProductCard, ProductCardSkeleton } from "./ProductCard";
export { ProductSearch } from "./ProductSearch";

// Re-export types for convenience
export type {
  SupplierCart,
  SupplierCartItem,
  SupplierName,
  SupplierOrder,
  SupplierProduct,
  SupplierReceipt,
  SupplierSearchParams,
  SupplierSearchResult,
} from "@/lib/suppliers/types";

export { SUPPLIER_CONFIG } from "@/lib/suppliers/types";

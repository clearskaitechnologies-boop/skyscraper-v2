"use client";

import type { SupplierName, SupplierProduct } from "@/lib/suppliers/types";
import { SUPPLIER_CONFIG } from "@/lib/suppliers/types";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

interface ProductSearchProps {
  suppliers?: SupplierName[];
  defaultCategory?: string;
  onAddToCart: (product: SupplierProduct, supplier: SupplierName, quantity: number) => void;
  cartItems?: Map<string, number>; // productId -> quantity
  className?: string;
}

// Mock categories for the search UI
const PRODUCT_CATEGORIES = [
  {
    id: "roofing",
    name: "Roofing",
    subcategories: ["Shingles", "Underlayment", "Flashing", "Ventilation"],
  },
  { id: "siding", name: "Siding", subcategories: ["Vinyl", "Fiber Cement", "Wood", "Metal"] },
  {
    id: "gutters",
    name: "Gutters & Drainage",
    subcategories: ["Gutters", "Downspouts", "Gutter Guards"],
  },
  {
    id: "windows",
    name: "Windows & Doors",
    subcategories: ["Windows", "Entry Doors", "Patio Doors", "Skylights"],
  },
  {
    id: "insulation",
    name: "Insulation",
    subcategories: ["Batt", "Blown-In", "Spray Foam", "Rigid Board"],
  },
  {
    id: "drywall",
    name: "Drywall & Ceiling",
    subcategories: ["Drywall Sheets", "Joint Compound", "Ceiling Tiles"],
  },
  {
    id: "lumber",
    name: "Lumber & Framing",
    subcategories: ["Dimensional Lumber", "Plywood", "OSB", "Engineered Wood"],
  },
  {
    id: "paint",
    name: "Paint & Coatings",
    subcategories: ["Interior Paint", "Exterior Paint", "Stains", "Sealers"],
  },
  {
    id: "flooring",
    name: "Flooring",
    subcategories: ["Hardwood", "Laminate", "Tile", "Carpet", "Vinyl"],
  },
  { id: "hvac", name: "HVAC", subcategories: ["Furnaces", "AC Units", "Ductwork", "Thermostats"] },
  {
    id: "plumbing",
    name: "Plumbing",
    subcategories: ["Pipes", "Fittings", "Fixtures", "Water Heaters"],
  },
  {
    id: "electrical",
    name: "Electrical",
    subcategories: ["Wire", "Outlets", "Breakers", "Lighting"],
  },
];

// Mock products for demo purposes
const MOCK_PRODUCTS: (SupplierProduct & { supplier: SupplierName })[] = [
  {
    id: "gaf-hdz-charcoal",
    sku: "GAF-HDZ-CHAR",
    name: "GAF Timberline HDZ Shingles - Charcoal",
    description:
      "Architectural shingles with LayerLock technology. 130 MPH wind warranty. StrikeZone nail area.",
    manufacturer: "GAF",
    category: "Roofing",
    subcategory: "Shingles",
    imageUrl: "https://www.gaf.com/en-us/images/products/timberline-hdz/charcoal.jpg",
    price: 39.98,
    unit: "bundle",
    inStock: true,
    stockQuantity: 500,
    supplierUrl: "https://www.homedepot.com/p/GAF-Timberline-HDZ-Charcoal/12345",
    supplier: "home-depot",
  },
  {
    id: "gaf-hdz-weathered",
    sku: "GAF-HDZ-WWOOD",
    name: "GAF Timberline HDZ Shingles - Weathered Wood",
    description:
      "Architectural shingles with LayerLock technology. Most popular color. Lifetime limited warranty.",
    manufacturer: "GAF",
    category: "Roofing",
    subcategory: "Shingles",
    imageUrl: "https://www.gaf.com/en-us/images/products/timberline-hdz/weathered-wood.jpg",
    price: 39.98,
    unit: "bundle",
    inStock: true,
    stockQuantity: 350,
    supplier: "abc-supply",
  },
  {
    id: "owens-oakridge-onyx",
    sku: "OC-OAK-ONYX",
    name: "Owens Corning Oakridge Shingles - Onyx Black",
    description:
      "Laminated architectural shingles with SureNail Technology. 110 MPH wind warranty.",
    manufacturer: "Owens Corning",
    category: "Roofing",
    subcategory: "Shingles",
    imageUrl: "https://www.owenscorning.com/roofing/shingles/oakridge/onyx-black.jpg",
    price: 36.48,
    unit: "bundle",
    inStock: true,
    stockQuantity: 420,
    supplier: "lowes",
  },
  {
    id: "certainteed-landmark-driftwood",
    sku: "CT-LM-DRIFT",
    name: "CertainTeed Landmark Shingles - Driftwood",
    description:
      "Premium designer architectural shingles. Max Def color technology. 15-year algae resistance.",
    manufacturer: "CertainTeed",
    category: "Roofing",
    subcategory: "Shingles",
    imageUrl: "https://www.certainteed.com/roofing/landmark/driftwood.jpg",
    price: 42.99,
    unit: "bundle",
    inStock: true,
    stockQuantity: 280,
    supplier: "beacon",
  },
  {
    id: "gaf-feltbuster-synthetic",
    sku: "GAF-FB-SYNTH",
    name: "GAF FeltBuster Synthetic Roofing Underlayment",
    description:
      "Synthetic roofing underlayment. Lightweight, walkable, tear-resistant. 10 sq per roll.",
    manufacturer: "GAF",
    category: "Roofing",
    subcategory: "Underlayment",
    price: 89.99,
    unit: "roll",
    inStock: true,
    stockQuantity: 150,
    supplier: "home-depot",
  },
  {
    id: "hardie-plank-arctic",
    sku: "JP-HP-ARCTIC",
    name: "James Hardie HardiePlank Lap Siding - Arctic White",
    description: "Fiber cement lap siding. ColorPlus technology. 15-year finish warranty.",
    manufacturer: "James Hardie",
    category: "Siding",
    subcategory: "Fiber Cement",
    price: 12.98,
    unit: "piece",
    inStock: true,
    stockQuantity: 800,
    supplier: "lowes",
  },
  {
    id: "pella-casement-white",
    sku: "PELLA-250-CASE",
    name: "Pella 250 Series Casement Window - White",
    description: "Vinyl casement window with dual-pane insulated glass. ENERGY STAR certified.",
    manufacturer: "Pella",
    category: "Windows",
    subcategory: "Windows",
    price: 289.0,
    unit: "each",
    inStock: true,
    stockQuantity: 45,
    supplier: "lowes",
  },
  {
    id: "andersen-double-hung",
    sku: "ANDER-400-DH",
    name: "Andersen 400 Series Double-Hung Window",
    description: "Wood frame double-hung window with Low-E4 glass. Easy-clean tilt sash.",
    manufacturer: "Andersen",
    category: "Windows",
    subcategory: "Windows",
    price: 549.0,
    unit: "each",
    inStock: false,
    leadTimeDays: 14,
    supplier: "home-depot",
  },
];

/**
 * ProductSearch - Search and browse products from multiple suppliers
 */
export function ProductSearch({
  suppliers = ["home-depot", "lowes", "abc-supply", "beacon"],
  defaultCategory,
  onAddToCart,
  cartItems = new Map(),
  className = "",
}: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(defaultCategory || null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<SupplierName>>(new Set(suppliers));
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<(SupplierProduct & { supplier: SupplierName })[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter mock products based on search criteria
    let filtered = MOCK_PRODUCTS.filter((p) => selectedSuppliers.has(p.supplier));

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.manufacturer?.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) =>
          p.category.toLowerCase() === selectedCategory.toLowerCase() ||
          p.subcategory?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setProducts(filtered);
    setIsLoading(false);
  }, [searchQuery, selectedCategory, selectedSuppliers]);

  // Auto-search on filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery || selectedCategory || hasSearched) {
        performSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedSuppliers, performSearch, hasSearched]);

  const handleAddToCart = (
    product: SupplierProduct & { supplier: SupplierName },
    quantity: number
  ) => {
    onAddToCart(product, product.supplier, quantity);
  };

  const toggleSupplier = (supplier: SupplierName) => {
    const newSet = new Set(selectedSuppliers);
    if (newSet.has(supplier)) {
      newSet.delete(supplier);
    } else {
      newSet.add(supplier);
    }
    setSelectedSuppliers(newSet);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name, SKU, or manufacturer..."
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>

          {/* Active filter pills */}
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory(null)}
                  aria-label="Remove category filter"
                  title="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedSuppliers.size < suppliers.length && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {selectedSuppliers.size} suppliers
              </span>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid gap-6 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-2">
            {/* Categories */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</h4>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Suppliers */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Suppliers</h4>
              <div className="flex flex-wrap gap-2">
                {suppliers.map((supplier) => (
                  <button
                    key={supplier}
                    onClick={() => toggleSupplier(supplier)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      selectedSuppliers.has(supplier)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {SUPPLIER_CONFIG[supplier]?.displayName || supplier}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : hasSearched && products.length === 0 ? (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No products found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {products.length} products found
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                supplier={product.supplier}
                onAddToCart={(p, qty) => handleAddToCart({ ...p, supplier: product.supplier }, qty)}
                isInCart={cartItems.has(product.id)}
                cartQuantity={cartItems.get(product.id) || 0}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Search for materials
          </h3>
          <p className="mt-1 text-gray-500">
            Enter a product name, SKU, or select a category to begin
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductSearch;

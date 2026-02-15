"use client";

import type { SupplierName, SupplierProduct } from "@/lib/suppliers/types";
import { SUPPLIER_CONFIG } from "@/lib/suppliers/types";
import { Check, Clock, ExternalLink, Package, ShoppingCart } from "lucide-react";
import Image from "next/image";
import React from "react";

interface ProductCardProps {
  product: SupplierProduct;
  supplier: SupplierName;
  onAddToCart: (product: SupplierProduct, quantity: number) => void;
  isInCart?: boolean;
  cartQuantity?: number;
}

/**
 * ProductCard - Display a product from a supplier catalog
 *
 * Features:
 * - Product image, name, description
 * - Price and unit display
 * - Stock status indicator
 * - Add to cart functionality
 * - Link to supplier website
 */
export function ProductCard({
  product,
  supplier,
  onAddToCart,
  isInCart = false,
  cartQuantity = 0,
}: ProductCardProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(product, quantity);
      setQuantity(1); // Reset quantity after adding
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  const supplierConfig = SUPPLIER_CONFIG[supplier];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-4" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <Package className="h-16 w-16" />
          </div>
        )}

        {/* Stock Badge */}
        <div
          className={`absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            product.inStock
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {product.inStock ? (
            <>
              <Check className="h-3 w-3" />
              In Stock
            </>
          ) : (
            <>
              <Clock className="h-3 w-3" />
              {product.leadTimeDays ? `${product.leadTimeDays} days` : "Out of Stock"}
            </>
          )}
        </div>

        {/* In Cart Badge */}
        {isInCart && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-blue-600 px-2 py-1 text-xs font-medium text-white">
            <ShoppingCart className="h-3 w-3" />
            {cartQuantity} in cart
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Supplier Tag */}
        <div className="mb-2 flex items-center gap-1">
          {supplierConfig?.logoUrl && (
            <div className="relative h-4 w-4 overflow-hidden rounded">
              <Image
                src={supplierConfig.logoUrl}
                alt={supplierConfig.displayName}
                fill
                className="object-contain"
              />
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {supplierConfig?.displayName || supplier}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="line-clamp-2 min-h-[2.5rem] font-semibold text-gray-900 dark:text-white">
          {product.name}
        </h3>

        {/* Manufacturer & SKU */}
        {product.manufacturer && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{product.manufacturer}</p>
        )}
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">SKU: {product.sku}</p>

        {/* Category */}
        <div className="mt-2">
          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {product.category}
          </span>
          {product.subcategory && (
            <span className="ml-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {product.subcategory}
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">/{product.unit}</span>
        </div>

        {/* Quantity & Add to Cart */}
        <div className="mt-4 flex gap-2">
          {/* Quantity Selector */}
          <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 border-x border-gray-300 bg-transparent py-2 text-center text-gray-900 dark:border-gray-600 dark:text-white"
              min="1"
              aria-label="Quantity"
              title="Quantity"
            />
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
              product.inStock
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700"
            } ${isAdding ? "scale-95" : ""} `}
          >
            {isAdding ? (
              <>
                <Check className="h-5 w-5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                Add
              </>
            )}
          </button>
        </div>

        {/* Supplier Link */}
        {product.supplierUrl && (
          <a
            href={product.supplierUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View on {supplierConfig?.displayName || "supplier"}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * ProductCardSkeleton - Loading state for ProductCard
 */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-full rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

export default ProductCard;

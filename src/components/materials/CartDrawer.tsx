"use client";

import type { SupplierCartItem, SupplierName } from "@/lib/suppliers/types";
import { SUPPLIER_CONFIG } from "@/lib/suppliers/types";
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SupplierCartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  jobId?: string;
  claimId?: string;
}

/**
 * CartDrawer - Slide-out cart for material orders
 *
 * Features:
 * - Groups items by supplier
 * - Quantity adjustment
 * - Link to job/claim for cost tracking
 * - Checkout flow per supplier
 */
export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  jobId,
  claimId,
}: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Group items by supplier
  const itemsBySupplier = items.reduce<Record<SupplierName, SupplierCartItem[]>>(
    (acc, item) => {
      if (!acc[item.supplier]) {
        acc[item.supplier] = [];
      }
      acc[item.supplier].push(item);
      return acc;
    },
    {} as Record<SupplierName, SupplierCartItem[]>
  );

  const suppliers = Object.keys(itemsBySupplier) as SupplierName[];

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const estimatedTax = subtotal * 0.08; // ~8% estimate
  const total = subtotal + estimatedTax;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    // TODO: Implement multi-supplier checkout flow
    // For now, redirect to cart page
    window.location.href = "/materials/cart";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Material Cart</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {items.length} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Job/Claim Link */}
        {(jobId || claimId) && (
          <div className="border-b border-blue-100 bg-blue-50 px-4 py-2 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <Truck className="mr-1 inline h-4 w-4" />
              Linked to {claimId ? `Claim #${claimId}` : `Job #${jobId}`}
            </p>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-500">
              <ShoppingCart className="mb-3 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm">Add materials from vendor catalogs</p>
              <Link
                href="/vendors"
                className="mt-4 flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
                onClick={onClose}
              >
                Browse vendors <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {suppliers.map((supplier) => (
                <div key={supplier} className="space-y-3">
                  {/* Supplier Header */}
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
                    {SUPPLIER_CONFIG[supplier]?.logoUrl && (
                      <div className="relative h-6 w-6 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={SUPPLIER_CONFIG[supplier].logoUrl}
                          alt={SUPPLIER_CONFIG[supplier].displayName}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {SUPPLIER_CONFIG[supplier]?.displayName || supplier}
                    </span>
                    <span className="text-xs text-gray-500">
                      {itemsBySupplier[supplier].length} items
                    </span>
                  </div>

                  {/* Items from this supplier */}
                  {itemsBySupplier[supplier].map((item) => (
                    <CartItem
                      key={item.productId}
                      item={item}
                      onUpdateQuantity={onUpdateQuantity}
                      onRemove={onRemoveItem}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals and checkout */}
        {items.length > 0 && (
          <div className="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Est. Tax</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={onClearCart}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Multi-supplier note */}
            {suppliers.length > 1 && (
              <p className="text-center text-xs text-gray-500">
                Items from {suppliers.length} suppliers will be ordered separately
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Individual cart item component
 */
function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: SupplierCartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800">
      {/* Product Image */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-white dark:bg-gray-700">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <ShoppingCart className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.sku}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            ${item.unitPrice.toFixed(2)}/{item.unit}
          </span>
          <span className="text-sm font-semibold text-blue-600">${lineTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Quantity & Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(item.productId)}
          className="p-1 text-gray-400 transition-colors hover:text-red-500"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Quantity controls */}
        <div className="flex items-center gap-1 rounded border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
          <button
            onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
            className="p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[2rem] px-2 text-center text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            className="p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;

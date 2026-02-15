/**
 * Material Selector Component
 *
 * Interactive UI for homeowner material selection.
 * Features: color picker, comparisons, 3D previews, pricing.
 */

"use client";

import { Check, DollarSign, Shield, Wind, X } from "lucide-react";
import { useState } from "react";

import type { MaterialColor, MaterialProduct } from "@/lib/materials/vendor-catalog";

interface MaterialSelectorProps {
  products: MaterialProduct[];
  selectedProductId?: string;
  selectedColorName?: string;
  onSelect: (productId: string, colorName: string) => void;
  onClose: () => void;
}

export function MaterialSelector({
  products,
  selectedProductId,
  selectedColorName,
  onSelect,
  onClose,
}: MaterialSelectorProps) {
  const [activeProduct, setActiveProduct] = useState<MaterialProduct>(
    products.find((p) => p.id === selectedProductId) || products[0]
  );
  const [activeColor, setActiveColor] = useState<MaterialColor>(
    activeProduct.colors.find((c) => c.name === selectedColorName) || activeProduct.colors[0]
  );
  const [compareMode, setCompareMode] = useState(false);
  const [compareProduct, setCompareProduct] = useState<MaterialProduct | null>(null);

  const handleConfirm = () => {
    onSelect(activeProduct.id, activeColor.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-6xl overflow-auto rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Select Your Roofing Material</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close material selector"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          {/* Left: Product List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700">Select Product</h3>
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  setActiveProduct(product);
                  setActiveColor(product.colors[0]);
                }}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  activeProduct.id === product.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{product.name}</div>
                    <div className="text-sm text-slate-600">
                      {product.manufacturer} - {product.productLine}
                    </div>
                  </div>
                  {activeProduct.id === product.id && <Check className="h-5 w-5 text-blue-600" />}
                </div>

                <div className="mt-2 flex gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {product.warranty}yr
                  </span>
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {product.windRating}mph
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />${product.pricing.total}/sq
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Middle: Product Details & Colors */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product Info */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="mb-3 text-lg font-bold text-slate-900">{activeProduct.name}</h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Warranty</div>
                  <div className="text-lg font-bold text-blue-600">
                    {activeProduct.warranty} Years
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">Wind Rating</div>
                  <div className="text-lg font-bold text-green-600">
                    {activeProduct.windRating} mph
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">Price per Square</div>
                  <div className="text-lg font-bold text-purple-600">
                    ${activeProduct.pricing.total}
                  </div>
                </div>
              </div>

              {activeProduct.impactRating && (
                <div className="mt-3 rounded-md bg-yellow-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-yellow-800">
                    <Shield className="h-4 w-4" />
                    Impact Resistant: {activeProduct.impactRating}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="text-sm font-semibold text-slate-700">Key Features:</div>
                <ul className="mt-2 space-y-1">
                  {activeProduct.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="text-sm text-slate-600">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Color Selector */}
            <div>
              <h3 className="mb-3 font-semibold text-slate-700">Select Color</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeProduct.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setActiveColor(color)}
                    className={`rounded-lg border-2 p-3 text-left transition-all ${
                      activeColor.name === color.name
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-md border border-slate-300 shadow-sm"
                        {...{ style: { backgroundColor: color.hexCode } }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-900">{color.name}</div>
                          {activeColor.name === color.name && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div className="text-xs text-slate-600">{color.description}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Popularity: {color.popularity}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Preview */}
            <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
              <h3 className="mb-3 font-semibold text-slate-700">Your Selection</h3>
              <div className="flex items-center gap-4">
                <div
                  className="h-20 w-20 rounded-lg border-2 border-slate-300 shadow-md"
                  {...{ style: { backgroundColor: activeColor.hexCode } }}
                />
                <div>
                  <div className="text-lg font-bold text-slate-900">{activeProduct.name}</div>
                  <div className="text-sm text-slate-600">Color: {activeColor.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{activeColor.description}</div>
                </div>
              </div>

              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <div className="text-sm font-semibold text-blue-900">Estimated Cost</div>
                <div className="mt-1 text-xs text-blue-700">
                  Material: ${activeProduct.pricing.material}/sq • Labor: $
                  {activeProduct.pricing.labor}/sq
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-600">
                  ${activeProduct.pricing.total}/square
                </div>
              </div>
            </div>

            {/* Comparison Mode */}
            {compareMode && compareProduct && (
              <div className="rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
                <h3 className="mb-3 font-semibold text-purple-900">
                  Comparing with {compareProduct.name}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{activeProduct.name}</div>
                    <div className="text-xs text-slate-600">
                      ${activeProduct.pricing.total}/sq • {activeProduct.warranty}yr warranty
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      {compareProduct.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      ${compareProduct.pricing.total}/sq • {compareProduct.warranty}
                      yr warranty
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className="text-sm text-slate-600 underline hover:text-slate-900"
            >
              {compareMode ? "Exit Compare Mode" : "Compare Products"}
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-6 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

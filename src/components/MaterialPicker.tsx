"use client";

import { Check, Package, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Product, VENDORS } from "@/data/vendors";

interface SelectedProduct extends Product {
  vendor: string;
  vendorSlug: string;
  category: string;
}

interface MaterialPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: SelectedProduct) => void;
  filterCategories?: string[]; // e.g., ["Shingle", "Accessories"]
  title?: string;
  description?: string;
}

export function MaterialPicker({
  open,
  onClose,
  onSelect,
  filterCategories,
  title = "Select Material",
  description = "Choose from verified manufacturer catalogs",
}: MaterialPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Flatten all products from all vendors
  const allProducts = useMemo(() => {
    const products: SelectedProduct[] = [];

    VENDORS.forEach((vendor) => {
      if (!vendor.productCatalog) return;

      vendor.productCatalog.forEach((category) => {
        category.products.forEach((product) => {
          products.push({
            ...product,
            vendor: vendor.name,
            vendorSlug: vendor.slug,
            category: category.name,
          });
        });
      });
    });

    return products;
  }, []);

  // Get unique categories from all products
  const availableCategories = useMemo(() => {
    const cats = new Set(allProducts.map((p) => p.category));
    return Array.from(cats).sort();
  }, [allProducts]);

  // Filter products based on search, vendor, and category
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Filter by search query
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.type.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by selected vendor
      const matchesVendor = !selectedVendor || product.vendorSlug === selectedVendor;

      // Filter by selected category
      const matchesCategory = !selectedCategory || product.category === selectedCategory;

      // Filter by allowed categories (if provided)
      const matchesAllowedCategories =
        !filterCategories ||
        filterCategories.some((cat) => product.category.toLowerCase().includes(cat.toLowerCase()));

      return matchesSearch && matchesVendor && matchesCategory && matchesAllowedCategories;
    });
  }, [allProducts, searchQuery, selectedVendor, selectedCategory, filterCategories]);

  const handleSelect = (product: SelectedProduct) => {
    onSelect(product);
    onClose();
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedVendor(null);
    setSelectedCategory(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-4 border-b pb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search products, materials, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Vendor Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-slate-700">Vendor:</span>
            <Button
              size="sm"
              variant={selectedVendor === null ? "default" : "outline"}
              onClick={() => setSelectedVendor(null)}
            >
              All
            </Button>
            {VENDORS.filter((v) => v.productCatalog && v.productCatalog.length > 0).map(
              (vendor) => (
                <Button
                  key={vendor.slug}
                  size="sm"
                  variant={selectedVendor === vendor.slug ? "default" : "outline"}
                  onClick={() => setSelectedVendor(vendor.slug)}
                >
                  {vendor.name}
                </Button>
              )
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-slate-700">Category:</span>
            <Button
              size="sm"
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {availableCategories.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Results Count & Reset */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
            </span>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-600">No products found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-1 md:grid-cols-2">
              {filteredProducts.map((product) => (
                <Card
                  key={`${product.vendorSlug}-${product.id}`}
                  className="group cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => handleSelect(product)}
                >
                  <CardContent className="space-y-3 p-4">
                    {/* Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
                            {product.name}
                          </h3>
                          <p className="text-sm text-slate-600">{product.type}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {product.vendor}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {product.category}
                      </Badge>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p className="line-clamp-2 text-sm text-slate-700">{product.description}</p>
                    )}

                    {/* Key Specs (show first 3) */}
                    {product.specs && product.specs.length > 0 && (
                      <div className="space-y-1">
                        {product.specs.slice(0, 3).map((spec, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-600">{spec.label}:</span>
                            <span className="font-medium text-slate-900">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Colors Preview */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-600">Colors:</span>
                        <div className="flex gap-1">
                          {product.colors.slice(0, 5).map((color) => (
                            // eslint-disable-next-line react/forbid-dom-props
                            <div
                              key={color.name}
                              className="h-4 w-4 rounded-full border border-slate-200"
                              style={color.hex ? { backgroundColor: color.hex } : undefined}
                              title={color.name}
                            />
                          ))}
                          {product.colors.length > 5 && (
                            <span className="text-xs text-slate-500">
                              +{product.colors.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warranty */}
                    {product.warranty && (
                      <div className="flex items-center gap-1 text-xs text-green-700">
                        <ShieldCheck className="h-3 w-3" />
                        {product.warranty}
                      </div>
                    )}

                    {/* Select Button */}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(product);
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Select This Product
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

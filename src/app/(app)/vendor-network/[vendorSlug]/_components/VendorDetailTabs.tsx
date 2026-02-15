/**
 * VIN — Vendor Detail Tabs (client)
 * Locations · Products · Programs · Assets
 */

"use client";

import {
  Award,
  Building2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Gift,
  MapPin,
  Package,
  Phone,
  Shield,
  Truck,
  User,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Location {
  id: string;
  locationName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  isPrimary: boolean;
  deliveryRadiusMi: number | null;
  localRepName: string | null;
  localRepPhone: string | null;
  emergencyPhone: string | null;
  hours?: Record<string, string> | null;
  email?: string | null;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  unitPrice: number | null;
  unit: string | null;
  inStock: boolean;
  tradeType: string | null;
}

interface Program {
  id: string;
  name: string;
  programType: string;
  description: string | null;
  discountPct: number | null;
  url: string | null;
  startsAt: string | null;
  endsAt: string | null;
}

interface Asset {
  id: string;
  assetType: string;
  label: string;
  url: string;
  fileSize: number | null;
}

interface VendorInfo {
  id: string;
  name: string;
  slug: string;
  emergencyPhone: string | null;
  financingAvail: boolean;
  rebatesAvail: boolean;
  certifications: string[];
  serviceRegions: string[];
}

interface Props {
  vendor: VendorInfo;
  locations: Location[];
  products: Product[];
  programs: Program[];
  assets: Asset[];
}

const TABS = [
  { key: "locations", label: "Locations", icon: MapPin },
  { key: "products", label: "Products", icon: Package },
  { key: "programs", label: "Programs & Rebates", icon: Gift },
  { key: "assets", label: "Brochures & Catalogs", icon: FileText },
  { key: "info", label: "Info", icon: Shield },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function VendorDetailTabs({ vendor, locations, products, programs, assets }: Props) {
  const [tab, setTab] = useState<TabKey>("locations");

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/50 p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const count =
            t.key === "locations"
              ? locations.length
              : t.key === "products"
                ? products.length
                : t.key === "programs"
                  ? programs.length
                  : t.key === "assets"
                    ? assets.length
                    : null;

          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {count !== null && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "locations" && <LocationsTab locations={locations} />}
      {tab === "products" && <ProductsTab products={products} />}
      {tab === "programs" && <ProgramsTab programs={programs} />}
      {tab === "assets" && <AssetsTab assets={assets} />}
      {tab === "info" && <InfoTab vendor={vendor} />}
    </div>
  );
}

// ── Locations ──
function LocationsTab({ locations }: { locations: Location[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!locations.length) return <Empty label="No locations on file." />;

  const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const DAY_LABELS: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((loc) => {
        const isExpanded = expandedId === loc.id;
        const hours = loc.hours as Record<string, string> | null;

        return (
          <Card
            key={loc.id}
            className={`cursor-pointer p-4 transition-all hover:shadow-md ${isExpanded ? "col-span-full ring-2 ring-primary/20 sm:col-span-2 lg:col-span-3" : ""}`}
            onClick={() => setExpandedId(isExpanded ? null : loc.id)}
          >
            <div className="mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h4 className="font-semibold">{loc.locationName || "Location"}</h4>
              {loc.isPrimary && <Badge variant="secondary">Primary</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {[loc.address, loc.city, loc.state, loc.zip].filter(Boolean).join(", ")}
            </p>

            {/* Quick info always visible */}
            <div className="mt-3 space-y-1 text-xs text-muted-foreground">
              {loc.phone && (
                <p className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <a
                    href={`tel:${loc.phone}`}
                    className="hover:text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {loc.phone}
                  </a>
                </p>
              )}
              {hours && !isExpanded && (
                <p className="flex items-center gap-1 text-green-600">
                  <Clock className="h-3 w-3" />
                  {(() => {
                    const today =
                      DAY_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
                    const todayHours = hours[today];
                    return todayHours && todayHours.toLowerCase() !== "closed"
                      ? `Today: ${todayHours}`
                      : "Closed today";
                  })()}
                </p>
              )}
              {loc.deliveryRadiusMi && (
                <p className="flex items-center gap-1">
                  <Truck className="h-3 w-3" /> {loc.deliveryRadiusMi} mi delivery radius
                </p>
              )}
            </div>

            {/* Expanded detail view */}
            {isExpanded && (
              <div className="mt-4 space-y-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                {/* Full hours */}
                {hours && (
                  <div>
                    <h5 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-primary" /> Business Hours
                    </h5>
                    <div className="grid grid-cols-2 gap-1 text-sm sm:grid-cols-4">
                      {DAY_ORDER.map((day) => {
                        const h = hours[day];
                        const isClosed = !h || h.toLowerCase() === "closed";
                        return (
                          <div
                            key={day}
                            className={`flex justify-between gap-2 rounded px-2 py-1 ${isClosed ? "text-muted-foreground" : ""}`}
                          >
                            <span className="font-medium">{DAY_LABELS[day]}</span>
                            <span className={isClosed ? "text-red-500" : "text-green-600"}>
                              {h || "Closed"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contact details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {loc.localRepName && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <User className="h-3.5 w-3.5 text-primary" /> Local Rep
                      </p>
                      <p className="mt-1 text-sm">{loc.localRepName}</p>
                      {loc.localRepPhone && (
                        <a
                          href={`tel:${loc.localRepPhone}`}
                          className="mt-0.5 block text-xs text-primary hover:underline"
                        >
                          {loc.localRepPhone}
                        </a>
                      )}
                    </div>
                  )}
                  {loc.emergencyPhone && (
                    <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-red-700 dark:text-red-400">
                        <Phone className="h-3.5 w-3.5" /> Emergency
                      </p>
                      <a
                        href={`tel:${loc.emergencyPhone}`}
                        className="mt-1 block text-sm font-bold text-red-600 hover:underline dark:text-red-400"
                      >
                        {loc.emergencyPhone}
                      </a>
                    </div>
                  )}
                  {loc.email && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> Email
                      </p>
                      <a
                        href={`mailto:${loc.email}`}
                        className="mt-1 block text-sm text-primary hover:underline"
                      >
                        {loc.email}
                      </a>
                    </div>
                  )}
                </div>

                <p className="text-center text-xs text-muted-foreground">Click card to collapse</p>
              </div>
            )}

            {!isExpanded && (
              <p className="mt-2 text-center text-xs text-muted-foreground/60">Click for details</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Products ──
function ProductsTab({ products }: { products: Product[] }) {
  if (!products.length) return <Empty label="No products listed yet." />;
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Product</th>
            <th className="px-4 py-3 text-left font-medium">SKU</th>
            <th className="px-4 py-3 text-left font-medium">Category</th>
            <th className="px-4 py-3 text-left font-medium">Trade</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3 text-center font-medium">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b last:border-b-0">
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.sku || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
              <td className="px-4 py-3 text-muted-foreground">{p.tradeType || "—"}</td>
              <td className="px-4 py-3 text-right">
                {p.unitPrice ? `$${p.unitPrice.toFixed(2)}` : "—"}
                {p.unit && <span className="text-muted-foreground">/{p.unit}</span>}
              </td>
              <td className="px-4 py-3 text-center">
                <Badge variant={p.inStock ? "default" : "destructive"}>
                  {p.inStock ? "In Stock" : "Out"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Programs ──
function ProgramsTab({ programs }: { programs: Program[] }) {
  if (!programs.length) return <Empty label="No programs or rebates available." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {programs.map((pr) => (
        <Card key={pr.id} className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            <h4 className="font-semibold">{pr.name}</h4>
            <Badge variant="secondary">{pr.programType}</Badge>
          </div>
          {pr.description && <p className="mb-2 text-sm text-muted-foreground">{pr.description}</p>}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {pr.discountPct && (
              <span className="font-semibold text-green-600">{pr.discountPct}% off</span>
            )}
            {pr.startsAt && <span>From: {new Date(pr.startsAt).toLocaleDateString()}</span>}
            {pr.endsAt && <span>Until: {new Date(pr.endsAt).toLocaleDateString()}</span>}
            {pr.url && (
              <a
                href={pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Details
              </a>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Assets ──
function AssetsTab({ assets }: { assets: Asset[] }) {
  if (!assets.length) return <Empty label="No brochures or catalogs available yet." />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((a) => (
        <a
          key={a.id}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <Card className="flex items-center justify-between p-4 transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium group-hover:text-primary">{a.label}</p>
                <p className="text-xs text-muted-foreground">
                  {a.assetType.replace(/_/g, " ")}
                  {a.fileSize ? ` · ${(a.fileSize / 1024).toFixed(0)} KB` : ""}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              <ExternalLink className="h-3.5 w-3.5" />
              View PDF
            </span>
          </Card>
        </a>
      ))}
    </div>
  );
}

// ── Info ──
function InfoTab({ vendor }: { vendor: VendorInfo }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {vendor.emergencyPhone && (
        <Card className="p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-red-600">
            <Phone className="h-4 w-4" /> Emergency Line
          </h4>
          <a
            href={`tel:${vendor.emergencyPhone}`}
            className="text-lg font-bold text-red-600 hover:underline"
          >
            {vendor.emergencyPhone}
          </a>
        </Card>
      )}

      {vendor.financingAvail && (
        <Card className="p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-600">
            <CreditCard className="h-4 w-4" /> Financing Available
          </h4>
          <p className="text-sm text-muted-foreground">
            This vendor offers financing options for qualifying projects.
          </p>
        </Card>
      )}

      {vendor.rebatesAvail && (
        <Card className="p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-green-600">
            <Gift className="h-4 w-4" /> Rebates Available
          </h4>
          <p className="text-sm text-muted-foreground">
            Check the Programs tab for current rebate offers.
          </p>
        </Card>
      )}

      {vendor.certifications.length > 0 && (
        <Card className="p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold">
            <Award className="h-4 w-4 text-primary" /> Certifications
          </h4>
          <div className="flex flex-wrap gap-2">
            {vendor.certifications.map((cert) => (
              <Badge key={cert} variant="outline">
                {cert}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {vendor.serviceRegions.length > 0 && (
        <Card className="p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4 text-primary" /> Service Regions
          </h4>
          <div className="flex flex-wrap gap-2">
            {vendor.serviceRegions.map((r) => (
              <Badge key={r} variant="secondary">
                {r}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Empty state ──
function Empty({ label }: { label: string }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

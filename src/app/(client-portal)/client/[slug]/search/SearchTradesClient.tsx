/**
 * SearchTradesClient - Client Component for Trades Search UI
 *
 * Displays search filters and results for finding trades/professionals.
 */

"use client";

import {
  BadgeCheck,
  Building2,
  Filter,
  Loader2,
  MapPin,
  Phone,
  Search,
  Star,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface TradesCompany {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  description: string | null;
  specialties: string[];
  rating: number | null;
  reviewCount: number;
  verified: boolean;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  connectionStatus: string | null;
}

interface SearchTradesClientProps {
  clientId: string;
  clientSlug: string;
  clientLocation: {
    city: string | null;
    state: string | null;
    postal: string | null;
  };
  tradesCompanies: TradesCompany[];
  filters: {
    service?: string;
    city?: string;
    state?: string;
    zip?: string;
    rating?: string;
  };
  specialties: string[];
  states: string[];
}

export function SearchTradesClient({
  clientId,
  clientSlug,
  clientLocation,
  tradesCompanies,
  filters,
  specialties,
  states,
}: SearchTradesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Local filter state
  const [serviceFilter, setServiceFilter] = useState(filters.service || "");
  const [cityFilter, setCityFilter] = useState(filters.city || clientLocation.city || "");
  const [stateFilter, setStateFilter] = useState(filters.state || clientLocation.state || "");
  const [zipFilter, setZipFilter] = useState(filters.zip || clientLocation.postal || "");
  const [ratingFilter, setRatingFilter] = useState(filters.rating || "");
  const [showFilters, setShowFilters] = useState(false);

  // Connection loading states
  const [connectingIds, setConnectingIds] = useState<Set<string>>(new Set());

  function applyFilters() {
    startTransition(() => {
      const params = new URLSearchParams();
      if (serviceFilter) params.set("service", serviceFilter);
      if (cityFilter) params.set("city", cityFilter);
      if (stateFilter) params.set("state", stateFilter);
      if (zipFilter) params.set("zip", zipFilter);
      if (ratingFilter) params.set("rating", ratingFilter);

      router.push(`/client/${clientSlug}/search?${params.toString()}`);
    });
  }

  function clearFilters() {
    setServiceFilter("");
    setCityFilter("");
    setStateFilter("");
    setZipFilter("");
    setRatingFilter("");
    startTransition(() => {
      router.push(`/client/${clientSlug}/search`);
    });
  }

  async function handleConnect(companyId: string, companyName: string) {
    setConnectingIds((prev) => new Set(prev).add(companyId));

    try {
      const res = await fetch("/api/client/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          contractorId: companyId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to connect");
      }

      toast({
        title: "Connection Requested",
        description: `Your connection request to ${companyName} has been sent.`,
      });

      // Refresh the page to update connection status
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to connect",
        variant: "destructive",
      });
    } finally {
      setConnectingIds((prev) => {
        const next = new Set(prev);
        next.delete(companyId);
        return next;
      });
    }
  }

  const hasActiveFilters =
    filters.service || filters.city || filters.state || filters.zip || filters.rating;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Find Professionals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search for trusted contractors and trades in your area
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Search & Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Quick Search */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by city or ZIP code..."
                  value={cityFilter || zipFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d+$/.test(val)) {
                      setZipFilter(val);
                      setCityFilter("");
                    } else {
                      setCityFilter(val);
                      setZipFilter("");
                    }
                  }}
                  className="pl-9"
                />
              </div>

              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Services</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={applyFilters} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Search
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-slate-100" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    State
                  </label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any State</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    ZIP Code
                  </label>
                  <Input
                    placeholder="e.g., 85001"
                    value={zipFilter}
                    onChange={(e) => setZipFilter(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Minimum Rating
                  </label>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Rating</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3.5">3.5+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="ghost" onClick={clearFilters} className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.service && (
                  <Badge variant="secondary" className="gap-1">
                    Service: {filters.service}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setServiceFilter("");
                        applyFilters();
                      }}
                    />
                  </Badge>
                )}
                {filters.city && (
                  <Badge variant="secondary" className="gap-1">
                    City: {filters.city}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setCityFilter("");
                        applyFilters();
                      }}
                    />
                  </Badge>
                )}
                {filters.state && (
                  <Badge variant="secondary" className="gap-1">
                    State: {filters.state}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setStateFilter("");
                        applyFilters();
                      }}
                    />
                  </Badge>
                )}
                {filters.zip && (
                  <Badge variant="secondary" className="gap-1">
                    ZIP: {filters.zip}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setZipFilter("");
                        applyFilters();
                      }}
                    />
                  </Badge>
                )}
                {filters.rating && (
                  <Badge variant="secondary" className="gap-1">
                    Rating: {filters.rating}+ Stars
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        setRatingFilter("");
                        applyFilters();
                      }}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tradesCompanies.length} professional{tradesCompanies.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Results Grid */}
        {tradesCompanies.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Professionals Found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your filters or search in a different area.
            </p>
            <Button variant="outline" onClick={clearFilters} className="mt-4">
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tradesCompanies.map((company) => (
              <TradesCompanyCard
                key={company.id}
                company={company}
                onConnect={() => handleConnect(company.id, company.name)}
                isConnecting={connectingIds.has(company.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Trades Company Card Component
interface TradesCompanyCardProps {
  company: TradesCompany;
  onConnect: () => void;
  isConnecting: boolean;
}

function TradesCompanyCard({ company, onConnect, isConnecting }: TradesCompanyCardProps) {
  const isConnected = company.connectionStatus === "connected";
  const isPending =
    company.connectionStatus === "pending" || company.connectionStatus === "pro_invited";

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-slate-100">
            {company.logo ? (
              <Image src={company.logo} alt={company.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-6 w-6 text-slate-400" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-1.5 text-base">
              <span className="truncate">{company.name}</span>
              {company.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />}
            </CardTitle>

            {/* Location */}
            {(company.city || company.state) && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {[company.city, company.state].filter(Boolean).join(", ")}
              </div>
            )}

            {/* Rating */}
            {company.rating !== null && (
              <div className="mt-1 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{company.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({company.reviewCount} review{company.reviewCount !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Specialties */}
        {company.specialties.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {company.specialties.slice(0, 4).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {company.specialties.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{company.specialties.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Description */}
        {company.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{company.description}</p>
        )}

        {/* Contact Info */}
        {company.phone && (
          <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {company.phone}
          </div>
        )}

        {/* Connect Button */}
        <div className="mt-auto">
          {isConnected ? (
            <Button variant="secondary" className="w-full" disabled>
              <BadgeCheck className="mr-2 h-4 w-4" />
              Connected
            </Button>
          ) : isPending ? (
            <Button variant="outline" className="w-full" disabled>
              <Loader2 className="mr-2 h-4 w-4" />
              Pending
            </Button>
          ) : (
            <Button onClick={onConnect} disabled={isConnecting} className="w-full">
              {isConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

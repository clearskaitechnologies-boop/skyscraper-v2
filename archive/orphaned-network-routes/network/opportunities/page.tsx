"use client";

import { useAuth } from "@clerk/nextjs";
import { Filter, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { OpportunityCard } from "@/components/trades/OpportunityCard";
import { FullAccessBadge, TokenBadge } from "@/components/trades/TokenBadge";
import { UpgradeModal } from "@/components/trades/UpgradeModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TRADE_TYPES } from "@/lib/trades";

export const dynamic = "force-dynamic";

interface Opportunity {
  id: string;
  created_by: string;
  title: string;
  body: string;
  trade: string;
  city: string | null;
  state: string | null;
  created_at: string;
  applicant_count: number;
}

export default function OpportunitiesPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [fullAccessExpiresAt, setFullAccessExpiresAt] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");

  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<
    "insufficient_tokens" | "full_access_required"
  >("full_access_required");

  useEffect(() => {
    fetchOpportunities();
    fetchUserStatus();
  }, [selectedTrade, selectedState]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTrade !== "all") params.append("trade", selectedTrade);
      if (selectedState !== "all") params.append("state", selectedState);

      const response = await fetch(`/api/trades/opportunities?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setOpportunities(data.opportunities || []);
      } else {
        toast.error("Failed to load opportunities");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatus = async () => {
    try {
      // Fetch token balance
      const tokenRes = await fetch("/api/tokens/balance");
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        setTokenBalance(tokenData.balance || 0);
      }

      // Fetch Full Access status
      const accessRes = await fetch("/api/trades/membership");
      if (accessRes.ok) {
        const accessData = await accessRes.json();
        setHasFullAccess(accessData.hasFullAccess || false);
        setFullAccessExpiresAt(accessData.expiresAt || null);
      }
    } catch (err) {
      console.error("User status fetch error:", err);
    }
  };

  const handleCreateOpportunity = () => {
    if (!hasFullAccess) {
      setUpgradeReason("full_access_required");
      setShowUpgradeModal(true);
      return;
    }

    router.push("/network/opportunity/new");
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      opp.title.toLowerCase().includes(term) ||
      opp.body.toLowerCase().includes(term) ||
      opp.trade.toLowerCase().includes(term) ||
      opp.city?.toLowerCase().includes(term) ||
      opp.state?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Opportunities</h1>
          <p className="mt-1 text-muted-foreground">
            Find and apply to trades opportunities in your area
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TokenBadge balance={tokenBalance} />
          <FullAccessBadge expiresAt={fullAccessExpiresAt} variant="compact" />
          <Button onClick={handleCreateOpportunity} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Post Opportunity
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger>
                <SelectValue placeholder="All Trades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                {TRADE_TYPES.map((trade) => (
                  <SelectItem key={trade} value={trade}>
                    {trade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                {/* Add more states as needed */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No opportunities found</h3>
            <p className="mb-6 text-muted-foreground">
              Try adjusting your filters or be the first to post an opportunity
            </p>
            <Button onClick={handleCreateOpportunity}>
              <Plus className="mr-2 h-4 w-4" />
              Post Opportunity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredOpportunities.length} opportunit
              {filteredOpportunities.length === 1 ? "y" : "ies"} found
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                id={opp.id}
                title={opp.title}
                body={opp.body}
                trade={opp.trade}
                city={opp.city || undefined}
                state={opp.state || undefined}
                createdAt={opp.created_at}
                applicantCount={opp.applicant_count}
                createdBy={opp.created_by}
                hasFullAccess={hasFullAccess}
                tokenBalance={tokenBalance}
              />
            ))}
          </div>
        </>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        reason={upgradeReason}
        currentBalance={tokenBalance}
      />
    </div>
  );
}

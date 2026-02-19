"use client";

import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Check, Copy, Loader2, Plus, Search, Send, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { PageSectionCard } from "@/components/layout/PageSectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logger } from "@/lib/logger";

interface SearchResult {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: "contact" | "network";
}

export default function NetworkCreatePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const initialType = searchParams?.get("type") || "client";

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If type=trade, redirect to trades onboarding
  if (initialType === "trade") {
    return <TradeCreatePage />;
  }

  // Default: show the client add page
  return <AddClientPage />;
}

// ============================================================================
// ADD CLIENT PAGE - Streamlined client-only experience
// ============================================================================
function AddClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // New client form
  const [clientData, setClientData] = useState({
    name: "",
    slug: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    propertyAddress: "",
  });

  // Search for existing contacts/clients
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      logger.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  // Create new client network
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/network/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientData.name,
          slug: clientData.slug,
          contacts: clientData.contactName
            ? [
                {
                  name: clientData.contactName,
                  email: clientData.contactEmail,
                  phone: clientData.contactPhone,
                  role: "Homeowner",
                },
              ]
            : [],
          propertyAddress: clientData.propertyAddress,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to create client");
        setLoading(false);
        return;
      }

      const result = await response.json();
      toast.success("Client added successfully!");

      // Generate invite link for this client
      if (result.network?.slug) {
        setInviteLink(`${window.location.origin}/portal/${result.network.slug}/join`);
      }

      router.push("/network/clients");
    } catch (err: any) {
      toast.error(err.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  // Send email invite to client
  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviteSending(true);
    try {
      const response = await fetch("/api/network/clients/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: clientData.contactName || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to send invite");
        return;
      }

      const result = await response.json();
      setInviteSent(true);
      setInviteLink(result.inviteLink || "");
      toast.success(`Invite sent to ${inviteEmail}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setInviteSending(false);
    }
  };

  // Copy invite link
  const handleCopyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setClientData({
      ...clientData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    });
  };

  // Connect to existing contact
  const handleConnectExisting = async (contact: SearchResult) => {
    setLoading(true);
    try {
      const response = await fetch("/api/network/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name,
          slug: contact.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          contacts: [
            {
              name: contact.name,
              email: contact.email,
              phone: contact.phone || "",
              role: "Homeowner",
            },
          ],
          existingContactId: contact.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || "Failed to connect client");
        return;
      }

      toast.success(`${contact.name} added to your client network!`);
      router.push("/network/clients");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHero
        section="network"
        title="Add Client"
        subtitle="Add a new client to your network or invite them via email"
      />

      {/* Search Section */}
      <PageSectionCard title="Find Existing Contact" className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Found {searchResults.length} result(s)
            </p>
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-sm text-muted-foreground">{result.email}</p>
                </div>
                <Button size="sm" onClick={() => handleConnectExisting(result)} disabled={loading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add to Network
                </Button>
              </div>
            ))}
          </div>
        )}
      </PageSectionCard>

      {/* Add New Client Form */}
      <PageSectionCard title="Add New Client" className="mb-6">
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client/Property Name *</Label>
              <Input
                id="clientName"
                required
                placeholder="e.g., Smith Family Home"
                value={clientData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Input
                id="propertyAddress"
                placeholder="123 Main St, City, State"
                value={clientData.propertyAddress}
                onChange={(e) => setClientData({ ...clientData, propertyAddress: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="mb-3 font-medium">Contact Information</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="John Smith"
                  value={clientData.contactName}
                  onChange={(e) => setClientData({ ...clientData, contactName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={clientData.contactEmail}
                  onChange={(e) => setClientData({ ...clientData, contactEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={clientData.contactPhone}
                  onChange={(e) => setClientData({ ...clientData, contactPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </>
            )}
          </Button>
        </form>
      </PageSectionCard>

      {/* Invite Section */}
      <PageSectionCard title="Send Email Invite">
        <p className="mb-4 text-sm text-muted-foreground">
          Send an invite link to your client. They&apos;ll receive an email and notification to join
          their client portal where they can view project updates, documents, and communicate with
          you.
        </p>

        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="Enter client's email address..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleSendInvite} disabled={inviteSending || inviteSent}>
            {inviteSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : inviteSent ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {inviteSent ? "Sent!" : "Send Invite"}
          </Button>
        </div>

        {inviteLink && (
          <div className="mt-4 rounded-lg border bg-muted/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Shareable Invite Link</span>
              <Button size="sm" variant="ghost" onClick={handleCopyLink}>
                {linkCopied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {linkCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <code className="block break-all rounded bg-background p-2 text-xs">{inviteLink}</code>
          </div>
        )}
      </PageSectionCard>

      <div className="mt-6 flex justify-start">
        <Button variant="outline" asChild>
          <Link href="/network/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}

// ============================================================================
// TRADE CREATE PAGE - Original trade profile creation
// ============================================================================
function TradeCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [tradeData, setTradeData] = useState({
    companyName: "",
    tradeType: "",
    phone: "",
    email: "",
    website: "",
    serviceAreas: "",
  });

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/network/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create trade profile");
        setLoading(false);
        return;
      }

      router.push("/network/trades");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHero
        section="network"
        title="Add Trade Partner"
        subtitle="Add a contractor, vendor, or service provider to your network"
      />

      <PageSectionCard title="Trade Profile">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleCreateTrade} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                required
                value={tradeData.companyName}
                onChange={(e) => setTradeData({ ...tradeData, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tradeType">Trade Type *</Label>
              <Input
                id="tradeType"
                required
                placeholder="e.g., Roofing, Plumbing"
                value={tradeData.tradeType}
                onChange={(e) => setTradeData({ ...tradeData, tradeType: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={tradeData.phone}
                onChange={(e) => setTradeData({ ...tradeData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={tradeData.email}
                onChange={(e) => setTradeData({ ...tradeData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://"
              value={tradeData.website}
              onChange={(e) => setTradeData({ ...tradeData, website: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceAreas">Service Areas</Label>
            <Input
              id="serviceAreas"
              placeholder="e.g., Dallas, Fort Worth, Arlington"
              value={tradeData.serviceAreas}
              onChange={(e) => setTradeData({ ...tradeData, serviceAreas: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Trade Profile
              </>
            )}
          </Button>
        </form>
      </PageSectionCard>

      <div className="mt-6 flex justify-start">
        <Button variant="outline" asChild>
          <Link href="/network/trades">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trades
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}

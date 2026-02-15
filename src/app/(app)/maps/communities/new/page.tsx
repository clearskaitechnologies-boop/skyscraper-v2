"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/layout/PageHero";
import { CommunityMapDraw } from "@/components/maps/CommunityMapDraw";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Create Community from Map Page
 *
 * Workflow:
 * 1. User draws polygon on map
 * 2. System estimates home count
 * 3. User enters community name, city, state
 * 4. POST /api/community/create
 * 5. Redirect to community detail page
 */
export default function NewCommunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [polygon, setPolygon] = useState<any>(null);
  const [homeCount, setHomeCount] = useState<number>(0);

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
  });

  const handlePolygonComplete = (geometry: any, estimatedHomes: number) => {
    setPolygon(geometry);
    setHomeCount(estimatedHomes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!polygon) {
      toast.error("Please draw a polygon on the map");
      return;
    }

    if (!formData.name || !formData.city || !formData.state) {
      toast.error("Please fill out all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/community/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          city: formData.city,
          state: formData.state,
          geometry: polygon,
          homeCount,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        throw new Error(data.message || "Failed to create community");
      }

      toast.success("Community created successfully!");
      router.push(`/maps/communities/${data.community.id}`);
    } catch (error: any) {
      console.error("Error creating community:", error);
      toast.error(error.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        section="jobs"
        title="Create Community"
        subtitle="Draw a polygon on the map to define the community boundary"
        icon={<MapPin className="h-6 w-6" />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-4 lg:col-span-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Community Name</Label>
              <Input
                id="name"
                placeholder="e.g., Oakwood Estates"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Phoenix"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="e.g., AZ"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                maxLength={2}
                required
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">Estimated Homes</div>
              <div className="text-2xl font-bold">{homeCount || "—"}</div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !polygon}>
              {loading ? "Creating..." : "Create Community"}
            </Button>
          </form>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <CommunityMapDraw onPolygonComplete={handlePolygonComplete} />
        </div>
      </div>
    </div>
  );
}

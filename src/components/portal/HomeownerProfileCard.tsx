"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect,useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  fullName?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal?: string | null;
}

export function HomeownerProfileCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({});
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await fetch("/api/portal/profile");
      if (!response.ok) throw new Error("Failed to load profile");

      const data = await response.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (error: any) {
      console.error("Load profile error:", error);
      toast({
        title: "Error",
        description: "Failed to load your profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save");
      }

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Your profile has been updated",
        });
        setProfile(data.profile);
      }
    } catch (error: any) {
      console.error("Save profile error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-sm text-slate-600">Loading your profile…</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
        <p className="mt-1 text-sm text-slate-600">
          Keep your contact details up to date for your claim
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={profile.fullName || ""}
            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            placeholder="John Doe"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={profile.phone || ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <Label htmlFor="address">Property Address</Label>
          <Input
            id="address"
            value={profile.address || ""}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profile.city || ""}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="City"
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={profile.state || ""}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              placeholder="CA"
              maxLength={2}
            />
          </div>
          <div className="col-span-1">
            <Label htmlFor="postal">Zip Code</Label>
            <Input
              id="postal"
              value={profile.postal || ""}
              onChange={(e) => setProfile({ ...profile, postal: e.target.value })}
              placeholder="90210"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

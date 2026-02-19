/**
 * CompanyInfoEditor Component
 * Inline editable company information for trades profiles
 * Simplified - no need for separate company entity
 */

"use client";

import { Building2, Globe, Loader2, Mail, MapPin, Save, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyInfoEditorProps {
  memberId: string;
  initialData: {
    companyName: string;
    companyEmail: string;
    companyWebsite: string;
    companyLicense: string;
    city: string;
    state: string;
    zip: string;
    serviceArea: string;
  };
}

export default function CompanyInfoEditor({ memberId, initialData }: CompanyInfoEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/trades/member/company-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          ...formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      toast.success("Company info saved!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.message || "Failed to save company info");
    } finally {
      setSaving(false);
    }
  };

  const hasAnyData = Object.values(formData).some((v) => v);

  if (!isEditing && !hasAnyData) {
    return (
      <Card className="border-dashed border-blue-200 bg-blue-50/50">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Building2 className="mb-3 h-10 w-10 text-blue-400" />
          <h3 className="mb-2 font-semibold text-slate-800">Add Your Business Info</h3>
          <p className="mb-4 max-w-xs text-sm text-slate-600">
            Add your company name, license, website, and service area to help clients find and trust
            you.
          </p>
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Building2 className="h-4 w-4" />
            Add Company Info
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
            Business Info
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.companyName && (
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span className="font-medium">{formData.companyName}</span>
            </div>
          )}
          {formData.companyLicense && (
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="h-4 w-4" />
              <span>License #{formData.companyLicense}</span>
            </div>
          )}
          {formData.companyEmail && (
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${formData.companyEmail}`} className="hover:text-blue-600">
                {formData.companyEmail}
              </a>
            </div>
          )}
          {formData.companyWebsite && (
            <div className="flex items-center gap-2 text-slate-600">
              <Globe className="h-4 w-4" />
              <a
                href={formData.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600"
              >
                {formData.companyWebsite.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          {(formData.city || formData.state || formData.zip) && (
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>
                {[formData.city, formData.state, formData.zip].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {formData.serviceArea && (
            <div className="mt-2 text-sm text-slate-500">
              <span className="font-medium">Service Area:</span> {formData.serviceArea}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-blue-600" />
          Edit Business Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company/Business Name</Label>
          <Input
            id="companyName"
            placeholder="Your Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Business Email</Label>
            <Input
              id="companyEmail"
              type="email"
              placeholder="contact@company.com"
              value={formData.companyEmail}
              onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Website</Label>
            <Input
              id="companyWebsite"
              type="url"
              placeholder="https://yourcompany.com"
              value={formData.companyWebsite}
              onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyLicense">Contractor License #</Label>
          <Input
            id="companyLicense"
            placeholder="ROC123456"
            value={formData.companyLicense}
            onChange={(e) => setFormData({ ...formData, companyLicense: e.target.value })}
          />
          <p className="text-xs text-slate-500">Your state contractor license number</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Phoenix"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="AZ"
              maxLength={2}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              placeholder="85001"
              maxLength={5}
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value.replace(/\D/g, "") })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceArea">Service Area Description</Label>
          <Input
            id="serviceArea"
            placeholder="e.g., Phoenix Metro, Maricopa County, Northern Arizona"
            value={formData.serviceArea}
            onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
          />
          <p className="text-xs text-slate-500">Describe the areas where you provide services</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Building2, Loader2, MapPin, Save, Shield,Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ContractorProfileFormProps {
  orgId: string;
  userId: string;
  existingProfile: {
    id: string;
    businessName: string;
    slug: string;
    tagline: string;
    about: string;
    phone: string;
    email: string;
    website: string;
    services: string[];
    serviceAreas: string[];
    primaryTrade: string;
    emergencyAvailable: boolean;
    acceptingLeads: boolean;
    licenseNumber: string;
    isPublic: boolean;
  } | null;
}

const TRADE_OPTIONS = [
  "Roofing",
  "Plumbing",
  "Electrical",
  "HVAC",
  "General Contractor",
  "Restoration",
  "Water Damage",
  "Fire Damage",
  "Mold Remediation",
  "Flooring",
  "Painting",
  "Carpentry",
  "Masonry",
  "Landscaping",
  "Other",
];

export default function ContractorProfileForm({
  orgId,
  userId,
  existingProfile,
}: ContractorProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: existingProfile?.businessName || "",
    slug: existingProfile?.slug || "",
    tagline: existingProfile?.tagline || "",
    about: existingProfile?.about || "",
    phone: existingProfile?.phone || "",
    email: existingProfile?.email || "",
    website: existingProfile?.website || "",
    primaryTrade: existingProfile?.primaryTrade || "",
    licenseNumber: existingProfile?.licenseNumber || "",
    emergencyAvailable: existingProfile?.emergencyAvailable || false,
    acceptingLeads: existingProfile?.acceptingLeads !== false,
    isPublic: existingProfile?.isPublic !== false,
  });

  const [selectedServices, setSelectedServices] = useState<string[]>(
    existingProfile?.services || []
  );
  
  const [serviceAreas, setServiceAreas] = useState<string>(
    existingProfile?.serviceAreas?.join(", ") || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate slug from business name if not editing
      const slug = existingProfile
        ? formData.slug
        : formData.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

      const profileData = {
        orgId,
        userId,
        businessName: formData.businessName,
        slug,
        tagline: formData.tagline,
        about: formData.about,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        primaryTrade: formData.primaryTrade,
        services: selectedServices,
        serviceAreas: serviceAreas
          .split(",")
          .map((area) => area.trim())
          .filter(Boolean),
        licenseNumber: formData.licenseNumber,
        emergencyAvailable: formData.emergencyAvailable,
        acceptingLeads: formData.acceptingLeads,
        isPublic: formData.isPublic,
      };

      const response = await fetch("/api/contractor/profile", {
        method: existingProfile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save profile");
      }

      toast.success(
        existingProfile
          ? "Profile updated successfully!"
          : "Profile created successfully!"
      );
      
      router.push("/network");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Information */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-[color:var(--text)]">
            Business Information
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }))
                }
                placeholder="ABC Roofing & Restoration"
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="primaryTrade" className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                Primary Trade *
              </label>
              <select
                id="primaryTrade"
                required
                title="Select your primary trade"
                value={formData.primaryTrade}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    primaryTrade: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              >
                <option value="">Select trade</option>
                {TRADE_OPTIONS.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
              Tagline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tagline: e.target.value }))
              }
              placeholder="Your trusted partner for quality repairs"
              className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
              About Your Business
            </label>
            <textarea
              value={formData.about}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, about: e.target.value }))
              }
              rows={4}
              placeholder="Tell potential clients about your business, experience, and what makes you unique..."
              className="w-full resize-none rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="(555) 123-4567"
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="contact@business.com"
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                placeholder="https://yourbusiness.com"
                className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services Offered */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
            <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-[color:var(--text)]">
            Services Offered
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {TRADE_OPTIONS.map((service) => (
            <label
              key={service}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--surface-2)] p-3 transition hover:bg-[var(--surface-glass)]"
            >
              <input
                type="checkbox"
                checked={selectedServices.includes(service)}
                onChange={() => toggleService(service)}
                className="h-4 w-4 rounded text-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]"
              />
              <span className="text-sm text-[color:var(--text)]">
                {service}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Service Areas */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
            <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-[color:var(--text)]">
            Service Areas
          </h3>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            Cities or ZIP Codes (comma-separated) *
          </label>
          <textarea
            required
            value={serviceAreas}
            onChange={(e) => setServiceAreas(e.target.value)}
            rows={3}
            placeholder="Springfield, 62701, 62702, Bloomington, Normal"
            className="w-full resize-none rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
          />
          <p className="mt-2 text-xs text-[color:var(--muted)]">
            Enter cities, ZIP codes, or regions you serve, separated by commas
          </p>
        </div>
      </div>

      {/* License & Verification */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
            <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-[color:var(--text)]">
            License & Verification
          </h3>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">
            License Number
          </label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                licenseNumber: e.target.value,
              }))
            }
            placeholder="ABC-123456"
            className="w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-xl font-bold text-[color:var(--text)]">
          Profile Settings
        </h3>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between rounded-xl bg-[var(--surface-2)] p-4 transition hover:bg-[var(--surface-glass)]">
            <div>
              <p className="font-medium text-[color:var(--text)]">
                Accept New Leads
              </p>
              <p className="text-sm text-[color:var(--muted)]">
                Receive inquiries from potential clients
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.acceptingLeads}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  acceptingLeads: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded text-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-xl bg-[var(--surface-2)] p-4 transition hover:bg-[var(--surface-glass)]">
            <div>
              <p className="font-medium text-[color:var(--text)]">
                Emergency Services Available
              </p>
              <p className="text-sm text-[color:var(--muted)]">
                Available for urgent 24/7 emergency calls
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.emergencyAvailable}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  emergencyAvailable: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded text-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-xl bg-[var(--surface-2)] p-4 transition hover:bg-[var(--surface-glass)]">
            <div>
              <p className="font-medium text-[color:var(--text)]">
                Public Profile
              </p>
              <p className="text-sm text-[color:var(--muted)]">
                Show your profile in the public contractor directory
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPublic: e.target.checked,
                }))
              }
              className="h-5 w-5 rounded text-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]"
            />
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-xl bg-[var(--surface-2)] px-6 py-3 font-semibold text-[color:var(--text)] transition hover:bg-[var(--surface-glass)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] px-6 py-3 font-semibold text-white shadow-[var(--glow)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              {existingProfile ? "Update Profile" : "Create Profile"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

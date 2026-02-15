"use client";

import { Eye, Globe, ImageIcon, Palette, Settings } from "lucide-react";
import { useState } from "react";

import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";

export default function CustomerPortalCustomizationPage() {
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [logoUrl, setLogoUrl] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  return (
    <div className="space-y-6 p-8">
      <PageHero
        section="settings"
        title="Customer Portal Customization"
        subtitle="White-label your client-facing portal"
        icon={<Settings className="h-6 w-6" />}
      />

      {/* Preview */}
      <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold dark:text-slate-100">
            <Eye className="h-5 w-5 text-blue-600" />
            Preview
          </h2>
          <button className="rounded-lg border px-4 py-2 hover:bg-gray-50">View Full Portal</button>
        </div>
        <div className="rounded-lg border-2 p-8" style={{ borderColor: primaryColor }}>
          <div className="mb-6 flex items-center gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                Your Company
              </div>
              <div className="text-sm text-gray-600">{customDomain || "portal.skaiscrape.com"}</div>
            </div>
          </div>
          <div
            className="flex h-32 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Portal Content Preview
          </div>
        </div>
      </div>

      {/* Customization Settings */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold dark:text-slate-100">
            <Palette className="h-5 w-5 text-blue-600" />
            Branding
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Company Logo URL</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full rounded-lg border px-4 py-2"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Primary Brand Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-12 w-16 cursor-pointer rounded-lg border"
                  aria-label="Primary brand color picker"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 rounded-lg border px-4 py-2 font-mono"
                  placeholder="#000000"
                  aria-label="Primary brand color hex code"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold dark:text-slate-100">
            <Globe className="h-5 w-5 text-blue-600" />
            Domain Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Custom Domain</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full rounded-lg border px-4 py-2"
                placeholder="portal.yourcompany.com"
              />
              <p className="mt-1 text-sm text-gray-600">
                Point your CNAME record to: portal.skaiscrape.com
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="ssl" defaultChecked className="h-4 w-4" />
              <label htmlFor="ssl" className="text-sm font-medium">
                Enable SSL/HTTPS
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button>Save Changes</Button>
        <Button variant="outline">Reset to Default</Button>
      </div>
    </div>
  );
}

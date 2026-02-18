import { currentUser } from "@clerk/nextjs/server";
import { Paintbrush } from "lucide-react";
import { redirect } from "next/navigation";

import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export default async function WhiteLabelPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const { orgId, userId } = await getCurrentUserPermissions();

  if (!orgId) {
    redirect("/onboarding/start");
  }

  // ITEM 36: White label customization
  const org = await prisma.org.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      brandLogoUrl: true,
    },
  });

  // Fetch org branding if exists
  const branding = await prisma.org_branding.findFirst({
    where: { orgId },
  });

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <PageHero
        section="settings"
        title="White Label Settings"
        subtitle="Customize branding, colors, and logos"
        icon={<Paintbrush className="h-6 w-6" />}
      />

      <div className="space-y-6">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          🚧 <strong>Preview Mode</strong> — White-label customization is coming soon. Changes are
          not saved yet.
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Brand Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  defaultValue={org?.name}
                  className="w-full rounded border px-3 py-2"
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Logo URL</label>
                <input
                  type="text"
                  defaultValue={branding?.logoUrl || org?.brandLogoUrl || ""}
                  className="w-full rounded border px-3 py-2"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Primary Color</label>
                  <input
                    type="color"
                    defaultValue={branding?.colorPrimary || "#3B82F6"}
                    className="h-10 w-full rounded border"
                    aria-label="Primary brand color"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Secondary Color</label>
                  <input
                    type="color"
                    defaultValue={branding?.colorAccent || "#6366F1"}
                    className="h-10 w-full rounded border"
                    aria-label="Secondary brand color"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Website</label>
                <input
                  type="text"
                  defaultValue={branding?.website || ""}
                  className="w-full rounded border px-3 py-2"
                  placeholder="https://yourcompany.com"
                />
              </div>
              <p className="text-sm text-gray-600">
                This information will appear on your branded documents and client portal.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              Customize email templates with your branding and messaging.
            </p>
            <Button>Configure Email Templates</Button>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

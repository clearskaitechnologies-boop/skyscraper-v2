/**
 * Multi-step onboarding wizard: Company → Branding → Defaults → Email → Finish
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/integrations/supabase/client";

export default function Onboarding() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  // Step 1: Company basics
  const [company, setCompany] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postal: "",
  });

  // Step 2: Branding
  const [logo, setLogo] = useState<File | undefined>();
  const [primaryColor, setPrimaryColor] = useState("#0ea5a4");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");

  // Step 3: Report defaults
  const [defaultMode, setDefaultMode] = useState<"retail" | "insurance" | "inspection">(
    "inspection"
  );
  const [defaultPhotoLayout, setDefaultPhotoLayout] = useState<2 | 3 | 4>(3);
  const [autoDetect, setAutoDetect] = useState(true);
  const [autoPipeline, setAutoPipeline] = useState(true);

  // Step 4: Email defaults
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");

  async function finish() {
    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        navigate("/auth");
        return;
      }

      // 1) Upsert org row; owner_id is auto-set by trigger
      const { data: org, error: orgErr } = await supabase
        .from("orgs")
        .upsert([
          {
            name: company.name,
            owner_id: user.id,
            phone: company.phone,
            email: company.email,
            website: company.email,
            address: company.address,
            city: company.city,
            state: company.state,
            zip: company.postal,
          },
        ])
        .select("id")
        .maybeSingle();

      if (orgErr || !org?.id) throw new Error(orgErr?.message || "Org upsert failed");

      // 2) Ensure user profile points to this org
      await supabase.from("user_profiles").upsert({ userId: user.id, org_id: org.id });

      // 3) Upload logo (if provided) to branding/<org_id>/logo.png
      let logoUrl: string | undefined;
      let logoPath: string | undefined;

      if (logo) {
        const objectPath = `${org.id}/logo.png`;
        const { error: upErr } = await supabase.storage
          .from("branding")
          .upload(objectPath, logo, { upsert: true });

        if (upErr) throw new Error("Logo upload failed: " + upErr.message);

        // Get a public URL for the header
        const pub = supabase.storage.from("branding").getPublicUrl(objectPath);
        logoUrl = pub.data.publicUrl;
        logoPath = objectPath;
      }

      // 4) Upsert org_branding with colors + logo
      const { error: bErr } = await supabase.from("org_branding").upsert({
        org_id: org.id,
        logo_url: logoUrl,
        logo_path: logoPath,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: secondaryColor,
        theme_mode: "light",
      });

      if (bErr) throw new Error("Branding upsert failed: " + bErr.message);

      // 5) Save defaults
      const { error: dErr } = await supabase.from("org_defaults").upsert({
        org_id: org.id,
        default_mode: defaultMode,
        default_photo_layout: defaultPhotoLayout,
        auto_detect: autoDetect,
        auto_pipeline_on_export: autoPipeline,
        from_name: fromName || company.name,
        from_email: fromEmail || company.email,
      });

      if (dErr) throw new Error("Defaults upsert failed: " + dErr.message);

      toast.success("Setup complete! Welcome to ClearSKai.");
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("Onboarding error:", error instanceof Error ? error.message : String(error));
      const e = error as Error | null;
      toast.error(e?.message || "Failed to complete setup");
    } finally {
      setBusy(false);
    }
  }

  const totalSteps = 5;
  const canProceed = () => {
    if (step === 1) return company.name.length > 0;
    return true;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-6">
      <Card className="w-full max-w-2xl p-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Welcome to ClearSKai</h1>
            <span className="text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Company basics */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-semibold">Company Information</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Let's start with your company details
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Company Name *</label>
              <Input
                placeholder="Your Company"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <Input
                  placeholder="(555) 123-4567"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="contact@company.com"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Address</label>
              <Input
                placeholder="123 Main St"
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">City</label>
                <Input
                  placeholder="Phoenix"
                  value={company.city}
                  onChange={(e) => setCompany({ ...company, city: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">State</label>
                <Input
                  placeholder="AZ"
                  value={company.state}
                  onChange={(e) => setCompany({ ...company, state: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">ZIP</label>
                <Input
                  placeholder="85001"
                  value={company.postal}
                  onChange={(e) => setCompany({ ...company, postal: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Branding */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-semibold">Branding</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Customize your reports with your logo and colors
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Logo (PNG/JPG)</label>
              <Input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0])} />
              {logo && (
                <div className="mt-2 text-sm text-muted-foreground">Selected: {logo.name}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Primary Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#0ea5a4"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Secondary Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#0f172a"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Report defaults */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-semibold">Report Defaults</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Set your preferred report format and automation
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Default Report Mode</label>
              <Select
                value={defaultMode}
                onValueChange={(v: string) =>
                  setDefaultMode(v as "retail" | "insurance" | "inspection")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail (Homeowner Proposals)</SelectItem>
                  <SelectItem value="insurance">Insurance (Claims)</SelectItem>
                  <SelectItem value="inspection">Inspection (General)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Photo Layout</label>
              <Select
                value={String(defaultPhotoLayout)}
                onValueChange={(v: string) => setDefaultPhotoLayout(Number(v) as 2 | 3 | 4)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 photos per page</SelectItem>
                  <SelectItem value="3">3 photos per page</SelectItem>
                  <SelectItem value="4">4 photos per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-detect"
                  checked={autoDetect}
                  onCheckedChange={(c) => setAutoDetect(!!c)}
                />
                <label
                  htmlFor="auto-detect"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Auto-detect damage on photo upload
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-pipeline"
                  checked={autoPipeline}
                  onCheckedChange={(c) => setAutoPipeline(!!c)}
                />
                <label
                  htmlFor="auto-pipeline"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Auto-run storm/code/supplement checks on export
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Email defaults */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-xl font-semibold">Email Settings</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Configure default sender information for emailed reports
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">From Name</label>
              <Input
                placeholder={company.name || "Your Company"}
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This will appear as the sender name in emails
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">From Email</label>
              <Input
                type="email"
                placeholder={company.email || "reports@yourcompany.com"}
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                This will appear as the sender email address
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Finish */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="py-8 text-center">
              <h2 className="mb-2 text-2xl font-semibold">You're All Set!</h2>
              <p className="mb-6 text-muted-foreground">
                Click finish to start creating professional roof inspection reports
              </p>

              <div className="space-y-2 rounded-lg bg-muted/50 p-6 text-left">
                <p className="text-sm">
                  <strong>Company:</strong> {company.name}
                </p>
                <p className="text-sm">
                  <strong>Default Mode:</strong> {defaultMode}
                </p>
                <p className="text-sm">
                  <strong>Photo Layout:</strong> {defaultPhotoLayout} per page
                </p>
                <p className="text-sm">
                  <strong>Automation:</strong> {autoDetect ? "✓" : "✗"} Auto-detect,{" "}
                  {autoPipeline ? "✓" : "✗"} Auto-pipeline
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || busy}
          >
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed() || busy}>
              Next
            </Button>
          ) : (
            <Button onClick={finish} disabled={busy}>
              {busy ? "Setting up..." : "Finish Setup"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

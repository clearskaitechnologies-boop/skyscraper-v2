"use client";

import { Check,Upload, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { calculatePricePerHome, calculateTotalPrice } from "@/lib/pricing/batchProposalPricing";

import { PriceSummaryCard } from "./PriceSummaryCard";

interface BatchProposalWizardProps {
  onComplete?: () => void;
}

export function BatchProposalWizard({ onComplete }: BatchProposalWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [stormType, setStormType] = useState<"hail" | "wind" | "both">("hail");
  const [manufacturer, setManufacturer] = useState("GAF");
  const [addressSource, setAddressSource] = useState<"csv" | "manual">("manual");
  const [addresses, setAddresses] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const homeCount = addresses ? addresses.split("\n").filter((a) => a.trim()).length : 0;
  const pricePerHome = calculatePricePerHome(homeCount);
  const totalPrice = calculateTotalPrice(homeCount);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/batch-proposals/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          homeCount,
          stormType,
          manufacturer,
          addressSource,
          addressData: {
            addresses: addresses.split("\n").filter((a) => a.trim()),
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create batch proposal");
      }

      const { batchJob } = await response.json();

      // Redirect to job detail page
      router.push(`/batch-proposals/${batchJob.id}`);
      onComplete?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                step === s
                  ? "bg-blue-600 text-white"
                  : step > s
                    ? "bg-green-600 text-white"
                    : "border-2 border-border bg-background text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 4 && <div className={`h-1 w-16 ${step > s ? "bg-green-600" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Community Details */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 1: Community Details</h3>
          <div>
            <label className="mb-2 block text-sm font-medium">Community Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Quail Wood Subdivision"
              className="w-full rounded-xl border border-border bg-background p-3 text-foreground"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Storm Type</label>
            <div className="grid grid-cols-3 gap-3">
              {(["hail", "wind", "both"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setStormType(type)}
                  className={`rounded-xl border-2 p-4 text-center font-medium capitalize transition-all ${
                    stormType === type
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-border bg-background text-foreground hover:border-blue-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!name}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Address Input */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 2: Address Input</h3>
          <div>
            <label className="mb-2 block text-sm font-medium">
              How would you like to provide addresses?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAddressSource("manual")}
                className={`flex items-center gap-2 rounded-xl border-2 p-4 font-medium transition-all ${
                  addressSource === "manual"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-border bg-background text-foreground hover:border-blue-300"
                }`}
              >
                <Zap className="h-5 w-5" />
                Paste Addresses
              </button>
              <button
                onClick={() => setAddressSource("csv")}
                className={`flex items-center gap-2 rounded-xl border-2 p-4 font-medium transition-all ${
                  addressSource === "csv"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-border bg-background text-foreground hover:border-blue-300"
                }`}
              >
                <Upload className="h-5 w-5" />
                Upload CSV
              </button>
            </div>
          </div>

          {addressSource === "manual" && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Paste Addresses (one per line)
              </label>
              <textarea
                value={addresses}
                onChange={(e) => setAddresses(e.target.value)}
                placeholder="123 Main St, Dallas, TX 75001
456 Oak Ave, Dallas, TX 75002
789 Pine Rd, Dallas, TX 75003"
                className="h-48 w-full rounded-xl border border-border bg-background p-3 font-mono text-sm text-foreground"
              />
              <p className="mt-2 text-sm text-muted-foreground">{homeCount} addresses detected</p>
            </div>
          )}

          {addressSource === "csv" && (
            <div>
              <label className="mb-2 block text-sm font-medium">Upload CSV File</label>
              <input
                type="file"
                accept=".csv"
                title="Upload CSV file with addresses"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCsvFile(file);
                    // TODO: Parse CSV and extract addresses
                  }
                }}
                className="w-full"
              />
              {csvFile && <p className="mt-2 text-sm text-green-600">✓ {csvFile.name} uploaded</p>}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border-2 border-border bg-background py-3 font-semibold text-foreground transition-all hover:bg-accent"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={homeCount === 0}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Configuration */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step 3: Configuration</h3>
          <div>
            <label className="mb-2 block text-sm font-medium">Roofing Manufacturer</label>
            <select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              title="Select roofing manufacturer"
              className="w-full rounded-xl border border-border bg-background p-3 text-foreground"
            >
              <option value="GAF">GAF</option>
              <option value="Owens Corning">Owens Corning</option>
              <option value="CertainTeed">CertainTeed</option>
              <option value="Tamko">Tamko</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 rounded-xl border-2 border-border bg-background py-3 font-semibold text-foreground transition-all hover:bg-accent"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Review & Submit
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Pricing */}
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Step 4: Review & Submit</h3>

          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Community</span>
              <strong>{name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Storm Type</span>
              <strong className="capitalize">{stormType}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Manufacturer</span>
              <strong>{manufacturer}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Homes</span>
              <strong>{homeCount}</strong>
            </div>
          </div>

          <PriceSummaryCard
            homeCount={homeCount}
            pricePerHome={pricePerHome}
            totalPrice={totalPrice}
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <strong>Next Steps:</strong> Your batch proposal will be reviewed by our team to
              ensure accuracy and quality. You'll receive an email confirmation once approved,
              typically within 1 business day.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              disabled={loading}
              className="flex-1 rounded-xl border-2 border-border bg-background py-3 font-semibold text-foreground transition-all hover:bg-accent disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-green-700 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

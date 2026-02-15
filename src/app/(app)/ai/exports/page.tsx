"use client";

import { useUser } from "@clerk/nextjs";
import { Download, Loader2, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CARRIERS = [
  { id: "state-farm", name: "State Farm" },
  { id: "allstate", name: "Allstate" },
  { id: "farmers", name: "Farmers Insurance" },
  { id: "liberty-mutual", name: "Liberty Mutual" },
  { id: "progressive", name: "Progressive" },
  { id: "usaa", name: "USAA" },
  { id: "geico", name: "GEICO" },
  { id: "nationwide", name: "Nationwide" },
];

const EXPORT_FORMATS = [
  { id: "xactimate", name: "Xactimate XML" },
  { id: "symbility", name: "Symbility" },
  { id: "edjuster", name: "eAdjuster" },
  { id: "pdf", name: "PDF Report" },
  { id: "csv", name: "CSV Spreadsheet" },
];

export default function CarrierExportsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  const [loading, setLoading] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [format, setFormat] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleExport = async () => {
    if (!carrier || !format) {
      alert("Please select both carrier and export format");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Carrier export API is under development
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const pendingResult = {
        success: false,
        carrier: CARRIERS.find((c) => c.id === carrier)?.name,
        format: EXPORT_FORMATS.find((f) => f.id === format)?.name,
        exportUrl: "#",
        message: "Carrier export is coming soon. This feature is under active development.",
      };

      setResult(pendingResult);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold text-[color:var(--text)]">
          <Package className="h-6 w-6 text-slate-500 dark:text-slate-400 dark:text-slate-600" />
          Carrier Exports
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 dark:text-slate-600">
          Build carrier-specific export formats automatically
        </p>
      </div>

      {/* Form */}
      <Card className="border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#121823]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="carrier">Insurance Carrier</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger id="carrier">
                <SelectValue placeholder="Select carrier..." />
              </SelectTrigger>
              <SelectContent>
                {CARRIERS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format..." />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleExport}
            disabled={loading || !carrier || !format}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Export...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Generate Carrier Export
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#121823]">
          <h3 className="mb-4 text-lg font-semibold">Export Results</h3>
          {result.error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              <p className="font-medium">Error:</p>
              <p>{result.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#121823]">
                <p className="mb-2 font-medium text-slate-700 dark:text-slate-300">
                  {result.message}
                </p>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 dark:text-slate-600">
                  <p>
                    <strong>Carrier:</strong> {result.carrier}
                  </p>
                  <p>
                    <strong>Format:</strong> {result.format}
                  </p>
                </div>
              </div>

              {result.exportUrl && (
                <Button asChild>
                  <a href={result.exportUrl} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download Export File
                  </a>
                </Button>
              )}

              <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400 dark:text-slate-600">
                Note: Demonstration page. Full carrier export functionality will follow carrier
                integration requirements.
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Features */}
      <Card className="border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#121823]">
        <h3 className="mb-3 text-sm font-medium text-slate-900 dark:text-slate-50">
          Export Features
        </h3>
        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 dark:text-slate-600">
          <li>Carrier-specific format compliance</li>
          <li>Automatic field mapping</li>
          <li>Validation and error checking</li>
          <li>Batch export capabilities</li>
          <li>Custom templates per carrier</li>
        </ul>
      </Card>
    </div>
  );
}

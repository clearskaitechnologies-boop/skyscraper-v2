import { Cloud, Code, Download, Eye,FileText, Loader2, MapPin, Save } from "lucide-react";
import { useEffect,useState } from "react";
import { useSearchParams } from "react-router-dom";

import CarrierSubmissionPanel from "@/components/CarrierSubmissionPanel";
import FileUploader from "@/components/FileUploader";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Section {
  id: string;
  name: string;
  enabled: boolean;
}

interface ProposalData {
  // Cover Page
  propertyAddress: string;
  companyLogo: string;
  heroImage: string;
  reportTitle: string;

  // Damage Overview
  damageSummary: string;
  customNotes: string;
  damageScore: string;

  // Code & Compliance
  codeUpgrades: string;
  manufacturerGuidelines: string;
  complianceNotes: string;

  // AI Mockup
  beforeAfterImages: string[];
  systemType: string;
  materialColor: string;

  // Timeline
  startDate: string;
  completionDate: string;
  milestones: string;

  // Price Breakdown
  materialsPrice: string;
  laborPrice: string;
  permitsPrice: string;
  addonsPrice: string;
  taxesPrice: string;
  totalPrice: string;

  // Materials
  selectedMaterial: string;
  colorSwatch: string;
  manufacturerBrochure: string;

  // Warranties
  laborWarranty: string;
  manufacturerWarranty: string;
  warrantyNotes: string;

  // Photos
  selectedPhotos: string[];

  // Weather Report
  weatherSummary: string;
  stormDate: string;

  // Supplements
  supplementItems: string;
  supplementPhotos: string[];

  // Signature
  clientSignature: string;
  nextSteps: string;
}

export default function ProposalBuilder() {
  const [sp] = useSearchParams();
  const leadId = sp.get("leadId");
  const { toast } = useToast();

  const [sections, setSections] = useState<Section[]>([
    { id: "cover", name: "Cover Page", enabled: true },
    { id: "damage", name: "Overview of Damage", enabled: true },
    { id: "code", name: "Code & Compliance", enabled: false },
    { id: "mockup", name: "AI Restored Mockup", enabled: false },
    { id: "timeline", name: "Timeline", enabled: true },
    { id: "pricing", name: "Price Breakdown", enabled: true },
    { id: "materials", name: "Materials & Colors", enabled: true },
    { id: "warranties", name: "Warranties & Guarantees", enabled: false },
    { id: "photos", name: "Inspection Photos", enabled: true },
    { id: "weather", name: "Weather & Hail Report", enabled: false },
    { id: "supplements", name: "Supplement Requests", enabled: false },
    { id: "signature", name: "Client Signature & Next Steps", enabled: true },
  ]);

  const [exportFormat, setExportFormat] = useState<string>("retail");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  type PhotoRow = {
    id?: string | number;
    file_url?: string;
    ai_caption?: string;
    damage_types?: string[];
    created_at?: string;
    [k: string]: unknown;
  };
  type LeadRow = {
    property_address?: string;
    client_name?: string;
    jurisdiction?: string;
    latitude?: number;
    longitude?: number;
    [k: string]: unknown;
  } | null;

  const [availablePhotos, setAvailablePhotos] = useState<any[]>([]);
  const [isFetchingCodes, setIsFetchingCodes] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [leadData, setLeadData] = useState<any>(null);

  const [data, setData] = useState<ProposalData>({
    propertyAddress: "",
    companyLogo: "",
    heroImage: "",
    reportTitle: "Roofing Proposal",
    damageSummary: "",
    customNotes: "",
    damageScore: "",
    codeUpgrades: "",
    manufacturerGuidelines: "",
    complianceNotes: "",
    beforeAfterImages: [],
    systemType: "shingle",
    materialColor: "charcoal",
    startDate: "",
    completionDate: "",
    milestones: "",
    materialsPrice: "",
    laborPrice: "",
    permitsPrice: "",
    addonsPrice: "",
    taxesPrice: "",
    totalPrice: "",
    selectedMaterial: "GAF Timberline HDZ",
    colorSwatch: "Charcoal",
    manufacturerBrochure: "",
    laborWarranty: "10 years",
    manufacturerWarranty: "30 years",
    warrantyNotes: "",
    selectedPhotos: [],
    weatherSummary: "",
    stormDate: "",
    supplementItems: "",
    supplementPhotos: [],
    clientSignature: "",
    nextSteps: "",
  });

  useEffect(() => {
    if (leadId) loadLeadData();
  }, [leadId]);

  async function loadLeadData() {
    if (!leadId) return;

    try {
      const { data: lead, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();

      if (error) throw error;

      if (lead) {
        setLeadData(lead);
        setData((prev) => ({
          ...prev,
          propertyAddress: lead.property_address || "",
          reportTitle: `Roofing Proposal - ${lead.client_name || "Client"}`,
        }));
      }

      // Load photos
      if (leadId) {
        const { data: photos } = await supabase
          .from("photos")
          .select("*")
          .eq("lead_id", leadId)
          .order("created_at", { ascending: false });

        if (photos && photos.length > 0) {
          setAvailablePhotos(photos);
          setData((prev) => ({
            ...prev,
            selectedPhotos: photos.slice(0, 5).map((p) => p.file_url),
            heroImage: photos[0].file_url,
          }));
        }
      }
    } catch (error: unknown) {
      const e = error instanceof Error ? error : new Error(String(error));
      toast({
        title: "Error loading data",
        description: e.message,
        variant: "destructive",
      });
    }
  }

  // Auto-calculate total price
  useEffect(() => {
    const materials = parseFloat(data.materialsPrice) || 0;
    const labor = parseFloat(data.laborPrice) || 0;
    const permits = parseFloat(data.permitsPrice) || 0;
    const addons = parseFloat(data.addonsPrice) || 0;
    const taxes = parseFloat(data.taxesPrice) || 0;
    const total = materials + labor + permits + addons + taxes;

    if (total > 0) {
      setData((prev) => ({ ...prev, totalPrice: total.toFixed(2) }));
    }
  }, [data.materialsPrice, data.laborPrice, data.permitsPrice, data.addonsPrice, data.taxesPrice]);

  async function fetchCodeCompliance() {
    if (!leadData?.property_address) {
      toast({
        title: "No address found",
        description: "Please add a lead address first",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingCodes(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("lookup-codes", {
        body: {
          address: leadData.property_address,
          jurisdiction: leadData.jurisdiction,
          zipCode: leadData.property_address.match(/\d{5}/)?.[0],
        },
      });

      if (error) throw error;

      const requirements = result?.requirements || result;
      const codeText = Object.entries(requirements)
        .map(([key, val]) => {
          const v = val as unknown;
          if (v && typeof v === "object") {
            const desc = (v as Record<string, unknown>)["description"];
            if (typeof desc === "string") return `${key.replace(/_/g, " ").toUpperCase()}: ${desc}`;
          }
          return `${key.replace(/_/g, " ").toUpperCase()}: ${String(val)}`;
        })
        .join("\n\n");

      setData((prev) => ({
        ...prev,
        codeUpgrades: codeText,
      }));

      toast({
        title: "Code requirements loaded",
        description: "Building codes have been fetched",
      });
    } catch (error: unknown) {
      const e = error instanceof Error ? error : new Error(String(error));
      toast({
        title: "Error fetching codes",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsFetchingCodes(false);
    }
  }

  async function fetchWeatherData() {
    if (!leadData) {
      toast({
        title: "No lead found",
        description: "Please select a lead first",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingWeather(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("fetch-weather", {
        body: {
          address: leadData.property_address,
          latitude: leadData.latitude,
          longitude: leadData.longitude,
          date_range_days: 365,
        },
      });

      if (error) throw error;

      const events = result?.events || [];
      const summary = (events as unknown[])
        .map((ev) => {
          const e = ev as Record<string, unknown>;
          const date = e["event_date"] ? String(e["event_date"]) : "";
          const type = e["event_type"] ? String(e["event_type"]).toUpperCase() : "";
          const severity = e["severity"] ? String(e["severity"]) : "";
          const hail = e["hail_size_inches"] ? `(${String(e["hail_size_inches"])}" hail)` : "";
          const wind = e["wind_speed_mph"] ? `(${String(e["wind_speed_mph"])} mph winds)` : "";
          return `${new Date(date).toLocaleDateString()}: ${type} - ${severity} ${hail} ${wind}`;
        })
        .join("\n");

      setData((prev) => ({
        ...prev,
        weatherSummary: summary || "No recent weather events found",
        stormDate: events[0]?.event_date || "",
      }));

      toast({
        title: "Weather data loaded",
        description: `Found ${events.length} weather events`,
      });
    } catch (error: unknown) {
      const e = error instanceof Error ? error : new Error(String(error));
      toast({
        title: "Error fetching weather",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsFetchingWeather(false);
    }
  }

  function togglePhotoSelection(photoUrl: string) {
    setData((prev) => ({
      ...prev,
      selectedPhotos: prev.selectedPhotos.includes(photoUrl)
        ? prev.selectedPhotos.filter((p) => p !== photoUrl)
        : [...prev.selectedPhotos, photoUrl],
    }));
  }

  function toggleSection(id: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  }

  async function generateProposal() {
    setIsGenerating(true);
    try {
      const enabledSections = sections.filter((s) => s.enabled).map((s) => s.id);

      const proposalData = {
        ...data,
        enabledSections,
        exportFormat,
      };

      const { data: result, error } = await supabase.functions.invoke("generate-pdf", {
        body: {
          template_type:
            exportFormat === "retail"
              ? "retail_bid"
              : exportFormat === "insurance"
                ? "inspection_summary"
                : "comprehensive",
          data: proposalData,
          report_id: crypto.randomUUID(),
        },
      });

      if (error) throw error;

      setPdfUrl(result.pdf_url);
      toast({
        title: "Proposal generated",
        description: "Your PDF is ready to download",
      });
    } catch (error: unknown) {
      const e = error instanceof Error ? error : new Error(String(error));
      toast({
        title: "Generation failed",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pb-16 pt-24">
        <div className="mx-auto max-w-7xl space-y-8 px-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                Click-to-Build Proposal Generator
              </h1>
              <p className="text-muted-foreground">
                Select sections to include in your proposal and customize the content
              </p>
              {leadData && (
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline">{leadData.client_name}</Badge>
                  <Badge variant="outline">{leadData.property_address}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Section Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Proposal Sections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex cursor-pointer items-center space-x-2 rounded-lg border p-3 hover:bg-accent"
                    onClick={() => toggleSection(section.id)}
                  >
                    <Checkbox checked={section.enabled} />
                    <label className="cursor-pointer text-sm font-medium">{section.name}</label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* PDF Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button onClick={generateProposal} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin" /> : <FileText />}
                <span className="ml-2">Generate PDF</span>
              </Button>
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded bg-gray-100 px-3 py-2"
                >
                  <Download /> Download PDF
                </a>
              )}
            </div>

            {pdfUrl && <CarrierSubmissionPanel leadId={leadId || undefined} pdfUrl={pdfUrl} />}
          </div>

          {/* Cover Page */}
          {sections.find((s) => s.id === "cover")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>1. Cover Page</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Property Address</Label>
                  <Input
                    value={data.propertyAddress}
                    onChange={(e) => setData({ ...data, propertyAddress: e.target.value })}
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                <div>
                  <Label>Report Title</Label>
                  <Input
                    value={data.reportTitle}
                    onChange={(e) => setData({ ...data, reportTitle: e.target.value })}
                    placeholder="Roofing Proposal"
                  />
                </div>
                <div>
                  <Label>Hero Image</Label>
                  <FileUploader
                    adapter="s3"
                    onUploadComplete={(urls) => setData({ ...data, heroImage: urls[0] })}
                  />
                  {data.heroImage && (
                    <img
                      src={data.heroImage}
                      alt="Hero"
                      className="mt-2 w-full max-w-md rounded-lg"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Damage Overview */}
          {sections.find((s) => s.id === "damage")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>2. Overview of Damage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>AI-Generated Summary</Label>
                  <Textarea
                    value={data.damageSummary}
                    onChange={(e) => setData({ ...data, damageSummary: e.target.value })}
                    placeholder="AI will generate damage summary..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Custom Notes</Label>
                  <Textarea
                    value={data.customNotes}
                    onChange={(e) => setData({ ...data, customNotes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Damage Score</Label>
                  <Input
                    value={data.damageScore}
                    onChange={(e) => setData({ ...data, damageScore: e.target.value })}
                    placeholder="e.g., 85/100"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Code & Compliance */}
          {sections.find((s) => s.id === "code")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>3. Code & Compliance</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchCodeCompliance}
                    disabled={isFetchingCodes}
                  >
                    {isFetchingCodes ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...
                      </>
                    ) : (
                      <>
                        <Code className="mr-2 h-4 w-4" /> Auto-Fetch Codes
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Code Upgrades Required</Label>
                  <Textarea
                    value={data.codeUpgrades}
                    onChange={(e) => setData({ ...data, codeUpgrades: e.target.value })}
                    placeholder="Click 'Auto-Fetch Codes' to populate..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Manufacturer Guidelines</Label>
                  <Textarea
                    value={data.manufacturerGuidelines}
                    onChange={(e) =>
                      setData({
                        ...data,
                        manufacturerGuidelines: e.target.value,
                      })
                    }
                    placeholder="GAF, Owens Corning installation requirements..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Mockup */}
          {sections.find((s) => s.id === "mockup")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>4. AI Restored Mockup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>System Type</Label>
                  <Select
                    value={data.systemType}
                    onValueChange={(v) => setData({ ...data, systemType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shingle">Shingle</SelectItem>
                      <SelectItem value="tile">Tile</SelectItem>
                      <SelectItem value="flat">Flat Coat</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Material Color</Label>
                  <Input
                    value={data.materialColor}
                    onChange={(e) => setData({ ...data, materialColor: e.target.value })}
                    placeholder="Charcoal, Weathered Wood, etc."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {sections.find((s) => s.id === "timeline")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>5. Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={data.startDate}
                      onChange={(e) => setData({ ...data, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Completion Date</Label>
                    <Input
                      type="date"
                      value={data.completionDate}
                      onChange={(e) => setData({ ...data, completionDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Milestones</Label>
                  <Textarea
                    value={data.milestones}
                    onChange={(e) => setData({ ...data, milestones: e.target.value })}
                    placeholder="Demo, Dry-in, Inspection, Final..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Breakdown */}
          {sections.find((s) => s.id === "pricing")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>6. Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Materials</Label>
                    <Input
                      type="number"
                      value={data.materialsPrice}
                      onChange={(e) => setData({ ...data, materialsPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Labor</Label>
                    <Input
                      type="number"
                      value={data.laborPrice}
                      onChange={(e) => setData({ ...data, laborPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Permits</Label>
                    <Input
                      type="number"
                      value={data.permitsPrice}
                      onChange={(e) => setData({ ...data, permitsPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Add-ons</Label>
                    <Input
                      type="number"
                      value={data.addonsPrice}
                      onChange={(e) => setData({ ...data, addonsPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Taxes/Fees</Label>
                    <Input
                      type="number"
                      value={data.taxesPrice}
                      onChange={(e) => setData({ ...data, taxesPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Total (Auto-calculated)</Label>
                    <Input
                      type="text"
                      value={
                        data.totalPrice
                          ? `$${parseFloat(data.totalPrice).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "$0.00"
                      }
                      readOnly
                      className="bg-muted text-lg font-bold"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Materials */}
          {sections.find((s) => s.id === "materials")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>7. Materials & Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Material</Label>
                  <Input
                    value={data.selectedMaterial}
                    onChange={(e) => setData({ ...data, selectedMaterial: e.target.value })}
                    placeholder="GAF Timberline HDZ"
                  />
                </div>
                <div>
                  <Label>Color Swatch</Label>
                  <Input
                    value={data.colorSwatch}
                    onChange={(e) => setData({ ...data, colorSwatch: e.target.value })}
                    placeholder="Charcoal, Weathered Wood, etc."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warranties */}
          {sections.find((s) => s.id === "warranties")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>8. Warranties & Guarantees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Labor Warranty</Label>
                    <Input
                      value={data.laborWarranty}
                      onChange={(e) => setData({ ...data, laborWarranty: e.target.value })}
                      placeholder="10 years"
                    />
                  </div>
                  <div>
                    <Label>Manufacturer Warranty</Label>
                    <Input
                      value={data.manufacturerWarranty}
                      onChange={(e) =>
                        setData({
                          ...data,
                          manufacturerWarranty: e.target.value,
                        })
                      }
                      placeholder="30 years"
                    />
                  </div>
                </div>
                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={data.warrantyNotes}
                    onChange={(e) => setData({ ...data, warrantyNotes: e.target.value })}
                    placeholder="Transferable, exclusions, etc."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {sections.find((s) => s.id === "photos")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>9. Inspection Photos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Photos to Include ({data.selectedPhotos.length} selected)</Label>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {availablePhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                          data.selectedPhotos.includes(photo.file_url)
                            ? "border-primary ring-2 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => togglePhotoSelection(photo.file_url)}
                      >
                        <img
                          src={photo.file_url}
                          alt={photo.ai_caption || "Inspection photo"}
                          className="h-32 w-full object-cover"
                        />
                        {data.selectedPhotos.includes(photo.file_url) && (
                          <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                          </div>
                        )}
                        <div className="bg-background/95 p-2 text-xs">
                          <p className="truncate">{photo.ai_caption || "No caption"}</p>
                          {photo.damage_types && photo.damage_types.length > 0 && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              {photo.damage_types[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {availablePhotos.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No photos available. Upload photos from the inspection page.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weather Report */}
          {sections.find((s) => s.id === "weather")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>10. Weather & Hail Report</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchWeatherData}
                    disabled={isFetchingWeather}
                  >
                    {isFetchingWeather ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching...
                      </>
                    ) : (
                      <>
                        <Cloud className="mr-2 h-4 w-4" /> Auto-Fetch Weather
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Storm Event Summary</Label>
                  <Textarea
                    value={data.weatherSummary}
                    onChange={(e) => setData({ ...data, weatherSummary: e.target.value })}
                    placeholder="Click 'Auto-Fetch Weather' to populate recent weather events..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Primary Storm Date</Label>
                  <Input
                    type="date"
                    value={data.stormDate}
                    onChange={(e) => setData({ ...data, stormDate: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Supplements */}
          {sections.find((s) => s.id === "supplements")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>11. Supplement Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Additional Items Found</Label>
                  <Textarea
                    value={data.supplementItems}
                    onChange={(e) => setData({ ...data, supplementItems: e.target.value })}
                    placeholder="List additional damage or upgrades found during inspection..."
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signature */}
          {sections.find((s) => s.id === "signature")?.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>12. Client Signature & Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Next Steps</Label>
                  <Textarea
                    value={data.nextSteps}
                    onChange={(e) => setData({ ...data, nextSteps: e.target.value })}
                    placeholder="1. Sign proposal&#x0A;2. Pay deposit&#x0A;3. Schedule start date"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>PDF Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail (Homeowner-facing)</SelectItem>
                    <SelectItem value="insurance">Insurance (Adjuster-ready)</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive (Full)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={generateProposal}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Proposal PDF
                  </>
                )}
              </Button>
              {pdfUrl && (
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    View Generated PDF
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

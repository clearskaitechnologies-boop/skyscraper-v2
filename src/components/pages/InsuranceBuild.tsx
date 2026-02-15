import { CheckCircle2, Cloud, Download,FileText, Image, Loader2, MapPin } from "lucide-react";
import { useEffect,useState } from "react";
import { toast } from "sonner";

import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function InsuranceBuild() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [compiledData, setCompiledData] = useState<any>({
    weather: null,
    codes: null,
    photos: [],
    inspections: [],
    status: "idle", // idle, gathering, ready
  });

  // Load all leads on mount
  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load leads");
      return;
    }
    setLeads(data || []);
  };

  const loadLeadDetails = async (leadId) => {
    setLoading(true);
    const { data, error } = await supabase.from("leads").select("*").eq("id", leadId).single();

    if (error) {
      toast.error("Failed to load lead details");
      setLoading(false);
      return;
    }

    setLeadData(data);
    setSelectedLead(leadId);
    setLoading(false);
  };

  const gatherAllData = async () => {
    if (!leadData) return;

    setLoading(true);
    setCompiledData((prev) => ({ ...prev, status: "gathering" }));
    toast.info("Gathering claims data...");

    try {
      // 1. Fetch weather data
      const { data: weatherData, error: weatherError } = await supabase.functions.invoke(
        "fetch-weather",
        {
          body: {
            address: leadData.property_address,
            latitude: leadData.latitude,
            longitude: leadData.longitude,
            date_range_days: 365,
          },
        }
      );

      if (weatherError) throw weatherError;

      // 2. Fetch code compliance
      const { data: codesData, error: codesError } = await supabase.functions.invoke(
        "lookup-codes",
        {
          body: {
            address: leadData.property_address,
            jurisdiction: leadData.jurisdiction,
            zipCode: leadData.property_address?.match(/\d{5}/)?.[0],
          },
        }
      );

      if (codesError) throw codesError;

      // 3. Fetch photos for this lead
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .eq("lead_id", leadData.id)
        .order("created_at", { ascending: false });

      if (photosError) throw photosError;

      // 4. Fetch inspections for this lead
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from("inspections")
        .select("*")
        .eq("lead_id", leadData.id)
        .order("created_at", { ascending: false });

      if (inspectionsError) throw inspectionsError;

      setCompiledData({
        weather: weatherData,
        codes: codesData,
        photos: photosData || [],
        inspections: inspectionsData || [],
        status: "ready",
      });

      toast.success("Claims data compiled successfully!");
    } catch (error) {
      console.error("Error gathering data:", error);
      toast.error("Failed to gather all claims data");
      setCompiledData((prev) => ({ ...prev, status: "idle" }));
    } finally {
      setLoading(false);
    }
  };

  const generateClaimsFolder = async () => {
    if (!leadData || compiledData.status !== "ready") return;

    setLoading(true);
    toast.info("Generating claims folder PDF...");

    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: {
          template_type: "insurance_claim",
          data: {
            lead: leadData,
            weather: compiledData.weather,
            codes: compiledData.codes,
            photos: compiledData.photos,
            inspections: compiledData.inspections,
            date_of_loss:
              compiledData.weather?.events?.[0]?.event_date ||
              new Date().toISOString().split("T")[0],
            claim_number: leadData.claim_number,
            policy_number: leadData.policyNumber,
          },
        },
      });

      if (error) throw error;

      toast.success("Claims folder generated!");
      window.open(data.pdf_url, "_blank");
    } catch (error) {
      console.error("Error generating folder:", error);
      toast.error("Failed to generate claims folder");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pb-16 pt-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Insurance-Ready Folder</h1>
            <p className="text-lg text-muted-foreground">
              Compile DOL, weather, codes, thermals, AI mockups, photos, and summaries into a
              claims-ready client folder.
            </p>
          </div>

          {/* Lead Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedLead || ""} onValueChange={loadLeadDetails}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lead to compile claims data..." />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.property_address} - {lead.client_name || "No name"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Lead Details */}
          {leadData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Property Address</p>
                    <p className="font-medium">{leadData.property_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{leadData.client_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Insurance Carrier</p>
                    <p className="font-medium">{leadData.insurance_carrier || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Claim #</p>
                    <p className="font-medium">{leadData.claim_number || "N/A"}</p>
                  </div>
                </div>
                <Button onClick={gatherAllData} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gathering Data...
                    </>
                  ) : (
                    "Gather Claims Data"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Compiled Data Overview */}
          {compiledData.status !== "idle" && (
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Weather Events</p>
                      <p className="text-2xl font-bold">
                        {compiledData.weather?.events?.length || 0}
                      </p>
                    </div>
                    <Cloud className="h-8 w-8 text-blue-500" />
                  </div>
                  {compiledData.weather && (
                    <Badge variant="outline" className="mt-2">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Loaded
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Code Requirements</p>
                      <p className="text-2xl font-bold">
                        {compiledData.codes?.requirements
                          ? Object.keys(compiledData.codes.requirements).length
                          : 0}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-green-500" />
                  </div>
                  {compiledData.codes && (
                    <Badge variant="outline" className="mt-2">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Loaded
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Photos</p>
                      <p className="text-2xl font-bold">{compiledData.photos.length}</p>
                    </div>
                    <Image className="h-8 w-8 text-purple-500" />
                  </div>
                  {compiledData.photos.length > 0 && (
                    <Badge variant="outline" className="mt-2">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Loaded
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Inspections</p>
                      <p className="text-2xl font-bold">{compiledData.inspections.length}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-orange-500" />
                  </div>
                  {compiledData.inspections.length > 0 && (
                    <Badge variant="outline" className="mt-2">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Loaded
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Generate Button */}
          {compiledData.status === "ready" && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
                  <h3 className="text-xl font-bold">Claims Data Ready</h3>
                  <p className="text-muted-foreground">
                    All data has been compiled. Generate the insurance-ready folder now.
                  </p>
                  <Button
                    onClick={generateClaimsFolder}
                    disabled={loading}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generate Claims Folder
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

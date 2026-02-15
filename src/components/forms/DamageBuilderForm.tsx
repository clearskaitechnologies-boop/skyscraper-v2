"use client";

import { AlertCircle,CheckCircle, Loader2, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface DamageFinding {
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  location: string;
  code?: string;
}

export default function DamageBuilderForm() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [findings, setFindings] = useState<DamageFinding[]>([]);
  const [tokensUsed, setTokensUsed] = useState(0);
  const { toast } = useToast();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleAnalyze = async () => {
    if (photos.length === 0) {
      toast({
        title: "No photos selected",
        description: "Please upload at least one photo to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setFindings([]);

    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });
      if (address) formData.append("address", address);
      if (notes) formData.append("notes", notes);

      const response = await fetch("/api/ai/damage/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Analysis failed");
      }

      const data = await response.json();
      setFindings(data.findings || []);
      setTokensUsed(data.tokensUsed || 0);

      toast({
        title: "Analysis Complete",
        description: `Found ${data.findings?.length || 0} damage findings`,
      });
    } catch (error: any) {
      console.error("Damage analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze damage",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-900 border-red-300";
      case "High":
        return "bg-orange-100 text-orange-900 border-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-900 border-yellow-300";
      case "Low":
        return "bg-blue-100 text-blue-900 border-blue-300";
      default:
        return "bg-gray-100 text-gray-900 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Property Photos</CardTitle>
          <CardDescription>
            Upload photos of the property damage for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="photos">Photos</Label>
            <div className="mt-2 flex items-center gap-4">
              <Input
                id="photos"
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={handlePhotoUpload}
                disabled={isAnalyzing}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("photos")?.click()}
                disabled={isAnalyzing}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Files
              </Button>
            </div>
            {photos.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {photos.length} photo{photos.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Property Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, State, ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isAnalyzing}
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional context about the damage..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isAnalyzing}
              rows={3}
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || photos.length === 0}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Damage...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Analyze Damage
              </>
            )}
          </Button>

          {tokensUsed > 0 && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                <strong>Tokens Used:</strong> {tokensUsed} tokens consumed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Damage Findings ({findings.length})</CardTitle>
            <CardDescription>AI-detected damage assessment results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {findings.map((finding, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${getSeverityColor(finding.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-semibold">{finding.type}</h3>
                        <span className="rounded-full bg-white/50 px-2 py-1 text-xs">
                          {finding.severity}
                        </span>
                      </div>
                      <p className="mb-2 text-sm">{finding.description}</p>
                      <p className="text-xs opacity-75">
                        <strong>Location:</strong> {finding.location}
                      </p>
                      {finding.code && (
                        <p className="mt-1 text-xs opacity-75">
                          <strong>Code Reference:</strong> {finding.code}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

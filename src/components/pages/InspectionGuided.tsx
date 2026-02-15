import { Camera, CheckCircle2, Loader2,Upload } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import FileUploader from "@/components/FileUploader";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  id: string;
  file_url: string;
  elevation?: string;
  stage?: string;
  ai_caption?: string;
  ai_tags?: string[];
  damage_types?: string[];
  damage_count: number;
  analyzing?: boolean;
}

export default function InspectionGuided() {
  const [sp] = useSearchParams();
  const leadId = sp.get("leadId");
  const { toast } = useToast();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentElevation, setCurrentElevation] = useState<string>("north");
  const [currentStage, setCurrentStage] = useState<string>("ground");
  const [isProcessing, setIsProcessing] = useState(false);

  const elevations = ["north", "south", "east", "west", "front", "back", "left", "right"];
  const stages = ["ground", "roof", "close_up", "overview"];

  async function analyzePhoto(photoId: string, photoUrl: string) {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, analyzing: true } : p)));

    try {
      const { data, error } = await supabase.functions.invoke("analyze-photo", {
        body: {
          image_url: photoUrl,
          elevation: currentElevation,
          stage: currentStage,
        },
      });

      if (error) throw error;

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? {
                ...p,
                analyzing: false,
                ai_caption: data.caption,
                ai_tags: data.tags,
                damage_types: data.damage_types,
                damage_count: data.damage_count || 0,
              }
            : p
        )
      );

      toast({
        title: "Photo analyzed",
        description: data.caption || "Analysis complete",
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, analyzing: false } : p)));
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze photo",
        variant: "destructive",
      });
    }
  }

  async function handlePhotosUploaded(urls: string[]) {
    const newPhotos: Photo[] = urls.map((url) => ({
      id: crypto.randomUUID(),
      file_url: url,
      elevation: currentElevation,
      stage: currentStage,
      damage_count: 0,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);

    // Auto-analyze each photo
    for (const photo of newPhotos) {
      await analyzePhoto(photo.id, photo.file_url);
    }
  }

  function getProgress() {
    const requiredPhotos = elevations.length * 2; // At least 2 per elevation
    return Math.min((photos.length / requiredPhotos) * 100, 100);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pb-16 pt-24">
        <div className="mx-auto max-w-6xl space-y-8 px-4">
          {/* Header */}
          <div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">AI-Guided Inspection</h1>
            <p className="text-muted-foreground">
              Capture photos methodically around the structure. AI will analyze each image for
              damage detection.
            </p>
          </div>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Inspection Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{photos.length} photos captured</span>
                  <span>{Math.round(getProgress())}% complete</span>
                </div>
                <Progress value={getProgress()} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Photo Capture */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Elevation</label>
                  <div className="flex flex-wrap gap-2">
                    {elevations.map((elev) => (
                      <Button
                        key={elev}
                        size="sm"
                        variant={currentElevation === elev ? "default" : "outline"}
                        onClick={() => setCurrentElevation(elev)}
                      >
                        {elev}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Stage</label>
                  <div className="flex flex-wrap gap-2">
                    {stages.map((stage) => (
                      <Button
                        key={stage}
                        size="sm"
                        variant={currentStage === stage ? "default" : "outline"}
                        onClick={() => setCurrentStage(stage)}
                      >
                        {stage.replace("_", " ")}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploader adapter="s3" multiple onUploadComplete={handlePhotosUploaded} />
                <p className="mt-2 text-sm text-muted-foreground">
                  Photos from <Badge variant="secondary">{currentElevation}</Badge> / {currentStage}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Captured Photos */}
          {photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Captured Photos ({photos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {photos.map((photo) => (
                    <div key={photo.id} className="group relative">
                      <img
                        src={photo.file_url}
                        alt={photo.ai_caption || "Inspection photo"}
                        className="h-48 w-full rounded-lg border border-border object-cover"
                      />

                      {photo.analyzing && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}

                      {!photo.analyzing && photo.ai_caption && (
                        <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/75 p-3">
                          <div className="mb-2 flex items-start gap-2">
                            {photo.damage_count > 0 ? (
                              <Badge variant="destructive">{photo.damage_count} hits</Badge>
                            ) : (
                              <Badge variant="secondary">No damage</Badge>
                            )}
                            <Badge variant="outline">{photo.elevation}</Badge>
                          </div>
                          <p className="line-clamp-2 text-xs text-white">{photo.ai_caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Inspection */}
          {photos.length >= 8 && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Ready to Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You've captured {photos.length} photos. Ready to generate the inspection summary?
                </p>
                <Button size="lg" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    "Complete Inspection & Generate Report"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

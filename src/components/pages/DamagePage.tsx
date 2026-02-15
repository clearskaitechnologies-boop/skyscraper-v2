import { Loader2 } from "lucide-react";
import { useState } from "react";

import FileUploader from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function DamagePage() {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function analyze() {
    if (!uploadedUrls || uploadedUrls.length === 0) {
      toast({
        title: "No images uploaded",
        description: "Please upload at least one image to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        images: uploadedUrls.map((url) => ({ url })),
      };

      const r = await api("/analysis/damage-percentile", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setResult(r);
      toast({
        title: "Analysis Complete",
        description: "Damage percentile calculated successfully",
      });
    } catch (e) {
      const errorMessage = String(e);
      setResult({ error: errorMessage });
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">AI Damage Percentile</h1>
        <p className="text-muted-foreground">
          Upload inspection photos to get a 0–100 probability score with supporting signals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploader
            onUploadComplete={(urls) => setUploadedUrls(urls)}
            adapter="mock"
            multiple={true}
            accept="image/*"
          />

          <Button
            disabled={uploadedUrls.length === 0 || loading}
            onClick={analyze}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Run Analysis"
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg bg-muted/40 p-4 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

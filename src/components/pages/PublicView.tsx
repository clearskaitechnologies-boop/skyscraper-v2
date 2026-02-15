import { Clock,Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicView() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = new URLSearchParams(location.search).get("t");

      if (!token) {
        setError("Missing token in URL");
        setLoading(false);
        return;
      }

      try {
        const supabaseUrl =
          (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
          process.env.NEXT_PUBLIC_SUPABASE_URL;
        const fnUrl = `${supabaseUrl!.replace(
          "/rest/v1",
          ""
        )}/functions/v1/public-report?t=${encodeURIComponent(token)}`;
        const response = await fetch(fnUrl);

        if (!response.ok) {
          const errorText = await response.text();
          setError(errorText || "Failed to load report");
          setLoading(false);
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (e: any) {
        setError(e.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const expiresDate = new Date(data.expiresAt);
  const isExpiringSoon = expiresDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{data.title}</CardTitle>
            {data.address && (
              <CardDescription className="text-base">{data.address}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className={isExpiringSoon ? "text-orange-600" : "text-muted-foreground"}>
                Link expires: {expiresDate.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <div className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {data.status || (data.downloadUrl ? "Approved" : "In Review")}
              </div>
              <div className="text-sm text-muted-foreground">
                Access: {data.scope === "download" ? "Download" : "View only"}
              </div>
            </div>

            {data.downloadUrl ? (
              <Button asChild className="w-full" size="lg">
                <a href={data.downloadUrl} target="_blank" rel="noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download Signed PDF
                </a>
              </Button>
            ) : (
              <Alert>
                <AlertDescription>
                  A signed document will be available once approvals are complete.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 text-center text-xs text-muted-foreground">
              If you need help, contact support@clearskairoofing.com
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import NextStepsSign from "@/components/NextStepsSign";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface ReportMeta {
  id: string;
  title: string;
  data: any;
}

interface PrefillData {
  name?: string;
  email?: string;
  address?: string;
}

export default function PublicSign() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [report, setReport] = useState<ReportMeta | null>(null);
  const [prefill, setPrefill] = useState<PrefillData | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function resolveLink() {
      if (!token) {
        setError("Invalid link - no token provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${
            (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
            process.env.NEXT_PUBLIC_SUPABASE_URL
          }/functions/v1/resolve-public-link?token=${token}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to resolve link");
        }

        const data = await response.json();
        setReport(data.report);
        setPrefill(data.prefill);
      } catch (e: any) {
        console.error("Link resolution error:", e);
        setError(e.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    }

    resolveLink();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading document...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="w-full max-w-md p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            This link may have expired or is invalid. Please contact the sender for a new link.
          </p>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Document not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">{report.title || "Sign Document"}</h1>
          {report.data?.address && <p className="text-muted-foreground">{report.data.address}</p>}
          <p className="mt-2 text-sm text-muted-foreground">
            Please review and sign the document below
          </p>
        </div>

        <NextStepsSign
          reportId={report.id}
          defaultName={prefill?.name}
          defaultEmail={prefill?.email}
          onComplete={() => setCompleted(true)}
        />

        {report.data?.summary && !completed && (
          <Card className="mt-6 p-6">
            <h3 className="mb-3 text-lg font-semibold">Document Summary</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {report.data.summary}
            </p>
          </Card>
        )}

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Powered by ClearSKai Trades Intelligence Platform</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

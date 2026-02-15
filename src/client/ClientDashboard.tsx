import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function ClientDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl =
        (process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
        process.env.NEXT_PUBLIC_SUPABASE_URL;
      const url = `${supabaseUrl!.replace("/rest/v1", "")}/functions/v1/client-reports`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      try {
        (await import("sonner")).toast.error(
          "Error loading reports: " + (error instanceof Error ? error.message : String(error))
        );
      } catch (toastErr) {
        // ignore toast failures (toast library may not be available in some environments)

        console.warn("Toast error suppressed", toastErr);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6">Loading reports…</div>;

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Your Reports</h1>
      {reports.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          No reports have been assigned yet.
        </Card>
      ) : (
        <div className="space-y-2">
          {reports.map((r: any) => (
            <Card key={r.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">{r.title || "Untitled Report"}</div>
                <div className="text-xs text-muted-foreground">{r.address || "—"}</div>
                <div className="mt-1 text-xs">
                  Status: {r.status || (r.approvals?.path ? "Approved" : "In Review")}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/client/report/${r.id}`}>View</a>
                </Button>
                {r.signed_pdf_url && (
                  <Button size="sm" asChild>
                    <a href={r.signed_pdf_url} target="_blank" rel="noreferrer">
                      Download PDF
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

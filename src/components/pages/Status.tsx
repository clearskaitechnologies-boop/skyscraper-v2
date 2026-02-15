import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface StatusComponent {
  id: string;
  name: string;
  status: "operational" | "degraded" | "partial_outage" | "major_outage";
}

interface StatusIncident {
  id: string;
  title: string;
  severity: "minor" | "major" | "critical";
  description: string | null;
  started_at: string;
  components: string[];
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    operational: { variant: "default", label: "Operational" },
    degraded: { variant: "secondary", label: "Degraded" },
    partial_outage: { variant: "destructive", label: "Partial Outage" },
    major_outage: { variant: "destructive", label: "Major Outage" },
    minor: { variant: "secondary", label: "Minor" },
    major: { variant: "destructive", label: "Major" },
    critical: { variant: "destructive", label: "Critical" },
  };

  const config = variants[status] || { variant: "secondary", label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export default function StatusPage() {
  const [components, setComponents] = useState<StatusComponent[]>([]);
  const [incidents, setIncidents] = useState<StatusIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  async function loadStatus() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("status-read", {
        method: "GET",
      });

      if (error) throw error;

      setComponents(data.components || []);
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error("Failed to load status:", error);
    } finally {
      setLoading(false);
    }
  }

  const overallStatus = incidents.length > 0 ? "degraded" : "operational";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">System Status</h1>
            <p className="text-muted-foreground">Current operational status of all services</p>
          </div>
          <div className="flex items-center gap-2">
            {overallStatus === "operational" ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-amber-600" />
            )}
            <StatusBadge status={overallStatus} />
          </div>
        </div>

        {/* Components */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {components.map((component) => (
              <div
                key={component.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      component.status === "operational"
                        ? "bg-green-600"
                        : component.status === "degraded"
                          ? "bg-amber-600"
                          : "bg-red-600"
                    }`}
                  />
                  <span className="font-medium">{component.name}</span>
                </div>
                <StatusBadge status={component.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Active Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.length === 0 ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>No active incidents</span>
              </div>
            ) : (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div key={incident.id} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <h3 className="font-semibold">{incident.title}</h3>
                        </div>
                        <div className="mb-2 text-sm text-muted-foreground">
                          Started {new Date(incident.started_at).toLocaleString()}
                        </div>
                        {incident.description && (
                          <p className="whitespace-pre-wrap text-sm">{incident.description}</p>
                        )}
                        {incident.components.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {incident.components.map((comp) => (
                              <Badge key={comp} variant="outline" className="text-xs">
                                {comp}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={incident.severity} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>This page updates in real-time. For support, please contact your administrator.</p>
        </div>
      </div>
    </main>
  );
}

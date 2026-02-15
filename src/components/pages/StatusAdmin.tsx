import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface Incident {
  id: string;
  title: string;
  severity: string;
  started_at: string;
  description: string | null;
  components: string[];
}

export default function StatusAdminPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    severity: "minor",
    description: "",
    components: "",
  });

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const { data: allIncidents } = await supabase
        .from("status_incidents")
        .select("*")
        .is("resolved_at", null)
        .order("started_at", { ascending: false });

      setIncidents(allIncidents || []);
    } catch (error) {
      console.error("Failed to load incidents:", error);
    }
  }

  async function createIncident() {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      const components = form.components
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase.functions.invoke("status-incident-create", {
        body: {
          title: form.title,
          severity: form.severity,
          description: form.description || null,
          components,
        },
      });

      if (error) throw error;

      toast.success("Incident created");
      setForm({
        title: "",
        severity: "minor",
        description: "",
        components: "",
      });
      await loadIncidents();
    } catch (error: any) {
      toast.error(error.message || "Failed to create incident");
    } finally {
      setLoading(false);
    }
  }

  async function resolveIncident(id: string) {
    try {
      const { error } = await supabase.functions.invoke("status-incident-resolve", {
        method: "POST",
        body: {},
      });

      if (error) throw error;

      toast.success("Incident resolved");
      await loadIncidents();
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve incident");
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Status Administration</h1>
        <p className="text-muted-foreground">Manage system status incidents and component health</p>
      </div>

      {/* Create Incident Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Incident</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Title</label>
            <Input
              placeholder="Brief description of the incident"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Severity</label>
            <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Affected Components (comma-separated)
            </label>
            <Input
              placeholder="api, storage, ai"
              value={form.components}
              onChange={(e) => setForm({ ...form, components: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Available: api, storage, ai, payments, esign
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <Textarea
              placeholder="Detailed description of the incident and its impact"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </div>

          <Button onClick={createIncident} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Incident"}
          </Button>
        </CardContent>
      </Card>

      {/* Active Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No active incidents
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate font-semibold">{incident.title}</h3>
                      <Badge variant="secondary" className="capitalize">
                        {incident.severity}
                      </Badge>
                    </div>
                    <div className="mb-2 text-sm text-muted-foreground">
                      Started {new Date(incident.started_at).toLocaleString()}
                    </div>
                    {incident.components.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {incident.components.map((comp) => (
                          <Badge key={comp} variant="outline" className="text-xs">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => resolveIncident(incident.id)}>
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

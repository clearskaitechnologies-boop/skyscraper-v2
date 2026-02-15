"use client";

import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface Incident {
  id: string;
  tenant_id: string | null;
  signature: string;
  scope: any;
  first_seen: string;
  last_seen: string;
  events_count: number;
  confidence: number;
  status: string;
  message: string | null;
}

export default function Governance() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadIncidents() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("governance-incidents");

      if (error) throw error;
      setIncidents(data.items || []);
    } catch (error) {
      console.error("Error loading incidents:", error);
      toast.error("Failed to load incidents");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(incidentId: string, action: "ack" | "resolve") {
    try {
      const { error } = await supabase.functions.invoke(
        `governance-incidents/${incidentId}/${action}`,
        { method: "POST" }
      );

      if (error) throw error;

      toast.success(action === "ack" ? "Incident acknowledged" : "Incident resolved");
      loadIncidents();
    } catch (error) {
      console.error("Error updating incident:", error);
      toast.error("Failed to update incident");
    }
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Open</Badge>;
      case "acknowledged":
        return <Badge variant="default">Acknowledged</Badge>;
      case "resolved":
        return <Badge variant="secondary">Resolved</Badge>;
      case "suppressed":
        return <Badge variant="outline">Suppressed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Governance Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Monitor and manage security incidents</p>
        </div>
        <Button onClick={loadIncidents} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Last Seen</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No incidents detected
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(incident.last_seen).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{incident.signature}</TableCell>
                  <TableCell>{incident.events_count}</TableCell>
                  <TableCell>{incident.confidence.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {incident.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(incident.id, "ack")}
                        >
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Acknowledge
                        </Button>
                      )}
                      {incident.status !== "resolved" && (
                        <Button size="sm" onClick={() => handleAction(incident.id, "resolve")}>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

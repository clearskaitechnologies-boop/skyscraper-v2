import { Clock, Download, Eye, FileSignature, Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface AuditEvent {
  id: string;
  event_type: string;
  meta: any;
  created_at: string | null;
  actor: string | null;
}

interface AuditTimelineProps {
  reportId: string;
}

const EVENT_ICONS: Record<string, any> = {
  "esign.view": Eye,
  "esign.sign": FileSignature,
  "report.download": Download,
  "link.generated": LinkIcon,
};

const EVENT_LABELS: Record<string, string> = {
  "esign.view": "Document Viewed",
  "esign.sign": "Document Signed",
  "report.download": "Report Downloaded",
  "link.generated": "Public Link Created",
};

export default function AuditTimeline({ reportId }: AuditTimelineProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const { data, error } = await supabase
          .from("report_audit_events")
          .select("*")
          .eq("report_id", reportId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        setEvents(data || []);
      } catch (e) {
        console.error("Error loading audit events:", e);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();

    // Subscribe to new events
    const channel = supabase
      .channel(`audit-${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "report_audit_events",
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          setEvents((prev) => [payload.new as AuditEvent, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Loading activity...</span>
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-sm text-muted-foreground">No activity recorded yet.</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-lg font-semibold">Activity Timeline</h3>

      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = EVENT_ICONS[event.event_type] || Clock;
          const label = EVENT_LABELS[event.event_type] || event.event_type;

          return (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                {index < events.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
              </div>

              <div className="flex-1 pb-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.created_at
                        ? new Date(event.created_at).toLocaleString()
                        : "Unknown time"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {event.event_type}
                  </Badge>
                </div>

                {event.meta && Object.keys(event.meta).length > 0 && (
                  <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
                    {event.meta.signerName && <div>Signer: {event.meta.signerName}</div>}
                    {event.meta.signerEmail && <div>Email: {event.meta.signerEmail}</div>}
                    {event.meta.token && (
                      <div className="font-mono text-[10px]">
                        Token: {event.meta.token.substring(0, 12)}...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

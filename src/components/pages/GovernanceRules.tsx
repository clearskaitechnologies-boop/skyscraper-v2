import { Plus,RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface SuppressionRule {
  id: string;
  tenant_id: string | null;
  event_type: string | null;
  signature: string | null;
  threshold: number;
  window_sec: number;
  mute_until: string | null;
  reason: string | null;
  created_at: string;
}

export default function GovernanceRules() {
  const [rules, setRules] = useState<SuppressionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tenant_id: "",
    event_type: "",
    signature: "",
    threshold: 100,
    window_sec: 3600,
    mute_until: "",
    reason: "",
  });

  async function loadRules() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("governance-rules");

      if (error) throw error;
      setRules(data.items || []);
    } catch (error) {
      console.error("Error loading rules:", error);
      toast.error("Failed to load suppression rules");
    } finally {
      setLoading(false);
    }
  }

  async function createRule() {
    try {
      const payload = {
        ...form,
        tenant_id: form.tenant_id || null,
        event_type: form.event_type || null,
        signature: form.signature || null,
        mute_until: form.mute_until || null,
        reason: form.reason || null,
      };

      const { error } = await supabase.functions.invoke("governance-rules", {
        body: payload,
      });

      if (error) throw error;

      toast.success("Suppression rule created");
      setForm({
        tenant_id: "",
        event_type: "",
        signature: "",
        threshold: 100,
        window_sec: 3600,
        mute_until: "",
        reason: "",
      });
      loadRules();
    } catch (error) {
      console.error("Error creating rule:", error);
      toast.error("Failed to create suppression rule");
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suppression Rules</h1>
          <p className="mt-1 text-muted-foreground">Manage alert suppression and noise reduction</p>
        </div>
        <Button onClick={loadRules} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Rule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant ID (optional)</Label>
              <Input
                id="tenant_id"
                placeholder="Leave blank for global"
                value={form.tenant_id}
                onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type (optional)</Label>
              <Input
                id="event_type"
                placeholder="e.g., status-incident-create"
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signature">Signature (optional)</Label>
              <Input
                id="signature"
                placeholder="e.g., incident-spike"
                value={form.signature}
                onChange={(e) => setForm({ ...form, signature: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <Input
                id="threshold"
                type="number"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="window_sec">Window (seconds)</Label>
              <Input
                id="window_sec"
                type="number"
                value={form.window_sec}
                onChange={(e) => setForm({ ...form, window_sec: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mute_until">Mute Until</Label>
              <Input
                id="mute_until"
                type="datetime-local"
                value={form.mute_until}
                onChange={(e) => setForm({ ...form, mute_until: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Why is this rule needed?"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={createRule} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Type</TableHead>
              <TableHead>Signature</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Mute Until</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No suppression rules configured
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.event_type || "—"}</TableCell>
                  <TableCell>{rule.signature || "—"}</TableCell>
                  <TableCell>{rule.threshold}</TableCell>
                  <TableCell>{rule.window_sec}s</TableCell>
                  <TableCell>
                    {rule.mute_until ? new Date(rule.mute_until).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>{rule.reason || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

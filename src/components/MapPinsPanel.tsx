import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export type LeadRow = {
  id: string;
  userId: string;
  property_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  roof_material?: string | null;
};

export type MapPinsPanelProps = {
  owner?: string | null;
  onPick: (lead: LeadRow) => void;
  onBuild: (lead: LeadRow) => void;
};

export default function MapPinsPanel({ owner, onPick, onBuild }: MapPinsPanelProps) {
  const [pins, setPins] = useState<LeadRow[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!owner) return setPins([]);
      const { data, error } = await supabase
        .from("leads")
        .select("id, userId, property_address, latitude, longitude, roof_material")
        .eq("user_id", owner)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!mounted) return;
      if (error) console.error(error);
      setPins(data || []);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [owner]);

  const filtered = pins.filter((p) => {
    const t = `${p.property_address || ""}`.toLowerCase();
    return t.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-2 rounded-2xl border p-3">
      <div className="flex items-center justify-between">
        <div className="font-medium">Map Pins</div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search address"
          className="w-56"
        />
      </div>
      <div className="max-h-72 divide-y overflow-auto">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{p.property_address}</div>
              {p.roof_material && (
                <div className="truncate text-xs opacity-60">{p.roof_material}</div>
              )}
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => onPick(p)}>
                Use
              </Button>
              <Button size="sm" onClick={() => onBuild(p)}>
                Build
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs opacity-60">No pins found.</div>
        )}
      </div>
    </div>
  );
}

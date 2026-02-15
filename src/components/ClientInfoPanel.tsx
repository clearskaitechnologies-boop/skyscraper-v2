"use client";
import { Input } from "@/components/ui/input";

export default function ClientInfoPanel({
  value,
  onChange,
}: {
  value: { name?: string; email?: string; phone?: string };
  onChange: (v: any) => void;
}) {
  return (
    <div className="grid gap-2 rounded-2xl border p-3 md:grid-cols-3">
      <Input
        placeholder="Client Name"
        value={value.name || ""}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <Input
        placeholder="Client Email"
        value={value.email || ""}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
      />
      <Input
        placeholder="Client Phone"
        value={value.phone || ""}
        onChange={(e) => onChange({ ...value, phone: e.target.value })}
      />
    </div>
  );
}

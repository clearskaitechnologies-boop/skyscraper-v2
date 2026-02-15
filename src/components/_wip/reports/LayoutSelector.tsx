type Layout = "2up" | "3up" | "4up";

interface LayoutSelectorProps {
  value: Layout;
  onChange: (v: Layout) => void;
}

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Photo Layout</label>
      <div className="flex gap-2">
        {(["2up", "3up", "4up"] as Layout[]).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-lg border px-4 py-2 transition-colors ${
              value === opt
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background hover:bg-accent"
            }`}
          >
            {opt === "2up" ? "2 Photos" : opt === "3up" ? "3 Photos" : "4 Photos"}
          </button>
        ))}
      </div>
    </div>
  );
}

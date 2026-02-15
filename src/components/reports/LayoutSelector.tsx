/**
 * Layout Selector for report photo layouts
 */
"use client";

type Layout = "2up" | "3up" | "4up";

interface LayoutSelectorProps {
  value: Layout;
  onChange: (layout: Layout) => void;
}

export function LayoutSelector({ value, onChange }: LayoutSelectorProps) {
  const options: { value: Layout; label: string }[] = [
    { value: "2up", label: "2-Up" },
    { value: "3up", label: "3-Up" },
    { value: "4up", label: "4-Up" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md border px-3 py-1 text-sm ${
            value === opt.value ? "border-primary bg-primary/10" : "border-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

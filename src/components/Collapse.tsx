import { ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode,useState } from "react";

interface CollapseProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function Collapse({ title, children, defaultOpen = false }: CollapseProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 pb-4 pt-2">{children}</div>}
    </section>
  );
}

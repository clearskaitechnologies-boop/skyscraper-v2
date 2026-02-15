import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("min-h-screen bg-background", className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">{children}</div>
    </main>
  );
}

export function MarketingShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("min-h-screen bg-background", className)}>
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">{children}</div>
    </main>
  );
}

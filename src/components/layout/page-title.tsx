import { cn } from "@/lib/utils";

export function PageTitle({
  primary,
  accent,
  className,
}: {
  primary: string;
  accent: string;
  className?: string;
}) {
  return (
    <h1
      className={cn("text-3xl font-semibold tracking-tight text-foreground md:text-4xl", className)}
    >
      {primary}{" "}
      <span className="bg-gradient-to-r from-[#117CFF] to-[#FFC838] bg-clip-text text-transparent">
        {accent}
      </span>
    </h1>
  );
}

export function PageSubtitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-sm text-muted-foreground md:text-base", className)}>{children}</p>;
}

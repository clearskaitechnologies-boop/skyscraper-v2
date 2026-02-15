import BrandMark from "@/components/BrandMark";
import { SystemHealthBadge } from "@/components/SystemHealthBadge";
import ThemeToggle from "@/components/ThemeToggle";
import TokenBadge from "@/components/TokenBadge";
import { useBranding } from "@/theme/BrandingProvider";

export function TopBar() {
  const { branding } = useBranding();

  return (
    <header className="sticky top-0 z-10 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {branding?.logo_url ? (
            <img src={branding.logo_url} alt="Logo" className="h-8 w-auto" />
          ) : (
            <BrandMark className="text-sm" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <SystemHealthBadge />
          <TokenBadge />
          <ThemeToggle />
          <a
            href="/book-demo"
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Book a Demo
          </a>
          <div className="h-8 w-8 rounded-full bg-accent" title="User Menu" />
        </div>
      </div>
    </header>
  );
}

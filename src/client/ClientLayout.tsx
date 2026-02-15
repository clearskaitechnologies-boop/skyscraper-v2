import ClientNav from "./ClientNav";
import { PortalThemeProvider } from "./PortalTheme";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const theme = {
    brandName: "ClearSKai Roofing",
    logoUrl: "",
    contactLine: "(480) 000-0000 • clearskairoofing.com",
    accent: "from-sky-500 to-blue-600",
  };

  return (
    <PortalThemeProvider value={theme}>
      <div className="flex min-h-screen flex-col">
        <ClientNav />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
        <footer className="mt-auto border-t py-6">
          <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
            {theme.contactLine} • Powered by <span className="font-semibold">SkaiScraper™</span>
          </div>
        </footer>
      </div>
    </PortalThemeProvider>
  );
}

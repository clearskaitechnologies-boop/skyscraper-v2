import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { usePortalTheme } from "./PortalTheme";

export default function ClientNav() {
  const [open, setOpen] = useState(false);
  const theme = usePortalTheme();

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/client" className="flex items-center gap-2">
            {theme.logoUrl ? (
              <img src={theme.logoUrl} alt={theme.brandName || "Logo"} className="h-8" />
            ) : (
              <div
                className={`h-8 w-8 rounded bg-gradient-to-br ${theme.accent || "from-sky-500 to-blue-600"}`}
              />
            )}
            <span className="text-lg font-semibold">{theme.brandName || "Client Portal"}</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/client" className="text-sm font-medium transition-colors hover:text-primary">
              Reports
            </Link>
            <Link
              to="/client/support"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Support
            </Link>
          </nav>
        </div>

        {open && (
          <nav className="space-y-2 border-t py-4 md:hidden">
            <Link
              to="/client"
              className="block rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Reports
            </Link>
            <Link
              to="/client/support"
              className="block rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              Support
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

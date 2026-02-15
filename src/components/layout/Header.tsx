import React from "react";
import { Link } from "react-router-dom";

import RightCommandBar from "@/components/RightCommandBar";
import ModeToggle from "@/components/ui/mode-toggle";

export default function Header() {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-lg font-semibold">
            ClearSKai
          </Link>
          <nav className="hidden items-center gap-3 md:flex">
            <Link to="/dashboard" className="text-sm hover:text-primary">
              Dashboard
            </Link>
            <Link to="/reports/history" className="text-sm hover:text-primary">
              Report History
            </Link>
            <Link to="/workbench" className="text-sm hover:text-primary">
              Inspect & Build
            </Link>
            <Link to="/crm" className="text-sm hover:text-primary">
              CRM
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle />
          <RightCommandBar />
        </div>
      </div>
    </header>
  );
}

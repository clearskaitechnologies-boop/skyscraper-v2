/**
 * Solutions page CTAs - Link to workbench with mode presets
 */
import { FileText, Search,Zap } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function SolutionsCTA() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link to="/report-workbench?mode=retail">
        <Button size="lg" className="gap-2">
          <Zap className="h-4 w-4" />
          Build in 60 Seconds
        </Button>
      </Link>
      <Link to="/report-workbench?mode=insurance">
        <Button variant="outline" size="lg" className="gap-2">
          <FileText className="h-4 w-4" />
          Insurance Claims Folder
        </Button>
      </Link>
      <Link to="/report-workbench?mode=inspection">
        <Button variant="outline" size="lg" className="gap-2">
          <Search className="h-4 w-4" />
          AI Inspection
        </Button>
      </Link>
    </div>
  );
}

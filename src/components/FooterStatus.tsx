import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { useJeMode } from "@/hooks/useJeMode";

export default function FooterStatus() {
  const { mode, mock } = useJeMode();
  const version =
    (process.env.NEXT_PUBLIC_APP_VERSION as string | undefined) ||
    process.env.NEXT_PUBLIC_APP_VERSION ||
    "0.2.0";

  return (
    <footer className="mt-10 border-t">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline">v{version}</Badge>
            <Badge variant={mock ? "secondary" : "default"}>JE: {mode}</Badge>
          </div>
          <Link
            to="/changelog"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Changelog
          </Link>
        </div>
      </div>
    </footer>
  );
}

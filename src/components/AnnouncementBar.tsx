import { X } from "lucide-react";
import { useEffect,useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useJeMode } from "@/hooks/useJeMode";

const LS_KEY = "cs_announce_hidden_v1";

export default function AnnouncementBar() {
  const { mode, mock } = useJeMode();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const v = localStorage.getItem(LS_KEY);
    setHidden(v === "1");
  }, []);

  if (hidden) return null;

  // Optional env: NEXT_PUBLIC_ANNOUNCE_ENABLED, NEXT_PUBLIC_ANNOUNCE_TEXT
  const enabled = String(process.env.NEXT_PUBLIC_ANNOUNCE_ENABLED || "true") === "true";
  if (!enabled) return null;

  const defaultMsg = mock
    ? "Aerial data integration: running in MOCK mode — live data will auto-enable when credentials are added."
    : "Aerial data enabled";
  const msg = String(process.env.NEXT_PUBLIC_ANNOUNCE_TEXT || defaultMsg);

  const handleDismiss = () => {
    localStorage.setItem(LS_KEY, "1");
    setHidden(true);
  };

  return (
    <div
      className={`sticky top-0 z-50 border-b ${
        mock ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"
      }`}
    >
      <div className="container mx-auto flex items-center gap-3 px-4 py-3">
        <Badge variant={mock ? "secondary" : "default"} className="font-semibold">
          {mode}
        </Badge>
        <div className="flex-1 text-sm">{msg}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-8 w-8 p-0"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

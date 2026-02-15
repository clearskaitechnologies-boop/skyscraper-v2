import { Bell, Settings } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import useClientSubscription from "@/hooks/useClientSubscription";

export default function RightCommandBar() {
  const { loading, hasSubscription } = useClientSubscription();

  return (
    <div className="flex items-center gap-2">
      {!loading && hasSubscription ? (
        <Link to="/ai-tools">
          <Button variant="outline" size="sm">
            AI Tools
          </Button>
        </Link>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled
          title={loading ? "Checking..." : "Subscription required"}
        >
          AI Tools
        </Button>
      )}

      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>

      <Link to="/settings">
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}

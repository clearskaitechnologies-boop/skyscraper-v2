"use client";

import { Database, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seed/test-data", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Test data created!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(data.error || "Failed to create test data");
      }
    } catch (error) {
      toast.error("Failed to create test data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSeed}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {loading ? "Creating..." : "Add Test Data"}
    </Button>
  );
}

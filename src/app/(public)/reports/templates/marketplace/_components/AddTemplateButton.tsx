"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { logger } from "@/lib/logger";

interface AddTemplateButtonProps {
  templateId: string;
  templateTitle: string;
}

export function AddTemplateButton({ templateId, templateTitle }: AddTemplateButtonProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try {
      const response = await fetch("/api/templates/add-to-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      const result = await response.json();

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || "Failed to add template");
      }

      toast.success(`"${templateTitle}" added to your company!`);
      router.push("/reports/templates");
    } catch (error: any) {
      logger.error("Error adding template:", error);
      toast.error(error.message || "Failed to add template. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <SignedIn>
        <button
          disabled={adding}
          onClick={handleAdd}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add to Company"}
        </button>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl="/reports/templates/marketplace">
          <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Sign in to Add
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}

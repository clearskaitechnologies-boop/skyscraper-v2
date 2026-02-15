"use client";

import { FileText } from "lucide-react";
import { useState } from "react";

import { UseTemplateModal } from "@/components/templates/UseTemplateModal";

interface UseTemplateButtonProps {
  templateId: string;
  templateTitle: string;
  templateSlug?: string;
}

export function UseTemplateButton({
  templateId,
  templateTitle,
  templateSlug,
}: UseTemplateButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
      >
        <FileText className="h-4 w-4" />
        Use Template
      </button>

      {showModal && (
        <UseTemplateModal
          templateId={templateId}
          templateTitle={templateTitle}
          templateSlug={templateSlug}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

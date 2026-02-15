import React, { useState } from "react";

import VoiceRecorder from "./VoiceRecorder";

export default function VoiceMicButton({
  relatedType = "lead",
  relatedId,
}: {
  relatedType?: "lead" | "claim";
  relatedId?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        aria-label="Voice note"
        className="rounded-full p-2 hover:bg-slate-100"
        onClick={() => setOpen(true)}
      >
        🎤
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="w-full max-w-xl rounded bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Voice Note</h3>
              <button onClick={() => setOpen(false)} className="text-sm">
                Close
              </button>
            </div>
            <VoiceRecorder
              relatedType={relatedType}
              relatedId={relatedId || ""}
              onSaved={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

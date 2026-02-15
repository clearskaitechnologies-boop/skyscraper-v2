import dynamic from "next/dynamic";
import { useState } from "react";

const PDFViewer = dynamic(
  async () => {
    const mod = await import("@react-pdf-viewer/core");
    return mod.Viewer;
  },
  { ssr: false }
);

export default function PDFPreview({ pdfUrl }: { pdfUrl: string }) {
  const [landscape, setLandscape] = useState(true);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="font-medium">PDF Orientation:</label>
        <button
          className={`rounded px-3 py-1 ${landscape ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setLandscape(true)}
        >
          Landscape
        </button>
        <button
          className={`rounded px-3 py-1 ${!landscape ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setLandscape(false)}
        >
          Portrait
        </button>
      </div>
      {/* PDF Viewer */}
      <div className="rounded-xl border bg-white p-2" style={{ minHeight: 500 }}>
        <PDFViewer fileUrl={pdfUrl} />
      </div>
    </div>
  );
}

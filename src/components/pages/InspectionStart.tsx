import { Link } from "react-router-dom";

export default function InspectionStart() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5">
        <div className="mb-1 text-lg font-semibold">AI Inspection</div>
        <div className="text-gray-600">Fast, accurate inspection reports with AI analysis.</div>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700">
          <li>Photo upload & EXIF parsing</li>
          <li>AI damage detection</li>
          <li>Pitch/material ID</li>
          <li>Risk scoring & summary</li>
        </ul>
        <Link
          to="/inspection/wizard"
          className="mt-4 inline-block rounded-lg bg-[var(--cs-primary)] px-4 py-2 text-white"
        >
          Build in 60 Seconds →
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function AiDamagePage() {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="text-lg font-semibold">AI Damage Analysis</div>
      <p className="mt-1 text-gray-600">
        Analyze photos for hail hits, missing shingles, and wind damage.
      </p>
      <Link
        to="/inspection/wizard?mode=analysis"
        className="mt-4 inline-block rounded-lg bg-[var(--cs-primary)] px-4 py-2 text-white"
      >
        Analyze Photos →
      </Link>
    </div>
  );
}

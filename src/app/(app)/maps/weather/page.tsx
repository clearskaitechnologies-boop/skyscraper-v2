// /maps/weather/page.tsx
import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

export default async function WeatherChainsPage() {
  const ctx = await safeOrgContext();
  // Removed org blocker - weather available for all authenticated users
  if (ctx.status === "unauthenticated") {
    return <div className="p-6 text-sm text-text-muted">Sign in to access weather data.</div>;
  }
  return (
    <div className="space-y-4 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-primary">Weather Intelligence</h1>
        <p className="text-sm text-text-muted">
          Historical & forensic weather workflows powered by WeatherStack.
        </p>
      </header>
      <div className="rounded-xl border border-[color:var(--border)] bg-surface-panel p-6 text-sm text-text-muted">
        Weather data integration active. Default region: Phoenix, AZ area.
      </div>
    </div>
  );
}

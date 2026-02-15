export default function BrandingShowcaseBlock() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-medium">Branding — how it works</h2>
        <p className="mt-2 text-gray-700">
          Upload your company logo, set colors & typography, and define document defaults (cover,
          footer, signature). SkaiScraper automatically applies your branding to every
          PDF—proposals, claims packets, and weather reports.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Primary Logo</div>
            <div className="mt-2 flex h-20 items-center justify-center rounded bg-gray-50">
              <img src="/logo.svg" alt="Logo" className="h-10" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Colors</div>
            <div className="mt-2 flex gap-3">
              <div className="h-8 w-8 rounded bg-[#081A2F]" />
              <div className="h-8 w-8 rounded bg-[#1F6FEB]" />
              <div className="h-8 w-8 rounded bg-[#F2F4F7]" />
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-gray-500">Doc Defaults</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>Cover: Inspection & Weather Verification</li>
              <li>Footer: SkaiScraper™ • Claims & Reports</li>
              <li>Signature: Estimator • License • Contact</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

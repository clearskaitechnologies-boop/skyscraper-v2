import Link from "next/link";

// Custom not-found page with explicit html/body for clarity in error isolation.
// Next.js App Router allows a plain component; this wrapper ensures no legacy <Html> usage.
export default function NotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-neutral-400 to-neutral-500 text-white">
            <span className="text-3xl font-bold">404</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-neutral-900">Page not found</h1>
          <p className="mb-8 text-neutral-600">The page you're looking for doesn't exist or has been moved.</p>
          <Link href="/" className="inline-flex items-center rounded-2xl bg-[#147BFF] px-6 py-3 font-medium text-white transition-colors hover:bg-[#0366D6]">
            Go back home
          </Link>
        </div>
      </body>
    </html>
  );
}

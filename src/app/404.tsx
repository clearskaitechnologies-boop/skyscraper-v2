export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] p-8 text-center">
      <h1 className="mb-2 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-3xl font-bold text-transparent">Page Not Found</h1>
      <p className="mb-6 max-w-md text-sm text-slate-700 dark:text-slate-300">
        The page you’re looking for doesn’t exist or may have been moved. Check the URL or return to your dashboard.
      </p>
      <a
        href="/dashboard"
        className="rounded-xl bg-[var(--primary)] px-4 py-2 font-medium text-white shadow transition hover:opacity-90"
      >
        ← Back to Dashboard
      </a>
    </div>
  );
}
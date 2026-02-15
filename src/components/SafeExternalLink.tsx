import Link from "next/link";

export function SafeExternalLink({
  href,
  children,
  className,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  // Normalize URL: ensure HTTPS, remove trailing slashes
  const normalizeUrl = (url: string | undefined): string | null => {
    if (!url) return null;

    let normalized = url.trim();

    // Ensure absolute URL
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = `https://${normalized}`;
    }

    // Prefer HTTPS
    if (normalized.startsWith("http://")) {
      normalized = normalized.replace("http://", "https://");
    }

    // Remove trailing slash
    normalized = normalized.replace(/\/$/, "");

    return normalized;
  };

  const normalizedHref = normalizeUrl(href);

  if (!normalizedHref) {
    return (
      <button disabled className={className || "cursor-not-allowed text-sm text-gray-400"}>
        {children}
      </button>
    );
  }

  return (
    <a
      href={normalizedHref}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => {
        // Fallback: if window.open fails, copy URL to clipboard
        try {
          const opened = window.open(normalizedHref, "_blank", "noopener,noreferrer");
          if (!opened) {
            e.preventDefault();
            navigator.clipboard.writeText(normalizedHref);
            alert(`Link copied to clipboard: ${normalizedHref}`);
          }
        } catch (err) {
          console.error("Failed to open link:", err);
        }
      }}
    >
      {children}
    </a>
  );
}

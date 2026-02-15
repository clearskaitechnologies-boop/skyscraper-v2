import { env } from "@/env";

export function absoluteUrl(path = "") {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const slash = path.startsWith("/") ? "" : "/";
  return `${base}${slash}${path}`;
}

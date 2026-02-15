export async function api<T = any>(path: string, options: RequestInit = {}) {
  const base =
    (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined) ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8787";

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return (await res.json()) as T;
}

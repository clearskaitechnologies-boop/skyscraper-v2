export async function safeFetch(url: string, init?: RequestInit) {
  return fetch(url, { cache: "no-store", ...init });
}

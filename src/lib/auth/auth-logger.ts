import * as originalClerk from "@clerk/nextjs/server";

export async function auth(...args: Parameters<typeof originalClerk.auth>) {
  const stack = new Error().stack?.split("\n").slice(2, 7).join("\n") || "No stack";
  console.log("🔥 auth() called from:\n", stack);
  return originalClerk.auth(...args);
}

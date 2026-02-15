export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkSecret = process.env.CLERK_SECRET_KEY;

  const allEnvVars = Object.keys(process.env)
    .filter(
      (k) =>
        k.includes("CLERK") ||
        k.includes("NEXT_PUBLIC") ||
        k.includes("DATABASE") ||
        k.includes("APP")
    )
    .sort()
    .reduce(
      (acc, key) => {
        const value = process.env[key] || "";
        acc[key] = value.substring(0, 30) + (value.length > 30 ? "..." : "");
        return acc;
      },
      {} as Record<string, string>
    );

  return Response.json(
    {
      clerkConfigured: {
        publishableKey: !!clerkKey,
        publishableKeyValue: clerkKey?.substring(0, 20) || "NOT SET",
        secret: !!clerkSecret,
      },
      allEnvVars,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
}

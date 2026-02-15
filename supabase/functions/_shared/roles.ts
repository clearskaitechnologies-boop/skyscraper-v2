// Role assertion helpers for edge functions

export function assertOwnerOrAdmin(ctx: any) {
  const roles = ctx?.roles || [];
  if (!roles.includes("owner") && !roles.includes("admin")) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "forbidden", code: "E1002" }),
    };
  }
  return null;
}

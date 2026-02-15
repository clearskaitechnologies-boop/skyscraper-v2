// src/lib/auth/requireOrg.ts
import { getAuthContext } from "./getAuthContext";

export class OrgRequiredError extends Error {
  constructor(message = "Organization required") {
    super(message);
    this.name = "OrgRequiredError";
  }
}

export async function requireOrg() {
  const ctx = await getAuthContext();
  if (!ctx.userId) throw new OrgRequiredError("Authentication required");
  if (!ctx.orgId) throw new OrgRequiredError();
  return ctx;
}

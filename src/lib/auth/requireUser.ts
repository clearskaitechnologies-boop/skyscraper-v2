// src/lib/auth/requireUser.ts
import { getAuthContext } from "./getAuthContext";

export class AuthRequiredError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export async function requireUser() {
  const ctx = await getAuthContext();
  if (!ctx.userId) throw new AuthRequiredError();
  return ctx;
}

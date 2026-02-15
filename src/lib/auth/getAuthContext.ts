// src/lib/auth/getAuthContext.ts
import { auth, currentUser } from "@clerk/nextjs/server";

export type AuthContext = {
  userId: string | null;
  orgId: string | null;
  user: any | null;
};

export async function getAuthContext(): Promise<AuthContext> {
  const a = await auth();
  const user = await currentUser();
  const userId = a.userId ?? null;
  const orgId = a.orgId ?? null;

  return { userId, orgId, user };
}

/**
 * Diagnostic endpoint: Tests every identity resolution layer
 * GET /api/diag/identity — returns JSON showing what each layer sees
 */
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {};

  // === Layer 0: currentUser() ===
  try {
    const user = await currentUser();
    results.currentUser = {
      id: user?.id ?? null,
      publicMetadata: user?.publicMetadata ?? null,
      publicMetadataType: typeof user?.publicMetadata,
      userTypeFromMeta: (user?.publicMetadata as any)?.userType ?? "NOT_SET",
      orgMemberships: user?.organizationMemberships?.length ?? 0,
      firstName: user?.firstName,
    };
  } catch (e) {
    results.currentUser = { error: e.message };
  }

  // === Layer 1: Prisma ORM ===
  try {
    const { getUserIdentity } = await import("@/lib/identity");
    const user = await currentUser();
    if (user?.id) {
      const identity = await getUserIdentity(user.id);
      results.prismaORM = {
        userType: identity?.userType ?? null,
        isActive: identity?.isActive ?? null,
        orgId: identity?.orgId ?? null,
      };
    } else {
      results.prismaORM = { error: "No user ID" };
    }
  } catch (e) {
    results.prismaORM = { error: e.message?.substring(0, 200) };
  }

  // === Layer 2: Direct SQL ===
  try {
    const user = await currentUser();
    if (user?.id) {
      const { default: prisma } = await import("@/lib/prisma");
      const result = await prisma.$queryRawUnsafe<{ userType: string }[]>(
        `SELECT "userType" FROM app.user_registry WHERE "clerkUserId" = $1 LIMIT 1`,
        user.id
      );
      results.directSQL = {
        userType: result?.[0]?.userType ?? null,
        rowCount: result?.length ?? 0,
      };
    }
  } catch (e) {
    results.directSQL = { error: e.message?.substring(0, 200) };
  }

  // === Layer 3: Clerk publicMetadata via direct API ===
  try {
    const user = await currentUser();
    if (user?.id) {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      results.clerkSecretKeyLength = clerkSecretKey?.length ?? 0;
      results.clerkSecretKeyStart = clerkSecretKey?.substring(0, 12) ?? "MISSING";
      results.clerkSecretKeyEnd =
        clerkSecretKey?.substring((clerkSecretKey?.length ?? 0) - 5) ?? "MISSING";
      // Check for \n corruption
      results.clerkSecretKeyHasNewline = clerkSecretKey?.includes("\n") ?? false;

      const resp = await fetch(`https://api.clerk.com/v1/users/${user.id}`, {
        headers: { Authorization: `Bearer ${clerkSecretKey}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        results.clerkDirectAPI = {
          publicMetadata: data.public_metadata,
          status: resp.status,
        };
      } else {
        results.clerkDirectAPI = {
          error: `HTTP ${resp.status}`,
          body: (await resp.text()).substring(0, 200),
        };
      }
    }
  } catch (e) {
    results.clerkDirectAPI = { error: e.message?.substring(0, 200) };
  }

  return NextResponse.json(results, { status: 200 });
}

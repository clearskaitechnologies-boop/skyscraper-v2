import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * After-sign-in routing — HARDENED v3
 *
 * Layer order: Clerk-first (no DB dependency for auth routing)
 *   L1: Clerk publicMetadata from currentUser()
 *   L2: Direct Clerk REST API fetch (bypasses SDK caching)
 *   L3: Clerk org membership (any org = pro)
 *   L4: Direct SQL with schema-qualified table name
 *   L5: Prisma ORM (last resort — known broken with PgBouncer)
 *
 * CRITICAL: Auth routing must work even when the database is down.
 */

async function setUserTypeCookie(type: "pro" | "client") {
  try {
    const cookieStore = await cookies();
    cookieStore.set("x-user-type", type, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (e) {
    console.error("[AFTER-SIGN-IN] Cookie set error:", e);
  }
}

/**
 * Sync Clerk publicMetadata with the resolved user type.
 * This is CRITICAL because the middleware reads sessionClaims.publicMetadata.userType
 * BEFORE the cookie fallback. If publicMetadata is empty or wrong, the middleware
 * will use the stale cookie and route the user to the wrong surface.
 */
async function syncClerkMetadata(clerkUserId: string, userType: "pro" | "client") {
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { userType },
    });
    console.log("[AFTER-SIGN-IN] Synced Clerk publicMetadata:", userType);
  } catch (e) {
    console.error("[AFTER-SIGN-IN] Failed to sync Clerk metadata:", e);
    // Non-fatal — cookie fallback will still work
  }
}

/** Direct Clerk REST API — bypasses SDK entirely */
async function getClerkUserTypeDirect(clerkUserId: string): Promise<"pro" | "client" | null> {
  try {
    const sk = process.env.CLERK_SECRET_KEY;
    if (!sk) return null;
    const r = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
      headers: { Authorization: `Bearer ${sk}` },
      cache: "no-store",
    });
    if (!r.ok) {
      console.error("[AFTER-SIGN-IN] Clerk API HTTP", r.status);
      return null;
    }
    const d = await r.json();
    const ut = d?.public_metadata?.userType;
    if (ut === "pro" || ut === "client") return ut;
    return null;
  } catch (e) {
    console.error("[AFTER-SIGN-IN] Clerk API fetch error:", e);
    return null;
  }
}

/** Schema-qualified direct SQL — bypasses Prisma ORM */
async function getUserTypeDirectSQL(clerkUserId: string): Promise<"pro" | "client" | null> {
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const result = await prisma.$queryRawUnsafe<{ userType: string }[]>(
      `SELECT "userType" FROM app.user_registry WHERE "clerkUserId" = $1 LIMIT 1`,
      clerkUserId
    );
    if (result?.[0]?.userType === "pro" || result?.[0]?.userType === "client") {
      return result[0].userType as "pro" | "client";
    }
    return null;
  } catch (e) {
    console.error("[AFTER-SIGN-IN] Direct SQL fallback also failed:", e);
    return null;
  }
}

export default async function AfterSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; redirect_url?: string }>;
}) {
  const params = await searchParams;
  const mode = params?.mode; // "pro" from /sign-up, "client" from /client/sign-in
  const pendingRedirect = params?.redirect_url;

  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("[AFTER-SIGN-IN] Error getting current user:", error);
    redirect("/sign-in");
  }

  if (!user?.id) {
    redirect("/sign-in");
  }

  console.log("[AFTER-SIGN-IN] START userId:", user.id, "mode:", mode);

  let resolvedType: "pro" | "client" | null = null;

  // -- L1: Clerk publicMetadata (fastest, no network call) --
  try {
    const mt = (user.publicMetadata as Record<string, unknown>)?.userType;
    console.log("[AFTER-SIGN-IN] L1 Clerk meta:", JSON.stringify(mt));
    if (mt === "pro" || mt === "client") resolvedType = mt;
  } catch (e) {
    console.error("[AFTER-SIGN-IN] L1 err:", e);
  }

  // -- L2: Direct Clerk REST API (bypasses SDK) --
  if (!resolvedType) {
    console.log("[AFTER-SIGN-IN] L1 miss -> L2 Clerk API");
    const t2 = await getClerkUserTypeDirect(user.id);
    console.log("[AFTER-SIGN-IN] L2:", t2);
    if (t2) resolvedType = t2;
  }

  // -- L3: Clerk org membership --
  if (!resolvedType) {
    const oc = user.organizationMemberships?.length ?? 0;
    console.log("[AFTER-SIGN-IN] L3 orgs:", oc);
    if (oc > 0) resolvedType = "pro";
  }

  // -- L4: Direct SQL (schema-qualified) --
  if (!resolvedType) {
    console.log("[AFTER-SIGN-IN] L3 miss -> L4 SQL");
    const t4 = await getUserTypeDirectSQL(user.id);
    console.log("[AFTER-SIGN-IN] L4:", t4);
    if (t4) resolvedType = t4;
  }

  // -- L5: Prisma ORM (last resort) --
  if (!resolvedType) {
    console.log("[AFTER-SIGN-IN] L4 miss -> L5 Prisma ORM");
    try {
      const { getUserIdentity } = await import("@/lib/identity");
      const id5 = await getUserIdentity(user.id);
      const t5 = id5?.userType;
      console.log("[AFTER-SIGN-IN] L5:", t5);
      if (t5 === "pro" || t5 === "client") resolvedType = t5;
    } catch (e) {
      console.error("[AFTER-SIGN-IN] L5 err:", e);
    }
  }

  console.log("[AFTER-SIGN-IN] RESOLVED:", resolvedType, "for", user.id);

  // -- Known user: route by type --
  if (resolvedType) {
    await setUserTypeCookie(resolvedType);
    syncClerkMetadata(user.id, resolvedType).catch(() => {});
    if (pendingRedirect?.startsWith("/")) redirect(pendingRedirect);
    if (resolvedType === "client") redirect("/portal");
    redirect("/dashboard");
  }

  // -- New user: determine from mode param --
  const newType: "pro" | "client" = mode === "pro" ? "pro" : "client";
  console.log("[AFTER-SIGN-IN] NEW USER mode:", mode, "->", newType);

  try {
    const { default: prisma } = await import("@/lib/prisma");
    await prisma.$executeRawUnsafe(
      `INSERT INTO app.user_registry ("clerkUserId", "userType", "isActive", "onboardingComplete", "displayName", email, "avatarUrl", "createdAt", "updatedAt")
       VALUES ($1, $2, true, false, $3, $4, $5, NOW(), NOW())
       ON CONFLICT ("clerkUserId") DO NOTHING`,
      user.id,
      newType,
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      user.emailAddresses?.[0]?.emailAddress || null,
      user.imageUrl || null
    );
  } catch (regError) {
    console.error("[AFTER-SIGN-IN] DB reg err:", regError);
  }

  await setUserTypeCookie(newType);
  await syncClerkMetadata(user.id, newType);
  if (pendingRedirect?.startsWith("/")) redirect(pendingRedirect);
  if (newType === "pro") redirect("/dashboard");
  redirect("/portal");
}

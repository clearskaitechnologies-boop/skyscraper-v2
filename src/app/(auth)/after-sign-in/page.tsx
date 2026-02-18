import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getUserIdentity } from "@/lib/identity";

/**
 * After-sign-in routing page
 *
 * This page runs after Clerk sign-in/sign-up completes. It:
 * 1. Checks the user's identity (pro vs client)
 * 2. Falls back to Clerk org membership check if DB lookup fails
 * 3. Honors the ?mode= param from the sign-up page (pro or client)
 * 4. Sets the x-user-type cookie for middleware routing
 * 5. Redirects to the appropriate dashboard
 *
 * CRITICAL: This page must NEVER silently default to "client" when the
 * DB is flaky. If Prisma errors out, we check Clerk org membership
 * and publicMetadata as fallbacks before defaulting.
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
 * Direct SQL fallback — bypasses Prisma schema mismatches entirely.
 * Used when Prisma client throws (e.g. column mismatch after migration).
 */
async function getUserTypeDirectSQL(clerkUserId: string): Promise<"pro" | "client" | null> {
  try {
    const { default: prisma } = await import("@/lib/prisma");
    const result = await prisma.$queryRawUnsafe<{ userType: string }[]>(
      `SELECT "userType" FROM user_registry WHERE "clerkUserId" = $1 LIMIT 1`,
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

  // ─── 1. Check existing identity in database ───
  let existingType: string | undefined;

  // Primary: Prisma ORM lookup
  try {
    const identity = await getUserIdentity(user.id);
    existingType = identity?.userType;
  } catch (error) {
    console.error("[AFTER-SIGN-IN] Prisma identity lookup failed:", error);
  }

  // Fallback 1: Direct SQL (bypasses Prisma schema issues)
  if (!existingType) {
    const sqlType = await getUserTypeDirectSQL(user.id);
    if (sqlType) {
      existingType = sqlType;
      console.log("[AFTER-SIGN-IN] Recovered user type via direct SQL:", sqlType);
    }
  }

  // Fallback 2: Clerk publicMetadata (set by onboarding or admin)
  if (!existingType) {
    const clerkUserType = user.publicMetadata?.userType as string | undefined;
    if (clerkUserType === "pro" || clerkUserType === "client") {
      existingType = clerkUserType;
      console.log("[AFTER-SIGN-IN] Recovered user type via Clerk metadata:", clerkUserType);
    }
  }

  // Fallback 3: Clerk org membership (any org membership = pro user)
  if (!existingType) {
    try {
      const orgs = user.organizationMemberships;
      if (orgs && orgs.length > 0) {
        existingType = "pro";
        console.log("[AFTER-SIGN-IN] Detected pro via Clerk org membership");
      }
    } catch {
      /* org check failed, continue */
    }
  }

  console.log("[AFTER-SIGN-IN] User:", user.id, "ExistingType:", existingType, "Mode:", mode);

  // ─── 2. If user already has a known type, honor it ───
  if (existingType === "pro" || existingType === "client") {
    await setUserTypeCookie(existingType as "pro" | "client");

    // Honor pending redirect first (invite links, deep links)
    if (pendingRedirect && pendingRedirect.startsWith("/")) {
      redirect(pendingRedirect);
    }

    if (existingType === "client") {
      redirect("/portal");
    }
    // Pro user
    redirect("/dashboard");
  }

  // ─── 3. NEW USER — determine type from mode param ───
  // mode=pro comes from /sign-up page ("Create Your Pro Account")
  // mode=client comes from /client/sign-in page
  // No mode = default to client (homeowners arriving via Google)
  const resolvedType: "pro" | "client" = mode === "pro" ? "pro" : "client";

  console.log("[AFTER-SIGN-IN] New user registration — resolvedType:", resolvedType);

  // Try to register in user_registry (best-effort, don't block redirect)
  try {
    const { default: prisma } = await import("@/lib/prisma");
    await prisma.$executeRawUnsafe(
      `INSERT INTO user_registry ("clerkUserId", "userType", "isActive", "onboardingComplete", "displayName", email, "avatarUrl", "createdAt", "updatedAt")
       VALUES ($1, $2, true, false, $3, $4, $5, NOW(), NOW())
       ON CONFLICT ("clerkUserId") DO UPDATE SET "userType" = $2, "lastSeenAt" = NOW(), "updatedAt" = NOW()`,
      user.id,
      resolvedType,
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
      user.emailAddresses?.[0]?.emailAddress || null,
      user.imageUrl || null
    );
  } catch (regError) {
    console.error("[AFTER-SIGN-IN] Error registering user:", regError);
  }

  await setUserTypeCookie(resolvedType);

  // Honor pending redirect first
  if (pendingRedirect && pendingRedirect.startsWith("/")) {
    redirect(pendingRedirect);
  }

  if (resolvedType === "pro") {
    redirect("/dashboard");
  }

  redirect("/portal");
}

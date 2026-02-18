import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getUserIdentity } from "@/lib/identity";

/**
 * After-sign-in routing page
 *
 * This page runs after Clerk sign-in/sign-up completes. It:
 * 1. Checks the user's identity (pro vs client)
 * 2. Honors the ?mode= param from the sign-up page (pro or client)
 * 3. Sets the x-user-type cookie for middleware routing
 * 4. Redirects to the appropriate dashboard
 *
 * CRITICAL FIX: Previously, ALL unknown users were auto-registered as "client".
 * This broke Pro signups — users who clicked "Create Your Pro Account" were
 * sent to the Client portal because no mode=pro signal was passed.
 * Now: mode=pro → register as pro → /dashboard
 *       mode=client or no mode → register as client → /portal
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
  let identity;
  try {
    identity = await getUserIdentity(user.id);
  } catch (error) {
    console.error("[AFTER-SIGN-IN] Error getting identity:", error);
  }

  const existingType = identity?.userType;
  console.log("[AFTER-SIGN-IN] User:", user.id, "ExistingType:", existingType, "Mode:", mode);

  // ─── 2. If user already has a known type, honor it ───
  if (existingType === "pro" || existingType === "client") {
    await setUserTypeCookie(existingType);

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

  try {
    const { default: prisma } = await import("@/lib/prisma");
    await prisma.user_registry.upsert({
      where: { clerkUserId: user.id },
      update: { userType: resolvedType, lastSeenAt: new Date() },
      create: {
        clerkUserId: user.id,
        userType: resolvedType,
        isActive: true,
        onboardingComplete: false,
        displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        email: user.emailAddresses?.[0]?.emailAddress || null,
        avatarUrl: user.imageUrl || null,
      },
    });
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

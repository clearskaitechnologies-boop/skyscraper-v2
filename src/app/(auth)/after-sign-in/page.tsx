import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getUserIdentity } from "@/lib/identity";

/**
 * After-sign-in routing page
 *
 * This page runs after Clerk sign-in completes. It:
 * 1. Checks the user's identity (pro vs client)
 * 2. Sets the x-user-type cookie for middleware routing
 * 3. Redirects to the appropriate dashboard
 */
export default async function AfterSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; redirect_url?: string }>;
}) {
  const params = await searchParams;
  const mode = params?.mode;
  const pendingRedirect = params?.redirect_url;

  let user;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("[AFTER-SIGN-IN] Error getting current user:", error);
    redirect("/sign-in");
  }

  if (!user?.id) {
    // Not signed in - send back to sign-in
    redirect("/sign-in");
  }

  // Get user identity from database
  let identity;
  try {
    identity = await getUserIdentity(user.id);
  } catch (error) {
    console.error("[AFTER-SIGN-IN] Error getting identity:", error);
    // Continue with unknown type
  }

  const userType = identity?.userType || "unknown";
  console.log("[AFTER-SIGN-IN] User:", user.id, "Type:", userType, "Mode:", mode);

  // Set the cookie for middleware routing
  // Must be done before redirect
  try {
    const cookieStore = await cookies();
    cookieStore.set("x-user-type", userType, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (cookieError) {
    console.error("[AFTER-SIGN-IN] Error setting cookie:", cookieError);
    // Continue without cookie - middleware will use session claims
  }

  // Route to correct surface based on user type

  // Honor pending redirect FIRST for any user type (e.g. invite acceptance, deep links)
  // This is critical for invite flows — /trades/join?token=xxx must survive auth
  if (pendingRedirect && pendingRedirect.startsWith("/")) {
    redirect(pendingRedirect);
  }

  // Known client → portal
  if (userType === "client" || mode === "client") {
    redirect("/portal");
  }

  // Known pro → dashboard
  if (userType === "pro") {
    redirect("/dashboard");
  }

  // ═══════════════════════════════════════════════════════════════════
  // UNKNOWN / NEW USER — auto-register as client (default experience)
  //
  // Rationale: The typical new user is a homeowner arriving via Google.
  // Pros self-identify by accepting a /trades/join invite link,
  // which is handled by the pendingRedirect above. Any remaining
  // unknown user is treated as a client so they never see the legacy
  // "pick homeowner or contractor" split page.
  // ═══════════════════════════════════════════════════════════════════
  try {
    const { default: prisma } = await import("@/lib/prisma");
    await prisma.user_registry.upsert({
      where: { clerkUserId: user.id },
      update: { userType: "client", lastSeenAt: new Date() },
      create: {
        clerkUserId: user.id,
        userType: "client",
        isActive: true,
        onboardingComplete: false,
        displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        email: user.emailAddresses?.[0]?.emailAddress || null,
        avatarUrl: user.imageUrl || null,
      },
    });

    // Set cookie so middleware knows this is a client
    try {
      const cookieStore2 = await cookies();
      cookieStore2.set("x-user-type", "client", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    } catch {
      /* cookie already set above */
    }
  } catch (regError) {
    console.error("[AFTER-SIGN-IN] Error auto-registering client:", regError);
  }

  redirect("/portal");
}

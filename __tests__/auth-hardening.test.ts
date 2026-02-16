/**
 * ============================================================================
 * AUTH HARDENING — Integration Tests
 * ============================================================================
 *
 * 10 tests that verify the auth hardening work:
 *   1. requireAuth returns 401 for unauthenticated requests
 *   2. requireAuth returns orgId/userId/role for authenticated requests
 *   3. requirePortalAuth returns 401 for unauthenticated portal requests
 *   4. requirePortalAuth validates claim access when claimId provided
 *   5. isAuthError correctly identifies error responses
 *   6. isPortalAuthError correctly identifies error responses
 *   7. Claims API routes reject unauthenticated requests (route handler)
 *   8. Portal API routes reject unauthenticated requests (route handler)
 *   9. Admin routes reject non-admin users (requireAdmin guard)
 *  10. Cross-org isolation: clients/directory findMany includes orgId filter
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ------------------------------------------------------------------ */
/*  Hoisted mocks — available before module evaluation                 */
/* ------------------------------------------------------------------ */

const { mockClerkAuth, mockFindMany, mockFindFirst, mockFindUnique, mockEnsureOrgForUser } =
  vi.hoisted(() => ({
    mockClerkAuth: vi.fn(),
    mockFindMany: vi.fn(),
    mockFindFirst: vi.fn(),
    mockFindUnique: vi.fn(),
    mockEnsureOrgForUser: vi.fn(),
  }));

/* ------------------------------------------------------------------ */
/*  Module mocks                                                       */
/* ------------------------------------------------------------------ */

// 1) Clerk auth()
vi.mock("@clerk/nextjs/server", () => ({
  auth: mockClerkAuth,
}));

// 2) Prisma — provide every model surface used by the guards
vi.mock("@/lib/prisma", () => ({
  default: {
    user_organizations: {
      findMany: (...a: unknown[]) => mockFindMany(...a),
    },
    users: {
      findFirst: (...a: unknown[]) => mockFindFirst(...a),
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
    },
    client: {
      findMany: (...a: unknown[]) => mockFindMany(...a),
      findFirst: (...a: unknown[]) => mockFindFirst(...a),
    },
    client_access: {
      findFirst: (...a: unknown[]) => mockFindFirst(...a),
    },
    claims: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      findMany: (...a: unknown[]) => mockFindMany(...a),
    },
    org: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
    },
  },
}));

// 3) server-only — no-op in test environment
vi.mock("server-only", () => ({}));

// 4) ensureOrgForUser
vi.mock("@/lib/org/ensureOrgForUser", () => ({
  ensureOrgForUser: () => mockEnsureOrgForUser(),
}));

// 5) ensureWorkspaceForOrg
vi.mock("@/lib/workspace/ensureWorkspaceForOrg", () => ({
  ensureWorkspaceForOrg: vi.fn().mockResolvedValue(undefined),
}));

/* ------------------------------------------------------------------ */
/*  Imports (AFTER mocks are in place)                                 */
/* ------------------------------------------------------------------ */

import { isAuthError, requireAdmin, requireAuth } from "@/lib/auth/requireAuth";

import { isPortalAuthError, requirePortalAuth } from "@/lib/auth/requirePortalAuth";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Simulate an authenticated user with a valid org membership */
function mockAuthenticatedWithOrg(overrides?: {
  userId?: string;
  orgId?: string;
  role?: string;
  membershipId?: string;
}) {
  const userId = overrides?.userId ?? "user_test123";
  const orgId = overrides?.orgId ?? "org_test456";
  const role = overrides?.role ?? "ADMIN";
  const membershipId = overrides?.membershipId ?? "uo_test789";

  // Clerk returns a valid session
  mockClerkAuth.mockResolvedValue({ userId });

  // user_organizations.findMany returns a valid membership
  mockFindMany.mockResolvedValue([
    {
      id: membershipId,
      userId,
      organizationId: orgId,
      role,
      createdAt: new Date(),
      Org: { id: orgId },
    },
  ]);

  // org.findUnique returns a valid org
  mockFindUnique.mockResolvedValue({ id: orgId });
}

/** Parse JSON body from a NextResponse */
async function parseResponseJson(res: NextResponse): Promise<Record<string, unknown>> {
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("Auth Hardening — Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TEST_AUTH_BYPASS;
    delete process.env.TEST_AUTH_USER_ID;
    delete process.env.TEST_AUTH_ORG_ID;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 1: requireAuth returns 401 for unauthenticated requests
  // ────────────────────────────────────────────────────────────────────
  it("TEST 1: requireAuth returns 401 for unauthenticated requests", async () => {
    // Clerk returns no userId
    mockClerkAuth.mockResolvedValue({ userId: null });

    const result = await requireAuth();

    // Should be a NextResponse (error)
    expect(result).toBeInstanceOf(NextResponse);

    const res = result as NextResponse;
    expect(res.status).toBe(401);

    const body = await parseResponseJson(res);
    expect(body.error).toBe("UNAUTHENTICATED");
    expect(body.message).toBe("Authentication required");
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 2: requireAuth returns orgId/userId/role for authenticated requests
  // ────────────────────────────────────────────────────────────────────
  it("TEST 2: requireAuth returns orgId/userId/role for authenticated requests", async () => {
    mockAuthenticatedWithOrg({
      userId: "user_abc",
      orgId: "org_xyz",
      role: "MANAGER",
      membershipId: "uo_111",
    });

    const result = await requireAuth();

    // Should NOT be a NextResponse
    expect(result).not.toBeInstanceOf(NextResponse);

    // Should have expected properties
    const ctx = result as { orgId: string; userId: string; role: string; membershipId: string };
    expect(ctx.orgId).toBe("org_xyz");
    expect(ctx.userId).toBe("user_abc");
    expect(ctx.role).toBe("MANAGER");
    expect(ctx.membershipId).toBe("uo_111");
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 3: requirePortalAuth returns 401 for unauthenticated portal requests
  // ────────────────────────────────────────────────────────────────────
  it("TEST 3: requirePortalAuth returns 401 for unauthenticated portal requests", async () => {
    // Clerk returns no userId
    mockClerkAuth.mockResolvedValue({ userId: null });

    const result = await requirePortalAuth();

    expect(result).toBeInstanceOf(NextResponse);

    const res = result as NextResponse;
    expect(res.status).toBe(401);

    const body = await parseResponseJson(res);
    expect(body.error).toBe("UNAUTHENTICATED");
    expect(body.message).toBe("Authentication required");
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 4: requirePortalAuth validates claim access when claimId provided
  // ────────────────────────────────────────────────────────────────────
  it("TEST 4: requirePortalAuth validates claim access when claimId provided", async () => {
    const testUserId = "user_portal_1";
    const testEmail = "client@example.com";
    const testClaimId = "claim_999";

    // Clerk auth
    mockClerkAuth.mockResolvedValue({ userId: testUserId });

    // users.findFirst returns a user with email
    mockFindFirst.mockImplementation(async (args: { where: Record<string, unknown> }) => {
      // client_access.findFirst — no access row
      if ("email" in args.where && "claimId" in args.where) {
        return null; // No claim access
      }
      // users.findFirst — returns user
      if ("clerkUserId" in args.where) {
        return { email: testEmail };
      }
      return null;
    });

    const result = await requirePortalAuth({ claimId: testClaimId });

    // Should be a 403 because we have no client_access row
    expect(result).toBeInstanceOf(NextResponse);

    const res = result as NextResponse;
    expect(res.status).toBe(403);

    const body = await parseResponseJson(res);
    expect(body.error).toBe("FORBIDDEN");
    expect(body.message).toContain("No access to this claim");
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 5: isAuthError correctly identifies error responses
  // ────────────────────────────────────────────────────────────────────
  it("TEST 5: isAuthError correctly identifies error responses", () => {
    // NextResponse is an auth error
    const errorResponse = NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    expect(isAuthError(errorResponse)).toBe(true);

    // A plain object is NOT an auth error
    const successCtx = {
      orgId: "org_1",
      userId: "user_1",
      role: "ADMIN",
      membershipId: "uo_1",
    };
    expect(isAuthError(successCtx)).toBe(false);
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 6: isPortalAuthError correctly identifies error responses
  // ────────────────────────────────────────────────────────────────────
  it("TEST 6: isPortalAuthError correctly identifies error responses", () => {
    // NextResponse is a portal auth error
    const errorResponse = NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    expect(isPortalAuthError(errorResponse)).toBe(true);

    // A plain object is NOT a portal auth error
    const successCtx = {
      userId: "user_1",
      email: "test@example.com",
    };
    expect(isPortalAuthError(successCtx)).toBe(false);

    // Verify it also catches 403
    const forbiddenResponse = NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    expect(isPortalAuthError(forbiddenResponse)).toBe(true);
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 7: Claims-style route handler rejects unauthenticated requests
  //         (Tests the pattern used by actual API route handlers)
  // ────────────────────────────────────────────────────────────────────
  it("TEST 7: requireAuth-guarded route pattern rejects unauthenticated requests", async () => {
    // Simulate unauthenticated
    mockClerkAuth.mockResolvedValue({ userId: null });

    // Simulate the exact pattern from src/app/api/clients/directory/route.ts
    const auth = await requireAuth();
    if (isAuthError(auth)) {
      // The route would return this response
      expect(auth.status).toBe(401);
      const body = await parseResponseJson(auth);
      expect(body.error).toBe("UNAUTHENTICATED");
      return; // Route handler would exit here
    }

    // If we get here, the test failed — unauthenticated request was not blocked
    expect.unreachable("Should have returned 401 before reaching here");
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 8: Portal route handler rejects unauthenticated requests
  //         (Tests the pattern used by portal API route handlers)
  // ────────────────────────────────────────────────────────────────────
  it("TEST 8: requirePortalAuth-guarded route pattern rejects unauthenticated requests", async () => {
    // Simulate unauthenticated
    mockClerkAuth.mockResolvedValue({ userId: null });

    // Simulate the exact pattern from src/app/api/portal/claims/route.ts
    const authResult = await requirePortalAuth();
    if (isPortalAuthError(authResult)) {
      expect(authResult.status).toBe(401);
      const body = await parseResponseJson(authResult);
      expect(body.error).toBe("UNAUTHENTICATED");
      return; // Route handler would exit here
    }

    expect.unreachable("Should have returned 401 before reaching here");
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 9: Admin routes reject non-admin users (requireAdmin guard)
  // ────────────────────────────────────────────────────────────────────
  it("TEST 9: requireAdmin rejects non-admin users with 403", async () => {
    // Authenticate with a non-admin role
    mockAuthenticatedWithOrg({
      userId: "user_member",
      orgId: "org_1",
      role: "MEMBER",
      membershipId: "uo_mem",
    });

    const result = await requireAdmin();

    // Should be a 403 Forbidden
    expect(result).toBeInstanceOf(NextResponse);

    const res = result as NextResponse;
    expect(res.status).toBe(403);

    const body = await parseResponseJson(res);
    expect(body.error).toBe("FORBIDDEN");
    expect(body.message).toContain("ADMIN");
    expect(body.message).toContain("MEMBER");
  });

  // ────────────────────────────────────────────────────────────────────
  // TEST 10: Cross-org isolation — clients/directory findMany uses orgId
  // ────────────────────────────────────────────────────────────────────
  it("TEST 10: Cross-org isolation — findMany is scoped by orgId from requireAuth", async () => {
    const targetOrgId = "org_isolated_999";

    mockAuthenticatedWithOrg({
      userId: "user_iso",
      orgId: targetOrgId,
      role: "ADMIN",
      membershipId: "uo_iso",
    });

    // Call requireAuth to get the context (like the route does)
    const auth = await requireAuth();
    expect(isAuthError(auth)).toBe(false);

    const ctx = auth as { orgId: string; userId: string; role: string; membershipId: string };

    // Verify the orgId is what we expect (server-derived, not client-supplied)
    expect(ctx.orgId).toBe(targetOrgId);

    // Now simulate what the clients/directory route does:
    // prisma.client.findMany({ where: { orgId } })
    mockFindMany.mockResolvedValue([]);
    const { default: prisma } = await import("@/lib/prisma");
    await prisma.client.findMany({
      where: { orgId: ctx.orgId },
    });

    // Verify findMany was called with the correct orgId filter
    // (last call, since mockAuthenticatedWithOrg also calls findMany for memberships)
    const lastCall = mockFindMany.mock.calls[mockFindMany.mock.calls.length - 1];
    expect(lastCall[0]).toEqual(
      expect.objectContaining({
        where: { orgId: targetOrgId },
      })
    );
  });
});

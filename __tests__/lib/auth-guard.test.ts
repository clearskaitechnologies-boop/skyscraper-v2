/**
 * TEST #132 — Auth guard utility: safeOrgContext()
 *
 * Validates that safeOrgContext returns the correct status objects
 * when Clerk auth is absent vs present.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks — vi.hoisted ensures variables are available in mock factory */
/* ------------------------------------------------------------------ */

const { mockAuth, mockFindMany, mockFindUnique, mockEnsureOrgForUser } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
  mockEnsureOrgForUser: vi.fn(),
}));

// 1) Clerk auth()
vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
}));

// 2) Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    user_organizations: { findMany: (...a: unknown[]) => mockFindMany(...a) },
    users: { findUnique: (...a: unknown[]) => mockFindUnique(...a) },
    org: { findUnique: (...a: unknown[]) => mockFindUnique(...a) },
  },
}));

// 3) ensureOrgForUser (auto-onboarding)
vi.mock("@/lib/org/ensureOrgForUser", () => ({
  ensureOrgForUser: () => mockEnsureOrgForUser(),
}));

// 4) ensureWorkspaceForOrg (workspace setup, non-blocking)
vi.mock("@/lib/workspace/ensureWorkspaceForOrg", () => ({
  ensureWorkspaceForOrg: vi.fn().mockResolvedValue(undefined),
}));

/* ------------------------------------------------------------------ */
/*  Import the module under test AFTER mocks are in place              */
/* ------------------------------------------------------------------ */
import { safeOrgContext } from "@/lib/safeOrgContext";

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */
describe("safeOrgContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env vars that might affect behaviour
    delete process.env.TEST_AUTH_BYPASS;
    delete process.env.TEST_AUTH_USER_ID;
    delete process.env.TEST_AUTH_ORG_ID;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns unauthenticated when auth() yields no userId", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    const ctx = await safeOrgContext();

    expect(ctx.status).toBe("unauthenticated");
    expect(ctx.userId).toBeNull();
    expect(ctx.orgId).toBeNull();
    expect(ctx.ok).toBe(false);
    expect(ctx.reason).toBe("no-user");
  });

  it("returns unauthenticated when auth() throws", async () => {
    mockAuth.mockRejectedValue(new Error("clerk unavailable"));

    const ctx = await safeOrgContext();

    expect(ctx.status).toBe("unauthenticated");
    expect(ctx.ok).toBe(false);
  });

  it("returns ok with orgId when user has a valid membership", async () => {
    mockAuth.mockResolvedValue({ userId: "user_123" });

    mockFindMany.mockResolvedValue([
      {
        id: "uo_1",
        userId: "user_123",
        organizationId: "org_abc",
        role: "owner",
        createdAt: new Date(),
      },
    ]);

    // org.findUnique returns a valid org row
    mockFindUnique.mockResolvedValue({ id: "org_abc" });

    const ctx = await safeOrgContext();

    expect(ctx.status).toBe("ok");
    expect(ctx.ok).toBe(true);
    expect(ctx.userId).toBe("user_123");
    expect(ctx.orgId).toBe("org_abc");
    expect(ctx.role).toBe("owner");
    expect(ctx.organizationId).toBe("org_abc");
  });

  it("returns noMembership when no memberships exist and auto-onboard fails", async () => {
    mockAuth.mockResolvedValue({ userId: "user_orphan" });
    mockFindMany.mockResolvedValue([]);
    // No legacy user either
    mockFindUnique.mockResolvedValue(null);
    // Auto-onboard returns null
    mockEnsureOrgForUser.mockResolvedValue(null);

    const ctx = await safeOrgContext();

    expect(ctx.status).toBe("noMembership");
    expect(ctx.ok).toBe(false);
    expect(ctx.orgId).toBeNull();
  });

  it("honours TEST_AUTH_BYPASS env for synthetic test context", async () => {
    process.env.TEST_AUTH_BYPASS = "1";
    process.env.TEST_AUTH_USER_ID = "test_user";
    process.env.TEST_AUTH_ORG_ID = "test_org";

    mockAuth.mockResolvedValue({ userId: "test_user" });

    const ctx = await safeOrgContext();

    expect(ctx.status).toBe("ok");
    expect(ctx.userId).toBe("test_user");
    expect(ctx.orgId).toBe("test_org");
    expect(ctx.role).toBe("owner");
  });
});

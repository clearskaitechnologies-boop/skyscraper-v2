/**
 * TEST #136 — Middleware routing & redirect logic
 *
 * Tests the core routing decisions by mocking Clerk and NextResponse,
 * then importing the middleware and invoking the captured handler
 * with synthetic request objects.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mock state variables shared across all tests                       */
/* ------------------------------------------------------------------ */

const mockProtect = vi.fn();
const mockAuthReturn = { userId: null as string | null, sessionClaims: null as any };
let capturedHandler: ((auth: any, req: any) => any) | null = null;

/* ------------------------------------------------------------------ */
/*  Top-level vi.mock declarations (hoisted automatically)             */
/* ------------------------------------------------------------------ */

// Shared auth function — reads from mockAuthReturn so tests can change it
function authFn() {
  return { ...mockAuthReturn, protect: mockProtect };
}

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: (handler: any) => {
    capturedHandler = handler;
    return async (req: any) => handler(authFn, req);
  },
  createRouteMatcher: (patterns: string[]) => {
    return (req: any) => {
      const pathname = req.nextUrl?.pathname || "";
      return patterns.some((p: string) => {
        const clean = p.replace(/\(\.?\*?\)/g, "");
        // Exact "/" should only match exactly "/", not act as prefix for everything
        if (clean === "/") return pathname === "/";
        return pathname === clean || pathname.startsWith(clean + "/") || pathname.startsWith(clean);
      });
    };
  },
}));

const mockRedirect = vi.fn().mockImplementation((url: any) => ({
  status: 308,
  headers: new Headers({ location: url.toString() }),
}));
const mockJsonFn = vi.fn().mockImplementation((body: any, init: any) => ({
  status: init?.status || 200,
  json: async () => body,
  headers: new Headers(),
}));
const mockNext = vi.fn().mockImplementation(() => ({
  status: 200,
  headers: new Headers(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: mockRedirect,
    json: mockJsonFn,
    next: mockNext,
  },
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function makeReq(path: string, opts?: { userType?: string }) {
  const url = new URL(`https://example.com${path}`);
  return {
    url: url.toString(),
    nextUrl: { pathname: path, search: "", searchParams: url.searchParams },
    headers: new Headers({ host: "example.com" }),
    cookies: {
      get: (name: string) => {
        if (name === "x-user-type" && opts?.userType) return { value: opts.userType };
        return undefined;
      },
    },
    method: "GET",
  };
}

/* ------------------------------------------------------------------ */
/*  Import middleware once (mocks are already installed)                */
/* ------------------------------------------------------------------ */
await import("../../middleware");

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */
describe("middleware.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthReturn.userId = null;
    mockAuthReturn.sessionClaims = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("captures the middleware handler from clerkMiddleware", () => {
    expect(capturedHandler).toBeTypeOf("function");
  });

  // --- Public paths ---

  it("allows /sign-in through as public (no redirect)", async () => {
    const req = makeReq("/sign-in");
    const res = await capturedHandler!(authFn as any, req);

    expect(res).toBeDefined();
    expect(mockProtect).not.toHaveBeenCalled();
  });

  it("allows /api/health through as public", async () => {
    const req = makeReq("/api/health");
    const res = await capturedHandler!(authFn as any, req);

    expect(res).toBeDefined();
    expect(mockProtect).not.toHaveBeenCalled();
  });

  it("fast-paths /_next/static assets without any auth check", async () => {
    const req = makeReq("/_next/static/chunk.js");
    const res = await capturedHandler!(authFn as any, req);

    expect(res).toBeDefined();
    expect(res.headers.get("x-auth-mode")).toBe("public");
    expect(mockProtect).not.toHaveBeenCalled();
  });

  it("fast-paths /favicon.ico", async () => {
    const req = makeReq("/favicon.ico");
    const res = await capturedHandler!(authFn as any, req);

    expect(res).toBeDefined();
    expect(res.headers.get("x-auth-mode")).toBe("public");
  });

  // --- Protected API routes ---

  it("returns JSON 401 for unauthenticated API request", async () => {
    mockAuthReturn.userId = null;
    const req = makeReq("/api/claims/list");

    await capturedHandler!(authFn as any, req);

    expect(mockJsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ error: "unauthorized" }),
      expect.objectContaining({ status: 401 })
    );
  });

  it("passes authenticated API requests through", async () => {
    mockAuthReturn.userId = "user_123";
    const req = makeReq("/api/settings/organization");

    const res = await capturedHandler!(authFn as any, req);

    expect(res).toBeDefined();
    // Should NOT have returned 401
    expect(mockJsonFn).not.toHaveBeenCalledWith(
      expect.objectContaining({ error: "unauthorized" }),
      expect.anything()
    );
  });

  // --- Protected app routes ---

  it("calls auth().protect() for unauthenticated app routes like /dashboard", async () => {
    mockAuthReturn.userId = null;
    const req = makeReq("/dashboard");

    await capturedHandler!(authFn as any, req);

    expect(mockProtect).toHaveBeenCalled();
  });

  // --- Cross-surface routing ---

  it("redirects client users away from Pro routes to /portal", async () => {
    mockAuthReturn.userId = "user_client";
    mockAuthReturn.sessionClaims = { publicMetadata: { userType: "client" } };
    const req = makeReq("/dashboard", { userType: "client" });

    await capturedHandler!(authFn as any, req);

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/portal" }));
  });

  it("redirects pro users away from Client routes to /dashboard", async () => {
    mockAuthReturn.userId = "user_pro";
    mockAuthReturn.sessionClaims = { publicMetadata: { userType: "pro" } };
    const req = makeReq("/portal", { userType: "pro" });

    await capturedHandler!(authFn as any, req);

    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/dashboard" }));
  });

  // --- Route type headers ---

  it("sets x-route-type header to 'pro' for pro routes", async () => {
    mockAuthReturn.userId = "user_123";
    const req = makeReq("/claims");

    const res = await capturedHandler!(authFn as any, req);

    expect(res.headers.get("x-route-type")).toBe("pro");
  });
});

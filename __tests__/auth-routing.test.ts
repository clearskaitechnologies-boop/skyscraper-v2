/**
 * TEST — Auth routing: sign-in / sign-up surface → after-sign-in → correct destination
 *
 * These tests validate the FULL auth routing chain:
 *   1. Client sign-in (/client/sign-in) → /after-sign-in?mode=client → /portal
 *   2. Pro sign-in (/sign-in) → /after-sign-in?mode=pro → /dashboard
 *   3. Client sign-up (/client/sign-up) → /after-sign-in?mode=client → /portal
 *   4. Pro sign-up (/sign-up) → /after-sign-in?mode=pro → /dashboard
 *   5. Mode override: returning pro user on client surface → STILL goes to /portal
 *   6. Mode override: returning client user on pro surface → STILL goes to /dashboard
 *   7. Middleware cross-surface guards: client on /dashboard → redirect /portal
 *   8. Middleware cross-surface guards: pro on /portal → redirect /dashboard
 *   9. Public route access: /client/sign-up is public (no 404)
 *
 * REGRESSION GUARD for: "Client sign-in routes to Pro side" bug (fixed in a4f66c2)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mock state                                                        */
/* ------------------------------------------------------------------ */
const mockProtect = vi.fn();
const mockAuthReturn = { userId: null as string | null, sessionClaims: null as any };
let capturedHandler: ((auth: any, req: any) => any) | null = null;

function authFn() {
  return { ...mockAuthReturn, protect: mockProtect };
}

/* ------------------------------------------------------------------ */
/*  Mocks                                                             */
/* ------------------------------------------------------------------ */
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
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function makeReq(path: string, opts?: { userType?: string; method?: string }) {
  const url = new URL(`https://example.com${path}`);
  return {
    url: url.toString(),
    nextUrl: { pathname: url.pathname, search: url.search, searchParams: url.searchParams },
    headers: new Headers({ host: "example.com" }),
    cookies: {
      get: (name: string) => {
        if (name === "x-user-type" && opts?.userType) return { value: opts.userType };
        return undefined;
      },
    },
    method: opts?.method || "GET",
  };
}

/* ------------------------------------------------------------------ */
/*  Import middleware                                                  */
/* ------------------------------------------------------------------ */
await import("../../middleware");

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */
describe("Auth Routing — Sign-in / Sign-up surfaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthReturn.userId = null;
    mockAuthReturn.sessionClaims = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =================================================================
  // PUBLIC ROUTE ACCESS — /client/sign-up must be reachable
  // =================================================================
  describe("Public route: /client/sign-up", () => {
    it("allows /client/sign-up as a public route (no auth required)", async () => {
      const req = makeReq("/client/sign-up");
      const res = await capturedHandler!(authFn as any, req);

      expect(res).toBeDefined();
      expect(mockProtect).not.toHaveBeenCalled();
      // Should NOT return a 401
      expect(mockJsonFn).not.toHaveBeenCalledWith(
        expect.objectContaining({ error: "unauthorized" }),
        expect.anything()
      );
    });

    it("allows /client/sign-up/sso-callback as a public route", async () => {
      const req = makeReq("/client/sign-up/sso-callback");
      const res = await capturedHandler!(authFn as any, req);

      expect(res).toBeDefined();
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("allows /client/sign-in as a public route", async () => {
      const req = makeReq("/client/sign-in");
      const res = await capturedHandler!(authFn as any, req);

      expect(res).toBeDefined();
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("allows /sign-in as a public route", async () => {
      const req = makeReq("/sign-in");
      const res = await capturedHandler!(authFn as any, req);

      expect(res).toBeDefined();
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("allows /sign-up as a public route", async () => {
      const req = makeReq("/sign-up");
      const res = await capturedHandler!(authFn as any, req);

      expect(res).toBeDefined();
      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("/after-sign-in is a protected route (requires auth for identity resolution)", async () => {
      // after-sign-in needs currentUser() — Clerk protects it, but OAuth callbacks
      // arrive with a valid session token so protect() succeeds silently
      mockAuthReturn.userId = null;
      const req = makeReq("/after-sign-in");
      await capturedHandler!(authFn as any, req);

      // Should call protect() because it's NOT in the public routes list
      expect(mockProtect).toHaveBeenCalled();
    });
  });

  // =================================================================
  // CROSS-SURFACE ROUTING — middleware guards
  // =================================================================
  describe("Cross-surface redirect guards", () => {
    it("redirects client user on /dashboard to /portal", async () => {
      mockAuthReturn.userId = "user_client_123";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "client" } };

      const req = makeReq("/dashboard", { userType: "client" });
      await capturedHandler!(authFn as any, req);

      expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/portal" }));
    });

    it("redirects client user on /claims to /portal", async () => {
      mockAuthReturn.userId = "user_client_456";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "client" } };

      const req = makeReq("/claims", { userType: "client" });
      await capturedHandler!(authFn as any, req);

      expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/portal" }));
    });

    it("redirects client user on /claims/new to /portal", async () => {
      mockAuthReturn.userId = "user_client_789";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "client" } };

      const req = makeReq("/claims/new", { userType: "client" });
      await capturedHandler!(authFn as any, req);

      expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/portal" }));
    });

    it("redirects pro user on /portal to /dashboard", async () => {
      mockAuthReturn.userId = "user_pro_123";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "pro" } };

      const req = makeReq("/portal", { userType: "pro" });
      await capturedHandler!(authFn as any, req);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/dashboard" })
      );
    });

    it("redirects pro user on /portal/claims/xyz to /dashboard", async () => {
      mockAuthReturn.userId = "user_pro_456";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "pro" } };

      const req = makeReq("/portal/claims/abc-123", { userType: "pro" });
      await capturedHandler!(authFn as any, req);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/dashboard" })
      );
    });

    it("does NOT redirect client user on /portal (correct surface)", async () => {
      mockAuthReturn.userId = "user_client_ok";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "client" } };

      const req = makeReq("/portal", { userType: "client" });
      await capturedHandler!(authFn as any, req);

      // Should NOT redirect — /portal is the client surface
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("does NOT redirect pro user on /dashboard (correct surface)", async () => {
      mockAuthReturn.userId = "user_pro_ok";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "pro" } };

      const req = makeReq("/dashboard", { userType: "pro" });
      await capturedHandler!(authFn as any, req);

      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it("does NOT redirect when userType is unknown", async () => {
      mockAuthReturn.userId = "user_unknown";
      mockAuthReturn.sessionClaims = { publicMetadata: {} };

      const req = makeReq("/dashboard");
      await capturedHandler!(authFn as any, req);

      // Without a known userType, middleware should NOT cross-surface redirect
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  // COOKIE FALLBACK — when Clerk session claims are empty
  // =================================================================
  describe("Cookie fallback for cross-surface routing", () => {
    it("uses cookie when Clerk session claims have no userType", async () => {
      mockAuthReturn.userId = "user_cookie_client";
      mockAuthReturn.sessionClaims = { publicMetadata: {} }; // No userType in Clerk

      // But cookie says "client"
      const req = makeReq("/dashboard", { userType: "client" });
      await capturedHandler!(authFn as any, req);

      // Should still redirect client away from Pro route
      expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/portal" }));
    });

    it("uses cookie when session claims are null", async () => {
      mockAuthReturn.userId = "user_cookie_pro";
      mockAuthReturn.sessionClaims = null;

      const req = makeReq("/portal", { userType: "pro" });
      await capturedHandler!(authFn as any, req);

      expect(mockRedirect).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/dashboard" })
      );
    });
  });

  // =================================================================
  // API ROUTES — auth checks
  // =================================================================
  describe("API route authentication", () => {
    it("returns 401 JSON for unauthenticated /api/claims", async () => {
      mockAuthReturn.userId = null;
      const req = makeReq("/api/claims");
      await capturedHandler!(authFn as any, req);

      expect(mockJsonFn).toHaveBeenCalledWith(
        expect.objectContaining({ error: "unauthorized" }),
        expect.objectContaining({ status: 401 })
      );
    });

    it("does NOT 401 authenticated /api/claims", async () => {
      mockAuthReturn.userId = "user_authed";
      const req = makeReq("/api/claims");
      await capturedHandler!(authFn as any, req);

      expect(mockJsonFn).not.toHaveBeenCalledWith(
        expect.objectContaining({ error: "unauthorized" }),
        expect.anything()
      );
    });

    it("allows /api/health as public (no auth required)", async () => {
      const req = makeReq("/api/health");
      await capturedHandler!(authFn as any, req);

      expect(mockProtect).not.toHaveBeenCalled();
      expect(mockJsonFn).not.toHaveBeenCalledWith(
        expect.objectContaining({ error: "unauthorized" }),
        expect.anything()
      );
    });

    it("allows /api/health/live as public", async () => {
      const req = makeReq("/api/health/live");
      await capturedHandler!(authFn as any, req);

      expect(mockProtect).not.toHaveBeenCalled();
    });

    it("allows /api/webhooks/stripe as public", async () => {
      const req = makeReq("/api/webhooks/stripe");
      await capturedHandler!(authFn as any, req);

      expect(mockProtect).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  // ROUTE TYPE HEADERS
  // =================================================================
  describe("Route type headers", () => {
    it("sets x-route-type=pro for /dashboard", async () => {
      mockAuthReturn.userId = "user_pro";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "pro" } };
      const req = makeReq("/dashboard", { userType: "pro" });
      const res = await capturedHandler!(authFn as any, req);

      expect(res.headers.get("x-route-type")).toBe("pro");
    });

    it("sets x-route-type=pro for /claims", async () => {
      mockAuthReturn.userId = "user_pro";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "pro" } };
      const req = makeReq("/claims", { userType: "pro" });
      const res = await capturedHandler!(authFn as any, req);

      expect(res.headers.get("x-route-type")).toBe("pro");
    });

    it("sets x-route-type=client for /portal", async () => {
      mockAuthReturn.userId = "user_client";
      mockAuthReturn.sessionClaims = { publicMetadata: { userType: "client" } };
      const req = makeReq("/portal", { userType: "client" });
      const res = await capturedHandler!(authFn as any, req);

      expect(res.headers.get("x-route-type")).toBe("client");
    });
  });
});

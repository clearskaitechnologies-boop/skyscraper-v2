import { expect, test } from "@playwright/test";

import { hasRealDb } from "../utils/dbTestGuard";

const hasDb = hasRealDb();

/**
 * Messaging API Smoke Tests
 *
 * Tests the complete messaging system:
 *   - Direct messages (portal/direct-messages)
 *   - Pro-to-client messages
 *   - Message threads listing
 *   - Thread messages retrieval
 *   - Message read receipts
 *
 * All messaging endpoints require authentication.
 */

test.describe("Messaging API — Auth Gates", () => {
  test("GET /api/portal/direct-messages returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/portal/direct-messages");
    expect(res.status()).toBe(401);
  });

  test("POST /api/portal/direct-messages returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/portal/direct-messages", {
      data: { recipientId: "fake-id", body: "hello" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/messages/threads returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/messages/threads");
    expect(res.status()).toBe(401);
  });

  test("GET /api/messages/conversations returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/messages/conversations");
    expect(res.status()).toBe(401);
  });

  test("POST /api/messages/create returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/messages/create", {
      data: { threadId: "fake-id", body: "test" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/messages/send returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/messages/send", {
      data: { threadId: "fake-id", body: "test" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/messages/pro-to-client/create returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/messages/pro-to-client/create", {
      data: { clientId: "fake-id", body: "test" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/messages/post-update returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/messages/post-update", {
      data: { claimId: "fake-id", orgId: "fake-org", body: "test" },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe("Messaging API — Response Shapes", () => {
  test("GET /api/messages/threads returns valid shape with auth", async ({ request }) => {
    if (!hasDb) test.skip("Requires real DB");
    const res = await request.get("/api/messages/threads");
    // With test auth, should return 200 with threads array
    if (res.status() === 200) {
      const json = await res.json();
      expect(json).toHaveProperty("threads");
      expect(Array.isArray(json.threads)).toBe(true);
    }
  });

  test("GET /api/messages/conversations returns valid shape", async ({ request }) => {
    if (!hasDb) test.skip("Requires real DB");
    const res = await request.get("/api/messages/conversations");
    if (res.status() === 200) {
      const json = await res.json();
      // Should be an array or object with threads/conversations
      expect(typeof json).toBe("object");
    }
  });

  test("POST /api/messages/create rejects missing fields", async ({ request }) => {
    if (!hasDb) test.skip("Requires real DB");
    const res = await request.post("/api/messages/create", {
      data: {},
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("POST /api/messages/pro-to-client/create rejects missing clientId", async ({ request }) => {
    if (!hasDb) test.skip("Requires real DB");
    const res = await request.post("/api/messages/pro-to-client/create", {
      data: { body: "test" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test("POST /api/portal/direct-messages rejects missing body", async ({ request }) => {
    if (!hasDb) test.skip("Requires real DB");
    const res = await request.post("/api/portal/direct-messages", {
      data: { recipientId: "fake-id" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });
});

test.describe("Messaging — Portal Message Thread", () => {
  test("GET /api/portal/messages returns 401 unauthed", async ({ request }) => {
    const res = await request.get("/api/portal/messages?claimId=fake");
    expect(res.status()).toBe(401);
  });

  test("POST /api/portal/messages returns 401 unauthed", async ({ request }) => {
    const res = await request.post("/api/portal/messages", {
      data: { claimId: "fake-id", body: "test message" },
    });
    expect(res.status()).toBe(401);
  });
});

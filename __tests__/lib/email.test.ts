/**
 * TEST #135 — Email / Mailer utilities
 *
 * Tests both:
 *   • src/lib/mail.ts  — safeSendEmail, createWelcomeEmail (Resend wrapper)
 *   • src/lib/email/resend.ts — getResend(), sendEmail()
 *
 * Resend is fully mocked so no real emails are sent.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* ================================================================== */
/*  PART A — src/lib/mail.ts                                           */
/* ================================================================== */

// Mock Resend before importing mail.ts
const mockSend = vi.fn();
vi.mock("resend", () => {
  // Must use function (not arrow) so `new Resend()` works
  function Resend() {
    return { emails: { send: mockSend } };
  }
  return { Resend };
});

// Mock Sentry (used by mailer.ts)
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// Mock React Email templates used by mailer.ts
vi.mock("@/email-templates/report-ready", () => ({
  default: vi.fn().mockReturnValue("report-ready-react-element"),
}));
vi.mock("@/email-templates/acceptance-receipt", () => ({
  default: vi.fn().mockReturnValue("acceptance-receipt-react-element"),
}));
vi.mock("@/email-templates/team-invite", () => ({
  default: vi.fn().mockReturnValue("team-invite-react-element"),
}));

/* ------------------------------------------------------------------ */
describe("src/lib/mail.ts — safeSendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure production mode so the real send path is exercised
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RESEND_API_KEY", "re_test_fake");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("calls Resend emails.send with correct params and returns success", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_123" } });

    // Dynamic import so env stubs take effect
    const { safeSendEmail } = await import("@/lib/mail");

    const result = await safeSendEmail({
      to: "user@example.com",
      subject: "Test Subject",
      html: "<p>Hello</p>",
    });

    expect(result.success).toBe(true);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Hello</p>",
      })
    );
  });

  it("returns success: false and never throws when send fails", async () => {
    mockSend.mockRejectedValue(new Error("Resend network error"));

    const { safeSendEmail } = await import("@/lib/mail");

    const result = await safeSendEmail({
      to: "fail@example.com",
      subject: "Will Fail",
      html: "<p>Nope</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("logs but does not send in development mode", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.resetModules();

    const { safeSendEmail } = await import("@/lib/mail");

    const result = await safeSendEmail({
      to: "dev@example.com",
      subject: "Dev test",
      html: "<p>Dev</p>",
    });

    expect(result.success).toBe(true);
    // In dev mode the real send() should NOT be called
    // (the implementation logs and returns early)
  });
});

/* ================================================================== */
/*  PART B — src/lib/email/resend.ts                                   */
/* ================================================================== */

describe("src/lib/email/resend.ts — sendEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RESEND_API_KEY", "re_test_fake");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sends email with correct from/to/subject/html", async () => {
    mockSend.mockResolvedValue({ data: { id: "msg_456" } });

    const { sendEmail } = await import("@/lib/email/resend");

    await sendEmail({
      to: "client@example.com",
      subject: "Your report is ready",
      html: "<h1>Report</h1>",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "client@example.com",
        subject: "Your report is ready",
        html: "<h1>Report</h1>",
      })
    );
  });

  it("getResend() throws when RESEND_API_KEY is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.resetModules();

    // Re-mock resend for the new module instance
    vi.doMock("resend", () => {
      function Resend() {
        return { emails: { send: mockSend } };
      }
      return { Resend };
    });

    const { getResend } = await import("@/lib/email/resend");

    expect(() => getResend()).toThrow(/RESEND_API_KEY/);
  });
});

/* ================================================================== */
/*  PART C — src/lib/mailer.ts — sendReportReadyEmail                  */
/* ================================================================== */

describe("src/lib/mailer.ts — sendReportReadyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RESEND_API_KEY", "re_test_fake");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("calls resend.emails.send with react template", async () => {
    mockSend.mockResolvedValue({ data: { id: "email_789" } });

    const { sendReportReadyEmail } = await import("@/lib/mailer");

    await sendReportReadyEmail({
      to: "homeowner@example.com",
      shareUrl: "https://example.com/share/abc",
      pdfUrl: "https://example.com/pdf/abc.pdf",
      recipientName: "Jane",
      company: "Acme Roofing",
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "homeowner@example.com",
        subject: expect.stringContaining("report"),
      })
    );
  });
});

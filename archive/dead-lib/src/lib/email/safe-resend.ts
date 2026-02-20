/**
 * Build-safe Resend client wrapper
 *
 * During Next.js builds, environment variables may not be fully configured.
 * This module provides a null-safe way to access the Resend client.
 */

import { Resend } from "resend";

let _client: Resend | null = null;

export function getResendClient(): Resend | null {
  // Skip initialization during build/static generation
  if (process.env.VERCEL_BUILD_ID && !process.env.RESEND_API_KEY) {
    return null;
  }

  if (!_client && process.env.RESEND_API_KEY) {
    try {
      _client = new Resend(process.env.RESEND_API_KEY);
    } catch (error) {
      console.warn("[Resend] Failed to initialize client:", error);
      return null;
    }
  }

  return _client;
}

/**
 * Safe wrapper for sending emails - returns null/error instead of throwing
 */
export async function sendEmailSafe(params: {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const client = getResendClient();

  if (!client) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[EMAIL-DEV]", params);
    }
    return { data: null, error: "Resend not configured" };
  }

  try {
    return await client.emails.send(params);
  } catch (error) {
    console.error("[EMAIL-ERROR]", error);
    return { data: null, error };
  }
}

/**
 * Client Portal Authentication
 *
 * Magic link authentication for homeowners/clients
 * Passwordless secure access to their claims and jobs
 */

import { logActivity } from "@/lib/activity/activityFeed";
import { APP_URL } from "@/lib/env";
import prisma from "@/lib/prisma";

export interface MagicLinkToken {
  token: string;
  clientId: string;
  email: string;
  expiresAt: Date;
}

export interface ClientSession {
  sessionId: string;
  clientId: string;
  email: string;
  orgId: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Generate magic link for client
 */
export async function generateMagicLink(
  email: string,
  orgId: string
): Promise<{ token: string; link: string }> {
  try {
    // Find or create client
    const client = await prisma.homeowner_intake.findFirst({
      where: { email, orgId },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // Generate secure token
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Store token
    await prisma.magicLinkTokens
      .create({
        data: {
          token,
          clientId: client.id,
          email,
          orgId,
          expiresAt,
        },
      })
      .catch(() => {
        throw new Error("Failed to create magic link");
      });

    // Generate link
    const link = `${APP_URL}/client-portal/auth?token=${token}`;

    // Log activity
    await logActivity(orgId, {
      type: "CREATED",
      resourceType: "CLIENT",
      resourceId: client.id,
      action: "Magic Link Generated",
      description: `Magic link sent to ${email}`,
    });

    return { token, link };
  } catch (error) {
    console.error("Magic link generation failed:", error);
    throw error;
  }
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(token: string): Promise<ClientSession | null> {
  try {
    const magicLink = await prisma.magicLinkTokens.findUnique({
      where: { token },
      include: {
        client: true,
      },
    });

    if (!magicLink) {
      return null;
    }

    // Check expiry
    if (new Date() > magicLink.expiresAt) {
      await prisma.magicLinkTokens.delete({
        where: { token },
      });
      return null;
    }

    // Create session
    const sessionId = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day session

    await prisma.clientSessions
      .create({
        data: {
          sessionId,
          clientId: magicLink.clientId,
          email: magicLink.email,
          orgId: magicLink.orgId,
          expiresAt,
        },
      })
      .catch(() => {});

    // Delete used token
    await prisma.magicLinkTokens.delete({
      where: { token },
    });

    // Log activity
    await logActivity(magicLink.orgId, {
      type: "CREATED",
      resourceType: "CLIENT",
      resourceId: magicLink.clientId,
      action: "Client Logged In",
      description: `Client accessed portal via magic link`,
    });

    return {
      sessionId,
      clientId: magicLink.clientId,
      email: magicLink.email,
      orgId: magicLink.orgId,
      createdAt: new Date(),
      expiresAt,
    };
  } catch (error) {
    console.error("Magic link verification failed:", error);
    return null;
  }
}

/**
 * Verify client session
 */
export async function verifyClientSession(sessionId: string): Promise<ClientSession | null> {
  try {
    const session = await prisma.clientSessions.findUnique({
      where: { sessionId },
    });

    if (!session) {
      return null;
    }

    // Check expiry
    if (new Date() > session.expiresAt) {
      await prisma.clientSessions.delete({
        where: { sessionId },
      });
      return null;
    }

    // Update last accessed
    await prisma.clientSessions.update({
      where: { sessionId },
      data: {
        lastAccessed: new Date(),
      },
    });

    return session as ClientSession;
  } catch {
    return null;
  }
}

/**
 * Logout client session
 */
export async function logoutClientSession(sessionId: string): Promise<void> {
  try {
    await prisma.clientSessions.delete({
      where: { sessionId },
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

/**
 * Send magic link email
 */
export async function sendMagicLinkEmail(
  email: string,
  link: string,
  orgId: string
): Promise<boolean> {
  try {
    // Get org info for branding
    const org = await prisma.org.findUnique({
      where: { id: orgId },
    });

    // TODO: Implement email sending (Resend/SendGrid)
    console.log(`
📧 Magic Link Email
To: ${email}
From: ${org?.name || "SkaiScraper"}

Access your client portal:
${link}

This link will expire in 24 hours.
    `);

    return true;
  } catch (error) {
    console.error("Magic link email failed:", error);
    return false;
  }
}

/**
 * Cleanup expired tokens and sessions
 */
export async function cleanupExpiredAuth(): Promise<{
  tokensDeleted: number;
  sessionsDeleted: number;
}> {
  try {
    const now = new Date();

    const [tokens, sessions] = await Promise.all([
      prisma.magicLinkTokens.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      }),
      prisma.clientSessions.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      }),
    ]);

    return {
      tokensDeleted: tokens.count,
      sessionsDeleted: sessions.count,
    };
  } catch {
    return {
      tokensDeleted: 0,
      sessionsDeleted: 0,
    };
  }
}

/**
 * Generate cryptographically secure token
 */
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js
    const nodeCrypto = require("crypto");
    return nodeCrypto.randomBytes(32).toString("hex");
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Get client's active sessions
 */
export async function getClientSessions(clientId: string): Promise<ClientSession[]> {
  try {
    return (await prisma.clientSessions.findMany({
      where: {
        clientId,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as ClientSession[];
  } catch {
    return [];
  }
}

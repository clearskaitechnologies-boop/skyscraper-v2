/**
 * Email Subscription API
 * Handles email newsletter subscriptions with double opt-in verification
 */

import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate verification token
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * POST /api/subscribe
 * Subscribe to email newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, categories, source, sourceUrl } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.email_subscribers.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        return NextResponse.json(
          { message: "You're already subscribed!", alreadySubscribed: true },
          { status: 200 }
        );
      }

      // Reactivate if previously unsubscribed
      if (existing.status === "UNSUBSCRIBED") {
        await prisma.email_subscribers.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            unsubscribedAt: null,
            subscribedAt: new Date(),
            firstName: firstName || existing.firstName,
            lastName: lastName || existing.lastName,
            categories: categories || existing.categories,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Welcome back! You've been resubscribed.",
          resubscribed: true,
        });
      }
    }

    // Get optional user context
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch {
      // Not logged in - that's fine
    }

    // Get IP and user agent for GDPR compliance
    const forwarded = request.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");

    // Create subscriber
    const verificationToken = generateToken();
    const subscriber = await prisma.email_subscribers.create({
      data: {
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        firstName: firstName || null,
        lastName: lastName || null,
        source: source || "website",
        sourceUrl: sourceUrl || null,
        userId: userId,
        categories: categories || ["updates", "newsletters"],
        verificationToken,
        verified: false,
        status: "PENDING",
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        consentGiven: true,
        consentDetails: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: source || "website",
          categories: categories || ["updates", "newsletters"],
        }),
      },
    });

    // Send verification email
    if (resend) {
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://skaiscrape.com"}/api/subscribe/verify?token=${verificationToken}&email=${encodeURIComponent(email.toLowerCase())}`;

      await resend.emails.send({
        from: "SkaiScraper <newsletter@skaiscrape.com>",
        to: email.toLowerCase(),
        subject: "Verify your email subscription",
        html: `
          <h2>Confirm Your Subscription</h2>
          <p>Hi${firstName ? ` ${firstName}` : ""},</p>
          <p>Thank you for subscribing to the SkaiScraper newsletter!</p>
          <p>Please click the button below to verify your email address:</p>
          <p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              Verify Email
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">If you didn't subscribe, you can safely ignore this email.</p>
        `,
      });

      return NextResponse.json({
        success: true,
        message: "Please check your email to verify your subscription.",
        subscriberId: subscriber.id,
        requiresVerification: true,
      });
    }

    // Fallback: auto-verify if Resend not configured
    await prisma.email_subscribers.update({
      where: { id: subscriber.id },
      data: {
        verified: true,
        verifiedAt: new Date(),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! You'll receive our latest updates.",
      subscriberId: subscriber.id,
    });
  } catch (error) {
    logger.error("Subscription error:", error);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }
}

/**
 * DELETE /api/subscribe
 * Unsubscribe from email newsletter
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const subscriber = await prisma.email_subscribers.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!subscriber) {
      return NextResponse.json({ message: "Email not found in our list" }, { status: 404 });
    }

    // If token provided, verify it matches
    if (token && subscriber.verificationToken !== token) {
      return NextResponse.json({ error: "Invalid unsubscribe token" }, { status: 403 });
    }

    await prisma.email_subscribers.update({
      where: { id: subscriber.id },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "You have been unsubscribed. We're sorry to see you go!",
    });
  } catch (error) {
    logger.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscribe
 * Check subscription status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const subscriber = await prisma.email_subscribers.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        status: true,
        categories: true,
        frequency: true,
        subscribedAt: true,
      },
    });

    if (!subscriber) {
      return NextResponse.json({ subscribed: false });
    }

    return NextResponse.json({
      subscribed: subscriber.status === "ACTIVE",
      status: subscriber.status,
      categories: subscriber.categories,
      frequency: subscriber.frequency,
      subscribedAt: subscriber.subscribedAt,
    });
  } catch (error) {
    logger.error("Check subscription error:", error);
    return NextResponse.json({ error: "Failed to check subscription status" }, { status: 500 });
  }
}

/**
 * PATCH /api/subscribe
 * Update subscription preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, categories, frequency } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const subscriber = await prisma.email_subscribers.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const updated = await prisma.email_subscribers.update({
      where: { id: subscriber.id },
      data: {
        categories: categories ?? subscriber.categories,
        frequency: frequency ?? subscriber.frequency,
      },
      select: {
        categories: true,
        frequency: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Preferences updated!",
      preferences: updated,
    });
  } catch (error) {
    logger.error("Update preferences error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}

/**
 * Email Subscribers API
 * Handle email newsletter subscriptions
 */

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import prisma from "@/lib/prisma";

// POST /api/email/subscribe - Subscribe to email updates
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, source = "signup", preferences = {} } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Get user ID if authenticated (users uses 'clerkUserId' not 'clerkId')
    let userId: string | null = null;
    try {
      const { userId: clerkId } = await auth();
      if (clerkId) {
        const user = await prisma.users.findUnique({
          where: { clerkUserId: clerkId },
          select: { id: true },
        });
        userId = user?.id || null;
      }
    } catch {}

    // Check if already subscribed
    try {
      const existing = await db.query(
        `SELECT id, is_active FROM email_subscribers WHERE email = $1`,
        [email.toLowerCase()]
      );

      if (existing.rows.length > 0) {
        if (existing.rows[0].is_active) {
          return NextResponse.json({
            success: true,
            message: "Already subscribed",
            alreadySubscribed: true,
          });
        }

        // Reactivate subscription
        await db.query(
          `UPDATE email_subscribers 
           SET is_active = true, 
               updated_at = NOW(),
               user_id = COALESCE($2, user_id),
               first_name = COALESCE($3, first_name),
               last_name = COALESCE($4, last_name)
           WHERE email = $1`,
          [email.toLowerCase(), userId, firstName, lastName]
        );

        return NextResponse.json({
          success: true,
          message: "Successfully resubscribed!",
        });
      }

      // Create new subscription
      await db.query(
        `INSERT INTO email_subscribers (email, first_name, last_name, user_id, source, preferences)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          email.toLowerCase(),
          firstName || null,
          lastName || null,
          userId,
          source,
          JSON.stringify(preferences),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed!",
      });
    } catch (dbError) {
      // Table might not exist yet - create it
      logger.debug("Creating email_subscribers table...");
      await db.query(`
        CREATE TABLE IF NOT EXISTS email_subscribers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          user_id UUID REFERENCES users(id),
          source VARCHAR(50) DEFAULT 'signup',
          preferences JSONB DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          unsubscribed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
        CREATE INDEX IF NOT EXISTS idx_email_subscribers_user_id ON email_subscribers(user_id);
        CREATE INDEX IF NOT EXISTS idx_email_subscribers_is_active ON email_subscribers(is_active);
      `);

      // Try insert again
      await db.query(
        `INSERT INTO email_subscribers (email, first_name, last_name, user_id, source, preferences)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          email.toLowerCase(),
          firstName || null,
          lastName || null,
          userId,
          source,
          JSON.stringify(preferences),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Successfully subscribed!",
      });
    }
  } catch (error) {
    logger.error("Error subscribing to email:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

// DELETE /api/email/subscribe - Unsubscribe from emails
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token"); // Optional unsubscribe token

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    try {
      await db.query(
        `UPDATE email_subscribers 
         SET is_active = false, 
             unsubscribed_at = NOW(),
             updated_at = NOW()
         WHERE email = $1`,
        [email.toLowerCase()]
      );

      return NextResponse.json({
        success: true,
        message: "Successfully unsubscribed",
      });
    } catch (error) {
      logger.debug("Table may not exist:", error);
      return NextResponse.json({
        success: true,
        message: "Successfully unsubscribed",
      });
    }
  } catch (error) {
    logger.error("Error unsubscribing:", error);
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 });
  }
}

// GET /api/email/subscribe - Check subscription status
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ subscribed: false });
    }

    // Get user's email
    const user = await prisma.users.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, email: true },
    });

    if (!user?.email) {
      return NextResponse.json({ subscribed: false });
    }

    try {
      const result = await db.query(
        `SELECT is_active, preferences FROM email_subscribers WHERE email = $1`,
        [user.email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ subscribed: false });
      }

      return NextResponse.json({
        subscribed: result.rows[0].is_active,
        preferences: result.rows[0].preferences,
      });
    } catch (error) {
      logger.debug("Table may not exist:", error);
      return NextResponse.json({ subscribed: false });
    }
  } catch (error) {
    logger.error("Error checking subscription:", error);
    return NextResponse.json({ subscribed: false });
  }
}

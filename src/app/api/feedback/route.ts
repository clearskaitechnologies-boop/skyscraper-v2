import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { safeSendEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Prisma singleton imported from @/lib/db/prisma

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { message, email, name, category, task, issue, confusion, timestamp, userAgent, url } =
      body;

    // Support both old format (message) and new format (task/issue)
    const feedbackMessage = issue || message;
    const feedbackTask = task || category || "General";

    if (!feedbackMessage || feedbackMessage.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide feedback with at least 10 characters" },
        { status: 400 }
      );
    }

    // Log feedback for tracking (no DB storage to reduce dependencies)
    if (userId) {
      console.log("[FEEDBACK_SUBMITTED]", {
        userId,
        category: category || feedbackTask,
        task: feedbackTask,
        issue: feedbackMessage,
        confusion,
        email: email || "not provided",
        name: name || "not provided",
        timestamp: timestamp || new Date().toISOString(),
        userAgent,
        url,
      });
    }

    // Send email notification to ops
    await safeSendEmail({
      to: "ops@skaiscrape.com",
      subject: `Feedback: ${category || "General"} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #0A1A2F; color: #FFC838; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: 600; color: #374151; margin-bottom: 5px; }
              .value { color: #6b7280; }
              .category-badge { display: inline-block; padding: 4px 12px; background: #117CFF; color: white; border-radius: 4px; font-size: 12px; text-transform: uppercase; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">📬 New Feedback Received</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Category:</div>
                  <div class="value">
                    <span class="category-badge">${category || "General"}</span>
                  </div>
                </div>
                
                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${name} (${email})</div>
                </div>
                
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value" style="white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 3px solid #117CFF;">${message}</div>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Reply directly to ${email} to follow up.
                </p>
              </div>
            </div>
          </body>
        </html>`,
    });

    // Log feedback
    console.log("Feedback received:", {
      name,
      email,
      category,
      message,
      timestamp: new Date(),
    });

    // Optional: Auto-credit tokens during beta if user is signed in
    if (userId && email) {
      try {
        // Find user by clerk ID and get their org
        const user = await prisma.users.findFirst({
          where: {
            OR: [{ email: email }, { clerkUserId: userId }],
          },
          include: {
            Org: {
              include: {
                TokenWallet: true,
              },
            },
          },
        });

        if (user && user.Org) {
          // Ensure token wallet exists
          let tokenWallet = user.Org.TokenWallet;
          if (!tokenWallet) {
            tokenWallet = await prisma.tokenWallet.create({
              data: {
                id: crypto.randomUUID(),
                orgId: user.orgId,
                aiRemaining: 10, // Start with feedback bonus
                dolCheckRemain: 0,
                dolFullRemain: 0,
                updatedAt: new Date(),
              },
            });
          } else {
            // Add 10 bonus AI tokens for feedback during beta
            await prisma.tokenWallet.update({
              where: { orgId: user.orgId },
              data: {
                aiRemaining: {
                  increment: 10,
                },
                updatedAt: new Date(),
              },
            });
          }

          console.log(`Added 10 bonus AI tokens to org ${user.Org.name} for beta feedback`);

          // Log for admin dashboard
          console.log("Feedback bonus awarded:", {
            timestamp: new Date().toISOString(),
            email: user.email,
            tokensAdded: 10,
          });

          return NextResponse.json({
            success: true,
            description:
              "Thank you for your feedback! We've added 10 bonus AI tokens to your account.",
            tokensAdded: 10,
          });
        }
      } catch (tokenError) {
        console.error("Token bonus failed (non-blocking):", tokenError);
        // Continue without failing the feedback submission
      }
    }

    return NextResponse.json({
      success: true,
      description: "Thank you for your feedback! It helps us improve SkaiScraper™.",
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

/**
 * Accept Company Invite API
 * POST /api/trades/company/seats/accept
 *
 * When an invited user clicks the email link (/trades/join?token=X),
 * the page calls this endpoint to accept the invite and add them to the company.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized — please sign in first" }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Invite token is required" }, { status: 400 });
    }

    // ── Strategy 1: Company Seats invite (pendingCompanyToken on a placeholder member) ──
    const pendingMember = await prisma.tradesCompanyMember.findFirst({
      where: {
        pendingCompanyToken: token,
        status: "pending",
      },
      include: {
        company: { select: { id: true, name: true } },
      },
    });

    if (pendingMember) {
      // Check if user already has a membership record
      const existingMembership = await prisma.tradesCompanyMember.findUnique({
        where: { userId },
      });

      // If they're already in THIS company, just mark active
      if (existingMembership && existingMembership.companyId === pendingMember.companyId) {
        await prisma.tradesCompanyMember.update({
          where: { id: existingMembership.id },
          data: {
            status: "active",
            isActive: true,
            companyName: pendingMember.company?.name || pendingMember.companyName,
            pendingCompanyToken: null,
            updatedAt: new Date(),
          },
        });
        // Clean up placeholder if it exists
        if (pendingMember.userId.startsWith("pending_")) {
          await prisma.tradesCompanyMember.delete({ where: { id: pendingMember.id } });
        }
        return NextResponse.json({
          success: true,
          companyName: pendingMember.company?.name || "your company",
          companyId: pendingMember.companyId,
          message: `Welcome to ${pendingMember.company?.name || "your company"}!`,
        });
      }

      if (pendingMember.userId.startsWith("pending_")) {
        // Placeholder row — if user already exists, update their existing record instead
        if (existingMembership) {
          // User already has a membership (maybe from their own signup) — switch them to the inviting company
          await prisma.tradesCompanyMember.update({
            where: { id: existingMembership.id },
            data: {
              companyId: pendingMember.companyId,
              companyName: pendingMember.company?.name || pendingMember.companyName,
              role: pendingMember.role || existingMembership.role || "member",
              status: "active",
              isActive: true,
              isAdmin: false,
              isOwner: false,
              canEditCompany: false,
              onboardingStep: "profile",
              pendingCompanyToken: null,
              updatedAt: new Date(),
            },
          });
          // Delete the placeholder
          await prisma.tradesCompanyMember.delete({ where: { id: pendingMember.id } });
        } else {
          // No existing membership — update the placeholder to the real user
          await prisma.tradesCompanyMember.update({
            where: { id: pendingMember.id },
            data: {
              userId,
              status: "active",
              isActive: true,
              isAdmin: false,
              isOwner: false,
              canEditCompany: false,
              companyName: pendingMember.company?.name || pendingMember.companyName,
              onboardingStep: "profile",
              pendingCompanyToken: null,
              updatedAt: new Date(),
            },
          });
        }
      } else if (pendingMember.userId === userId) {
        // They're the same person (existing member re-accepting)
        await prisma.tradesCompanyMember.update({
          where: { id: pendingMember.id },
          data: {
            status: "active",
            isActive: true,
            companyName: pendingMember.company?.name || pendingMember.companyName,
            pendingCompanyToken: null,
            updatedAt: new Date(),
          },
        });
      } else {
        // Token belongs to a different real user — create a new record
        if (existingMembership) {
          await prisma.tradesCompanyMember.update({
            where: { id: existingMembership.id },
            data: {
              companyId: pendingMember.companyId,
              companyName: pendingMember.company?.name,
              status: "active",
              isActive: true,
              isAdmin: false, // No admin privileges for invitees
              isOwner: false, // Not an owner
              canEditCompany: false, // Cannot edit company page
              role: pendingMember.role || "member",
              onboardingStep: "profile", // Needs to complete profile setup
              updatedAt: new Date(),
            },
          });
        } else {
          await prisma.tradesCompanyMember.create({
            data: {
              userId,
              companyId: pendingMember.companyId,
              companyName: pendingMember.company?.name,
              email: pendingMember.email,
              firstName: pendingMember.firstName,
              lastName: pendingMember.lastName,
              role: pendingMember.role || "member",
              status: "active",
              isActive: true,
              isAdmin: false, // No admin privileges for invitees
              isOwner: false, // Not an owner
              canEditCompany: false, // Cannot edit company page
              onboardingStep: "profile", // Needs to complete profile setup
            },
          });
        }

        // Clean up the placeholder
        if (pendingMember.userId.startsWith("pending_")) {
          await prisma.tradesCompanyMember.delete({ where: { id: pendingMember.id } });
        } else {
          await prisma.tradesCompanyMember.update({
            where: { id: pendingMember.id },
            data: { pendingCompanyToken: null },
          });
        }
      }

      // ── Link the new member to the owner's org so they can access leads, messages, etc. ──
      try {
        if (pendingMember.companyId) {
          // Find the company's orgId
          const company = await prisma.tradesCompany.findUnique({
            where: { id: pendingMember.companyId },
            select: { orgId: true },
          });

          // If no orgId on company, find the owner's org
          let targetOrgId = company?.orgId;
          if (!targetOrgId) {
            const owner = await prisma.tradesCompanyMember.findFirst({
              where: { companyId: pendingMember.companyId, isOwner: true },
              select: { orgId: true },
            });
            targetOrgId = owner?.orgId || null;
          }

          if (targetOrgId) {
            // Check if user already has this org membership
            const prismaDynamic = prisma as any;
            if (typeof prismaDynamic.user_organizations?.findFirst === "function") {
              const existingOrg = await prismaDynamic.user_organizations.findFirst({
                where: { userId, organizationId: targetOrgId },
              });
              if (!existingOrg) {
                await prismaDynamic.user_organizations.create({
                  data: {
                    userId,
                    organizationId: targetOrgId,
                    role: "MEMBER",
                  },
                });
                console.log(`[accept] Linked user ${userId} to org ${targetOrgId}`);
              }
            } else {
              // Fallback: link via users table
              try {
                await prisma.users.update({
                  where: { clerkUserId: userId },
                  data: { orgId: targetOrgId, role: "MEMBER" },
                });
                console.log(`[accept] Linked user ${userId} to org ${targetOrgId} via users table`);
              } catch {
                console.log(
                  "[accept] Could not link user to org via users table (may not exist yet)"
                );
              }
            }

            // Also set orgId on the member record
            const memberToUpdate = await prisma.tradesCompanyMember.findUnique({
              where: { userId },
            });
            if (memberToUpdate && !memberToUpdate.orgId) {
              await prisma.tradesCompanyMember.update({
                where: { userId },
                data: { orgId: targetOrgId },
              });
            }
          }
        }
      } catch (orgLinkError) {
        // Non-fatal — log but don't fail the invite acceptance
        console.error("[accept] Org linking error (non-fatal):", orgLinkError);
      }

      // ── Auto-connect new member with all existing company members on Trades Network ──
      try {
        // Get new member's TradesProfile
        const newMemberProfile = await prisma.tradesProfile.findFirst({
          where: { userId },
          select: { id: true },
        });

        if (newMemberProfile && pendingMember.companyId) {
          // Get all other company members' TradesProfiles
          const companyMembers = await prisma.tradesCompanyMember.findMany({
            where: {
              companyId: pendingMember.companyId,
              status: "active",
              userId: { not: userId },
              NOT: { userId: { startsWith: "pending_" } },
            },
            select: { userId: true },
          });

          for (const member of companyMembers) {
            const memberProfile = await prisma.tradesProfile.findFirst({
              where: { userId: member.userId },
              select: { id: true },
            });

            if (memberProfile) {
              // Create bidirectional connection (follower ↔ following)
              await prisma.tradesConnection.upsert({
                where: {
                  followerId_followingId: {
                    followerId: newMemberProfile.id,
                    followingId: memberProfile.id,
                  },
                },
                create: {
                  id: crypto.randomUUID(),
                  followerId: newMemberProfile.id,
                  followingId: memberProfile.id,
                },
                update: {},
              });

              await prisma.tradesConnection.upsert({
                where: {
                  followerId_followingId: {
                    followerId: memberProfile.id,
                    followingId: newMemberProfile.id,
                  },
                },
                create: {
                  id: crypto.randomUUID(),
                  followerId: memberProfile.id,
                  followingId: newMemberProfile.id,
                },
                update: {},
              });
            }
          }
          console.log(
            `[accept] Auto-connected user ${userId} with ${companyMembers.length} company members`
          );
        }
      } catch (autoConnectError) {
        // Non-fatal
        console.error("[accept] Auto-connect error (non-fatal):", autoConnectError);
      }

      return NextResponse.json({
        success: true,
        companyName: pendingMember.company?.name || "your company",
        companyId: pendingMember.companyId,
        message: `Welcome to ${pendingMember.company?.name || "your company"}!`,
      });
    }

    // ── Strategy 2: Onboarding invite (token stored as pendingCompanyToken on admin) ──
    const adminMember = await prisma.tradesCompanyMember.findFirst({
      where: {
        pendingCompanyToken: token,
        isAdmin: true,
      },
    });

    if (adminMember) {
      // This is the onboarding flow — join the pending company group
      const existingMembership = await prisma.tradesCompanyMember.findUnique({
        where: { userId },
      });

      if (existingMembership) {
        await prisma.tradesCompanyMember.update({
          where: { id: existingMembership.id },
          data: {
            companyName: adminMember.companyName,
            pendingCompanyToken: token,
            onboardingStep: "pending_admin",
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.tradesCompanyMember.create({
          data: {
            userId,
            companyName: adminMember.companyName,
            pendingCompanyToken: token,
            onboardingStep: "pending_admin",
            status: "active",
            isActive: true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        companyName: adminMember.companyName || "the company",
        message: `Joined pending company: ${adminMember.companyName}`,
        pendingCompany: true,
      });
    }

    // ── Fallback: Token not found — check if user is already connected ──
    // This handles page refreshes after a successful acceptance (token was already consumed)
    const alreadyMember = await prisma.tradesCompanyMember.findUnique({
      where: { userId },
      include: { company: { select: { name: true } } },
    });

    if (alreadyMember?.companyId && alreadyMember.status === "active") {
      return NextResponse.json({
        success: true,
        companyName: alreadyMember.company?.name || alreadyMember.companyName || "your company",
        companyId: alreadyMember.companyId,
        message: `You're already a member of ${alreadyMember.company?.name || "your company"}!`,
        alreadyConnected: true,
      });
    }

    return NextResponse.json({ error: "Invalid or expired invite token" }, { status: 404 });
  } catch (error: any) {
    console.error("[company/seats/accept] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

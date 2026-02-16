/**
 * Accept Invite Page
 *
 * Client lands here after clicking the magic link in their invitation email.
 * This page validates the token and either:
 * - Shows sign-in prompt if not logged in
 * - Auto-accepts the invite if logged in
 * - Shows error if token invalid/expired
 */

import { auth } from "@clerk/nextjs/server";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface AcceptInvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
  const params = await searchParams;
  const token = params.token;

  // No token provided
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Link</CardTitle>
            <CardDescription>
              This invitation link appears to be invalid or incomplete.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-slate-600">
              Please check your email for the correct invitation link, or contact your contractor
              for a new invitation.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Look up the invitation
  const invite = await prisma.claimClientLink.findUnique({
    where: { id: token },
    include: {
      claims: {
        select: {
          id: true,
          claimNumber: true,
          title: true,
          orgId: true,
        },
      },
    },
  });

  // Invalid token
  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invitation Not Found</CardTitle>
            <CardDescription>
              This invitation link may have expired or been revoked.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-slate-600">
              Please contact your contractor to request a new invitation.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already accepted
  if (invite.status === "CONNECTED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-green-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Already Connected</CardTitle>
            <CardDescription>You&apos;re already connected to this claim.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-slate-600">
              Claim: {invite.claims.title || invite.claims.claimNumber}
            </p>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href={`/portal/claims/${invite.claims.id}`}>View Your Claim</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is authenticated
  const { userId } = await auth();

  // Not logged in - show sign in prompt
  if (!userId) {
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`/client/accept-invite?token=${token}`)}`;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
            <CardDescription>
              {invite.clientName ? `Hello ${invite.clientName}, you've` : "You've"} been invited to
              view your claim.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                Claim: {invite.claims.title || invite.claims.claimNumber}
              </p>
              <p className="text-xs text-slate-500">
                Invited: {new Date(invite.invitedAt).toLocaleDateString()}
              </p>
            </div>

            <p className="text-center text-sm text-slate-600">
              Sign in or create an account to view your claim details, track progress, and
              communicate with your contractor.
            </p>

            <div className="space-y-2">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href={signInUrl}>Sign In to Accept</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/sign-up?redirect_url=/client/accept-invite?token=${token}`}>
                  Create Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is logged in - accept the invitation
  try {
    await prisma.claimClientLink.update({
      where: { id: token },
      data: {
        status: "CONNECTED",
        clientUserId: userId,
        acceptedAt: new Date(),
      },
    });

    // Redirect to the claim portal
    redirect(`/portal/claims/${invite.claims.id}`);
  } catch (error) {
    console.error("[ACCEPT_INVITE] Error accepting invitation:", error);

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
            <CardDescription>We couldn&apos;t process your invitation.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-slate-600">
              Please try again or contact support if the problem persists.
            </p>
            <Button asChild variant="outline">
              <Link href={`/client/accept-invite?token=${token}`}>Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}

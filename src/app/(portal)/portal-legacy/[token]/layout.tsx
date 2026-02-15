import Link from "next/link";
import React from "react";

import BottomNav from "@/components/portal/BottomNav";
import prisma from "@/lib/prisma";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { token: string };
}) {
  const token = params.token;
  // client_access uses 'id' as the unique identifier, not 'token'
  const access = await prisma.client_access.findUnique({
    where: { id: token },
  });
  const claimData = access
    ? await prisma.claims.findUnique({ where: { id: access.claimId }, select: { orgId: true } })
    : null;
  const Org = claimData ? await prisma.org.findUnique({ where: { id: claimData.orgId } }) : null;
  const brand = {
    logoUrl: Org?.brandLogoUrl || "/logo.png",
    companyName: Org?.name || "Your Contractor",
  };
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <img src={brand.logoUrl} alt="Logo" className="h-8 w-auto" />
          <span className="font-semibold text-foreground">{brand.companyName}</span>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link
            href={`/portal/${token}`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Overview
          </Link>
          <Link
            href={`/portal/${token}/timeline`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Timeline
          </Link>
          <Link
            href={`/portal/${token}/documents`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Documents
          </Link>
          <Link
            href={`/portal/${token}/photos`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Photos
          </Link>
          <Link
            href={`/portal/${token}/messages`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Messages
          </Link>
          <Link
            href={`/portal/${token}/trades`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Trades
          </Link>
          <Link
            href={`/portal/${token}/upload`}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Upload
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-6 py-6 md:px-8 md:py-8">
        {children}
      </main>
      <BottomNav token={token} />
    </div>
  );
}

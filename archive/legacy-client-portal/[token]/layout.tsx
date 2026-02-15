import React from "react";
import Link from "next/link";

export default function ClientPortalLayout({ children, params }: { children: React.ReactNode; params: { token: string }; }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b px-4 py-3 flex items-center justify-between bg-white/90 backdrop-blur">
        <div className="font-semibold">Client Portal</div>
        <nav className="flex gap-4 text-sm">
          <Link href={`/client/${params.token}`}>Overview</Link>
          <Link href={`/client/${params.token}/timeline`}>Timeline</Link>
          <Link href={`/client/${params.token}/documents`}>Documents</Link>
          <Link href={`/client/${params.token}/photos`}>Photos</Link>
          <Link href={`/client/${params.token}/messages`}>Messages</Link>
          <Link href={`/client/${params.token}/trades-network`}>Trades</Link>
        </nav>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "", label: "Home" },
  { href: "timeline", label: "Timeline" },
  { href: "documents", label: "Docs" },
  { href: "messages", label: "Messages" },
  { href: "trades", label: "Vendors" },
  { href: "upload", label: "Upload" },
];

export default function BottomNav({ token }: { token: string }) {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t bg-white p-2 md:hidden">
      {links.map((l) => {
        const dest = `/portal/${token}/${l.href}`;
        const active = path === dest || (l.href === "" && path === `/portal/${token}`);
        return (
          <Link
            key={l.href}
            href={dest}
            className={`text-xs ${active ? "font-semibold text-blue-600" : "text-gray-600"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
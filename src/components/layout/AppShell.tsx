import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { CreditCard, FileText, Home, Layers, Menu, Settings, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import VoiceMicButton from "@/components/VoiceMicButton";
import { supabase } from "@/integrations/supabase/client";

type NavItemDef = {
  to: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[]; // allowed roles, undefined == everyone
};

export default function AppShell() {
  const [session, setSession] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      if (session?.user) await loadRoles(session.user.id);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
      // s is the Session | null returned by onAuthStateChange
      setSession(s ?? null);
      if (s?.user) await loadRoles(s.user.id);
      if (!s) setRoles([]);
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  async function loadRoles(userId: string) {
    try {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      const r = Array.isArray(data) ? data.map((x: any) => x.role) : [];
      setRoles(r);
    } catch (e) {
      console.warn("Failed to load roles", e);
      setRoles([]);
    }
  }

  const navItems: NavItemDef[] = useMemo(
    () => [
      { to: "/", label: "Dashboard", icon: <Home size={18} /> },
      { to: "/claims", label: "Claims", icon: <Layers size={18} /> },
      { to: "/reports/history", label: "Report History", icon: <FileText size={18} /> },
      { to: "/crm/branding", label: "Branding", icon: <FileText size={18} /> },
      { to: "/tokens", label: "Tokens", icon: <CreditCard size={18} /> },
      {
        to: "/orgs",
        label: "Teams",
        icon: <Users size={18} />,
        roles: ["admin", "owner"],
      },
      { to: "/settings", label: "Settings", icon: <Settings size={18} /> },
    ],
    []
  );

  // When no session, show public top bar
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col">
        <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex gap-4">
            <Button asChild variant="secondary" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={clsx(
          collapsed ? "w-20" : "w-64",
          "flex flex-col bg-slate-900 text-white transition-all duration-300"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-700 p-4">
          <div className="flex items-center gap-2">
            <Logo inSidebar collapsed={collapsed} />
            <div className="ml-2">
              <VoiceMicButton />
            </div>
          </div>
          <button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((v) => !v)}
            className="p-2"
          >
            <Menu color="white" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <Tooltip.Provider delayDuration={120}>
            {navItems.map((it) => {
              if (it.roles && it.roles.length > 0 && !it.roles.some((r) => roles.includes(r)))
                return null;
              return (
                <NavItem
                  key={it.to}
                  to={it.to}
                  icon={it.icon}
                  label={it.label}
                  collapsed={collapsed}
                />
              );
            })}
          </Tooltip.Provider>
        </nav>

        <div className="border-t border-slate-700 p-3">
          <button
            className="w-full text-left text-sm hover:opacity-70"
            onClick={async () => {
              await supabase.auth.signOut();
              // Return users to the login screen when they sign out
              location.assign("/auth/login");
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  collapsed,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
}) {
  if (collapsed) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Link
            to={to}
            className="flex items-center justify-center rounded p-3 transition-all hover:bg-slate-800"
          >
            {icon}
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Content side="right" className="tooltip-content">
          {label}
          <Tooltip.Arrow className="fill-slate-900" />
        </Tooltip.Content>
      </Tooltip.Root>
    );
  }

  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded px-3 py-2 transition-all hover:bg-slate-800"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

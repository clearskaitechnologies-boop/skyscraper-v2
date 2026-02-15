"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Notification {
  id: string;
  level: "info" | "success" | "warning" | "error";
  title: string;
  body?: string;
  link?: string;
  created_at: string;
  is_read: boolean;
}

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // API returns { notifications, unreadCount } — map camelCase to snake_case
        const raw = Array.isArray(data) ? data : data.notifications || [];
        setItems(
          raw.map((n: any) => ({
            id: n.id,
            level:
              n.type === "warning"
                ? "warning"
                : n.type === "success"
                  ? "success"
                  : n.type === "error"
                    ? "error"
                    : "info",
            title: n.title || "Notification",
            body: n.message || n.body || "",
            link: n.link || null,
            created_at: n.createdAt || n.created_at || new Date().toISOString(),
            is_read: n.read ?? n.is_read ?? false,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Poll every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const unread = items.filter((i) => !i.is_read).length;

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    load();
  }

  const levelColors = {
    info: "text-blue-600 bg-blue-50",
    success: "text-green-600 bg-green-50",
    warning: "text-yellow-600 bg-yellow-50",
    error: "text-red-600 bg-red-50",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full border border-gray-200 bg-white p-2 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-96 rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unread > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    {unread} new
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No notifications</div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 ${
                      !n.is_read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 rounded-full p-1.5 ${
                          levelColors[n.level] || levelColors.info
                        }`}
                      >
                        {n.level === "success"
                          ? "✓"
                          : n.level === "warning"
                            ? "⚠"
                            : n.level === "error"
                              ? "✕"
                              : "ℹ"}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{n.title}</div>
                        {n.body && <div className="mt-1 text-xs text-gray-600">{n.body}</div>}
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          <span>{new Date(n.created_at).toLocaleString()}</span>
                          {n.link && (
                            <Link
                              href={n.link}
                              className="text-blue-600 hover:underline"
                              onClick={() => setOpen(false)}
                            >
                              View →
                            </Link>
                          )}
                          {!n.is_read && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="text-blue-600 hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

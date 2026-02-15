"use client";

import { Bell } from "lucide-react";
import { useEffect,useState } from "react";

import { cn } from "@/lib/utils";

interface ProactiveAlert {
  id: string;
  message: string;
  claimId?: string;
  type: "ai_suggestion" | "status_change" | "approval_required";
  timestamp: Date;
  read: boolean;
}

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = alerts.filter(a => !a.read).length;

  useEffect(() => {
    // Listen for custom notification events
    const handleNewNotification = (event: CustomEvent<ProactiveAlert>) => {
      setAlerts(prev => [event.detail, ...prev]);
    };

    window.addEventListener("new-notification" as any, handleNewNotification);
    
    // Load persisted notifications from localStorage
    const stored = localStorage.getItem("proactive_alerts");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAlerts(parsed.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })));
      } catch (e) {
        console.error("Failed to parse stored alerts:", e);
      }
    }

    return () => {
      window.removeEventListener("new-notification" as any, handleNewNotification);
    };
  }, []);

  useEffect(() => {
    // Persist to localStorage whenever alerts change
    localStorage.setItem("proactive_alerts", JSON.stringify(alerts));
  }, [alerts]);

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const clearAll = () => {
    setAlerts([]);
    localStorage.removeItem("proactive_alerts");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 transition hover:bg-[var(--surface-2)]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-[color:var(--text)]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--border)] p-4">
              <h3 className="flex items-center gap-2 font-semibold text-[color:var(--text)]">
                <span className="text-xl">🔔</span> Notifications
              </h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[color:var(--primary)] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-xs text-[color:var(--muted)] hover:text-[color:var(--text)]"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Alerts List */}
            <div className="max-h-[500px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-[color:var(--muted)]">
                  <Bell className="mx-auto mb-3 h-12 w-12 opacity-30" />
                  <p>No notifications yet</p>
                  <p className="mt-1 text-xs">AI suggestions will appear here</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={cn(
                      "cursor-pointer border-b border-[color:var(--border)] p-4 transition hover:bg-[var(--surface-2)]",
                      !alert.read && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                    onClick={() => {
                      markAsRead(alert.id);
                      if (alert.claimId) {
                        window.location.href = `/claims/${alert.claimId}`;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon based on type */}
                      <span className="text-2xl">
                        {alert.type === 'ai_suggestion' ? '🤖' : 
                         alert.type === 'status_change' ? '✅' : 
                         '⚠️'}
                      </span>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm text-[color:var(--text)]",
                          !alert.read && "font-semibold"
                        )}>
                          {alert.message}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">
                          {formatTimestamp(alert.timestamp)}
                        </p>
                      </div>
                      {!alert.read && (
                        <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                      )}
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

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Helper function to trigger notifications from anywhere
export function triggerNotification(alert: Omit<ProactiveAlert, 'id' | 'timestamp' | 'read'>) {
  const notification: ProactiveAlert = {
    ...alert,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    read: false,
  };
  
  window.dispatchEvent(new CustomEvent("new-notification", { detail: notification }));
}

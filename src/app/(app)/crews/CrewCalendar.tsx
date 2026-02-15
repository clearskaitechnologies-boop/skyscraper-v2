"use client";

import { ChevronLeft, ChevronRight, Clock, HardHat, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

interface Schedule {
  id: string;
  claimNumber: string;
  claimTitle: string;
  crewLead: { name: string | null; headshot_url: string | null } | null;
  crewMembers: { id: string; name: string | null }[];
  scheduledDate: string;
  startTime: string;
  estimatedDuration: number;
  complexity: string;
  status: string;
  scopeOfWork: string | null;
  weatherRisk: string | null;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500 text-white",
  in_progress: "bg-yellow-500 text-white",
  completed: "bg-green-500 text-white",
  cancelled: "bg-red-400 text-white",
};

const complexityDot: Record<string, string> = {
  low: "bg-green-400",
  medium: "bg-yellow-400",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

export function CrewCalendar({ schedules }: { schedules: Schedule[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  // Get current week for week view
  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const s of schedules) {
      const key = s.scheduledDate;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [schedules]);

  const navigate = (direction: -1 | 1) => {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() + direction);
    } else {
      d.setDate(d.getDate() + direction * 7);
    }
    setCurrentDate(d);
  };

  const today = new Date().toISOString().split("T")[0];

  const renderDayCell = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const daySchedules = schedulesByDate.get(dateStr) || [];
    const isToday = dateStr === today;
    const isCurrentMonth = date.getMonth() === month;

    return (
      <div
        key={dateStr}
        className={`min-h-[120px] border border-[var(--border)] p-1.5 transition-colors ${
          isToday ? "bg-[var(--primary)]/5 ring-[var(--primary)]/30 ring-2" : ""
        } ${!isCurrentMonth ? "opacity-40" : ""}`}
      >
        <div
          className={`mb-1 text-xs font-semibold ${isToday ? "text-[var(--primary)]" : "text-slate-500"}`}
        >
          {date.getDate()}
        </div>
        <div className="space-y-1">
          {daySchedules.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className={`group relative cursor-default rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight ${statusColors[s.status] || "bg-slate-400 text-white"}`}
              title={`${s.claimTitle} — ${s.crewLead?.name || "No lead"} — ${s.startTime} (${s.estimatedDuration}h)`}
            >
              <div className="flex items-center gap-1 truncate">
                <span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${complexityDot[s.complexity] || "bg-slate-300"}`}
                />
                <span className="truncate">{s.claimTitle}</span>
              </div>
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-52 rounded-lg border border-[var(--border)] bg-[var(--surface-glass)] p-3 shadow-xl backdrop-blur-md group-hover:block">
                <div className="mb-1 text-xs font-bold text-[color:var(--text)]">
                  {s.claimTitle}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="h-3 w-3" /> {s.startTime} · {s.estimatedDuration}h
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <HardHat className="h-3 w-3" /> {s.crewLead?.name || "Unassigned"}
                </div>
                {s.scopeOfWork && (
                  <div className="mt-1 line-clamp-2 text-[10px] text-slate-400">
                    {s.scopeOfWork}
                  </div>
                )}
                {s.weatherRisk && (
                  <div className="mt-1 text-[10px] font-medium text-amber-500">
                    ⚠ {s.weatherRisk}
                  </div>
                )}
              </div>
            </div>
          ))}
          {daySchedules.length > 3 && (
            <div className="text-[10px] font-medium text-slate-400">
              +{daySchedules.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  // Month view grid
  const monthGrid = useMemo(() => {
    const cells: Date[] = [];
    // Leading days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const d = new Date(year, month, 0 - firstDayOfWeek + i + 1);
      cells.push(d);
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(new Date(year, month, i));
    }
    // Trailing days to fill 6 rows
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1];
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      cells.push(d);
    }
    return cells;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1.5 transition-colors hover:bg-[var(--surface-2)]"
          >
            <ChevronLeft className="h-5 w-5 text-[color:var(--text)]" />
          </button>
          <h2 className="min-w-[200px] text-center text-lg font-bold text-[color:var(--text)]">
            {viewMode === "month"
              ? monthName
              : `Week of ${weekStart.toLocaleDateString("default", { month: "short", day: "numeric" })}`}
          </h2>
          <button
            onClick={() => navigate(1)}
            className="rounded-lg p-1.5 transition-colors hover:bg-[var(--surface-2)]"
          >
            <ChevronRight className="h-5 w-5 text-[color:var(--text)]" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors"
          >
            Today
          </button>
          <div className="flex overflow-hidden rounded-lg border border-[var(--border)]">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-[var(--primary)] text-white"
                  : "text-slate-500 hover:bg-[var(--surface-2)]"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-[var(--primary)] text-white"
                  : "text-slate-500 hover:bg-[var(--surface-2)]"
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--surface-1)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {viewMode === "month"
          ? monthGrid.map((d) => renderDayCell(d))
          : weekDays.map((d) => (
              <div key={d.toISOString()} className="min-h-[300px]">
                {renderDayCell(d)}
              </div>
            ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-[var(--border)] px-6 py-3">
        <span className="text-xs font-medium text-slate-400">Status:</span>
        {Object.entries(statusColors).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-sm ${cls.split(" ")[0]}`} />
            <span className="text-xs capitalize text-slate-500">{status.replace("_", " ")}</span>
          </div>
        ))}
        <span className="ml-4 text-xs font-medium text-slate-400">Complexity:</span>
        {Object.entries(complexityDot).map(([level, cls]) => (
          <div key={level} className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${cls}`} />
            <span className="text-xs capitalize text-slate-500">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

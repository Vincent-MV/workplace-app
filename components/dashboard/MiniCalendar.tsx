"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task, Meeting, Workspace } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

interface MiniCalendarProps {
  tasks: Task[];
  meetings: Meeting[];
  workspaces: Workspace[];
}

export default function MiniCalendar({ tasks, meetings, workspaces }: MiniCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const dotsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const taskDots = tasks
      .filter((t) => t.due_date === dateStr)
      .map((t) => wsMap[t.workspace_id]?.color)
      .filter(Boolean);
    const meetDots = meetings
      .filter((m) => m.scheduled_at.startsWith(dateStr))
      .map((m) => wsMap[m.workspace_id]?.color)
      .filter(Boolean);
    const all = [...taskDots, ...meetDots];
    return [...new Set(all)].slice(0, 3);
  };

  const itemsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayTasks = tasks.filter((t) => t.due_date === dateStr);
    const dayMeetings = meetings.filter((m) => m.scheduled_at.startsWith(dateStr));
    return { dayTasks, dayMeetings };
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const selected = selectedDay ? itemsForDay(selectedDay) : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700">{monthName}</span>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-0.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={nextMonth}
            className="p-0.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-slate-400 py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dots = dotsForDay(day);
          const active = isToday(day);
          const sel = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(sel ? null : day)}
              className={cn(
                "flex flex-col items-center py-0.5 rounded-lg transition-all",
                active
                  ? "ring-2 ring-violet-500 ring-offset-1 bg-violet-50 text-violet-700 font-bold shadow-sm"
                  : sel
                  ? "bg-slate-100 ring-1 ring-slate-300 text-slate-800"
                  : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <span className="text-[11px]">{day}</span>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dots.map((color, di) => (
                    <span
                      key={di}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Popover for selected day */}
      {selectedDay && selected && (
        <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200 animate-slide-down">
          <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
            {monthName.split(" ")[0]} {selectedDay}
          </p>
          {selected.dayTasks.length === 0 && selected.dayMeetings.length === 0 ? (
            <p className="text-[11px] text-slate-400">Nothing scheduled</p>
          ) : (
            <div className="space-y-1">
              {selected.dayTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: wsMap[t.workspace_id]?.color ?? "#94a3b8" }}
                  />
                  <span className="text-[11px] text-slate-600 truncate">{t.title}</span>
                </div>
              ))}
              {selected.dayMeetings.map((m) => (
                <div key={m.id} className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: wsMap[m.workspace_id]?.color ?? "#94a3b8" }}
                  />
                  <span className="text-[11px] text-slate-600 truncate">
                    {formatDateTime(m.scheduled_at)} · {m.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

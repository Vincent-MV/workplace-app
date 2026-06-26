"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import { todayISO, formatDate, daysAgo, cn } from "@/lib/utils";
import { CheckSquare, Square, Calendar, CheckCircle, Clock } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  missed: "Missed",
};

export default function TasksPage() {
  const { activeWorkspace, workspaces } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "overdue" | "today" | "upcoming">("all");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const fetchTasks = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("due_date", { nullsFirst: false });
    setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [activeWorkspace]);

  const today = todayISO();

  const filteredTasks = tasks.filter((t) => {
    if (filter === "overdue") return t.due_date && t.due_date < today && !t.confirmed;
    if (filter === "today") return t.due_date === today;
    if (filter === "upcoming") return t.due_date && t.due_date > today;
    return true;
  });

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
  };

  const markDone = async (task: Task) => {
    await supabase.from("tasks").update({ confirmed: true, status: "done" }).eq("id", task.id);
    fetchTasks();
  };

  const handleReschedule = async (task: Task) => {
    if (!rescheduleDate) return;
    await supabase.from("tasks").update({ due_date: rescheduleDate, confirmed: false }).eq("id", task.id);
    setReschedulingId(null);
    setRescheduleDate("");
    fetchTasks();
  };

  const FILTERS = [
    { label: "All", value: "all" as const },
    { label: "Overdue", value: "overdue" as const },
    { label: "Today", value: "today" as const },
    { label: "Upcoming", value: "upcoming" as const },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tasks</h1>
            <p className="text-sm text-slate-500">
              {activeWorkspace?.name ?? "All workspaces"}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                filter === value
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              {label}
              {value === "overdue" && (
                <span className="ml-1 text-red-400">
                  ({tasks.filter((t) => t.due_date && t.due_date < today && !t.confirmed).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const ws = wsMap[task.workspace_id];
              const isOverdue = task.due_date && task.due_date < today && !task.confirmed;
              const done = task.status === "done";
              const isRescheduling = reschedulingId === task.id;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 rounded-xl border bg-white transition-all",
                    isOverdue ? "border-red-200 bg-red-50/30" : "border-slate-200 hover:border-slate-300"
                  )}
                  style={{ borderLeft: `3px solid ${ws?.color ?? "#94a3b8"}` }}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task)}
                      className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {done ? (
                        <CheckSquare size={17} className="text-green-500" />
                      ) : (
                        <Square size={17} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", done && "line-through text-slate-400", !done && "text-slate-800")}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {task.due_date && (
                          <span className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-500" : "text-slate-500")}>
                            {isOverdue ? <Clock size={11} /> : <Calendar size={11} />}
                            {isOverdue
                              ? `${daysAgo(task.due_date)} days overdue`
                              : formatDate(task.due_date)}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{STATUS_LABELS[task.status]}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {ws && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${ws.color}15`, color: ws.color }}
                        >
                          {ws.name}
                        </span>
                      )}
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                      />
                    </div>
                  </div>

                  {isOverdue && !done && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-red-100">
                      {isRescheduling ? (
                        <>
                          <input
                            type="date"
                            value={rescheduleDate}
                            min={today}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
                          />
                          <button
                            onClick={() => handleReschedule(task)}
                            disabled={!rescheduleDate}
                            className="px-2 py-1 bg-amber-500 text-white text-xs rounded-lg disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setReschedulingId(null); setRescheduleDate(""); }}
                            className="text-xs text-slate-400 hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setReschedulingId(task.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            <Calendar size={11} /> Reschedule
                          </button>
                          <button
                            onClick={() => markDone(task)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle size={11} /> Done
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

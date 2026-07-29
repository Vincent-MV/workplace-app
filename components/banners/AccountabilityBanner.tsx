"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import { todayISO, daysAgo } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Calendar } from "lucide-react";

const DEMO_TASK: Task = {
  id: "demo-accountability",
  workspace_id: "ws-school",
  user_id: "demo-user",
  title: "Review Chapter 4 notes",
  description: "Theology class — key concepts for midterm",
  status: "todo",
  priority: "medium",
  due_date: (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })(),
  confirmed: false,
  created_at: new Date().toISOString(),
};

interface Props {
  refreshKey: number;
}

export default function AccountabilityBanner({ refreshKey }: Props) {
  const { workspaces, isDemo } = useWorkspace();
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setOverdueTasks([DEMO_TASK]);
      setCurrentIdx(0);
      setShowReschedule(false);
      return;
    }

    if (!workspaces.length) return;
    const wsIds = workspaces.map((w) => w.id);
    supabase
      .from("tasks")
      .select("*")
      .in("workspace_id", wsIds)
      .eq("confirmed", false)
      .lt("due_date", todayISO())
      .order("due_date")
      .then(({ data }) => {
        setOverdueTasks(data ?? []);
        setCurrentIdx(0);
        setShowReschedule(false);
      });
  }, [workspaces, refreshKey, isDemo]);

  if (dismissed) return null;
  if (!overdueTasks.length) return null;

  const task = overdueTasks[currentIdx];
  if (!task) return null;

  const ago = task.due_date ? daysAgo(task.due_date) : 0;
  const agoLabel = ago === 1 ? "yesterday" : `${ago} days ago`;

  const handleDone = async () => {
    if (isDemo) {
      setOverdueTasks((prev) => prev.filter((t) => t.id !== task.id));
      setCurrentIdx(0);
      setShowReschedule(false);
      return;
    }
    setLoading(true);
    await supabase
      .from("tasks")
      .update({ confirmed: true, status: "done" })
      .eq("id", task.id);
    setOverdueTasks((prev) => prev.filter((t) => t.id !== task.id));
    setCurrentIdx(0);
    setShowReschedule(false);
    setLoading(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) return;
    if (isDemo) {
      setOverdueTasks((prev) => prev.filter((t) => t.id !== task.id));
      setCurrentIdx(0);
      setShowReschedule(false);
      setRescheduleDate("");
      return;
    }
    setLoading(true);
    await supabase
      .from("tasks")
      .update({ due_date: rescheduleDate, confirmed: false })
      .eq("id", task.id);
    setOverdueTasks((prev) => prev.filter((t) => t.id !== task.id));
    setCurrentIdx(0);
    setShowReschedule(false);
    setRescheduleDate("");
    setLoading(false);
  };

  return (
    <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-slide-down">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-900 font-medium leading-snug">
              Did you finish{" "}
              <span className="font-bold">&ldquo;{task.title}&rdquo;</span>?
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Was due {agoLabel} — you didn&apos;t confirm this yet.
            </p>
          </div>
          {overdueTasks.length > 1 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="text-amber-600 disabled:opacity-30 text-xs px-1"
              >
                ‹
              </button>
              <span className="text-xs text-amber-600 whitespace-nowrap">
                {currentIdx + 1}/{overdueTasks.length}
              </span>
              <button
                onClick={() =>
                  setCurrentIdx((i) => Math.min(overdueTasks.length - 1, i + 1))
                }
                disabled={currentIdx === overdueTasks.length - 1}
                className="text-amber-600 disabled:opacity-30 text-xs px-1"
              >
                ›
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDone}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            <CheckCircle size={13} />
            Yes, done
          </button>
          <button
            onClick={() => setShowReschedule((s) => !s)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Calendar size={13} />
            No — Reschedule
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-600 text-xs px-1 transition-colors"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>

      {showReschedule && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-200 animate-slide-down">
          <input
            type="date"
            value={rescheduleDate}
            min={todayISO()}
            onChange={(e) => setRescheduleDate(e.target.value)}
            className="px-2 py-1 text-xs border border-amber-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button
            onClick={handleReschedule}
            disabled={!rescheduleDate || loading}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setShowReschedule(false)}
            className="text-xs text-amber-600 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

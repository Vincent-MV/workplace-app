"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import { todayISO, cn } from "@/lib/utils";
import { CheckSquare, Square, Plus } from "lucide-react"; // Added Plus icon
import { MOCK_TASKS } from "@/lib/mock-data";
import AddTaskModal from "@/components/modals/AddTaskModal"; // ✅ Import your modal

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

interface Props {
  refreshKey: number;
  onChanged: () => void;
}

export default function TodayPriorities({ refreshKey, onChanged }: Props) {
  const { activeWorkspace, workspaces, isDemo } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: State to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) return;

    if (isDemo) {
      const filtered = MOCK_TASKS.filter(
        (t) => t.workspace_id === activeWorkspace.id
      );
      setTasks(filtered);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .or(`due_date.eq.${todayISO()},status.eq.missed`)
      .order("priority")
      .then(({ data }) => {
        setTasks(data ?? []);
        setLoading(false);
      });
  }, [activeWorkspace, refreshKey, isDemo]);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    if (isDemo) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
      onChanged();
      return;
    }
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    onChanged();
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  // ✅ NEW: Rich, action-oriented Empty State
  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="p-3 rounded-full bg-violet-100 text-violet-600 mb-3">
          <CheckSquare size={28} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          No tasks due today
        </h3>
        <p className="text-xs text-slate-500 max-w-[260px] mb-5">
          You're all caught up! Add a new priority to keep your day focused and productive.
        </p>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/30"
        >
          <Plus size={16} />
          Add your first task
        </button>

        {/* ✅ Render the modal right here when open */}
        {isModalOpen && (
          <AddTaskModal
            onClose={() => setIsModalOpen(false)}
            onSaved={() => {
              setIsModalOpen(false);
              onChanged(); // Triggers the useEffect to refetch the new task!
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const ws = wsMap[task.workspace_id];
        const done = task.status === "done";
        return (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all",
              done
                ? "bg-slate-50 border-slate-100 opacity-60"
                : "bg-white border-slate-200 hover:border-slate-300"
            )}
            style={{
              borderLeft: `3px solid ${ws?.color ?? "#94a3b8"}`,
            }}
          >
            <button
              onClick={() => toggleTask(task)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {done ? (
                <CheckSquare size={18} className="text-green-500" />
              ) : (
                <Square size={18} />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  done ? "line-through text-slate-400" : "text-slate-800"
                )}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-slate-400 truncate">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {ws && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${ws.color}15`,
                    color: ws.color,
                  }}
                >
                  {ws.name}
                </span>
              )}
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: PRIORITY_COLORS[task.priority] ?? "#94a3b8",
                }}
                title={task.priority}
              />
              {task.status === "missed" && (
                <span className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Missed
                </span>
              )}
            </div>
          </div>
        );
      })}
      
      {/* ✅ Bonus: Keep a subtle "Add" button visible even when tasks exist */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-sm flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={16} /> Add another task
      </button>

      {/* ✅ Render the modal here too, so users can add tasks from the list view */}
      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/utils";
import { X } from "lucide-react";
import type { TaskPriority } from "@/lib/types";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const PRIORITIES: { label: string; value: TaskPriority; color: string }[] = [
  { label: "High", value: "high", color: "#ef4444" },
  { label: "Medium", value: "medium", color: "#f59e0b" },
  { label: "Low", value: "low", color: "#22c55e" },
];

export default function AddTaskModal({ onClose, onSaved }: Props) {
  // ✅ We only need activeWorkspace now. No need for the full workspaces list.
  const { activeWorkspace } = useWorkspace();
  
  const [title, setTitle] = useState("");
  // ❌ REMOVED: const [workspaceId, setWorkspaceId] = useState(...)
  const [dueDate, setDueDate] = useState(todayISO());
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    
    // ✅ NEW: Safety check to ensure a workspace is active
    if (!activeWorkspace) { 
      setError("No workspace selected. Please switch workspaces and try again."); 
      return; 
    }

    setLoading(true);
    setError("");

    // ✅ UPDATED: Auto-assign workspace_id and user_id from the active workspace
    const { error: err } = await supabase.from("tasks").insert({
      title: title.trim(),
      workspace_id: activeWorkspace.id,
      user_id: activeWorkspace.user_id,
      due_date: dueDate || null,
      priority,
      status: "todo",
      confirmed: false,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Add Task</h2>
            {/* ✅ NEW: Visual badge showing where the task is going */}
            {activeWorkspace && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                Adding to:
                <span
                  className="font-medium px-2 py-0.5 rounded-full text-[10px]"
                  style={{ backgroundColor: `${activeWorkspace.color}15`, color: activeWorkspace.color }}
                >
                  {activeWorkspace.name}
                </span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Task title *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-800"
            />
          </div>

          {/* ❌ REMOVED: The entire Workspace selection section is gone! */}

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-700"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(({ label, value, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium border-2 transition-all"
                  style={{
                    borderColor: priority === value ? color : "transparent",
                    backgroundColor: priority === value ? `${color}15` : "#f1f5f9",
                    color: priority === value ? color : "#64748b",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
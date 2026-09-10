"use client";

import { CheckSquare, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/utils";
import type { Task, Workspace } from "@/lib/types";
import TaskDetails from "./TaskDetails";
import OverdueActions from "./overdueActions";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

// ✅ FIX 1: Group props to reduce the "10 props" linter warning
interface TaskItemProps {
  task: Task;
  workspace: Workspace | undefined;
  reschedule: {
    isRescheduling: boolean;
    date: string;
    setId: (id: string | null) => void;
    setDate: (date: string) => void;
    onSubmit: (task: Task) => void;
  };
  actions: {
    onToggle: (task: Task) => void;
    onDelete: (task: Task) => void;
    onMarkDone: (task: Task) => void;
  };
}

export default function TaskItem({ task, workspace, reschedule, actions }: TaskItemProps) {
  const today = todayISO();
  const isOverdue = task.due_date && task.due_date < today && !task.confirmed;
  const done = task.status === "done";

  return (
    <div
      className={cn(
        "p-3 rounded-xl border bg-white transition-all",
        isOverdue ? "border-red-200 bg-red-50/30" : "border-slate-200 hover:border-slate-300"
      )}
      style={{ borderLeft: `3px solid ${workspace?.color ?? "#94a3b8"}` }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => actions.onToggle(task)}
          className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title={done ? "Mark as to-do" : "Mark as done"}
        >
          {done ? <CheckSquare size={17} className="text-green-500" /> : <Square size={17} />}
        </button>
        
        {/* ✅ FIX 2: Extracted middle column reduces JSX depth from 6 to 3 */}
        <TaskDetails task={task} />
        
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {workspace && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
            >
              {workspace.name}
            </span>
          )}
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? "#94a3b8" }}
            title={`Priority: ${task.priority}`}
          />
          <button
            onClick={() => actions.onDelete(task)}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isOverdue && !done && (
        <OverdueActions
          task={task}
          isRescheduling={reschedule.isRescheduling}
          rescheduleDate={reschedule.date}
          onMarkDone={actions.onMarkDone}
          onSetReschedulingId={reschedule.setId}
          onSetRescheduleDate={reschedule.setDate}
          onReschedule={reschedule.onSubmit}
        />
      )}
    </div>
  );
}
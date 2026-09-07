"use client";

import { CheckSquare, Square, Calendar, CheckCircle, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayISO, formatDate, daysAgo } from "@/lib/utils";
import type { Task, Workspace } from "@/lib/types";

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

interface TaskItemProps {
  task: Task;
  workspace: Workspace | undefined;
  isRescheduling: boolean;
  rescheduleDate: string;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMarkDone: (task: Task) => void;
  onSetReschedulingId: (id: string | null) => void;
  onSetRescheduleDate: (date: string) => void;
  onReschedule: (task: Task) => void;
}

export default function TaskItem({
  task,
  workspace,
  isRescheduling,
  rescheduleDate,
  onToggle,
  onDelete,
  onMarkDone,
  onSetReschedulingId,
  onSetRescheduleDate,
  onReschedule,
}: TaskItemProps) {
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
          onClick={() => onToggle(task)}
          className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          title={done ? "Mark as to-do" : "Mark as done"}
        >
          {done ? <CheckSquare size={17} className="text-green-500" /> : <Square size={17} />}
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
                {isOverdue ? `${daysAgo(task.due_date)} days overdue` : formatDate(task.due_date)}
              </span>
            )}
            <span className="text-xs text-slate-400">{STATUS_LABELS[task.status]}</span>
          </div>
        </div>
        
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
            onClick={() => onDelete(task)}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
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
                onChange={(e) => onSetRescheduleDate(e.target.value)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={() => onReschedule(task)}
                disabled={!rescheduleDate}
                className="px-2 py-1 bg-amber-500 text-white text-xs rounded-lg disabled:opacity-50 hover:bg-amber-600 transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => onSetReschedulingId(null)}
                className="text-xs text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSetReschedulingId(task.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Calendar size={11} /> Reschedule
              </button>
              <button
                onClick={() => onMarkDone(task)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                <CheckCircle size={11} /> Done
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
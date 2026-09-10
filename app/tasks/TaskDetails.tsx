"use client";

import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayISO, formatDate, daysAgo } from "@/lib/utils";
import type { Task } from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  missed: "Missed",
};

export default function TaskDetails({ task }: { task: Task }) {
  const today = todayISO();
  const isOverdue = task.due_date && task.due_date < today && !task.confirmed;
  const done = task.status === "done";

  return (
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
  );
}
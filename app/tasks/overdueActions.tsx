"use client";

import { Calendar, CheckCircle } from "lucide-react";
import { todayISO } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface OverdueActionsProps {
  task: Task;
  isRescheduling: boolean;
  rescheduleDate: string;
  onMarkDone: (task: Task) => void;
  onSetReschedulingId: (id: string | null) => void;
  onSetRescheduleDate: (date: string) => void;
  onReschedule: (task: Task) => void;
}

export default function OverdueActions({
  task,
  isRescheduling,
  rescheduleDate,
  onMarkDone,
  onSetReschedulingId,
  onSetRescheduleDate,
  onReschedule,
}: OverdueActionsProps) {
  const today = todayISO();

  return (
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
  );
}
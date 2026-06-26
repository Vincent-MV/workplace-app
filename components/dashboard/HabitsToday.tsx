"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Habit, HabitLog } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { Flame, Square, CheckSquare } from "lucide-react";
import { MOCK_HABITS, MOCK_HABIT_LOGS } from "@/lib/mock-data";

interface HabitWithLog extends Habit {
  todayLog?: HabitLog;
  todayCompleted: boolean;
}

interface Props {
  refreshKey: number;
}

export default function HabitsToday({ refreshKey }: Props) {
  const { workspaces, isDemo } = useWorkspace();
  const [habits, setHabits] = useState<HabitWithLog[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = workspaces[0]?.user_id;

  const fetchHabits = async () => {
    if (isDemo) {
      const logsMap = Object.fromEntries(
        MOCK_HABIT_LOGS.map((l) => [l.habit_id, l])
      );
      setHabits(
        MOCK_HABITS.map((h) => ({
          ...h,
          todayLog: logsMap[h.id],
          todayCompleted: logsMap[h.id]?.completed ?? false,
        }))
      );
      setLoading(false);
      return;
    }

    if (!userId) return;
    setLoading(true);
    const today = todayISO();
    const [{ data: habitsData }, { data: logsData }] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", userId).order("created_at"),
      supabase.from("habit_logs").select("*").eq("log_date", today),
    ]);

    const logsMap = Object.fromEntries(
      (logsData ?? []).map((l: HabitLog) => [l.habit_id, l])
    );

    setHabits(
      (habitsData ?? []).map((h: Habit) => ({
        ...h,
        todayLog: logsMap[h.id],
        todayCompleted: logsMap[h.id]?.completed ?? false,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchHabits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, refreshKey, isDemo]);

  const toggleHabit = async (habit: HabitWithLog) => {
    const newCompleted = !habit.todayCompleted;

    if (isDemo) {
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id ? { ...h, todayCompleted: newCompleted } : h
        )
      );
      return;
    }

    const today = todayISO();
    if (habit.todayLog) {
      await supabase
        .from("habit_logs")
        .update({ completed: newCompleted })
        .eq("id", habit.todayLog.id);
    } else {
      await supabase
        .from("habit_logs")
        .insert({ habit_id: habit.id, log_date: today, completed: newCompleted });
    }

    if (newCompleted) {
      await supabase
        .from("habits")
        .update({ streak_count: habit.streak_count + 1 })
        .eq("id", habit.id);
    }

    fetchHabits();
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

  if (!habits.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Flame size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No habits tracked yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            habit.todayCompleted
              ? "bg-green-50 border-green-100"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <button
            onClick={() => toggleHabit(habit)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {habit.todayCompleted ? (
              <CheckSquare size={18} className="text-green-500" />
            ) : (
              <Square size={18} />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                habit.todayCompleted ? "line-through text-slate-400" : "text-slate-800"
              }`}
            >
              {habit.name}
            </p>
            {habit.description && (
              <p className="text-xs text-slate-400 truncate">{habit.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-orange-500 flex-shrink-0">
            <Flame size={13} />
            <span className="text-xs font-semibold">{habit.streak_count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

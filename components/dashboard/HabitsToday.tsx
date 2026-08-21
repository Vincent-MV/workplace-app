"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Habit, HabitLog } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { Flame, Square, CheckSquare, Plus } from "lucide-react"; // Added Plus
import { MOCK_HABITS, MOCK_HABIT_LOGS } from "@/lib/mock-data";
import AddHabitModal from "@/components/modals/AddHabitModal"; // ✅ Import the new modal

interface HabitWithLog extends Habit {
  todayLog?: HabitLog;
  todayCompleted: boolean;
}

interface Props {
  refreshKey: number;
  onChanged?: () => void; // ✅ Added to match other widgets
}

export default function HabitsToday({ refreshKey, onChanged }: Props) {
  const { workspaces, isDemo, activeWorkspace } = useWorkspace();
  const [habits, setHabits] = useState<HabitWithLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: State to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = activeWorkspace?.user_id ?? workspaces[0]?.user_id;

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
      onChanged?.();
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
    onChanged?.();
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

  // ✅ NEW: Rich, action-oriented, instantly understandable Empty State
  if (!habits.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="p-3 rounded-full bg-amber-100 text-amber-600 mb-3">
          <Flame size={28} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          Start building your habits
        </h3>
        <p className="text-xs text-slate-500 max-w-[260px] mb-5 leading-relaxed">
          Small, consistent actions create big results. Add your first daily habit to start tracking your progress and building your streak.
        </p>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/30"
        >
          <Plus size={16} />
          Add your first habit
        </button>

        {/* ✅ Render the modal right here when open */}
        {isModalOpen && (
          <AddHabitModal
            onClose={() => setIsModalOpen(false)}
            onSaved={() => {
              setIsModalOpen(false);
              onChanged?.(); // Triggers parent to refresh the list!
            }}
          />
        )}
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
              className={`text-sm font-medium truncate ${
                habit.todayCompleted ? "line-through text-slate-400" : "text-slate-800"
              }`}
            >
              {habit.name}
            </p>
            {habit.description && (
              <p className="text-xs text-slate-400 truncate">{habit.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
            <Flame size={13} className={habit.todayCompleted ? "opacity-50" : ""} />
            <span className="text-xs font-semibold">{habit.streak_count}</span>
          </div>
        </div>
      ))}
      
      {/* ✅ Bonus: Subtle "Add" button visible even when habits exist */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-sm flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={16} /> Add another habit
      </button>

      {/* ✅ Render the modal here too */}
      {isModalOpen && (
        <AddHabitModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            onChanged?.();
          }}
        />
      )}
    </div>
  );
}
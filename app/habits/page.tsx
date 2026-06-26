"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Habit, HabitLog } from "@/lib/types";
import { todayISO } from "@/lib/utils";
import { Flame, Plus, X, CheckSquare, Square } from "lucide-react";

interface HabitWithLog extends Habit {
  todayLog?: HabitLog;
  todayCompleted: boolean;
}

export default function HabitsPage() {
  const { workspaces } = useWorkspace();
  const userId = workspaces[0]?.user_id;
  const [habits, setHabits] = useState<HabitWithLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchHabits = async () => {
    if (!userId) return;
    setLoading(true);
    const today = todayISO();
    const [{ data: habitsData }, { data: logsData }] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", userId).order("created_at"),
      supabase.from("habit_logs").select("*").eq("log_date", today),
    ]);
    const logsMap = Object.fromEntries((logsData ?? []).map((l: HabitLog) => [l.habit_id, l]));
    setHabits(
      (habitsData ?? []).map((h: Habit) => ({
        ...h,
        todayLog: logsMap[h.id],
        todayCompleted: logsMap[h.id]?.completed ?? false,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchHabits(); }, [userId]);

  const toggleHabit = async (habit: HabitWithLog) => {
    const today = todayISO();
    const newCompleted = !habit.todayCompleted;
    if (habit.todayLog) {
      await supabase.from("habit_logs").update({ completed: newCompleted }).eq("id", habit.todayLog.id);
    } else {
      await supabase.from("habit_logs").insert({ habit_id: habit.id, log_date: today, completed: newCompleted });
    }
    if (newCompleted) {
      await supabase.from("habits").update({ streak_count: habit.streak_count + 1 }).eq("id", habit.id);
    }
    fetchHabits();
  };

  const createHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !name.trim()) return;
    await supabase.from("habits").insert({ user_id: userId, name: name.trim(), description: description.trim() || null, streak_count: 0 });
    setName(""); setDescription(""); setShowForm(false);
    fetchHabits();
  };

  const deleteHabit = async (id: string) => {
    await supabase.from("habits").delete().eq("id", id);
    fetchHabits();
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Habits</h1>
            <p className="text-sm text-slate-500">Daily habit tracker</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} />New Habit
          </button>
        </div>

        {showForm && (
          <form onSubmit={createHabit} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 animate-slide-down">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">New Habit</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Habit name *"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
            <button type="submit" className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">
              Add Habit
            </button>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Flame size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">No habits yet — add one above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => (
              <div key={habit.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${habit.todayCompleted ? "bg-green-50 border-green-100" : "bg-white border-slate-200"}`}>
                <button onClick={() => toggleHabit(habit)} className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors">
                  {habit.todayCompleted ? <CheckSquare size={20} className="text-green-500" /> : <Square size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${habit.todayCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>{habit.name}</p>
                  {habit.description && <p className="text-xs text-slate-400 truncate">{habit.description}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame size={14} /><span className="text-sm font-bold">{habit.streak_count}</span>
                  </div>
                  <button onClick={() => deleteHabit(habit.id)} className="text-slate-300 hover:text-red-400 transition-colors"><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

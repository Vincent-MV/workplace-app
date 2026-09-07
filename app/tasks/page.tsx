"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import { todayISO, cn } from "@/lib/utils";
import { Coffee, Sun, CalendarClock, Sparkles, Plus } from "lucide-react";
import DeletionTaskModal from "@/components/modals/DeletionTaskModal";
import AddTaskModal from "@/components/modals/AddTaskModal";
import TaskItem from "@/app/tasks/taskItem"; // ✅ Corrected import path

const EMPTY_STATES = {
  overdue: {
    icon: <Coffee size={40} className="text-amber-500" />,
    iconBg: "bg-amber-100",
    title: "Don't stress, it happens! 🧘",
    desc: "Take a deep breath. Reschedule it or tackle just one small thing today. Progress over perfection.",
    buttonText: "Reschedule a task",
  },
  today: {
    icon: <Sun size={40} className="text-violet-500" />,
    iconBg: "bg-violet-100",
    title: "You've got this! 💪",
    desc: "Focus on your top priorities. Take it one step at a time and celebrate the small wins.",
    buttonText: "Add a task for today",
  },
  upcoming: {
    icon: <CalendarClock size={40} className="text-blue-500" />,
    iconBg: "bg-blue-100",
    title: "Looking ahead! 🗓️",
    desc: "A little planning now saves a lot of stress later. Your future self will thank you.",
    buttonText: "Schedule a future task",
  },
  all: {
    icon: <Sparkles size={40} className="text-green-500" />,
    iconBg: "bg-green-100",
    title: "All caught up! 🎉",
    desc: "Enjoy the free time, or add a new task to keep your momentum going.",
    buttonText: "Add your first task",
  },
};

export default function TasksPage() {
  const { activeWorkspace, workspaces } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "overdue" | "today" | "upcoming">("all");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const fetchTasks = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("due_date", { nullsFirst: false });
    setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, [activeWorkspace]);

  const today = todayISO();

  const filteredTasks = tasks.filter((t) => {
    if (filter === "overdue") return t.due_date && t.due_date < today && !t.confirmed;
    if (filter === "today") return t.due_date === today;
    if (filter === "upcoming") return t.due_date && t.due_date > today;
    return true;
  });

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
  };

  const markDone = async (task: Task) => {
    await supabase.from("tasks").update({ confirmed: true, status: "done" }).eq("id", task.id);
    fetchTasks();
  };

  const initiateDelete = (task: Task) => setTaskToDelete(task);

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    setTaskToDelete(null);
    const { error } = await supabase.from("tasks").delete().eq("id", taskToDelete.id);
    if (error) console.error("Failed to delete task:", error);
    fetchTasks(); 
  };

  const handleReschedule = async (task: Task) => {
    if (!rescheduleDate) return;
    await supabase.from("tasks").update({ due_date: rescheduleDate, confirmed: false }).eq("id", task.id);
    setReschedulingId(null);
    setRescheduleDate("");
    fetchTasks();
  };

  const FILTERS = [
    { label: "All", value: "all" as const },
    { label: "Overdue", value: "overdue" as const },
    { label: "Today", value: "today" as const },
    { label: "Upcoming", value: "upcoming" as const },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tasks</h1>
            <p className="text-sm text-slate-500">{activeWorkspace?.name ?? "All workspaces"}</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-sm shadow-violet-500/20"
          >
            <Plus size={15} /> New Task
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer",
                filter === value ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              {label}
              {value === "overdue" && (
                <span className="ml-1 text-red-400">
                  ({tasks.filter((t) => t.due_date && t.due_date < today && !t.confirmed).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200"
          >
            <div className={cn("p-4 rounded-full mb-4", EMPTY_STATES[filter].iconBg)}>
              {EMPTY_STATES[filter].icon}
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">{EMPTY_STATES[filter].title}</h3>
            <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">{EMPTY_STATES[filter].desc}</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/30 cursor-pointer"
            >
              <Plus size={16} /> {EMPTY_STATES[filter].buttonText}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {/* ✅ COMPLEXITY FIXED: The map is now clean and shallow! */}
            {filteredTasks.map((task) => (
              <TaskItem 
                key={task.id}
                task={task}
                workspace={wsMap[task.workspace_id]}
                isRescheduling={reschedulingId === task.id}
                rescheduleDate={rescheduleDate}
                onToggle={toggleTask}
                onDelete={initiateDelete}
                onMarkDone={markDone}
                onSetReschedulingId={setReschedulingId}
                onSetRescheduleDate={setRescheduleDate}
                onReschedule={handleReschedule}
              />
            ))}
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-3 mt-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-sm flex items-center justify-center gap-2 font-semibold cursor-pointer"
            >
              <Plus size={16} /> Add another task
            </button>
          </div>
        )}
      </div>

      {taskToDelete && (
        <DeletionTaskModal
          taskTitle={taskToDelete.title} 
          onClose={() => setTaskToDelete(null)} 
          onConfirm={confirmDelete} 
        />
      )}
      
      {isAddModalOpen && (
        <AddTaskModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSaved={() => { setIsAddModalOpen(false); fetchTasks(); }} 
        />
      )}
    </AppShell>
  );
}
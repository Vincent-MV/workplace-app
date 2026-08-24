"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import { todayISO, formatDate, daysAgo, cn } from "@/lib/utils";
import { 
  CheckSquare, Square, Calendar, CheckCircle, Clock, Trash2, 
  Coffee, Sun, CalendarClock, Sparkles, Plus 
} from "lucide-react";
import DeletionTaskModal from "@/components/modals/DeletionTaskModal";
import AddTaskModal from "@/components/modals/AddTaskModal";

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

// ✅ Contextual Empty States with action buttons
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
  
  // Modal states
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
    return true; // "all"
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

  const initiateDelete = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    setTaskToDelete(null);

    const { error } = await supabase.from("tasks").delete().eq("id", taskToDelete.id);
    if (error) {
      console.error("Failed to delete task:", error);
      fetchTasks(); 
    }
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
        {/* ✅ HEADER: Fixed button text and onClick handler */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tasks</h1>
            <p className="text-sm text-slate-500">
              {activeWorkspace?.name ?? "All workspaces"}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-sm shadow-violet-500/20"
          >
            <Plus size={15} /> New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer",
                filter === value
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
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

        {/* Task list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          // ✅ EMPTY STATE: Prominent, impossible-to-miss action button
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200"
          >
            <div className={cn("p-4 rounded-full mb-4", EMPTY_STATES[filter].iconBg)}>
              {EMPTY_STATES[filter].icon}
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              {EMPTY_STATES[filter].title}
            </h3>
            <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">
              {EMPTY_STATES[filter].desc}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/30 cursor-pointer"
            >
              <Plus size={16} />
              {EMPTY_STATES[filter].buttonText}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const ws = wsMap[task.workspace_id];
              const isOverdue = task.due_date && task.due_date < today && !task.confirmed;
              const done = task.status === "done";
              const isRescheduling = reschedulingId === task.id;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-3 rounded-xl border bg-white transition-all",
                    isOverdue ? "border-red-200 bg-red-50/30" : "border-slate-200 hover:border-slate-300"
                  )}
                  style={{ borderLeft: `3px solid ${ws?.color ?? "#94a3b8"}` }}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleTask(task)}
                      className="flex-shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      title={done ? "Mark as to-do" : "Mark as done"}
                    >
                      {done ? (
                        <CheckSquare size={17} className="text-green-500" />
                      ) : (
                        <Square size={17} />
                      )}
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
                            {isOverdue
                              ? `${daysAgo(task.due_date)} days overdue`
                              : formatDate(task.due_date)}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">{STATUS_LABELS[task.status]}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {ws && (
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${ws.color}15`, color: ws.color }}
                        >
                          {ws.name}
                        </span>
                      )}
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? "#94a3b8" }}
                        title={`Priority: ${task.priority}`}
                      />
                      <button
                        onClick={() => initiateDelete(task)}
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
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                          />
                          <button
                            onClick={() => handleReschedule(task)}
                            disabled={!rescheduleDate}
                            className="px-2 py-1 bg-amber-500 text-white text-xs rounded-lg disabled:opacity-50 hover:bg-amber-600 transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setReschedulingId(null); setRescheduleDate(""); }}
                            className="text-xs text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setReschedulingId(task.id)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <Calendar size={11} /> Reschedule
                          </button>
                          <button
                            onClick={() => markDone(task)}
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
            })}
            
            {/* ✅ BONUS: Secondary "Add Task" button at the bottom of the list */}
            {/* This ensures that even when the list has items, users don't have to scroll back to the top to add a new one. */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full py-3 mt-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-sm flex items-center justify-center gap-2 font-semibold cursor-pointer"
            >
              <Plus size={16} /> Add another task
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
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
          onSaved={() => { 
            setIsAddModalOpen(false); 
            fetchTasks(); 
          }} 
        />
      )}
    </AppShell>
  );
}
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { supabase } from "@/lib/supabase"; // Browser client for mutations only
import type { Task, Workspace } from "@/lib/types"; // Ensure Workspace is in your types
import { todayISO, cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { TASK_EMPTY_STATES } from "@/lib/constant/task-empty-states";
import DeletionTaskModal from "@/components/modals/DeletionTaskModal";
import AddTaskModal from "@/components/modals/AddTaskModal";
import TaskItem from "./taskItem"; 

interface TasksPageClientProps {
  initialTasks: Task[];
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
}

export default function TasksPageClient({ 
  initialTasks, 
  workspaces, 
  activeWorkspace 
}: TasksPageClientProps) {
  //  Initialize state with server-fetched data. No initial "loading" state needed!
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<"all" | "overdue" | "today" | "upcoming">("all");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));
  const today = todayISO();

  const filteredTasks = tasks.filter((t) => {
    if (filter === "overdue") return t.due_date && t.due_date < today && !t.confirmed;
    if (filter === "today") return t.due_date === today;
    if (filter === "upcoming") return t.due_date && t.due_date > today;
    return true;
  });

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    
    // 1. Optimistic Update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    
    // 2. Background Sync
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    if (error) {
      // Rollback on error
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      console.error("Failed to toggle task:", error);
    }
  };

  const markDone = async (task: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, confirmed: true, status: "done" } : t)));
    const { error } = await supabase.from("tasks").update({ confirmed: true, status: "done" }).eq("id", task.id);
    if (error) console.error("Failed to mark done:", error);
  };

  const initiateDelete = (task: Task) => setTaskToDelete(task);

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    const deletedTask = taskToDelete;
    
    // 1. Optimistic Update
    setTasks((prev) => prev.filter((t) => t.id !== deletedTask.id));
    setTaskToDelete(null);
    
    // 2. Background Sync
    const { error } = await supabase.from("tasks").delete().eq("id", deletedTask.id);
    if (error) {
      console.error("Failed to delete task:", error);
      // Optional: Re-fetch or rollback here
    }
  };

  const handleReschedule = async (task: Task) => {
    if (!rescheduleDate) return;
    
    // 1. Optimistic Update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, due_date: rescheduleDate, confirmed: false } : t)));
    
    // 2. Background Sync
    const { error } = await supabase.from("tasks").update({ due_date: rescheduleDate, confirmed: false }).eq("id", task.id);
    if (error) console.error("Failed to reschedule:", error);
    
    setReschedulingId(null);
    setRescheduleDate("");
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

        {/* Loading spinner removed! Data is already here from the server. */}
        {filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200"
          >
            <div className={cn("p-4 rounded-full mb-4", TASK_EMPTY_STATES[filter].iconBg)}>
              {TASK_EMPTY_STATES[filter].icon}
            </div>

            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              {TASK_EMPTY_STATES[filter].title}
            </h3>

            <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">
              {TASK_EMPTY_STATES[filter].desc}
            </p>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/30 cursor-pointer"
            >
              <Plus size={16} /> {TASK_EMPTY_STATES[filter].buttonText}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskItem 
                key={task.id}
                task={task}
                workspace={wsMap[task.workspace_id]}
                reschedule={{
                  isRescheduling: reschedulingId === task.id,
                  date: rescheduleDate,
                  setId: setReschedulingId,
                  setDate: setRescheduleDate,
                  onSubmit: handleReschedule,
                }}
                actions={{
                  onToggle: toggleTask,
                  onDelete: initiateDelete,
                  onMarkDone: markDone,
                }}
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
          onSaved={() => { 
            setIsAddModalOpen(false); 
            // Note: AddTaskModal should ideally return the new task data to append optimistically, 
            // but re-fetching is fine for V1.5 transition.
            window.location.reload(); // Temporary: Replace with optimistic append once AddTaskModal is refactored
          }} 
        />
      )}
    </AppShell>
  );
}
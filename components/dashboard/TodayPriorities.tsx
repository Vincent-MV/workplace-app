"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import { todayISO, cn } from "@/lib/utils";
import { CheckSquare, Square, Plus, CheckCircle, ChevronDown, ChevronUp, Trash2, RotateCcw } from "lucide-react"; 
import { MOCK_TASKS } from "@/lib/mock-data";
import AddTaskModal from "@/components/modals/AddTaskModal"; 
import DeletionTaskModal from "@/components/modals/DeletionTaskModal";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

interface Props {
  refreshKey: number;
  onChanged: () => void;
}

export default function TodayPriorities({ refreshKey, onChanged }: Props) {
  const { activeWorkspace, workspaces, isDemo } = useWorkspace();
  
  // Split tasks into active and completed for the "History" feature
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  const [showCompleted, setShowCompleted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWorkspace) return;

    if (isDemo) {
      const filtered = MOCK_TASKS.filter((t) => t.workspace_id === activeWorkspace.id);
      setActiveTasks(filtered.filter(t => t.status !== "done"));
      setCompletedTasks(filtered.filter(t => t.status === "done"));
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .or(`due_date.eq.${todayISO()},status.eq.missed,status.eq.done`)
      .order("priority")
      .then(({ data }) => {
        const fetched = data ?? [];
        setActiveTasks(fetched.filter(t => t.status !== "done"));
        setCompletedTasks(fetched.filter(t => t.status === "done"));
        setLoading(false);
      });
  }, [activeWorkspace, refreshKey, isDemo]);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  // ✅ 1. CHECK TASK: Smoothly moves to completed, no strikethrough clutter
  const toggleTask = async (task: Task) => {
    const isCompleting = task.status !== "done";
    
    // Optimistic UI update: Remove from active, add to completed immediately
    setActiveTasks((prev) => prev.filter((t) => t.id !== task.id));
    if (isCompleting) {
      setCompletedTasks((prev) => [{ ...task, status: "done" }, ...prev]);
      setSuccessMessage("Task completed! 🎉");
      setTimeout(() => setSuccessMessage(null), 1500); // Brief celebration
    } else {
      // Unchecking: move back to active
      setCompletedTasks((prev) => prev.filter((t) => t.id !== task.id));
      setActiveTasks((prev) => [{ ...task, status: "todo" }, ...prev]);
    }

    if (isDemo) {
      onChanged();
      return;
    }
    
    await supabase.from("tasks").update({ status: isCompleting ? "done" : "todo" }).eq("id", task.id);
    onChanged();
  };

  // ✅ 2. DELETE TASK: Opens modal instead of alert
  const initiateDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    // Optimistic removal from completed list
    setCompletedTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);

    if (!isDemo) {
      await supabase.from("tasks").delete().eq("id", taskToDelete.id);
      onChanged();
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}
      </div>
    );
  }

  // ✅ SUCCESS CELEBRATION (Briefly overlays the empty state)
  if (successMessage && activeTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-green-50 border border-green-200"
      >
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.4 }} className="mb-3 text-green-600">
          <CheckCircle size={32} />
        </motion.div>
        <h3 className="text-sm font-semibold text-green-800">{successMessage}</h3>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* --- ACTIVE TASKS --- */}
      {activeTasks.length === 0 && !successMessage ? (
        // EMPTY STATE
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="p-3 rounded-full bg-violet-100 text-violet-600 mb-3">
            <CheckSquare size={28} />
          </motion.div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">No tasks due today</h3>
          <p className="text-xs text-slate-500 max-w-[260px] mb-5 leading-relaxed">
            You're all caught up! Add a new priority to keep your day focused.
          </p>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-500/20 hover:shadow-md cursor-pointer">
            <Plus size={16} /> Add your first task
          </button>
        </div>
      ) : (
        // ACTIVE LIST with smooth exit animations
        <AnimatePresence mode="popLayout">
          {activeTasks.map((task) => {
            const ws = wsMap[task.workspace_id];
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 p-3 rounded-xl border bg-white border-slate-200 hover:border-slate-300 transition-all"
                style={{ borderLeft: `3px solid ${ws?.color ?? "#94a3b8"}` }}
              >
                {/* No cursor-pointer here, feels more natural for a checkbox */}
                <button onClick={() => toggleTask(task)} className="flex-shrink-0 text-slate-400 hover:text-green-600 transition-colors" title="Mark as done">
                  <Square size={18} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                  {task.description && <p className="text-xs text-slate-400 truncate">{task.description}</p>}
                </div>
                
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {ws && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${ws.color}15`, color: ws.color }}>{ws.name}</span>}
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[task.priority] ?? "#94a3b8" }} title={`Priority: ${task.priority}`} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      {/* --- COMPLETED HISTORY (Collapsible) --- */}
      {completedTasks.length > 0 && (
        <div className="pt-2">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors mb-2"
          >
            {showCompleted ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            Recently Completed ({completedTasks.length})
          </button>

          <AnimatePresence>
            {showCompleted && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {completedTasks.map((task) => {
                  const ws = wsMap[task.workspace_id];
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50/50 border-slate-100 opacity-70 hover:opacity-100 transition-all"
                      style={{ borderLeft: `3px solid ${ws?.color ?? "#94a3b8"}` }}
                    >
                      <button onClick={() => toggleTask(task)} className="flex-shrink-0 text-green-600 hover:text-green-700 transition-colors" title="Undo">
                        <CheckSquare size={18} />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-500 line-through truncate">{task.title}</p>
                      </div>
                      
                      <button 
                        onClick={() => initiateDelete(task)} 
                        className="flex-shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* --- ADD BUTTON (Always visible if there are active tasks) --- */}
      {activeTasks.length > 0 && (
        <button onClick={() => setIsAddModalOpen(true)} className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50/50 transition-all text-sm flex items-center justify-center gap-2 font-medium cursor-pointer">
          <Plus size={16} /> Add another task
        </button>
      )}

      {/* --- MODALS --- */}
      {isAddModalOpen && (
        <AddTaskModal onClose={() => setIsAddModalOpen(false)} onSaved={() => { setIsAddModalOpen(false); onChanged(); }} />
      )}
      
      {isDeleteModalOpen && taskToDelete && (
        <DeletionTaskModal 
          taskTitle={taskToDelete.title} 
          onClose={() => { setIsDeleteModalOpen(false); setTaskToDelete(null); }} 
          onConfirm={confirmDelete} 
        />
      )}
    </div>
  );
}
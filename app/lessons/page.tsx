"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Lesson } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { BookOpen, Plus, X } from "lucide-react";
import type { ImportanceLevel } from "@/lib/types";
import ConfirmModal from "@/components/modals/ConfirmModal"; // ✅ Reusable modal

const IMPORTANCE_COLORS: Record<ImportanceLevel, { bg: string; text: string; label: string }> = {
  low: { bg: "#f1f5f9", text: "#64748b", label: "Low" },
  medium: { bg: "#fef9c3", text: "#854d0e", label: "Medium" },
  high: { bg: "#fef3c7", text: "#92400e", label: "High" },
  critical: { bg: "#fee2e2", text: "#991b1b", label: "Critical" },
};

// ✅ NEW: Contextual Empty State for Lesson Library
const EMPTY_STATE = {
  icon: <BookOpen size={40} className="text-blue-500" />,
  iconBg: "bg-blue-100",
  title: "Start building your knowledge base! 📚",
  desc: "Every expert was once a beginner. Add your first lesson to capture key concepts, exam prep, or important insights.",
  buttonText: "Add your first lesson",
};

export default function LessonsPage() {
  const { activeWorkspace, workspaces } = useWorkspace();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", importance: "medium" as ImportanceLevel, tags: "" });
  
  // ✅ NEW: State for the delete modal
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const fetchLessons = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    const { data } = await supabase
      .from("lessons")
      .select("*, lesson_tags(*)")
      .eq("workspace_id", activeWorkspace.id)
      .order("created_at", { ascending: false });
    setLessons(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchLessons(); }, [activeWorkspace]);

  const createLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !form.title.trim()) return;
    const { data: lesson } = await supabase
      .from("lessons")
      .insert({ title: form.title.trim(), content: form.content.trim() || null, importance: form.importance, workspace_id: activeWorkspace.id, user_id: activeWorkspace.user_id })
      .select().single();
    if (lesson && form.tags.trim()) {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag_name) => ({ lesson_id: lesson.id, tag_name }));
      if (tags.length) await supabase.from("lesson_tags").insert(tags);
    }
    setForm({ title: "", content: "", importance: "medium", tags: "" });
    setShowForm(false);
    fetchLessons();
  };

  // ✅ NEW: Professional delete flow
  const initiateDelete = (lesson: Lesson) => {
    setLessonToDelete(lesson);
  };

  const confirmDelete = async () => {
    if (!lessonToDelete) return;
    await supabase.from("lessons").delete().eq("id", lessonToDelete.id);
    setLessonToDelete(null);
    fetchLessons();
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Lesson Library</h1>
            <p className="text-sm text-slate-500">{activeWorkspace?.name}</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={15} />Add Lesson
          </button>
        </div>

        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={createLesson} 
            className="p-4 bg-white rounded-xl border border-violet-200 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">New Lesson</h3>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <input 
              required 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Lesson title *" 
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
            />
            <textarea 
              value={form.content} 
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="What did you learn?" 
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" 
            />
            <div className="flex gap-2 flex-wrap">
              {(["low","medium","high","critical"] as ImportanceLevel[]).map((imp) => (
                <button 
                  key={imp} 
                  type="button" 
                  onClick={() => setForm({ ...form, importance: imp })}
                  className="px-3 py-1 rounded-full text-xs font-medium border-2 transition-all capitalize cursor-pointer"
                  style={{
                    borderColor: form.importance === imp ? IMPORTANCE_COLORS[imp].text : "transparent",
                    backgroundColor: form.importance === imp ? IMPORTANCE_COLORS[imp].bg : "#f1f5f9",
                    color: form.importance === imp ? IMPORTANCE_COLORS[imp].text : "#64748b",
                  }}
                >
                  {imp}
                </button>
              ))}
            </div>
            <input 
              value={form.tags} 
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tags (comma separated, e.g. math, exam, key-concept)"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
            />
            <button 
              type="submit" 
              className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Save Lesson
            </button>
          </motion.form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : lessons.length === 0 && !showForm ? (
          // ✅ NEW: Rich, action-oriented Empty State
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200"
          >
            <div className={`p-4 rounded-full mb-4 ${EMPTY_STATE.iconBg}`}>
              {EMPTY_STATE.icon}
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">{EMPTY_STATE.title}</h3>
            <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">{EMPTY_STATE.desc}</p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 cursor-pointer"
            >
              <Plus size={16} />
              {EMPTY_STATE.buttonText}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => {
              const ws = wsMap[lesson.workspace_id];
              const imp = IMPORTANCE_COLORS[lesson.importance];
              return (
                <motion.div 
                  key={lesson.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
                  style={{ borderLeft: `3px solid ${ws?.color ?? "#94a3b8"}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800">{lesson.title}</p>
                        <span 
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize" 
                          style={{ backgroundColor: imp.bg, color: imp.text }}
                        >
                          {lesson.importance}
                        </span>
                      </div>
                      {lesson.content && <p className="text-xs text-slate-500 line-clamp-3 mb-2">{lesson.content}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {lesson.lesson_tags?.map((tag) => (
                          <span key={tag.id} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            #{tag.tag_name}
                          </span>
                        ))}
                        <span className="text-[10px] text-slate-400 ml-auto">{formatDate(lesson.created_at)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => initiateDelete(lesson)} 
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                      title="Delete lesson"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ Reusable Confirm Modal for Deletion */}
      <ConfirmModal
        isOpen={!!lessonToDelete}
        onClose={() => setLessonToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Lesson?"
        description={`Are you sure you want to delete "${lessonToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </AppShell>
  );
}
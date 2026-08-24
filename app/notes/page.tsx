"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Note } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { FileText, Plus, X, Pencil, Check } from "lucide-react";
import ConfirmModal from "@/components/modals/ConfirmModal"; // ✅ Reusable modal

function AutoTextarea({ value, onChange, placeholder, className }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={3}
      className={className}
      style={{ resize: "none", overflow: "hidden" }}
      onChange={(e) => {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
        onChange(e.target.value);
      }}
      onFocus={(e) => {
        e.target.style.height = "auto";
        e.target.style.height = e.target.scrollHeight + "px";
      }}
    />
  );
}

// ✅ NEW: Contextual Empty State for Notes
const EMPTY_STATE = {
  icon: <FileText size={40} className="text-emerald-500" />,
  iconBg: "bg-emerald-100",
  title: "Capture your thoughts! 📝",
  desc: "Jot down ideas, meeting minutes, or quick reminders. Your notes are safely stored and always accessible.",
  buttonText: "Create your first note",
};

export default function NotesPage() {
  const { activeWorkspace, workspaces } = useWorkspace();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  
  // ✅ NEW: State for the delete modal
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const fetchNotes = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("updated_at", { ascending: false });
    setNotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, [activeWorkspace]);

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !title.trim()) return;
    await supabase.from("notes").insert({ 
      title: title.trim(), 
      body: body.trim() || null, 
      workspace_id: activeWorkspace.id, 
      user_id: activeWorkspace.user_id 
    });
    setTitle(""); 
    setBody(""); 
    setShowForm(false);
    fetchNotes();
  };

  const saveEdit = async (id: string) => {
    await supabase.from("notes").update({ 
      title: editTitle.trim(), 
      body: editBody.trim() || null, 
      updated_at: new Date().toISOString() 
    }).eq("id", id);
    setEditingId(null);
    fetchNotes();
  };

  // ✅ NEW: Professional delete flow
  const initiateDelete = (note: Note) => {
    setNoteToDelete(note);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    await supabase.from("notes").delete().eq("id", noteToDelete.id);
    setNoteToDelete(null);
    fetchNotes();
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Notes</h1>
            <p className="text-sm text-slate-500">{activeWorkspace?.name}</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={15} />New Note
          </button>
        </div>

        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={createNote} 
            className="p-4 bg-white rounded-xl border border-violet-200 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">New Note</h3>
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
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title *"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 font-medium" 
            />
            <AutoTextarea 
              value={body} 
              onChange={setBody}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
            />
            <button 
              type="submit" 
              className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Save Note
            </button>
          </motion.form>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : notes.length === 0 && !showForm ? (
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
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30 cursor-pointer"
            >
              <Plus size={16} />
              {EMPTY_STATE.buttonText}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {notes.map((note) => {
              const ws = wsMap[note.workspace_id];
              const editing = editingId === note.id;
              return (
                <motion.div 
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-2"
                  style={{ borderTop: `3px solid ${ws?.color ?? "#94a3b8"}` }}
                >
                  {editing ? (
                    <>
                      <input 
                        value={editTitle} 
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
                      />
                      <AutoTextarea 
                        value={editBody} 
                        onChange={setEditBody}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
                      />
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => saveEdit(note.id)} 
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          <Check size={11} />Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)} 
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 leading-tight flex-1">{note.title}</p>
                        <div className="flex gap-1 flex-shrink-0">
                          <button 
                            onClick={() => { setEditingId(note.id); setEditTitle(note.title); setEditBody(note.body ?? ""); }}
                            className="text-slate-300 hover:text-violet-500 hover:bg-violet-50 p-1 rounded transition-colors cursor-pointer"
                            title="Edit note"
                          >
                            <Pencil size={13} />
                          </button>
                          <button 
                            onClick={() => initiateDelete(note)} 
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                      {note.body && (
                        <p className="text-xs text-slate-500 line-clamp-4 flex-1 whitespace-pre-wrap">
                          {note.body}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-auto pt-2 border-t border-slate-100">
                        {formatDate(note.updated_at)}
                      </p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ✅ Reusable Confirm Modal for Deletion */}
      <ConfirmModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Note?"
        description={`Are you sure you want to delete "${noteToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </AppShell>
  );
}
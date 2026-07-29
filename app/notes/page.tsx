"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Note } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { FileText, Plus, X, Pencil, Check } from "lucide-react";

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

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const fetchNotes = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    const { data } = await supabase.from("notes").select("*").eq("workspace_id", activeWorkspace.id).order("updated_at", { ascending: false });
    setNotes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, [activeWorkspace]);

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !title.trim()) return;
    await supabase.from("notes").insert({ title: title.trim(), body: body.trim() || null, workspace_id: activeWorkspace.id, user_id: activeWorkspace.user_id });
    setTitle(""); setBody(""); setShowForm(false);
    fetchNotes();
  };

  const saveEdit = async (id: string) => {
    await supabase.from("notes").update({ title: editTitle.trim(), body: editBody.trim() || null, updated_at: new Date().toISOString() }).eq("id", id);
    setEditingId(null);
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
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
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} />New Note
          </button>
        </div>

        {showForm && (
          <form onSubmit={createNote} className="p-4 bg-white rounded-xl border border-violet-200 space-y-3 animate-slide-down">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">New Note</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Title *"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 font-medium" />
            <AutoTextarea value={body} onChange={setBody}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
            <button type="submit" className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">Save Note</button>
          </form>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">No notes yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {notes.map((note) => {
              const ws = wsMap[note.workspace_id];
              const editing = editingId === note.id;
              return (
                <div key={note.id} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col gap-2"
                  style={{ borderTop: `3px solid ${ws?.color ?? "#94a3b8"}` }}>
                  {editing ? (
                    <>
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
                      <AutoTextarea value={editBody} onChange={setEditBody}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(note.id)} className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded-lg">
                          <Check size={11} />Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 hover:underline">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{note.title}</p>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setEditingId(note.id); setEditTitle(note.title); setEditBody(note.body ?? ""); }}
                            className="text-slate-300 hover:text-violet-500 transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => deleteNote(note.id)} className="text-slate-300 hover:text-red-400 transition-colors"><X size={13} /></button>
                        </div>
                      </div>
                      {note.body && <p className="text-xs text-slate-500 line-clamp-4 flex-1">{note.body}</p>}
                      <p className="text-[10px] text-slate-400 mt-auto">{formatDate(note.updated_at)}</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

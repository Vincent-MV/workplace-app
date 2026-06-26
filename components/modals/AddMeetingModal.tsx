"use client";

import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function AddMeetingModal({ onClose, onSaved }: Props) {
  const { workspaces, activeWorkspace } = useWorkspace();
  const [title, setTitle] = useState("");
  const [workspaceId, setWorkspaceId] = useState(activeWorkspace?.id ?? workspaces[0]?.id ?? "");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [location, setLocation] = useState("");
  const [agenda, setAgenda] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (!scheduledAt) { setError("Date & time is required"); return; }
    if (!workspaceId) { setError("Select a workspace"); return; }

    setLoading(true);
    setError("");

    const ws = workspaces.find((w) => w.id === workspaceId);
    if (!ws) { setError("Workspace not found"); setLoading(false); return; }

    const { error: err } = await supabase.from("meetings").insert({
      title: title.trim(),
      workspace_id: workspaceId,
      user_id: ws.user_id,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_mins: durationMins,
      location: location.trim() || null,
      agenda: agenda.trim() || null,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Add Meeting</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Meeting title *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's the meeting about?"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Workspace *</label>
            <div className="flex gap-2 flex-wrap">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  onClick={() => setWorkspaceId(ws.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all"
                  style={{
                    borderColor: workspaceId === ws.id ? ws.color : "transparent",
                    backgroundColor: workspaceId === ws.id ? `${ws.color}15` : "#f1f5f9",
                    color: workspaceId === ws.id ? ws.color : "#64748b",
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ws.color }} />
                  {ws.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date & time *</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
              <input
                type="number"
                min={5}
                step={5}
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room, Zoom link, etc."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Agenda</label>
            <textarea
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Topics to cover..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-700 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Meeting"}
          </button>
        </form>
      </div>
    </div>
  );
}

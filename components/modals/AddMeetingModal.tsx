"use client";

import { useState, useRef, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

const DURATIONS = [30, 60, 90, 120];

export default function AddMeetingModal({ onClose, onSaved }: Props) {
  const { activeWorkspace } = useWorkspace();
  
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [location, setLocation] = useState("");
  const [agenda, setAgenda] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ref for auto-expanding textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea as the user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      // Cap the height at 150px, then let it scroll internally
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [agenda]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (!scheduledAt) { setError("Date & time is required"); return; }
    if (!activeWorkspace) { setError("No active workspace"); return; }

    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("meetings").insert({
      title: title.trim(),
      workspace_id: activeWorkspace.id,
      user_id: activeWorkspace.user_id,
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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Add Meeting</h2>
            {activeWorkspace && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                Adding to:
                <span
                  className="font-medium px-2 py-0.5 rounded-full text-[10px]"
                  style={{ backgroundColor: `${activeWorkspace.color}15`, color: activeWorkspace.color }}
                >
                  {activeWorkspace.name}
                </span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Title */}
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

          {/* Date & Time + Duration */}
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
              <div className="flex gap-1.5">
                {DURATIONS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setDurationMins(min)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      durationMins === min
                        ? "border-violet-400 bg-violet-50 text-violet-700"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progressive Disclosure Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors w-full justify-center py-1"
          >
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showAdvanced ? "Less options" : "+ More options (Location & Agenda)"}
          </button>

          {/* Advanced Fields (Hidden by default) */}
          {showAdvanced && (
            <div className="space-y-4 animate-slide-down">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Room 101, Zoom link, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Agenda</label>
                <textarea
                  ref={textareaRef}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Topics to cover..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 text-slate-700 resize-none overflow-y-auto"
                  style={{ minHeight: "80px" }}
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Submit Button (Sticky at bottom if needed, but here it flows naturally) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
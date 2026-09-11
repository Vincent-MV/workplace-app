"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";

interface MeetingFormProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function MeetingForm({ onClose, onSaved }: MeetingFormProps) {
  const { activeWorkspace } = useWorkspace();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState({
    title: "",
    agenda: "",
    scheduled_at: "",
    duration_mins: 60,
    location: "",
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [form.agenda, showAdvanced]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !form.title.trim() || !form.scheduled_at) return;

    await supabase.from("meetings").insert({
      ...form,
      workspace_id: activeWorkspace.id,
      user_id: activeWorkspace.user_id,
    });

    onSaved(); // Tell parent to refresh and close
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded-xl border border-slate-200 space-y-4"
    >
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">New Meeting</h3>
          {activeWorkspace && (
            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              Adding to:
              <span
                className="font-medium px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${activeWorkspace.color}15`, color: activeWorkspace.color }}
              >
                {activeWorkspace.name}
              </span>
            </p>
          )}
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Meeting title *</label>
        <input
          autoFocus
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="What's the meeting about?"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Date & time *</label>
          <input
            type="datetime-local"
            required
            value={form.scheduled_at}
            onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
          <input
            type="number"
            min={15}
            step={15}
            value={form.duration_mins}
            onChange={(e) => setForm({ ...form, duration_mins: Number(e.target.value) })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="60"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors w-full justify-center py-1 cursor-pointer"
      >
        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showAdvanced ? "Less options" : "+ More options (Location & Agenda)"}
      </button>

      {showAdvanced && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-3 pt-2 border-t border-slate-100 overflow-hidden"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Room 101, Zoom link, etc."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Agenda</label>
            <textarea
              ref={textareaRef}
              value={form.agenda}
              onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="Topics to cover..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none overflow-y-auto"
              style={{ minHeight: "80px" }}
            />
          </div>
        </motion.div>
      )}

      <button type="submit" className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer">
        Schedule Meeting
      </button>
    </motion.form>
  );
}
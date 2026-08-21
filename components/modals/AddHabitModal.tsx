"use client";

import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function AddHabitModal({ onClose, onSaved }: Props) {
  const { activeWorkspace } = useWorkspace();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { 
      setError("Habit name is required"); 
      return; 
    }
    
    if (!activeWorkspace?.user_id) { 
      setError("No active user session. Please try again."); 
      return; 
    }

    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("habits").insert({
      name: name.trim(),
      description: description.trim() || null,
      user_id: activeWorkspace.user_id,
      streak_count: 0,
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
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Add Habit</h2>
            {activeWorkspace && (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                Tracking for:
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Habit name *</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Read for 20 mins, Drink water"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this important to you?"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700 resize-none"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm shadow-amber-500/20"
          >
            {loading ? "Saving..." : "Start Tracking"}
          </button>
        </form>
      </div>
    </div>
  );
}
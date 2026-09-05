"use client";

import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import { COLOR_PALETTE } from "@/lib/utils";  
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function AddWorkspaceModal({ onClose }: Props) {
  const { refreshWorkspaces, setActiveWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { 
      setError("Name is required"); 
      return; 
    }

    setLoading(true);
    setError("");

    // ✅ FIX: Get the user directly from Supabase Auth, not from the workspace list
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in to create a workspace.");
      setLoading(false);
      return;
    }

    const { data: newWorkspace, error: err } = await supabase
      .from("workspaces")
      .insert({
        name: trimmed,
        type: "personal",
        color,
        user_id: user.id, // ✅ Safe and reliable
        is_active: true,
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      await refreshWorkspaces();
      if (newWorkspace) {
        setActiveWorkspace(newWorkspace); // ✅ Instantly switch to the new workspace
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">New Workspace</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. School, Ministry, Work..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}
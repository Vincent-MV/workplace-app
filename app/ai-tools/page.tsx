"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { AiTool } from "@/lib/types";
import { Bot, Plus, X, ExternalLink, Wand2 } from "lucide-react";
import ConfirmModal from "@/components/modals/ConfirmModal"; // ✅ Reusable modal

const FAVICON_URL = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch { return null; }
};

// ✅ NEW: Contextual Empty State for AI Tools
const EMPTY_STATE = {
  icon: <Wand2 size={40} className="text-violet-500" />,
  iconBg: "bg-violet-100",
  title: "Build your AI toolkit! 🤖",
  desc: "Discover and organize the best AI tools to supercharge your workflow. Start by adding your first favorite tool.",
  buttonText: "Add your first AI tool",
};

export default function AiToolsPage() {
  const { workspaces } = useWorkspace();
  const userId = workspaces[0]?.user_id;
  const [tools, setTools] = useState<AiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", category: "", description: "" });
  
  // ✅ NEW: State for the delete modal
  const [toolToDelete, setToolToDelete] = useState<AiTool | null>(null);

  const fetchTools = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setTools(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTools(); }, [userId]);

  const addTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !form.name.trim() || !form.url.trim() || !form.category.trim()) return;
    await supabase.from("ai_tools").insert({ user_id: userId, ...form });
    setForm({ name: "", url: "", category: "", description: "" }); 
    setShowForm(false);
    fetchTools();
  };

  // ✅ NEW: Professional delete flow
  const initiateDelete = (tool: AiTool) => {
    setToolToDelete(tool);
  };

  const confirmDelete = async () => {
    if (!toolToDelete) return;
    await supabase.from("ai_tools").delete().eq("id", toolToDelete.id);
    setToolToDelete(null);
    fetchTools();
  };

  const grouped = tools.reduce<Record<string, AiTool[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">AI Tools</h1>
            <p className="text-sm text-slate-500">Your curated AI toolkit</p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={15} />Add Tool
          </button>
        </div>

        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={addTool} 
            className="p-4 bg-white rounded-xl border border-slate-200 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">New AI Tool</h3>
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input 
                required 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Name *" 
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
              />
              <input 
                required 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Category *" 
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
              />
            </div>
            <input 
              required 
              type="url" 
              value={form.url} 
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="URL * (https://...)" 
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
            />
            <input 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)" 
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" 
            />
            <button 
              type="submit" 
              className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Add Tool
            </button>
          </motion.form>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : tools.length === 0 && !showForm ? (
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
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/30 cursor-pointer"
            >
              <Plus size={16} />
              {EMPTY_STATE.buttonText}
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="space-y-6">
            {Object.entries(grouped).map(([category, catTools]) => (
              <section key={category}>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{category}</h2>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {catTools.map((tool) => (
                    <motion.a
                      layout
                      key={tool.id}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {FAVICON_URL(tool.url) ? (
                          <img 
                            src={FAVICON_URL(tool.url)!} 
                            alt="" 
                            className="w-5 h-5 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} 
                          />
                        ) : (
                          <Bot size={16} className="text-violet-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                            {tool.name}
                          </p>
                          <ExternalLink size={11} className="text-slate-300 group-hover:text-violet-400 flex-shrink-0 transition-colors" />
                        </div>
                        {tool.description && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">{tool.description}</p>
                        )}
                        <p className="text-[10px] text-slate-400 truncate mt-1">
                          {tool.url.replace(/^https?:\/\//, "")}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); initiateDelete(tool); }}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0 opacity-0 group-hover:opacity-100"
                        title="Delete tool"
                      >
                        <X size={13} />
                      </button>
                    </motion.a>
                  ))}
                </motion.div>
              </section>
            ))}
          </motion.div>
        )}
      </div>

      {/* ✅ Reusable Confirm Modal for Deletion */}
      <ConfirmModal
        isOpen={!!toolToDelete}
        onClose={() => setToolToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete AI Tool?"
        description={`Are you sure you want to remove "${toolToDelete?.name}" from your toolkit?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </AppShell>
  );
}
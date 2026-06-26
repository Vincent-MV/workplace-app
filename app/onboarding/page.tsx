"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import { WORKSPACE_PALETTE } from "@/lib/utils";
import {
  GraduationCap,
  Church,
  Briefcase,
  User,
  Check,
  Plus,
  ArrowRight,
  X,
} from "lucide-react";
import type { WorkspaceType } from "@/lib/types";

const PRESETS = [
  {
    name: "School",
    type: "school" as WorkspaceType,
    color: "#6366f1",
    Icon: GraduationCap,
    desc: "Classes, assignments, study sessions",
  },
  {
    name: "Altar Servers",
    type: "ministry" as WorkspaceType,
    color: "#f59e0b",
    Icon: Church,
    desc: "Ministry tasks, meetings, schedules",
  },
  {
    name: "Work",
    type: "work" as WorkspaceType,
    color: "#22c55e",
    Icon: Briefcase,
    desc: "Job, projects, professional tasks",
  },
  {
    name: "Personal",
    type: "personal" as WorkspaceType,
    color: "#ec4899",
    Icon: User,
    desc: "Life admin, goals, personal habits",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshWorkspaces } = useWorkspace();
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["School", "Altar Servers"])
  );
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<WorkspaceType>("personal");
  const [customColor, setCustomColor] = useState(WORKSPACE_PALETTE[2]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePreset = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleCreate = async () => {
    const totalSelected = selected.size + (customName.trim() ? 1 : 0);
    if (totalSelected === 0) {
      setError("Select at least one workspace to continue.");
      return;
    }
    setLoading(true);
    setError("");

    const userId = crypto.randomUUID();
    const toInsert: { name: string; type: WorkspaceType; color: string; user_id: string; is_active: boolean }[] = [];

    PRESETS.filter((p) => selected.has(p.name)).forEach((p) => {
      toInsert.push({ name: p.name, type: p.type, color: p.color, user_id: userId, is_active: true });
    });

    if (customName.trim()) {
      toInsert.push({ name: customName.trim(), type: customType, color: customColor, user_id: userId, is_active: true });
    }

    const { error: err } = await supabase.from("workspaces").insert(toInsert);
    if (err) {
      setError("Couldn't save to database — continuing in demo mode.");
    }

    await refreshWorkspaces();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Brand mark */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-extrabold text-slate-900 text-lg tracking-tight">Nexus</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Set up your workspaces
        </h1>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Pick the areas of your life you want to organize.{" "}
          <span className="text-slate-400">You can add more later from the sidebar.</span>
        </p>

        {/* Preset cards grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {PRESETS.map(({ name, color, Icon, desc }) => {
            const active = selected.has(name);
            return (
              <button
                key={name}
                onClick={() => togglePreset(name)}
                className="relative text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md"
                style={{
                  borderColor: active ? color : "#e2e8f0",
                  backgroundColor: active ? `${color}0d` : "white",
                }}
              >
                {active && (
                  <span
                    className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Check size={11} className="text-white" />
                  </span>
                )}
                <Icon size={22} style={{ color }} className="mb-2.5" />
                <p className="font-semibold text-slate-800 text-sm">{name}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</p>
              </button>
            );
          })}
        </div>

        {/* Custom workspace */}
        {!showCustom ? (
          <button
            onClick={() => setShowCustom(true)}
            className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 mb-6 font-medium transition-colors"
          >
            <Plus size={15} />
            Add a custom workspace
          </button>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Custom Workspace
              </p>
              <button
                onClick={() => { setShowCustom(false); setCustomName(""); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Side Project, Family..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              autoFocus
            />
            <div>
              <p className="text-xs text-slate-400 mb-2">Pick a color</p>
              <div className="flex gap-2 flex-wrap">
                {WORKSPACE_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCustomColor(c)}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: customColor === c ? `3px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["school", "ministry", "work", "personal"] as WorkspaceType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setCustomType(t)}
                  className="py-1.5 rounded-lg text-xs font-medium border-2 transition-all capitalize"
                  style={{
                    borderColor: customType === t ? customColor : "transparent",
                    backgroundColor: customType === t ? `${customColor}15` : "#f1f5f9",
                    color: customType === t ? customColor : "#64748b",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || (selected.size === 0 && !customName.trim())}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-violet-200 disabled:opacity-40 hover:scale-[1.01] active:scale-100"
        >
          {loading ? "Setting up..." : "Enter Nexus"}
          {!loading && <ArrowRight size={16} />}
        </button>

        <p className="text-center text-xs text-slate-400 mt-4">
          You can rename or delete workspaces any time from the sidebar.
        </p>
      </div>
    </div>
  );
}

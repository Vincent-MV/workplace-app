"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Repeat2,
  BookOpen,
  FileText,
  Mic,
  FolderOpen,
  Image,
  MapPin,
  Bot,
  Search,
  X,
  Plus,
  Globe,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const WORKSPACE_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Meetings", href: "/meetings", icon: Calendar },
  { label: "Habits", href: "/habits", icon: Repeat2 },
  { label: "Lesson Library", href: "/lessons", icon: BookOpen },
  { label: "Notes", href: "/notes", icon: FileText },
  { label: "Storage", href: "/storage", icon: FolderOpen },
  { label: "Photos", href: "/photos", icon: Image },
];

const GLOBAL_NAV = [
  { label: "Podcasts", href: "/podcasts", icon: Mic },
  { label: "AI Tools", href: "/ai-tools", icon: Bot },
  { label: "Location", href: "/location", icon: MapPin },
  { label: "Search", href: "/search", icon: Search },
];

interface SidebarProps {
  onClose: () => void;
  onAddWorkspace: () => void;
}

export default function Sidebar({ onClose, onAddWorkspace }: SidebarProps) {
  const pathname = usePathname();
  const { workspaces, activeWorkspace, setActiveWorkspace, deleteWorkspace, loading } = useWorkspace();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteWorkspace(id);
    setConfirmDelete(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">N</span>
          </div>
          <span className="font-bold text-white text-sm tracking-wide">Nexus</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 scrollable">

        {/* ── WORKSPACES ── */}
        <div className="px-3 mb-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">
            Workspaces
          </p>

          {loading ? (
            <div className="space-y-1 px-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {workspaces.map((ws) => {
                const isActive = activeWorkspace?.id === ws.id;
                const confirming = confirmDelete === ws.id;
                return (
                  <div key={ws.id} className="group relative">
                    {confirming ? (
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-red-900/30 border border-red-700/50">
                        <span className="text-xs text-red-300 flex-1">Delete &ldquo;{ws.name}&rdquo;?</span>
                        <button
                          onClick={() => handleDelete(ws.id)}
                          className="text-[10px] font-bold text-red-400 hover:text-red-300 px-1.5 py-0.5 bg-red-800/50 rounded"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[10px] text-slate-400 hover:text-slate-200"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all cursor-pointer",
                          isActive
                            ? "text-white"
                            : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        )}
                        style={
                          isActive
                            ? { backgroundColor: `${ws.color}25`, borderLeft: `3px solid ${ws.color}` }
                            : { borderLeft: "3px solid transparent" }
                        }
                        onClick={() => setActiveWorkspace(ws)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setActiveWorkspace(ws)}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: ws.color }}
                        />
                        <span className="truncate font-medium flex-1">{ws.name}</span>
                        {isActive && (
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full mr-1"
                            style={{ backgroundColor: `${ws.color}30`, color: ws.color }}
                          >
                            active
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete(ws.id); }}
                          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all flex-shrink-0"
                          title="Delete workspace"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                onClick={onAddWorkspace}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors border border-dashed border-slate-700 mt-1"
              >
                <Plus size={13} />
                <span>Add Workspace</span>
              </button>
            </div>
          )}
        </div>

        <div className="mx-3 border-t border-slate-800 mb-3" />

        {/* ── WORKSPACE CONTENT ── */}
        {activeWorkspace && (
          <div className="px-3 mb-4">
            <div className="flex items-center gap-1.5 px-2 mb-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: activeWorkspace.color }}
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: activeWorkspace.color }}
              >
                {activeWorkspace.name}
              </p>
            </div>

            <div className="space-y-0.5">
              {WORKSPACE_NAV.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors",
                      active
                        ? "text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                    style={
                      active
                        ? { backgroundColor: `${activeWorkspace.color}20`, color: activeWorkspace.color }
                        : {}
                    }
                  >
                    <Icon size={14} className="flex-shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mx-3 border-t border-slate-800 mb-3" />

        {/* ── GLOBAL ── */}
        <div className="px-3 mb-4">
          <div className="flex items-center gap-1.5 px-2 mb-1">
            <Globe size={11} className="text-slate-500" />
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Global
            </p>
          </div>
          <p className="text-[10px] text-slate-600 px-2 mb-2">Shared across all workspaces</p>

          <div className="space-y-0.5">
            {GLOBAL_NAV.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800">
        <p className="text-xs text-slate-600 text-center">Nexus v1.0</p>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { cn } from "@/lib/utils";
import { Menu, Search, Plus, PanelRight, ChevronDown, Calendar } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
  onAddTask: () => void;
  onAddMeeting: () => void;
  onRightPanelToggle: () => void;
}

export default function TopBar({ onMenuClick, onAddTask, onAddMeeting, onRightPanelToggle }: TopBarProps) {
  const { activeWorkspace } = useWorkspace();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const accentColor = activeWorkspace?.color ?? "#7c3aed";

  return (
    <div className="flex items-center gap-3 px-4 h-14 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Active workspace pill */}
      {activeWorkspace && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 flex-shrink-0">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeWorkspace.color }} />
          <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate">
            {activeWorkspace.name}
          </span>
        </div>
      )}

      {/* Search */}
      <div className="flex-1 relative min-w-0 max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search everything... (Cmd+K)"
          className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-100 rounded-lg border border-transparent focus:border-slate-300 focus:outline-none focus:bg-white transition-colors text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        {/* Split Add button */}
        <div ref={dropdownRef} className="relative flex items-center">
          <button
            onClick={onAddTask}
            className={cn(
              "flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-l-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            )}
            style={{ backgroundColor: accentColor }}
          >
            <Plus size={14} />
            <span className="hidden sm:block">Add Task</span>
          </button>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center justify-center px-1.5 py-1.5 rounded-r-lg text-white transition-colors hover:opacity-80 border-l border-white/20"
            style={{ backgroundColor: accentColor }}
            aria-label="More add options"
          >
            <ChevronDown size={13} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-slide-down">
              <button
                onClick={() => { onAddTask(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Plus size={14} className="text-slate-400" />
                Add Task
              </button>
              <button
                onClick={() => { onAddMeeting(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Calendar size={14} className="text-slate-400" />
                Add Meeting
              </button>
            </div>
          )}
        </div>

        {/* Right panel toggle (mobile) */}
        <button
          onClick={onRightPanelToggle}
          className="xl:hidden text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Toggle right panel"
        >
          <PanelRight size={20} />
        </button>
      </div>
    </div>
  );
}

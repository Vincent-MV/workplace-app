"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Task, Meeting } from "@/lib/types";
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import { Bot, Mic, MapPin, MessageSquare } from "lucide-react";
import { Button } from '@/components/ui/button';

interface RightPanelProps {
  refreshKey: number;
  onAskAI: () => void;
}

const QUICK_ACCESS = [
  { label: "AI Tools", href: "/ai-tools", icon: Bot },
  { label: "Podcasts", href: "/podcasts", icon: Mic },
  { label: "Location", href: "/location", icon: MapPin },
];

export default function RightPanel({ refreshKey, onAskAI }: RightPanelProps) {
  const { workspaces } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    if (!workspaces.length) return;
    const wsIds = workspaces.map((w) => w.id);

    const fetchData = async () => {
      const [{ data: tData }, { data: mData }] = await Promise.all([
        supabase.from("tasks").select("*").in("workspace_id", wsIds),
        supabase.from("meetings").select("*").in("workspace_id", wsIds),
      ]);
      setTasks(tData ?? []);
      setMeetings(mData ?? []);
    };

    fetchData();
  }, [workspaces, refreshKey]);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Overview
        </h2>
      </div>

      <div className="flex-1 scrollable">
        {/* Mini Calendar */}
        <div className="p-3 border-b border-slate-100">
          <MiniCalendar tasks={tasks} meetings={meetings} workspaces={workspaces} />
        </div>

        {/* Quick Access */}
        <div className="p-3 border-b border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Quick Access
          </p>
          <div className="space-y-1">
            {QUICK_ACCESS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-sm transition-colors"
              >
                <Icon size={14} className="text-slate-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* AI Button — sticky bottom */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={onAskAI}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <MessageSquare size={14} />
          <span className="text-slate-200 text-sm">Ask AI...</span>
        </button>
      </div>
        <div className="mt-auto pt-4 border-t">
        <Button 
          onClick={onAskAI} 
          variant="outline" 
          size="sm"
          className="w-full gap-2"
        >
          <MessageSquare className="h-4 w-4" /> Ask AI Secretary
        </Button>
      </div>
    </div>
  );
}

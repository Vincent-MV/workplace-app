"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Meeting } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Clock } from "lucide-react";
import { MOCK_MEETINGS } from "@/lib/mock-data";

interface Props {
  refreshKey: number;
}

export default function UpcomingMeetings({ refreshKey }: Props) {
  const { activeWorkspace, workspaces, isDemo } = useWorkspace();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace) return;

    if (isDemo) {
      const filtered = MOCK_MEETINGS.filter(
        (m) => m.workspace_id === activeWorkspace.id
      );
      setMeetings(filtered);
      setLoading(false);
      return;
    }

    const now = new Date().toISOString();
    const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    setLoading(true);
    supabase
      .from("meetings")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .gte("scheduled_at", now)
      .lte("scheduled_at", in7)
      .order("scheduled_at")
      .then(({ data }) => {
        setMeetings(data ?? []);
        setLoading(false);
      });
  }, [activeWorkspace, refreshKey, isDemo]);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!meetings.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Calendar size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No meetings in the next 7 days</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meetings.map((m) => {
        const ws = wsMap[m.workspace_id];
        return (
          <div
            key={m.id}
            className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
            style={{ borderLeft: `3px solid ${ws?.color ?? "#94a3b8"}` }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{m.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={11} />
                  {formatDateTime(m.scheduled_at)}
                </span>
                {m.location && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
                    <MapPin size={11} />
                    {m.location}
                  </span>
                )}
              </div>
              {m.agenda && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{m.agenda}</p>
              )}
            </div>
            {ws && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${ws.color}15`, color: ws.color }}
              >
                {ws.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Meeting } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Clock, Trash2, Plus } from "lucide-react"; // Added Plus
import { MOCK_MEETINGS } from "@/lib/mock-data";
import AddMeetingModal from "@/components/modals/AddMeetingModal"; // ✅ Import your modal

interface Props {
  refreshKey: number;
  onChanged?: () => void; // ✅ Added to match TodayPriorities pattern
}

export default function UpcomingMeetings({ refreshKey, onChanged }: Props) {
  const { activeWorkspace, workspaces, isDemo } = useWorkspace();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: State to control the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDelete = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    const { error } = await supabase.from("meetings").delete().eq("id", meetingId);

    if (error) {
      console.error("Failed to delete meeting:", error);
      alert("Could not delete meeting.");
    } else {
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    }
  };

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

  // ✅ NEW: Rich, action-oriented Empty State
  if (!meetings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-3">
          <Calendar size={28} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">
          No meetings in the next 7 days
        </h3>
        <p className="text-xs text-slate-500 max-w-[260px] mb-5">
          Your calendar is clear! Schedule a meeting to collaborate with your team and stay aligned.
        </p>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/30"
        >
          <Plus size={16} />
          Schedule a meeting
        </button>

        {/* ✅ Render the modal right here when open */}
        {isModalOpen && (
          <AddMeetingModal
            onClose={() => setIsModalOpen(false)}
            onSaved={() => {
              setIsModalOpen(false);
              if (onChanged) onChanged(); // Triggers parent to refresh the list!
            }}
          />
        )}
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
              <div className="flex items-center gap-3 mt-1 flex-wrap">
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
            
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {ws && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `${ws.color}15`, color: ws.color }}
                >
                  {ws.name}
                </span>
              )}
              <button
                onClick={() => handleDelete(m.id)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                title="Delete meeting"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}

      {/* ✅ Bonus: Subtle "Add" button visible even when meetings exist */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-sm flex items-center justify-center gap-2 font-medium"
      >
        <Plus size={16} /> Schedule another meeting
      </button>

      {/* ✅ Render the modal here too */}
      {isModalOpen && (
        <AddMeetingModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            if (onChanged) onChanged();
          }}
        />
      )}
    </div>
  );
}
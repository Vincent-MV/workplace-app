"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Meeting } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Clock, Trash2, Plus } from "lucide-react";
import AddMeetingModal from "@/components/modals/AddMeetingModal";
import ConfirmModal from "@/components/modals/ConfirmModal"; // Using the reusable modal

interface Props {
  initialMeetings: Meeting[];
}

export default function UpcomingMeetingsClient({ initialMeetings }: Props) {
  const router = useRouter();
  const { workspaces } = useWorkspace();
  
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

  const handleDelete = async (meetingId: string) => {
    // 1. Optimistic UI update
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    setMeetingToDelete(null);
    
    // 2. Update database
    await supabase.from("meetings").delete().eq("id", meetingId);
    
    // 3. Tell Next.js to re-fetch the Server Component data
    router.refresh();
  };

  if (meetings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
        <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-3">
          <Calendar size={28} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">No meetings in the next 7 days</h3>
        <p className="text-xs text-slate-500 max-w-[260px] mb-5">
          Your calendar is clear! Schedule a meeting to collaborate with your team and stay aligned.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-500/20 hover:shadow-md cursor-pointer"
        >
          <Plus size={16} />
          Schedule a meeting
        </button>
        
        {isModalOpen && (
          <AddMeetingModal
            onClose={() => setIsModalOpen(false)}
            onSaved={() => {
              setIsModalOpen(false);
              router.refresh(); // Refresh server data after adding
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {meetings.map((m) => {
          const ws = wsMap[m.workspace_id];
          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
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
                  onClick={() => setMeetingToDelete(m)}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Delete meeting"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full py-2.5 mt-2 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-sm flex items-center justify-center gap-2 font-medium cursor-pointer"
      >
        <Plus size={16} /> Schedule another meeting
      </button>

      {isModalOpen && (
        <AddMeetingModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            router.refresh();
          }}
        />
      )}

      {meetingToDelete && (
        <ConfirmModal
          isOpen={!!meetingToDelete}
          onClose={() => setMeetingToDelete(null)}
          onConfirm={() => handleDelete(meetingToDelete.id)}
          title="Delete Meeting?"
          description={`Are you sure you want to delete "${meetingToDelete.title}"?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
}
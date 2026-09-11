"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Meeting } from "@/lib/types";
import { filterMeetingsByDate } from "@/lib/utils/meetings";
import { Calendar, Coffee, Plus } from "lucide-react";
import MeetingCard from "./MeetingCard";
import MeetingForm from "./MeetingForm";
import DeletionTaskModal from "@/components/modals/DeletionTaskModal";

const EMPTY_STATES = {
  none: {
    icon: <Calendar size={40} className="text-indigo-500" />,
    iconBg: "bg-indigo-100",
    title: "Calendar is clear! 🗓️",
    desc: "Start scheduling meetings to collaborate with your team and stay aligned.",
    buttonText: "Schedule your first meeting",
  },
  noUpcoming: {
    icon: <Coffee size={40} className="text-amber-500" />,
    iconBg: "bg-amber-100",
    title: "All caught up for now! ☕",
    desc: "You have no upcoming meetings. Take a breather or schedule something new to keep the momentum going.",
    buttonText: "Schedule a new meeting",
  }
};

export default function MeetingsPage() {
  const { activeWorkspace } = useWorkspace();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  const fetchMeetings = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    const { data } = await supabase
      .from("meetings")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("scheduled_at");
    setMeetings(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchMeetings(); }, [activeWorkspace]);

  const initiateDelete = (meeting: Meeting) => setMeetingToDelete(meeting);

  const confirmDelete = async () => {
    if (!meetingToDelete) return;
    setMeetings((prev) => prev.filter((m) => m.id !== meetingToDelete.id));
    setMeetingToDelete(null);

    const { error } = await supabase.from('meetings').delete().eq('id', meetingToDelete.id);
    if (error) {
      console.error("Failed to delete meeting:", error);
      fetchMeetings(); // Revert on error
    }
  };

  // ✅ Clean, readable filtering using our extracted utility
  const { upcoming, past } = filterMeetingsByDate(meetings);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Meetings</h1>
            <p className="text-sm text-slate-500">{activeWorkspace?.name}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={15} /> Schedule
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <MeetingForm 
            onClose={() => setShowForm(false)} 
            onSaved={() => { setShowForm(false); fetchMeetings(); }} 
          />
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Empty States */}
            {meetings.length === 0 && !showForm && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200">
                <div className={`p-4 rounded-full mb-4 ${EMPTY_STATES.none.iconBg}`}>{EMPTY_STATES.none.icon}</div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{EMPTY_STATES.none.title}</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">{EMPTY_STATES.none.desc}</p>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-500/20 hover:shadow-md cursor-pointer">
                  <Plus size={16} /> {EMPTY_STATES.none.buttonText}
                </button>
              </motion.div>
            )}

            {upcoming.length === 0 && meetings.length > 0 && !showForm && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 mb-6">
                <div className={`p-4 rounded-full mb-4 ${EMPTY_STATES.noUpcoming.iconBg}`}>{EMPTY_STATES.noUpcoming.icon}</div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{EMPTY_STATES.noUpcoming.title}</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">{EMPTY_STATES.noUpcoming.desc}</p>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-amber-500/20 hover:shadow-md cursor-pointer">
                  <Plus size={16} /> {EMPTY_STATES.noUpcoming.buttonText}
                </button>
              </motion.div>
            )}

            {/* Lists */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Upcoming</h2>
                <div className="space-y-2">
                  {upcoming.map((m) => (
                    <MeetingCard key={m.id} meeting={m} workspace={activeWorkspace} onDelete={initiateDelete} />
                  ))}
                </div>
              </section>
            )}
            
            {past.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Past</h2>
                <div className="space-y-2 opacity-60">
                  {past.map((m) => (
                    <MeetingCard key={m.id} meeting={m} workspace={activeWorkspace} onDelete={initiateDelete} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {meetingToDelete && (
        <DeletionTaskModal
          taskTitle={meetingToDelete.title} 
          onClose={() => setMeetingToDelete(null)} 
          onConfirm={confirmDelete} 
        />
      )}
    </AppShell>
  );
}
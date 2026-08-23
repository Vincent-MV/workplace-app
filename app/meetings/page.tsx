"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Meeting } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { 
  Calendar, MapPin, Clock, Plus, X, Trash2, ChevronDown, ChevronUp, 
  Coffee 
} from "lucide-react";
import DeletionTaskModal from "@/components/modals/DeletionTaskModal";

//  Contextual Empty States
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
  const { activeWorkspace, workspaces } = useWorkspace();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  //  State for the delete modal
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  
  const [form, setForm] = useState({
    title: "", agenda: "", scheduled_at: "", duration_mins: 60, location: "",
  });

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [form.agenda, showForm]);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !form.title.trim() || !form.scheduled_at) return;
    
    await supabase.from("meetings").insert({
      ...form,
      workspace_id: activeWorkspace.id,
      user_id: activeWorkspace.user_id,
    });
    
    setForm({ title: "", agenda: "", scheduled_at: "", duration_mins: 60, location: "" });
    setShowForm(false);
    setShowAdvanced(false);
    fetchMeetings();
  };

  //  Professional delete flow (no more alert/confirm)
  const initiateDelete = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
  };

  const confirmDelete = async () => {
    if (!meetingToDelete) return;

    // Optimistic UI update
    setMeetings((prev) => prev.filter((m) => m.id !== meetingToDelete.id));
    setMeetingToDelete(null);

    const { error } = await supabase.from('meetings').delete().eq('id', meetingToDelete.id);
    if (error) {
      console.error("Failed to delete meeting:", error);
      fetchMeetings(); // Revert on error
    }
  };

  const upcoming = meetings.filter((m) => new Date(m.scheduled_at) >= new Date());
  const past = meetings.filter((m) => new Date(m.scheduled_at) < new Date());

  const MeetingCard = ({ m }: { m: Meeting }) => {
    const ws = wsMap[m.workspace_id];
    return (
      <div
        className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
        style={{ borderLeft: `3px solid ${ws?.color ?? "#94a3b8"}` }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{m.title}</p>
            {m.agenda && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{m.agenda}</p>}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={11} />{formatDateTime(m.scheduled_at)}
              </span>
              <span className="text-xs text-slate-400">{m.duration_mins} min</span>
              {m.location && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} />{m.location}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {ws && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${ws.color}15`, color: ws.color }}
              >
                {ws.name}
              </span>
            )}
            {/* Added cursor-pointer */}
            <button
              onClick={() => initiateDelete(m)}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Delete meeting"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Meetings</h1>
            <p className="text-sm text-slate-500">{activeWorkspace?.name}</p>
          </div>
          
        </div>

        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreate} 
            className="p-4 bg-white rounded-xl border border-slate-200 space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">New Meeting</h3>
                {activeWorkspace && (
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    Adding to: 
                    <span className="font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${activeWorkspace.color}15`, color: activeWorkspace.color }}>
                      {activeWorkspace.name}
                    </span>
                  </p>
                )}
              </div>
              <button type="button" onClick={() => { setShowForm(false); setShowAdvanced(false); }} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Meeting title *</label>
              <input
                autoFocus
                required 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="What's the meeting about?" 
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date & time *</label>
                <input
                  type="datetime-local" 
                  required 
                  value={form.scheduled_at}
                  onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Duration (min)</label>
                <input
                  type="number" 
                  min={15} 
                  step={15} 
                  value={form.duration_mins}
                  onChange={(e) => setForm({ ...form, duration_mins: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                  placeholder="60"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors w-full justify-center py-1 cursor-pointer"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showAdvanced ? "Less options" : "+ More options (Location & Agenda)"}
            </button>

            {showAdvanced && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }}
                className="space-y-3 pt-2 border-t border-slate-100 overflow-hidden"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                  <input
                    value={form.location} 
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Room 101, Zoom link, etc." 
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Agenda</label>
                  <textarea
                    ref={textareaRef}
                    value={form.agenda} 
                    onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                    placeholder="Topics to cover..." 
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none overflow-y-auto"
                    style={{ minHeight: "80px" }}
                  />
                </div>
              </motion.div>
            )}

            <button type="submit" className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer">
              Schedule Meeting
            </button>
          </motion.form>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/*  Rich Empty States */}
            {meetings.length === 0 && !showForm ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200"
              >
                <div className={`p-4 rounded-full mb-4 ${EMPTY_STATES.none.iconBg}`}>
                  {EMPTY_STATES.none.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{EMPTY_STATES.none.title}</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">{EMPTY_STATES.none.desc}</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/30 cursor-pointer"
                >
                  <Plus size={16} />
                  {EMPTY_STATES.none.buttonText}
                </button>
              </motion.div>
            ) : upcoming.length === 0 && !showForm ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200 mb-6"
              >
                <div className={`p-4 rounded-full mb-4 ${EMPTY_STATES.noUpcoming.iconBg}`}>
                  {EMPTY_STATES.noUpcoming.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{EMPTY_STATES.noUpcoming.title}</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">{EMPTY_STATES.noUpcoming.desc}</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-amber-500/20 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer"
                >
                  <Plus size={16} />
                  {EMPTY_STATES.noUpcoming.buttonText}
                </button>
              </motion.div>
            ) : null}

            {/* Meetings Lists */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Upcoming</h2>
                <div className="space-y-2">{upcoming.map((m) => <MeetingCard key={m.id} m={m} />)}</div>
              </section>
            )}
            
            {past.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Past</h2>
                <div className="space-y-2 opacity-60">{past.map((m) => <MeetingCard key={m.id} m={m} />)}</div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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
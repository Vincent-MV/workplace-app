"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Meeting } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Calendar, MapPin, Clock, Plus, X } from "lucide-react";

export default function MeetingsPage() {
  const { activeWorkspace, workspaces } = useWorkspace();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", agenda: "", scheduled_at: "", duration_mins: 60, location: "",
  });

  const wsMap = Object.fromEntries(workspaces.map((w) => [w.id, w]));

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
    fetchMeetings();
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
          {ws && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `${ws.color}15`, color: ws.color }}
            >
              {ws.name}
            </span>
          )}
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
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={15} />Schedule
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 animate-slide-down">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">New Meeting</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <input
              required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Meeting title *" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <textarea
              value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })}
              placeholder="Agenda (optional)" rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
            <div className="flex gap-2 flex-wrap">
              <input
                type="datetime-local" required value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <input
                type="number" min={15} step={15} value={form.duration_mins}
                onChange={(e) => setForm({ ...form, duration_mins: Number(e.target.value) })}
                className="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                placeholder="Mins"
              />
              <input
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Location" className="flex-1 min-w-32 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
            <button type="submit" className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">
              Schedule Meeting
            </button>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
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
            {meetings.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No meetings yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

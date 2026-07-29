"use client";

import { useEffect, useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Podcast } from "@/lib/types";
import { Mic, Play, Pause, Plus, X } from "lucide-react";

export default function PodcastsPage() {
  const { workspaces } = useWorkspace();
  const userId = workspaces[0]?.user_id;
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", audio_url: "" });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchPodcasts = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from("podcasts").select("*").eq("user_id", userId).order("uploaded_at", { ascending: false });
    setPodcasts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPodcasts(); }, [userId]);

  const togglePlay = (podcast: Podcast) => {
    if (playingId === podcast.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(podcast.audio_url);
      audioRef.current.play().catch(() => {});
      setPlayingId(podcast.id);
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  const addPodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !form.title.trim() || !form.audio_url.trim()) return;
    await supabase.from("podcasts").insert({ user_id: userId, title: form.title.trim(), audio_url: form.audio_url.trim(), duration_secs: 0, play_position: 0 });
    setForm({ title: "", audio_url: "" }); setShowForm(false);
    fetchPodcasts();
  };

  const formatDuration = (secs: number) => {
    if (!secs) return "--:--";
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Podcasts</h1>
            <p className="text-sm text-slate-500">Your audio library</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors">
            <Plus size={15} />Add Audio
          </button>
        </div>

        {showForm && (
          <form onSubmit={addPodcast} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 animate-slide-down">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-700">Add Podcast</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400"><X size={16} /></button>
            </div>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title *" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
            <input required value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
              placeholder="Audio URL (https://...) *" type="url"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
            <button type="submit" className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors">Add</button>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : podcasts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Mic size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm">No podcasts added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {podcasts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                <button onClick={() => togglePlay(p)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${playingId === p.id ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-600 hover:bg-violet-200"}`}>
                  {playingId === p.id ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                  <p className="text-xs text-slate-400">{formatDuration(p.duration_secs)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

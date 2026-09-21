"use client";

import { useEffect, useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Podcast } from "@/lib/types";
import { Mic, Play, Pause, Plus, X, Upload, Loader2 } from "lucide-react";

export default function PodcastsPage() {
  const { workspaces } = useWorkspace();
  const userId = workspaces[0]?.user_id;
  
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // Modal & Upload State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchPodcasts = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("podcasts")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title with file name (without extension) if title is empty
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedFile || !title.trim()) return;

    setUploading(true);

    try {
      // 1. Generate a unique file name to prevent collisions
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`; // Organize by user ID

      // 2. Upload to Supabase Storage bucket named "Audio"
      const { error: uploadError } = await supabase.storage
        .from("Audio")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 3. Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from("Audio")
        .getPublicUrl(filePath);

      // 4. Insert the record into the database
      const { error: dbError } = await supabase.from("podcasts").insert({
        user_id: userId,
        title: title.trim(),
        audio_url: publicUrl,
        duration_secs: 0, // Can be enhanced later with audio metadata parsing
        play_position: 0,
      });

      if (dbError) throw dbError;

      // 5. Reset form and refresh list
      setTitle("");
      setSelectedFile(null);
      setIsModalOpen(false);
      fetchPodcasts();

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload audio. Please check your Supabase storage settings.");
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (secs: number) => {
    if (!secs) return "--:--";
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Podcasts</h1>
            <p className="text-sm text-slate-500">Your audio library</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus size={15} /> Add Audio
          </button>
        </div>

        {/* ✅ Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-slide-up">
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedFile(null); setTitle(""); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Audio</h3>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Podcast title"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Audio File *</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-3 px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                      <Upload size={20} className="text-slate-400" />
                      <span className="text-sm text-slate-600 truncate flex-1">
                        {selectedFile ? selectedFile.name : "Click to browse audio file..."}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !title.trim()}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    "Upload Podcast"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : podcasts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Mic size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No podcasts added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {podcasts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                <button 
                  onClick={() => togglePlay(p)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                    playingId === p.id ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-600 hover:bg-violet-200"
                  }`}
                >
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
"use client";

import { useEffect, useState, useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Podcast } from "@/lib/types";
import { 
  Mic, Play, Pause, Plus, X, Upload, Loader2, AlertCircle, 
  Trash2 
} from "lucide-react";
import { 
  uploadPodcastAction, 
  MAX_PODCASTS, 
  MAX_FILE_SIZE_MB 
} from "@/lib/actions/UploadPodcast";
import { deletePodcastAction } from "@/lib/actions/deletePodcast";

export default function PodcastsPage() {
  const { workspaces } = useWorkspace();
  const userId = workspaces[0]?.user_id;
  
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  // Modal & Upload State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Delete Confirmation State
  const [podcastToDelete, setPodcastToDelete] = useState<Podcast | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
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
    setUploadError(null);
    
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
        setSelectedFile(null);
        e.target.value = "";
        return;
      }
      
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedFile || !title.trim()) return;

    setUploading(true);
    setUploadError(null);

    const result = await uploadPodcastAction(userId, selectedFile, title);

    if (!result.success) {
      setUploadError(result.error || "An unknown error occurred.");
      setUploading(false);
      return;
    }

    setTitle("");
    setSelectedFile(null);
    setIsModalOpen(false);
    setUploading(false);
    fetchPodcasts();
  };

  const handleDelete = async () => {
    if (!podcastToDelete || !userId) return;

    setDeleting(true);
    setDeleteError(null);

    const result = await deletePodcastAction(
      podcastToDelete.id,
      podcastToDelete.audio_url,
      userId
    );

    if (!result.success) {
      setDeleteError(result.error || "Failed to delete podcast.");
      setDeleting(false);
      return;
    }

    if (playingId === podcastToDelete.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }

    setPodcasts(prev => prev.filter(p => p.id !== podcastToDelete.id));
    
    setDeleting(false);
    setPodcastToDelete(null);
  };

  const formatDuration = (secs: number) => {
    if (!secs) return "--:--";
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const isLimitReached = podcasts.length >= MAX_PODCASTS;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Podcasts</h1>
            <p className="text-sm text-slate-500">Your audio library</p>
            {isLimitReached && (
              <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> 
                Limit reached: You can only upload {MAX_PODCASTS} files.
              </p>
            )}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={isLimitReached}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isLimitReached 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-violet-600 hover:bg-violet-700 text-white"
            }`}
          >
            <Plus size={15} /> {isLimitReached ? "Limit Reached" : "Add Audio"}
          </button>
        </div>

        {/* Upload Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-slide-up">
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedFile(null); setTitle(""); setUploadError(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Audio</h3>

              <form onSubmit={handleUpload} className="space-y-4">
                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">{uploadError}</p>
                  </div>
                )}

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
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Audio File * <span className="text-slate-400 font-normal">(Max {MAX_FILE_SIZE_MB}MB)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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

        {/* Delete Confirmation Modal */}
        {podcastToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-slide-up">
              <button 
                onClick={() => { setPodcastToDelete(null); setDeleteError(null); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Delete Podcast?</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg mb-4">
                <p className="text-sm font-medium text-slate-800 truncate">{podcastToDelete.title}</p>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 mb-4">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600">{deleteError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setPodcastToDelete(null); setDeleteError(null); }}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} /> Delete
                    </>
                  )}
                </button>
              </div>
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
                
                {/* ✅ UPDATED: Trash icon is now ALWAYS visible, but subtle until hovered */}
                <button
                  onClick={() => setPodcastToDelete(p)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete podcast"
                  aria-label={`Delete ${p.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
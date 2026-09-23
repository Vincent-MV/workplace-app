"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { Podcast } from "@/lib/types";
import { Plus, AlertCircle, Headphones } from "lucide-react";
import { MAX_PODCASTS } from "@/lib/actions/UploadPodcast";

import UploadPodcastModal from "./UploadPodcastModal";
import DeletePodcastModal from "./DeletePodcastModal";
import PodcastItem from "./PodcastItem";

export default function PodcastsPage() {
  const { workspaces } = useWorkspace();
  const userId = workspaces[0]?.user_id;
  
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [podcastToDelete, setPodcastToDelete] = useState<Podcast | null>(null);
  
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

  const handleDeleteSuccess = () => {
    if (playingId === podcastToDelete?.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    }
    setPodcastToDelete(null);
    fetchPodcasts();
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
                <AlertCircle size={12} /> Limit reached: You can only upload {MAX_PODCASTS} files.
              </p>
            )}
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={isLimitReached}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              isLimitReached ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700 text-white"
            }`}
          >
            <Plus size={15} /> {isLimitReached ? "Limit Reached" : "Add Audio"}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
        ) : podcasts.length === 0 ? (
          // ✅ Beautiful Empty State with Call to Action
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200"
          >
            <div className="p-4 rounded-full mb-4 bg-violet-100">
              <Headphones size={40} className="text-violet-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              Start your podcast collection! 🎧
            </h3>
            <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">
              Upload your first audio file to listen on the go. Keep it under 50MB to get started.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/30 cursor-pointer"
            >
              <Plus size={16} /> Upload your first podcast
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {podcasts.map((p) => (
              <PodcastItem 
                key={p.id} 
                podcast={p} 
                isPlaying={playingId === p.id}
                onTogglePlay={() => togglePlay(p)}
                onDelete={() => setPodcastToDelete(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <UploadPodcastModal 
          userId={userId} 
          isLimitReached={isLimitReached} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchPodcasts(); }} 
        />
      )}

      {podcastToDelete && (
        <DeletePodcastModal 
          podcast={podcastToDelete} 
          userId={userId} 
          onClose={() => setPodcastToDelete(null)} 
          onSuccess={handleDeleteSuccess} 
        />
      )}
    </AppShell>
  );
}
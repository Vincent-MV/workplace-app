"use client";

import { Play, Pause, Trash2 } from "lucide-react";
import type { Podcast } from "@/lib/types";

interface PodcastItemProps {
  podcast: Podcast;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onDelete: () => void;
}

function formatDuration(secs: number) {
  if (!secs) return "--:--";
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PodcastItem({ podcast, isPlaying, onTogglePlay, onDelete }: PodcastItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
      <button 
        onClick={onTogglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
          isPlaying ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-600 hover:bg-violet-200"
        }`}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{podcast.title}</p>
        <p className="text-xs text-slate-400">{formatDuration(podcast.duration_secs)}</p>
      </div>
      
      <button
        onClick={onDelete}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Delete podcast"
        aria-label={`Delete ${podcast.title}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
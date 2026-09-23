"use client";

import { useState } from "react";
import { X, Trash2, Loader2, AlertCircle } from "lucide-react";
import type { Podcast } from "@/lib/types";
import { deletePodcastAction } from "@/lib/actions/deletePodcast";

interface DeletePodcastModalProps {
  podcast: Podcast;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeletePodcastModal({ podcast, userId, onClose, onSuccess }: DeletePodcastModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);

    const result = await deletePodcastAction(podcast.id, podcast.audio_url, userId);

    if (!result.success) {
      setDeleteError(result.error || "Failed to delete podcast.");
      setDeleting(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
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
          <p className="text-sm font-medium text-slate-800 truncate">{podcast.title}</p>
        </div>

        {deleteError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 mb-4">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-600">{deleteError}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
            {deleting ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : <><Trash2 size={16} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}
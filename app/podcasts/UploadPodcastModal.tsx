"use client";

import { useState } from "react";
import { X, Upload, Loader2, AlertCircle } from "lucide-react";
import { uploadPodcastAction, MAX_FILE_SIZE_MB } from "@/lib/actions/UploadPodcast";

interface UploadPodcastModalProps {
  userId: string;
  isLimitReached: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadPodcastModal({ userId, isLimitReached, onClose, onSuccess }: UploadPodcastModalProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
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

    onSuccess();
  };

  if (isLimitReached) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
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
              required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Podcast title"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Audio File * <span className="text-slate-400 font-normal">(Max {MAX_FILE_SIZE_MB}MB)</span>
            </label>
            <div className="relative">
              <input type="file" accept="audio/*" onChange={handleFileChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="flex items-center gap-3 px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                <Upload size={20} className="text-slate-400" />
                <span className="text-sm text-slate-600 truncate flex-1">{selectedFile ? selectedFile.name : "Click to browse audio file..."}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={uploading || !selectedFile || !title.trim()} className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer">
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : "Upload Podcast"}
          </button>
        </form>
      </div>
    </div>
  );
}
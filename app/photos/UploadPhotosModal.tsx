"use client";
import { useState } from "react";
import { X, Upload, Loader2, AlertCircle } from "lucide-react";
import { uploadPhotoAction, MAX_FILE_SIZE_MB } from "@/lib/actions/UploadPhotos";

interface Props { userId: string; isLimitReached: boolean; onClose: () => void; onSuccess: () => void; }

export default function UploadPhotoModal({ userId, isLimitReached, onClose, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setError(null);
    if (f) {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File too large. Max ${MAX_FILE_SIZE_MB}MB.`);
        setFile(null); e.target.value = ""; return;
      }
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
    } else setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !file || !title.trim()) return;
    setUploading(true); setError(null);

    const res = await uploadPhotoAction(userId, file, title);
    if (!res.success) { setError(res.error); setUploading(false); return; }
    
    onSuccess();
  };

  if (isLimitReached) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Photo</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"><AlertCircle size={16} className="text-red-500 mt-0.5" /><p className="text-xs text-red-600">{error}</p></div>}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Photo title" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Image * <span className="text-slate-400 font-normal">(Max {MAX_FILE_SIZE_MB}MB)</span></label>
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleFileChange} required className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="flex items-center gap-3 px-3 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                <Upload size={20} className="text-slate-400" />
                <span className="text-sm text-slate-600 truncate flex-1">{file ? file.name : "Click to browse image..."}</span>
              </div>
            </div>
          </div>
          <button type="submit" disabled={uploading || !file || !title.trim()} className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer">
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : "Upload Photo"}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import { Image, Plus, AlertCircle } from "lucide-react";
import { MAX_PHOTOS } from "@/lib/actions/UploadPhotos";
import UploadPhotoModal from "./UploadPhotosModal";
import PhotoGridItem from "./PhotoGridItem";

// Note: Ensure 'Photo' is in your lib/types.ts. If not, define it here:
type Photo = { id: string; user_id: string; title: string; image_url: string; uploaded_at: string };

export default function PhotosPage() {
  const { workspaces } = useWorkspace();
  const userId = workspaces[0]?.user_id;
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPhotos = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from("photos").select("*").eq("user_id", userId).order("uploaded_at", { ascending: false });
    setPhotos(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPhotos(); }, [userId]);

  const isLimitReached = photos.length >= MAX_PHOTOS;

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Photos</h1>
            <p className="text-sm text-slate-500">Your visual memory bank</p>
            {isLimitReached && (
              <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Limit reached: You can only upload {MAX_PHOTOS} photos.
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
            <Plus size={15} /> {isLimitReached ? "Limit Reached" : "Add Photo"}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : photos.length === 0 ? (
          // ✅ Beautiful Empty State
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl bg-slate-50/50 border border-dashed border-slate-200"
          >
            <div className="p-4 rounded-full mb-4 bg-violet-100">
              <Image size={40} className="text-violet-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Capture your moments! 📸</h3>
            <p className="text-xs text-slate-500 max-w-[280px] mb-6 leading-relaxed">
              Upload your first photo to start building your visual library. Keep it under 10MB.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-violet-500/20 cursor-pointer"
            >
              <Plus size={16} /> Upload your first photo
            </button>
          </motion.div>
        ) : (
          // ✅ Photo Grid
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((p) => (
              <PhotoGridItem key={p.id} photo={p} onDelete={() => {
                // Simple inline delete for photos to keep UI fast
                supabase.from("photos").delete().eq("id", p.id).then(() => fetchPhotos());
              }} />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <UploadPhotoModal 
          userId={userId} 
          isLimitReached={isLimitReached} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchPhotos(); }} 
        />
      )}
    </AppShell>
  );
}
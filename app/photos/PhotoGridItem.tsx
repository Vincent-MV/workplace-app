"use client";
import { Trash2 } from "lucide-react";
import type { Photo } from "@/lib/types"; // Make sure to add Photo to your types if not there

interface Props { photo: Photo; onDelete: () => void; }

export default function PhotoGridItem({ photo, onDelete }: Props) {
  return (
    <div className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
      <img 
        src={photo.image_url} 
        alt={photo.title} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        loading="lazy"
      />
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <p className="text-white text-sm font-medium truncate mb-2">{photo.title}</p>
        <button 
          onClick={onDelete}
          className="absolute top-3 right-3 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
          title="Delete photo"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
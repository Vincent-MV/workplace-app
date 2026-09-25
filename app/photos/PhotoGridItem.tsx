"use client";

import { Trash2, Loader2 } from "lucide-react";
import type { Photo } from "@/lib/types"; 

interface Props { 
  photo: Photo; 
  onDelete: () => void; 
  isDeleting?: boolean; // Added to show a loading spinner
}

export default function PhotoGridItem({ photo, onDelete, isDeleting }: Props) {
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
          disabled={isDeleting} // Disable button while deleting
          className="absolute top-3 right-3 p-1.5 bg-red-500/90 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors cursor-pointer"
          title="Delete photo"
        >
          {/* Show spinner if deleting, otherwise show trash icon */}
          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}
"use client";
import AppShell from "@/components/layout/AppShell";
import { Image } from "lucide-react";
export default function PhotosPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Photos</h1>
        <div className="mt-16 text-center text-slate-400">
          <Image size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-slate-500">Coming Soon</p>
          <p className="text-sm mt-1">Photo management is on the roadmap.</p>
        </div>
      </div>
    </AppShell>
  );
}

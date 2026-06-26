"use client";
import AppShell from "@/components/layout/AppShell";
import { Search } from "lucide-react";
export default function SearchPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Search</h1>
        <div className="mt-16 text-center text-slate-400">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-slate-500">Coming Soon</p>
          <p className="text-sm mt-1">Global search across all workspaces is on the roadmap.</p>
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import TodayPriorities from "@/components/dashboard/TodayPriorities";
import UpcomingMeetings from "@/components/dashboard/UpcomingMeetings";
import HabitsToday from "@/components/dashboard/HabitsToday";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Sparkles } from "lucide-react";

function DemoBanner() {
  const { isDemo } = useWorkspace();
  if (!isDemo) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-medium">
      <Sparkles size={13} />
      <span>Showing sample data — your Supabase tables are empty. Add real data to replace this.</span>
    </div>
  );
}

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your command center for today</p>
        </div>

        <DemoBanner />

        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Today&apos;s Priorities
          </h2>
          <TodayPriorities
            refreshKey={refreshKey}
            onChanged={() => setRefreshKey((k) => k + 1)}
          />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Upcoming Meetings
          </h2>
          <UpcomingMeetings refreshKey={refreshKey} />
        </section>

        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Habits — Today
          </h2>
          <HabitsToday refreshKey={refreshKey} />
        </section>
      </div>
    </AppShell>
  );
}

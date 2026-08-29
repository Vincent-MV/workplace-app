// app/dashboard/page.tsx
// 🚨 NO "use client" here!

import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import TodayPriorities from "@/components/dashboard/TodayPriorities";
import UpcomingMeetings from "@/components/dashboard/UpcomingMeetings"; // ✅ Import it

function Skeleton() {
  return <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />;
}

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Your command center for today</p>
        </div>

        {/* Today's Priorities */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Today's Priorities
          </h2>
          <Suspense fallback={<Skeleton />}>
            <TodayPriorities />
          </Suspense>
        </section>

        {/* ✅ Upcoming Meetings */}
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Upcoming Meetings
          </h2>
          <Suspense fallback={<Skeleton />}>
            <UpcomingMeetings />
          </Suspense>
        </section>
        
      </div>
    </AppShell>
  );
}
// components/dashboard/TodayPriorities.tsx
// 🚨 NO "use client" here!

import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";
import TodayPrioritiesClient from "./TodayPrioritiesClient";

export default async function TodayPriorities() {
  // 1. Fetch securely on the server
  const supabase = await createClient();
  
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .or(`due_date.eq.${todayISO()},status.eq.missed,status.eq.done`)
    .order("priority");

  // 2. Pass ONLY data to the client component. No functions!
  return (
    <TodayPrioritiesClient 
      initialTasks={tasks ?? []} 
    />
  );
}
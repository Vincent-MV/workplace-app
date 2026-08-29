// components/dashboard/UpcomingMeetings.tsx
import { createClient } from "@/lib/supabase/server";
import UpcomingMeetingsClient from "./UpcomingMeetingsClient";

export default async function UpcomingMeetings() {
  const supabase = await createClient();
  
  const now = new Date().toISOString();
  const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // RLS will automatically ensure we only get this user's meetings
  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .gte("scheduled_at", now)
    .lte("scheduled_at", in7)
    .order("scheduled_at");

  return <UpcomingMeetingsClient initialMeetings={meetings ?? []} />;
}
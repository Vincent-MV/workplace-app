import type { Meeting } from "@/lib/types";

export function filterMeetingsByDate(meetings: Meeting[]) {
  const now = new Date();
  return {
    upcoming: meetings.filter((m) => new Date(m.scheduled_at) >= now),
    past: meetings.filter((m) => new Date(m.scheduled_at) < now),
  };
}
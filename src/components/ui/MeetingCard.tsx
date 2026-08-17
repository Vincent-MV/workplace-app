// components/meetings/MeetingCard.tsx
"use client";

import { Clock, MapPin, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Meeting, Workspace } from "@/lib/types";

interface MeetingCardProps {
  meeting: Meeting;
  workspace: Workspace | undefined;
  onDelete: (meetingId: string) => void;
}

export default function MeetingCard({ meeting, workspace, onDelete }: MeetingCardProps) {
  return (
    <div
      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
      style={{ borderLeft: `3px solid ${workspace?.color ?? "#94a3b8"}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800">{meeting.title}</p>
          {meeting.agenda && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{meeting.agenda}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={11} /> {formatDateTime(meeting.scheduled_at)}
            </span>
            <span className="text-xs text-slate-400">{meeting.duration_mins} min</span>
            {meeting.location && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin size={11} /> {meeting.location}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {workspace && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
            >
              {workspace.name}
            </span>
          )}
          <button
            onClick={() => onDelete(meeting.id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
            title="Delete meeting"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
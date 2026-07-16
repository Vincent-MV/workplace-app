import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { WorkspaceType } from "./types" // Adjust path if your types file is elsewhere


// 1. The standard shadcn utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 2. The missing todayISO function
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

// 3. The missing formatDate function
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// 4. The missing WORKSPACE_PALETTE
// This maps your WorkspaceTypes to default colors and icons
export const WORKSPACE_PALETTE: Record<WorkspaceType, { color: string; icon: string }> = {
  school: { color: "#3b82f6", icon: "GraduationCap" },
  ministry: { color: "#8b5cf6", icon: "BookOpen" },
  work: { color: "#10b981", icon: "Briefcase" },
  personal: { color: "#f59e0b", icon: "User" },
}

// 5. The missing formatDateTime function
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 6. The missing daysAgo function
// (Calculates how many days ago a specific date was)
export function daysAgo(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}

export const COLOR_PALETTE: string[] = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#10b981", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#ef4444", // red
  "#06b6d4", // cyan
  "#84cc16", // lime
]
import { Coffee, Sun, CalendarClock, Sparkles } from "lucide-react";

export const TASK_EMPTY_STATES = {
  overdue: {
    icon: <Coffee size={40} className="text-amber-500" />,
    iconBg: "bg-amber-100",
    title: "Don't stress, it happens! 🧘",
    desc: "Take a deep breath. Reschedule it or tackle just one small thing today. Progress over perfection.",
    buttonText: "Reschedule a task",
  },
  today: {
    icon: <Sun size={40} className="text-violet-500" />,
    iconBg: "bg-violet-100",
    title: "You've got this! 💪",
    desc: "Focus on your top priorities. Take it one step at a time and celebrate the small wins.",
    buttonText: "Add a task for today",
  },
  upcoming: {
    icon: <CalendarClock size={40} className="text-blue-500" />,
    iconBg: "bg-blue-100",
    title: "Looking ahead! 🗓️",
    desc: "A little planning now saves a lot of stress later. Your future self will thank you.",
    buttonText: "Schedule a future task",
  },
  all: {
    icon: <Sparkles size={40} className="text-green-500" />,
    iconBg: "bg-green-100",
    title: "All caught up! 🎉",
    desc: "Enjoy the free time, or add a new task to keep your momentum going.",
    buttonText: "Add your first task",
  },
} as const;
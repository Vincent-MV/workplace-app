"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Calendar, Flame, BookOpen, Brain, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: CheckSquare, label: "Tasks & Priorities", color: "#6366f1" },
  { icon: Calendar, label: "Meetings & Schedule", color: "#f59e0b" },
  { icon: Flame, label: "Habit Streaks", color: "#f97316" },
  { icon: BookOpen, label: "Lesson Library", color: "#22c55e" },
  { icon: Brain, label: "AI Assistant", color: "#a855f7" },
  { icon: Sparkles, label: "Multi-Workspace", color: "#06b6d4" },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/onboarding");
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 px-4 py-20">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/40">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <span className="text-4xl font-extrabold text-white tracking-tight">Nexus</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-center text-white mb-4 max-w-2xl leading-tight">
          Your second brain.
          <br />
          <span className="text-violet-400">Unified.</span>
        </h1>
        <p className="text-slate-400 text-center text-lg mb-12 max-w-md leading-relaxed">
          One place for school, ministry, habits, notes, and everything in between. Stay focused, stay organized.
        </p>

        {/* Email form */}
        <form
          onSubmit={handleEnter}
          className="w-full max-w-sm space-y-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3.5 bg-white/8 border border-white/15 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm backdrop-blur-sm"
          />
          <button
            type="submit"
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all text-sm shadow-lg shadow-violet-600/40 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-100"
          >
            Enter Nexus →
          </button>
        </form>

        <p className="text-slate-600 text-xs mt-4">
          No password needed for now — just your email.
        </p>

        {/* Feature pills */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-14 w-full max-w-md">
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm"
            >
              <Icon size={15} style={{ color }} />
              <span className="text-xs text-slate-300 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative text-center pb-6">
        <p className="text-xs text-slate-700">Built for student life × ministry leadership</p>
      </div>
    </div>
  );
}

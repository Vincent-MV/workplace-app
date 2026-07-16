"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Calendar,
  Flame,
  BookOpen,
  Brain,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const FEATURES = [
  { icon: CheckSquare, label: "Tasks & Priorities",  color: "#6366f1" },
  { icon: Calendar,    label: "Meetings & Schedule", color: "#f59e0b" },
  { icon: Flame,       label: "Habit Streaks",       color: "#f97316" },
  { icon: BookOpen,    label: "Lesson Library",      color: "#22c55e" },
  { icon: Brain,       label: "AI Assistant",        color: "#a855f7" },
  { icon: Sparkles,    label: "Multi-Workspace",     color: "#06b6d4" },
];

// Three views the same page can show — no separate routes needed
type View = "auth" | "forgot" | "forgot-sent";

export default function LandingPage() {
  const router = useRouter();

  const [view,     setView]     = useState<View>("auth");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard"); // auto-enter the app
      }
    };
    checkSession();
  }, [router]);

  // ─── View 1: main auth (sign in / auto sign up) ──────────────────────────
  // app/page.tsx

const handleAuth = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage(null);

  // Try sign in first
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (!signInError) {
    // ✅ Existing user → go to dashboard
    setLoading(false);
    router.push("/dashboard");
    return;
  }

  // No account yet → create one
  if (signInError.message.includes("Invalid login credentials")) {
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
    
    if (signUpError) {
      setMessage({ text: signUpError.message, ok: false });
      setLoading(false);
      return;
    }
    
    // ✅ New user created → redirect to onboarding
    setMessage({
      text: "✓ Account created! Redirecting to workspace setup...",
      ok: true,
    });
    setLoading(false);
    
    // Give Supabase a moment to create the user, then redirect
    setTimeout(() => {
      router.push("/onboarding");
    }, 1000);
    
    return;
  }
  
  setMessage({ text: signInError.message, ok: false });
  setLoading(false);
};

  // ─── View 2: forgot password — send reset email ──────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // After clicking the link in the reset email, Supabase sends the user here
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage({ text: error.message, ok: false });
      setLoading(false);
      return;
    }

    // Always show success — even if email doesn't exist, for security
    // (telling someone "that email isn't registered" leaks information)
    setView("forgot-sent");
    setLoading(false);
  };

  // ─── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 px-4 py-20">

        {/* Logo — always visible */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/40">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <span className="text-4xl font-extrabold text-white tracking-tight">Nexus</span>
        </div>

        {/* ── VIEW: main auth form ─────────────────────────────── */}
        {view === "auth" && (
          <>
            <h1 className="text-4xl md:text-6xl font-bold text-center text-white mb-4 max-w-2xl leading-tight">
              Your second brain.
              <br />
              <span className="text-violet-400">Unified.</span>
            </h1>
            <p className="text-slate-400 text-center text-lg mb-12 max-w-md leading-relaxed">
              One place for school, ministry, habits, notes, and everything in between.
            </p>

            <form onSubmit={handleAuth} className="w-full max-w-sm space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3.5 bg-white/8 border border-white/15 rounded-2xl
                           text-white placeholder:text-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500
                           text-sm backdrop-blur-sm"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 characters)"
                required
                minLength={6}
                className="w-full px-4 py-3.5 bg-white/8 border border-white/15 rounded-2xl
                           text-white placeholder:text-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500
                           text-sm backdrop-blur-sm"
              />

              {/* Feedback message */}
              {message && (
                <p className={`text-sm text-center ${message.ok ? "text-green-400" : "text-red-400"}`}>
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold
                           rounded-2xl transition-all text-sm shadow-lg shadow-violet-600/40
                           hover:scale-[1.02] active:scale-100
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? "Loading..." : "Enter Nexus →"}
              </button>

              {/* Forgot password link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setView("forgot"); setMessage(null); }}
                  className="text-xs text-slate-500 hover:text-violet-400 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <p className="text-xs text-slate-600 text-center">
                New here? We&apos;ll create your account automatically.
              </p>
            </form>

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
          </>
        )}

        {/* ── VIEW: forgot password — enter email ──────────────── */}
        {view === "forgot" && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Reset your password</h2>
            <p className="text-slate-400 text-sm text-center mb-8 max-w-xs">
              Enter your email and we&apos;ll send you a link to set a new password.
            </p>

            <form onSubmit={handleForgotPassword} className="w-full max-w-sm space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3.5 bg-white/8 border border-white/15 rounded-2xl
                           text-white placeholder:text-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500
                           text-sm backdrop-blur-sm"
              />

              {message && (
                <p className="text-sm text-red-400 text-center">{message.text}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold
                           rounded-2xl transition-all text-sm
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setView("auth"); setMessage(null); }}
                  className="text-xs text-slate-500 hover:text-violet-400 transition-colors"
                >
                  ← Back to login
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── VIEW: reset email sent confirmation ──────────────── */}
        {view === "forgot-sent" && (
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/30
                            flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              If an account exists for <span className="text-white font-medium">{email}</span>,
              you&apos;ll receive a password reset link shortly.
              Click it to set a new password and return to Nexus.
            </p>
            <button
              onClick={() => { setView("auth"); setEmail(""); setMessage(null); }}
              className="text-xs text-slate-500 hover:text-violet-400 transition-colors"
            >
              ← Back to login
            </button>
          </div>
        )}

      </div>

      <div className="relative text-center pb-6">
        <p className="text-xs text-slate-700">Built for student life × ministry leadership</p>
      </div>

    </div>
  );
}

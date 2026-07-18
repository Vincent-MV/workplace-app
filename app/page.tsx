"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Calendar,
  Flame,
  BookOpen,
  Brain,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import LightRays from "@/components/LightRays"; // Make sure this file exists!

const FEATURES = [
  { icon: CheckSquare, label: "Tasks & Priorities", color: "text-indigo-400" },
  { icon: Calendar, label: "Meetings & Schedule", color: "text-amber-400" },
  { icon: Flame, label: "Habit Streaks", color: "text-orange-400" },
  { icon: BookOpen, label: "Lesson Library", color: "text-emerald-400" },
  { icon: Brain, label: "AI Assistant", color: "text-purple-400" },
  { icon: Sparkles, label: "Multi-Workspace", color: "text-cyan-400" },
];

// Base64 fractal-noise SVG, tiled — kills banding on the dark gradient without a network request
const NOISE_BG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIvPjwvc3ZnPg==";

type View = "auth" | "forgot" | "forgot-sent";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.55, 
      ease: [0.16, 1, 0.3, 1] as const
    },
  },
};

export default function LandingPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) {
      router.push("/dashboard");
      return;
    }

    if (signInError.message.includes("Invalid login credentials")) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (signUpError) {
        setMessage({ text: signUpError.message, ok: false });
        setLoading(false);
        return;
      }
      setMessage({ text: "✓ Account created! Redirecting...", ok: true });
      setTimeout(() => router.push("/onboarding"), 1500);
      setLoading(false);
      return;
    }

    setMessage({ text: signInError.message, ok: false });
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setMessage({ text: error.message, ok: false });
      setLoading(false);
      return;
    }
    setView("forgot-sent");
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-[#030014] text-white flex flex-col overflow-hidden font-sans selection:bg-violet-500/30">

      {/* ─── BACKGROUND EFFECTS ─── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Top vignette — pulls the eye to the hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[520px] bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(139,92,246,0.14),transparent_70%)]" />

        {/* LightRays Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] opacity-30">
          <LightRays
            raysOrigin="top-center-offset"
            raysColor="#fdfdfd"
            raysSpeed={0.5}
            lightSpread={0.9}
            rayLength={1.4}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0}
            distortion={0}
            pulsating={false}
            fadeDistance={1}
            saturation={1}
          />
        </div>

        {/* Film-grain noise overlay — prevents banding, adds tactile depth */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{ backgroundImage: `url(${NOISE_BG})`, backgroundSize: "200px 200px" }}
        />
      </div>

      {/* ─── TOP NAVBAR ─── */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-bold text-lg tracking-tighter">N</span>
          </div>
          <span className="text-lg font-semibold text-white/90 tracking-tight">Nexus</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          <span className="hover:text-white transition-colors cursor-pointer">Features</span>
          <span className="hover:text-white transition-colors cursor-pointer">About</span>
          <div className="px-3 py-1 rounded-full bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-xl text-xs text-zinc-300">
            v1.0 Beta
          </div>
        </div>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pb-20">

        <AnimatePresence mode="wait">
          {view === "auth" && (
            <motion.div
              key="auth"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              className="w-full max-w-lg space-y-10 text-center"
            >

              {/* Hero Text */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                    Your second brain.
                  </span>
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
                    Unified.
                  </span>
                </h1>
                <p className="text-lg text-zinc-400 font-light max-w-md mx-auto leading-relaxed tracking-tight">
                  One place for school, ministry, habits, notes, and everything in between.
                </p>
              </motion.div>

              {/* Auth Form */}
              <motion.form
                variants={itemVariants}
                onSubmit={handleAuth}
                className="space-y-3 text-left max-w-sm mx-auto"
              >
                <div className="space-y-3">
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] ring-1 ring-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 transition-all backdrop-blur-xl text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    />
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] ring-1 ring-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 transition-all backdrop-blur-xl text-sm shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {message && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`text-xs text-center mt-2 ${
                        message.ok ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {message.text}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black font-semibold rounded-xl transition-all duration-300 text-sm hover:bg-white/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 group shadow-[0_0_0_0_rgba(139,92,246,0)] hover:shadow-[0_8px_30px_-4px_rgba(139,92,246,0.45)]"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Enter Nexus
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>

              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between text-xs text-zinc-500 max-w-sm mx-auto pt-2"
              >
                <button
                  type="button"
                  onClick={() => { setView("forgot"); setMessage(null); }}
                  className="hover:text-white transition-colors"
                >
                  Forgot password?
                </button>
                <span className="text-zinc-600">New here? Auto-signup enabled.</span>
              </motion.div>

              {/* Feature Pills */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-8 max-w-md mx-auto"
              >
                {FEATURES.map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/[0.06] hover:ring-white/20 transition-all duration-300 group shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  >
                    <Icon size={15} className={`${color} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs text-zinc-400 font-medium group-hover:text-zinc-100 transition-colors tracking-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ── VIEW: FORGOT PASSWORD ── */}
          {view === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm space-y-6 text-center"
            >
              <h2 className="text-2xl font-bold text-white tracking-tight">Reset password</h2>
              <p className="text-sm text-zinc-400">Enter your email to receive a reset link.</p>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] ring-1 ring-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 transition-all backdrop-blur-xl text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black font-semibold rounded-xl transition-all text-sm hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Send reset link"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => { setView("auth"); setMessage(null); }}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                ← Back to login
              </button>
            </motion.div>
          )}

          {/* ── VIEW: RESET SENT ── */}
          {view === "forgot-sent" && (
            <motion.div
              key="forgot-sent"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-sm space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center mx-auto">
                <span className="text-xl">✉️</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Check your email</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                If an account exists for <span className="text-white font-medium">{email}</span>, you will receive a reset link shortly.
              </p>
              <button
                onClick={() => { setView("auth"); setEmail(""); setMessage(null); }}
                className="text-xs text-zinc-500 hover:text-white transition-colors mt-4"
              >
                ← Back to login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative text-center pb-8 z-10">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
          Built for student life × ministry leadership
        </p>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

type View = "auth" | "forgot" | "forgot-sent";

interface LoginFormProps {
  onAuthSuccess?: () => void;
}

export default function LoginForm({ onAuthSuccess }: LoginFormProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("auth");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    await supabase.auth.signOut();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ text: error.message, ok: false });
      } else if (data.session) {
        setMessage({ text: "✓ Account created! Redirecting...", ok: true });
        setTimeout(() => {
          onAuthSuccess?.();
          router.push("/onboarding");
        }, 1000);
      } else {
        setMessage({
          text: "✓ Account created! Please check your email to confirm.",
          ok: true,
        });
        setTimeout(() => {
          setIsSignUp(false);
          setMessage(null);
        }, 3000);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage({ text: "Invalid email or password.", ok: false });
      } else {
        onAuthSuccess?.();
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="w-full max-w-md p-6 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-xl shadow-2xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Welcome back</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {isSignUp ? "Create your account" : "Sign in to continue to Nexus"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/[0.03] ring-1 ring-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 transition-all text-sm"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 bg-white/[0.03] ring-1 ring-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/40 transition-all text-sm"
              />
            </div>
          </div>

          <AnimatePresence>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs text-center ${message.ok ? "text-emerald-400" : "text-red-400"}`}
              >
                {message.text}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 group shadow-lg shadow-violet-500/25"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {isSignUp ? "Create Account" : "Enter Nexus"}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 text-xs text-zinc-500">
          <button
            type="button"
            onClick={() => { setView("forgot"); setMessage(null); }}
            className="hover:text-white transition-colors"
          >
            Forgot password?
          </button>
          <div className="flex items-center gap-1.5">
            <span>{isSignUp ? "Already have an account?" : "New here?"}</span>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setMessage(null); setPassword(""); }}
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              {isSignUp ? "Sign in" : "Create an account"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
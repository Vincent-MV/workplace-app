"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [message,   setMessage]   = useState<{ text: string; ok: boolean } | null>(null);
  const [validLink, setValidLink] = useState(false);

  // When the user clicks the reset link in their email, Supabase
  // redirects them here with a session token in the URL hash.
  // This useEffect detects that token and activates the session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          // Supabase detected the reset token in the URL — session is ready
          setValidLink(true);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirm) {
      setMessage({ text: "Passwords do not match.", ok: false });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ text: error.message, ok: false });
      setLoading(false);
      return;
    }

    setMessage({ text: "✓ Password updated! Redirecting...", ok: true });

    // Short pause so the user reads the success message, then go to dashboard
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 px-4">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/40">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <span className="text-4xl font-extrabold text-white tracking-tight">Nexus</span>
        </div>

        {/* Invalid / expired link */}
        {!validLink && (
          <div className="text-center max-w-sm">
            <p className="text-slate-400 text-sm mb-4">
              Waiting for reset link verification...
            </p>
            <p className="text-xs text-slate-600">
              If nothing happens, your link may have expired.{" "}
              <a href="/" className="text-violet-400 hover:underline">
                Request a new one
              </a>
            </p>
          </div>
        )}

        {/* Valid link — show new password form */}
        {validLink && (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Set a new password</h2>
            <p className="text-slate-400 text-sm text-center mb-8 max-w-xs">
              Choose something you&apos;ll remember. Minimum 6 characters.
            </p>

            <form onSubmit={handleReset} className="w-full max-w-sm space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={6}
                className="w-full px-4 py-3.5 bg-white/8 border border-white/15 rounded-2xl
                           text-white placeholder:text-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500
                           text-sm backdrop-blur-sm"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                className="w-full px-4 py-3.5 bg-white/8 border border-white/15 rounded-2xl
                           text-white placeholder:text-slate-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500
                           text-sm backdrop-blur-sm"
              />

              {message && (
                <p className={`text-sm text-center ${message.ok ? "text-green-400" : "text-red-400"}`}>
                  {message.text}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold
                           rounded-2xl transition-all text-sm
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}

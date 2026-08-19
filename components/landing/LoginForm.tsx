"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type View = "auth" | "forgot" | "forgot-sent";

interface LoginFormProps {
  onAuthSuccess?: () => void;
}

const PASSWORD_MIN_LENGTH = 6;

// 1. STRICT DOMAIN WHITELIST: Add your actual allowed domains here
// Leave empty [] if you want to allow any valid email format but still enforce strict regex
const ALLOWED_DOMAINS = ["gmail.com"]; 

// 2. Strict regex: requires letters/numbers, an @, a domain, and a valid TLD (e.g., .com, .org)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginForm({ onAuthSuccess }: LoginFormProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("auth");
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // --- Validation Helpers ---
  const validateEmail = (value: string): string => {
    if (value.length > 0 && !EMAIL_REGEX.test(value)) {
      return "Please enter a valid email address (e.g., name@domain.com)";
    }
    
    // Enforce domain restriction if whitelist is provided
    if (value.length > 0 && ALLOWED_DOMAINS.length > 0) {
      const domain = value.split("@")[1]?.toLowerCase();
      if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
        return `Only @${ALLOWED_DOMAINS.join(" or @")} emails are allowed`;
      }
    }
    
    return "";
  };

  const validatePassword = (value: string): string => {
    if (value.length > 0 && value.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    return "";
  };

  // --- Event Handlers ---
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase(); // Force lowercase for consistency
    setEmail(value);
    if (emailError) setEmailError(validateEmail(value));
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) setPasswordError(validatePassword(value));
  };

  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Gate submit on client-side validation
    const eError = validateEmail(email);
    const pError = validatePassword(password);

    if (eError) {
      setEmailError(eError);
      return; // Stop execution, do not call Supabase
    }
    if (pError) {
      setPasswordError(pError);
      return; // Stop execution, do not call Supabase
    }

    setLoading(true);
    setMessage(null);

    await supabase.auth.signOut();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Since you don't have an email sender, we skip the redirect 
          // or you can leave it if you plan to add one later.
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

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setMessage(null);
    setPassword("");
    setPasswordError("");
    setEmailError(""); 
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
            {/* --- EMAIL FIELD --- */}
            <div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  aria-label="Email address"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="Email address"
                  required
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : "email-hint"}
                  className={`w-full pl-11 pr-4 py-3 bg-white/[0.03] ring-1 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all text-sm ${
                    emailError
                      ? "ring-red-500/40 focus:ring-red-500/40 focus:border-red-500/40"
                      : "ring-white/10 focus:ring-violet-500/20 focus:border-violet-500/40"
                  }`}
                />
              </div>
              <div className="min-h-[1.25rem] px-1 pt-1.5">
                <AnimatePresence mode="wait">
                  {emailError ? (
                    <motion.p
                      key="email-error"
                      id="email-error"
                      role="alert"
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-red-400"
                    >
                      <AlertCircle size={12} />
                      {emailError}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="email-hint"
                      id="email-hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-zinc-500"
                    >
                      {ALLOWED_DOMAINS.length > 0 
                        ? `Must be a @${ALLOWED_DOMAINS[0]} email` 
                        : "We'll never share your email."}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* --- PASSWORD FIELD --- */}
            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  placeholder="Password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : "password-hint"}
                  className={`w-full pl-11 pr-4 py-3 bg-white/[0.03] ring-1 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all text-sm ${
                    passwordError
                      ? "ring-red-500/40 focus:ring-red-500/40 focus:border-red-500/40"
                      : "ring-white/10 focus:ring-violet-500/20 focus:border-violet-500/40"
                  }`}
                />
              </div>
              <div className="min-h-[1.25rem] px-1 pt-1.5">
                <AnimatePresence mode="wait">
                  {passwordError ? (
                    <motion.p
                      key="password-error"
                      id="password-error"
                      role="alert"
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 text-xs text-red-400"
                    >
                      <AlertCircle size={12} />
                      {passwordError}
                    </motion.p>
                  ) : (
                    <motion.p
                      key="password-hint"
                      id="password-hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-zinc-500"
                    >
                      Minimum {PASSWORD_MIN_LENGTH} characters
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
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
              onClick={toggleAuthMode}
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
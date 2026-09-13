"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { useLoginForm } from "./useLoginForm";
import { AuthInput } from "@/components/auth/AuthInput";
import { ALLOWED_DOMAINS, PASSWORD_MIN_LENGTH } from "@/lib/utils/validation";

export default function LoginForm({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const {
    isSignUp, email, emailError, password, passwordError, loading, message,
    handleEmailChange, handlePasswordChange, handleAuth, toggleAuthMode,
    setEmailError, setPasswordError, validateEmail, validatePassword
  } = useLoginForm(onAuthSuccess);

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
          <AuthInput
            icon={<Mail size={16} />}
            type="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => setEmailError(validateEmail(email))}
            placeholder="Email address"
            error={emailError}
            hint={ALLOWED_DOMAINS.length > 0 ? `Must be a @${ALLOWED_DOMAINS[0]} email` : "We'll never share your email."}
          />

          <AuthInput
            icon={<Lock size={16} />}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => setPasswordError(validatePassword(password))}
            placeholder="Password"
            error={passwordError}
            hint={`Minimum ${PASSWORD_MIN_LENGTH} characters`}
            minLength={PASSWORD_MIN_LENGTH}
          />

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
          <button type="button" className="hover:text-white transition-colors">
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
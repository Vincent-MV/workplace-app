"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthInputProps {
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  placeholder: string;
  error: string;
  hint: string;
  minLength?: number;
}

export function AuthInput({ icon, type, value, onChange, onBlur, placeholder, error, hint, minLength }: AuthInputProps) {
  return (
    <div>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required
          minLength={minLength}
          className={cn(
            "w-full pl-11 pr-4 py-3 bg-white/[0.03] ring-1 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition-all text-sm",
            error ? "ring-red-500/40 focus:ring-red-500/40" : "ring-white/10 focus:ring-violet-500/20"
          )}
        />
      </div>
      <div className="min-h-[1.25rem] px-1 pt-1.5">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p key="error" initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle size={12} /> {error}
            </motion.p>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-zinc-500">
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const HERO_FEATURES = [
  "All-in-one workspace",
  "Smart organization",
  "Secure & private",
];

export default function Hero() {
  return (
    <motion.div 
      className="space-y-6 max-w-xl"
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.6 }}
    >
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 ring-1 ring-violet-500/20 text-violet-300 text-xs font-medium w-fit">
        <span>✨</span>
        AI-Powered Productivity
      </div>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1]">
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
          Your second brain.
        </span>
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
          Unified.
        </span>
      </h1>

      <p className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed tracking-tight max-w-lg">
        One place for school, ministry, habits, notes, and everything in between.
      </p>

      <div className="flex flex-wrap gap-4 pt-2">
        {HERO_FEATURES.map((feature, index) => (
          <motion.div
            key={feature}
            className="flex items-center gap-2 text-sm text-zinc-300"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <Check size={16} className="text-violet-400" />
            <span>{feature}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
"use client";

import { motion } from "framer-motion";
import {
  CheckSquare,
  Calendar,
  Flame,
  BookOpen,
  Brain,
  Sparkles,
} from "lucide-react";

const FEATURES = [
  { 
    icon: CheckSquare, 
    label: "Tasks & Projects", 
    description: "Plan, organize, and track your tasks effortlessly.",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20"
  },
  { 
    icon: Calendar, 
    label: "Meetings & Schedule", 
    description: "Manage meetings and never miss important events.",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  { 
    icon: Flame, 
    label: "Habit Streaks", 
    description: "Build better habits with streaks and reminders.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20"
  },
  { 
    icon: BookOpen, 
    label: "Lesson Library", 
    description: "Store and organize your lessons and resources.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  { 
    icon: Brain, 
    label: "AI Assistant", 
    description: "Get help and answers from your AI assistant.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  { 
    icon: Sparkles, 
    label: "Multi-Workspace", 
    description: "Switch between workspaces seamlessly.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20"
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function FeaturesGrid() {
  return (
    <div id="features" className="scroll-mt-20">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.label}
            variants={itemVariants}
            className={`p-6 rounded-xl ${feature.bgColor} border ${feature.borderColor} backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/30 transition-all duration-300 group cursor-pointer`}
            whileHover={{ y: -4 }}
          >
            <feature.icon size={28} className={`${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
            <h3 className="text-white font-semibold mb-2 text-lg">{feature.label}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
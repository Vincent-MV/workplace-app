"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Logo from "@/app/icon.png";

export default function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // If we are already at the section, scroll to top instead
      const rect = element.getBoundingClientRect();
      if (rect.top < 100 && rect.top > -100) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10 max-w-7xl mx-auto w-full">
      <motion.div 
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-9 h-9 flex items-center justify-center ">
          <span className="text-white font-bold text-lg tracking-tighter">
            <Image alt="N" src={Logo}/>
          </span>
        </div>
        <span className="text-lg font-semibold text-white/90 tracking-tight">Nexus</span>
      </motion.div>

      <motion.div 
        className="hidden md:flex items-center gap-8 text-sm"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button 
          onClick={() => scrollToSection("features")}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Features
        </button>
        <button 
          onClick={() => scrollToSection("auth")}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          About
        </button>
        <button 
          onClick={() => scrollToSection("resources")}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Resources
        </button>
        <div className="px-3 py-1 rounded-full bg-white/[0.03] ring-1 ring-white/10 backdrop-blur-xl text-xs text-zinc-300">
          v1.0 Beta
        </div>
      </motion.div>

      <motion.button
        onClick={() => scrollToSection("auth")}
        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-all hover:scale-105 shadow-lg shadow-violet-500/25"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Sign In
      </motion.button>
    </nav>
  );
}
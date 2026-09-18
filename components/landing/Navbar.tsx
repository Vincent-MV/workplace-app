"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Logo from "@/app/icon.png";

export default function Navbar() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="relative z-20 flex items-center px-6 py-6 md:px-10 max-w-7xl mx-auto w-full">
      {/* Logo - Left side with mr-auto to push everything else right */}
      <motion.div 
        className="flex items-center gap-2.5 cursor-pointer mr-auto"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-9 h-9 flex items-center justify-center">
          <Image alt="Nexus" src={Logo} width={36} height={36} className="rounded-lg"/>
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Nexus</span>
      </motion.div>

      {/* Navigation items - All on the right side */}
      <motion.div 
        className="hidden md:flex items-center gap-8 text-base font-medium"
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
          onClick={() => scrollToSection("how-it-works")}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          How it Works
        </button>
        <button 
          onClick={() => scrollToSection("testimonials")}
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          Testimonials
        </button>
        <button
          onClick={() => scrollToSection("features")}
          className="ml-4 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-violet-500/25"
        >
          Get Started
        </button>
      </motion.div>
    </nav>
  );
}
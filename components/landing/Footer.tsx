"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react";

const SOCIAL_LINKS = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "mailto:hello@nexus.app", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 mt-20">
      <div className="px-6 py-12 md:px-10 max-w-7xl mx-auto">
        
        {/* Top Section: Brand & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Brand & Socials */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-lg font-semibold text-white">Nexus</span>
            </div>
            <p className="text-sm text-zinc-400 mb-6 max-w-xs">
              Your second brain for productivity, learning, and growth.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-8 h-8 rounded-lg bg-white/[0.03] ring-1 ring-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* ✅ Contact for Inquiries */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact & Inquiries</h4>
            <p className="text-sm text-zinc-400 mb-4 max-w-sm">
              Have questions, partnership opportunities, or need support? We'd love to hear from you.
            </p>
            <a 
              href="mailto:hello@nexus.app" 
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors text-sm font-medium"
            >
              <Mail size={16} />
              valladolidvincent22@gmail.com
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="text-white font-semibold mb-1">Stay in the loop</h4>
              <p className="text-sm text-zinc-400">Get the latest updates and tips.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-white/[0.03] ring-1 ring-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 text-sm w-64"
              />
              <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Bottom Bar: Cleaned up */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>© 2026 Nexus. All rights reserved.</p>
          {/* Removed Privacy Policy and Terms of Service as requested */}
        </div>
        
      </div>
    </footer>
  );
}
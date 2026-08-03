"use client";

import {
  BackgroundEffects,
  Navbar,
  Hero,
  LoginForm,
  FeaturesGrid,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  const handleAuthSuccess = () => {
    // Optional: Any cleanup or analytics
  };

  return (
    // REMOVED: flex flex-col, min-h-screen, overflow-hidden
    // ADDED: Standard block layout that allows natural scrolling
    <div className="relative bg-[#030014] text-white font-sans selection:bg-violet-500/30">
      <BackgroundEffects />
      
      <div className="relative z-10">
        <Navbar />
        
        <main>
          {/* Hero & Auth Section */}
          <section id="auth" className="scroll-mt-24 px-6 py-20 md:py-32 md:px-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <Hero />
              <LoginForm onAuthSuccess={handleAuthSuccess} />
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="scroll-mt-24 px-6 py-20 md:py-32 md:px-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything you need, in one place
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Nexus brings your tools, tasks, and thoughts together.
              </p>
            </div>
            <FeaturesGrid />
          </section>

          {/* Resources / CTA Section */}
          <section id="resources" className="scroll-mt-24 px-6 py-20 md:py-32 md:px-10 max-w-7xl mx-auto">
            <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 backdrop-blur-xl text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to get started?
              </h3>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Join thousands of students and professionals who use Nexus to stay organized.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-all hover:scale-105 shadow-lg shadow-violet-500/25">
                  Create Free Account
                </button>
                <button className="px-6 py-3 bg-white/[0.03] hover:bg-white/[0.06] ring-1 ring-white/10 text-white font-medium rounded-lg transition-all">
                  Learn More
                </button>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
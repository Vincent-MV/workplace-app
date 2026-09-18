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

        </main>
        
        <Footer />
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Menu, PanelRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Components
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import RightPanel from "./RightPanel";
import AccountabilityBanner from "@/components/banners/AccountabilityBanner";
import DailyBriefing from "@/components/dashboard/DailyBriefing";
import { AIChat } from "@/components/ai/AIChat";

// Modals
import AddTaskModal from "@/components/modals/AddTaskModal";
import AddMeetingModal from "@/components/modals/AddMeetingModal";
import AddWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import ConfirmModal from "@/components/modals/ConfirmModal"; // ✅ 1. ADDED THIS IMPORT

interface AppShellProps {
  children: React.ReactNode;
  onAddWorkspace?: () => void; // ✅ 2. FIXED TYPESCRIPT INTERFACE
}

export default function AppShell({ children, onAddWorkspace }: AppShellProps) {
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addMeetingOpen, setAddMeetingOpen] = useState(false);
  const [addWorkspaceOpen, setAddWorkspaceOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // ✅ State for logout

  const handleTaskAdded = () => {
    setTaskRefreshKey((k) => k + 1);
    setAddTaskOpen(false);
  };

  const handleMeetingAdded = () => {
    setTaskRefreshKey((k) => k + 1);
    setAddMeetingOpen(false);
  };

  // ✅ Logic to actually perform the logout
  const performLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh(); 
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[220px] lg:relative lg:z-auto
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar
          onAddWorkspace={onAddWorkspace} 
          onLogoutClick={() => setIsLogoutModalOpen(true)} // ✅ Triggers the modal
        />
      </aside>

      {/* Center: topbar + content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onAddTask={() => setAddTaskOpen(true)}
          onAddMeeting={() => setAddMeetingOpen(true)}
          onRightPanelToggle={() => setRightPanelOpen((o) => !o)}
        />
        <AccountabilityBanner refreshKey={taskRefreshKey} />
        
        <main className="flex-1 scrollable p-4 md:p-6 space-y-6">
          <DailyBriefing />
          {children}
        </main>
      </div>

      {/* Right Panel overlay on mobile */}
      {rightPanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 xl:hidden animate-fade-in"
          onClick={() => setRightPanelOpen(false)}
        />
      )}

      {/* Right Panel */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-[300px] xl:relative xl:z-auto xl:block
          transform transition-transform duration-200
          ${rightPanelOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
        `}
      >
        <RightPanel
          refreshKey={taskRefreshKey}
          onAskAI={() => setIsAiChatOpen(true)} 
        />
      </aside>

      {/* Floating mobile buttons */}
      <button
        className="fixed bottom-4 left-4 z-30 lg:hidden bg-slate-800 text-white p-3 rounded-full shadow-lg cursor-pointer"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>
      <button
        className="fixed bottom-4 right-4 z-30 xl:hidden bg-slate-800 text-white p-3 rounded-full shadow-lg cursor-pointer"
        onClick={() => setRightPanelOpen(true)}
        aria-label="Open right panel"
      >
        <PanelRight size={20} />
      </button>

      {/* Global AI Chat */}
      <AIChat isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} />
        
      {/* Modals */}
      {addTaskOpen && (
        <AddTaskModal onClose={() => setAddTaskOpen(false)} onSaved={handleTaskAdded} />
      )}
      {addMeetingOpen && (
        <AddMeetingModal onClose={() => setAddMeetingOpen(false)} onSaved={handleMeetingAdded} />
      )}
      {addWorkspaceOpen && (
        <AddWorkspaceModal onClose={() => setAddWorkspaceOpen(false)} />
      )}

      {/* ✅ 3. LOGOUT MODAL AT THE ROOT LEVEL */}
      {/* Because ConfirmModal uses `fixed inset-0 z-[100]`, it will perfectly 
          center itself over the ENTIRE screen, ignoring the sidebar's boundaries. */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={performLogout}
        title="Sign out of Nexus?"
        description="Are you sure you want to end your session? You will need to log in again to access your workspace."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        variant="warning"
      />
    </div>
  );
}
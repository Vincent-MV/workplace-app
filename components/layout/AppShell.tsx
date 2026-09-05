"use client";

import { useState, lazy, Suspense } from "react"; 
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useWorkspace } from "@/context/WorkspaceContext";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import AccountabilityBanner from "@/components/banners/AccountabilityBanner";
import DailyBriefing from "@/components/dashboard/DailyBriefing";
import { AIChat } from "@/components/ai/AIChat";

import AddTaskModal from "@/components/modals/AddTaskModal";
import AddMeetingModal from "@/components/modals/AddMeetingModal";
import AddWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import ConfirmModal from "@/components/modals/ConfirmModal";

interface AppShellProps {
  children: React.ReactNode;
}

const RightPanel = lazy(() => import("./RightPanel"));

export default function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { clearSession } = useWorkspace();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addMeetingOpen, setAddMeetingOpen] = useState(false);
  const [addWorkspaceOpen, setAddWorkspaceOpen] = useState(false); // ✅ State for the modal
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0); 

  const handleTaskAdded = () => {
    setTaskRefreshKey((k) => k + 1);
    setAddTaskOpen(false);
  };

  const handleMeetingAdded = () => {
    setTaskRefreshKey((k) => k + 1);
    setAddMeetingOpen(false);
  };

  const performLogout = async () => {
    clearSession(); 
    await supabase.auth.signOut();
    router.refresh(); 
    setSessionKey((prev) => prev + 1); 
    router.push("/"); 
  };

  return (
    <div key={sessionKey} className="flex h-screen w-full overflow-hidden bg-slate-50">
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`fixed lg:relative z-50 w-[260px] h-full flex-shrink-0 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          // ✅ FIX: Pass the function that actually opens the modal, NOT the undefined prop
          onAddWorkspace={() => setAddWorkspaceOpen(true)} 
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          onAddTask={() => setAddTaskOpen(true)}
          onAddMeeting={() => setAddMeetingOpen(true)}
          onRightPanelToggle={() => setRightPanelOpen((o) => !o)}
        />
        <AccountabilityBanner refreshKey={taskRefreshKey} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <DailyBriefing />
          {children}
        </main>
      </div>

      {/* Mobile Right Panel overlay */}
      {rightPanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden animate-fade-in"
          onClick={() => setRightPanelOpen(false)}
        />
      )}

      {/* Right Panel */}
      <div className={`fixed top-0 right-0 lg:relative lg:top-auto lg:right-auto z-50 w-[300px] h-full flex-shrink-0 transform transition-transform duration-200 ease-in-out ${rightPanelOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
        <Suspense fallback={<div className="w-full h-full bg-slate-100 animate-pulse" />}>
          <RightPanel
            refreshKey={taskRefreshKey}
            onAskAI={() => setIsAiChatOpen(true)}
            onClose={() => setRightPanelOpen(false)}
          />
        </Suspense>
      </div>

      {/* Mobile floating buttons */}
      <button
        className="fixed bottom-4 left-4 z-30 lg:hidden bg-slate-800 text-white p-3 rounded-full shadow-lg cursor-pointer"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>
      
      {/* ✅ Modals (Cleaned up, no duplicates) */}
      <AIChat isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} />
      
      {addTaskOpen && (
        <AddTaskModal onClose={() => setAddTaskOpen(false)} onSaved={handleTaskAdded} />
      )}
      
      {addMeetingOpen && (
        <AddMeetingModal onClose={() => setAddMeetingOpen(false)} onSaved={handleMeetingAdded} />
      )}
      
      {addWorkspaceOpen && (
        <AddWorkspaceModal onClose={() => setAddWorkspaceOpen(false)} />
      )}

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
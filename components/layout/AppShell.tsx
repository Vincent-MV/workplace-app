"use client";

import { useState } from "react";
import { Menu, PanelRight } from "lucide-react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import RightPanel from "./RightPanel";
import AccountabilityBanner from "@/components/banners/AccountabilityBanner";
import AddTaskModal from "@/components/modals/AddTaskModal";
import AddMeetingModal from "@/components/modals/AddMeetingModal";
import AddWorkspaceModal from "@/components/modals/AddWorkspaceModal";
import { AIChat } from "@/components/ai/AIChat"; // Your existing path

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addMeetingOpen, setAddMeetingOpen] = useState(false);
  const [addWorkspaceOpen, setAddWorkspaceOpen] = useState(false);
  
  // Consolidated to a single state variable for the AI Chat
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [taskRefreshKey, setTaskRefreshKey] = useState(0);

  const handleTaskAdded = () => {
    setTaskRefreshKey((k) => k + 1);
    setAddTaskOpen(false);
  };

  const handleMeetingAdded = () => {
    setTaskRefreshKey((k) => k + 1);
    setAddMeetingOpen(false);
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
          onClose={() => setSidebarOpen(false)}
          onAddWorkspace={() => setAddWorkspaceOpen(true)}
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
        <main className="flex-1 scrollable p-4 md:p-6">
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
          // This triggers the AI Chat from inside the Right Panel
          onAskAI={() => setIsAiChatOpen(true)} 
        />
      </aside>

      {/* Floating mobile buttons */}
      <button
        className="fixed bottom-4 left-4 z-30 lg:hidden bg-slate-800 text-white p-3 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>
      <button
        className="fixed bottom-4 right-4 z-30 xl:hidden bg-slate-800 text-white p-3 rounded-full shadow-lg"
        onClick={() => setRightPanelOpen(true)}
        aria-label="Open right panel"
      >
        <PanelRight size={20} />
      </button>

      {/* Render the AI Chat component globally so it overlays the app */}
      <AIChat isOpen={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} />
        
      {/* Modals */}
      {addTaskOpen && (
        <AddTaskModal
          onClose={() => setAddTaskOpen(false)}
          onSaved={handleTaskAdded}
        />
      )}
      {addMeetingOpen && (
        <AddMeetingModal
          onClose={() => setAddMeetingOpen(false)}
          onSaved={handleMeetingAdded}
        />
      )}
      {addWorkspaceOpen && (
        <AddWorkspaceModal
          onClose={() => setAddWorkspaceOpen(false)}
        />
      )}
    </div>
  );
}
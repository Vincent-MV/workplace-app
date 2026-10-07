"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Workspace } from "@/lib/types";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  loading: boolean;
  isDemo: boolean;
  clearSession: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {

  // Initialize the SSR client at the top of the component!
  const supabase = createClient(); 
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  
  const fetchWorkspaces = useCallback(async () => {
    
    
    setLoading(true);
    
    // ❌ Removed: const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
   
    // Add Debug 1 and 2 here for auth check 

    if (userError || !user) {
      setWorkspaces([]);
      setIsDemo(false);
      setActiveWorkspaceState(null);
      setLoading(false);
      return;
    }


    // Debug 3 for fetching from DB

    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at");

    // Debug 4 for Response
    
    if (!error && data && data.length > 0) {
      const seen = new Set<string>();
      const unique = data.filter((w: Workspace) => {
        const key = w.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      setWorkspaces(unique);
      setIsDemo(false);
      setActiveWorkspaceState((prev) => {
        if (prev) {
          const found = data.find((w: Workspace) => w.id === prev.id);
          return found ?? data[0];
        }
        return data[0];
      });
    } else {
      console.warn("⚠️ [DEBUG] No workspaces found or DB error.");
      setWorkspaces([]);
      setIsDemo(false);
      setActiveWorkspaceState(null);
    }
    
    setLoading(false);
  }, [supabase]); // ✅ Add supabase to dependency array

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const setActiveWorkspace = useCallback((ws: Workspace) => {
    setActiveWorkspaceState(ws);
  }, []);

  const deleteWorkspace = useCallback(async (id: string) => {
    if (isDemo) {
      setWorkspaces((prev) => {
        const next = prev.filter((w) => w.id !== id);
        setActiveWorkspaceState((cur) => {
          if (cur?.id === id) return next[0] ?? null;
          return cur;
        });
        return next;
      });
      return;
    }
    
    await supabase.from("workspaces").update({ is_active: false }).eq("id", id);
    await fetchWorkspaces();
  }, [isDemo, fetchWorkspaces, supabase]); // Add supabase to dependency array

  const clearSession = useCallback(() => {
    setWorkspaces([]);
    setActiveWorkspaceState(null);
    setIsDemo(false);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        refreshWorkspaces: fetchWorkspaces,
        deleteWorkspace,
        loading,
        isDemo,
        clearSession,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be inside WorkspaceProvider");
  return ctx;
}
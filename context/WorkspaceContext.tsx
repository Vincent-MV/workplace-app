"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { Workspace } from "@/lib/types";
import { MOCK_WORKSPACES } from "@/lib/mock-data";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  loading: boolean;
  isDemo: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("is_active", true)
      .order("created_at");

    if (!error && data && data.length > 0) {
      // Deduplicate by name (case-insensitive), keeping first occurrence
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
      setWorkspaces(MOCK_WORKSPACES);
      setIsDemo(true);
      setActiveWorkspaceState(MOCK_WORKSPACES[0]);
    }
    setLoading(false);
  }, []);

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
  }, [isDemo, fetchWorkspaces]);

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

// Server Component

import { createClient } from "@/lib/supabase/server"; // Mandatory for Server Component 
import TasksClient from "./TaskClient"; // child component 

export default async function TasksPage() {
  // 1. Initialize the server client (this reads the auth cookies automatically!)
  const supabase = await createClient();
  
  // 2. Get the current user securely on the server
  const { data: { user } } = await supabase.auth.getUser();
  
  // FIX: Return a helpful message instead of a blank white screen if not logged in
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        <p>Please log in to view your tasks.</p>
      </div>
    );
  }

  // 3. Fetch workspaces (This will now return data because the server has the auth cookie!)
  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at");

  const activeWorkspace = workspaces?.[0] || null;

  // 4. Fetch tasks for the active workspace
  let tasks = [];
  if (activeWorkspace) {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", activeWorkspace.id)
      .order("due_date", { nullsFirst: false });
    tasks = data ?? [];
  }

  // 5. Pass the fully fetched data to the Client Component
  return (
    <TasksClient 
      initialTasks={tasks} 
      activeWorkspace={activeWorkspace}
      workspaces={workspaces ?? []}
    />
  );
}
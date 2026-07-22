// lib/ai-context.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getWorkspaceContext(workspaceId: string) {
  // 1. Initialize secure server-side Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
        },
      },
    }
  );

  // 2. Fetch overdue/pending tasks for the secretary to analyze
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, due_date, status')
    .eq('workspace_id', workspaceId)
    .in('status', ['pending', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(10);

  // 3. Fetch upcoming meetings to check for calendar conflicts
  const { data: meetings } = await supabase
    .from('meetings')
    .select('id, title, start_time, end_time')
    .eq('workspace_id', workspaceId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(10);

  return { tasks: tasks || [], meetings: meetings || [] };
}
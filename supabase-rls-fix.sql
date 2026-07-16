-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This allows the anon key to read all data (personal app, no auth needed)

-- WORKSPACES
alter table workspaces enable row level security;
drop policy if exists "anon_read_workspaces" on workspaces;
create policy "anon_read_workspaces" on workspaces for select using (true);
drop policy if exists "anon_insert_workspaces" on workspaces;
create policy "anon_insert_workspaces" on workspaces for insert with check (true);
drop policy if exists "anon_update_workspaces" on workspaces;
create policy "anon_update_workspaces" on workspaces for update using (true);
drop policy if exists "anon_delete_workspaces" on workspaces;
create policy "anon_delete_workspaces" on workspaces for delete using (true);

-- TASKS
alter table tasks enable row level security;
drop policy if exists "anon_all_tasks" on tasks;
create policy "anon_all_tasks" on tasks for all using (true) with check (true);

-- MEETINGS
alter table meetings enable row level security;
drop policy if exists "anon_all_meetings" on meetings;
create policy "anon_all_meetings" on meetings for all using (true) with check (true);

-- HABITS
alter table habits enable row level security;
drop policy if exists "anon_all_habits" on habits;
create policy "anon_all_habits" on habits for all using (true) with check (true);

-- HABIT_LOGS
alter table habit_logs enable row level security;
drop policy if exists "anon_all_habit_logs" on habit_logs;
create policy "anon_all_habit_logs" on habit_logs for all using (true) with check (true);

-- NOTES
alter table notes enable row level security;
drop policy if exists "anon_all_notes" on notes;
create policy "anon_all_notes" on notes for all using (true) with check (true);

-- LESSONS
alter table lessons enable row level security;
drop policy if exists "anon_all_lessons" on lessons;
create policy "anon_all_lessons" on lessons for all using (true) with check (true);

-- LESSON_TAGS
alter table lesson_tags enable row level security;
drop policy if exists "anon_all_lesson_tags" on lesson_tags;
create policy "anon_all_lesson_tags" on lesson_tags for all using (true) with check (true);

-- PODCASTS
alter table podcasts enable row level security;
drop policy if exists "anon_all_podcasts" on podcasts;
create policy "anon_all_podcasts" on podcasts for all using (true) with check (true);

-- AI_TOOLS
alter table ai_tools enable row level security;
drop policy if exists "anon_all_ai_tools" on ai_tools;
create policy "anon_all_ai_tools" on ai_tools for all using (true) with check (true);

-- AI_CONVERSATIONS
alter table ai_conversations enable row level security;
drop policy if exists "anon_all_ai_conversations" on ai_conversations;
create policy "anon_all_ai_conversations" on ai_conversations for all using (true) with check (true);

-- AI_MESSAGES
alter table ai_messages enable row level security;
drop policy if exists "anon_all_ai_messages" on ai_messages;
create policy "anon_all_ai_messages" on ai_messages for all using (true) with check (true);

# Nexus Project Structure

This document maps the main folders, routes, and data-connected files in the Nexus app.

## App Root

The Nexus app lives in this directory:

```text
artifacts/nexus/
```

This folder is a standalone Next.js app. If this is the folder you initialized with `git init`, then this is also your Git repository root.

## Main Folder Map

```text
app/                 Next.js App Router pages and API routes
components/          Shared UI sections, layout pieces, modals, and data-connected widgets
context/             Global React context/state used across routes
lib/                 Supabase client, TypeScript data types, mock data, utilities
public/              Static public assets served directly by the app
src/components/ui/   Reusable UI primitives/components
```

## Routes

| URL route | File | Purpose |
| --- | --- | --- |
| `/` | `app/page.tsx` | Landing/entry page. Collects an email locally and routes to onboarding. This is not real auth yet. |
| `/onboarding` | `app/onboarding/page.tsx` | Creates initial workspace rows in Supabase. Currently creates a random `user_id` with `crypto.randomUUID()`. |
| `/dashboard` | `app/dashboard/page.tsx` | Main dashboard shell showing priorities, meetings, and habits. |
| `/tasks` | `app/tasks/page.tsx` | Task list and task status updates. Reads and updates `tasks`. |
| `/meetings` | `app/meetings/page.tsx` | Meeting list and meeting creation. Reads and inserts `meetings`. |
| `/habits` | `app/habits/page.tsx` | Habit tracking. Reads/writes `habits` and `habit_logs`. |
| `/notes` | `app/notes/page.tsx` | Notes page. Reads/writes `notes`. |
| `/lessons` | `app/lessons/page.tsx` | Lessons/reflection page. Reads/writes `lessons` and `lesson_tags`. |
| `/ai-tools` | `app/ai-tools/page.tsx` | Saved AI tools/resources. Reads/writes `ai_tools`. |
| `/podcasts` | `app/podcasts/page.tsx` | Podcast/resource list. Reads/writes `podcasts`. |
| `/photos` | `app/photos/page.tsx` | Photos route. Mostly UI placeholder unless connected later. |
| `/location` | `app/location/page.tsx` | Location route. Mostly UI placeholder unless connected later. |
| `/storage` | `app/storage/page.tsx` | Storage route. Mostly UI placeholder unless connected later. |
| `/search` | `app/search/page.tsx` | Search route. Mostly UI placeholder unless connected later. |
| `/api/ai` | `app/api/ai/route.ts` | Server-side API route that calls Gemini using `GEMINI_API_KEY`. |

## Core Layout Files

### `app/layout.tsx`

Root layout for the app. It imports global CSS and wraps every page in `WorkspaceProvider`.

Important because every route can access workspace state through the context provider.

### `components/layout/AppShell.tsx`

Main authenticated-app layout. It renders:

- left sidebar
- top bar
- accountability banner
- right panel
- add task modal
- add meeting modal
- add workspace modal
- AI chat panel

Most inner app pages render inside `AppShell`.

## Data and Backend Connection Files

### `lib/supabase.ts`

Creates the Supabase browser client:

```ts
createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

These variables are public by design:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

They can be visible in the browser. Real security must come from Supabase Auth and RLS policies.

### `lib/types.ts`

TypeScript interfaces that mirror your database tables:

```text
Workspace
Task
Meeting
Habit
HabitLog
Note
Lesson
LessonTag
Podcast
AiTool
AiConversation
AiMessage
```

This file helps the UI know the shape of data coming from Supabase.

### `lib/mock-data.ts`

Fallback/demo data used when Supabase has no matching data or when the app enters demo mode.

This lets the UI stay usable even if the database is empty.

### `context/WorkspaceContext.tsx`

Global workspace state for the app.

It fetches active workspaces from Supabase:

```ts
supabase
  .from("workspaces")
  .select("*")
  .eq("is_active", true)
```

It provides:

```text
workspaces
activeWorkspace
setActiveWorkspace
refreshWorkspaces
deleteWorkspace
loading
isDemo
```

Current caveat: it does not filter by authenticated user yet. Once Supabase Auth is implemented, workspace queries should be scoped to the current user through RLS and/or `user_id = auth.uid()` policies.

## Supabase-Connected Pages and Components

These files directly read or write Supabase data.

### Pages

```text
app/onboarding/page.tsx
app/tasks/page.tsx
app/meetings/page.tsx
app/habits/page.tsx
app/notes/page.tsx
app/lessons/page.tsx
app/ai-tools/page.tsx
app/podcasts/page.tsx
```

### Components

```text
components/modals/AddTaskModal.tsx
components/modals/AddMeetingModal.tsx
components/modals/AddWorkspaceModal.tsx
components/dashboard/TodayPriorities.tsx
components/dashboard/UpcomingMeetings.tsx
components/dashboard/HabitsToday.tsx
components/layout/RightPanel.tsx
components/banners/AccountabilityBanner.tsx
components/ai/AIChat.tsx
```

## AI Backend Flow

### `components/ai/AIChat.tsx`

Client-side chat UI. It stores and reads chat data from Supabase tables:

```text
ai_conversations
ai_messages
```

It calls the backend route:

```text
/api/ai
```

### `app/api/ai/route.ts`

Server-side route that calls Gemini with:

```text
GEMINI_API_KEY
```

This key must stay server-only and should never be renamed to `NEXT_PUBLIC_GEMINI_API_KEY`.

## Current Auth and RLS Caveat

The current app has a temporary identity flow:

1. `/` asks for an email.
2. The email is not verified yet.
3. `/onboarding` creates a random `user_id` using `crypto.randomUUID()`.
4. Rows are tied to that generated ID, not Supabase Auth's `auth.uid()`.

For production or real personal data, the better flow is:

```text
Supabase Auth login or magic link
-> trusted user identity from auth.uid()
-> rows store user_id = auth.uid()
-> RLS policies enforce user_id = auth.uid()
```

Recommended RLS pattern for user-owned tables:

```sql
alter table tasks enable row level security;

create policy "Users can read own tasks"
on tasks
for select
using (user_id = auth.uid());

create policy "Users can insert own tasks"
on tasks
for insert
with check (user_id = auth.uid());

create policy "Users can update own tasks"
on tasks
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own tasks"
on tasks
for delete
using (user_id = auth.uid());
```

Use the same basic idea for private tables such as:

```text
workspaces
tasks
meetings
notes
habits
lessons
podcasts
ai_tools
ai_conversations
```

## Environment Variables

Client-visible variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Server-only variables:

```text
GEMINI_API_KEY
SESSION_SECRET
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Never commit `.env.local` or real secrets to GitHub.

## Files Usually Safe To Commit

```text
app/
components/
context/
lib/
public/
src/
components.json
next-env.d.ts
next.config.ts
package.json
postcss.config.mjs
tsconfig.json
```

## Files Usually Not Needed In GitHub

```text
node_modules/
.next/
.env.local
.env.*
.replit-artifact/
supabase-rls-fix.sql
```

`supabase-rls-fix.sql` is not runtime app code. Keep it only if you intentionally want to version database policy scripts.

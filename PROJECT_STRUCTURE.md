# Nexus Project Structure
This document maps the main folders, routes, and data-connected files in the Nexus app.

## App Root
The Nexus app lives in this directory:
`artifacts/nexus/`
This folder is a standalone Next.js app. If this is the folder you initialized with `git init`, then this is also your Git repository root.

## Main Folder Map
- `app/`                 Next.js App Router pages and API routes
- `components/`          Shared UI sections, layout pieces, modals, and data-connected widgets
- `context/`             Global React context/state used across routes
- `lib/`                 Supabase client, TypeScript data types, mock data, utilities
- `public/`              Static public assets served directly by the app
- `src/components/ui/`   Reusable UI primitives/components (shadcn/ui)

## Routes
| URL route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Landing/entry page. Handles real Supabase Auth (Sign In / Sign Up). Redirects to `/onboarding` for new users, `/dashboard` for returning users. |
| `/onboarding` | `app/onboarding/page.tsx` | Creates initial workspace rows in Supabase. **Now uses real `auth.uid()`** instead of `crypto.randomUUID()`. |
| `/dashboard` | `app/dashboard/page.tsx` | Main dashboard shell showing priorities, meetings, and habits. |
| `/tasks` | `app/tasks/page.tsx` | Task list and task status updates. Reads and updates `tasks`. |
| `/meetings` | `app/meetings/page.tsx` | Meeting list and meeting creation. Reads and inserts `meetings`. |
| `/habits` | `app/habits/page.tsx` | Habit tracking. Reads/writes `habits` and `habit_logs`. |
| `/notes` | `app/notes/page.tsx` | Notes page. Reads/writes `notes`. |
| `/lessons` | `app/lessons/page.tsx` | Lessons/reflection page. Reads/writes `lessons` and `lesson_tags`. |
| `/ai-tools` | `app/ai-tools/page.tsx` | Saved AI tools/resources. Reads/writes `ai_tools`. |
| `/podcasts` | `app/podcasts/page.tsx` | Podcast/resource list. Reads/writes `podcasts`. |
| `/photos` | `app/photos/page.tsx` | Photos route. UI placeholder. |
| `/location` | `app/location/page.tsx` | Location route. UI placeholder. |
| `/storage` | `app/storage/page.tsx` | Storage route. UI placeholder. |
| `/search` | `app/search/page.tsx` | Search route. UI placeholder. |
| `/reset-password` | `app/reset-password/page.tsx` | Handles Supabase password reset flow. |
| /api/ai | app/api/ai/route.ts | Server-side API route that calls Groq (Llama 3.3) using GROQ_API_KEY. |

## Core Layout Files
- `app/layout.tsx`: Root layout for the app. Wraps every page in `WorkspaceProvider`.
- `middleware.ts`: **CRITICAL**. Protects all authenticated routes. Redirects unauthenticated users to `/`. Redirects authenticated users with 0 workspaces to `/onboarding`.
- `components/layout/AppShell.tsx`: Main authenticated-app layout. Renders left sidebar, top bar, accountability banner, right panel, and modals.

## Data and Backend Connection Files
- `lib/supabase.ts`: Creates the Supabase browser client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/types.ts`: TypeScript interfaces that mirror the database tables (`Workspace`, `Task`, `Meeting`, `Habit`, etc.).
- `lib/mock-data.ts`: **Deprecated/Empty**. The app now relies 100% on real Supabase data. Mock data is no longer used as a fallback.
- `context/WorkspaceContext.tsx`: Global workspace state. **Now securely filters workspaces by `user_id = auth.uid()`**. No longer falls back to mock data.

## ✅ Auth & RLS Status: COMPLETE
The app now uses a **secure, production-ready identity flow**:
1. User signs in/up via `/` using real Supabase Auth.
2. Trusted user identity is established via `auth.uid()`.
3. All database rows store `user_id = auth.uid()`.
4. **Row Level Security (RLS)** is enabled on ALL tables (`users`, `workspaces`, `tasks`, `meetings`, `habits`, `notes`, `lessons`, `ai_conversations`, etc.).
5. RLS policies strictly enforce `user_id = auth.uid()` for SELECT, INSERT, UPDATE, and DELETE operations, ensuring total data isolation between users.

## Environment Variables
**Client-visible variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Server-only variables:**
- `GEMINI_API_KEY`
- `SESSION_SECRET` (if using advanced auth)

*Never commit `.env.local` or real secrets to GitHub.*

## Files Usually Safe To Commit
- `app/`, `components/`, `context/`, `lib/`, `public/`, `src/`
- `middleware.ts`
- `components.json`, `next-env.d.ts`, `next.config.ts`, `package.json`, `tsconfig.json`
- `supabase-setup.sql` (Kept for reference on how RLS and triggers were configured)

## Files Usually Not Needed In GitHub
- `node_modules/`
- `.next/`
- `.env.local`, `.env.*`
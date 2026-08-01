# Nexus Project Structure

This document maps the main folders, routes, and data-connected files in the Nexus app.

## App Root
The Nexus app is a standalone Next.js 15 application. The root of this repository contains the `package.json`, `pnpm-lock.yaml`, and the `app/` directory. *(Note: The app was originally extracted from a nested Replit `artifacts/nexus/` structure and is now cleanly located at the repository root).*

## Main Folder Map
- `app/`                 Next.js App Router pages, layouts, and API routes
- `app/auth/callback/`   Server route handling Supabase email confirmation redirects
- `components/`          Shared UI sections, layout pieces, modals, and data-connected widgets
- `context/`             Global React context/state used across routes
- `lib/`                 Supabase clients (browser & server), TypeScript types, and utilities
- `public/`              Static public assets served directly by the app
- `src/components/ui/`   Reusable UI primitives/components (shadcn/ui)

## Routes
| URL route | File | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Landing/entry page. Handles dedicated Supabase Auth (Sign In / Sign Up toggle). Redirects to `/onboarding` for new users, `/dashboard` for returning users. |
| `/onboarding` | `app/onboarding/page.tsx` | Creates initial workspace rows in Supabase. Checks if user already has a workspace and redirects to `/dashboard` if they do. |
| `/dashboard` | `app/dashboard/page.tsx` | Main dashboard shell showing priorities, meetings, habits, and the Morning Accountability Prompt. |
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
| `/auth/callback` | `app/auth/callback/route.ts` | **CRITICAL**. Server route that exchanges the email confirmation code for a session and redirects the user. |
| `/api/ai` | `app/api/ai/route.ts` | Server-side API route that calls the Groq API (Llama 3.3) using `GROQ_API_KEY` for the AI Secretary. |

## Core Layout Files
- `app/layout.tsx`: Root layout for the app. Wraps every page in the `WorkspaceProvider`.
- `middleware.ts`: **CRITICAL**. Protects all authenticated routes. Runs on every request to validate the session cookie and redirect unauthenticated users to `/`. *(Optimized to be cookie-only, no database queries, for maximum speed).*
- `components/layout/AppShell.tsx`: Main authenticated-app layout. Renders left sidebar, top bar, accountability banner, right panel, and modals.

## Data and Backend Connection Files
- `lib/supabase.ts`: Creates the **browser** Supabase client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/supabase/server.ts`: Creates the **server-side** Supabase client using `@supabase/ssr` for Next.js 15 compatibility (handles async cookies securely).
- `lib/types.ts`: TypeScript interfaces that mirror the database tables (`Workspace`, `Task`, `Meeting`, `Habit`, etc.).
- `lib/mock-data.ts`: **Deprecated/Empty**. The app now relies 100% on real Supabase data.
- `context/WorkspaceContext.tsx`: Global workspace state. Securely filters workspaces by `user_id = auth.uid()`.

## ✅ Auth & RLS Status: COMPLETE
The app uses a **secure, production-ready identity flow**:
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
- `GROQ_API_KEY` (Used for AI Secretary features)
- `SUPABASE_SERVICE_ROLE_KEY` (Optional: for backend admin tasks, never expose to client)

*Never commit `.env.local` or real secrets to GitHub.*

## Files Usually Safe To Commit
- `app/`, `components/`, `context/`, `lib/`, `public/`, `src/`
- `middleware.ts`
- `components.json`, `next-env.d.ts`, `next.config.ts`, `package.json`, `tsconfig.json`, **`pnpm-lock.yaml`**
- `supabase-setup.sql` (Kept for reference on how RLS and triggers were configured)

## Files Usually Not Needed In GitHub (`.gitignore`)
- `node_modules/`
- `.next/`
- `.env.local`, `.env.*`
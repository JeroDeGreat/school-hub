# School Hub

School Hub is a full-stack school collaboration platform built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

It combines:

- Realtime department chat with replies, reactions, typing indicators, and file sharing
- A general lobby for school-wide communication
- Assignment publishing and student submissions
- A help-request board with volunteer matching, points, and badges
- Notifications for mentions, announcements, assignments, and help activity
- Responsive workspace UI with light and dark themes

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Framer Motion
- Supabase Auth, Postgres, Realtime, Storage, and RLS

## Environment

Create `.env.local` from `.env.example` and provide your real project values:

```bash
cp .env.example .env.local
```

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres:your-db-password@db.your-project-ref.supabase.co:5432/postgres
```

Security rules:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- Never commit `.env.local`
- Keep service-role logic on the server only
- Rotate any keys that were previously shared in chat or pushed to a repo

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Apply the Supabase migration:

Option A: Supabase CLI

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Option B: Supabase SQL editor

- Open the SQL editor in your Supabase dashboard
- Run [`supabase/migrations/20260408193000_school_hub.sql`](./supabase/migrations/20260408193000_school_hub.sql)

3. Start the app:

```bash
npm run dev
```

4. Open one of these:

- [http://localhost:3000](http://localhost:3000) for the live app shell
- [http://localhost:3000/demo](http://localhost:3000/demo) for a local interactive demo workspace
- [http://localhost:3000/preview](http://localhost:3000/preview) for phone-sized preview frames in the browser

## One-Click Preview

On Windows, you can now launch the app with one click:

1. Double-click [preview-school-hub.cmd](./preview-school-hub.cmd)
2. It will:
   - install dependencies if needed
   - start the local preview server
   - open the phone-style preview page automatically

If you are inside VS Code, you can also run the `Preview School Hub` task from:

- `Terminal` -> `Run Task...` -> `Preview School Hub`

You can also use VS Code `Run and Debug`:

1. Open the repo folder in VS Code
2. Go to `Run and Debug`
3. Choose `School Hub Phone Preview`
4. Press `F5`

That will start the preview flow and open the phone-style view for you automatically.

## Verification

The project has been validated with:

```bash
npm run lint
npm run typecheck
npm run build
```

## Supabase Design

The migration sets up:

- `users`
- `departments`
- `memberships`
- `direct_threads`
- `direct_thread_members`
- `messages`
- `message_reactions`
- `announcements`
- `department_resources`
- `assignments`
- `submissions`
- `help_requests`
- `badges`
- `user_badges`
- `notifications`

It also includes:

- strict Row Level Security on app tables
- helper functions for membership and permission checks
- automatic profile creation from `auth.users`
- automated notifications for assignments, announcements, mentions, and help activity
- badge-awarding automation based on help points
- private storage buckets for shared files and submissions
- seeded starter departments and onboarding content through `ensure_school_defaults()`

## Product Notes

- Google and email sign-in are supported through Supabase Auth
- Department huddles use generated Jitsi meeting links so calls work immediately without extra infrastructure
- Mentions use `@handle`
- The first authenticated session automatically bootstraps starter departments, resources, and sample activity
- If the Supabase schema is missing, the homepage now shows a dedicated "database setup pending" state instead of crashing

## Project Structure

```text
src/
  app/
    auth/callback/
  components/
    auth/
    landing/
    workspace/
  lib/
    data/
    supabase/
    types/
    utils/
supabase/
  migrations/
```

## Deployment

This app is ready for Vercel or any Node-compatible Next.js host.

Before deploying:

1. Add the four environment variables in your host
2. Run the Supabase migration
3. Confirm your Supabase Auth redirect URLs include:
   - `http://localhost:3000/auth/callback`
   - your production domain + `/auth/callback`

## GitHub

To publish to the requested repository:

```bash
git init
git remote add origin https://github.com/JeroDeGreat/school-hub.git
git add .
git commit -m "Build School Hub full-stack collaboration platform"
git push -u origin main
```

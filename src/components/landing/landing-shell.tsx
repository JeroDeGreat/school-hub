"use client";

import { motion } from "framer-motion";
import {
  BellDot,
  BookOpenText,
  BriefcaseBusiness,
  GraduationCap,
  HandHelping,
  MessagesSquare,
} from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";

export function LandingShell({ mode }: { mode: "setup" | "guest" }) {
  const isSetup = mode === "setup";

  return (
    <main className="relative overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] max-w-7xl flex-col gap-8">
        <header className="glass-panel flex items-center justify-between rounded-full border border-white/50 px-4 py-3 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-accent text-sm font-bold text-white dark:bg-white dark:text-black">
              SH
            </div>
            <div>
              <p className="font-semibold">School Hub</p>
              <p className="text-sm text-muted">One place for school communication</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 rounded-full bg-white/70 px-4 py-2 text-sm text-muted md:flex dark:bg-white/5">
            <BellDot className="h-4 w-4" />
            Realtime, secure, ready for Supabase auth
          </div>
        </header>

        <div className="grid flex-1 items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
            className="glass-panel-strong relative overflow-hidden rounded-[2.5rem] border border-white/55 px-6 py-7 sm:px-8 sm:py-9 dark:border-white/10"
          >
            <div className="absolute inset-0 subtle-grid opacity-50" />
            <div className="relative z-10">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold tracking-[0.24em] text-muted uppercase dark:bg-white/5">
                <GraduationCap className="h-3.5 w-3.5" />
                Production-ready school platform
              </p>
              <h1 className="max-w-3xl text-5xl leading-[0.95] text-foreground sm:text-6xl xl:text-7xl">
                Replace scattered chats with a calmer campus command center.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
                School Hub merges department chat, assignments, announcements,
                peer help, and real-time notifications in one responsive space
                built with Next.js, Tailwind, and Supabase.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] bg-[#d9caee]/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-[#251f36]/80">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted">General Lobby</p>
                      <h2 className="mt-1 text-3xl text-foreground">Live school pulse</h2>
                    </div>
                    <MessagesSquare className="h-10 w-10 rounded-full bg-white/70 p-2.5 text-foreground shadow-sm dark:bg-white/10" />
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-[1.4rem] bg-white/70 p-4 dark:bg-white/8">
                      <p className="text-sm font-semibold">Today’s focus</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        Announcements, call links, mentions, and department handoffs stay visible instead of disappearing inside group chats.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-[1.2rem] bg-white/60 px-3 py-4 dark:bg-white/8">
                        <p className="text-3xl font-semibold">24</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                          Active rooms
                        </p>
                      </div>
                      <div className="rounded-[1.2rem] bg-white/60 px-3 py-4 dark:bg-white/8">
                        <p className="text-3xl font-semibold">8</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                          Due soon
                        </p>
                      </div>
                      <div className="rounded-[1.2rem] bg-white/60 px-3 py-4 dark:bg-white/8">
                        <p className="text-3xl font-semibold">12</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted">
                          Help matches
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[2rem] bg-white/80 p-5 dark:bg-white/8">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted">Assignment flow</p>
                        <h3 className="text-2xl text-foreground">Due dates without chaos</h3>
                      </div>
                      <BookOpenText className="h-10 w-10 rounded-full bg-black/6 p-2.5 dark:bg-white/10" />
                    </div>
                    <div className="rounded-[1.4rem] bg-[#efbfd3]/70 p-4 dark:bg-[#3a2832]">
                      <p className="text-sm font-semibold">Microscope reflection</p>
                      <p className="mt-1 text-sm text-muted">Upload notes, files, and review feedback in one thread.</p>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-white/80 p-5 dark:bg-white/8">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted">Peer support</p>
                        <h3 className="text-2xl text-foreground">Help requests that reward good citizenship</h3>
                      </div>
                      <HandHelping className="h-10 w-10 rounded-full bg-black/6 p-2.5 dark:bg-white/10" />
                    </div>
                    <div className="flex items-center gap-3 rounded-[1.4rem] bg-[#bfe0e4]/70 p-4 dark:bg-[#1f3341]">
                      <BriefcaseBusiness className="h-9 w-9 rounded-full bg-white/70 p-2 dark:bg-white/10" />
                      <p className="text-sm leading-6 text-muted">
                        Volunteer, earn points, unlock badges, and keep the school knowledge loop active.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: MessagesSquare,
                    title: "Realtime chat",
                    text: "Department rooms, DMs, replies, reactions, typing indicators, and file uploads.",
                  },
                  {
                    icon: BookOpenText,
                    title: "Classroom workflows",
                    text: "Assignments, submissions, resources, and announcements all live beside the conversation.",
                  },
                  {
                    icon: BellDot,
                    title: "Actionable alerts",
                    text: "Mentions, deadline reminders, help matches, and badge unlocks are handled automatically.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-[1.6rem] bg-white/70 p-4 dark:bg-white/6"
                  >
                    <feature.icon className="mb-3 h-9 w-9 rounded-full bg-black/5 p-2 dark:bg-white/10" />
                    <p className="font-semibold">{feature.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.2, 0.9, 0.2, 1] }}
            className="flex flex-col gap-4"
          >
            {isSetup ? (
              <div className="glass-panel-strong rounded-[2rem] border border-white/55 p-6 dark:border-white/10">
                <p className="mb-3 text-xs font-semibold tracking-[0.24em] text-muted uppercase">
                  Setup required
                </p>
                <h2 className="text-3xl text-foreground">Add your Supabase variables</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  This app is ready to run, but it needs your project values in
                  <code className="mx-1 rounded bg-black/5 px-1.5 py-0.5 text-xs dark:bg-white/10">
                    .env.local
                  </code>
                  first.
                </p>
                <div className="mt-5 space-y-3 rounded-[1.5rem] bg-black/4 p-4 text-sm dark:bg-white/5">
                  <p><code>NEXT_PUBLIC_SUPABASE_URL</code></p>
                  <p><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></p>
                  <p><code>SUPABASE_SERVICE_ROLE_KEY</code></p>
                  <p><code>DATABASE_URL</code></p>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted">
                  The service role key must stay server-only. If the key you pasted
                  earlier is real, rotate it in Supabase before deploying.
                </p>
              </div>
            ) : (
              <AuthCard />
            )}

            <div className="glass-panel rounded-[2rem] border border-white/50 p-5 dark:border-white/10">
              <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">
                What ships
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <li>Department spaces, general lobby, DMs, and group chats</li>
                <li>Assignments, submissions, announcements, and resources</li>
                <li>Help requests, volunteer matching, points, and badges</li>
                <li>Supabase auth, Realtime, storage, SQL automation, and strict RLS</li>
              </ul>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}

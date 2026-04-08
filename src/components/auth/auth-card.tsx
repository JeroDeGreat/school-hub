"use client";

import { Loader2, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function AuthCard() {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setLoading("google");
    setMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(null);
    }
  }

  async function handleEmailSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("email");
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Magic link sent. Check your inbox to finish signing in.");
      setEmail("");
    }

    setLoading(null);
  }

  return (
    <div className="glass-panel-strong w-full max-w-md rounded-[2rem] border border-white/60 p-6 text-left shadow-[0_25px_80px_rgba(48,32,82,0.16)] dark:border-white/10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-muted uppercase dark:bg-white/5">
            <Sparkles className="h-3.5 w-3.5" />
            School Access
          </p>
          <h2 className="text-3xl text-foreground">Start your workspace</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sign in with Google or request a magic link to open your departments,
            assignments, chats, and help queue.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="mb-4 flex w-full items-center justify-center gap-3 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:opacity-95 dark:bg-white dark:text-black"
      >
        {loading === "google" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.35 11.1H12v2.98h5.36c-.23 1.48-1.77 4.35-5.36 4.35-3.23 0-5.87-2.67-5.87-5.96s2.64-5.96 5.87-5.96c1.84 0 3.07.79 3.78 1.46l2.58-2.48C16.71 3.98 14.61 3 12 3 6.92 3 2.8 7.12 2.8 12.2S6.92 21.4 12 21.4c6.93 0 8.63-6.48 8.63-9.58 0-.64-.07-1.13-.16-1.62Z"
            />
          </svg>
        )}
        Continue with Google
      </button>

      <form onSubmit={handleEmailSignIn} className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          School email
        </label>
        <div className="flex items-center gap-3 rounded-[1.4rem] border border-line bg-white/70 px-4 py-3 dark:bg-white/5">
          <Mail className="h-4 w-4 text-muted" />
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@school.edu"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <button
          type="submit"
          disabled={loading === "email"}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-black/[0.03] disabled:opacity-70 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14"
        >
          {loading === "email" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          Send magic link
        </button>
      </form>

      <p className="mt-4 min-h-6 text-sm text-muted">{message}</p>
    </div>
  );
}

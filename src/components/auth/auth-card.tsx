"use client";

import { Loader2, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthView = "signin" | "signup" | "magic";

export function AuthCard() {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [view, setView] = useState<AuthView>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState<
    "email" | "google" | "password" | "admin" | null
  >(null);
  const [message, setMessage] = useState<string | null>(null);
  const [canBootstrapAdmin, setCanBootstrapAdmin] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    setCanBootstrapAdmin(hostname === "localhost" || hostname === "127.0.0.1");
  }, []);

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

  async function handlePasswordAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("password");
    setMessage(null);

    if (view === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim() || undefined,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Account created. Confirm your email, then come back and sign in.");
        setPassword("");
      }

      setLoading(null);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(null);
      return;
    }

    window.location.assign("/");
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

  async function handleAdminBootstrap() {
    setLoading("admin");
    setMessage(null);

    try {
      const response = await fetch("/api/dev-admin", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        email?: string;
        password?: string;
        error?: string;
      };

      if (!response.ok || !payload.email || !payload.password) {
        throw new Error(payload.error ?? "Could not prepare the admin test account.");
      }

      const signInResult = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });

      if (signInResult.error) {
        throw signInResult.error;
      }

      setMessage(`Signed in as ${payload.email}. Redirecting to the admin workspace.`);
      window.location.assign("/");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not create the admin test account.",
      );
      setLoading(null);
    }
  }

  const isMagicLink = view === "magic";
  const isPasswordView = view === "signin" || view === "signup";

  return (
    <div className="glass-panel-strong w-full max-w-md rounded-[2rem] border border-white/60 p-6 text-left shadow-[0_25px_80px_rgba(48,32,82,0.16)] dark:border-white/10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-muted uppercase dark:bg-white/5">
            <Sparkles className="h-3.5 w-3.5" />
            School Access
          </p>
          <h2 className="text-3xl text-foreground">Log in before you enter the hub</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use Google, email and password, or a magic link. If you are testing
            locally, you can spin up a ready-made admin account in one click.
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-[1.4rem] bg-black/5 p-1 dark:bg-white/5">
        {[
          { id: "signin" as const, label: "Sign in" },
          { id: "signup" as const, label: "Sign up" },
          { id: "magic" as const, label: "Magic link" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setView(item.id);
              setMessage(null);
            }}
            className={`rounded-[1.1rem] px-3 py-2 text-sm font-semibold transition ${
              view === item.id
                ? "bg-white text-foreground shadow-sm dark:bg-white dark:text-black"
                : "text-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
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

      {isPasswordView ? (
        <form onSubmit={handlePasswordAuth} className="space-y-3">
          {view === "signup" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Full name
              </label>
              <div className="flex items-center gap-3 rounded-[1.4rem] border border-line bg-white/70 px-4 py-3 dark:bg-white/5">
                <UserRound className="h-4 w-4 text-muted" />
                <input
                  suppressHydrationWarning
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Avery Johnson"
                  autoComplete="name"
                  data-form-type="other"
                  data-lpignore="true"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </div>
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              School email
            </label>
            <div className="flex items-center gap-3 rounded-[1.4rem] border border-line bg-white/70 px-4 py-3 dark:bg-white/5">
              <Mail className="h-4 w-4 text-muted" />
              <input
                suppressHydrationWarning
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@school.edu"
                autoComplete="email"
                data-form-type="other"
                data-lpignore="true"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-[1.4rem] border border-line bg-white/70 px-4 py-3 dark:bg-white/5">
              <LockKeyhole className="h-4 w-4 text-muted" />
              <input
                suppressHydrationWarning
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={view === "signup" ? "Create a password" : "Enter your password"}
                autoComplete={view === "signup" ? "new-password" : "current-password"}
                data-form-type="other"
                data-lpignore="true"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading === "password"}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-black/[0.03] disabled:opacity-70 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/14"
          >
            {loading === "password" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {view === "signup" ? "Create account" : "Sign in with password"}
          </button>
        </form>
      ) : null}

      {isMagicLink ? (
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            School email
          </label>
          <div className="flex items-center gap-3 rounded-[1.4rem] border border-line bg-white/70 px-4 py-3 dark:bg-white/5">
            <Mail className="h-4 w-4 text-muted" />
            <input
              suppressHydrationWarning
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@school.edu"
              autoComplete="email"
              data-form-type="other"
              data-lpignore="true"
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
      ) : null}

      {canBootstrapAdmin ? (
        <button
          type="button"
          onClick={handleAdminBootstrap}
          disabled={loading === "admin"}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border border-dashed border-black/15 bg-black/[0.03] px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-black/[0.05] disabled:opacity-70 dark:border-white/15 dark:bg-white/6 dark:hover:bg-white/10"
        >
          {loading === "admin" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Create local admin test account
        </button>
      ) : null}

      <p className="mt-4 min-h-6 text-sm text-muted">{message}</p>
    </div>
  );
}

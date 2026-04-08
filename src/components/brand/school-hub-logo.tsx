"use client";

import { cn } from "@/lib/utils";

export function SchoolHubLogo({
  className,
  showWordmark = true,
  compact = false,
}: {
  className?: string;
  showWordmark?: boolean;
  compact?: boolean;
}) {
  const markSize = compact ? "h-11 w-11" : "h-12 w-12";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative grid place-items-center overflow-hidden rounded-[1.35rem] bg-[linear-gradient(145deg,#27213f_0%,#7057d9_50%,#f1a8c8_100%)] shadow-[0_18px_50px_rgba(67,47,123,0.28)]",
          markSize,
        )}
      >
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className="h-8 w-8 text-white"
          fill="none"
        >
          <path
            d="M15 44V21.5C15 19.6 16.5 18 18.4 18H28.5C30.4 18 32 19.6 32 21.5V44"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 44V28.5C32 26.6 33.6 25 35.5 25H45.6C47.5 25 49 26.6 49 28.5V44"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23.5 28H40.5"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="23.5" cy="28" r="3.25" fill="currentColor" />
          <circle cx="40.5" cy="28" r="3.25" fill="currentColor" />
        </svg>
        <div className="pointer-events-none absolute inset-x-2 bottom-1 h-4 rounded-full bg-white/15 blur-md" />
      </div>

      {showWordmark ? (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-[0.08em] text-foreground uppercase">
            School Hub
          </p>
          <p className="truncate text-sm text-muted">
            Realtime campus workspace
          </p>
        </div>
      ) : null}
    </div>
  );
}

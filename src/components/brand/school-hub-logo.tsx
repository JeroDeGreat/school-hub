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
          "relative grid place-items-center overflow-hidden rounded-[1.35rem] bg-[linear-gradient(145deg,#101528_0%,#4678a7_45%,#f2b76b_100%)] shadow-[0_18px_50px_rgba(34,52,92,0.28)]",
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
            d="M18 22.5C18 19.46 20.46 17 23.5 17H40.5C43.54 17 46 19.46 46 22.5V40.5C46 43.54 43.54 46 40.5 46H23.5C20.46 46 18 43.54 18 40.5V22.5Z"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <path
            d="M24 25L32 33L40 25"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 39L32 31L40 39"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="pointer-events-none absolute inset-x-2 bottom-1 h-4 rounded-full bg-white/15 blur-md" />
      </div>

      {showWordmark ? (
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-[0.08em] text-foreground uppercase">
            ClassLoop
          </p>
          <p className="truncate text-sm text-muted">
            Smart school community
          </p>
        </div>
      ) : null}
    </div>
  );
}

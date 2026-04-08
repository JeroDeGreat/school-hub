"use client";

import type { BadgeSummary, NotificationSummary } from "@/lib/types/app";
import { cn, formatRelativeTime } from "@/lib/utils";

export function WorkspaceNotifications({
  notifications,
  badges,
  onMarkAllRead,
}: {
  notifications: NotificationSummary[];
  badges: BadgeSummary[];
  onMarkAllRead: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Notifications</p>
          <h2 className="text-2xl">Action center</h2>
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
        >
          Mark all read
        </button>
      </div>

      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "rounded-[1.5rem] border px-4 py-4",
            notification.isRead
              ? "border-line bg-white/70 dark:bg-white/5"
              : "border-accent/20 bg-accent/8 dark:bg-white/8",
          )}
        >
          <p className="text-sm font-semibold">{notification.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{notification.body}</p>
          <p className="mt-3 text-xs text-muted">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      ))}

      <div className="rounded-[1.7rem] bg-white/80 p-5 dark:bg-white/6">
        <p className="font-semibold">Badges</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {badges.map((badge) => (
            <div key={badge.id} className="rounded-[1.2rem] border border-line px-4 py-4">
              <p className="font-semibold">{badge.name}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { BellRing, BookMarked, Sparkles, Users } from "lucide-react";
import type {
  AnnouncementSummary,
  MemberDirectoryEntry,
  ResourceSummary,
} from "@/lib/types/app";
import { Avatar } from "@/components/workspace/workspace-ui";
import { estimateTimeCredits } from "@/lib/utils";

export function WorkspaceContextPanel({
  announcements,
  resources,
  members,
}: {
  announcements: AnnouncementSummary[];
  resources: ResourceSummary[];
  members: MemberDirectoryEntry[];
}) {
  return (
    <aside className="glass-panel hidden rounded-[2rem] border border-white/55 p-4 xl:block dark:border-white/10">
      <div className="rounded-[1.5rem] bg-white/75 p-4 dark:bg-white/6">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4" />
          <p className="font-semibold">Pinned pulse</p>
        </div>
        <h3 className="mt-3 text-2xl">
          {announcements[0]?.title ?? "Everything important stays visible"}
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted">
          {announcements[0]?.body ??
            "Announcements, resources, and context stay beside the live workspace."}
        </p>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-white/75 p-4 dark:bg-white/6">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          <p className="font-semibold">Helper leaderboard</p>
        </div>
        <div className="space-y-3">
          {members.slice(0, 6).map((member) => (
            <div key={member.user.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={member.user.fullName} url={member.user.avatarUrl} />
                <div>
                  <p className="text-sm font-semibold">{member.user.fullName}</p>
                  <p className="text-xs text-muted">@{member.user.handle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{member.user.points} pts</p>
                <p className="text-xs text-muted">
                  {estimateTimeCredits(member.user.points)} credits
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-white/75 p-4 dark:bg-white/6">
        <div className="mb-3 flex items-center gap-2">
          <BookMarked className="h-4 w-4" />
          <p className="font-semibold">Resource shelf</p>
        </div>
        <div className="space-y-3">
          {resources.slice(0, 4).map((resource) => (
            <div key={resource.id} className="rounded-[1.2rem] border border-line px-4 py-3">
              <p className="font-semibold">{resource.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {resource.body ?? resource.linkUrl ?? "Shared resource"}
              </p>
            </div>
          ))}
          {resources.length === 0 ? (
            <div className="rounded-[1.2rem] border border-dashed border-line px-4 py-4 text-sm text-muted">
              New notes and resources will show up here.
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-[linear-gradient(160deg,rgba(245,217,230,0.95),rgba(227,238,247,0.92))] p-4 dark:bg-[linear-gradient(160deg,rgba(49,34,61,0.92),rgba(23,35,51,0.92))]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <p className="font-semibold">ClassLoop vibe</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          Smart but chill. Fast enough for class, polished enough that students
          actually want to open it.
        </p>
      </div>
    </aside>
  );
}

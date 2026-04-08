"use client";

import { Sparkles, Users } from "lucide-react";
import type { AnnouncementSummary, MemberDirectoryEntry, ResourceSummary } from "@/lib/types/app";
import { Avatar } from "@/components/workspace/workspace-ui";

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
        <p className="text-sm text-muted">Pinned announcement</p>
        <h3 className="mt-1 text-2xl">
          {announcements[0]?.title ?? "Everything important stays visible"}
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted">
          {announcements[0]?.body ??
            "Announcements, resources, and member context stay beside the live workspace."}
        </p>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-white/75 p-4 dark:bg-white/6">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          <p className="font-semibold">Member leaderboard</p>
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
              <span className="text-sm text-muted">{member.user.points} pts</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-[1.5rem] bg-white/75 p-4 dark:bg-white/6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <p className="font-semibold">Resources</p>
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
        </div>
      </div>
    </aside>
  );
}

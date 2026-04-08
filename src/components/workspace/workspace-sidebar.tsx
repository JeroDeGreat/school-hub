"use client";

import { Search } from "lucide-react";
import type { DirectThreadSummary, WorkspaceData } from "@/lib/types/app";
import { cn } from "@/lib/utils";
import type { RoomMode } from "@/components/workspace/workspace-types";

export function WorkspaceSidebar({
  data,
  roomMode,
  activeDepartmentId,
  activeThreadId,
  query,
  setQuery,
  filteredThreads,
  onDepartmentSelect,
  onThreadSelect,
}: {
  data: WorkspaceData;
  roomMode: RoomMode;
  activeDepartmentId: string | null;
  activeThreadId: string | null;
  query: string;
  setQuery: (value: string) => void;
  filteredThreads: DirectThreadSummary[];
  onDepartmentSelect: (departmentId: string) => void;
  onThreadSelect: (threadId: string) => void;
}) {
  const filteredDepartments = data.departments.filter((department) =>
    department.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <aside className="glass-panel w-full rounded-[2rem] border border-white/55 p-4 lg:max-w-[320px] dark:border-white/10">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-accent text-sm font-bold text-white dark:bg-white dark:text-black">
          SH
        </div>
        <div>
          <p className="font-semibold">School Hub</p>
          <p className="text-sm text-muted">@{data.currentUser.handle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-[1.5rem] border border-line bg-white/70 px-4 py-3 dark:bg-white/5">
        <Search className="h-4 w-4 text-muted" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search spaces and chats"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <p className="mt-5 mb-2 text-xs font-semibold tracking-[0.24em] text-muted uppercase">
        Departments
      </p>
      <div className="space-y-2">
        {filteredDepartments.map((department) => (
          <button
            key={department.id}
            type="button"
            onClick={() => onDepartmentSelect(department.id)}
            className={cn(
              "w-full rounded-[1.3rem] px-4 py-3 text-left",
              roomMode === "department" && activeDepartmentId === department.id
                ? "bg-accent text-white dark:bg-white dark:text-black"
                : "bg-white/70 dark:bg-white/5",
            )}
          >
            <p className="font-semibold">{department.name}</p>
            <p className="text-xs opacity-70">{department.memberCount} members</p>
          </button>
        ))}
      </div>

      <p className="mt-5 mb-2 text-xs font-semibold tracking-[0.24em] text-muted uppercase">
        DMs
      </p>
      <div className="space-y-2">
        {filteredThreads.length === 0 ? (
          <div className="rounded-[1.3rem] bg-white/70 px-4 py-3 text-sm text-muted dark:bg-white/5">
            Direct threads appear when classmates join.
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => onThreadSelect(thread.id)}
              className={cn(
                "w-full rounded-[1.3rem] px-4 py-3 text-left",
                roomMode === "direct" && activeThreadId === thread.id
                  ? "bg-accent text-white dark:bg-white dark:text-black"
                  : "bg-white/70 dark:bg-white/5",
              )}
            >
              <p className="font-semibold">
                {thread.title ??
                  thread.participants.map((participant) => participant.fullName).join(", ")}
              </p>
              <p className="text-xs opacity-70">
                {thread.lastMessagePreview ?? "No messages yet"}
              </p>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

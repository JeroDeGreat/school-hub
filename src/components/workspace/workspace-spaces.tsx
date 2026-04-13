"use client";

import {
  FlaskConical,
  MessagesSquare,
  MonitorSmartphone,
  Palette,
  Sigma,
  Wrench,
} from "lucide-react";
import type { WorkspaceData } from "@/lib/types/app";
import { formatRelativeTime } from "@/lib/utils";

function iconForDepartment(slug: string) {
  if (slug.includes("science")) return FlaskConical;
  if (slug.includes("ict") || slug.includes("tech") || slug.includes("code")) return MonitorSmartphone;
  if (slug.includes("math")) return Sigma;
  if (slug.includes("engineering")) return Wrench;
  if (slug.includes("art") || slug.includes("design") || slug.includes("creative")) return Palette;
  return MessagesSquare;
}

export function WorkspaceSpaces({
  data,
  onOpenChat,
  onOpenAssignments,
  onOpenHelp,
}: {
  data: WorkspaceData;
  onOpenChat: (departmentId: string) => void;
  onOpenAssignments: (departmentId: string) => void;
  onOpenHelp: (departmentId: string) => void;
}) {
  const orderedDepartments = [...data.departments].sort((left, right) => {
    if (left.isLobby) return -1;
    if (right.isLobby) return 1;
    return left.name.localeCompare(right.name);
  });

  return (
    <div className="space-y-4">
      <header className="rounded-[1.8rem] bg-white/80 p-5 dark:bg-white/6">
        <p className="text-sm text-muted">Departments</p>
        <h2 className="mt-1 text-3xl">School spaces</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Every department has its own conversation, assignment board, shared notes,
          and help exchange. The general lobby stays open for whole-school updates.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        {orderedDepartments.map((department) => {
          const DepartmentIcon = iconForDepartment(department.slug);
          const latestMessage = [...data.messages]
            .filter((message) => message.departmentId === department.id)
            .at(-1);
          const latestAnnouncement = data.announcements.find(
            (announcement) => announcement.departmentId === department.id,
          );
          const dueCount = data.assignments.filter(
            (assignment) => assignment.departmentId === department.id,
          ).length;
          const helpCount = data.helpRequests.filter(
            (request) =>
              request.departmentId === department.id && request.status !== "resolved",
          ).length;
          const activeNow = Math.max(1, Math.min(department.memberCount, helpCount + dueCount + 2));

          return (
            <article
              key={department.id}
              className="rounded-[1.9rem] border border-white/55 bg-white/80 p-5 shadow-[0_18px_55px_rgba(24,18,49,0.08)] dark:border-white/10 dark:bg-white/6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-[1.3rem] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                    style={{ backgroundColor: `${department.color}CC` }}
                  >
                    <DepartmentIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl">{department.name}</h3>
                      {department.isLobby ? (
                        <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent dark:bg-white/10 dark:text-white">
                          General lobby
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                      {department.description ?? "ClassLoop space"}
                    </p>
                  </div>
                </div>

                <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-muted dark:bg-white/10">
                  {activeNow} active now
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.3rem] bg-black/[0.03] px-4 py-3 dark:bg-white/6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Members
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{department.memberCount}</p>
                </div>
                <div className="rounded-[1.3rem] bg-black/[0.03] px-4 py-3 dark:bg-white/6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Assignments
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{dueCount}</p>
                </div>
                <div className="rounded-[1.3rem] bg-black/[0.03] px-4 py-3 dark:bg-white/6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Help requests
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{helpCount}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-line px-4 py-4">
                <p className="text-sm font-semibold text-foreground">
                  {latestAnnouncement?.title ??
                    latestMessage?.body ??
                    "No updates yet"}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {latestAnnouncement?.body ??
                    latestMessage?.author?.fullName ??
                    "Open the space to start the conversation."}
                </p>
                {latestAnnouncement?.createdAt ?? latestMessage?.createdAt ? (
                  <p suppressHydrationWarning className="mt-3 text-xs text-muted">
                    Latest activity{" "}
                    {formatRelativeTime(
                      latestAnnouncement?.createdAt ?? latestMessage?.createdAt ?? new Date().toISOString(),
                    )}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChat(department.id)}
                  className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
                >
                  Open chat
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAssignments(department.id)}
                  className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold"
                >
                  Assignments
                </button>
                <button
                  type="button"
                  onClick={() => onOpenHelp(department.id)}
                  className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold"
                >
                  Help exchange
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

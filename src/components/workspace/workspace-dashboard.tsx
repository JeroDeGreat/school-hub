"use client";

import { motion } from "framer-motion";
import {
  BellRing,
  Compass,
  HandHeart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { WorkspaceData } from "@/lib/types/app";
import {
  deriveSkillTags,
  estimateTimeCredits,
  formatActivityDate,
  formatRelativeTime,
  helpMatchScore,
} from "@/lib/utils";

export function WorkspaceDashboard({
  data,
  onOpenLobby,
  onOpenSpaces,
  onOpenDepartment,
  onOpenAssignments,
  onOpenHelp,
  onOpenProfile,
}: {
  data: WorkspaceData;
  onOpenLobby: () => void;
  onOpenSpaces: () => void;
  onOpenDepartment: (departmentId: string) => void;
  onOpenAssignments: (departmentId?: string) => void;
  onOpenHelp: (departmentId?: string) => void;
  onOpenProfile: () => void;
}) {
  const skillTags = deriveSkillTags(data.currentUser, data.departments);
  const timeCredits = estimateTimeCredits(data.currentUser.points);
  const unreadAlerts = data.notifications.filter((notification) => !notification.isRead);
  const dueSoonAssignments = [...data.assignments]
    .sort((left, right) => left.dueAt.localeCompare(right.dueAt))
    .slice(0, 3);
  const recommendedHelp = [...data.helpRequests]
    .sort((left, right) => {
      const rightScore = helpMatchScore(right.topicTags, skillTags);
      const leftScore = helpMatchScore(left.topicTags, skillTags);

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return right.createdAt.localeCompare(left.createdAt);
    })
    .slice(0, 3);
  const focusDepartments = data.departments.slice(0, 3);

  return (
    <div className="space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(27,26,45,0.95),rgba(79,62,136,0.92),rgba(232,135,171,0.84))] p-6 text-white shadow-[0_25px_80px_rgba(31,23,61,0.26)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.24em] uppercase text-white/70">
              Home
            </p>
            <h2 className="mt-3 text-4xl leading-[0.95]">
              Welcome back, {data.currentUser.fullName.split(" ")[0]}.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/78">
              ClassLoop keeps your departments, assignments, help exchange, and
              school-wide conversations in one clean place.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {skillTags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/14 px-3 py-1 text-xs font-semibold text-white/88"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid min-w-[260px] gap-3 sm:grid-cols-3">
            {[
              {
                label: "Contribution",
                value: `${data.currentUser.points} pts`,
                icon: Sparkles,
              },
              {
                label: "Time credits",
                value: `${timeCredits}`,
                icon: HandHeart,
              },
              {
                label: "Badges",
                value: `${data.badges.length}`,
                icon: ShieldCheck,
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] bg-white/10 p-4 backdrop-blur-sm">
                <item.icon className="h-5 w-5 text-white/78" />
                <p className="mt-4 text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenLobby}
            className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black"
          >
            Open general lobby
          </button>
          <button
            type="button"
            onClick={onOpenProfile}
            className="rounded-full border border-white/20 bg-white/8 px-4 py-2.5 text-sm font-semibold text-white"
          >
            View profile & badges
          </button>
        </div>
      </motion.section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[1.8rem] bg-white/80 p-5 dark:bg-white/6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Assignments</p>
              <h3 className="text-2xl">Due soon</h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenAssignments(dueSoonAssignments[0]?.departmentId)}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
            >
              Open board
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {dueSoonAssignments.length > 0 ? (
              dueSoonAssignments.map((assignment) => (
                <button
                  key={assignment.id}
                  type="button"
                  onClick={() => onOpenAssignments(assignment.departmentId)}
                  className="w-full rounded-[1.4rem] border border-line bg-black/[0.03] px-4 py-4 text-left transition hover:bg-black/[0.05] dark:bg-white/6 dark:hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{assignment.title}</p>
                      <p className="mt-1 text-sm text-muted">
                        {data.departments.find((department) => department.id === assignment.departmentId)?.name ??
                          "Department"}
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent dark:bg-white/10 dark:text-white">
                      {assignment.points} pts
                    </span>
                  </div>
                  <p suppressHydrationWarning className="mt-3 text-sm text-muted">
                    Due {formatActivityDate(assignment.dueAt)}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-line px-4 py-6 text-sm text-muted">
                No assignments are due soon.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[1.8rem] bg-white/80 p-5 dark:bg-white/6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Help exchange</p>
              <h3 className="text-2xl">Best matches for you</h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenHelp(recommendedHelp[0]?.departmentId)}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
            >
              Open requests
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {recommendedHelp.length > 0 ? (
              recommendedHelp.map((request) => {
                const matchScore = helpMatchScore(request.topicTags, skillTags);

                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => onOpenHelp(request.departmentId)}
                    className="w-full rounded-[1.4rem] border border-line bg-black/[0.03] px-4 py-4 text-left transition hover:bg-black/[0.05] dark:bg-white/6 dark:hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{request.title}</p>
                        <p className="mt-1 text-sm text-muted">
                          {request.author?.fullName ?? "Student request"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#ffd9a8]/50 px-3 py-1 text-xs font-semibold text-foreground dark:bg-[#5c4930]">
                        {request.pointsReward} pts
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {request.topicTags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-muted dark:bg-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent dark:bg-white/10 dark:text-white">
                        {matchScore > 0 ? `${matchScore} skill match` : "Good community fit"}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-line px-4 py-6 text-sm text-muted">
                No open help requests right now.
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.8rem] bg-white/80 p-5 dark:bg-white/6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Departments</p>
              <h3 className="text-2xl">Your active spaces</h3>
            </div>
            <button
              type="button"
              onClick={onOpenSpaces}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
            >
              Open spaces
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {focusDepartments.map((department) => (
              <button
                key={department.id}
                type="button"
                onClick={() => onOpenDepartment(department.id)}
                className="rounded-[1.5rem] px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
                style={{
                  background: `linear-gradient(135deg, ${department.color}CC, rgba(255,255,255,0.72))`,
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {department.isLobby ? "School-wide" : "Department"}
                </p>
                <h4 className="mt-3 text-xl font-semibold text-foreground">
                  {department.name}
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {department.description ?? "Shared updates and team work live here."}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[1.8rem] bg-white/80 p-5 dark:bg-white/6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">School pulse</p>
              <h3 className="text-2xl">Recent alerts</h3>
            </div>
            <button
              type="button"
              onClick={onOpenProfile}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
            >
              Open profile
            </button>
          </div>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={onOpenLobby}
              className="w-full rounded-[1.5rem] bg-black/[0.04] px-4 py-4 text-left dark:bg-white/6"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">General lobby</p>
                  <h4 className="mt-1 text-xl font-semibold">Open the whole-school feed</h4>
                </div>
                <Compass className="h-5 w-5 text-muted" />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Jump into school-wide updates, open call links, and casual discussion.
              </p>
            </button>

            {unreadAlerts.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className="rounded-[1.4rem] border border-line px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {notification.body}
                    </p>
                  </div>
                  <BellRing className="mt-1 h-4 w-4 text-muted" />
                </div>
                <p suppressHydrationWarning className="mt-3 text-xs text-muted">
                  {formatRelativeTime(notification.createdAt)}
                </p>
              </div>
            ))}

            {unreadAlerts.length === 0 ? (
              <div className="rounded-[1.4rem] border border-dashed border-line px-4 py-6 text-sm text-muted">
                You are caught up for now.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

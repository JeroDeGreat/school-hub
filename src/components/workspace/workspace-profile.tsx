"use client";

import { Award, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Avatar } from "@/components/workspace/workspace-ui";
import type { WorkspaceData } from "@/lib/types/app";
import { deriveSkillTags, estimateTimeCredits } from "@/lib/utils";

export function WorkspaceProfile({ data }: { data: WorkspaceData }) {
  const departments = data.departments.map((department) => department.name);
  const timeCredits = estimateTimeCredits(data.currentUser.points);
  const skillTags = deriveSkillTags(data.currentUser, data.departments);
  const helpedCount = data.helpRequests.filter(
    (request) => request.volunteer?.id === data.currentUser.id,
  ).length;
  const postedCount = data.helpRequests.filter(
    (request) => request.author?.id === data.currentUser.id,
  ).length;
  const messageCount = data.messages.filter(
    (message) => message.author?.id === data.currentUser.id,
  ).length;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,rgba(13,16,29,0.96),rgba(41,54,88,0.94),rgba(78,114,144,0.9))] p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar
              name={data.currentUser.fullName}
              url={data.currentUser.avatarUrl}
              size={72}
            />
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] uppercase text-white/70">
                Profile
              </p>
              <h2 className="mt-2 text-4xl leading-[0.95]">
                {data.currentUser.fullName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/78">
                {data.currentUser.headline ?? "ClassLoop member"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                  {data.currentUser.role}
                </span>
                {departments.slice(0, 3).map((department) => (
                  <span
                    key={department}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold"
                  >
                    {department}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid min-w-[260px] gap-3 sm:grid-cols-3">
            {[
              { label: "Points", value: data.currentUser.points, icon: Sparkles },
              { label: "Time credits", value: timeCredits, icon: ShieldCheck },
              { label: "Badges", value: data.badges.length, icon: Award },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.4rem] bg-white/10 p-4">
                <item.icon className="h-5 w-5 text-white/74" />
                <p className="mt-4 text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/70">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.8rem] bg-white/80 p-5 dark:bg-white/6">
          <p className="text-sm text-muted">Contribution snapshot</p>
          <h3 className="mt-1 text-2xl">What you have been doing</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.3rem] bg-black/[0.03] px-4 py-4 dark:bg-white/6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Helped peers
              </p>
              <p className="mt-2 text-2xl font-semibold">{helpedCount}</p>
            </div>
            <div className="rounded-[1.3rem] bg-black/[0.03] px-4 py-4 dark:bg-white/6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Requests posted
              </p>
              <p className="mt-2 text-2xl font-semibold">{postedCount}</p>
            </div>
            <div className="rounded-[1.3rem] bg-black/[0.03] px-4 py-4 dark:bg-white/6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Messages sent
              </p>
              <p className="mt-2 text-2xl font-semibold">{messageCount}</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-line px-4 py-4">
            <p className="font-semibold">Suggested strengths</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {skillTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent dark:bg-white/10 dark:text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.8rem] bg-white/80 p-5 dark:bg-white/6">
          <p className="text-sm text-muted">Badges</p>
          <h3 className="mt-1 text-2xl">Recognition board</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.badges.length > 0 ? (
              data.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-[1.5rem] border border-line px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{badge.name}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {badge.description}
                      </p>
                    </div>
                    <Star className="h-5 w-5 text-accent" />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-line px-4 py-6 text-sm text-muted md:col-span-2">
                Your badges will show up here as you help classmates and stay active.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

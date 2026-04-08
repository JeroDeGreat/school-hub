"use client";

import type { HelpRequestSummary } from "@/lib/types/app";
import { formatRelativeTime } from "@/lib/utils";

export function WorkspaceHelpBoard({
  helpRequests,
  helpTitle,
  setHelpTitle,
  helpDescription,
  setHelpDescription,
  onCreate,
  onVolunteer,
  onResolve,
  currentUserId,
  canManage,
}: {
  helpRequests: HelpRequestSummary[];
  helpTitle: string;
  setHelpTitle: (value: string) => void;
  helpDescription: string;
  setHelpDescription: (value: string) => void;
  onCreate: () => void;
  onVolunteer: (helpRequestId: string) => void;
  onResolve: (helpRequestId: string) => void;
  currentUserId: string;
  canManage: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[1.7rem] bg-white/80 p-5 dark:bg-white/6">
        <p className="font-semibold">Ask for help</p>
        <input
          value={helpTitle}
          onChange={(event) => setHelpTitle(event.target.value)}
          placeholder="Title"
          className="mt-3 w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
        />
        <textarea
          value={helpDescription}
          onChange={(event) => setHelpDescription(event.target.value)}
          rows={4}
          placeholder="What do you need help with?"
          className="mt-3 w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
        />
        <button
          type="button"
          onClick={onCreate}
          className="mt-3 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
        >
          Post request
        </button>
      </div>

      {helpRequests.map((request) => (
        <div key={request.id} className="rounded-[1.7rem] bg-white/80 p-5 dark:bg-white/6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted">{formatRelativeTime(request.createdAt)}</p>
              <h3 className="mt-1 text-2xl">{request.title}</h3>
            </div>
            <div className="rounded-full bg-black/5 px-4 py-2 text-sm text-muted dark:bg-white/10">
              {request.pointsReward} pts
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted">{request.description}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {request.status === "matched" && request.volunteer
                ? `Matched with ${request.volunteer.fullName}`
                : request.status === "resolved"
                  ? "Resolved"
                  : `Posted by ${request.author?.fullName ?? "a student"}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {request.status === "open" && request.author?.id !== currentUserId ? (
                <button
                  type="button"
                  onClick={() => onVolunteer(request.id)}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
                >
                  Volunteer
                </button>
              ) : null}
              {request.status !== "resolved" &&
              (request.author?.id === currentUserId ||
                request.volunteer?.id === currentUserId ||
                canManage) ? (
                <button
                  type="button"
                  onClick={() => onResolve(request.id)}
                  className="rounded-full border border-line px-4 py-2 text-sm font-semibold"
                >
                  Resolve
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

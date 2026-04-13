"use client";

import type { HelpRequestSummary } from "@/lib/types/app";
import { estimateTimeCredits, formatRelativeTime, helpMatchScore } from "@/lib/utils";

export function WorkspaceHelpBoard({
  helpRequests,
  helpTitle,
  setHelpTitle,
  helpDescription,
  setHelpDescription,
  helpTags,
  setHelpTags,
  suggestedSkills,
  currentUserPoints,
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
  helpTags: string;
  setHelpTags: (value: string) => void;
  suggestedSkills: string[];
  currentUserPoints: number;
  onCreate: () => void;
  onVolunteer: (helpRequestId: string) => void;
  onResolve: (helpRequestId: string) => void;
  currentUserId: string;
  canManage: boolean;
}) {
  const timeCredits = estimateTimeCredits(currentUserPoints);
  const sortedRequests = [...helpRequests].sort((left, right) => {
    const rightScore = helpMatchScore(right.topicTags, suggestedSkills);
    const leftScore = helpMatchScore(left.topicTags, suggestedSkills);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });

  return (
    <div className="space-y-4">
      <div className="rounded-[1.8rem] bg-white/80 p-5 dark:bg-white/6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Help exchange</p>
            <h2 className="mt-1 text-3xl">Request help or answer a classmate</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Use tags so the right people find the request quickly. Helpers earn
              contribution points and time credits as they close the loop.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-black/[0.04] px-4 py-4 text-sm dark:bg-white/8">
            <p className="font-semibold text-foreground">{timeCredits} time credits</p>
            <p className="mt-1 text-muted">Built from your current contribution score.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            value={helpTitle}
            onChange={(event) => setHelpTitle(event.target.value)}
            placeholder="Need notes, feedback, or a quick explanation?"
            className="w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
          />
          <input
            value={helpTags}
            onChange={(event) => setHelpTags(event.target.value)}
            placeholder="Tags: notes, algebra, coding"
            className="w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
          />
        </div>
        <textarea
          value={helpDescription}
          onChange={(event) => setHelpDescription(event.target.value)}
          rows={4}
          placeholder="What exactly do you need, and what would make the answer useful?"
          className="mt-3 w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.slice(0, 5).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() =>
                  setHelpTags(
                    helpTags
                      .split(",")
                      .map((tag) => tag.trim().toLowerCase())
                      .includes(skill.toLowerCase())
                      ? helpTags
                      : [helpTags, skill].filter(Boolean).join(", "),
                  )
                }
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent dark:bg-white/10 dark:text-white"
              >
                {skill}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            Post request
          </button>
        </div>
      </div>

      {sortedRequests.map((request) => {
        const matchScore = helpMatchScore(request.topicTags, suggestedSkills);

        return (
          <div key={request.id} className="rounded-[1.7rem] bg-white/80 p-5 dark:bg-white/6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p suppressHydrationWarning className="text-sm text-muted">
                  {formatRelativeTime(request.createdAt)}
                </p>
                <h3 className="mt-1 text-2xl">{request.title}</h3>
              </div>
              <div className="rounded-full bg-black/5 px-4 py-2 text-sm text-muted dark:bg-white/10">
                {request.pointsReward} pts
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">{request.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {request.topicTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-muted dark:bg-white/10"
                >
                  {tag}
                </span>
              ))}
              <span className="rounded-full bg-[#d8eef1] px-3 py-1 text-xs font-semibold text-foreground dark:bg-[#26414a] dark:text-white">
                {matchScore > 0 ? `${matchScore} skill match` : "Open for the community"}
              </span>
            </div>
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
                    Help for +{Math.max(1, Math.floor(request.pointsReward / 12))} credits
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
        );
      })}
    </div>
  );
}

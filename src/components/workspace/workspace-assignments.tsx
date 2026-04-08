"use client";

import { AttachmentButton } from "@/components/workspace/workspace-ui";
import type { AssignmentSummary } from "@/lib/types/app";
import { formatActivityDate } from "@/lib/utils";

export function WorkspaceAssignments({
  assignments,
  canManage,
  currentUserId,
  assignmentTitle,
  setAssignmentTitle,
  assignmentInstructions,
  setAssignmentInstructions,
  assignmentDueAt,
  setAssignmentDueAt,
  onCreate,
  submissionAssignmentId,
  setSubmissionAssignmentId,
  submissionBody,
  setSubmissionBody,
  onSubmit,
  attachSubmission,
}: {
  assignments: AssignmentSummary[];
  canManage: boolean;
  currentUserId: string;
  assignmentTitle: string;
  setAssignmentTitle: (value: string) => void;
  assignmentInstructions: string;
  setAssignmentInstructions: (value: string) => void;
  assignmentDueAt: string;
  setAssignmentDueAt: (value: string) => void;
  onCreate: () => void;
  submissionAssignmentId: string | null;
  setSubmissionAssignmentId: (value: string) => void;
  submissionBody: string;
  setSubmissionBody: (value: string) => void;
  onSubmit: () => void;
  attachSubmission: (file: File | null) => void;
}) {
  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="rounded-[1.7rem] bg-white/75 p-4 dark:bg-white/6">
          <p className="font-semibold">Create assignment</p>
          <input
            value={assignmentTitle}
            onChange={(event) => setAssignmentTitle(event.target.value)}
            placeholder="Title"
            className="mt-3 w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
          />
          <textarea
            value={assignmentInstructions}
            onChange={(event) => setAssignmentInstructions(event.target.value)}
            rows={4}
            placeholder="Instructions"
            className="mt-3 w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
          />
          <input
            value={assignmentDueAt}
            onChange={(event) => setAssignmentDueAt(event.target.value)}
            type="datetime-local"
            className="mt-3 w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={onCreate}
            className="mt-3 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            Publish
          </button>
        </div>
      ) : null}

      {assignments.map((assignment) => {
        const ownSubmission = assignment.submissions.find(
          (submission) => submission.studentId === currentUserId,
        );

        return (
          <div key={assignment.id} className="rounded-[1.7rem] bg-white/80 p-5 dark:bg-white/6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Due {formatActivityDate(assignment.dueAt)}</p>
                <h3 className="mt-1 text-2xl">{assignment.title}</h3>
              </div>
              <div className="rounded-full bg-black/5 px-4 py-2 text-sm text-muted dark:bg-white/10">
                {assignment.points} pts
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">{assignment.instructions}</p>
            {assignment.attachment ? (
              <div className="mt-3">
                <AttachmentButton attachment={assignment.attachment} />
              </div>
            ) : null}
            {canManage ? (
              <p className="mt-4 text-sm text-muted">
                {assignment.submissions.length} submissions received
              </p>
            ) : (
              <div className="mt-4 rounded-[1.3rem] bg-black/4 p-4 dark:bg-white/6">
                <p className="text-sm font-semibold">
                  {ownSubmission ? "Your submission" : "Submit your work"}
                </p>
                {ownSubmission?.body ? (
                  <p className="mt-2 text-sm text-muted">{ownSubmission.body}</p>
                ) : null}
                <textarea
                  value={submissionAssignmentId === assignment.id ? submissionBody : ""}
                  onFocus={() => setSubmissionAssignmentId(assignment.id)}
                  onChange={(event) => {
                    setSubmissionAssignmentId(assignment.id);
                    setSubmissionBody(event.target.value);
                  }}
                  rows={3}
                  placeholder="Add a short note"
                  className="mt-3 w-full rounded-[1.1rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold">
                    Attach
                    <input
                      type="file"
                      className="hidden"
                      onChange={(event) => attachSubmission(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionAssignmentId(assignment.id);
                      onSubmit();
                    }}
                    className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
                  >
                    {ownSubmission ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

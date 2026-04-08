"use client";

import { motion } from "framer-motion";
import { FileUp, Send } from "lucide-react";
import { Avatar, AttachmentButton } from "@/components/workspace/workspace-ui";
import type { MessageSummary, UserSummary } from "@/lib/types/app";
import { cn, formatRelativeTime } from "@/lib/utils";

export function WorkspaceChat({
  currentUser,
  messages,
  draft,
  setDraft,
  file,
  setFile,
  replyToId,
  setReplyToId,
  typing,
  onSend,
  onToggleReaction,
  onReply,
}: {
  currentUser: UserSummary;
  messages: MessageSummary[];
  draft: string;
  setDraft: (value: string) => void;
  file: File | null;
  setFile: (value: File | null) => void;
  replyToId: string | null;
  setReplyToId: (value: string | null) => void;
  typing: string[];
  onSend: () => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onReply: (messageId: string) => void;
}) {
  return (
    <div className="flex min-h-[520px] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-[1.5rem] border border-line px-4 py-4",
              message.author?.id === currentUser.id
                ? "bg-accent text-white dark:bg-white dark:text-black"
                : "bg-white/80 dark:bg-white/5",
              message.parentMessageId ? "ml-6 sm:ml-10" : "",
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar
                name={message.author?.fullName ?? "School Hub Bot"}
                url={message.author?.avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {message.author?.fullName ?? "School Hub Bot"}
                  </p>
                  {message.author?.handle ? (
                    <span className="text-xs opacity-70">@{message.author.handle}</span>
                  ) : null}
                  <span className="text-xs opacity-70">
                    {formatRelativeTime(message.createdAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{message.body}</p>
                {message.attachment ? (
                  <div className="mt-3">
                    <AttachmentButton attachment={message.attachment} />
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {["👍", "❤️", "🎯"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onToggleReaction(message.id, emoji)}
                      className="rounded-full bg-black/6 px-3 py-1 text-xs font-semibold dark:bg-white/10"
                    >
                      {emoji}{" "}
                      {message.reactions.filter((reaction) => reaction.emoji === emoji).length ||
                        ""}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => onReply(message.id)}
                    className="rounded-full bg-black/6 px-3 py-1 text-xs font-semibold dark:bg-white/10"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 rounded-[1.7rem] bg-white/75 p-4 dark:bg-white/6">
        {replyToId ? (
          <div className="mb-3 flex items-center justify-between rounded-[1.1rem] bg-black/5 px-3 py-2 text-sm text-muted dark:bg-white/8">
            Replying in thread
            <button type="button" onClick={() => setReplyToId(null)}>
              Clear
            </button>
          </div>
        ) : null}
        {typing.length > 0 ? (
          <p className="mb-3 text-sm text-muted">{typing.join(", ")} typing…</p>
        ) : null}
        {file ? (
          <div className="mb-3 flex items-center justify-between rounded-[1.1rem] bg-black/5 px-3 py-2 text-sm text-muted dark:bg-white/8">
            <span>{file.name}</span>
            <button type="button" onClick={() => setFile(null)}>
              Remove
            </button>
          </div>
        ) : null}
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          placeholder="Message the room. Use @handles for mentions."
          className="w-full resize-none rounded-[1.3rem] border border-line bg-transparent px-4 py-3 text-sm outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold">
            <FileUp className="h-4 w-4" />
            Attach
            <input
              type="file"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            onClick={onSend}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

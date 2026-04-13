"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  Bell,
  BookCheck,
  HandHelping,
  House,
  Layers3,
  LogOut,
  Menu,
  MessageCircleMore,
  MoonStar,
  SunMedium,
  UserRound,
  Video,
} from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { useTheme } from "next-themes";
import { WorkspaceAssignments } from "@/components/workspace/workspace-assignments";
import { WorkspaceChat } from "@/components/workspace/workspace-chat";
import { WorkspaceContextPanel } from "@/components/workspace/workspace-context-panel";
import { WorkspaceDashboard } from "@/components/workspace/workspace-dashboard";
import { WorkspaceHelpBoard } from "@/components/workspace/workspace-help-board";
import { WorkspaceNotifications } from "@/components/workspace/workspace-notifications";
import { WorkspaceProfile } from "@/components/workspace/workspace-profile";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceSpaces } from "@/components/workspace/workspace-spaces";
import type { RoomMode, WorkspaceView } from "@/components/workspace/workspace-types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type {
  AttachmentPayload,
  HelpRequestSummary,
  MessageSummary,
  WorkspaceData,
} from "@/lib/types/app";
import { buildCallLink, canManageDepartment, cn, deriveSkillTags } from "@/lib/utils";

const messageSelect =
  "id, body, department_id, direct_thread_id, parent_message_id, kind, attachment, created_at, updated_at, author:users!messages_author_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points), reactions:message_reactions(emoji, user_id)";

function normalizeMessage(row: {
  id: string;
  body: string;
  department_id: string | null;
  direct_thread_id: string | null;
  parent_message_id: string | null;
  kind: string;
  attachment: unknown;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    full_name: string | null;
    handle: string;
    email: string;
    avatar_url: string | null;
    role: "student" | "teacher" | "admin";
    headline: string | null;
    points: number;
  } | null;
  reactions: Array<{ emoji: string; user_id: string }> | null;
}): MessageSummary {
  return {
    id: row.id,
    body: row.body,
    departmentId: row.department_id,
    directThreadId: row.direct_thread_id,
    parentMessageId: row.parent_message_id,
    kind: row.kind,
    attachment:
      typeof row.attachment === "object" && row.attachment
        ? (row.attachment as AttachmentPayload)
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: row.author
      ? {
          id: row.author.id,
          fullName: row.author.full_name ?? row.author.email.split("@")[0] ?? "School member",
          handle: row.author.handle,
          email: row.author.email,
          avatarUrl: row.author.avatar_url,
          role: row.author.role,
          headline: row.author.headline,
          points: row.author.points,
        }
      : null,
    reactions: (row.reactions ?? []).map((reaction) => ({
      emoji: reaction.emoji,
      userId: reaction.user_id,
    })),
  };
}

type WorkspaceShellProps = {
  initialData: WorkspaceData;
  mode?: "live" | "demo";
  initialView?: WorkspaceView;
};

export function WorkspaceShell({
  initialData,
  mode = "live",
  initialView = "dashboard",
}: WorkspaceShellProps) {
  const initialDepartment =
    initialData.departments.find((department) => department.isLobby) ??
    initialData.departments[0] ??
    null;
  const isDemo = mode === "demo";
  const [supabase] = useState(() => (isDemo ? null : createBrowserSupabaseClient()));
  const [data, setData] = useState(initialData);
  const [view, setView] = useState<WorkspaceView>(initialView);
  const [roomMode, setRoomMode] = useState<RoomMode>("department");
  const [departmentId, setDepartmentId] = useState(initialDepartment?.id ?? null);
  const [threadId, setThreadId] = useState(initialData.directThreads[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messageFile, setMessageFile] = useState<File | null>(null);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [typing, setTyping] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentInstructions, setAssignmentInstructions] = useState("");
  const [assignmentDueAt, setAssignmentDueAt] = useState("");
  const [submissionBody, setSubmissionBody] = useState("");
  const [submissionAssignmentId, setSubmissionAssignmentId] = useState<string | null>(null);
  const [helpTitle, setHelpTitle] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpTags, setHelpTags] = useState("");
  const roomChannel = useRef<RealtimeChannel | null>(null);
  const deferredQuery = useDeferredValue(query);
  const { resolvedTheme, setTheme } = useTheme();

  const lobby = data.departments.find((department) => department.isLobby) ?? data.departments[0];
  const department =
    data.departments.find((item) => item.id === departmentId) ?? lobby ?? data.departments[0];
  const thread =
    data.directThreads.find((item) => item.id === threadId) ?? data.directThreads[0];
  const roomId = roomMode === "department" ? department?.id ?? null : thread?.id ?? null;
  const roomName =
    roomMode === "department"
      ? department?.name ?? "ClassLoop"
      : thread?.title ??
        thread?.participants.map((person) => person.fullName).join(", ") ??
        "Direct circle";
  const canManage =
    roomMode === "department" && department
      ? canManageDepartment(department, data.currentUser)
      : false;
  const messages = data.messages.filter((message) =>
    roomMode === "department"
      ? message.departmentId === department?.id
      : message.directThreadId === thread?.id,
  );
  const assignments = data.assignments.filter(
    (assignment) => assignment.departmentId === department?.id,
  );
  const helpRequests = data.helpRequests.filter(
    (helpRequest) => helpRequest.departmentId === department?.id,
  );
  const resources = data.resources.filter(
    (resource) => resource.departmentId === department?.id,
  );
  const announcements = data.announcements.filter(
    (announcement) => announcement.departmentId === department?.id,
  );
  const members = data.directory
    .filter((entry) => entry.departmentId === department?.id)
    .sort((left, right) => right.user.points - left.user.points);
  const filteredThreads = data.directThreads.filter((item) =>
    (item.title ?? item.participants.map((person) => person.fullName).join(" "))
      .toLowerCase()
      .includes(deferredQuery.toLowerCase()),
  );
  const unreadCount = data.notifications.filter((notification) => !notification.isRead).length;
  const suggestedSkills = deriveSkillTags(data.currentUser, data.departments);
  const showContextPanel =
    view === "chat" ||
    view === "assignments" ||
    view === "help" ||
    view === "notifications";

  const primaryNav = [
    { id: "dashboard" as WorkspaceView, label: "Home", icon: House },
    { id: "spaces" as WorkspaceView, label: "Departments", icon: Layers3 },
    { id: "chat" as WorkspaceView, label: "Chat", icon: MessageCircleMore },
    { id: "assignments" as WorkspaceView, label: "Assignments", icon: BookCheck },
    { id: "help" as WorkspaceView, label: "Help", icon: HandHelping },
    { id: "profile" as WorkspaceView, label: "Profile", icon: UserRound },
    {
      id: "notifications" as WorkspaceView,
      label: unreadCount > 0 ? `Alerts (${unreadCount})` : "Alerts",
      icon: Bell,
    },
  ];
  const mobileNav = [
    { id: "dashboard" as WorkspaceView, label: "Home", icon: House },
    { id: "spaces" as WorkspaceView, label: "Spaces", icon: Layers3 },
    { id: "chat" as WorkspaceView, label: "Chat", icon: MessageCircleMore },
    { id: "help" as WorkspaceView, label: "Help", icon: HandHelping },
    { id: "profile" as WorkspaceView, label: "Profile", icon: UserRound },
  ];

  function ensureDepartmentContext(preferredDepartmentId?: string) {
    const nextDepartmentId =
      preferredDepartmentId ?? departmentId ?? lobby?.id ?? data.departments[0]?.id ?? null;

    if (!nextDepartmentId) {
      return;
    }

    setRoomMode("department");
    setDepartmentId(nextDepartmentId);
  }

  function setWorkspaceView(nextView: WorkspaceView, preferredDepartmentId?: string) {
    startTransition(() => {
      if (nextView === "chat") {
        if (roomMode === "direct" && !preferredDepartmentId) {
          setView(nextView);
          return;
        }

        ensureDepartmentContext(preferredDepartmentId);
      } else if (
        nextView === "assignments" ||
        nextView === "help" ||
        nextView === "notifications"
      ) {
        ensureDepartmentContext(preferredDepartmentId);
      } else if (preferredDepartmentId) {
        ensureDepartmentContext(preferredDepartmentId);
      }

      setView(nextView);
    });
  }

  function openDepartmentChat(nextDepartmentId: string) {
    startTransition(() => {
      ensureDepartmentContext(nextDepartmentId);
      setView("chat");
    });
  }

  function openLobby() {
    if (!lobby?.id) {
      return;
    }

    startTransition(() => {
      ensureDepartmentContext(lobby.id);
      setView("chat");
    });
  }

  const onIncomingMessage = useEffectEvent(async (messageId: string) => {
    if (!supabase) return;
    const { data: rawRow } = await supabase
      .from("messages")
      .select(messageSelect)
      .eq("id", messageId)
      .single();
    const row = rawRow as Parameters<typeof normalizeMessage>[0] | null;
    if (!row) return;
    setData((current) => ({
      ...current,
      messages: [
        ...current.messages.filter((message) => message.id !== row.id),
        normalizeMessage(row),
      ].sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    }));
  });

  useEffect(() => {
    if (!roomId || !supabase || isDemo) return;
    const filter =
      roomMode === "department"
        ? `department_id=eq.${roomId}`
        : `direct_thread_id=eq.${roomId}`;
    const channel = supabase.channel(`room:${roomMode}:${roomId}`);
    roomChannel.current = channel;
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter },
        (payload) => void onIncomingMessage(String(payload.new.id)),
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const handle = payload.handle as string | undefined;
        if (!handle || handle === data.currentUser.handle) return;
        setTyping((current) => [...current.filter((item) => item !== handle), handle]);
        window.setTimeout(
          () => setTyping((current) => current.filter((item) => item !== handle)),
          1400,
        );
      })
      .subscribe();
    return () => {
      setTyping([]);
      if (roomChannel.current) void supabase.removeChannel(roomChannel.current);
    };
  }, [data.currentUser.handle, isDemo, roomId, roomMode, supabase]);

  useEffect(() => {
    if (!supabase || isDemo) return;
    const channel = supabase.channel(`notifications:${data.currentUser.id}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${data.currentUser.id}`,
        },
        (payload) => {
          setData((current) => ({
            ...current,
            notifications: [
              {
                id: String(payload.new.id),
                kind: payload.new.kind as never,
                title: String(payload.new.title),
                body: String(payload.new.body),
                departmentId: (payload.new.department_id as string | null) ?? null,
                assignmentId: (payload.new.assignment_id as string | null) ?? null,
                helpRequestId: (payload.new.help_request_id as string | null) ?? null,
                messageId: (payload.new.message_id as string | null) ?? null,
                directThreadId: (payload.new.direct_thread_id as string | null) ?? null,
                isRead: Boolean(payload.new.is_read),
                createdAt: String(payload.new.created_at),
              },
              ...current.notifications,
            ],
          }));
        },
      )
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [data.currentUser.id, isDemo, supabase]);

  async function uploadAttachment(bucket: string, targetId: string, targetFile: File) {
    const path = `${targetId}/${crypto.randomUUID()}-${targetFile.name}`;

    if (!supabase || isDemo) {
      return {
        bucket: "preview",
        path,
        filename: targetFile.name,
        mimeType: targetFile.type || "application/octet-stream",
        size: targetFile.size,
      } satisfies AttachmentPayload;
    }

    const { error } = await supabase.storage.from(bucket).upload(path, targetFile, {
      upsert: false,
    });

    if (error) throw error;

    return {
      bucket,
      path,
      filename: targetFile.name,
      mimeType: targetFile.type || "application/octet-stream",
      size: targetFile.size,
    } satisfies AttachmentPayload;
  }

  async function sendMessage() {
    if (!roomId || (!draft.trim() && !messageFile)) return;

    try {
      const attachment = messageFile
        ? await uploadAttachment("department-files", roomId, messageFile)
        : null;

      if (!supabase || isDemo) {
        setData((current) => ({
          ...current,
          messages: [
            ...current.messages,
            {
              id: crypto.randomUUID(),
              body: draft.trim() || `Shared ${messageFile?.name ?? "a file"}`,
              departmentId: roomMode === "department" ? roomId : null,
              directThreadId: roomMode === "direct" ? roomId : null,
              parentMessageId: replyToId,
              kind: attachment ? "file" : "message",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              attachment,
              author: current.currentUser,
              reactions: [],
            },
          ],
        }));
        setDraft("");
        setMessageFile(null);
        setReplyToId(null);
        setNotice("Preview mode keeps your changes locally in the browser.");
        return;
      }

      const { data: rawRow, error } = await supabase
        .from("messages")
        .insert({
          author_id: data.currentUser.id,
          body: draft.trim() || `Shared ${messageFile?.name ?? "a file"}`,
          department_id: roomMode === "department" ? roomId : null,
          direct_thread_id: roomMode === "direct" ? roomId : null,
          parent_message_id: replyToId,
          kind: attachment ? "file" : "message",
          attachment,
        })
        .select(messageSelect)
        .single();
      const row = rawRow as Parameters<typeof normalizeMessage>[0] | null;

      if (error || !row) throw error;

      setData((current) => ({
        ...current,
        messages: [...current.messages, normalizeMessage(row)].sort((left, right) =>
          left.createdAt.localeCompare(right.createdAt),
        ),
      }));
      setDraft("");
      setMessageFile(null);
      setReplyToId(null);
      setNotice(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not send message.");
    }
  }

  async function toggleReaction(messageId: string, emoji: string) {
    setData((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id !== messageId
          ? message
          : {
              ...message,
              reactions: message.reactions.some(
                (reaction) =>
                  reaction.userId === current.currentUser.id && reaction.emoji === emoji,
              )
                ? message.reactions.filter(
                    (reaction) =>
                      !(
                        reaction.userId === current.currentUser.id &&
                        reaction.emoji === emoji
                      ),
                  )
                : [...message.reactions, { emoji, userId: current.currentUser.id }],
            },
      ),
    }));

    if (!supabase || isDemo) return;
    await supabase.rpc("toggle_message_reaction", {
      target_message: messageId,
      reaction_emoji: emoji,
    });
  }

  async function createAssignment() {
    if (!department || !canManage || !assignmentTitle.trim() || !assignmentDueAt) return;

    if (supabase && !isDemo) {
      const { error } = await supabase.from("assignments").insert({
        department_id: department.id,
        author_id: data.currentUser.id,
        title: assignmentTitle.trim(),
        instructions: assignmentInstructions.trim(),
        due_at: new Date(assignmentDueAt).toISOString(),
      });

      if (error) return setNotice(error.message);
    }

    setData((current) => ({
      ...current,
      assignments: [
        {
          id: crypto.randomUUID(),
          departmentId: department.id,
          title: assignmentTitle.trim(),
          instructions: assignmentInstructions.trim(),
          dueAt: new Date(assignmentDueAt).toISOString(),
          points: 40,
          status: "open",
          attachment: null,
          createdAt: new Date().toISOString(),
          author: current.currentUser,
          submissions: [],
        },
        ...current.assignments,
      ],
    }));
    setAssignmentTitle("");
    setAssignmentInstructions("");
    setAssignmentDueAt("");
    setNotice(isDemo ? "Preview assignment published locally." : "Assignment published.");
  }

  async function submitAssignment() {
    if (!submissionAssignmentId) return;
    const attachment = messageFile
      ? await uploadAttachment("submission-files", submissionAssignmentId, messageFile)
      : null;

    if (supabase && !isDemo) {
      const { error } = await supabase.from("submissions").upsert(
        {
          assignment_id: submissionAssignmentId,
          student_id: data.currentUser.id,
          body: submissionBody.trim() || null,
          attachment,
        },
        { onConflict: "assignment_id,student_id" },
      );
      if (error) return setNotice(error.message);
    }

    setData((current) => ({
      ...current,
      assignments: current.assignments.map((assignment) =>
        assignment.id !== submissionAssignmentId
          ? assignment
          : {
              ...assignment,
              submissions: [
                ...assignment.submissions.filter(
                  (submission) => submission.studentId !== current.currentUser.id,
                ),
                {
                  id: crypto.randomUUID(),
                  assignmentId: submissionAssignmentId,
                  studentId: current.currentUser.id,
                  body: submissionBody.trim() || null,
                  attachment,
                  status: "submitted",
                  score: null,
                  feedback: null,
                  submittedAt: new Date().toISOString(),
                  gradedAt: null,
                  student: current.currentUser,
                },
              ],
            },
      ),
    }));
    setSubmissionBody("");
    setMessageFile(null);
    setNotice(isDemo ? "Preview submission saved locally." : "Submission saved.");
  }

  async function createHelpRequest() {
    if (!department || !helpTitle.trim() || !helpDescription.trim()) return;

    const topicTags = helpTags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);

    if (supabase && !isDemo) {
      const { error } = await supabase.from("help_requests").insert({
        department_id: department.id,
        author_id: data.currentUser.id,
        title: helpTitle.trim(),
        description: helpDescription.trim(),
        topic_tags: topicTags,
      });

      if (error) return setNotice(error.message);
    }

    const optimistic: HelpRequestSummary = {
      id: crypto.randomUUID(),
      departmentId: department.id,
      title: helpTitle.trim(),
      description: helpDescription.trim(),
      topicTags,
      status: "open",
      pointsReward: 15,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      author: data.currentUser,
      volunteer: null,
    };
    setData((current) => ({
      ...current,
      helpRequests: [optimistic, ...current.helpRequests],
    }));
    setHelpTitle("");
    setHelpDescription("");
    setHelpTags("");
    setNotice(isDemo ? "Preview help request created locally." : "Help request posted.");
  }

  async function volunteer(helpRequestId: string) {
    if (supabase && !isDemo) {
      await supabase.rpc("volunteer_for_help_request", {
        target_help_request: helpRequestId,
      });
    }

    setData((current) => ({
      ...current,
      helpRequests: current.helpRequests.map((request) =>
        request.id === helpRequestId
          ? { ...request, volunteer: current.currentUser, status: "matched" }
          : request,
      ),
    }));
  }

  async function resolve(helpRequestId: string) {
    if (supabase && !isDemo) {
      await supabase.rpc("resolve_help_request", {
        target_help_request: helpRequestId,
      });
    }

    setData((current) => ({
      ...current,
      helpRequests: current.helpRequests.map((request) =>
        request.id === helpRequestId
          ? { ...request, status: "resolved", resolvedAt: new Date().toISOString() }
          : request,
      ),
    }));
  }

  async function markAllRead() {
    if (supabase && !isDemo) {
      await supabase.rpc("mark_all_notifications_read");
    }

    setData((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    }));
  }

  const header = (() => {
    switch (view) {
      case "dashboard":
        return {
          eyebrow: "Home dashboard",
          title: "ClassLoop overview",
          subtitle: "Assignments, help matches, and school activity in one glance.",
        };
      case "spaces":
        return {
          eyebrow: "Departments",
          title: "School spaces",
          subtitle: "Every department has its own chat, board, and help exchange.",
        };
      case "assignments":
        return {
          eyebrow: "Assignments",
          title: department ? `${department.name} board` : "Assignment board",
          subtitle: canManage
            ? "Post work, manage deadlines, and track submissions."
            : "Track deadlines, submit work, and stay ahead of due dates.",
        };
      case "help":
        return {
          eyebrow: "Help exchange",
          title: department ? `${department.name} requests` : "Help requests",
          subtitle: "Match classmates with the right skills and reward the helpers.",
        };
      case "profile":
        return {
          eyebrow: "Profile",
          title: data.currentUser.fullName,
          subtitle: "Badges, contribution points, and the skills you bring to the school.",
        };
      case "notifications":
        return {
          eyebrow: "Action center",
          title: "Alerts and badges",
          subtitle: "Mentions, deadlines, new matches, and recognition all live here.",
        };
      case "chat":
      default:
        return {
          eyebrow: roomMode === "department" ? "Department space" : "Direct circle",
          title: roomName,
          subtitle:
            roomMode === "department"
              ? department?.description ?? "Realtime chat, files, and quick call links."
              : thread?.lastMessagePreview ?? "Private conversation with classmates.",
        };
    }
  })();

  return (
    <main className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] max-w-[1600px] flex-col gap-4 lg:flex-row">
        {sidebarOpen ? (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-label="Close navigation overlay"
          />
        ) : null}

        <WorkspaceSidebar
          className="hidden lg:block lg:max-w-[320px]"
          data={data}
          roomMode={roomMode}
          activeDepartmentId={department?.id ?? null}
          activeThreadId={thread?.id ?? null}
          query={query}
          setQuery={setQuery}
          filteredThreads={filteredThreads}
          onDepartmentSelect={(nextDepartmentId) => openDepartmentChat(nextDepartmentId)}
          onThreadSelect={(nextThreadId) =>
            startTransition(() => {
              setRoomMode("direct");
              setThreadId(nextThreadId);
              setView("chat");
            })
          }
        />

        <WorkspaceSidebar
          className={cn(
            "fixed inset-y-4 left-4 z-40 max-h-[calc(100svh-2rem)] w-[min(320px,calc(100vw-2rem))] overflow-y-auto shadow-[0_25px_70px_rgba(14,11,31,0.24)] transition-transform duration-300 lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-[115%]",
          )}
          data={data}
          roomMode={roomMode}
          activeDepartmentId={department?.id ?? null}
          activeThreadId={thread?.id ?? null}
          query={query}
          setQuery={setQuery}
          filteredThreads={filteredThreads}
          onDepartmentSelect={(nextDepartmentId) => {
            openDepartmentChat(nextDepartmentId);
            setSidebarOpen(false);
          }}
          onThreadSelect={(nextThreadId) =>
            startTransition(() => {
              setRoomMode("direct");
              setThreadId(nextThreadId);
              setView("chat");
              setSidebarOpen(false);
            })
          }
          onClose={() => setSidebarOpen(false)}
        />

        <section className="flex min-w-0 flex-1 flex-col gap-4 pb-24 xl:pb-0">
          <header className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/55 p-4 dark:border-white/10">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/70 lg:hidden dark:bg-white/5"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <p className="text-sm text-muted">{header.eyebrow}</p>
                <h1 className="mt-1 text-3xl">{header.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-muted">{header.subtitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full bg-white/70 px-4 py-2 text-sm text-muted dark:bg-white/5">
                {data.currentUser.points} points
              </div>
              <div className="rounded-full bg-black/6 px-4 py-2 text-sm font-semibold capitalize text-muted dark:bg-white/8">
                {data.currentUser.role}
              </div>
              {isDemo ? (
                <div className="rounded-full bg-black/6 px-4 py-2 text-sm font-semibold text-muted dark:bg-white/8">
                  Preview mode
                </div>
              ) : null}
              {view === "chat" ? (
                <a
                  href={buildCallLink(roomName)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
                >
                  <Video className="h-4 w-4" />
                  Start huddle
                </a>
              ) : (
                <button
                  type="button"
                  onClick={openLobby}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
                >
                  Open lobby
                </button>
              )}
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/70 dark:bg-white/5"
              >
                {resolvedTheme === "dark" ? (
                  <SunMedium className="h-4 w-4" />
                ) : (
                  <MoonStar className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!supabase || isDemo) {
                    window.location.assign("/");
                    return;
                  }
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/70 dark:bg-white/5"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div
            className={cn(
              "grid min-h-0 flex-1 gap-4",
              showContextPanel ? "xl:grid-cols-[minmax(0,1fr)_320px]" : "xl:grid-cols-1",
            )}
          >
            <div className="glass-panel min-h-0 rounded-[2rem] border border-white/55 p-4 dark:border-white/10">
              <nav className="mb-4 flex gap-2 overflow-x-auto">
                {primaryNav.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWorkspaceView(item.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                      view === item.id
                        ? "bg-accent text-white dark:bg-white dark:text-black"
                        : "bg-white/70 dark:bg-white/5",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>

              {notice ? (
                <div className="mb-3 rounded-[1.1rem] border border-line bg-white/80 px-4 py-3 text-sm text-muted dark:bg-white/6">
                  {notice}
                </div>
              ) : null}

              {view === "dashboard" ? (
                <WorkspaceDashboard
                  data={data}
                  onOpenLobby={openLobby}
                  onOpenSpaces={() => setWorkspaceView("spaces")}
                  onOpenDepartment={(nextDepartmentId) => openDepartmentChat(nextDepartmentId)}
                  onOpenAssignments={(nextDepartmentId) =>
                    setWorkspaceView("assignments", nextDepartmentId)
                  }
                  onOpenHelp={(nextDepartmentId) =>
                    setWorkspaceView("help", nextDepartmentId)
                  }
                  onOpenProfile={() => setWorkspaceView("profile")}
                />
              ) : null}

              {view === "spaces" ? (
                <WorkspaceSpaces
                  data={data}
                  onOpenChat={(nextDepartmentId) => openDepartmentChat(nextDepartmentId)}
                  onOpenAssignments={(nextDepartmentId) =>
                    setWorkspaceView("assignments", nextDepartmentId)
                  }
                  onOpenHelp={(nextDepartmentId) =>
                    setWorkspaceView("help", nextDepartmentId)
                  }
                />
              ) : null}

              {view === "chat" ? (
                <WorkspaceChat
                  currentUser={data.currentUser}
                  messages={messages}
                  draft={draft}
                  setDraft={(value) => {
                    setDraft(value);
                    if (roomChannel.current) {
                      void roomChannel.current.send({
                        type: "broadcast",
                        event: "typing",
                        payload: { handle: data.currentUser.handle },
                      });
                    }
                  }}
                  file={messageFile}
                  setFile={setMessageFile}
                  replyToId={replyToId}
                  setReplyToId={setReplyToId}
                  typing={typing}
                  onSend={() => void sendMessage()}
                  onToggleReaction={(messageId, emoji) =>
                    void toggleReaction(messageId, emoji)
                  }
                  onReply={setReplyToId}
                />
              ) : null}

              {view === "assignments" ? (
                <WorkspaceAssignments
                  assignments={assignments}
                  canManage={canManage}
                  currentUserId={data.currentUser.id}
                  assignmentTitle={assignmentTitle}
                  setAssignmentTitle={setAssignmentTitle}
                  assignmentInstructions={assignmentInstructions}
                  setAssignmentInstructions={setAssignmentInstructions}
                  assignmentDueAt={assignmentDueAt}
                  setAssignmentDueAt={setAssignmentDueAt}
                  onCreate={() => void createAssignment()}
                  submissionAssignmentId={submissionAssignmentId}
                  setSubmissionAssignmentId={setSubmissionAssignmentId}
                  submissionBody={submissionBody}
                  setSubmissionBody={setSubmissionBody}
                  onSubmit={() => void submitAssignment()}
                  attachSubmission={setMessageFile}
                />
              ) : null}

              {view === "help" ? (
                <WorkspaceHelpBoard
                  helpRequests={helpRequests}
                  helpTitle={helpTitle}
                  setHelpTitle={setHelpTitle}
                  helpDescription={helpDescription}
                  setHelpDescription={setHelpDescription}
                  helpTags={helpTags}
                  setHelpTags={setHelpTags}
                  suggestedSkills={suggestedSkills}
                  currentUserPoints={data.currentUser.points}
                  onCreate={() => void createHelpRequest()}
                  onVolunteer={(helpRequestId) => void volunteer(helpRequestId)}
                  onResolve={(helpRequestId) => void resolve(helpRequestId)}
                  currentUserId={data.currentUser.id}
                  canManage={canManage}
                />
              ) : null}

              {view === "profile" ? <WorkspaceProfile data={data} /> : null}

              {view === "notifications" ? (
                <WorkspaceNotifications
                  notifications={data.notifications}
                  badges={data.badges}
                  onMarkAllRead={() => void markAllRead()}
                />
              ) : null}
            </div>

            {showContextPanel ? (
              <WorkspaceContextPanel
                announcements={announcements}
                resources={resources}
                members={members}
              />
            ) : null}
          </div>

          <nav className="glass-panel fixed inset-x-4 bottom-4 z-20 grid grid-cols-5 gap-2 rounded-full border border-white/60 p-2 xl:hidden dark:border-white/10">
            {mobileNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setWorkspaceView(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-semibold",
                  view === item.id
                    ? "bg-accent text-white dark:bg-white dark:text-black"
                    : "text-muted",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </section>
      </div>
    </main>
  );
}

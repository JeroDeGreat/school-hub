import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/supabase/config";
import type {
  AnnouncementSummary,
  AssignmentSummary,
  BadgeSummary,
  DepartmentSummary,
  DirectThreadSummary,
  HelpRequestSummary,
  HomePageData,
  MemberDirectoryEntry,
  MessageSummary,
  NotificationSummary,
  ResourceSummary,
  SubmissionSummary,
  UserSummary,
} from "@/lib/types/app";
import type { MembershipRole, NotificationKind } from "@/lib/types/database";

type ProfileRow = {
  id: string;
  full_name: string | null;
  handle: string;
  email: string;
  avatar_url: string | null;
  role: "student" | "teacher" | "admin";
  headline: string | null;
  points: number;
};

type MembershipRow = {
  department_id: string;
  role: MembershipRole;
  department: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    emoji: string | null;
    color: string;
    is_lobby: boolean;
  } | null;
};

type DirectoryRow = {
  department_id: string;
  role: MembershipRole;
  user: ProfileRow | null;
};

type ThreadMembershipRow = {
  thread_id: string;
  thread: {
    id: string;
    title: string | null;
    is_group: boolean;
    created_at: string;
  } | null;
};

type ThreadParticipantRow = {
  thread_id: string;
  user: ProfileRow | null;
};

type MessageRow = {
  id: string;
  body: string;
  department_id: string | null;
  direct_thread_id: string | null;
  parent_message_id: string | null;
  kind: string;
  attachment: unknown;
  created_at: string;
  updated_at: string;
  author: ProfileRow | null;
  reactions: Array<{ emoji: string; user_id: string }> | null;
};

type AnnouncementRow = {
  id: string;
  department_id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
  author: ProfileRow | null;
};

type ResourceRow = {
  id: string;
  department_id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  attachment: unknown;
  created_at: string;
  author: ProfileRow | null;
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  student_id: string;
  body: string | null;
  attachment: unknown;
  status: SubmissionSummary["status"];
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
  student: ProfileRow | null;
};

type AssignmentRow = {
  id: string;
  department_id: string;
  title: string;
  instructions: string;
  due_at: string;
  points: number;
  status: AssignmentSummary["status"];
  attachment: unknown;
  created_at: string;
  author: ProfileRow | null;
  submissions: SubmissionRow[] | null;
};

type HelpRequestRow = {
  id: string;
  department_id: string;
  title: string;
  description: string;
  topic_tags: string[] | null;
  status: HelpRequestSummary["status"];
  points_reward: number;
  created_at: string;
  resolved_at: string | null;
  author: ProfileRow | null;
  volunteer: ProfileRow | null;
};

type NotificationRow = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  department_id: string | null;
  assignment_id: string | null;
  help_request_id: string | null;
  message_id: string | null;
  direct_thread_id: string | null;
  is_read: boolean;
  created_at: string;
};

type BadgeRow = {
  awarded_at: string;
  badge: {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
    points_threshold: number;
  };
};

function normalizeUser(user: {
  id: string;
  full_name: string | null;
  handle: string;
  email: string;
  avatar_url: string | null;
  role: "student" | "teacher" | "admin";
  headline: string | null;
  points: number;
} | null): UserSummary | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.full_name ?? user.email.split("@")[0] ?? "School member",
    handle: user.handle,
    email: user.email,
    avatarUrl: user.avatar_url,
    role: user.role,
    headline: user.headline,
    points: user.points,
  };
}

export async function getHomePageData(): Promise<HomePageData> {
  if (!hasPublicSupabaseEnv()) {
    return {
      kind: "setup",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      kind: "guest",
    };
  }

  await supabase.rpc("ensure_school_defaults");

  const profileResult = await supabase
    .from("users")
    .select("id, full_name, handle, email, avatar_url, role, headline, points")
    .eq("id", user.id)
    .single();

  const profile = normalizeUser(profileResult.data);

  if (!profile) {
    return {
      kind: "guest",
    };
  }

  const membershipsResult = await supabase
    .from("memberships")
    .select(
      "department_id, role, department:departments(id, slug, name, description, emoji, color, is_lobby)",
    )
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true });

  const memberships = (membershipsResult.data ?? []) as unknown as MembershipRow[];
  const departments: DepartmentSummary[] = memberships.map(
    (membership) => ({
      id: membership.department?.id ?? membership.department_id,
      slug: membership.department?.slug ?? "space",
      name: membership.department?.name ?? "Department",
      description: membership.department?.description ?? null,
      emoji: membership.department?.emoji ?? null,
      color: membership.department?.color ?? "#cbb5ff",
      isLobby: membership.department?.is_lobby ?? false,
      membershipRole: membership.role,
      memberCount: 0,
    }),
  );

  const departmentIds = departments.map((department) => department.id);

  const [
    directoryResult,
    threadMembershipsResult,
    announcementsResult,
    resourcesResult,
    assignmentsResult,
    helpRequestsResult,
    notificationsResult,
    badgesResult,
  ] = await Promise.all([
    departmentIds.length > 0
      ? supabase
          .from("memberships")
          .select(
            "department_id, role, user:users(id, full_name, handle, email, avatar_url, role, headline, points)",
          )
          .in("department_id", departmentIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("direct_thread_members")
      .select("thread_id, thread:direct_threads(id, title, is_group, created_at)")
      .eq("user_id", user.id),
    departmentIds.length > 0
      ? supabase
          .from("announcements")
          .select(
            "id, department_id, title, body, pinned, created_at, author:users!announcements_author_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points)",
          )
          .in("department_id", departmentIds)
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    departmentIds.length > 0
      ? supabase
          .from("department_resources")
          .select(
            "id, department_id, title, body, link_url, attachment, created_at, author:users!department_resources_author_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points)",
          )
          .in("department_id", departmentIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    departmentIds.length > 0
      ? supabase
          .from("assignments")
          .select(
            "id, department_id, title, instructions, due_at, points, status, attachment, created_at, author:users!assignments_author_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points), submissions(id, assignment_id, student_id, body, attachment, status, score, feedback, submitted_at, graded_at, student:users!submissions_student_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points))",
          )
          .in("department_id", departmentIds)
          .order("due_at", { ascending: true })
      : Promise.resolve({ data: [] }),
    departmentIds.length > 0
      ? supabase
          .from("help_requests")
          .select(
            "id, department_id, title, description, topic_tags, status, points_reward, created_at, resolved_at, author:users!help_requests_author_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points), volunteer:users!help_requests_volunteer_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points)",
          )
          .in("department_id", departmentIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    supabase
      .from("notifications")
      .select(
        "id, kind, title, body, department_id, assignment_id, help_request_id, message_id, direct_thread_id, is_read, created_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(18),
    supabase
      .from("user_badges")
      .select("awarded_at, badge:badges(id, slug, name, description, icon, points_threshold)")
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false }),
  ]);

  const directoryRows = (directoryResult.data ?? []) as unknown as DirectoryRow[];
  const directory: MemberDirectoryEntry[] = directoryRows.map(
    (entry) => ({
      departmentId: entry.department_id,
      role: entry.role,
      user: normalizeUser(entry.user)!,
    }),
  );

  const memberCounts = directory.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.departmentId] = (counts[entry.departmentId] ?? 0) + 1;
    return counts;
  }, {});

  const populatedDepartments = departments.map((department) => ({
    ...department,
    memberCount: memberCounts[department.id] ?? 1,
  }));

  const threadMemberships = (threadMembershipsResult.data ?? []) as unknown as ThreadMembershipRow[];
  const threadIds = threadMemberships.map(
    (membership) => membership.thread_id,
  );

  const [threadParticipantsResult, departmentMessagesResult, directMessagesResult] =
    await Promise.all([
      threadIds.length > 0
        ? supabase
            .from("direct_thread_members")
            .select(
              "thread_id, user:users(id, full_name, handle, email, avatar_url, role, headline, points)",
            )
            .in("thread_id", threadIds)
        : Promise.resolve({ data: [] }),
      departmentIds.length > 0
        ? supabase
            .from("messages")
            .select(
              "id, body, department_id, direct_thread_id, parent_message_id, kind, attachment, created_at, updated_at, author:users!messages_author_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points), reactions:message_reactions(emoji, user_id)",
            )
            .in("department_id", departmentIds)
            .order("created_at", { ascending: true })
            .limit(180)
        : Promise.resolve({ data: [] }),
      threadIds.length > 0
        ? supabase
            .from("messages")
            .select(
              "id, body, department_id, direct_thread_id, parent_message_id, kind, attachment, created_at, updated_at, author:users!messages_author_id_fkey(id, full_name, handle, email, avatar_url, role, headline, points), reactions:message_reactions(emoji, user_id)",
            )
            .in("direct_thread_id", threadIds)
            .order("created_at", { ascending: true })
            .limit(120)
        : Promise.resolve({ data: [] }),
    ]);

  const normalizeMessages = (rows: MessageRow[]): MessageSummary[] =>
    rows.map((message) => ({
      id: message.id,
      body: message.body,
      departmentId: message.department_id,
      directThreadId: message.direct_thread_id,
      parentMessageId: message.parent_message_id,
      kind: message.kind,
      attachment:
        typeof message.attachment === "object" && message.attachment
          ? (message.attachment as unknown as MessageSummary["attachment"])
          : null,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      author: normalizeUser(message.author),
      reactions: (message.reactions ?? []).map((reaction) => ({
        emoji: reaction.emoji,
        userId: reaction.user_id,
      })),
    }));

  const messages = [
    ...normalizeMessages((departmentMessagesResult.data ?? []) as unknown as MessageRow[]),
    ...normalizeMessages((directMessagesResult.data ?? []) as unknown as MessageRow[]),
  ];

  const threadParticipantsRows = (threadParticipantsResult.data ?? []) as unknown as ThreadParticipantRow[];
  const threadParticipants = threadParticipantsRows.reduce<
    Record<string, UserSummary[]>
  >((accumulator, row) => {
    const participant = normalizeUser(row.user);

    if (!participant) {
      return accumulator;
    }

    accumulator[row.thread_id] = [...(accumulator[row.thread_id] ?? []), participant];
    return accumulator;
  }, {});

  const directThreads: DirectThreadSummary[] = threadMemberships.map(
    (threadMembership) => {
      const threadMessages = messages.filter(
        (message) => message.directThreadId === threadMembership.thread_id,
      );

      return {
        id: threadMembership.thread_id,
        title: threadMembership.thread?.title ?? null,
        isGroup: threadMembership.thread?.is_group ?? false,
        createdAt: threadMembership.thread?.created_at ?? new Date().toISOString(),
        participants: threadParticipants[threadMembership.thread_id] ?? [],
        lastMessagePreview:
          threadMessages.at(-1)?.body ?? threadMessages.at(-1)?.attachment?.filename ?? null,
      };
    },
  );

  const announcementsRows = (announcementsResult.data ?? []) as unknown as AnnouncementRow[];
  const announcements: AnnouncementSummary[] = announcementsRows.map(
    (announcement) => ({
      id: announcement.id,
      departmentId: announcement.department_id,
      title: announcement.title,
      body: announcement.body,
      pinned: announcement.pinned,
      createdAt: announcement.created_at,
      author: normalizeUser(announcement.author),
    }),
  );

  const resourceRows = (resourcesResult.data ?? []) as unknown as ResourceRow[];
  const resources: ResourceSummary[] = resourceRows.map((resource) => ({
    id: resource.id,
    departmentId: resource.department_id,
    title: resource.title,
    body: resource.body,
    linkUrl: resource.link_url,
    createdAt: resource.created_at,
    attachment:
      typeof resource.attachment === "object" && resource.attachment
        ? (resource.attachment as unknown as ResourceSummary["attachment"])
        : null,
    author: normalizeUser(resource.author),
  }));

  const assignmentRows = (assignmentsResult.data ?? []) as unknown as AssignmentRow[];
  const assignments: AssignmentSummary[] = assignmentRows.map((assignment) => ({
    id: assignment.id,
    departmentId: assignment.department_id,
    title: assignment.title,
    instructions: assignment.instructions,
    dueAt: assignment.due_at,
    points: assignment.points,
    status: assignment.status,
    attachment:
      typeof assignment.attachment === "object" && assignment.attachment
        ? (assignment.attachment as unknown as AssignmentSummary["attachment"])
        : null,
    createdAt: assignment.created_at,
    author: normalizeUser(assignment.author),
    submissions: (assignment.submissions ?? []).map(
      (submission): SubmissionSummary => ({
        id: submission.id,
        assignmentId: submission.assignment_id,
        studentId: submission.student_id,
        body: submission.body,
        attachment:
          typeof submission.attachment === "object" && submission.attachment
            ? (submission.attachment as unknown as SubmissionSummary["attachment"])
            : null,
        status: submission.status,
        score: submission.score,
        feedback: submission.feedback,
        submittedAt: submission.submitted_at,
        gradedAt: submission.graded_at,
        student: normalizeUser(submission.student),
      }),
    ),
  }));

  const helpRequestRows = (helpRequestsResult.data ?? []) as unknown as HelpRequestRow[];
  const helpRequests: HelpRequestSummary[] = helpRequestRows.map(
    (helpRequest) => ({
      id: helpRequest.id,
      departmentId: helpRequest.department_id,
      title: helpRequest.title,
      description: helpRequest.description,
      topicTags: helpRequest.topic_tags ?? [],
      status: helpRequest.status,
      pointsReward: helpRequest.points_reward,
      createdAt: helpRequest.created_at,
      resolvedAt: helpRequest.resolved_at,
      author: normalizeUser(helpRequest.author),
      volunteer: normalizeUser(helpRequest.volunteer),
    }),
  );

  const notificationRows = (notificationsResult.data ?? []) as unknown as NotificationRow[];
  const notifications: NotificationSummary[] = notificationRows.map(
    (notification) => ({
      id: notification.id,
      kind: notification.kind,
      title: notification.title,
      body: notification.body,
      departmentId: notification.department_id,
      assignmentId: notification.assignment_id,
      helpRequestId: notification.help_request_id,
      messageId: notification.message_id,
      directThreadId: notification.direct_thread_id,
      isRead: notification.is_read,
      createdAt: notification.created_at,
    }),
  );

  const badgeRows = (badgesResult.data ?? []) as unknown as BadgeRow[];
  const badges: BadgeSummary[] = badgeRows.map((entry) => ({
    id: entry.badge.id,
    slug: entry.badge.slug,
    name: entry.badge.name,
    description: entry.badge.description,
    icon: entry.badge.icon,
    pointsThreshold: entry.badge.points_threshold,
    awardedAt: entry.awarded_at,
  }));

  return {
    kind: "workspace",
    currentUser: profile,
    departments: populatedDepartments,
    directThreads,
    announcements,
    resources,
    messages,
    assignments,
    helpRequests,
    badges,
    notifications,
    directory,
  };
}

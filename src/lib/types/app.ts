import type {
  AppRole,
  AssignmentStatus,
  HelpRequestStatus,
  MembershipRole,
  NotificationKind,
  SubmissionStatus,
} from "@/lib/types/database";

export interface AttachmentPayload {
  bucket: string;
  path: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface UserSummary {
  id: string;
  fullName: string;
  handle: string;
  email: string | null;
  avatarUrl: string | null;
  role: AppRole;
  headline: string | null;
  points: number;
}

export interface DepartmentSummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  emoji: string | null;
  color: string;
  isLobby: boolean;
  membershipRole: MembershipRole;
  memberCount: number;
}

export interface AnnouncementSummary {
  id: string;
  departmentId: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  author: UserSummary | null;
}

export interface ResourceSummary {
  id: string;
  departmentId: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdAt: string;
  attachment: AttachmentPayload | null;
  author: UserSummary | null;
}

export interface MessageReactionSummary {
  emoji: string;
  userId: string;
}

export interface MessageSummary {
  id: string;
  body: string;
  departmentId: string | null;
  directThreadId: string | null;
  parentMessageId: string | null;
  kind: string;
  createdAt: string;
  updatedAt: string;
  attachment: AttachmentPayload | null;
  author: UserSummary | null;
  reactions: MessageReactionSummary[];
}

export interface DirectThreadSummary {
  id: string;
  title: string | null;
  isGroup: boolean;
  createdAt: string;
  participants: UserSummary[];
  lastMessagePreview: string | null;
}

export interface SubmissionSummary {
  id: string;
  assignmentId: string;
  studentId: string;
  body: string | null;
  attachment: AttachmentPayload | null;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  submittedAt: string;
  gradedAt: string | null;
  student: UserSummary | null;
}

export interface AssignmentSummary {
  id: string;
  departmentId: string;
  title: string;
  instructions: string;
  dueAt: string;
  points: number;
  status: AssignmentStatus;
  attachment: AttachmentPayload | null;
  createdAt: string;
  author: UserSummary | null;
  submissions: SubmissionSummary[];
}

export interface HelpRequestSummary {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  topicTags: string[];
  status: HelpRequestStatus;
  pointsReward: number;
  createdAt: string;
  resolvedAt: string | null;
  author: UserSummary | null;
  volunteer: UserSummary | null;
}

export interface BadgeSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  pointsThreshold: number;
  awardedAt: string;
}

export interface NotificationSummary {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  departmentId: string | null;
  assignmentId: string | null;
  helpRequestId: string | null;
  messageId: string | null;
  directThreadId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface MemberDirectoryEntry {
  departmentId: string;
  role: MembershipRole;
  user: UserSummary;
}

export interface WorkspaceData {
  kind: "workspace";
  currentUser: UserSummary;
  departments: DepartmentSummary[];
  directThreads: DirectThreadSummary[];
  announcements: AnnouncementSummary[];
  resources: ResourceSummary[];
  messages: MessageSummary[];
  assignments: AssignmentSummary[];
  helpRequests: HelpRequestSummary[];
  badges: BadgeSummary[];
  notifications: NotificationSummary[];
  directory: MemberDirectoryEntry[];
}

export type HomePageData =
  | {
      kind: "setup";
    }
  | {
      kind: "guest";
    }
  | {
      kind: "schema";
    }
  | WorkspaceData;

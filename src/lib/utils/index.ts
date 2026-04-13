import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict, formatRelative } from "date-fns";
import { twMerge } from "tailwind-merge";
import type {
  AttachmentPayload,
  DepartmentSummary,
  UserSummary,
} from "@/lib/types/app";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(value: string) {
  return formatDistanceToNowStrict(new Date(value), {
    addSuffix: true,
  });
}

export function formatActivityDate(value: string) {
  return formatRelative(new Date(value), new Date());
}

export function initialsFor(name: string) {
  const parts = name.split(" ").filter(Boolean);

  if (parts.length === 0) {
    return "CL";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function isPrivileged(user: UserSummary | null) {
  return user?.role === "teacher" || user?.role === "admin";
}

export function canManageDepartment(
  department: DepartmentSummary | undefined,
  user: UserSummary,
) {
  if (!department) {
    return false;
  }

  return (
    user.role === "admin" ||
    department.membershipRole === "teacher" ||
    department.membershipRole === "admin"
  );
}

export function buildCallLink(roomName: string) {
  const slug = roomName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `https://meet.jit.si/classloop-${slug}`;
}

export function attachmentLabel(attachment: AttachmentPayload | null) {
  if (!attachment) {
    return null;
  }

  const sizeInMb = attachment.size / (1024 * 1024);

  return `${attachment.filename} - ${sizeInMb.toFixed(sizeInMb > 10 ? 0 : 1)} MB`;
}

export function estimateTimeCredits(points: number) {
  return Math.max(0, Math.floor(points / 12));
}

export function departmentSkillTags(slug: string) {
  if (slug.includes("science")) {
    return ["research", "lab", "analysis", "notes"];
  }

  if (slug.includes("ict") || slug.includes("code") || slug.includes("tech")) {
    return ["coding", "debugging", "slides", "setup"];
  }

  if (slug.includes("math")) {
    return ["algebra", "revision", "proofs", "practice"];
  }

  if (slug.includes("engineering")) {
    return ["cad", "mechanics", "build", "systems"];
  }

  if (slug.includes("art") || slug.includes("creative") || slug.includes("design")) {
    return ["design", "feedback", "portfolio", "storytelling"];
  }

  if (slug.includes("lobby")) {
    return ["community", "coordination", "events", "support"];
  }

  return ["study", "support", "notes", "teamwork"];
}

export function deriveSkillTags(
  user: UserSummary,
  departments: DepartmentSummary[],
) {
  const fromDepartments = departments.flatMap((department) =>
    departmentSkillTags(department.slug),
  );

  const roleSkills =
    user.role === "teacher"
      ? ["mentoring", "feedback", "moderation"]
      : user.role === "admin"
        ? ["moderation", "planning", "support"]
        : ["revision", "peer-help", "notes"];

  return [...new Set([...roleSkills, ...fromDepartments])].slice(0, 8);
}

export function helpMatchScore(topicTags: string[], skillTags: string[]) {
  if (topicTags.length === 0 || skillTags.length === 0) {
    return 0;
  }

  const skillSet = new Set(skillTags.map((skill) => skill.toLowerCase()));

  return topicTags.reduce((score, tag) => {
    return score + (skillSet.has(tag.toLowerCase()) ? 1 : 0);
  }, 0);
}

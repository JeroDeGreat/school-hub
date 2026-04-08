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
    return "SH";
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

  return `https://meet.jit.si/school-hub-${slug}`;
}

export function attachmentLabel(attachment: AttachmentPayload | null) {
  if (!attachment) {
    return null;
  }

  const sizeInMb = attachment.size / (1024 * 1024);

  return `${attachment.filename} - ${sizeInMb.toFixed(sizeInMb > 10 ? 0 : 1)} MB`;
}

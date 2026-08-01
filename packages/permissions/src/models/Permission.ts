export const PERMISSIONS = [
  "platform.owner",
  "platform.admin",
  "moderation.warn",
  "moderation.kick",
  "moderation.ban",
  "tickets.manage",
  "applications.review",
  "staff.manage",
  "knowledge.manage"
] as const;

export type Permission = typeof PERMISSIONS[number];

export interface PermissionSubject {
  readonly userId: string;
  readonly roleIds: readonly string[];
}

export interface PermissionGrant {
  readonly roleId: string;
  readonly permissions: readonly Permission[];
}

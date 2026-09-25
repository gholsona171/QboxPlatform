import { DISCORD_PERMISSION } from "@qbox/shared/discord-rest";

import type { BuilderBlueprint, BuilderCategory, BuilderChannel, BuilderAccess, BuilderOverwrite, BuilderPermission } from "./types.js";
import { BOT, EVERYONE } from "./types.js";

/** Discord bit for each builder permission name. */
export const PERMISSION_BITS: Readonly<Record<BuilderPermission, bigint>> = {
  Administrator: DISCORD_PERMISSION.administrator,
  ViewChannel: DISCORD_PERMISSION.viewChannel,
  SendMessages: DISCORD_PERMISSION.sendMessages,
  SendMessagesInThreads: DISCORD_PERMISSION.sendMessagesInThreads,
  CreatePublicThreads: DISCORD_PERMISSION.createPublicThreads,
  CreatePrivateThreads: DISCORD_PERMISSION.createPrivateThreads,
  EmbedLinks: DISCORD_PERMISSION.embedLinks,
  AttachFiles: DISCORD_PERMISSION.attachFiles,
  AddReactions: DISCORD_PERMISSION.addReactions,
  UseExternalEmojis: DISCORD_PERMISSION.useExternalEmojis,
  MentionEveryone: DISCORD_PERMISSION.mentionEveryone,
  ManageMessages: DISCORD_PERMISSION.manageMessages,
  ManageThreads: DISCORD_PERMISSION.manageThreads,
  ReadMessageHistory: DISCORD_PERMISSION.readMessageHistory,
  UseApplicationCommands: DISCORD_PERMISSION.useApplicationCommands,
  SendVoiceMessages: DISCORD_PERMISSION.sendVoiceMessages,
  Connect: DISCORD_PERMISSION.connect,
  Speak: DISCORD_PERMISSION.speak,
  Stream: DISCORD_PERMISSION.stream,
  UseVAD: DISCORD_PERMISSION.useVoiceActivity,
  PrioritySpeaker: DISCORD_PERMISSION.prioritySpeaker,
  RequestToSpeak: DISCORD_PERMISSION.requestToSpeak,
  MuteMembers: DISCORD_PERMISSION.muteMembers,
  DeafenMembers: DISCORD_PERMISSION.deafenMembers,
  MoveMembers: DISCORD_PERMISSION.moveMembers,
  ManageChannels: DISCORD_PERMISSION.manageChannels,
  ManageRoles: DISCORD_PERMISSION.manageRoles,
  ManageWebhooks: DISCORD_PERMISSION.manageWebhooks,
  ManageGuild: DISCORD_PERMISSION.manageGuild,
  ManageEvents: DISCORD_PERMISSION.manageEvents,
  ManageNicknames: DISCORD_PERMISSION.manageNicknames,
  ChangeNickname: DISCORD_PERMISSION.changeNickname,
  KickMembers: DISCORD_PERMISSION.kickMembers,
  BanMembers: DISCORD_PERMISSION.banMembers,
  ModerateMembers: DISCORD_PERMISSION.moderateMembers,
  ViewAuditLog: DISCORD_PERMISSION.viewAuditLog,
  CreateInstantInvite: DISCORD_PERMISSION.createInstantInvite,
};

/** Bitfield string Discord expects for a list of permission names. */
export function permissionBits(names: readonly BuilderPermission[]): string {
  return String(names.reduce((bits, name) => bits | PERMISSION_BITS[name], 0n));
}

const POST: readonly BuilderPermission[] = ["SendMessages", "SendMessagesInThreads", "CreatePublicThreads", "CreatePrivateThreads"];
const CHAT: readonly BuilderPermission[] = ["ViewChannel", "SendMessages", "ReadMessageHistory", "Connect", "Speak"];
const BOT_WRITE: readonly BuilderPermission[] = ["ViewChannel", "SendMessages", "EmbedLinks", "AttachFiles", "ReadMessageHistory"];

/**
 * Named overwrite presets so the generator stays readable. Each returns
 * overwrites added on top of the category's.
 */
export const PRESETS = {
  /** Anyone who can see the category can read and post. */
  PUBLIC: (): readonly BuilderOverwrite[] => [],
  /** Everyone reads; only staff (and Qbox) post. For rules and announcements. */
  READ_ONLY: (staffKeys: readonly string[]): readonly BuilderOverwrite[] => [
    { target: EVERYONE, allow: [], deny: [...POST] },
    ...staffKeys.map((key) => ({ target: key, allow: ["SendMessages" as const], deny: [] })),
    { target: BOT, allow: [...BOT_WRITE], deny: [] },
  ],
  /**
   * Photos only. As a MEDIA channel Discord enforces it; as a TEXT channel
   * members can still type, so attachments and links are allowed and a
   * slowmode keeps it tidy.
   */
  MEDIA_ONLY: (asMediaChannel: boolean): readonly BuilderOverwrite[] =>
    asMediaChannel ? [] : [{ target: EVERYONE, allow: ["AttachFiles", "EmbedLinks"], deny: ["CreatePublicThreads", "CreatePrivateThreads"] }],
  /** Hidden from everyone except staff. */
  STAFF_ONLY: (staffKeys: readonly string[]): readonly BuilderOverwrite[] => [
    { target: EVERYONE, allow: [], deny: ["ViewChannel"] },
    ...staffKeys.map((key) => ({ target: key, allow: [...CHAT], deny: [] })),
    { target: BOT, allow: [...BOT_WRITE], deny: [] },
  ],
  /** Hidden from everyone except one department role. */
  DEPARTMENT_ONLY: (roleKey: string): readonly BuilderOverwrite[] => [
    { target: EVERYONE, allow: [], deny: ["ViewChannel"] },
    { target: roleKey, allow: [...CHAT], deny: [] },
    { target: BOT, allow: [...BOT_WRITE], deny: [] },
  ],
  /** Hidden from @everyone until they have the Verified role. */
  VERIFIED_ONLY: (verifiedKey: string): readonly BuilderOverwrite[] => [
    { target: EVERYONE, allow: [], deny: ["ViewChannel"] },
    { target: verifiedKey, allow: ["ViewChannel"], deny: [] },
  ],
  /** Staff can read, nobody posts except Qbox. */
  HIDDEN_LOG: (staffKeys: readonly string[]): readonly BuilderOverwrite[] => [
    { target: EVERYONE, allow: [], deny: ["ViewChannel", ...POST] },
    ...staffKeys.map((key) => ({ target: key, allow: ["ViewChannel" as const, "ReadMessageHistory" as const], deny: ["SendMessages" as const] })),
    { target: BOT, allow: [...BOT_WRITE], deny: [] },
  ],
} as const;

/**
 * Combines overwrites per target. Later lists win: a permission allowed later
 * is removed from the earlier deny list, and the other way around.
 */
export function mergeOverwrites(...lists: readonly (readonly BuilderOverwrite[])[]): readonly BuilderOverwrite[] {
  const merged = new Map<string, { allow: Set<BuilderPermission>; deny: Set<BuilderPermission> }>();
  for (const list of lists)
    for (const overwrite of list) {
      const entry = merged.get(overwrite.target) ?? { allow: new Set<BuilderPermission>(), deny: new Set<BuilderPermission>() };
      for (const name of overwrite.allow) {
        entry.deny.delete(name);
        entry.allow.add(name);
      }
      for (const name of overwrite.deny) {
        entry.allow.delete(name);
        entry.deny.add(name);
      }
      merged.set(overwrite.target, entry);
    }
  return [...merged].map(([target, entry]) => ({ target, allow: [...entry.allow], deny: [...entry.deny] }));
}

/** The overwrites a channel is created with: its category's plus its own. */
export function effectiveOverwrites(category: BuilderCategory, channel: BuilderChannel): readonly BuilderOverwrite[] {
  return mergeOverwrites(category.overwrites, channel.overwrites);
}

const VOICE_TYPES = new Set(["VOICE", "STAGE"]);

/** Plain "who can see / who can post" text for every channel, keyed by channel key. */
export function describeAccess(blueprint: BuilderBlueprint): Readonly<Record<string, BuilderAccess>> {
  const names = new Map(blueprint.roles.map((role) => [role.key, role.name]));
  const staff = blueprint.roles.filter((role) => role.purpose === "staff").map((role) => role.key);
  const label = (keys: readonly string[]) => {
    const shown = keys.filter((key) => key !== BOT);
    const allStaff = staff.length > 1 && staff.every((key) => shown.includes(key));
    const rest = allStaff ? shown.filter((key) => !staff.includes(key)) : shown;
    const parts = [...(allStaff ? ["staff"] : []), ...rest.map((key) => (key === EVERYONE ? "everyone" : names.get(key) ?? key))];
    return parts.join(", ") || "admins only";
  };
  const result: Record<string, BuilderAccess> = {};
  for (const category of blueprint.categories)
    for (const channel of category.channels) {
      const overwrites = effectiveOverwrites(category, channel);
      const everyone = overwrites.find((overwrite) => overwrite.target === EVERYONE);
      const roles = overwrites.filter((overwrite) => overwrite.target !== EVERYONE && overwrite.target !== BOT);
      const hidden = everyone?.deny.includes("ViewChannel") ?? false;
      const viewers = hidden ? roles.filter((overwrite) => overwrite.allow.includes("ViewChannel")).map((overwrite) => overwrite.target) : [EVERYONE];
      const blockedViewers = roles.filter((overwrite) => overwrite.deny.includes("ViewChannel")).map((overwrite) => overwrite.target);
      const postPermission: BuilderPermission = VOICE_TYPES.has(channel.type) ? "Connect" : "SendMessages";
      const postBlocked = everyone?.deny.includes(postPermission) ?? false;
      const posters = postBlocked
        ? roles.filter((overwrite) => overwrite.allow.includes(postPermission)).map((overwrite) => overwrite.target)
        : viewers;
      const see = `${label(viewers)}${blockedViewers.length ? ` (not ${label(blockedViewers)})` : ""}`;
      const post = postBlocked && posters.length === 0 ? (overwrites.some((overwrite) => overwrite.target === BOT) ? "Qbox only" : "admins only") : label(posters);
      result[channel.key] = { see, post: VOICE_TYPES.has(channel.type) ? `join: ${post}` : post };
    }
  return result;
}

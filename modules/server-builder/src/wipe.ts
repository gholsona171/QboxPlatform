import { PERMISSION_BITS } from "./permissions.js";
import type {
  BuilderBlueprint,
  BuilderCategory,
  BuilderChannel,
  BuilderChannelType,
  BuilderOverwrite,
  BuilderPermission,
  BuilderRole,
  WipeLayoutChannel,
  WipeLayoutOverwrite,
  WipeLayoutRole,
  WipeSnapshot,
} from "./types.js";
import { BOT, DISCORD_CHANNEL_TYPE, EVERYONE } from "./types.js";
import { keyOf } from "./validation.js";

/** Discord channel type number to the builder's channel type. Threads and other types have no entry. */
const CHANNEL_TYPE_BY_NUMBER: ReadonlyMap<number, BuilderChannelType> = new Map(
  (Object.entries(DISCORD_CHANNEL_TYPE) as [BuilderChannelType | "CATEGORY", number][])
    .filter(([name]) => name !== "CATEGORY")
    .map(([name, value]) => [value, name as BuilderChannelType]),
);

/** Every Discord permission bit the builder understands, for turning a bitfield back into names. */
const BIT_TO_NAME: readonly (readonly [bigint, BuilderPermission])[] = Object.entries(PERMISSION_BITS).map(
  ([name, bit]) => [bit, name as BuilderPermission] as const,
);

/** Discord's integer color to a `#RRGGBB` hex string. */
export function colorHex(color: number): string {
  const clamped = Number.isFinite(color) && color > 0 ? Math.min(0xffffff, Math.floor(color)) : 0;
  return `#${clamped.toString(16).padStart(6, "0").toUpperCase()}`;
}

/** Permission names for a Discord bitfield string. `dropped` is true when bits the builder does not manage were present. */
export function permissionNames(bits: string): { readonly names: BuilderPermission[]; readonly dropped: boolean } {
  let value: bigint;
  try {
    value = BigInt(bits);
  } catch {
    return { names: [], dropped: false };
  }
  const names: BuilderPermission[] = [];
  let known = 0n;
  for (const [bit, name] of BIT_TO_NAME)
    if ((value & bit) !== 0n) {
      names.push(name);
      known |= bit;
    }
  return { names, dropped: (value & ~known) !== 0n };
}

interface Conversion {
  readonly blueprint: BuilderBlueprint;
  readonly notes: readonly string[];
}

/**
 * Turns a wipe snapshot back into a blueprint so the old layout can be rebuilt.
 * Managed roles and @everyone are left out, member permission overrides are
 * dropped, and permission bits and channel types the builder cannot rebuild are
 * dropped with a note. Messages are never part of a snapshot.
 */
export function snapshotToBlueprint(snapshot: WipeSnapshot): Conversion {
  const notes: string[] = [];
  const usedKeys = new Set<string>();
  const unique = (base: string): string => {
    const clean = keyOf(base);
    let key = clean;
    for (let index = 2; usedKeys.has(key); index += 1) key = `${clean}-${index}`;
    usedKeys.add(key);
    return key;
  };

  /* Roles, highest first. @everyone and managed roles cannot be rebuilt. */
  const everyoneId = snapshot.roles.find((role) => role.name === "@everyone")?.id;
  const rebuildable = snapshot.roles
    .filter((role) => role.name !== "@everyone" && role.name !== "@here" && !role.managed)
    .slice()
    .sort((a, b) => b.position - a.position);
  const roleKeyById = new Map<string, string>();
  let droppedBits = false;
  const roles: BuilderRole[] = rebuildable.map((role) => {
    const key = unique(`role-${role.name}`);
    roleKeyById.set(role.id, key);
    const { names, dropped } = permissionNames(role.permissions);
    if (dropped) droppedBits = true;
    return {
      key,
      name: role.name.slice(0, 100),
      color: colorHex(role.color),
      hoist: role.hoist,
      mentionable: role.mentionable,
      permissions: names,
    };
  });

  let droppedMembers = 0;
  const mapOverwrites = (overwrites: readonly WipeLayoutOverwrite[]): BuilderOverwrite[] =>
    overwrites.flatMap((overwrite): BuilderOverwrite[] => {
      const allow = permissionNames(overwrite.allow);
      const deny = permissionNames(overwrite.deny);
      if (allow.dropped || deny.dropped) droppedBits = true;
      const target =
        overwrite.type === 1
          ? overwrite.id === snapshot.botUserId
            ? BOT
            : undefined
          : everyoneId && overwrite.id === everyoneId
            ? EVERYONE
            : roleKeyById.get(overwrite.id);
      if (target === undefined) {
        if (overwrite.type === 1) droppedMembers += 1;
        return [];
      }
      if (allow.names.length === 0 && deny.names.length === 0) return [];
      return [{ target, allow: allow.names, deny: deny.names }];
    });

  const toChannel = (channel: WipeLayoutChannel): BuilderChannel | undefined => {
    const type = CHANNEL_TYPE_BY_NUMBER.get(channel.type);
    if (!type) return undefined;
    return {
      key: unique(channel.name || type.toLowerCase()),
      name: channel.name.slice(0, 100),
      type,
      slowmodeSeconds: Math.max(0, channel.slowmodeSeconds),
      nsfw: channel.nsfw,
      userLimit: Math.max(0, channel.userLimit),
      overwrites: mapOverwrites(channel.overwrites),
      ...(channel.topic ? { topic: channel.topic.slice(0, 1024) } : {}),
    };
  };

  const categories = snapshot.channels.filter((channel) => channel.type === DISCORD_CHANNEL_TYPE.CATEGORY).slice().sort((a, b) => a.position - b.position);
  const nonCategory = snapshot.channels.filter((channel) => channel.type !== DISCORD_CHANNEL_TYPE.CATEGORY);
  const categoryIds = new Set(categories.map((category) => category.id));
  let droppedChannels = 0;
  const childrenOf = (parentId: string | undefined): BuilderChannel[] =>
    nonCategory
      .filter((channel) => channel.parentId === parentId)
      .slice()
      .sort((a, b) => a.position - b.position)
      .flatMap((channel) => {
        const converted = toChannel(channel);
        if (!converted) droppedChannels += 1;
        return converted ? [converted] : [];
      });

  const result: BuilderCategory[] = categories.map((category) => ({
    key: unique(`cat-${category.name}`),
    name: category.name.slice(0, 100) || "Category",
    overwrites: mapOverwrites(category.overwrites),
    channels: childrenOf(category.id),
  }));

  /* Channels with no category (or one that is gone) go in a plain "Uncategorized" category so nothing is lost. */
  const orphans = nonCategory.filter((channel) => channel.parentId === undefined || !categoryIds.has(channel.parentId));
  if (orphans.length > 0) {
    const channels = orphans
      .slice()
      .sort((a, b) => a.position - b.position)
      .flatMap((channel) => {
        const converted = toChannel(channel);
        if (!converted) droppedChannels += 1;
        return converted ? [converted] : [];
      });
    if (channels.length > 0) result.push({ key: unique("uncategorized"), name: "Uncategorized", overwrites: [], channels });
  }

  if (droppedMembers > 0) notes.push(`${droppedMembers} permission override${droppedMembers === 1 ? "" : "s"} for specific members ${droppedMembers === 1 ? "was" : "were"} dropped (the blueprint only sets role permissions).`);
  if (droppedBits) notes.push("Some permissions the builder does not manage were dropped from the rebuilt layout.");
  if (droppedChannels > 0) notes.push(`${droppedChannels} channel${droppedChannels === 1 ? "" : "s"} of a type the builder cannot rebuild ${droppedChannels === 1 ? "was" : "were"} left out.`);

  return { blueprint: { roles, categories: result }, notes };
}

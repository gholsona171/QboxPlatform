import { describe, expect, it } from "vitest";

import {
  DiscordCommunityService,
  type AutoroleConfig,
  type AutoroleRule,
  type AutoroleRuleInput,
  type ChannelRenameInput,
  type CommunityRepository,
  type CommunityRoleMutation,
  type CommunityRoleMutationResult,
  type CommunityRoleQuery,
  type CommunityRoleValidation,
  type CommunitySendMessage,
  type CommunitySentMessage,
  type CommunitySettings,
  type CounterConfig,
  type CounterCountInput,
  type CounterInput,
  type CustomCommand,
  type CustomCommandInput,
  type DiscordCommunityGateway,
  type EmbedTemplate,
  type EmbedTemplateInput,
  type RulesConfig,
  type ServerLogConfig,
  type StarboardConfig,
  type StarboardEntry,
  type StarboardEntryInput,
  type Suggestion,
  type SuggestionInput,
  type SuggestionUpdate,
  type WelcomeGoodbyeConfig,
} from "../src/index.js";

const guildId = "1257928923048837201";
const otherGuildId = "1257928923048837202";
const channelId = "1262656532902842423";
const roleId = "1262656532902842424";
const secondRoleId = "1262656532902842425";
const memberId = "804859666655739996";

describe("DiscordCommunityService", () => {
  it("delivers server logs only for enabled, non-ignored events", async () => {
    const gateway = new FakeGateway();
    const service = new DiscordCommunityService(new InMemoryCommunityRepository(), gateway);
    await service.saveLogs({ guildId, enabled: true, events: ["memberJoin", "messageDelete"], destinations: { all: channelId }, ignoredChannels: [secondRoleId], ignoredRoles: [roleId], ignoredUsers: [], includeBots: false, contentMode: "REDACTED", colors: {} });
    await service.deliverLog({ guildId, event: "memberJoin", title: "Member joined", description: "hi", userId: memberId });
    await service.deliverLog({ guildId, event: "voice", title: "Voice", description: "not enabled" });
    await service.deliverLog({ guildId, event: "memberJoin", title: "Bot joined", description: "bot", isBot: true });
    await service.deliverLog({ guildId, event: "messageDelete", title: "Deleted", description: "ignored channel", channelId: secondRoleId });
    await service.deliverLog({ guildId, event: "messageDelete", title: "Deleted", description: "ignored role", roleIds: [roleId] });
    expect(gateway.sent.map((message) => message.embed?.title)).toEqual(["Member joined"]);
    expect(gateway.sent[0]).toMatchObject({ channelId, embed: { color: 0x57f287 } });
  });

  it("renders welcome placeholders and skips disabled delivery", async () => {
    const gateway = new FakeGateway();
    const service = new DiscordCommunityService(new InMemoryCommunityRepository(), gateway);
    const config = await service.saveWelcomeGoodbye(welcome({ enabled: false, messageText: "Hi {user} in {server} at {memberCount}" }));

    expect(service.renderWelcomeGoodbye(config, placeholder()).content).toBe("Hi <@804859666655739996> in Qbox at 12");
    await expect(service.deliverWelcomeGoodbye("WELCOME", guildId, placeholder())).resolves.toBeUndefined();
    expect(gateway.sent).toHaveLength(0);
  });

  it("delivers welcome messages and reports invalid channel failures", async () => {
    const gateway = new FakeGateway();
    const service = new DiscordCommunityService(new InMemoryCommunityRepository(), gateway);
    await service.saveWelcomeGoodbye(welcome({ enabled: true }));

    await expect(service.deliverWelcomeGoodbye("WELCOME", guildId, placeholder())).resolves.toMatchObject({ channelId });
    gateway.failSend = true;
    await expect(service.deliverWelcomeGoodbye("WELCOME", guildId, placeholder())).rejects.toThrowError("invalid-channel");
  });

  it("applies autoroles in deterministic order while excluding bots and invalid roles", async () => {
    const gateway = new FakeGateway();
    const service = new DiscordCommunityService(new InMemoryCommunityRepository(), gateway);
    await service.saveAutoroles({ guildId, enabled: true, includeBots: false, delaySeconds: 0, roles: [] });
    await service.addAutorole({ guildId, roleId: secondRoleId, position: 2 });
    await service.addAutorole({ guildId, roleId, position: 1 });

    await expect(service.applyAutoroles(guildId, memberId, true)).resolves.toEqual([]);
    await expect(service.applyAutoroles(guildId, memberId, false)).resolves.toMatchObject([{ changed: true }, { changed: true }]);
    expect(gateway.assigned.map((item) => item.roleId)).toEqual([roleId, secondRoleId]);

    gateway.invalidRoles.add(secondRoleId);
    await expect(service.applyAutoroles(guildId, memberId, false)).resolves.toContainEqual({ changed: false, message: "managed role" });
  });

  it("handles rules acceptance, pending-role removal, and repeated clicks after restart", async () => {
    const repository = new InMemoryCommunityRepository();
    const gateway = new FakeGateway();
    const firstRuntime = new DiscordCommunityService(repository, gateway);
    await firstRuntime.saveRules({ guildId, enabled: true, channelId, messageText: "Rules", buttonLabel: "Accept", acceptedRoleId: roleId, pendingRoleId: secondRoleId });

    await expect(firstRuntime.acceptRules(guildId, memberId)).resolves.toMatchObject([{ changed: true }, { changed: true }]);
    gateway.hasRole = true;
    const restartedRuntime = new DiscordCommunityService(repository, gateway);
    await expect(restartedRuntime.acceptRules(guildId, memberId)).resolves.toMatchObject([{ changed: false }, { changed: true }]);
  });

  it("calculates and refreshes member counters without leaking guild settings", async () => {
    const gateway = new FakeGateway();
    const repository = new InMemoryCommunityRepository();
    const service = new DiscordCommunityService(repository, gateway);
    const counter = await service.saveCounter({ guildId, enabled: true, channelId, labelTemplate: "Members: {count}", type: "TOTAL_MEMBERS", intervalSeconds: 60 });
    await service.saveCounter({ guildId: otherGuildId, enabled: true, channelId, labelTemplate: "Other: {count}", type: "TOTAL_MEMBERS", intervalSeconds: 60 });

    await expect(service.refreshCounter(counter)).resolves.toBe(42);
    expect(gateway.renamed[0]).toMatchObject({ guildId, name: "Members: 42" });
    expect((await service.settings(otherGuildId)).counters[0].guildId).toBe(otherGuildId);
  });

  it("persists logs, templates, custom commands, suggestions, and starboard rules", async () => {
    const service = new DiscordCommunityService(new InMemoryCommunityRepository(), new FakeGateway());
    await service.saveLogs({ guildId, enabled: true, events: ["member.joined"], destinations: { members: channelId }, ignoredChannels: [], ignoredRoles: [], ignoredUsers: [], includeBots: false, contentMode: "REDACTED", colors: { members: "#00ff00" } });
    const template = await service.saveEmbedTemplate({ guildId, name: "notice", title: "Notice", description: "Body", timestamp: true, fields: [{ name: "One", value: "Two", inline: false }], allowedRoleMentions: [roleId] });
    expect(service.renderEmbed(template).embed?.fields).toHaveLength(1);

    const command = await service.saveCustomCommand({ guildId, name: "hello", description: "Hello", responseText: "Hi", enabled: true, allowedChannels: [channelId], deniedChannels: [], requiredRoles: [roleId], cooldownSeconds: 5, triggerMode: "CONTAINS", triggerPhrase: "hello", deleteTriggeringMessage: false });
    expect(service.matchCustomCommand([command], "well hello", channelId, [roleId])?.name).toBe("hello");
    expect(service.matchCustomCommand([command], "well hello", "1262656532902842426", [roleId])).toBeUndefined();

    const suggestion = await service.createSuggestion({ guildId, submitterId: memberId, content: "Add events" });
    await expect(service.updateSuggestion({ guildId, id: suggestion.id, status: "APPROVED", reviewerId: memberId, staffNote: "ok" })).resolves.toMatchObject({ status: "APPROVED" });

    const starboard = await service.saveStarboard({ guildId, enabled: true, destinationChannelId: channelId, emoji: "\u2b50", threshold: 2, allowSelfStar: false, includeBotMessages: false, nsfw: "BLOCK", mode: "DENYLIST", channels: [], ignoredRoles: [] });
    expect(service.shouldStar(starboard, { channelId, authorId: memberId, reactorId: memberId, isBot: false, nsfw: false, count: 3 })).toBe(false);
    expect(service.shouldStar(starboard, { channelId, authorId: memberId, reactorId: secondRoleId, isBot: false, nsfw: false, count: 2 })).toBe(true);
    await expect(service.upsertStarboardEntry({ guildId, sourceChannelId: channelId, sourceMessageId: "1262656532902842427", authorId: memberId, starCount: 2, deleted: false })).resolves.toMatchObject({ starCount: 2 });
  });
});

function welcome(overrides: Partial<WelcomeGoodbyeConfig> = {}): WelcomeGoodbyeConfig {
  return {
    guildId,
    kind: "WELCOME",
    enabled: true,
    channelId,
    messageText: "Welcome {user}",
    embedEnabled: false,
    thumbnailAvatar: true,
    directMessageEnabled: false,
    ...overrides,
  };
}

function placeholder() {
  return {
    user: `<@${memberId}>`,
    username: "owner",
    displayName: "Owner",
    userId: memberId,
    server: "Qbox",
    memberCount: 12,
    joinedAt: new Date("2026-08-02T12:00:00.000Z"),
  };
}

class FakeGateway implements DiscordCommunityGateway {
  public sent: CommunitySendMessage[] = [];
  public assigned: CommunityRoleMutation[] = [];
  public renamed: ChannelRenameInput[] = [];
  public invalidRoles = new Set<string>();
  public hasRole = false;
  public failSend = false;

  public async sendMessage(input: CommunitySendMessage): Promise<CommunitySentMessage> {
    if (this.failSend) throw new Error("invalid-channel");
    this.sent.push(input);
    return { channelId: input.channelId, messageId: "1262656532902842428" };
  }

  public async assignRole(input: CommunityRoleMutation): Promise<CommunityRoleMutationResult> {
    if (this.hasRole) return { changed: false, message: "already accepted" };
    this.assigned.push(input);
    return { changed: true, message: "assigned" };
  }

  public async removeRole(input: CommunityRoleMutation): Promise<CommunityRoleMutationResult> {
    this.assigned.push(input);
    return { changed: true, message: "removed" };
  }

  public async validateRole(input: CommunityRoleQuery): Promise<CommunityRoleValidation> {
    return this.invalidRoles.has(input.roleId) ? { assignable: false, reason: "managed role" } : { assignable: true };
  }

  public async countMembers(_input: CounterCountInput): Promise<number> {
    return 42;
  }

  public async renameChannel(input: ChannelRenameInput): Promise<void> {
    this.renamed.push(input);
  }
}

class InMemoryCommunityRepository implements CommunityRepository {
  private readonly settingsByGuild = new Map<string, MutableSettings>();

  public async getSettings(guildId: string): Promise<CommunitySettings> {
    return this.state(guildId);
  }

  public async saveWelcomeGoodbye(input: WelcomeGoodbyeConfig): Promise<WelcomeGoodbyeConfig> {
    const state = this.state(input.guildId);
    if (input.kind === "WELCOME") state.welcome = input;
    else state.goodbye = input;
    return input;
  }

  public async saveAutoroles(input: AutoroleConfig): Promise<AutoroleConfig> {
    this.state(input.guildId).autoroles = input;
    return input;
  }

  public async addAutorole(input: AutoroleRuleInput): Promise<AutoroleRule> {
    const state = this.state(input.guildId);
    const rule = { ...input, position: input.position ?? state.autoroles.roles.length + 1 };
    state.autoroles = { ...state.autoroles, roles: [...state.autoroles.roles, rule].sort((a, b) => a.position - b.position) };
    return rule;
  }

  public async removeAutorole(guildId: string, roleIdToRemove: string): Promise<void> {
    const state = this.state(guildId);
    state.autoroles = { ...state.autoroles, roles: state.autoroles.roles.filter((role) => role.roleId !== roleIdToRemove) };
  }

  public async saveRules(input: RulesConfig): Promise<RulesConfig> {
    this.state(input.guildId).rules = input;
    return input;
  }

  public async saveCounter(input: CounterInput): Promise<CounterConfig> {
    const state = this.state(input.guildId);
    const counter = { ...input, id: input.id ?? `counter-${state.counters.length + 1}` };
    state.counters = [...state.counters.filter((item) => item.id !== counter.id), counter];
    return counter;
  }

  public async deleteCounter(guildIdToDelete: string, id: string): Promise<void> {
    const state = this.state(guildIdToDelete);
    state.counters = state.counters.filter((counter) => counter.id !== id);
  }

  public async saveLogs(input: ServerLogConfig): Promise<ServerLogConfig> {
    this.state(input.guildId).logs = input;
    return input;
  }

  public async saveEmbedTemplate(input: EmbedTemplateInput): Promise<EmbedTemplate> {
    const state = this.state(input.guildId);
    const template = { ...input, id: input.id ?? `embed-${state.embedTemplates.length + 1}` };
    state.embedTemplates = [...state.embedTemplates.filter((item) => item.id !== template.id), template];
    return template;
  }

  public async deleteEmbedTemplate(guildIdToDelete: string, id: string): Promise<void> {
    const state = this.state(guildIdToDelete);
    state.embedTemplates = state.embedTemplates.filter((template) => template.id !== id);
  }

  public async saveCustomCommand(input: CustomCommandInput): Promise<CustomCommand> {
    const state = this.state(input.guildId);
    state.customCommands = [...state.customCommands.filter((command) => command.name !== input.name), input];
    return input;
  }

  public async deleteCustomCommand(guildIdToDelete: string, name: string): Promise<void> {
    const state = this.state(guildIdToDelete);
    state.customCommands = state.customCommands.filter((command) => command.name !== name);
  }

  public async createSuggestion(input: SuggestionInput): Promise<Suggestion> {
    const state = this.state(input.guildId);
    const suggestion = { ...input, id: `suggestion-${state.suggestions.length + 1}`, status: "SUBMITTED" as const, messageIds: {}, upvotes: 0, downvotes: 0, createdAt: new Date(), updatedAt: new Date() };
    state.suggestions = [...state.suggestions, suggestion];
    return suggestion;
  }

  public async updateSuggestion(input: SuggestionUpdate): Promise<Suggestion> {
    const state = this.state(input.guildId);
    const existing = state.suggestions.find((suggestion) => suggestion.id === input.id);
    if (!existing) throw new Error("suggestion not found");
    const updated = { ...existing, ...input, updatedAt: new Date() };
    state.suggestions = state.suggestions.map((suggestion) => suggestion.id === updated.id ? updated : suggestion);
    return updated;
  }

  public async saveStarboard(input: StarboardConfig): Promise<StarboardConfig> {
    this.state(input.guildId).starboard = input;
    return input;
  }

  public async upsertStarboardEntry(input: StarboardEntryInput): Promise<StarboardEntry> {
    const state = this.state(input.guildId);
    const existing = state.starboardEntries.find((entry) => entry.sourceMessageId === input.sourceMessageId);
    const entry = { id: existing?.id ?? `star-${state.starboardEntries.length + 1}`, ...input };
    state.starboardEntries = [...state.starboardEntries.filter((item) => item.id !== entry.id), entry];
    return entry;
  }

  public async markStarboardEntryDeleted(guildIdToDelete: string, sourceMessageId: string): Promise<void> {
    const state = this.state(guildIdToDelete);
    state.starboardEntries = state.starboardEntries.map((entry) => entry.sourceMessageId === sourceMessageId ? { ...entry, deleted: true } : entry);
  }

  private state(id: string): MutableSettings {
    const existing = this.settingsByGuild.get(id);
    if (existing) return existing;
    const created: MutableSettings = {
      guildId: id,
      autoroles: { guildId: id, enabled: false, delaySeconds: 0, includeBots: false, roles: [] },
      counters: [],
      embedTemplates: [],
      customCommands: [],
      suggestions: [],
      starboardEntries: [],
    };
    this.settingsByGuild.set(id, created);
    return created;
  }
}

interface MutableSettings extends CommunitySettings {
  welcome?: WelcomeGoodbyeConfig;
  goodbye?: WelcomeGoodbyeConfig;
  autoroles: AutoroleConfig;
  rules?: RulesConfig;
  counters: CounterConfig[];
  logs?: ServerLogConfig;
  embedTemplates: EmbedTemplate[];
  customCommands: CustomCommand[];
  suggestions: Suggestion[];
  starboard?: StarboardConfig;
  starboardEntries: StarboardEntry[];
}

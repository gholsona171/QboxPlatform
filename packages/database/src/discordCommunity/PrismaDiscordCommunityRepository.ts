import type {
  AutoroleConfig,
  AutoroleRule,
  AutoroleRuleInput,
  CommunityRepository,
  CommunitySettings,
  CounterConfig,
  CounterInput,
  CustomCommand,
  CustomCommandInput,
  EmbedField,
  EmbedTemplate,
  EmbedTemplateInput,
  RulesConfig,
  ServerLogConfig,
  StarboardConfig,
  StarboardEntry,
  StarboardEntryInput,
  Suggestion,
  SuggestionInput,
  SuggestionMessageIds,
  SuggestionUpdate,
  WelcomeGoodbyeConfig,
} from "@qbox/discord-community";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<
  PrismaClient,
  | "guild"
  | "welcomeGoodbyeConfig"
  | "autoroleConfig"
  | "autoroleRule"
  | "rulesConfig"
  | "communityCounter"
  | "serverLogConfig"
  | "embedTemplate"
  | "customCommand"
  | "suggestion"
  | "starboardConfig"
  | "starboardEntry"
  | "$transaction"
>;

export class PrismaDiscordCommunityRepository implements CommunityRepository {
  public constructor(private readonly client: Client) {}

  public async getSettings(guildId: string): Promise<CommunitySettings> {
    const guild = await this.ensureGuild(guildId);
    const [
      welcomeGoodbye,
      autoroleConfig,
      autoroleRules,
      rules,
      counters,
      logs,
      embedTemplates,
      customCommands,
      suggestions,
      starboard,
      starboardEntries,
    ] = await Promise.all([
      this.client.welcomeGoodbyeConfig.findMany({ where: { guildId: guild.id } }),
      this.client.autoroleConfig.findUnique({ where: { guildId: guild.id } }),
      this.client.autoroleRule.findMany({ where: { guildId: guild.id }, orderBy: { position: "asc" } }),
      this.client.rulesConfig.findUnique({ where: { guildId: guild.id } }),
      this.client.communityCounter.findMany({ where: { guildId: guild.id }, orderBy: { createdAt: "asc" } }),
      this.client.serverLogConfig.findUnique({ where: { guildId: guild.id } }),
      this.client.embedTemplate.findMany({ where: { guildId: guild.id }, orderBy: { name: "asc" } }),
      this.client.customCommand.findMany({ where: { guildId: guild.id }, orderBy: { name: "asc" } }),
      this.client.suggestion.findMany({ where: { guildId: guild.id }, orderBy: { createdAt: "desc" }, take: 100 }),
      this.client.starboardConfig.findUnique({ where: { guildId: guild.id } }),
      this.client.starboardEntry.findMany({ where: { guildId: guild.id }, orderBy: { updatedAt: "desc" }, take: 100 }),
    ]);
    const mappedWelcomeGoodbye = welcomeGoodbye.map((row) => mapWelcomeGoodbye(guildId, row));
    const welcome = mappedWelcomeGoodbye.find((config) => config.kind === "WELCOME");
    const goodbye = mappedWelcomeGoodbye.find((config) => config.kind === "GOODBYE");
    return {
      guildId,
      ...(welcome === undefined ? {} : { welcome }),
      ...(goodbye === undefined ? {} : { goodbye }),
      autoroles: mapAutoroles(guildId, autoroleConfig, autoroleRules),
      ...(rules ? { rules: mapRules(guildId, rules) } : {}),
      counters: counters.map((row) => mapCounter(guildId, row)),
      ...(logs ? { logs: mapLogs(guildId, logs) } : {}),
      embedTemplates: embedTemplates.map((row) => mapEmbed(guildId, row)),
      customCommands: customCommands.map((row) => mapCustom(guildId, row)),
      suggestions: suggestions.map((row) => mapSuggestion(guildId, row)),
      ...(starboard ? { starboard: mapStarboard(guildId, starboard) } : {}),
      starboardEntries: starboardEntries.map((row) => mapStarboardEntry(guildId, row)),
    };
  }

  public async saveWelcomeGoodbye(input: WelcomeGoodbyeConfig): Promise<WelcomeGoodbyeConfig> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.welcomeGoodbyeConfig.upsert({
      where: { guildId_kind: { guildId: guild.id, kind: dbWelcomeKind(input.kind) } },
      create: welcomeGoodbyeData(guild.id, input),
      update: welcomeGoodbyeData(guild.id, input),
    });
    return mapWelcomeGoodbye(input.guildId, row);
  }

  public async saveAutoroles(input: AutoroleConfig): Promise<AutoroleConfig> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.autoroleConfig.upsert({
      where: { guildId: guild.id },
      create: {
        guildId: guild.id,
        enabled: input.enabled,
        delaySeconds: input.delaySeconds,
        includeBots: input.includeBots,
      },
      update: {
        enabled: input.enabled,
        delaySeconds: input.delaySeconds,
        includeBots: input.includeBots,
      },
    });
    const rules = await this.client.autoroleRule.findMany({ where: { guildId: guild.id }, orderBy: { position: "asc" } });
    return mapAutoroles(input.guildId, row, rules);
  }

  public async addAutorole(input: AutoroleRuleInput): Promise<AutoroleRule> {
    const guild = await this.ensureGuild(input.guildId);
    const count = await this.client.autoroleRule.count({ where: { guildId: guild.id } });
    const row = await this.client.autoroleRule.upsert({
      where: { guildId_roleId: { guildId: guild.id, roleId: input.roleId } },
      create: { guildId: guild.id, roleId: input.roleId, position: input.position ?? count },
      update: { position: input.position ?? count },
    });
    return { guildId: input.guildId, roleId: row.roleId, position: row.position };
  }

  public async removeAutorole(guildId: string, roleId: string): Promise<void> {
    const guild = await this.ensureGuild(guildId);
    await this.client.autoroleRule.delete({ where: { guildId_roleId: { guildId: guild.id, roleId } } });
  }

  public async saveRules(input: RulesConfig): Promise<RulesConfig> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.rulesConfig.upsert({
      where: { guildId: guild.id },
      create: rulesData(guild.id, input),
      update: rulesData(guild.id, input),
    });
    return mapRules(input.guildId, row);
  }

  public async saveCounter(input: CounterInput): Promise<CounterConfig> {
    const guild = await this.ensureGuild(input.guildId);
    const data = counterData(guild.id, input);
    const row = input.id
      ? await this.client.communityCounter.update({ where: { id: input.id, guildId: guild.id }, data })
      : await this.client.communityCounter.create({ data });
    return mapCounter(input.guildId, row);
  }

  public async deleteCounter(guildId: string, id: string): Promise<void> {
    const guild = await this.ensureGuild(guildId);
    await this.client.communityCounter.delete({ where: { id, guildId: guild.id } });
  }

  public async saveLogs(input: ServerLogConfig): Promise<ServerLogConfig> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.serverLogConfig.upsert({
      where: { guildId: guild.id },
      create: logData(guild.id, input),
      update: logData(guild.id, input),
    });
    return mapLogs(input.guildId, row);
  }

  public async saveEmbedTemplate(input: EmbedTemplateInput): Promise<EmbedTemplate> {
    const guild = await this.ensureGuild(input.guildId);
    const data = embedData(guild.id, input);
    const row = input.id
      ? await this.client.embedTemplate.update({ where: { id: input.id, guildId: guild.id }, data })
      : await this.client.embedTemplate.upsert({
          where: { guildId_name: { guildId: guild.id, name: input.name } },
          create: data,
          update: data,
        });
    return mapEmbed(input.guildId, row);
  }

  public async deleteEmbedTemplate(guildId: string, id: string): Promise<void> {
    const guild = await this.ensureGuild(guildId);
    await this.client.embedTemplate.delete({ where: { id, guildId: guild.id } });
  }

  public async saveCustomCommand(input: CustomCommandInput): Promise<CustomCommand> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.customCommand.upsert({
      where: { guildId_name: { guildId: guild.id, name: input.name } },
      create: customData(guild.id, input),
      update: customData(guild.id, input),
    });
    return mapCustom(input.guildId, row);
  }

  public async deleteCustomCommand(guildId: string, name: string): Promise<void> {
    const guild = await this.ensureGuild(guildId);
    await this.client.customCommand.delete({ where: { guildId_name: { guildId: guild.id, name } } });
  }

  public async createSuggestion(input: SuggestionInput): Promise<Suggestion> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.suggestion.create({
      data: { guildId: guild.id, submitterId: input.submitterId, content: input.content },
    });
    return mapSuggestion(input.guildId, row);
  }

  public async updateSuggestion(input: SuggestionUpdate): Promise<Suggestion> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.suggestion.update({
      where: { id: input.id, guildId: guild.id },
      data: {
        status: dbSuggestionStatus(input.status),
        ...(input.reviewerId === undefined ? {} : { reviewerId: input.reviewerId }),
        ...(input.staffNote === undefined ? {} : { staffNote: input.staffNote }),
        ...(input.upvotes === undefined ? {} : { upvotes: input.upvotes }),
        ...(input.downvotes === undefined ? {} : { downvotes: input.downvotes }),
        ...(input.messageIds?.submission === undefined ? {} : { submissionMessageId: input.messageIds.submission }),
        ...(input.messageIds?.review === undefined ? {} : { reviewMessageId: input.messageIds.review }),
        ...(input.messageIds?.result === undefined ? {} : { resultMessageId: input.messageIds.result }),
      },
    });
    return mapSuggestion(input.guildId, row);
  }

  public async saveStarboard(input: StarboardConfig): Promise<StarboardConfig> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.starboardConfig.upsert({
      where: { guildId: guild.id },
      create: starboardData(guild.id, input),
      update: starboardData(guild.id, input),
    });
    return mapStarboard(input.guildId, row);
  }

  public async upsertStarboardEntry(input: StarboardEntryInput): Promise<StarboardEntry> {
    const guild = await this.ensureGuild(input.guildId);
    const row = await this.client.starboardEntry.upsert({
      where: { guildId_sourceMessageId: { guildId: guild.id, sourceMessageId: input.sourceMessageId } },
      create: starboardEntryData(guild.id, input),
      update: starboardEntryData(guild.id, input),
    });
    return mapStarboardEntry(input.guildId, row);
  }

  public async markStarboardEntryDeleted(guildId: string, sourceMessageId: string): Promise<void> {
    const guild = await this.ensureGuild(guildId);
    await this.client.starboardEntry.update({
      where: { guildId_sourceMessageId: { guildId: guild.id, sourceMessageId } },
      data: { deleted: true },
    });
  }

  private async ensureGuild(discordGuildId: string) {
    return this.client.guild.upsert({
      where: { discordGuildId },
      create: { discordGuildId },
      update: {},
    });
  }
}

function welcomeGoodbyeData(guildId: string, input: WelcomeGoodbyeConfig) {
  return {
    guildId,
    kind: dbWelcomeKind(input.kind),
    enabled: input.enabled,
    channelId: input.channelId,
    messageText: input.messageText,
    embedEnabled: input.embedEnabled,
    embedTitle: input.embedTitle ?? null,
    embedDescription: input.embedDescription ?? null,
    embedColor: input.embedColor ?? null,
    thumbnailAvatar: input.thumbnailAvatar,
    footer: input.footer ?? null,
    directMessageEnabled: input.directMessageEnabled,
    imageUrl: input.imageUrl ?? null,
    roleMentionId: input.roleMentionId ?? null,
    deleteAfterSeconds: input.deleteAfterSeconds ?? null,
  };
}

function rulesData(guildId: string, input: RulesConfig) {
  return {
    guildId,
    enabled: input.enabled,
    channelId: input.channelId,
    messageText: input.messageText,
    buttonLabel: input.buttonLabel,
    acceptedRoleId: input.acceptedRoleId,
    pendingRoleId: input.pendingRoleId ?? null,
    messageId: input.messageId ?? null,
  };
}

function counterData(guildId: string, input: CounterInput) {
  return {
    guildId,
    enabled: input.enabled,
    channelId: input.channelId,
    labelTemplate: input.labelTemplate,
    type: input.type,
    roleId: input.roleId ?? null,
    intervalSeconds: input.intervalSeconds,
  };
}

function logData(guildId: string, input: ServerLogConfig) {
  return {
    guildId,
    enabled: input.enabled,
    events: [...input.events],
    destinations: input.destinations as Prisma.InputJsonObject,
    ignoredChannels: [...input.ignoredChannels],
    ignoredRoles: [...input.ignoredRoles],
    ignoredUsers: [...input.ignoredUsers],
    includeBots: input.includeBots,
    contentMode: input.contentMode,
    colors: input.colors as Prisma.InputJsonObject,
  };
}

function embedData(guildId: string, input: EmbedTemplateInput) {
  return {
    guildId,
    name: input.name,
    content: input.content ?? null,
    title: input.title ?? null,
    description: input.description ?? null,
    color: input.color ?? null,
    author: input.author ?? null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    imageUrl: input.imageUrl ?? null,
    footer: input.footer ?? null,
    timestamp: input.timestamp,
    fields: input.fields as unknown as Prisma.InputJsonArray,
    allowedRoleMentions: [...input.allowedRoleMentions],
  };
}

function customData(guildId: string, input: CustomCommandInput) {
  return {
    guildId,
    name: input.name,
    description: input.description,
    responseText: input.responseText,
    embedTemplateId: input.embedTemplateId ?? null,
    enabled: input.enabled,
    allowedChannels: [...input.allowedChannels],
    deniedChannels: [...input.deniedChannels],
    requiredRoles: [...input.requiredRoles],
    cooldownSeconds: input.cooldownSeconds,
    triggerMode: input.triggerMode,
    triggerPhrase: input.triggerPhrase ?? null,
    deleteTriggeringMessage: input.deleteTriggeringMessage,
  };
}

function starboardData(guildId: string, input: StarboardConfig) {
  return {
    guildId,
    enabled: input.enabled,
    destinationChannelId: input.destinationChannelId,
    emoji: input.emoji,
    threshold: input.threshold,
    allowSelfStar: input.allowSelfStar,
    includeBotMessages: input.includeBotMessages,
    nsfw: input.nsfw,
    mode: input.mode,
    channels: [...input.channels],
    ignoredRoles: [...input.ignoredRoles],
  };
}

function starboardEntryData(guildId: string, input: StarboardEntryInput) {
  return {
    guildId,
    sourceChannelId: input.sourceChannelId,
    sourceMessageId: input.sourceMessageId,
    destinationMessageId: input.destinationMessageId ?? null,
    authorId: input.authorId,
    starCount: input.starCount,
    deleted: input.deleted,
  };
}

function mapWelcomeGoodbye(guildId: string, row: Prisma.WelcomeGoodbyeConfigGetPayload<object>): WelcomeGoodbyeConfig {
  return {
    guildId,
    kind: row.kind === "WELCOME" ? "WELCOME" : "GOODBYE",
    enabled: row.enabled,
    channelId: row.channelId,
    messageText: row.messageText,
    embedEnabled: row.embedEnabled,
    ...(row.embedTitle ? { embedTitle: row.embedTitle } : {}),
    ...(row.embedDescription ? { embedDescription: row.embedDescription } : {}),
    ...(row.embedColor ? { embedColor: row.embedColor } : {}),
    thumbnailAvatar: row.thumbnailAvatar,
    ...(row.footer ? { footer: row.footer } : {}),
    directMessageEnabled: row.directMessageEnabled,
    ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
    ...(row.roleMentionId ? { roleMentionId: row.roleMentionId } : {}),
    ...(row.deleteAfterSeconds === null ? {} : { deleteAfterSeconds: row.deleteAfterSeconds }),
  };
}

function mapAutoroles(guildId: string, config: Prisma.AutoroleConfigGetPayload<object> | null, rules: readonly Prisma.AutoroleRuleGetPayload<object>[]): AutoroleConfig {
  return {
    guildId,
    enabled: config?.enabled ?? false,
    delaySeconds: config?.delaySeconds ?? 0,
    includeBots: config?.includeBots ?? false,
    roles: rules.map((row) => ({ guildId, roleId: row.roleId, position: row.position })),
  };
}

function mapRules(guildId: string, row: Prisma.RulesConfigGetPayload<object>): RulesConfig {
  return {
    guildId,
    enabled: row.enabled,
    channelId: row.channelId,
    messageText: row.messageText,
    buttonLabel: row.buttonLabel,
    acceptedRoleId: row.acceptedRoleId,
    ...(row.pendingRoleId ? { pendingRoleId: row.pendingRoleId } : {}),
    ...(row.messageId ? { messageId: row.messageId } : {}),
  };
}

function mapCounter(guildId: string, row: Prisma.CommunityCounterGetPayload<object>): CounterConfig {
  return {
    id: row.id,
    guildId,
    enabled: row.enabled,
    channelId: row.channelId,
    labelTemplate: row.labelTemplate,
    type: row.type,
    ...(row.roleId ? { roleId: row.roleId } : {}),
    intervalSeconds: row.intervalSeconds,
    ...(row.lastValue === null ? {} : { lastValue: row.lastValue }),
  };
}

function mapLogs(guildId: string, row: Prisma.ServerLogConfigGetPayload<object>): ServerLogConfig {
  return {
    guildId,
    enabled: row.enabled,
    events: row.events,
    destinations: record(row.destinations),
    ignoredChannels: row.ignoredChannels,
    ignoredRoles: row.ignoredRoles,
    ignoredUsers: row.ignoredUsers,
    includeBots: row.includeBots,
    contentMode: row.contentMode === "REDACTED" ? "REDACTED" : "WHEN_AVAILABLE",
    colors: record(row.colors),
  };
}

function mapEmbed(guildId: string, row: Prisma.EmbedTemplateGetPayload<object>): EmbedTemplate {
  return {
    id: row.id,
    guildId,
    name: row.name,
    ...(row.content ? { content: row.content } : {}),
    ...(row.title ? { title: row.title } : {}),
    ...(row.description ? { description: row.description } : {}),
    ...(row.color ? { color: row.color } : {}),
    ...(row.author ? { author: row.author } : {}),
    ...(row.thumbnailUrl ? { thumbnailUrl: row.thumbnailUrl } : {}),
    ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
    ...(row.footer ? { footer: row.footer } : {}),
    timestamp: row.timestamp,
    fields: fields(row.fields),
    allowedRoleMentions: row.allowedRoleMentions,
  };
}

function mapCustom(guildId: string, row: Prisma.CustomCommandGetPayload<object>): CustomCommand {
  return {
    guildId,
    name: row.name,
    description: row.description,
    responseText: row.responseText,
    ...(row.embedTemplateId ? { embedTemplateId: row.embedTemplateId } : {}),
    enabled: row.enabled,
    allowedChannels: row.allowedChannels,
    deniedChannels: row.deniedChannels,
    requiredRoles: row.requiredRoles,
    cooldownSeconds: row.cooldownSeconds,
    triggerMode: row.triggerMode === "SLASH_ONLY" ? "SLASH_ONLY" : row.triggerMode === "EXACT" ? "EXACT" : row.triggerMode === "STARTS_WITH" ? "STARTS_WITH" : "CONTAINS",
    ...(row.triggerPhrase ? { triggerPhrase: row.triggerPhrase } : {}),
    deleteTriggeringMessage: row.deleteTriggeringMessage,
  };
}

function mapSuggestion(guildId: string, row: Prisma.SuggestionGetPayload<object>): Suggestion {
  return {
    id: row.id,
    guildId,
    submitterId: row.submitterId,
    content: row.content,
    status: row.status === "SUBMITTED" ? "SUBMITTED" : row.status === "UNDER_REVIEW" ? "UNDER_REVIEW" : row.status === "APPROVED" ? "APPROVED" : row.status === "DENIED" ? "DENIED" : "IMPLEMENTED",
    ...(row.reviewerId ? { reviewerId: row.reviewerId } : {}),
    ...(row.staffNote ? { staffNote: row.staffNote } : {}),
    messageIds: {
      ...(row.submissionMessageId ? { submission: row.submissionMessageId } : {}),
      ...(row.reviewMessageId ? { review: row.reviewMessageId } : {}),
      ...(row.resultMessageId ? { result: row.resultMessageId } : {}),
    },
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapStarboard(guildId: string, row: Prisma.StarboardConfigGetPayload<object>): StarboardConfig {
  return {
    guildId,
    enabled: row.enabled,
    destinationChannelId: row.destinationChannelId,
    emoji: row.emoji,
    threshold: row.threshold,
    allowSelfStar: row.allowSelfStar,
    includeBotMessages: row.includeBotMessages,
    nsfw: row.nsfw === "ALLOW" ? "ALLOW" : "BLOCK",
    mode: row.mode === "ALLOWLIST" ? "ALLOWLIST" : "DENYLIST",
    channels: row.channels,
    ignoredRoles: row.ignoredRoles,
  };
}

function mapStarboardEntry(guildId: string, row: Prisma.StarboardEntryGetPayload<object>): StarboardEntry {
  return {
    id: row.id,
    guildId,
    sourceChannelId: row.sourceChannelId,
    sourceMessageId: row.sourceMessageId,
    ...(row.destinationMessageId ? { destinationMessageId: row.destinationMessageId } : {}),
    authorId: row.authorId,
    starCount: row.starCount,
    deleted: row.deleted,
  };
}

function dbWelcomeKind(kind: WelcomeGoodbyeConfig["kind"]) {
  return kind;
}

function dbSuggestionStatus(status: SuggestionUpdate["status"]) {
  return status;
}

function record(value: Prisma.JsonValue): Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.fromEntries(Object.entries(value).filter(([, entry]) => typeof entry === "string")) as Record<string, string>
    : {};
}

function fields(value: Prisma.JsonValue): readonly EmbedField[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Prisma.JsonObject => typeof entry === "object" && entry !== null && !Array.isArray(entry))
    .map((entry) => ({
      name: typeof entry.name === "string" ? entry.name : "",
      value: typeof entry.value === "string" ? entry.value : "",
      inline: entry.inline === true,
    }))
    .filter((entry) => entry.name && entry.value);
}

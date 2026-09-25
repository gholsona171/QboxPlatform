export type CommunityFeature =
  | "welcome"
  | "goodbye"
  | "autoroles"
  | "rules"
  | "counters"
  | "logs"
  | "embeds"
  | "customCommands"
  | "suggestions"
  | "starboard";

export type WelcomeGoodbyeKind = "WELCOME" | "GOODBYE";
export type CounterType = "TOTAL_MEMBERS" | "HUMANS" | "BOTS" | "ONLINE" | "ROLE";
export type SuggestionStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "DENIED" | "IMPLEMENTED";
export type TriggerMode = "SLASH_ONLY" | "EXACT" | "STARTS_WITH" | "CONTAINS";
export type CommunityOperationSource = "DISCORD" | "WEB" | "SYSTEM";

/** Server log event keys. `destinations` may map each key, or `all`, to a channel. */
export const LOG_EVENTS = ["memberJoin", "memberLeave", "messageDelete", "messageEdit", "roleChange", "nicknameChange", "voice", "ban"] as const;
export type LogEvent = (typeof LOG_EVENTS)[number];

const LOG_COLORS: Readonly<Record<LogEvent, string>> = {
  memberJoin: "#57F287",
  memberLeave: "#ED4245",
  messageDelete: "#ED4245",
  messageEdit: "#FEE75C",
  roleChange: "#5865F2",
  nicknameChange: "#5865F2",
  voice: "#99AAB5",
  ban: "#ED4245",
};

export interface LogDelivery {
  readonly guildId: string;
  readonly event: LogEvent;
  readonly title: string;
  readonly description: string;
  readonly userId?: string | undefined;
  readonly channelId?: string | undefined;
  readonly roleIds?: readonly string[] | undefined;
  readonly isBot?: boolean | undefined;
}

export interface CommunityRepository {
  getSettings(guildId: string): Promise<CommunitySettings>;
  saveWelcomeGoodbye(input: WelcomeGoodbyeConfig): Promise<WelcomeGoodbyeConfig>;
  saveAutoroles(input: AutoroleConfig): Promise<AutoroleConfig>;
  addAutorole(input: AutoroleRuleInput): Promise<AutoroleRule>;
  removeAutorole(guildId: string, roleId: string): Promise<void>;
  saveRules(input: RulesConfig): Promise<RulesConfig>;
  saveCounter(input: CounterInput): Promise<CounterConfig>;
  deleteCounter(guildId: string, id: string): Promise<void>;
  saveLogs(input: ServerLogConfig): Promise<ServerLogConfig>;
  saveEmbedTemplate(input: EmbedTemplateInput): Promise<EmbedTemplate>;
  deleteEmbedTemplate(guildId: string, id: string): Promise<void>;
  saveCustomCommand(input: CustomCommandInput): Promise<CustomCommand>;
  deleteCustomCommand(guildId: string, name: string): Promise<void>;
  createSuggestion(input: SuggestionInput): Promise<Suggestion>;
  updateSuggestion(input: SuggestionUpdate): Promise<Suggestion>;
  saveStarboard(input: StarboardConfig): Promise<StarboardConfig>;
  upsertStarboardEntry(input: StarboardEntryInput): Promise<StarboardEntry>;
  markStarboardEntryDeleted(guildId: string, sourceMessageId: string): Promise<void>;
}

export interface DiscordCommunityGateway {
  sendMessage(input: CommunitySendMessage): Promise<CommunitySentMessage>;
  assignRole(input: CommunityRoleMutation): Promise<CommunityRoleMutationResult>;
  removeRole(input: CommunityRoleMutation): Promise<CommunityRoleMutationResult>;
  validateRole(input: CommunityRoleQuery): Promise<CommunityRoleValidation>;
  countMembers(input: CounterCountInput): Promise<number>;
  renameChannel(input: ChannelRenameInput): Promise<void>;
}

export interface CommunitySettings {
  readonly guildId: string;
  readonly welcome?: WelcomeGoodbyeConfig;
  readonly goodbye?: WelcomeGoodbyeConfig;
  readonly autoroles: AutoroleConfig;
  readonly rules?: RulesConfig;
  readonly counters: readonly CounterConfig[];
  readonly logs?: ServerLogConfig;
  readonly embedTemplates: readonly EmbedTemplate[];
  readonly customCommands: readonly CustomCommand[];
  readonly suggestions: readonly Suggestion[];
  readonly starboard?: StarboardConfig;
  readonly starboardEntries: readonly StarboardEntry[];
}

export interface WelcomeGoodbyeConfig {
  readonly guildId: string;
  readonly kind: WelcomeGoodbyeKind;
  readonly enabled: boolean;
  readonly channelId: string;
  readonly messageText: string;
  readonly embedEnabled: boolean;
  readonly embedTitle?: string | undefined;
  readonly embedDescription?: string | undefined;
  readonly embedColor?: string | undefined;
  readonly thumbnailAvatar: boolean;
  readonly footer?: string | undefined;
  readonly directMessageEnabled: boolean;
  readonly imageUrl?: string | undefined;
  readonly roleMentionId?: string | undefined;
  readonly deleteAfterSeconds?: number | undefined;
}

export interface PlaceholderContext {
  readonly user: string;
  readonly username: string;
  readonly displayName: string;
  readonly userId: string;
  readonly server: string;
  readonly memberCount: number;
  readonly joinedAt: Date;
}

export interface AutoroleConfig {
  readonly guildId: string;
  readonly enabled: boolean;
  readonly delaySeconds: number;
  readonly includeBots: boolean;
  readonly revision?: number | undefined;
  readonly expectedRevision?: number | undefined;
  readonly lastOperationSource?: CommunityOperationSource | undefined;
  readonly source?: CommunityOperationSource | undefined;
  readonly roles: readonly AutoroleRule[];
}

export interface AutoroleRuleInput {
  readonly guildId: string;
  readonly roleId: string;
  readonly position?: number | undefined;
}

export interface AutoroleRule extends AutoroleRuleInput {
  readonly position: number;
}

export interface RulesConfig {
  readonly guildId: string;
  readonly enabled: boolean;
  readonly channelId: string;
  readonly messageText: string;
  readonly buttonLabel: string;
  readonly acceptedRoleId: string;
  readonly pendingRoleId?: string | undefined;
  readonly messageId?: string | undefined;
  readonly revision?: number | undefined;
  readonly expectedRevision?: number | undefined;
  readonly lastOperationSource?: CommunityOperationSource | undefined;
  readonly source?: CommunityOperationSource | undefined;
}

export interface CounterInput {
  readonly id?: string | undefined;
  readonly guildId: string;
  readonly enabled: boolean;
  readonly channelId: string;
  readonly labelTemplate: string;
  readonly type: CounterType;
  readonly roleId?: string | undefined;
  readonly intervalSeconds: number;
}

export interface CounterConfig extends Required<Pick<CounterInput, "id">>, Omit<CounterInput, "id"> {
  readonly lastValue?: number | undefined;
}

export interface ServerLogConfig {
  readonly guildId: string;
  readonly enabled: boolean;
  readonly events: readonly string[];
  readonly destinations: Readonly<Record<string, string>>;
  readonly ignoredChannels: readonly string[];
  readonly ignoredRoles: readonly string[];
  readonly ignoredUsers: readonly string[];
  readonly includeBots: boolean;
  readonly contentMode: "REDACTED" | "WHEN_AVAILABLE";
  readonly colors: Readonly<Record<string, string>>;
}

export interface EmbedTemplateInput {
  readonly id?: string | undefined;
  readonly guildId: string;
  readonly name: string;
  readonly content?: string | undefined;
  readonly title?: string | undefined;
  readonly description?: string | undefined;
  readonly color?: string | undefined;
  readonly author?: string | undefined;
  readonly thumbnailUrl?: string | undefined;
  readonly imageUrl?: string | undefined;
  readonly footer?: string | undefined;
  readonly timestamp: boolean;
  readonly fields: readonly EmbedField[];
  readonly allowedRoleMentions: readonly string[];
}

export interface EmbedTemplate extends Required<Pick<EmbedTemplateInput, "id">>, Omit<EmbedTemplateInput, "id"> {}

export interface EmbedField {
  readonly name: string;
  readonly value: string;
  readonly inline: boolean;
}

export interface CustomCommandInput {
  readonly guildId: string;
  readonly name: string;
  readonly description: string;
  readonly responseText: string;
  readonly embedTemplateId?: string | undefined;
  readonly enabled: boolean;
  readonly allowedChannels: readonly string[];
  readonly deniedChannels: readonly string[];
  readonly requiredRoles: readonly string[];
  readonly cooldownSeconds: number;
  readonly triggerMode: TriggerMode;
  readonly triggerPhrase?: string | undefined;
  readonly deleteTriggeringMessage: boolean;
}

export interface CustomCommand extends CustomCommandInput {}

export interface SuggestionInput {
  readonly guildId: string;
  readonly submitterId: string;
  readonly content: string;
}

export interface SuggestionUpdate {
  readonly guildId: string;
  readonly id: string;
  readonly status: SuggestionStatus;
  readonly reviewerId?: string | undefined;
  readonly staffNote?: string | undefined;
  readonly messageIds?: SuggestionMessageIds | undefined;
  readonly upvotes?: number | undefined;
  readonly downvotes?: number | undefined;
}

export interface Suggestion {
  readonly id: string;
  readonly guildId: string;
  readonly submitterId: string;
  readonly content: string;
  readonly status: SuggestionStatus;
  readonly reviewerId?: string | undefined;
  readonly staffNote?: string | undefined;
  readonly messageIds: SuggestionMessageIds;
  readonly upvotes: number;
  readonly downvotes: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface SuggestionMessageIds {
  readonly submission?: string | undefined;
  readonly review?: string | undefined;
  readonly result?: string | undefined;
}

export interface StarboardConfig {
  readonly guildId: string;
  readonly enabled: boolean;
  readonly destinationChannelId: string;
  readonly emoji: string;
  readonly threshold: number;
  readonly allowSelfStar: boolean;
  readonly includeBotMessages: boolean;
  readonly nsfw: "ALLOW" | "BLOCK";
  readonly mode: "ALLOWLIST" | "DENYLIST";
  readonly channels: readonly string[];
  readonly ignoredRoles: readonly string[];
}

export interface StarboardEntryInput {
  readonly guildId: string;
  readonly sourceChannelId: string;
  readonly sourceMessageId: string;
  readonly destinationMessageId?: string | undefined;
  readonly authorId: string;
  readonly starCount: number;
  readonly deleted: boolean;
}

export interface StarboardEntry extends StarboardEntryInput {
  readonly id: string;
}

export interface CommunitySendMessage {
  readonly guildId: string;
  readonly channelId: string;
  readonly content?: string | undefined;
  readonly embed?: RenderedEmbed | undefined;
  readonly deleteAfterSeconds?: number | undefined;
}

export interface CommunitySentMessage {
  readonly channelId: string;
  readonly messageId: string;
  readonly url?: string | undefined;
}

export interface RenderedEmbed {
  readonly title?: string | undefined;
  readonly description?: string | undefined;
  readonly color?: number | undefined;
  readonly thumbnailUrl?: string | undefined;
  readonly imageUrl?: string | undefined;
  readonly footer?: string | undefined;
  readonly fields?: readonly EmbedField[] | undefined;
  readonly timestamp?: boolean | undefined;
}

export interface CommunityRoleQuery {
  readonly guildId: string;
  readonly memberId: string;
  readonly roleId: string;
}

export interface CommunityRoleMutation extends CommunityRoleQuery {
  readonly reason: string;
}

export interface CommunityRoleValidation {
  readonly assignable: boolean;
  readonly reason?: string;
}

export interface CommunityRoleMutationResult {
  readonly changed: boolean;
  readonly message: string;
}

export interface CounterCountInput {
  readonly guildId: string;
  readonly type: CounterType;
  readonly roleId?: string;
}

export interface ChannelRenameInput {
  readonly guildId: string;
  readonly channelId: string;
  readonly name: string;
}

export class CommunityFeatureError extends Error {
  public constructor(
    public readonly code: "INVALID_INPUT" | "NOT_FOUND" | "DISABLED" | "FORBIDDEN" | "DEPENDENCY_UNAVAILABLE" | "CONFLICT",
    message: string,
    public readonly details?: Readonly<Record<string, string | number>> | undefined,
  ) {
    super(message);
    this.name = "CommunityFeatureError";
  }
}

const snowflake = /^\d{17,20}$/;
const hexColor = /^#?[0-9a-fA-F]{6}$/;

export class DiscordCommunityService {
  public constructor(
    private readonly repository: CommunityRepository,
    private readonly gateway?: DiscordCommunityGateway,
  ) {}

  public settings(guildId: string): Promise<CommunitySettings> {
    requireSnowflake("guildId", guildId);
    return this.repository.getSettings(guildId);
  }

  public saveWelcomeGoodbye(input: WelcomeGoodbyeConfig): Promise<WelcomeGoodbyeConfig> {
    validateWelcomeGoodbye(input);
    return this.repository.saveWelcomeGoodbye(input);
  }

  public renderWelcomeGoodbye(config: WelcomeGoodbyeConfig, context: PlaceholderContext): CommunitySendMessage {
    const content = renderPlaceholders(config.messageText, context);
    const embed = config.embedEnabled
      ? compactEmbed(
          optionalEmbed({
            title: renderOptional(config.embedTitle, context),
            description: renderOptional(config.embedDescription, context) ?? content,
            color: parseColor(config.embedColor),
            thumbnailUrl: config.thumbnailAvatar ? `avatar:${context.userId}` : undefined,
            imageUrl: config.imageUrl,
            footer: renderOptional(config.footer, context),
          }),
        )
      : undefined;
    return {
      guildId: config.guildId,
      channelId: config.channelId,
      content: config.roleMentionId ? `<@&${config.roleMentionId}> ${content}` : content,
      ...(embed ? { embed } : {}),
      ...(config.deleteAfterSeconds === undefined ? {} : { deleteAfterSeconds: config.deleteAfterSeconds }),
    };
  }

  public async deliverWelcomeGoodbye(kind: WelcomeGoodbyeKind, guildId: string, context: PlaceholderContext): Promise<CommunitySentMessage | undefined> {
    const settings = await this.settings(guildId);
    const config = kind === "WELCOME" ? settings.welcome : settings.goodbye;
    if (!config?.enabled) return undefined;
    if (!this.gateway) throw unavailable();
    return this.gateway.sendMessage(this.renderWelcomeGoodbye(config, context));
  }

  public saveAutoroles(input: AutoroleConfig): Promise<AutoroleConfig> {
    validateAutoroles(input);
    return this.repository.saveAutoroles(input);
  }

  public addAutorole(input: AutoroleRuleInput): Promise<AutoroleRule> {
    requireSnowflake("guildId", input.guildId);
    requireRoleId(input.roleId);
    return this.repository.addAutorole(input);
  }

  public removeAutorole(guildId: string, roleId: string): Promise<void> {
    requireSnowflake("guildId", guildId);
    requireRoleId(roleId);
    return this.repository.removeAutorole(guildId, roleId);
  }

  public async applyAutoroles(guildId: string, memberId: string, isBot: boolean): Promise<readonly CommunityRoleMutationResult[]> {
    const config = (await this.settings(guildId)).autoroles;
    if (!config.enabled || (isBot && !config.includeBots)) return [];
    if (!this.gateway) throw unavailable();
    const results: CommunityRoleMutationResult[] = [];
    for (const rule of [...config.roles].sort((left, right) => left.position - right.position)) {
      const validation = await this.gateway.validateRole({ guildId, memberId, roleId: rule.roleId });
      if (!validation.assignable) {
        results.push({ changed: false, message: validation.reason ?? "Role cannot be assigned." });
        continue;
      }
      results.push(await this.gateway.assignRole({ guildId, memberId, roleId: rule.roleId, reason: "Qbox autorole assignment." }));
    }
    return results;
  }

  public saveRules(input: RulesConfig): Promise<RulesConfig> {
    validateRules(input);
    return this.repository.saveRules(input);
  }

  public async acceptRules(guildId: string, memberId: string): Promise<readonly CommunityRoleMutationResult[]> {
    const rules = (await this.settings(guildId)).rules;
    if (!rules?.enabled) throw new CommunityFeatureError("DISABLED", "Rules acknowledgement is disabled.");
    if (!this.gateway) throw unavailable();
    const validation = await this.gateway.validateRole({ guildId, memberId, roleId: rules.acceptedRoleId });
    if (!validation.assignable) throw new CommunityFeatureError("FORBIDDEN", validation.reason ?? "Accepted role cannot be assigned.");
    const results = [await this.gateway.assignRole({ guildId, memberId, roleId: rules.acceptedRoleId, reason: "Qbox rules accepted." })];
    if (rules.pendingRoleId) results.push(await this.gateway.removeRole({ guildId, memberId, roleId: rules.pendingRoleId, reason: "Qbox rules accepted." }));
    return results;
  }

  public saveCounter(input: CounterInput): Promise<CounterConfig> {
    validateCounter(input);
    return this.repository.saveCounter(input);
  }

  public async refreshCounter(counter: CounterConfig): Promise<number> {
    if (!counter.enabled) throw new CommunityFeatureError("DISABLED", "Counter is disabled.");
    if (!this.gateway) throw unavailable();
    const value = await this.gateway.countMembers({
      guildId: counter.guildId,
      type: counter.type,
      ...(counter.roleId === undefined ? {} : { roleId: counter.roleId }),
    });
    await this.gateway.renameChannel({ guildId: counter.guildId, channelId: counter.channelId, name: renderCounter(counter.labelTemplate, value) });
    return value;
  }

  public deleteCounter(guildId: string, id: string): Promise<void> {
    requireSnowflake("guildId", guildId);
    return this.repository.deleteCounter(guildId, id);
  }

  public saveLogs(input: ServerLogConfig): Promise<ServerLogConfig> {
    validateLogs(input);
    return this.repository.saveLogs(input);
  }

  /** Posts a server log entry when logging is on for this event and nothing is ignored. */
  public async deliverLog(input: LogDelivery): Promise<CommunitySentMessage | undefined> {
    const logs = (await this.settings(input.guildId)).logs;
    if (!logs?.enabled || !logs.events.includes(input.event)) return undefined;
    if (input.isBot && !logs.includeBots) return undefined;
    if (input.userId && logs.ignoredUsers.includes(input.userId)) return undefined;
    if (input.channelId && logs.ignoredChannels.includes(input.channelId)) return undefined;
    if (input.roleIds?.some((roleId) => logs.ignoredRoles.includes(roleId))) return undefined;
    const channelId = logs.destinations[input.event] ?? logs.destinations.all ?? Object.values(logs.destinations)[0];
    if (!channelId) return undefined;
    if (!this.gateway) throw unavailable();
    return this.gateway.sendMessage({
      guildId: input.guildId,
      channelId,
      embed: compactEmbed({
        title: input.title,
        description: input.description.slice(0, 4000),
        color: parseColor(logs.colors[input.event] ?? LOG_COLORS[input.event]),
        timestamp: true,
      }),
    });
  }

  public saveEmbedTemplate(input: EmbedTemplateInput): Promise<EmbedTemplate> {
    validateEmbed(input);
    return this.repository.saveEmbedTemplate(input);
  }

  public deleteEmbedTemplate(guildId: string, id: string): Promise<void> {
    requireSnowflake("guildId", guildId);
    return this.repository.deleteEmbedTemplate(guildId, id);
  }

  public renderEmbed(template: EmbedTemplateInput): CommunitySendMessage {
    validateEmbed(template);
    return {
      guildId: template.guildId,
      channelId: "",
      ...(template.content ? { content: template.content } : {}),
      embed: compactEmbed(
        optionalEmbed({
          title: template.title,
          description: template.description,
          color: parseColor(template.color),
          thumbnailUrl: template.thumbnailUrl,
          imageUrl: template.imageUrl,
          footer: template.footer,
          fields: template.fields,
          timestamp: template.timestamp,
        }),
      ),
    };
  }

  public async sendEmbedTemplate(guildId: string, name: string, channelId: string): Promise<CommunitySentMessage> {
    if (!this.gateway) throw unavailable();
    const gateway = this.gateway;
    requireSnowflake("guildId", guildId);
    requireSnowflake("channelId", channelId);
    const template = (await this.settings(guildId)).embedTemplates.find((item) => item.name === name);
    if (!template) throw new CommunityFeatureError("NOT_FOUND", "Embed template was not found.");
    const rendered = this.renderEmbed(template);
    return gateway.sendMessage({ ...rendered, channelId });
  }

  public async sendAnnouncement(input: { readonly guildId: string; readonly channelId: string; readonly content: string }): Promise<CommunitySentMessage> {
    if (!this.gateway) throw unavailable();
    const gateway = this.gateway;
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("channelId", input.channelId);
    requireLength("content", input.content, 1, 2000);
    if (/@(?:everyone|here)\b/.test(input.content)) throw new CommunityFeatureError("INVALID_INPUT", "Announcements cannot mention everyone or here.");
    return gateway.sendMessage({ guildId: input.guildId, channelId: input.channelId, content: input.content });
  }

  public saveCustomCommand(input: CustomCommandInput): Promise<CustomCommand> {
    validateCustom(input);
    return this.repository.saveCustomCommand(input);
  }

  public deleteCustomCommand(guildId: string, name: string): Promise<void> {
    requireSnowflake("guildId", guildId);
    return this.repository.deleteCustomCommand(guildId, normalizeCommandName(name));
  }

  public matchCustomCommand(commands: readonly CustomCommand[], content: string, channelId: string, roleIds: readonly string[]): CustomCommand | undefined {
    const lower = content.toLowerCase();
    return commands.find((command) => {
      if (!command.enabled || command.triggerMode === "SLASH_ONLY") return false;
      if (command.allowedChannels.length > 0 && !command.allowedChannels.includes(channelId)) return false;
      if (command.deniedChannels.includes(channelId)) return false;
      if (command.requiredRoles.length > 0 && !command.requiredRoles.some((roleId) => roleIds.includes(roleId))) return false;
      const phrase = command.triggerPhrase?.toLowerCase();
      if (!phrase) return false;
      if (command.triggerMode === "EXACT") return lower === phrase;
      if (command.triggerMode === "STARTS_WITH") return lower.startsWith(phrase);
      return lower.includes(phrase);
    });
  }

  public createSuggestion(input: SuggestionInput): Promise<Suggestion> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("submitterId", input.submitterId);
    requireLength("content", input.content, 1, 1900);
    return this.repository.createSuggestion(input);
  }

  public updateSuggestion(input: SuggestionUpdate): Promise<Suggestion> {
    requireSnowflake("guildId", input.guildId);
    return this.repository.updateSuggestion(input);
  }

  public saveStarboard(input: StarboardConfig): Promise<StarboardConfig> {
    validateStarboard(input);
    return this.repository.saveStarboard(input);
  }

  public shouldStar(config: StarboardConfig, input: { channelId: string; authorId: string; reactorId: string; isBot: boolean; nsfw: boolean; count: number }): boolean {
    if (!config.enabled) return false;
    if (!config.allowSelfStar && input.authorId === input.reactorId) return false;
    if (!config.includeBotMessages && input.isBot) return false;
    if (config.nsfw === "BLOCK" && input.nsfw) return false;
    if (config.mode === "ALLOWLIST" && config.channels.length > 0 && !config.channels.includes(input.channelId)) return false;
    if (config.mode === "DENYLIST" && config.channels.includes(input.channelId)) return false;
    return input.count >= config.threshold;
  }

  public upsertStarboardEntry(input: StarboardEntryInput): Promise<StarboardEntry> {
    requireSnowflake("guildId", input.guildId);
    requireSnowflake("sourceChannelId", input.sourceChannelId);
    requireSnowflake("sourceMessageId", input.sourceMessageId);
    return this.repository.upsertStarboardEntry(input);
  }

  public markStarboardEntryDeleted(guildId: string, sourceMessageId: string): Promise<void> {
    requireSnowflake("guildId", guildId);
    requireSnowflake("sourceMessageId", sourceMessageId);
    return this.repository.markStarboardEntryDeleted(guildId, sourceMessageId);
  }
}

export function renderPlaceholders(template: string, context: PlaceholderContext): string {
  return template
    .replaceAll("{user}", context.user)
    .replaceAll("{username}", context.username)
    .replaceAll("{displayName}", context.displayName)
    .replaceAll("{userId}", context.userId)
    .replaceAll("{server}", context.server)
    .replaceAll("{memberCount}", String(context.memberCount))
    .replaceAll("{joinedAt}", context.joinedAt.toISOString());
}

export function renderCounter(template: string, value: number): string {
  return template.replaceAll("{count}", String(value));
}

function renderOptional(value: string | undefined, context: PlaceholderContext): string | undefined {
  return value === undefined ? undefined : renderPlaceholders(value, context);
}

function compactEmbed(input: RenderedEmbed): RenderedEmbed {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== "")) as RenderedEmbed;
}

function optionalEmbed(input: {
  readonly title?: string | undefined;
  readonly description?: string | undefined;
  readonly color?: number | undefined;
  readonly thumbnailUrl?: string | undefined;
  readonly imageUrl?: string | undefined;
  readonly footer?: string | undefined;
  readonly fields?: readonly EmbedField[] | undefined;
  readonly timestamp?: boolean | undefined;
}): RenderedEmbed {
  return compactEmbed(input as RenderedEmbed);
}

function validateWelcomeGoodbye(input: WelcomeGoodbyeConfig): void {
  requireSnowflake("guildId", input.guildId);
  requireSnowflake("channelId", input.channelId);
  if (input.roleMentionId) requireRoleId(input.roleMentionId);
  requireLength("messageText", input.messageText, 1, 1900);
  if (input.embedTitle) requireLength("embedTitle", input.embedTitle, 1, 256);
  if (input.embedDescription) requireLength("embedDescription", input.embedDescription, 1, 4000);
  if (input.embedColor && !hexColor.test(input.embedColor)) invalid("embedColor must be a hex color.");
  if (input.deleteAfterSeconds !== undefined && input.deleteAfterSeconds < 1) invalid("deleteAfterSeconds must be positive.");
}

function validateAutoroles(input: AutoroleConfig): void {
  requireSnowflake("guildId", input.guildId);
  if (input.delaySeconds < 0 || input.delaySeconds > 86400) invalid("delaySeconds must be between 0 and 86400.");
  for (const role of input.roles) requireRoleId(role.roleId);
}

function validateRules(input: RulesConfig): void {
  requireSnowflake("guildId", input.guildId);
  requireSnowflake("channelId", input.channelId);
  requireRoleId(input.acceptedRoleId);
  if (input.pendingRoleId) requireRoleId(input.pendingRoleId);
  requireLength("messageText", input.messageText, 1, 4000);
  requireLength("buttonLabel", input.buttonLabel, 1, 80);
}

function validateCounter(input: CounterInput): void {
  requireSnowflake("guildId", input.guildId);
  requireSnowflake("channelId", input.channelId);
  requireLength("labelTemplate", input.labelTemplate, 1, 100);
  if (input.type === "ROLE" && !input.roleId) invalid("roleId is required for role counters.");
  if (input.roleId) requireRoleId(input.roleId);
  if (input.intervalSeconds < 60 || input.intervalSeconds > 86400) invalid("intervalSeconds must be between 60 and 86400.");
}

function validateLogs(input: ServerLogConfig): void {
  requireSnowflake("guildId", input.guildId);
  for (const channelId of Object.values(input.destinations)) requireSnowflake("destination channel", channelId);
}

function validateEmbed(input: EmbedTemplateInput): void {
  requireSnowflake("guildId", input.guildId);
  requireLength("name", input.name, 1, 80);
  if (input.title) requireLength("title", input.title, 1, 256);
  if (input.description) requireLength("description", input.description, 1, 4000);
  if (input.color && !hexColor.test(input.color)) invalid("color must be a hex color.");
  if (input.fields.length > 25) invalid("Embeds cannot contain more than 25 fields.");
  for (const roleId of input.allowedRoleMentions) requireRoleId(roleId);
}

function validateCustom(input: CustomCommandInput): void {
  requireSnowflake("guildId", input.guildId);
  requireLength("name", normalizeCommandName(input.name), 1, 32);
  requireLength("description", input.description, 1, 100);
  requireLength("responseText", input.responseText, 1, 1900);
  if (input.cooldownSeconds < 0 || input.cooldownSeconds > 86400) invalid("cooldownSeconds must be between 0 and 86400.");
  if (input.triggerMode !== "SLASH_ONLY" && !input.triggerPhrase) invalid("triggerPhrase is required for message triggers.");
}

function validateStarboard(input: StarboardConfig): void {
  requireSnowflake("guildId", input.guildId);
  requireSnowflake("destinationChannelId", input.destinationChannelId);
  if (input.threshold < 1 || input.threshold > 1000) invalid("threshold must be between 1 and 1000.");
}

function normalizeCommandName(name: string): string {
  return name.trim().toLowerCase().replaceAll(/\s+/g, "-");
}

function parseColor(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const normalized = value.startsWith("#") ? value.slice(1) : value;
  return Number.parseInt(normalized, 16);
}

function requireSnowflake(name: string, value: string): void {
  if (!snowflake.test(value)) invalid(`${name} must be a Discord snowflake.`);
}

function requireRoleId(value: string): void {
  if (value === "0") invalid("@everyone cannot be configured as a managed role.");
  requireSnowflake("roleId", value);
}

function requireLength(name: string, value: string, min: number, max: number): void {
  if (value.length < min || value.length > max) invalid(`${name} length must be between ${min} and ${max}.`);
}

function invalid(message: string): never {
  throw new CommunityFeatureError("INVALID_INPUT", message);
}

function unavailable(): CommunityFeatureError {
  return new CommunityFeatureError("DEPENDENCY_UNAVAILABLE", "Discord gateway is not configured.");
}

import { type MessageTemplates, type OutgoingMessage } from "@qbox/shared/messages";
export type CommunityFeature = "welcome" | "goodbye" | "autoroles" | "rules" | "counters" | "logs" | "embeds" | "customCommands" | "suggestions" | "starboard";
export type WelcomeGoodbyeKind = "WELCOME" | "GOODBYE";
export type CounterType = "TOTAL_MEMBERS" | "HUMANS" | "BOTS" | "ONLINE" | "ROLE";
export type SuggestionStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "DENIED" | "IMPLEMENTED";
export type TriggerMode = "SLASH_ONLY" | "EXACT" | "STARTS_WITH" | "CONTAINS";
export type CommunityOperationSource = "DISCORD" | "WEB" | "SYSTEM";
/** Server log event keys. `destinations` may map each key, or `all`, to a channel. */
export declare const LOG_EVENTS: readonly ["memberJoin", "memberLeave", "messageDelete", "messageEdit", "roleChange", "nicknameChange", "voice", "ban"];
export type LogEvent = (typeof LOG_EVENTS)[number];
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
    /** Posts a rendered message (`community.welcome`, `community.goodbye`). */
    postMessage(input: CommunityPostMessage): Promise<CommunitySentMessage>;
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
    /** Member avatar for embed thumbnails. */
    readonly avatarUrl?: string | undefined;
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
export interface EmbedTemplate extends Required<Pick<EmbedTemplateInput, "id">>, Omit<EmbedTemplateInput, "id"> {
}
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
export interface CustomCommand extends CustomCommandInput {
}
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
export interface CommunityPostMessage {
    readonly guildId: string;
    readonly channelId: string;
    readonly message: OutgoingMessage;
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
export declare class CommunityFeatureError extends Error {
    readonly code: "INVALID_INPUT" | "NOT_FOUND" | "DISABLED" | "FORBIDDEN" | "DEPENDENCY_UNAVAILABLE" | "CONFLICT";
    readonly details?: Readonly<Record<string, string | number>> | undefined;
    constructor(code: "INVALID_INPUT" | "NOT_FOUND" | "DISABLED" | "FORBIDDEN" | "DEPENDENCY_UNAVAILABLE" | "CONFLICT", message: string, details?: Readonly<Record<string, string | number>> | undefined);
}
export declare class DiscordCommunityService {
    private readonly repository;
    private readonly gateway?;
    private readonly templates;
    constructor(repository: CommunityRepository, gateway?: DiscordCommunityGateway | undefined, templates?: MessageTemplates);
    settings(guildId: string): Promise<CommunitySettings>;
    saveWelcomeGoodbye(input: WelcomeGoodbyeConfig): Promise<WelcomeGoodbyeConfig>;
    renderWelcomeGoodbye(config: WelcomeGoodbyeConfig, context: PlaceholderContext): CommunitySendMessage;
    deliverWelcomeGoodbye(kind: WelcomeGoodbyeKind, guildId: string, context: PlaceholderContext): Promise<CommunitySentMessage | undefined>;
    saveAutoroles(input: AutoroleConfig): Promise<AutoroleConfig>;
    addAutorole(input: AutoroleRuleInput): Promise<AutoroleRule>;
    removeAutorole(guildId: string, roleId: string): Promise<void>;
    applyAutoroles(guildId: string, memberId: string, isBot: boolean): Promise<readonly CommunityRoleMutationResult[]>;
    saveRules(input: RulesConfig): Promise<RulesConfig>;
    acceptRules(guildId: string, memberId: string): Promise<readonly CommunityRoleMutationResult[]>;
    saveCounter(input: CounterInput): Promise<CounterConfig>;
    refreshCounter(counter: CounterConfig): Promise<number>;
    deleteCounter(guildId: string, id: string): Promise<void>;
    saveLogs(input: ServerLogConfig): Promise<ServerLogConfig>;
    /** Posts a server log entry when logging is on for this event and nothing is ignored. */
    deliverLog(input: LogDelivery): Promise<CommunitySentMessage | undefined>;
    saveEmbedTemplate(input: EmbedTemplateInput): Promise<EmbedTemplate>;
    deleteEmbedTemplate(guildId: string, id: string): Promise<void>;
    renderEmbed(template: EmbedTemplateInput): CommunitySendMessage;
    sendEmbedTemplate(guildId: string, name: string, channelId: string): Promise<CommunitySentMessage>;
    sendAnnouncement(input: {
        readonly guildId: string;
        readonly channelId: string;
        readonly content: string;
    }): Promise<CommunitySentMessage>;
    saveCustomCommand(input: CustomCommandInput): Promise<CustomCommand>;
    deleteCustomCommand(guildId: string, name: string): Promise<void>;
    matchCustomCommand(commands: readonly CustomCommand[], content: string, channelId: string, roleIds: readonly string[]): CustomCommand | undefined;
    createSuggestion(input: SuggestionInput): Promise<Suggestion>;
    updateSuggestion(input: SuggestionUpdate): Promise<Suggestion>;
    saveStarboard(input: StarboardConfig): Promise<StarboardConfig>;
    shouldStar(config: StarboardConfig, input: {
        channelId: string;
        authorId: string;
        reactorId: string;
        isBot: boolean;
        nsfw: boolean;
        count: number;
    }): boolean;
    upsertStarboardEntry(input: StarboardEntryInput): Promise<StarboardEntry>;
    markStarboardEntryDeleted(guildId: string, sourceMessageId: string): Promise<void>;
}
export declare function renderPlaceholders(template: string, context: PlaceholderContext): string;
export declare function renderCounter(template: string, value: number): string;
//# sourceMappingURL=index.d.ts.map
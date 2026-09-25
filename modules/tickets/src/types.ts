/** Where ticket conversations live in Discord. */
export type TicketMode = "CHANNEL" | "THREAD";
/** Lifecycle status of one ticket. `PENDING` means waiting on the requester. */
export type TicketStatus = "OPEN" | "CLAIMED" | "PENDING" | "CLOSED";
export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type TicketPanelStyle = "BUTTONS" | "SELECT_MENU";
export type TicketMessageSource = "DISCORD" | "WEB" | "SYSTEM";
/** What happens to a ticket channel after it closes. */
export type TicketCloseAction = "ARCHIVE" | "DELETE";
export type TicketButtonStyle = "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER";
export type TicketOperationSource = "DISCORD" | "WEB" | "SYSTEM";

export const TICKET_STATUSES: readonly TicketStatus[] = ["OPEN", "CLAIMED", "PENDING", "CLOSED"];
export const TICKET_PRIORITIES: readonly TicketPriority[] = ["LOW", "NORMAL", "HIGH", "URGENT"];
export const TICKET_BUTTON_STYLES: readonly TicketButtonStyle[] = ["PRIMARY", "SECONDARY", "SUCCESS", "DANGER"];

/** Guild-wide ticket configuration. */
export interface TicketSettings {
  readonly guildId: string;
  readonly enabled: boolean;
  readonly mode: TicketMode;
  /** Discord category that new ticket channels are created under. */
  readonly openCategoryChannelId?: string | undefined;
  /** Discord category that closed ticket channels move to (archive mode). */
  readonly closedCategoryChannelId?: string | undefined;
  /** Text channel that private ticket threads are created in (thread mode). */
  readonly threadParentChannelId?: string | undefined;
  readonly transcriptChannelId?: string | undefined;
  readonly logChannelId?: string | undefined;
  readonly supportRoleIds: readonly string[];
  readonly pingSupportOnOpen: boolean;
  readonly maxOpenPerUser: number;
  readonly nameTemplate: string;
  readonly openMessage: string;
  readonly embedColor: string;
  readonly allowUserClose: boolean;
  readonly requireCloseReason: boolean;
  readonly closeConfirmation: boolean;
  readonly closeAction: TicketCloseAction;
  readonly deleteDelaySeconds: number;
  readonly claimEnabled: boolean;
  /** When a ticket is claimed, other support staff lose send access. */
  readonly claimRestrictsReplies: boolean;
  readonly transcriptsEnabled: boolean;
  readonly transcriptDmUser: boolean;
  readonly feedbackEnabled: boolean;
  /** Close tickets with no activity for this many hours. `0` disables. */
  readonly autoCloseHours: number;
  /** Warn this many hours before auto-close. `0` disables the warning. */
  readonly autoCloseWarningHours: number;
  readonly autoCloseExcludeClaimed: boolean;
  readonly blockedUserIds: readonly string[];
  readonly blockedRoleIds: readonly string[];
  readonly nextNumber: number;
  readonly revision: number;
}

/** Settings update. `expectedRevision` enables optimistic concurrency. */
export interface TicketSettingsInput extends Omit<TicketSettings, "nextNumber" | "revision"> {
  readonly expectedRevision?: number | undefined;
  readonly source: TicketOperationSource;
}

/** One question asked in the ticket-open form (Discord modal, max 5). */
export interface TicketQuestion {
  readonly id: string;
  readonly label: string;
  readonly placeholder?: string | undefined;
  readonly style: "SHORT" | "PARAGRAPH";
  readonly required: boolean;
  readonly minLength?: number | undefined;
  readonly maxLength?: number | undefined;
}

/** A ticket type such as "General Support" or "Ban Appeal". */
export interface TicketCategory {
  readonly id: string;
  readonly guildId: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly emoji?: string | undefined;
  readonly buttonStyle: TicketButtonStyle;
  readonly enabled: boolean;
  readonly position: number;
  /** Extra support roles for this category, added to the global roles. */
  readonly supportRoleIds: readonly string[];
  /** Members who get access to and are pinged on every ticket of this type. */
  readonly alertUserIds: readonly string[];
  /** Overrides the Discord category (channel mode) or parent channel (thread mode). */
  readonly parentChannelId?: string | undefined;
  readonly nameTemplate?: string | undefined;
  readonly openMessage?: string | undefined;
  readonly defaultPriority: TicketPriority;
  readonly questions: readonly TicketQuestion[];
  /** Members need one of these roles to open this category. Empty means everyone. */
  readonly requiredRoleIds: readonly string[];
  readonly maxOpenPerUser?: number | undefined;
}

export interface TicketCategoryInput extends Omit<TicketCategory, "id" | "position"> {
  readonly id?: string | undefined;
  readonly position?: number | undefined;
}

/** A message with buttons or a select menu that members use to open tickets. */
export interface TicketPanel {
  readonly id: string;
  readonly guildId: string;
  readonly name: string;
  readonly channelId: string;
  readonly messageId?: string | undefined;
  readonly title: string;
  readonly description: string;
  readonly color: string;
  readonly style: TicketPanelStyle;
  readonly placeholder: string;
  readonly imageUrl?: string | undefined;
  readonly footer?: string | undefined;
  /** Categories offered by this panel, in display order. Empty means all enabled. */
  readonly categoryIds: readonly string[];
  readonly publishedAt?: Date | undefined;
}

export interface TicketPanelInput extends Omit<TicketPanel, "id" | "messageId" | "publishedAt"> {
  readonly id?: string | undefined;
}

export interface TicketAnswer {
  readonly question: string;
  readonly answer: string;
}

export interface Ticket {
  readonly id: string;
  readonly guildId: string;
  /** Server-wide ticket number. */
  readonly number: number;
  readonly categoryId?: string | undefined;
  readonly categoryName?: string | undefined;
  /** Number within the ticket's reason: the fifth "Donations" ticket is 5. */
  readonly categoryNumber?: number | undefined;
  readonly openerId: string;
  readonly openerName: string;
  readonly channelId?: string | undefined;
  readonly subject?: string | undefined;
  readonly answers: readonly TicketAnswer[];
  readonly status: TicketStatus;
  readonly priority: TicketPriority;
  readonly claimedById?: string | undefined;
  readonly participantIds: readonly string[];
  readonly tags: readonly string[];
  readonly closedById?: string | undefined;
  readonly closeReason?: string | undefined;
  readonly rating?: number | undefined;
  readonly feedback?: string | undefined;
  readonly transcriptMessageId?: string | undefined;
  readonly autoCloseWarnedAt?: Date | undefined;
  readonly firstResponseAt?: Date | undefined;
  readonly lastActivityAt: Date;
  readonly closedAt?: Date | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TicketCreateData {
  readonly guildId: string;
  readonly number: number;
  readonly categoryId?: string | undefined;
  readonly categoryNumber?: number | undefined;
  readonly openerId: string;
  readonly openerName: string;
  readonly subject?: string | undefined;
  readonly answers: readonly TicketAnswer[];
  readonly priority: TicketPriority;
}

/** Fields a repository update may change. `null` clears an optional field. */
export interface TicketPatch {
  readonly channelId?: string | null;
  readonly status?: TicketStatus;
  readonly priority?: TicketPriority;
  readonly claimedById?: string | null;
  readonly participantIds?: readonly string[];
  readonly tags?: readonly string[];
  readonly subject?: string | null;
  readonly closedById?: string | null;
  readonly closeReason?: string | null;
  readonly rating?: number | null;
  readonly feedback?: string | null;
  readonly transcriptMessageId?: string | null;
  readonly autoCloseWarnedAt?: Date | null;
  readonly firstResponseAt?: Date | null;
  readonly lastActivityAt?: Date;
  readonly closedAt?: Date | null;
}

export interface TicketMessage {
  readonly id: string;
  readonly ticketId: string;
  readonly discordMessageId?: string | undefined;
  readonly authorId: string;
  readonly authorName: string;
  readonly content: string;
  readonly attachments: readonly string[];
  readonly source: TicketMessageSource;
  /** Internal staff notes are never sent to Discord or the requester. */
  readonly internal: boolean;
  readonly createdAt: Date;
}

export type TicketMessageInput = Omit<TicketMessage, "id" | "createdAt"> & { readonly createdAt?: Date | undefined };

export interface TicketEvent {
  readonly id: string;
  readonly ticketId: string;
  readonly action: string;
  readonly actorId: string;
  readonly source: TicketOperationSource;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
  readonly createdAt: Date;
}

export type TicketEventInput = Omit<TicketEvent, "id" | "createdAt">;

export interface TicketListFilter {
  readonly guildId: string;
  readonly statuses?: readonly TicketStatus[] | undefined;
  readonly openerId?: string | undefined;
  readonly claimedById?: string | undefined;
  readonly categoryId?: string | undefined;
  readonly priority?: TicketPriority | undefined;
  readonly search?: string | undefined;
  readonly lastActivityBefore?: Date | undefined;
  readonly limit?: number | undefined;
}

export interface TicketStats {
  readonly open: number;
  readonly claimed: number;
  readonly pending: number;
  readonly closed: number;
  readonly total: number;
  readonly averageRating?: number | undefined;
  readonly ratingCount: number;
  readonly averageFirstResponseMinutes?: number | undefined;
  readonly averageResolutionMinutes?: number | undefined;
  readonly byCategory: readonly { readonly categoryId?: string | undefined; readonly name: string; readonly open: number; readonly total: number }[];
  readonly topStaff: readonly { readonly userId: string; readonly closed: number }[];
}

/** Everything the portal needs for one ticket. */
export interface TicketDetail {
  readonly ticket: Ticket;
  readonly messages: readonly TicketMessage[];
  readonly events: readonly TicketEvent[];
}

/** Persistence port implemented by `@qbox/database`. */
export interface TicketRepository {
  getSettings(guildId: string): Promise<TicketSettings | undefined>;
  saveSettings(input: TicketSettingsInput): Promise<TicketSettings>;
  /** Atomically returns the next ticket number and increments the counter. */
  allocateNumber(guildId: string): Promise<number>;
  /** Atomically returns the next number for one reason and increments that reason's counter. */
  allocateCategoryNumber(guildId: string, categoryId: string): Promise<number>;
  listCategories(guildId: string): Promise<readonly TicketCategory[]>;
  saveCategory(input: TicketCategoryInput): Promise<TicketCategory>;
  deleteCategory(guildId: string, id: string): Promise<void>;
  listPanels(guildId: string): Promise<readonly TicketPanel[]>;
  savePanel(input: TicketPanelInput): Promise<TicketPanel>;
  markPanelPublished(guildId: string, id: string, messageId: string): Promise<TicketPanel>;
  deletePanel(guildId: string, id: string): Promise<void>;
  createTicket(input: TicketCreateData): Promise<Ticket>;
  getTicket(id: string): Promise<Ticket | undefined>;
  findTicketByChannel(channelId: string): Promise<Ticket | undefined>;
  findTicketByNumber(guildId: string, number: number): Promise<Ticket | undefined>;
  listTickets(filter: TicketListFilter): Promise<readonly Ticket[]>;
  countActiveTickets(guildId: string, openerId: string, categoryId?: string): Promise<number>;
  updateTicket(id: string, patch: TicketPatch): Promise<Ticket>;
  addMessage(input: TicketMessageInput): Promise<TicketMessage>;
  listMessages(ticketId: string): Promise<readonly TicketMessage[]>;
  addEvent(input: TicketEventInput): Promise<TicketEvent>;
  listEvents(ticketId: string): Promise<readonly TicketEvent[]>;
  /** Guild IDs whose ticket settings enable auto-close. */
  listAutoCloseGuilds(): Promise<readonly string[]>;
  stats(guildId: string): Promise<TicketStats>;
}

export interface TicketSpaceInput {
  readonly guildId: string;
  readonly mode: TicketMode;
  /** Discord category (channel mode) or parent text channel (thread mode). */
  readonly parentChannelId?: string | undefined;
  readonly name: string;
  readonly openerId: string;
  readonly supportRoleIds: readonly string[];
  /** Individual members given access in addition to the opener and support roles. */
  readonly memberIds: readonly string[];
  readonly topic: string;
}

export interface TicketOpeningMessage {
  readonly channelId: string;
  readonly ticket: Ticket;
  readonly title: string;
  readonly body: string;
  readonly color: string;
  readonly mentionUserIds: readonly string[];
  readonly mentionRoleIds: readonly string[];
  readonly claimButton: boolean;
}

export interface TicketNotice {
  readonly channelId: string;
  readonly content: string;
  readonly color?: string | undefined;
  readonly title?: string | undefined;
  /** Adds reopen/delete/transcript buttons shown after closing. */
  readonly closedControlsTicketId?: string | undefined;
}

export interface TicketAccessInput {
  readonly guildId: string;
  readonly channelId: string;
  readonly mode: TicketMode;
  /** Role targets only apply in channel mode; threads have no role overwrites. */
  readonly targetType: "USER" | "ROLE";
  readonly targetId: string;
  readonly access: "FULL" | "READ_ONLY" | "NONE";
}

export interface TicketCloseSpaceInput {
  readonly guildId: string;
  readonly channelId: string;
  readonly mode: TicketMode;
  readonly action: TicketCloseAction;
  readonly closedParentChannelId?: string | undefined;
  readonly deleteDelaySeconds: number;
}

export interface TicketReopenSpaceInput {
  readonly guildId: string;
  readonly channelId: string;
  readonly mode: TicketMode;
  readonly openParentChannelId?: string | undefined;
}

export interface TicketPanelPublishInput {
  readonly panel: TicketPanel;
  readonly categories: readonly TicketCategory[];
}

export interface TicketTranscriptFile {
  readonly fileName: string;
  readonly content: string;
}

export interface TicketTranscriptPost {
  readonly channelId: string;
  readonly ticket: Ticket;
  readonly summary: string;
  readonly file: TicketTranscriptFile;
}

export interface TicketDirectMessage {
  readonly userId: string;
  readonly content: string;
  readonly file?: TicketTranscriptFile | undefined;
  /** Adds 1-5 star rating buttons for this ticket. */
  readonly feedbackTicketId?: string | undefined;
}

/** Discord operations the ticket service needs. */
export interface TicketDiscordGateway {
  createTicketSpace(input: TicketSpaceInput): Promise<{ readonly channelId: string }>;
  postOpening(input: TicketOpeningMessage): Promise<void>;
  postNotice(input: TicketNotice): Promise<{ readonly messageId: string }>;
  setAccess(input: TicketAccessInput): Promise<void>;
  closeSpace(input: TicketCloseSpaceInput): Promise<void>;
  reopenSpace(input: TicketReopenSpaceInput): Promise<void>;
  deleteSpace(channelId: string, delaySeconds: number): Promise<void>;
  renameSpace(channelId: string, name: string): Promise<void>;
  publishPanel(input: TicketPanelPublishInput): Promise<{ readonly messageId: string }>;
  deletePanelMessage(channelId: string, messageId: string): Promise<void>;
  postTranscript(input: TicketTranscriptPost): Promise<{ readonly messageId: string }>;
  directMessage(input: TicketDirectMessage): Promise<boolean>;
}

/** Who is acting on a ticket, as seen by the service. */
export interface TicketActor {
  readonly userId: string;
  readonly displayName: string;
  readonly roleIds: readonly string[];
  /** True for Discord administrators and holders of the `tickets.handle` permission. */
  readonly elevated: boolean;
  readonly source: TicketOperationSource;
}

export type PollStatus = "OPEN" | "CLOSED";
/** LIVE shows counts while voting; AFTER_CLOSE hides them until the poll closes. */
export type PollResultsVisibility = "LIVE" | "AFTER_CLOSE";
export declare const MIN_POLL_OPTIONS = 2;
export declare const MAX_POLL_OPTIONS = 10;
/** Longest poll (90 days). */
export declare const MAX_POLL_MINUTES = 129600;
/** Custom ID prefixes for poll message components. */
export declare const POLL_CUSTOM_ID: {
    readonly vote: "qbox:polls:vote:";
    readonly select: "qbox:polls:select:";
    readonly clear: "qbox:polls:clear:";
};
export interface PollOption {
    /** Stable option ID ("1" to "10"). */
    readonly id: string;
    readonly label: string;
    readonly emoji?: string | undefined;
}
export interface Poll {
    readonly id: string;
    readonly guildId: string;
    readonly number: number;
    readonly question: string;
    readonly options: readonly PollOption[];
    /** 1 for single choice. */
    readonly maxChoices: number;
    /** Hide who voted for what. */
    readonly anonymous: boolean;
    readonly resultsVisibility: PollResultsVisibility;
    readonly allowVoteChange: boolean;
    /** Only members with one of these roles can vote. Empty means everyone. */
    readonly allowedRoleIds: readonly string[];
    readonly channelId: string;
    readonly messageId?: string | undefined;
    readonly pingRoleId?: string | undefined;
    readonly endsAt?: Date | undefined;
    readonly status: PollStatus;
    readonly createdById: string;
    readonly createdByName: string;
    readonly closedAt?: Date | undefined;
    readonly closedById?: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface PollCreateData {
    readonly guildId: string;
    readonly number: number;
    readonly question: string;
    readonly options: readonly PollOption[];
    readonly maxChoices: number;
    readonly anonymous: boolean;
    readonly resultsVisibility: PollResultsVisibility;
    readonly allowVoteChange: boolean;
    readonly allowedRoleIds: readonly string[];
    readonly channelId: string;
    readonly pingRoleId?: string | undefined;
    readonly endsAt?: Date | undefined;
    readonly createdById: string;
    readonly createdByName: string;
}
export interface PollPatch {
    readonly messageId?: string | null;
    readonly status?: PollStatus;
    readonly endsAt?: Date | null;
    readonly closedAt?: Date | null;
    readonly closedById?: string | null;
}
export interface PollVote {
    readonly pollId: string;
    readonly userId: string;
    readonly userName: string;
    readonly optionIds: readonly string[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export interface PollFilter {
    readonly guildId: string;
    readonly status?: PollStatus | undefined;
    readonly limit?: number | undefined;
}
export interface PollRepository {
    /** Atomically returns the next poll number for the guild. */
    allocateNumber(guildId: string): Promise<number>;
    create(data: PollCreateData): Promise<Poll>;
    get(guildId: string, id: string): Promise<Poll | undefined>;
    /** Looks a poll up by ID in any guild (used by background refreshes). */
    findById(id: string): Promise<Poll | undefined>;
    getByNumber(guildId: string, number: number): Promise<Poll | undefined>;
    list(filter: PollFilter): Promise<readonly Poll[]>;
    update(id: string, patch: PollPatch): Promise<Poll>;
    delete(id: string): Promise<void>;
    /** Open polls whose end time has passed, across all guilds. */
    listEnded(now: Date): Promise<readonly Poll[]>;
    getVote(pollId: string, userId: string): Promise<PollVote | undefined>;
    saveVote(pollId: string, userId: string, userName: string, optionIds: readonly string[]): Promise<PollVote>;
    /** True when a vote was removed. */
    deleteVote(pollId: string, userId: string): Promise<boolean>;
    listVotes(pollId: string): Promise<readonly PollVote[]>;
    /** Number of voters per poll. */
    countVoters(pollIds: readonly string[]): Promise<ReadonlyMap<string, number>>;
}
export interface PollTally {
    readonly voters: number;
    readonly counts: Readonly<Record<string, number>>;
}
export interface PollResults extends PollTally {
    readonly poll: Poll;
    /** Voters per option; empty for anonymous polls. */
    readonly votersByOption: Readonly<Record<string, readonly {
        readonly userId: string;
        readonly userName: string;
    }[]>>;
}
export interface PollSummary extends Poll {
    readonly voterCount: number;
}
export interface PollButton {
    readonly customId: string;
    readonly label: string;
    readonly emoji?: string | undefined;
    readonly style: "PRIMARY" | "SECONDARY" | "DANGER";
}
export interface PollSelect {
    readonly customId: string;
    readonly placeholder: string;
    readonly maxValues: number;
    readonly options: readonly {
        readonly value: string;
        readonly label: string;
        readonly emoji?: string | undefined;
    }[];
}
/** A rendered poll message; the gateway turns it into a Discord message. */
export interface PollMessage {
    readonly content?: string | undefined;
    /** Role IDs allowed to be pinged by `content`. */
    readonly mentionRoleIds: readonly string[];
    readonly embed: {
        readonly title: string;
        readonly description: string;
        readonly color: string;
        readonly fields: readonly {
            readonly name: string;
            readonly value: string;
            readonly inline?: boolean;
        }[];
        readonly footer?: string | undefined;
    };
    readonly buttonRows: readonly (readonly PollButton[])[];
    readonly select?: PollSelect | undefined;
}
/** Discord operations polls need. */
export interface PollGateway {
    postMessage(channelId: string, message: PollMessage, replyToMessageId?: string): Promise<{
        readonly messageId: string;
    }>;
    editMessage(channelId: string, messageId: string, message: PollMessage): Promise<void>;
    deleteMessage(channelId: string, messageId: string): Promise<void>;
}
/** Who creates or manages a poll. Permission checks happen before the service is called. */
export interface PollActor {
    readonly userId: string;
    readonly displayName: string;
    /** Holds polls.manage (or is a Discord administrator). */
    readonly canManage: boolean;
}
export interface PollVoter {
    readonly userId: string;
    readonly displayName: string;
    readonly roleIds: readonly string[];
}
export interface PollCreateInput {
    readonly guildId: string;
    readonly question: string;
    readonly options: readonly {
        readonly label: string;
        readonly emoji?: string | undefined;
    }[];
    readonly maxChoices?: number | undefined;
    readonly anonymous?: boolean | undefined;
    readonly resultsVisibility?: PollResultsVisibility | undefined;
    readonly allowVoteChange?: boolean | undefined;
    readonly allowedRoleIds?: readonly string[] | undefined;
    readonly channelId: string;
    readonly pingRoleId?: string | undefined;
    /** Either an end time or a duration; neither means the poll stays open until closed. */
    readonly endsAt?: Date | undefined;
    readonly durationMinutes?: number | undefined;
}
//# sourceMappingURL=types.d.ts.map
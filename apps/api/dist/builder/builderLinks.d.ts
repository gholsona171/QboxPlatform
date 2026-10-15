import type { ApplicationService } from "@qbox/applications";
import type { BirthdayService } from "@qbox/birthdays";
import { type DiscordCommunityService } from "@qbox/discord-community";
import type { FivemService } from "@qbox/fivem";
import type { LevelService } from "@qbox/levels";
import type { ModerationService } from "@qbox/moderation";
import { type BuilderLink, type BuilderLinkPort, type BuilderResolvedIds } from "@qbox/server-builder";
import type { StaffService } from "@qbox/staff";
import { type TicketService } from "@qbox/tickets";
import type { VerificationService } from "@qbox/verification";
import type { VoiceRoomService } from "@qbox/voice-rooms";
/** The feature services a build can connect, built with the same repositories as their API features. */
export interface BuilderLinkServices {
    readonly moderation: ModerationService;
    readonly verification: VerificationService;
    readonly tickets: TicketService;
    readonly applications: ApplicationService;
    readonly staff: StaffService;
    readonly levels: LevelService;
    readonly birthdays: BirthdayService;
    readonly fivem: FivemService;
    readonly voice: VoiceRoomService;
    readonly community: DiscordCommunityService;
}
export interface BuilderLinkOptions {
    /**
     * IDs of every channel and category the server has right now (after the
     * build). Used to repair settings and panels that still point at channels
     * deleted before a rebuild. Without it, only a failed panel post reveals a
     * deleted channel.
     */
    readonly listChannels?: ((guildId: string) => Promise<readonly string[]>) | undefined;
}
/**
 * Saves a finished build into existing Qbox features. Each link loads the
 * feature's current settings and saves them back with only the builder's
 * changes, so everything else the owner configured is kept. Nothing is deleted.
 * Settings and panels that point at channels which no longer exist (the owner
 * deleted everything and rebuilt) are moved to the newly built equivalents, or
 * cleared when the build made none.
 */
export declare class ServiceBuilderLinks implements BuilderLinkPort {
    private readonly services;
    private readonly options;
    constructor(services: BuilderLinkServices, options?: BuilderLinkOptions);
    /** Asks Discord which channels exist; unknown when it cannot be asked. */
    private channelCheck;
    apply(link: BuilderLink, ids: BuilderResolvedIds): Promise<string>;
    private moderation;
    private verification;
    private tickets;
    /**
     * Makes sure the built panel channel has a posted ticket panel: creates one
     * when there are none, posts a panel that was never posted, or moves the first
     * panel whose channel was deleted to the new channel and posts it there.
     */
    private ticketPanel;
    /**
     * Without a channel list, re-posts each posted panel outside the new panel
     * channel until one fails because its channel is gone; that one is moved.
     */
    private probeTicketPanels;
    private applications;
    private staff;
    private levels;
    private birthdays;
    private fivem;
    private voiceRooms;
    private welcome;
    private serverLogs;
    private starboard;
    private rules;
    private required;
}
//# sourceMappingURL=builderLinks.d.ts.map
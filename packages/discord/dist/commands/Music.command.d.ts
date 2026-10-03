import { type APIEmbed, type ChatInputCommandInteraction, type MessageComponentInteraction } from "discord.js";
import { type MusicActor, type MusicController, type MusicService, type MusicStateSnapshot } from "@qbox/music";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/**
 * `/music` - play uploaded songs, playlists, direct links and internet radio
 * in voice. Managers (music.manage), DJs (music.dj or a DJ role), or anyone
 * when no DJ roles are set can control it; non-managers must be in the bot's
 * voice channel.
 */
export declare class MusicCommand implements DiscordCommand {
    private readonly controller?;
    private readonly music?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(controller?: MusicController | undefined, music?: MusicService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
    private parse;
}
/** Who ran an interaction, with their music permissions and roles. */
export declare function musicActor(authorizer: PermissionAuthorizer, interaction: ChatInputCommandInteraction | MessageComponentInteraction): Promise<MusicActor>;
/** The queue as an embed, 10 songs a page, opening on the page with the current song. */
export declare function queueEmbed(state: MusicStateSnapshot, page: number | undefined): APIEmbed;
export declare const command: MusicCommand;
//# sourceMappingURL=Music.command.d.ts.map
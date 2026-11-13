import type { SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import type { DiscordCommunityService } from "@qbox/discord-community";
import type { Permission } from "@qbox/permissions";
import type { CommandExecutionContext, DiscordCommand } from "./DiscordCommand.js";
export declare abstract class CommunityCommand implements DiscordCommand {
    protected readonly community?: DiscordCommunityService | undefined;
    readonly type: "chat-input";
    abstract readonly data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    readonly policy: {
        contexts: "guild";
        permissions: {
            required: ("platform.owner" | "platform.admin" | "moderation.warn" | "moderation.kick" | "moderation.ban" | "moderation.timeout" | "moderation.messages" | "moderation.view" | "moderation.manage" | "tickets.manage" | "tickets.handle" | "applications.review" | "applications.manage" | "staff.manage" | "staff.view" | "staff.shifts" | "knowledge.manage" | "fivem.manage" | "streams.manage" | "games.manage" | "music.manage" | "music.dj" | "discord.roles.manage" | "discord.roles.administrator" | "discord.role-menus.manage" | "discord.welcome.manage" | "discord.autoroles.manage" | "discord.rules.manage" | "discord.counters.manage" | "discord.logs.manage" | "discord.embeds.manage" | "discord.custom-commands.manage" | "discord.suggestions.manage" | "discord.starboard.manage" | "verification.manage" | "verification.members" | "polls.create" | "polls.manage" | "giveaways.manage" | "birthdays.manage" | "scheduled.manage" | "levels.manage" | "voice.manage" | "builder.manage" | "messages.manage")[];
            mode: "all";
            administratorOverride: boolean;
        };
        response: {
            acknowledgement: "deferred";
            visibility: "ephemeral";
        };
        concurrency: "guild";
    };
    protected constructor(permission: Permission, community?: DiscordCommunityService | undefined);
    abstract execute(context: CommandExecutionContext): Promise<void>;
    protected service(): DiscordCommunityService;
    protected guildId(context: CommandExecutionContext): string;
}
export declare function enabledText(enabled: boolean): string;
export declare function parseColor(value: string | undefined): string | undefined;
//# sourceMappingURL=communityCommandHelpers.d.ts.map
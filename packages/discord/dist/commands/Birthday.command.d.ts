import { type Birthday, type BirthdayService } from "@qbox/birthdays";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
/** Custom ID prefixes for the birthday confirmation buttons. */
export declare const BIRTHDAY_CUSTOM_ID: {
    readonly confirm: "qbox:birthday:confirm:";
    readonly cancel: "qbox:birthday:cancel";
};
/** `/birthday` - members save their birthday; staff manage everyone's. */
export declare class BirthdayCommand implements DiscordCommand {
    private readonly birthdays?;
    private readonly authorizer?;
    readonly type: "chat-input";
    readonly policy: CommandExecutionPolicy;
    readonly data: import("discord.js").SlashCommandSubcommandsOnlyBuilder;
    constructor(birthdays?: BirthdayService | undefined, authorizer?: PermissionAuthorizer | undefined);
    bypassAuthorization(): boolean;
    execute(context: CommandExecutionContext): Promise<void>;
    private run;
}
/** "March 5, 1999 (Europe/London)". The year is left out unless `withYear`. */
export declare function birthdayText(birthday: Pick<Birthday, "month" | "day" | "year" | "timeZone">, withYear?: boolean): string;
export declare const command: BirthdayCommand;
//# sourceMappingURL=Birthday.command.d.ts.map
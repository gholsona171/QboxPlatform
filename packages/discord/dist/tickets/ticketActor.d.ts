import { type BaseInteraction } from "discord.js";
import type { PermissionAuthorizer } from "@qbox/permissions";
import type { TicketActor } from "@qbox/tickets";
/**
 * Decides whether a member is elevated for tickets: Discord administrators and
 * Manage Server holders always are; others need the `tickets.handle`
 * permission from the Qbox permission system.
 */
export declare class TicketElevation {
    private readonly authorizer;
    constructor(authorizer: PermissionAuthorizer);
    isElevated(guildId: string, userId: string, roleIds: readonly string[]): Promise<boolean>;
}
/** Builds the ticket actor for a guild interaction. */
export declare function ticketActorFromInteraction(interaction: BaseInteraction, elevation: TicketElevation): Promise<TicketActor>;
export declare function memberRoleIds(interaction: BaseInteraction): string[];
//# sourceMappingURL=ticketActor.d.ts.map
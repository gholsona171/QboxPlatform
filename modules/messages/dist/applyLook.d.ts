import { type OutgoingEmbed } from "@qbox/shared/messages";
import type { MessagesLook } from "./types.js";
export interface LookContext {
    readonly guildName: string;
    /** Used for the timestamp; defaults to now. */
    readonly now?: Date | undefined;
}
export declare function defaultLook(guildId: string): MessagesLook;
/** Whether a look changes anything at all. */
export declare function lookIsEmpty(look: MessagesLook): boolean;
/**
 * Applies a server's look to one embed. In "fill" mode only parts the embed
 * leaves empty are set; in "override" mode color, footer, and author are
 * always replaced. Thumbnail and timestamp only fill. Pure.
 */
export declare function applyLook(embed: OutgoingEmbed, look: MessagesLook, context: LookContext): OutgoingEmbed;
//# sourceMappingURL=applyLook.d.ts.map
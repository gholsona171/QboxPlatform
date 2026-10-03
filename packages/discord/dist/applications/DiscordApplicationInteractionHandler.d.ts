import { ActionRowBuilder, StringSelectMenuBuilder, type Interaction } from "discord.js";
import { type ApplicationService, type FormAvailability } from "@qbox/applications";
import { ApplicationElevation } from "./applicationActor.js";
/**
 * Handles panel buttons, the form picker, paged application forms, and the
 * accept, deny, and vote buttons on review messages.
 *
 * Answers from earlier pages are kept in memory for 30 minutes while the
 * member continues to the next page.
 */
export declare class DiscordApplicationInteractionHandler {
    private readonly applications;
    private readonly elevation;
    private readonly now;
    private readonly drafts;
    constructor(applications: ApplicationService, elevation: ApplicationElevation, now?: () => number);
    handle(interaction: Interaction): Promise<void>;
    private button;
    private select;
    /** Checks eligibility and shows the first page of the form. */
    private start;
    private continue;
    private modal;
    private decide;
    private draftKey;
    private draft;
    private fail;
}
/** Ephemeral picker listing the forms a member can apply to. */
export declare function formPicker(available: readonly FormAvailability[]): {
    content: string;
    components: ActionRowBuilder<StringSelectMenuBuilder>[];
};
//# sourceMappingURL=DiscordApplicationInteractionHandler.d.ts.map
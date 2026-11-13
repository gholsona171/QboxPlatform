import { type BaseInteraction } from "discord.js";
import type { Applicant, Reviewer } from "@qbox/applications";
import type { PermissionAuthorizer } from "@qbox/permissions";
/**
 * Decides whether a member reviews every form: Discord administrators always
 * do; others need `applications.review` or `applications.manage`.
 */
export declare class ApplicationElevation {
    private readonly authorizer;
    constructor(authorizer: PermissionAuthorizer);
    isElevated(guildId: string, userId: string, roleIds: readonly string[]): Promise<boolean>;
}
export declare function applicantFromInteraction(interaction: BaseInteraction): Applicant;
export declare function reviewerFromInteraction(interaction: BaseInteraction, elevation: ApplicationElevation): Promise<Reviewer>;
//# sourceMappingURL=applicationActor.d.ts.map
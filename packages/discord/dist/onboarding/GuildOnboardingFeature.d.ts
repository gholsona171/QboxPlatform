import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
/** Grants a server's owner every Qbox permission. Implemented with the permission bootstrap. */
export interface GuildOwnerGrant {
    ensureOwner(guildId: string, ownerId: string): Promise<{
        readonly created: boolean;
    }>;
}
/**
 * Sets a server up the moment the bot is in it: the Discord server owner
 * becomes the Qbox owner, so nobody has to grant permissions by hand. Runs
 * for every server when the bot starts and again whenever it joins one.
 */
export declare function guildOnboardingFeature(grant: GuildOwnerGrant): DiscordFeatureFactory;
//# sourceMappingURL=GuildOnboardingFeature.d.ts.map
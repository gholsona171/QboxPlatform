import { Events } from "discord.js";
import { logger } from "@qbox/logger";
import { BRAND } from "@qbox/shared/brand";
/**
 * Sets a server up the moment the bot is in it: the Discord server owner
 * becomes the Qbox owner, so nobody has to grant permissions by hand. Runs
 * for every server when the bot starts and again whenever it joins one.
 */
export function guildOnboardingFeature(grant) {
    return () => {
        const events = new GuildOnboardingEvents(grant);
        return {
            name: "guild-onboarding",
            commands: () => [],
            attach: (client) => events.attach(client),
            detach: () => events.detach(),
        };
    };
}
class GuildOnboardingEvents {
    grant;
    client;
    onReady = (client) => {
        for (const guild of client.guilds.cache.values())
            void this.onboard(guild, "startup");
    };
    onGuildCreate = (guild) => void this.onboard(guild, "joined");
    constructor(grant) {
        this.grant = grant;
    }
    attach(client) {
        this.client = client;
        client.on(Events.ClientReady, this.onReady);
        client.on(Events.GuildCreate, this.onGuildCreate);
    }
    detach() {
        this.client?.off(Events.ClientReady, this.onReady);
        this.client?.off(Events.GuildCreate, this.onGuildCreate);
        this.client = undefined;
    }
    async onboard(guild, trigger) {
        try {
            const result = await this.grant.ensureOwner(guild.id, guild.ownerId);
            if (result.created || trigger === "joined")
                logger.info({ guildId: guild.id, guildName: guild.name, ownerId: guild.ownerId, trigger }, `Server owner set up in ${BRAND.name}.`);
        }
        catch (error) {
            logger.error({ err: error, guildId: guild.id, trigger }, "Server owner setup failed.");
        }
    }
}
//# sourceMappingURL=GuildOnboardingFeature.js.map
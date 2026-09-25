import { Events, type Client, type Guild } from "discord.js";
import { logger } from "@qbox/logger";

import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
import { BRAND } from "@qbox/shared/brand";

/** Grants a server's owner every Qbox permission. Implemented with the permission bootstrap. */
export interface GuildOwnerGrant {
  ensureOwner(guildId: string, ownerId: string): Promise<{ readonly created: boolean }>;
}

/**
 * Sets a server up the moment the bot is in it: the Discord server owner
 * becomes the Qbox owner, so nobody has to grant permissions by hand. Runs
 * for every server when the bot starts and again whenever it joins one.
 */
export function guildOnboardingFeature(grant: GuildOwnerGrant): DiscordFeatureFactory {
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
  private client: Client | undefined;
  private readonly onReady = (client: Client<true>): void => {
    for (const guild of client.guilds.cache.values()) void this.onboard(guild, "startup");
  };
  private readonly onGuildCreate = (guild: Guild): void => void this.onboard(guild, "joined");

  public constructor(private readonly grant: GuildOwnerGrant) {}

  public attach(client: Client): void {
    this.client = client;
    client.on(Events.ClientReady, this.onReady);
    client.on(Events.GuildCreate, this.onGuildCreate);
  }

  public detach(): void {
    this.client?.off(Events.ClientReady, this.onReady);
    this.client?.off(Events.GuildCreate, this.onGuildCreate);
    this.client = undefined;
  }

  private async onboard(guild: Guild, trigger: "startup" | "joined"): Promise<void> {
    try {
      const result = await this.grant.ensureOwner(guild.id, guild.ownerId);
      if (result.created || trigger === "joined")
        logger.info({ guildId: guild.id, guildName: guild.name, ownerId: guild.ownerId, trigger }, `Server owner set up in ${BRAND.name}.`);
    } catch (error) {
      logger.error({ err: error, guildId: guild.id, trigger }, "Server owner setup failed.");
    }
  }
}

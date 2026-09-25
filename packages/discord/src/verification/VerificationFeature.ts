import { Events, type Client, type GuildMember, type PartialGuildMember } from "discord.js";
import { DiscordRestVerificationGateway, VerificationService, type VerificationRepository } from "@qbox/verification";
import { passthroughTemplates, type MessageTemplates } from "@qbox/shared/messages";
import { logger } from "@qbox/logger";

import { VerifyCommand } from "../commands/Verify.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
import { VerificationInteractionHandler } from "./VerificationInteractionHandler.js";

const SWEEP_INTERVAL_MS = 60_000;

/**
 * Verification: `/verify`, the panel button and forms, the unverified role and
 * account age check on join, and kicking members who stay unverified.
 */
export function verificationFeature(repository: VerificationRepository, templates: MessageTemplates = passthroughTemplates): DiscordFeatureFactory {
  return ({ client, authorizer }) => {
    const verification = new VerificationService(repository, new DiscordRestVerificationGateway(client.rest), undefined, templates);
    const interactions = new VerificationInteractionHandler(verification);
    const events = new VerificationEvents(verification);
    return {
      name: "verification",
      commands: () => [new VerifyCommand(verification, authorizer)],
      interactionPrefixes: ["qbox:verification:"],
      handleInteraction: (interaction) => interactions.handle(interaction),
      attach: (target) => events.attach(target),
      detach: () => events.detach(),
    };
  };
}

class VerificationEvents {
  private client: Client | undefined;
  private timer: ReturnType<typeof setInterval> | undefined;
  private readonly onMemberAdd = (member: GuildMember): void => void this.safe("member-join", () => this.joined(member));
  private readonly onMemberRemove = (member: GuildMember | PartialGuildMember): void => void this.safe("member-leave", () => this.verification.memberLeft(member.guild.id, member.id));

  public constructor(private readonly verification: VerificationService) {}

  public attach(client: Client): void {
    this.client = client;
    client.on(Events.GuildMemberAdd, this.onMemberAdd);
    client.on(Events.GuildMemberRemove, this.onMemberRemove);
    this.timer = setInterval(() => void this.safe("sweep", async () => {
      const result = await this.verification.sweepUnverified();
      if (result.kicked > 0) logger.info({ ...result }, "Unverified members kicked.");
    }), SWEEP_INTERVAL_MS);
    this.timer.unref?.();
  }

  public detach(): void {
    this.client?.off(Events.GuildMemberAdd, this.onMemberAdd);
    this.client?.off(Events.GuildMemberRemove, this.onMemberRemove);
    if (this.timer) clearInterval(this.timer);
    this.client = undefined;
  }

  private async joined(member: GuildMember): Promise<void> {
    if (member.user.bot) return;
    await this.verification.memberJoined(member.guild.id, { userId: member.id, displayName: member.displayName, roleIds: [...member.roles.cache.keys()] });
  }

  private async safe(operation: string, action: () => Promise<void>): Promise<void> {
    try {
      await action();
    } catch (error) {
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation }, "Discord verification event failed.");
    }
  }
}

import { SlashCommandBuilder } from "discord.js";
import { ApplicationError, type ApplicationService } from "@qbox/applications";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { applicantFromInteraction } from "../applications/applicationActor.js";
import { formPicker } from "../applications/DiscordApplicationInteractionHandler.js";

/** `/apply` - shows the forms a member can apply to. Any member can run it. */
export class ApplyCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("apply")
    .setDescription("Apply for a staff position or whitelist.");

  public constructor(private readonly applications?: ApplicationService) {}

  public bypassAuthorization(): boolean {
    return true;
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      const guildId = context.interaction.guildId;
      if (!this.applications || !guildId) throw new ApplicationError("DEPENDENCY_UNAVAILABLE", "Applications are not available right now.");
      const available = await this.applications.availability(guildId, applicantFromInteraction(context.interaction));
      await context.editReply(formPicker(available));
    } catch (error) {
      if (!(error instanceof ApplicationError)) throw error;
      await context.editReply({ content: error.message });
    }
  }
}

export const command = new ApplyCommand();

import { SlashCommandBuilder } from "discord.js";
import { BuilderError, type BuilderRunMode, type BuilderRunStatus, type BuilderService } from "@qbox/server-builder";
import type { PermissionAuthorizer } from "@qbox/permissions";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { memberHasPermission } from "../features/featureAuthorization.js";
import { toEmbedBuilder } from "../features/featureEmbeds.js";
import { BRAND } from "@qbox/shared/brand";

const STATUS: Readonly<Record<BuilderRunStatus, { readonly label: string; readonly color: string }>> = {
  QUEUED: { label: "Waiting to start", color: "#99AAB5" },
  RUNNING: { label: "Running", color: "#5865F2" },
  SUCCEEDED: { label: "Finished", color: "#57F287" },
  PARTIAL: { label: "Finished with problems", color: "#FEE75C" },
  FAILED: { label: "Failed", color: "#ED4245" },
  UNDONE: { label: "Undone", color: "#99AAB5" },
};

const MODE_LABELS: Readonly<Record<BuilderRunMode, string>> = {
  ADD: "Add to my server",
  FRESH: "Fresh layout",
  WIPE: "Wipe the server",
  WIPE_AND_BUILD: "Wipe, then build",
};

/** `/builder` - server builder status. Building happens in the portal. */
export class BuilderCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("builder")
    .setDescription("Server builder.")
    .addSubcommand((sub) => sub.setName("status").setDescription("Show the last server build."));

  public constructor(
    private readonly builder?: BuilderService,
    private readonly authorizer?: PermissionAuthorizer,
  ) {}

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof BuilderError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    const interaction = context.interaction;
    const guildId = interaction.guildId;
    if (!this.builder || !this.authorizer || !guildId) throw new BuilderError("DEPENDENCY_UNAVAILABLE", "The server builder is not available right now.");
    if (!(await memberHasPermission(this.authorizer, interaction, "builder.manage"))) {
      await context.editReply({ content: "You need the `builder.manage` permission to do that." });
      return;
    }
    const last = await this.builder.lastRun(guildId);
    if (!last) {
      await context.editReply({ content: `No builds yet. Open **Server Builder** in the ${BRAND.name} portal to plan and build your server.` });
      return;
    }
    const { run, items } = last;
    const status = STATUS[run.status];
    const problems = items.filter((item) => item.status === "FAILED").slice(0, 5).map((item) => `• ${item.name}: ${item.error ?? "failed"}`);
    const links = items.filter((item) => item.kind === "LINK" && item.status === "CREATED" && item.note).slice(0, 10).map((item) => `• ${item.note}`);
    await context.editReply({
      embeds: [toEmbedBuilder({
        title: `Server build: ${status.label}`,
        description: `${run.done} created, ${run.skipped} skipped, ${run.failed} failed of ${run.planned} planned.${run.error ? `\n${run.error}` : ""}`,
        color: status.color,
        fields: [
          { name: "Started by", value: run.startedByName, inline: true },
          { name: "Mode", value: MODE_LABELS[run.mode] ?? run.mode, inline: true },
          ...(links.length ? [{ name: "Connected features", value: links.join("\n").slice(0, 1024) }] : []),
          ...(problems.length ? [{ name: "Problems", value: problems.join("\n").slice(0, 1024) }] : []),
          ...(run.warnings.length ? [{ name: "Warnings", value: run.warnings.join("\n").slice(0, 1024) }] : []),
        ],
        footer: `Manage builds in the ${BRAND.name} portal under Server Builder.`,
        timestamp: run.createdAt,
      })],
    });
  }
}

export const command = new BuilderCommand();

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { VerificationError, type VerificationAttempt, type VerificationService } from "@qbox/verification";
import type { Permission, PermissionAuthorizer } from "@qbox/permissions";

import type { CommandExecutionContext, CommandExecutionPolicy, DiscordCommand } from "./DiscordCommand.js";
import { interactionDisplayName, memberHasPermission } from "../features/featureAuthorization.js";

/** Permission each subcommand needs. */
const SUBCOMMAND_PERMISSIONS: Readonly<Record<string, Permission>> = {
  panel: "verification.manage",
  member: "verification.members",
  unverify: "verification.members",
  status: "verification.members",
};

const RESULT_LABELS: Readonly<Record<VerificationAttempt["result"], string>> = {
  PASSED: "Passed",
  FAILED: "Failed",
  DENIED_AGE: "Denied (account too new)",
  KICKED: "Kicked",
  MANUAL: "Verified by staff",
  REVOKED: "Unverified by staff",
};

/** `/verify` - post the panel, and verify, unverify, or check members. */
export class VerifyCommand implements DiscordCommand {
  public readonly type = "chat-input" as const;
  public readonly policy: CommandExecutionPolicy = {
    contexts: "guild",
    response: { acknowledgement: "deferred", visibility: "ephemeral" },
    concurrency: "user",
  };
  public readonly data = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Member verification.")
    .addSubcommand((sub) => sub.setName("panel").setDescription("Post or update the verification panel."))
    .addSubcommand((sub) => sub.setName("member").setDescription("Verify a member yourself.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("Note for the log.").setMaxLength(500)))
    .addSubcommand((sub) => sub.setName("unverify").setDescription("Remove a member's verification.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true))
      .addStringOption((option) => option.setName("reason").setDescription("Reason.").setMaxLength(500)))
    .addSubcommand((sub) => sub.setName("status").setDescription("Show a member's verification status.")
      .addUserOption((option) => option.setName("member").setDescription("Member.").setRequired(true)));

  public constructor(
    private readonly verification?: VerificationService,
    private readonly authorizer?: PermissionAuthorizer,
  ) {}

  public bypassAuthorization(): boolean {
    return true;
  }

  public async execute(context: CommandExecutionContext): Promise<void> {
    try {
      await this.run(context);
    } catch (error) {
      if (!(error instanceof VerificationError)) throw error;
      await context.editReply({ content: error.message });
    }
  }

  private async run(context: CommandExecutionContext): Promise<void> {
    const verification = this.verification;
    const interaction = context.interaction;
    const guildId = interaction.guildId;
    if (!verification || !this.authorizer || !guildId) throw new VerificationError("DEPENDENCY_UNAVAILABLE", "Verification is not available right now.");
    const route = context.route.requiredSubcommand();
    const permission = SUBCOMMAND_PERMISSIONS[route];
    if (!permission || !(await memberHasPermission(this.authorizer, interaction, permission))) {
      await context.editReply({ content: `You need the \`${permission ?? "verification"}\` permission to do that.` });
      return;
    }
    const staff = { userId: interaction.user.id, displayName: interactionDisplayName(interaction), source: "DISCORD" as const };
    const options = context.options;

    switch (route) {
      case "panel": {
        const posted = await verification.publishPanel(guildId);
        await context.editReply({ content: `Verification panel is up in <#${posted.channelId}>.` });
        return;
      }
      case "member": {
        const user = options.requiredUser("member");
        await verification.manualVerify(guildId, user.id, staff, options.optionalString("reason"));
        await context.editReply({ content: `<@${user.id}> is now verified.` });
        return;
      }
      case "unverify": {
        const user = options.requiredUser("member");
        await verification.unverify(guildId, user.id, staff, options.optionalString("reason"));
        await context.editReply({ content: `<@${user.id}> is no longer verified.` });
        return;
      }
      default: {
        const user = options.requiredUser("member");
        const status = await verification.status(guildId, user.id);
        const created = Math.floor(status.accountCreatedAt.getTime() / 1000);
        const lines = status.attempts.map((attempt) => `<t:${Math.floor(attempt.createdAt.getTime() / 1000)}:R> ${RESULT_LABELS[attempt.result]}${attempt.reason ? ` - ${attempt.reason}` : ""}`);
        const embed = new EmbedBuilder()
          .setTitle(`Verification for ${status.displayName}`)
          .setColor(status.verified ? 0x57f287 : 0xfee75c)
          .addFields(
            { name: "Status", value: !status.inServer ? "Not in the server" : status.verified ? "Verified" : "Not verified", inline: true },
            { name: "Account created", value: `<t:${created}:R>`, inline: true },
            ...(status.pending ? [{ name: "Waiting since", value: `<t:${Math.floor(status.pending.joinedAt.getTime() / 1000)}:R>${status.pending.flagged ? " (new account, flagged)" : ""}`, inline: true }] : []),
            { name: "Recent attempts", value: lines.join("\n").slice(0, 1024) || "None" },
          );
        await context.editReply({ embeds: [embed] });
      }
    }
  }
}

export const command = new VerifyCommand();

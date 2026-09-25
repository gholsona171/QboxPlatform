import { MessageFlags, PermissionFlagsBits, type ButtonInteraction, type Interaction } from "discord.js";
import { DiscordRestStaffGateway, STAFF_CUSTOM_ID, StaffError, StaffService, type StaffRepository } from "@qbox/staff";
import type { PermissionAuthorizer } from "@qbox/permissions";
import { logger } from "@qbox/logger";

import { StaffCommand } from "../commands/Staff.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";
import { memberRoleIds } from "../tickets/ticketActor.js";

const SWEEP_INTERVAL_MS = 60_000;

/**
 * Staff management: `/staff`, leave approve and deny buttons in the staff log,
 * and a timer that ends long shifts and starts and ends leave.
 */
export function staffFeature(repository: StaffRepository): DiscordFeatureFactory {
  return ({ client, authorizer }) => {
    const staff = new StaffService(repository, new DiscordRestStaffGateway(client.rest));
    let timer: ReturnType<typeof setInterval> | undefined;
    return {
      name: "staff",
      commands: () => [new StaffCommand(staff, authorizer)],
      interactionPrefixes: [STAFF_CUSTOM_ID.prefix],
      handleInteraction: (interaction) => handleInteraction(staff, authorizer, interaction),
      attach: () => {
        timer = setInterval(() => void sweep(staff), SWEEP_INTERVAL_MS);
        timer.unref?.();
      },
      detach: () => {
        if (timer) clearInterval(timer);
        timer = undefined;
      },
    };
  };
}

async function sweep(staff: StaffService): Promise<void> {
  try {
    const result = await staff.sweep();
    if (result.clockedOut + result.leavesStarted + result.leavesEnded > 0) logger.info({ ...result }, "Staff timer ran.");
  } catch (error) {
    logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined }, "Staff timer failed.");
  }
}

async function handleInteraction(staff: StaffService, authorizer: PermissionAuthorizer, interaction: Interaction): Promise<void> {
  if (!interaction.isButton() || !interaction.guildId) return;
  const id = interaction.customId;
  const approve = id.startsWith(STAFF_CUSTOM_ID.approveLeave);
  if (!approve && !id.startsWith(STAFF_CUSTOM_ID.denyLeave)) return;
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    if (!(await canManage(authorizer, interaction))) {
      await interaction.editReply({ content: "You need the `staff.manage` permission to review leave." });
      return;
    }
    const leaveId = id.slice((approve ? STAFF_CUSTOM_ID.approveLeave : STAFF_CUSTOM_ID.denyLeave).length);
    const member = interaction.member;
    const displayName = member && "displayName" in member && typeof member.displayName === "string" ? member.displayName : interaction.user.globalName ?? interaction.user.username;
    await staff.reviewLeave(interaction.guildId, leaveId, { userId: interaction.user.id, displayName, source: "DISCORD" }, approve);
    await interaction.editReply({ content: approve ? "Leave approved." : "Leave denied." });
  } catch (error) {
    if (!(error instanceof StaffError)) logger.error({ err: error, customId: id }, "Staff button failed.");
    await interaction.editReply({ content: error instanceof StaffError ? error.message : "Something went wrong. Try again." }).catch(() => undefined);
  }
}

async function canManage(authorizer: PermissionAuthorizer, interaction: ButtonInteraction): Promise<boolean> {
  if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
  const guildId = interaction.guildId as string;
  try {
    const decision = await authorizer.authorize({
      principals: [
        { type: "discord-user", externalId: interaction.user.id, guildId },
        ...memberRoleIds(interaction).map((roleId) => ({ type: "discord-role" as const, externalId: roleId, guildId })),
      ],
      scope: { type: "discord-guild", guildId },
      required: ["staff.manage"],
      mode: "all",
      administratorOverride: true,
    });
    return decision.allowed;
  } catch {
    return false;
  }
}

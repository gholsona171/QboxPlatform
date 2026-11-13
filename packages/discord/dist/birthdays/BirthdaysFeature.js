import { MessageFlags } from "discord.js";
import { BirthdayError, BirthdayService, DiscordRestBirthdayGateway } from "@qbox/birthdays";
import { passthroughTemplates } from "@qbox/shared/messages";
import { logger } from "@qbox/logger";
import { BIRTHDAY_CUSTOM_ID, BirthdayCommand, birthdayText } from "../commands/Birthday.command.js";
const TICK_INTERVAL_MS = 5 * 60_000;
/**
 * Birthdays: `/birthday`, the confirmation buttons, and a timer that posts
 * birthday messages and gives and removes the birthday role.
 */
export function birthdaysFeature(repository, templates = passthroughTemplates) {
    return ({ client, authorizer }) => {
        const birthdays = new BirthdayService(repository, new DiscordRestBirthdayGateway(client.rest), undefined, templates);
        let timer;
        const tick = async () => {
            try {
                const result = await birthdays.tick();
                if (result.announced > 0 || result.rolesRemoved > 0)
                    logger.info({ ...result }, "Birthday timer ran.");
            }
            catch (error) {
                logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined }, "Birthday timer failed.");
            }
        };
        return {
            name: "birthdays",
            commands: () => [new BirthdayCommand(birthdays, authorizer)],
            interactionPrefixes: ["qbox:birthday:"],
            handleInteraction: (interaction) => handleButton(birthdays, interaction),
            attach: () => {
                timer = setInterval(() => void tick(), TICK_INTERVAL_MS);
                timer.unref?.();
            },
            detach: () => {
                if (timer)
                    clearInterval(timer);
                timer = undefined;
            },
        };
    };
}
async function handleButton(birthdays, interaction) {
    if (!interaction.isButton())
        return;
    try {
        if (interaction.customId === BIRTHDAY_CUSTOM_ID.cancel) {
            await interaction.update({ content: "Cancelled. Your birthday was not changed.", components: [] });
            return;
        }
        if (interaction.customId.startsWith(BIRTHDAY_CUSTOM_ID.confirm))
            await confirm(birthdays, interaction);
    }
    catch (error) {
        if (!(error instanceof BirthdayError))
            logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, interactionId: interaction.id }, "Birthday button failed.");
        const content = error instanceof BirthdayError ? error.message : "Something went wrong. Please try again.";
        if (interaction.replied || interaction.deferred)
            await interaction.editReply({ content, components: [] }).catch(() => undefined);
        else
            await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => undefined);
    }
}
async function confirm(birthdays, interaction) {
    const guildId = interaction.guildId;
    if (!guildId)
        throw new BirthdayError("INVALID_STATE", "Birthdays only work inside a server.");
    const [month, day, year, showAge, ...zone] = interaction.customId.slice(BIRTHDAY_CUSTOM_ID.confirm.length).split(":");
    const member = interaction.member;
    const displayName = member && "displayName" in member && typeof member.displayName === "string" ? member.displayName : interaction.user.globalName ?? interaction.user.username;
    const saved = await birthdays.set({
        guildId,
        userId: interaction.user.id,
        displayName,
        month: Number(month),
        day: Number(day),
        ...(Number(year) > 0 ? { year: Number(year) } : {}),
        showAge: showAge === "1",
        timeZone: zone.join(":"),
        confirmed: true,
    }, { userId: interaction.user.id, displayName, manager: false });
    await interaction.update({ content: `Saved your birthday: **${birthdayText(saved)}**.`, components: [] });
}
//# sourceMappingURL=BirthdaysFeature.js.map
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle, } from "discord.js";
import { logger } from "@qbox/logger";
import { VERIFICATION_CUSTOM_ID, VerificationError } from "@qbox/verification";
/** Handles the panel button, the captcha code button, and the verification forms. */
export class VerificationInteractionHandler {
    verification;
    constructor(verification) {
        this.verification = verification;
    }
    async handle(interaction) {
        try {
            if (interaction.isButton())
                await this.button(interaction);
            else if (interaction.isModalSubmit())
                await this.modal(interaction);
        }
        catch (error) {
            await this.fail(interaction, error);
        }
    }
    async button(interaction) {
        const guildId = requireGuild(interaction);
        if (interaction.customId === VERIFICATION_CUSTOM_ID.enterCode) {
            await interaction.showModal(new ModalBuilder()
                .setCustomId(VERIFICATION_CUSTOM_ID.captchaForm)
                .setTitle("Enter your code")
                .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("code").setLabel("Code").setStyle(TextInputStyle.Short).setRequired(true).setMinLength(6).setMaxLength(20))));
            return;
        }
        if (interaction.customId !== VERIFICATION_CUSTOM_ID.start)
            return;
        const member = memberOf(interaction);
        const settings = await this.verification.settings(guildId);
        if (settings.mode === "QUESTION") {
            const questions = await this.verification.questions(guildId, member);
            await interaction.showModal(new ModalBuilder()
                .setCustomId(VERIFICATION_CUSTOM_ID.questionForm)
                .setTitle("Verification")
                .addComponents(...questions.map((question) => new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(question.id).setLabel(question.prompt).setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(200)))));
            return;
        }
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (settings.mode === "CAPTCHA") {
            const challenge = await this.verification.startCaptcha(guildId, member);
            await interaction.editReply({
                content: `Your code is:\n# \`${challenge.display}\`\nClick **Enter code** and type it (spaces don't matter). It expires <t:${Math.floor(challenge.expiresAt.getTime() / 1000)}:R>.`,
                components: [
                    new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(VERIFICATION_CUSTOM_ID.enterCode).setLabel("Enter code").setStyle(ButtonStyle.Primary)),
                ],
            });
            return;
        }
        const outcome = await this.verification.verifyByButton(guildId, member);
        await interaction.editReply({ content: outcome.message });
    }
    async modal(interaction) {
        const guildId = requireGuild(interaction);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const member = memberOf(interaction);
        if (interaction.customId === VERIFICATION_CUSTOM_ID.captchaForm) {
            const outcome = await this.verification.submitCaptcha(guildId, member, interaction.fields.getTextInputValue("code"));
            await interaction.editReply({ content: outcome.message });
            return;
        }
        if (interaction.customId === VERIFICATION_CUSTOM_ID.questionForm) {
            const answers = {};
            for (const question of (await this.verification.settings(guildId)).questions) {
                try {
                    answers[question.id] = interaction.fields.getTextInputValue(question.id);
                }
                catch {
                    answers[question.id] = "";
                }
            }
            const outcome = await this.verification.submitAnswers(guildId, member, answers);
            await interaction.editReply({ content: outcome.message });
        }
    }
    async fail(interaction, error) {
        const message = error instanceof VerificationError ? error.message : "Something went wrong while verifying. Please try again.";
        if (!(error instanceof VerificationError))
            logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, interactionId: interaction.id }, "Discord verification interaction failed.");
        if (!interaction.isRepliable())
            return;
        await respond(interaction, message).catch(() => undefined);
    }
}
function memberOf(interaction) {
    const member = interaction.member;
    const roleIds = !member ? [] : Array.isArray(member.roles) ? [...member.roles] : [...member.roles.cache.keys()];
    const displayName = member && "displayName" in member && typeof member.displayName === "string" ? member.displayName : interaction.user.globalName ?? interaction.user.username;
    return { userId: interaction.user.id, displayName, roleIds };
}
function requireGuild(interaction) {
    if (!interaction.guildId)
        throw new VerificationError("INVALID_STATE", "Verification only works inside a server.");
    return interaction.guildId;
}
async function respond(interaction, content) {
    if (interaction.deferred || interaction.replied)
        await interaction.editReply({ content, components: [] });
    else
        await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}
//# sourceMappingURL=VerificationInteractionHandler.js.map
/** Returns the custom ID of a component or modal interaction, if any. */
export function interactionCustomId(interaction) {
    if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit())
        return interaction.customId;
    return undefined;
}
//# sourceMappingURL=DiscordFeature.js.map
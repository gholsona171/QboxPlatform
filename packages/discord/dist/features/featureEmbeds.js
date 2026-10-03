import { EmbedBuilder } from "discord.js";
import { colorValue } from "@qbox/shared/discord-rest";
/** Converts a feature embed into a discord.js embed for interaction replies. */
export function toEmbedBuilder(embed) {
    const builder = new EmbedBuilder().setTitle(embed.title).setDescription(embed.description).setColor(colorValue(embed.color));
    if (embed.url)
        builder.setURL(embed.url);
    if (embed.fields?.length)
        builder.addFields(embed.fields.map((field) => ({ name: field.name, value: field.value, inline: field.inline ?? false })));
    if (embed.footer)
        builder.setFooter({ text: embed.footer });
    if (embed.timestamp)
        builder.setTimestamp(embed.timestamp);
    return builder;
}
//# sourceMappingURL=featureEmbeds.js.map
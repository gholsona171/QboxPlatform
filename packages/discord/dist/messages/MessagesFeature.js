import { Events } from "discord.js";
import { guildResolver, installThemedRequests } from "@qbox/messages";
import { InteractionGuildMap } from "./InteractionGuildMap.js";
/**
 * Look & Messages: wraps the bot's REST client once so every embed any
 * feature (or discord.js itself, for interaction replies) sends gets the
 * server's look, and remembers which server each interaction came from so
 * replies can be themed too. No commands of its own.
 */
export function messagesFeature(looks) {
    return ({ client }) => {
        const interactions = new InteractionGuildMap();
        const remember = (interaction) => interactions.remember(interaction.id, interaction.token, interaction.guildId);
        let restore;
        return {
            name: "messages",
            commands: () => [],
            attach: (attached) => {
                attached.prependListener(Events.InteractionCreate, remember);
                restore ??= installThemedRequests(client.rest, guildResolver(client.rest, interactions), looks);
            },
            detach: () => {
                client.off(Events.InteractionCreate, remember);
                restore?.();
                restore = undefined;
            },
        };
    };
}
//# sourceMappingURL=MessagesFeature.js.map
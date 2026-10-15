import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { StreamsError, isPlatform, platformLabel } from "@qbox/streams";
import { memberHasPermission } from "../features/featureAuthorization.js";
const PLATFORM_CHOICES = [{ name: "Twitch", value: "twitch" }, { name: "Kick", value: "kick" }, { name: "YouTube", value: "youtube" }];
/** `/streams` - follow creators and announce when they go live. `list` is open to everyone; the rest needs `streams.manage`. */
export class StreamsCommand {
    streams;
    authorizer;
    type = "chat-input";
    policy = {
        contexts: "guild",
        response: { acknowledgement: "deferred", visibility: "ephemeral" },
        concurrency: "user",
    };
    data = new SlashCommandBuilder()
        .setName("streams")
        .setDescription("Announce when your creators go live.")
        .addSubcommand((sub) => sub.setName("add").setDescription("Follow a creator and announce their streams.")
        .addStringOption((option) => option.setName("platform").setDescription("Where they stream.").setRequired(true).addChoices(...PLATFORM_CHOICES))
        .addStringOption((option) => option.setName("creator").setDescription("Their channel name, handle, or link.").setRequired(true).setMaxLength(200))
        .addChannelOption((option) => option.setName("channel").setDescription("Where to announce (default: the Streams default channel).").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
        .addRoleOption((option) => option.setName("ping").setDescription("Role to ping when they go live."))
        .addBooleanOption((option) => option.setName("videos").setDescription("YouTube only: also announce new uploads.")))
        .addSubcommand((sub) => sub.setName("remove").setDescription("Stop following a creator.")
        .addStringOption((option) => option.setName("creator").setDescription("Their channel name or handle.").setRequired(true).setMaxLength(200))
        .addStringOption((option) => option.setName("platform").setDescription("Where they stream, if the name is on more than one platform.").addChoices(...PLATFORM_CHOICES)))
        .addSubcommand((sub) => sub.setName("list").setDescription("Who is followed, and who is live right now."))
        .addSubcommand((sub) => sub.setName("test").setDescription("Post the live announcement for a creator now.")
        .addStringOption((option) => option.setName("creator").setDescription("Their channel name or handle.").setRequired(true).setMaxLength(200))
        .addStringOption((option) => option.setName("platform").setDescription("Where they stream, if the name is on more than one platform.").addChoices(...PLATFORM_CHOICES)));
    constructor(streams, authorizer) {
        this.streams = streams;
        this.authorizer = authorizer;
    }
    bypassAuthorization() {
        return true;
    }
    async execute(context) {
        try {
            await this.run(context);
        }
        catch (error) {
            if (!(error instanceof StreamsError))
                throw error;
            await context.editReply({ content: error.message });
        }
    }
    async run(context) {
        const streams = this.streams;
        const interaction = context.interaction;
        const guildId = interaction.guildId;
        if (!streams || !this.authorizer || !guildId)
            throw new StreamsError("DEPENDENCY_UNAVAILABLE", "Stream announcements are not available right now.");
        const route = context.route.requiredSubcommand();
        if (route === "list") {
            const subscriptions = await streams.list(guildId);
            const lines = subscriptions.map((item) => `${item.state.lastStreamId ? "🔴" : item.enabled ? "⚪" : "⏸️"} **${item.displayName}** · ${platformLabel(item.platform)}${item.state.lastStreamId ? " · live now" : ""}${item.state.lastError ? ` · ⚠️ ${item.state.lastError}` : ""}`);
            await context.editReply({ embeds: [new EmbedBuilder().setTitle("Followed creators").setColor(0x9146ff).setDescription(lines.join("\n") || "No creators yet. Add one with `/streams add` or in the portal.")] });
            return;
        }
        if (!(await memberHasPermission(this.authorizer, interaction, "streams.manage"))) {
            await context.editReply({ content: "You need the `streams.manage` permission to do that." });
            return;
        }
        const options = context.options;
        if (route === "add") {
            const platform = options.requiredString("platform");
            if (!isPlatform(platform))
                throw new StreamsError("INVALID_INPUT", "Choose Twitch, Kick, or YouTube.");
            const added = await streams.add({
                guildId,
                platform,
                handle: options.requiredString("creator"),
                announceChannelId: options.optionalChannel("channel")?.id,
                pingRoleId: options.optionalRole("ping")?.id,
                announceVideos: options.optionalBoolean("videos") ?? false,
                enabled: true,
            });
            const settings = await streams.settings(guildId);
            const channel = added.announceChannelId ?? settings.defaultChannelId;
            await context.editReply({ content: `Following **${added.displayName}** on ${platformLabel(added.platform)}. ${channel ? `Announcements go to <#${channel}>.` : "Pick a channel in the portal (Streams) before they go live."}` });
            return;
        }
        const subscription = await this.find(streams, guildId, options.requiredString("creator"), options.optionalString("platform"));
        if (route === "remove") {
            await streams.remove(guildId, subscription.id);
            await context.editReply({ content: `No longer following **${subscription.displayName}** on ${platformLabel(subscription.platform)}.` });
            return;
        }
        const result = await streams.test(guildId, subscription.id);
        await context.editReply({ content: result.live ? `Posted the live announcement for **${subscription.displayName}**. They are live right now.` : `Posted a sample announcement for **${subscription.displayName}**. They are offline right now.` });
    }
    async find(streams, guildId, creator, platform) {
        const needle = creator.trim().replace(/^@/, "").toLowerCase();
        const matches = (await streams.list(guildId)).filter((item) => (platform === undefined || item.platform === platform) && (item.handle.toLowerCase() === needle || item.displayName.toLowerCase() === needle));
        if (matches.length === 0)
            throw new StreamsError("NOT_FOUND", `"${creator}" is not on the list. Use /streams list to see who is.`);
        if (matches.length > 1)
            throw new StreamsError("INVALID_INPUT", `"${creator}" is followed on more than one platform. Add the platform option.`);
        return matches[0];
    }
}
export const command = new StreamsCommand();
//# sourceMappingURL=Streams.command.js.map
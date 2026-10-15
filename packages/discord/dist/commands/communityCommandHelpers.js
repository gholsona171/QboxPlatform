export class CommunityCommand {
    community;
    type = "chat-input";
    policy;
    constructor(permission, community) {
        this.community = community;
        this.policy = {
            contexts: "guild",
            permissions: {
                required: [permission],
                mode: "all",
                administratorOverride: true,
            },
            response: {
                acknowledgement: "deferred",
                visibility: "ephemeral",
            },
            concurrency: "guild",
        };
    }
    service() {
        if (!this.community)
            throw new Error("Discord community service is not available.");
        return this.community;
    }
    guildId(context) {
        const guildId = context.interaction.guildId;
        if (!guildId)
            throw new Error("This command requires a Discord server.");
        return guildId;
    }
}
export function enabledText(enabled) {
    return enabled ? "enabled" : "disabled";
}
export function parseColor(value) {
    return value?.startsWith("#") ? value : value ? `#${value}` : undefined;
}
//# sourceMappingURL=communityCommandHelpers.js.map
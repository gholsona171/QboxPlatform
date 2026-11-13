import { Events } from "discord.js";
import { DiscordRestVerificationGateway, VerificationService } from "@qbox/verification";
import { passthroughTemplates } from "@qbox/shared/messages";
import { logger } from "@qbox/logger";
import { VerifyCommand } from "../commands/Verify.command.js";
import { VerificationInteractionHandler } from "./VerificationInteractionHandler.js";
const SWEEP_INTERVAL_MS = 60_000;
/**
 * Verification: `/verify`, the panel button and forms, the unverified role and
 * account age check on join, and kicking members who stay unverified.
 */
export function verificationFeature(repository, templates = passthroughTemplates) {
    return ({ client, authorizer }) => {
        const verification = new VerificationService(repository, new DiscordRestVerificationGateway(client.rest), undefined, templates);
        const interactions = new VerificationInteractionHandler(verification);
        const events = new VerificationEvents(verification);
        return {
            name: "verification",
            commands: () => [new VerifyCommand(verification, authorizer)],
            interactionPrefixes: ["qbox:verification:"],
            handleInteraction: (interaction) => interactions.handle(interaction),
            attach: (target) => events.attach(target),
            detach: () => events.detach(),
        };
    };
}
class VerificationEvents {
    verification;
    client;
    timer;
    onMemberAdd = (member) => void this.safe("member-join", () => this.joined(member));
    onMemberRemove = (member) => void this.safe("member-leave", () => this.verification.memberLeft(member.guild.id, member.id));
    constructor(verification) {
        this.verification = verification;
    }
    attach(client) {
        this.client = client;
        client.on(Events.GuildMemberAdd, this.onMemberAdd);
        client.on(Events.GuildMemberRemove, this.onMemberRemove);
        this.timer = setInterval(() => void this.safe("sweep", async () => {
            const result = await this.verification.sweepUnverified();
            if (result.kicked > 0)
                logger.info({ ...result }, "Unverified members kicked.");
        }), SWEEP_INTERVAL_MS);
        this.timer.unref?.();
    }
    detach() {
        this.client?.off(Events.GuildMemberAdd, this.onMemberAdd);
        this.client?.off(Events.GuildMemberRemove, this.onMemberRemove);
        if (this.timer)
            clearInterval(this.timer);
        this.client = undefined;
    }
    async joined(member) {
        if (member.user.bot)
            return;
        await this.verification.memberJoined(member.guild.id, { userId: member.id, displayName: member.displayName, roleIds: [...member.roles.cache.keys()] });
    }
    async safe(operation, action) {
        try {
            await action();
        }
        catch (error) {
            logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined, operation }, "Discord verification event failed.");
        }
    }
}
//# sourceMappingURL=VerificationFeature.js.map
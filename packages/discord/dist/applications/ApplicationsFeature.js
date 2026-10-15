import { APPLICATION_CUSTOM_ID, ApplicationService, DiscordRestApplicationGateway } from "@qbox/applications";
import { ApplicationsCommand } from "../commands/Applications.command.js";
import { ApplyCommand } from "../commands/Apply.command.js";
import { ApplicationElevation } from "./applicationActor.js";
import { DiscordApplicationInteractionHandler } from "./DiscordApplicationInteractionHandler.js";
/** Applications: `/apply`, `/applications`, panel buttons, paged forms, and review buttons. */
export function applicationsFeature(repository) {
    return ({ client, authorizer }) => {
        const applications = new ApplicationService(repository, new DiscordRestApplicationGateway(client.rest));
        const elevation = new ApplicationElevation(authorizer);
        const interactions = new DiscordApplicationInteractionHandler(applications, elevation);
        return {
            name: "applications",
            commands: () => [new ApplyCommand(applications), new ApplicationsCommand(applications, elevation, authorizer)],
            interactionPrefixes: [APPLICATION_CUSTOM_ID.prefix],
            handleInteraction: (interaction) => interactions.handle(interaction),
        };
    };
}
//# sourceMappingURL=ApplicationsFeature.js.map
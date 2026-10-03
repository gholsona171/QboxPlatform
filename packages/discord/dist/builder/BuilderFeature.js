import { BuilderService } from "@qbox/server-builder";
import { BuilderCommand } from "../commands/Builder.command.js";
/** Server builder: `/builder status`. Builds run in the API from the portal. */
export function builderFeature(repository) {
    return ({ authorizer }) => {
        const builder = new BuilderService(repository);
        return {
            name: "server-builder",
            commands: () => [new BuilderCommand(builder, authorizer)],
        };
    };
}
//# sourceMappingURL=BuilderFeature.js.map
import { BuilderService, type BuilderRepository } from "@qbox/server-builder";

import { BuilderCommand } from "../commands/Builder.command.js";
import type { DiscordFeatureFactory } from "../features/DiscordFeature.js";

/** Server builder: `/builder status`. Builds run in the API from the portal. */
export function builderFeature(repository: BuilderRepository): DiscordFeatureFactory {
  return ({ authorizer }) => {
    const builder = new BuilderService(repository);
    return {
      name: "server-builder",
      commands: () => [new BuilderCommand(builder, authorizer)],
    };
  };
}

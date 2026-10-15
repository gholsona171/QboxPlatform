import { type PrismaPermissionPersistenceClient } from "@qbox/database";
import { MessageTemplateService } from "@qbox/messages";
import type { REST } from "discord.js";
import type { ApiFeature } from "./features/ApiFeature.js";
export interface ApiFeatureDependencies {
    readonly persistence: PrismaPermissionPersistenceClient;
    /** Discord REST client when a bot token is configured. */
    readonly discordRest: REST | undefined;
    /** Custom messages and the server-wide look; created here when the composition root does not pass one. */
    readonly templates?: MessageTemplateService | undefined;
}
/** Every pluggable API feature. Add one line per feature. */
export declare function apiFeatures({ persistence, discordRest, ...dependencies }: ApiFeatureDependencies): readonly ApiFeature[];
//# sourceMappingURL=features.d.ts.map
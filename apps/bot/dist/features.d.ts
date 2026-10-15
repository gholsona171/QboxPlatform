import { type PrismaPermissionPersistenceClient } from "@qbox/database";
import { type DiscordFeatureFactory } from "@qbox/discord";
import { MessageTemplateService } from "@qbox/messages";
import type { PersistentPermissionService } from "@qbox/permissions";
/** Custom messages and the server-wide look, shared by every feature that posts to Discord. */
export declare function createTemplates(persistence: PrismaPermissionPersistenceClient): MessageTemplateService;
/**
 * Every pluggable Discord feature the bot runs. Add one line per feature;
 * repositories share the persistence client's Prisma connection.
 */
export declare function botFeatures(persistence: PrismaPermissionPersistenceClient, authorizer: PersistentPermissionService, templates: MessageTemplateService): readonly DiscordFeatureFactory[];
//# sourceMappingURL=features.d.ts.map
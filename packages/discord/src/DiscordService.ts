import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import type { Interaction, MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";

import { env } from "@qbox/shared";
import { passthroughTemplates, type MessageTemplates } from "@qbox/shared/messages";
import { logger } from "@qbox/logger";
import type { PermissionAuthorizer } from "@qbox/permissions";
import { RoleMenuService, type RoleMenuRepository } from "@qbox/role-menus";
import { DiscordCommunityService, type CommunityRepository } from "@qbox/discord-community";
import { RoleManagementService, type RoleDependencyRepository } from "@qbox/discord-roles";

import { CommandRegistry } from "./commands/CommandRegistry.js";
import type { DiscordCommand } from "./commands/DiscordCommand.js";
import { DiscordInteractionHandler } from "./interactions/DiscordInteractionHandler.js";
import { DiscordRoleMenuGateway } from "./roleMenus/DiscordRoleMenuGateway.js";
import { DiscordRoleMenuInteractionHandler } from "./roleMenus/DiscordRoleMenuInteractionHandler.js";
import { DiscordCommunityGatewayAdapter } from "./community/DiscordCommunityGateway.js";
import { DiscordCommunityEventHandler } from "./community/DiscordCommunityEventHandler.js";
import { DiscordRoleManagementGateway } from "./roles/DiscordRoleManagementGateway.js";
import type { DiscordFeature, DiscordFeatureFactory } from "./features/DiscordFeature.js";

export interface CommandDeploymentResult {
  readonly commandCount: number;
  readonly commandNames: readonly string[];
}

export type CommandDeploymentDefinition = Readonly<Record<string, unknown>>;

function readExecutionTimeout(): number {
  const timeout = Number(env.DISCORD_COMMAND_TIMEOUT_MS);

  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error("DISCORD_COMMAND_TIMEOUT_MS must be a positive integer.");
  }

  return timeout;
}

function readShutdownTimeout(): number {
  const timeout = Number(env.DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS);

  if (!Number.isInteger(timeout) || timeout <= 0) {
    throw new Error(
      "DISCORD_COMMAND_SHUTDOWN_TIMEOUT_MS must be a positive integer.",
    );
  }

  return timeout;
}

export class DiscordService {
  public readonly client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildModeration,
      ...(env.DISCORD_MESSAGE_CONTENT_INTENT ? [GatewayIntentBits.MessageContent] : []),
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  });

  public readonly commands: CommandRegistry;
  public readonly roleMenus: RoleMenuService | undefined;
  public readonly community: DiscordCommunityService | undefined;
  public readonly roles: RoleManagementService | undefined;
  /** Pluggable features (tickets, moderation, ...) composed at startup. */
  public readonly features: readonly DiscordFeature[];
  private readonly interactions: DiscordInteractionHandler;
  private readonly roleMenuInteractions: DiscordRoleMenuInteractionHandler | undefined;
  private readonly communityEvents: DiscordCommunityEventHandler | undefined;
  private readonly interactionListener = (interaction: Interaction): void => {
    void this.interactions.handle(interaction).catch((error: unknown) => {
      logger.error(
        {
          err: error,
          stack: error instanceof Error ? error.stack : undefined,
          interactionId: interaction.id,
          interactionType: interaction.type,
        },
        "Unhandled Discord interaction listener failure.",
      );
    });
  };
  private readonly reactionAddListener = (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): void => {
    void this.roleMenuInteractions?.handleReaction(reaction, user, "add").catch((error: unknown) => {
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined }, "Unhandled Discord role-menu reaction-add failure.");
    });
  };
  private readonly reactionRemoveListener = (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser): void => {
    void this.roleMenuInteractions?.handleReaction(reaction, user, "remove").catch((error: unknown) => {
      logger.error({ err: error, stack: error instanceof Error ? error.stack : undefined }, "Unhandled Discord role-menu reaction-remove failure.");
    });
  };

  public constructor(
    permissionAuthorizer: PermissionAuthorizer,
    roleMenuRepository?: RoleMenuRepository,
    communityRepository?: CommunityRepository,
    roleDependencyRepository?: RoleDependencyRepository,
    featureFactories: readonly DiscordFeatureFactory[] = [],
    templates: MessageTemplates = passthroughTemplates,
  ) {
    this.commands = new CommandRegistry(permissionAuthorizer, logger);
    this.features = featureFactories.map((create) => create({ client: this.client, authorizer: permissionAuthorizer }));
    if (roleMenuRepository) {
      this.roleMenus = new RoleMenuService(
        roleMenuRepository,
        new DiscordRoleMenuGateway(this.client),
      );
      this.roleMenuInteractions = new DiscordRoleMenuInteractionHandler(
        this.roleMenus,
      );
    }
    if (communityRepository) {
      this.community = new DiscordCommunityService(
        communityRepository,
        new DiscordCommunityGatewayAdapter(this.client),
        templates,
      );
      this.communityEvents = new DiscordCommunityEventHandler(this.community);
    }
    if (roleDependencyRepository) {
      this.roles = new RoleManagementService(
        roleDependencyRepository,
        new DiscordRoleManagementGateway(this.client),
      );
    }
    this.interactions = new DiscordInteractionHandler(this.commands, {
      executionTimeoutMs: readExecutionTimeout(),
      ...(this.roleMenuInteractions ? { roleMenuInteractions: this.roleMenuInteractions } : {}),
      ...(this.community ? { community: this.community } : {}),
      featureInteractions: this.features.flatMap((feature) =>
        feature.handleInteraction && feature.interactionPrefixes
          ? [{ prefixes: feature.interactionPrefixes, handle: feature.handleInteraction.bind(feature) }]
          : [],
      ),
    });
  }

  /** Live command instance provided by a feature for this command name. */
  public featureCommand(name: string): DiscordCommand | undefined {
    for (const feature of this.features) {
      const command = feature.commands().find((candidate) => candidate.data.name === name);
      if (command) return command;
    }
    return undefined;
  }

  public registerCommands(commands: readonly DiscordCommand[]): number {
    return this.commands.registerAll(commands);
  }

  public async start(): Promise<void> {
    if (!env.DISCORD_TOKEN) {
      throw new Error("DISCORD_TOKEN is missing.");
    }

    if (!env.DISCORD_APPLICATION_ID) {
      throw new Error("DISCORD_APPLICATION_ID is missing.");
    }

    this.client.on(Events.InteractionCreate, this.interactionListener);
    this.client.on(Events.MessageReactionAdd, this.reactionAddListener);
    this.client.on(Events.MessageReactionRemove, this.reactionRemoveListener);
    this.communityEvents?.attach(this.client);
    for (const feature of this.features) feature.attach?.(this.client);

    logger.info(
      {
        listener: Events.InteractionCreate,
      },
      "Discord interaction listener attached.",
    );

    try {
      await this.client.login(env.DISCORD_TOKEN);
    } catch (error) {
      this.client.off(Events.InteractionCreate, this.interactionListener);
      this.client.off(Events.MessageReactionAdd, this.reactionAddListener);
      this.client.off(Events.MessageReactionRemove, this.reactionRemoveListener);
      this.communityEvents?.detach();
      for (const feature of this.features) feature.detach?.();
      this.client.destroy();
      throw error;
    }

    const applicationId = this.client.application?.id;
    const user = this.client.user;

    if (!applicationId || !user) {
      throw new Error(
        "Discord client became ready without application identity.",
      );
    }

    if (applicationId !== env.DISCORD_APPLICATION_ID) {
      this.client.destroy();
      throw new Error(
        `Discord application mismatch: expected '${env.DISCORD_APPLICATION_ID}', connected '${applicationId}'.`,
      );
    }

    logger.info(
      {
        applicationId,
        botUsername: user.tag,
        botUserId: user.id,
        connectedGuildCount: this.client.guilds.cache.size,
      },
      "Discord client connected.",
    );
  }

  public applicationId(): string {
    const applicationId = this.client.application?.id;

    if (!applicationId) {
      throw new Error("Discord application identity is unavailable.");
    }

    return applicationId;
  }

  public desiredCommandDefinitions(): readonly CommandDeploymentDefinition[] {
    return this.commands.deploymentData().map((definition) => ({
      ...definition,
    }));
  }

  public async fetchCommandDefinitions(
    guildId?: string,
  ): Promise<readonly CommandDeploymentDefinition[]> {
    if (!this.client.application) {
      throw new Error(
        "Discord application identity is unavailable for command deployment.",
      );
    }

    const commands = await this.client.application.commands.fetch(
      guildId
        ? { guildId, withLocalizations: true }
        : { withLocalizations: true },
    );

    return [...commands.values()].map((command) => ({
      type: command.type,
      name: command.name,
      nameLocalizations: command.nameLocalizations,
      description: command.description,
      descriptionLocalizations: command.descriptionLocalizations,
      options: command.options.map((option) => ({ ...option })),
      defaultMemberPermissions:
        command.defaultMemberPermissions?.bitfield.toString() ?? null,
      dmPermission: command.dmPermission,
      nsfw: command.nsfw,
      contexts: command.contexts,
      integrationTypes: command.integrationTypes,
      handler: command.handler,
    }));
  }

  public async applyCommandDefinitions(
    guildId?: string,
  ): Promise<CommandDeploymentResult> {
    if (!this.client.application) {
      throw new Error(
        "Discord application identity is unavailable for command deployment.",
      );
    }

    const commandData = this.commands.deploymentData();

    if (guildId) {
      await this.client.application.commands.set(commandData, guildId);
    } else {
      await this.client.application.commands.set(commandData);
    }

    return {
      commandCount: commandData.length,
      commandNames: commandData.map((command) => command.name),
    };
  }

  /** Removes every guild-scoped command from one server; global commands stay. */
  public async clearCommandDefinitions(
    guildId: string,
  ): Promise<CommandDeploymentResult> {
    if (!this.client.application) {
      throw new Error(
        "Discord application identity is unavailable for command deployment.",
      );
    }

    await this.client.application.commands.set([], guildId);

    return { commandCount: 0, commandNames: [] };
  }

  public async stop(): Promise<void> {
    await this.interactions.shutdown(readShutdownTimeout());
    this.client.off(Events.InteractionCreate, this.interactionListener);
    this.client.off(Events.MessageReactionAdd, this.reactionAddListener);
    this.client.off(Events.MessageReactionRemove, this.reactionRemoveListener);
    this.communityEvents?.detach();
    for (const feature of this.features) feature.detach?.();
    this.client.destroy();
  }
}

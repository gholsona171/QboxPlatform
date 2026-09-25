import { PlatformKernel } from "@qbox/core";
import {
  BrowserSessionService,
  DiscordGuildMembershipService,
  DiscordLoginService,
  MetadataHashingService,
  OAuthCredentialService,
  OAuthTransactionService,
} from "@qbox/authentication";
import {
  AuthenticationKeyRing,
  DatabaseConfiguration,
  DatabaseService,
  InMemoryPermissionInvalidationBus,
  NodeAuthenticationIdGenerator,
  PrismaPermissionPersistenceClient,
} from "@qbox/database";
import { logger } from "@qbox/logger";
import { RoleMenuService } from "@qbox/role-menus";
import { DiscordCommunityService } from "@qbox/discord-community";
import { RoleManagementService } from "@qbox/discord-roles";
import { REST } from "discord.js";
import {
  InMemoryPermissionCache,
  PersistentPermissionService,
} from "@qbox/permissions";
import {
  ApiConfiguration,
  type ApiConfigurationInput,
} from "../config/ApiConfiguration.js";
import { createApiServer } from "../createApiServer.js";
import { ApiAuthenticationConfiguration, type ApiAuthenticationConfigurationInput } from "../auth/ApiAuthenticationConfiguration.js";
import { NativeDiscordOAuthProvider } from "../auth/DiscordOAuthProvider.js";
import { registerBrowserAuthenticationRoutes } from "../auth/BrowserAuthenticationRoutes.js";
import { DiscordRestRoleGateway } from "../discord/DiscordRestRoleGateway.js";
import { ApiLifecycleHealth } from "../lifecycle/ApiLifecycleHealth.js";
import { ApiModule } from "../lifecycle/ApiModule.js";
import { ApiPermissionPersistenceModule } from "../lifecycle/ApiPermissionPersistenceModule.js";
import { registerPortalStaticRoutes } from "../portal/PortalStaticRoutes.js";
import { apiFeatures } from "../features.js";

/** Validated composition input supplied by the executable environment layer. */
export interface ApiApplicationInput {
  readonly api: ApiConfigurationInput;
  readonly authentication: ApiAuthenticationConfigurationInput;
  readonly databaseUrl: string | undefined;
  /** Absolute portal asset directory served from the API origin, when present. */
  readonly portalDirectory?: string | undefined;
  readonly discord?: {
    readonly token?: string | undefined;
    readonly applicationId?: string | undefined;
  } | undefined;
}

/** Process-owned API application with idempotent bounded cleanup. */
export class ApiApplication {
  private startAttempted = false;
  private shutdownPromise: Promise<void> | undefined;

  public constructor(
    public readonly kernel: PlatformKernel,
    public readonly configuration: ApiConfiguration,
    public readonly authenticationConfiguration: ApiAuthenticationConfiguration,
    public readonly health: ApiLifecycleHealth,
    public readonly apiModule: ApiModule,
  ) {}

  public async start(): Promise<void> {
    if (this.startAttempted) throw new Error("API application startup was already attempted.");
    this.startAttempted = true;
    try {
      await this.kernel.start();
    } catch (error) {
      this.health.beginShutdown();
      try {
        await withTimeout(
          this.kernel.stop(),
          this.configuration.diagnostics().shutdownTimeoutMs,
          "API startup cleanup timeout exceeded.",
        );
      } catch {
        // Preserve the authoritative startup failure.
      }
      throw error;
    }
  }

  public shutdown(): Promise<void> {
    if (this.shutdownPromise !== undefined) return this.shutdownPromise;
    this.health.beginShutdown();
    this.shutdownPromise = withTimeout(
      this.kernel.stop(),
      this.configuration.diagnostics().shutdownTimeoutMs,
      "API application shutdown timeout exceeded.",
    );
    return this.shutdownPromise;
  }
}

/** Composes one API process without starting it or reading process environment. */
export function createApiApplication(input: ApiApplicationInput): ApiApplication {
  const apiConfiguration = ApiConfiguration.from(input.api);
  const authenticationConfiguration = ApiAuthenticationConfiguration.from({
    ...input.authentication,
    environment: apiConfiguration.diagnostics().environment,
    publicBaseUrl: apiConfiguration.diagnostics().publicBaseUrl,
  });
  const databaseConfiguration = DatabaseConfiguration.from({
    databaseUrl: input.databaseUrl,
    environment: apiConfiguration.diagnostics().environment,
  });
  const invalidations = new InMemoryPermissionInvalidationBus();
  const cache = new InMemoryPermissionCache();
  const unsubscribeInvalidations = invalidations.subscribe((event) =>
    cache.invalidate(event.scopes),
  );
  const persistence = new PrismaPermissionPersistenceClient(
    databaseConfiguration,
    { invalidations },
  );
  const database = new DatabaseService(databaseConfiguration, {
    create: () => persistence,
  });
  const health = new ApiLifecycleHealth(database);
  const authorizer = new PersistentPermissionService(
    persistence.repositories.permissions,
    cache,
  );
  const roleMenus = new RoleMenuService(persistence.repositories.roleMenus);
  const community = new DiscordCommunityService(persistence.repositories.discordCommunity);
  const roles = new RoleManagementService(
    persistence.repositories.discordRoles,
    input.discord?.token
      ? new DiscordRestRoleGateway(input.discord.token, input.discord.applicationId)
      : undefined,
  );
  const features = apiFeatures({
    persistence,
    discordRest: input.discord?.token ? new REST({ version: "10" }).setToken(input.discord.token) : undefined,
  });
  const keyRing = new AuthenticationKeyRing(
    authenticationConfiguration.keyRegistrations(),
  );
  const crypto = keyRing.createCrypto();
  const ids = new NodeAuthenticationIdGenerator();
  const clock = { now: () => new Date() };
  const metadata = new MetadataHashingService(crypto, keyRing);
  const provider = new NativeDiscordOAuthProvider(
    authenticationConfiguration.discord(),
  );
  const oauthTransactions = new OAuthTransactionService({
    unitOfWork: persistence.authentication.unitOfWork,
    clock,
    crypto,
    keys: keyRing,
    ids,
  });
  const login = new DiscordLoginService({
    unitOfWork: persistence.authentication.unitOfWork,
    clock,
    ids,
  });
  const credentials = new OAuthCredentialService({
    unitOfWork: persistence.authentication.unitOfWork,
    clock,
    crypto,
    keys: keyRing,
    ids,
    provider,
    refreshSkewMs: authenticationConfiguration.discord().tokenRefreshSkewMs,
  });
  const sessions = new BrowserSessionService({
    unitOfWork: persistence.authentication.unitOfWork,
    clock,
    crypto,
    keys: keyRing,
    ids,
    metadata,
  });
  const memberships = new DiscordGuildMembershipService({
    unitOfWork: persistence.authentication.unitOfWork,
    clock,
    ids,
    credentials,
    verifier: provider,
  });
  const server = createApiServer({
    configuration: apiConfiguration,
    health,
    logger,
    registerRoutes: (instance) => {
      if (input.portalDirectory !== undefined)
        registerPortalStaticRoutes(instance, { directory: input.portalDirectory });
      return registerBrowserAuthenticationRoutes(instance, {
        configuration: authenticationConfiguration,
        provider,
        oauthTransactions,
        login,
        credentials,
        sessions,
        memberships,
        guilds: persistence.repositories.guilds,
        authorizer,
        roleMenus,
        community,
        roles,
        features,
        unitOfWork: persistence.authentication.unitOfWork,
        logger,
      });
    },
  });
  const kernel = new PlatformKernel();
  kernel.registerModule(
    new ApiPermissionPersistenceModule(
      database,
      persistence.repositories,
      authorizer,
      unsubscribeInvalidations,
      health,
    ),
  );
  const apiModule = new ApiModule(server, apiConfiguration, health);
  kernel.registerModule(apiModule);
  return new ApiApplication(
    kernel,
    apiConfiguration,
    authenticationConfiguration,
    health,
    apiModule,
  );
}

async function withTimeout(
  operation: Promise<void>,
  timeoutMs: number,
  reason: string,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(reason)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

import cookie from "@fastify/cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  AuthenticationInfrastructureError,
  AuthenticationServiceError,
  BrowserSessionService,
  DiscordGuildMembershipService,
  DiscordLoginService,
  OAuthCredentialService,
  OAuthTransactionService,
  authenticationCorrelationId,
  authenticationRequestId,
  discordGuildId,
  guildId,
  type AuthenticationUnitOfWork,
  type DiscordGuildMembership,
  type DiscordGuildMembershipVerifier,
  type DiscordOAuthProvider,
  type ExternalIdentity,
  type OpaqueAuthenticationSecret,
  opaqueAuthenticationSecret,
  providerIssuedSecret,
} from "@qbox/authentication";
import type { GuildRepository } from "@qbox/permissions";
import type {
  Permission,
  PermissionAuthorizer,
  PermissionAuthorizationDecision,
  PermissionPrincipal,
} from "@qbox/permissions";
import { RoleMenuError, type RoleMenuService } from "@qbox/role-menus";
import { CommunityFeatureError, type CounterType, type DiscordCommunityService, type SuggestionStatus } from "@qbox/discord-community";
import { RoleManagementError, type RoleManagementService } from "@qbox/discord-roles";
import {
  AuthenticationRequiredApiError,
  AuthorizationDeniedApiError,
  ConflictApiError,
  DependencyUnavailableApiError,
  ValidationApiError,
} from "../errors/ApiError.js";
import type { ApiLogger } from "../logging/ApiLogger.js";
import { cookieSecret, type ApiAuthenticationConfiguration } from "./ApiAuthenticationConfiguration.js";
import { AuthenticationCaches, membershipCacheKey } from "./AuthenticationCaches.js";
import { requestMemo, setRequestMemo } from "../cache/RequestMemo.js";
import type { ApiFeature, ApiFeatureContext } from "../features/ApiFeature.js";
import {
  GUILD_COOKIE_MAX_AGE_SECONDS,
  GUILD_COOKIE_NAME,
  currentGuildId,
  requireCurrentGuildId,
  runInGuildScope,
  setCurrentGuildId,
} from "./CurrentGuild.js";
import type { DiscordGuildAuthority } from "./DiscordGuildAuthority.js";
import type { DiscordUserGuildSource, GuildDirectory, GuildListing, GuildSummary } from "./GuildDirectory.js";

/** Dependencies for browser-visible authentication and dashboard routes. */
export interface BrowserAuthenticationRouteDependencies {
  readonly configuration: ApiAuthenticationConfiguration;
  readonly provider: DiscordOAuthProvider & DiscordGuildMembershipVerifier & DiscordUserGuildSource;
  readonly oauthTransactions: OAuthTransactionService;
  readonly login: DiscordLoginService;
  readonly credentials: OAuthCredentialService;
  readonly sessions: BrowserSessionService;
  readonly memberships: DiscordGuildMembershipService;
  readonly guilds: Pick<GuildRepository, "findByDiscordId" | "create">;
  /** Servers the member and the bot share; drives the server picker and the current-server cookie. */
  readonly directory: GuildDirectory;
  readonly authorizer: PermissionAuthorizer;
  readonly roleMenus: RoleMenuService;
  readonly community: DiscordCommunityService;
  readonly roles: RoleManagementService;
  /** Pluggable features that register their own routes. */
  readonly features?: readonly ApiFeature[];
  /** Discord owner / Administrator / Manage Server bypass; absent when the bot token is not configured. */
  readonly guildAuthority?: DiscordGuildAuthority;
  /** Serve the built-in dashboard at `/`. Off when the portal owns `/`. */
  readonly serveDashboard?: boolean;
  readonly unitOfWork: AuthenticationUnitOfWork;
  readonly logger: ApiLogger;
  /** Short in-process caches for session, account, membership, and guild-row reads; created when absent. */
  readonly caches?: AuthenticationCaches;
}

type RouteDependencies = BrowserAuthenticationRouteDependencies & { readonly caches: AuthenticationCaches };

const SESSION_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;
const CSRF_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const SNOWFLAKE = /^[1-9][0-9]{16,19}$/u;
const verifiedSessions = new WeakMap<FastifyRequest, Promise<Awaited<ReturnType<BrowserSessionService["verifySession"]>>>>();

/** Registers the QboxPlatform browser dashboard and proof-of-concept auth routes. */
export async function registerBrowserAuthenticationRoutes(
  server: FastifyInstance,
  input: BrowserAuthenticationRouteDependencies,
): Promise<void> {
  const dependencies: RouteDependencies = { ...input, caches: input.caches ?? new AuthenticationCaches(input.sessions) };
  const diagnostics = dependencies.configuration.diagnostics();
  await server.register(cookie);

  server.addHook("onRequest", (_request, _reply, done) => {
    runInGuildScope(() => done());
  });
  // Only API routes use the current server; portal files and sign-in routes skip the lookup.
  server.addHook("preHandler", async (request, reply) => {
    if (!isApiRequest(request)) return;
    setCurrentGuildId(await resolveCurrentGuild(request, reply, dependencies));
  });

  if (dependencies.serveDashboard !== false)
    server.get("/", async (_request, reply) =>
      reply.type("text/html; charset=utf-8").send(dashboardHtml()),
    );

  server.get("/auth/discord/start", async (request, reply) => {
    const context = operationContext(request);
    const issued = await dependencies.oauthTransactions.createTransaction({
      purpose: "LOGIN",
      redirectKey: "discord-login",
      returnTargetKey: "dashboard",
      pkceMode: diagnostics.discord.pkceCapability,
      context,
    });
    setOauthBindingCookie(reply, dependencies.configuration, issued.browserBinding);
    const url = dependencies.provider.createAuthorizationUrl({
      state: issued.state,
      redirectUri: new URL(diagnostics.callbackUrl),
      scopes: diagnostics.discord.scopes,
    });
    return reply.redirect(url.toString());
  });

  server.get("/auth/discord/callback", async (request, reply) => {
    const query = callbackQuery(request);
    if (query.error !== undefined) {
      return redirectAuthFailure(reply, "cancelled");
    }
    if (query.code === undefined || query.state === undefined)
      return redirectAuthFailure(reply, "invalid");
    const binding = cookieSecret(readCookie(request, diagnostics.oauthBindingCookieName));
    if (!binding) return redirectAuthFailure(reply, "binding");
    const context = operationContext(request);
    let claimed;
    try {
      claimed = await dependencies.oauthTransactions.claimTransaction(
        opaqueAuthenticationSecret(query.state),
        binding,
        context,
      );
      const token = await dependencies.provider.exchangeCode({
        authorizationCode: providerIssuedSecret(query.code),
        redirectUri: new URL(diagnostics.callbackUrl),
        signal: request.apiContext.signal,
      });
      const identity = await dependencies.provider.fetchIdentity(
        token.accessToken,
        request.apiContext.signal,
      );
      const account = await dependencies.login.resolveLogin(
        {
          userId: identity.userId,
          ...(identity.username ? { username: identity.username } : {}),
          ...(identity.globalName ? { globalName: identity.globalName } : {}),
          ...(identity.avatar ? { avatar: identity.avatar } : {}),
        },
        context,
      );
      await dependencies.credentials.persistLoginGrant({
        externalIdentityId: account.externalIdentity.id,
        tokenResult: token,
        context,
      });
      dependencies.directory.forget(account.externalIdentity.id);
      dependencies.caches.forgetIdentity(account.externalIdentity.id);
      if (diagnostics.defaultGuildId !== undefined)
        await verifyDefaultGuildMembership(
          account.externalIdentity.id,
          diagnostics.defaultGuildId,
          token.accessToken,
          context,
          request,
          dependencies,
        );
      const issuedSession = await dependencies.sessions.createSession({
        platformUserId: account.platformUser.id,
        loginIdentityId: account.externalIdentity.id,
        context,
        clientMetadata: clientMetadata(request),
      });
      await dependencies.oauthTransactions.completeTransaction(
        claimed.transaction.id,
        context,
      );
      setSessionCookies(reply, dependencies.configuration, issuedSession);
      clearOauthBindingCookie(reply, dependencies.configuration);
      return reply.redirect("/");
    } catch (error) {
      dependencies.logger.warn(
        { event: "api.auth.discord-callback-failed", category: safeErrorCategory(error) },
        "Discord OAuth callback failed.",
      );
      if (claimed !== undefined) {
        try {
          await dependencies.oauthTransactions.failTransaction(
            claimed.transaction.id,
            "DEPENDENCY_UNAVAILABLE",
            context,
          );
        } catch {
          // The redirect error remains authoritative for this request.
        }
      }
      clearOauthBindingCookie(reply, dependencies.configuration);
      return redirectAuthFailure(reply, errorToDashboardCode(error));
    }
  });

  server.get("/api/v1/me", async (request) => {
    const verified = await requireSession(request, dependencies);
    const account = await loadAccountSummary(request, verified.actor.authentication.loginIdentityId, dependencies);
    const guildDiscordId = currentGuildId();
    const listing = await safeDirectoryCall(() =>
      listGuilds(request, account.identity, dependencies),
    );
    const refresh = queryFlag(request, "refresh");
    const membership =
      guildDiscordId === undefined
        ? undefined
        : refresh && listing.guilds.some((entry) => entry.id === guildDiscordId)
          ? await verifyMembership(account.identity.id, guildDiscordId, "api-authentication-me", operationContext(request), request, dependencies)
          : await storedMembership(request, account.identity.id, guildDiscordId, dependencies);
    const access = guildDiscordId === undefined ? undefined : await memberAccess(request, account.identity, guildDiscordId, membership, dependencies);
    // Qbox permissions and Discord's owner/administrator facts are independent; read them together.
    const [permissions, discordManager] = await Promise.all([
      permissionSummary(account.identity, access, dependencies),
      guildDiscordId !== undefined && access?.present
        ? dependencies.guildAuthority?.isManager(
            guildDiscordId,
            account.identity.providerSubjectId,
            access.roleIds,
          ).then((manager) => manager, () => false) ?? false
        : false,
    ]);
    const guild =
      guildDiscordId === undefined
        ? null
        : listing.guilds.find((entry) => entry.id === guildDiscordId) ??
          {
            id: guildDiscordId,
            name: guildDiscordId,
            icon: null,
            canManage: discordManager || permissions.platformAdmin.allowed,
          };
    return {
      account: {
        platformUserId: verified.actor.platformUserId,
        externalIdentityId: account.identity.id,
        discordUserId: account.identity.providerSubjectId,
        username: account.identity.profile.username ?? null,
        globalName: account.identity.profile.globalName ?? null,
        avatar: account.identity.profile.avatar ?? null,
      },
      membership: membershipSummary(membership, guildDiscordId, access),
      guild: guild === null ? null : { id: guild.id, name: guild.name, icon: guild.icon, canManage: guild.canManage },
      guilds: listing.guilds,
      inviteUrl: inviteUrl(diagnostics.discord.clientId),
      reauthRequired: listing.reauthRequired,
      session: {
        id: verified.session.id,
        authenticatedAt: verified.session.authenticatedAt.toISOString(),
        idleExpiresAt: verified.session.idleExpiresAt.toISOString(),
        absoluteExpiresAt: verified.session.absoluteExpiresAt.toISOString(),
      },
      permissions: { ...permissions, discordManager },
      health: { live: "/health/live", ready: "/health/ready" },
    };
  });

  server.get("/api/v1/guilds", async (request) => {
    const verified = await requireSession(request, dependencies);
    const account = await loadAccountSummary(request, verified.actor.authentication.loginIdentityId, dependencies);
    const listing = await safeDirectoryCall(() =>
      dependencies.directory.list(account.identity, operationContext(request), request.apiContext.signal, {
        refresh: queryFlag(request, "refresh"),
      }),
    );
    return { data: listing.guilds, reauthRequired: listing.reauthRequired };
  });

  server.post("/api/v1/guilds/select", async (request, reply) => {
    await requireCsrf(request, dependencies);
    const verified = await requireSession(request, dependencies);
    const account = await loadAccountSummary(request, verified.actor.authentication.loginIdentityId, dependencies);
    const selected = stringField(objectBody(request), "guildId");
    if (!SNOWFLAKE.test(selected))
      throw new ValidationApiError([{ path: ["body", "guildId"], code: "invalid_type", message: "guildId must be a Discord server ID." }]);
    const listing = await safeDirectoryCall(() =>
      listGuilds(request, account.identity, dependencies),
    );
    const guild = listing.guilds.find((entry) => entry.id === selected);
    if (!guild) throw new AuthorizationDeniedApiError();
    const membership = await verifyMembership(account.identity.id, selected, "api-guild-select", operationContext(request), request, dependencies);
    if (membership.status !== "PRESENT") throw new AuthorizationDeniedApiError();
    writeCookie(reply, GUILD_COOKIE_NAME, selected, {
      httpOnly: true,
      secure: diagnostics.secureCookies,
      sameSite: "lax",
      path: "/",
      maxAge: GUILD_COOKIE_MAX_AGE_SECONDS,
    });
    return { data: guild };
  });

  server.post("/api/v1/guilds/clear", async (request, reply) => {
    await requireCsrf(request, dependencies);
    await requireSession(request, dependencies);
    deleteCookie(reply, GUILD_COOKIE_NAME);
    return { success: true };
  });

  server.get("/api/v1/admin-check", async (request) => {
    const verified = await requireSession(request, dependencies);
    const account = await loadAccountSummary(request, verified.actor.authentication.loginIdentityId, dependencies);
    const guildDiscordId = currentGuildId();
    const membership =
      guildDiscordId === undefined
        ? undefined
        : await storedMembership(request, account.identity.id, guildDiscordId, dependencies);
    const access = guildDiscordId === undefined ? undefined : await memberAccess(request, account.identity, guildDiscordId, membership, dependencies);
    const permissions = await permissionSummary(account.identity, access, dependencies);
    if (!permissions.platformAdmin.allowed) throw new AuthorizationDeniedApiError();
    return { allowed: true, decision: permissions.platformAdmin };
  });

  server.get("/api/v1/discord/role-menus", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    return { data: await dependencies.roleMenus.listByGuild(requireCurrentGuildId()) };
  });

  server.post("/api/v1/discord/role-menus", async (request) => {
    const { account } = await requireRoleMenuManager(request, dependencies);
    const body = objectBody(request);
    const description = optionalStringField(body, "description");
    return {
      data: await safeRoleMenuCall(() =>
        dependencies.roleMenus.createDraft({
          guildId: requireCurrentGuildId(),
          channelId: stringField(body, "channelId"),
          title: stringField(body, "title"),
          ...(description === undefined ? {} : { description }),
          presentationType: enumField(body, "presentationType", ["BUTTONS", "SELECT_MENU", "REACTIONS"]),
          assignmentMode: enumField(body, "assignmentMode", ["TOGGLE", "ADD_ONLY", "REMOVE_ONLY", "EXCLUSIVE"]),
          createdByDiscordUserId: account.identity.providerSubjectId,
        }),
      ),
    };
  });

  server.get("/api/v1/discord/role-menus/:id", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    const menu = await dependencies.roleMenus.getById(param(request, "id"));
    if (!menu) throw new ValidationApiError([{ path: ["id"], code: "not_found", message: "Role menu was not found." }]);
    return { data: menu };
  });

  server.patch("/api/v1/discord/role-menus/:id", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    const body = objectBody(request);
    const channelId = optionalStringField(body, "channelId");
    const title = optionalStringField(body, "title");
    const description = optionalStringField(body, "description");
    const presentationType = optionalEnumField(body, "presentationType", ["BUTTONS", "SELECT_MENU", "REACTIONS"]);
    const assignmentMode = optionalEnumField(body, "assignmentMode", ["TOGGLE", "ADD_ONLY", "REMOVE_ONLY", "EXCLUSIVE"]);
    return {
      data: await safeRoleMenuCall(() =>
        dependencies.roleMenus.updateDraft(param(request, "id"), {
          ...(channelId === undefined ? {} : { channelId }),
          ...(title === undefined ? {} : { title }),
          ...(description === undefined ? {} : { description }),
          ...(presentationType === undefined ? {} : { presentationType }),
          ...(assignmentMode === undefined ? {} : { assignmentMode }),
          expectedRevision: integerField(body, "expectedRevision"),
          source: "WEB",
        }),
      ),
    };
  });

  server.delete("/api/v1/discord/role-menus/:id", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    await dependencies.roleMenus.delete(param(request, "id"));
    return { ok: true };
  });

  server.post("/api/v1/discord/role-menus/:id/options", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    const body = objectBody(request);
    const description = optionalStringField(body, "description");
    const emoji = optionalStringField(body, "emoji");
    return {
      data: await safeRoleMenuCall(() =>
        dependencies.roleMenus.addOption(param(request, "id"), {
          roleId: stringField(body, "roleId"),
          label: stringField(body, "label"),
          ...(description === undefined ? {} : { description }),
          ...(emoji === undefined ? {} : { emoji }),
          expectedRevision: integerField(body, "expectedRevision"),
          source: "WEB",
        }),
      ),
    };
  });

  server.patch("/api/v1/discord/role-menus/:id/options/:optionId", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    const body = objectBody(request);
    const roleId = optionalStringField(body, "roleId");
    const label = optionalStringField(body, "label");
    const description = optionalStringField(body, "description");
    const emoji = optionalStringField(body, "emoji");
    return {
      data: await safeRoleMenuCall(() =>
        dependencies.roleMenus.updateOption(param(request, "id"), param(request, "optionId"), {
          ...(roleId === undefined ? {} : { roleId }),
          ...(label === undefined ? {} : { label }),
          ...(description === undefined ? {} : { description }),
          ...(emoji === undefined ? {} : { emoji }),
          expectedRevision: integerField(body, "expectedRevision"),
          source: "WEB",
        }),
      ),
    };
  });

  server.delete("/api/v1/discord/role-menus/:id/options/:optionId", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    const body = objectBody(request);
    return {
      data: await dependencies.roleMenus.removeOption(param(request, "id"), param(request, "optionId"), {
        expectedRevision: integerField(body, "expectedRevision"),
        source: "WEB",
      }),
    };
  });

  server.post("/api/v1/discord/role-menus/:id/publish", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    const body = objectBody(request);
    return {
      data: await safeRoleMenuCall(() =>
        dependencies.roleMenus.publish(param(request, "id"), stringField(body, "messageId"), {
          expectedRevision: integerField(body, "expectedRevision"),
          source: "WEB",
        }),
      ),
    };
  });

  server.post("/api/v1/discord/role-menus/:id/disable", async (request) => {
    await requireRoleMenuManager(request, dependencies);
    const body = objectBody(request);
    return { data: await dependencies.roleMenus.disable(param(request, "id"), {
      expectedRevision: integerField(body, "expectedRevision"),
      source: "WEB",
    }) };
  });

  server.get("/api/v1/discord/roles", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await requireDiscordManager(request, dependencies, "discord.roles.manage");
    return { data: await safeRoleCall(() => dependencies.roles.listRoles(requireCurrentGuildId())) };
  });

  server.get("/api/v1/discord/roles/capabilities", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await requireDiscordManager(request, dependencies, "discord.roles.manage");
    return { data: await safeRoleCall(() => dependencies.roles.capabilities(requireCurrentGuildId())) };
  });

  server.get("/api/v1/discord/roles/:roleId", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await requireDiscordManager(request, dependencies, "discord.roles.manage");
    return { data: await safeRoleCall(() => dependencies.roles.inspectRole(requireCurrentGuildId(), param(request, "roleId"))) };
  });

  server.get("/api/v1/discord/roles/:roleId/dependencies", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await requireDiscordManager(request, dependencies, "discord.roles.manage");
    return { data: await dependencies.roles.listDependencies(requireCurrentGuildId(), param(request, "roleId")) };
  });

  server.post("/api/v1/discord/roles", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const { account } = await requireDiscordManager(request, dependencies, "discord.roles.manage");
    const body = objectBody(request);
    const allowAdministrator = await roleAdministratorAllowed(request, dependencies, body);
    return {
      data: await safeRoleCall(() =>
        dependencies.roles.createRole({
          guildId: requireCurrentGuildId(),
          name: stringField(body, "name"),
          ...(optionalStringField(body, "color") === undefined ? {} : { color: optionalStringField(body, "color") }),
          ...(optionalBooleanField(body, "hoist") === undefined ? {} : { hoist: optionalBooleanField(body, "hoist") }),
          ...(optionalBooleanField(body, "mentionable") === undefined ? {} : { mentionable: optionalBooleanField(body, "mentionable") }),
          ...(optionalIntegerField(body, "position") === undefined ? {} : { position: optionalIntegerField(body, "position") }),
          ...(allowAdministrator ? { allowAdministrator } : {}),
          actor: { type: "platform-user", id: account.identity.providerSubjectId },
          source: "WEB",
        }),
      ),
    };
  });

  server.patch("/api/v1/discord/roles/:roleId", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const { account } = await requireDiscordManager(request, dependencies, "discord.roles.manage");
    const body = objectBody(request);
    const allowAdministrator = await roleAdministratorAllowed(request, dependencies, body);
    const name = optionalStringField(body, "name");
    const color = optionalStringField(body, "color");
    const hoist = optionalBooleanField(body, "hoist");
    const mentionable = optionalBooleanField(body, "mentionable");
    const position = optionalIntegerField(body, "position");
    return {
      data: await safeRoleCall(() =>
        dependencies.roles.editRole({
          guildId: requireCurrentGuildId(),
          roleId: param(request, "roleId"),
          ...(name === undefined ? {} : { name }),
          ...(color === undefined ? {} : { color }),
          ...(hoist === undefined ? {} : { hoist }),
          ...(mentionable === undefined ? {} : { mentionable }),
          ...(position === undefined ? {} : { position }),
          ...(allowAdministrator ? { allowAdministrator } : {}),
          actor: { type: "platform-user", id: account.identity.providerSubjectId },
          source: "WEB",
        }),
      ),
    };
  });

  server.delete("/api/v1/discord/roles/:roleId", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const { account } = await requireDiscordManager(request, dependencies, "discord.roles.manage");
    const body = objectBody(request);
    await safeRoleCall(() =>
      dependencies.roles.deleteRole({
        guildId: requireCurrentGuildId(),
        roleId: param(request, "roleId"),
        confirmation: stringField(body, "confirmation"),
        actor: { type: "platform-user", id: account.identity.providerSubjectId },
        source: "WEB",
      }),
    );
    return { ok: true };
  });

  server.post("/api/v1/discord/roles/:roleId/move", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const { account } = await requireDiscordManager(request, dependencies, "discord.roles.manage");
    const body = objectBody(request);
    return {
      data: await safeRoleCall(() =>
        dependencies.roles.moveRole({
          guildId: requireCurrentGuildId(),
          roleId: param(request, "roleId"),
          position: integerField(body, "position"),
          actor: { type: "platform-user", id: account.identity.providerSubjectId },
          source: "WEB",
        }),
      ),
    };
  });

  server.post("/api/v1/discord/roles/:roleId/replace-dependency", async (request, reply) => {
    reply.header("cache-control", "no-store");
    const { account } = await requireDiscordManager(request, dependencies, "discord.roles.manage");
    const body = objectBody(request);
    return {
      data: {
        changed: await safeRoleCall(() =>
          dependencies.roles.replaceDependency({
            guildId: requireCurrentGuildId(),
            oldRoleId: param(request, "roleId"),
            newRoleId: stringField(body, "newRoleId"),
            actor: { type: "platform-user", id: account.identity.providerSubjectId },
            source: "WEB",
          }),
        ),
      },
    };
  });

  server.get("/api/v1/discord/resources/roles", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await requireDiscordManager(request, dependencies, "discord.roles.manage");
    return { data: await safeRoleCall(() => dependencies.roles.listRoles(requireCurrentGuildId())) };
  });

  server.get("/api/v1/discord/resources/bot-capabilities", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await requireDiscordManager(request, dependencies, "discord.roles.manage");
    return { data: await safeRoleCall(() => dependencies.roles.capabilities(requireCurrentGuildId())) };
  });

  server.get("/api/v1/discord/resources/channels", async (request, reply) => {
    reply.header("cache-control", "no-store");
    await requireDiscordManager(request, dependencies, "discord.roles.manage");
    return { data: await safeRoleCall(() => dependencies.roles.listChannels(requireCurrentGuildId())) };
  });

  const communityRoutes = [
    ["welcome", "discord.welcome.manage"],
    ["goodbye", "discord.welcome.manage"],
    ["autoroles", "discord.autoroles.manage"],
    ["rules", "discord.rules.manage"],
    ["counters", "discord.counters.manage"],
    ["logs", "discord.logs.manage"],
    ["embeds", "discord.embeds.manage"],
    ["custom-commands", "discord.custom-commands.manage"],
    ["suggestions", "discord.suggestions.manage"],
    ["starboard", "discord.starboard.manage"],
  ] as const;

  for (const [route, permission] of communityRoutes) {
    server.get(`/api/v1/discord/${route}`, async (request) => {
      await requireDiscordManager(request, dependencies, permission);
      return { data: await dependencies.community.settings(requireCurrentGuildId()) };
    });
  }

  server.put("/api/v1/discord/welcome", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.welcome.manage");
    const body = objectBody(request);
    return { data: await dependencies.community.saveWelcomeGoodbye({ guildId: requireCurrentGuildId(), kind: "WELCOME", enabled: booleanField(body, "enabled"), channelId: stringField(body, "channelId"), messageText: stringField(body, "messageText"), embedEnabled: optionalBooleanField(body, "embedEnabled") ?? false, ...(optionalStringField(body, "embedTitle") ? { embedTitle: optionalStringField(body, "embedTitle") } : {}), ...(optionalStringField(body, "embedDescription") ? { embedDescription: optionalStringField(body, "embedDescription") } : {}), ...(optionalStringField(body, "embedColor") ? { embedColor: optionalStringField(body, "embedColor") } : {}), thumbnailAvatar: optionalBooleanField(body, "thumbnailAvatar") ?? true, directMessageEnabled: optionalBooleanField(body, "directMessageEnabled") ?? false }) };
  });

  server.put("/api/v1/discord/goodbye", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.welcome.manage");
    const body = objectBody(request);
    return { data: await dependencies.community.saveWelcomeGoodbye({ guildId: requireCurrentGuildId(), kind: "GOODBYE", enabled: booleanField(body, "enabled"), channelId: stringField(body, "channelId"), messageText: stringField(body, "messageText"), embedEnabled: optionalBooleanField(body, "embedEnabled") ?? false, thumbnailAvatar: optionalBooleanField(body, "thumbnailAvatar") ?? true, directMessageEnabled: false }) };
  });

  server.put("/api/v1/discord/autoroles", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.autoroles.manage");
    const settings = await dependencies.community.settings(requireCurrentGuildId());
    const body = objectBody(request);
    return { data: await safeCommunityCall(() => dependencies.community.saveAutoroles({ ...settings.autoroles, enabled: booleanField(body, "enabled"), delaySeconds: optionalIntegerField(body, "delaySeconds") ?? settings.autoroles.delaySeconds, includeBots: optionalBooleanField(body, "includeBots") ?? settings.autoroles.includeBots, expectedRevision: integerField(body, "expectedRevision"), source: "WEB" })) };
  });

  server.post("/api/v1/discord/autoroles/roles", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.autoroles.manage");
    return { data: await dependencies.community.addAutorole({ guildId: requireCurrentGuildId(), roleId: stringField(objectBody(request), "roleId") }) };
  });

  server.put("/api/v1/discord/rules", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.rules.manage");
    const body = objectBody(request);
    return { data: await safeCommunityCall(() => dependencies.community.saveRules({ guildId: requireCurrentGuildId(), enabled: booleanField(body, "enabled"), channelId: stringField(body, "channelId"), messageText: stringField(body, "messageText"), buttonLabel: optionalStringField(body, "buttonLabel") ?? "Accept Rules", acceptedRoleId: stringField(body, "acceptedRoleId"), ...(optionalStringField(body, "pendingRoleId") ? { pendingRoleId: optionalStringField(body, "pendingRoleId") } : {}), expectedRevision: integerField(body, "expectedRevision"), source: "WEB" })) };
  });

  server.post("/api/v1/discord/counters", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.counters.manage");
    const body = objectBody(request);
    return { data: await dependencies.community.saveCounter({ guildId: requireCurrentGuildId(), enabled: optionalBooleanField(body, "enabled") ?? true, channelId: stringField(body, "channelId"), labelTemplate: stringField(body, "labelTemplate"), type: counterTypeField(body, "type"), ...(optionalStringField(body, "roleId") ? { roleId: optionalStringField(body, "roleId") } : {}), intervalSeconds: optionalIntegerField(body, "intervalSeconds") ?? 300 }) };
  });

  server.put("/api/v1/discord/logs", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.logs.manage");
    const body = objectBody(request);
    return { data: await dependencies.community.saveLogs({ guildId: requireCurrentGuildId(), enabled: booleanField(body, "enabled"), events: stringArrayField(body, "events"), destinations: recordField(body, "destinations"), ignoredChannels: stringArrayField(body, "ignoredChannels"), ignoredRoles: stringArrayField(body, "ignoredRoles"), ignoredUsers: stringArrayField(body, "ignoredUsers"), includeBots: optionalBooleanField(body, "includeBots") ?? false, contentMode: "REDACTED", colors: recordField(body, "colors") }) };
  });

  server.post("/api/v1/discord/embeds", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.embeds.manage");
    const body = objectBody(request);
    return { data: await dependencies.community.saveEmbedTemplate({ guildId: requireCurrentGuildId(), name: stringField(body, "name"), ...(optionalStringField(body, "title") ? { title: optionalStringField(body, "title") } : {}), ...(optionalStringField(body, "description") ? { description: optionalStringField(body, "description") } : {}), timestamp: optionalBooleanField(body, "timestamp") ?? false, fields: [], allowedRoleMentions: stringArrayField(body, "allowedRoleMentions") }) };
  });

  server.post("/api/v1/discord/custom-commands", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.custom-commands.manage");
    const body = objectBody(request);
    return { data: await dependencies.community.saveCustomCommand({ guildId: requireCurrentGuildId(), name: stringField(body, "name"), description: optionalStringField(body, "description") ?? "Custom response.", responseText: stringField(body, "responseText"), enabled: optionalBooleanField(body, "enabled") ?? true, allowedChannels: stringArrayField(body, "allowedChannels"), deniedChannels: stringArrayField(body, "deniedChannels"), requiredRoles: stringArrayField(body, "requiredRoles"), cooldownSeconds: optionalIntegerField(body, "cooldownSeconds") ?? 0, triggerMode: "SLASH_ONLY", deleteTriggeringMessage: false }) };
  });

  server.post("/api/v1/discord/suggestions/:id/status", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.suggestions.manage");
    return { data: await dependencies.community.updateSuggestion({ guildId: requireCurrentGuildId(), id: param(request, "id"), status: suggestionStatusField(objectBody(request), "status") }) };
  });

  server.put("/api/v1/discord/starboard", async (request) => {
    await requireDiscordManager(request, dependencies, "discord.starboard.manage");
    const body = objectBody(request);
    return { data: await dependencies.community.saveStarboard({ guildId: requireCurrentGuildId(), enabled: booleanField(body, "enabled"), destinationChannelId: stringField(body, "destinationChannelId"), emoji: optionalStringField(body, "emoji") ?? "\u2b50", threshold: optionalIntegerField(body, "threshold") ?? 3, allowSelfStar: optionalBooleanField(body, "allowSelfStar") ?? false, includeBotMessages: optionalBooleanField(body, "includeBotMessages") ?? false, nsfw: "BLOCK", mode: "DENYLIST", channels: stringArrayField(body, "channels"), ignoredRoles: stringArrayField(body, "ignoredRoles") }) };
  });

  const featureContext: ApiFeatureContext = {
    get guildId() {
      return requireCurrentGuildId();
    },
    guard: async (request, permission, options) => {
      if (options.mutation) await requireCsrf(request, dependencies);
      const { account, roleIds } = await requireDiscordManager(request, dependencies, permission);
      return identityOf(account, roleIds);
    },
    member: async (request, options) => {
      if (options.mutation) await requireCsrf(request, dependencies);
      const { account, roleIds } = await requireGuildMember(request, dependencies);
      return identityOf(account, roleIds);
    },
    platformOwner: (request) => requestMemo(request, "platform-owner", async () => {
      const { account, roleIds } = await requireGuildMember(request, dependencies);
      const guildDiscordId = requireCurrentGuildId();
      const principals: PermissionPrincipal[] = [
        { type: "discord-user", externalId: account.identity.providerSubjectId, guildId: guildDiscordId },
        ...roleIds.map((roleId) => ({ type: "discord-role" as const, externalId: roleId, guildId: guildDiscordId })),
      ];
      const decision = await dependencies.authorizer.authorize({
        principals,
        scope: { type: "platform" },
        required: ["platform.owner"],
        mode: "all",
        administratorOverride: false,
      });
      return decision.allowed;
    }),
  };
  for (const feature of dependencies.features ?? []) feature.register(server, featureContext);

  server.post("/auth/logout", async (request, reply) => {
    validateSameOrigin(request, diagnostics.dashboardUrl);
    const sessionSecret = cookieSecret(readCookie(request, diagnostics.sessionCookieName));
    const csrfCookie = cookieSecret(readCookie(request, diagnostics.csrfCookieName));
    const csrfHeader = cookieSecret(singleHeader(request.headers["x-csrf-token"]));
    if (!sessionSecret || !csrfCookie || !csrfHeader || csrfCookie !== csrfHeader)
      throw new AuthenticationRequiredApiError();
    const verified = await dependencies.sessions.verifySessionCsrf(
      sessionSecret,
      csrfHeader,
    );
    dependencies.caches.sessions.forget(sessionSecret);
    await dependencies.sessions.revokeCurrentSession(sessionSecret, {
      correlationId: authenticationCorrelationId(request.apiContext.correlationId),
      requestId: authenticationRequestId(request.apiContext.requestId),
      actor: { type: "platform-user", id: verified.actor.platformUserId },
    });
    dependencies.caches.sessions.forget(sessionSecret);
    dependencies.caches.forgetIdentity(verified.actor.authentication.loginIdentityId);
    clearSessionCookies(reply, dependencies.configuration);
    return { success: true };
  });
}

async function requireSession(
  request: FastifyRequest,
  dependencies: RouteDependencies,
) {
  if (request.headers.authorization !== undefined)
    throw new AuthenticationRequiredApiError();
  const diagnostics = dependencies.configuration.diagnostics();
  const secret = cookieSecret(readCookie(request, diagnostics.sessionCookieName));
  if (!secret) throw new AuthenticationRequiredApiError();
  try {
    const pending = verifiedSessions.get(request) ?? dependencies.caches.sessions.verifySession(secret);
    verifiedSessions.set(request, pending);
    const verified = await pending;
    request.apiContext = Object.freeze({
      ...request.apiContext,
      actor: verified.actor,
      logger: request.apiContext.logger.child({
        actorType: verified.actor.type,
        platformUserId: verified.actor.platformUserId,
      }),
    });
    return verified;
  } catch {
    throw new AuthenticationRequiredApiError();
  }
}

/**
 * Resolves the current server for this request.
 *
 * 1. The `qbox_guild` cookie, when the signed-in member and the bot still
 *    share that server (a cookie for a server they no longer share is cleared).
 * 2. Otherwise a server picked for them and remembered in the cookie: the
 *    configured default when they manage it, else a server they own or
 *    manage, else the default when they belong to it, else their only shared
 *    server. So the owner of another server lands on their own server, not on
 *    the host's default server where they have no access.
 * 3. Otherwise none, and the portal shows the server picker.
 *
 * When Discord cannot be reached, the stored membership and the configured
 * default decide, as before.
 */
async function resolveCurrentGuild(
  request: FastifyRequest,
  reply: FastifyReply,
  dependencies: RouteDependencies,
): Promise<string | undefined> {
  const diagnostics = dependencies.configuration.diagnostics();
  const fallback = diagnostics.defaultGuildId;
  let cookieGuild = readCookie(request, GUILD_COOKIE_NAME);
  if (cookieGuild !== undefined && !SNOWFLAKE.test(cookieGuild)) {
    deleteCookie(reply, GUILD_COOKIE_NAME);
    cookieGuild = undefined;
  }
  let identity: ExternalIdentity;
  try {
    const verified = await requireSession(request, dependencies);
    identity = (await loadAccountSummary(request, verified.actor.authentication.loginIdentityId, dependencies)).identity;
  } catch {
    return fallback;
  }
  let listing: GuildListing;
  try {
    listing = await listGuilds(request, identity, dependencies);
  } catch (error) {
    request.apiContext.logger.warn(
      { event: "api.guilds.directory-unavailable", category: safeErrorCategory(error) },
      "Could not read the member's servers; using the stored membership instead.",
    );
    if (cookieGuild === undefined) return fallback;
    const membership = await storedMembership(request, identity.id, cookieGuild, dependencies);
    return membership?.status === "PRESENT" ? cookieGuild : fallback;
  }
  if (cookieGuild !== undefined) {
    if (listing.guilds.some((guild) => guild.id === cookieGuild)) return cookieGuild;
    deleteCookie(reply, GUILD_COOKIE_NAME);
  }
  if (listing.reauthRequired) return fallback;
  const chosen = chooseStartingGuild(listing.guilds, fallback);
  if (chosen === undefined) return undefined;
  const stored = await storedMembership(request, identity.id, chosen, dependencies);
  if (stored?.status !== "PRESENT") {
    const membership = await verifyMembership(identity.id, chosen, "api-guild-auto-select", operationContext(request), request, dependencies);
    if (membership.status !== "PRESENT") return undefined;
  }
  writeCookie(reply, GUILD_COOKIE_NAME, chosen, {
    httpOnly: true,
    secure: diagnostics.secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: GUILD_COOKIE_MAX_AGE_SECONDS,
  });
  return chosen;
}

/**
 * The server a member starts in when they have not picked one: the default
 * when they manage it, else one they own, else one they manage (by name),
 * else the default when they are in it, else their only shared server.
 */
export function chooseStartingGuild(guilds: readonly GuildSummary[], defaultGuildId: string | undefined): string | undefined {
  const byName = (left: GuildSummary, right: GuildSummary) => left.name.localeCompare(right.name);
  const managed = guilds.filter((guild) => guild.canManage);
  if (defaultGuildId !== undefined && managed.some((guild) => guild.id === defaultGuildId)) return defaultGuildId;
  const owned = managed.filter((guild) => guild.owner).sort(byName);
  if (owned[0]) return owned[0].id;
  const others = [...managed].sort(byName);
  if (others[0]) return others[0].id;
  if (defaultGuildId !== undefined && guilds.some((guild) => guild.id === defaultGuildId)) return defaultGuildId;
  return guilds.length === 1 ? guilds[0]?.id : undefined;
}

/** Verifies and stores the member's current membership in one server, creating the guild row when new. */
async function verifyMembership(
  externalIdentityId: ExternalIdentity["id"],
  guildDiscordId: string,
  source: string,
  context: ReturnType<typeof operationContext>,
  request: FastifyRequest,
  dependencies: RouteDependencies,
): Promise<DiscordGuildMembership> {
  const guild = await dependencies.caches.guildRows.getOrLoad(guildDiscordId, async () =>
    (await dependencies.guilds.findByDiscordId(guildDiscordId)) ??
    (await dependencies.guilds.create(guildDiscordId, { source })),
  );
  const key = membershipCacheKey(externalIdentityId, guildDiscordId);
  dependencies.caches.memberships.delete(key);
  const membership = await dependencies.memberships.verifyCurrentMembership({
    externalIdentityId,
    guildId: guildId(guild.id),
    discordGuildId: discordGuildId(guildDiscordId),
    context,
    signal: request.apiContext.signal,
  });
  dependencies.caches.memberships.set(key, { membership });
  setRequestMemo(request, `membership:${key}`, membership);
  // An ABSENT snapshot ends the member's sessions in the database; stop reusing them here too.
  if (membership.status === "ABSENT") {
    const actor = request.apiContext.actor;
    if (actor.type === "platform-user") dependencies.caches.sessions.forgetAccount(actor.platformUserId);
  }
  return membership;
}

/**
 * After login, records membership in the default server so a browser that has
 * not picked a server can use it right away. Members who are not in it are
 * not verified against it, since an ABSENT snapshot ends their sessions.
 */
async function verifyDefaultGuildMembership(
  externalIdentityId: ExternalIdentity["id"],
  defaultGuildId: string,
  accessToken: OpaqueAuthenticationSecret,
  context: ReturnType<typeof operationContext>,
  request: FastifyRequest,
  dependencies: RouteDependencies,
): Promise<void> {
  let inDefaultGuild = true;
  try {
    const guilds = await dependencies.provider.fetchGuilds(accessToken, request.apiContext.signal);
    inDefaultGuild = guilds.some((guild) => guild.id === defaultGuildId);
  } catch (error) {
    dependencies.logger.warn(
      { event: "api.auth.guild-list-failed", category: safeErrorCategory(error) },
      "Could not list the member's servers after login.",
    );
  }
  if (inDefaultGuild)
    await verifyMembership(externalIdentityId, defaultGuildId, "api-authentication-login", context, request, dependencies);
}

async function safeDirectoryCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof AuthenticationInfrastructureError) throw new DependencyUnavailableApiError();
    if (typeof error === "object" && error !== null && "retryable" in error && "code" in error)
      throw new DependencyUnavailableApiError();
    throw error;
  }
}

function isApiRequest(request: FastifyRequest): boolean {
  return (request.raw.url ?? request.url).startsWith("/api/");
}

function queryFlag(request: FastifyRequest, name: string): boolean {
  return Boolean(request.query && typeof request.query === "object" && Reflect.get(request.query, name) === "1");
}

/** Where a server admin adds the bot; slash commands are registered globally. */
function inviteUrl(clientId: string): string {
  return `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&scope=bot%20applications.commands&permissions=8`;
}

/** Double-submit CSRF check bound to the current browser session. */
async function requireCsrf(
  request: FastifyRequest,
  dependencies: RouteDependencies,
): Promise<void> {
  const diagnostics = dependencies.configuration.diagnostics();
  const sessionSecret = cookieSecret(readCookie(request, diagnostics.sessionCookieName));
  const csrfCookie = cookieSecret(readCookie(request, diagnostics.csrfCookieName));
  const csrfHeader = cookieSecret(singleHeader(request.headers["x-csrf-token"]));
  if (!sessionSecret || !csrfCookie || !csrfHeader || csrfCookie !== csrfHeader)
    throw new AuthenticationRequiredApiError();
  try {
    await dependencies.caches.sessions.verifySessionCsrf(sessionSecret, csrfHeader);
  } catch {
    throw new AuthenticationRequiredApiError();
  }
}

async function requireRoleMenuManager(
  request: FastifyRequest,
  dependencies: RouteDependencies,
) {
  return requireDiscordManager(request, dependencies, "discord.role-menus.manage");
}

function requireGuildMember(
  request: FastifyRequest,
  dependencies: RouteDependencies,
) {
  return requestMemo(request, "guild-member", () => loadGuildMember(request, dependencies));
}

async function loadGuildMember(
  request: FastifyRequest,
  dependencies: RouteDependencies,
) {
  const verified = await requireSession(request, dependencies);
  const account = await loadAccountSummary(request, verified.actor.authentication.loginIdentityId, dependencies);
  const guildDiscordId = requireCurrentGuildId();
  const membership = await storedMembership(request, account.identity.id, guildDiscordId, dependencies);
  const access = await memberAccess(request, account.identity, guildDiscordId, membership, dependencies);
  if (!access.present) throw new AuthorizationDeniedApiError();
  return { verified, account, roleIds: [...access.roleIds] };
}

/**
 * Whether the member is in the server and which roles they hold right now.
 * Read live from Discord through the bot when possible (cached 30 s), so a
 * role given, removed, or recreated in Discord applies without signing in
 * again; otherwise the stored snapshot from sign-in decides.
 */
function memberAccess(
  request: FastifyRequest,
  identity: ExternalIdentity,
  guildDiscordId: string,
  stored: DiscordGuildMembership | undefined,
  dependencies: RouteDependencies,
): Promise<{ readonly present: boolean; readonly roleIds: readonly string[] }> {
  return requestMemo(request, `access:${identity.id}:${guildDiscordId}`, async () => {
    const live = await dependencies.guildAuthority?.liveMember?.(guildDiscordId, identity.providerSubjectId).catch(() => undefined);
    if (live) return live;
    const present = stored?.status === "PRESENT";
    return { present, roleIds: present ? stored.roles.map((role) => role.roleId) : [] };
  });
}

/** Permission decisions are made once per request and permission (list). */
function requireDiscordManager(
  request: FastifyRequest,
  dependencies: RouteDependencies,
  permission: Permission | readonly Permission[],
) {
  const key = typeof permission === "string" ? permission : [...permission].join(",");
  return requestMemo(request, `manager:${key}`, () => decideDiscordManager(request, dependencies, permission));
}

async function decideDiscordManager(
  request: FastifyRequest,
  dependencies: RouteDependencies,
  permission: Permission | readonly Permission[],
) {
  const { verified, account, roleIds } = await requireGuildMember(request, dependencies);
  const guildDiscordId = requireCurrentGuildId();
  if (await dependencies.guildAuthority?.isManager(guildDiscordId, account.identity.providerSubjectId, roleIds))
    return { verified, account, roleIds };
  const principals: PermissionPrincipal[] = [
    { type: "discord-user", externalId: account.identity.providerSubjectId, guildId: guildDiscordId },
    ...roleIds.map((roleId) => ({ type: "discord-role" as const, externalId: roleId, guildId: guildDiscordId })),
  ];
  const decision = await dependencies.authorizer.authorize({
    principals,
    scope: { type: "discord-guild", guildId: guildDiscordId },
    required: typeof permission === "string" ? [permission] : [...permission],
    mode: typeof permission === "string" ? "all" : "any",
    administratorOverride: true,
  });
  if (!decision.allowed) throw new AuthorizationDeniedApiError();
  return { verified, account, roleIds };
}

function identityOf(
  account: Awaited<ReturnType<typeof loadAccountSummary>>,
  roleIds: readonly string[],
) {
  return {
    userId: account.identity.providerSubjectId,
    displayName: account.identity.profile.globalName ?? account.identity.profile.username ?? "Member",
    roleIds,
  };
}

async function safeRoleMenuCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RoleMenuError) {
      if (error.code === "CONFLICT") throw new ConflictApiError(conflictDetails("roleMenu", error.details));
      throw new ValidationApiError([
        { path: ["roleMenu"], code: error.code, message: error.message },
      ]);
    }
    throw error;
  }
}

async function safeCommunityCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof CommunityFeatureError) {
      if (error.code === "CONFLICT") throw new ConflictApiError(conflictDetails("community", error.details));
      if (error.code === "DEPENDENCY_UNAVAILABLE") throw new DependencyUnavailableApiError();
      throw new ValidationApiError([
        { path: ["community"], code: error.code, message: error.message },
      ]);
    }
    throw error;
  }
}

function conflictDetails(
  path: string,
  details: Readonly<Record<string, string | number>> | undefined,
): readonly Readonly<Record<string, unknown>>[] {
  return [{
    path,
    code: "STALE_REVISION",
    ...(details ?? {}),
  }];
}

async function safeRoleCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RoleManagementError) {
      if (error.code === "DISCORD_UNAVAILABLE")
        throw new DependencyUnavailableApiError();
      throw new ValidationApiError([
        { path: ["role"], code: error.code, message: error.message },
      ]);
    }
    throw error;
  }
}

async function roleAdministratorAllowed(
  request: FastifyRequest,
  dependencies: RouteDependencies,
  body: Record<string, unknown>,
): Promise<boolean> {
  if (optionalBooleanField(body, "allowAdministrator") !== true) return false;
  await requireDiscordManager(request, dependencies, "discord.roles.administrator");
  return true;
}

function objectBody(request: FastifyRequest): Record<string, unknown> {
  if (!request.body || typeof request.body !== "object" || Array.isArray(request.body))
    throw new ValidationApiError([{ path: ["body"], code: "invalid_type", message: "JSON object body is required." }]);
  return request.body as Record<string, unknown>;
}

function param(request: FastifyRequest, name: string): string {
  const params = request.params;
  if (!params || typeof params !== "object") throw new ValidationApiError([{ path: ["params"], code: "missing", message: `${name} is required.` }]);
  const value = Reflect.get(params, name);
  if (typeof value !== "string" || value.length === 0)
    throw new ValidationApiError([{ path: ["params", name], code: "invalid_type", message: `${name} is required.` }]);
  return value;
}

function stringField(body: Record<string, unknown>, name: string): string {
  const value = body[name];
  if (typeof value !== "string" || value.length === 0)
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_type", message: `${name} is required.` }]);
  return value;
}

function optionalStringField(body: Record<string, unknown>, name: string): string | undefined {
  const value = body[name];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string")
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_type", message: `${name} must be a string.` }]);
  return value;
}

function booleanField(body: Record<string, unknown>, name: string): boolean {
  const value = body[name];
  if (typeof value !== "boolean")
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_type", message: `${name} is required.` }]);
  return value;
}

function integerField(body: Record<string, unknown>, name: string): number {
  const value = body[name];
  if (!Number.isInteger(value))
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_type", message: `${name} must be integer.` }]);
  return value as number;
}

function optionalBooleanField(body: Record<string, unknown>, name: string): boolean | undefined {
  const value = body[name];
  if (value === undefined) return undefined;
  if (typeof value !== "boolean")
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_type", message: `${name} must be boolean.` }]);
  return value;
}

function optionalIntegerField(body: Record<string, unknown>, name: string): number | undefined {
  const value = body[name];
  if (value === undefined) return undefined;
  if (!Number.isInteger(value))
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_type", message: `${name} must be integer.` }]);
  return value as number;
}

function stringArrayField(body: Record<string, unknown>, name: string): string[] {
  const value = body[name];
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string"))
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_type", message: `${name} must be a string array.` }]);
  return value;
}

function recordField(body: Record<string, unknown>, name: string): Record<string, string> {
  const value = body[name];
  if (value === undefined) return {};
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_type", message: `${name} must be an object.` }]);
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => typeof entry === "string")) as Record<string, string>;
}

function counterTypeField(body: Record<string, unknown>, name: string): CounterType {
  const normalized = stringField(body, name).toUpperCase().replaceAll("-", "_");
  if (normalized === "TOTAL_MEMBERS" || normalized === "HUMANS" || normalized === "BOTS" || normalized === "ONLINE" || normalized === "ROLE") return normalized;
  throw new ValidationApiError([{ path: ["body", name], code: "invalid_enum", message: `${name} must be a supported counter type.` }]);
}

function suggestionStatusField(body: Record<string, unknown>, name: string): SuggestionStatus {
  const normalized = stringField(body, name).toUpperCase().replaceAll("-", "_");
  if (normalized === "SUBMITTED" || normalized === "UNDER_REVIEW" || normalized === "APPROVED" || normalized === "DENIED" || normalized === "IMPLEMENTED") return normalized;
  throw new ValidationApiError([{ path: ["body", name], code: "invalid_enum", message: `${name} must be a supported suggestion status.` }]);
}

function enumField<const T extends readonly string[]>(
  body: Record<string, unknown>,
  name: string,
  values: T,
): T[number] {
  const value = stringField(body, name);
  if (!(values as readonly string[]).includes(value))
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_enum", message: `${name} is invalid.` }]);
  return value;
}

function optionalEnumField<const T extends readonly string[]>(
  body: Record<string, unknown>,
  name: string,
  values: T,
): T[number] | undefined {
  const value = optionalStringField(body, name);
  if (value === undefined) return undefined;
  if (!(values as readonly string[]).includes(value))
    throw new ValidationApiError([{ path: ["body", name], code: "invalid_enum", message: `${name} is invalid.` }]);
  return value;
}

/**
 * The signed-in member's Discord identity. Read once per request and reused
 * across requests for `ACCOUNT_CACHE_MS`; only usable identities are cached.
 */
async function loadAccountSummary(
  request: FastifyRequest,
  externalIdentityId: string,
  dependencies: RouteDependencies,
) {
  const identity = await requestMemo(request, `account:${externalIdentityId}`, async () => {
    const cached = dependencies.caches.accounts.get(externalIdentityId);
    if (cached !== undefined) return cached;
    const found = await dependencies.unitOfWork.run((repositories) =>
      repositories.externalIdentities.findById(externalIdentityId as never),
    );
    if (found && found.enabled && !found.unlinkedAt) dependencies.caches.accounts.set(externalIdentityId, found);
    return found;
  });
  if (!identity || !identity.enabled || identity.unlinkedAt)
    throw new AuthenticationRequiredApiError();
  return { identity };
}

/**
 * The stored membership snapshot for one member and server. Read once per
 * request and reused across requests for `MEMBERSHIP_CACHE_MS`; a fresh
 * verification, a server switch, a sign-in, and logout replace or drop it.
 */
function storedMembership(
  request: FastifyRequest,
  externalIdentityId: ExternalIdentity["id"],
  guildDiscordId: string,
  dependencies: RouteDependencies,
): Promise<DiscordGuildMembership | undefined> {
  const key = membershipCacheKey(externalIdentityId, guildDiscordId);
  return requestMemo(request, `membership:${key}`, async () => {
    const cached = await dependencies.caches.memberships.getOrLoad(key, async () => ({
      membership: await dependencies.unitOfWork.run((repositories) =>
        repositories.guildMemberships.find(externalIdentityId, discordGuildId(guildDiscordId)),
      ),
    }));
    return cached.membership;
  });
}

/** The member's shared servers (the directory keeps its own one-minute cache), read once per request. */
function listGuilds(
  request: FastifyRequest,
  identity: ExternalIdentity,
  dependencies: RouteDependencies,
): Promise<GuildListing> {
  return requestMemo(request, `guilds:${identity.id}`, () =>
    dependencies.directory.list(identity, operationContext(request), request.apiContext.signal),
  );
}

async function permissionSummary(
  identity: ExternalIdentity,
  access: { readonly present: boolean; readonly roleIds: readonly string[] } | undefined,
  dependencies: RouteDependencies,
): Promise<{
  readonly platformOwner: PermissionAuthorizationDecision;
  readonly platformAdmin: PermissionAuthorizationDecision;
}> {
  const guildDiscordId = currentGuildId();
  if (guildDiscordId === undefined || !access?.present)
    return {
      platformOwner: denied("missing-guild-context"),
      platformAdmin: denied("missing-guild-context"),
    };
  const principals: PermissionPrincipal[] = [
    {
      type: "discord-user",
      externalId: identity.providerSubjectId,
      guildId: guildDiscordId,
    },
    ...access.roleIds.map((roleId) => ({
      type: "discord-role" as const,
      externalId: roleId,
      guildId: guildDiscordId,
    })),
  ];
  const [platformOwner, platformAdmin] = await Promise.all([
    dependencies.authorizer.authorize({
      principals,
      scope: { type: "platform" },
      required: ["platform.owner" satisfies Permission],
      mode: "all",
      administratorOverride: false,
    }),
    dependencies.authorizer.authorize({
      principals,
      scope: {
        type: "discord-guild",
        guildId: guildDiscordId,
      },
      required: ["platform.admin" satisfies Permission],
      mode: "all",
      administratorOverride: false,
    }),
  ]);
  return { platformOwner, platformAdmin };
}

function denied(reason: PermissionAuthorizationDecision["reason"]): PermissionAuthorizationDecision {
  return {
    allowed: false,
    reason,
    effectivePermissions: [],
    deniedPermissions: [],
    usedCache: false,
    degraded: false,
  };
}

function membershipSummary(
  membership: DiscordGuildMembership | undefined,
  discordGuildIdValue: string | undefined,
  access?: { readonly present: boolean; readonly roleIds: readonly string[] },
) {
  return {
    guildId: discordGuildIdValue ?? null,
    status: membership?.status ?? "UNKNOWN",
    verifiedAt: membership?.verifiedAt?.toISOString() ?? null,
    validUntil: membership?.validUntil?.toISOString() ?? null,
    roleIds: access ? [...access.roleIds] : membership?.roles.map((role) => role.roleId) ?? [],
  };
}

function setOauthBindingCookie(
  reply: FastifyReply,
  configuration: ApiAuthenticationConfiguration,
  value: OpaqueAuthenticationSecret,
): void {
  const diagnostics = configuration.diagnostics();
  writeCookie(reply, diagnostics.oauthBindingCookieName, value, {
    httpOnly: true,
    secure: diagnostics.secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
  });
}

function clearOauthBindingCookie(
  reply: FastifyReply,
  configuration: ApiAuthenticationConfiguration,
): void {
  const diagnostics = configuration.diagnostics();
  deleteCookie(reply, diagnostics.oauthBindingCookieName);
}

function setSessionCookies(
  reply: FastifyReply,
  configuration: ApiAuthenticationConfiguration,
  issued: Awaited<ReturnType<BrowserSessionService["createSession"]>>,
): void {
  const diagnostics = configuration.diagnostics();
  writeCookie(reply, diagnostics.sessionCookieName, issued.sessionSecret, {
    httpOnly: true,
    secure: diagnostics.secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  writeCookie(reply, diagnostics.csrfCookieName, issued.csrfSecret, {
    httpOnly: false,
    secure: diagnostics.secureCookies,
    sameSite: "lax",
    path: "/",
    maxAge: CSRF_COOKIE_MAX_AGE_SECONDS,
  });
}

function clearSessionCookies(
  reply: FastifyReply,
  configuration: ApiAuthenticationConfiguration,
): void {
  const diagnostics = configuration.diagnostics();
  deleteCookie(reply, diagnostics.sessionCookieName);
  deleteCookie(reply, diagnostics.csrfCookieName);
}

function validateSameOrigin(request: FastifyRequest, publicBaseUrl: string): void {
  const origin = singleHeader(request.headers.origin);
  if (origin !== new URL(publicBaseUrl).origin) throw new ValidationApiError();
}

function callbackQuery(request: FastifyRequest): {
  readonly code?: string;
  readonly state?: string;
  readonly error?: string;
} {
  const query = request.query;
  if (!query || typeof query !== "object") return {};
  return {
    ...(typeof Reflect.get(query, "code") === "string" ? { code: Reflect.get(query, "code") as string } : {}),
    ...(typeof Reflect.get(query, "state") === "string" ? { state: Reflect.get(query, "state") as string } : {}),
    ...(typeof Reflect.get(query, "error") === "string" ? { error: Reflect.get(query, "error") as string } : {}),
  };
}

function operationContext(request: FastifyRequest) {
  return {
    correlationId: authenticationCorrelationId(request.apiContext.correlationId),
    requestId: authenticationRequestId(request.apiContext.requestId),
    metadata: { route: request.routeOptions.url ?? "unknown" },
  };
}

function clientMetadata(request: FastifyRequest) {
  const userAgent = singleHeader(request.headers["user-agent"]);
  return {
    clientIp: request.apiContext.clientIp,
    ...(userAgent ? { userAgent } : {}),
  };
}

function singleHeader(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

interface CookieOptions {
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly sameSite: "lax";
  readonly path: "/";
  readonly maxAge: number;
}

function readCookie(request: FastifyRequest, name: string): string | undefined {
  const cookies = Reflect.get(request, "cookies");
  if (typeof cookies !== "object" || cookies === null) return undefined;
  const value = Reflect.get(cookies, name);
  return typeof value === "string" ? value : undefined;
}

function writeCookie(
  reply: FastifyReply,
  name: string,
  value: string,
  options: CookieOptions,
): void {
  const writer = Reflect.get(reply, "setCookie");
  if (typeof writer !== "function")
    throw new DependencyUnavailableApiError();
  (writer as (name: string, value: string, options: CookieOptions) => FastifyReply).call(
    reply,
    name,
    value,
    options,
  );
}

function deleteCookie(reply: FastifyReply, name: string): void {
  const clearer = Reflect.get(reply, "clearCookie");
  if (typeof clearer !== "function")
    throw new DependencyUnavailableApiError();
  (clearer as (name: string, options: { readonly path: "/" }) => FastifyReply).call(
    reply,
    name,
    { path: "/" },
  );
}

function redirectAuthFailure(reply: FastifyReply, code: string) {
  return reply.redirect(`/?auth_error=${encodeURIComponent(code)}`);
}

function errorToDashboardCode(error: unknown): string {
  if (error instanceof AuthenticationServiceError) {
    if (error.code === "oauth-state-invalid") return "expired";
    if (error.code === "oauth-browser-binding-invalid") return "binding";
    if (error.code === "authentication-failed") return "failed";
  }
  if (error instanceof AuthenticationInfrastructureError) return "dependency";
  const category = safeErrorCategory(error);
  if (category === "CONFIRMED_NON_MEMBERSHIP") return "not-member";
  if (category === "MEMBERSHIP_PENDING") return "pending";
  if (category === "PROVIDER_TIMEOUT" || category === "PROVIDER_UNAVAILABLE") return "dependency";
  return "failed";
}

function safeErrorCategory(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const code = Reflect.get(error, "code");
    if (typeof code === "string") return code;
  }
  return error instanceof Error ? error.name : "unknown";
}

function dashboardHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QboxPlatform Dashboard</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#08111f; color:#e8eef8; }
    body { margin:0; min-height:100vh; background:radial-gradient(circle at top left,#173b68,#08111f 42%); }
    main { max-width:1000px; margin:0 auto; padding:48px 20px; }
    .card { background:rgba(9,18,32,.86); border:1px solid rgba(124,166,220,.24); border-radius:22px; box-shadow:0 24px 80px rgba(0,0,0,.35); padding:28px; }
    .hero { display:flex; gap:20px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
    h1 { margin:0 0 8px; font-size:34px; letter-spacing:-.03em; }
    p { color:#a9b8cc; line-height:1.5; }
    button, .button { border:0; border-radius:12px; background:#5865f2; color:white; font-weight:700; padding:12px 16px; cursor:pointer; text-decoration:none; display:inline-flex; gap:8px; align-items:center; }
    button.secondary { background:#1f3048; }
    button.danger { background:#aa2d3a; }
    button:disabled { opacity:.55; cursor:not-allowed; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin-top:24px; }
    .panel { background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:18px; min-height:110px; }
    .label { color:#8fa5c0; font-size:12px; text-transform:uppercase; letter-spacing:.12em; }
    .value { margin-top:6px; font-family:ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap:anywhere; }
    .ok { color:#67e8a5; } .bad { color:#ff8a9a; } .warn { color:#ffd166; }
    .avatar { width:72px; height:72px; border-radius:18px; background:#1f3048; object-fit:cover; }
    .row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
    #message { margin-top:16px; padding:12px 14px; border-radius:12px; background:rgba(255,255,255,.06); display:none; }
    pre { white-space:pre-wrap; margin:0; }
  </style>
</head>
<body>
<main>
  <section class="card">
    <div class="hero">
      <div>
        <h1>QboxPlatform</h1>
        <p>Local proof of concept for Discord login, guild verification, server-side sessions, and permission checks.</p>
      </div>
      <div class="row">
        <a class="button" id="login" href="/auth/discord/start">Login with Discord</a>
        <button class="secondary" id="refresh">Refresh account information</button>
        <button class="secondary" id="admin">Test Admin Access</button>
        <button class="danger" id="logout">Logout</button>
      </div>
    </div>
    <div id="message"></div>
    <div class="grid">
      <div class="panel"><div class="label">Identity</div><div id="identity" class="value">Checking session...</div></div>
      <div class="panel"><div class="label">Guild membership</div><div id="membership" class="value">—</div></div>
      <div class="panel"><div class="label">Session</div><div id="session" class="value">—</div></div>
      <div class="panel"><div class="label">Permissions</div><div id="permissions" class="value">—</div></div>
      <div class="panel"><div class="label">API health</div><div id="health" class="value">—</div></div>
      <div class="panel"><div class="label">Raw safe summary</div><pre id="raw" class="value">—</pre></div>
    </div>
  </section>
</main>
<script>
const state = { me: null };
const csrfCookieName = document.cookie.includes('__Host-qbox_csrf=') ? '__Host-qbox_csrf' : 'qbox_csrf';
function cookieValue(name){ return document.cookie.split('; ').find(v => v.startsWith(name + '='))?.slice(name.length + 1); }
function message(text, cls=''){ const el=document.getElementById('message'); el.style.display='block'; el.className=cls; el.textContent=text; }
function clearMessage(){ document.getElementById('message').style.display='none'; }
function authErrorMessage(code){
  return ({cancelled:'Discord login was cancelled', expired:'OAuth state expired', binding:'OAuth browser binding failed', dependency:'Discord could not be reached', 'not-member':'You are not a member of the configured server', pending:'Membership screening is still pending', failed:'Authentication failed', invalid:'Authentication failed'})[code] || 'Authentication failed';
}
async function json(url, options){ const res=await fetch(url,{credentials:'same-origin',...options}); if(!res.ok){ let body={}; try{body=await res.json();}catch{} const err=new Error(body.detail||res.statusText); err.code=body.code; throw err;} return res.json(); }
async function load(refresh=false){
  clearMessage();
  try {
    const me = await json('/api/v1/me' + (refresh ? '?refresh=1' : ''));
    state.me = me; render(me);
  } catch (error) {
    state.me = null; render(null);
    if (error.code === 'AUTHENTICATION_REQUIRED') message('Signed out. Login with Discord to continue.');
    else message(error.message || 'Authentication failed', 'bad');
  }
}
async function health(){
  try { const [live, ready] = await Promise.all([json('/health/live'), json('/health/ready')]); document.getElementById('health').innerHTML = '<span class="ok">live</span> / ' + (ready.readiness === 'ready' ? '<span class="ok">ready</span>' : '<span class="warn">not ready</span>'); }
  catch { document.getElementById('health').innerHTML='<span class="bad">unavailable</span>'; }
}
function render(me){
  document.getElementById('login').style.display = me ? 'none' : 'inline-flex';
  document.getElementById('refresh').disabled = !me; document.getElementById('admin').disabled = !me; document.getElementById('logout').disabled = !me;
  if(!me){ document.getElementById('identity').textContent='Signed out'; document.getElementById('membership').textContent='—'; document.getElementById('session').textContent='—'; document.getElementById('permissions').textContent='—'; document.getElementById('raw').textContent='—'; return; }
  const avatar = me.account.avatar ? 'https://cdn.discordapp.com/avatars/' + me.account.discordUserId + '/' + me.account.avatar + '.png?size=128' : '';
  document.getElementById('identity').innerHTML = '<div class="row">' + (avatar ? '<img class="avatar" src="'+avatar+'" alt="Discord avatar">' : '') + '<div>Discord: '+(me.account.globalName || me.account.username || 'unknown')+'<br>User ID: '+me.account.discordUserId+'<br>Platform user: '+me.account.platformUserId+'</div></div>';
  document.getElementById('membership').innerHTML = 'Guild '+me.membership.guildId+'<br>Status: '+me.membership.status+'<br>Roles: '+(me.membership.roleIds.length ? me.membership.roleIds.join(', ') : 'none');
  document.getElementById('session').innerHTML = 'Session ID: '+me.session.id+'<br>Idle expiry: '+me.session.idleExpiresAt+'<br>Absolute expiry: '+me.session.absoluteExpiresAt;
  document.getElementById('permissions').innerHTML = 'platform.owner: '+badge(me.permissions.platformOwner.allowed)+' ('+me.permissions.platformOwner.reason+')<br>platform.admin: '+badge(me.permissions.platformAdmin.allowed)+' ('+me.permissions.platformAdmin.reason+')';
  document.getElementById('raw').textContent = JSON.stringify(me, null, 2);
}
function badge(ok){ return ok ? '<span class="ok">allowed</span>' : '<span class="bad">denied</span>'; }
document.getElementById('refresh').onclick = () => load(true);
document.getElementById('admin').onclick = async () => { try { const result = await json('/api/v1/admin-check'); message('Administrator permission allowed: '+result.decision.reason, 'ok'); } catch (e) { message(e.code === 'AUTHORIZATION_DENIED' ? 'Administrator permission denied' : (e.message || 'Admin check failed'), 'bad'); } };
document.getElementById('logout').onclick = async () => { try { await json('/auth/logout',{method:'POST',headers:{'X-CSRF-Token':decodeURIComponent(cookieValue(csrfCookieName)||'')}}); message('Signed out after logout.'); await load(); } catch(e){ message(e.message || 'Logout failed', 'bad'); } };
const params = new URLSearchParams(location.search); if(params.has('auth_error')) { message(authErrorMessage(params.get('auth_error')), 'bad'); history.replaceState(null,'','/'); }
health(); load();
</script>
</body></html>`;
}

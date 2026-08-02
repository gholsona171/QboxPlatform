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
} from "@qbox/authentication";
import type { GuildRepository } from "@qbox/permissions";
import type {
  Permission,
  PermissionAuthorizer,
  PermissionAuthorizationDecision,
  PermissionPrincipal,
} from "@qbox/permissions";
import {
  AuthenticationRequiredApiError,
  AuthorizationDeniedApiError,
  DependencyUnavailableApiError,
  ValidationApiError,
} from "../errors/ApiError.js";
import type { ApiLogger } from "../logging/ApiLogger.js";
import { cookieSecret, type ApiAuthenticationConfiguration } from "./ApiAuthenticationConfiguration.js";

/** Dependencies for browser-visible authentication and dashboard routes. */
export interface BrowserAuthenticationRouteDependencies {
  readonly configuration: ApiAuthenticationConfiguration;
  readonly provider: DiscordOAuthProvider & DiscordGuildMembershipVerifier;
  readonly oauthTransactions: OAuthTransactionService;
  readonly login: DiscordLoginService;
  readonly credentials: OAuthCredentialService;
  readonly sessions: BrowserSessionService;
  readonly memberships: DiscordGuildMembershipService;
  readonly guilds: Pick<GuildRepository, "findByDiscordId" | "create">;
  readonly authorizer: PermissionAuthorizer;
  readonly unitOfWork: AuthenticationUnitOfWork;
  readonly logger: ApiLogger;
}

const SESSION_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;
const CSRF_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Registers the QboxPlatform browser dashboard and proof-of-concept auth routes. */
export async function registerBrowserAuthenticationRoutes(
  server: FastifyInstance,
  dependencies: BrowserAuthenticationRouteDependencies,
): Promise<void> {
  const diagnostics = dependencies.configuration.diagnostics();
  await server.register(cookie);

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
        authorizationCode: opaqueAuthenticationSecret(query.code),
        redirectUri: new URL(diagnostics.callbackUrl),
        signal: request.apiContext.signal,
      });
      const identity = await dependencies.provider.fetchIdentity(
        token.accessToken,
        request.apiContext.signal,
      );
      const currentMembership = await dependencies.provider.verify({
        identity,
        accessToken: token.accessToken,
        guildId: dependencies.configuration.configuredDiscordGuildId(),
        signal: request.apiContext.signal,
      });
      if (currentMembership.status !== "PRESENT") {
        await dependencies.oauthTransactions.failTransaction(
          claimed.transaction.id,
          currentMembership.status === "ABSENT"
            ? "PROVIDER_REJECTED"
            : "DEPENDENCY_UNAVAILABLE",
          context,
        );
        clearOauthBindingCookie(reply, dependencies.configuration);
        return redirectAuthFailure(
          reply,
          currentMembership.status === "ABSENT" ? "not-member" : "pending",
        );
      }
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
      const guild =
        (await dependencies.guilds.findByDiscordId(diagnostics.discordGuildId)) ??
        (await dependencies.guilds.create(diagnostics.discordGuildId, {
          source: "api-authentication-login",
        }));
      const membership = await dependencies.memberships.verifyCurrentMembership({
        externalIdentityId: account.externalIdentity.id,
        guildId: guildId(guild.id),
        discordGuildId: discordGuildId(diagnostics.discordGuildId),
        context,
        signal: request.apiContext.signal,
      });
      if (membership.status !== "PRESENT") {
        await dependencies.oauthTransactions.failTransaction(
          claimed.transaction.id,
          membership.status === "ABSENT" ? "PROVIDER_REJECTED" : "DEPENDENCY_UNAVAILABLE",
          context,
        );
        clearOauthBindingCookie(reply, dependencies.configuration);
        return redirectAuthFailure(reply, membership.status === "ABSENT" ? "not-member" : "pending");
      }
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
    const account = await loadAccountSummary(verified.actor.authentication.loginIdentityId, dependencies);
    const guild =
      (await dependencies.guilds.findByDiscordId(diagnostics.discordGuildId)) ??
      (await dependencies.guilds.create(diagnostics.discordGuildId, {
        source: "api-authentication-me",
      }));
    const membership =
      request.query &&
      typeof request.query === "object" &&
      Reflect.get(request.query, "refresh") === "1"
        ? await dependencies.memberships.verifyCurrentMembership({
            externalIdentityId: account.identity.id,
            guildId: guildId(guild.id),
            discordGuildId: discordGuildId(diagnostics.discordGuildId),
            context: operationContext(request),
            signal: request.apiContext.signal,
          })
        : await dependencies.unitOfWork.run((repositories) =>
            repositories.guildMemberships.find(
              account.identity.id,
              discordGuildId(diagnostics.discordGuildId),
            ),
          );
    const permissions = await permissionSummary(account.identity, membership, dependencies);
    return {
      account: {
        platformUserId: verified.actor.platformUserId,
        externalIdentityId: account.identity.id,
        discordUserId: account.identity.providerSubjectId,
        username: account.identity.profile.username ?? null,
        globalName: account.identity.profile.globalName ?? null,
        avatar: account.identity.profile.avatar ?? null,
      },
      membership: membershipSummary(membership, diagnostics.discordGuildId),
      session: {
        id: verified.session.id,
        authenticatedAt: verified.session.authenticatedAt.toISOString(),
        idleExpiresAt: verified.session.idleExpiresAt.toISOString(),
        absoluteExpiresAt: verified.session.absoluteExpiresAt.toISOString(),
      },
      permissions,
      health: { live: "/health/live", ready: "/health/ready" },
    };
  });

  server.get("/api/v1/admin-check", async (request) => {
    const verified = await requireSession(request, dependencies);
    const account = await loadAccountSummary(verified.actor.authentication.loginIdentityId, dependencies);
    const guild = await dependencies.guilds.findByDiscordId(diagnostics.discordGuildId);
    const membership = guild
      ? await dependencies.unitOfWork.run((repositories) =>
          repositories.guildMemberships.find(
            account.identity.id,
            discordGuildId(diagnostics.discordGuildId),
          ),
        )
      : undefined;
    const permissions = await permissionSummary(account.identity, membership, dependencies);
    if (!permissions.platformAdmin.allowed) throw new AuthorizationDeniedApiError();
    return { allowed: true, decision: permissions.platformAdmin };
  });

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
    await dependencies.sessions.revokeCurrentSession(sessionSecret, {
      correlationId: authenticationCorrelationId(request.apiContext.correlationId),
      requestId: authenticationRequestId(request.apiContext.requestId),
      actor: { type: "platform-user", id: verified.actor.platformUserId },
    });
    clearSessionCookies(reply, dependencies.configuration);
    return { success: true };
  });
}

async function requireSession(
  request: FastifyRequest,
  dependencies: BrowserAuthenticationRouteDependencies,
) {
  if (request.headers.authorization !== undefined)
    throw new AuthenticationRequiredApiError();
  const diagnostics = dependencies.configuration.diagnostics();
  const secret = cookieSecret(readCookie(request, diagnostics.sessionCookieName));
  if (!secret) throw new AuthenticationRequiredApiError();
  try {
    const verified = await dependencies.sessions.verifySession(secret);
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

async function loadAccountSummary(
  externalIdentityId: string,
  dependencies: BrowserAuthenticationRouteDependencies,
) {
  const identity = await dependencies.unitOfWork.run((repositories) =>
    repositories.externalIdentities.findById(externalIdentityId as never),
  );
  if (!identity || !identity.enabled || identity.unlinkedAt)
    throw new AuthenticationRequiredApiError();
  return { identity };
}

async function permissionSummary(
  identity: ExternalIdentity,
  membership: DiscordGuildMembership | undefined,
  dependencies: BrowserAuthenticationRouteDependencies,
): Promise<{
  readonly platformOwner: PermissionAuthorizationDecision;
  readonly platformAdmin: PermissionAuthorizationDecision;
}> {
  if (!membership || membership.status !== "PRESENT")
    return {
      platformOwner: denied("missing-guild-context"),
      platformAdmin: denied("missing-guild-context"),
    };
  const principals: PermissionPrincipal[] = [
    {
      type: "discord-user",
      externalId: identity.providerSubjectId,
      guildId: dependencies.configuration.diagnostics().discordGuildId,
    },
    ...membership.roles.map((role) => ({
      type: "discord-role" as const,
      externalId: role.roleId,
      guildId: dependencies.configuration.diagnostics().discordGuildId,
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
        guildId: dependencies.configuration.diagnostics().discordGuildId,
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
  discordGuildIdValue: string,
) {
  return {
    guildId: discordGuildIdValue,
    status: membership?.status ?? "UNKNOWN",
    verifiedAt: membership?.verifiedAt?.toISOString() ?? null,
    validUntil: membership?.validUntil?.toISOString() ?? null,
    roleIds: membership?.roles.map((role) => role.roleId) ?? [],
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

import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "./prismaNamespace.js";
export type LogOptions<ClientOptions extends Prisma.PrismaClientOptions> = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never;
export interface PrismaClientConstructor {
    /**
   * ## Prisma Client
   *
   * Type-safe database client for TypeScript
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more ApplicationCounters
   * const applicationCounters = await prisma.applicationCounter.findMany()
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */
    new <Options extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, LogOpts extends LogOptions<Options> = LogOptions<Options>, OmitOpts extends Prisma.PrismaClientOptions['omit'] = Options extends {
        omit: infer U;
    } ? U : Prisma.PrismaClientOptions['omit'], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs>(options: Prisma.PrismaClientConstructorArgs<Options>): PrismaClient<LogOpts, OmitOpts, ExtArgs>;
}
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more ApplicationCounters
 * const applicationCounters = await prisma.applicationCounter.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export interface PrismaClient<in LogOpts extends Prisma.LogLevel = never, in out OmitOpts extends Prisma.PrismaClientOptions['omit'] = Prisma.PrismaClientOptions['omit'], in out ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['other'];
    };
    $on<V extends LogOpts>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;
    /**
     * Connect with the database
     */
    $connect(): runtime.Types.Utils.JsPromise<void>;
    /**
     * Disconnect from the database
     */
    $disconnect(): runtime.Types.Utils.JsPromise<void>;
    /**
       * Executes a prepared raw query and returns the number of affected rows.
       * @example
       * ```
       * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
       * ```
       *
       * Read more in our [docs](https://pris.ly/d/raw-queries).
       */
    $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Executes a raw query and returns the number of affected rows.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;
    /**
     * Performs a prepared raw query and returns the `SELECT` data.
     * @example
     * ```
     * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Performs a raw query and returns the `SELECT` data.
     * Susceptible to SQL injections, see documentation.
     * @example
     * ```
     * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
     * ```
     *
     * Read more in our [docs](https://pris.ly/d/raw-queries).
     */
    $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;
    /**
     * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
     * @example
     * ```
     * const [george, bob, alice] = await prisma.$transaction([
     *   prisma.user.create({ data: { name: 'George' } }),
     *   prisma.user.create({ data: { name: 'Bob' } }),
     *   prisma.user.create({ data: { name: 'Alice' } }),
     * ])
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
     */
    $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;
    $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => runtime.Types.Utils.JsPromise<R>, options?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: Prisma.TransactionIsolationLevel;
    }): runtime.Types.Utils.JsPromise<R>;
    $extends: runtime.Types.Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<OmitOpts>, ExtArgs, runtime.Types.Utils.Call<Prisma.TypeMapCb<OmitOpts>, {
        extArgs: ExtArgs;
    }>>;
    /**
 * `prisma.applicationCounter`: Exposes CRUD operations for the **ApplicationCounter** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more ApplicationCounters
  * const applicationCounters = await prisma.applicationCounter.findMany()
  * ```
  */
    get applicationCounter(): Prisma.ApplicationCounterDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.applicationForm`: Exposes CRUD operations for the **ApplicationForm** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ApplicationForms
      * const applicationForms = await prisma.applicationForm.findMany()
      * ```
      */
    get applicationForm(): Prisma.ApplicationFormDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.applicationPanel`: Exposes CRUD operations for the **ApplicationPanel** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ApplicationPanels
      * const applicationPanels = await prisma.applicationPanel.findMany()
      * ```
      */
    get applicationPanel(): Prisma.ApplicationPanelDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.application`: Exposes CRUD operations for the **Application** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Applications
      * const applications = await prisma.application.findMany()
      * ```
      */
    get application(): Prisma.ApplicationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.applicationVote`: Exposes CRUD operations for the **ApplicationVote** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ApplicationVotes
      * const applicationVotes = await prisma.applicationVote.findMany()
      * ```
      */
    get applicationVote(): Prisma.ApplicationVoteDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.applicationNote`: Exposes CRUD operations for the **ApplicationNote** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ApplicationNotes
      * const applicationNotes = await prisma.applicationNote.findMany()
      * ```
      */
    get applicationNote(): Prisma.ApplicationNoteDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.guild`: Exposes CRUD operations for the **Guild** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Guilds
      * const guilds = await prisma.guild.findMany()
      * ```
      */
    get guild(): Prisma.GuildDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.roleMenu`: Exposes CRUD operations for the **RoleMenu** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more RoleMenus
      * const roleMenus = await prisma.roleMenu.findMany()
      * ```
      */
    get roleMenu(): Prisma.RoleMenuDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.roleMenuOption`: Exposes CRUD operations for the **RoleMenuOption** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more RoleMenuOptions
      * const roleMenuOptions = await prisma.roleMenuOption.findMany()
      * ```
      */
    get roleMenuOption(): Prisma.RoleMenuOptionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.welcomeGoodbyeConfig`: Exposes CRUD operations for the **WelcomeGoodbyeConfig** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more WelcomeGoodbyeConfigs
      * const welcomeGoodbyeConfigs = await prisma.welcomeGoodbyeConfig.findMany()
      * ```
      */
    get welcomeGoodbyeConfig(): Prisma.WelcomeGoodbyeConfigDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.autoroleConfig`: Exposes CRUD operations for the **AutoroleConfig** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AutoroleConfigs
      * const autoroleConfigs = await prisma.autoroleConfig.findMany()
      * ```
      */
    get autoroleConfig(): Prisma.AutoroleConfigDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.autoroleRule`: Exposes CRUD operations for the **AutoroleRule** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AutoroleRules
      * const autoroleRules = await prisma.autoroleRule.findMany()
      * ```
      */
    get autoroleRule(): Prisma.AutoroleRuleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.rulesConfig`: Exposes CRUD operations for the **RulesConfig** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more RulesConfigs
      * const rulesConfigs = await prisma.rulesConfig.findMany()
      * ```
      */
    get rulesConfig(): Prisma.RulesConfigDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.discordRoleAuditEvent`: Exposes CRUD operations for the **DiscordRoleAuditEvent** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DiscordRoleAuditEvents
      * const discordRoleAuditEvents = await prisma.discordRoleAuditEvent.findMany()
      * ```
      */
    get discordRoleAuditEvent(): Prisma.DiscordRoleAuditEventDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.communityCounter`: Exposes CRUD operations for the **CommunityCounter** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CommunityCounters
      * const communityCounters = await prisma.communityCounter.findMany()
      * ```
      */
    get communityCounter(): Prisma.CommunityCounterDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.serverLogConfig`: Exposes CRUD operations for the **ServerLogConfig** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ServerLogConfigs
      * const serverLogConfigs = await prisma.serverLogConfig.findMany()
      * ```
      */
    get serverLogConfig(): Prisma.ServerLogConfigDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.embedTemplate`: Exposes CRUD operations for the **EmbedTemplate** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more EmbedTemplates
      * const embedTemplates = await prisma.embedTemplate.findMany()
      * ```
      */
    get embedTemplate(): Prisma.EmbedTemplateDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.customCommand`: Exposes CRUD operations for the **CustomCommand** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more CustomCommands
      * const customCommands = await prisma.customCommand.findMany()
      * ```
      */
    get customCommand(): Prisma.CustomCommandDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.suggestion`: Exposes CRUD operations for the **Suggestion** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Suggestions
      * const suggestions = await prisma.suggestion.findMany()
      * ```
      */
    get suggestion(): Prisma.SuggestionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.starboardConfig`: Exposes CRUD operations for the **StarboardConfig** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StarboardConfigs
      * const starboardConfigs = await prisma.starboardConfig.findMany()
      * ```
      */
    get starboardConfig(): Prisma.StarboardConfigDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.starboardEntry`: Exposes CRUD operations for the **StarboardEntry** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StarboardEntries
      * const starboardEntries = await prisma.starboardEntry.findMany()
      * ```
      */
    get starboardEntry(): Prisma.StarboardEntryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.permissionPrincipal`: Exposes CRUD operations for the **PermissionPrincipal** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PermissionPrincipals
      * const permissionPrincipals = await prisma.permissionPrincipal.findMany()
      * ```
      */
    get permissionPrincipal(): Prisma.PermissionPrincipalDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.permissionDefinition`: Exposes CRUD operations for the **PermissionDefinition** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PermissionDefinitions
      * const permissionDefinitions = await prisma.permissionDefinition.findMany()
      * ```
      */
    get permissionDefinition(): Prisma.PermissionDefinitionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.permissionAssignment`: Exposes CRUD operations for the **PermissionAssignment** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PermissionAssignments
      * const permissionAssignments = await prisma.permissionAssignment.findMany()
      * ```
      */
    get permissionAssignment(): Prisma.PermissionAssignmentDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.permissionAuditEvent`: Exposes CRUD operations for the **PermissionAuditEvent** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PermissionAuditEvents
      * const permissionAuditEvents = await prisma.permissionAuditEvent.findMany()
      * ```
      */
    get permissionAuditEvent(): Prisma.PermissionAuditEventDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.permissionCatalogState`: Exposes CRUD operations for the **PermissionCatalogState** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PermissionCatalogStates
      * const permissionCatalogStates = await prisma.permissionCatalogState.findMany()
      * ```
      */
    get permissionCatalogState(): Prisma.PermissionCatalogStateDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.platformUser`: Exposes CRUD operations for the **PlatformUser** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PlatformUsers
      * const platformUsers = await prisma.platformUser.findMany()
      * ```
      */
    get platformUser(): Prisma.PlatformUserDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.externalIdentity`: Exposes CRUD operations for the **ExternalIdentity** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ExternalIdentities
      * const externalIdentities = await prisma.externalIdentity.findMany()
      * ```
      */
    get externalIdentity(): Prisma.ExternalIdentityDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.browserSession`: Exposes CRUD operations for the **BrowserSession** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BrowserSessions
      * const browserSessions = await prisma.browserSession.findMany()
      * ```
      */
    get browserSession(): Prisma.BrowserSessionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.oAuthTransaction`: Exposes CRUD operations for the **OAuthTransaction** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more OAuthTransactions
      * const oAuthTransactions = await prisma.oAuthTransaction.findMany()
      * ```
      */
    get oAuthTransaction(): Prisma.OAuthTransactionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.oAuthCredential`: Exposes CRUD operations for the **OAuthCredential** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more OAuthCredentials
      * const oAuthCredentials = await prisma.oAuthCredential.findMany()
      * ```
      */
    get oAuthCredential(): Prisma.OAuthCredentialDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.discordGuildMembership`: Exposes CRUD operations for the **DiscordGuildMembership** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DiscordGuildMemberships
      * const discordGuildMemberships = await prisma.discordGuildMembership.findMany()
      * ```
      */
    get discordGuildMembership(): Prisma.DiscordGuildMembershipDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.discordGuildMembershipRole`: Exposes CRUD operations for the **DiscordGuildMembershipRole** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more DiscordGuildMembershipRoles
      * const discordGuildMembershipRoles = await prisma.discordGuildMembershipRole.findMany()
      * ```
      */
    get discordGuildMembershipRole(): Prisma.DiscordGuildMembershipRoleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.authenticationAuditEvent`: Exposes CRUD operations for the **AuthenticationAuditEvent** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more AuthenticationAuditEvents
      * const authenticationAuditEvents = await prisma.authenticationAuditEvent.findMany()
      * ```
      */
    get authenticationAuditEvent(): Prisma.AuthenticationAuditEventDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.birthdaySettings`: Exposes CRUD operations for the **BirthdaySettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BirthdaySettings
      * const birthdaySettings = await prisma.birthdaySettings.findMany()
      * ```
      */
    get birthdaySettings(): Prisma.BirthdaySettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.birthday`: Exposes CRUD operations for the **Birthday** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Birthdays
      * const birthdays = await prisma.birthday.findMany()
      * ```
      */
    get birthday(): Prisma.BirthdayDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.builderDraft`: Exposes CRUD operations for the **BuilderDraft** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BuilderDrafts
      * const builderDrafts = await prisma.builderDraft.findMany()
      * ```
      */
    get builderDraft(): Prisma.BuilderDraftDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.builderRun`: Exposes CRUD operations for the **BuilderRun** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BuilderRuns
      * const builderRuns = await prisma.builderRun.findMany()
      * ```
      */
    get builderRun(): Prisma.BuilderRunDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.builderRunItem`: Exposes CRUD operations for the **BuilderRunItem** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more BuilderRunItems
      * const builderRunItems = await prisma.builderRunItem.findMany()
      * ```
      */
    get builderRunItem(): Prisma.BuilderRunItemDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.fivemSettings`: Exposes CRUD operations for the **FivemSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more FivemSettings
      * const fivemSettings = await prisma.fivemSettings.findMany()
      * ```
      */
    get fivemSettings(): Prisma.FivemSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.fivemStatusSnapshot`: Exposes CRUD operations for the **FivemStatusSnapshot** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more FivemStatusSnapshots
      * const fivemStatusSnapshots = await prisma.fivemStatusSnapshot.findMany()
      * ```
      */
    get fivemStatusSnapshot(): Prisma.FivemStatusSnapshotDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.gamesSettings`: Exposes CRUD operations for the **GamesSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more GamesSettings
      * const gamesSettings = await prisma.gamesSettings.findMany()
      * ```
      */
    get gamesSettings(): Prisma.GamesSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.gamesServer`: Exposes CRUD operations for the **GamesServer** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more GamesServers
      * const gamesServers = await prisma.gamesServer.findMany()
      * ```
      */
    get gamesServer(): Prisma.GamesServerDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.gamesStatusSnapshot`: Exposes CRUD operations for the **GamesStatusSnapshot** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more GamesStatusSnapshots
      * const gamesStatusSnapshots = await prisma.gamesStatusSnapshot.findMany()
      * ```
      */
    get gamesStatusSnapshot(): Prisma.GamesStatusSnapshotDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.giveawayCounter`: Exposes CRUD operations for the **GiveawayCounter** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more GiveawayCounters
      * const giveawayCounters = await prisma.giveawayCounter.findMany()
      * ```
      */
    get giveawayCounter(): Prisma.GiveawayCounterDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.giveaway`: Exposes CRUD operations for the **Giveaway** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Giveaways
      * const giveaways = await prisma.giveaway.findMany()
      * ```
      */
    get giveaway(): Prisma.GiveawayDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.giveawayEntry`: Exposes CRUD operations for the **GiveawayEntry** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more GiveawayEntries
      * const giveawayEntries = await prisma.giveawayEntry.findMany()
      * ```
      */
    get giveawayEntry(): Prisma.GiveawayEntryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.knowledgeSettings`: Exposes CRUD operations for the **KnowledgeSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more KnowledgeSettings
      * const knowledgeSettings = await prisma.knowledgeSettings.findMany()
      * ```
      */
    get knowledgeSettings(): Prisma.KnowledgeSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.knowledgeCategory`: Exposes CRUD operations for the **KnowledgeCategory** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more KnowledgeCategories
      * const knowledgeCategories = await prisma.knowledgeCategory.findMany()
      * ```
      */
    get knowledgeCategory(): Prisma.KnowledgeCategoryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.knowledgeArticle`: Exposes CRUD operations for the **KnowledgeArticle** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more KnowledgeArticles
      * const knowledgeArticles = await prisma.knowledgeArticle.findMany()
      * ```
      */
    get knowledgeArticle(): Prisma.KnowledgeArticleDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.levelSettings`: Exposes CRUD operations for the **LevelSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more LevelSettings
      * const levelSettings = await prisma.levelSettings.findMany()
      * ```
      */
    get levelSettings(): Prisma.LevelSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.levelMember`: Exposes CRUD operations for the **LevelMember** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more LevelMembers
      * const levelMembers = await prisma.levelMember.findMany()
      * ```
      */
    get levelMember(): Prisma.LevelMemberDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.messagesLook`: Exposes CRUD operations for the **MessagesLook** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MessagesLooks
      * const messagesLooks = await prisma.messagesLook.findMany()
      * ```
      */
    get messagesLook(): Prisma.MessagesLookDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.messagesTemplate`: Exposes CRUD operations for the **MessagesTemplate** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MessagesTemplates
      * const messagesTemplates = await prisma.messagesTemplate.findMany()
      * ```
      */
    get messagesTemplate(): Prisma.MessagesTemplateDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.moderationSettings`: Exposes CRUD operations for the **ModerationSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ModerationSettings
      * const moderationSettings = await prisma.moderationSettings.findMany()
      * ```
      */
    get moderationSettings(): Prisma.ModerationSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.moderationCase`: Exposes CRUD operations for the **ModerationCase** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ModerationCases
      * const moderationCases = await prisma.moderationCase.findMany()
      * ```
      */
    get moderationCase(): Prisma.ModerationCaseDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.musicSettings`: Exposes CRUD operations for the **MusicSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MusicSettings
      * const musicSettings = await prisma.musicSettings.findMany()
      * ```
      */
    get musicSettings(): Prisma.MusicSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.musicTrack`: Exposes CRUD operations for the **MusicTrack** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MusicTracks
      * const musicTracks = await prisma.musicTrack.findMany()
      * ```
      */
    get musicTrack(): Prisma.MusicTrackDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.musicPlaylist`: Exposes CRUD operations for the **MusicPlaylist** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MusicPlaylists
      * const musicPlaylists = await prisma.musicPlaylist.findMany()
      * ```
      */
    get musicPlaylist(): Prisma.MusicPlaylistDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.musicPlaylistTrack`: Exposes CRUD operations for the **MusicPlaylistTrack** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MusicPlaylistTracks
      * const musicPlaylistTracks = await prisma.musicPlaylistTrack.findMany()
      * ```
      */
    get musicPlaylistTrack(): Prisma.MusicPlaylistTrackDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.musicStation`: Exposes CRUD operations for the **MusicStation** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MusicStations
      * const musicStations = await prisma.musicStation.findMany()
      * ```
      */
    get musicStation(): Prisma.MusicStationDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.musicSession`: Exposes CRUD operations for the **MusicSession** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more MusicSessions
      * const musicSessions = await prisma.musicSession.findMany()
      * ```
      */
    get musicSession(): Prisma.MusicSessionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.pollCounter`: Exposes CRUD operations for the **PollCounter** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PollCounters
      * const pollCounters = await prisma.pollCounter.findMany()
      * ```
      */
    get pollCounter(): Prisma.PollCounterDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.poll`: Exposes CRUD operations for the **Poll** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Polls
      * const polls = await prisma.poll.findMany()
      * ```
      */
    get poll(): Prisma.PollDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.pollVote`: Exposes CRUD operations for the **PollVote** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more PollVotes
      * const pollVotes = await prisma.pollVote.findMany()
      * ```
      */
    get pollVote(): Prisma.PollVoteDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.scheduledMessage`: Exposes CRUD operations for the **ScheduledMessage** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ScheduledMessages
      * const scheduledMessages = await prisma.scheduledMessage.findMany()
      * ```
      */
    get scheduledMessage(): Prisma.ScheduledMessageDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.scheduledMessageRun`: Exposes CRUD operations for the **ScheduledMessageRun** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more ScheduledMessageRuns
      * const scheduledMessageRuns = await prisma.scheduledMessageRun.findMany()
      * ```
      */
    get scheduledMessageRun(): Prisma.ScheduledMessageRunDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.staffSettings`: Exposes CRUD operations for the **StaffSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StaffSettings
      * const staffSettings = await prisma.staffSettings.findMany()
      * ```
      */
    get staffSettings(): Prisma.StaffSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.staffRank`: Exposes CRUD operations for the **StaffRank** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StaffRanks
      * const staffRanks = await prisma.staffRank.findMany()
      * ```
      */
    get staffRank(): Prisma.StaffRankDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.staffMember`: Exposes CRUD operations for the **StaffMember** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StaffMembers
      * const staffMembers = await prisma.staffMember.findMany()
      * ```
      */
    get staffMember(): Prisma.StaffMemberDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.staffRecord`: Exposes CRUD operations for the **StaffRecord** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StaffRecords
      * const staffRecords = await prisma.staffRecord.findMany()
      * ```
      */
    get staffRecord(): Prisma.StaffRecordDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.staffStrike`: Exposes CRUD operations for the **StaffStrike** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StaffStrikes
      * const staffStrikes = await prisma.staffStrike.findMany()
      * ```
      */
    get staffStrike(): Prisma.StaffStrikeDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.staffLeave`: Exposes CRUD operations for the **StaffLeave** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StaffLeaves
      * const staffLeaves = await prisma.staffLeave.findMany()
      * ```
      */
    get staffLeave(): Prisma.StaffLeaveDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.staffShift`: Exposes CRUD operations for the **StaffShift** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StaffShifts
      * const staffShifts = await prisma.staffShift.findMany()
      * ```
      */
    get staffShift(): Prisma.StaffShiftDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.streamsSettings`: Exposes CRUD operations for the **StreamsSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StreamsSettings
      * const streamsSettings = await prisma.streamsSettings.findMany()
      * ```
      */
    get streamsSettings(): Prisma.StreamsSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.streamsSubscription`: Exposes CRUD operations for the **StreamsSubscription** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more StreamsSubscriptions
      * const streamsSubscriptions = await prisma.streamsSubscription.findMany()
      * ```
      */
    get streamsSubscription(): Prisma.StreamsSubscriptionDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.ticketSettings`: Exposes CRUD operations for the **TicketSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more TicketSettings
      * const ticketSettings = await prisma.ticketSettings.findMany()
      * ```
      */
    get ticketSettings(): Prisma.TicketSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.ticketCategory`: Exposes CRUD operations for the **TicketCategory** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more TicketCategories
      * const ticketCategories = await prisma.ticketCategory.findMany()
      * ```
      */
    get ticketCategory(): Prisma.TicketCategoryDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.ticketPanel`: Exposes CRUD operations for the **TicketPanel** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more TicketPanels
      * const ticketPanels = await prisma.ticketPanel.findMany()
      * ```
      */
    get ticketPanel(): Prisma.TicketPanelDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.ticket`: Exposes CRUD operations for the **Ticket** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more Tickets
      * const tickets = await prisma.ticket.findMany()
      * ```
      */
    get ticket(): Prisma.TicketDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.ticketMessage`: Exposes CRUD operations for the **TicketMessage** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more TicketMessages
      * const ticketMessages = await prisma.ticketMessage.findMany()
      * ```
      */
    get ticketMessage(): Prisma.TicketMessageDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.ticketEvent`: Exposes CRUD operations for the **TicketEvent** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more TicketEvents
      * const ticketEvents = await prisma.ticketEvent.findMany()
      * ```
      */
    get ticketEvent(): Prisma.TicketEventDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.verificationSettings`: Exposes CRUD operations for the **VerificationSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more VerificationSettings
      * const verificationSettings = await prisma.verificationSettings.findMany()
      * ```
      */
    get verificationSettings(): Prisma.VerificationSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.verificationAttempt`: Exposes CRUD operations for the **VerificationAttempt** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more VerificationAttempts
      * const verificationAttempts = await prisma.verificationAttempt.findMany()
      * ```
      */
    get verificationAttempt(): Prisma.VerificationAttemptDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.verificationPendingMember`: Exposes CRUD operations for the **VerificationPendingMember** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more VerificationPendingMembers
      * const verificationPendingMembers = await prisma.verificationPendingMember.findMany()
      * ```
      */
    get verificationPendingMember(): Prisma.VerificationPendingMemberDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.voiceSettings`: Exposes CRUD operations for the **VoiceSettings** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more VoiceSettings
      * const voiceSettings = await prisma.voiceSettings.findMany()
      * ```
      */
    get voiceSettings(): Prisma.VoiceSettingsDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.voiceHub`: Exposes CRUD operations for the **VoiceHub** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more VoiceHubs
      * const voiceHubs = await prisma.voiceHub.findMany()
      * ```
      */
    get voiceHub(): Prisma.VoiceHubDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
    /**
     * `prisma.voiceRoom`: Exposes CRUD operations for the **VoiceRoom** model.
      * Example usage:
      * ```ts
      * // Fetch zero or more VoiceRooms
      * const voiceRooms = await prisma.voiceRoom.findMany()
      * ```
      */
    get voiceRoom(): Prisma.VoiceRoomDelegate<ExtArgs, {
        omit: OmitOpts;
    }>;
}
export declare function getPrismaClientClass(): PrismaClientConstructor;
//# sourceMappingURL=class.d.ts.map
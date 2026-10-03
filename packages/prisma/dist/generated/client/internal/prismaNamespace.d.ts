import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
/**
 * Prisma Errors
 */
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
/**
 * Re-export of sql-template-tag
 */
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
/**
 * Decimal.js
 */
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
/**
* Extensions
*/
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
/**
 * Prisma Client JS version: 7.9.1
 * Query Engine version: e922089b7d7502aff4249d5da3420f6fa55fc6ad
 */
export declare const prismaVersion: PrismaVersion;
/**
 * Utility Types
 */
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
/**
 * Helper for filtering JSON entries that have `null` on the database (empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const DbNull: runtime.DbNullClass;
/**
 * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const JsonNull: runtime.JsonNullClass;
/**
 * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
 */
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
/**
 * Subset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
 */
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
/**
 * Resolved type of the argument passed to the `PrismaClient` constructor.
 *
 * When called without a narrower options type (the common case), this resolves
 * to `PrismaClientOptions` directly, which produces a clear TypeScript error
 * message (`not assignable to parameter of type 'PrismaClientOptions'`) when
 * the argument is missing or incomplete. When the user supplies a narrower
 * options type (e.g. via a literal), it falls back to `Subset` to keep
 * filtering out unknown properties.
 */
export type PrismaClientConstructorArgs<Options extends PrismaClientOptions> = [
    PrismaClientOptions
] extends [Options] ? PrismaClientOptions : Subset<Options, PrismaClientOptions>;
/**
 * SelectSubset
 * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
 * Additionally, it validates, if both select and include are present. If the case, it errors.
 */
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
/**
 * Subset + Intersection
 * @desc From `T` pick properties that exist in `U` and intersect `K`
 */
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
/**
 * XOR is needed to have a real mutually exclusive union type
 * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
 */
export type XOR<T, U> = T extends object ? U extends object ? ((Without<T, U> & U) | (Without<U, T> & T)) & object : U : T;
/**
 * Is T a Record?
 */
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
/**
 * If it's T[], return T
 */
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
/**
 * From ts-toolbelt
 */
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
/** Helper Types for "Merge" **/
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
/** End Helper Types for "Merge" **/
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
/**
 * Convert tuple to union
 */
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
/**
 * Like `Pick`, but additionally can also accept an array of keys
 */
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
/**
 * Exclude all keys with underscores
 */
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly ApplicationCounter: "ApplicationCounter";
    readonly ApplicationForm: "ApplicationForm";
    readonly ApplicationPanel: "ApplicationPanel";
    readonly Application: "Application";
    readonly ApplicationVote: "ApplicationVote";
    readonly ApplicationNote: "ApplicationNote";
    readonly Guild: "Guild";
    readonly RoleMenu: "RoleMenu";
    readonly RoleMenuOption: "RoleMenuOption";
    readonly WelcomeGoodbyeConfig: "WelcomeGoodbyeConfig";
    readonly AutoroleConfig: "AutoroleConfig";
    readonly AutoroleRule: "AutoroleRule";
    readonly RulesConfig: "RulesConfig";
    readonly DiscordRoleAuditEvent: "DiscordRoleAuditEvent";
    readonly CommunityCounter: "CommunityCounter";
    readonly ServerLogConfig: "ServerLogConfig";
    readonly EmbedTemplate: "EmbedTemplate";
    readonly CustomCommand: "CustomCommand";
    readonly Suggestion: "Suggestion";
    readonly StarboardConfig: "StarboardConfig";
    readonly StarboardEntry: "StarboardEntry";
    readonly PermissionPrincipal: "PermissionPrincipal";
    readonly PermissionDefinition: "PermissionDefinition";
    readonly PermissionAssignment: "PermissionAssignment";
    readonly PermissionAuditEvent: "PermissionAuditEvent";
    readonly PermissionCatalogState: "PermissionCatalogState";
    readonly PlatformUser: "PlatformUser";
    readonly ExternalIdentity: "ExternalIdentity";
    readonly BrowserSession: "BrowserSession";
    readonly OAuthTransaction: "OAuthTransaction";
    readonly OAuthCredential: "OAuthCredential";
    readonly DiscordGuildMembership: "DiscordGuildMembership";
    readonly DiscordGuildMembershipRole: "DiscordGuildMembershipRole";
    readonly AuthenticationAuditEvent: "AuthenticationAuditEvent";
    readonly BirthdaySettings: "BirthdaySettings";
    readonly Birthday: "Birthday";
    readonly BuilderDraft: "BuilderDraft";
    readonly BuilderRun: "BuilderRun";
    readonly BuilderRunItem: "BuilderRunItem";
    readonly FivemSettings: "FivemSettings";
    readonly FivemStatusSnapshot: "FivemStatusSnapshot";
    readonly GamesSettings: "GamesSettings";
    readonly GamesServer: "GamesServer";
    readonly GamesStatusSnapshot: "GamesStatusSnapshot";
    readonly GiveawayCounter: "GiveawayCounter";
    readonly Giveaway: "Giveaway";
    readonly GiveawayEntry: "GiveawayEntry";
    readonly KnowledgeSettings: "KnowledgeSettings";
    readonly KnowledgeCategory: "KnowledgeCategory";
    readonly KnowledgeArticle: "KnowledgeArticle";
    readonly LevelSettings: "LevelSettings";
    readonly LevelMember: "LevelMember";
    readonly MessagesLook: "MessagesLook";
    readonly MessagesTemplate: "MessagesTemplate";
    readonly ModerationSettings: "ModerationSettings";
    readonly ModerationCase: "ModerationCase";
    readonly MusicSettings: "MusicSettings";
    readonly MusicTrack: "MusicTrack";
    readonly MusicPlaylist: "MusicPlaylist";
    readonly MusicPlaylistTrack: "MusicPlaylistTrack";
    readonly MusicStation: "MusicStation";
    readonly MusicSession: "MusicSession";
    readonly PollCounter: "PollCounter";
    readonly Poll: "Poll";
    readonly PollVote: "PollVote";
    readonly ScheduledMessage: "ScheduledMessage";
    readonly ScheduledMessageRun: "ScheduledMessageRun";
    readonly StaffSettings: "StaffSettings";
    readonly StaffRank: "StaffRank";
    readonly StaffMember: "StaffMember";
    readonly StaffRecord: "StaffRecord";
    readonly StaffStrike: "StaffStrike";
    readonly StaffLeave: "StaffLeave";
    readonly StaffShift: "StaffShift";
    readonly StreamsSettings: "StreamsSettings";
    readonly StreamsSubscription: "StreamsSubscription";
    readonly TicketSettings: "TicketSettings";
    readonly TicketCategory: "TicketCategory";
    readonly TicketPanel: "TicketPanel";
    readonly Ticket: "Ticket";
    readonly TicketMessage: "TicketMessage";
    readonly TicketEvent: "TicketEvent";
    readonly VerificationSettings: "VerificationSettings";
    readonly VerificationAttempt: "VerificationAttempt";
    readonly VerificationPendingMember: "VerificationPendingMember";
    readonly VoiceSettings: "VoiceSettings";
    readonly VoiceHub: "VoiceHub";
    readonly VoiceRoom: "VoiceRoom";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "applicationCounter" | "applicationForm" | "applicationPanel" | "application" | "applicationVote" | "applicationNote" | "guild" | "roleMenu" | "roleMenuOption" | "welcomeGoodbyeConfig" | "autoroleConfig" | "autoroleRule" | "rulesConfig" | "discordRoleAuditEvent" | "communityCounter" | "serverLogConfig" | "embedTemplate" | "customCommand" | "suggestion" | "starboardConfig" | "starboardEntry" | "permissionPrincipal" | "permissionDefinition" | "permissionAssignment" | "permissionAuditEvent" | "permissionCatalogState" | "platformUser" | "externalIdentity" | "browserSession" | "oAuthTransaction" | "oAuthCredential" | "discordGuildMembership" | "discordGuildMembershipRole" | "authenticationAuditEvent" | "birthdaySettings" | "birthday" | "builderDraft" | "builderRun" | "builderRunItem" | "fivemSettings" | "fivemStatusSnapshot" | "gamesSettings" | "gamesServer" | "gamesStatusSnapshot" | "giveawayCounter" | "giveaway" | "giveawayEntry" | "knowledgeSettings" | "knowledgeCategory" | "knowledgeArticle" | "levelSettings" | "levelMember" | "messagesLook" | "messagesTemplate" | "moderationSettings" | "moderationCase" | "musicSettings" | "musicTrack" | "musicPlaylist" | "musicPlaylistTrack" | "musicStation" | "musicSession" | "pollCounter" | "poll" | "pollVote" | "scheduledMessage" | "scheduledMessageRun" | "staffSettings" | "staffRank" | "staffMember" | "staffRecord" | "staffStrike" | "staffLeave" | "staffShift" | "streamsSettings" | "streamsSubscription" | "ticketSettings" | "ticketCategory" | "ticketPanel" | "ticket" | "ticketMessage" | "ticketEvent" | "verificationSettings" | "verificationAttempt" | "verificationPendingMember" | "voiceSettings" | "voiceHub" | "voiceRoom";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        ApplicationCounter: {
            payload: Prisma.$ApplicationCounterPayload<ExtArgs>;
            fields: Prisma.ApplicationCounterFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ApplicationCounterFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ApplicationCounterFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>;
                };
                findFirst: {
                    args: Prisma.ApplicationCounterFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ApplicationCounterFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>;
                };
                findMany: {
                    args: Prisma.ApplicationCounterFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>[];
                };
                create: {
                    args: Prisma.ApplicationCounterCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>;
                };
                createMany: {
                    args: Prisma.ApplicationCounterCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ApplicationCounterCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>[];
                };
                delete: {
                    args: Prisma.ApplicationCounterDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>;
                };
                update: {
                    args: Prisma.ApplicationCounterUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>;
                };
                deleteMany: {
                    args: Prisma.ApplicationCounterDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ApplicationCounterUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ApplicationCounterUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>[];
                };
                upsert: {
                    args: Prisma.ApplicationCounterUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationCounterPayload>;
                };
                aggregate: {
                    args: Prisma.ApplicationCounterAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateApplicationCounter>;
                };
                groupBy: {
                    args: Prisma.ApplicationCounterGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationCounterGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ApplicationCounterCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationCounterCountAggregateOutputType> | number;
                };
            };
        };
        ApplicationForm: {
            payload: Prisma.$ApplicationFormPayload<ExtArgs>;
            fields: Prisma.ApplicationFormFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ApplicationFormFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ApplicationFormFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>;
                };
                findFirst: {
                    args: Prisma.ApplicationFormFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ApplicationFormFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>;
                };
                findMany: {
                    args: Prisma.ApplicationFormFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>[];
                };
                create: {
                    args: Prisma.ApplicationFormCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>;
                };
                createMany: {
                    args: Prisma.ApplicationFormCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ApplicationFormCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>[];
                };
                delete: {
                    args: Prisma.ApplicationFormDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>;
                };
                update: {
                    args: Prisma.ApplicationFormUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>;
                };
                deleteMany: {
                    args: Prisma.ApplicationFormDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ApplicationFormUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ApplicationFormUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>[];
                };
                upsert: {
                    args: Prisma.ApplicationFormUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationFormPayload>;
                };
                aggregate: {
                    args: Prisma.ApplicationFormAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateApplicationForm>;
                };
                groupBy: {
                    args: Prisma.ApplicationFormGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationFormGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ApplicationFormCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationFormCountAggregateOutputType> | number;
                };
            };
        };
        ApplicationPanel: {
            payload: Prisma.$ApplicationPanelPayload<ExtArgs>;
            fields: Prisma.ApplicationPanelFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ApplicationPanelFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ApplicationPanelFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>;
                };
                findFirst: {
                    args: Prisma.ApplicationPanelFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ApplicationPanelFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>;
                };
                findMany: {
                    args: Prisma.ApplicationPanelFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>[];
                };
                create: {
                    args: Prisma.ApplicationPanelCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>;
                };
                createMany: {
                    args: Prisma.ApplicationPanelCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ApplicationPanelCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>[];
                };
                delete: {
                    args: Prisma.ApplicationPanelDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>;
                };
                update: {
                    args: Prisma.ApplicationPanelUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>;
                };
                deleteMany: {
                    args: Prisma.ApplicationPanelDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ApplicationPanelUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ApplicationPanelUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>[];
                };
                upsert: {
                    args: Prisma.ApplicationPanelUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPanelPayload>;
                };
                aggregate: {
                    args: Prisma.ApplicationPanelAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateApplicationPanel>;
                };
                groupBy: {
                    args: Prisma.ApplicationPanelGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationPanelGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ApplicationPanelCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationPanelCountAggregateOutputType> | number;
                };
            };
        };
        Application: {
            payload: Prisma.$ApplicationPayload<ExtArgs>;
            fields: Prisma.ApplicationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ApplicationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ApplicationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>;
                };
                findFirst: {
                    args: Prisma.ApplicationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ApplicationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>;
                };
                findMany: {
                    args: Prisma.ApplicationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>[];
                };
                create: {
                    args: Prisma.ApplicationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>;
                };
                createMany: {
                    args: Prisma.ApplicationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ApplicationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>[];
                };
                delete: {
                    args: Prisma.ApplicationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>;
                };
                update: {
                    args: Prisma.ApplicationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>;
                };
                deleteMany: {
                    args: Prisma.ApplicationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ApplicationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ApplicationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>[];
                };
                upsert: {
                    args: Prisma.ApplicationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationPayload>;
                };
                aggregate: {
                    args: Prisma.ApplicationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateApplication>;
                };
                groupBy: {
                    args: Prisma.ApplicationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ApplicationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationCountAggregateOutputType> | number;
                };
            };
        };
        ApplicationVote: {
            payload: Prisma.$ApplicationVotePayload<ExtArgs>;
            fields: Prisma.ApplicationVoteFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ApplicationVoteFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ApplicationVoteFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>;
                };
                findFirst: {
                    args: Prisma.ApplicationVoteFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ApplicationVoteFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>;
                };
                findMany: {
                    args: Prisma.ApplicationVoteFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>[];
                };
                create: {
                    args: Prisma.ApplicationVoteCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>;
                };
                createMany: {
                    args: Prisma.ApplicationVoteCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ApplicationVoteCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>[];
                };
                delete: {
                    args: Prisma.ApplicationVoteDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>;
                };
                update: {
                    args: Prisma.ApplicationVoteUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>;
                };
                deleteMany: {
                    args: Prisma.ApplicationVoteDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ApplicationVoteUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ApplicationVoteUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>[];
                };
                upsert: {
                    args: Prisma.ApplicationVoteUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationVotePayload>;
                };
                aggregate: {
                    args: Prisma.ApplicationVoteAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateApplicationVote>;
                };
                groupBy: {
                    args: Prisma.ApplicationVoteGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationVoteGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ApplicationVoteCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationVoteCountAggregateOutputType> | number;
                };
            };
        };
        ApplicationNote: {
            payload: Prisma.$ApplicationNotePayload<ExtArgs>;
            fields: Prisma.ApplicationNoteFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ApplicationNoteFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ApplicationNoteFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>;
                };
                findFirst: {
                    args: Prisma.ApplicationNoteFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ApplicationNoteFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>;
                };
                findMany: {
                    args: Prisma.ApplicationNoteFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>[];
                };
                create: {
                    args: Prisma.ApplicationNoteCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>;
                };
                createMany: {
                    args: Prisma.ApplicationNoteCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ApplicationNoteCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>[];
                };
                delete: {
                    args: Prisma.ApplicationNoteDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>;
                };
                update: {
                    args: Prisma.ApplicationNoteUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>;
                };
                deleteMany: {
                    args: Prisma.ApplicationNoteDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ApplicationNoteUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ApplicationNoteUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>[];
                };
                upsert: {
                    args: Prisma.ApplicationNoteUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ApplicationNotePayload>;
                };
                aggregate: {
                    args: Prisma.ApplicationNoteAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateApplicationNote>;
                };
                groupBy: {
                    args: Prisma.ApplicationNoteGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationNoteGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ApplicationNoteCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ApplicationNoteCountAggregateOutputType> | number;
                };
            };
        };
        Guild: {
            payload: Prisma.$GuildPayload<ExtArgs>;
            fields: Prisma.GuildFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GuildFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GuildFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>;
                };
                findFirst: {
                    args: Prisma.GuildFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GuildFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>;
                };
                findMany: {
                    args: Prisma.GuildFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>[];
                };
                create: {
                    args: Prisma.GuildCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>;
                };
                createMany: {
                    args: Prisma.GuildCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GuildCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>[];
                };
                delete: {
                    args: Prisma.GuildDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>;
                };
                update: {
                    args: Prisma.GuildUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>;
                };
                deleteMany: {
                    args: Prisma.GuildDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GuildUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GuildUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>[];
                };
                upsert: {
                    args: Prisma.GuildUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GuildPayload>;
                };
                aggregate: {
                    args: Prisma.GuildAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGuild>;
                };
                groupBy: {
                    args: Prisma.GuildGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GuildGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GuildCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GuildCountAggregateOutputType> | number;
                };
            };
        };
        RoleMenu: {
            payload: Prisma.$RoleMenuPayload<ExtArgs>;
            fields: Prisma.RoleMenuFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RoleMenuFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RoleMenuFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>;
                };
                findFirst: {
                    args: Prisma.RoleMenuFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RoleMenuFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>;
                };
                findMany: {
                    args: Prisma.RoleMenuFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>[];
                };
                create: {
                    args: Prisma.RoleMenuCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>;
                };
                createMany: {
                    args: Prisma.RoleMenuCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RoleMenuCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>[];
                };
                delete: {
                    args: Prisma.RoleMenuDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>;
                };
                update: {
                    args: Prisma.RoleMenuUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>;
                };
                deleteMany: {
                    args: Prisma.RoleMenuDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RoleMenuUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RoleMenuUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>[];
                };
                upsert: {
                    args: Prisma.RoleMenuUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuPayload>;
                };
                aggregate: {
                    args: Prisma.RoleMenuAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRoleMenu>;
                };
                groupBy: {
                    args: Prisma.RoleMenuGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RoleMenuGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RoleMenuCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RoleMenuCountAggregateOutputType> | number;
                };
            };
        };
        RoleMenuOption: {
            payload: Prisma.$RoleMenuOptionPayload<ExtArgs>;
            fields: Prisma.RoleMenuOptionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RoleMenuOptionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RoleMenuOptionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>;
                };
                findFirst: {
                    args: Prisma.RoleMenuOptionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RoleMenuOptionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>;
                };
                findMany: {
                    args: Prisma.RoleMenuOptionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>[];
                };
                create: {
                    args: Prisma.RoleMenuOptionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>;
                };
                createMany: {
                    args: Prisma.RoleMenuOptionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RoleMenuOptionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>[];
                };
                delete: {
                    args: Prisma.RoleMenuOptionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>;
                };
                update: {
                    args: Prisma.RoleMenuOptionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>;
                };
                deleteMany: {
                    args: Prisma.RoleMenuOptionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RoleMenuOptionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RoleMenuOptionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>[];
                };
                upsert: {
                    args: Prisma.RoleMenuOptionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RoleMenuOptionPayload>;
                };
                aggregate: {
                    args: Prisma.RoleMenuOptionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRoleMenuOption>;
                };
                groupBy: {
                    args: Prisma.RoleMenuOptionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RoleMenuOptionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RoleMenuOptionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RoleMenuOptionCountAggregateOutputType> | number;
                };
            };
        };
        WelcomeGoodbyeConfig: {
            payload: Prisma.$WelcomeGoodbyeConfigPayload<ExtArgs>;
            fields: Prisma.WelcomeGoodbyeConfigFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WelcomeGoodbyeConfigFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WelcomeGoodbyeConfigFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>;
                };
                findFirst: {
                    args: Prisma.WelcomeGoodbyeConfigFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WelcomeGoodbyeConfigFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>;
                };
                findMany: {
                    args: Prisma.WelcomeGoodbyeConfigFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>[];
                };
                create: {
                    args: Prisma.WelcomeGoodbyeConfigCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>;
                };
                createMany: {
                    args: Prisma.WelcomeGoodbyeConfigCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WelcomeGoodbyeConfigCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>[];
                };
                delete: {
                    args: Prisma.WelcomeGoodbyeConfigDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>;
                };
                update: {
                    args: Prisma.WelcomeGoodbyeConfigUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>;
                };
                deleteMany: {
                    args: Prisma.WelcomeGoodbyeConfigDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WelcomeGoodbyeConfigUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WelcomeGoodbyeConfigUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>[];
                };
                upsert: {
                    args: Prisma.WelcomeGoodbyeConfigUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WelcomeGoodbyeConfigPayload>;
                };
                aggregate: {
                    args: Prisma.WelcomeGoodbyeConfigAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWelcomeGoodbyeConfig>;
                };
                groupBy: {
                    args: Prisma.WelcomeGoodbyeConfigGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WelcomeGoodbyeConfigGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WelcomeGoodbyeConfigCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WelcomeGoodbyeConfigCountAggregateOutputType> | number;
                };
            };
        };
        AutoroleConfig: {
            payload: Prisma.$AutoroleConfigPayload<ExtArgs>;
            fields: Prisma.AutoroleConfigFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AutoroleConfigFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AutoroleConfigFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>;
                };
                findFirst: {
                    args: Prisma.AutoroleConfigFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AutoroleConfigFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>;
                };
                findMany: {
                    args: Prisma.AutoroleConfigFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>[];
                };
                create: {
                    args: Prisma.AutoroleConfigCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>;
                };
                createMany: {
                    args: Prisma.AutoroleConfigCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AutoroleConfigCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>[];
                };
                delete: {
                    args: Prisma.AutoroleConfigDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>;
                };
                update: {
                    args: Prisma.AutoroleConfigUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>;
                };
                deleteMany: {
                    args: Prisma.AutoroleConfigDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AutoroleConfigUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AutoroleConfigUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>[];
                };
                upsert: {
                    args: Prisma.AutoroleConfigUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleConfigPayload>;
                };
                aggregate: {
                    args: Prisma.AutoroleConfigAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAutoroleConfig>;
                };
                groupBy: {
                    args: Prisma.AutoroleConfigGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AutoroleConfigGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AutoroleConfigCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AutoroleConfigCountAggregateOutputType> | number;
                };
            };
        };
        AutoroleRule: {
            payload: Prisma.$AutoroleRulePayload<ExtArgs>;
            fields: Prisma.AutoroleRuleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AutoroleRuleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AutoroleRuleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>;
                };
                findFirst: {
                    args: Prisma.AutoroleRuleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AutoroleRuleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>;
                };
                findMany: {
                    args: Prisma.AutoroleRuleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>[];
                };
                create: {
                    args: Prisma.AutoroleRuleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>;
                };
                createMany: {
                    args: Prisma.AutoroleRuleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AutoroleRuleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>[];
                };
                delete: {
                    args: Prisma.AutoroleRuleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>;
                };
                update: {
                    args: Prisma.AutoroleRuleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>;
                };
                deleteMany: {
                    args: Prisma.AutoroleRuleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AutoroleRuleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AutoroleRuleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>[];
                };
                upsert: {
                    args: Prisma.AutoroleRuleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AutoroleRulePayload>;
                };
                aggregate: {
                    args: Prisma.AutoroleRuleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAutoroleRule>;
                };
                groupBy: {
                    args: Prisma.AutoroleRuleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AutoroleRuleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AutoroleRuleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AutoroleRuleCountAggregateOutputType> | number;
                };
            };
        };
        RulesConfig: {
            payload: Prisma.$RulesConfigPayload<ExtArgs>;
            fields: Prisma.RulesConfigFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.RulesConfigFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.RulesConfigFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>;
                };
                findFirst: {
                    args: Prisma.RulesConfigFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.RulesConfigFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>;
                };
                findMany: {
                    args: Prisma.RulesConfigFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>[];
                };
                create: {
                    args: Prisma.RulesConfigCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>;
                };
                createMany: {
                    args: Prisma.RulesConfigCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.RulesConfigCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>[];
                };
                delete: {
                    args: Prisma.RulesConfigDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>;
                };
                update: {
                    args: Prisma.RulesConfigUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>;
                };
                deleteMany: {
                    args: Prisma.RulesConfigDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.RulesConfigUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.RulesConfigUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>[];
                };
                upsert: {
                    args: Prisma.RulesConfigUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$RulesConfigPayload>;
                };
                aggregate: {
                    args: Prisma.RulesConfigAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateRulesConfig>;
                };
                groupBy: {
                    args: Prisma.RulesConfigGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RulesConfigGroupByOutputType>[];
                };
                count: {
                    args: Prisma.RulesConfigCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.RulesConfigCountAggregateOutputType> | number;
                };
            };
        };
        DiscordRoleAuditEvent: {
            payload: Prisma.$DiscordRoleAuditEventPayload<ExtArgs>;
            fields: Prisma.DiscordRoleAuditEventFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DiscordRoleAuditEventFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DiscordRoleAuditEventFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>;
                };
                findFirst: {
                    args: Prisma.DiscordRoleAuditEventFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DiscordRoleAuditEventFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>;
                };
                findMany: {
                    args: Prisma.DiscordRoleAuditEventFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>[];
                };
                create: {
                    args: Prisma.DiscordRoleAuditEventCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>;
                };
                createMany: {
                    args: Prisma.DiscordRoleAuditEventCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DiscordRoleAuditEventCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>[];
                };
                delete: {
                    args: Prisma.DiscordRoleAuditEventDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>;
                };
                update: {
                    args: Prisma.DiscordRoleAuditEventUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>;
                };
                deleteMany: {
                    args: Prisma.DiscordRoleAuditEventDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DiscordRoleAuditEventUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DiscordRoleAuditEventUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>[];
                };
                upsert: {
                    args: Prisma.DiscordRoleAuditEventUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordRoleAuditEventPayload>;
                };
                aggregate: {
                    args: Prisma.DiscordRoleAuditEventAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDiscordRoleAuditEvent>;
                };
                groupBy: {
                    args: Prisma.DiscordRoleAuditEventGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DiscordRoleAuditEventGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DiscordRoleAuditEventCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DiscordRoleAuditEventCountAggregateOutputType> | number;
                };
            };
        };
        CommunityCounter: {
            payload: Prisma.$CommunityCounterPayload<ExtArgs>;
            fields: Prisma.CommunityCounterFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CommunityCounterFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CommunityCounterFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>;
                };
                findFirst: {
                    args: Prisma.CommunityCounterFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CommunityCounterFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>;
                };
                findMany: {
                    args: Prisma.CommunityCounterFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>[];
                };
                create: {
                    args: Prisma.CommunityCounterCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>;
                };
                createMany: {
                    args: Prisma.CommunityCounterCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CommunityCounterCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>[];
                };
                delete: {
                    args: Prisma.CommunityCounterDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>;
                };
                update: {
                    args: Prisma.CommunityCounterUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>;
                };
                deleteMany: {
                    args: Prisma.CommunityCounterDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CommunityCounterUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CommunityCounterUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>[];
                };
                upsert: {
                    args: Prisma.CommunityCounterUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CommunityCounterPayload>;
                };
                aggregate: {
                    args: Prisma.CommunityCounterAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCommunityCounter>;
                };
                groupBy: {
                    args: Prisma.CommunityCounterGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CommunityCounterGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CommunityCounterCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CommunityCounterCountAggregateOutputType> | number;
                };
            };
        };
        ServerLogConfig: {
            payload: Prisma.$ServerLogConfigPayload<ExtArgs>;
            fields: Prisma.ServerLogConfigFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ServerLogConfigFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ServerLogConfigFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>;
                };
                findFirst: {
                    args: Prisma.ServerLogConfigFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ServerLogConfigFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>;
                };
                findMany: {
                    args: Prisma.ServerLogConfigFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>[];
                };
                create: {
                    args: Prisma.ServerLogConfigCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>;
                };
                createMany: {
                    args: Prisma.ServerLogConfigCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ServerLogConfigCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>[];
                };
                delete: {
                    args: Prisma.ServerLogConfigDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>;
                };
                update: {
                    args: Prisma.ServerLogConfigUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>;
                };
                deleteMany: {
                    args: Prisma.ServerLogConfigDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ServerLogConfigUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ServerLogConfigUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>[];
                };
                upsert: {
                    args: Prisma.ServerLogConfigUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ServerLogConfigPayload>;
                };
                aggregate: {
                    args: Prisma.ServerLogConfigAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateServerLogConfig>;
                };
                groupBy: {
                    args: Prisma.ServerLogConfigGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServerLogConfigGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ServerLogConfigCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ServerLogConfigCountAggregateOutputType> | number;
                };
            };
        };
        EmbedTemplate: {
            payload: Prisma.$EmbedTemplatePayload<ExtArgs>;
            fields: Prisma.EmbedTemplateFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EmbedTemplateFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EmbedTemplateFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>;
                };
                findFirst: {
                    args: Prisma.EmbedTemplateFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EmbedTemplateFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>;
                };
                findMany: {
                    args: Prisma.EmbedTemplateFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>[];
                };
                create: {
                    args: Prisma.EmbedTemplateCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>;
                };
                createMany: {
                    args: Prisma.EmbedTemplateCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EmbedTemplateCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>[];
                };
                delete: {
                    args: Prisma.EmbedTemplateDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>;
                };
                update: {
                    args: Prisma.EmbedTemplateUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>;
                };
                deleteMany: {
                    args: Prisma.EmbedTemplateDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EmbedTemplateUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EmbedTemplateUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>[];
                };
                upsert: {
                    args: Prisma.EmbedTemplateUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedTemplatePayload>;
                };
                aggregate: {
                    args: Prisma.EmbedTemplateAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEmbedTemplate>;
                };
                groupBy: {
                    args: Prisma.EmbedTemplateGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EmbedTemplateGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EmbedTemplateCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EmbedTemplateCountAggregateOutputType> | number;
                };
            };
        };
        CustomCommand: {
            payload: Prisma.$CustomCommandPayload<ExtArgs>;
            fields: Prisma.CustomCommandFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.CustomCommandFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.CustomCommandFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>;
                };
                findFirst: {
                    args: Prisma.CustomCommandFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.CustomCommandFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>;
                };
                findMany: {
                    args: Prisma.CustomCommandFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>[];
                };
                create: {
                    args: Prisma.CustomCommandCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>;
                };
                createMany: {
                    args: Prisma.CustomCommandCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.CustomCommandCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>[];
                };
                delete: {
                    args: Prisma.CustomCommandDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>;
                };
                update: {
                    args: Prisma.CustomCommandUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>;
                };
                deleteMany: {
                    args: Prisma.CustomCommandDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.CustomCommandUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.CustomCommandUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>[];
                };
                upsert: {
                    args: Prisma.CustomCommandUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$CustomCommandPayload>;
                };
                aggregate: {
                    args: Prisma.CustomCommandAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateCustomCommand>;
                };
                groupBy: {
                    args: Prisma.CustomCommandGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CustomCommandGroupByOutputType>[];
                };
                count: {
                    args: Prisma.CustomCommandCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.CustomCommandCountAggregateOutputType> | number;
                };
            };
        };
        Suggestion: {
            payload: Prisma.$SuggestionPayload<ExtArgs>;
            fields: Prisma.SuggestionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SuggestionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SuggestionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>;
                };
                findFirst: {
                    args: Prisma.SuggestionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SuggestionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>;
                };
                findMany: {
                    args: Prisma.SuggestionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>[];
                };
                create: {
                    args: Prisma.SuggestionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>;
                };
                createMany: {
                    args: Prisma.SuggestionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SuggestionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>[];
                };
                delete: {
                    args: Prisma.SuggestionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>;
                };
                update: {
                    args: Prisma.SuggestionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>;
                };
                deleteMany: {
                    args: Prisma.SuggestionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SuggestionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SuggestionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>[];
                };
                upsert: {
                    args: Prisma.SuggestionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SuggestionPayload>;
                };
                aggregate: {
                    args: Prisma.SuggestionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSuggestion>;
                };
                groupBy: {
                    args: Prisma.SuggestionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SuggestionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SuggestionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SuggestionCountAggregateOutputType> | number;
                };
            };
        };
        StarboardConfig: {
            payload: Prisma.$StarboardConfigPayload<ExtArgs>;
            fields: Prisma.StarboardConfigFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StarboardConfigFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StarboardConfigFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>;
                };
                findFirst: {
                    args: Prisma.StarboardConfigFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StarboardConfigFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>;
                };
                findMany: {
                    args: Prisma.StarboardConfigFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>[];
                };
                create: {
                    args: Prisma.StarboardConfigCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>;
                };
                createMany: {
                    args: Prisma.StarboardConfigCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StarboardConfigCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>[];
                };
                delete: {
                    args: Prisma.StarboardConfigDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>;
                };
                update: {
                    args: Prisma.StarboardConfigUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>;
                };
                deleteMany: {
                    args: Prisma.StarboardConfigDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StarboardConfigUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StarboardConfigUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>[];
                };
                upsert: {
                    args: Prisma.StarboardConfigUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardConfigPayload>;
                };
                aggregate: {
                    args: Prisma.StarboardConfigAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStarboardConfig>;
                };
                groupBy: {
                    args: Prisma.StarboardConfigGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StarboardConfigGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StarboardConfigCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StarboardConfigCountAggregateOutputType> | number;
                };
            };
        };
        StarboardEntry: {
            payload: Prisma.$StarboardEntryPayload<ExtArgs>;
            fields: Prisma.StarboardEntryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StarboardEntryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StarboardEntryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>;
                };
                findFirst: {
                    args: Prisma.StarboardEntryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StarboardEntryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>;
                };
                findMany: {
                    args: Prisma.StarboardEntryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>[];
                };
                create: {
                    args: Prisma.StarboardEntryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>;
                };
                createMany: {
                    args: Prisma.StarboardEntryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StarboardEntryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>[];
                };
                delete: {
                    args: Prisma.StarboardEntryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>;
                };
                update: {
                    args: Prisma.StarboardEntryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>;
                };
                deleteMany: {
                    args: Prisma.StarboardEntryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StarboardEntryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StarboardEntryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>[];
                };
                upsert: {
                    args: Prisma.StarboardEntryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StarboardEntryPayload>;
                };
                aggregate: {
                    args: Prisma.StarboardEntryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStarboardEntry>;
                };
                groupBy: {
                    args: Prisma.StarboardEntryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StarboardEntryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StarboardEntryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StarboardEntryCountAggregateOutputType> | number;
                };
            };
        };
        PermissionPrincipal: {
            payload: Prisma.$PermissionPrincipalPayload<ExtArgs>;
            fields: Prisma.PermissionPrincipalFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PermissionPrincipalFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PermissionPrincipalFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>;
                };
                findFirst: {
                    args: Prisma.PermissionPrincipalFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PermissionPrincipalFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>;
                };
                findMany: {
                    args: Prisma.PermissionPrincipalFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>[];
                };
                create: {
                    args: Prisma.PermissionPrincipalCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>;
                };
                createMany: {
                    args: Prisma.PermissionPrincipalCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PermissionPrincipalCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>[];
                };
                delete: {
                    args: Prisma.PermissionPrincipalDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>;
                };
                update: {
                    args: Prisma.PermissionPrincipalUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>;
                };
                deleteMany: {
                    args: Prisma.PermissionPrincipalDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PermissionPrincipalUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PermissionPrincipalUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>[];
                };
                upsert: {
                    args: Prisma.PermissionPrincipalUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionPrincipalPayload>;
                };
                aggregate: {
                    args: Prisma.PermissionPrincipalAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePermissionPrincipal>;
                };
                groupBy: {
                    args: Prisma.PermissionPrincipalGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionPrincipalGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PermissionPrincipalCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionPrincipalCountAggregateOutputType> | number;
                };
            };
        };
        PermissionDefinition: {
            payload: Prisma.$PermissionDefinitionPayload<ExtArgs>;
            fields: Prisma.PermissionDefinitionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PermissionDefinitionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PermissionDefinitionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>;
                };
                findFirst: {
                    args: Prisma.PermissionDefinitionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PermissionDefinitionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>;
                };
                findMany: {
                    args: Prisma.PermissionDefinitionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>[];
                };
                create: {
                    args: Prisma.PermissionDefinitionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>;
                };
                createMany: {
                    args: Prisma.PermissionDefinitionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PermissionDefinitionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>[];
                };
                delete: {
                    args: Prisma.PermissionDefinitionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>;
                };
                update: {
                    args: Prisma.PermissionDefinitionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>;
                };
                deleteMany: {
                    args: Prisma.PermissionDefinitionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PermissionDefinitionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PermissionDefinitionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>[];
                };
                upsert: {
                    args: Prisma.PermissionDefinitionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionDefinitionPayload>;
                };
                aggregate: {
                    args: Prisma.PermissionDefinitionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePermissionDefinition>;
                };
                groupBy: {
                    args: Prisma.PermissionDefinitionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionDefinitionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PermissionDefinitionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionDefinitionCountAggregateOutputType> | number;
                };
            };
        };
        PermissionAssignment: {
            payload: Prisma.$PermissionAssignmentPayload<ExtArgs>;
            fields: Prisma.PermissionAssignmentFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PermissionAssignmentFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PermissionAssignmentFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>;
                };
                findFirst: {
                    args: Prisma.PermissionAssignmentFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PermissionAssignmentFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>;
                };
                findMany: {
                    args: Prisma.PermissionAssignmentFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>[];
                };
                create: {
                    args: Prisma.PermissionAssignmentCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>;
                };
                createMany: {
                    args: Prisma.PermissionAssignmentCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PermissionAssignmentCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>[];
                };
                delete: {
                    args: Prisma.PermissionAssignmentDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>;
                };
                update: {
                    args: Prisma.PermissionAssignmentUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>;
                };
                deleteMany: {
                    args: Prisma.PermissionAssignmentDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PermissionAssignmentUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PermissionAssignmentUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>[];
                };
                upsert: {
                    args: Prisma.PermissionAssignmentUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAssignmentPayload>;
                };
                aggregate: {
                    args: Prisma.PermissionAssignmentAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePermissionAssignment>;
                };
                groupBy: {
                    args: Prisma.PermissionAssignmentGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionAssignmentGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PermissionAssignmentCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionAssignmentCountAggregateOutputType> | number;
                };
            };
        };
        PermissionAuditEvent: {
            payload: Prisma.$PermissionAuditEventPayload<ExtArgs>;
            fields: Prisma.PermissionAuditEventFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PermissionAuditEventFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PermissionAuditEventFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>;
                };
                findFirst: {
                    args: Prisma.PermissionAuditEventFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PermissionAuditEventFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>;
                };
                findMany: {
                    args: Prisma.PermissionAuditEventFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>[];
                };
                create: {
                    args: Prisma.PermissionAuditEventCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>;
                };
                createMany: {
                    args: Prisma.PermissionAuditEventCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PermissionAuditEventCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>[];
                };
                delete: {
                    args: Prisma.PermissionAuditEventDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>;
                };
                update: {
                    args: Prisma.PermissionAuditEventUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>;
                };
                deleteMany: {
                    args: Prisma.PermissionAuditEventDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PermissionAuditEventUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PermissionAuditEventUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>[];
                };
                upsert: {
                    args: Prisma.PermissionAuditEventUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionAuditEventPayload>;
                };
                aggregate: {
                    args: Prisma.PermissionAuditEventAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePermissionAuditEvent>;
                };
                groupBy: {
                    args: Prisma.PermissionAuditEventGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionAuditEventGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PermissionAuditEventCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionAuditEventCountAggregateOutputType> | number;
                };
            };
        };
        PermissionCatalogState: {
            payload: Prisma.$PermissionCatalogStatePayload<ExtArgs>;
            fields: Prisma.PermissionCatalogStateFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PermissionCatalogStateFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PermissionCatalogStateFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>;
                };
                findFirst: {
                    args: Prisma.PermissionCatalogStateFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PermissionCatalogStateFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>;
                };
                findMany: {
                    args: Prisma.PermissionCatalogStateFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>[];
                };
                create: {
                    args: Prisma.PermissionCatalogStateCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>;
                };
                createMany: {
                    args: Prisma.PermissionCatalogStateCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PermissionCatalogStateCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>[];
                };
                delete: {
                    args: Prisma.PermissionCatalogStateDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>;
                };
                update: {
                    args: Prisma.PermissionCatalogStateUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>;
                };
                deleteMany: {
                    args: Prisma.PermissionCatalogStateDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PermissionCatalogStateUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PermissionCatalogStateUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>[];
                };
                upsert: {
                    args: Prisma.PermissionCatalogStateUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PermissionCatalogStatePayload>;
                };
                aggregate: {
                    args: Prisma.PermissionCatalogStateAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePermissionCatalogState>;
                };
                groupBy: {
                    args: Prisma.PermissionCatalogStateGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionCatalogStateGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PermissionCatalogStateCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PermissionCatalogStateCountAggregateOutputType> | number;
                };
            };
        };
        PlatformUser: {
            payload: Prisma.$PlatformUserPayload<ExtArgs>;
            fields: Prisma.PlatformUserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PlatformUserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PlatformUserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>;
                };
                findFirst: {
                    args: Prisma.PlatformUserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PlatformUserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>;
                };
                findMany: {
                    args: Prisma.PlatformUserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>[];
                };
                create: {
                    args: Prisma.PlatformUserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>;
                };
                createMany: {
                    args: Prisma.PlatformUserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PlatformUserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>[];
                };
                delete: {
                    args: Prisma.PlatformUserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>;
                };
                update: {
                    args: Prisma.PlatformUserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>;
                };
                deleteMany: {
                    args: Prisma.PlatformUserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PlatformUserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PlatformUserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>[];
                };
                upsert: {
                    args: Prisma.PlatformUserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PlatformUserPayload>;
                };
                aggregate: {
                    args: Prisma.PlatformUserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePlatformUser>;
                };
                groupBy: {
                    args: Prisma.PlatformUserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PlatformUserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PlatformUserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PlatformUserCountAggregateOutputType> | number;
                };
            };
        };
        ExternalIdentity: {
            payload: Prisma.$ExternalIdentityPayload<ExtArgs>;
            fields: Prisma.ExternalIdentityFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ExternalIdentityFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ExternalIdentityFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>;
                };
                findFirst: {
                    args: Prisma.ExternalIdentityFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ExternalIdentityFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>;
                };
                findMany: {
                    args: Prisma.ExternalIdentityFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>[];
                };
                create: {
                    args: Prisma.ExternalIdentityCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>;
                };
                createMany: {
                    args: Prisma.ExternalIdentityCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ExternalIdentityCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>[];
                };
                delete: {
                    args: Prisma.ExternalIdentityDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>;
                };
                update: {
                    args: Prisma.ExternalIdentityUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>;
                };
                deleteMany: {
                    args: Prisma.ExternalIdentityDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ExternalIdentityUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ExternalIdentityUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>[];
                };
                upsert: {
                    args: Prisma.ExternalIdentityUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ExternalIdentityPayload>;
                };
                aggregate: {
                    args: Prisma.ExternalIdentityAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateExternalIdentity>;
                };
                groupBy: {
                    args: Prisma.ExternalIdentityGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExternalIdentityGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ExternalIdentityCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ExternalIdentityCountAggregateOutputType> | number;
                };
            };
        };
        BrowserSession: {
            payload: Prisma.$BrowserSessionPayload<ExtArgs>;
            fields: Prisma.BrowserSessionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BrowserSessionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BrowserSessionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>;
                };
                findFirst: {
                    args: Prisma.BrowserSessionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BrowserSessionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>;
                };
                findMany: {
                    args: Prisma.BrowserSessionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>[];
                };
                create: {
                    args: Prisma.BrowserSessionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>;
                };
                createMany: {
                    args: Prisma.BrowserSessionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BrowserSessionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>[];
                };
                delete: {
                    args: Prisma.BrowserSessionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>;
                };
                update: {
                    args: Prisma.BrowserSessionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>;
                };
                deleteMany: {
                    args: Prisma.BrowserSessionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BrowserSessionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BrowserSessionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>[];
                };
                upsert: {
                    args: Prisma.BrowserSessionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BrowserSessionPayload>;
                };
                aggregate: {
                    args: Prisma.BrowserSessionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBrowserSession>;
                };
                groupBy: {
                    args: Prisma.BrowserSessionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BrowserSessionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BrowserSessionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BrowserSessionCountAggregateOutputType> | number;
                };
            };
        };
        OAuthTransaction: {
            payload: Prisma.$OAuthTransactionPayload<ExtArgs>;
            fields: Prisma.OAuthTransactionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OAuthTransactionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OAuthTransactionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>;
                };
                findFirst: {
                    args: Prisma.OAuthTransactionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OAuthTransactionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>;
                };
                findMany: {
                    args: Prisma.OAuthTransactionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>[];
                };
                create: {
                    args: Prisma.OAuthTransactionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>;
                };
                createMany: {
                    args: Prisma.OAuthTransactionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OAuthTransactionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>[];
                };
                delete: {
                    args: Prisma.OAuthTransactionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>;
                };
                update: {
                    args: Prisma.OAuthTransactionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>;
                };
                deleteMany: {
                    args: Prisma.OAuthTransactionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OAuthTransactionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OAuthTransactionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>[];
                };
                upsert: {
                    args: Prisma.OAuthTransactionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthTransactionPayload>;
                };
                aggregate: {
                    args: Prisma.OAuthTransactionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOAuthTransaction>;
                };
                groupBy: {
                    args: Prisma.OAuthTransactionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OAuthTransactionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OAuthTransactionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OAuthTransactionCountAggregateOutputType> | number;
                };
            };
        };
        OAuthCredential: {
            payload: Prisma.$OAuthCredentialPayload<ExtArgs>;
            fields: Prisma.OAuthCredentialFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.OAuthCredentialFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.OAuthCredentialFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>;
                };
                findFirst: {
                    args: Prisma.OAuthCredentialFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.OAuthCredentialFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>;
                };
                findMany: {
                    args: Prisma.OAuthCredentialFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>[];
                };
                create: {
                    args: Prisma.OAuthCredentialCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>;
                };
                createMany: {
                    args: Prisma.OAuthCredentialCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.OAuthCredentialCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>[];
                };
                delete: {
                    args: Prisma.OAuthCredentialDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>;
                };
                update: {
                    args: Prisma.OAuthCredentialUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>;
                };
                deleteMany: {
                    args: Prisma.OAuthCredentialDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.OAuthCredentialUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.OAuthCredentialUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>[];
                };
                upsert: {
                    args: Prisma.OAuthCredentialUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$OAuthCredentialPayload>;
                };
                aggregate: {
                    args: Prisma.OAuthCredentialAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateOAuthCredential>;
                };
                groupBy: {
                    args: Prisma.OAuthCredentialGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OAuthCredentialGroupByOutputType>[];
                };
                count: {
                    args: Prisma.OAuthCredentialCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.OAuthCredentialCountAggregateOutputType> | number;
                };
            };
        };
        DiscordGuildMembership: {
            payload: Prisma.$DiscordGuildMembershipPayload<ExtArgs>;
            fields: Prisma.DiscordGuildMembershipFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DiscordGuildMembershipFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DiscordGuildMembershipFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>;
                };
                findFirst: {
                    args: Prisma.DiscordGuildMembershipFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DiscordGuildMembershipFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>;
                };
                findMany: {
                    args: Prisma.DiscordGuildMembershipFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>[];
                };
                create: {
                    args: Prisma.DiscordGuildMembershipCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>;
                };
                createMany: {
                    args: Prisma.DiscordGuildMembershipCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DiscordGuildMembershipCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>[];
                };
                delete: {
                    args: Prisma.DiscordGuildMembershipDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>;
                };
                update: {
                    args: Prisma.DiscordGuildMembershipUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>;
                };
                deleteMany: {
                    args: Prisma.DiscordGuildMembershipDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DiscordGuildMembershipUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DiscordGuildMembershipUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>[];
                };
                upsert: {
                    args: Prisma.DiscordGuildMembershipUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipPayload>;
                };
                aggregate: {
                    args: Prisma.DiscordGuildMembershipAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDiscordGuildMembership>;
                };
                groupBy: {
                    args: Prisma.DiscordGuildMembershipGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DiscordGuildMembershipGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DiscordGuildMembershipCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DiscordGuildMembershipCountAggregateOutputType> | number;
                };
            };
        };
        DiscordGuildMembershipRole: {
            payload: Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>;
            fields: Prisma.DiscordGuildMembershipRoleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DiscordGuildMembershipRoleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DiscordGuildMembershipRoleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>;
                };
                findFirst: {
                    args: Prisma.DiscordGuildMembershipRoleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DiscordGuildMembershipRoleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>;
                };
                findMany: {
                    args: Prisma.DiscordGuildMembershipRoleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>[];
                };
                create: {
                    args: Prisma.DiscordGuildMembershipRoleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>;
                };
                createMany: {
                    args: Prisma.DiscordGuildMembershipRoleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DiscordGuildMembershipRoleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>[];
                };
                delete: {
                    args: Prisma.DiscordGuildMembershipRoleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>;
                };
                update: {
                    args: Prisma.DiscordGuildMembershipRoleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>;
                };
                deleteMany: {
                    args: Prisma.DiscordGuildMembershipRoleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DiscordGuildMembershipRoleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DiscordGuildMembershipRoleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>[];
                };
                upsert: {
                    args: Prisma.DiscordGuildMembershipRoleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DiscordGuildMembershipRolePayload>;
                };
                aggregate: {
                    args: Prisma.DiscordGuildMembershipRoleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDiscordGuildMembershipRole>;
                };
                groupBy: {
                    args: Prisma.DiscordGuildMembershipRoleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DiscordGuildMembershipRoleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DiscordGuildMembershipRoleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DiscordGuildMembershipRoleCountAggregateOutputType> | number;
                };
            };
        };
        AuthenticationAuditEvent: {
            payload: Prisma.$AuthenticationAuditEventPayload<ExtArgs>;
            fields: Prisma.AuthenticationAuditEventFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.AuthenticationAuditEventFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.AuthenticationAuditEventFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>;
                };
                findFirst: {
                    args: Prisma.AuthenticationAuditEventFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.AuthenticationAuditEventFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>;
                };
                findMany: {
                    args: Prisma.AuthenticationAuditEventFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>[];
                };
                create: {
                    args: Prisma.AuthenticationAuditEventCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>;
                };
                createMany: {
                    args: Prisma.AuthenticationAuditEventCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.AuthenticationAuditEventCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>[];
                };
                delete: {
                    args: Prisma.AuthenticationAuditEventDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>;
                };
                update: {
                    args: Prisma.AuthenticationAuditEventUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>;
                };
                deleteMany: {
                    args: Prisma.AuthenticationAuditEventDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.AuthenticationAuditEventUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.AuthenticationAuditEventUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>[];
                };
                upsert: {
                    args: Prisma.AuthenticationAuditEventUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$AuthenticationAuditEventPayload>;
                };
                aggregate: {
                    args: Prisma.AuthenticationAuditEventAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateAuthenticationAuditEvent>;
                };
                groupBy: {
                    args: Prisma.AuthenticationAuditEventGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuthenticationAuditEventGroupByOutputType>[];
                };
                count: {
                    args: Prisma.AuthenticationAuditEventCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AuthenticationAuditEventCountAggregateOutputType> | number;
                };
            };
        };
        BirthdaySettings: {
            payload: Prisma.$BirthdaySettingsPayload<ExtArgs>;
            fields: Prisma.BirthdaySettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BirthdaySettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BirthdaySettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>;
                };
                findFirst: {
                    args: Prisma.BirthdaySettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BirthdaySettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>;
                };
                findMany: {
                    args: Prisma.BirthdaySettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>[];
                };
                create: {
                    args: Prisma.BirthdaySettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>;
                };
                createMany: {
                    args: Prisma.BirthdaySettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BirthdaySettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>[];
                };
                delete: {
                    args: Prisma.BirthdaySettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>;
                };
                update: {
                    args: Prisma.BirthdaySettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.BirthdaySettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BirthdaySettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BirthdaySettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>[];
                };
                upsert: {
                    args: Prisma.BirthdaySettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdaySettingsPayload>;
                };
                aggregate: {
                    args: Prisma.BirthdaySettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBirthdaySettings>;
                };
                groupBy: {
                    args: Prisma.BirthdaySettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BirthdaySettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BirthdaySettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BirthdaySettingsCountAggregateOutputType> | number;
                };
            };
        };
        Birthday: {
            payload: Prisma.$BirthdayPayload<ExtArgs>;
            fields: Prisma.BirthdayFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BirthdayFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BirthdayFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>;
                };
                findFirst: {
                    args: Prisma.BirthdayFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BirthdayFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>;
                };
                findMany: {
                    args: Prisma.BirthdayFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>[];
                };
                create: {
                    args: Prisma.BirthdayCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>;
                };
                createMany: {
                    args: Prisma.BirthdayCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BirthdayCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>[];
                };
                delete: {
                    args: Prisma.BirthdayDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>;
                };
                update: {
                    args: Prisma.BirthdayUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>;
                };
                deleteMany: {
                    args: Prisma.BirthdayDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BirthdayUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BirthdayUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>[];
                };
                upsert: {
                    args: Prisma.BirthdayUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BirthdayPayload>;
                };
                aggregate: {
                    args: Prisma.BirthdayAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBirthday>;
                };
                groupBy: {
                    args: Prisma.BirthdayGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BirthdayGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BirthdayCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BirthdayCountAggregateOutputType> | number;
                };
            };
        };
        BuilderDraft: {
            payload: Prisma.$BuilderDraftPayload<ExtArgs>;
            fields: Prisma.BuilderDraftFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BuilderDraftFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BuilderDraftFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>;
                };
                findFirst: {
                    args: Prisma.BuilderDraftFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BuilderDraftFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>;
                };
                findMany: {
                    args: Prisma.BuilderDraftFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>[];
                };
                create: {
                    args: Prisma.BuilderDraftCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>;
                };
                createMany: {
                    args: Prisma.BuilderDraftCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BuilderDraftCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>[];
                };
                delete: {
                    args: Prisma.BuilderDraftDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>;
                };
                update: {
                    args: Prisma.BuilderDraftUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>;
                };
                deleteMany: {
                    args: Prisma.BuilderDraftDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BuilderDraftUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BuilderDraftUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>[];
                };
                upsert: {
                    args: Prisma.BuilderDraftUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderDraftPayload>;
                };
                aggregate: {
                    args: Prisma.BuilderDraftAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBuilderDraft>;
                };
                groupBy: {
                    args: Prisma.BuilderDraftGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BuilderDraftGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BuilderDraftCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BuilderDraftCountAggregateOutputType> | number;
                };
            };
        };
        BuilderRun: {
            payload: Prisma.$BuilderRunPayload<ExtArgs>;
            fields: Prisma.BuilderRunFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BuilderRunFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BuilderRunFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>;
                };
                findFirst: {
                    args: Prisma.BuilderRunFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BuilderRunFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>;
                };
                findMany: {
                    args: Prisma.BuilderRunFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>[];
                };
                create: {
                    args: Prisma.BuilderRunCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>;
                };
                createMany: {
                    args: Prisma.BuilderRunCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BuilderRunCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>[];
                };
                delete: {
                    args: Prisma.BuilderRunDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>;
                };
                update: {
                    args: Prisma.BuilderRunUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>;
                };
                deleteMany: {
                    args: Prisma.BuilderRunDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BuilderRunUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BuilderRunUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>[];
                };
                upsert: {
                    args: Prisma.BuilderRunUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunPayload>;
                };
                aggregate: {
                    args: Prisma.BuilderRunAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBuilderRun>;
                };
                groupBy: {
                    args: Prisma.BuilderRunGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BuilderRunGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BuilderRunCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BuilderRunCountAggregateOutputType> | number;
                };
            };
        };
        BuilderRunItem: {
            payload: Prisma.$BuilderRunItemPayload<ExtArgs>;
            fields: Prisma.BuilderRunItemFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.BuilderRunItemFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.BuilderRunItemFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>;
                };
                findFirst: {
                    args: Prisma.BuilderRunItemFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.BuilderRunItemFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>;
                };
                findMany: {
                    args: Prisma.BuilderRunItemFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>[];
                };
                create: {
                    args: Prisma.BuilderRunItemCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>;
                };
                createMany: {
                    args: Prisma.BuilderRunItemCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.BuilderRunItemCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>[];
                };
                delete: {
                    args: Prisma.BuilderRunItemDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>;
                };
                update: {
                    args: Prisma.BuilderRunItemUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>;
                };
                deleteMany: {
                    args: Prisma.BuilderRunItemDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.BuilderRunItemUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.BuilderRunItemUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>[];
                };
                upsert: {
                    args: Prisma.BuilderRunItemUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$BuilderRunItemPayload>;
                };
                aggregate: {
                    args: Prisma.BuilderRunItemAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateBuilderRunItem>;
                };
                groupBy: {
                    args: Prisma.BuilderRunItemGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BuilderRunItemGroupByOutputType>[];
                };
                count: {
                    args: Prisma.BuilderRunItemCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.BuilderRunItemCountAggregateOutputType> | number;
                };
            };
        };
        FivemSettings: {
            payload: Prisma.$FivemSettingsPayload<ExtArgs>;
            fields: Prisma.FivemSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.FivemSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.FivemSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.FivemSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.FivemSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>;
                };
                findMany: {
                    args: Prisma.FivemSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>[];
                };
                create: {
                    args: Prisma.FivemSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>;
                };
                createMany: {
                    args: Prisma.FivemSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.FivemSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>[];
                };
                delete: {
                    args: Prisma.FivemSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>;
                };
                update: {
                    args: Prisma.FivemSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.FivemSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.FivemSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.FivemSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.FivemSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.FivemSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateFivemSettings>;
                };
                groupBy: {
                    args: Prisma.FivemSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FivemSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.FivemSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FivemSettingsCountAggregateOutputType> | number;
                };
            };
        };
        FivemStatusSnapshot: {
            payload: Prisma.$FivemStatusSnapshotPayload<ExtArgs>;
            fields: Prisma.FivemStatusSnapshotFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.FivemStatusSnapshotFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.FivemStatusSnapshotFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>;
                };
                findFirst: {
                    args: Prisma.FivemStatusSnapshotFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.FivemStatusSnapshotFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>;
                };
                findMany: {
                    args: Prisma.FivemStatusSnapshotFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>[];
                };
                create: {
                    args: Prisma.FivemStatusSnapshotCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>;
                };
                createMany: {
                    args: Prisma.FivemStatusSnapshotCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.FivemStatusSnapshotCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>[];
                };
                delete: {
                    args: Prisma.FivemStatusSnapshotDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>;
                };
                update: {
                    args: Prisma.FivemStatusSnapshotUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>;
                };
                deleteMany: {
                    args: Prisma.FivemStatusSnapshotDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.FivemStatusSnapshotUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.FivemStatusSnapshotUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>[];
                };
                upsert: {
                    args: Prisma.FivemStatusSnapshotUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$FivemStatusSnapshotPayload>;
                };
                aggregate: {
                    args: Prisma.FivemStatusSnapshotAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateFivemStatusSnapshot>;
                };
                groupBy: {
                    args: Prisma.FivemStatusSnapshotGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FivemStatusSnapshotGroupByOutputType>[];
                };
                count: {
                    args: Prisma.FivemStatusSnapshotCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.FivemStatusSnapshotCountAggregateOutputType> | number;
                };
            };
        };
        GamesSettings: {
            payload: Prisma.$GamesSettingsPayload<ExtArgs>;
            fields: Prisma.GamesSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GamesSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GamesSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.GamesSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GamesSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>;
                };
                findMany: {
                    args: Prisma.GamesSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>[];
                };
                create: {
                    args: Prisma.GamesSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>;
                };
                createMany: {
                    args: Prisma.GamesSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GamesSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>[];
                };
                delete: {
                    args: Prisma.GamesSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>;
                };
                update: {
                    args: Prisma.GamesSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.GamesSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GamesSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GamesSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.GamesSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.GamesSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGamesSettings>;
                };
                groupBy: {
                    args: Prisma.GamesSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GamesSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GamesSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GamesSettingsCountAggregateOutputType> | number;
                };
            };
        };
        GamesServer: {
            payload: Prisma.$GamesServerPayload<ExtArgs>;
            fields: Prisma.GamesServerFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GamesServerFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GamesServerFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>;
                };
                findFirst: {
                    args: Prisma.GamesServerFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GamesServerFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>;
                };
                findMany: {
                    args: Prisma.GamesServerFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>[];
                };
                create: {
                    args: Prisma.GamesServerCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>;
                };
                createMany: {
                    args: Prisma.GamesServerCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GamesServerCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>[];
                };
                delete: {
                    args: Prisma.GamesServerDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>;
                };
                update: {
                    args: Prisma.GamesServerUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>;
                };
                deleteMany: {
                    args: Prisma.GamesServerDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GamesServerUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GamesServerUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>[];
                };
                upsert: {
                    args: Prisma.GamesServerUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesServerPayload>;
                };
                aggregate: {
                    args: Prisma.GamesServerAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGamesServer>;
                };
                groupBy: {
                    args: Prisma.GamesServerGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GamesServerGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GamesServerCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GamesServerCountAggregateOutputType> | number;
                };
            };
        };
        GamesStatusSnapshot: {
            payload: Prisma.$GamesStatusSnapshotPayload<ExtArgs>;
            fields: Prisma.GamesStatusSnapshotFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GamesStatusSnapshotFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GamesStatusSnapshotFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>;
                };
                findFirst: {
                    args: Prisma.GamesStatusSnapshotFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GamesStatusSnapshotFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>;
                };
                findMany: {
                    args: Prisma.GamesStatusSnapshotFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>[];
                };
                create: {
                    args: Prisma.GamesStatusSnapshotCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>;
                };
                createMany: {
                    args: Prisma.GamesStatusSnapshotCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GamesStatusSnapshotCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>[];
                };
                delete: {
                    args: Prisma.GamesStatusSnapshotDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>;
                };
                update: {
                    args: Prisma.GamesStatusSnapshotUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>;
                };
                deleteMany: {
                    args: Prisma.GamesStatusSnapshotDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GamesStatusSnapshotUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GamesStatusSnapshotUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>[];
                };
                upsert: {
                    args: Prisma.GamesStatusSnapshotUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GamesStatusSnapshotPayload>;
                };
                aggregate: {
                    args: Prisma.GamesStatusSnapshotAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGamesStatusSnapshot>;
                };
                groupBy: {
                    args: Prisma.GamesStatusSnapshotGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GamesStatusSnapshotGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GamesStatusSnapshotCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GamesStatusSnapshotCountAggregateOutputType> | number;
                };
            };
        };
        GiveawayCounter: {
            payload: Prisma.$GiveawayCounterPayload<ExtArgs>;
            fields: Prisma.GiveawayCounterFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GiveawayCounterFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GiveawayCounterFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>;
                };
                findFirst: {
                    args: Prisma.GiveawayCounterFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GiveawayCounterFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>;
                };
                findMany: {
                    args: Prisma.GiveawayCounterFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>[];
                };
                create: {
                    args: Prisma.GiveawayCounterCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>;
                };
                createMany: {
                    args: Prisma.GiveawayCounterCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GiveawayCounterCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>[];
                };
                delete: {
                    args: Prisma.GiveawayCounterDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>;
                };
                update: {
                    args: Prisma.GiveawayCounterUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>;
                };
                deleteMany: {
                    args: Prisma.GiveawayCounterDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GiveawayCounterUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GiveawayCounterUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>[];
                };
                upsert: {
                    args: Prisma.GiveawayCounterUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayCounterPayload>;
                };
                aggregate: {
                    args: Prisma.GiveawayCounterAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGiveawayCounter>;
                };
                groupBy: {
                    args: Prisma.GiveawayCounterGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GiveawayCounterGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GiveawayCounterCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GiveawayCounterCountAggregateOutputType> | number;
                };
            };
        };
        Giveaway: {
            payload: Prisma.$GiveawayPayload<ExtArgs>;
            fields: Prisma.GiveawayFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GiveawayFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GiveawayFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>;
                };
                findFirst: {
                    args: Prisma.GiveawayFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GiveawayFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>;
                };
                findMany: {
                    args: Prisma.GiveawayFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>[];
                };
                create: {
                    args: Prisma.GiveawayCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>;
                };
                createMany: {
                    args: Prisma.GiveawayCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GiveawayCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>[];
                };
                delete: {
                    args: Prisma.GiveawayDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>;
                };
                update: {
                    args: Prisma.GiveawayUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>;
                };
                deleteMany: {
                    args: Prisma.GiveawayDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GiveawayUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GiveawayUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>[];
                };
                upsert: {
                    args: Prisma.GiveawayUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayPayload>;
                };
                aggregate: {
                    args: Prisma.GiveawayAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGiveaway>;
                };
                groupBy: {
                    args: Prisma.GiveawayGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GiveawayGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GiveawayCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GiveawayCountAggregateOutputType> | number;
                };
            };
        };
        GiveawayEntry: {
            payload: Prisma.$GiveawayEntryPayload<ExtArgs>;
            fields: Prisma.GiveawayEntryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GiveawayEntryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GiveawayEntryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>;
                };
                findFirst: {
                    args: Prisma.GiveawayEntryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GiveawayEntryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>;
                };
                findMany: {
                    args: Prisma.GiveawayEntryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>[];
                };
                create: {
                    args: Prisma.GiveawayEntryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>;
                };
                createMany: {
                    args: Prisma.GiveawayEntryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GiveawayEntryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>[];
                };
                delete: {
                    args: Prisma.GiveawayEntryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>;
                };
                update: {
                    args: Prisma.GiveawayEntryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>;
                };
                deleteMany: {
                    args: Prisma.GiveawayEntryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GiveawayEntryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GiveawayEntryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>[];
                };
                upsert: {
                    args: Prisma.GiveawayEntryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GiveawayEntryPayload>;
                };
                aggregate: {
                    args: Prisma.GiveawayEntryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGiveawayEntry>;
                };
                groupBy: {
                    args: Prisma.GiveawayEntryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GiveawayEntryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GiveawayEntryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GiveawayEntryCountAggregateOutputType> | number;
                };
            };
        };
        KnowledgeSettings: {
            payload: Prisma.$KnowledgeSettingsPayload<ExtArgs>;
            fields: Prisma.KnowledgeSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.KnowledgeSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.KnowledgeSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.KnowledgeSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.KnowledgeSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>;
                };
                findMany: {
                    args: Prisma.KnowledgeSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>[];
                };
                create: {
                    args: Prisma.KnowledgeSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>;
                };
                createMany: {
                    args: Prisma.KnowledgeSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.KnowledgeSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>[];
                };
                delete: {
                    args: Prisma.KnowledgeSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>;
                };
                update: {
                    args: Prisma.KnowledgeSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.KnowledgeSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.KnowledgeSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.KnowledgeSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.KnowledgeSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.KnowledgeSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateKnowledgeSettings>;
                };
                groupBy: {
                    args: Prisma.KnowledgeSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.KnowledgeSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.KnowledgeSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.KnowledgeSettingsCountAggregateOutputType> | number;
                };
            };
        };
        KnowledgeCategory: {
            payload: Prisma.$KnowledgeCategoryPayload<ExtArgs>;
            fields: Prisma.KnowledgeCategoryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.KnowledgeCategoryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.KnowledgeCategoryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>;
                };
                findFirst: {
                    args: Prisma.KnowledgeCategoryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.KnowledgeCategoryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>;
                };
                findMany: {
                    args: Prisma.KnowledgeCategoryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>[];
                };
                create: {
                    args: Prisma.KnowledgeCategoryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>;
                };
                createMany: {
                    args: Prisma.KnowledgeCategoryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.KnowledgeCategoryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>[];
                };
                delete: {
                    args: Prisma.KnowledgeCategoryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>;
                };
                update: {
                    args: Prisma.KnowledgeCategoryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>;
                };
                deleteMany: {
                    args: Prisma.KnowledgeCategoryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.KnowledgeCategoryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.KnowledgeCategoryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>[];
                };
                upsert: {
                    args: Prisma.KnowledgeCategoryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeCategoryPayload>;
                };
                aggregate: {
                    args: Prisma.KnowledgeCategoryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateKnowledgeCategory>;
                };
                groupBy: {
                    args: Prisma.KnowledgeCategoryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.KnowledgeCategoryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.KnowledgeCategoryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.KnowledgeCategoryCountAggregateOutputType> | number;
                };
            };
        };
        KnowledgeArticle: {
            payload: Prisma.$KnowledgeArticlePayload<ExtArgs>;
            fields: Prisma.KnowledgeArticleFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.KnowledgeArticleFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.KnowledgeArticleFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>;
                };
                findFirst: {
                    args: Prisma.KnowledgeArticleFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.KnowledgeArticleFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>;
                };
                findMany: {
                    args: Prisma.KnowledgeArticleFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>[];
                };
                create: {
                    args: Prisma.KnowledgeArticleCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>;
                };
                createMany: {
                    args: Prisma.KnowledgeArticleCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.KnowledgeArticleCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>[];
                };
                delete: {
                    args: Prisma.KnowledgeArticleDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>;
                };
                update: {
                    args: Prisma.KnowledgeArticleUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>;
                };
                deleteMany: {
                    args: Prisma.KnowledgeArticleDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.KnowledgeArticleUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.KnowledgeArticleUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>[];
                };
                upsert: {
                    args: Prisma.KnowledgeArticleUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$KnowledgeArticlePayload>;
                };
                aggregate: {
                    args: Prisma.KnowledgeArticleAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateKnowledgeArticle>;
                };
                groupBy: {
                    args: Prisma.KnowledgeArticleGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.KnowledgeArticleGroupByOutputType>[];
                };
                count: {
                    args: Prisma.KnowledgeArticleCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.KnowledgeArticleCountAggregateOutputType> | number;
                };
            };
        };
        LevelSettings: {
            payload: Prisma.$LevelSettingsPayload<ExtArgs>;
            fields: Prisma.LevelSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.LevelSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.LevelSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.LevelSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.LevelSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>;
                };
                findMany: {
                    args: Prisma.LevelSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>[];
                };
                create: {
                    args: Prisma.LevelSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>;
                };
                createMany: {
                    args: Prisma.LevelSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.LevelSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>[];
                };
                delete: {
                    args: Prisma.LevelSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>;
                };
                update: {
                    args: Prisma.LevelSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.LevelSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.LevelSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.LevelSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.LevelSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.LevelSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateLevelSettings>;
                };
                groupBy: {
                    args: Prisma.LevelSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LevelSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.LevelSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LevelSettingsCountAggregateOutputType> | number;
                };
            };
        };
        LevelMember: {
            payload: Prisma.$LevelMemberPayload<ExtArgs>;
            fields: Prisma.LevelMemberFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.LevelMemberFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.LevelMemberFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>;
                };
                findFirst: {
                    args: Prisma.LevelMemberFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.LevelMemberFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>;
                };
                findMany: {
                    args: Prisma.LevelMemberFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>[];
                };
                create: {
                    args: Prisma.LevelMemberCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>;
                };
                createMany: {
                    args: Prisma.LevelMemberCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.LevelMemberCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>[];
                };
                delete: {
                    args: Prisma.LevelMemberDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>;
                };
                update: {
                    args: Prisma.LevelMemberUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>;
                };
                deleteMany: {
                    args: Prisma.LevelMemberDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.LevelMemberUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.LevelMemberUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>[];
                };
                upsert: {
                    args: Prisma.LevelMemberUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$LevelMemberPayload>;
                };
                aggregate: {
                    args: Prisma.LevelMemberAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateLevelMember>;
                };
                groupBy: {
                    args: Prisma.LevelMemberGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LevelMemberGroupByOutputType>[];
                };
                count: {
                    args: Prisma.LevelMemberCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.LevelMemberCountAggregateOutputType> | number;
                };
            };
        };
        MessagesLook: {
            payload: Prisma.$MessagesLookPayload<ExtArgs>;
            fields: Prisma.MessagesLookFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MessagesLookFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MessagesLookFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>;
                };
                findFirst: {
                    args: Prisma.MessagesLookFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MessagesLookFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>;
                };
                findMany: {
                    args: Prisma.MessagesLookFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>[];
                };
                create: {
                    args: Prisma.MessagesLookCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>;
                };
                createMany: {
                    args: Prisma.MessagesLookCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MessagesLookCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>[];
                };
                delete: {
                    args: Prisma.MessagesLookDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>;
                };
                update: {
                    args: Prisma.MessagesLookUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>;
                };
                deleteMany: {
                    args: Prisma.MessagesLookDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MessagesLookUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MessagesLookUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>[];
                };
                upsert: {
                    args: Prisma.MessagesLookUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesLookPayload>;
                };
                aggregate: {
                    args: Prisma.MessagesLookAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMessagesLook>;
                };
                groupBy: {
                    args: Prisma.MessagesLookGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MessagesLookGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MessagesLookCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MessagesLookCountAggregateOutputType> | number;
                };
            };
        };
        MessagesTemplate: {
            payload: Prisma.$MessagesTemplatePayload<ExtArgs>;
            fields: Prisma.MessagesTemplateFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MessagesTemplateFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MessagesTemplateFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>;
                };
                findFirst: {
                    args: Prisma.MessagesTemplateFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MessagesTemplateFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>;
                };
                findMany: {
                    args: Prisma.MessagesTemplateFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>[];
                };
                create: {
                    args: Prisma.MessagesTemplateCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>;
                };
                createMany: {
                    args: Prisma.MessagesTemplateCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MessagesTemplateCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>[];
                };
                delete: {
                    args: Prisma.MessagesTemplateDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>;
                };
                update: {
                    args: Prisma.MessagesTemplateUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>;
                };
                deleteMany: {
                    args: Prisma.MessagesTemplateDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MessagesTemplateUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MessagesTemplateUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>[];
                };
                upsert: {
                    args: Prisma.MessagesTemplateUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MessagesTemplatePayload>;
                };
                aggregate: {
                    args: Prisma.MessagesTemplateAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMessagesTemplate>;
                };
                groupBy: {
                    args: Prisma.MessagesTemplateGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MessagesTemplateGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MessagesTemplateCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MessagesTemplateCountAggregateOutputType> | number;
                };
            };
        };
        ModerationSettings: {
            payload: Prisma.$ModerationSettingsPayload<ExtArgs>;
            fields: Prisma.ModerationSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ModerationSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ModerationSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.ModerationSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ModerationSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>;
                };
                findMany: {
                    args: Prisma.ModerationSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>[];
                };
                create: {
                    args: Prisma.ModerationSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>;
                };
                createMany: {
                    args: Prisma.ModerationSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ModerationSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>[];
                };
                delete: {
                    args: Prisma.ModerationSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>;
                };
                update: {
                    args: Prisma.ModerationSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.ModerationSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ModerationSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ModerationSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.ModerationSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.ModerationSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateModerationSettings>;
                };
                groupBy: {
                    args: Prisma.ModerationSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ModerationSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ModerationSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ModerationSettingsCountAggregateOutputType> | number;
                };
            };
        };
        ModerationCase: {
            payload: Prisma.$ModerationCasePayload<ExtArgs>;
            fields: Prisma.ModerationCaseFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ModerationCaseFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ModerationCaseFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>;
                };
                findFirst: {
                    args: Prisma.ModerationCaseFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ModerationCaseFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>;
                };
                findMany: {
                    args: Prisma.ModerationCaseFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>[];
                };
                create: {
                    args: Prisma.ModerationCaseCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>;
                };
                createMany: {
                    args: Prisma.ModerationCaseCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ModerationCaseCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>[];
                };
                delete: {
                    args: Prisma.ModerationCaseDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>;
                };
                update: {
                    args: Prisma.ModerationCaseUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>;
                };
                deleteMany: {
                    args: Prisma.ModerationCaseDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ModerationCaseUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ModerationCaseUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>[];
                };
                upsert: {
                    args: Prisma.ModerationCaseUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ModerationCasePayload>;
                };
                aggregate: {
                    args: Prisma.ModerationCaseAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateModerationCase>;
                };
                groupBy: {
                    args: Prisma.ModerationCaseGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ModerationCaseGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ModerationCaseCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ModerationCaseCountAggregateOutputType> | number;
                };
            };
        };
        MusicSettings: {
            payload: Prisma.$MusicSettingsPayload<ExtArgs>;
            fields: Prisma.MusicSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MusicSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MusicSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.MusicSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MusicSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>;
                };
                findMany: {
                    args: Prisma.MusicSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>[];
                };
                create: {
                    args: Prisma.MusicSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>;
                };
                createMany: {
                    args: Prisma.MusicSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MusicSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>[];
                };
                delete: {
                    args: Prisma.MusicSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>;
                };
                update: {
                    args: Prisma.MusicSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.MusicSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MusicSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MusicSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.MusicSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.MusicSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMusicSettings>;
                };
                groupBy: {
                    args: Prisma.MusicSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MusicSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicSettingsCountAggregateOutputType> | number;
                };
            };
        };
        MusicTrack: {
            payload: Prisma.$MusicTrackPayload<ExtArgs>;
            fields: Prisma.MusicTrackFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MusicTrackFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MusicTrackFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>;
                };
                findFirst: {
                    args: Prisma.MusicTrackFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MusicTrackFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>;
                };
                findMany: {
                    args: Prisma.MusicTrackFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>[];
                };
                create: {
                    args: Prisma.MusicTrackCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>;
                };
                createMany: {
                    args: Prisma.MusicTrackCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MusicTrackCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>[];
                };
                delete: {
                    args: Prisma.MusicTrackDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>;
                };
                update: {
                    args: Prisma.MusicTrackUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>;
                };
                deleteMany: {
                    args: Prisma.MusicTrackDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MusicTrackUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MusicTrackUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>[];
                };
                upsert: {
                    args: Prisma.MusicTrackUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicTrackPayload>;
                };
                aggregate: {
                    args: Prisma.MusicTrackAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMusicTrack>;
                };
                groupBy: {
                    args: Prisma.MusicTrackGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicTrackGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MusicTrackCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicTrackCountAggregateOutputType> | number;
                };
            };
        };
        MusicPlaylist: {
            payload: Prisma.$MusicPlaylistPayload<ExtArgs>;
            fields: Prisma.MusicPlaylistFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MusicPlaylistFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MusicPlaylistFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>;
                };
                findFirst: {
                    args: Prisma.MusicPlaylistFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MusicPlaylistFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>;
                };
                findMany: {
                    args: Prisma.MusicPlaylistFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>[];
                };
                create: {
                    args: Prisma.MusicPlaylistCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>;
                };
                createMany: {
                    args: Prisma.MusicPlaylistCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MusicPlaylistCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>[];
                };
                delete: {
                    args: Prisma.MusicPlaylistDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>;
                };
                update: {
                    args: Prisma.MusicPlaylistUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>;
                };
                deleteMany: {
                    args: Prisma.MusicPlaylistDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MusicPlaylistUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MusicPlaylistUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>[];
                };
                upsert: {
                    args: Prisma.MusicPlaylistUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistPayload>;
                };
                aggregate: {
                    args: Prisma.MusicPlaylistAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMusicPlaylist>;
                };
                groupBy: {
                    args: Prisma.MusicPlaylistGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicPlaylistGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MusicPlaylistCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicPlaylistCountAggregateOutputType> | number;
                };
            };
        };
        MusicPlaylistTrack: {
            payload: Prisma.$MusicPlaylistTrackPayload<ExtArgs>;
            fields: Prisma.MusicPlaylistTrackFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MusicPlaylistTrackFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MusicPlaylistTrackFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>;
                };
                findFirst: {
                    args: Prisma.MusicPlaylistTrackFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MusicPlaylistTrackFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>;
                };
                findMany: {
                    args: Prisma.MusicPlaylistTrackFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>[];
                };
                create: {
                    args: Prisma.MusicPlaylistTrackCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>;
                };
                createMany: {
                    args: Prisma.MusicPlaylistTrackCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MusicPlaylistTrackCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>[];
                };
                delete: {
                    args: Prisma.MusicPlaylistTrackDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>;
                };
                update: {
                    args: Prisma.MusicPlaylistTrackUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>;
                };
                deleteMany: {
                    args: Prisma.MusicPlaylistTrackDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MusicPlaylistTrackUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MusicPlaylistTrackUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>[];
                };
                upsert: {
                    args: Prisma.MusicPlaylistTrackUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicPlaylistTrackPayload>;
                };
                aggregate: {
                    args: Prisma.MusicPlaylistTrackAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMusicPlaylistTrack>;
                };
                groupBy: {
                    args: Prisma.MusicPlaylistTrackGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicPlaylistTrackGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MusicPlaylistTrackCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicPlaylistTrackCountAggregateOutputType> | number;
                };
            };
        };
        MusicStation: {
            payload: Prisma.$MusicStationPayload<ExtArgs>;
            fields: Prisma.MusicStationFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MusicStationFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MusicStationFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>;
                };
                findFirst: {
                    args: Prisma.MusicStationFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MusicStationFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>;
                };
                findMany: {
                    args: Prisma.MusicStationFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>[];
                };
                create: {
                    args: Prisma.MusicStationCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>;
                };
                createMany: {
                    args: Prisma.MusicStationCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MusicStationCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>[];
                };
                delete: {
                    args: Prisma.MusicStationDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>;
                };
                update: {
                    args: Prisma.MusicStationUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>;
                };
                deleteMany: {
                    args: Prisma.MusicStationDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MusicStationUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MusicStationUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>[];
                };
                upsert: {
                    args: Prisma.MusicStationUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicStationPayload>;
                };
                aggregate: {
                    args: Prisma.MusicStationAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMusicStation>;
                };
                groupBy: {
                    args: Prisma.MusicStationGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicStationGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MusicStationCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicStationCountAggregateOutputType> | number;
                };
            };
        };
        MusicSession: {
            payload: Prisma.$MusicSessionPayload<ExtArgs>;
            fields: Prisma.MusicSessionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.MusicSessionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.MusicSessionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>;
                };
                findFirst: {
                    args: Prisma.MusicSessionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.MusicSessionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>;
                };
                findMany: {
                    args: Prisma.MusicSessionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>[];
                };
                create: {
                    args: Prisma.MusicSessionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>;
                };
                createMany: {
                    args: Prisma.MusicSessionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.MusicSessionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>[];
                };
                delete: {
                    args: Prisma.MusicSessionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>;
                };
                update: {
                    args: Prisma.MusicSessionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>;
                };
                deleteMany: {
                    args: Prisma.MusicSessionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.MusicSessionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.MusicSessionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>[];
                };
                upsert: {
                    args: Prisma.MusicSessionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$MusicSessionPayload>;
                };
                aggregate: {
                    args: Prisma.MusicSessionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateMusicSession>;
                };
                groupBy: {
                    args: Prisma.MusicSessionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicSessionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.MusicSessionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.MusicSessionCountAggregateOutputType> | number;
                };
            };
        };
        PollCounter: {
            payload: Prisma.$PollCounterPayload<ExtArgs>;
            fields: Prisma.PollCounterFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PollCounterFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PollCounterFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>;
                };
                findFirst: {
                    args: Prisma.PollCounterFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PollCounterFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>;
                };
                findMany: {
                    args: Prisma.PollCounterFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>[];
                };
                create: {
                    args: Prisma.PollCounterCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>;
                };
                createMany: {
                    args: Prisma.PollCounterCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PollCounterCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>[];
                };
                delete: {
                    args: Prisma.PollCounterDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>;
                };
                update: {
                    args: Prisma.PollCounterUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>;
                };
                deleteMany: {
                    args: Prisma.PollCounterDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PollCounterUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PollCounterUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>[];
                };
                upsert: {
                    args: Prisma.PollCounterUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollCounterPayload>;
                };
                aggregate: {
                    args: Prisma.PollCounterAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePollCounter>;
                };
                groupBy: {
                    args: Prisma.PollCounterGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PollCounterGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PollCounterCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PollCounterCountAggregateOutputType> | number;
                };
            };
        };
        Poll: {
            payload: Prisma.$PollPayload<ExtArgs>;
            fields: Prisma.PollFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PollFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PollFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>;
                };
                findFirst: {
                    args: Prisma.PollFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PollFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>;
                };
                findMany: {
                    args: Prisma.PollFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>[];
                };
                create: {
                    args: Prisma.PollCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>;
                };
                createMany: {
                    args: Prisma.PollCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PollCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>[];
                };
                delete: {
                    args: Prisma.PollDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>;
                };
                update: {
                    args: Prisma.PollUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>;
                };
                deleteMany: {
                    args: Prisma.PollDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PollUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PollUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>[];
                };
                upsert: {
                    args: Prisma.PollUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollPayload>;
                };
                aggregate: {
                    args: Prisma.PollAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePoll>;
                };
                groupBy: {
                    args: Prisma.PollGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PollGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PollCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PollCountAggregateOutputType> | number;
                };
            };
        };
        PollVote: {
            payload: Prisma.$PollVotePayload<ExtArgs>;
            fields: Prisma.PollVoteFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.PollVoteFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.PollVoteFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>;
                };
                findFirst: {
                    args: Prisma.PollVoteFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.PollVoteFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>;
                };
                findMany: {
                    args: Prisma.PollVoteFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>[];
                };
                create: {
                    args: Prisma.PollVoteCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>;
                };
                createMany: {
                    args: Prisma.PollVoteCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.PollVoteCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>[];
                };
                delete: {
                    args: Prisma.PollVoteDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>;
                };
                update: {
                    args: Prisma.PollVoteUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>;
                };
                deleteMany: {
                    args: Prisma.PollVoteDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.PollVoteUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.PollVoteUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>[];
                };
                upsert: {
                    args: Prisma.PollVoteUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$PollVotePayload>;
                };
                aggregate: {
                    args: Prisma.PollVoteAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregatePollVote>;
                };
                groupBy: {
                    args: Prisma.PollVoteGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PollVoteGroupByOutputType>[];
                };
                count: {
                    args: Prisma.PollVoteCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.PollVoteCountAggregateOutputType> | number;
                };
            };
        };
        ScheduledMessage: {
            payload: Prisma.$ScheduledMessagePayload<ExtArgs>;
            fields: Prisma.ScheduledMessageFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ScheduledMessageFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ScheduledMessageFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>;
                };
                findFirst: {
                    args: Prisma.ScheduledMessageFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ScheduledMessageFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>;
                };
                findMany: {
                    args: Prisma.ScheduledMessageFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>[];
                };
                create: {
                    args: Prisma.ScheduledMessageCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>;
                };
                createMany: {
                    args: Prisma.ScheduledMessageCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ScheduledMessageCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>[];
                };
                delete: {
                    args: Prisma.ScheduledMessageDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>;
                };
                update: {
                    args: Prisma.ScheduledMessageUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>;
                };
                deleteMany: {
                    args: Prisma.ScheduledMessageDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ScheduledMessageUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ScheduledMessageUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>[];
                };
                upsert: {
                    args: Prisma.ScheduledMessageUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessagePayload>;
                };
                aggregate: {
                    args: Prisma.ScheduledMessageAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateScheduledMessage>;
                };
                groupBy: {
                    args: Prisma.ScheduledMessageGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScheduledMessageGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ScheduledMessageCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScheduledMessageCountAggregateOutputType> | number;
                };
            };
        };
        ScheduledMessageRun: {
            payload: Prisma.$ScheduledMessageRunPayload<ExtArgs>;
            fields: Prisma.ScheduledMessageRunFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ScheduledMessageRunFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ScheduledMessageRunFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>;
                };
                findFirst: {
                    args: Prisma.ScheduledMessageRunFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ScheduledMessageRunFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>;
                };
                findMany: {
                    args: Prisma.ScheduledMessageRunFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>[];
                };
                create: {
                    args: Prisma.ScheduledMessageRunCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>;
                };
                createMany: {
                    args: Prisma.ScheduledMessageRunCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ScheduledMessageRunCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>[];
                };
                delete: {
                    args: Prisma.ScheduledMessageRunDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>;
                };
                update: {
                    args: Prisma.ScheduledMessageRunUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>;
                };
                deleteMany: {
                    args: Prisma.ScheduledMessageRunDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ScheduledMessageRunUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ScheduledMessageRunUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>[];
                };
                upsert: {
                    args: Prisma.ScheduledMessageRunUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ScheduledMessageRunPayload>;
                };
                aggregate: {
                    args: Prisma.ScheduledMessageRunAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateScheduledMessageRun>;
                };
                groupBy: {
                    args: Prisma.ScheduledMessageRunGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScheduledMessageRunGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ScheduledMessageRunCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ScheduledMessageRunCountAggregateOutputType> | number;
                };
            };
        };
        StaffSettings: {
            payload: Prisma.$StaffSettingsPayload<ExtArgs>;
            fields: Prisma.StaffSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StaffSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StaffSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.StaffSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StaffSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>;
                };
                findMany: {
                    args: Prisma.StaffSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>[];
                };
                create: {
                    args: Prisma.StaffSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>;
                };
                createMany: {
                    args: Prisma.StaffSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StaffSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>[];
                };
                delete: {
                    args: Prisma.StaffSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>;
                };
                update: {
                    args: Prisma.StaffSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.StaffSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StaffSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StaffSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.StaffSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.StaffSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStaffSettings>;
                };
                groupBy: {
                    args: Prisma.StaffSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StaffSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffSettingsCountAggregateOutputType> | number;
                };
            };
        };
        StaffRank: {
            payload: Prisma.$StaffRankPayload<ExtArgs>;
            fields: Prisma.StaffRankFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StaffRankFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StaffRankFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>;
                };
                findFirst: {
                    args: Prisma.StaffRankFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StaffRankFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>;
                };
                findMany: {
                    args: Prisma.StaffRankFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>[];
                };
                create: {
                    args: Prisma.StaffRankCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>;
                };
                createMany: {
                    args: Prisma.StaffRankCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StaffRankCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>[];
                };
                delete: {
                    args: Prisma.StaffRankDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>;
                };
                update: {
                    args: Prisma.StaffRankUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>;
                };
                deleteMany: {
                    args: Prisma.StaffRankDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StaffRankUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StaffRankUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>[];
                };
                upsert: {
                    args: Prisma.StaffRankUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRankPayload>;
                };
                aggregate: {
                    args: Prisma.StaffRankAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStaffRank>;
                };
                groupBy: {
                    args: Prisma.StaffRankGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffRankGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StaffRankCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffRankCountAggregateOutputType> | number;
                };
            };
        };
        StaffMember: {
            payload: Prisma.$StaffMemberPayload<ExtArgs>;
            fields: Prisma.StaffMemberFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StaffMemberFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StaffMemberFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>;
                };
                findFirst: {
                    args: Prisma.StaffMemberFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StaffMemberFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>;
                };
                findMany: {
                    args: Prisma.StaffMemberFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>[];
                };
                create: {
                    args: Prisma.StaffMemberCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>;
                };
                createMany: {
                    args: Prisma.StaffMemberCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StaffMemberCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>[];
                };
                delete: {
                    args: Prisma.StaffMemberDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>;
                };
                update: {
                    args: Prisma.StaffMemberUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>;
                };
                deleteMany: {
                    args: Prisma.StaffMemberDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StaffMemberUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StaffMemberUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>[];
                };
                upsert: {
                    args: Prisma.StaffMemberUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffMemberPayload>;
                };
                aggregate: {
                    args: Prisma.StaffMemberAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStaffMember>;
                };
                groupBy: {
                    args: Prisma.StaffMemberGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffMemberGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StaffMemberCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffMemberCountAggregateOutputType> | number;
                };
            };
        };
        StaffRecord: {
            payload: Prisma.$StaffRecordPayload<ExtArgs>;
            fields: Prisma.StaffRecordFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StaffRecordFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StaffRecordFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>;
                };
                findFirst: {
                    args: Prisma.StaffRecordFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StaffRecordFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>;
                };
                findMany: {
                    args: Prisma.StaffRecordFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>[];
                };
                create: {
                    args: Prisma.StaffRecordCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>;
                };
                createMany: {
                    args: Prisma.StaffRecordCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StaffRecordCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>[];
                };
                delete: {
                    args: Prisma.StaffRecordDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>;
                };
                update: {
                    args: Prisma.StaffRecordUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>;
                };
                deleteMany: {
                    args: Prisma.StaffRecordDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StaffRecordUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StaffRecordUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>[];
                };
                upsert: {
                    args: Prisma.StaffRecordUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffRecordPayload>;
                };
                aggregate: {
                    args: Prisma.StaffRecordAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStaffRecord>;
                };
                groupBy: {
                    args: Prisma.StaffRecordGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffRecordGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StaffRecordCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffRecordCountAggregateOutputType> | number;
                };
            };
        };
        StaffStrike: {
            payload: Prisma.$StaffStrikePayload<ExtArgs>;
            fields: Prisma.StaffStrikeFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StaffStrikeFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StaffStrikeFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>;
                };
                findFirst: {
                    args: Prisma.StaffStrikeFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StaffStrikeFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>;
                };
                findMany: {
                    args: Prisma.StaffStrikeFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>[];
                };
                create: {
                    args: Prisma.StaffStrikeCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>;
                };
                createMany: {
                    args: Prisma.StaffStrikeCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StaffStrikeCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>[];
                };
                delete: {
                    args: Prisma.StaffStrikeDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>;
                };
                update: {
                    args: Prisma.StaffStrikeUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>;
                };
                deleteMany: {
                    args: Prisma.StaffStrikeDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StaffStrikeUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StaffStrikeUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>[];
                };
                upsert: {
                    args: Prisma.StaffStrikeUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffStrikePayload>;
                };
                aggregate: {
                    args: Prisma.StaffStrikeAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStaffStrike>;
                };
                groupBy: {
                    args: Prisma.StaffStrikeGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffStrikeGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StaffStrikeCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffStrikeCountAggregateOutputType> | number;
                };
            };
        };
        StaffLeave: {
            payload: Prisma.$StaffLeavePayload<ExtArgs>;
            fields: Prisma.StaffLeaveFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StaffLeaveFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StaffLeaveFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>;
                };
                findFirst: {
                    args: Prisma.StaffLeaveFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StaffLeaveFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>;
                };
                findMany: {
                    args: Prisma.StaffLeaveFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>[];
                };
                create: {
                    args: Prisma.StaffLeaveCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>;
                };
                createMany: {
                    args: Prisma.StaffLeaveCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StaffLeaveCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>[];
                };
                delete: {
                    args: Prisma.StaffLeaveDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>;
                };
                update: {
                    args: Prisma.StaffLeaveUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>;
                };
                deleteMany: {
                    args: Prisma.StaffLeaveDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StaffLeaveUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StaffLeaveUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>[];
                };
                upsert: {
                    args: Prisma.StaffLeaveUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffLeavePayload>;
                };
                aggregate: {
                    args: Prisma.StaffLeaveAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStaffLeave>;
                };
                groupBy: {
                    args: Prisma.StaffLeaveGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffLeaveGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StaffLeaveCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffLeaveCountAggregateOutputType> | number;
                };
            };
        };
        StaffShift: {
            payload: Prisma.$StaffShiftPayload<ExtArgs>;
            fields: Prisma.StaffShiftFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StaffShiftFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StaffShiftFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>;
                };
                findFirst: {
                    args: Prisma.StaffShiftFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StaffShiftFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>;
                };
                findMany: {
                    args: Prisma.StaffShiftFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>[];
                };
                create: {
                    args: Prisma.StaffShiftCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>;
                };
                createMany: {
                    args: Prisma.StaffShiftCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StaffShiftCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>[];
                };
                delete: {
                    args: Prisma.StaffShiftDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>;
                };
                update: {
                    args: Prisma.StaffShiftUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>;
                };
                deleteMany: {
                    args: Prisma.StaffShiftDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StaffShiftUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StaffShiftUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>[];
                };
                upsert: {
                    args: Prisma.StaffShiftUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StaffShiftPayload>;
                };
                aggregate: {
                    args: Prisma.StaffShiftAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStaffShift>;
                };
                groupBy: {
                    args: Prisma.StaffShiftGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffShiftGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StaffShiftCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StaffShiftCountAggregateOutputType> | number;
                };
            };
        };
        StreamsSettings: {
            payload: Prisma.$StreamsSettingsPayload<ExtArgs>;
            fields: Prisma.StreamsSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StreamsSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StreamsSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.StreamsSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StreamsSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>;
                };
                findMany: {
                    args: Prisma.StreamsSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>[];
                };
                create: {
                    args: Prisma.StreamsSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>;
                };
                createMany: {
                    args: Prisma.StreamsSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StreamsSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>[];
                };
                delete: {
                    args: Prisma.StreamsSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>;
                };
                update: {
                    args: Prisma.StreamsSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.StreamsSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StreamsSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StreamsSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.StreamsSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.StreamsSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStreamsSettings>;
                };
                groupBy: {
                    args: Prisma.StreamsSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StreamsSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StreamsSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StreamsSettingsCountAggregateOutputType> | number;
                };
            };
        };
        StreamsSubscription: {
            payload: Prisma.$StreamsSubscriptionPayload<ExtArgs>;
            fields: Prisma.StreamsSubscriptionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.StreamsSubscriptionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.StreamsSubscriptionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>;
                };
                findFirst: {
                    args: Prisma.StreamsSubscriptionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.StreamsSubscriptionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>;
                };
                findMany: {
                    args: Prisma.StreamsSubscriptionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>[];
                };
                create: {
                    args: Prisma.StreamsSubscriptionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>;
                };
                createMany: {
                    args: Prisma.StreamsSubscriptionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.StreamsSubscriptionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>[];
                };
                delete: {
                    args: Prisma.StreamsSubscriptionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>;
                };
                update: {
                    args: Prisma.StreamsSubscriptionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>;
                };
                deleteMany: {
                    args: Prisma.StreamsSubscriptionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.StreamsSubscriptionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.StreamsSubscriptionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>[];
                };
                upsert: {
                    args: Prisma.StreamsSubscriptionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$StreamsSubscriptionPayload>;
                };
                aggregate: {
                    args: Prisma.StreamsSubscriptionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateStreamsSubscription>;
                };
                groupBy: {
                    args: Prisma.StreamsSubscriptionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StreamsSubscriptionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.StreamsSubscriptionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.StreamsSubscriptionCountAggregateOutputType> | number;
                };
            };
        };
        TicketSettings: {
            payload: Prisma.$TicketSettingsPayload<ExtArgs>;
            fields: Prisma.TicketSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TicketSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TicketSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.TicketSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TicketSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>;
                };
                findMany: {
                    args: Prisma.TicketSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>[];
                };
                create: {
                    args: Prisma.TicketSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>;
                };
                createMany: {
                    args: Prisma.TicketSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TicketSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>[];
                };
                delete: {
                    args: Prisma.TicketSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>;
                };
                update: {
                    args: Prisma.TicketSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.TicketSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TicketSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TicketSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.TicketSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.TicketSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTicketSettings>;
                };
                groupBy: {
                    args: Prisma.TicketSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TicketSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketSettingsCountAggregateOutputType> | number;
                };
            };
        };
        TicketCategory: {
            payload: Prisma.$TicketCategoryPayload<ExtArgs>;
            fields: Prisma.TicketCategoryFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TicketCategoryFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TicketCategoryFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>;
                };
                findFirst: {
                    args: Prisma.TicketCategoryFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TicketCategoryFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>;
                };
                findMany: {
                    args: Prisma.TicketCategoryFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>[];
                };
                create: {
                    args: Prisma.TicketCategoryCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>;
                };
                createMany: {
                    args: Prisma.TicketCategoryCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TicketCategoryCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>[];
                };
                delete: {
                    args: Prisma.TicketCategoryDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>;
                };
                update: {
                    args: Prisma.TicketCategoryUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>;
                };
                deleteMany: {
                    args: Prisma.TicketCategoryDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TicketCategoryUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TicketCategoryUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>[];
                };
                upsert: {
                    args: Prisma.TicketCategoryUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketCategoryPayload>;
                };
                aggregate: {
                    args: Prisma.TicketCategoryAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTicketCategory>;
                };
                groupBy: {
                    args: Prisma.TicketCategoryGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketCategoryGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TicketCategoryCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketCategoryCountAggregateOutputType> | number;
                };
            };
        };
        TicketPanel: {
            payload: Prisma.$TicketPanelPayload<ExtArgs>;
            fields: Prisma.TicketPanelFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TicketPanelFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TicketPanelFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>;
                };
                findFirst: {
                    args: Prisma.TicketPanelFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TicketPanelFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>;
                };
                findMany: {
                    args: Prisma.TicketPanelFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>[];
                };
                create: {
                    args: Prisma.TicketPanelCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>;
                };
                createMany: {
                    args: Prisma.TicketPanelCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TicketPanelCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>[];
                };
                delete: {
                    args: Prisma.TicketPanelDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>;
                };
                update: {
                    args: Prisma.TicketPanelUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>;
                };
                deleteMany: {
                    args: Prisma.TicketPanelDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TicketPanelUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TicketPanelUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>[];
                };
                upsert: {
                    args: Prisma.TicketPanelUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPanelPayload>;
                };
                aggregate: {
                    args: Prisma.TicketPanelAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTicketPanel>;
                };
                groupBy: {
                    args: Prisma.TicketPanelGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketPanelGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TicketPanelCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketPanelCountAggregateOutputType> | number;
                };
            };
        };
        Ticket: {
            payload: Prisma.$TicketPayload<ExtArgs>;
            fields: Prisma.TicketFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TicketFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TicketFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>;
                };
                findFirst: {
                    args: Prisma.TicketFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TicketFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>;
                };
                findMany: {
                    args: Prisma.TicketFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>[];
                };
                create: {
                    args: Prisma.TicketCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>;
                };
                createMany: {
                    args: Prisma.TicketCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TicketCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>[];
                };
                delete: {
                    args: Prisma.TicketDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>;
                };
                update: {
                    args: Prisma.TicketUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>;
                };
                deleteMany: {
                    args: Prisma.TicketDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TicketUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TicketUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>[];
                };
                upsert: {
                    args: Prisma.TicketUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketPayload>;
                };
                aggregate: {
                    args: Prisma.TicketAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTicket>;
                };
                groupBy: {
                    args: Prisma.TicketGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TicketCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketCountAggregateOutputType> | number;
                };
            };
        };
        TicketMessage: {
            payload: Prisma.$TicketMessagePayload<ExtArgs>;
            fields: Prisma.TicketMessageFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TicketMessageFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TicketMessageFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>;
                };
                findFirst: {
                    args: Prisma.TicketMessageFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TicketMessageFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>;
                };
                findMany: {
                    args: Prisma.TicketMessageFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>[];
                };
                create: {
                    args: Prisma.TicketMessageCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>;
                };
                createMany: {
                    args: Prisma.TicketMessageCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TicketMessageCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>[];
                };
                delete: {
                    args: Prisma.TicketMessageDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>;
                };
                update: {
                    args: Prisma.TicketMessageUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>;
                };
                deleteMany: {
                    args: Prisma.TicketMessageDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TicketMessageUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TicketMessageUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>[];
                };
                upsert: {
                    args: Prisma.TicketMessageUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketMessagePayload>;
                };
                aggregate: {
                    args: Prisma.TicketMessageAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTicketMessage>;
                };
                groupBy: {
                    args: Prisma.TicketMessageGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketMessageGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TicketMessageCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketMessageCountAggregateOutputType> | number;
                };
            };
        };
        TicketEvent: {
            payload: Prisma.$TicketEventPayload<ExtArgs>;
            fields: Prisma.TicketEventFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TicketEventFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TicketEventFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>;
                };
                findFirst: {
                    args: Prisma.TicketEventFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TicketEventFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>;
                };
                findMany: {
                    args: Prisma.TicketEventFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>[];
                };
                create: {
                    args: Prisma.TicketEventCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>;
                };
                createMany: {
                    args: Prisma.TicketEventCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TicketEventCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>[];
                };
                delete: {
                    args: Prisma.TicketEventDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>;
                };
                update: {
                    args: Prisma.TicketEventUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>;
                };
                deleteMany: {
                    args: Prisma.TicketEventDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TicketEventUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TicketEventUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>[];
                };
                upsert: {
                    args: Prisma.TicketEventUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TicketEventPayload>;
                };
                aggregate: {
                    args: Prisma.TicketEventAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTicketEvent>;
                };
                groupBy: {
                    args: Prisma.TicketEventGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketEventGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TicketEventCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TicketEventCountAggregateOutputType> | number;
                };
            };
        };
        VerificationSettings: {
            payload: Prisma.$VerificationSettingsPayload<ExtArgs>;
            fields: Prisma.VerificationSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.VerificationSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.VerificationSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.VerificationSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.VerificationSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>;
                };
                findMany: {
                    args: Prisma.VerificationSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>[];
                };
                create: {
                    args: Prisma.VerificationSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>;
                };
                createMany: {
                    args: Prisma.VerificationSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.VerificationSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>[];
                };
                delete: {
                    args: Prisma.VerificationSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>;
                };
                update: {
                    args: Prisma.VerificationSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.VerificationSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.VerificationSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.VerificationSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.VerificationSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.VerificationSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateVerificationSettings>;
                };
                groupBy: {
                    args: Prisma.VerificationSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VerificationSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.VerificationSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VerificationSettingsCountAggregateOutputType> | number;
                };
            };
        };
        VerificationAttempt: {
            payload: Prisma.$VerificationAttemptPayload<ExtArgs>;
            fields: Prisma.VerificationAttemptFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.VerificationAttemptFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.VerificationAttemptFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>;
                };
                findFirst: {
                    args: Prisma.VerificationAttemptFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.VerificationAttemptFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>;
                };
                findMany: {
                    args: Prisma.VerificationAttemptFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>[];
                };
                create: {
                    args: Prisma.VerificationAttemptCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>;
                };
                createMany: {
                    args: Prisma.VerificationAttemptCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.VerificationAttemptCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>[];
                };
                delete: {
                    args: Prisma.VerificationAttemptDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>;
                };
                update: {
                    args: Prisma.VerificationAttemptUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>;
                };
                deleteMany: {
                    args: Prisma.VerificationAttemptDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.VerificationAttemptUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.VerificationAttemptUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>[];
                };
                upsert: {
                    args: Prisma.VerificationAttemptUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationAttemptPayload>;
                };
                aggregate: {
                    args: Prisma.VerificationAttemptAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateVerificationAttempt>;
                };
                groupBy: {
                    args: Prisma.VerificationAttemptGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VerificationAttemptGroupByOutputType>[];
                };
                count: {
                    args: Prisma.VerificationAttemptCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VerificationAttemptCountAggregateOutputType> | number;
                };
            };
        };
        VerificationPendingMember: {
            payload: Prisma.$VerificationPendingMemberPayload<ExtArgs>;
            fields: Prisma.VerificationPendingMemberFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.VerificationPendingMemberFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.VerificationPendingMemberFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>;
                };
                findFirst: {
                    args: Prisma.VerificationPendingMemberFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.VerificationPendingMemberFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>;
                };
                findMany: {
                    args: Prisma.VerificationPendingMemberFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>[];
                };
                create: {
                    args: Prisma.VerificationPendingMemberCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>;
                };
                createMany: {
                    args: Prisma.VerificationPendingMemberCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.VerificationPendingMemberCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>[];
                };
                delete: {
                    args: Prisma.VerificationPendingMemberDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>;
                };
                update: {
                    args: Prisma.VerificationPendingMemberUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>;
                };
                deleteMany: {
                    args: Prisma.VerificationPendingMemberDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.VerificationPendingMemberUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.VerificationPendingMemberUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>[];
                };
                upsert: {
                    args: Prisma.VerificationPendingMemberUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VerificationPendingMemberPayload>;
                };
                aggregate: {
                    args: Prisma.VerificationPendingMemberAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateVerificationPendingMember>;
                };
                groupBy: {
                    args: Prisma.VerificationPendingMemberGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VerificationPendingMemberGroupByOutputType>[];
                };
                count: {
                    args: Prisma.VerificationPendingMemberCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VerificationPendingMemberCountAggregateOutputType> | number;
                };
            };
        };
        VoiceSettings: {
            payload: Prisma.$VoiceSettingsPayload<ExtArgs>;
            fields: Prisma.VoiceSettingsFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.VoiceSettingsFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.VoiceSettingsFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>;
                };
                findFirst: {
                    args: Prisma.VoiceSettingsFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.VoiceSettingsFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>;
                };
                findMany: {
                    args: Prisma.VoiceSettingsFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>[];
                };
                create: {
                    args: Prisma.VoiceSettingsCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>;
                };
                createMany: {
                    args: Prisma.VoiceSettingsCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.VoiceSettingsCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>[];
                };
                delete: {
                    args: Prisma.VoiceSettingsDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>;
                };
                update: {
                    args: Prisma.VoiceSettingsUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>;
                };
                deleteMany: {
                    args: Prisma.VoiceSettingsDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.VoiceSettingsUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.VoiceSettingsUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>[];
                };
                upsert: {
                    args: Prisma.VoiceSettingsUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceSettingsPayload>;
                };
                aggregate: {
                    args: Prisma.VoiceSettingsAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateVoiceSettings>;
                };
                groupBy: {
                    args: Prisma.VoiceSettingsGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VoiceSettingsGroupByOutputType>[];
                };
                count: {
                    args: Prisma.VoiceSettingsCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VoiceSettingsCountAggregateOutputType> | number;
                };
            };
        };
        VoiceHub: {
            payload: Prisma.$VoiceHubPayload<ExtArgs>;
            fields: Prisma.VoiceHubFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.VoiceHubFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.VoiceHubFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>;
                };
                findFirst: {
                    args: Prisma.VoiceHubFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.VoiceHubFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>;
                };
                findMany: {
                    args: Prisma.VoiceHubFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>[];
                };
                create: {
                    args: Prisma.VoiceHubCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>;
                };
                createMany: {
                    args: Prisma.VoiceHubCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.VoiceHubCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>[];
                };
                delete: {
                    args: Prisma.VoiceHubDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>;
                };
                update: {
                    args: Prisma.VoiceHubUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>;
                };
                deleteMany: {
                    args: Prisma.VoiceHubDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.VoiceHubUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.VoiceHubUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>[];
                };
                upsert: {
                    args: Prisma.VoiceHubUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceHubPayload>;
                };
                aggregate: {
                    args: Prisma.VoiceHubAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateVoiceHub>;
                };
                groupBy: {
                    args: Prisma.VoiceHubGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VoiceHubGroupByOutputType>[];
                };
                count: {
                    args: Prisma.VoiceHubCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VoiceHubCountAggregateOutputType> | number;
                };
            };
        };
        VoiceRoom: {
            payload: Prisma.$VoiceRoomPayload<ExtArgs>;
            fields: Prisma.VoiceRoomFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.VoiceRoomFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.VoiceRoomFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>;
                };
                findFirst: {
                    args: Prisma.VoiceRoomFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.VoiceRoomFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>;
                };
                findMany: {
                    args: Prisma.VoiceRoomFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>[];
                };
                create: {
                    args: Prisma.VoiceRoomCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>;
                };
                createMany: {
                    args: Prisma.VoiceRoomCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.VoiceRoomCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>[];
                };
                delete: {
                    args: Prisma.VoiceRoomDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>;
                };
                update: {
                    args: Prisma.VoiceRoomUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>;
                };
                deleteMany: {
                    args: Prisma.VoiceRoomDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.VoiceRoomUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.VoiceRoomUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>[];
                };
                upsert: {
                    args: Prisma.VoiceRoomUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$VoiceRoomPayload>;
                };
                aggregate: {
                    args: Prisma.VoiceRoomAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateVoiceRoom>;
                };
                groupBy: {
                    args: Prisma.VoiceRoomGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VoiceRoomGroupByOutputType>[];
                };
                count: {
                    args: Prisma.VoiceRoomCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.VoiceRoomCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
/**
 * Enums
 */
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const ApplicationCounterScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly nextNumber: "nextNumber";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ApplicationCounterScalarFieldEnum = (typeof ApplicationCounterScalarFieldEnum)[keyof typeof ApplicationCounterScalarFieldEnum];
export declare const ApplicationFormScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly description: "description";
    readonly enabled: "enabled";
    readonly questions: "questions";
    readonly cooldownDays: "cooldownDays";
    readonly onePending: "onePending";
    readonly requiredRoleIds: "requiredRoleIds";
    readonly blockedRoleIds: "blockedRoleIds";
    readonly minAccountAgeDays: "minAccountAgeDays";
    readonly reviewChannelId: "reviewChannelId";
    readonly reviewerRoleIds: "reviewerRoleIds";
    readonly pingMemberIds: "pingMemberIds";
    readonly acceptRoleIds: "acceptRoleIds";
    readonly removeRoleIds: "removeRoleIds";
    readonly acceptMessage: "acceptMessage";
    readonly denyMessage: "denyMessage";
    readonly discussionChannelId: "discussionChannelId";
    readonly buttonLabel: "buttonLabel";
    readonly buttonEmoji: "buttonEmoji";
    readonly buttonStyle: "buttonStyle";
    readonly position: "position";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ApplicationFormScalarFieldEnum = (typeof ApplicationFormScalarFieldEnum)[keyof typeof ApplicationFormScalarFieldEnum];
export declare const ApplicationPanelScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly channelId: "channelId";
    readonly messageId: "messageId";
    readonly title: "title";
    readonly description: "description";
    readonly color: "color";
    readonly formIds: "formIds";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ApplicationPanelScalarFieldEnum = (typeof ApplicationPanelScalarFieldEnum)[keyof typeof ApplicationPanelScalarFieldEnum];
export declare const ApplicationScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly number: "number";
    readonly formId: "formId";
    readonly formName: "formName";
    readonly applicantId: "applicantId";
    readonly applicantName: "applicantName";
    readonly status: "status";
    readonly source: "source";
    readonly answers: "answers";
    readonly reviewChannelId: "reviewChannelId";
    readonly reviewMessageId: "reviewMessageId";
    readonly threadId: "threadId";
    readonly decidedById: "decidedById";
    readonly decidedByName: "decidedByName";
    readonly decisionReason: "decisionReason";
    readonly decidedAt: "decidedAt";
    readonly dmDelivered: "dmDelivered";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ApplicationScalarFieldEnum = (typeof ApplicationScalarFieldEnum)[keyof typeof ApplicationScalarFieldEnum];
export declare const ApplicationVoteScalarFieldEnum: {
    readonly applicationId: "applicationId";
    readonly userId: "userId";
    readonly vote: "vote";
    readonly createdAt: "createdAt";
};
export type ApplicationVoteScalarFieldEnum = (typeof ApplicationVoteScalarFieldEnum)[keyof typeof ApplicationVoteScalarFieldEnum];
export declare const ApplicationNoteScalarFieldEnum: {
    readonly id: "id";
    readonly applicationId: "applicationId";
    readonly authorId: "authorId";
    readonly authorName: "authorName";
    readonly body: "body";
    readonly createdAt: "createdAt";
};
export type ApplicationNoteScalarFieldEnum = (typeof ApplicationNoteScalarFieldEnum)[keyof typeof ApplicationNoteScalarFieldEnum];
export declare const GuildScalarFieldEnum: {
    readonly id: "id";
    readonly discordGuildId: "discordGuildId";
    readonly metadata: "metadata";
    readonly enabled: "enabled";
    readonly disabledAt: "disabledAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GuildScalarFieldEnum = (typeof GuildScalarFieldEnum)[keyof typeof GuildScalarFieldEnum];
export declare const RoleMenuScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly channelId: "channelId";
    readonly messageId: "messageId";
    readonly title: "title";
    readonly description: "description";
    readonly presentationType: "presentationType";
    readonly assignmentMode: "assignmentMode";
    readonly status: "status";
    readonly revision: "revision";
    readonly lastOperationSource: "lastOperationSource";
    readonly createdByDiscordUserId: "createdByDiscordUserId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type RoleMenuScalarFieldEnum = (typeof RoleMenuScalarFieldEnum)[keyof typeof RoleMenuScalarFieldEnum];
export declare const RoleMenuOptionScalarFieldEnum: {
    readonly id: "id";
    readonly roleMenuId: "roleMenuId";
    readonly roleId: "roleId";
    readonly label: "label";
    readonly description: "description";
    readonly emoji: "emoji";
    readonly position: "position";
    readonly revision: "revision";
    readonly lastOperationSource: "lastOperationSource";
    readonly createdAt: "createdAt";
};
export type RoleMenuOptionScalarFieldEnum = (typeof RoleMenuOptionScalarFieldEnum)[keyof typeof RoleMenuOptionScalarFieldEnum];
export declare const WelcomeGoodbyeConfigScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly kind: "kind";
    readonly enabled: "enabled";
    readonly channelId: "channelId";
    readonly messageText: "messageText";
    readonly embedEnabled: "embedEnabled";
    readonly embedTitle: "embedTitle";
    readonly embedDescription: "embedDescription";
    readonly embedColor: "embedColor";
    readonly thumbnailAvatar: "thumbnailAvatar";
    readonly footer: "footer";
    readonly directMessageEnabled: "directMessageEnabled";
    readonly imageUrl: "imageUrl";
    readonly roleMentionId: "roleMentionId";
    readonly deleteAfterSeconds: "deleteAfterSeconds";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WelcomeGoodbyeConfigScalarFieldEnum = (typeof WelcomeGoodbyeConfigScalarFieldEnum)[keyof typeof WelcomeGoodbyeConfigScalarFieldEnum];
export declare const AutoroleConfigScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly delaySeconds: "delaySeconds";
    readonly includeBots: "includeBots";
    readonly revision: "revision";
    readonly lastOperationSource: "lastOperationSource";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type AutoroleConfigScalarFieldEnum = (typeof AutoroleConfigScalarFieldEnum)[keyof typeof AutoroleConfigScalarFieldEnum];
export declare const AutoroleRuleScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly roleId: "roleId";
    readonly position: "position";
    readonly createdAt: "createdAt";
};
export type AutoroleRuleScalarFieldEnum = (typeof AutoroleRuleScalarFieldEnum)[keyof typeof AutoroleRuleScalarFieldEnum];
export declare const RulesConfigScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly channelId: "channelId";
    readonly messageText: "messageText";
    readonly buttonLabel: "buttonLabel";
    readonly acceptedRoleId: "acceptedRoleId";
    readonly pendingRoleId: "pendingRoleId";
    readonly messageId: "messageId";
    readonly revision: "revision";
    readonly lastOperationSource: "lastOperationSource";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type RulesConfigScalarFieldEnum = (typeof RulesConfigScalarFieldEnum)[keyof typeof RulesConfigScalarFieldEnum];
export declare const DiscordRoleAuditEventScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly roleId: "roleId";
    readonly feature: "feature";
    readonly operation: "operation";
    readonly source: "source";
    readonly actorType: "actorType";
    readonly actorId: "actorId";
    readonly summary: "summary";
    readonly result: "result";
    readonly metadata: "metadata";
    readonly createdAt: "createdAt";
};
export type DiscordRoleAuditEventScalarFieldEnum = (typeof DiscordRoleAuditEventScalarFieldEnum)[keyof typeof DiscordRoleAuditEventScalarFieldEnum];
export declare const CommunityCounterScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly channelId: "channelId";
    readonly labelTemplate: "labelTemplate";
    readonly type: "type";
    readonly roleId: "roleId";
    readonly intervalSeconds: "intervalSeconds";
    readonly lastValue: "lastValue";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CommunityCounterScalarFieldEnum = (typeof CommunityCounterScalarFieldEnum)[keyof typeof CommunityCounterScalarFieldEnum];
export declare const ServerLogConfigScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly events: "events";
    readonly destinations: "destinations";
    readonly ignoredChannels: "ignoredChannels";
    readonly ignoredRoles: "ignoredRoles";
    readonly ignoredUsers: "ignoredUsers";
    readonly includeBots: "includeBots";
    readonly contentMode: "contentMode";
    readonly colors: "colors";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ServerLogConfigScalarFieldEnum = (typeof ServerLogConfigScalarFieldEnum)[keyof typeof ServerLogConfigScalarFieldEnum];
export declare const EmbedTemplateScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly content: "content";
    readonly title: "title";
    readonly description: "description";
    readonly color: "color";
    readonly author: "author";
    readonly thumbnailUrl: "thumbnailUrl";
    readonly imageUrl: "imageUrl";
    readonly footer: "footer";
    readonly timestamp: "timestamp";
    readonly fields: "fields";
    readonly allowedRoleMentions: "allowedRoleMentions";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type EmbedTemplateScalarFieldEnum = (typeof EmbedTemplateScalarFieldEnum)[keyof typeof EmbedTemplateScalarFieldEnum];
export declare const CustomCommandScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly description: "description";
    readonly responseText: "responseText";
    readonly embedTemplateId: "embedTemplateId";
    readonly enabled: "enabled";
    readonly allowedChannels: "allowedChannels";
    readonly deniedChannels: "deniedChannels";
    readonly requiredRoles: "requiredRoles";
    readonly cooldownSeconds: "cooldownSeconds";
    readonly triggerMode: "triggerMode";
    readonly triggerPhrase: "triggerPhrase";
    readonly deleteTriggeringMessage: "deleteTriggeringMessage";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type CustomCommandScalarFieldEnum = (typeof CustomCommandScalarFieldEnum)[keyof typeof CustomCommandScalarFieldEnum];
export declare const SuggestionScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly submitterId: "submitterId";
    readonly content: "content";
    readonly status: "status";
    readonly submissionMessageId: "submissionMessageId";
    readonly reviewMessageId: "reviewMessageId";
    readonly resultMessageId: "resultMessageId";
    readonly reviewerId: "reviewerId";
    readonly staffNote: "staffNote";
    readonly upvotes: "upvotes";
    readonly downvotes: "downvotes";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SuggestionScalarFieldEnum = (typeof SuggestionScalarFieldEnum)[keyof typeof SuggestionScalarFieldEnum];
export declare const StarboardConfigScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly destinationChannelId: "destinationChannelId";
    readonly emoji: "emoji";
    readonly threshold: "threshold";
    readonly allowSelfStar: "allowSelfStar";
    readonly includeBotMessages: "includeBotMessages";
    readonly nsfw: "nsfw";
    readonly mode: "mode";
    readonly channels: "channels";
    readonly ignoredRoles: "ignoredRoles";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StarboardConfigScalarFieldEnum = (typeof StarboardConfigScalarFieldEnum)[keyof typeof StarboardConfigScalarFieldEnum];
export declare const StarboardEntryScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly sourceChannelId: "sourceChannelId";
    readonly sourceMessageId: "sourceMessageId";
    readonly destinationMessageId: "destinationMessageId";
    readonly authorId: "authorId";
    readonly starCount: "starCount";
    readonly deleted: "deleted";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StarboardEntryScalarFieldEnum = (typeof StarboardEntryScalarFieldEnum)[keyof typeof StarboardEntryScalarFieldEnum];
export declare const PermissionPrincipalScalarFieldEnum: {
    readonly id: "id";
    readonly type: "type";
    readonly guildId: "guildId";
    readonly externalId: "externalId";
    readonly metadata: "metadata";
    readonly enabled: "enabled";
    readonly disabledAt: "disabledAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PermissionPrincipalScalarFieldEnum = (typeof PermissionPrincipalScalarFieldEnum)[keyof typeof PermissionPrincipalScalarFieldEnum];
export declare const PermissionDefinitionScalarFieldEnum: {
    readonly id: "id";
    readonly key: "key";
    readonly description: "description";
    readonly category: "category";
    readonly enabled: "enabled";
    readonly disabledAt: "disabledAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PermissionDefinitionScalarFieldEnum = (typeof PermissionDefinitionScalarFieldEnum)[keyof typeof PermissionDefinitionScalarFieldEnum];
export declare const PermissionAssignmentScalarFieldEnum: {
    readonly id: "id";
    readonly principalId: "principalId";
    readonly permissionDefinitionId: "permissionDefinitionId";
    readonly scope: "scope";
    readonly guildId: "guildId";
    readonly effect: "effect";
    readonly enabled: "enabled";
    readonly expiresAt: "expiresAt";
    readonly revokedAt: "revokedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PermissionAssignmentScalarFieldEnum = (typeof PermissionAssignmentScalarFieldEnum)[keyof typeof PermissionAssignmentScalarFieldEnum];
export declare const PermissionAuditEventScalarFieldEnum: {
    readonly id: "id";
    readonly action: "action";
    readonly actorType: "actorType";
    readonly actorPrincipalId: "actorPrincipalId";
    readonly actorPrincipalType: "actorPrincipalType";
    readonly actorExternalId: "actorExternalId";
    readonly actorGuildDiscordId: "actorGuildDiscordId";
    readonly actorService: "actorService";
    readonly targetPrincipalId: "targetPrincipalId";
    readonly targetPrincipalType: "targetPrincipalType";
    readonly targetExternalId: "targetExternalId";
    readonly targetGuildDiscordId: "targetGuildDiscordId";
    readonly scope: "scope";
    readonly scopeGuildId: "scopeGuildId";
    readonly scopeGuildDiscordId: "scopeGuildDiscordId";
    readonly permissionDefinitionId: "permissionDefinitionId";
    readonly permissionKey: "permissionKey";
    readonly assignmentId: "assignmentId";
    readonly reasonCode: "reasonCode";
    readonly reason: "reason";
    readonly correlationId: "correlationId";
    readonly beforeSnapshot: "beforeSnapshot";
    readonly afterSnapshot: "afterSnapshot";
    readonly occurredAt: "occurredAt";
    readonly createdAt: "createdAt";
};
export type PermissionAuditEventScalarFieldEnum = (typeof PermissionAuditEventScalarFieldEnum)[keyof typeof PermissionAuditEventScalarFieldEnum];
export declare const PermissionCatalogStateScalarFieldEnum: {
    readonly id: "id";
    readonly version: "version";
    readonly checksum: "checksum";
    readonly syncedAt: "syncedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PermissionCatalogStateScalarFieldEnum = (typeof PermissionCatalogStateScalarFieldEnum)[keyof typeof PermissionCatalogStateScalarFieldEnum];
export declare const PlatformUserScalarFieldEnum: {
    readonly id: "id";
    readonly status: "status";
    readonly authenticationRevision: "authenticationRevision";
    readonly statusReasonCode: "statusReasonCode";
    readonly suspendedAt: "suspendedAt";
    readonly disabledAt: "disabledAt";
    readonly deletedAt: "deletedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PlatformUserScalarFieldEnum = (typeof PlatformUserScalarFieldEnum)[keyof typeof PlatformUserScalarFieldEnum];
export declare const ExternalIdentityScalarFieldEnum: {
    readonly id: "id";
    readonly platformUserId: "platformUserId";
    readonly provider: "provider";
    readonly providerSubjectId: "providerSubjectId";
    readonly username: "username";
    readonly globalName: "globalName";
    readonly avatar: "avatar";
    readonly enabled: "enabled";
    readonly linkedAt: "linkedAt";
    readonly verifiedAt: "verifiedAt";
    readonly lastProviderRefreshAt: "lastProviderRefreshAt";
    readonly unlinkedAt: "unlinkedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ExternalIdentityScalarFieldEnum = (typeof ExternalIdentityScalarFieldEnum)[keyof typeof ExternalIdentityScalarFieldEnum];
export declare const BrowserSessionScalarFieldEnum: {
    readonly id: "id";
    readonly platformUserId: "platformUserId";
    readonly loginIdentityId: "loginIdentityId";
    readonly tokenDigest: "tokenDigest";
    readonly tokenKeyVersion: "tokenKeyVersion";
    readonly csrfDigest: "csrfDigest";
    readonly csrfKeyVersion: "csrfKeyVersion";
    readonly authenticationRevisionAtIssue: "authenticationRevisionAtIssue";
    readonly authenticatedAt: "authenticatedAt";
    readonly lastSeenAt: "lastSeenAt";
    readonly idleExpiresAt: "idleExpiresAt";
    readonly absoluteExpiresAt: "absoluteExpiresAt";
    readonly status: "status";
    readonly revokedAt: "revokedAt";
    readonly revocationReason: "revocationReason";
    readonly rotatedFromSessionId: "rotatedFromSessionId";
    readonly ipHmac: "ipHmac";
    readonly userAgentHmac: "userAgentHmac";
    readonly deviceHmac: "deviceHmac";
    readonly metadataKeyVersion: "metadataKeyVersion";
    readonly deviceLabel: "deviceLabel";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BrowserSessionScalarFieldEnum = (typeof BrowserSessionScalarFieldEnum)[keyof typeof BrowserSessionScalarFieldEnum];
export declare const OAuthTransactionScalarFieldEnum: {
    readonly id: "id";
    readonly provider: "provider";
    readonly purpose: "purpose";
    readonly state: "state";
    readonly stateDigest: "stateDigest";
    readonly browserBindingDigest: "browserBindingDigest";
    readonly platformUserId: "platformUserId";
    readonly initiatingSessionId: "initiatingSessionId";
    readonly redirectKey: "redirectKey";
    readonly returnTargetKey: "returnTargetKey";
    readonly pkceMode: "pkceMode";
    readonly pkceCiphertext: "pkceCiphertext";
    readonly pkceNonce: "pkceNonce";
    readonly pkceAuthenticationTag: "pkceAuthenticationTag";
    readonly pkceKeyVersion: "pkceKeyVersion";
    readonly expiresAt: "expiresAt";
    readonly claimedAt: "claimedAt";
    readonly claimExpiresAt: "claimExpiresAt";
    readonly completedAt: "completedAt";
    readonly failedAt: "failedAt";
    readonly cancelledAt: "cancelledAt";
    readonly expiredAt: "expiredAt";
    readonly failureReason: "failureReason";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OAuthTransactionScalarFieldEnum = (typeof OAuthTransactionScalarFieldEnum)[keyof typeof OAuthTransactionScalarFieldEnum];
export declare const OAuthCredentialScalarFieldEnum: {
    readonly id: "id";
    readonly externalIdentityId: "externalIdentityId";
    readonly provider: "provider";
    readonly accessTokenCiphertext: "accessTokenCiphertext";
    readonly accessTokenNonce: "accessTokenNonce";
    readonly accessTokenAuthenticationTag: "accessTokenAuthenticationTag";
    readonly accessTokenKeyVersion: "accessTokenKeyVersion";
    readonly refreshTokenCiphertext: "refreshTokenCiphertext";
    readonly refreshTokenNonce: "refreshTokenNonce";
    readonly refreshTokenAuthenticationTag: "refreshTokenAuthenticationTag";
    readonly refreshTokenKeyVersion: "refreshTokenKeyVersion";
    readonly scopes: "scopes";
    readonly providerExpiresAt: "providerExpiresAt";
    readonly refreshVersion: "refreshVersion";
    readonly revokedAt: "revokedAt";
    readonly revocationReason: "revocationReason";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type OAuthCredentialScalarFieldEnum = (typeof OAuthCredentialScalarFieldEnum)[keyof typeof OAuthCredentialScalarFieldEnum];
export declare const DiscordGuildMembershipScalarFieldEnum: {
    readonly id: "id";
    readonly externalIdentityId: "externalIdentityId";
    readonly guildId: "guildId";
    readonly status: "status";
    readonly source: "source";
    readonly verifiedAt: "verifiedAt";
    readonly validUntil: "validUntil";
    readonly departedAt: "departedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DiscordGuildMembershipScalarFieldEnum = (typeof DiscordGuildMembershipScalarFieldEnum)[keyof typeof DiscordGuildMembershipScalarFieldEnum];
export declare const DiscordGuildMembershipRoleScalarFieldEnum: {
    readonly membershipId: "membershipId";
    readonly roleId: "roleId";
    readonly createdAt: "createdAt";
};
export type DiscordGuildMembershipRoleScalarFieldEnum = (typeof DiscordGuildMembershipRoleScalarFieldEnum)[keyof typeof DiscordGuildMembershipRoleScalarFieldEnum];
export declare const AuthenticationAuditEventScalarFieldEnum: {
    readonly id: "id";
    readonly action: "action";
    readonly outcome: "outcome";
    readonly reasonCode: "reasonCode";
    readonly requestId: "requestId";
    readonly correlationId: "correlationId";
    readonly actorType: "actorType";
    readonly actorPlatformUserId: "actorPlatformUserId";
    readonly actorServiceIdentityId: "actorServiceIdentityId";
    readonly targetPlatformUserId: "targetPlatformUserId";
    readonly targetExternalIdentityId: "targetExternalIdentityId";
    readonly targetBrowserSessionId: "targetBrowserSessionId";
    readonly targetOAuthTransactionId: "targetOAuthTransactionId";
    readonly targetOAuthCredentialId: "targetOAuthCredentialId";
    readonly targetGuildMembershipId: "targetGuildMembershipId";
    readonly provider: "provider";
    readonly purpose: "purpose";
    readonly metadata: "metadata";
    readonly ipHmac: "ipHmac";
    readonly userAgentHmac: "userAgentHmac";
    readonly deviceHmac: "deviceHmac";
    readonly metadataKeyVersion: "metadataKeyVersion";
    readonly occurredAt: "occurredAt";
    readonly createdAt: "createdAt";
};
export type AuthenticationAuditEventScalarFieldEnum = (typeof AuthenticationAuditEventScalarFieldEnum)[keyof typeof AuthenticationAuditEventScalarFieldEnum];
export declare const BirthdaySettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly channelId: "channelId";
    readonly message: "message";
    readonly embedColor: "embedColor";
    readonly roleId: "roleId";
    readonly announceHour: "announceHour";
    readonly pingRoleId: "pingRoleId";
    readonly allowYear: "allowYear";
    readonly requireConfirmation: "requireConfirmation";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BirthdaySettingsScalarFieldEnum = (typeof BirthdaySettingsScalarFieldEnum)[keyof typeof BirthdaySettingsScalarFieldEnum];
export declare const BirthdayScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly displayName: "displayName";
    readonly month: "month";
    readonly day: "day";
    readonly year: "year";
    readonly showAge: "showAge";
    readonly timeZone: "timeZone";
    readonly lastAnnouncedYear: "lastAnnouncedYear";
    readonly grantedRoleId: "grantedRoleId";
    readonly roleRemoveAt: "roleRemoveAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BirthdayScalarFieldEnum = (typeof BirthdayScalarFieldEnum)[keyof typeof BirthdayScalarFieldEnum];
export declare const BuilderDraftScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly answers: "answers";
    readonly blueprint: "blueprint";
    readonly updatedById: "updatedById";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BuilderDraftScalarFieldEnum = (typeof BuilderDraftScalarFieldEnum)[keyof typeof BuilderDraftScalarFieldEnum];
export declare const BuilderRunScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly status: "status";
    readonly mode: "mode";
    readonly links: "links";
    readonly planned: "planned";
    readonly done: "done";
    readonly skipped: "skipped";
    readonly failed: "failed";
    readonly startedById: "startedById";
    readonly startedByName: "startedByName";
    readonly warnings: "warnings";
    readonly error: "error";
    readonly snapshot: "snapshot";
    readonly startedAt: "startedAt";
    readonly finishedAt: "finishedAt";
    readonly undoneAt: "undoneAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BuilderRunScalarFieldEnum = (typeof BuilderRunScalarFieldEnum)[keyof typeof BuilderRunScalarFieldEnum];
export declare const BuilderRunItemScalarFieldEnum: {
    readonly id: "id";
    readonly runId: "runId";
    readonly sequence: "sequence";
    readonly kind: "kind";
    readonly key: "key";
    readonly name: "name";
    readonly discordId: "discordId";
    readonly status: "status";
    readonly error: "error";
    readonly note: "note";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type BuilderRunItemScalarFieldEnum = (typeof BuilderRunItemScalarFieldEnum)[keyof typeof BuilderRunItemScalarFieldEnum];
export declare const FivemSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly serverAddress: "serverAddress";
    readonly connectUrl: "connectUrl";
    readonly statusChannelId: "statusChannelId";
    readonly statusMessageId: "statusMessageId";
    readonly updateIntervalSeconds: "updateIntervalSeconds";
    readonly alertChannelId: "alertChannelId";
    readonly alertRoleId: "alertRoleId";
    readonly restartTimes: "restartTimes";
    readonly timeZone: "timeZone";
    readonly restartWarningMinutes: "restartWarningMinutes";
    readonly lastOnline: "lastOnline";
    readonly onlineSince: "onlineSince";
    readonly failureStreak: "failureStreak";
    readonly lastPolledAt: "lastPolledAt";
    readonly sentRestartWarnings: "sentRestartWarnings";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type FivemSettingsScalarFieldEnum = (typeof FivemSettingsScalarFieldEnum)[keyof typeof FivemSettingsScalarFieldEnum];
export declare const FivemStatusSnapshotScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly online: "online";
    readonly players: "players";
    readonly maxPlayers: "maxPlayers";
    readonly at: "at";
};
export type FivemStatusSnapshotScalarFieldEnum = (typeof FivemStatusSnapshotScalarFieldEnum)[keyof typeof FivemStatusSnapshotScalarFieldEnum];
export declare const GamesSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly playerCountTemplate: "playerCountTemplate";
    readonly playerCountOfflineTemplate: "playerCountOfflineTemplate";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GamesSettingsScalarFieldEnum = (typeof GamesSettingsScalarFieldEnum)[keyof typeof GamesSettingsScalarFieldEnum];
export declare const GamesServerScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly kind: "kind";
    readonly address: "address";
    readonly game: "game";
    readonly connectUrl: "connectUrl";
    readonly statusChannelId: "statusChannelId";
    readonly statusMessageId: "statusMessageId";
    readonly updateIntervalSeconds: "updateIntervalSeconds";
    readonly playerCountChannelId: "playerCountChannelId";
    readonly alertChannelId: "alertChannelId";
    readonly alertRoleId: "alertRoleId";
    readonly enabled: "enabled";
    readonly lastOnline: "lastOnline";
    readonly onlineSince: "onlineSince";
    readonly offlineSince: "offlineSince";
    readonly failureStreak: "failureStreak";
    readonly lastPolledAt: "lastPolledAt";
    readonly lastError: "lastError";
    readonly lastPlayerCount: "lastPlayerCount";
    readonly lastMaxPlayers: "lastMaxPlayers";
    readonly lastRenamedAt: "lastRenamedAt";
    readonly lastChannelName: "lastChannelName";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GamesServerScalarFieldEnum = (typeof GamesServerScalarFieldEnum)[keyof typeof GamesServerScalarFieldEnum];
export declare const GamesStatusSnapshotScalarFieldEnum: {
    readonly id: "id";
    readonly serverId: "serverId";
    readonly online: "online";
    readonly players: "players";
    readonly maxPlayers: "maxPlayers";
    readonly at: "at";
};
export type GamesStatusSnapshotScalarFieldEnum = (typeof GamesStatusSnapshotScalarFieldEnum)[keyof typeof GamesStatusSnapshotScalarFieldEnum];
export declare const GiveawayCounterScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly nextNumber: "nextNumber";
};
export type GiveawayCounterScalarFieldEnum = (typeof GiveawayCounterScalarFieldEnum)[keyof typeof GiveawayCounterScalarFieldEnum];
export declare const GiveawayScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly number: "number";
    readonly prize: "prize";
    readonly description: "description";
    readonly winnerCount: "winnerCount";
    readonly channelId: "channelId";
    readonly messageId: "messageId";
    readonly hostId: "hostId";
    readonly requiredRoleIds: "requiredRoleIds";
    readonly blockedRoleIds: "blockedRoleIds";
    readonly minAccountAgeDays: "minAccountAgeDays";
    readonly minServerDays: "minServerDays";
    readonly bonusEntries: "bonusEntries";
    readonly pingRoleId: "pingRoleId";
    readonly dmWinners: "dmWinners";
    readonly endsAt: "endsAt";
    readonly pausedAt: "pausedAt";
    readonly status: "status";
    readonly winnerIds: "winnerIds";
    readonly endedAt: "endedAt";
    readonly endedById: "endedById";
    readonly createdById: "createdById";
    readonly createdByName: "createdByName";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GiveawayScalarFieldEnum = (typeof GiveawayScalarFieldEnum)[keyof typeof GiveawayScalarFieldEnum];
export declare const GiveawayEntryScalarFieldEnum: {
    readonly id: "id";
    readonly giveawayId: "giveawayId";
    readonly userId: "userId";
    readonly userName: "userName";
    readonly entries: "entries";
    readonly createdAt: "createdAt";
};
export type GiveawayEntryScalarFieldEnum = (typeof GiveawayEntryScalarFieldEnum)[keyof typeof GiveawayEntryScalarFieldEnum];
export declare const KnowledgeSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly autoAnswerEnabled: "autoAnswerEnabled";
    readonly autoAnswerChannelIds: "autoAnswerChannelIds";
    readonly autoAnswerThreshold: "autoAnswerThreshold";
    readonly autoAnswerCooldownSeconds: "autoAnswerCooldownSeconds";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type KnowledgeSettingsScalarFieldEnum = (typeof KnowledgeSettingsScalarFieldEnum)[keyof typeof KnowledgeSettingsScalarFieldEnum];
export declare const KnowledgeCategoryScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly emoji: "emoji";
    readonly order: "order";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type KnowledgeCategoryScalarFieldEnum = (typeof KnowledgeCategoryScalarFieldEnum)[keyof typeof KnowledgeCategoryScalarFieldEnum];
export declare const KnowledgeArticleScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly categoryId: "categoryId";
    readonly title: "title";
    readonly slug: "slug";
    readonly body: "body";
    readonly tags: "tags";
    readonly published: "published";
    readonly pinned: "pinned";
    readonly views: "views";
    readonly authorId: "authorId";
    readonly authorName: "authorName";
    readonly updatedById: "updatedById";
    readonly updatedByName: "updatedByName";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type KnowledgeArticleScalarFieldEnum = (typeof KnowledgeArticleScalarFieldEnum)[keyof typeof KnowledgeArticleScalarFieldEnum];
export declare const LevelSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly messageXpMin: "messageXpMin";
    readonly messageXpMax: "messageXpMax";
    readonly cooldownSeconds: "cooldownSeconds";
    readonly voiceXpPerMinute: "voiceXpPerMinute";
    readonly curveBase: "curveBase";
    readonly curveExponent: "curveExponent";
    readonly curveLinear: "curveLinear";
    readonly roleMultipliers: "roleMultipliers";
    readonly channelMultipliers: "channelMultipliers";
    readonly noXpRoleIds: "noXpRoleIds";
    readonly noXpChannelIds: "noXpChannelIds";
    readonly levelUpMode: "levelUpMode";
    readonly levelUpChannelId: "levelUpChannelId";
    readonly levelUpMessage: "levelUpMessage";
    readonly rewards: "rewards";
    readonly rewardMode: "rewardMode";
    readonly removeRewardsOnReset: "removeRewardsOnReset";
    readonly maxLevel: "maxLevel";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type LevelSettingsScalarFieldEnum = (typeof LevelSettingsScalarFieldEnum)[keyof typeof LevelSettingsScalarFieldEnum];
export declare const LevelMemberScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly displayName: "displayName";
    readonly xp: "xp";
    readonly level: "level";
    readonly messages: "messages";
    readonly voiceMinutes: "voiceMinutes";
    readonly lastMessageAt: "lastMessageAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type LevelMemberScalarFieldEnum = (typeof LevelMemberScalarFieldEnum)[keyof typeof LevelMemberScalarFieldEnum];
export declare const MessagesLookScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly accentColor: "accentColor";
    readonly footerText: "footerText";
    readonly footerIconUrl: "footerIconUrl";
    readonly authorName: "authorName";
    readonly authorIconUrl: "authorIconUrl";
    readonly thumbnailUrl: "thumbnailUrl";
    readonly showTimestamp: "showTimestamp";
    readonly mode: "mode";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MessagesLookScalarFieldEnum = (typeof MessagesLookScalarFieldEnum)[keyof typeof MessagesLookScalarFieldEnum];
export declare const MessagesTemplateScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly key: "key";
    readonly enabled: "enabled";
    readonly content: "content";
    readonly embeds: "embeds";
    readonly updatedBy: "updatedBy";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MessagesTemplateScalarFieldEnum = (typeof MessagesTemplateScalarFieldEnum)[keyof typeof MessagesTemplateScalarFieldEnum];
export declare const ModerationSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly logChannelId: "logChannelId";
    readonly dmOnAction: "dmOnAction";
    readonly dmIncludeModerator: "dmIncludeModerator";
    readonly appealMessage: "appealMessage";
    readonly requireReason: "requireReason";
    readonly defaultTimeoutMinutes: "defaultTimeoutMinutes";
    readonly banDeleteMessageHours: "banDeleteMessageHours";
    readonly warningExpiryDays: "warningExpiryDays";
    readonly protectedRoleIds: "protectedRoleIds";
    readonly escalation: "escalation";
    readonly automod: "automod";
    readonly recordExternalActions: "recordExternalActions";
    readonly nextCaseNumber: "nextCaseNumber";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ModerationSettingsScalarFieldEnum = (typeof ModerationSettingsScalarFieldEnum)[keyof typeof ModerationSettingsScalarFieldEnum];
export declare const ModerationCaseScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly number: "number";
    readonly type: "type";
    readonly targetId: "targetId";
    readonly targetName: "targetName";
    readonly moderatorId: "moderatorId";
    readonly moderatorName: "moderatorName";
    readonly reason: "reason";
    readonly durationMinutes: "durationMinutes";
    readonly expiresAt: "expiresAt";
    readonly active: "active";
    readonly source: "source";
    readonly evidence: "evidence";
    readonly dmDelivered: "dmDelivered";
    readonly logMessageId: "logMessageId";
    readonly revokedAt: "revokedAt";
    readonly revokedById: "revokedById";
    readonly revokeReason: "revokeReason";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ModerationCaseScalarFieldEnum = (typeof ModerationCaseScalarFieldEnum)[keyof typeof ModerationCaseScalarFieldEnum];
export declare const MusicSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly djRoleIds: "djRoleIds";
    readonly defaultVolume: "defaultVolume";
    readonly maxQueue: "maxQueue";
    readonly announceChannelId: "announceChannelId";
    readonly nowPlayingPanel: "nowPlayingPanel";
    readonly stayConnected247: "stayConnected247";
    readonly homeChannelId: "homeChannelId";
    readonly autoLeaveMinutes: "autoLeaveMinutes";
    readonly idleRadioStationId: "idleRadioStationId";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MusicSettingsScalarFieldEnum = (typeof MusicSettingsScalarFieldEnum)[keyof typeof MusicSettingsScalarFieldEnum];
export declare const MusicTrackScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly title: "title";
    readonly artist: "artist";
    readonly album: "album";
    readonly trackNumber: "trackNumber";
    readonly durationSeconds: "durationSeconds";
    readonly fileName: "fileName";
    readonly coverFileName: "coverFileName";
    readonly contentType: "contentType";
    readonly sizeBytes: "sizeBytes";
    readonly sha256: "sha256";
    readonly originalName: "originalName";
    readonly uploadedBy: "uploadedBy";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MusicTrackScalarFieldEnum = (typeof MusicTrackScalarFieldEnum)[keyof typeof MusicTrackScalarFieldEnum];
export declare const MusicPlaylistScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly description: "description";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type MusicPlaylistScalarFieldEnum = (typeof MusicPlaylistScalarFieldEnum)[keyof typeof MusicPlaylistScalarFieldEnum];
export declare const MusicPlaylistTrackScalarFieldEnum: {
    readonly playlistId: "playlistId";
    readonly position: "position";
    readonly trackId: "trackId";
};
export type MusicPlaylistTrackScalarFieldEnum = (typeof MusicPlaylistTrackScalarFieldEnum)[keyof typeof MusicPlaylistTrackScalarFieldEnum];
export declare const MusicStationScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly url: "url";
    readonly faviconUrl: "faviconUrl";
    readonly tags: "tags";
    readonly createdAt: "createdAt";
};
export type MusicStationScalarFieldEnum = (typeof MusicStationScalarFieldEnum)[keyof typeof MusicStationScalarFieldEnum];
export declare const MusicSessionScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly channelId: "channelId";
    readonly textChannelId: "textChannelId";
    readonly panelChannelId: "panelChannelId";
    readonly panelMessageId: "panelMessageId";
    readonly queue: "queue";
    readonly index: "index";
    readonly positionSeconds: "positionSeconds";
    readonly state: "state";
    readonly loop: "loop";
    readonly shuffle: "shuffle";
    readonly volume: "volume";
    readonly updatedAt: "updatedAt";
};
export type MusicSessionScalarFieldEnum = (typeof MusicSessionScalarFieldEnum)[keyof typeof MusicSessionScalarFieldEnum];
export declare const PollCounterScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly nextNumber: "nextNumber";
};
export type PollCounterScalarFieldEnum = (typeof PollCounterScalarFieldEnum)[keyof typeof PollCounterScalarFieldEnum];
export declare const PollScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly number: "number";
    readonly question: "question";
    readonly options: "options";
    readonly maxChoices: "maxChoices";
    readonly anonymous: "anonymous";
    readonly resultsVisibility: "resultsVisibility";
    readonly allowVoteChange: "allowVoteChange";
    readonly allowedRoleIds: "allowedRoleIds";
    readonly channelId: "channelId";
    readonly messageId: "messageId";
    readonly pingRoleId: "pingRoleId";
    readonly endsAt: "endsAt";
    readonly status: "status";
    readonly createdById: "createdById";
    readonly createdByName: "createdByName";
    readonly closedAt: "closedAt";
    readonly closedById: "closedById";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PollScalarFieldEnum = (typeof PollScalarFieldEnum)[keyof typeof PollScalarFieldEnum];
export declare const PollVoteScalarFieldEnum: {
    readonly id: "id";
    readonly pollId: "pollId";
    readonly userId: "userId";
    readonly userName: "userName";
    readonly optionIds: "optionIds";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type PollVoteScalarFieldEnum = (typeof PollVoteScalarFieldEnum)[keyof typeof PollVoteScalarFieldEnum];
export declare const ScheduledMessageScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly channelId: "channelId";
    readonly content: "content";
    readonly embed: "embed";
    readonly pingRoleIds: "pingRoleIds";
    readonly scheduleType: "scheduleType";
    readonly timeZone: "timeZone";
    readonly runAt: "runAt";
    readonly intervalMinutes: "intervalMinutes";
    readonly time: "time";
    readonly weekdays: "weekdays";
    readonly dayOfMonth: "dayOfMonth";
    readonly startDate: "startDate";
    readonly endDate: "endDate";
    readonly enabled: "enabled";
    readonly deletePrevious: "deletePrevious";
    readonly pin: "pin";
    readonly maxRuns: "maxRuns";
    readonly runCount: "runCount";
    readonly lastRunAt: "lastRunAt";
    readonly lastMessageId: "lastMessageId";
    readonly nextRunAt: "nextRunAt";
    readonly createdById: "createdById";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ScheduledMessageScalarFieldEnum = (typeof ScheduledMessageScalarFieldEnum)[keyof typeof ScheduledMessageScalarFieldEnum];
export declare const ScheduledMessageRunScalarFieldEnum: {
    readonly id: "id";
    readonly messageId: "messageId";
    readonly guildId: "guildId";
    readonly success: "success";
    readonly discordMessageId: "discordMessageId";
    readonly error: "error";
    readonly manual: "manual";
    readonly ranAt: "ranAt";
};
export type ScheduledMessageRunScalarFieldEnum = (typeof ScheduledMessageRunScalarFieldEnum)[keyof typeof ScheduledMessageRunScalarFieldEnum];
export declare const StaffSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly logChannelId: "logChannelId";
    readonly rosterChannelId: "rosterChannelId";
    readonly rosterMessageId: "rosterMessageId";
    readonly loaRoleId: "loaRoleId";
    readonly autoClockOutHours: "autoClockOutHours";
    readonly maxLeaveDays: "maxLeaveDays";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StaffSettingsScalarFieldEnum = (typeof StaffSettingsScalarFieldEnum)[keyof typeof StaffSettingsScalarFieldEnum];
export declare const StaffRankScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly roleId: "roleId";
    readonly color: "color";
    readonly description: "description";
    readonly position: "position";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StaffRankScalarFieldEnum = (typeof StaffRankScalarFieldEnum)[keyof typeof StaffRankScalarFieldEnum];
export declare const StaffMemberScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly displayName: "displayName";
    readonly rankId: "rankId";
    readonly callsign: "callsign";
    readonly joinedAt: "joinedAt";
    readonly status: "status";
    readonly notes: "notes";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StaffMemberScalarFieldEnum = (typeof StaffMemberScalarFieldEnum)[keyof typeof StaffMemberScalarFieldEnum];
export declare const StaffRecordScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly userName: "userName";
    readonly type: "type";
    readonly actorId: "actorId";
    readonly actorName: "actorName";
    readonly reason: "reason";
    readonly fromRank: "fromRank";
    readonly toRank: "toRank";
    readonly createdAt: "createdAt";
};
export type StaffRecordScalarFieldEnum = (typeof StaffRecordScalarFieldEnum)[keyof typeof StaffRecordScalarFieldEnum];
export declare const StaffStrikeScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly userName: "userName";
    readonly reason: "reason";
    readonly actorId: "actorId";
    readonly actorName: "actorName";
    readonly expiresAt: "expiresAt";
    readonly revokedAt: "revokedAt";
    readonly revokedById: "revokedById";
    readonly createdAt: "createdAt";
};
export type StaffStrikeScalarFieldEnum = (typeof StaffStrikeScalarFieldEnum)[keyof typeof StaffStrikeScalarFieldEnum];
export declare const StaffLeaveScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly userName: "userName";
    readonly startsAt: "startsAt";
    readonly endsAt: "endsAt";
    readonly reason: "reason";
    readonly status: "status";
    readonly reviewerId: "reviewerId";
    readonly reviewerName: "reviewerName";
    readonly reviewNote: "reviewNote";
    readonly reviewedAt: "reviewedAt";
    readonly messageId: "messageId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StaffLeaveScalarFieldEnum = (typeof StaffLeaveScalarFieldEnum)[keyof typeof StaffLeaveScalarFieldEnum];
export declare const StaffShiftScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly userName: "userName";
    readonly startedAt: "startedAt";
    readonly endedAt: "endedAt";
    readonly durationSeconds: "durationSeconds";
    readonly autoEnded: "autoEnded";
    readonly createdAt: "createdAt";
};
export type StaffShiftScalarFieldEnum = (typeof StaffShiftScalarFieldEnum)[keyof typeof StaffShiftScalarFieldEnum];
export declare const StreamsSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly defaultChannelId: "defaultChannelId";
    readonly endedBehavior: "endedBehavior";
    readonly checkIntervalSeconds: "checkIntervalSeconds";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StreamsSettingsScalarFieldEnum = (typeof StreamsSettingsScalarFieldEnum)[keyof typeof StreamsSettingsScalarFieldEnum];
export declare const StreamsSubscriptionScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly platform: "platform";
    readonly handle: "handle";
    readonly displayName: "displayName";
    readonly avatarUrl: "avatarUrl";
    readonly platformId: "platformId";
    readonly announceChannelId: "announceChannelId";
    readonly pingRoleId: "pingRoleId";
    readonly messageText: "messageText";
    readonly announceVideos: "announceVideos";
    readonly enabled: "enabled";
    readonly lastStreamId: "lastStreamId";
    readonly liveSince: "liveSince";
    readonly lastAnnouncementChannelId: "lastAnnouncementChannelId";
    readonly lastAnnouncementMessageId: "lastAnnouncementMessageId";
    readonly lastVideoId: "lastVideoId";
    readonly lastCheckedAt: "lastCheckedAt";
    readonly offlineStreak: "offlineStreak";
    readonly failureStreak: "failureStreak";
    readonly lastError: "lastError";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type StreamsSubscriptionScalarFieldEnum = (typeof StreamsSubscriptionScalarFieldEnum)[keyof typeof StreamsSubscriptionScalarFieldEnum];
export declare const TicketSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly mode: "mode";
    readonly openCategoryChannelId: "openCategoryChannelId";
    readonly closedCategoryChannelId: "closedCategoryChannelId";
    readonly threadParentChannelId: "threadParentChannelId";
    readonly transcriptChannelId: "transcriptChannelId";
    readonly logChannelId: "logChannelId";
    readonly supportRoleIds: "supportRoleIds";
    readonly pingSupportOnOpen: "pingSupportOnOpen";
    readonly maxOpenPerUser: "maxOpenPerUser";
    readonly nameTemplate: "nameTemplate";
    readonly openMessage: "openMessage";
    readonly embedColor: "embedColor";
    readonly allowUserClose: "allowUserClose";
    readonly requireCloseReason: "requireCloseReason";
    readonly closeConfirmation: "closeConfirmation";
    readonly closeAction: "closeAction";
    readonly deleteDelaySeconds: "deleteDelaySeconds";
    readonly claimEnabled: "claimEnabled";
    readonly claimRestrictsReplies: "claimRestrictsReplies";
    readonly transcriptsEnabled: "transcriptsEnabled";
    readonly transcriptDmUser: "transcriptDmUser";
    readonly feedbackEnabled: "feedbackEnabled";
    readonly autoCloseHours: "autoCloseHours";
    readonly autoCloseWarningHours: "autoCloseWarningHours";
    readonly autoCloseExcludeClaimed: "autoCloseExcludeClaimed";
    readonly blockedUserIds: "blockedUserIds";
    readonly blockedRoleIds: "blockedRoleIds";
    readonly staffThreadEnabled: "staffThreadEnabled";
    readonly retentionMonths: "retentionMonths";
    readonly nextNumber: "nextNumber";
    readonly revision: "revision";
    readonly lastOperationSource: "lastOperationSource";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TicketSettingsScalarFieldEnum = (typeof TicketSettingsScalarFieldEnum)[keyof typeof TicketSettingsScalarFieldEnum];
export declare const TicketCategoryScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly description: "description";
    readonly emoji: "emoji";
    readonly buttonStyle: "buttonStyle";
    readonly enabled: "enabled";
    readonly position: "position";
    readonly supportRoleIds: "supportRoleIds";
    readonly alertUserIds: "alertUserIds";
    readonly parentChannelId: "parentChannelId";
    readonly nameTemplate: "nameTemplate";
    readonly openMessage: "openMessage";
    readonly defaultPriority: "defaultPriority";
    readonly questions: "questions";
    readonly requiredRoleIds: "requiredRoleIds";
    readonly maxOpenPerUser: "maxOpenPerUser";
    readonly staffThread: "staffThread";
    readonly nextNumber: "nextNumber";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TicketCategoryScalarFieldEnum = (typeof TicketCategoryScalarFieldEnum)[keyof typeof TicketCategoryScalarFieldEnum];
export declare const TicketPanelScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly channelId: "channelId";
    readonly messageId: "messageId";
    readonly title: "title";
    readonly description: "description";
    readonly color: "color";
    readonly style: "style";
    readonly placeholder: "placeholder";
    readonly imageUrl: "imageUrl";
    readonly footer: "footer";
    readonly categoryIds: "categoryIds";
    readonly buttonRows: "buttonRows";
    readonly publishedAt: "publishedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TicketPanelScalarFieldEnum = (typeof TicketPanelScalarFieldEnum)[keyof typeof TicketPanelScalarFieldEnum];
export declare const TicketScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly number: "number";
    readonly categoryId: "categoryId";
    readonly categoryNumber: "categoryNumber";
    readonly openerId: "openerId";
    readonly openerName: "openerName";
    readonly channelId: "channelId";
    readonly staffThreadId: "staffThreadId";
    readonly subject: "subject";
    readonly answers: "answers";
    readonly status: "status";
    readonly priority: "priority";
    readonly claimedById: "claimedById";
    readonly participantIds: "participantIds";
    readonly tags: "tags";
    readonly closedById: "closedById";
    readonly closeReason: "closeReason";
    readonly rating: "rating";
    readonly feedback: "feedback";
    readonly transcriptMessageId: "transcriptMessageId";
    readonly autoCloseWarnedAt: "autoCloseWarnedAt";
    readonly firstResponseAt: "firstResponseAt";
    readonly lastActivityAt: "lastActivityAt";
    readonly closedAt: "closedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TicketScalarFieldEnum = (typeof TicketScalarFieldEnum)[keyof typeof TicketScalarFieldEnum];
export declare const TicketMessageScalarFieldEnum: {
    readonly id: "id";
    readonly ticketId: "ticketId";
    readonly discordMessageId: "discordMessageId";
    readonly authorId: "authorId";
    readonly authorName: "authorName";
    readonly content: "content";
    readonly attachments: "attachments";
    readonly source: "source";
    readonly internal: "internal";
    readonly createdAt: "createdAt";
};
export type TicketMessageScalarFieldEnum = (typeof TicketMessageScalarFieldEnum)[keyof typeof TicketMessageScalarFieldEnum];
export declare const TicketEventScalarFieldEnum: {
    readonly id: "id";
    readonly ticketId: "ticketId";
    readonly action: "action";
    readonly actorId: "actorId";
    readonly source: "source";
    readonly details: "details";
    readonly createdAt: "createdAt";
};
export type TicketEventScalarFieldEnum = (typeof TicketEventScalarFieldEnum)[keyof typeof TicketEventScalarFieldEnum];
export declare const VerificationSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly mode: "mode";
    readonly verifiedRoleIds: "verifiedRoleIds";
    readonly unverifiedRoleId: "unverifiedRoleId";
    readonly channelId: "channelId";
    readonly panelTitle: "panelTitle";
    readonly panelDescription: "panelDescription";
    readonly panelColor: "panelColor";
    readonly panelButtonLabel: "panelButtonLabel";
    readonly panelChannelId: "panelChannelId";
    readonly panelMessageId: "panelMessageId";
    readonly questions: "questions";
    readonly logChannelId: "logChannelId";
    readonly minAccountAgeDays: "minAccountAgeDays";
    readonly ageAction: "ageAction";
    readonly kickUnverifiedMinutes: "kickUnverifiedMinutes";
    readonly maxAttempts: "maxAttempts";
    readonly cooldownMinutes: "cooldownMinutes";
    readonly dmOnSuccess: "dmOnSuccess";
    readonly successMessage: "successMessage";
    readonly welcomeChannelId: "welcomeChannelId";
    readonly welcomeMessage: "welcomeMessage";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type VerificationSettingsScalarFieldEnum = (typeof VerificationSettingsScalarFieldEnum)[keyof typeof VerificationSettingsScalarFieldEnum];
export declare const VerificationAttemptScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly userName: "userName";
    readonly result: "result";
    readonly reason: "reason";
    readonly staffId: "staffId";
    readonly staffName: "staffName";
    readonly source: "source";
    readonly createdAt: "createdAt";
};
export type VerificationAttemptScalarFieldEnum = (typeof VerificationAttemptScalarFieldEnum)[keyof typeof VerificationAttemptScalarFieldEnum];
export declare const VerificationPendingMemberScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly userId: "userId";
    readonly joinedAt: "joinedAt";
    readonly flagged: "flagged";
};
export type VerificationPendingMemberScalarFieldEnum = (typeof VerificationPendingMemberScalarFieldEnum)[keyof typeof VerificationPendingMemberScalarFieldEnum];
export declare const VoiceSettingsScalarFieldEnum: {
    readonly guildId: "guildId";
    readonly enabled: "enabled";
    readonly controlPanel: "controlPanel";
    readonly allowClaim: "allowClaim";
    readonly revision: "revision";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type VoiceSettingsScalarFieldEnum = (typeof VoiceSettingsScalarFieldEnum)[keyof typeof VoiceSettingsScalarFieldEnum];
export declare const VoiceHubScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly name: "name";
    readonly enabled: "enabled";
    readonly channelId: "channelId";
    readonly categoryId: "categoryId";
    readonly nameTemplate: "nameTemplate";
    readonly userLimit: "userLimit";
    readonly bitrateKbps: "bitrateKbps";
    readonly privateByDefault: "privateByDefault";
    readonly deleteDelaySeconds: "deleteDelaySeconds";
    readonly allowedRoleIds: "allowedRoleIds";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type VoiceHubScalarFieldEnum = (typeof VoiceHubScalarFieldEnum)[keyof typeof VoiceHubScalarFieldEnum];
export declare const VoiceRoomScalarFieldEnum: {
    readonly id: "id";
    readonly guildId: "guildId";
    readonly hubId: "hubId";
    readonly channelId: "channelId";
    readonly ownerId: "ownerId";
    readonly name: "name";
    readonly locked: "locked";
    readonly hidden: "hidden";
    readonly panelMessageId: "panelMessageId";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type VoiceRoomScalarFieldEnum = (typeof VoiceRoomScalarFieldEnum)[keyof typeof VoiceRoomScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: runtime.JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
/**
 * Field references
 */
/**
 * Reference to a field of type 'String'
 */
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
/**
 * Reference to a field of type 'String[]'
 */
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
/**
 * Reference to a field of type 'Int'
 */
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
/**
 * Reference to a field of type 'Int[]'
 */
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
/**
 * Reference to a field of type 'DateTime'
 */
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
/**
 * Reference to a field of type 'DateTime[]'
 */
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
/**
 * Reference to a field of type 'Boolean'
 */
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
/**
 * Reference to a field of type 'Json'
 */
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
/**
 * Reference to a field of type 'QueryMode'
 */
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
/**
 * Reference to a field of type 'ApplicationButtonStyle'
 */
export type EnumApplicationButtonStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationButtonStyle'>;
/**
 * Reference to a field of type 'ApplicationButtonStyle[]'
 */
export type ListEnumApplicationButtonStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationButtonStyle[]'>;
/**
 * Reference to a field of type 'ApplicationStatus'
 */
export type EnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus'>;
/**
 * Reference to a field of type 'ApplicationStatus[]'
 */
export type ListEnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus[]'>;
/**
 * Reference to a field of type 'ApplicationSource'
 */
export type EnumApplicationSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationSource'>;
/**
 * Reference to a field of type 'ApplicationSource[]'
 */
export type ListEnumApplicationSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationSource[]'>;
/**
 * Reference to a field of type 'ApplicationVoteType'
 */
export type EnumApplicationVoteTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationVoteType'>;
/**
 * Reference to a field of type 'ApplicationVoteType[]'
 */
export type ListEnumApplicationVoteTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationVoteType[]'>;
/**
 * Reference to a field of type 'RoleMenuPresentationType'
 */
export type EnumRoleMenuPresentationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoleMenuPresentationType'>;
/**
 * Reference to a field of type 'RoleMenuPresentationType[]'
 */
export type ListEnumRoleMenuPresentationTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoleMenuPresentationType[]'>;
/**
 * Reference to a field of type 'RoleMenuAssignmentMode'
 */
export type EnumRoleMenuAssignmentModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoleMenuAssignmentMode'>;
/**
 * Reference to a field of type 'RoleMenuAssignmentMode[]'
 */
export type ListEnumRoleMenuAssignmentModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoleMenuAssignmentMode[]'>;
/**
 * Reference to a field of type 'RoleMenuStatus'
 */
export type EnumRoleMenuStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoleMenuStatus'>;
/**
 * Reference to a field of type 'RoleMenuStatus[]'
 */
export type ListEnumRoleMenuStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RoleMenuStatus[]'>;
/**
 * Reference to a field of type 'WelcomeGoodbyeKind'
 */
export type EnumWelcomeGoodbyeKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WelcomeGoodbyeKind'>;
/**
 * Reference to a field of type 'WelcomeGoodbyeKind[]'
 */
export type ListEnumWelcomeGoodbyeKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WelcomeGoodbyeKind[]'>;
/**
 * Reference to a field of type 'CommunityCounterType'
 */
export type EnumCommunityCounterTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommunityCounterType'>;
/**
 * Reference to a field of type 'CommunityCounterType[]'
 */
export type ListEnumCommunityCounterTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommunityCounterType[]'>;
/**
 * Reference to a field of type 'CommunityContentMode'
 */
export type EnumCommunityContentModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommunityContentMode'>;
/**
 * Reference to a field of type 'CommunityContentMode[]'
 */
export type ListEnumCommunityContentModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommunityContentMode[]'>;
/**
 * Reference to a field of type 'CustomCommandTriggerMode'
 */
export type EnumCustomCommandTriggerModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CustomCommandTriggerMode'>;
/**
 * Reference to a field of type 'CustomCommandTriggerMode[]'
 */
export type ListEnumCustomCommandTriggerModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CustomCommandTriggerMode[]'>;
/**
 * Reference to a field of type 'SuggestionStatus'
 */
export type EnumSuggestionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SuggestionStatus'>;
/**
 * Reference to a field of type 'SuggestionStatus[]'
 */
export type ListEnumSuggestionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SuggestionStatus[]'>;
/**
 * Reference to a field of type 'StarboardNsfwMode'
 */
export type EnumStarboardNsfwModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StarboardNsfwMode'>;
/**
 * Reference to a field of type 'StarboardNsfwMode[]'
 */
export type ListEnumStarboardNsfwModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StarboardNsfwMode[]'>;
/**
 * Reference to a field of type 'StarboardChannelMode'
 */
export type EnumStarboardChannelModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StarboardChannelMode'>;
/**
 * Reference to a field of type 'StarboardChannelMode[]'
 */
export type ListEnumStarboardChannelModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StarboardChannelMode[]'>;
/**
 * Reference to a field of type 'PermissionPrincipalType'
 */
export type EnumPermissionPrincipalTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionPrincipalType'>;
/**
 * Reference to a field of type 'PermissionPrincipalType[]'
 */
export type ListEnumPermissionPrincipalTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionPrincipalType[]'>;
/**
 * Reference to a field of type 'PermissionScopeType'
 */
export type EnumPermissionScopeTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionScopeType'>;
/**
 * Reference to a field of type 'PermissionScopeType[]'
 */
export type ListEnumPermissionScopeTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionScopeType[]'>;
/**
 * Reference to a field of type 'PermissionAssignmentEffect'
 */
export type EnumPermissionAssignmentEffectFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionAssignmentEffect'>;
/**
 * Reference to a field of type 'PermissionAssignmentEffect[]'
 */
export type ListEnumPermissionAssignmentEffectFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionAssignmentEffect[]'>;
/**
 * Reference to a field of type 'PermissionAuditAction'
 */
export type EnumPermissionAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionAuditAction'>;
/**
 * Reference to a field of type 'PermissionAuditAction[]'
 */
export type ListEnumPermissionAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionAuditAction[]'>;
/**
 * Reference to a field of type 'PermissionAuditActorType'
 */
export type EnumPermissionAuditActorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionAuditActorType'>;
/**
 * Reference to a field of type 'PermissionAuditActorType[]'
 */
export type ListEnumPermissionAuditActorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionAuditActorType[]'>;
/**
 * Reference to a field of type 'PermissionMutationReasonCode'
 */
export type EnumPermissionMutationReasonCodeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionMutationReasonCode'>;
/**
 * Reference to a field of type 'PermissionMutationReasonCode[]'
 */
export type ListEnumPermissionMutationReasonCodeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PermissionMutationReasonCode[]'>;
/**
 * Reference to a field of type 'PlatformUserStatus'
 */
export type EnumPlatformUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlatformUserStatus'>;
/**
 * Reference to a field of type 'PlatformUserStatus[]'
 */
export type ListEnumPlatformUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlatformUserStatus[]'>;
/**
 * Reference to a field of type 'PlatformUserStatusReasonCode'
 */
export type EnumPlatformUserStatusReasonCodeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlatformUserStatusReasonCode'>;
/**
 * Reference to a field of type 'PlatformUserStatusReasonCode[]'
 */
export type ListEnumPlatformUserStatusReasonCodeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlatformUserStatusReasonCode[]'>;
/**
 * Reference to a field of type 'AuthenticationProvider'
 */
export type EnumAuthenticationProviderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationProvider'>;
/**
 * Reference to a field of type 'AuthenticationProvider[]'
 */
export type ListEnumAuthenticationProviderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationProvider[]'>;
/**
 * Reference to a field of type 'BrowserSessionStatus'
 */
export type EnumBrowserSessionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BrowserSessionStatus'>;
/**
 * Reference to a field of type 'BrowserSessionStatus[]'
 */
export type ListEnumBrowserSessionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BrowserSessionStatus[]'>;
/**
 * Reference to a field of type 'BrowserSessionRevocationReason'
 */
export type EnumBrowserSessionRevocationReasonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BrowserSessionRevocationReason'>;
/**
 * Reference to a field of type 'BrowserSessionRevocationReason[]'
 */
export type ListEnumBrowserSessionRevocationReasonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BrowserSessionRevocationReason[]'>;
/**
 * Reference to a field of type 'OAuthTransactionPurpose'
 */
export type EnumOAuthTransactionPurposeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthTransactionPurpose'>;
/**
 * Reference to a field of type 'OAuthTransactionPurpose[]'
 */
export type ListEnumOAuthTransactionPurposeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthTransactionPurpose[]'>;
/**
 * Reference to a field of type 'OAuthTransactionState'
 */
export type EnumOAuthTransactionStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthTransactionState'>;
/**
 * Reference to a field of type 'OAuthTransactionState[]'
 */
export type ListEnumOAuthTransactionStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthTransactionState[]'>;
/**
 * Reference to a field of type 'OAuthPkceMode'
 */
export type EnumOAuthPkceModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthPkceMode'>;
/**
 * Reference to a field of type 'OAuthPkceMode[]'
 */
export type ListEnumOAuthPkceModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthPkceMode[]'>;
/**
 * Reference to a field of type 'Bytes'
 */
export type BytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes'>;
/**
 * Reference to a field of type 'Bytes[]'
 */
export type ListBytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes[]'>;
/**
 * Reference to a field of type 'OAuthTransactionFailureReason'
 */
export type EnumOAuthTransactionFailureReasonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthTransactionFailureReason'>;
/**
 * Reference to a field of type 'OAuthTransactionFailureReason[]'
 */
export type ListEnumOAuthTransactionFailureReasonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthTransactionFailureReason[]'>;
/**
 * Reference to a field of type 'OAuthCredentialRevocationReason'
 */
export type EnumOAuthCredentialRevocationReasonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthCredentialRevocationReason'>;
/**
 * Reference to a field of type 'OAuthCredentialRevocationReason[]'
 */
export type ListEnumOAuthCredentialRevocationReasonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OAuthCredentialRevocationReason[]'>;
/**
 * Reference to a field of type 'DiscordGuildMembershipStatus'
 */
export type EnumDiscordGuildMembershipStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiscordGuildMembershipStatus'>;
/**
 * Reference to a field of type 'DiscordGuildMembershipStatus[]'
 */
export type ListEnumDiscordGuildMembershipStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiscordGuildMembershipStatus[]'>;
/**
 * Reference to a field of type 'DiscordGuildMembershipSource'
 */
export type EnumDiscordGuildMembershipSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiscordGuildMembershipSource'>;
/**
 * Reference to a field of type 'DiscordGuildMembershipSource[]'
 */
export type ListEnumDiscordGuildMembershipSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DiscordGuildMembershipSource[]'>;
/**
 * Reference to a field of type 'AuthenticationAuditAction'
 */
export type EnumAuthenticationAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationAuditAction'>;
/**
 * Reference to a field of type 'AuthenticationAuditAction[]'
 */
export type ListEnumAuthenticationAuditActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationAuditAction[]'>;
/**
 * Reference to a field of type 'AuthenticationAuditOutcome'
 */
export type EnumAuthenticationAuditOutcomeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationAuditOutcome'>;
/**
 * Reference to a field of type 'AuthenticationAuditOutcome[]'
 */
export type ListEnumAuthenticationAuditOutcomeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationAuditOutcome[]'>;
/**
 * Reference to a field of type 'AuthenticationAuditReasonCode'
 */
export type EnumAuthenticationAuditReasonCodeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationAuditReasonCode'>;
/**
 * Reference to a field of type 'AuthenticationAuditReasonCode[]'
 */
export type ListEnumAuthenticationAuditReasonCodeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationAuditReasonCode[]'>;
/**
 * Reference to a field of type 'AuthenticationAuditActorType'
 */
export type EnumAuthenticationAuditActorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationAuditActorType'>;
/**
 * Reference to a field of type 'AuthenticationAuditActorType[]'
 */
export type ListEnumAuthenticationAuditActorTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AuthenticationAuditActorType[]'>;
/**
 * Reference to a field of type 'BuilderRunStatus'
 */
export type EnumBuilderRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BuilderRunStatus'>;
/**
 * Reference to a field of type 'BuilderRunStatus[]'
 */
export type ListEnumBuilderRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BuilderRunStatus[]'>;
/**
 * Reference to a field of type 'BuilderRunMode'
 */
export type EnumBuilderRunModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BuilderRunMode'>;
/**
 * Reference to a field of type 'BuilderRunMode[]'
 */
export type ListEnumBuilderRunModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BuilderRunMode[]'>;
/**
 * Reference to a field of type 'BuilderItemKind'
 */
export type EnumBuilderItemKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BuilderItemKind'>;
/**
 * Reference to a field of type 'BuilderItemKind[]'
 */
export type ListEnumBuilderItemKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BuilderItemKind[]'>;
/**
 * Reference to a field of type 'BuilderItemStatus'
 */
export type EnumBuilderItemStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BuilderItemStatus'>;
/**
 * Reference to a field of type 'BuilderItemStatus[]'
 */
export type ListEnumBuilderItemStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BuilderItemStatus[]'>;
/**
 * Reference to a field of type 'GamesServerKind'
 */
export type EnumGamesServerKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GamesServerKind'>;
/**
 * Reference to a field of type 'GamesServerKind[]'
 */
export type ListEnumGamesServerKindFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GamesServerKind[]'>;
/**
 * Reference to a field of type 'GiveawayStatus'
 */
export type EnumGiveawayStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GiveawayStatus'>;
/**
 * Reference to a field of type 'GiveawayStatus[]'
 */
export type ListEnumGiveawayStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GiveawayStatus[]'>;
/**
 * Reference to a field of type 'Float'
 */
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
/**
 * Reference to a field of type 'Float[]'
 */
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
/**
 * Reference to a field of type 'LevelUpMode'
 */
export type EnumLevelUpModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LevelUpMode'>;
/**
 * Reference to a field of type 'LevelUpMode[]'
 */
export type ListEnumLevelUpModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LevelUpMode[]'>;
/**
 * Reference to a field of type 'LevelRewardMode'
 */
export type EnumLevelRewardModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LevelRewardMode'>;
/**
 * Reference to a field of type 'LevelRewardMode[]'
 */
export type ListEnumLevelRewardModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LevelRewardMode[]'>;
/**
 * Reference to a field of type 'MessagesLookMode'
 */
export type EnumMessagesLookModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessagesLookMode'>;
/**
 * Reference to a field of type 'MessagesLookMode[]'
 */
export type ListEnumMessagesLookModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MessagesLookMode[]'>;
/**
 * Reference to a field of type 'ModerationCaseType'
 */
export type EnumModerationCaseTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ModerationCaseType'>;
/**
 * Reference to a field of type 'ModerationCaseType[]'
 */
export type ListEnumModerationCaseTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ModerationCaseType[]'>;
/**
 * Reference to a field of type 'ModerationCaseSource'
 */
export type EnumModerationCaseSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ModerationCaseSource'>;
/**
 * Reference to a field of type 'ModerationCaseSource[]'
 */
export type ListEnumModerationCaseSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ModerationCaseSource[]'>;
/**
 * Reference to a field of type 'MusicPlayerState'
 */
export type EnumMusicPlayerStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MusicPlayerState'>;
/**
 * Reference to a field of type 'MusicPlayerState[]'
 */
export type ListEnumMusicPlayerStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MusicPlayerState[]'>;
/**
 * Reference to a field of type 'MusicLoopMode'
 */
export type EnumMusicLoopModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MusicLoopMode'>;
/**
 * Reference to a field of type 'MusicLoopMode[]'
 */
export type ListEnumMusicLoopModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MusicLoopMode[]'>;
/**
 * Reference to a field of type 'PollResultsVisibility'
 */
export type EnumPollResultsVisibilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PollResultsVisibility'>;
/**
 * Reference to a field of type 'PollResultsVisibility[]'
 */
export type ListEnumPollResultsVisibilityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PollResultsVisibility[]'>;
/**
 * Reference to a field of type 'PollStatus'
 */
export type EnumPollStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PollStatus'>;
/**
 * Reference to a field of type 'PollStatus[]'
 */
export type ListEnumPollStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PollStatus[]'>;
/**
 * Reference to a field of type 'ScheduledMessageType'
 */
export type EnumScheduledMessageTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScheduledMessageType'>;
/**
 * Reference to a field of type 'ScheduledMessageType[]'
 */
export type ListEnumScheduledMessageTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ScheduledMessageType[]'>;
/**
 * Reference to a field of type 'StaffMemberStatus'
 */
export type EnumStaffMemberStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StaffMemberStatus'>;
/**
 * Reference to a field of type 'StaffMemberStatus[]'
 */
export type ListEnumStaffMemberStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StaffMemberStatus[]'>;
/**
 * Reference to a field of type 'StaffRecordType'
 */
export type EnumStaffRecordTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StaffRecordType'>;
/**
 * Reference to a field of type 'StaffRecordType[]'
 */
export type ListEnumStaffRecordTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StaffRecordType[]'>;
/**
 * Reference to a field of type 'StaffLeaveStatus'
 */
export type EnumStaffLeaveStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StaffLeaveStatus'>;
/**
 * Reference to a field of type 'StaffLeaveStatus[]'
 */
export type ListEnumStaffLeaveStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StaffLeaveStatus[]'>;
/**
 * Reference to a field of type 'StreamsEndedBehavior'
 */
export type EnumStreamsEndedBehaviorFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StreamsEndedBehavior'>;
/**
 * Reference to a field of type 'StreamsEndedBehavior[]'
 */
export type ListEnumStreamsEndedBehaviorFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StreamsEndedBehavior[]'>;
/**
 * Reference to a field of type 'StreamsPlatform'
 */
export type EnumStreamsPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StreamsPlatform'>;
/**
 * Reference to a field of type 'StreamsPlatform[]'
 */
export type ListEnumStreamsPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StreamsPlatform[]'>;
/**
 * Reference to a field of type 'TicketMode'
 */
export type EnumTicketModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketMode'>;
/**
 * Reference to a field of type 'TicketMode[]'
 */
export type ListEnumTicketModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketMode[]'>;
/**
 * Reference to a field of type 'TicketCloseAction'
 */
export type EnumTicketCloseActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketCloseAction'>;
/**
 * Reference to a field of type 'TicketCloseAction[]'
 */
export type ListEnumTicketCloseActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketCloseAction[]'>;
/**
 * Reference to a field of type 'TicketPriority'
 */
export type EnumTicketPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketPriority'>;
/**
 * Reference to a field of type 'TicketPriority[]'
 */
export type ListEnumTicketPriorityFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketPriority[]'>;
/**
 * Reference to a field of type 'TicketPanelStyle'
 */
export type EnumTicketPanelStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketPanelStyle'>;
/**
 * Reference to a field of type 'TicketPanelStyle[]'
 */
export type ListEnumTicketPanelStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketPanelStyle[]'>;
/**
 * Reference to a field of type 'TicketStatus'
 */
export type EnumTicketStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketStatus'>;
/**
 * Reference to a field of type 'TicketStatus[]'
 */
export type ListEnumTicketStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketStatus[]'>;
/**
 * Reference to a field of type 'TicketMessageSource'
 */
export type EnumTicketMessageSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketMessageSource'>;
/**
 * Reference to a field of type 'TicketMessageSource[]'
 */
export type ListEnumTicketMessageSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TicketMessageSource[]'>;
/**
 * Reference to a field of type 'VerificationMode'
 */
export type EnumVerificationModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationMode'>;
/**
 * Reference to a field of type 'VerificationMode[]'
 */
export type ListEnumVerificationModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationMode[]'>;
/**
 * Reference to a field of type 'VerificationAgeAction'
 */
export type EnumVerificationAgeActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationAgeAction'>;
/**
 * Reference to a field of type 'VerificationAgeAction[]'
 */
export type ListEnumVerificationAgeActionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationAgeAction[]'>;
/**
 * Reference to a field of type 'VerificationAttemptResult'
 */
export type EnumVerificationAttemptResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationAttemptResult'>;
/**
 * Reference to a field of type 'VerificationAttemptResult[]'
 */
export type ListEnumVerificationAttemptResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationAttemptResult[]'>;
/**
 * Reference to a field of type 'VerificationAttemptSource'
 */
export type EnumVerificationAttemptSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationAttemptSource'>;
/**
 * Reference to a field of type 'VerificationAttemptSource[]'
 */
export type ListEnumVerificationAttemptSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'VerificationAttemptSource[]'>;
/**
 * Batch Payload for updateMany & deleteMany & createMany
 */
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
/**
 * Options common to all variants of `PrismaClientOptions`, regardless of whether you connect to your database through a driver adapter or through Prisma Accelerate.
 */
export interface PrismaClientBaseOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: GlobalOmitConfig;
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[];
    /**
     * Optional maximum size for the query plan cache. If not provided, a default size will be used.
     * A value of `0` can be used to disable the cache entirely. A higher cache size can improve
     * performance for applications that execute a large number of unique queries, while a smaller
     * cache size can reduce memory usage.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   queryPlanCacheMaxSize: 100,
     * })
     * ```
     */
    queryPlanCacheMaxSize?: number;
}
/**
 * `PrismaClient` options for connecting to your database through Prisma Accelerate instead of a driver adapter.
 *
 * Learn more: https://pris.ly/d/accelerate
 */
export interface PrismaClientOptionsWithAccelerateUrl extends PrismaClientBaseOptions {
    /**
     * The Prisma Accelerate connection URL. Use this option to connect to your database through Prisma Accelerate instead of using a driver adapter to connect directly.
     *
     * Learn more: https://pris.ly/d/accelerate
     */
    accelerateUrl: string;
    adapter?: never;
}
/**
 * `PrismaClient` options for connecting to your database through a driver adapter. This is the common case in Prisma 7.
 *
 * Learn more: https://pris.ly/d/driver-adapters
 */
export interface PrismaClientOptionsWithAdapter extends PrismaClientBaseOptions {
    /**
     * A driver adapter that PrismaClient uses to connect to your database, such as the ones provided by `@prisma/adapter-pg`, `@prisma/adapter-libsql`, `@prisma/adapter-planetscale`, etc.
     *
     * A driver adapter is **required** unless you connect to your database through Prisma Accelerate (in which case use `accelerateUrl` instead).
     *
     * Learn more: https://pris.ly/d/driver-adapters
     *
     * @example
     * ```ts
     * import { PrismaPg } from '@prisma/adapter-pg'
     * import { PrismaClient } from './generated/prisma/client'
     *
     * const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
     * const prisma = new PrismaClient({ adapter })
     * ```
     */
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
}
/**
 * Options passed to the `PrismaClient` constructor.
 *
 * A driver adapter (or, alternatively, a Prisma Accelerate URL) is **required**. See {@link PrismaClientOptionsWithAdapter} and {@link PrismaClientOptionsWithAccelerateUrl} for the two variants. All other properties live in {@link PrismaClientBaseOptions} and are optional.
 *
 * Learn more about driver adapters: https://pris.ly/d/driver-adapters
 */
export type PrismaClientOptions = PrismaClientOptionsWithAccelerateUrl | PrismaClientOptionsWithAdapter;
export type GlobalOmitConfig = {
    applicationCounter?: Prisma.ApplicationCounterOmit;
    applicationForm?: Prisma.ApplicationFormOmit;
    applicationPanel?: Prisma.ApplicationPanelOmit;
    application?: Prisma.ApplicationOmit;
    applicationVote?: Prisma.ApplicationVoteOmit;
    applicationNote?: Prisma.ApplicationNoteOmit;
    guild?: Prisma.GuildOmit;
    roleMenu?: Prisma.RoleMenuOmit;
    roleMenuOption?: Prisma.RoleMenuOptionOmit;
    welcomeGoodbyeConfig?: Prisma.WelcomeGoodbyeConfigOmit;
    autoroleConfig?: Prisma.AutoroleConfigOmit;
    autoroleRule?: Prisma.AutoroleRuleOmit;
    rulesConfig?: Prisma.RulesConfigOmit;
    discordRoleAuditEvent?: Prisma.DiscordRoleAuditEventOmit;
    communityCounter?: Prisma.CommunityCounterOmit;
    serverLogConfig?: Prisma.ServerLogConfigOmit;
    embedTemplate?: Prisma.EmbedTemplateOmit;
    customCommand?: Prisma.CustomCommandOmit;
    suggestion?: Prisma.SuggestionOmit;
    starboardConfig?: Prisma.StarboardConfigOmit;
    starboardEntry?: Prisma.StarboardEntryOmit;
    permissionPrincipal?: Prisma.PermissionPrincipalOmit;
    permissionDefinition?: Prisma.PermissionDefinitionOmit;
    permissionAssignment?: Prisma.PermissionAssignmentOmit;
    permissionAuditEvent?: Prisma.PermissionAuditEventOmit;
    permissionCatalogState?: Prisma.PermissionCatalogStateOmit;
    platformUser?: Prisma.PlatformUserOmit;
    externalIdentity?: Prisma.ExternalIdentityOmit;
    browserSession?: Prisma.BrowserSessionOmit;
    oAuthTransaction?: Prisma.OAuthTransactionOmit;
    oAuthCredential?: Prisma.OAuthCredentialOmit;
    discordGuildMembership?: Prisma.DiscordGuildMembershipOmit;
    discordGuildMembershipRole?: Prisma.DiscordGuildMembershipRoleOmit;
    authenticationAuditEvent?: Prisma.AuthenticationAuditEventOmit;
    birthdaySettings?: Prisma.BirthdaySettingsOmit;
    birthday?: Prisma.BirthdayOmit;
    builderDraft?: Prisma.BuilderDraftOmit;
    builderRun?: Prisma.BuilderRunOmit;
    builderRunItem?: Prisma.BuilderRunItemOmit;
    fivemSettings?: Prisma.FivemSettingsOmit;
    fivemStatusSnapshot?: Prisma.FivemStatusSnapshotOmit;
    gamesSettings?: Prisma.GamesSettingsOmit;
    gamesServer?: Prisma.GamesServerOmit;
    gamesStatusSnapshot?: Prisma.GamesStatusSnapshotOmit;
    giveawayCounter?: Prisma.GiveawayCounterOmit;
    giveaway?: Prisma.GiveawayOmit;
    giveawayEntry?: Prisma.GiveawayEntryOmit;
    knowledgeSettings?: Prisma.KnowledgeSettingsOmit;
    knowledgeCategory?: Prisma.KnowledgeCategoryOmit;
    knowledgeArticle?: Prisma.KnowledgeArticleOmit;
    levelSettings?: Prisma.LevelSettingsOmit;
    levelMember?: Prisma.LevelMemberOmit;
    messagesLook?: Prisma.MessagesLookOmit;
    messagesTemplate?: Prisma.MessagesTemplateOmit;
    moderationSettings?: Prisma.ModerationSettingsOmit;
    moderationCase?: Prisma.ModerationCaseOmit;
    musicSettings?: Prisma.MusicSettingsOmit;
    musicTrack?: Prisma.MusicTrackOmit;
    musicPlaylist?: Prisma.MusicPlaylistOmit;
    musicPlaylistTrack?: Prisma.MusicPlaylistTrackOmit;
    musicStation?: Prisma.MusicStationOmit;
    musicSession?: Prisma.MusicSessionOmit;
    pollCounter?: Prisma.PollCounterOmit;
    poll?: Prisma.PollOmit;
    pollVote?: Prisma.PollVoteOmit;
    scheduledMessage?: Prisma.ScheduledMessageOmit;
    scheduledMessageRun?: Prisma.ScheduledMessageRunOmit;
    staffSettings?: Prisma.StaffSettingsOmit;
    staffRank?: Prisma.StaffRankOmit;
    staffMember?: Prisma.StaffMemberOmit;
    staffRecord?: Prisma.StaffRecordOmit;
    staffStrike?: Prisma.StaffStrikeOmit;
    staffLeave?: Prisma.StaffLeaveOmit;
    staffShift?: Prisma.StaffShiftOmit;
    streamsSettings?: Prisma.StreamsSettingsOmit;
    streamsSubscription?: Prisma.StreamsSubscriptionOmit;
    ticketSettings?: Prisma.TicketSettingsOmit;
    ticketCategory?: Prisma.TicketCategoryOmit;
    ticketPanel?: Prisma.TicketPanelOmit;
    ticket?: Prisma.TicketOmit;
    ticketMessage?: Prisma.TicketMessageOmit;
    ticketEvent?: Prisma.TicketEventOmit;
    verificationSettings?: Prisma.VerificationSettingsOmit;
    verificationAttempt?: Prisma.VerificationAttemptOmit;
    verificationPendingMember?: Prisma.VerificationPendingMemberOmit;
    voiceSettings?: Prisma.VoiceSettingsOmit;
    voiceHub?: Prisma.VoiceHubOmit;
    voiceRoom?: Prisma.VoiceRoomOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
/**
 * `PrismaClient` proxy available in interactive transactions.
 */
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
//# sourceMappingURL=prismaNamespace.d.ts.map
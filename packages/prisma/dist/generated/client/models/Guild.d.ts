import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model Guild
 *
 */
export type GuildModel = runtime.Types.Result.DefaultSelection<Prisma.$GuildPayload>;
export type AggregateGuild = {
    _count: GuildCountAggregateOutputType | null;
    _min: GuildMinAggregateOutputType | null;
    _max: GuildMaxAggregateOutputType | null;
};
export type GuildMinAggregateOutputType = {
    id: string | null;
    discordGuildId: string | null;
    enabled: boolean | null;
    disabledAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type GuildMaxAggregateOutputType = {
    id: string | null;
    discordGuildId: string | null;
    enabled: boolean | null;
    disabledAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type GuildCountAggregateOutputType = {
    id: number;
    discordGuildId: number;
    metadata: number;
    enabled: number;
    disabledAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type GuildMinAggregateInputType = {
    id?: true;
    discordGuildId?: true;
    enabled?: true;
    disabledAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type GuildMaxAggregateInputType = {
    id?: true;
    discordGuildId?: true;
    enabled?: true;
    disabledAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type GuildCountAggregateInputType = {
    id?: true;
    discordGuildId?: true;
    metadata?: true;
    enabled?: true;
    disabledAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type GuildAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Guild to aggregate.
     */
    where?: Prisma.GuildWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Guilds to fetch.
     */
    orderBy?: Prisma.GuildOrderByWithRelationInput | Prisma.GuildOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.GuildWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Guilds from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Guilds.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Guilds
    **/
    _count?: true | GuildCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: GuildMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: GuildMaxAggregateInputType;
};
export type GetGuildAggregateType<T extends GuildAggregateArgs> = {
    [P in keyof T & keyof AggregateGuild]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGuild[P]> : Prisma.GetScalarType<T[P], AggregateGuild[P]>;
};
export type GuildGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GuildWhereInput;
    orderBy?: Prisma.GuildOrderByWithAggregationInput | Prisma.GuildOrderByWithAggregationInput[];
    by: Prisma.GuildScalarFieldEnum[] | Prisma.GuildScalarFieldEnum;
    having?: Prisma.GuildScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GuildCountAggregateInputType | true;
    _min?: GuildMinAggregateInputType;
    _max?: GuildMaxAggregateInputType;
};
export type GuildGroupByOutputType = {
    id: string;
    discordGuildId: string;
    metadata: runtime.JsonValue;
    enabled: boolean;
    disabledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: GuildCountAggregateOutputType | null;
    _min: GuildMinAggregateOutputType | null;
    _max: GuildMaxAggregateOutputType | null;
};
export type GetGuildGroupByPayload<T extends GuildGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GuildGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GuildGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GuildGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GuildGroupByOutputType[P]>;
}>>;
export type GuildWhereInput = {
    AND?: Prisma.GuildWhereInput | Prisma.GuildWhereInput[];
    OR?: Prisma.GuildWhereInput[];
    NOT?: Prisma.GuildWhereInput | Prisma.GuildWhereInput[];
    id?: Prisma.UuidFilter<"Guild"> | string;
    discordGuildId?: Prisma.StringFilter<"Guild"> | string;
    metadata?: Prisma.JsonFilter<"Guild">;
    enabled?: Prisma.BoolFilter<"Guild"> | boolean;
    disabledAt?: Prisma.DateTimeNullableFilter<"Guild"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Guild"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Guild"> | Date | string;
    principals?: Prisma.PermissionPrincipalListRelationFilter;
    assignments?: Prisma.PermissionAssignmentListRelationFilter;
    auditScopeEvents?: Prisma.PermissionAuditEventListRelationFilter;
    authMemberships?: Prisma.DiscordGuildMembershipListRelationFilter;
    roleMenus?: Prisma.RoleMenuListRelationFilter;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigListRelationFilter;
    autoroleConfigs?: Prisma.AutoroleConfigListRelationFilter;
    autoroleRules?: Prisma.AutoroleRuleListRelationFilter;
    rulesConfigs?: Prisma.RulesConfigListRelationFilter;
    counters?: Prisma.CommunityCounterListRelationFilter;
    logConfigs?: Prisma.ServerLogConfigListRelationFilter;
    embedTemplates?: Prisma.EmbedTemplateListRelationFilter;
    customCommands?: Prisma.CustomCommandListRelationFilter;
    suggestions?: Prisma.SuggestionListRelationFilter;
    starboards?: Prisma.StarboardConfigListRelationFilter;
    starboardEntries?: Prisma.StarboardEntryListRelationFilter;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventListRelationFilter;
    ticketSettings?: Prisma.XOR<Prisma.TicketSettingsNullableScalarRelationFilter, Prisma.TicketSettingsWhereInput> | null;
    ticketCategories?: Prisma.TicketCategoryListRelationFilter;
    ticketPanels?: Prisma.TicketPanelListRelationFilter;
    tickets?: Prisma.TicketListRelationFilter;
};
export type GuildOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    discordGuildId?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    principals?: Prisma.PermissionPrincipalOrderByRelationAggregateInput;
    assignments?: Prisma.PermissionAssignmentOrderByRelationAggregateInput;
    auditScopeEvents?: Prisma.PermissionAuditEventOrderByRelationAggregateInput;
    authMemberships?: Prisma.DiscordGuildMembershipOrderByRelationAggregateInput;
    roleMenus?: Prisma.RoleMenuOrderByRelationAggregateInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigOrderByRelationAggregateInput;
    autoroleConfigs?: Prisma.AutoroleConfigOrderByRelationAggregateInput;
    autoroleRules?: Prisma.AutoroleRuleOrderByRelationAggregateInput;
    rulesConfigs?: Prisma.RulesConfigOrderByRelationAggregateInput;
    counters?: Prisma.CommunityCounterOrderByRelationAggregateInput;
    logConfigs?: Prisma.ServerLogConfigOrderByRelationAggregateInput;
    embedTemplates?: Prisma.EmbedTemplateOrderByRelationAggregateInput;
    customCommands?: Prisma.CustomCommandOrderByRelationAggregateInput;
    suggestions?: Prisma.SuggestionOrderByRelationAggregateInput;
    starboards?: Prisma.StarboardConfigOrderByRelationAggregateInput;
    starboardEntries?: Prisma.StarboardEntryOrderByRelationAggregateInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventOrderByRelationAggregateInput;
    ticketSettings?: Prisma.TicketSettingsOrderByWithRelationInput;
    ticketCategories?: Prisma.TicketCategoryOrderByRelationAggregateInput;
    ticketPanels?: Prisma.TicketPanelOrderByRelationAggregateInput;
    tickets?: Prisma.TicketOrderByRelationAggregateInput;
};
export type GuildWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    discordGuildId?: string;
    AND?: Prisma.GuildWhereInput | Prisma.GuildWhereInput[];
    OR?: Prisma.GuildWhereInput[];
    NOT?: Prisma.GuildWhereInput | Prisma.GuildWhereInput[];
    metadata?: Prisma.JsonFilter<"Guild">;
    enabled?: Prisma.BoolFilter<"Guild"> | boolean;
    disabledAt?: Prisma.DateTimeNullableFilter<"Guild"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Guild"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Guild"> | Date | string;
    principals?: Prisma.PermissionPrincipalListRelationFilter;
    assignments?: Prisma.PermissionAssignmentListRelationFilter;
    auditScopeEvents?: Prisma.PermissionAuditEventListRelationFilter;
    authMemberships?: Prisma.DiscordGuildMembershipListRelationFilter;
    roleMenus?: Prisma.RoleMenuListRelationFilter;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigListRelationFilter;
    autoroleConfigs?: Prisma.AutoroleConfigListRelationFilter;
    autoroleRules?: Prisma.AutoroleRuleListRelationFilter;
    rulesConfigs?: Prisma.RulesConfigListRelationFilter;
    counters?: Prisma.CommunityCounterListRelationFilter;
    logConfigs?: Prisma.ServerLogConfigListRelationFilter;
    embedTemplates?: Prisma.EmbedTemplateListRelationFilter;
    customCommands?: Prisma.CustomCommandListRelationFilter;
    suggestions?: Prisma.SuggestionListRelationFilter;
    starboards?: Prisma.StarboardConfigListRelationFilter;
    starboardEntries?: Prisma.StarboardEntryListRelationFilter;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventListRelationFilter;
    ticketSettings?: Prisma.XOR<Prisma.TicketSettingsNullableScalarRelationFilter, Prisma.TicketSettingsWhereInput> | null;
    ticketCategories?: Prisma.TicketCategoryListRelationFilter;
    ticketPanels?: Prisma.TicketPanelListRelationFilter;
    tickets?: Prisma.TicketListRelationFilter;
}, "id" | "discordGuildId">;
export type GuildOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    discordGuildId?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.GuildCountOrderByAggregateInput;
    _max?: Prisma.GuildMaxOrderByAggregateInput;
    _min?: Prisma.GuildMinOrderByAggregateInput;
};
export type GuildScalarWhereWithAggregatesInput = {
    AND?: Prisma.GuildScalarWhereWithAggregatesInput | Prisma.GuildScalarWhereWithAggregatesInput[];
    OR?: Prisma.GuildScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GuildScalarWhereWithAggregatesInput | Prisma.GuildScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Guild"> | string;
    discordGuildId?: Prisma.StringWithAggregatesFilter<"Guild"> | string;
    metadata?: Prisma.JsonWithAggregatesFilter<"Guild">;
    enabled?: Prisma.BoolWithAggregatesFilter<"Guild"> | boolean;
    disabledAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Guild"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Guild"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Guild"> | Date | string;
};
export type GuildCreateInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateManyInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GuildUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GuildUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GuildCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    discordGuildId?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GuildMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    discordGuildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GuildMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    discordGuildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GuildScalarRelationFilter = {
    is?: Prisma.GuildWhereInput;
    isNot?: Prisma.GuildWhereInput;
};
export type GuildNullableScalarRelationFilter = {
    is?: Prisma.GuildWhereInput | null;
    isNot?: Prisma.GuildWhereInput | null;
};
export type GuildCreateNestedOneWithoutRoleMenusInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutRoleMenusInput, Prisma.GuildUncheckedCreateWithoutRoleMenusInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutRoleMenusInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutRoleMenusNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutRoleMenusInput, Prisma.GuildUncheckedCreateWithoutRoleMenusInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutRoleMenusInput;
    upsert?: Prisma.GuildUpsertWithoutRoleMenusInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutRoleMenusInput, Prisma.GuildUpdateWithoutRoleMenusInput>, Prisma.GuildUncheckedUpdateWithoutRoleMenusInput>;
};
export type GuildCreateNestedOneWithoutWelcomeGoodbyeInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutWelcomeGoodbyeInput, Prisma.GuildUncheckedCreateWithoutWelcomeGoodbyeInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutWelcomeGoodbyeInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutWelcomeGoodbyeNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutWelcomeGoodbyeInput, Prisma.GuildUncheckedCreateWithoutWelcomeGoodbyeInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutWelcomeGoodbyeInput;
    upsert?: Prisma.GuildUpsertWithoutWelcomeGoodbyeInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutWelcomeGoodbyeInput, Prisma.GuildUpdateWithoutWelcomeGoodbyeInput>, Prisma.GuildUncheckedUpdateWithoutWelcomeGoodbyeInput>;
};
export type GuildCreateNestedOneWithoutAutoroleConfigsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAutoroleConfigsInput, Prisma.GuildUncheckedCreateWithoutAutoroleConfigsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAutoroleConfigsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutAutoroleConfigsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAutoroleConfigsInput, Prisma.GuildUncheckedCreateWithoutAutoroleConfigsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAutoroleConfigsInput;
    upsert?: Prisma.GuildUpsertWithoutAutoroleConfigsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutAutoroleConfigsInput, Prisma.GuildUpdateWithoutAutoroleConfigsInput>, Prisma.GuildUncheckedUpdateWithoutAutoroleConfigsInput>;
};
export type GuildCreateNestedOneWithoutAutoroleRulesInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAutoroleRulesInput, Prisma.GuildUncheckedCreateWithoutAutoroleRulesInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAutoroleRulesInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutAutoroleRulesNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAutoroleRulesInput, Prisma.GuildUncheckedCreateWithoutAutoroleRulesInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAutoroleRulesInput;
    upsert?: Prisma.GuildUpsertWithoutAutoroleRulesInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutAutoroleRulesInput, Prisma.GuildUpdateWithoutAutoroleRulesInput>, Prisma.GuildUncheckedUpdateWithoutAutoroleRulesInput>;
};
export type GuildCreateNestedOneWithoutRulesConfigsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutRulesConfigsInput, Prisma.GuildUncheckedCreateWithoutRulesConfigsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutRulesConfigsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutRulesConfigsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutRulesConfigsInput, Prisma.GuildUncheckedCreateWithoutRulesConfigsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutRulesConfigsInput;
    upsert?: Prisma.GuildUpsertWithoutRulesConfigsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutRulesConfigsInput, Prisma.GuildUpdateWithoutRulesConfigsInput>, Prisma.GuildUncheckedUpdateWithoutRulesConfigsInput>;
};
export type GuildCreateNestedOneWithoutRoleAuditEventsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutRoleAuditEventsInput, Prisma.GuildUncheckedCreateWithoutRoleAuditEventsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutRoleAuditEventsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutRoleAuditEventsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutRoleAuditEventsInput, Prisma.GuildUncheckedCreateWithoutRoleAuditEventsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutRoleAuditEventsInput;
    upsert?: Prisma.GuildUpsertWithoutRoleAuditEventsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutRoleAuditEventsInput, Prisma.GuildUpdateWithoutRoleAuditEventsInput>, Prisma.GuildUncheckedUpdateWithoutRoleAuditEventsInput>;
};
export type GuildCreateNestedOneWithoutCountersInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutCountersInput, Prisma.GuildUncheckedCreateWithoutCountersInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutCountersInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutCountersNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutCountersInput, Prisma.GuildUncheckedCreateWithoutCountersInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutCountersInput;
    upsert?: Prisma.GuildUpsertWithoutCountersInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutCountersInput, Prisma.GuildUpdateWithoutCountersInput>, Prisma.GuildUncheckedUpdateWithoutCountersInput>;
};
export type GuildCreateNestedOneWithoutLogConfigsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutLogConfigsInput, Prisma.GuildUncheckedCreateWithoutLogConfigsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutLogConfigsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutLogConfigsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutLogConfigsInput, Prisma.GuildUncheckedCreateWithoutLogConfigsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutLogConfigsInput;
    upsert?: Prisma.GuildUpsertWithoutLogConfigsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutLogConfigsInput, Prisma.GuildUpdateWithoutLogConfigsInput>, Prisma.GuildUncheckedUpdateWithoutLogConfigsInput>;
};
export type GuildCreateNestedOneWithoutEmbedTemplatesInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutEmbedTemplatesInput, Prisma.GuildUncheckedCreateWithoutEmbedTemplatesInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutEmbedTemplatesInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutEmbedTemplatesNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutEmbedTemplatesInput, Prisma.GuildUncheckedCreateWithoutEmbedTemplatesInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutEmbedTemplatesInput;
    upsert?: Prisma.GuildUpsertWithoutEmbedTemplatesInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutEmbedTemplatesInput, Prisma.GuildUpdateWithoutEmbedTemplatesInput>, Prisma.GuildUncheckedUpdateWithoutEmbedTemplatesInput>;
};
export type GuildCreateNestedOneWithoutCustomCommandsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutCustomCommandsInput, Prisma.GuildUncheckedCreateWithoutCustomCommandsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutCustomCommandsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutCustomCommandsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutCustomCommandsInput, Prisma.GuildUncheckedCreateWithoutCustomCommandsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutCustomCommandsInput;
    upsert?: Prisma.GuildUpsertWithoutCustomCommandsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutCustomCommandsInput, Prisma.GuildUpdateWithoutCustomCommandsInput>, Prisma.GuildUncheckedUpdateWithoutCustomCommandsInput>;
};
export type GuildCreateNestedOneWithoutSuggestionsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutSuggestionsInput, Prisma.GuildUncheckedCreateWithoutSuggestionsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutSuggestionsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutSuggestionsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutSuggestionsInput, Prisma.GuildUncheckedCreateWithoutSuggestionsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutSuggestionsInput;
    upsert?: Prisma.GuildUpsertWithoutSuggestionsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutSuggestionsInput, Prisma.GuildUpdateWithoutSuggestionsInput>, Prisma.GuildUncheckedUpdateWithoutSuggestionsInput>;
};
export type GuildCreateNestedOneWithoutStarboardsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutStarboardsInput, Prisma.GuildUncheckedCreateWithoutStarboardsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutStarboardsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutStarboardsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutStarboardsInput, Prisma.GuildUncheckedCreateWithoutStarboardsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutStarboardsInput;
    upsert?: Prisma.GuildUpsertWithoutStarboardsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutStarboardsInput, Prisma.GuildUpdateWithoutStarboardsInput>, Prisma.GuildUncheckedUpdateWithoutStarboardsInput>;
};
export type GuildCreateNestedOneWithoutStarboardEntriesInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutStarboardEntriesInput, Prisma.GuildUncheckedCreateWithoutStarboardEntriesInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutStarboardEntriesInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutStarboardEntriesNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutStarboardEntriesInput, Prisma.GuildUncheckedCreateWithoutStarboardEntriesInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutStarboardEntriesInput;
    upsert?: Prisma.GuildUpsertWithoutStarboardEntriesInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutStarboardEntriesInput, Prisma.GuildUpdateWithoutStarboardEntriesInput>, Prisma.GuildUncheckedUpdateWithoutStarboardEntriesInput>;
};
export type GuildCreateNestedOneWithoutPrincipalsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutPrincipalsInput, Prisma.GuildUncheckedCreateWithoutPrincipalsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutPrincipalsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutPrincipalsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutPrincipalsInput, Prisma.GuildUncheckedCreateWithoutPrincipalsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutPrincipalsInput;
    upsert?: Prisma.GuildUpsertWithoutPrincipalsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutPrincipalsInput, Prisma.GuildUpdateWithoutPrincipalsInput>, Prisma.GuildUncheckedUpdateWithoutPrincipalsInput>;
};
export type GuildCreateNestedOneWithoutAssignmentsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAssignmentsInput, Prisma.GuildUncheckedCreateWithoutAssignmentsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAssignmentsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneWithoutAssignmentsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAssignmentsInput, Prisma.GuildUncheckedCreateWithoutAssignmentsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAssignmentsInput;
    upsert?: Prisma.GuildUpsertWithoutAssignmentsInput;
    disconnect?: Prisma.GuildWhereInput | boolean;
    delete?: Prisma.GuildWhereInput | boolean;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutAssignmentsInput, Prisma.GuildUpdateWithoutAssignmentsInput>, Prisma.GuildUncheckedUpdateWithoutAssignmentsInput>;
};
export type GuildCreateNestedOneWithoutAuditScopeEventsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAuditScopeEventsInput, Prisma.GuildUncheckedCreateWithoutAuditScopeEventsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAuditScopeEventsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneWithoutAuditScopeEventsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAuditScopeEventsInput, Prisma.GuildUncheckedCreateWithoutAuditScopeEventsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAuditScopeEventsInput;
    upsert?: Prisma.GuildUpsertWithoutAuditScopeEventsInput;
    disconnect?: Prisma.GuildWhereInput | boolean;
    delete?: Prisma.GuildWhereInput | boolean;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutAuditScopeEventsInput, Prisma.GuildUpdateWithoutAuditScopeEventsInput>, Prisma.GuildUncheckedUpdateWithoutAuditScopeEventsInput>;
};
export type GuildCreateNestedOneWithoutAuthMembershipsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAuthMembershipsInput, Prisma.GuildUncheckedCreateWithoutAuthMembershipsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAuthMembershipsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutAuthMembershipsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutAuthMembershipsInput, Prisma.GuildUncheckedCreateWithoutAuthMembershipsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutAuthMembershipsInput;
    upsert?: Prisma.GuildUpsertWithoutAuthMembershipsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutAuthMembershipsInput, Prisma.GuildUpdateWithoutAuthMembershipsInput>, Prisma.GuildUncheckedUpdateWithoutAuthMembershipsInput>;
};
export type GuildCreateNestedOneWithoutTicketSettingsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutTicketSettingsInput, Prisma.GuildUncheckedCreateWithoutTicketSettingsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutTicketSettingsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutTicketSettingsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutTicketSettingsInput, Prisma.GuildUncheckedCreateWithoutTicketSettingsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutTicketSettingsInput;
    upsert?: Prisma.GuildUpsertWithoutTicketSettingsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutTicketSettingsInput, Prisma.GuildUpdateWithoutTicketSettingsInput>, Prisma.GuildUncheckedUpdateWithoutTicketSettingsInput>;
};
export type GuildCreateNestedOneWithoutTicketCategoriesInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutTicketCategoriesInput, Prisma.GuildUncheckedCreateWithoutTicketCategoriesInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutTicketCategoriesInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutTicketCategoriesNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutTicketCategoriesInput, Prisma.GuildUncheckedCreateWithoutTicketCategoriesInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutTicketCategoriesInput;
    upsert?: Prisma.GuildUpsertWithoutTicketCategoriesInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutTicketCategoriesInput, Prisma.GuildUpdateWithoutTicketCategoriesInput>, Prisma.GuildUncheckedUpdateWithoutTicketCategoriesInput>;
};
export type GuildCreateNestedOneWithoutTicketPanelsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutTicketPanelsInput, Prisma.GuildUncheckedCreateWithoutTicketPanelsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutTicketPanelsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutTicketPanelsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutTicketPanelsInput, Prisma.GuildUncheckedCreateWithoutTicketPanelsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutTicketPanelsInput;
    upsert?: Prisma.GuildUpsertWithoutTicketPanelsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutTicketPanelsInput, Prisma.GuildUpdateWithoutTicketPanelsInput>, Prisma.GuildUncheckedUpdateWithoutTicketPanelsInput>;
};
export type GuildCreateNestedOneWithoutTicketsInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutTicketsInput, Prisma.GuildUncheckedCreateWithoutTicketsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutTicketsInput;
    connect?: Prisma.GuildWhereUniqueInput;
};
export type GuildUpdateOneRequiredWithoutTicketsNestedInput = {
    create?: Prisma.XOR<Prisma.GuildCreateWithoutTicketsInput, Prisma.GuildUncheckedCreateWithoutTicketsInput>;
    connectOrCreate?: Prisma.GuildCreateOrConnectWithoutTicketsInput;
    upsert?: Prisma.GuildUpsertWithoutTicketsInput;
    connect?: Prisma.GuildWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.GuildUpdateToOneWithWhereWithoutTicketsInput, Prisma.GuildUpdateWithoutTicketsInput>, Prisma.GuildUncheckedUpdateWithoutTicketsInput>;
};
export type GuildCreateWithoutRoleMenusInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutRoleMenusInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutRoleMenusInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutRoleMenusInput, Prisma.GuildUncheckedCreateWithoutRoleMenusInput>;
};
export type GuildUpsertWithoutRoleMenusInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutRoleMenusInput, Prisma.GuildUncheckedUpdateWithoutRoleMenusInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutRoleMenusInput, Prisma.GuildUncheckedCreateWithoutRoleMenusInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutRoleMenusInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutRoleMenusInput, Prisma.GuildUncheckedUpdateWithoutRoleMenusInput>;
};
export type GuildUpdateWithoutRoleMenusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutRoleMenusInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutWelcomeGoodbyeInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutWelcomeGoodbyeInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutWelcomeGoodbyeInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutWelcomeGoodbyeInput, Prisma.GuildUncheckedCreateWithoutWelcomeGoodbyeInput>;
};
export type GuildUpsertWithoutWelcomeGoodbyeInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutWelcomeGoodbyeInput, Prisma.GuildUncheckedUpdateWithoutWelcomeGoodbyeInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutWelcomeGoodbyeInput, Prisma.GuildUncheckedCreateWithoutWelcomeGoodbyeInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutWelcomeGoodbyeInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutWelcomeGoodbyeInput, Prisma.GuildUncheckedUpdateWithoutWelcomeGoodbyeInput>;
};
export type GuildUpdateWithoutWelcomeGoodbyeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutWelcomeGoodbyeInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutAutoroleConfigsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutAutoroleConfigsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutAutoroleConfigsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAutoroleConfigsInput, Prisma.GuildUncheckedCreateWithoutAutoroleConfigsInput>;
};
export type GuildUpsertWithoutAutoroleConfigsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutAutoroleConfigsInput, Prisma.GuildUncheckedUpdateWithoutAutoroleConfigsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAutoroleConfigsInput, Prisma.GuildUncheckedCreateWithoutAutoroleConfigsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutAutoroleConfigsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutAutoroleConfigsInput, Prisma.GuildUncheckedUpdateWithoutAutoroleConfigsInput>;
};
export type GuildUpdateWithoutAutoroleConfigsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutAutoroleConfigsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutAutoroleRulesInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutAutoroleRulesInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutAutoroleRulesInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAutoroleRulesInput, Prisma.GuildUncheckedCreateWithoutAutoroleRulesInput>;
};
export type GuildUpsertWithoutAutoroleRulesInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutAutoroleRulesInput, Prisma.GuildUncheckedUpdateWithoutAutoroleRulesInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAutoroleRulesInput, Prisma.GuildUncheckedCreateWithoutAutoroleRulesInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutAutoroleRulesInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutAutoroleRulesInput, Prisma.GuildUncheckedUpdateWithoutAutoroleRulesInput>;
};
export type GuildUpdateWithoutAutoroleRulesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutAutoroleRulesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutRulesConfigsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutRulesConfigsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutRulesConfigsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutRulesConfigsInput, Prisma.GuildUncheckedCreateWithoutRulesConfigsInput>;
};
export type GuildUpsertWithoutRulesConfigsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutRulesConfigsInput, Prisma.GuildUncheckedUpdateWithoutRulesConfigsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutRulesConfigsInput, Prisma.GuildUncheckedCreateWithoutRulesConfigsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutRulesConfigsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutRulesConfigsInput, Prisma.GuildUncheckedUpdateWithoutRulesConfigsInput>;
};
export type GuildUpdateWithoutRulesConfigsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutRulesConfigsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutRoleAuditEventsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutRoleAuditEventsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutRoleAuditEventsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutRoleAuditEventsInput, Prisma.GuildUncheckedCreateWithoutRoleAuditEventsInput>;
};
export type GuildUpsertWithoutRoleAuditEventsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutRoleAuditEventsInput, Prisma.GuildUncheckedUpdateWithoutRoleAuditEventsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutRoleAuditEventsInput, Prisma.GuildUncheckedCreateWithoutRoleAuditEventsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutRoleAuditEventsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutRoleAuditEventsInput, Prisma.GuildUncheckedUpdateWithoutRoleAuditEventsInput>;
};
export type GuildUpdateWithoutRoleAuditEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutRoleAuditEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutCountersInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutCountersInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutCountersInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutCountersInput, Prisma.GuildUncheckedCreateWithoutCountersInput>;
};
export type GuildUpsertWithoutCountersInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutCountersInput, Prisma.GuildUncheckedUpdateWithoutCountersInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutCountersInput, Prisma.GuildUncheckedCreateWithoutCountersInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutCountersInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutCountersInput, Prisma.GuildUncheckedUpdateWithoutCountersInput>;
};
export type GuildUpdateWithoutCountersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutCountersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutLogConfigsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutLogConfigsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutLogConfigsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutLogConfigsInput, Prisma.GuildUncheckedCreateWithoutLogConfigsInput>;
};
export type GuildUpsertWithoutLogConfigsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutLogConfigsInput, Prisma.GuildUncheckedUpdateWithoutLogConfigsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutLogConfigsInput, Prisma.GuildUncheckedCreateWithoutLogConfigsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutLogConfigsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutLogConfigsInput, Prisma.GuildUncheckedUpdateWithoutLogConfigsInput>;
};
export type GuildUpdateWithoutLogConfigsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutLogConfigsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutEmbedTemplatesInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutEmbedTemplatesInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutEmbedTemplatesInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutEmbedTemplatesInput, Prisma.GuildUncheckedCreateWithoutEmbedTemplatesInput>;
};
export type GuildUpsertWithoutEmbedTemplatesInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutEmbedTemplatesInput, Prisma.GuildUncheckedUpdateWithoutEmbedTemplatesInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutEmbedTemplatesInput, Prisma.GuildUncheckedCreateWithoutEmbedTemplatesInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutEmbedTemplatesInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutEmbedTemplatesInput, Prisma.GuildUncheckedUpdateWithoutEmbedTemplatesInput>;
};
export type GuildUpdateWithoutEmbedTemplatesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutEmbedTemplatesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutCustomCommandsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutCustomCommandsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutCustomCommandsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutCustomCommandsInput, Prisma.GuildUncheckedCreateWithoutCustomCommandsInput>;
};
export type GuildUpsertWithoutCustomCommandsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutCustomCommandsInput, Prisma.GuildUncheckedUpdateWithoutCustomCommandsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutCustomCommandsInput, Prisma.GuildUncheckedCreateWithoutCustomCommandsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutCustomCommandsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutCustomCommandsInput, Prisma.GuildUncheckedUpdateWithoutCustomCommandsInput>;
};
export type GuildUpdateWithoutCustomCommandsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutCustomCommandsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutSuggestionsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutSuggestionsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutSuggestionsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutSuggestionsInput, Prisma.GuildUncheckedCreateWithoutSuggestionsInput>;
};
export type GuildUpsertWithoutSuggestionsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutSuggestionsInput, Prisma.GuildUncheckedUpdateWithoutSuggestionsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutSuggestionsInput, Prisma.GuildUncheckedCreateWithoutSuggestionsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutSuggestionsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutSuggestionsInput, Prisma.GuildUncheckedUpdateWithoutSuggestionsInput>;
};
export type GuildUpdateWithoutSuggestionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutSuggestionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutStarboardsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutStarboardsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutStarboardsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutStarboardsInput, Prisma.GuildUncheckedCreateWithoutStarboardsInput>;
};
export type GuildUpsertWithoutStarboardsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutStarboardsInput, Prisma.GuildUncheckedUpdateWithoutStarboardsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutStarboardsInput, Prisma.GuildUncheckedCreateWithoutStarboardsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutStarboardsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutStarboardsInput, Prisma.GuildUncheckedUpdateWithoutStarboardsInput>;
};
export type GuildUpdateWithoutStarboardsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutStarboardsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutStarboardEntriesInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutStarboardEntriesInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutStarboardEntriesInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutStarboardEntriesInput, Prisma.GuildUncheckedCreateWithoutStarboardEntriesInput>;
};
export type GuildUpsertWithoutStarboardEntriesInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutStarboardEntriesInput, Prisma.GuildUncheckedUpdateWithoutStarboardEntriesInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutStarboardEntriesInput, Prisma.GuildUncheckedCreateWithoutStarboardEntriesInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutStarboardEntriesInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutStarboardEntriesInput, Prisma.GuildUncheckedUpdateWithoutStarboardEntriesInput>;
};
export type GuildUpdateWithoutStarboardEntriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutStarboardEntriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutPrincipalsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutPrincipalsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutPrincipalsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutPrincipalsInput, Prisma.GuildUncheckedCreateWithoutPrincipalsInput>;
};
export type GuildUpsertWithoutPrincipalsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutPrincipalsInput, Prisma.GuildUncheckedUpdateWithoutPrincipalsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutPrincipalsInput, Prisma.GuildUncheckedCreateWithoutPrincipalsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutPrincipalsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutPrincipalsInput, Prisma.GuildUncheckedUpdateWithoutPrincipalsInput>;
};
export type GuildUpdateWithoutPrincipalsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutPrincipalsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutAssignmentsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutAssignmentsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutAssignmentsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAssignmentsInput, Prisma.GuildUncheckedCreateWithoutAssignmentsInput>;
};
export type GuildUpsertWithoutAssignmentsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutAssignmentsInput, Prisma.GuildUncheckedUpdateWithoutAssignmentsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAssignmentsInput, Prisma.GuildUncheckedCreateWithoutAssignmentsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutAssignmentsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutAssignmentsInput, Prisma.GuildUncheckedUpdateWithoutAssignmentsInput>;
};
export type GuildUpdateWithoutAssignmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutAssignmentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutAuditScopeEventsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutAuditScopeEventsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutAuditScopeEventsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAuditScopeEventsInput, Prisma.GuildUncheckedCreateWithoutAuditScopeEventsInput>;
};
export type GuildUpsertWithoutAuditScopeEventsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutAuditScopeEventsInput, Prisma.GuildUncheckedUpdateWithoutAuditScopeEventsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAuditScopeEventsInput, Prisma.GuildUncheckedCreateWithoutAuditScopeEventsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutAuditScopeEventsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutAuditScopeEventsInput, Prisma.GuildUncheckedUpdateWithoutAuditScopeEventsInput>;
};
export type GuildUpdateWithoutAuditScopeEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutAuditScopeEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutAuthMembershipsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutAuthMembershipsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutAuthMembershipsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAuthMembershipsInput, Prisma.GuildUncheckedCreateWithoutAuthMembershipsInput>;
};
export type GuildUpsertWithoutAuthMembershipsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutAuthMembershipsInput, Prisma.GuildUncheckedUpdateWithoutAuthMembershipsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutAuthMembershipsInput, Prisma.GuildUncheckedCreateWithoutAuthMembershipsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutAuthMembershipsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutAuthMembershipsInput, Prisma.GuildUncheckedUpdateWithoutAuthMembershipsInput>;
};
export type GuildUpdateWithoutAuthMembershipsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutAuthMembershipsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutTicketSettingsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutTicketSettingsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutTicketSettingsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutTicketSettingsInput, Prisma.GuildUncheckedCreateWithoutTicketSettingsInput>;
};
export type GuildUpsertWithoutTicketSettingsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutTicketSettingsInput, Prisma.GuildUncheckedUpdateWithoutTicketSettingsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutTicketSettingsInput, Prisma.GuildUncheckedCreateWithoutTicketSettingsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutTicketSettingsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutTicketSettingsInput, Prisma.GuildUncheckedUpdateWithoutTicketSettingsInput>;
};
export type GuildUpdateWithoutTicketSettingsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutTicketSettingsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutTicketCategoriesInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutTicketCategoriesInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutTicketCategoriesInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutTicketCategoriesInput, Prisma.GuildUncheckedCreateWithoutTicketCategoriesInput>;
};
export type GuildUpsertWithoutTicketCategoriesInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutTicketCategoriesInput, Prisma.GuildUncheckedUpdateWithoutTicketCategoriesInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutTicketCategoriesInput, Prisma.GuildUncheckedCreateWithoutTicketCategoriesInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutTicketCategoriesInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutTicketCategoriesInput, Prisma.GuildUncheckedUpdateWithoutTicketCategoriesInput>;
};
export type GuildUpdateWithoutTicketCategoriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutTicketCategoriesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutTicketPanelsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutTicketPanelsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    tickets?: Prisma.TicketUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutTicketPanelsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutTicketPanelsInput, Prisma.GuildUncheckedCreateWithoutTicketPanelsInput>;
};
export type GuildUpsertWithoutTicketPanelsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutTicketPanelsInput, Prisma.GuildUncheckedUpdateWithoutTicketPanelsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutTicketPanelsInput, Prisma.GuildUncheckedCreateWithoutTicketPanelsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutTicketPanelsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutTicketPanelsInput, Prisma.GuildUncheckedUpdateWithoutTicketPanelsInput>;
};
export type GuildUpdateWithoutTicketPanelsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutTicketPanelsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    tickets?: Prisma.TicketUncheckedUpdateManyWithoutGuildNestedInput;
};
export type GuildCreateWithoutTicketsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelCreateNestedManyWithoutGuildInput;
};
export type GuildUncheckedCreateWithoutTicketsInput = {
    id?: string;
    discordGuildId: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: boolean;
    disabledAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedCreateNestedManyWithoutGuildInput;
    assignments?: Prisma.PermissionAssignmentUncheckedCreateNestedManyWithoutGuildInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedCreateNestedManyWithoutScopeGuildInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutGuildInput;
    roleMenus?: Prisma.RoleMenuUncheckedCreateNestedManyWithoutGuildInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedCreateNestedManyWithoutGuildInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedCreateNestedManyWithoutGuildInput;
    counters?: Prisma.CommunityCounterUncheckedCreateNestedManyWithoutGuildInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedCreateNestedManyWithoutGuildInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedCreateNestedManyWithoutGuildInput;
    customCommands?: Prisma.CustomCommandUncheckedCreateNestedManyWithoutGuildInput;
    suggestions?: Prisma.SuggestionUncheckedCreateNestedManyWithoutGuildInput;
    starboards?: Prisma.StarboardConfigUncheckedCreateNestedManyWithoutGuildInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedCreateNestedManyWithoutGuildInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedCreateNestedOneWithoutGuildInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedCreateNestedManyWithoutGuildInput;
    ticketPanels?: Prisma.TicketPanelUncheckedCreateNestedManyWithoutGuildInput;
};
export type GuildCreateOrConnectWithoutTicketsInput = {
    where: Prisma.GuildWhereUniqueInput;
    create: Prisma.XOR<Prisma.GuildCreateWithoutTicketsInput, Prisma.GuildUncheckedCreateWithoutTicketsInput>;
};
export type GuildUpsertWithoutTicketsInput = {
    update: Prisma.XOR<Prisma.GuildUpdateWithoutTicketsInput, Prisma.GuildUncheckedUpdateWithoutTicketsInput>;
    create: Prisma.XOR<Prisma.GuildCreateWithoutTicketsInput, Prisma.GuildUncheckedCreateWithoutTicketsInput>;
    where?: Prisma.GuildWhereInput;
};
export type GuildUpdateToOneWithWhereWithoutTicketsInput = {
    where?: Prisma.GuildWhereInput;
    data: Prisma.XOR<Prisma.GuildUpdateWithoutTicketsInput, Prisma.GuildUncheckedUpdateWithoutTicketsInput>;
};
export type GuildUpdateWithoutTicketsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUpdateManyWithoutGuildNestedInput;
};
export type GuildUncheckedUpdateWithoutTicketsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    discordGuildId?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    principals?: Prisma.PermissionPrincipalUncheckedUpdateManyWithoutGuildNestedInput;
    assignments?: Prisma.PermissionAssignmentUncheckedUpdateManyWithoutGuildNestedInput;
    auditScopeEvents?: Prisma.PermissionAuditEventUncheckedUpdateManyWithoutScopeGuildNestedInput;
    authMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutGuildNestedInput;
    roleMenus?: Prisma.RoleMenuUncheckedUpdateManyWithoutGuildNestedInput;
    welcomeGoodbye?: Prisma.WelcomeGoodbyeConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleConfigs?: Prisma.AutoroleConfigUncheckedUpdateManyWithoutGuildNestedInput;
    autoroleRules?: Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput;
    rulesConfigs?: Prisma.RulesConfigUncheckedUpdateManyWithoutGuildNestedInput;
    counters?: Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput;
    logConfigs?: Prisma.ServerLogConfigUncheckedUpdateManyWithoutGuildNestedInput;
    embedTemplates?: Prisma.EmbedTemplateUncheckedUpdateManyWithoutGuildNestedInput;
    customCommands?: Prisma.CustomCommandUncheckedUpdateManyWithoutGuildNestedInput;
    suggestions?: Prisma.SuggestionUncheckedUpdateManyWithoutGuildNestedInput;
    starboards?: Prisma.StarboardConfigUncheckedUpdateManyWithoutGuildNestedInput;
    starboardEntries?: Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput;
    roleAuditEvents?: Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput;
    ticketSettings?: Prisma.TicketSettingsUncheckedUpdateOneWithoutGuildNestedInput;
    ticketCategories?: Prisma.TicketCategoryUncheckedUpdateManyWithoutGuildNestedInput;
    ticketPanels?: Prisma.TicketPanelUncheckedUpdateManyWithoutGuildNestedInput;
};
/**
 * Count Type GuildCountOutputType
 */
export type GuildCountOutputType = {
    principals: number;
    assignments: number;
    auditScopeEvents: number;
    authMemberships: number;
    roleMenus: number;
    welcomeGoodbye: number;
    autoroleConfigs: number;
    autoroleRules: number;
    rulesConfigs: number;
    counters: number;
    logConfigs: number;
    embedTemplates: number;
    customCommands: number;
    suggestions: number;
    starboards: number;
    starboardEntries: number;
    roleAuditEvents: number;
    ticketCategories: number;
    ticketPanels: number;
    tickets: number;
};
export type GuildCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    principals?: boolean | GuildCountOutputTypeCountPrincipalsArgs;
    assignments?: boolean | GuildCountOutputTypeCountAssignmentsArgs;
    auditScopeEvents?: boolean | GuildCountOutputTypeCountAuditScopeEventsArgs;
    authMemberships?: boolean | GuildCountOutputTypeCountAuthMembershipsArgs;
    roleMenus?: boolean | GuildCountOutputTypeCountRoleMenusArgs;
    welcomeGoodbye?: boolean | GuildCountOutputTypeCountWelcomeGoodbyeArgs;
    autoroleConfigs?: boolean | GuildCountOutputTypeCountAutoroleConfigsArgs;
    autoroleRules?: boolean | GuildCountOutputTypeCountAutoroleRulesArgs;
    rulesConfigs?: boolean | GuildCountOutputTypeCountRulesConfigsArgs;
    counters?: boolean | GuildCountOutputTypeCountCountersArgs;
    logConfigs?: boolean | GuildCountOutputTypeCountLogConfigsArgs;
    embedTemplates?: boolean | GuildCountOutputTypeCountEmbedTemplatesArgs;
    customCommands?: boolean | GuildCountOutputTypeCountCustomCommandsArgs;
    suggestions?: boolean | GuildCountOutputTypeCountSuggestionsArgs;
    starboards?: boolean | GuildCountOutputTypeCountStarboardsArgs;
    starboardEntries?: boolean | GuildCountOutputTypeCountStarboardEntriesArgs;
    roleAuditEvents?: boolean | GuildCountOutputTypeCountRoleAuditEventsArgs;
    ticketCategories?: boolean | GuildCountOutputTypeCountTicketCategoriesArgs;
    ticketPanels?: boolean | GuildCountOutputTypeCountTicketPanelsArgs;
    tickets?: boolean | GuildCountOutputTypeCountTicketsArgs;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GuildCountOutputType
     */
    select?: Prisma.GuildCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountPrincipalsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PermissionPrincipalWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountAssignmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PermissionAssignmentWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountAuditScopeEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PermissionAuditEventWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountAuthMembershipsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DiscordGuildMembershipWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountRoleMenusArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RoleMenuWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountWelcomeGoodbyeArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WelcomeGoodbyeConfigWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountAutoroleConfigsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AutoroleConfigWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountAutoroleRulesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AutoroleRuleWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountRulesConfigsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RulesConfigWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountCountersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CommunityCounterWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountLogConfigsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ServerLogConfigWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountEmbedTemplatesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EmbedTemplateWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountCustomCommandsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CustomCommandWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountSuggestionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SuggestionWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountStarboardsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StarboardConfigWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountStarboardEntriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StarboardEntryWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountRoleAuditEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DiscordRoleAuditEventWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountTicketCategoriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TicketCategoryWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountTicketPanelsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TicketPanelWhereInput;
};
/**
 * GuildCountOutputType without action
 */
export type GuildCountOutputTypeCountTicketsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TicketWhereInput;
};
export type GuildSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    discordGuildId?: boolean;
    metadata?: boolean;
    enabled?: boolean;
    disabledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    principals?: boolean | Prisma.Guild$principalsArgs<ExtArgs>;
    assignments?: boolean | Prisma.Guild$assignmentsArgs<ExtArgs>;
    auditScopeEvents?: boolean | Prisma.Guild$auditScopeEventsArgs<ExtArgs>;
    authMemberships?: boolean | Prisma.Guild$authMembershipsArgs<ExtArgs>;
    roleMenus?: boolean | Prisma.Guild$roleMenusArgs<ExtArgs>;
    welcomeGoodbye?: boolean | Prisma.Guild$welcomeGoodbyeArgs<ExtArgs>;
    autoroleConfigs?: boolean | Prisma.Guild$autoroleConfigsArgs<ExtArgs>;
    autoroleRules?: boolean | Prisma.Guild$autoroleRulesArgs<ExtArgs>;
    rulesConfigs?: boolean | Prisma.Guild$rulesConfigsArgs<ExtArgs>;
    counters?: boolean | Prisma.Guild$countersArgs<ExtArgs>;
    logConfigs?: boolean | Prisma.Guild$logConfigsArgs<ExtArgs>;
    embedTemplates?: boolean | Prisma.Guild$embedTemplatesArgs<ExtArgs>;
    customCommands?: boolean | Prisma.Guild$customCommandsArgs<ExtArgs>;
    suggestions?: boolean | Prisma.Guild$suggestionsArgs<ExtArgs>;
    starboards?: boolean | Prisma.Guild$starboardsArgs<ExtArgs>;
    starboardEntries?: boolean | Prisma.Guild$starboardEntriesArgs<ExtArgs>;
    roleAuditEvents?: boolean | Prisma.Guild$roleAuditEventsArgs<ExtArgs>;
    ticketSettings?: boolean | Prisma.Guild$ticketSettingsArgs<ExtArgs>;
    ticketCategories?: boolean | Prisma.Guild$ticketCategoriesArgs<ExtArgs>;
    ticketPanels?: boolean | Prisma.Guild$ticketPanelsArgs<ExtArgs>;
    tickets?: boolean | Prisma.Guild$ticketsArgs<ExtArgs>;
    _count?: boolean | Prisma.GuildCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["guild"]>;
export type GuildSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    discordGuildId?: boolean;
    metadata?: boolean;
    enabled?: boolean;
    disabledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["guild"]>;
export type GuildSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    discordGuildId?: boolean;
    metadata?: boolean;
    enabled?: boolean;
    disabledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["guild"]>;
export type GuildSelectScalar = {
    id?: boolean;
    discordGuildId?: boolean;
    metadata?: boolean;
    enabled?: boolean;
    disabledAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type GuildOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "discordGuildId" | "metadata" | "enabled" | "disabledAt" | "createdAt" | "updatedAt", ExtArgs["result"]["guild"]>;
export type GuildInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    principals?: boolean | Prisma.Guild$principalsArgs<ExtArgs>;
    assignments?: boolean | Prisma.Guild$assignmentsArgs<ExtArgs>;
    auditScopeEvents?: boolean | Prisma.Guild$auditScopeEventsArgs<ExtArgs>;
    authMemberships?: boolean | Prisma.Guild$authMembershipsArgs<ExtArgs>;
    roleMenus?: boolean | Prisma.Guild$roleMenusArgs<ExtArgs>;
    welcomeGoodbye?: boolean | Prisma.Guild$welcomeGoodbyeArgs<ExtArgs>;
    autoroleConfigs?: boolean | Prisma.Guild$autoroleConfigsArgs<ExtArgs>;
    autoroleRules?: boolean | Prisma.Guild$autoroleRulesArgs<ExtArgs>;
    rulesConfigs?: boolean | Prisma.Guild$rulesConfigsArgs<ExtArgs>;
    counters?: boolean | Prisma.Guild$countersArgs<ExtArgs>;
    logConfigs?: boolean | Prisma.Guild$logConfigsArgs<ExtArgs>;
    embedTemplates?: boolean | Prisma.Guild$embedTemplatesArgs<ExtArgs>;
    customCommands?: boolean | Prisma.Guild$customCommandsArgs<ExtArgs>;
    suggestions?: boolean | Prisma.Guild$suggestionsArgs<ExtArgs>;
    starboards?: boolean | Prisma.Guild$starboardsArgs<ExtArgs>;
    starboardEntries?: boolean | Prisma.Guild$starboardEntriesArgs<ExtArgs>;
    roleAuditEvents?: boolean | Prisma.Guild$roleAuditEventsArgs<ExtArgs>;
    ticketSettings?: boolean | Prisma.Guild$ticketSettingsArgs<ExtArgs>;
    ticketCategories?: boolean | Prisma.Guild$ticketCategoriesArgs<ExtArgs>;
    ticketPanels?: boolean | Prisma.Guild$ticketPanelsArgs<ExtArgs>;
    tickets?: boolean | Prisma.Guild$ticketsArgs<ExtArgs>;
    _count?: boolean | Prisma.GuildCountOutputTypeDefaultArgs<ExtArgs>;
};
export type GuildIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type GuildIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $GuildPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Guild";
    objects: {
        principals: Prisma.$PermissionPrincipalPayload<ExtArgs>[];
        assignments: Prisma.$PermissionAssignmentPayload<ExtArgs>[];
        auditScopeEvents: Prisma.$PermissionAuditEventPayload<ExtArgs>[];
        authMemberships: Prisma.$DiscordGuildMembershipPayload<ExtArgs>[];
        roleMenus: Prisma.$RoleMenuPayload<ExtArgs>[];
        welcomeGoodbye: Prisma.$WelcomeGoodbyeConfigPayload<ExtArgs>[];
        autoroleConfigs: Prisma.$AutoroleConfigPayload<ExtArgs>[];
        autoroleRules: Prisma.$AutoroleRulePayload<ExtArgs>[];
        rulesConfigs: Prisma.$RulesConfigPayload<ExtArgs>[];
        counters: Prisma.$CommunityCounterPayload<ExtArgs>[];
        logConfigs: Prisma.$ServerLogConfigPayload<ExtArgs>[];
        embedTemplates: Prisma.$EmbedTemplatePayload<ExtArgs>[];
        customCommands: Prisma.$CustomCommandPayload<ExtArgs>[];
        suggestions: Prisma.$SuggestionPayload<ExtArgs>[];
        starboards: Prisma.$StarboardConfigPayload<ExtArgs>[];
        starboardEntries: Prisma.$StarboardEntryPayload<ExtArgs>[];
        roleAuditEvents: Prisma.$DiscordRoleAuditEventPayload<ExtArgs>[];
        ticketSettings: Prisma.$TicketSettingsPayload<ExtArgs> | null;
        ticketCategories: Prisma.$TicketCategoryPayload<ExtArgs>[];
        ticketPanels: Prisma.$TicketPanelPayload<ExtArgs>[];
        tickets: Prisma.$TicketPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        discordGuildId: string;
        metadata: runtime.JsonValue;
        enabled: boolean;
        disabledAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["guild"]>;
    composites: {};
};
export type GuildGetPayload<S extends boolean | null | undefined | GuildDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GuildPayload, S>;
export type GuildCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GuildFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GuildCountAggregateInputType | true;
};
export interface GuildDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Guild'];
        meta: {
            name: 'Guild';
        };
    };
    /**
     * Find zero or one Guild that matches the filter.
     * @param {GuildFindUniqueArgs} args - Arguments to find a Guild
     * @example
     * // Get one Guild
     * const guild = await prisma.guild.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GuildFindUniqueArgs>(args: Prisma.SelectSubset<T, GuildFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Guild that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GuildFindUniqueOrThrowArgs} args - Arguments to find a Guild
     * @example
     * // Get one Guild
     * const guild = await prisma.guild.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GuildFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GuildFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Guild that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildFindFirstArgs} args - Arguments to find a Guild
     * @example
     * // Get one Guild
     * const guild = await prisma.guild.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GuildFindFirstArgs>(args?: Prisma.SelectSubset<T, GuildFindFirstArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Guild that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildFindFirstOrThrowArgs} args - Arguments to find a Guild
     * @example
     * // Get one Guild
     * const guild = await prisma.guild.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GuildFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GuildFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Guilds that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Guilds
     * const guilds = await prisma.guild.findMany()
     *
     * // Get first 10 Guilds
     * const guilds = await prisma.guild.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const guildWithIdOnly = await prisma.guild.findMany({ select: { id: true } })
     *
     */
    findMany<T extends GuildFindManyArgs>(args?: Prisma.SelectSubset<T, GuildFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Guild.
     * @param {GuildCreateArgs} args - Arguments to create a Guild.
     * @example
     * // Create one Guild
     * const Guild = await prisma.guild.create({
     *   data: {
     *     // ... data to create a Guild
     *   }
     * })
     *
     */
    create<T extends GuildCreateArgs>(args: Prisma.SelectSubset<T, GuildCreateArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Guilds.
     * @param {GuildCreateManyArgs} args - Arguments to create many Guilds.
     * @example
     * // Create many Guilds
     * const guild = await prisma.guild.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends GuildCreateManyArgs>(args?: Prisma.SelectSubset<T, GuildCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Guilds and returns the data saved in the database.
     * @param {GuildCreateManyAndReturnArgs} args - Arguments to create many Guilds.
     * @example
     * // Create many Guilds
     * const guild = await prisma.guild.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Guilds and only return the `id`
     * const guildWithIdOnly = await prisma.guild.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends GuildCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, GuildCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Guild.
     * @param {GuildDeleteArgs} args - Arguments to delete one Guild.
     * @example
     * // Delete one Guild
     * const Guild = await prisma.guild.delete({
     *   where: {
     *     // ... filter to delete one Guild
     *   }
     * })
     *
     */
    delete<T extends GuildDeleteArgs>(args: Prisma.SelectSubset<T, GuildDeleteArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Guild.
     * @param {GuildUpdateArgs} args - Arguments to update one Guild.
     * @example
     * // Update one Guild
     * const guild = await prisma.guild.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends GuildUpdateArgs>(args: Prisma.SelectSubset<T, GuildUpdateArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Guilds.
     * @param {GuildDeleteManyArgs} args - Arguments to filter Guilds to delete.
     * @example
     * // Delete a few Guilds
     * const { count } = await prisma.guild.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends GuildDeleteManyArgs>(args?: Prisma.SelectSubset<T, GuildDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Guilds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Guilds
     * const guild = await prisma.guild.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends GuildUpdateManyArgs>(args: Prisma.SelectSubset<T, GuildUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Guilds and returns the data updated in the database.
     * @param {GuildUpdateManyAndReturnArgs} args - Arguments to update many Guilds.
     * @example
     * // Update many Guilds
     * const guild = await prisma.guild.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Guilds and only return the `id`
     * const guildWithIdOnly = await prisma.guild.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends GuildUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, GuildUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Guild.
     * @param {GuildUpsertArgs} args - Arguments to update or create a Guild.
     * @example
     * // Update or create a Guild
     * const guild = await prisma.guild.upsert({
     *   create: {
     *     // ... data to create a Guild
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Guild we want to update
     *   }
     * })
     */
    upsert<T extends GuildUpsertArgs>(args: Prisma.SelectSubset<T, GuildUpsertArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Guilds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildCountArgs} args - Arguments to filter Guilds to count.
     * @example
     * // Count the number of Guilds
     * const count = await prisma.guild.count({
     *   where: {
     *     // ... the filter for the Guilds we want to count
     *   }
     * })
    **/
    count<T extends GuildCountArgs>(args?: Prisma.Subset<T, GuildCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GuildCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Guild.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GuildAggregateArgs>(args: Prisma.Subset<T, GuildAggregateArgs>): Prisma.PrismaPromise<GetGuildAggregateType<T>>;
    /**
     * Group by Guild.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GuildGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends GuildGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GuildGroupByArgs['orderBy'];
    } : {
        orderBy?: GuildGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GuildGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGuildGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Guild model
     */
    readonly fields: GuildFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Guild.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__GuildClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    principals<T extends Prisma.Guild$principalsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$principalsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PermissionPrincipalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    assignments<T extends Prisma.Guild$assignmentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$assignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PermissionAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    auditScopeEvents<T extends Prisma.Guild$auditScopeEventsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$auditScopeEventsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PermissionAuditEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    authMemberships<T extends Prisma.Guild$authMembershipsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$authMembershipsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    roleMenus<T extends Prisma.Guild$roleMenusArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$roleMenusArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoleMenuPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    welcomeGoodbye<T extends Prisma.Guild$welcomeGoodbyeArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$welcomeGoodbyeArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WelcomeGoodbyeConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    autoroleConfigs<T extends Prisma.Guild$autoroleConfigsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$autoroleConfigsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AutoroleConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    autoroleRules<T extends Prisma.Guild$autoroleRulesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$autoroleRulesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    rulesConfigs<T extends Prisma.Guild$rulesConfigsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$rulesConfigsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RulesConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    counters<T extends Prisma.Guild$countersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$countersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    logConfigs<T extends Prisma.Guild$logConfigsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$logConfigsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ServerLogConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    embedTemplates<T extends Prisma.Guild$embedTemplatesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$embedTemplatesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmbedTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    customCommands<T extends Prisma.Guild$customCommandsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$customCommandsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CustomCommandPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    suggestions<T extends Prisma.Guild$suggestionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$suggestionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SuggestionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    starboards<T extends Prisma.Guild$starboardsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$starboardsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StarboardConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    starboardEntries<T extends Prisma.Guild$starboardEntriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$starboardEntriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    roleAuditEvents<T extends Prisma.Guild$roleAuditEventsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$roleAuditEventsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    ticketSettings<T extends Prisma.Guild$ticketSettingsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$ticketSettingsArgs<ExtArgs>>): Prisma.Prisma__TicketSettingsClient<runtime.Types.Result.GetResult<Prisma.$TicketSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    ticketCategories<T extends Prisma.Guild$ticketCategoriesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$ticketCategoriesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TicketCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    ticketPanels<T extends Prisma.Guild$ticketPanelsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$ticketPanelsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TicketPanelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    tickets<T extends Prisma.Guild$ticketsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Guild$ticketsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Guild model
 */
export interface GuildFieldRefs {
    readonly id: Prisma.FieldRef<"Guild", 'String'>;
    readonly discordGuildId: Prisma.FieldRef<"Guild", 'String'>;
    readonly metadata: Prisma.FieldRef<"Guild", 'Json'>;
    readonly enabled: Prisma.FieldRef<"Guild", 'Boolean'>;
    readonly disabledAt: Prisma.FieldRef<"Guild", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Guild", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Guild", 'DateTime'>;
}
/**
 * Guild findUnique
 */
export type GuildFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * Filter, which Guild to fetch.
     */
    where: Prisma.GuildWhereUniqueInput;
};
/**
 * Guild findUniqueOrThrow
 */
export type GuildFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * Filter, which Guild to fetch.
     */
    where: Prisma.GuildWhereUniqueInput;
};
/**
 * Guild findFirst
 */
export type GuildFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * Filter, which Guild to fetch.
     */
    where?: Prisma.GuildWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Guilds to fetch.
     */
    orderBy?: Prisma.GuildOrderByWithRelationInput | Prisma.GuildOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Guilds.
     */
    cursor?: Prisma.GuildWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Guilds from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Guilds.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Guilds.
     */
    distinct?: Prisma.GuildScalarFieldEnum | Prisma.GuildScalarFieldEnum[];
};
/**
 * Guild findFirstOrThrow
 */
export type GuildFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * Filter, which Guild to fetch.
     */
    where?: Prisma.GuildWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Guilds to fetch.
     */
    orderBy?: Prisma.GuildOrderByWithRelationInput | Prisma.GuildOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Guilds.
     */
    cursor?: Prisma.GuildWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Guilds from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Guilds.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Guilds.
     */
    distinct?: Prisma.GuildScalarFieldEnum | Prisma.GuildScalarFieldEnum[];
};
/**
 * Guild findMany
 */
export type GuildFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * Filter, which Guilds to fetch.
     */
    where?: Prisma.GuildWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Guilds to fetch.
     */
    orderBy?: Prisma.GuildOrderByWithRelationInput | Prisma.GuildOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Guilds.
     */
    cursor?: Prisma.GuildWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Guilds from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Guilds.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Guilds.
     */
    distinct?: Prisma.GuildScalarFieldEnum | Prisma.GuildScalarFieldEnum[];
};
/**
 * Guild create
 */
export type GuildCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * The data needed to create a Guild.
     */
    data: Prisma.XOR<Prisma.GuildCreateInput, Prisma.GuildUncheckedCreateInput>;
};
/**
 * Guild createMany
 */
export type GuildCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Guilds.
     */
    data: Prisma.GuildCreateManyInput | Prisma.GuildCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Guild createManyAndReturn
 */
export type GuildCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * The data used to create many Guilds.
     */
    data: Prisma.GuildCreateManyInput | Prisma.GuildCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Guild update
 */
export type GuildUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * The data needed to update a Guild.
     */
    data: Prisma.XOR<Prisma.GuildUpdateInput, Prisma.GuildUncheckedUpdateInput>;
    /**
     * Choose, which Guild to update.
     */
    where: Prisma.GuildWhereUniqueInput;
};
/**
 * Guild updateMany
 */
export type GuildUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Guilds.
     */
    data: Prisma.XOR<Prisma.GuildUpdateManyMutationInput, Prisma.GuildUncheckedUpdateManyInput>;
    /**
     * Filter which Guilds to update
     */
    where?: Prisma.GuildWhereInput;
    /**
     * Limit how many Guilds to update.
     */
    limit?: number;
};
/**
 * Guild updateManyAndReturn
 */
export type GuildUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * The data used to update Guilds.
     */
    data: Prisma.XOR<Prisma.GuildUpdateManyMutationInput, Prisma.GuildUncheckedUpdateManyInput>;
    /**
     * Filter which Guilds to update
     */
    where?: Prisma.GuildWhereInput;
    /**
     * Limit how many Guilds to update.
     */
    limit?: number;
};
/**
 * Guild upsert
 */
export type GuildUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * The filter to search for the Guild to update in case it exists.
     */
    where: Prisma.GuildWhereUniqueInput;
    /**
     * In case the Guild found by the `where` argument doesn't exist, create a new Guild with this data.
     */
    create: Prisma.XOR<Prisma.GuildCreateInput, Prisma.GuildUncheckedCreateInput>;
    /**
     * In case the Guild was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.GuildUpdateInput, Prisma.GuildUncheckedUpdateInput>;
};
/**
 * Guild delete
 */
export type GuildDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
    /**
     * Filter which Guild to delete.
     */
    where: Prisma.GuildWhereUniqueInput;
};
/**
 * Guild deleteMany
 */
export type GuildDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Guilds to delete
     */
    where?: Prisma.GuildWhereInput;
    /**
     * Limit how many Guilds to delete.
     */
    limit?: number;
};
/**
 * Guild.principals
 */
export type Guild$principalsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermissionPrincipal
     */
    select?: Prisma.PermissionPrincipalSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PermissionPrincipal
     */
    omit?: Prisma.PermissionPrincipalOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PermissionPrincipalInclude<ExtArgs> | null;
    where?: Prisma.PermissionPrincipalWhereInput;
    orderBy?: Prisma.PermissionPrincipalOrderByWithRelationInput | Prisma.PermissionPrincipalOrderByWithRelationInput[];
    cursor?: Prisma.PermissionPrincipalWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PermissionPrincipalScalarFieldEnum | Prisma.PermissionPrincipalScalarFieldEnum[];
};
/**
 * Guild.assignments
 */
export type Guild$assignmentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermissionAssignment
     */
    select?: Prisma.PermissionAssignmentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PermissionAssignment
     */
    omit?: Prisma.PermissionAssignmentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PermissionAssignmentInclude<ExtArgs> | null;
    where?: Prisma.PermissionAssignmentWhereInput;
    orderBy?: Prisma.PermissionAssignmentOrderByWithRelationInput | Prisma.PermissionAssignmentOrderByWithRelationInput[];
    cursor?: Prisma.PermissionAssignmentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PermissionAssignmentScalarFieldEnum | Prisma.PermissionAssignmentScalarFieldEnum[];
};
/**
 * Guild.auditScopeEvents
 */
export type Guild$auditScopeEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PermissionAuditEvent
     */
    select?: Prisma.PermissionAuditEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PermissionAuditEvent
     */
    omit?: Prisma.PermissionAuditEventOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PermissionAuditEventInclude<ExtArgs> | null;
    where?: Prisma.PermissionAuditEventWhereInput;
    orderBy?: Prisma.PermissionAuditEventOrderByWithRelationInput | Prisma.PermissionAuditEventOrderByWithRelationInput[];
    cursor?: Prisma.PermissionAuditEventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PermissionAuditEventScalarFieldEnum | Prisma.PermissionAuditEventScalarFieldEnum[];
};
/**
 * Guild.authMemberships
 */
export type Guild$authMembershipsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembership
     */
    select?: Prisma.DiscordGuildMembershipSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembership
     */
    omit?: Prisma.DiscordGuildMembershipOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipInclude<ExtArgs> | null;
    where?: Prisma.DiscordGuildMembershipWhereInput;
    orderBy?: Prisma.DiscordGuildMembershipOrderByWithRelationInput | Prisma.DiscordGuildMembershipOrderByWithRelationInput[];
    cursor?: Prisma.DiscordGuildMembershipWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DiscordGuildMembershipScalarFieldEnum | Prisma.DiscordGuildMembershipScalarFieldEnum[];
};
/**
 * Guild.roleMenus
 */
export type Guild$roleMenusArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenu
     */
    select?: Prisma.RoleMenuSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenu
     */
    omit?: Prisma.RoleMenuOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuInclude<ExtArgs> | null;
    where?: Prisma.RoleMenuWhereInput;
    orderBy?: Prisma.RoleMenuOrderByWithRelationInput | Prisma.RoleMenuOrderByWithRelationInput[];
    cursor?: Prisma.RoleMenuWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RoleMenuScalarFieldEnum | Prisma.RoleMenuScalarFieldEnum[];
};
/**
 * Guild.welcomeGoodbye
 */
export type Guild$welcomeGoodbyeArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WelcomeGoodbyeConfig
     */
    select?: Prisma.WelcomeGoodbyeConfigSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the WelcomeGoodbyeConfig
     */
    omit?: Prisma.WelcomeGoodbyeConfigOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.WelcomeGoodbyeConfigInclude<ExtArgs> | null;
    where?: Prisma.WelcomeGoodbyeConfigWhereInput;
    orderBy?: Prisma.WelcomeGoodbyeConfigOrderByWithRelationInput | Prisma.WelcomeGoodbyeConfigOrderByWithRelationInput[];
    cursor?: Prisma.WelcomeGoodbyeConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WelcomeGoodbyeConfigScalarFieldEnum | Prisma.WelcomeGoodbyeConfigScalarFieldEnum[];
};
/**
 * Guild.autoroleConfigs
 */
export type Guild$autoroleConfigsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleConfig
     */
    select?: Prisma.AutoroleConfigSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleConfig
     */
    omit?: Prisma.AutoroleConfigOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleConfigInclude<ExtArgs> | null;
    where?: Prisma.AutoroleConfigWhereInput;
    orderBy?: Prisma.AutoroleConfigOrderByWithRelationInput | Prisma.AutoroleConfigOrderByWithRelationInput[];
    cursor?: Prisma.AutoroleConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AutoroleConfigScalarFieldEnum | Prisma.AutoroleConfigScalarFieldEnum[];
};
/**
 * Guild.autoroleRules
 */
export type Guild$autoroleRulesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    where?: Prisma.AutoroleRuleWhereInput;
    orderBy?: Prisma.AutoroleRuleOrderByWithRelationInput | Prisma.AutoroleRuleOrderByWithRelationInput[];
    cursor?: Prisma.AutoroleRuleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AutoroleRuleScalarFieldEnum | Prisma.AutoroleRuleScalarFieldEnum[];
};
/**
 * Guild.rulesConfigs
 */
export type Guild$rulesConfigsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RulesConfig
     */
    select?: Prisma.RulesConfigSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RulesConfig
     */
    omit?: Prisma.RulesConfigOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RulesConfigInclude<ExtArgs> | null;
    where?: Prisma.RulesConfigWhereInput;
    orderBy?: Prisma.RulesConfigOrderByWithRelationInput | Prisma.RulesConfigOrderByWithRelationInput[];
    cursor?: Prisma.RulesConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RulesConfigScalarFieldEnum | Prisma.RulesConfigScalarFieldEnum[];
};
/**
 * Guild.counters
 */
export type Guild$countersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunityCounter
     */
    select?: Prisma.CommunityCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunityCounter
     */
    omit?: Prisma.CommunityCounterOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunityCounterInclude<ExtArgs> | null;
    where?: Prisma.CommunityCounterWhereInput;
    orderBy?: Prisma.CommunityCounterOrderByWithRelationInput | Prisma.CommunityCounterOrderByWithRelationInput[];
    cursor?: Prisma.CommunityCounterWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CommunityCounterScalarFieldEnum | Prisma.CommunityCounterScalarFieldEnum[];
};
/**
 * Guild.logConfigs
 */
export type Guild$logConfigsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServerLogConfig
     */
    select?: Prisma.ServerLogConfigSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ServerLogConfig
     */
    omit?: Prisma.ServerLogConfigOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ServerLogConfigInclude<ExtArgs> | null;
    where?: Prisma.ServerLogConfigWhereInput;
    orderBy?: Prisma.ServerLogConfigOrderByWithRelationInput | Prisma.ServerLogConfigOrderByWithRelationInput[];
    cursor?: Prisma.ServerLogConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ServerLogConfigScalarFieldEnum | Prisma.ServerLogConfigScalarFieldEnum[];
};
/**
 * Guild.embedTemplates
 */
export type Guild$embedTemplatesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmbedTemplate
     */
    select?: Prisma.EmbedTemplateSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the EmbedTemplate
     */
    omit?: Prisma.EmbedTemplateOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.EmbedTemplateInclude<ExtArgs> | null;
    where?: Prisma.EmbedTemplateWhereInput;
    orderBy?: Prisma.EmbedTemplateOrderByWithRelationInput | Prisma.EmbedTemplateOrderByWithRelationInput[];
    cursor?: Prisma.EmbedTemplateWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EmbedTemplateScalarFieldEnum | Prisma.EmbedTemplateScalarFieldEnum[];
};
/**
 * Guild.customCommands
 */
export type Guild$customCommandsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CustomCommand
     */
    select?: Prisma.CustomCommandSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the CustomCommand
     */
    omit?: Prisma.CustomCommandOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CustomCommandInclude<ExtArgs> | null;
    where?: Prisma.CustomCommandWhereInput;
    orderBy?: Prisma.CustomCommandOrderByWithRelationInput | Prisma.CustomCommandOrderByWithRelationInput[];
    cursor?: Prisma.CustomCommandWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CustomCommandScalarFieldEnum | Prisma.CustomCommandScalarFieldEnum[];
};
/**
 * Guild.suggestions
 */
export type Guild$suggestionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Suggestion
     */
    select?: Prisma.SuggestionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Suggestion
     */
    omit?: Prisma.SuggestionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.SuggestionInclude<ExtArgs> | null;
    where?: Prisma.SuggestionWhereInput;
    orderBy?: Prisma.SuggestionOrderByWithRelationInput | Prisma.SuggestionOrderByWithRelationInput[];
    cursor?: Prisma.SuggestionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SuggestionScalarFieldEnum | Prisma.SuggestionScalarFieldEnum[];
};
/**
 * Guild.starboards
 */
export type Guild$starboardsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarboardConfig
     */
    select?: Prisma.StarboardConfigSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StarboardConfig
     */
    omit?: Prisma.StarboardConfigOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.StarboardConfigInclude<ExtArgs> | null;
    where?: Prisma.StarboardConfigWhereInput;
    orderBy?: Prisma.StarboardConfigOrderByWithRelationInput | Prisma.StarboardConfigOrderByWithRelationInput[];
    cursor?: Prisma.StarboardConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StarboardConfigScalarFieldEnum | Prisma.StarboardConfigScalarFieldEnum[];
};
/**
 * Guild.starboardEntries
 */
export type Guild$starboardEntriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarboardEntry
     */
    select?: Prisma.StarboardEntrySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StarboardEntry
     */
    omit?: Prisma.StarboardEntryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.StarboardEntryInclude<ExtArgs> | null;
    where?: Prisma.StarboardEntryWhereInput;
    orderBy?: Prisma.StarboardEntryOrderByWithRelationInput | Prisma.StarboardEntryOrderByWithRelationInput[];
    cursor?: Prisma.StarboardEntryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.StarboardEntryScalarFieldEnum | Prisma.StarboardEntryScalarFieldEnum[];
};
/**
 * Guild.roleAuditEvents
 */
export type Guild$roleAuditEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordRoleAuditEvent
     */
    select?: Prisma.DiscordRoleAuditEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordRoleAuditEvent
     */
    omit?: Prisma.DiscordRoleAuditEventOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordRoleAuditEventInclude<ExtArgs> | null;
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    orderBy?: Prisma.DiscordRoleAuditEventOrderByWithRelationInput | Prisma.DiscordRoleAuditEventOrderByWithRelationInput[];
    cursor?: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DiscordRoleAuditEventScalarFieldEnum | Prisma.DiscordRoleAuditEventScalarFieldEnum[];
};
/**
 * Guild.ticketSettings
 */
export type Guild$ticketSettingsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketSettings
     */
    select?: Prisma.TicketSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TicketSettings
     */
    omit?: Prisma.TicketSettingsOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TicketSettingsInclude<ExtArgs> | null;
    where?: Prisma.TicketSettingsWhereInput;
};
/**
 * Guild.ticketCategories
 */
export type Guild$ticketCategoriesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketCategory
     */
    select?: Prisma.TicketCategorySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TicketCategory
     */
    omit?: Prisma.TicketCategoryOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TicketCategoryInclude<ExtArgs> | null;
    where?: Prisma.TicketCategoryWhereInput;
    orderBy?: Prisma.TicketCategoryOrderByWithRelationInput | Prisma.TicketCategoryOrderByWithRelationInput[];
    cursor?: Prisma.TicketCategoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TicketCategoryScalarFieldEnum | Prisma.TicketCategoryScalarFieldEnum[];
};
/**
 * Guild.ticketPanels
 */
export type Guild$ticketPanelsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TicketPanel
     */
    select?: Prisma.TicketPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the TicketPanel
     */
    omit?: Prisma.TicketPanelOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TicketPanelInclude<ExtArgs> | null;
    where?: Prisma.TicketPanelWhereInput;
    orderBy?: Prisma.TicketPanelOrderByWithRelationInput | Prisma.TicketPanelOrderByWithRelationInput[];
    cursor?: Prisma.TicketPanelWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TicketPanelScalarFieldEnum | Prisma.TicketPanelScalarFieldEnum[];
};
/**
 * Guild.tickets
 */
export type Guild$ticketsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: Prisma.TicketSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Ticket
     */
    omit?: Prisma.TicketOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.TicketInclude<ExtArgs> | null;
    where?: Prisma.TicketWhereInput;
    orderBy?: Prisma.TicketOrderByWithRelationInput | Prisma.TicketOrderByWithRelationInput[];
    cursor?: Prisma.TicketWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TicketScalarFieldEnum | Prisma.TicketScalarFieldEnum[];
};
/**
 * Guild without action
 */
export type GuildDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Guild
     */
    select?: Prisma.GuildSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Guild
     */
    omit?: Prisma.GuildOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GuildInclude<ExtArgs> | null;
};
//# sourceMappingURL=Guild.d.ts.map
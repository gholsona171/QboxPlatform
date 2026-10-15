import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model ExternalIdentity
 *
 */
export type ExternalIdentityModel = runtime.Types.Result.DefaultSelection<Prisma.$ExternalIdentityPayload>;
export type AggregateExternalIdentity = {
    _count: ExternalIdentityCountAggregateOutputType | null;
    _min: ExternalIdentityMinAggregateOutputType | null;
    _max: ExternalIdentityMaxAggregateOutputType | null;
};
export type ExternalIdentityMinAggregateOutputType = {
    id: string | null;
    platformUserId: string | null;
    provider: $Enums.AuthenticationProvider | null;
    providerSubjectId: string | null;
    username: string | null;
    globalName: string | null;
    avatar: string | null;
    enabled: boolean | null;
    linkedAt: Date | null;
    verifiedAt: Date | null;
    lastProviderRefreshAt: Date | null;
    unlinkedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ExternalIdentityMaxAggregateOutputType = {
    id: string | null;
    platformUserId: string | null;
    provider: $Enums.AuthenticationProvider | null;
    providerSubjectId: string | null;
    username: string | null;
    globalName: string | null;
    avatar: string | null;
    enabled: boolean | null;
    linkedAt: Date | null;
    verifiedAt: Date | null;
    lastProviderRefreshAt: Date | null;
    unlinkedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ExternalIdentityCountAggregateOutputType = {
    id: number;
    platformUserId: number;
    provider: number;
    providerSubjectId: number;
    username: number;
    globalName: number;
    avatar: number;
    enabled: number;
    linkedAt: number;
    verifiedAt: number;
    lastProviderRefreshAt: number;
    unlinkedAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ExternalIdentityMinAggregateInputType = {
    id?: true;
    platformUserId?: true;
    provider?: true;
    providerSubjectId?: true;
    username?: true;
    globalName?: true;
    avatar?: true;
    enabled?: true;
    linkedAt?: true;
    verifiedAt?: true;
    lastProviderRefreshAt?: true;
    unlinkedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ExternalIdentityMaxAggregateInputType = {
    id?: true;
    platformUserId?: true;
    provider?: true;
    providerSubjectId?: true;
    username?: true;
    globalName?: true;
    avatar?: true;
    enabled?: true;
    linkedAt?: true;
    verifiedAt?: true;
    lastProviderRefreshAt?: true;
    unlinkedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ExternalIdentityCountAggregateInputType = {
    id?: true;
    platformUserId?: true;
    provider?: true;
    providerSubjectId?: true;
    username?: true;
    globalName?: true;
    avatar?: true;
    enabled?: true;
    linkedAt?: true;
    verifiedAt?: true;
    lastProviderRefreshAt?: true;
    unlinkedAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ExternalIdentityAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ExternalIdentity to aggregate.
     */
    where?: Prisma.ExternalIdentityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ExternalIdentities to fetch.
     */
    orderBy?: Prisma.ExternalIdentityOrderByWithRelationInput | Prisma.ExternalIdentityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ExternalIdentityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ExternalIdentities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ExternalIdentities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ExternalIdentities
    **/
    _count?: true | ExternalIdentityCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ExternalIdentityMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ExternalIdentityMaxAggregateInputType;
};
export type GetExternalIdentityAggregateType<T extends ExternalIdentityAggregateArgs> = {
    [P in keyof T & keyof AggregateExternalIdentity]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateExternalIdentity[P]> : Prisma.GetScalarType<T[P], AggregateExternalIdentity[P]>;
};
export type ExternalIdentityGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExternalIdentityWhereInput;
    orderBy?: Prisma.ExternalIdentityOrderByWithAggregationInput | Prisma.ExternalIdentityOrderByWithAggregationInput[];
    by: Prisma.ExternalIdentityScalarFieldEnum[] | Prisma.ExternalIdentityScalarFieldEnum;
    having?: Prisma.ExternalIdentityScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ExternalIdentityCountAggregateInputType | true;
    _min?: ExternalIdentityMinAggregateInputType;
    _max?: ExternalIdentityMaxAggregateInputType;
};
export type ExternalIdentityGroupByOutputType = {
    id: string;
    platformUserId: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username: string | null;
    globalName: string | null;
    avatar: string | null;
    enabled: boolean;
    linkedAt: Date;
    verifiedAt: Date;
    lastProviderRefreshAt: Date | null;
    unlinkedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ExternalIdentityCountAggregateOutputType | null;
    _min: ExternalIdentityMinAggregateOutputType | null;
    _max: ExternalIdentityMaxAggregateOutputType | null;
};
export type GetExternalIdentityGroupByPayload<T extends ExternalIdentityGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ExternalIdentityGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ExternalIdentityGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ExternalIdentityGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ExternalIdentityGroupByOutputType[P]>;
}>>;
export type ExternalIdentityWhereInput = {
    AND?: Prisma.ExternalIdentityWhereInput | Prisma.ExternalIdentityWhereInput[];
    OR?: Prisma.ExternalIdentityWhereInput[];
    NOT?: Prisma.ExternalIdentityWhereInput | Prisma.ExternalIdentityWhereInput[];
    id?: Prisma.UuidFilter<"ExternalIdentity"> | string;
    platformUserId?: Prisma.UuidFilter<"ExternalIdentity"> | string;
    provider?: Prisma.EnumAuthenticationProviderFilter<"ExternalIdentity"> | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFilter<"ExternalIdentity"> | string;
    username?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    globalName?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    avatar?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    enabled?: Prisma.BoolFilter<"ExternalIdentity"> | boolean;
    linkedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    verifiedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    lastProviderRefreshAt?: Prisma.DateTimeNullableFilter<"ExternalIdentity"> | Date | string | null;
    unlinkedAt?: Prisma.DateTimeNullableFilter<"ExternalIdentity"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    platformUser?: Prisma.XOR<Prisma.PlatformUserScalarRelationFilter, Prisma.PlatformUserWhereInput>;
    browserSessions?: Prisma.BrowserSessionListRelationFilter;
    oauthCredential?: Prisma.XOR<Prisma.OAuthCredentialNullableScalarRelationFilter, Prisma.OAuthCredentialWhereInput> | null;
    guildMemberships?: Prisma.DiscordGuildMembershipListRelationFilter;
    auditTargetEvents?: Prisma.AuthenticationAuditEventListRelationFilter;
};
export type ExternalIdentityOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    platformUserId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerSubjectId?: Prisma.SortOrder;
    username?: Prisma.SortOrderInput | Prisma.SortOrder;
    globalName?: Prisma.SortOrderInput | Prisma.SortOrder;
    avatar?: Prisma.SortOrderInput | Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    linkedAt?: Prisma.SortOrder;
    verifiedAt?: Prisma.SortOrder;
    lastProviderRefreshAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    unlinkedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    platformUser?: Prisma.PlatformUserOrderByWithRelationInput;
    browserSessions?: Prisma.BrowserSessionOrderByRelationAggregateInput;
    oauthCredential?: Prisma.OAuthCredentialOrderByWithRelationInput;
    guildMemberships?: Prisma.DiscordGuildMembershipOrderByRelationAggregateInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventOrderByRelationAggregateInput;
};
export type ExternalIdentityWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    provider_providerSubjectId?: Prisma.ExternalIdentityProviderProviderSubjectIdCompoundUniqueInput;
    platformUserId_provider?: Prisma.ExternalIdentityPlatformUserIdProviderCompoundUniqueInput;
    AND?: Prisma.ExternalIdentityWhereInput | Prisma.ExternalIdentityWhereInput[];
    OR?: Prisma.ExternalIdentityWhereInput[];
    NOT?: Prisma.ExternalIdentityWhereInput | Prisma.ExternalIdentityWhereInput[];
    platformUserId?: Prisma.UuidFilter<"ExternalIdentity"> | string;
    provider?: Prisma.EnumAuthenticationProviderFilter<"ExternalIdentity"> | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFilter<"ExternalIdentity"> | string;
    username?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    globalName?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    avatar?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    enabled?: Prisma.BoolFilter<"ExternalIdentity"> | boolean;
    linkedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    verifiedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    lastProviderRefreshAt?: Prisma.DateTimeNullableFilter<"ExternalIdentity"> | Date | string | null;
    unlinkedAt?: Prisma.DateTimeNullableFilter<"ExternalIdentity"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    platformUser?: Prisma.XOR<Prisma.PlatformUserScalarRelationFilter, Prisma.PlatformUserWhereInput>;
    browserSessions?: Prisma.BrowserSessionListRelationFilter;
    oauthCredential?: Prisma.XOR<Prisma.OAuthCredentialNullableScalarRelationFilter, Prisma.OAuthCredentialWhereInput> | null;
    guildMemberships?: Prisma.DiscordGuildMembershipListRelationFilter;
    auditTargetEvents?: Prisma.AuthenticationAuditEventListRelationFilter;
}, "id" | "provider_providerSubjectId" | "platformUserId_provider">;
export type ExternalIdentityOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    platformUserId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerSubjectId?: Prisma.SortOrder;
    username?: Prisma.SortOrderInput | Prisma.SortOrder;
    globalName?: Prisma.SortOrderInput | Prisma.SortOrder;
    avatar?: Prisma.SortOrderInput | Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    linkedAt?: Prisma.SortOrder;
    verifiedAt?: Prisma.SortOrder;
    lastProviderRefreshAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    unlinkedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ExternalIdentityCountOrderByAggregateInput;
    _max?: Prisma.ExternalIdentityMaxOrderByAggregateInput;
    _min?: Prisma.ExternalIdentityMinOrderByAggregateInput;
};
export type ExternalIdentityScalarWhereWithAggregatesInput = {
    AND?: Prisma.ExternalIdentityScalarWhereWithAggregatesInput | Prisma.ExternalIdentityScalarWhereWithAggregatesInput[];
    OR?: Prisma.ExternalIdentityScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ExternalIdentityScalarWhereWithAggregatesInput | Prisma.ExternalIdentityScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ExternalIdentity"> | string;
    platformUserId?: Prisma.UuidWithAggregatesFilter<"ExternalIdentity"> | string;
    provider?: Prisma.EnumAuthenticationProviderWithAggregatesFilter<"ExternalIdentity"> | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringWithAggregatesFilter<"ExternalIdentity"> | string;
    username?: Prisma.StringNullableWithAggregatesFilter<"ExternalIdentity"> | string | null;
    globalName?: Prisma.StringNullableWithAggregatesFilter<"ExternalIdentity"> | string | null;
    avatar?: Prisma.StringNullableWithAggregatesFilter<"ExternalIdentity"> | string | null;
    enabled?: Prisma.BoolWithAggregatesFilter<"ExternalIdentity"> | boolean;
    linkedAt?: Prisma.DateTimeWithAggregatesFilter<"ExternalIdentity"> | Date | string;
    verifiedAt?: Prisma.DateTimeWithAggregatesFilter<"ExternalIdentity"> | Date | string;
    lastProviderRefreshAt?: Prisma.DateTimeNullableWithAggregatesFilter<"ExternalIdentity"> | Date | string | null;
    unlinkedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"ExternalIdentity"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ExternalIdentity"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ExternalIdentity"> | Date | string;
};
export type ExternalIdentityCreateInput = {
    id?: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    platformUser: Prisma.PlatformUserCreateNestedOneWithoutExternalIdentitiesInput;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutLoginIdentityInput;
    oauthCredential?: Prisma.OAuthCredentialCreateNestedOneWithoutExternalIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityUncheckedCreateInput = {
    id?: string;
    platformUserId: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutLoginIdentityInput;
    oauthCredential?: Prisma.OAuthCredentialUncheckedCreateNestedOneWithoutExternalIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    platformUser?: Prisma.PlatformUserUpdateOneRequiredWithoutExternalIdentitiesNestedInput;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutLoginIdentityNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUpdateOneWithoutExternalIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platformUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutLoginIdentityNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUncheckedUpdateOneWithoutExternalIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityCreateManyInput = {
    id?: string;
    platformUserId: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExternalIdentityUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExternalIdentityUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platformUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ExternalIdentityListRelationFilter = {
    every?: Prisma.ExternalIdentityWhereInput;
    some?: Prisma.ExternalIdentityWhereInput;
    none?: Prisma.ExternalIdentityWhereInput;
};
export type ExternalIdentityOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ExternalIdentityProviderProviderSubjectIdCompoundUniqueInput = {
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
};
export type ExternalIdentityPlatformUserIdProviderCompoundUniqueInput = {
    platformUserId: string;
    provider: $Enums.AuthenticationProvider;
};
export type ExternalIdentityCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platformUserId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerSubjectId?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    globalName?: Prisma.SortOrder;
    avatar?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    linkedAt?: Prisma.SortOrder;
    verifiedAt?: Prisma.SortOrder;
    lastProviderRefreshAt?: Prisma.SortOrder;
    unlinkedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExternalIdentityMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platformUserId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerSubjectId?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    globalName?: Prisma.SortOrder;
    avatar?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    linkedAt?: Prisma.SortOrder;
    verifiedAt?: Prisma.SortOrder;
    lastProviderRefreshAt?: Prisma.SortOrder;
    unlinkedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExternalIdentityMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    platformUserId?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    providerSubjectId?: Prisma.SortOrder;
    username?: Prisma.SortOrder;
    globalName?: Prisma.SortOrder;
    avatar?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    linkedAt?: Prisma.SortOrder;
    verifiedAt?: Prisma.SortOrder;
    lastProviderRefreshAt?: Prisma.SortOrder;
    unlinkedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ExternalIdentityScalarRelationFilter = {
    is?: Prisma.ExternalIdentityWhereInput;
    isNot?: Prisma.ExternalIdentityWhereInput;
};
export type ExternalIdentityNullableScalarRelationFilter = {
    is?: Prisma.ExternalIdentityWhereInput | null;
    isNot?: Prisma.ExternalIdentityWhereInput | null;
};
export type ExternalIdentityCreateNestedManyWithoutPlatformUserInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutPlatformUserInput, Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput> | Prisma.ExternalIdentityCreateWithoutPlatformUserInput[] | Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput[];
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutPlatformUserInput | Prisma.ExternalIdentityCreateOrConnectWithoutPlatformUserInput[];
    createMany?: Prisma.ExternalIdentityCreateManyPlatformUserInputEnvelope;
    connect?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
};
export type ExternalIdentityUncheckedCreateNestedManyWithoutPlatformUserInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutPlatformUserInput, Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput> | Prisma.ExternalIdentityCreateWithoutPlatformUserInput[] | Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput[];
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutPlatformUserInput | Prisma.ExternalIdentityCreateOrConnectWithoutPlatformUserInput[];
    createMany?: Prisma.ExternalIdentityCreateManyPlatformUserInputEnvelope;
    connect?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
};
export type ExternalIdentityUpdateManyWithoutPlatformUserNestedInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutPlatformUserInput, Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput> | Prisma.ExternalIdentityCreateWithoutPlatformUserInput[] | Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput[];
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutPlatformUserInput | Prisma.ExternalIdentityCreateOrConnectWithoutPlatformUserInput[];
    upsert?: Prisma.ExternalIdentityUpsertWithWhereUniqueWithoutPlatformUserInput | Prisma.ExternalIdentityUpsertWithWhereUniqueWithoutPlatformUserInput[];
    createMany?: Prisma.ExternalIdentityCreateManyPlatformUserInputEnvelope;
    set?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
    disconnect?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
    delete?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
    connect?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
    update?: Prisma.ExternalIdentityUpdateWithWhereUniqueWithoutPlatformUserInput | Prisma.ExternalIdentityUpdateWithWhereUniqueWithoutPlatformUserInput[];
    updateMany?: Prisma.ExternalIdentityUpdateManyWithWhereWithoutPlatformUserInput | Prisma.ExternalIdentityUpdateManyWithWhereWithoutPlatformUserInput[];
    deleteMany?: Prisma.ExternalIdentityScalarWhereInput | Prisma.ExternalIdentityScalarWhereInput[];
};
export type ExternalIdentityUncheckedUpdateManyWithoutPlatformUserNestedInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutPlatformUserInput, Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput> | Prisma.ExternalIdentityCreateWithoutPlatformUserInput[] | Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput[];
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutPlatformUserInput | Prisma.ExternalIdentityCreateOrConnectWithoutPlatformUserInput[];
    upsert?: Prisma.ExternalIdentityUpsertWithWhereUniqueWithoutPlatformUserInput | Prisma.ExternalIdentityUpsertWithWhereUniqueWithoutPlatformUserInput[];
    createMany?: Prisma.ExternalIdentityCreateManyPlatformUserInputEnvelope;
    set?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
    disconnect?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
    delete?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
    connect?: Prisma.ExternalIdentityWhereUniqueInput | Prisma.ExternalIdentityWhereUniqueInput[];
    update?: Prisma.ExternalIdentityUpdateWithWhereUniqueWithoutPlatformUserInput | Prisma.ExternalIdentityUpdateWithWhereUniqueWithoutPlatformUserInput[];
    updateMany?: Prisma.ExternalIdentityUpdateManyWithWhereWithoutPlatformUserInput | Prisma.ExternalIdentityUpdateManyWithWhereWithoutPlatformUserInput[];
    deleteMany?: Prisma.ExternalIdentityScalarWhereInput | Prisma.ExternalIdentityScalarWhereInput[];
};
export type EnumAuthenticationProviderFieldUpdateOperationsInput = {
    set?: $Enums.AuthenticationProvider;
};
export type ExternalIdentityCreateNestedOneWithoutBrowserSessionsInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutBrowserSessionsInput, Prisma.ExternalIdentityUncheckedCreateWithoutBrowserSessionsInput>;
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutBrowserSessionsInput;
    connect?: Prisma.ExternalIdentityWhereUniqueInput;
};
export type ExternalIdentityUpdateOneRequiredWithoutBrowserSessionsNestedInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutBrowserSessionsInput, Prisma.ExternalIdentityUncheckedCreateWithoutBrowserSessionsInput>;
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutBrowserSessionsInput;
    upsert?: Prisma.ExternalIdentityUpsertWithoutBrowserSessionsInput;
    connect?: Prisma.ExternalIdentityWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExternalIdentityUpdateToOneWithWhereWithoutBrowserSessionsInput, Prisma.ExternalIdentityUpdateWithoutBrowserSessionsInput>, Prisma.ExternalIdentityUncheckedUpdateWithoutBrowserSessionsInput>;
};
export type ExternalIdentityCreateNestedOneWithoutOauthCredentialInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutOauthCredentialInput, Prisma.ExternalIdentityUncheckedCreateWithoutOauthCredentialInput>;
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutOauthCredentialInput;
    connect?: Prisma.ExternalIdentityWhereUniqueInput;
};
export type ExternalIdentityUpdateOneRequiredWithoutOauthCredentialNestedInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutOauthCredentialInput, Prisma.ExternalIdentityUncheckedCreateWithoutOauthCredentialInput>;
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutOauthCredentialInput;
    upsert?: Prisma.ExternalIdentityUpsertWithoutOauthCredentialInput;
    connect?: Prisma.ExternalIdentityWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExternalIdentityUpdateToOneWithWhereWithoutOauthCredentialInput, Prisma.ExternalIdentityUpdateWithoutOauthCredentialInput>, Prisma.ExternalIdentityUncheckedUpdateWithoutOauthCredentialInput>;
};
export type ExternalIdentityCreateNestedOneWithoutGuildMembershipsInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutGuildMembershipsInput, Prisma.ExternalIdentityUncheckedCreateWithoutGuildMembershipsInput>;
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutGuildMembershipsInput;
    connect?: Prisma.ExternalIdentityWhereUniqueInput;
};
export type ExternalIdentityUpdateOneRequiredWithoutGuildMembershipsNestedInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutGuildMembershipsInput, Prisma.ExternalIdentityUncheckedCreateWithoutGuildMembershipsInput>;
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutGuildMembershipsInput;
    upsert?: Prisma.ExternalIdentityUpsertWithoutGuildMembershipsInput;
    connect?: Prisma.ExternalIdentityWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExternalIdentityUpdateToOneWithWhereWithoutGuildMembershipsInput, Prisma.ExternalIdentityUpdateWithoutGuildMembershipsInput>, Prisma.ExternalIdentityUncheckedUpdateWithoutGuildMembershipsInput>;
};
export type ExternalIdentityCreateNestedOneWithoutAuditTargetEventsInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutAuditTargetEventsInput, Prisma.ExternalIdentityUncheckedCreateWithoutAuditTargetEventsInput>;
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutAuditTargetEventsInput;
    connect?: Prisma.ExternalIdentityWhereUniqueInput;
};
export type ExternalIdentityUpdateOneWithoutAuditTargetEventsNestedInput = {
    create?: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutAuditTargetEventsInput, Prisma.ExternalIdentityUncheckedCreateWithoutAuditTargetEventsInput>;
    connectOrCreate?: Prisma.ExternalIdentityCreateOrConnectWithoutAuditTargetEventsInput;
    upsert?: Prisma.ExternalIdentityUpsertWithoutAuditTargetEventsInput;
    disconnect?: Prisma.ExternalIdentityWhereInput | boolean;
    delete?: Prisma.ExternalIdentityWhereInput | boolean;
    connect?: Prisma.ExternalIdentityWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ExternalIdentityUpdateToOneWithWhereWithoutAuditTargetEventsInput, Prisma.ExternalIdentityUpdateWithoutAuditTargetEventsInput>, Prisma.ExternalIdentityUncheckedUpdateWithoutAuditTargetEventsInput>;
};
export type ExternalIdentityCreateWithoutPlatformUserInput = {
    id?: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutLoginIdentityInput;
    oauthCredential?: Prisma.OAuthCredentialCreateNestedOneWithoutExternalIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityUncheckedCreateWithoutPlatformUserInput = {
    id?: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutLoginIdentityInput;
    oauthCredential?: Prisma.OAuthCredentialUncheckedCreateNestedOneWithoutExternalIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityCreateOrConnectWithoutPlatformUserInput = {
    where: Prisma.ExternalIdentityWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutPlatformUserInput, Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput>;
};
export type ExternalIdentityCreateManyPlatformUserInputEnvelope = {
    data: Prisma.ExternalIdentityCreateManyPlatformUserInput | Prisma.ExternalIdentityCreateManyPlatformUserInput[];
    skipDuplicates?: boolean;
};
export type ExternalIdentityUpsertWithWhereUniqueWithoutPlatformUserInput = {
    where: Prisma.ExternalIdentityWhereUniqueInput;
    update: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutPlatformUserInput, Prisma.ExternalIdentityUncheckedUpdateWithoutPlatformUserInput>;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutPlatformUserInput, Prisma.ExternalIdentityUncheckedCreateWithoutPlatformUserInput>;
};
export type ExternalIdentityUpdateWithWhereUniqueWithoutPlatformUserInput = {
    where: Prisma.ExternalIdentityWhereUniqueInput;
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutPlatformUserInput, Prisma.ExternalIdentityUncheckedUpdateWithoutPlatformUserInput>;
};
export type ExternalIdentityUpdateManyWithWhereWithoutPlatformUserInput = {
    where: Prisma.ExternalIdentityScalarWhereInput;
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateManyMutationInput, Prisma.ExternalIdentityUncheckedUpdateManyWithoutPlatformUserInput>;
};
export type ExternalIdentityScalarWhereInput = {
    AND?: Prisma.ExternalIdentityScalarWhereInput | Prisma.ExternalIdentityScalarWhereInput[];
    OR?: Prisma.ExternalIdentityScalarWhereInput[];
    NOT?: Prisma.ExternalIdentityScalarWhereInput | Prisma.ExternalIdentityScalarWhereInput[];
    id?: Prisma.UuidFilter<"ExternalIdentity"> | string;
    platformUserId?: Prisma.UuidFilter<"ExternalIdentity"> | string;
    provider?: Prisma.EnumAuthenticationProviderFilter<"ExternalIdentity"> | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFilter<"ExternalIdentity"> | string;
    username?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    globalName?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    avatar?: Prisma.StringNullableFilter<"ExternalIdentity"> | string | null;
    enabled?: Prisma.BoolFilter<"ExternalIdentity"> | boolean;
    linkedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    verifiedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    lastProviderRefreshAt?: Prisma.DateTimeNullableFilter<"ExternalIdentity"> | Date | string | null;
    unlinkedAt?: Prisma.DateTimeNullableFilter<"ExternalIdentity"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ExternalIdentity"> | Date | string;
};
export type ExternalIdentityCreateWithoutBrowserSessionsInput = {
    id?: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    platformUser: Prisma.PlatformUserCreateNestedOneWithoutExternalIdentitiesInput;
    oauthCredential?: Prisma.OAuthCredentialCreateNestedOneWithoutExternalIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityUncheckedCreateWithoutBrowserSessionsInput = {
    id?: string;
    platformUserId: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    oauthCredential?: Prisma.OAuthCredentialUncheckedCreateNestedOneWithoutExternalIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityCreateOrConnectWithoutBrowserSessionsInput = {
    where: Prisma.ExternalIdentityWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutBrowserSessionsInput, Prisma.ExternalIdentityUncheckedCreateWithoutBrowserSessionsInput>;
};
export type ExternalIdentityUpsertWithoutBrowserSessionsInput = {
    update: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutBrowserSessionsInput, Prisma.ExternalIdentityUncheckedUpdateWithoutBrowserSessionsInput>;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutBrowserSessionsInput, Prisma.ExternalIdentityUncheckedCreateWithoutBrowserSessionsInput>;
    where?: Prisma.ExternalIdentityWhereInput;
};
export type ExternalIdentityUpdateToOneWithWhereWithoutBrowserSessionsInput = {
    where?: Prisma.ExternalIdentityWhereInput;
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutBrowserSessionsInput, Prisma.ExternalIdentityUncheckedUpdateWithoutBrowserSessionsInput>;
};
export type ExternalIdentityUpdateWithoutBrowserSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    platformUser?: Prisma.PlatformUserUpdateOneRequiredWithoutExternalIdentitiesNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUpdateOneWithoutExternalIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityUncheckedUpdateWithoutBrowserSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platformUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    oauthCredential?: Prisma.OAuthCredentialUncheckedUpdateOneWithoutExternalIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityCreateWithoutOauthCredentialInput = {
    id?: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    platformUser: Prisma.PlatformUserCreateNestedOneWithoutExternalIdentitiesInput;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutLoginIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityUncheckedCreateWithoutOauthCredentialInput = {
    id?: string;
    platformUserId: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutLoginIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityCreateOrConnectWithoutOauthCredentialInput = {
    where: Prisma.ExternalIdentityWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutOauthCredentialInput, Prisma.ExternalIdentityUncheckedCreateWithoutOauthCredentialInput>;
};
export type ExternalIdentityUpsertWithoutOauthCredentialInput = {
    update: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutOauthCredentialInput, Prisma.ExternalIdentityUncheckedUpdateWithoutOauthCredentialInput>;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutOauthCredentialInput, Prisma.ExternalIdentityUncheckedCreateWithoutOauthCredentialInput>;
    where?: Prisma.ExternalIdentityWhereInput;
};
export type ExternalIdentityUpdateToOneWithWhereWithoutOauthCredentialInput = {
    where?: Prisma.ExternalIdentityWhereInput;
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutOauthCredentialInput, Prisma.ExternalIdentityUncheckedUpdateWithoutOauthCredentialInput>;
};
export type ExternalIdentityUpdateWithoutOauthCredentialInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    platformUser?: Prisma.PlatformUserUpdateOneRequiredWithoutExternalIdentitiesNestedInput;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutLoginIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityUncheckedUpdateWithoutOauthCredentialInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platformUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutLoginIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityCreateWithoutGuildMembershipsInput = {
    id?: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    platformUser: Prisma.PlatformUserCreateNestedOneWithoutExternalIdentitiesInput;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutLoginIdentityInput;
    oauthCredential?: Prisma.OAuthCredentialCreateNestedOneWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityUncheckedCreateWithoutGuildMembershipsInput = {
    id?: string;
    platformUserId: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutLoginIdentityInput;
    oauthCredential?: Prisma.OAuthCredentialUncheckedCreateNestedOneWithoutExternalIdentityInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetExternalIdentityInput;
};
export type ExternalIdentityCreateOrConnectWithoutGuildMembershipsInput = {
    where: Prisma.ExternalIdentityWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutGuildMembershipsInput, Prisma.ExternalIdentityUncheckedCreateWithoutGuildMembershipsInput>;
};
export type ExternalIdentityUpsertWithoutGuildMembershipsInput = {
    update: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutGuildMembershipsInput, Prisma.ExternalIdentityUncheckedUpdateWithoutGuildMembershipsInput>;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutGuildMembershipsInput, Prisma.ExternalIdentityUncheckedCreateWithoutGuildMembershipsInput>;
    where?: Prisma.ExternalIdentityWhereInput;
};
export type ExternalIdentityUpdateToOneWithWhereWithoutGuildMembershipsInput = {
    where?: Prisma.ExternalIdentityWhereInput;
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutGuildMembershipsInput, Prisma.ExternalIdentityUncheckedUpdateWithoutGuildMembershipsInput>;
};
export type ExternalIdentityUpdateWithoutGuildMembershipsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    platformUser?: Prisma.PlatformUserUpdateOneRequiredWithoutExternalIdentitiesNestedInput;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutLoginIdentityNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUpdateOneWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityUncheckedUpdateWithoutGuildMembershipsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platformUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutLoginIdentityNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUncheckedUpdateOneWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityCreateWithoutAuditTargetEventsInput = {
    id?: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    platformUser: Prisma.PlatformUserCreateNestedOneWithoutExternalIdentitiesInput;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutLoginIdentityInput;
    oauthCredential?: Prisma.OAuthCredentialCreateNestedOneWithoutExternalIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipCreateNestedManyWithoutExternalIdentityInput;
};
export type ExternalIdentityUncheckedCreateWithoutAuditTargetEventsInput = {
    id?: string;
    platformUserId: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutLoginIdentityInput;
    oauthCredential?: Prisma.OAuthCredentialUncheckedCreateNestedOneWithoutExternalIdentityInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedCreateNestedManyWithoutExternalIdentityInput;
};
export type ExternalIdentityCreateOrConnectWithoutAuditTargetEventsInput = {
    where: Prisma.ExternalIdentityWhereUniqueInput;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutAuditTargetEventsInput, Prisma.ExternalIdentityUncheckedCreateWithoutAuditTargetEventsInput>;
};
export type ExternalIdentityUpsertWithoutAuditTargetEventsInput = {
    update: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutAuditTargetEventsInput, Prisma.ExternalIdentityUncheckedUpdateWithoutAuditTargetEventsInput>;
    create: Prisma.XOR<Prisma.ExternalIdentityCreateWithoutAuditTargetEventsInput, Prisma.ExternalIdentityUncheckedCreateWithoutAuditTargetEventsInput>;
    where?: Prisma.ExternalIdentityWhereInput;
};
export type ExternalIdentityUpdateToOneWithWhereWithoutAuditTargetEventsInput = {
    where?: Prisma.ExternalIdentityWhereInput;
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateWithoutAuditTargetEventsInput, Prisma.ExternalIdentityUncheckedUpdateWithoutAuditTargetEventsInput>;
};
export type ExternalIdentityUpdateWithoutAuditTargetEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    platformUser?: Prisma.PlatformUserUpdateOneRequiredWithoutExternalIdentitiesNestedInput;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutLoginIdentityNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUpdateOneWithoutExternalIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutExternalIdentityNestedInput;
};
export type ExternalIdentityUncheckedUpdateWithoutAuditTargetEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    platformUserId?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutLoginIdentityNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUncheckedUpdateOneWithoutExternalIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutExternalIdentityNestedInput;
};
export type ExternalIdentityCreateManyPlatformUserInput = {
    id?: string;
    provider: $Enums.AuthenticationProvider;
    providerSubjectId: string;
    username?: string | null;
    globalName?: string | null;
    avatar?: string | null;
    enabled?: boolean;
    linkedAt: Date | string;
    verifiedAt: Date | string;
    lastProviderRefreshAt?: Date | string | null;
    unlinkedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ExternalIdentityUpdateWithoutPlatformUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutLoginIdentityNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUpdateOneWithoutExternalIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUpdateManyWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityUncheckedUpdateWithoutPlatformUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutLoginIdentityNestedInput;
    oauthCredential?: Prisma.OAuthCredentialUncheckedUpdateOneWithoutExternalIdentityNestedInput;
    guildMemberships?: Prisma.DiscordGuildMembershipUncheckedUpdateManyWithoutExternalIdentityNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetExternalIdentityNestedInput;
};
export type ExternalIdentityUncheckedUpdateManyWithoutPlatformUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.EnumAuthenticationProviderFieldUpdateOperationsInput | $Enums.AuthenticationProvider;
    providerSubjectId?: Prisma.StringFieldUpdateOperationsInput | string;
    username?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    globalName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    linkedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    verifiedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lastProviderRefreshAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    unlinkedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type ExternalIdentityCountOutputType
 */
export type ExternalIdentityCountOutputType = {
    browserSessions: number;
    guildMemberships: number;
    auditTargetEvents: number;
};
export type ExternalIdentityCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    browserSessions?: boolean | ExternalIdentityCountOutputTypeCountBrowserSessionsArgs;
    guildMemberships?: boolean | ExternalIdentityCountOutputTypeCountGuildMembershipsArgs;
    auditTargetEvents?: boolean | ExternalIdentityCountOutputTypeCountAuditTargetEventsArgs;
};
/**
 * ExternalIdentityCountOutputType without action
 */
export type ExternalIdentityCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentityCountOutputType
     */
    select?: Prisma.ExternalIdentityCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * ExternalIdentityCountOutputType without action
 */
export type ExternalIdentityCountOutputTypeCountBrowserSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BrowserSessionWhereInput;
};
/**
 * ExternalIdentityCountOutputType without action
 */
export type ExternalIdentityCountOutputTypeCountGuildMembershipsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DiscordGuildMembershipWhereInput;
};
/**
 * ExternalIdentityCountOutputType without action
 */
export type ExternalIdentityCountOutputTypeCountAuditTargetEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuthenticationAuditEventWhereInput;
};
export type ExternalIdentitySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platformUserId?: boolean;
    provider?: boolean;
    providerSubjectId?: boolean;
    username?: boolean;
    globalName?: boolean;
    avatar?: boolean;
    enabled?: boolean;
    linkedAt?: boolean;
    verifiedAt?: boolean;
    lastProviderRefreshAt?: boolean;
    unlinkedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    platformUser?: boolean | Prisma.PlatformUserDefaultArgs<ExtArgs>;
    browserSessions?: boolean | Prisma.ExternalIdentity$browserSessionsArgs<ExtArgs>;
    oauthCredential?: boolean | Prisma.ExternalIdentity$oauthCredentialArgs<ExtArgs>;
    guildMemberships?: boolean | Prisma.ExternalIdentity$guildMembershipsArgs<ExtArgs>;
    auditTargetEvents?: boolean | Prisma.ExternalIdentity$auditTargetEventsArgs<ExtArgs>;
    _count?: boolean | Prisma.ExternalIdentityCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["externalIdentity"]>;
export type ExternalIdentitySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platformUserId?: boolean;
    provider?: boolean;
    providerSubjectId?: boolean;
    username?: boolean;
    globalName?: boolean;
    avatar?: boolean;
    enabled?: boolean;
    linkedAt?: boolean;
    verifiedAt?: boolean;
    lastProviderRefreshAt?: boolean;
    unlinkedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    platformUser?: boolean | Prisma.PlatformUserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["externalIdentity"]>;
export type ExternalIdentitySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    platformUserId?: boolean;
    provider?: boolean;
    providerSubjectId?: boolean;
    username?: boolean;
    globalName?: boolean;
    avatar?: boolean;
    enabled?: boolean;
    linkedAt?: boolean;
    verifiedAt?: boolean;
    lastProviderRefreshAt?: boolean;
    unlinkedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    platformUser?: boolean | Prisma.PlatformUserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["externalIdentity"]>;
export type ExternalIdentitySelectScalar = {
    id?: boolean;
    platformUserId?: boolean;
    provider?: boolean;
    providerSubjectId?: boolean;
    username?: boolean;
    globalName?: boolean;
    avatar?: boolean;
    enabled?: boolean;
    linkedAt?: boolean;
    verifiedAt?: boolean;
    lastProviderRefreshAt?: boolean;
    unlinkedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ExternalIdentityOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "platformUserId" | "provider" | "providerSubjectId" | "username" | "globalName" | "avatar" | "enabled" | "linkedAt" | "verifiedAt" | "lastProviderRefreshAt" | "unlinkedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["externalIdentity"]>;
export type ExternalIdentityInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    platformUser?: boolean | Prisma.PlatformUserDefaultArgs<ExtArgs>;
    browserSessions?: boolean | Prisma.ExternalIdentity$browserSessionsArgs<ExtArgs>;
    oauthCredential?: boolean | Prisma.ExternalIdentity$oauthCredentialArgs<ExtArgs>;
    guildMemberships?: boolean | Prisma.ExternalIdentity$guildMembershipsArgs<ExtArgs>;
    auditTargetEvents?: boolean | Prisma.ExternalIdentity$auditTargetEventsArgs<ExtArgs>;
    _count?: boolean | Prisma.ExternalIdentityCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ExternalIdentityIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    platformUser?: boolean | Prisma.PlatformUserDefaultArgs<ExtArgs>;
};
export type ExternalIdentityIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    platformUser?: boolean | Prisma.PlatformUserDefaultArgs<ExtArgs>;
};
export type $ExternalIdentityPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ExternalIdentity";
    objects: {
        platformUser: Prisma.$PlatformUserPayload<ExtArgs>;
        browserSessions: Prisma.$BrowserSessionPayload<ExtArgs>[];
        oauthCredential: Prisma.$OAuthCredentialPayload<ExtArgs> | null;
        guildMemberships: Prisma.$DiscordGuildMembershipPayload<ExtArgs>[];
        auditTargetEvents: Prisma.$AuthenticationAuditEventPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        platformUserId: string;
        provider: $Enums.AuthenticationProvider;
        providerSubjectId: string;
        username: string | null;
        globalName: string | null;
        avatar: string | null;
        enabled: boolean;
        linkedAt: Date;
        verifiedAt: Date;
        lastProviderRefreshAt: Date | null;
        unlinkedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["externalIdentity"]>;
    composites: {};
};
export type ExternalIdentityGetPayload<S extends boolean | null | undefined | ExternalIdentityDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload, S>;
export type ExternalIdentityCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ExternalIdentityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ExternalIdentityCountAggregateInputType | true;
};
export interface ExternalIdentityDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ExternalIdentity'];
        meta: {
            name: 'ExternalIdentity';
        };
    };
    /**
     * Find zero or one ExternalIdentity that matches the filter.
     * @param {ExternalIdentityFindUniqueArgs} args - Arguments to find a ExternalIdentity
     * @example
     * // Get one ExternalIdentity
     * const externalIdentity = await prisma.externalIdentity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExternalIdentityFindUniqueArgs>(args: Prisma.SelectSubset<T, ExternalIdentityFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ExternalIdentityClient<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ExternalIdentity that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExternalIdentityFindUniqueOrThrowArgs} args - Arguments to find a ExternalIdentity
     * @example
     * // Get one ExternalIdentity
     * const externalIdentity = await prisma.externalIdentity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExternalIdentityFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ExternalIdentityFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExternalIdentityClient<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ExternalIdentity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExternalIdentityFindFirstArgs} args - Arguments to find a ExternalIdentity
     * @example
     * // Get one ExternalIdentity
     * const externalIdentity = await prisma.externalIdentity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExternalIdentityFindFirstArgs>(args?: Prisma.SelectSubset<T, ExternalIdentityFindFirstArgs<ExtArgs>>): Prisma.Prisma__ExternalIdentityClient<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ExternalIdentity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExternalIdentityFindFirstOrThrowArgs} args - Arguments to find a ExternalIdentity
     * @example
     * // Get one ExternalIdentity
     * const externalIdentity = await prisma.externalIdentity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExternalIdentityFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ExternalIdentityFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ExternalIdentityClient<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ExternalIdentities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExternalIdentityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ExternalIdentities
     * const externalIdentities = await prisma.externalIdentity.findMany()
     *
     * // Get first 10 ExternalIdentities
     * const externalIdentities = await prisma.externalIdentity.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const externalIdentityWithIdOnly = await prisma.externalIdentity.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ExternalIdentityFindManyArgs>(args?: Prisma.SelectSubset<T, ExternalIdentityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ExternalIdentity.
     * @param {ExternalIdentityCreateArgs} args - Arguments to create a ExternalIdentity.
     * @example
     * // Create one ExternalIdentity
     * const ExternalIdentity = await prisma.externalIdentity.create({
     *   data: {
     *     // ... data to create a ExternalIdentity
     *   }
     * })
     *
     */
    create<T extends ExternalIdentityCreateArgs>(args: Prisma.SelectSubset<T, ExternalIdentityCreateArgs<ExtArgs>>): Prisma.Prisma__ExternalIdentityClient<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ExternalIdentities.
     * @param {ExternalIdentityCreateManyArgs} args - Arguments to create many ExternalIdentities.
     * @example
     * // Create many ExternalIdentities
     * const externalIdentity = await prisma.externalIdentity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ExternalIdentityCreateManyArgs>(args?: Prisma.SelectSubset<T, ExternalIdentityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ExternalIdentities and returns the data saved in the database.
     * @param {ExternalIdentityCreateManyAndReturnArgs} args - Arguments to create many ExternalIdentities.
     * @example
     * // Create many ExternalIdentities
     * const externalIdentity = await prisma.externalIdentity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ExternalIdentities and only return the `id`
     * const externalIdentityWithIdOnly = await prisma.externalIdentity.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ExternalIdentityCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ExternalIdentityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ExternalIdentity.
     * @param {ExternalIdentityDeleteArgs} args - Arguments to delete one ExternalIdentity.
     * @example
     * // Delete one ExternalIdentity
     * const ExternalIdentity = await prisma.externalIdentity.delete({
     *   where: {
     *     // ... filter to delete one ExternalIdentity
     *   }
     * })
     *
     */
    delete<T extends ExternalIdentityDeleteArgs>(args: Prisma.SelectSubset<T, ExternalIdentityDeleteArgs<ExtArgs>>): Prisma.Prisma__ExternalIdentityClient<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ExternalIdentity.
     * @param {ExternalIdentityUpdateArgs} args - Arguments to update one ExternalIdentity.
     * @example
     * // Update one ExternalIdentity
     * const externalIdentity = await prisma.externalIdentity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ExternalIdentityUpdateArgs>(args: Prisma.SelectSubset<T, ExternalIdentityUpdateArgs<ExtArgs>>): Prisma.Prisma__ExternalIdentityClient<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ExternalIdentities.
     * @param {ExternalIdentityDeleteManyArgs} args - Arguments to filter ExternalIdentities to delete.
     * @example
     * // Delete a few ExternalIdentities
     * const { count } = await prisma.externalIdentity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ExternalIdentityDeleteManyArgs>(args?: Prisma.SelectSubset<T, ExternalIdentityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ExternalIdentities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExternalIdentityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ExternalIdentities
     * const externalIdentity = await prisma.externalIdentity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ExternalIdentityUpdateManyArgs>(args: Prisma.SelectSubset<T, ExternalIdentityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ExternalIdentities and returns the data updated in the database.
     * @param {ExternalIdentityUpdateManyAndReturnArgs} args - Arguments to update many ExternalIdentities.
     * @example
     * // Update many ExternalIdentities
     * const externalIdentity = await prisma.externalIdentity.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ExternalIdentities and only return the `id`
     * const externalIdentityWithIdOnly = await prisma.externalIdentity.updateManyAndReturn({
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
    updateManyAndReturn<T extends ExternalIdentityUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ExternalIdentityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ExternalIdentity.
     * @param {ExternalIdentityUpsertArgs} args - Arguments to update or create a ExternalIdentity.
     * @example
     * // Update or create a ExternalIdentity
     * const externalIdentity = await prisma.externalIdentity.upsert({
     *   create: {
     *     // ... data to create a ExternalIdentity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ExternalIdentity we want to update
     *   }
     * })
     */
    upsert<T extends ExternalIdentityUpsertArgs>(args: Prisma.SelectSubset<T, ExternalIdentityUpsertArgs<ExtArgs>>): Prisma.Prisma__ExternalIdentityClient<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ExternalIdentities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExternalIdentityCountArgs} args - Arguments to filter ExternalIdentities to count.
     * @example
     * // Count the number of ExternalIdentities
     * const count = await prisma.externalIdentity.count({
     *   where: {
     *     // ... the filter for the ExternalIdentities we want to count
     *   }
     * })
    **/
    count<T extends ExternalIdentityCountArgs>(args?: Prisma.Subset<T, ExternalIdentityCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ExternalIdentityCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ExternalIdentity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExternalIdentityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ExternalIdentityAggregateArgs>(args: Prisma.Subset<T, ExternalIdentityAggregateArgs>): Prisma.PrismaPromise<GetExternalIdentityAggregateType<T>>;
    /**
     * Group by ExternalIdentity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExternalIdentityGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ExternalIdentityGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ExternalIdentityGroupByArgs['orderBy'];
    } : {
        orderBy?: ExternalIdentityGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ExternalIdentityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExternalIdentityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ExternalIdentity model
     */
    readonly fields: ExternalIdentityFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ExternalIdentity.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ExternalIdentityClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    platformUser<T extends Prisma.PlatformUserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PlatformUserDefaultArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    browserSessions<T extends Prisma.ExternalIdentity$browserSessionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ExternalIdentity$browserSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BrowserSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    oauthCredential<T extends Prisma.ExternalIdentity$oauthCredentialArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ExternalIdentity$oauthCredentialArgs<ExtArgs>>): Prisma.Prisma__OAuthCredentialClient<runtime.Types.Result.GetResult<Prisma.$OAuthCredentialPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    guildMemberships<T extends Prisma.ExternalIdentity$guildMembershipsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ExternalIdentity$guildMembershipsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    auditTargetEvents<T extends Prisma.ExternalIdentity$auditTargetEventsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ExternalIdentity$auditTargetEventsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuthenticationAuditEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the ExternalIdentity model
 */
export interface ExternalIdentityFieldRefs {
    readonly id: Prisma.FieldRef<"ExternalIdentity", 'String'>;
    readonly platformUserId: Prisma.FieldRef<"ExternalIdentity", 'String'>;
    readonly provider: Prisma.FieldRef<"ExternalIdentity", 'AuthenticationProvider'>;
    readonly providerSubjectId: Prisma.FieldRef<"ExternalIdentity", 'String'>;
    readonly username: Prisma.FieldRef<"ExternalIdentity", 'String'>;
    readonly globalName: Prisma.FieldRef<"ExternalIdentity", 'String'>;
    readonly avatar: Prisma.FieldRef<"ExternalIdentity", 'String'>;
    readonly enabled: Prisma.FieldRef<"ExternalIdentity", 'Boolean'>;
    readonly linkedAt: Prisma.FieldRef<"ExternalIdentity", 'DateTime'>;
    readonly verifiedAt: Prisma.FieldRef<"ExternalIdentity", 'DateTime'>;
    readonly lastProviderRefreshAt: Prisma.FieldRef<"ExternalIdentity", 'DateTime'>;
    readonly unlinkedAt: Prisma.FieldRef<"ExternalIdentity", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"ExternalIdentity", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ExternalIdentity", 'DateTime'>;
}
/**
 * ExternalIdentity findUnique
 */
export type ExternalIdentityFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * Filter, which ExternalIdentity to fetch.
     */
    where: Prisma.ExternalIdentityWhereUniqueInput;
};
/**
 * ExternalIdentity findUniqueOrThrow
 */
export type ExternalIdentityFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * Filter, which ExternalIdentity to fetch.
     */
    where: Prisma.ExternalIdentityWhereUniqueInput;
};
/**
 * ExternalIdentity findFirst
 */
export type ExternalIdentityFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * Filter, which ExternalIdentity to fetch.
     */
    where?: Prisma.ExternalIdentityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ExternalIdentities to fetch.
     */
    orderBy?: Prisma.ExternalIdentityOrderByWithRelationInput | Prisma.ExternalIdentityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ExternalIdentities.
     */
    cursor?: Prisma.ExternalIdentityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ExternalIdentities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ExternalIdentities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ExternalIdentities.
     */
    distinct?: Prisma.ExternalIdentityScalarFieldEnum | Prisma.ExternalIdentityScalarFieldEnum[];
};
/**
 * ExternalIdentity findFirstOrThrow
 */
export type ExternalIdentityFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * Filter, which ExternalIdentity to fetch.
     */
    where?: Prisma.ExternalIdentityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ExternalIdentities to fetch.
     */
    orderBy?: Prisma.ExternalIdentityOrderByWithRelationInput | Prisma.ExternalIdentityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ExternalIdentities.
     */
    cursor?: Prisma.ExternalIdentityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ExternalIdentities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ExternalIdentities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ExternalIdentities.
     */
    distinct?: Prisma.ExternalIdentityScalarFieldEnum | Prisma.ExternalIdentityScalarFieldEnum[];
};
/**
 * ExternalIdentity findMany
 */
export type ExternalIdentityFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * Filter, which ExternalIdentities to fetch.
     */
    where?: Prisma.ExternalIdentityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ExternalIdentities to fetch.
     */
    orderBy?: Prisma.ExternalIdentityOrderByWithRelationInput | Prisma.ExternalIdentityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ExternalIdentities.
     */
    cursor?: Prisma.ExternalIdentityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ExternalIdentities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ExternalIdentities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ExternalIdentities.
     */
    distinct?: Prisma.ExternalIdentityScalarFieldEnum | Prisma.ExternalIdentityScalarFieldEnum[];
};
/**
 * ExternalIdentity create
 */
export type ExternalIdentityCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * The data needed to create a ExternalIdentity.
     */
    data: Prisma.XOR<Prisma.ExternalIdentityCreateInput, Prisma.ExternalIdentityUncheckedCreateInput>;
};
/**
 * ExternalIdentity createMany
 */
export type ExternalIdentityCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ExternalIdentities.
     */
    data: Prisma.ExternalIdentityCreateManyInput | Prisma.ExternalIdentityCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ExternalIdentity createManyAndReturn
 */
export type ExternalIdentityCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * The data used to create many ExternalIdentities.
     */
    data: Prisma.ExternalIdentityCreateManyInput | Prisma.ExternalIdentityCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ExternalIdentity update
 */
export type ExternalIdentityUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * The data needed to update a ExternalIdentity.
     */
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateInput, Prisma.ExternalIdentityUncheckedUpdateInput>;
    /**
     * Choose, which ExternalIdentity to update.
     */
    where: Prisma.ExternalIdentityWhereUniqueInput;
};
/**
 * ExternalIdentity updateMany
 */
export type ExternalIdentityUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ExternalIdentities.
     */
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateManyMutationInput, Prisma.ExternalIdentityUncheckedUpdateManyInput>;
    /**
     * Filter which ExternalIdentities to update
     */
    where?: Prisma.ExternalIdentityWhereInput;
    /**
     * Limit how many ExternalIdentities to update.
     */
    limit?: number;
};
/**
 * ExternalIdentity updateManyAndReturn
 */
export type ExternalIdentityUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * The data used to update ExternalIdentities.
     */
    data: Prisma.XOR<Prisma.ExternalIdentityUpdateManyMutationInput, Prisma.ExternalIdentityUncheckedUpdateManyInput>;
    /**
     * Filter which ExternalIdentities to update
     */
    where?: Prisma.ExternalIdentityWhereInput;
    /**
     * Limit how many ExternalIdentities to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ExternalIdentity upsert
 */
export type ExternalIdentityUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * The filter to search for the ExternalIdentity to update in case it exists.
     */
    where: Prisma.ExternalIdentityWhereUniqueInput;
    /**
     * In case the ExternalIdentity found by the `where` argument doesn't exist, create a new ExternalIdentity with this data.
     */
    create: Prisma.XOR<Prisma.ExternalIdentityCreateInput, Prisma.ExternalIdentityUncheckedCreateInput>;
    /**
     * In case the ExternalIdentity was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ExternalIdentityUpdateInput, Prisma.ExternalIdentityUncheckedUpdateInput>;
};
/**
 * ExternalIdentity delete
 */
export type ExternalIdentityDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
    /**
     * Filter which ExternalIdentity to delete.
     */
    where: Prisma.ExternalIdentityWhereUniqueInput;
};
/**
 * ExternalIdentity deleteMany
 */
export type ExternalIdentityDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ExternalIdentities to delete
     */
    where?: Prisma.ExternalIdentityWhereInput;
    /**
     * Limit how many ExternalIdentities to delete.
     */
    limit?: number;
};
/**
 * ExternalIdentity.browserSessions
 */
export type ExternalIdentity$browserSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrowserSession
     */
    select?: Prisma.BrowserSessionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BrowserSession
     */
    omit?: Prisma.BrowserSessionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BrowserSessionInclude<ExtArgs> | null;
    where?: Prisma.BrowserSessionWhereInput;
    orderBy?: Prisma.BrowserSessionOrderByWithRelationInput | Prisma.BrowserSessionOrderByWithRelationInput[];
    cursor?: Prisma.BrowserSessionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BrowserSessionScalarFieldEnum | Prisma.BrowserSessionScalarFieldEnum[];
};
/**
 * ExternalIdentity.oauthCredential
 */
export type ExternalIdentity$oauthCredentialArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OAuthCredential
     */
    select?: Prisma.OAuthCredentialSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OAuthCredential
     */
    omit?: Prisma.OAuthCredentialOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.OAuthCredentialInclude<ExtArgs> | null;
    where?: Prisma.OAuthCredentialWhereInput;
};
/**
 * ExternalIdentity.guildMemberships
 */
export type ExternalIdentity$guildMembershipsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * ExternalIdentity.auditTargetEvents
 */
export type ExternalIdentity$auditTargetEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthenticationAuditEvent
     */
    select?: Prisma.AuthenticationAuditEventSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AuthenticationAuditEvent
     */
    omit?: Prisma.AuthenticationAuditEventOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AuthenticationAuditEventInclude<ExtArgs> | null;
    where?: Prisma.AuthenticationAuditEventWhereInput;
    orderBy?: Prisma.AuthenticationAuditEventOrderByWithRelationInput | Prisma.AuthenticationAuditEventOrderByWithRelationInput[];
    cursor?: Prisma.AuthenticationAuditEventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.AuthenticationAuditEventScalarFieldEnum | Prisma.AuthenticationAuditEventScalarFieldEnum[];
};
/**
 * ExternalIdentity without action
 */
export type ExternalIdentityDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ExternalIdentity
     */
    select?: Prisma.ExternalIdentitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ExternalIdentity
     */
    omit?: Prisma.ExternalIdentityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ExternalIdentityInclude<ExtArgs> | null;
};
//# sourceMappingURL=ExternalIdentity.d.ts.map
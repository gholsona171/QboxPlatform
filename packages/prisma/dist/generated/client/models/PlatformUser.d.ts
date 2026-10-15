import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model PlatformUser
 *
 */
export type PlatformUserModel = runtime.Types.Result.DefaultSelection<Prisma.$PlatformUserPayload>;
export type AggregatePlatformUser = {
    _count: PlatformUserCountAggregateOutputType | null;
    _avg: PlatformUserAvgAggregateOutputType | null;
    _sum: PlatformUserSumAggregateOutputType | null;
    _min: PlatformUserMinAggregateOutputType | null;
    _max: PlatformUserMaxAggregateOutputType | null;
};
export type PlatformUserAvgAggregateOutputType = {
    authenticationRevision: number | null;
};
export type PlatformUserSumAggregateOutputType = {
    authenticationRevision: number | null;
};
export type PlatformUserMinAggregateOutputType = {
    id: string | null;
    status: $Enums.PlatformUserStatus | null;
    authenticationRevision: number | null;
    statusReasonCode: $Enums.PlatformUserStatusReasonCode | null;
    suspendedAt: Date | null;
    disabledAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PlatformUserMaxAggregateOutputType = {
    id: string | null;
    status: $Enums.PlatformUserStatus | null;
    authenticationRevision: number | null;
    statusReasonCode: $Enums.PlatformUserStatusReasonCode | null;
    suspendedAt: Date | null;
    disabledAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type PlatformUserCountAggregateOutputType = {
    id: number;
    status: number;
    authenticationRevision: number;
    statusReasonCode: number;
    suspendedAt: number;
    disabledAt: number;
    deletedAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type PlatformUserAvgAggregateInputType = {
    authenticationRevision?: true;
};
export type PlatformUserSumAggregateInputType = {
    authenticationRevision?: true;
};
export type PlatformUserMinAggregateInputType = {
    id?: true;
    status?: true;
    authenticationRevision?: true;
    statusReasonCode?: true;
    suspendedAt?: true;
    disabledAt?: true;
    deletedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PlatformUserMaxAggregateInputType = {
    id?: true;
    status?: true;
    authenticationRevision?: true;
    statusReasonCode?: true;
    suspendedAt?: true;
    disabledAt?: true;
    deletedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type PlatformUserCountAggregateInputType = {
    id?: true;
    status?: true;
    authenticationRevision?: true;
    statusReasonCode?: true;
    suspendedAt?: true;
    disabledAt?: true;
    deletedAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type PlatformUserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PlatformUser to aggregate.
     */
    where?: Prisma.PlatformUserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlatformUsers to fetch.
     */
    orderBy?: Prisma.PlatformUserOrderByWithRelationInput | Prisma.PlatformUserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.PlatformUserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlatformUsers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlatformUsers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned PlatformUsers
    **/
    _count?: true | PlatformUserCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: PlatformUserAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: PlatformUserSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PlatformUserMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PlatformUserMaxAggregateInputType;
};
export type GetPlatformUserAggregateType<T extends PlatformUserAggregateArgs> = {
    [P in keyof T & keyof AggregatePlatformUser]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePlatformUser[P]> : Prisma.GetScalarType<T[P], AggregatePlatformUser[P]>;
};
export type PlatformUserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PlatformUserWhereInput;
    orderBy?: Prisma.PlatformUserOrderByWithAggregationInput | Prisma.PlatformUserOrderByWithAggregationInput[];
    by: Prisma.PlatformUserScalarFieldEnum[] | Prisma.PlatformUserScalarFieldEnum;
    having?: Prisma.PlatformUserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PlatformUserCountAggregateInputType | true;
    _avg?: PlatformUserAvgAggregateInputType;
    _sum?: PlatformUserSumAggregateInputType;
    _min?: PlatformUserMinAggregateInputType;
    _max?: PlatformUserMaxAggregateInputType;
};
export type PlatformUserGroupByOutputType = {
    id: string;
    status: $Enums.PlatformUserStatus;
    authenticationRevision: number;
    statusReasonCode: $Enums.PlatformUserStatusReasonCode;
    suspendedAt: Date | null;
    disabledAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: PlatformUserCountAggregateOutputType | null;
    _avg: PlatformUserAvgAggregateOutputType | null;
    _sum: PlatformUserSumAggregateOutputType | null;
    _min: PlatformUserMinAggregateOutputType | null;
    _max: PlatformUserMaxAggregateOutputType | null;
};
export type GetPlatformUserGroupByPayload<T extends PlatformUserGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PlatformUserGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PlatformUserGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PlatformUserGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PlatformUserGroupByOutputType[P]>;
}>>;
export type PlatformUserWhereInput = {
    AND?: Prisma.PlatformUserWhereInput | Prisma.PlatformUserWhereInput[];
    OR?: Prisma.PlatformUserWhereInput[];
    NOT?: Prisma.PlatformUserWhereInput | Prisma.PlatformUserWhereInput[];
    id?: Prisma.UuidFilter<"PlatformUser"> | string;
    status?: Prisma.EnumPlatformUserStatusFilter<"PlatformUser"> | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFilter<"PlatformUser"> | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFilter<"PlatformUser"> | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.DateTimeNullableFilter<"PlatformUser"> | Date | string | null;
    disabledAt?: Prisma.DateTimeNullableFilter<"PlatformUser"> | Date | string | null;
    deletedAt?: Prisma.DateTimeNullableFilter<"PlatformUser"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"PlatformUser"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"PlatformUser"> | Date | string;
    externalIdentities?: Prisma.ExternalIdentityListRelationFilter;
    browserSessions?: Prisma.BrowserSessionListRelationFilter;
    oauthTransactions?: Prisma.OAuthTransactionListRelationFilter;
    auditActorEvents?: Prisma.AuthenticationAuditEventListRelationFilter;
    auditTargetEvents?: Prisma.AuthenticationAuditEventListRelationFilter;
};
export type PlatformUserOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    authenticationRevision?: Prisma.SortOrder;
    statusReasonCode?: Prisma.SortOrder;
    suspendedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    disabledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    externalIdentities?: Prisma.ExternalIdentityOrderByRelationAggregateInput;
    browserSessions?: Prisma.BrowserSessionOrderByRelationAggregateInput;
    oauthTransactions?: Prisma.OAuthTransactionOrderByRelationAggregateInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventOrderByRelationAggregateInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventOrderByRelationAggregateInput;
};
export type PlatformUserWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PlatformUserWhereInput | Prisma.PlatformUserWhereInput[];
    OR?: Prisma.PlatformUserWhereInput[];
    NOT?: Prisma.PlatformUserWhereInput | Prisma.PlatformUserWhereInput[];
    status?: Prisma.EnumPlatformUserStatusFilter<"PlatformUser"> | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFilter<"PlatformUser"> | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFilter<"PlatformUser"> | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.DateTimeNullableFilter<"PlatformUser"> | Date | string | null;
    disabledAt?: Prisma.DateTimeNullableFilter<"PlatformUser"> | Date | string | null;
    deletedAt?: Prisma.DateTimeNullableFilter<"PlatformUser"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"PlatformUser"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"PlatformUser"> | Date | string;
    externalIdentities?: Prisma.ExternalIdentityListRelationFilter;
    browserSessions?: Prisma.BrowserSessionListRelationFilter;
    oauthTransactions?: Prisma.OAuthTransactionListRelationFilter;
    auditActorEvents?: Prisma.AuthenticationAuditEventListRelationFilter;
    auditTargetEvents?: Prisma.AuthenticationAuditEventListRelationFilter;
}, "id">;
export type PlatformUserOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    authenticationRevision?: Prisma.SortOrder;
    statusReasonCode?: Prisma.SortOrder;
    suspendedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    disabledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    deletedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.PlatformUserCountOrderByAggregateInput;
    _avg?: Prisma.PlatformUserAvgOrderByAggregateInput;
    _max?: Prisma.PlatformUserMaxOrderByAggregateInput;
    _min?: Prisma.PlatformUserMinOrderByAggregateInput;
    _sum?: Prisma.PlatformUserSumOrderByAggregateInput;
};
export type PlatformUserScalarWhereWithAggregatesInput = {
    AND?: Prisma.PlatformUserScalarWhereWithAggregatesInput | Prisma.PlatformUserScalarWhereWithAggregatesInput[];
    OR?: Prisma.PlatformUserScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PlatformUserScalarWhereWithAggregatesInput | Prisma.PlatformUserScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"PlatformUser"> | string;
    status?: Prisma.EnumPlatformUserStatusWithAggregatesFilter<"PlatformUser"> | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntWithAggregatesFilter<"PlatformUser"> | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeWithAggregatesFilter<"PlatformUser"> | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"PlatformUser"> | Date | string | null;
    disabledAt?: Prisma.DateTimeNullableWithAggregatesFilter<"PlatformUser"> | Date | string | null;
    deletedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"PlatformUser"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"PlatformUser"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"PlatformUser"> | Date | string;
};
export type PlatformUserCreateInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityCreateNestedManyWithoutPlatformUserInput;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutActorPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserUncheckedCreateInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedCreateNestedManyWithoutPlatformUserInput;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutActorPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUpdateManyWithoutPlatformUserNestedInput;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutActorPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedUpdateManyWithoutPlatformUserNestedInput;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutActorPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserCreateManyInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type PlatformUserUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlatformUserUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PlatformUserCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    authenticationRevision?: Prisma.SortOrder;
    statusReasonCode?: Prisma.SortOrder;
    suspendedAt?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlatformUserAvgOrderByAggregateInput = {
    authenticationRevision?: Prisma.SortOrder;
};
export type PlatformUserMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    authenticationRevision?: Prisma.SortOrder;
    statusReasonCode?: Prisma.SortOrder;
    suspendedAt?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlatformUserMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    authenticationRevision?: Prisma.SortOrder;
    statusReasonCode?: Prisma.SortOrder;
    suspendedAt?: Prisma.SortOrder;
    disabledAt?: Prisma.SortOrder;
    deletedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type PlatformUserSumOrderByAggregateInput = {
    authenticationRevision?: Prisma.SortOrder;
};
export type PlatformUserScalarRelationFilter = {
    is?: Prisma.PlatformUserWhereInput;
    isNot?: Prisma.PlatformUserWhereInput;
};
export type PlatformUserNullableScalarRelationFilter = {
    is?: Prisma.PlatformUserWhereInput | null;
    isNot?: Prisma.PlatformUserWhereInput | null;
};
export type EnumPlatformUserStatusFieldUpdateOperationsInput = {
    set?: $Enums.PlatformUserStatus;
};
export type EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput = {
    set?: $Enums.PlatformUserStatusReasonCode;
};
export type PlatformUserCreateNestedOneWithoutExternalIdentitiesInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutExternalIdentitiesInput, Prisma.PlatformUserUncheckedCreateWithoutExternalIdentitiesInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutExternalIdentitiesInput;
    connect?: Prisma.PlatformUserWhereUniqueInput;
};
export type PlatformUserUpdateOneRequiredWithoutExternalIdentitiesNestedInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutExternalIdentitiesInput, Prisma.PlatformUserUncheckedCreateWithoutExternalIdentitiesInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutExternalIdentitiesInput;
    upsert?: Prisma.PlatformUserUpsertWithoutExternalIdentitiesInput;
    connect?: Prisma.PlatformUserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PlatformUserUpdateToOneWithWhereWithoutExternalIdentitiesInput, Prisma.PlatformUserUpdateWithoutExternalIdentitiesInput>, Prisma.PlatformUserUncheckedUpdateWithoutExternalIdentitiesInput>;
};
export type PlatformUserCreateNestedOneWithoutBrowserSessionsInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutBrowserSessionsInput, Prisma.PlatformUserUncheckedCreateWithoutBrowserSessionsInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutBrowserSessionsInput;
    connect?: Prisma.PlatformUserWhereUniqueInput;
};
export type PlatformUserUpdateOneRequiredWithoutBrowserSessionsNestedInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutBrowserSessionsInput, Prisma.PlatformUserUncheckedCreateWithoutBrowserSessionsInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutBrowserSessionsInput;
    upsert?: Prisma.PlatformUserUpsertWithoutBrowserSessionsInput;
    connect?: Prisma.PlatformUserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PlatformUserUpdateToOneWithWhereWithoutBrowserSessionsInput, Prisma.PlatformUserUpdateWithoutBrowserSessionsInput>, Prisma.PlatformUserUncheckedUpdateWithoutBrowserSessionsInput>;
};
export type PlatformUserCreateNestedOneWithoutOauthTransactionsInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutOauthTransactionsInput, Prisma.PlatformUserUncheckedCreateWithoutOauthTransactionsInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutOauthTransactionsInput;
    connect?: Prisma.PlatformUserWhereUniqueInput;
};
export type PlatformUserUpdateOneWithoutOauthTransactionsNestedInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutOauthTransactionsInput, Prisma.PlatformUserUncheckedCreateWithoutOauthTransactionsInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutOauthTransactionsInput;
    upsert?: Prisma.PlatformUserUpsertWithoutOauthTransactionsInput;
    disconnect?: Prisma.PlatformUserWhereInput | boolean;
    delete?: Prisma.PlatformUserWhereInput | boolean;
    connect?: Prisma.PlatformUserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PlatformUserUpdateToOneWithWhereWithoutOauthTransactionsInput, Prisma.PlatformUserUpdateWithoutOauthTransactionsInput>, Prisma.PlatformUserUncheckedUpdateWithoutOauthTransactionsInput>;
};
export type PlatformUserCreateNestedOneWithoutAuditActorEventsInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutAuditActorEventsInput, Prisma.PlatformUserUncheckedCreateWithoutAuditActorEventsInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutAuditActorEventsInput;
    connect?: Prisma.PlatformUserWhereUniqueInput;
};
export type PlatformUserCreateNestedOneWithoutAuditTargetEventsInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutAuditTargetEventsInput, Prisma.PlatformUserUncheckedCreateWithoutAuditTargetEventsInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutAuditTargetEventsInput;
    connect?: Prisma.PlatformUserWhereUniqueInput;
};
export type PlatformUserUpdateOneWithoutAuditActorEventsNestedInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutAuditActorEventsInput, Prisma.PlatformUserUncheckedCreateWithoutAuditActorEventsInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutAuditActorEventsInput;
    upsert?: Prisma.PlatformUserUpsertWithoutAuditActorEventsInput;
    disconnect?: Prisma.PlatformUserWhereInput | boolean;
    delete?: Prisma.PlatformUserWhereInput | boolean;
    connect?: Prisma.PlatformUserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PlatformUserUpdateToOneWithWhereWithoutAuditActorEventsInput, Prisma.PlatformUserUpdateWithoutAuditActorEventsInput>, Prisma.PlatformUserUncheckedUpdateWithoutAuditActorEventsInput>;
};
export type PlatformUserUpdateOneWithoutAuditTargetEventsNestedInput = {
    create?: Prisma.XOR<Prisma.PlatformUserCreateWithoutAuditTargetEventsInput, Prisma.PlatformUserUncheckedCreateWithoutAuditTargetEventsInput>;
    connectOrCreate?: Prisma.PlatformUserCreateOrConnectWithoutAuditTargetEventsInput;
    upsert?: Prisma.PlatformUserUpsertWithoutAuditTargetEventsInput;
    disconnect?: Prisma.PlatformUserWhereInput | boolean;
    delete?: Prisma.PlatformUserWhereInput | boolean;
    connect?: Prisma.PlatformUserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PlatformUserUpdateToOneWithWhereWithoutAuditTargetEventsInput, Prisma.PlatformUserUpdateWithoutAuditTargetEventsInput>, Prisma.PlatformUserUncheckedUpdateWithoutAuditTargetEventsInput>;
};
export type PlatformUserCreateWithoutExternalIdentitiesInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutActorPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserUncheckedCreateWithoutExternalIdentitiesInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutActorPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserCreateOrConnectWithoutExternalIdentitiesInput = {
    where: Prisma.PlatformUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutExternalIdentitiesInput, Prisma.PlatformUserUncheckedCreateWithoutExternalIdentitiesInput>;
};
export type PlatformUserUpsertWithoutExternalIdentitiesInput = {
    update: Prisma.XOR<Prisma.PlatformUserUpdateWithoutExternalIdentitiesInput, Prisma.PlatformUserUncheckedUpdateWithoutExternalIdentitiesInput>;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutExternalIdentitiesInput, Prisma.PlatformUserUncheckedCreateWithoutExternalIdentitiesInput>;
    where?: Prisma.PlatformUserWhereInput;
};
export type PlatformUserUpdateToOneWithWhereWithoutExternalIdentitiesInput = {
    where?: Prisma.PlatformUserWhereInput;
    data: Prisma.XOR<Prisma.PlatformUserUpdateWithoutExternalIdentitiesInput, Prisma.PlatformUserUncheckedUpdateWithoutExternalIdentitiesInput>;
};
export type PlatformUserUpdateWithoutExternalIdentitiesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutActorPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserUncheckedUpdateWithoutExternalIdentitiesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutActorPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserCreateWithoutBrowserSessionsInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutActorPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserUncheckedCreateWithoutBrowserSessionsInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutActorPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserCreateOrConnectWithoutBrowserSessionsInput = {
    where: Prisma.PlatformUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutBrowserSessionsInput, Prisma.PlatformUserUncheckedCreateWithoutBrowserSessionsInput>;
};
export type PlatformUserUpsertWithoutBrowserSessionsInput = {
    update: Prisma.XOR<Prisma.PlatformUserUpdateWithoutBrowserSessionsInput, Prisma.PlatformUserUncheckedUpdateWithoutBrowserSessionsInput>;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutBrowserSessionsInput, Prisma.PlatformUserUncheckedCreateWithoutBrowserSessionsInput>;
    where?: Prisma.PlatformUserWhereInput;
};
export type PlatformUserUpdateToOneWithWhereWithoutBrowserSessionsInput = {
    where?: Prisma.PlatformUserWhereInput;
    data: Prisma.XOR<Prisma.PlatformUserUpdateWithoutBrowserSessionsInput, Prisma.PlatformUserUncheckedUpdateWithoutBrowserSessionsInput>;
};
export type PlatformUserUpdateWithoutBrowserSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutActorPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserUncheckedUpdateWithoutBrowserSessionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutActorPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserCreateWithoutOauthTransactionsInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityCreateNestedManyWithoutPlatformUserInput;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutActorPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserUncheckedCreateWithoutOauthTransactionsInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedCreateNestedManyWithoutPlatformUserInput;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutActorPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserCreateOrConnectWithoutOauthTransactionsInput = {
    where: Prisma.PlatformUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutOauthTransactionsInput, Prisma.PlatformUserUncheckedCreateWithoutOauthTransactionsInput>;
};
export type PlatformUserUpsertWithoutOauthTransactionsInput = {
    update: Prisma.XOR<Prisma.PlatformUserUpdateWithoutOauthTransactionsInput, Prisma.PlatformUserUncheckedUpdateWithoutOauthTransactionsInput>;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutOauthTransactionsInput, Prisma.PlatformUserUncheckedCreateWithoutOauthTransactionsInput>;
    where?: Prisma.PlatformUserWhereInput;
};
export type PlatformUserUpdateToOneWithWhereWithoutOauthTransactionsInput = {
    where?: Prisma.PlatformUserWhereInput;
    data: Prisma.XOR<Prisma.PlatformUserUpdateWithoutOauthTransactionsInput, Prisma.PlatformUserUncheckedUpdateWithoutOauthTransactionsInput>;
};
export type PlatformUserUpdateWithoutOauthTransactionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUpdateManyWithoutPlatformUserNestedInput;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutActorPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserUncheckedUpdateWithoutOauthTransactionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedUpdateManyWithoutPlatformUserNestedInput;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutActorPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserCreateWithoutAuditActorEventsInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityCreateNestedManyWithoutPlatformUserInput;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionCreateNestedManyWithoutPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserUncheckedCreateWithoutAuditActorEventsInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedCreateNestedManyWithoutPlatformUserInput;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedCreateNestedManyWithoutPlatformUserInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutTargetPlatformUserInput;
};
export type PlatformUserCreateOrConnectWithoutAuditActorEventsInput = {
    where: Prisma.PlatformUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutAuditActorEventsInput, Prisma.PlatformUserUncheckedCreateWithoutAuditActorEventsInput>;
};
export type PlatformUserCreateWithoutAuditTargetEventsInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityCreateNestedManyWithoutPlatformUserInput;
    browserSessions?: Prisma.BrowserSessionCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventCreateNestedManyWithoutActorPlatformUserInput;
};
export type PlatformUserUncheckedCreateWithoutAuditTargetEventsInput = {
    id?: string;
    status?: $Enums.PlatformUserStatus;
    authenticationRevision?: number;
    statusReasonCode?: $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Date | string | null;
    disabledAt?: Date | string | null;
    deletedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedCreateNestedManyWithoutPlatformUserInput;
    browserSessions?: Prisma.BrowserSessionUncheckedCreateNestedManyWithoutPlatformUserInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedCreateNestedManyWithoutPlatformUserInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedCreateNestedManyWithoutActorPlatformUserInput;
};
export type PlatformUserCreateOrConnectWithoutAuditTargetEventsInput = {
    where: Prisma.PlatformUserWhereUniqueInput;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutAuditTargetEventsInput, Prisma.PlatformUserUncheckedCreateWithoutAuditTargetEventsInput>;
};
export type PlatformUserUpsertWithoutAuditActorEventsInput = {
    update: Prisma.XOR<Prisma.PlatformUserUpdateWithoutAuditActorEventsInput, Prisma.PlatformUserUncheckedUpdateWithoutAuditActorEventsInput>;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutAuditActorEventsInput, Prisma.PlatformUserUncheckedCreateWithoutAuditActorEventsInput>;
    where?: Prisma.PlatformUserWhereInput;
};
export type PlatformUserUpdateToOneWithWhereWithoutAuditActorEventsInput = {
    where?: Prisma.PlatformUserWhereInput;
    data: Prisma.XOR<Prisma.PlatformUserUpdateWithoutAuditActorEventsInput, Prisma.PlatformUserUncheckedUpdateWithoutAuditActorEventsInput>;
};
export type PlatformUserUpdateWithoutAuditActorEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUpdateManyWithoutPlatformUserNestedInput;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUpdateManyWithoutPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserUncheckedUpdateWithoutAuditActorEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedUpdateManyWithoutPlatformUserNestedInput;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    auditTargetEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutTargetPlatformUserNestedInput;
};
export type PlatformUserUpsertWithoutAuditTargetEventsInput = {
    update: Prisma.XOR<Prisma.PlatformUserUpdateWithoutAuditTargetEventsInput, Prisma.PlatformUserUncheckedUpdateWithoutAuditTargetEventsInput>;
    create: Prisma.XOR<Prisma.PlatformUserCreateWithoutAuditTargetEventsInput, Prisma.PlatformUserUncheckedCreateWithoutAuditTargetEventsInput>;
    where?: Prisma.PlatformUserWhereInput;
};
export type PlatformUserUpdateToOneWithWhereWithoutAuditTargetEventsInput = {
    where?: Prisma.PlatformUserWhereInput;
    data: Prisma.XOR<Prisma.PlatformUserUpdateWithoutAuditTargetEventsInput, Prisma.PlatformUserUncheckedUpdateWithoutAuditTargetEventsInput>;
};
export type PlatformUserUpdateWithoutAuditTargetEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUpdateManyWithoutPlatformUserNestedInput;
    browserSessions?: Prisma.BrowserSessionUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUpdateManyWithoutActorPlatformUserNestedInput;
};
export type PlatformUserUncheckedUpdateWithoutAuditTargetEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumPlatformUserStatusFieldUpdateOperationsInput | $Enums.PlatformUserStatus;
    authenticationRevision?: Prisma.IntFieldUpdateOperationsInput | number;
    statusReasonCode?: Prisma.EnumPlatformUserStatusReasonCodeFieldUpdateOperationsInput | $Enums.PlatformUserStatusReasonCode;
    suspendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    disabledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    deletedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    externalIdentities?: Prisma.ExternalIdentityUncheckedUpdateManyWithoutPlatformUserNestedInput;
    browserSessions?: Prisma.BrowserSessionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    oauthTransactions?: Prisma.OAuthTransactionUncheckedUpdateManyWithoutPlatformUserNestedInput;
    auditActorEvents?: Prisma.AuthenticationAuditEventUncheckedUpdateManyWithoutActorPlatformUserNestedInput;
};
/**
 * Count Type PlatformUserCountOutputType
 */
export type PlatformUserCountOutputType = {
    externalIdentities: number;
    browserSessions: number;
    oauthTransactions: number;
    auditActorEvents: number;
    auditTargetEvents: number;
};
export type PlatformUserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    externalIdentities?: boolean | PlatformUserCountOutputTypeCountExternalIdentitiesArgs;
    browserSessions?: boolean | PlatformUserCountOutputTypeCountBrowserSessionsArgs;
    oauthTransactions?: boolean | PlatformUserCountOutputTypeCountOauthTransactionsArgs;
    auditActorEvents?: boolean | PlatformUserCountOutputTypeCountAuditActorEventsArgs;
    auditTargetEvents?: boolean | PlatformUserCountOutputTypeCountAuditTargetEventsArgs;
};
/**
 * PlatformUserCountOutputType without action
 */
export type PlatformUserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUserCountOutputType
     */
    select?: Prisma.PlatformUserCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * PlatformUserCountOutputType without action
 */
export type PlatformUserCountOutputTypeCountExternalIdentitiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ExternalIdentityWhereInput;
};
/**
 * PlatformUserCountOutputType without action
 */
export type PlatformUserCountOutputTypeCountBrowserSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BrowserSessionWhereInput;
};
/**
 * PlatformUserCountOutputType without action
 */
export type PlatformUserCountOutputTypeCountOauthTransactionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OAuthTransactionWhereInput;
};
/**
 * PlatformUserCountOutputType without action
 */
export type PlatformUserCountOutputTypeCountAuditActorEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuthenticationAuditEventWhereInput;
};
/**
 * PlatformUserCountOutputType without action
 */
export type PlatformUserCountOutputTypeCountAuditTargetEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AuthenticationAuditEventWhereInput;
};
export type PlatformUserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    authenticationRevision?: boolean;
    statusReasonCode?: boolean;
    suspendedAt?: boolean;
    disabledAt?: boolean;
    deletedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    externalIdentities?: boolean | Prisma.PlatformUser$externalIdentitiesArgs<ExtArgs>;
    browserSessions?: boolean | Prisma.PlatformUser$browserSessionsArgs<ExtArgs>;
    oauthTransactions?: boolean | Prisma.PlatformUser$oauthTransactionsArgs<ExtArgs>;
    auditActorEvents?: boolean | Prisma.PlatformUser$auditActorEventsArgs<ExtArgs>;
    auditTargetEvents?: boolean | Prisma.PlatformUser$auditTargetEventsArgs<ExtArgs>;
    _count?: boolean | Prisma.PlatformUserCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["platformUser"]>;
export type PlatformUserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    authenticationRevision?: boolean;
    statusReasonCode?: boolean;
    suspendedAt?: boolean;
    disabledAt?: boolean;
    deletedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["platformUser"]>;
export type PlatformUserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    authenticationRevision?: boolean;
    statusReasonCode?: boolean;
    suspendedAt?: boolean;
    disabledAt?: boolean;
    deletedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["platformUser"]>;
export type PlatformUserSelectScalar = {
    id?: boolean;
    status?: boolean;
    authenticationRevision?: boolean;
    statusReasonCode?: boolean;
    suspendedAt?: boolean;
    disabledAt?: boolean;
    deletedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type PlatformUserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "status" | "authenticationRevision" | "statusReasonCode" | "suspendedAt" | "disabledAt" | "deletedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["platformUser"]>;
export type PlatformUserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    externalIdentities?: boolean | Prisma.PlatformUser$externalIdentitiesArgs<ExtArgs>;
    browserSessions?: boolean | Prisma.PlatformUser$browserSessionsArgs<ExtArgs>;
    oauthTransactions?: boolean | Prisma.PlatformUser$oauthTransactionsArgs<ExtArgs>;
    auditActorEvents?: boolean | Prisma.PlatformUser$auditActorEventsArgs<ExtArgs>;
    auditTargetEvents?: boolean | Prisma.PlatformUser$auditTargetEventsArgs<ExtArgs>;
    _count?: boolean | Prisma.PlatformUserCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PlatformUserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type PlatformUserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $PlatformUserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "PlatformUser";
    objects: {
        externalIdentities: Prisma.$ExternalIdentityPayload<ExtArgs>[];
        browserSessions: Prisma.$BrowserSessionPayload<ExtArgs>[];
        oauthTransactions: Prisma.$OAuthTransactionPayload<ExtArgs>[];
        auditActorEvents: Prisma.$AuthenticationAuditEventPayload<ExtArgs>[];
        auditTargetEvents: Prisma.$AuthenticationAuditEventPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        status: $Enums.PlatformUserStatus;
        authenticationRevision: number;
        statusReasonCode: $Enums.PlatformUserStatusReasonCode;
        suspendedAt: Date | null;
        disabledAt: Date | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["platformUser"]>;
    composites: {};
};
export type PlatformUserGetPayload<S extends boolean | null | undefined | PlatformUserDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload, S>;
export type PlatformUserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PlatformUserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PlatformUserCountAggregateInputType | true;
};
export interface PlatformUserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['PlatformUser'];
        meta: {
            name: 'PlatformUser';
        };
    };
    /**
     * Find zero or one PlatformUser that matches the filter.
     * @param {PlatformUserFindUniqueArgs} args - Arguments to find a PlatformUser
     * @example
     * // Get one PlatformUser
     * const platformUser = await prisma.platformUser.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlatformUserFindUniqueArgs>(args: Prisma.SelectSubset<T, PlatformUserFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one PlatformUser that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PlatformUserFindUniqueOrThrowArgs} args - Arguments to find a PlatformUser
     * @example
     * // Get one PlatformUser
     * const platformUser = await prisma.platformUser.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlatformUserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PlatformUserFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PlatformUser that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformUserFindFirstArgs} args - Arguments to find a PlatformUser
     * @example
     * // Get one PlatformUser
     * const platformUser = await prisma.platformUser.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlatformUserFindFirstArgs>(args?: Prisma.SelectSubset<T, PlatformUserFindFirstArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first PlatformUser that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformUserFindFirstOrThrowArgs} args - Arguments to find a PlatformUser
     * @example
     * // Get one PlatformUser
     * const platformUser = await prisma.platformUser.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlatformUserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PlatformUserFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more PlatformUsers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformUserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlatformUsers
     * const platformUsers = await prisma.platformUser.findMany()
     *
     * // Get first 10 PlatformUsers
     * const platformUsers = await prisma.platformUser.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const platformUserWithIdOnly = await prisma.platformUser.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PlatformUserFindManyArgs>(args?: Prisma.SelectSubset<T, PlatformUserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a PlatformUser.
     * @param {PlatformUserCreateArgs} args - Arguments to create a PlatformUser.
     * @example
     * // Create one PlatformUser
     * const PlatformUser = await prisma.platformUser.create({
     *   data: {
     *     // ... data to create a PlatformUser
     *   }
     * })
     *
     */
    create<T extends PlatformUserCreateArgs>(args: Prisma.SelectSubset<T, PlatformUserCreateArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many PlatformUsers.
     * @param {PlatformUserCreateManyArgs} args - Arguments to create many PlatformUsers.
     * @example
     * // Create many PlatformUsers
     * const platformUser = await prisma.platformUser.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PlatformUserCreateManyArgs>(args?: Prisma.SelectSubset<T, PlatformUserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many PlatformUsers and returns the data saved in the database.
     * @param {PlatformUserCreateManyAndReturnArgs} args - Arguments to create many PlatformUsers.
     * @example
     * // Create many PlatformUsers
     * const platformUser = await prisma.platformUser.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many PlatformUsers and only return the `id`
     * const platformUserWithIdOnly = await prisma.platformUser.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PlatformUserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PlatformUserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a PlatformUser.
     * @param {PlatformUserDeleteArgs} args - Arguments to delete one PlatformUser.
     * @example
     * // Delete one PlatformUser
     * const PlatformUser = await prisma.platformUser.delete({
     *   where: {
     *     // ... filter to delete one PlatformUser
     *   }
     * })
     *
     */
    delete<T extends PlatformUserDeleteArgs>(args: Prisma.SelectSubset<T, PlatformUserDeleteArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one PlatformUser.
     * @param {PlatformUserUpdateArgs} args - Arguments to update one PlatformUser.
     * @example
     * // Update one PlatformUser
     * const platformUser = await prisma.platformUser.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PlatformUserUpdateArgs>(args: Prisma.SelectSubset<T, PlatformUserUpdateArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more PlatformUsers.
     * @param {PlatformUserDeleteManyArgs} args - Arguments to filter PlatformUsers to delete.
     * @example
     * // Delete a few PlatformUsers
     * const { count } = await prisma.platformUser.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PlatformUserDeleteManyArgs>(args?: Prisma.SelectSubset<T, PlatformUserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PlatformUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformUserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlatformUsers
     * const platformUser = await prisma.platformUser.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PlatformUserUpdateManyArgs>(args: Prisma.SelectSubset<T, PlatformUserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more PlatformUsers and returns the data updated in the database.
     * @param {PlatformUserUpdateManyAndReturnArgs} args - Arguments to update many PlatformUsers.
     * @example
     * // Update many PlatformUsers
     * const platformUser = await prisma.platformUser.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more PlatformUsers and only return the `id`
     * const platformUserWithIdOnly = await prisma.platformUser.updateManyAndReturn({
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
    updateManyAndReturn<T extends PlatformUserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PlatformUserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one PlatformUser.
     * @param {PlatformUserUpsertArgs} args - Arguments to update or create a PlatformUser.
     * @example
     * // Update or create a PlatformUser
     * const platformUser = await prisma.platformUser.upsert({
     *   create: {
     *     // ... data to create a PlatformUser
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlatformUser we want to update
     *   }
     * })
     */
    upsert<T extends PlatformUserUpsertArgs>(args: Prisma.SelectSubset<T, PlatformUserUpsertArgs<ExtArgs>>): Prisma.Prisma__PlatformUserClient<runtime.Types.Result.GetResult<Prisma.$PlatformUserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of PlatformUsers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformUserCountArgs} args - Arguments to filter PlatformUsers to count.
     * @example
     * // Count the number of PlatformUsers
     * const count = await prisma.platformUser.count({
     *   where: {
     *     // ... the filter for the PlatformUsers we want to count
     *   }
     * })
    **/
    count<T extends PlatformUserCountArgs>(args?: Prisma.Subset<T, PlatformUserCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PlatformUserCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a PlatformUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformUserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PlatformUserAggregateArgs>(args: Prisma.Subset<T, PlatformUserAggregateArgs>): Prisma.PrismaPromise<GetPlatformUserAggregateType<T>>;
    /**
     * Group by PlatformUser.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlatformUserGroupByArgs} args - Group by arguments.
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
    groupBy<T extends PlatformUserGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PlatformUserGroupByArgs['orderBy'];
    } : {
        orderBy?: PlatformUserGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PlatformUserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlatformUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the PlatformUser model
     */
    readonly fields: PlatformUserFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for PlatformUser.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__PlatformUserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    externalIdentities<T extends Prisma.PlatformUser$externalIdentitiesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PlatformUser$externalIdentitiesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ExternalIdentityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    browserSessions<T extends Prisma.PlatformUser$browserSessionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PlatformUser$browserSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BrowserSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    oauthTransactions<T extends Prisma.PlatformUser$oauthTransactionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PlatformUser$oauthTransactionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OAuthTransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    auditActorEvents<T extends Prisma.PlatformUser$auditActorEventsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PlatformUser$auditActorEventsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuthenticationAuditEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    auditTargetEvents<T extends Prisma.PlatformUser$auditTargetEventsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PlatformUser$auditTargetEventsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AuthenticationAuditEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the PlatformUser model
 */
export interface PlatformUserFieldRefs {
    readonly id: Prisma.FieldRef<"PlatformUser", 'String'>;
    readonly status: Prisma.FieldRef<"PlatformUser", 'PlatformUserStatus'>;
    readonly authenticationRevision: Prisma.FieldRef<"PlatformUser", 'Int'>;
    readonly statusReasonCode: Prisma.FieldRef<"PlatformUser", 'PlatformUserStatusReasonCode'>;
    readonly suspendedAt: Prisma.FieldRef<"PlatformUser", 'DateTime'>;
    readonly disabledAt: Prisma.FieldRef<"PlatformUser", 'DateTime'>;
    readonly deletedAt: Prisma.FieldRef<"PlatformUser", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"PlatformUser", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"PlatformUser", 'DateTime'>;
}
/**
 * PlatformUser findUnique
 */
export type PlatformUserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * Filter, which PlatformUser to fetch.
     */
    where: Prisma.PlatformUserWhereUniqueInput;
};
/**
 * PlatformUser findUniqueOrThrow
 */
export type PlatformUserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * Filter, which PlatformUser to fetch.
     */
    where: Prisma.PlatformUserWhereUniqueInput;
};
/**
 * PlatformUser findFirst
 */
export type PlatformUserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * Filter, which PlatformUser to fetch.
     */
    where?: Prisma.PlatformUserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlatformUsers to fetch.
     */
    orderBy?: Prisma.PlatformUserOrderByWithRelationInput | Prisma.PlatformUserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PlatformUsers.
     */
    cursor?: Prisma.PlatformUserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlatformUsers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlatformUsers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlatformUsers.
     */
    distinct?: Prisma.PlatformUserScalarFieldEnum | Prisma.PlatformUserScalarFieldEnum[];
};
/**
 * PlatformUser findFirstOrThrow
 */
export type PlatformUserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * Filter, which PlatformUser to fetch.
     */
    where?: Prisma.PlatformUserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlatformUsers to fetch.
     */
    orderBy?: Prisma.PlatformUserOrderByWithRelationInput | Prisma.PlatformUserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for PlatformUsers.
     */
    cursor?: Prisma.PlatformUserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlatformUsers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlatformUsers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlatformUsers.
     */
    distinct?: Prisma.PlatformUserScalarFieldEnum | Prisma.PlatformUserScalarFieldEnum[];
};
/**
 * PlatformUser findMany
 */
export type PlatformUserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * Filter, which PlatformUsers to fetch.
     */
    where?: Prisma.PlatformUserWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of PlatformUsers to fetch.
     */
    orderBy?: Prisma.PlatformUserOrderByWithRelationInput | Prisma.PlatformUserOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing PlatformUsers.
     */
    cursor?: Prisma.PlatformUserWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` PlatformUsers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` PlatformUsers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of PlatformUsers.
     */
    distinct?: Prisma.PlatformUserScalarFieldEnum | Prisma.PlatformUserScalarFieldEnum[];
};
/**
 * PlatformUser create
 */
export type PlatformUserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * The data needed to create a PlatformUser.
     */
    data: Prisma.XOR<Prisma.PlatformUserCreateInput, Prisma.PlatformUserUncheckedCreateInput>;
};
/**
 * PlatformUser createMany
 */
export type PlatformUserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlatformUsers.
     */
    data: Prisma.PlatformUserCreateManyInput | Prisma.PlatformUserCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * PlatformUser createManyAndReturn
 */
export type PlatformUserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * The data used to create many PlatformUsers.
     */
    data: Prisma.PlatformUserCreateManyInput | Prisma.PlatformUserCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * PlatformUser update
 */
export type PlatformUserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * The data needed to update a PlatformUser.
     */
    data: Prisma.XOR<Prisma.PlatformUserUpdateInput, Prisma.PlatformUserUncheckedUpdateInput>;
    /**
     * Choose, which PlatformUser to update.
     */
    where: Prisma.PlatformUserWhereUniqueInput;
};
/**
 * PlatformUser updateMany
 */
export type PlatformUserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update PlatformUsers.
     */
    data: Prisma.XOR<Prisma.PlatformUserUpdateManyMutationInput, Prisma.PlatformUserUncheckedUpdateManyInput>;
    /**
     * Filter which PlatformUsers to update
     */
    where?: Prisma.PlatformUserWhereInput;
    /**
     * Limit how many PlatformUsers to update.
     */
    limit?: number;
};
/**
 * PlatformUser updateManyAndReturn
 */
export type PlatformUserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * The data used to update PlatformUsers.
     */
    data: Prisma.XOR<Prisma.PlatformUserUpdateManyMutationInput, Prisma.PlatformUserUncheckedUpdateManyInput>;
    /**
     * Filter which PlatformUsers to update
     */
    where?: Prisma.PlatformUserWhereInput;
    /**
     * Limit how many PlatformUsers to update.
     */
    limit?: number;
};
/**
 * PlatformUser upsert
 */
export type PlatformUserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * The filter to search for the PlatformUser to update in case it exists.
     */
    where: Prisma.PlatformUserWhereUniqueInput;
    /**
     * In case the PlatformUser found by the `where` argument doesn't exist, create a new PlatformUser with this data.
     */
    create: Prisma.XOR<Prisma.PlatformUserCreateInput, Prisma.PlatformUserUncheckedCreateInput>;
    /**
     * In case the PlatformUser was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.PlatformUserUpdateInput, Prisma.PlatformUserUncheckedUpdateInput>;
};
/**
 * PlatformUser delete
 */
export type PlatformUserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
    /**
     * Filter which PlatformUser to delete.
     */
    where: Prisma.PlatformUserWhereUniqueInput;
};
/**
 * PlatformUser deleteMany
 */
export type PlatformUserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which PlatformUsers to delete
     */
    where?: Prisma.PlatformUserWhereInput;
    /**
     * Limit how many PlatformUsers to delete.
     */
    limit?: number;
};
/**
 * PlatformUser.externalIdentities
 */
export type PlatformUser$externalIdentitiesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    where?: Prisma.ExternalIdentityWhereInput;
    orderBy?: Prisma.ExternalIdentityOrderByWithRelationInput | Prisma.ExternalIdentityOrderByWithRelationInput[];
    cursor?: Prisma.ExternalIdentityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ExternalIdentityScalarFieldEnum | Prisma.ExternalIdentityScalarFieldEnum[];
};
/**
 * PlatformUser.browserSessions
 */
export type PlatformUser$browserSessionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * PlatformUser.oauthTransactions
 */
export type PlatformUser$oauthTransactionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OAuthTransaction
     */
    select?: Prisma.OAuthTransactionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the OAuthTransaction
     */
    omit?: Prisma.OAuthTransactionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.OAuthTransactionInclude<ExtArgs> | null;
    where?: Prisma.OAuthTransactionWhereInput;
    orderBy?: Prisma.OAuthTransactionOrderByWithRelationInput | Prisma.OAuthTransactionOrderByWithRelationInput[];
    cursor?: Prisma.OAuthTransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OAuthTransactionScalarFieldEnum | Prisma.OAuthTransactionScalarFieldEnum[];
};
/**
 * PlatformUser.auditActorEvents
 */
export type PlatformUser$auditActorEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * PlatformUser.auditTargetEvents
 */
export type PlatformUser$auditTargetEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * PlatformUser without action
 */
export type PlatformUserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlatformUser
     */
    select?: Prisma.PlatformUserSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the PlatformUser
     */
    omit?: Prisma.PlatformUserOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PlatformUserInclude<ExtArgs> | null;
};
//# sourceMappingURL=PlatformUser.d.ts.map
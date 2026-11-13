import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model DiscordRoleAuditEvent
 *
 */
export type DiscordRoleAuditEventModel = runtime.Types.Result.DefaultSelection<Prisma.$DiscordRoleAuditEventPayload>;
export type AggregateDiscordRoleAuditEvent = {
    _count: DiscordRoleAuditEventCountAggregateOutputType | null;
    _min: DiscordRoleAuditEventMinAggregateOutputType | null;
    _max: DiscordRoleAuditEventMaxAggregateOutputType | null;
};
export type DiscordRoleAuditEventMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    roleId: string | null;
    feature: string | null;
    operation: string | null;
    source: string | null;
    actorType: string | null;
    actorId: string | null;
    summary: string | null;
    result: string | null;
    createdAt: Date | null;
};
export type DiscordRoleAuditEventMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    roleId: string | null;
    feature: string | null;
    operation: string | null;
    source: string | null;
    actorType: string | null;
    actorId: string | null;
    summary: string | null;
    result: string | null;
    createdAt: Date | null;
};
export type DiscordRoleAuditEventCountAggregateOutputType = {
    id: number;
    guildId: number;
    roleId: number;
    feature: number;
    operation: number;
    source: number;
    actorType: number;
    actorId: number;
    summary: number;
    result: number;
    metadata: number;
    createdAt: number;
    _all: number;
};
export type DiscordRoleAuditEventMinAggregateInputType = {
    id?: true;
    guildId?: true;
    roleId?: true;
    feature?: true;
    operation?: true;
    source?: true;
    actorType?: true;
    actorId?: true;
    summary?: true;
    result?: true;
    createdAt?: true;
};
export type DiscordRoleAuditEventMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    roleId?: true;
    feature?: true;
    operation?: true;
    source?: true;
    actorType?: true;
    actorId?: true;
    summary?: true;
    result?: true;
    createdAt?: true;
};
export type DiscordRoleAuditEventCountAggregateInputType = {
    id?: true;
    guildId?: true;
    roleId?: true;
    feature?: true;
    operation?: true;
    source?: true;
    actorType?: true;
    actorId?: true;
    summary?: true;
    result?: true;
    metadata?: true;
    createdAt?: true;
    _all?: true;
};
export type DiscordRoleAuditEventAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DiscordRoleAuditEvent to aggregate.
     */
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DiscordRoleAuditEvents to fetch.
     */
    orderBy?: Prisma.DiscordRoleAuditEventOrderByWithRelationInput | Prisma.DiscordRoleAuditEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DiscordRoleAuditEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DiscordRoleAuditEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DiscordRoleAuditEvents
    **/
    _count?: true | DiscordRoleAuditEventCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: DiscordRoleAuditEventMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: DiscordRoleAuditEventMaxAggregateInputType;
};
export type GetDiscordRoleAuditEventAggregateType<T extends DiscordRoleAuditEventAggregateArgs> = {
    [P in keyof T & keyof AggregateDiscordRoleAuditEvent]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDiscordRoleAuditEvent[P]> : Prisma.GetScalarType<T[P], AggregateDiscordRoleAuditEvent[P]>;
};
export type DiscordRoleAuditEventGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    orderBy?: Prisma.DiscordRoleAuditEventOrderByWithAggregationInput | Prisma.DiscordRoleAuditEventOrderByWithAggregationInput[];
    by: Prisma.DiscordRoleAuditEventScalarFieldEnum[] | Prisma.DiscordRoleAuditEventScalarFieldEnum;
    having?: Prisma.DiscordRoleAuditEventScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DiscordRoleAuditEventCountAggregateInputType | true;
    _min?: DiscordRoleAuditEventMinAggregateInputType;
    _max?: DiscordRoleAuditEventMaxAggregateInputType;
};
export type DiscordRoleAuditEventGroupByOutputType = {
    id: string;
    guildId: string;
    roleId: string | null;
    feature: string;
    operation: string;
    source: string;
    actorType: string;
    actorId: string;
    summary: string;
    result: string;
    metadata: runtime.JsonValue;
    createdAt: Date;
    _count: DiscordRoleAuditEventCountAggregateOutputType | null;
    _min: DiscordRoleAuditEventMinAggregateOutputType | null;
    _max: DiscordRoleAuditEventMaxAggregateOutputType | null;
};
export type GetDiscordRoleAuditEventGroupByPayload<T extends DiscordRoleAuditEventGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DiscordRoleAuditEventGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DiscordRoleAuditEventGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DiscordRoleAuditEventGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DiscordRoleAuditEventGroupByOutputType[P]>;
}>>;
export type DiscordRoleAuditEventWhereInput = {
    AND?: Prisma.DiscordRoleAuditEventWhereInput | Prisma.DiscordRoleAuditEventWhereInput[];
    OR?: Prisma.DiscordRoleAuditEventWhereInput[];
    NOT?: Prisma.DiscordRoleAuditEventWhereInput | Prisma.DiscordRoleAuditEventWhereInput[];
    id?: Prisma.UuidFilter<"DiscordRoleAuditEvent"> | string;
    guildId?: Prisma.UuidFilter<"DiscordRoleAuditEvent"> | string;
    roleId?: Prisma.StringNullableFilter<"DiscordRoleAuditEvent"> | string | null;
    feature?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    operation?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    source?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    actorType?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    actorId?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    summary?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    result?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    metadata?: Prisma.JsonFilter<"DiscordRoleAuditEvent">;
    createdAt?: Prisma.DateTimeFilter<"DiscordRoleAuditEvent"> | Date | string;
    guild?: Prisma.XOR<Prisma.GuildScalarRelationFilter, Prisma.GuildWhereInput>;
};
export type DiscordRoleAuditEventOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    feature?: Prisma.SortOrder;
    operation?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    actorType?: Prisma.SortOrder;
    actorId?: Prisma.SortOrder;
    summary?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    guild?: Prisma.GuildOrderByWithRelationInput;
};
export type DiscordRoleAuditEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.DiscordRoleAuditEventWhereInput | Prisma.DiscordRoleAuditEventWhereInput[];
    OR?: Prisma.DiscordRoleAuditEventWhereInput[];
    NOT?: Prisma.DiscordRoleAuditEventWhereInput | Prisma.DiscordRoleAuditEventWhereInput[];
    guildId?: Prisma.UuidFilter<"DiscordRoleAuditEvent"> | string;
    roleId?: Prisma.StringNullableFilter<"DiscordRoleAuditEvent"> | string | null;
    feature?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    operation?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    source?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    actorType?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    actorId?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    summary?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    result?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    metadata?: Prisma.JsonFilter<"DiscordRoleAuditEvent">;
    createdAt?: Prisma.DateTimeFilter<"DiscordRoleAuditEvent"> | Date | string;
    guild?: Prisma.XOR<Prisma.GuildScalarRelationFilter, Prisma.GuildWhereInput>;
}, "id">;
export type DiscordRoleAuditEventOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    feature?: Prisma.SortOrder;
    operation?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    actorType?: Prisma.SortOrder;
    actorId?: Prisma.SortOrder;
    summary?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.DiscordRoleAuditEventCountOrderByAggregateInput;
    _max?: Prisma.DiscordRoleAuditEventMaxOrderByAggregateInput;
    _min?: Prisma.DiscordRoleAuditEventMinOrderByAggregateInput;
};
export type DiscordRoleAuditEventScalarWhereWithAggregatesInput = {
    AND?: Prisma.DiscordRoleAuditEventScalarWhereWithAggregatesInput | Prisma.DiscordRoleAuditEventScalarWhereWithAggregatesInput[];
    OR?: Prisma.DiscordRoleAuditEventScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DiscordRoleAuditEventScalarWhereWithAggregatesInput | Prisma.DiscordRoleAuditEventScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    guildId?: Prisma.UuidWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    roleId?: Prisma.StringNullableWithAggregatesFilter<"DiscordRoleAuditEvent"> | string | null;
    feature?: Prisma.StringWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    operation?: Prisma.StringWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    source?: Prisma.StringWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    actorType?: Prisma.StringWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    actorId?: Prisma.StringWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    summary?: Prisma.StringWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    result?: Prisma.StringWithAggregatesFilter<"DiscordRoleAuditEvent"> | string;
    metadata?: Prisma.JsonWithAggregatesFilter<"DiscordRoleAuditEvent">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DiscordRoleAuditEvent"> | Date | string;
};
export type DiscordRoleAuditEventCreateInput = {
    id?: string;
    roleId?: string | null;
    feature: string;
    operation: string;
    source: string;
    actorType: string;
    actorId: string;
    summary: string;
    result: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    guild: Prisma.GuildCreateNestedOneWithoutRoleAuditEventsInput;
};
export type DiscordRoleAuditEventUncheckedCreateInput = {
    id?: string;
    guildId: string;
    roleId?: string | null;
    feature: string;
    operation: string;
    source: string;
    actorType: string;
    actorId: string;
    summary: string;
    result: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DiscordRoleAuditEventUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    feature?: Prisma.StringFieldUpdateOperationsInput | string;
    operation?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    actorType?: Prisma.StringFieldUpdateOperationsInput | string;
    actorId?: Prisma.StringFieldUpdateOperationsInput | string;
    summary?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    guild?: Prisma.GuildUpdateOneRequiredWithoutRoleAuditEventsNestedInput;
};
export type DiscordRoleAuditEventUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    feature?: Prisma.StringFieldUpdateOperationsInput | string;
    operation?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    actorType?: Prisma.StringFieldUpdateOperationsInput | string;
    actorId?: Prisma.StringFieldUpdateOperationsInput | string;
    summary?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordRoleAuditEventCreateManyInput = {
    id?: string;
    guildId: string;
    roleId?: string | null;
    feature: string;
    operation: string;
    source: string;
    actorType: string;
    actorId: string;
    summary: string;
    result: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DiscordRoleAuditEventUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    feature?: Prisma.StringFieldUpdateOperationsInput | string;
    operation?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    actorType?: Prisma.StringFieldUpdateOperationsInput | string;
    actorId?: Prisma.StringFieldUpdateOperationsInput | string;
    summary?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordRoleAuditEventUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    feature?: Prisma.StringFieldUpdateOperationsInput | string;
    operation?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    actorType?: Prisma.StringFieldUpdateOperationsInput | string;
    actorId?: Prisma.StringFieldUpdateOperationsInput | string;
    summary?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordRoleAuditEventListRelationFilter = {
    every?: Prisma.DiscordRoleAuditEventWhereInput;
    some?: Prisma.DiscordRoleAuditEventWhereInput;
    none?: Prisma.DiscordRoleAuditEventWhereInput;
};
export type DiscordRoleAuditEventOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DiscordRoleAuditEventCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    feature?: Prisma.SortOrder;
    operation?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    actorType?: Prisma.SortOrder;
    actorId?: Prisma.SortOrder;
    summary?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    metadata?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DiscordRoleAuditEventMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    feature?: Prisma.SortOrder;
    operation?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    actorType?: Prisma.SortOrder;
    actorId?: Prisma.SortOrder;
    summary?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DiscordRoleAuditEventMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    feature?: Prisma.SortOrder;
    operation?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    actorType?: Prisma.SortOrder;
    actorId?: Prisma.SortOrder;
    summary?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DiscordRoleAuditEventCreateNestedManyWithoutGuildInput = {
    create?: Prisma.XOR<Prisma.DiscordRoleAuditEventCreateWithoutGuildInput, Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput> | Prisma.DiscordRoleAuditEventCreateWithoutGuildInput[] | Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.DiscordRoleAuditEventCreateOrConnectWithoutGuildInput | Prisma.DiscordRoleAuditEventCreateOrConnectWithoutGuildInput[];
    createMany?: Prisma.DiscordRoleAuditEventCreateManyGuildInputEnvelope;
    connect?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
};
export type DiscordRoleAuditEventUncheckedCreateNestedManyWithoutGuildInput = {
    create?: Prisma.XOR<Prisma.DiscordRoleAuditEventCreateWithoutGuildInput, Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput> | Prisma.DiscordRoleAuditEventCreateWithoutGuildInput[] | Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.DiscordRoleAuditEventCreateOrConnectWithoutGuildInput | Prisma.DiscordRoleAuditEventCreateOrConnectWithoutGuildInput[];
    createMany?: Prisma.DiscordRoleAuditEventCreateManyGuildInputEnvelope;
    connect?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
};
export type DiscordRoleAuditEventUpdateManyWithoutGuildNestedInput = {
    create?: Prisma.XOR<Prisma.DiscordRoleAuditEventCreateWithoutGuildInput, Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput> | Prisma.DiscordRoleAuditEventCreateWithoutGuildInput[] | Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.DiscordRoleAuditEventCreateOrConnectWithoutGuildInput | Prisma.DiscordRoleAuditEventCreateOrConnectWithoutGuildInput[];
    upsert?: Prisma.DiscordRoleAuditEventUpsertWithWhereUniqueWithoutGuildInput | Prisma.DiscordRoleAuditEventUpsertWithWhereUniqueWithoutGuildInput[];
    createMany?: Prisma.DiscordRoleAuditEventCreateManyGuildInputEnvelope;
    set?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
    disconnect?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
    delete?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
    connect?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
    update?: Prisma.DiscordRoleAuditEventUpdateWithWhereUniqueWithoutGuildInput | Prisma.DiscordRoleAuditEventUpdateWithWhereUniqueWithoutGuildInput[];
    updateMany?: Prisma.DiscordRoleAuditEventUpdateManyWithWhereWithoutGuildInput | Prisma.DiscordRoleAuditEventUpdateManyWithWhereWithoutGuildInput[];
    deleteMany?: Prisma.DiscordRoleAuditEventScalarWhereInput | Prisma.DiscordRoleAuditEventScalarWhereInput[];
};
export type DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildNestedInput = {
    create?: Prisma.XOR<Prisma.DiscordRoleAuditEventCreateWithoutGuildInput, Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput> | Prisma.DiscordRoleAuditEventCreateWithoutGuildInput[] | Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.DiscordRoleAuditEventCreateOrConnectWithoutGuildInput | Prisma.DiscordRoleAuditEventCreateOrConnectWithoutGuildInput[];
    upsert?: Prisma.DiscordRoleAuditEventUpsertWithWhereUniqueWithoutGuildInput | Prisma.DiscordRoleAuditEventUpsertWithWhereUniqueWithoutGuildInput[];
    createMany?: Prisma.DiscordRoleAuditEventCreateManyGuildInputEnvelope;
    set?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
    disconnect?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
    delete?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
    connect?: Prisma.DiscordRoleAuditEventWhereUniqueInput | Prisma.DiscordRoleAuditEventWhereUniqueInput[];
    update?: Prisma.DiscordRoleAuditEventUpdateWithWhereUniqueWithoutGuildInput | Prisma.DiscordRoleAuditEventUpdateWithWhereUniqueWithoutGuildInput[];
    updateMany?: Prisma.DiscordRoleAuditEventUpdateManyWithWhereWithoutGuildInput | Prisma.DiscordRoleAuditEventUpdateManyWithWhereWithoutGuildInput[];
    deleteMany?: Prisma.DiscordRoleAuditEventScalarWhereInput | Prisma.DiscordRoleAuditEventScalarWhereInput[];
};
export type DiscordRoleAuditEventCreateWithoutGuildInput = {
    id?: string;
    roleId?: string | null;
    feature: string;
    operation: string;
    source: string;
    actorType: string;
    actorId: string;
    summary: string;
    result: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DiscordRoleAuditEventUncheckedCreateWithoutGuildInput = {
    id?: string;
    roleId?: string | null;
    feature: string;
    operation: string;
    source: string;
    actorType: string;
    actorId: string;
    summary: string;
    result: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DiscordRoleAuditEventCreateOrConnectWithoutGuildInput = {
    where: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    create: Prisma.XOR<Prisma.DiscordRoleAuditEventCreateWithoutGuildInput, Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput>;
};
export type DiscordRoleAuditEventCreateManyGuildInputEnvelope = {
    data: Prisma.DiscordRoleAuditEventCreateManyGuildInput | Prisma.DiscordRoleAuditEventCreateManyGuildInput[];
    skipDuplicates?: boolean;
};
export type DiscordRoleAuditEventUpsertWithWhereUniqueWithoutGuildInput = {
    where: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    update: Prisma.XOR<Prisma.DiscordRoleAuditEventUpdateWithoutGuildInput, Prisma.DiscordRoleAuditEventUncheckedUpdateWithoutGuildInput>;
    create: Prisma.XOR<Prisma.DiscordRoleAuditEventCreateWithoutGuildInput, Prisma.DiscordRoleAuditEventUncheckedCreateWithoutGuildInput>;
};
export type DiscordRoleAuditEventUpdateWithWhereUniqueWithoutGuildInput = {
    where: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    data: Prisma.XOR<Prisma.DiscordRoleAuditEventUpdateWithoutGuildInput, Prisma.DiscordRoleAuditEventUncheckedUpdateWithoutGuildInput>;
};
export type DiscordRoleAuditEventUpdateManyWithWhereWithoutGuildInput = {
    where: Prisma.DiscordRoleAuditEventScalarWhereInput;
    data: Prisma.XOR<Prisma.DiscordRoleAuditEventUpdateManyMutationInput, Prisma.DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildInput>;
};
export type DiscordRoleAuditEventScalarWhereInput = {
    AND?: Prisma.DiscordRoleAuditEventScalarWhereInput | Prisma.DiscordRoleAuditEventScalarWhereInput[];
    OR?: Prisma.DiscordRoleAuditEventScalarWhereInput[];
    NOT?: Prisma.DiscordRoleAuditEventScalarWhereInput | Prisma.DiscordRoleAuditEventScalarWhereInput[];
    id?: Prisma.UuidFilter<"DiscordRoleAuditEvent"> | string;
    guildId?: Prisma.UuidFilter<"DiscordRoleAuditEvent"> | string;
    roleId?: Prisma.StringNullableFilter<"DiscordRoleAuditEvent"> | string | null;
    feature?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    operation?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    source?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    actorType?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    actorId?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    summary?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    result?: Prisma.StringFilter<"DiscordRoleAuditEvent"> | string;
    metadata?: Prisma.JsonFilter<"DiscordRoleAuditEvent">;
    createdAt?: Prisma.DateTimeFilter<"DiscordRoleAuditEvent"> | Date | string;
};
export type DiscordRoleAuditEventCreateManyGuildInput = {
    id?: string;
    roleId?: string | null;
    feature: string;
    operation: string;
    source: string;
    actorType: string;
    actorId: string;
    summary: string;
    result: string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DiscordRoleAuditEventUpdateWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    feature?: Prisma.StringFieldUpdateOperationsInput | string;
    operation?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    actorType?: Prisma.StringFieldUpdateOperationsInput | string;
    actorId?: Prisma.StringFieldUpdateOperationsInput | string;
    summary?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordRoleAuditEventUncheckedUpdateWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    feature?: Prisma.StringFieldUpdateOperationsInput | string;
    operation?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    actorType?: Prisma.StringFieldUpdateOperationsInput | string;
    actorId?: Prisma.StringFieldUpdateOperationsInput | string;
    summary?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordRoleAuditEventUncheckedUpdateManyWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    feature?: Prisma.StringFieldUpdateOperationsInput | string;
    operation?: Prisma.StringFieldUpdateOperationsInput | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    actorType?: Prisma.StringFieldUpdateOperationsInput | string;
    actorId?: Prisma.StringFieldUpdateOperationsInput | string;
    summary?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.StringFieldUpdateOperationsInput | string;
    metadata?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordRoleAuditEventSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    roleId?: boolean;
    feature?: boolean;
    operation?: boolean;
    source?: boolean;
    actorType?: boolean;
    actorId?: boolean;
    summary?: boolean;
    result?: boolean;
    metadata?: boolean;
    createdAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["discordRoleAuditEvent"]>;
export type DiscordRoleAuditEventSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    roleId?: boolean;
    feature?: boolean;
    operation?: boolean;
    source?: boolean;
    actorType?: boolean;
    actorId?: boolean;
    summary?: boolean;
    result?: boolean;
    metadata?: boolean;
    createdAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["discordRoleAuditEvent"]>;
export type DiscordRoleAuditEventSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    roleId?: boolean;
    feature?: boolean;
    operation?: boolean;
    source?: boolean;
    actorType?: boolean;
    actorId?: boolean;
    summary?: boolean;
    result?: boolean;
    metadata?: boolean;
    createdAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["discordRoleAuditEvent"]>;
export type DiscordRoleAuditEventSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    roleId?: boolean;
    feature?: boolean;
    operation?: boolean;
    source?: boolean;
    actorType?: boolean;
    actorId?: boolean;
    summary?: boolean;
    result?: boolean;
    metadata?: boolean;
    createdAt?: boolean;
};
export type DiscordRoleAuditEventOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "roleId" | "feature" | "operation" | "source" | "actorType" | "actorId" | "summary" | "result" | "metadata" | "createdAt", ExtArgs["result"]["discordRoleAuditEvent"]>;
export type DiscordRoleAuditEventInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type DiscordRoleAuditEventIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type DiscordRoleAuditEventIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type $DiscordRoleAuditEventPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DiscordRoleAuditEvent";
    objects: {
        guild: Prisma.$GuildPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        roleId: string | null;
        feature: string;
        operation: string;
        source: string;
        actorType: string;
        actorId: string;
        summary: string;
        result: string;
        metadata: runtime.JsonValue;
        createdAt: Date;
    }, ExtArgs["result"]["discordRoleAuditEvent"]>;
    composites: {};
};
export type DiscordRoleAuditEventGetPayload<S extends boolean | null | undefined | DiscordRoleAuditEventDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload, S>;
export type DiscordRoleAuditEventCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DiscordRoleAuditEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DiscordRoleAuditEventCountAggregateInputType | true;
};
export interface DiscordRoleAuditEventDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DiscordRoleAuditEvent'];
        meta: {
            name: 'DiscordRoleAuditEvent';
        };
    };
    /**
     * Find zero or one DiscordRoleAuditEvent that matches the filter.
     * @param {DiscordRoleAuditEventFindUniqueArgs} args - Arguments to find a DiscordRoleAuditEvent
     * @example
     * // Get one DiscordRoleAuditEvent
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DiscordRoleAuditEventFindUniqueArgs>(args: Prisma.SelectSubset<T, DiscordRoleAuditEventFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DiscordRoleAuditEventClient<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one DiscordRoleAuditEvent that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DiscordRoleAuditEventFindUniqueOrThrowArgs} args - Arguments to find a DiscordRoleAuditEvent
     * @example
     * // Get one DiscordRoleAuditEvent
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DiscordRoleAuditEventFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DiscordRoleAuditEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DiscordRoleAuditEventClient<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DiscordRoleAuditEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordRoleAuditEventFindFirstArgs} args - Arguments to find a DiscordRoleAuditEvent
     * @example
     * // Get one DiscordRoleAuditEvent
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DiscordRoleAuditEventFindFirstArgs>(args?: Prisma.SelectSubset<T, DiscordRoleAuditEventFindFirstArgs<ExtArgs>>): Prisma.Prisma__DiscordRoleAuditEventClient<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DiscordRoleAuditEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordRoleAuditEventFindFirstOrThrowArgs} args - Arguments to find a DiscordRoleAuditEvent
     * @example
     * // Get one DiscordRoleAuditEvent
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DiscordRoleAuditEventFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DiscordRoleAuditEventFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DiscordRoleAuditEventClient<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more DiscordRoleAuditEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordRoleAuditEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DiscordRoleAuditEvents
     * const discordRoleAuditEvents = await prisma.discordRoleAuditEvent.findMany()
     *
     * // Get first 10 DiscordRoleAuditEvents
     * const discordRoleAuditEvents = await prisma.discordRoleAuditEvent.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const discordRoleAuditEventWithIdOnly = await prisma.discordRoleAuditEvent.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DiscordRoleAuditEventFindManyArgs>(args?: Prisma.SelectSubset<T, DiscordRoleAuditEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a DiscordRoleAuditEvent.
     * @param {DiscordRoleAuditEventCreateArgs} args - Arguments to create a DiscordRoleAuditEvent.
     * @example
     * // Create one DiscordRoleAuditEvent
     * const DiscordRoleAuditEvent = await prisma.discordRoleAuditEvent.create({
     *   data: {
     *     // ... data to create a DiscordRoleAuditEvent
     *   }
     * })
     *
     */
    create<T extends DiscordRoleAuditEventCreateArgs>(args: Prisma.SelectSubset<T, DiscordRoleAuditEventCreateArgs<ExtArgs>>): Prisma.Prisma__DiscordRoleAuditEventClient<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many DiscordRoleAuditEvents.
     * @param {DiscordRoleAuditEventCreateManyArgs} args - Arguments to create many DiscordRoleAuditEvents.
     * @example
     * // Create many DiscordRoleAuditEvents
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DiscordRoleAuditEventCreateManyArgs>(args?: Prisma.SelectSubset<T, DiscordRoleAuditEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many DiscordRoleAuditEvents and returns the data saved in the database.
     * @param {DiscordRoleAuditEventCreateManyAndReturnArgs} args - Arguments to create many DiscordRoleAuditEvents.
     * @example
     * // Create many DiscordRoleAuditEvents
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DiscordRoleAuditEvents and only return the `id`
     * const discordRoleAuditEventWithIdOnly = await prisma.discordRoleAuditEvent.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DiscordRoleAuditEventCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DiscordRoleAuditEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a DiscordRoleAuditEvent.
     * @param {DiscordRoleAuditEventDeleteArgs} args - Arguments to delete one DiscordRoleAuditEvent.
     * @example
     * // Delete one DiscordRoleAuditEvent
     * const DiscordRoleAuditEvent = await prisma.discordRoleAuditEvent.delete({
     *   where: {
     *     // ... filter to delete one DiscordRoleAuditEvent
     *   }
     * })
     *
     */
    delete<T extends DiscordRoleAuditEventDeleteArgs>(args: Prisma.SelectSubset<T, DiscordRoleAuditEventDeleteArgs<ExtArgs>>): Prisma.Prisma__DiscordRoleAuditEventClient<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one DiscordRoleAuditEvent.
     * @param {DiscordRoleAuditEventUpdateArgs} args - Arguments to update one DiscordRoleAuditEvent.
     * @example
     * // Update one DiscordRoleAuditEvent
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DiscordRoleAuditEventUpdateArgs>(args: Prisma.SelectSubset<T, DiscordRoleAuditEventUpdateArgs<ExtArgs>>): Prisma.Prisma__DiscordRoleAuditEventClient<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more DiscordRoleAuditEvents.
     * @param {DiscordRoleAuditEventDeleteManyArgs} args - Arguments to filter DiscordRoleAuditEvents to delete.
     * @example
     * // Delete a few DiscordRoleAuditEvents
     * const { count } = await prisma.discordRoleAuditEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DiscordRoleAuditEventDeleteManyArgs>(args?: Prisma.SelectSubset<T, DiscordRoleAuditEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DiscordRoleAuditEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordRoleAuditEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DiscordRoleAuditEvents
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DiscordRoleAuditEventUpdateManyArgs>(args: Prisma.SelectSubset<T, DiscordRoleAuditEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DiscordRoleAuditEvents and returns the data updated in the database.
     * @param {DiscordRoleAuditEventUpdateManyAndReturnArgs} args - Arguments to update many DiscordRoleAuditEvents.
     * @example
     * // Update many DiscordRoleAuditEvents
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more DiscordRoleAuditEvents and only return the `id`
     * const discordRoleAuditEventWithIdOnly = await prisma.discordRoleAuditEvent.updateManyAndReturn({
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
    updateManyAndReturn<T extends DiscordRoleAuditEventUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DiscordRoleAuditEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one DiscordRoleAuditEvent.
     * @param {DiscordRoleAuditEventUpsertArgs} args - Arguments to update or create a DiscordRoleAuditEvent.
     * @example
     * // Update or create a DiscordRoleAuditEvent
     * const discordRoleAuditEvent = await prisma.discordRoleAuditEvent.upsert({
     *   create: {
     *     // ... data to create a DiscordRoleAuditEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DiscordRoleAuditEvent we want to update
     *   }
     * })
     */
    upsert<T extends DiscordRoleAuditEventUpsertArgs>(args: Prisma.SelectSubset<T, DiscordRoleAuditEventUpsertArgs<ExtArgs>>): Prisma.Prisma__DiscordRoleAuditEventClient<runtime.Types.Result.GetResult<Prisma.$DiscordRoleAuditEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of DiscordRoleAuditEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordRoleAuditEventCountArgs} args - Arguments to filter DiscordRoleAuditEvents to count.
     * @example
     * // Count the number of DiscordRoleAuditEvents
     * const count = await prisma.discordRoleAuditEvent.count({
     *   where: {
     *     // ... the filter for the DiscordRoleAuditEvents we want to count
     *   }
     * })
    **/
    count<T extends DiscordRoleAuditEventCountArgs>(args?: Prisma.Subset<T, DiscordRoleAuditEventCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DiscordRoleAuditEventCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a DiscordRoleAuditEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordRoleAuditEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DiscordRoleAuditEventAggregateArgs>(args: Prisma.Subset<T, DiscordRoleAuditEventAggregateArgs>): Prisma.PrismaPromise<GetDiscordRoleAuditEventAggregateType<T>>;
    /**
     * Group by DiscordRoleAuditEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordRoleAuditEventGroupByArgs} args - Group by arguments.
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
    groupBy<T extends DiscordRoleAuditEventGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DiscordRoleAuditEventGroupByArgs['orderBy'];
    } : {
        orderBy?: DiscordRoleAuditEventGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DiscordRoleAuditEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiscordRoleAuditEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DiscordRoleAuditEvent model
     */
    readonly fields: DiscordRoleAuditEventFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for DiscordRoleAuditEvent.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__DiscordRoleAuditEventClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    guild<T extends Prisma.GuildDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.GuildDefaultArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the DiscordRoleAuditEvent model
 */
export interface DiscordRoleAuditEventFieldRefs {
    readonly id: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly guildId: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly roleId: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly feature: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly operation: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly source: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly actorType: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly actorId: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly summary: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly result: Prisma.FieldRef<"DiscordRoleAuditEvent", 'String'>;
    readonly metadata: Prisma.FieldRef<"DiscordRoleAuditEvent", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"DiscordRoleAuditEvent", 'DateTime'>;
}
/**
 * DiscordRoleAuditEvent findUnique
 */
export type DiscordRoleAuditEventFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which DiscordRoleAuditEvent to fetch.
     */
    where: Prisma.DiscordRoleAuditEventWhereUniqueInput;
};
/**
 * DiscordRoleAuditEvent findUniqueOrThrow
 */
export type DiscordRoleAuditEventFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which DiscordRoleAuditEvent to fetch.
     */
    where: Prisma.DiscordRoleAuditEventWhereUniqueInput;
};
/**
 * DiscordRoleAuditEvent findFirst
 */
export type DiscordRoleAuditEventFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which DiscordRoleAuditEvent to fetch.
     */
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DiscordRoleAuditEvents to fetch.
     */
    orderBy?: Prisma.DiscordRoleAuditEventOrderByWithRelationInput | Prisma.DiscordRoleAuditEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DiscordRoleAuditEvents.
     */
    cursor?: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DiscordRoleAuditEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DiscordRoleAuditEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DiscordRoleAuditEvents.
     */
    distinct?: Prisma.DiscordRoleAuditEventScalarFieldEnum | Prisma.DiscordRoleAuditEventScalarFieldEnum[];
};
/**
 * DiscordRoleAuditEvent findFirstOrThrow
 */
export type DiscordRoleAuditEventFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which DiscordRoleAuditEvent to fetch.
     */
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DiscordRoleAuditEvents to fetch.
     */
    orderBy?: Prisma.DiscordRoleAuditEventOrderByWithRelationInput | Prisma.DiscordRoleAuditEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DiscordRoleAuditEvents.
     */
    cursor?: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DiscordRoleAuditEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DiscordRoleAuditEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DiscordRoleAuditEvents.
     */
    distinct?: Prisma.DiscordRoleAuditEventScalarFieldEnum | Prisma.DiscordRoleAuditEventScalarFieldEnum[];
};
/**
 * DiscordRoleAuditEvent findMany
 */
export type DiscordRoleAuditEventFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which DiscordRoleAuditEvents to fetch.
     */
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DiscordRoleAuditEvents to fetch.
     */
    orderBy?: Prisma.DiscordRoleAuditEventOrderByWithRelationInput | Prisma.DiscordRoleAuditEventOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DiscordRoleAuditEvents.
     */
    cursor?: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DiscordRoleAuditEvents from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DiscordRoleAuditEvents.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DiscordRoleAuditEvents.
     */
    distinct?: Prisma.DiscordRoleAuditEventScalarFieldEnum | Prisma.DiscordRoleAuditEventScalarFieldEnum[];
};
/**
 * DiscordRoleAuditEvent create
 */
export type DiscordRoleAuditEventCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a DiscordRoleAuditEvent.
     */
    data: Prisma.XOR<Prisma.DiscordRoleAuditEventCreateInput, Prisma.DiscordRoleAuditEventUncheckedCreateInput>;
};
/**
 * DiscordRoleAuditEvent createMany
 */
export type DiscordRoleAuditEventCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many DiscordRoleAuditEvents.
     */
    data: Prisma.DiscordRoleAuditEventCreateManyInput | Prisma.DiscordRoleAuditEventCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * DiscordRoleAuditEvent createManyAndReturn
 */
export type DiscordRoleAuditEventCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordRoleAuditEvent
     */
    select?: Prisma.DiscordRoleAuditEventSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordRoleAuditEvent
     */
    omit?: Prisma.DiscordRoleAuditEventOmit<ExtArgs> | null;
    /**
     * The data used to create many DiscordRoleAuditEvents.
     */
    data: Prisma.DiscordRoleAuditEventCreateManyInput | Prisma.DiscordRoleAuditEventCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordRoleAuditEventIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * DiscordRoleAuditEvent update
 */
export type DiscordRoleAuditEventUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a DiscordRoleAuditEvent.
     */
    data: Prisma.XOR<Prisma.DiscordRoleAuditEventUpdateInput, Prisma.DiscordRoleAuditEventUncheckedUpdateInput>;
    /**
     * Choose, which DiscordRoleAuditEvent to update.
     */
    where: Prisma.DiscordRoleAuditEventWhereUniqueInput;
};
/**
 * DiscordRoleAuditEvent updateMany
 */
export type DiscordRoleAuditEventUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update DiscordRoleAuditEvents.
     */
    data: Prisma.XOR<Prisma.DiscordRoleAuditEventUpdateManyMutationInput, Prisma.DiscordRoleAuditEventUncheckedUpdateManyInput>;
    /**
     * Filter which DiscordRoleAuditEvents to update
     */
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    /**
     * Limit how many DiscordRoleAuditEvents to update.
     */
    limit?: number;
};
/**
 * DiscordRoleAuditEvent updateManyAndReturn
 */
export type DiscordRoleAuditEventUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordRoleAuditEvent
     */
    select?: Prisma.DiscordRoleAuditEventSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordRoleAuditEvent
     */
    omit?: Prisma.DiscordRoleAuditEventOmit<ExtArgs> | null;
    /**
     * The data used to update DiscordRoleAuditEvents.
     */
    data: Prisma.XOR<Prisma.DiscordRoleAuditEventUpdateManyMutationInput, Prisma.DiscordRoleAuditEventUncheckedUpdateManyInput>;
    /**
     * Filter which DiscordRoleAuditEvents to update
     */
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    /**
     * Limit how many DiscordRoleAuditEvents to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordRoleAuditEventIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * DiscordRoleAuditEvent upsert
 */
export type DiscordRoleAuditEventUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the DiscordRoleAuditEvent to update in case it exists.
     */
    where: Prisma.DiscordRoleAuditEventWhereUniqueInput;
    /**
     * In case the DiscordRoleAuditEvent found by the `where` argument doesn't exist, create a new DiscordRoleAuditEvent with this data.
     */
    create: Prisma.XOR<Prisma.DiscordRoleAuditEventCreateInput, Prisma.DiscordRoleAuditEventUncheckedCreateInput>;
    /**
     * In case the DiscordRoleAuditEvent was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.DiscordRoleAuditEventUpdateInput, Prisma.DiscordRoleAuditEventUncheckedUpdateInput>;
};
/**
 * DiscordRoleAuditEvent delete
 */
export type DiscordRoleAuditEventDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which DiscordRoleAuditEvent to delete.
     */
    where: Prisma.DiscordRoleAuditEventWhereUniqueInput;
};
/**
 * DiscordRoleAuditEvent deleteMany
 */
export type DiscordRoleAuditEventDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DiscordRoleAuditEvents to delete
     */
    where?: Prisma.DiscordRoleAuditEventWhereInput;
    /**
     * Limit how many DiscordRoleAuditEvents to delete.
     */
    limit?: number;
};
/**
 * DiscordRoleAuditEvent without action
 */
export type DiscordRoleAuditEventDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
//# sourceMappingURL=DiscordRoleAuditEvent.d.ts.map
import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model CommunityCounter
 *
 */
export type CommunityCounterModel = runtime.Types.Result.DefaultSelection<Prisma.$CommunityCounterPayload>;
export type AggregateCommunityCounter = {
    _count: CommunityCounterCountAggregateOutputType | null;
    _avg: CommunityCounterAvgAggregateOutputType | null;
    _sum: CommunityCounterSumAggregateOutputType | null;
    _min: CommunityCounterMinAggregateOutputType | null;
    _max: CommunityCounterMaxAggregateOutputType | null;
};
export type CommunityCounterAvgAggregateOutputType = {
    intervalSeconds: number | null;
    lastValue: number | null;
};
export type CommunityCounterSumAggregateOutputType = {
    intervalSeconds: number | null;
    lastValue: number | null;
};
export type CommunityCounterMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    enabled: boolean | null;
    channelId: string | null;
    labelTemplate: string | null;
    type: $Enums.CommunityCounterType | null;
    roleId: string | null;
    intervalSeconds: number | null;
    lastValue: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CommunityCounterMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    enabled: boolean | null;
    channelId: string | null;
    labelTemplate: string | null;
    type: $Enums.CommunityCounterType | null;
    roleId: string | null;
    intervalSeconds: number | null;
    lastValue: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type CommunityCounterCountAggregateOutputType = {
    id: number;
    guildId: number;
    enabled: number;
    channelId: number;
    labelTemplate: number;
    type: number;
    roleId: number;
    intervalSeconds: number;
    lastValue: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type CommunityCounterAvgAggregateInputType = {
    intervalSeconds?: true;
    lastValue?: true;
};
export type CommunityCounterSumAggregateInputType = {
    intervalSeconds?: true;
    lastValue?: true;
};
export type CommunityCounterMinAggregateInputType = {
    id?: true;
    guildId?: true;
    enabled?: true;
    channelId?: true;
    labelTemplate?: true;
    type?: true;
    roleId?: true;
    intervalSeconds?: true;
    lastValue?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CommunityCounterMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    enabled?: true;
    channelId?: true;
    labelTemplate?: true;
    type?: true;
    roleId?: true;
    intervalSeconds?: true;
    lastValue?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type CommunityCounterCountAggregateInputType = {
    id?: true;
    guildId?: true;
    enabled?: true;
    channelId?: true;
    labelTemplate?: true;
    type?: true;
    roleId?: true;
    intervalSeconds?: true;
    lastValue?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type CommunityCounterAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CommunityCounter to aggregate.
     */
    where?: Prisma.CommunityCounterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CommunityCounters to fetch.
     */
    orderBy?: Prisma.CommunityCounterOrderByWithRelationInput | Prisma.CommunityCounterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.CommunityCounterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CommunityCounters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CommunityCounters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned CommunityCounters
    **/
    _count?: true | CommunityCounterCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: CommunityCounterAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: CommunityCounterSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: CommunityCounterMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: CommunityCounterMaxAggregateInputType;
};
export type GetCommunityCounterAggregateType<T extends CommunityCounterAggregateArgs> = {
    [P in keyof T & keyof AggregateCommunityCounter]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateCommunityCounter[P]> : Prisma.GetScalarType<T[P], AggregateCommunityCounter[P]>;
};
export type CommunityCounterGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CommunityCounterWhereInput;
    orderBy?: Prisma.CommunityCounterOrderByWithAggregationInput | Prisma.CommunityCounterOrderByWithAggregationInput[];
    by: Prisma.CommunityCounterScalarFieldEnum[] | Prisma.CommunityCounterScalarFieldEnum;
    having?: Prisma.CommunityCounterScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: CommunityCounterCountAggregateInputType | true;
    _avg?: CommunityCounterAvgAggregateInputType;
    _sum?: CommunityCounterSumAggregateInputType;
    _min?: CommunityCounterMinAggregateInputType;
    _max?: CommunityCounterMaxAggregateInputType;
};
export type CommunityCounterGroupByOutputType = {
    id: string;
    guildId: string;
    enabled: boolean;
    channelId: string;
    labelTemplate: string;
    type: $Enums.CommunityCounterType;
    roleId: string | null;
    intervalSeconds: number;
    lastValue: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: CommunityCounterCountAggregateOutputType | null;
    _avg: CommunityCounterAvgAggregateOutputType | null;
    _sum: CommunityCounterSumAggregateOutputType | null;
    _min: CommunityCounterMinAggregateOutputType | null;
    _max: CommunityCounterMaxAggregateOutputType | null;
};
export type GetCommunityCounterGroupByPayload<T extends CommunityCounterGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<CommunityCounterGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof CommunityCounterGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], CommunityCounterGroupByOutputType[P]> : Prisma.GetScalarType<T[P], CommunityCounterGroupByOutputType[P]>;
}>>;
export type CommunityCounterWhereInput = {
    AND?: Prisma.CommunityCounterWhereInput | Prisma.CommunityCounterWhereInput[];
    OR?: Prisma.CommunityCounterWhereInput[];
    NOT?: Prisma.CommunityCounterWhereInput | Prisma.CommunityCounterWhereInput[];
    id?: Prisma.UuidFilter<"CommunityCounter"> | string;
    guildId?: Prisma.UuidFilter<"CommunityCounter"> | string;
    enabled?: Prisma.BoolFilter<"CommunityCounter"> | boolean;
    channelId?: Prisma.StringFilter<"CommunityCounter"> | string;
    labelTemplate?: Prisma.StringFilter<"CommunityCounter"> | string;
    type?: Prisma.EnumCommunityCounterTypeFilter<"CommunityCounter"> | $Enums.CommunityCounterType;
    roleId?: Prisma.StringNullableFilter<"CommunityCounter"> | string | null;
    intervalSeconds?: Prisma.IntFilter<"CommunityCounter"> | number;
    lastValue?: Prisma.IntNullableFilter<"CommunityCounter"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"CommunityCounter"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"CommunityCounter"> | Date | string;
    guild?: Prisma.XOR<Prisma.GuildScalarRelationFilter, Prisma.GuildWhereInput>;
};
export type CommunityCounterOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    labelTemplate?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    roleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    intervalSeconds?: Prisma.SortOrder;
    lastValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    guild?: Prisma.GuildOrderByWithRelationInput;
};
export type CommunityCounterWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.CommunityCounterWhereInput | Prisma.CommunityCounterWhereInput[];
    OR?: Prisma.CommunityCounterWhereInput[];
    NOT?: Prisma.CommunityCounterWhereInput | Prisma.CommunityCounterWhereInput[];
    guildId?: Prisma.UuidFilter<"CommunityCounter"> | string;
    enabled?: Prisma.BoolFilter<"CommunityCounter"> | boolean;
    channelId?: Prisma.StringFilter<"CommunityCounter"> | string;
    labelTemplate?: Prisma.StringFilter<"CommunityCounter"> | string;
    type?: Prisma.EnumCommunityCounterTypeFilter<"CommunityCounter"> | $Enums.CommunityCounterType;
    roleId?: Prisma.StringNullableFilter<"CommunityCounter"> | string | null;
    intervalSeconds?: Prisma.IntFilter<"CommunityCounter"> | number;
    lastValue?: Prisma.IntNullableFilter<"CommunityCounter"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"CommunityCounter"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"CommunityCounter"> | Date | string;
    guild?: Prisma.XOR<Prisma.GuildScalarRelationFilter, Prisma.GuildWhereInput>;
}, "id">;
export type CommunityCounterOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    labelTemplate?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    roleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    intervalSeconds?: Prisma.SortOrder;
    lastValue?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.CommunityCounterCountOrderByAggregateInput;
    _avg?: Prisma.CommunityCounterAvgOrderByAggregateInput;
    _max?: Prisma.CommunityCounterMaxOrderByAggregateInput;
    _min?: Prisma.CommunityCounterMinOrderByAggregateInput;
    _sum?: Prisma.CommunityCounterSumOrderByAggregateInput;
};
export type CommunityCounterScalarWhereWithAggregatesInput = {
    AND?: Prisma.CommunityCounterScalarWhereWithAggregatesInput | Prisma.CommunityCounterScalarWhereWithAggregatesInput[];
    OR?: Prisma.CommunityCounterScalarWhereWithAggregatesInput[];
    NOT?: Prisma.CommunityCounterScalarWhereWithAggregatesInput | Prisma.CommunityCounterScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"CommunityCounter"> | string;
    guildId?: Prisma.UuidWithAggregatesFilter<"CommunityCounter"> | string;
    enabled?: Prisma.BoolWithAggregatesFilter<"CommunityCounter"> | boolean;
    channelId?: Prisma.StringWithAggregatesFilter<"CommunityCounter"> | string;
    labelTemplate?: Prisma.StringWithAggregatesFilter<"CommunityCounter"> | string;
    type?: Prisma.EnumCommunityCounterTypeWithAggregatesFilter<"CommunityCounter"> | $Enums.CommunityCounterType;
    roleId?: Prisma.StringNullableWithAggregatesFilter<"CommunityCounter"> | string | null;
    intervalSeconds?: Prisma.IntWithAggregatesFilter<"CommunityCounter"> | number;
    lastValue?: Prisma.IntNullableWithAggregatesFilter<"CommunityCounter"> | number | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"CommunityCounter"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"CommunityCounter"> | Date | string;
};
export type CommunityCounterCreateInput = {
    id?: string;
    enabled?: boolean;
    channelId: string;
    labelTemplate: string;
    type: $Enums.CommunityCounterType;
    roleId?: string | null;
    intervalSeconds: number;
    lastValue?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    guild: Prisma.GuildCreateNestedOneWithoutCountersInput;
};
export type CommunityCounterUncheckedCreateInput = {
    id?: string;
    guildId: string;
    enabled?: boolean;
    channelId: string;
    labelTemplate: string;
    type: $Enums.CommunityCounterType;
    roleId?: string | null;
    intervalSeconds: number;
    lastValue?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CommunityCounterUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    labelTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumCommunityCounterTypeFieldUpdateOperationsInput | $Enums.CommunityCounterType;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    intervalSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    lastValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    guild?: Prisma.GuildUpdateOneRequiredWithoutCountersNestedInput;
};
export type CommunityCounterUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    labelTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumCommunityCounterTypeFieldUpdateOperationsInput | $Enums.CommunityCounterType;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    intervalSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    lastValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunityCounterCreateManyInput = {
    id?: string;
    guildId: string;
    enabled?: boolean;
    channelId: string;
    labelTemplate: string;
    type: $Enums.CommunityCounterType;
    roleId?: string | null;
    intervalSeconds: number;
    lastValue?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CommunityCounterUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    labelTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumCommunityCounterTypeFieldUpdateOperationsInput | $Enums.CommunityCounterType;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    intervalSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    lastValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunityCounterUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    labelTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumCommunityCounterTypeFieldUpdateOperationsInput | $Enums.CommunityCounterType;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    intervalSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    lastValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunityCounterListRelationFilter = {
    every?: Prisma.CommunityCounterWhereInput;
    some?: Prisma.CommunityCounterWhereInput;
    none?: Prisma.CommunityCounterWhereInput;
};
export type CommunityCounterOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type CommunityCounterCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    labelTemplate?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    intervalSeconds?: Prisma.SortOrder;
    lastValue?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CommunityCounterAvgOrderByAggregateInput = {
    intervalSeconds?: Prisma.SortOrder;
    lastValue?: Prisma.SortOrder;
};
export type CommunityCounterMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    labelTemplate?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    intervalSeconds?: Prisma.SortOrder;
    lastValue?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CommunityCounterMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    labelTemplate?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    intervalSeconds?: Prisma.SortOrder;
    lastValue?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type CommunityCounterSumOrderByAggregateInput = {
    intervalSeconds?: Prisma.SortOrder;
    lastValue?: Prisma.SortOrder;
};
export type CommunityCounterCreateNestedManyWithoutGuildInput = {
    create?: Prisma.XOR<Prisma.CommunityCounterCreateWithoutGuildInput, Prisma.CommunityCounterUncheckedCreateWithoutGuildInput> | Prisma.CommunityCounterCreateWithoutGuildInput[] | Prisma.CommunityCounterUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.CommunityCounterCreateOrConnectWithoutGuildInput | Prisma.CommunityCounterCreateOrConnectWithoutGuildInput[];
    createMany?: Prisma.CommunityCounterCreateManyGuildInputEnvelope;
    connect?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
};
export type CommunityCounterUncheckedCreateNestedManyWithoutGuildInput = {
    create?: Prisma.XOR<Prisma.CommunityCounterCreateWithoutGuildInput, Prisma.CommunityCounterUncheckedCreateWithoutGuildInput> | Prisma.CommunityCounterCreateWithoutGuildInput[] | Prisma.CommunityCounterUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.CommunityCounterCreateOrConnectWithoutGuildInput | Prisma.CommunityCounterCreateOrConnectWithoutGuildInput[];
    createMany?: Prisma.CommunityCounterCreateManyGuildInputEnvelope;
    connect?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
};
export type CommunityCounterUpdateManyWithoutGuildNestedInput = {
    create?: Prisma.XOR<Prisma.CommunityCounterCreateWithoutGuildInput, Prisma.CommunityCounterUncheckedCreateWithoutGuildInput> | Prisma.CommunityCounterCreateWithoutGuildInput[] | Prisma.CommunityCounterUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.CommunityCounterCreateOrConnectWithoutGuildInput | Prisma.CommunityCounterCreateOrConnectWithoutGuildInput[];
    upsert?: Prisma.CommunityCounterUpsertWithWhereUniqueWithoutGuildInput | Prisma.CommunityCounterUpsertWithWhereUniqueWithoutGuildInput[];
    createMany?: Prisma.CommunityCounterCreateManyGuildInputEnvelope;
    set?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
    disconnect?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
    delete?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
    connect?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
    update?: Prisma.CommunityCounterUpdateWithWhereUniqueWithoutGuildInput | Prisma.CommunityCounterUpdateWithWhereUniqueWithoutGuildInput[];
    updateMany?: Prisma.CommunityCounterUpdateManyWithWhereWithoutGuildInput | Prisma.CommunityCounterUpdateManyWithWhereWithoutGuildInput[];
    deleteMany?: Prisma.CommunityCounterScalarWhereInput | Prisma.CommunityCounterScalarWhereInput[];
};
export type CommunityCounterUncheckedUpdateManyWithoutGuildNestedInput = {
    create?: Prisma.XOR<Prisma.CommunityCounterCreateWithoutGuildInput, Prisma.CommunityCounterUncheckedCreateWithoutGuildInput> | Prisma.CommunityCounterCreateWithoutGuildInput[] | Prisma.CommunityCounterUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.CommunityCounterCreateOrConnectWithoutGuildInput | Prisma.CommunityCounterCreateOrConnectWithoutGuildInput[];
    upsert?: Prisma.CommunityCounterUpsertWithWhereUniqueWithoutGuildInput | Prisma.CommunityCounterUpsertWithWhereUniqueWithoutGuildInput[];
    createMany?: Prisma.CommunityCounterCreateManyGuildInputEnvelope;
    set?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
    disconnect?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
    delete?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
    connect?: Prisma.CommunityCounterWhereUniqueInput | Prisma.CommunityCounterWhereUniqueInput[];
    update?: Prisma.CommunityCounterUpdateWithWhereUniqueWithoutGuildInput | Prisma.CommunityCounterUpdateWithWhereUniqueWithoutGuildInput[];
    updateMany?: Prisma.CommunityCounterUpdateManyWithWhereWithoutGuildInput | Prisma.CommunityCounterUpdateManyWithWhereWithoutGuildInput[];
    deleteMany?: Prisma.CommunityCounterScalarWhereInput | Prisma.CommunityCounterScalarWhereInput[];
};
export type EnumCommunityCounterTypeFieldUpdateOperationsInput = {
    set?: $Enums.CommunityCounterType;
};
export type CommunityCounterCreateWithoutGuildInput = {
    id?: string;
    enabled?: boolean;
    channelId: string;
    labelTemplate: string;
    type: $Enums.CommunityCounterType;
    roleId?: string | null;
    intervalSeconds: number;
    lastValue?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CommunityCounterUncheckedCreateWithoutGuildInput = {
    id?: string;
    enabled?: boolean;
    channelId: string;
    labelTemplate: string;
    type: $Enums.CommunityCounterType;
    roleId?: string | null;
    intervalSeconds: number;
    lastValue?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CommunityCounterCreateOrConnectWithoutGuildInput = {
    where: Prisma.CommunityCounterWhereUniqueInput;
    create: Prisma.XOR<Prisma.CommunityCounterCreateWithoutGuildInput, Prisma.CommunityCounterUncheckedCreateWithoutGuildInput>;
};
export type CommunityCounterCreateManyGuildInputEnvelope = {
    data: Prisma.CommunityCounterCreateManyGuildInput | Prisma.CommunityCounterCreateManyGuildInput[];
    skipDuplicates?: boolean;
};
export type CommunityCounterUpsertWithWhereUniqueWithoutGuildInput = {
    where: Prisma.CommunityCounterWhereUniqueInput;
    update: Prisma.XOR<Prisma.CommunityCounterUpdateWithoutGuildInput, Prisma.CommunityCounterUncheckedUpdateWithoutGuildInput>;
    create: Prisma.XOR<Prisma.CommunityCounterCreateWithoutGuildInput, Prisma.CommunityCounterUncheckedCreateWithoutGuildInput>;
};
export type CommunityCounterUpdateWithWhereUniqueWithoutGuildInput = {
    where: Prisma.CommunityCounterWhereUniqueInput;
    data: Prisma.XOR<Prisma.CommunityCounterUpdateWithoutGuildInput, Prisma.CommunityCounterUncheckedUpdateWithoutGuildInput>;
};
export type CommunityCounterUpdateManyWithWhereWithoutGuildInput = {
    where: Prisma.CommunityCounterScalarWhereInput;
    data: Prisma.XOR<Prisma.CommunityCounterUpdateManyMutationInput, Prisma.CommunityCounterUncheckedUpdateManyWithoutGuildInput>;
};
export type CommunityCounterScalarWhereInput = {
    AND?: Prisma.CommunityCounterScalarWhereInput | Prisma.CommunityCounterScalarWhereInput[];
    OR?: Prisma.CommunityCounterScalarWhereInput[];
    NOT?: Prisma.CommunityCounterScalarWhereInput | Prisma.CommunityCounterScalarWhereInput[];
    id?: Prisma.UuidFilter<"CommunityCounter"> | string;
    guildId?: Prisma.UuidFilter<"CommunityCounter"> | string;
    enabled?: Prisma.BoolFilter<"CommunityCounter"> | boolean;
    channelId?: Prisma.StringFilter<"CommunityCounter"> | string;
    labelTemplate?: Prisma.StringFilter<"CommunityCounter"> | string;
    type?: Prisma.EnumCommunityCounterTypeFilter<"CommunityCounter"> | $Enums.CommunityCounterType;
    roleId?: Prisma.StringNullableFilter<"CommunityCounter"> | string | null;
    intervalSeconds?: Prisma.IntFilter<"CommunityCounter"> | number;
    lastValue?: Prisma.IntNullableFilter<"CommunityCounter"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"CommunityCounter"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"CommunityCounter"> | Date | string;
};
export type CommunityCounterCreateManyGuildInput = {
    id?: string;
    enabled?: boolean;
    channelId: string;
    labelTemplate: string;
    type: $Enums.CommunityCounterType;
    roleId?: string | null;
    intervalSeconds: number;
    lastValue?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type CommunityCounterUpdateWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    labelTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumCommunityCounterTypeFieldUpdateOperationsInput | $Enums.CommunityCounterType;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    intervalSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    lastValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunityCounterUncheckedUpdateWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    labelTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumCommunityCounterTypeFieldUpdateOperationsInput | $Enums.CommunityCounterType;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    intervalSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    lastValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunityCounterUncheckedUpdateManyWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    labelTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumCommunityCounterTypeFieldUpdateOperationsInput | $Enums.CommunityCounterType;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    intervalSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    lastValue?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type CommunityCounterSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    enabled?: boolean;
    channelId?: boolean;
    labelTemplate?: boolean;
    type?: boolean;
    roleId?: boolean;
    intervalSeconds?: boolean;
    lastValue?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["communityCounter"]>;
export type CommunityCounterSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    enabled?: boolean;
    channelId?: boolean;
    labelTemplate?: boolean;
    type?: boolean;
    roleId?: boolean;
    intervalSeconds?: boolean;
    lastValue?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["communityCounter"]>;
export type CommunityCounterSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    enabled?: boolean;
    channelId?: boolean;
    labelTemplate?: boolean;
    type?: boolean;
    roleId?: boolean;
    intervalSeconds?: boolean;
    lastValue?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["communityCounter"]>;
export type CommunityCounterSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    enabled?: boolean;
    channelId?: boolean;
    labelTemplate?: boolean;
    type?: boolean;
    roleId?: boolean;
    intervalSeconds?: boolean;
    lastValue?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type CommunityCounterOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "enabled" | "channelId" | "labelTemplate" | "type" | "roleId" | "intervalSeconds" | "lastValue" | "createdAt" | "updatedAt", ExtArgs["result"]["communityCounter"]>;
export type CommunityCounterInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type CommunityCounterIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type CommunityCounterIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type $CommunityCounterPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "CommunityCounter";
    objects: {
        guild: Prisma.$GuildPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        enabled: boolean;
        channelId: string;
        labelTemplate: string;
        type: $Enums.CommunityCounterType;
        roleId: string | null;
        intervalSeconds: number;
        lastValue: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["communityCounter"]>;
    composites: {};
};
export type CommunityCounterGetPayload<S extends boolean | null | undefined | CommunityCounterDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload, S>;
export type CommunityCounterCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<CommunityCounterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: CommunityCounterCountAggregateInputType | true;
};
export interface CommunityCounterDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['CommunityCounter'];
        meta: {
            name: 'CommunityCounter';
        };
    };
    /**
     * Find zero or one CommunityCounter that matches the filter.
     * @param {CommunityCounterFindUniqueArgs} args - Arguments to find a CommunityCounter
     * @example
     * // Get one CommunityCounter
     * const communityCounter = await prisma.communityCounter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CommunityCounterFindUniqueArgs>(args: Prisma.SelectSubset<T, CommunityCounterFindUniqueArgs<ExtArgs>>): Prisma.Prisma__CommunityCounterClient<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one CommunityCounter that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CommunityCounterFindUniqueOrThrowArgs} args - Arguments to find a CommunityCounter
     * @example
     * // Get one CommunityCounter
     * const communityCounter = await prisma.communityCounter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CommunityCounterFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, CommunityCounterFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__CommunityCounterClient<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CommunityCounter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunityCounterFindFirstArgs} args - Arguments to find a CommunityCounter
     * @example
     * // Get one CommunityCounter
     * const communityCounter = await prisma.communityCounter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CommunityCounterFindFirstArgs>(args?: Prisma.SelectSubset<T, CommunityCounterFindFirstArgs<ExtArgs>>): Prisma.Prisma__CommunityCounterClient<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first CommunityCounter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunityCounterFindFirstOrThrowArgs} args - Arguments to find a CommunityCounter
     * @example
     * // Get one CommunityCounter
     * const communityCounter = await prisma.communityCounter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CommunityCounterFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, CommunityCounterFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__CommunityCounterClient<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more CommunityCounters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunityCounterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CommunityCounters
     * const communityCounters = await prisma.communityCounter.findMany()
     *
     * // Get first 10 CommunityCounters
     * const communityCounters = await prisma.communityCounter.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const communityCounterWithIdOnly = await prisma.communityCounter.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CommunityCounterFindManyArgs>(args?: Prisma.SelectSubset<T, CommunityCounterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a CommunityCounter.
     * @param {CommunityCounterCreateArgs} args - Arguments to create a CommunityCounter.
     * @example
     * // Create one CommunityCounter
     * const CommunityCounter = await prisma.communityCounter.create({
     *   data: {
     *     // ... data to create a CommunityCounter
     *   }
     * })
     *
     */
    create<T extends CommunityCounterCreateArgs>(args: Prisma.SelectSubset<T, CommunityCounterCreateArgs<ExtArgs>>): Prisma.Prisma__CommunityCounterClient<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many CommunityCounters.
     * @param {CommunityCounterCreateManyArgs} args - Arguments to create many CommunityCounters.
     * @example
     * // Create many CommunityCounters
     * const communityCounter = await prisma.communityCounter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CommunityCounterCreateManyArgs>(args?: Prisma.SelectSubset<T, CommunityCounterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many CommunityCounters and returns the data saved in the database.
     * @param {CommunityCounterCreateManyAndReturnArgs} args - Arguments to create many CommunityCounters.
     * @example
     * // Create many CommunityCounters
     * const communityCounter = await prisma.communityCounter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many CommunityCounters and only return the `id`
     * const communityCounterWithIdOnly = await prisma.communityCounter.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CommunityCounterCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, CommunityCounterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a CommunityCounter.
     * @param {CommunityCounterDeleteArgs} args - Arguments to delete one CommunityCounter.
     * @example
     * // Delete one CommunityCounter
     * const CommunityCounter = await prisma.communityCounter.delete({
     *   where: {
     *     // ... filter to delete one CommunityCounter
     *   }
     * })
     *
     */
    delete<T extends CommunityCounterDeleteArgs>(args: Prisma.SelectSubset<T, CommunityCounterDeleteArgs<ExtArgs>>): Prisma.Prisma__CommunityCounterClient<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one CommunityCounter.
     * @param {CommunityCounterUpdateArgs} args - Arguments to update one CommunityCounter.
     * @example
     * // Update one CommunityCounter
     * const communityCounter = await prisma.communityCounter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CommunityCounterUpdateArgs>(args: Prisma.SelectSubset<T, CommunityCounterUpdateArgs<ExtArgs>>): Prisma.Prisma__CommunityCounterClient<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more CommunityCounters.
     * @param {CommunityCounterDeleteManyArgs} args - Arguments to filter CommunityCounters to delete.
     * @example
     * // Delete a few CommunityCounters
     * const { count } = await prisma.communityCounter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CommunityCounterDeleteManyArgs>(args?: Prisma.SelectSubset<T, CommunityCounterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CommunityCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunityCounterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CommunityCounters
     * const communityCounter = await prisma.communityCounter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CommunityCounterUpdateManyArgs>(args: Prisma.SelectSubset<T, CommunityCounterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more CommunityCounters and returns the data updated in the database.
     * @param {CommunityCounterUpdateManyAndReturnArgs} args - Arguments to update many CommunityCounters.
     * @example
     * // Update many CommunityCounters
     * const communityCounter = await prisma.communityCounter.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more CommunityCounters and only return the `id`
     * const communityCounterWithIdOnly = await prisma.communityCounter.updateManyAndReturn({
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
    updateManyAndReturn<T extends CommunityCounterUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, CommunityCounterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one CommunityCounter.
     * @param {CommunityCounterUpsertArgs} args - Arguments to update or create a CommunityCounter.
     * @example
     * // Update or create a CommunityCounter
     * const communityCounter = await prisma.communityCounter.upsert({
     *   create: {
     *     // ... data to create a CommunityCounter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CommunityCounter we want to update
     *   }
     * })
     */
    upsert<T extends CommunityCounterUpsertArgs>(args: Prisma.SelectSubset<T, CommunityCounterUpsertArgs<ExtArgs>>): Prisma.Prisma__CommunityCounterClient<runtime.Types.Result.GetResult<Prisma.$CommunityCounterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of CommunityCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunityCounterCountArgs} args - Arguments to filter CommunityCounters to count.
     * @example
     * // Count the number of CommunityCounters
     * const count = await prisma.communityCounter.count({
     *   where: {
     *     // ... the filter for the CommunityCounters we want to count
     *   }
     * })
    **/
    count<T extends CommunityCounterCountArgs>(args?: Prisma.Subset<T, CommunityCounterCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], CommunityCounterCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a CommunityCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunityCounterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends CommunityCounterAggregateArgs>(args: Prisma.Subset<T, CommunityCounterAggregateArgs>): Prisma.PrismaPromise<GetCommunityCounterAggregateType<T>>;
    /**
     * Group by CommunityCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CommunityCounterGroupByArgs} args - Group by arguments.
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
    groupBy<T extends CommunityCounterGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: CommunityCounterGroupByArgs['orderBy'];
    } : {
        orderBy?: CommunityCounterGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, CommunityCounterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCommunityCounterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the CommunityCounter model
     */
    readonly fields: CommunityCounterFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for CommunityCounter.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__CommunityCounterClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the CommunityCounter model
 */
export interface CommunityCounterFieldRefs {
    readonly id: Prisma.FieldRef<"CommunityCounter", 'String'>;
    readonly guildId: Prisma.FieldRef<"CommunityCounter", 'String'>;
    readonly enabled: Prisma.FieldRef<"CommunityCounter", 'Boolean'>;
    readonly channelId: Prisma.FieldRef<"CommunityCounter", 'String'>;
    readonly labelTemplate: Prisma.FieldRef<"CommunityCounter", 'String'>;
    readonly type: Prisma.FieldRef<"CommunityCounter", 'CommunityCounterType'>;
    readonly roleId: Prisma.FieldRef<"CommunityCounter", 'String'>;
    readonly intervalSeconds: Prisma.FieldRef<"CommunityCounter", 'Int'>;
    readonly lastValue: Prisma.FieldRef<"CommunityCounter", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"CommunityCounter", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"CommunityCounter", 'DateTime'>;
}
/**
 * CommunityCounter findUnique
 */
export type CommunityCounterFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CommunityCounter to fetch.
     */
    where: Prisma.CommunityCounterWhereUniqueInput;
};
/**
 * CommunityCounter findUniqueOrThrow
 */
export type CommunityCounterFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CommunityCounter to fetch.
     */
    where: Prisma.CommunityCounterWhereUniqueInput;
};
/**
 * CommunityCounter findFirst
 */
export type CommunityCounterFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CommunityCounter to fetch.
     */
    where?: Prisma.CommunityCounterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CommunityCounters to fetch.
     */
    orderBy?: Prisma.CommunityCounterOrderByWithRelationInput | Prisma.CommunityCounterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CommunityCounters.
     */
    cursor?: Prisma.CommunityCounterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CommunityCounters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CommunityCounters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CommunityCounters.
     */
    distinct?: Prisma.CommunityCounterScalarFieldEnum | Prisma.CommunityCounterScalarFieldEnum[];
};
/**
 * CommunityCounter findFirstOrThrow
 */
export type CommunityCounterFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CommunityCounter to fetch.
     */
    where?: Prisma.CommunityCounterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CommunityCounters to fetch.
     */
    orderBy?: Prisma.CommunityCounterOrderByWithRelationInput | Prisma.CommunityCounterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for CommunityCounters.
     */
    cursor?: Prisma.CommunityCounterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CommunityCounters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CommunityCounters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CommunityCounters.
     */
    distinct?: Prisma.CommunityCounterScalarFieldEnum | Prisma.CommunityCounterScalarFieldEnum[];
};
/**
 * CommunityCounter findMany
 */
export type CommunityCounterFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which CommunityCounters to fetch.
     */
    where?: Prisma.CommunityCounterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of CommunityCounters to fetch.
     */
    orderBy?: Prisma.CommunityCounterOrderByWithRelationInput | Prisma.CommunityCounterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing CommunityCounters.
     */
    cursor?: Prisma.CommunityCounterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` CommunityCounters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` CommunityCounters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of CommunityCounters.
     */
    distinct?: Prisma.CommunityCounterScalarFieldEnum | Prisma.CommunityCounterScalarFieldEnum[];
};
/**
 * CommunityCounter create
 */
export type CommunityCounterCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a CommunityCounter.
     */
    data: Prisma.XOR<Prisma.CommunityCounterCreateInput, Prisma.CommunityCounterUncheckedCreateInput>;
};
/**
 * CommunityCounter createMany
 */
export type CommunityCounterCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many CommunityCounters.
     */
    data: Prisma.CommunityCounterCreateManyInput | Prisma.CommunityCounterCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * CommunityCounter createManyAndReturn
 */
export type CommunityCounterCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunityCounter
     */
    select?: Prisma.CommunityCounterSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunityCounter
     */
    omit?: Prisma.CommunityCounterOmit<ExtArgs> | null;
    /**
     * The data used to create many CommunityCounters.
     */
    data: Prisma.CommunityCounterCreateManyInput | Prisma.CommunityCounterCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunityCounterIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * CommunityCounter update
 */
export type CommunityCounterUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a CommunityCounter.
     */
    data: Prisma.XOR<Prisma.CommunityCounterUpdateInput, Prisma.CommunityCounterUncheckedUpdateInput>;
    /**
     * Choose, which CommunityCounter to update.
     */
    where: Prisma.CommunityCounterWhereUniqueInput;
};
/**
 * CommunityCounter updateMany
 */
export type CommunityCounterUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update CommunityCounters.
     */
    data: Prisma.XOR<Prisma.CommunityCounterUpdateManyMutationInput, Prisma.CommunityCounterUncheckedUpdateManyInput>;
    /**
     * Filter which CommunityCounters to update
     */
    where?: Prisma.CommunityCounterWhereInput;
    /**
     * Limit how many CommunityCounters to update.
     */
    limit?: number;
};
/**
 * CommunityCounter updateManyAndReturn
 */
export type CommunityCounterUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CommunityCounter
     */
    select?: Prisma.CommunityCounterSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the CommunityCounter
     */
    omit?: Prisma.CommunityCounterOmit<ExtArgs> | null;
    /**
     * The data used to update CommunityCounters.
     */
    data: Prisma.XOR<Prisma.CommunityCounterUpdateManyMutationInput, Prisma.CommunityCounterUncheckedUpdateManyInput>;
    /**
     * Filter which CommunityCounters to update
     */
    where?: Prisma.CommunityCounterWhereInput;
    /**
     * Limit how many CommunityCounters to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.CommunityCounterIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * CommunityCounter upsert
 */
export type CommunityCounterUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the CommunityCounter to update in case it exists.
     */
    where: Prisma.CommunityCounterWhereUniqueInput;
    /**
     * In case the CommunityCounter found by the `where` argument doesn't exist, create a new CommunityCounter with this data.
     */
    create: Prisma.XOR<Prisma.CommunityCounterCreateInput, Prisma.CommunityCounterUncheckedCreateInput>;
    /**
     * In case the CommunityCounter was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.CommunityCounterUpdateInput, Prisma.CommunityCounterUncheckedUpdateInput>;
};
/**
 * CommunityCounter delete
 */
export type CommunityCounterDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which CommunityCounter to delete.
     */
    where: Prisma.CommunityCounterWhereUniqueInput;
};
/**
 * CommunityCounter deleteMany
 */
export type CommunityCounterDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which CommunityCounters to delete
     */
    where?: Prisma.CommunityCounterWhereInput;
    /**
     * Limit how many CommunityCounters to delete.
     */
    limit?: number;
};
/**
 * CommunityCounter without action
 */
export type CommunityCounterDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
//# sourceMappingURL=CommunityCounter.d.ts.map
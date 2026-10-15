import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model ScheduledMessageRun
 *
 */
export type ScheduledMessageRunModel = runtime.Types.Result.DefaultSelection<Prisma.$ScheduledMessageRunPayload>;
export type AggregateScheduledMessageRun = {
    _count: ScheduledMessageRunCountAggregateOutputType | null;
    _min: ScheduledMessageRunMinAggregateOutputType | null;
    _max: ScheduledMessageRunMaxAggregateOutputType | null;
};
export type ScheduledMessageRunMinAggregateOutputType = {
    id: string | null;
    messageId: string | null;
    guildId: string | null;
    success: boolean | null;
    discordMessageId: string | null;
    error: string | null;
    manual: boolean | null;
    ranAt: Date | null;
};
export type ScheduledMessageRunMaxAggregateOutputType = {
    id: string | null;
    messageId: string | null;
    guildId: string | null;
    success: boolean | null;
    discordMessageId: string | null;
    error: string | null;
    manual: boolean | null;
    ranAt: Date | null;
};
export type ScheduledMessageRunCountAggregateOutputType = {
    id: number;
    messageId: number;
    guildId: number;
    success: number;
    discordMessageId: number;
    error: number;
    manual: number;
    ranAt: number;
    _all: number;
};
export type ScheduledMessageRunMinAggregateInputType = {
    id?: true;
    messageId?: true;
    guildId?: true;
    success?: true;
    discordMessageId?: true;
    error?: true;
    manual?: true;
    ranAt?: true;
};
export type ScheduledMessageRunMaxAggregateInputType = {
    id?: true;
    messageId?: true;
    guildId?: true;
    success?: true;
    discordMessageId?: true;
    error?: true;
    manual?: true;
    ranAt?: true;
};
export type ScheduledMessageRunCountAggregateInputType = {
    id?: true;
    messageId?: true;
    guildId?: true;
    success?: true;
    discordMessageId?: true;
    error?: true;
    manual?: true;
    ranAt?: true;
    _all?: true;
};
export type ScheduledMessageRunAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ScheduledMessageRun to aggregate.
     */
    where?: Prisma.ScheduledMessageRunWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScheduledMessageRuns to fetch.
     */
    orderBy?: Prisma.ScheduledMessageRunOrderByWithRelationInput | Prisma.ScheduledMessageRunOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ScheduledMessageRunWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScheduledMessageRuns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScheduledMessageRuns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ScheduledMessageRuns
    **/
    _count?: true | ScheduledMessageRunCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ScheduledMessageRunMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ScheduledMessageRunMaxAggregateInputType;
};
export type GetScheduledMessageRunAggregateType<T extends ScheduledMessageRunAggregateArgs> = {
    [P in keyof T & keyof AggregateScheduledMessageRun]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateScheduledMessageRun[P]> : Prisma.GetScalarType<T[P], AggregateScheduledMessageRun[P]>;
};
export type ScheduledMessageRunGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ScheduledMessageRunWhereInput;
    orderBy?: Prisma.ScheduledMessageRunOrderByWithAggregationInput | Prisma.ScheduledMessageRunOrderByWithAggregationInput[];
    by: Prisma.ScheduledMessageRunScalarFieldEnum[] | Prisma.ScheduledMessageRunScalarFieldEnum;
    having?: Prisma.ScheduledMessageRunScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ScheduledMessageRunCountAggregateInputType | true;
    _min?: ScheduledMessageRunMinAggregateInputType;
    _max?: ScheduledMessageRunMaxAggregateInputType;
};
export type ScheduledMessageRunGroupByOutputType = {
    id: string;
    messageId: string;
    guildId: string;
    success: boolean;
    discordMessageId: string | null;
    error: string | null;
    manual: boolean;
    ranAt: Date;
    _count: ScheduledMessageRunCountAggregateOutputType | null;
    _min: ScheduledMessageRunMinAggregateOutputType | null;
    _max: ScheduledMessageRunMaxAggregateOutputType | null;
};
export type GetScheduledMessageRunGroupByPayload<T extends ScheduledMessageRunGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ScheduledMessageRunGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ScheduledMessageRunGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ScheduledMessageRunGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ScheduledMessageRunGroupByOutputType[P]>;
}>>;
export type ScheduledMessageRunWhereInput = {
    AND?: Prisma.ScheduledMessageRunWhereInput | Prisma.ScheduledMessageRunWhereInput[];
    OR?: Prisma.ScheduledMessageRunWhereInput[];
    NOT?: Prisma.ScheduledMessageRunWhereInput | Prisma.ScheduledMessageRunWhereInput[];
    id?: Prisma.UuidFilter<"ScheduledMessageRun"> | string;
    messageId?: Prisma.UuidFilter<"ScheduledMessageRun"> | string;
    guildId?: Prisma.StringFilter<"ScheduledMessageRun"> | string;
    success?: Prisma.BoolFilter<"ScheduledMessageRun"> | boolean;
    discordMessageId?: Prisma.StringNullableFilter<"ScheduledMessageRun"> | string | null;
    error?: Prisma.StringNullableFilter<"ScheduledMessageRun"> | string | null;
    manual?: Prisma.BoolFilter<"ScheduledMessageRun"> | boolean;
    ranAt?: Prisma.DateTimeFilter<"ScheduledMessageRun"> | Date | string;
    message?: Prisma.XOR<Prisma.ScheduledMessageScalarRelationFilter, Prisma.ScheduledMessageWhereInput>;
};
export type ScheduledMessageRunOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    messageId?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    discordMessageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    error?: Prisma.SortOrderInput | Prisma.SortOrder;
    manual?: Prisma.SortOrder;
    ranAt?: Prisma.SortOrder;
    message?: Prisma.ScheduledMessageOrderByWithRelationInput;
};
export type ScheduledMessageRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ScheduledMessageRunWhereInput | Prisma.ScheduledMessageRunWhereInput[];
    OR?: Prisma.ScheduledMessageRunWhereInput[];
    NOT?: Prisma.ScheduledMessageRunWhereInput | Prisma.ScheduledMessageRunWhereInput[];
    messageId?: Prisma.UuidFilter<"ScheduledMessageRun"> | string;
    guildId?: Prisma.StringFilter<"ScheduledMessageRun"> | string;
    success?: Prisma.BoolFilter<"ScheduledMessageRun"> | boolean;
    discordMessageId?: Prisma.StringNullableFilter<"ScheduledMessageRun"> | string | null;
    error?: Prisma.StringNullableFilter<"ScheduledMessageRun"> | string | null;
    manual?: Prisma.BoolFilter<"ScheduledMessageRun"> | boolean;
    ranAt?: Prisma.DateTimeFilter<"ScheduledMessageRun"> | Date | string;
    message?: Prisma.XOR<Prisma.ScheduledMessageScalarRelationFilter, Prisma.ScheduledMessageWhereInput>;
}, "id">;
export type ScheduledMessageRunOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    messageId?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    discordMessageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    error?: Prisma.SortOrderInput | Prisma.SortOrder;
    manual?: Prisma.SortOrder;
    ranAt?: Prisma.SortOrder;
    _count?: Prisma.ScheduledMessageRunCountOrderByAggregateInput;
    _max?: Prisma.ScheduledMessageRunMaxOrderByAggregateInput;
    _min?: Prisma.ScheduledMessageRunMinOrderByAggregateInput;
};
export type ScheduledMessageRunScalarWhereWithAggregatesInput = {
    AND?: Prisma.ScheduledMessageRunScalarWhereWithAggregatesInput | Prisma.ScheduledMessageRunScalarWhereWithAggregatesInput[];
    OR?: Prisma.ScheduledMessageRunScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ScheduledMessageRunScalarWhereWithAggregatesInput | Prisma.ScheduledMessageRunScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ScheduledMessageRun"> | string;
    messageId?: Prisma.UuidWithAggregatesFilter<"ScheduledMessageRun"> | string;
    guildId?: Prisma.StringWithAggregatesFilter<"ScheduledMessageRun"> | string;
    success?: Prisma.BoolWithAggregatesFilter<"ScheduledMessageRun"> | boolean;
    discordMessageId?: Prisma.StringNullableWithAggregatesFilter<"ScheduledMessageRun"> | string | null;
    error?: Prisma.StringNullableWithAggregatesFilter<"ScheduledMessageRun"> | string | null;
    manual?: Prisma.BoolWithAggregatesFilter<"ScheduledMessageRun"> | boolean;
    ranAt?: Prisma.DateTimeWithAggregatesFilter<"ScheduledMessageRun"> | Date | string;
};
export type ScheduledMessageRunCreateInput = {
    id?: string;
    guildId: string;
    success: boolean;
    discordMessageId?: string | null;
    error?: string | null;
    manual?: boolean;
    ranAt?: Date | string;
    message: Prisma.ScheduledMessageCreateNestedOneWithoutRunsInput;
};
export type ScheduledMessageRunUncheckedCreateInput = {
    id?: string;
    messageId: string;
    guildId: string;
    success: boolean;
    discordMessageId?: string | null;
    error?: string | null;
    manual?: boolean;
    ranAt?: Date | string;
};
export type ScheduledMessageRunUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    discordMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    manual?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    ranAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    message?: Prisma.ScheduledMessageUpdateOneRequiredWithoutRunsNestedInput;
};
export type ScheduledMessageRunUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    messageId?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    discordMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    manual?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    ranAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduledMessageRunCreateManyInput = {
    id?: string;
    messageId: string;
    guildId: string;
    success: boolean;
    discordMessageId?: string | null;
    error?: string | null;
    manual?: boolean;
    ranAt?: Date | string;
};
export type ScheduledMessageRunUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    discordMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    manual?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    ranAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduledMessageRunUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    messageId?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    discordMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    manual?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    ranAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduledMessageRunListRelationFilter = {
    every?: Prisma.ScheduledMessageRunWhereInput;
    some?: Prisma.ScheduledMessageRunWhereInput;
    none?: Prisma.ScheduledMessageRunWhereInput;
};
export type ScheduledMessageRunOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type ScheduledMessageRunCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    messageId?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    discordMessageId?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    manual?: Prisma.SortOrder;
    ranAt?: Prisma.SortOrder;
};
export type ScheduledMessageRunMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    messageId?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    discordMessageId?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    manual?: Prisma.SortOrder;
    ranAt?: Prisma.SortOrder;
};
export type ScheduledMessageRunMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    messageId?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    discordMessageId?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    manual?: Prisma.SortOrder;
    ranAt?: Prisma.SortOrder;
};
export type ScheduledMessageRunCreateNestedManyWithoutMessageInput = {
    create?: Prisma.XOR<Prisma.ScheduledMessageRunCreateWithoutMessageInput, Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput> | Prisma.ScheduledMessageRunCreateWithoutMessageInput[] | Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput[];
    connectOrCreate?: Prisma.ScheduledMessageRunCreateOrConnectWithoutMessageInput | Prisma.ScheduledMessageRunCreateOrConnectWithoutMessageInput[];
    createMany?: Prisma.ScheduledMessageRunCreateManyMessageInputEnvelope;
    connect?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
};
export type ScheduledMessageRunUncheckedCreateNestedManyWithoutMessageInput = {
    create?: Prisma.XOR<Prisma.ScheduledMessageRunCreateWithoutMessageInput, Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput> | Prisma.ScheduledMessageRunCreateWithoutMessageInput[] | Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput[];
    connectOrCreate?: Prisma.ScheduledMessageRunCreateOrConnectWithoutMessageInput | Prisma.ScheduledMessageRunCreateOrConnectWithoutMessageInput[];
    createMany?: Prisma.ScheduledMessageRunCreateManyMessageInputEnvelope;
    connect?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
};
export type ScheduledMessageRunUpdateManyWithoutMessageNestedInput = {
    create?: Prisma.XOR<Prisma.ScheduledMessageRunCreateWithoutMessageInput, Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput> | Prisma.ScheduledMessageRunCreateWithoutMessageInput[] | Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput[];
    connectOrCreate?: Prisma.ScheduledMessageRunCreateOrConnectWithoutMessageInput | Prisma.ScheduledMessageRunCreateOrConnectWithoutMessageInput[];
    upsert?: Prisma.ScheduledMessageRunUpsertWithWhereUniqueWithoutMessageInput | Prisma.ScheduledMessageRunUpsertWithWhereUniqueWithoutMessageInput[];
    createMany?: Prisma.ScheduledMessageRunCreateManyMessageInputEnvelope;
    set?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
    disconnect?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
    delete?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
    connect?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
    update?: Prisma.ScheduledMessageRunUpdateWithWhereUniqueWithoutMessageInput | Prisma.ScheduledMessageRunUpdateWithWhereUniqueWithoutMessageInput[];
    updateMany?: Prisma.ScheduledMessageRunUpdateManyWithWhereWithoutMessageInput | Prisma.ScheduledMessageRunUpdateManyWithWhereWithoutMessageInput[];
    deleteMany?: Prisma.ScheduledMessageRunScalarWhereInput | Prisma.ScheduledMessageRunScalarWhereInput[];
};
export type ScheduledMessageRunUncheckedUpdateManyWithoutMessageNestedInput = {
    create?: Prisma.XOR<Prisma.ScheduledMessageRunCreateWithoutMessageInput, Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput> | Prisma.ScheduledMessageRunCreateWithoutMessageInput[] | Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput[];
    connectOrCreate?: Prisma.ScheduledMessageRunCreateOrConnectWithoutMessageInput | Prisma.ScheduledMessageRunCreateOrConnectWithoutMessageInput[];
    upsert?: Prisma.ScheduledMessageRunUpsertWithWhereUniqueWithoutMessageInput | Prisma.ScheduledMessageRunUpsertWithWhereUniqueWithoutMessageInput[];
    createMany?: Prisma.ScheduledMessageRunCreateManyMessageInputEnvelope;
    set?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
    disconnect?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
    delete?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
    connect?: Prisma.ScheduledMessageRunWhereUniqueInput | Prisma.ScheduledMessageRunWhereUniqueInput[];
    update?: Prisma.ScheduledMessageRunUpdateWithWhereUniqueWithoutMessageInput | Prisma.ScheduledMessageRunUpdateWithWhereUniqueWithoutMessageInput[];
    updateMany?: Prisma.ScheduledMessageRunUpdateManyWithWhereWithoutMessageInput | Prisma.ScheduledMessageRunUpdateManyWithWhereWithoutMessageInput[];
    deleteMany?: Prisma.ScheduledMessageRunScalarWhereInput | Prisma.ScheduledMessageRunScalarWhereInput[];
};
export type ScheduledMessageRunCreateWithoutMessageInput = {
    id?: string;
    guildId: string;
    success: boolean;
    discordMessageId?: string | null;
    error?: string | null;
    manual?: boolean;
    ranAt?: Date | string;
};
export type ScheduledMessageRunUncheckedCreateWithoutMessageInput = {
    id?: string;
    guildId: string;
    success: boolean;
    discordMessageId?: string | null;
    error?: string | null;
    manual?: boolean;
    ranAt?: Date | string;
};
export type ScheduledMessageRunCreateOrConnectWithoutMessageInput = {
    where: Prisma.ScheduledMessageRunWhereUniqueInput;
    create: Prisma.XOR<Prisma.ScheduledMessageRunCreateWithoutMessageInput, Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput>;
};
export type ScheduledMessageRunCreateManyMessageInputEnvelope = {
    data: Prisma.ScheduledMessageRunCreateManyMessageInput | Prisma.ScheduledMessageRunCreateManyMessageInput[];
    skipDuplicates?: boolean;
};
export type ScheduledMessageRunUpsertWithWhereUniqueWithoutMessageInput = {
    where: Prisma.ScheduledMessageRunWhereUniqueInput;
    update: Prisma.XOR<Prisma.ScheduledMessageRunUpdateWithoutMessageInput, Prisma.ScheduledMessageRunUncheckedUpdateWithoutMessageInput>;
    create: Prisma.XOR<Prisma.ScheduledMessageRunCreateWithoutMessageInput, Prisma.ScheduledMessageRunUncheckedCreateWithoutMessageInput>;
};
export type ScheduledMessageRunUpdateWithWhereUniqueWithoutMessageInput = {
    where: Prisma.ScheduledMessageRunWhereUniqueInput;
    data: Prisma.XOR<Prisma.ScheduledMessageRunUpdateWithoutMessageInput, Prisma.ScheduledMessageRunUncheckedUpdateWithoutMessageInput>;
};
export type ScheduledMessageRunUpdateManyWithWhereWithoutMessageInput = {
    where: Prisma.ScheduledMessageRunScalarWhereInput;
    data: Prisma.XOR<Prisma.ScheduledMessageRunUpdateManyMutationInput, Prisma.ScheduledMessageRunUncheckedUpdateManyWithoutMessageInput>;
};
export type ScheduledMessageRunScalarWhereInput = {
    AND?: Prisma.ScheduledMessageRunScalarWhereInput | Prisma.ScheduledMessageRunScalarWhereInput[];
    OR?: Prisma.ScheduledMessageRunScalarWhereInput[];
    NOT?: Prisma.ScheduledMessageRunScalarWhereInput | Prisma.ScheduledMessageRunScalarWhereInput[];
    id?: Prisma.UuidFilter<"ScheduledMessageRun"> | string;
    messageId?: Prisma.UuidFilter<"ScheduledMessageRun"> | string;
    guildId?: Prisma.StringFilter<"ScheduledMessageRun"> | string;
    success?: Prisma.BoolFilter<"ScheduledMessageRun"> | boolean;
    discordMessageId?: Prisma.StringNullableFilter<"ScheduledMessageRun"> | string | null;
    error?: Prisma.StringNullableFilter<"ScheduledMessageRun"> | string | null;
    manual?: Prisma.BoolFilter<"ScheduledMessageRun"> | boolean;
    ranAt?: Prisma.DateTimeFilter<"ScheduledMessageRun"> | Date | string;
};
export type ScheduledMessageRunCreateManyMessageInput = {
    id?: string;
    guildId: string;
    success: boolean;
    discordMessageId?: string | null;
    error?: string | null;
    manual?: boolean;
    ranAt?: Date | string;
};
export type ScheduledMessageRunUpdateWithoutMessageInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    discordMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    manual?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    ranAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduledMessageRunUncheckedUpdateWithoutMessageInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    discordMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    manual?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    ranAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduledMessageRunUncheckedUpdateManyWithoutMessageInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    discordMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    manual?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    ranAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ScheduledMessageRunSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    messageId?: boolean;
    guildId?: boolean;
    success?: boolean;
    discordMessageId?: boolean;
    error?: boolean;
    manual?: boolean;
    ranAt?: boolean;
    message?: boolean | Prisma.ScheduledMessageDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scheduledMessageRun"]>;
export type ScheduledMessageRunSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    messageId?: boolean;
    guildId?: boolean;
    success?: boolean;
    discordMessageId?: boolean;
    error?: boolean;
    manual?: boolean;
    ranAt?: boolean;
    message?: boolean | Prisma.ScheduledMessageDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scheduledMessageRun"]>;
export type ScheduledMessageRunSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    messageId?: boolean;
    guildId?: boolean;
    success?: boolean;
    discordMessageId?: boolean;
    error?: boolean;
    manual?: boolean;
    ranAt?: boolean;
    message?: boolean | Prisma.ScheduledMessageDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["scheduledMessageRun"]>;
export type ScheduledMessageRunSelectScalar = {
    id?: boolean;
    messageId?: boolean;
    guildId?: boolean;
    success?: boolean;
    discordMessageId?: boolean;
    error?: boolean;
    manual?: boolean;
    ranAt?: boolean;
};
export type ScheduledMessageRunOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "messageId" | "guildId" | "success" | "discordMessageId" | "error" | "manual" | "ranAt", ExtArgs["result"]["scheduledMessageRun"]>;
export type ScheduledMessageRunInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    message?: boolean | Prisma.ScheduledMessageDefaultArgs<ExtArgs>;
};
export type ScheduledMessageRunIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    message?: boolean | Prisma.ScheduledMessageDefaultArgs<ExtArgs>;
};
export type ScheduledMessageRunIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    message?: boolean | Prisma.ScheduledMessageDefaultArgs<ExtArgs>;
};
export type $ScheduledMessageRunPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ScheduledMessageRun";
    objects: {
        message: Prisma.$ScheduledMessagePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        messageId: string;
        guildId: string;
        success: boolean;
        discordMessageId: string | null;
        error: string | null;
        manual: boolean;
        ranAt: Date;
    }, ExtArgs["result"]["scheduledMessageRun"]>;
    composites: {};
};
export type ScheduledMessageRunGetPayload<S extends boolean | null | undefined | ScheduledMessageRunDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload, S>;
export type ScheduledMessageRunCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ScheduledMessageRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ScheduledMessageRunCountAggregateInputType | true;
};
export interface ScheduledMessageRunDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ScheduledMessageRun'];
        meta: {
            name: 'ScheduledMessageRun';
        };
    };
    /**
     * Find zero or one ScheduledMessageRun that matches the filter.
     * @param {ScheduledMessageRunFindUniqueArgs} args - Arguments to find a ScheduledMessageRun
     * @example
     * // Get one ScheduledMessageRun
     * const scheduledMessageRun = await prisma.scheduledMessageRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ScheduledMessageRunFindUniqueArgs>(args: Prisma.SelectSubset<T, ScheduledMessageRunFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageRunClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ScheduledMessageRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ScheduledMessageRunFindUniqueOrThrowArgs} args - Arguments to find a ScheduledMessageRun
     * @example
     * // Get one ScheduledMessageRun
     * const scheduledMessageRun = await prisma.scheduledMessageRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ScheduledMessageRunFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ScheduledMessageRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageRunClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ScheduledMessageRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduledMessageRunFindFirstArgs} args - Arguments to find a ScheduledMessageRun
     * @example
     * // Get one ScheduledMessageRun
     * const scheduledMessageRun = await prisma.scheduledMessageRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ScheduledMessageRunFindFirstArgs>(args?: Prisma.SelectSubset<T, ScheduledMessageRunFindFirstArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageRunClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ScheduledMessageRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduledMessageRunFindFirstOrThrowArgs} args - Arguments to find a ScheduledMessageRun
     * @example
     * // Get one ScheduledMessageRun
     * const scheduledMessageRun = await prisma.scheduledMessageRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ScheduledMessageRunFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ScheduledMessageRunFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageRunClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ScheduledMessageRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduledMessageRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ScheduledMessageRuns
     * const scheduledMessageRuns = await prisma.scheduledMessageRun.findMany()
     *
     * // Get first 10 ScheduledMessageRuns
     * const scheduledMessageRuns = await prisma.scheduledMessageRun.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const scheduledMessageRunWithIdOnly = await prisma.scheduledMessageRun.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ScheduledMessageRunFindManyArgs>(args?: Prisma.SelectSubset<T, ScheduledMessageRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ScheduledMessageRun.
     * @param {ScheduledMessageRunCreateArgs} args - Arguments to create a ScheduledMessageRun.
     * @example
     * // Create one ScheduledMessageRun
     * const ScheduledMessageRun = await prisma.scheduledMessageRun.create({
     *   data: {
     *     // ... data to create a ScheduledMessageRun
     *   }
     * })
     *
     */
    create<T extends ScheduledMessageRunCreateArgs>(args: Prisma.SelectSubset<T, ScheduledMessageRunCreateArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageRunClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ScheduledMessageRuns.
     * @param {ScheduledMessageRunCreateManyArgs} args - Arguments to create many ScheduledMessageRuns.
     * @example
     * // Create many ScheduledMessageRuns
     * const scheduledMessageRun = await prisma.scheduledMessageRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ScheduledMessageRunCreateManyArgs>(args?: Prisma.SelectSubset<T, ScheduledMessageRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ScheduledMessageRuns and returns the data saved in the database.
     * @param {ScheduledMessageRunCreateManyAndReturnArgs} args - Arguments to create many ScheduledMessageRuns.
     * @example
     * // Create many ScheduledMessageRuns
     * const scheduledMessageRun = await prisma.scheduledMessageRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ScheduledMessageRuns and only return the `id`
     * const scheduledMessageRunWithIdOnly = await prisma.scheduledMessageRun.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ScheduledMessageRunCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ScheduledMessageRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ScheduledMessageRun.
     * @param {ScheduledMessageRunDeleteArgs} args - Arguments to delete one ScheduledMessageRun.
     * @example
     * // Delete one ScheduledMessageRun
     * const ScheduledMessageRun = await prisma.scheduledMessageRun.delete({
     *   where: {
     *     // ... filter to delete one ScheduledMessageRun
     *   }
     * })
     *
     */
    delete<T extends ScheduledMessageRunDeleteArgs>(args: Prisma.SelectSubset<T, ScheduledMessageRunDeleteArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageRunClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ScheduledMessageRun.
     * @param {ScheduledMessageRunUpdateArgs} args - Arguments to update one ScheduledMessageRun.
     * @example
     * // Update one ScheduledMessageRun
     * const scheduledMessageRun = await prisma.scheduledMessageRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ScheduledMessageRunUpdateArgs>(args: Prisma.SelectSubset<T, ScheduledMessageRunUpdateArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageRunClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ScheduledMessageRuns.
     * @param {ScheduledMessageRunDeleteManyArgs} args - Arguments to filter ScheduledMessageRuns to delete.
     * @example
     * // Delete a few ScheduledMessageRuns
     * const { count } = await prisma.scheduledMessageRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ScheduledMessageRunDeleteManyArgs>(args?: Prisma.SelectSubset<T, ScheduledMessageRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ScheduledMessageRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduledMessageRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ScheduledMessageRuns
     * const scheduledMessageRun = await prisma.scheduledMessageRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ScheduledMessageRunUpdateManyArgs>(args: Prisma.SelectSubset<T, ScheduledMessageRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ScheduledMessageRuns and returns the data updated in the database.
     * @param {ScheduledMessageRunUpdateManyAndReturnArgs} args - Arguments to update many ScheduledMessageRuns.
     * @example
     * // Update many ScheduledMessageRuns
     * const scheduledMessageRun = await prisma.scheduledMessageRun.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ScheduledMessageRuns and only return the `id`
     * const scheduledMessageRunWithIdOnly = await prisma.scheduledMessageRun.updateManyAndReturn({
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
    updateManyAndReturn<T extends ScheduledMessageRunUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ScheduledMessageRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ScheduledMessageRun.
     * @param {ScheduledMessageRunUpsertArgs} args - Arguments to update or create a ScheduledMessageRun.
     * @example
     * // Update or create a ScheduledMessageRun
     * const scheduledMessageRun = await prisma.scheduledMessageRun.upsert({
     *   create: {
     *     // ... data to create a ScheduledMessageRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ScheduledMessageRun we want to update
     *   }
     * })
     */
    upsert<T extends ScheduledMessageRunUpsertArgs>(args: Prisma.SelectSubset<T, ScheduledMessageRunUpsertArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageRunClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessageRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ScheduledMessageRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduledMessageRunCountArgs} args - Arguments to filter ScheduledMessageRuns to count.
     * @example
     * // Count the number of ScheduledMessageRuns
     * const count = await prisma.scheduledMessageRun.count({
     *   where: {
     *     // ... the filter for the ScheduledMessageRuns we want to count
     *   }
     * })
    **/
    count<T extends ScheduledMessageRunCountArgs>(args?: Prisma.Subset<T, ScheduledMessageRunCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ScheduledMessageRunCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ScheduledMessageRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduledMessageRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ScheduledMessageRunAggregateArgs>(args: Prisma.Subset<T, ScheduledMessageRunAggregateArgs>): Prisma.PrismaPromise<GetScheduledMessageRunAggregateType<T>>;
    /**
     * Group by ScheduledMessageRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ScheduledMessageRunGroupByArgs} args - Group by arguments.
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
    groupBy<T extends ScheduledMessageRunGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ScheduledMessageRunGroupByArgs['orderBy'];
    } : {
        orderBy?: ScheduledMessageRunGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ScheduledMessageRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetScheduledMessageRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ScheduledMessageRun model
     */
    readonly fields: ScheduledMessageRunFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ScheduledMessageRun.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ScheduledMessageRunClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    message<T extends Prisma.ScheduledMessageDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ScheduledMessageDefaultArgs<ExtArgs>>): Prisma.Prisma__ScheduledMessageClient<runtime.Types.Result.GetResult<Prisma.$ScheduledMessagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the ScheduledMessageRun model
 */
export interface ScheduledMessageRunFieldRefs {
    readonly id: Prisma.FieldRef<"ScheduledMessageRun", 'String'>;
    readonly messageId: Prisma.FieldRef<"ScheduledMessageRun", 'String'>;
    readonly guildId: Prisma.FieldRef<"ScheduledMessageRun", 'String'>;
    readonly success: Prisma.FieldRef<"ScheduledMessageRun", 'Boolean'>;
    readonly discordMessageId: Prisma.FieldRef<"ScheduledMessageRun", 'String'>;
    readonly error: Prisma.FieldRef<"ScheduledMessageRun", 'String'>;
    readonly manual: Prisma.FieldRef<"ScheduledMessageRun", 'Boolean'>;
    readonly ranAt: Prisma.FieldRef<"ScheduledMessageRun", 'DateTime'>;
}
/**
 * ScheduledMessageRun findUnique
 */
export type ScheduledMessageRunFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduledMessageRun to fetch.
     */
    where: Prisma.ScheduledMessageRunWhereUniqueInput;
};
/**
 * ScheduledMessageRun findUniqueOrThrow
 */
export type ScheduledMessageRunFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduledMessageRun to fetch.
     */
    where: Prisma.ScheduledMessageRunWhereUniqueInput;
};
/**
 * ScheduledMessageRun findFirst
 */
export type ScheduledMessageRunFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduledMessageRun to fetch.
     */
    where?: Prisma.ScheduledMessageRunWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScheduledMessageRuns to fetch.
     */
    orderBy?: Prisma.ScheduledMessageRunOrderByWithRelationInput | Prisma.ScheduledMessageRunOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ScheduledMessageRuns.
     */
    cursor?: Prisma.ScheduledMessageRunWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScheduledMessageRuns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScheduledMessageRuns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ScheduledMessageRuns.
     */
    distinct?: Prisma.ScheduledMessageRunScalarFieldEnum | Prisma.ScheduledMessageRunScalarFieldEnum[];
};
/**
 * ScheduledMessageRun findFirstOrThrow
 */
export type ScheduledMessageRunFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduledMessageRun to fetch.
     */
    where?: Prisma.ScheduledMessageRunWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScheduledMessageRuns to fetch.
     */
    orderBy?: Prisma.ScheduledMessageRunOrderByWithRelationInput | Prisma.ScheduledMessageRunOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ScheduledMessageRuns.
     */
    cursor?: Prisma.ScheduledMessageRunWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScheduledMessageRuns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScheduledMessageRuns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ScheduledMessageRuns.
     */
    distinct?: Prisma.ScheduledMessageRunScalarFieldEnum | Prisma.ScheduledMessageRunScalarFieldEnum[];
};
/**
 * ScheduledMessageRun findMany
 */
export type ScheduledMessageRunFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * Filter, which ScheduledMessageRuns to fetch.
     */
    where?: Prisma.ScheduledMessageRunWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ScheduledMessageRuns to fetch.
     */
    orderBy?: Prisma.ScheduledMessageRunOrderByWithRelationInput | Prisma.ScheduledMessageRunOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ScheduledMessageRuns.
     */
    cursor?: Prisma.ScheduledMessageRunWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ScheduledMessageRuns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ScheduledMessageRuns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ScheduledMessageRuns.
     */
    distinct?: Prisma.ScheduledMessageRunScalarFieldEnum | Prisma.ScheduledMessageRunScalarFieldEnum[];
};
/**
 * ScheduledMessageRun create
 */
export type ScheduledMessageRunCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * The data needed to create a ScheduledMessageRun.
     */
    data: Prisma.XOR<Prisma.ScheduledMessageRunCreateInput, Prisma.ScheduledMessageRunUncheckedCreateInput>;
};
/**
 * ScheduledMessageRun createMany
 */
export type ScheduledMessageRunCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ScheduledMessageRuns.
     */
    data: Prisma.ScheduledMessageRunCreateManyInput | Prisma.ScheduledMessageRunCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ScheduledMessageRun createManyAndReturn
 */
export type ScheduledMessageRunCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * The data used to create many ScheduledMessageRuns.
     */
    data: Prisma.ScheduledMessageRunCreateManyInput | Prisma.ScheduledMessageRunCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * ScheduledMessageRun update
 */
export type ScheduledMessageRunUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * The data needed to update a ScheduledMessageRun.
     */
    data: Prisma.XOR<Prisma.ScheduledMessageRunUpdateInput, Prisma.ScheduledMessageRunUncheckedUpdateInput>;
    /**
     * Choose, which ScheduledMessageRun to update.
     */
    where: Prisma.ScheduledMessageRunWhereUniqueInput;
};
/**
 * ScheduledMessageRun updateMany
 */
export type ScheduledMessageRunUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ScheduledMessageRuns.
     */
    data: Prisma.XOR<Prisma.ScheduledMessageRunUpdateManyMutationInput, Prisma.ScheduledMessageRunUncheckedUpdateManyInput>;
    /**
     * Filter which ScheduledMessageRuns to update
     */
    where?: Prisma.ScheduledMessageRunWhereInput;
    /**
     * Limit how many ScheduledMessageRuns to update.
     */
    limit?: number;
};
/**
 * ScheduledMessageRun updateManyAndReturn
 */
export type ScheduledMessageRunUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * The data used to update ScheduledMessageRuns.
     */
    data: Prisma.XOR<Prisma.ScheduledMessageRunUpdateManyMutationInput, Prisma.ScheduledMessageRunUncheckedUpdateManyInput>;
    /**
     * Filter which ScheduledMessageRuns to update
     */
    where?: Prisma.ScheduledMessageRunWhereInput;
    /**
     * Limit how many ScheduledMessageRuns to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * ScheduledMessageRun upsert
 */
export type ScheduledMessageRunUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * The filter to search for the ScheduledMessageRun to update in case it exists.
     */
    where: Prisma.ScheduledMessageRunWhereUniqueInput;
    /**
     * In case the ScheduledMessageRun found by the `where` argument doesn't exist, create a new ScheduledMessageRun with this data.
     */
    create: Prisma.XOR<Prisma.ScheduledMessageRunCreateInput, Prisma.ScheduledMessageRunUncheckedCreateInput>;
    /**
     * In case the ScheduledMessageRun was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ScheduledMessageRunUpdateInput, Prisma.ScheduledMessageRunUncheckedUpdateInput>;
};
/**
 * ScheduledMessageRun delete
 */
export type ScheduledMessageRunDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
    /**
     * Filter which ScheduledMessageRun to delete.
     */
    where: Prisma.ScheduledMessageRunWhereUniqueInput;
};
/**
 * ScheduledMessageRun deleteMany
 */
export type ScheduledMessageRunDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ScheduledMessageRuns to delete
     */
    where?: Prisma.ScheduledMessageRunWhereInput;
    /**
     * Limit how many ScheduledMessageRuns to delete.
     */
    limit?: number;
};
/**
 * ScheduledMessageRun without action
 */
export type ScheduledMessageRunDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ScheduledMessageRun
     */
    select?: Prisma.ScheduledMessageRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ScheduledMessageRun
     */
    omit?: Prisma.ScheduledMessageRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.ScheduledMessageRunInclude<ExtArgs> | null;
};
//# sourceMappingURL=ScheduledMessageRun.d.ts.map
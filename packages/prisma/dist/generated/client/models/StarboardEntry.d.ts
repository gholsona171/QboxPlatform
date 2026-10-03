import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model StarboardEntry
 *
 */
export type StarboardEntryModel = runtime.Types.Result.DefaultSelection<Prisma.$StarboardEntryPayload>;
export type AggregateStarboardEntry = {
    _count: StarboardEntryCountAggregateOutputType | null;
    _avg: StarboardEntryAvgAggregateOutputType | null;
    _sum: StarboardEntrySumAggregateOutputType | null;
    _min: StarboardEntryMinAggregateOutputType | null;
    _max: StarboardEntryMaxAggregateOutputType | null;
};
export type StarboardEntryAvgAggregateOutputType = {
    starCount: number | null;
};
export type StarboardEntrySumAggregateOutputType = {
    starCount: number | null;
};
export type StarboardEntryMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    sourceChannelId: string | null;
    sourceMessageId: string | null;
    destinationMessageId: string | null;
    authorId: string | null;
    starCount: number | null;
    deleted: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StarboardEntryMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    sourceChannelId: string | null;
    sourceMessageId: string | null;
    destinationMessageId: string | null;
    authorId: string | null;
    starCount: number | null;
    deleted: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StarboardEntryCountAggregateOutputType = {
    id: number;
    guildId: number;
    sourceChannelId: number;
    sourceMessageId: number;
    destinationMessageId: number;
    authorId: number;
    starCount: number;
    deleted: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type StarboardEntryAvgAggregateInputType = {
    starCount?: true;
};
export type StarboardEntrySumAggregateInputType = {
    starCount?: true;
};
export type StarboardEntryMinAggregateInputType = {
    id?: true;
    guildId?: true;
    sourceChannelId?: true;
    sourceMessageId?: true;
    destinationMessageId?: true;
    authorId?: true;
    starCount?: true;
    deleted?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StarboardEntryMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    sourceChannelId?: true;
    sourceMessageId?: true;
    destinationMessageId?: true;
    authorId?: true;
    starCount?: true;
    deleted?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StarboardEntryCountAggregateInputType = {
    id?: true;
    guildId?: true;
    sourceChannelId?: true;
    sourceMessageId?: true;
    destinationMessageId?: true;
    authorId?: true;
    starCount?: true;
    deleted?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type StarboardEntryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which StarboardEntry to aggregate.
     */
    where?: Prisma.StarboardEntryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of StarboardEntries to fetch.
     */
    orderBy?: Prisma.StarboardEntryOrderByWithRelationInput | Prisma.StarboardEntryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.StarboardEntryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` StarboardEntries from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` StarboardEntries.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned StarboardEntries
    **/
    _count?: true | StarboardEntryCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: StarboardEntryAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: StarboardEntrySumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: StarboardEntryMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: StarboardEntryMaxAggregateInputType;
};
export type GetStarboardEntryAggregateType<T extends StarboardEntryAggregateArgs> = {
    [P in keyof T & keyof AggregateStarboardEntry]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateStarboardEntry[P]> : Prisma.GetScalarType<T[P], AggregateStarboardEntry[P]>;
};
export type StarboardEntryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StarboardEntryWhereInput;
    orderBy?: Prisma.StarboardEntryOrderByWithAggregationInput | Prisma.StarboardEntryOrderByWithAggregationInput[];
    by: Prisma.StarboardEntryScalarFieldEnum[] | Prisma.StarboardEntryScalarFieldEnum;
    having?: Prisma.StarboardEntryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StarboardEntryCountAggregateInputType | true;
    _avg?: StarboardEntryAvgAggregateInputType;
    _sum?: StarboardEntrySumAggregateInputType;
    _min?: StarboardEntryMinAggregateInputType;
    _max?: StarboardEntryMaxAggregateInputType;
};
export type StarboardEntryGroupByOutputType = {
    id: string;
    guildId: string;
    sourceChannelId: string;
    sourceMessageId: string;
    destinationMessageId: string | null;
    authorId: string;
    starCount: number;
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: StarboardEntryCountAggregateOutputType | null;
    _avg: StarboardEntryAvgAggregateOutputType | null;
    _sum: StarboardEntrySumAggregateOutputType | null;
    _min: StarboardEntryMinAggregateOutputType | null;
    _max: StarboardEntryMaxAggregateOutputType | null;
};
export type GetStarboardEntryGroupByPayload<T extends StarboardEntryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<StarboardEntryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof StarboardEntryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], StarboardEntryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], StarboardEntryGroupByOutputType[P]>;
}>>;
export type StarboardEntryWhereInput = {
    AND?: Prisma.StarboardEntryWhereInput | Prisma.StarboardEntryWhereInput[];
    OR?: Prisma.StarboardEntryWhereInput[];
    NOT?: Prisma.StarboardEntryWhereInput | Prisma.StarboardEntryWhereInput[];
    id?: Prisma.UuidFilter<"StarboardEntry"> | string;
    guildId?: Prisma.UuidFilter<"StarboardEntry"> | string;
    sourceChannelId?: Prisma.StringFilter<"StarboardEntry"> | string;
    sourceMessageId?: Prisma.StringFilter<"StarboardEntry"> | string;
    destinationMessageId?: Prisma.StringNullableFilter<"StarboardEntry"> | string | null;
    authorId?: Prisma.StringFilter<"StarboardEntry"> | string;
    starCount?: Prisma.IntFilter<"StarboardEntry"> | number;
    deleted?: Prisma.BoolFilter<"StarboardEntry"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"StarboardEntry"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StarboardEntry"> | Date | string;
    guild?: Prisma.XOR<Prisma.GuildScalarRelationFilter, Prisma.GuildWhereInput>;
};
export type StarboardEntryOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    sourceChannelId?: Prisma.SortOrder;
    sourceMessageId?: Prisma.SortOrder;
    destinationMessageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    authorId?: Prisma.SortOrder;
    starCount?: Prisma.SortOrder;
    deleted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    guild?: Prisma.GuildOrderByWithRelationInput;
};
export type StarboardEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    guildId_sourceMessageId?: Prisma.StarboardEntryGuildIdSourceMessageIdCompoundUniqueInput;
    AND?: Prisma.StarboardEntryWhereInput | Prisma.StarboardEntryWhereInput[];
    OR?: Prisma.StarboardEntryWhereInput[];
    NOT?: Prisma.StarboardEntryWhereInput | Prisma.StarboardEntryWhereInput[];
    guildId?: Prisma.UuidFilter<"StarboardEntry"> | string;
    sourceChannelId?: Prisma.StringFilter<"StarboardEntry"> | string;
    sourceMessageId?: Prisma.StringFilter<"StarboardEntry"> | string;
    destinationMessageId?: Prisma.StringNullableFilter<"StarboardEntry"> | string | null;
    authorId?: Prisma.StringFilter<"StarboardEntry"> | string;
    starCount?: Prisma.IntFilter<"StarboardEntry"> | number;
    deleted?: Prisma.BoolFilter<"StarboardEntry"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"StarboardEntry"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StarboardEntry"> | Date | string;
    guild?: Prisma.XOR<Prisma.GuildScalarRelationFilter, Prisma.GuildWhereInput>;
}, "id" | "guildId_sourceMessageId">;
export type StarboardEntryOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    sourceChannelId?: Prisma.SortOrder;
    sourceMessageId?: Prisma.SortOrder;
    destinationMessageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    authorId?: Prisma.SortOrder;
    starCount?: Prisma.SortOrder;
    deleted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.StarboardEntryCountOrderByAggregateInput;
    _avg?: Prisma.StarboardEntryAvgOrderByAggregateInput;
    _max?: Prisma.StarboardEntryMaxOrderByAggregateInput;
    _min?: Prisma.StarboardEntryMinOrderByAggregateInput;
    _sum?: Prisma.StarboardEntrySumOrderByAggregateInput;
};
export type StarboardEntryScalarWhereWithAggregatesInput = {
    AND?: Prisma.StarboardEntryScalarWhereWithAggregatesInput | Prisma.StarboardEntryScalarWhereWithAggregatesInput[];
    OR?: Prisma.StarboardEntryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.StarboardEntryScalarWhereWithAggregatesInput | Prisma.StarboardEntryScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"StarboardEntry"> | string;
    guildId?: Prisma.UuidWithAggregatesFilter<"StarboardEntry"> | string;
    sourceChannelId?: Prisma.StringWithAggregatesFilter<"StarboardEntry"> | string;
    sourceMessageId?: Prisma.StringWithAggregatesFilter<"StarboardEntry"> | string;
    destinationMessageId?: Prisma.StringNullableWithAggregatesFilter<"StarboardEntry"> | string | null;
    authorId?: Prisma.StringWithAggregatesFilter<"StarboardEntry"> | string;
    starCount?: Prisma.IntWithAggregatesFilter<"StarboardEntry"> | number;
    deleted?: Prisma.BoolWithAggregatesFilter<"StarboardEntry"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"StarboardEntry"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"StarboardEntry"> | Date | string;
};
export type StarboardEntryCreateInput = {
    id?: string;
    sourceChannelId: string;
    sourceMessageId: string;
    destinationMessageId?: string | null;
    authorId: string;
    starCount: number;
    deleted?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    guild: Prisma.GuildCreateNestedOneWithoutStarboardEntriesInput;
};
export type StarboardEntryUncheckedCreateInput = {
    id?: string;
    guildId: string;
    sourceChannelId: string;
    sourceMessageId: string;
    destinationMessageId?: string | null;
    authorId: string;
    starCount: number;
    deleted?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StarboardEntryUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceChannelId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceMessageId?: Prisma.StringFieldUpdateOperationsInput | string;
    destinationMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorId?: Prisma.StringFieldUpdateOperationsInput | string;
    starCount?: Prisma.IntFieldUpdateOperationsInput | number;
    deleted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    guild?: Prisma.GuildUpdateOneRequiredWithoutStarboardEntriesNestedInput;
};
export type StarboardEntryUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceChannelId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceMessageId?: Prisma.StringFieldUpdateOperationsInput | string;
    destinationMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorId?: Prisma.StringFieldUpdateOperationsInput | string;
    starCount?: Prisma.IntFieldUpdateOperationsInput | number;
    deleted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StarboardEntryCreateManyInput = {
    id?: string;
    guildId: string;
    sourceChannelId: string;
    sourceMessageId: string;
    destinationMessageId?: string | null;
    authorId: string;
    starCount: number;
    deleted?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StarboardEntryUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceChannelId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceMessageId?: Prisma.StringFieldUpdateOperationsInput | string;
    destinationMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorId?: Prisma.StringFieldUpdateOperationsInput | string;
    starCount?: Prisma.IntFieldUpdateOperationsInput | number;
    deleted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StarboardEntryUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceChannelId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceMessageId?: Prisma.StringFieldUpdateOperationsInput | string;
    destinationMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorId?: Prisma.StringFieldUpdateOperationsInput | string;
    starCount?: Prisma.IntFieldUpdateOperationsInput | number;
    deleted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StarboardEntryListRelationFilter = {
    every?: Prisma.StarboardEntryWhereInput;
    some?: Prisma.StarboardEntryWhereInput;
    none?: Prisma.StarboardEntryWhereInput;
};
export type StarboardEntryOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StarboardEntryGuildIdSourceMessageIdCompoundUniqueInput = {
    guildId: string;
    sourceMessageId: string;
};
export type StarboardEntryCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    sourceChannelId?: Prisma.SortOrder;
    sourceMessageId?: Prisma.SortOrder;
    destinationMessageId?: Prisma.SortOrder;
    authorId?: Prisma.SortOrder;
    starCount?: Prisma.SortOrder;
    deleted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StarboardEntryAvgOrderByAggregateInput = {
    starCount?: Prisma.SortOrder;
};
export type StarboardEntryMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    sourceChannelId?: Prisma.SortOrder;
    sourceMessageId?: Prisma.SortOrder;
    destinationMessageId?: Prisma.SortOrder;
    authorId?: Prisma.SortOrder;
    starCount?: Prisma.SortOrder;
    deleted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StarboardEntryMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    sourceChannelId?: Prisma.SortOrder;
    sourceMessageId?: Prisma.SortOrder;
    destinationMessageId?: Prisma.SortOrder;
    authorId?: Prisma.SortOrder;
    starCount?: Prisma.SortOrder;
    deleted?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StarboardEntrySumOrderByAggregateInput = {
    starCount?: Prisma.SortOrder;
};
export type StarboardEntryCreateNestedManyWithoutGuildInput = {
    create?: Prisma.XOR<Prisma.StarboardEntryCreateWithoutGuildInput, Prisma.StarboardEntryUncheckedCreateWithoutGuildInput> | Prisma.StarboardEntryCreateWithoutGuildInput[] | Prisma.StarboardEntryUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.StarboardEntryCreateOrConnectWithoutGuildInput | Prisma.StarboardEntryCreateOrConnectWithoutGuildInput[];
    createMany?: Prisma.StarboardEntryCreateManyGuildInputEnvelope;
    connect?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
};
export type StarboardEntryUncheckedCreateNestedManyWithoutGuildInput = {
    create?: Prisma.XOR<Prisma.StarboardEntryCreateWithoutGuildInput, Prisma.StarboardEntryUncheckedCreateWithoutGuildInput> | Prisma.StarboardEntryCreateWithoutGuildInput[] | Prisma.StarboardEntryUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.StarboardEntryCreateOrConnectWithoutGuildInput | Prisma.StarboardEntryCreateOrConnectWithoutGuildInput[];
    createMany?: Prisma.StarboardEntryCreateManyGuildInputEnvelope;
    connect?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
};
export type StarboardEntryUpdateManyWithoutGuildNestedInput = {
    create?: Prisma.XOR<Prisma.StarboardEntryCreateWithoutGuildInput, Prisma.StarboardEntryUncheckedCreateWithoutGuildInput> | Prisma.StarboardEntryCreateWithoutGuildInput[] | Prisma.StarboardEntryUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.StarboardEntryCreateOrConnectWithoutGuildInput | Prisma.StarboardEntryCreateOrConnectWithoutGuildInput[];
    upsert?: Prisma.StarboardEntryUpsertWithWhereUniqueWithoutGuildInput | Prisma.StarboardEntryUpsertWithWhereUniqueWithoutGuildInput[];
    createMany?: Prisma.StarboardEntryCreateManyGuildInputEnvelope;
    set?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
    disconnect?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
    delete?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
    connect?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
    update?: Prisma.StarboardEntryUpdateWithWhereUniqueWithoutGuildInput | Prisma.StarboardEntryUpdateWithWhereUniqueWithoutGuildInput[];
    updateMany?: Prisma.StarboardEntryUpdateManyWithWhereWithoutGuildInput | Prisma.StarboardEntryUpdateManyWithWhereWithoutGuildInput[];
    deleteMany?: Prisma.StarboardEntryScalarWhereInput | Prisma.StarboardEntryScalarWhereInput[];
};
export type StarboardEntryUncheckedUpdateManyWithoutGuildNestedInput = {
    create?: Prisma.XOR<Prisma.StarboardEntryCreateWithoutGuildInput, Prisma.StarboardEntryUncheckedCreateWithoutGuildInput> | Prisma.StarboardEntryCreateWithoutGuildInput[] | Prisma.StarboardEntryUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.StarboardEntryCreateOrConnectWithoutGuildInput | Prisma.StarboardEntryCreateOrConnectWithoutGuildInput[];
    upsert?: Prisma.StarboardEntryUpsertWithWhereUniqueWithoutGuildInput | Prisma.StarboardEntryUpsertWithWhereUniqueWithoutGuildInput[];
    createMany?: Prisma.StarboardEntryCreateManyGuildInputEnvelope;
    set?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
    disconnect?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
    delete?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
    connect?: Prisma.StarboardEntryWhereUniqueInput | Prisma.StarboardEntryWhereUniqueInput[];
    update?: Prisma.StarboardEntryUpdateWithWhereUniqueWithoutGuildInput | Prisma.StarboardEntryUpdateWithWhereUniqueWithoutGuildInput[];
    updateMany?: Prisma.StarboardEntryUpdateManyWithWhereWithoutGuildInput | Prisma.StarboardEntryUpdateManyWithWhereWithoutGuildInput[];
    deleteMany?: Prisma.StarboardEntryScalarWhereInput | Prisma.StarboardEntryScalarWhereInput[];
};
export type StarboardEntryCreateWithoutGuildInput = {
    id?: string;
    sourceChannelId: string;
    sourceMessageId: string;
    destinationMessageId?: string | null;
    authorId: string;
    starCount: number;
    deleted?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StarboardEntryUncheckedCreateWithoutGuildInput = {
    id?: string;
    sourceChannelId: string;
    sourceMessageId: string;
    destinationMessageId?: string | null;
    authorId: string;
    starCount: number;
    deleted?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StarboardEntryCreateOrConnectWithoutGuildInput = {
    where: Prisma.StarboardEntryWhereUniqueInput;
    create: Prisma.XOR<Prisma.StarboardEntryCreateWithoutGuildInput, Prisma.StarboardEntryUncheckedCreateWithoutGuildInput>;
};
export type StarboardEntryCreateManyGuildInputEnvelope = {
    data: Prisma.StarboardEntryCreateManyGuildInput | Prisma.StarboardEntryCreateManyGuildInput[];
    skipDuplicates?: boolean;
};
export type StarboardEntryUpsertWithWhereUniqueWithoutGuildInput = {
    where: Prisma.StarboardEntryWhereUniqueInput;
    update: Prisma.XOR<Prisma.StarboardEntryUpdateWithoutGuildInput, Prisma.StarboardEntryUncheckedUpdateWithoutGuildInput>;
    create: Prisma.XOR<Prisma.StarboardEntryCreateWithoutGuildInput, Prisma.StarboardEntryUncheckedCreateWithoutGuildInput>;
};
export type StarboardEntryUpdateWithWhereUniqueWithoutGuildInput = {
    where: Prisma.StarboardEntryWhereUniqueInput;
    data: Prisma.XOR<Prisma.StarboardEntryUpdateWithoutGuildInput, Prisma.StarboardEntryUncheckedUpdateWithoutGuildInput>;
};
export type StarboardEntryUpdateManyWithWhereWithoutGuildInput = {
    where: Prisma.StarboardEntryScalarWhereInput;
    data: Prisma.XOR<Prisma.StarboardEntryUpdateManyMutationInput, Prisma.StarboardEntryUncheckedUpdateManyWithoutGuildInput>;
};
export type StarboardEntryScalarWhereInput = {
    AND?: Prisma.StarboardEntryScalarWhereInput | Prisma.StarboardEntryScalarWhereInput[];
    OR?: Prisma.StarboardEntryScalarWhereInput[];
    NOT?: Prisma.StarboardEntryScalarWhereInput | Prisma.StarboardEntryScalarWhereInput[];
    id?: Prisma.UuidFilter<"StarboardEntry"> | string;
    guildId?: Prisma.UuidFilter<"StarboardEntry"> | string;
    sourceChannelId?: Prisma.StringFilter<"StarboardEntry"> | string;
    sourceMessageId?: Prisma.StringFilter<"StarboardEntry"> | string;
    destinationMessageId?: Prisma.StringNullableFilter<"StarboardEntry"> | string | null;
    authorId?: Prisma.StringFilter<"StarboardEntry"> | string;
    starCount?: Prisma.IntFilter<"StarboardEntry"> | number;
    deleted?: Prisma.BoolFilter<"StarboardEntry"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"StarboardEntry"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StarboardEntry"> | Date | string;
};
export type StarboardEntryCreateManyGuildInput = {
    id?: string;
    sourceChannelId: string;
    sourceMessageId: string;
    destinationMessageId?: string | null;
    authorId: string;
    starCount: number;
    deleted?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StarboardEntryUpdateWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceChannelId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceMessageId?: Prisma.StringFieldUpdateOperationsInput | string;
    destinationMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorId?: Prisma.StringFieldUpdateOperationsInput | string;
    starCount?: Prisma.IntFieldUpdateOperationsInput | number;
    deleted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StarboardEntryUncheckedUpdateWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceChannelId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceMessageId?: Prisma.StringFieldUpdateOperationsInput | string;
    destinationMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorId?: Prisma.StringFieldUpdateOperationsInput | string;
    starCount?: Prisma.IntFieldUpdateOperationsInput | number;
    deleted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StarboardEntryUncheckedUpdateManyWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceChannelId?: Prisma.StringFieldUpdateOperationsInput | string;
    sourceMessageId?: Prisma.StringFieldUpdateOperationsInput | string;
    destinationMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorId?: Prisma.StringFieldUpdateOperationsInput | string;
    starCount?: Prisma.IntFieldUpdateOperationsInput | number;
    deleted?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StarboardEntrySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    sourceChannelId?: boolean;
    sourceMessageId?: boolean;
    destinationMessageId?: boolean;
    authorId?: boolean;
    starCount?: boolean;
    deleted?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["starboardEntry"]>;
export type StarboardEntrySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    sourceChannelId?: boolean;
    sourceMessageId?: boolean;
    destinationMessageId?: boolean;
    authorId?: boolean;
    starCount?: boolean;
    deleted?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["starboardEntry"]>;
export type StarboardEntrySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    sourceChannelId?: boolean;
    sourceMessageId?: boolean;
    destinationMessageId?: boolean;
    authorId?: boolean;
    starCount?: boolean;
    deleted?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["starboardEntry"]>;
export type StarboardEntrySelectScalar = {
    id?: boolean;
    guildId?: boolean;
    sourceChannelId?: boolean;
    sourceMessageId?: boolean;
    destinationMessageId?: boolean;
    authorId?: boolean;
    starCount?: boolean;
    deleted?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type StarboardEntryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "sourceChannelId" | "sourceMessageId" | "destinationMessageId" | "authorId" | "starCount" | "deleted" | "createdAt" | "updatedAt", ExtArgs["result"]["starboardEntry"]>;
export type StarboardEntryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type StarboardEntryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type StarboardEntryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type $StarboardEntryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "StarboardEntry";
    objects: {
        guild: Prisma.$GuildPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        sourceChannelId: string;
        sourceMessageId: string;
        destinationMessageId: string | null;
        authorId: string;
        starCount: number;
        deleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["starboardEntry"]>;
    composites: {};
};
export type StarboardEntryGetPayload<S extends boolean | null | undefined | StarboardEntryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload, S>;
export type StarboardEntryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<StarboardEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: StarboardEntryCountAggregateInputType | true;
};
export interface StarboardEntryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['StarboardEntry'];
        meta: {
            name: 'StarboardEntry';
        };
    };
    /**
     * Find zero or one StarboardEntry that matches the filter.
     * @param {StarboardEntryFindUniqueArgs} args - Arguments to find a StarboardEntry
     * @example
     * // Get one StarboardEntry
     * const starboardEntry = await prisma.starboardEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StarboardEntryFindUniqueArgs>(args: Prisma.SelectSubset<T, StarboardEntryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__StarboardEntryClient<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one StarboardEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StarboardEntryFindUniqueOrThrowArgs} args - Arguments to find a StarboardEntry
     * @example
     * // Get one StarboardEntry
     * const starboardEntry = await prisma.starboardEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StarboardEntryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, StarboardEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__StarboardEntryClient<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first StarboardEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarboardEntryFindFirstArgs} args - Arguments to find a StarboardEntry
     * @example
     * // Get one StarboardEntry
     * const starboardEntry = await prisma.starboardEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StarboardEntryFindFirstArgs>(args?: Prisma.SelectSubset<T, StarboardEntryFindFirstArgs<ExtArgs>>): Prisma.Prisma__StarboardEntryClient<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first StarboardEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarboardEntryFindFirstOrThrowArgs} args - Arguments to find a StarboardEntry
     * @example
     * // Get one StarboardEntry
     * const starboardEntry = await prisma.starboardEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StarboardEntryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, StarboardEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__StarboardEntryClient<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more StarboardEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarboardEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StarboardEntries
     * const starboardEntries = await prisma.starboardEntry.findMany()
     *
     * // Get first 10 StarboardEntries
     * const starboardEntries = await prisma.starboardEntry.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const starboardEntryWithIdOnly = await prisma.starboardEntry.findMany({ select: { id: true } })
     *
     */
    findMany<T extends StarboardEntryFindManyArgs>(args?: Prisma.SelectSubset<T, StarboardEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a StarboardEntry.
     * @param {StarboardEntryCreateArgs} args - Arguments to create a StarboardEntry.
     * @example
     * // Create one StarboardEntry
     * const StarboardEntry = await prisma.starboardEntry.create({
     *   data: {
     *     // ... data to create a StarboardEntry
     *   }
     * })
     *
     */
    create<T extends StarboardEntryCreateArgs>(args: Prisma.SelectSubset<T, StarboardEntryCreateArgs<ExtArgs>>): Prisma.Prisma__StarboardEntryClient<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many StarboardEntries.
     * @param {StarboardEntryCreateManyArgs} args - Arguments to create many StarboardEntries.
     * @example
     * // Create many StarboardEntries
     * const starboardEntry = await prisma.starboardEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends StarboardEntryCreateManyArgs>(args?: Prisma.SelectSubset<T, StarboardEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many StarboardEntries and returns the data saved in the database.
     * @param {StarboardEntryCreateManyAndReturnArgs} args - Arguments to create many StarboardEntries.
     * @example
     * // Create many StarboardEntries
     * const starboardEntry = await prisma.starboardEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many StarboardEntries and only return the `id`
     * const starboardEntryWithIdOnly = await prisma.starboardEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends StarboardEntryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, StarboardEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a StarboardEntry.
     * @param {StarboardEntryDeleteArgs} args - Arguments to delete one StarboardEntry.
     * @example
     * // Delete one StarboardEntry
     * const StarboardEntry = await prisma.starboardEntry.delete({
     *   where: {
     *     // ... filter to delete one StarboardEntry
     *   }
     * })
     *
     */
    delete<T extends StarboardEntryDeleteArgs>(args: Prisma.SelectSubset<T, StarboardEntryDeleteArgs<ExtArgs>>): Prisma.Prisma__StarboardEntryClient<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one StarboardEntry.
     * @param {StarboardEntryUpdateArgs} args - Arguments to update one StarboardEntry.
     * @example
     * // Update one StarboardEntry
     * const starboardEntry = await prisma.starboardEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends StarboardEntryUpdateArgs>(args: Prisma.SelectSubset<T, StarboardEntryUpdateArgs<ExtArgs>>): Prisma.Prisma__StarboardEntryClient<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more StarboardEntries.
     * @param {StarboardEntryDeleteManyArgs} args - Arguments to filter StarboardEntries to delete.
     * @example
     * // Delete a few StarboardEntries
     * const { count } = await prisma.starboardEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends StarboardEntryDeleteManyArgs>(args?: Prisma.SelectSubset<T, StarboardEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more StarboardEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarboardEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StarboardEntries
     * const starboardEntry = await prisma.starboardEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends StarboardEntryUpdateManyArgs>(args: Prisma.SelectSubset<T, StarboardEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more StarboardEntries and returns the data updated in the database.
     * @param {StarboardEntryUpdateManyAndReturnArgs} args - Arguments to update many StarboardEntries.
     * @example
     * // Update many StarboardEntries
     * const starboardEntry = await prisma.starboardEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more StarboardEntries and only return the `id`
     * const starboardEntryWithIdOnly = await prisma.starboardEntry.updateManyAndReturn({
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
    updateManyAndReturn<T extends StarboardEntryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, StarboardEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one StarboardEntry.
     * @param {StarboardEntryUpsertArgs} args - Arguments to update or create a StarboardEntry.
     * @example
     * // Update or create a StarboardEntry
     * const starboardEntry = await prisma.starboardEntry.upsert({
     *   create: {
     *     // ... data to create a StarboardEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StarboardEntry we want to update
     *   }
     * })
     */
    upsert<T extends StarboardEntryUpsertArgs>(args: Prisma.SelectSubset<T, StarboardEntryUpsertArgs<ExtArgs>>): Prisma.Prisma__StarboardEntryClient<runtime.Types.Result.GetResult<Prisma.$StarboardEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of StarboardEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarboardEntryCountArgs} args - Arguments to filter StarboardEntries to count.
     * @example
     * // Count the number of StarboardEntries
     * const count = await prisma.starboardEntry.count({
     *   where: {
     *     // ... the filter for the StarboardEntries we want to count
     *   }
     * })
    **/
    count<T extends StarboardEntryCountArgs>(args?: Prisma.Subset<T, StarboardEntryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], StarboardEntryCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a StarboardEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarboardEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StarboardEntryAggregateArgs>(args: Prisma.Subset<T, StarboardEntryAggregateArgs>): Prisma.PrismaPromise<GetStarboardEntryAggregateType<T>>;
    /**
     * Group by StarboardEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarboardEntryGroupByArgs} args - Group by arguments.
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
    groupBy<T extends StarboardEntryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: StarboardEntryGroupByArgs['orderBy'];
    } : {
        orderBy?: StarboardEntryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, StarboardEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStarboardEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the StarboardEntry model
     */
    readonly fields: StarboardEntryFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for StarboardEntry.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__StarboardEntryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the StarboardEntry model
 */
export interface StarboardEntryFieldRefs {
    readonly id: Prisma.FieldRef<"StarboardEntry", 'String'>;
    readonly guildId: Prisma.FieldRef<"StarboardEntry", 'String'>;
    readonly sourceChannelId: Prisma.FieldRef<"StarboardEntry", 'String'>;
    readonly sourceMessageId: Prisma.FieldRef<"StarboardEntry", 'String'>;
    readonly destinationMessageId: Prisma.FieldRef<"StarboardEntry", 'String'>;
    readonly authorId: Prisma.FieldRef<"StarboardEntry", 'String'>;
    readonly starCount: Prisma.FieldRef<"StarboardEntry", 'Int'>;
    readonly deleted: Prisma.FieldRef<"StarboardEntry", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"StarboardEntry", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"StarboardEntry", 'DateTime'>;
}
/**
 * StarboardEntry findUnique
 */
export type StarboardEntryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which StarboardEntry to fetch.
     */
    where: Prisma.StarboardEntryWhereUniqueInput;
};
/**
 * StarboardEntry findUniqueOrThrow
 */
export type StarboardEntryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which StarboardEntry to fetch.
     */
    where: Prisma.StarboardEntryWhereUniqueInput;
};
/**
 * StarboardEntry findFirst
 */
export type StarboardEntryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which StarboardEntry to fetch.
     */
    where?: Prisma.StarboardEntryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of StarboardEntries to fetch.
     */
    orderBy?: Prisma.StarboardEntryOrderByWithRelationInput | Prisma.StarboardEntryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for StarboardEntries.
     */
    cursor?: Prisma.StarboardEntryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` StarboardEntries from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` StarboardEntries.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of StarboardEntries.
     */
    distinct?: Prisma.StarboardEntryScalarFieldEnum | Prisma.StarboardEntryScalarFieldEnum[];
};
/**
 * StarboardEntry findFirstOrThrow
 */
export type StarboardEntryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which StarboardEntry to fetch.
     */
    where?: Prisma.StarboardEntryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of StarboardEntries to fetch.
     */
    orderBy?: Prisma.StarboardEntryOrderByWithRelationInput | Prisma.StarboardEntryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for StarboardEntries.
     */
    cursor?: Prisma.StarboardEntryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` StarboardEntries from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` StarboardEntries.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of StarboardEntries.
     */
    distinct?: Prisma.StarboardEntryScalarFieldEnum | Prisma.StarboardEntryScalarFieldEnum[];
};
/**
 * StarboardEntry findMany
 */
export type StarboardEntryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which StarboardEntries to fetch.
     */
    where?: Prisma.StarboardEntryWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of StarboardEntries to fetch.
     */
    orderBy?: Prisma.StarboardEntryOrderByWithRelationInput | Prisma.StarboardEntryOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing StarboardEntries.
     */
    cursor?: Prisma.StarboardEntryWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` StarboardEntries from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` StarboardEntries.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of StarboardEntries.
     */
    distinct?: Prisma.StarboardEntryScalarFieldEnum | Prisma.StarboardEntryScalarFieldEnum[];
};
/**
 * StarboardEntry create
 */
export type StarboardEntryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a StarboardEntry.
     */
    data: Prisma.XOR<Prisma.StarboardEntryCreateInput, Prisma.StarboardEntryUncheckedCreateInput>;
};
/**
 * StarboardEntry createMany
 */
export type StarboardEntryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many StarboardEntries.
     */
    data: Prisma.StarboardEntryCreateManyInput | Prisma.StarboardEntryCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * StarboardEntry createManyAndReturn
 */
export type StarboardEntryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarboardEntry
     */
    select?: Prisma.StarboardEntrySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the StarboardEntry
     */
    omit?: Prisma.StarboardEntryOmit<ExtArgs> | null;
    /**
     * The data used to create many StarboardEntries.
     */
    data: Prisma.StarboardEntryCreateManyInput | Prisma.StarboardEntryCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.StarboardEntryIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * StarboardEntry update
 */
export type StarboardEntryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a StarboardEntry.
     */
    data: Prisma.XOR<Prisma.StarboardEntryUpdateInput, Prisma.StarboardEntryUncheckedUpdateInput>;
    /**
     * Choose, which StarboardEntry to update.
     */
    where: Prisma.StarboardEntryWhereUniqueInput;
};
/**
 * StarboardEntry updateMany
 */
export type StarboardEntryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update StarboardEntries.
     */
    data: Prisma.XOR<Prisma.StarboardEntryUpdateManyMutationInput, Prisma.StarboardEntryUncheckedUpdateManyInput>;
    /**
     * Filter which StarboardEntries to update
     */
    where?: Prisma.StarboardEntryWhereInput;
    /**
     * Limit how many StarboardEntries to update.
     */
    limit?: number;
};
/**
 * StarboardEntry updateManyAndReturn
 */
export type StarboardEntryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarboardEntry
     */
    select?: Prisma.StarboardEntrySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the StarboardEntry
     */
    omit?: Prisma.StarboardEntryOmit<ExtArgs> | null;
    /**
     * The data used to update StarboardEntries.
     */
    data: Prisma.XOR<Prisma.StarboardEntryUpdateManyMutationInput, Prisma.StarboardEntryUncheckedUpdateManyInput>;
    /**
     * Filter which StarboardEntries to update
     */
    where?: Prisma.StarboardEntryWhereInput;
    /**
     * Limit how many StarboardEntries to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.StarboardEntryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * StarboardEntry upsert
 */
export type StarboardEntryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the StarboardEntry to update in case it exists.
     */
    where: Prisma.StarboardEntryWhereUniqueInput;
    /**
     * In case the StarboardEntry found by the `where` argument doesn't exist, create a new StarboardEntry with this data.
     */
    create: Prisma.XOR<Prisma.StarboardEntryCreateInput, Prisma.StarboardEntryUncheckedCreateInput>;
    /**
     * In case the StarboardEntry was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.StarboardEntryUpdateInput, Prisma.StarboardEntryUncheckedUpdateInput>;
};
/**
 * StarboardEntry delete
 */
export type StarboardEntryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which StarboardEntry to delete.
     */
    where: Prisma.StarboardEntryWhereUniqueInput;
};
/**
 * StarboardEntry deleteMany
 */
export type StarboardEntryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which StarboardEntries to delete
     */
    where?: Prisma.StarboardEntryWhereInput;
    /**
     * Limit how many StarboardEntries to delete.
     */
    limit?: number;
};
/**
 * StarboardEntry without action
 */
export type StarboardEntryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
//# sourceMappingURL=StarboardEntry.d.ts.map
import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model BuilderRun
 *
 */
export type BuilderRunModel = runtime.Types.Result.DefaultSelection<Prisma.$BuilderRunPayload>;
export type AggregateBuilderRun = {
    _count: BuilderRunCountAggregateOutputType | null;
    _avg: BuilderRunAvgAggregateOutputType | null;
    _sum: BuilderRunSumAggregateOutputType | null;
    _min: BuilderRunMinAggregateOutputType | null;
    _max: BuilderRunMaxAggregateOutputType | null;
};
export type BuilderRunAvgAggregateOutputType = {
    planned: number | null;
    done: number | null;
    skipped: number | null;
    failed: number | null;
};
export type BuilderRunSumAggregateOutputType = {
    planned: number | null;
    done: number | null;
    skipped: number | null;
    failed: number | null;
};
export type BuilderRunMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    status: $Enums.BuilderRunStatus | null;
    mode: $Enums.BuilderRunMode | null;
    planned: number | null;
    done: number | null;
    skipped: number | null;
    failed: number | null;
    startedById: string | null;
    startedByName: string | null;
    error: string | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    undoneAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type BuilderRunMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    status: $Enums.BuilderRunStatus | null;
    mode: $Enums.BuilderRunMode | null;
    planned: number | null;
    done: number | null;
    skipped: number | null;
    failed: number | null;
    startedById: string | null;
    startedByName: string | null;
    error: string | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    undoneAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type BuilderRunCountAggregateOutputType = {
    id: number;
    guildId: number;
    status: number;
    mode: number;
    links: number;
    planned: number;
    done: number;
    skipped: number;
    failed: number;
    startedById: number;
    startedByName: number;
    warnings: number;
    error: number;
    snapshot: number;
    startedAt: number;
    finishedAt: number;
    undoneAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type BuilderRunAvgAggregateInputType = {
    planned?: true;
    done?: true;
    skipped?: true;
    failed?: true;
};
export type BuilderRunSumAggregateInputType = {
    planned?: true;
    done?: true;
    skipped?: true;
    failed?: true;
};
export type BuilderRunMinAggregateInputType = {
    id?: true;
    guildId?: true;
    status?: true;
    mode?: true;
    planned?: true;
    done?: true;
    skipped?: true;
    failed?: true;
    startedById?: true;
    startedByName?: true;
    error?: true;
    startedAt?: true;
    finishedAt?: true;
    undoneAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type BuilderRunMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    status?: true;
    mode?: true;
    planned?: true;
    done?: true;
    skipped?: true;
    failed?: true;
    startedById?: true;
    startedByName?: true;
    error?: true;
    startedAt?: true;
    finishedAt?: true;
    undoneAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type BuilderRunCountAggregateInputType = {
    id?: true;
    guildId?: true;
    status?: true;
    mode?: true;
    links?: true;
    planned?: true;
    done?: true;
    skipped?: true;
    failed?: true;
    startedById?: true;
    startedByName?: true;
    warnings?: true;
    error?: true;
    snapshot?: true;
    startedAt?: true;
    finishedAt?: true;
    undoneAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type BuilderRunAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which BuilderRun to aggregate.
     */
    where?: Prisma.BuilderRunWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BuilderRuns to fetch.
     */
    orderBy?: Prisma.BuilderRunOrderByWithRelationInput | Prisma.BuilderRunOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.BuilderRunWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BuilderRuns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BuilderRuns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned BuilderRuns
    **/
    _count?: true | BuilderRunCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: BuilderRunAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: BuilderRunSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: BuilderRunMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: BuilderRunMaxAggregateInputType;
};
export type GetBuilderRunAggregateType<T extends BuilderRunAggregateArgs> = {
    [P in keyof T & keyof AggregateBuilderRun]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateBuilderRun[P]> : Prisma.GetScalarType<T[P], AggregateBuilderRun[P]>;
};
export type BuilderRunGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BuilderRunWhereInput;
    orderBy?: Prisma.BuilderRunOrderByWithAggregationInput | Prisma.BuilderRunOrderByWithAggregationInput[];
    by: Prisma.BuilderRunScalarFieldEnum[] | Prisma.BuilderRunScalarFieldEnum;
    having?: Prisma.BuilderRunScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: BuilderRunCountAggregateInputType | true;
    _avg?: BuilderRunAvgAggregateInputType;
    _sum?: BuilderRunSumAggregateInputType;
    _min?: BuilderRunMinAggregateInputType;
    _max?: BuilderRunMaxAggregateInputType;
};
export type BuilderRunGroupByOutputType = {
    id: string;
    guildId: string;
    status: $Enums.BuilderRunStatus;
    mode: $Enums.BuilderRunMode;
    links: string[];
    planned: number;
    done: number;
    skipped: number;
    failed: number;
    startedById: string;
    startedByName: string;
    warnings: string[];
    error: string | null;
    snapshot: runtime.JsonValue | null;
    startedAt: Date | null;
    finishedAt: Date | null;
    undoneAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: BuilderRunCountAggregateOutputType | null;
    _avg: BuilderRunAvgAggregateOutputType | null;
    _sum: BuilderRunSumAggregateOutputType | null;
    _min: BuilderRunMinAggregateOutputType | null;
    _max: BuilderRunMaxAggregateOutputType | null;
};
export type GetBuilderRunGroupByPayload<T extends BuilderRunGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<BuilderRunGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof BuilderRunGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], BuilderRunGroupByOutputType[P]> : Prisma.GetScalarType<T[P], BuilderRunGroupByOutputType[P]>;
}>>;
export type BuilderRunWhereInput = {
    AND?: Prisma.BuilderRunWhereInput | Prisma.BuilderRunWhereInput[];
    OR?: Prisma.BuilderRunWhereInput[];
    NOT?: Prisma.BuilderRunWhereInput | Prisma.BuilderRunWhereInput[];
    id?: Prisma.UuidFilter<"BuilderRun"> | string;
    guildId?: Prisma.StringFilter<"BuilderRun"> | string;
    status?: Prisma.EnumBuilderRunStatusFilter<"BuilderRun"> | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeFilter<"BuilderRun"> | $Enums.BuilderRunMode;
    links?: Prisma.StringNullableListFilter<"BuilderRun">;
    planned?: Prisma.IntFilter<"BuilderRun"> | number;
    done?: Prisma.IntFilter<"BuilderRun"> | number;
    skipped?: Prisma.IntFilter<"BuilderRun"> | number;
    failed?: Prisma.IntFilter<"BuilderRun"> | number;
    startedById?: Prisma.StringFilter<"BuilderRun"> | string;
    startedByName?: Prisma.StringFilter<"BuilderRun"> | string;
    warnings?: Prisma.StringNullableListFilter<"BuilderRun">;
    error?: Prisma.StringNullableFilter<"BuilderRun"> | string | null;
    snapshot?: Prisma.JsonNullableFilter<"BuilderRun">;
    startedAt?: Prisma.DateTimeNullableFilter<"BuilderRun"> | Date | string | null;
    finishedAt?: Prisma.DateTimeNullableFilter<"BuilderRun"> | Date | string | null;
    undoneAt?: Prisma.DateTimeNullableFilter<"BuilderRun"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"BuilderRun"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BuilderRun"> | Date | string;
    items?: Prisma.BuilderRunItemListRelationFilter;
};
export type BuilderRunOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    links?: Prisma.SortOrder;
    planned?: Prisma.SortOrder;
    done?: Prisma.SortOrder;
    skipped?: Prisma.SortOrder;
    failed?: Prisma.SortOrder;
    startedById?: Prisma.SortOrder;
    startedByName?: Prisma.SortOrder;
    warnings?: Prisma.SortOrder;
    error?: Prisma.SortOrderInput | Prisma.SortOrder;
    snapshot?: Prisma.SortOrderInput | Prisma.SortOrder;
    startedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    finishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    undoneAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    items?: Prisma.BuilderRunItemOrderByRelationAggregateInput;
};
export type BuilderRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.BuilderRunWhereInput | Prisma.BuilderRunWhereInput[];
    OR?: Prisma.BuilderRunWhereInput[];
    NOT?: Prisma.BuilderRunWhereInput | Prisma.BuilderRunWhereInput[];
    guildId?: Prisma.StringFilter<"BuilderRun"> | string;
    status?: Prisma.EnumBuilderRunStatusFilter<"BuilderRun"> | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeFilter<"BuilderRun"> | $Enums.BuilderRunMode;
    links?: Prisma.StringNullableListFilter<"BuilderRun">;
    planned?: Prisma.IntFilter<"BuilderRun"> | number;
    done?: Prisma.IntFilter<"BuilderRun"> | number;
    skipped?: Prisma.IntFilter<"BuilderRun"> | number;
    failed?: Prisma.IntFilter<"BuilderRun"> | number;
    startedById?: Prisma.StringFilter<"BuilderRun"> | string;
    startedByName?: Prisma.StringFilter<"BuilderRun"> | string;
    warnings?: Prisma.StringNullableListFilter<"BuilderRun">;
    error?: Prisma.StringNullableFilter<"BuilderRun"> | string | null;
    snapshot?: Prisma.JsonNullableFilter<"BuilderRun">;
    startedAt?: Prisma.DateTimeNullableFilter<"BuilderRun"> | Date | string | null;
    finishedAt?: Prisma.DateTimeNullableFilter<"BuilderRun"> | Date | string | null;
    undoneAt?: Prisma.DateTimeNullableFilter<"BuilderRun"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"BuilderRun"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BuilderRun"> | Date | string;
    items?: Prisma.BuilderRunItemListRelationFilter;
}, "id">;
export type BuilderRunOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    links?: Prisma.SortOrder;
    planned?: Prisma.SortOrder;
    done?: Prisma.SortOrder;
    skipped?: Prisma.SortOrder;
    failed?: Prisma.SortOrder;
    startedById?: Prisma.SortOrder;
    startedByName?: Prisma.SortOrder;
    warnings?: Prisma.SortOrder;
    error?: Prisma.SortOrderInput | Prisma.SortOrder;
    snapshot?: Prisma.SortOrderInput | Prisma.SortOrder;
    startedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    finishedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    undoneAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.BuilderRunCountOrderByAggregateInput;
    _avg?: Prisma.BuilderRunAvgOrderByAggregateInput;
    _max?: Prisma.BuilderRunMaxOrderByAggregateInput;
    _min?: Prisma.BuilderRunMinOrderByAggregateInput;
    _sum?: Prisma.BuilderRunSumOrderByAggregateInput;
};
export type BuilderRunScalarWhereWithAggregatesInput = {
    AND?: Prisma.BuilderRunScalarWhereWithAggregatesInput | Prisma.BuilderRunScalarWhereWithAggregatesInput[];
    OR?: Prisma.BuilderRunScalarWhereWithAggregatesInput[];
    NOT?: Prisma.BuilderRunScalarWhereWithAggregatesInput | Prisma.BuilderRunScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"BuilderRun"> | string;
    guildId?: Prisma.StringWithAggregatesFilter<"BuilderRun"> | string;
    status?: Prisma.EnumBuilderRunStatusWithAggregatesFilter<"BuilderRun"> | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeWithAggregatesFilter<"BuilderRun"> | $Enums.BuilderRunMode;
    links?: Prisma.StringNullableListFilter<"BuilderRun">;
    planned?: Prisma.IntWithAggregatesFilter<"BuilderRun"> | number;
    done?: Prisma.IntWithAggregatesFilter<"BuilderRun"> | number;
    skipped?: Prisma.IntWithAggregatesFilter<"BuilderRun"> | number;
    failed?: Prisma.IntWithAggregatesFilter<"BuilderRun"> | number;
    startedById?: Prisma.StringWithAggregatesFilter<"BuilderRun"> | string;
    startedByName?: Prisma.StringWithAggregatesFilter<"BuilderRun"> | string;
    warnings?: Prisma.StringNullableListFilter<"BuilderRun">;
    error?: Prisma.StringNullableWithAggregatesFilter<"BuilderRun"> | string | null;
    snapshot?: Prisma.JsonNullableWithAggregatesFilter<"BuilderRun">;
    startedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"BuilderRun"> | Date | string | null;
    finishedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"BuilderRun"> | Date | string | null;
    undoneAt?: Prisma.DateTimeNullableWithAggregatesFilter<"BuilderRun"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"BuilderRun"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"BuilderRun"> | Date | string;
};
export type BuilderRunCreateInput = {
    id?: string;
    guildId: string;
    status?: $Enums.BuilderRunStatus;
    mode: $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunCreatelinksInput | string[];
    planned?: number;
    done?: number;
    skipped?: number;
    failed?: number;
    startedById: string;
    startedByName: string;
    warnings?: Prisma.BuilderRunCreatewarningsInput | string[];
    error?: string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Date | string | null;
    finishedAt?: Date | string | null;
    undoneAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.BuilderRunItemCreateNestedManyWithoutRunInput;
};
export type BuilderRunUncheckedCreateInput = {
    id?: string;
    guildId: string;
    status?: $Enums.BuilderRunStatus;
    mode: $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunCreatelinksInput | string[];
    planned?: number;
    done?: number;
    skipped?: number;
    failed?: number;
    startedById: string;
    startedByName: string;
    warnings?: Prisma.BuilderRunCreatewarningsInput | string[];
    error?: string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Date | string | null;
    finishedAt?: Date | string | null;
    undoneAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    items?: Prisma.BuilderRunItemUncheckedCreateNestedManyWithoutRunInput;
};
export type BuilderRunUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumBuilderRunStatusFieldUpdateOperationsInput | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeFieldUpdateOperationsInput | $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunUpdatelinksInput | string[];
    planned?: Prisma.IntFieldUpdateOperationsInput | number;
    done?: Prisma.IntFieldUpdateOperationsInput | number;
    skipped?: Prisma.IntFieldUpdateOperationsInput | number;
    failed?: Prisma.IntFieldUpdateOperationsInput | number;
    startedById?: Prisma.StringFieldUpdateOperationsInput | string;
    startedByName?: Prisma.StringFieldUpdateOperationsInput | string;
    warnings?: Prisma.BuilderRunUpdatewarningsInput | string[];
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    undoneAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.BuilderRunItemUpdateManyWithoutRunNestedInput;
};
export type BuilderRunUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumBuilderRunStatusFieldUpdateOperationsInput | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeFieldUpdateOperationsInput | $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunUpdatelinksInput | string[];
    planned?: Prisma.IntFieldUpdateOperationsInput | number;
    done?: Prisma.IntFieldUpdateOperationsInput | number;
    skipped?: Prisma.IntFieldUpdateOperationsInput | number;
    failed?: Prisma.IntFieldUpdateOperationsInput | number;
    startedById?: Prisma.StringFieldUpdateOperationsInput | string;
    startedByName?: Prisma.StringFieldUpdateOperationsInput | string;
    warnings?: Prisma.BuilderRunUpdatewarningsInput | string[];
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    undoneAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    items?: Prisma.BuilderRunItemUncheckedUpdateManyWithoutRunNestedInput;
};
export type BuilderRunCreateManyInput = {
    id?: string;
    guildId: string;
    status?: $Enums.BuilderRunStatus;
    mode: $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunCreatelinksInput | string[];
    planned?: number;
    done?: number;
    skipped?: number;
    failed?: number;
    startedById: string;
    startedByName: string;
    warnings?: Prisma.BuilderRunCreatewarningsInput | string[];
    error?: string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Date | string | null;
    finishedAt?: Date | string | null;
    undoneAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BuilderRunUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumBuilderRunStatusFieldUpdateOperationsInput | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeFieldUpdateOperationsInput | $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunUpdatelinksInput | string[];
    planned?: Prisma.IntFieldUpdateOperationsInput | number;
    done?: Prisma.IntFieldUpdateOperationsInput | number;
    skipped?: Prisma.IntFieldUpdateOperationsInput | number;
    failed?: Prisma.IntFieldUpdateOperationsInput | number;
    startedById?: Prisma.StringFieldUpdateOperationsInput | string;
    startedByName?: Prisma.StringFieldUpdateOperationsInput | string;
    warnings?: Prisma.BuilderRunUpdatewarningsInput | string[];
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    undoneAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BuilderRunUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumBuilderRunStatusFieldUpdateOperationsInput | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeFieldUpdateOperationsInput | $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunUpdatelinksInput | string[];
    planned?: Prisma.IntFieldUpdateOperationsInput | number;
    done?: Prisma.IntFieldUpdateOperationsInput | number;
    skipped?: Prisma.IntFieldUpdateOperationsInput | number;
    failed?: Prisma.IntFieldUpdateOperationsInput | number;
    startedById?: Prisma.StringFieldUpdateOperationsInput | string;
    startedByName?: Prisma.StringFieldUpdateOperationsInput | string;
    warnings?: Prisma.BuilderRunUpdatewarningsInput | string[];
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    undoneAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BuilderRunCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    links?: Prisma.SortOrder;
    planned?: Prisma.SortOrder;
    done?: Prisma.SortOrder;
    skipped?: Prisma.SortOrder;
    failed?: Prisma.SortOrder;
    startedById?: Prisma.SortOrder;
    startedByName?: Prisma.SortOrder;
    warnings?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    snapshot?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    finishedAt?: Prisma.SortOrder;
    undoneAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BuilderRunAvgOrderByAggregateInput = {
    planned?: Prisma.SortOrder;
    done?: Prisma.SortOrder;
    skipped?: Prisma.SortOrder;
    failed?: Prisma.SortOrder;
};
export type BuilderRunMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    planned?: Prisma.SortOrder;
    done?: Prisma.SortOrder;
    skipped?: Prisma.SortOrder;
    failed?: Prisma.SortOrder;
    startedById?: Prisma.SortOrder;
    startedByName?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    finishedAt?: Prisma.SortOrder;
    undoneAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BuilderRunMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    planned?: Prisma.SortOrder;
    done?: Prisma.SortOrder;
    skipped?: Prisma.SortOrder;
    failed?: Prisma.SortOrder;
    startedById?: Prisma.SortOrder;
    startedByName?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    finishedAt?: Prisma.SortOrder;
    undoneAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BuilderRunSumOrderByAggregateInput = {
    planned?: Prisma.SortOrder;
    done?: Prisma.SortOrder;
    skipped?: Prisma.SortOrder;
    failed?: Prisma.SortOrder;
};
export type BuilderRunScalarRelationFilter = {
    is?: Prisma.BuilderRunWhereInput;
    isNot?: Prisma.BuilderRunWhereInput;
};
export type BuilderRunCreatelinksInput = {
    set: string[];
};
export type BuilderRunCreatewarningsInput = {
    set: string[];
};
export type EnumBuilderRunStatusFieldUpdateOperationsInput = {
    set?: $Enums.BuilderRunStatus;
};
export type EnumBuilderRunModeFieldUpdateOperationsInput = {
    set?: $Enums.BuilderRunMode;
};
export type BuilderRunUpdatelinksInput = {
    set?: string[];
    push?: string | string[];
};
export type BuilderRunUpdatewarningsInput = {
    set?: string[];
    push?: string | string[];
};
export type BuilderRunCreateNestedOneWithoutItemsInput = {
    create?: Prisma.XOR<Prisma.BuilderRunCreateWithoutItemsInput, Prisma.BuilderRunUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.BuilderRunCreateOrConnectWithoutItemsInput;
    connect?: Prisma.BuilderRunWhereUniqueInput;
};
export type BuilderRunUpdateOneRequiredWithoutItemsNestedInput = {
    create?: Prisma.XOR<Prisma.BuilderRunCreateWithoutItemsInput, Prisma.BuilderRunUncheckedCreateWithoutItemsInput>;
    connectOrCreate?: Prisma.BuilderRunCreateOrConnectWithoutItemsInput;
    upsert?: Prisma.BuilderRunUpsertWithoutItemsInput;
    connect?: Prisma.BuilderRunWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.BuilderRunUpdateToOneWithWhereWithoutItemsInput, Prisma.BuilderRunUpdateWithoutItemsInput>, Prisma.BuilderRunUncheckedUpdateWithoutItemsInput>;
};
export type BuilderRunCreateWithoutItemsInput = {
    id?: string;
    guildId: string;
    status?: $Enums.BuilderRunStatus;
    mode: $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunCreatelinksInput | string[];
    planned?: number;
    done?: number;
    skipped?: number;
    failed?: number;
    startedById: string;
    startedByName: string;
    warnings?: Prisma.BuilderRunCreatewarningsInput | string[];
    error?: string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Date | string | null;
    finishedAt?: Date | string | null;
    undoneAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BuilderRunUncheckedCreateWithoutItemsInput = {
    id?: string;
    guildId: string;
    status?: $Enums.BuilderRunStatus;
    mode: $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunCreatelinksInput | string[];
    planned?: number;
    done?: number;
    skipped?: number;
    failed?: number;
    startedById: string;
    startedByName: string;
    warnings?: Prisma.BuilderRunCreatewarningsInput | string[];
    error?: string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Date | string | null;
    finishedAt?: Date | string | null;
    undoneAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BuilderRunCreateOrConnectWithoutItemsInput = {
    where: Prisma.BuilderRunWhereUniqueInput;
    create: Prisma.XOR<Prisma.BuilderRunCreateWithoutItemsInput, Prisma.BuilderRunUncheckedCreateWithoutItemsInput>;
};
export type BuilderRunUpsertWithoutItemsInput = {
    update: Prisma.XOR<Prisma.BuilderRunUpdateWithoutItemsInput, Prisma.BuilderRunUncheckedUpdateWithoutItemsInput>;
    create: Prisma.XOR<Prisma.BuilderRunCreateWithoutItemsInput, Prisma.BuilderRunUncheckedCreateWithoutItemsInput>;
    where?: Prisma.BuilderRunWhereInput;
};
export type BuilderRunUpdateToOneWithWhereWithoutItemsInput = {
    where?: Prisma.BuilderRunWhereInput;
    data: Prisma.XOR<Prisma.BuilderRunUpdateWithoutItemsInput, Prisma.BuilderRunUncheckedUpdateWithoutItemsInput>;
};
export type BuilderRunUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumBuilderRunStatusFieldUpdateOperationsInput | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeFieldUpdateOperationsInput | $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunUpdatelinksInput | string[];
    planned?: Prisma.IntFieldUpdateOperationsInput | number;
    done?: Prisma.IntFieldUpdateOperationsInput | number;
    skipped?: Prisma.IntFieldUpdateOperationsInput | number;
    failed?: Prisma.IntFieldUpdateOperationsInput | number;
    startedById?: Prisma.StringFieldUpdateOperationsInput | string;
    startedByName?: Prisma.StringFieldUpdateOperationsInput | string;
    warnings?: Prisma.BuilderRunUpdatewarningsInput | string[];
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    undoneAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BuilderRunUncheckedUpdateWithoutItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumBuilderRunStatusFieldUpdateOperationsInput | $Enums.BuilderRunStatus;
    mode?: Prisma.EnumBuilderRunModeFieldUpdateOperationsInput | $Enums.BuilderRunMode;
    links?: Prisma.BuilderRunUpdatelinksInput | string[];
    planned?: Prisma.IntFieldUpdateOperationsInput | number;
    done?: Prisma.IntFieldUpdateOperationsInput | number;
    skipped?: Prisma.IntFieldUpdateOperationsInput | number;
    failed?: Prisma.IntFieldUpdateOperationsInput | number;
    startedById?: Prisma.StringFieldUpdateOperationsInput | string;
    startedByName?: Prisma.StringFieldUpdateOperationsInput | string;
    warnings?: Prisma.BuilderRunUpdatewarningsInput | string[];
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    snapshot?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    startedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    finishedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    undoneAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type BuilderRunCountOutputType
 */
export type BuilderRunCountOutputType = {
    items: number;
};
export type BuilderRunCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    items?: boolean | BuilderRunCountOutputTypeCountItemsArgs;
};
/**
 * BuilderRunCountOutputType without action
 */
export type BuilderRunCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRunCountOutputType
     */
    select?: Prisma.BuilderRunCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * BuilderRunCountOutputType without action
 */
export type BuilderRunCountOutputTypeCountItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BuilderRunItemWhereInput;
};
export type BuilderRunSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    status?: boolean;
    mode?: boolean;
    links?: boolean;
    planned?: boolean;
    done?: boolean;
    skipped?: boolean;
    failed?: boolean;
    startedById?: boolean;
    startedByName?: boolean;
    warnings?: boolean;
    error?: boolean;
    snapshot?: boolean;
    startedAt?: boolean;
    finishedAt?: boolean;
    undoneAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    items?: boolean | Prisma.BuilderRun$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.BuilderRunCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["builderRun"]>;
export type BuilderRunSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    status?: boolean;
    mode?: boolean;
    links?: boolean;
    planned?: boolean;
    done?: boolean;
    skipped?: boolean;
    failed?: boolean;
    startedById?: boolean;
    startedByName?: boolean;
    warnings?: boolean;
    error?: boolean;
    snapshot?: boolean;
    startedAt?: boolean;
    finishedAt?: boolean;
    undoneAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["builderRun"]>;
export type BuilderRunSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    status?: boolean;
    mode?: boolean;
    links?: boolean;
    planned?: boolean;
    done?: boolean;
    skipped?: boolean;
    failed?: boolean;
    startedById?: boolean;
    startedByName?: boolean;
    warnings?: boolean;
    error?: boolean;
    snapshot?: boolean;
    startedAt?: boolean;
    finishedAt?: boolean;
    undoneAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["builderRun"]>;
export type BuilderRunSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    status?: boolean;
    mode?: boolean;
    links?: boolean;
    planned?: boolean;
    done?: boolean;
    skipped?: boolean;
    failed?: boolean;
    startedById?: boolean;
    startedByName?: boolean;
    warnings?: boolean;
    error?: boolean;
    snapshot?: boolean;
    startedAt?: boolean;
    finishedAt?: boolean;
    undoneAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type BuilderRunOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "status" | "mode" | "links" | "planned" | "done" | "skipped" | "failed" | "startedById" | "startedByName" | "warnings" | "error" | "snapshot" | "startedAt" | "finishedAt" | "undoneAt" | "createdAt" | "updatedAt", ExtArgs["result"]["builderRun"]>;
export type BuilderRunInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    items?: boolean | Prisma.BuilderRun$itemsArgs<ExtArgs>;
    _count?: boolean | Prisma.BuilderRunCountOutputTypeDefaultArgs<ExtArgs>;
};
export type BuilderRunIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type BuilderRunIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $BuilderRunPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "BuilderRun";
    objects: {
        items: Prisma.$BuilderRunItemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        status: $Enums.BuilderRunStatus;
        mode: $Enums.BuilderRunMode;
        links: string[];
        planned: number;
        done: number;
        skipped: number;
        failed: number;
        startedById: string;
        startedByName: string;
        warnings: string[];
        error: string | null;
        snapshot: runtime.JsonValue | null;
        startedAt: Date | null;
        finishedAt: Date | null;
        undoneAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["builderRun"]>;
    composites: {};
};
export type BuilderRunGetPayload<S extends boolean | null | undefined | BuilderRunDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload, S>;
export type BuilderRunCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<BuilderRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: BuilderRunCountAggregateInputType | true;
};
export interface BuilderRunDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['BuilderRun'];
        meta: {
            name: 'BuilderRun';
        };
    };
    /**
     * Find zero or one BuilderRun that matches the filter.
     * @param {BuilderRunFindUniqueArgs} args - Arguments to find a BuilderRun
     * @example
     * // Get one BuilderRun
     * const builderRun = await prisma.builderRun.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BuilderRunFindUniqueArgs>(args: Prisma.SelectSubset<T, BuilderRunFindUniqueArgs<ExtArgs>>): Prisma.Prisma__BuilderRunClient<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one BuilderRun that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BuilderRunFindUniqueOrThrowArgs} args - Arguments to find a BuilderRun
     * @example
     * // Get one BuilderRun
     * const builderRun = await prisma.builderRun.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BuilderRunFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, BuilderRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__BuilderRunClient<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first BuilderRun that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderRunFindFirstArgs} args - Arguments to find a BuilderRun
     * @example
     * // Get one BuilderRun
     * const builderRun = await prisma.builderRun.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BuilderRunFindFirstArgs>(args?: Prisma.SelectSubset<T, BuilderRunFindFirstArgs<ExtArgs>>): Prisma.Prisma__BuilderRunClient<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first BuilderRun that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderRunFindFirstOrThrowArgs} args - Arguments to find a BuilderRun
     * @example
     * // Get one BuilderRun
     * const builderRun = await prisma.builderRun.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BuilderRunFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, BuilderRunFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__BuilderRunClient<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more BuilderRuns that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderRunFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BuilderRuns
     * const builderRuns = await prisma.builderRun.findMany()
     *
     * // Get first 10 BuilderRuns
     * const builderRuns = await prisma.builderRun.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const builderRunWithIdOnly = await prisma.builderRun.findMany({ select: { id: true } })
     *
     */
    findMany<T extends BuilderRunFindManyArgs>(args?: Prisma.SelectSubset<T, BuilderRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a BuilderRun.
     * @param {BuilderRunCreateArgs} args - Arguments to create a BuilderRun.
     * @example
     * // Create one BuilderRun
     * const BuilderRun = await prisma.builderRun.create({
     *   data: {
     *     // ... data to create a BuilderRun
     *   }
     * })
     *
     */
    create<T extends BuilderRunCreateArgs>(args: Prisma.SelectSubset<T, BuilderRunCreateArgs<ExtArgs>>): Prisma.Prisma__BuilderRunClient<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many BuilderRuns.
     * @param {BuilderRunCreateManyArgs} args - Arguments to create many BuilderRuns.
     * @example
     * // Create many BuilderRuns
     * const builderRun = await prisma.builderRun.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends BuilderRunCreateManyArgs>(args?: Prisma.SelectSubset<T, BuilderRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many BuilderRuns and returns the data saved in the database.
     * @param {BuilderRunCreateManyAndReturnArgs} args - Arguments to create many BuilderRuns.
     * @example
     * // Create many BuilderRuns
     * const builderRun = await prisma.builderRun.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many BuilderRuns and only return the `id`
     * const builderRunWithIdOnly = await prisma.builderRun.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends BuilderRunCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, BuilderRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a BuilderRun.
     * @param {BuilderRunDeleteArgs} args - Arguments to delete one BuilderRun.
     * @example
     * // Delete one BuilderRun
     * const BuilderRun = await prisma.builderRun.delete({
     *   where: {
     *     // ... filter to delete one BuilderRun
     *   }
     * })
     *
     */
    delete<T extends BuilderRunDeleteArgs>(args: Prisma.SelectSubset<T, BuilderRunDeleteArgs<ExtArgs>>): Prisma.Prisma__BuilderRunClient<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one BuilderRun.
     * @param {BuilderRunUpdateArgs} args - Arguments to update one BuilderRun.
     * @example
     * // Update one BuilderRun
     * const builderRun = await prisma.builderRun.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends BuilderRunUpdateArgs>(args: Prisma.SelectSubset<T, BuilderRunUpdateArgs<ExtArgs>>): Prisma.Prisma__BuilderRunClient<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more BuilderRuns.
     * @param {BuilderRunDeleteManyArgs} args - Arguments to filter BuilderRuns to delete.
     * @example
     * // Delete a few BuilderRuns
     * const { count } = await prisma.builderRun.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends BuilderRunDeleteManyArgs>(args?: Prisma.SelectSubset<T, BuilderRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more BuilderRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderRunUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BuilderRuns
     * const builderRun = await prisma.builderRun.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends BuilderRunUpdateManyArgs>(args: Prisma.SelectSubset<T, BuilderRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more BuilderRuns and returns the data updated in the database.
     * @param {BuilderRunUpdateManyAndReturnArgs} args - Arguments to update many BuilderRuns.
     * @example
     * // Update many BuilderRuns
     * const builderRun = await prisma.builderRun.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more BuilderRuns and only return the `id`
     * const builderRunWithIdOnly = await prisma.builderRun.updateManyAndReturn({
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
    updateManyAndReturn<T extends BuilderRunUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, BuilderRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one BuilderRun.
     * @param {BuilderRunUpsertArgs} args - Arguments to update or create a BuilderRun.
     * @example
     * // Update or create a BuilderRun
     * const builderRun = await prisma.builderRun.upsert({
     *   create: {
     *     // ... data to create a BuilderRun
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BuilderRun we want to update
     *   }
     * })
     */
    upsert<T extends BuilderRunUpsertArgs>(args: Prisma.SelectSubset<T, BuilderRunUpsertArgs<ExtArgs>>): Prisma.Prisma__BuilderRunClient<runtime.Types.Result.GetResult<Prisma.$BuilderRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of BuilderRuns.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderRunCountArgs} args - Arguments to filter BuilderRuns to count.
     * @example
     * // Count the number of BuilderRuns
     * const count = await prisma.builderRun.count({
     *   where: {
     *     // ... the filter for the BuilderRuns we want to count
     *   }
     * })
    **/
    count<T extends BuilderRunCountArgs>(args?: Prisma.Subset<T, BuilderRunCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], BuilderRunCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a BuilderRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderRunAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BuilderRunAggregateArgs>(args: Prisma.Subset<T, BuilderRunAggregateArgs>): Prisma.PrismaPromise<GetBuilderRunAggregateType<T>>;
    /**
     * Group by BuilderRun.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderRunGroupByArgs} args - Group by arguments.
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
    groupBy<T extends BuilderRunGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: BuilderRunGroupByArgs['orderBy'];
    } : {
        orderBy?: BuilderRunGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, BuilderRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBuilderRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the BuilderRun model
     */
    readonly fields: BuilderRunFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for BuilderRun.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__BuilderRunClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    items<T extends Prisma.BuilderRun$itemsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.BuilderRun$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BuilderRunItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the BuilderRun model
 */
export interface BuilderRunFieldRefs {
    readonly id: Prisma.FieldRef<"BuilderRun", 'String'>;
    readonly guildId: Prisma.FieldRef<"BuilderRun", 'String'>;
    readonly status: Prisma.FieldRef<"BuilderRun", 'BuilderRunStatus'>;
    readonly mode: Prisma.FieldRef<"BuilderRun", 'BuilderRunMode'>;
    readonly links: Prisma.FieldRef<"BuilderRun", 'String[]'>;
    readonly planned: Prisma.FieldRef<"BuilderRun", 'Int'>;
    readonly done: Prisma.FieldRef<"BuilderRun", 'Int'>;
    readonly skipped: Prisma.FieldRef<"BuilderRun", 'Int'>;
    readonly failed: Prisma.FieldRef<"BuilderRun", 'Int'>;
    readonly startedById: Prisma.FieldRef<"BuilderRun", 'String'>;
    readonly startedByName: Prisma.FieldRef<"BuilderRun", 'String'>;
    readonly warnings: Prisma.FieldRef<"BuilderRun", 'String[]'>;
    readonly error: Prisma.FieldRef<"BuilderRun", 'String'>;
    readonly snapshot: Prisma.FieldRef<"BuilderRun", 'Json'>;
    readonly startedAt: Prisma.FieldRef<"BuilderRun", 'DateTime'>;
    readonly finishedAt: Prisma.FieldRef<"BuilderRun", 'DateTime'>;
    readonly undoneAt: Prisma.FieldRef<"BuilderRun", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"BuilderRun", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"BuilderRun", 'DateTime'>;
}
/**
 * BuilderRun findUnique
 */
export type BuilderRunFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * Filter, which BuilderRun to fetch.
     */
    where: Prisma.BuilderRunWhereUniqueInput;
};
/**
 * BuilderRun findUniqueOrThrow
 */
export type BuilderRunFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * Filter, which BuilderRun to fetch.
     */
    where: Prisma.BuilderRunWhereUniqueInput;
};
/**
 * BuilderRun findFirst
 */
export type BuilderRunFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * Filter, which BuilderRun to fetch.
     */
    where?: Prisma.BuilderRunWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BuilderRuns to fetch.
     */
    orderBy?: Prisma.BuilderRunOrderByWithRelationInput | Prisma.BuilderRunOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for BuilderRuns.
     */
    cursor?: Prisma.BuilderRunWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BuilderRuns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BuilderRuns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BuilderRuns.
     */
    distinct?: Prisma.BuilderRunScalarFieldEnum | Prisma.BuilderRunScalarFieldEnum[];
};
/**
 * BuilderRun findFirstOrThrow
 */
export type BuilderRunFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * Filter, which BuilderRun to fetch.
     */
    where?: Prisma.BuilderRunWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BuilderRuns to fetch.
     */
    orderBy?: Prisma.BuilderRunOrderByWithRelationInput | Prisma.BuilderRunOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for BuilderRuns.
     */
    cursor?: Prisma.BuilderRunWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BuilderRuns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BuilderRuns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BuilderRuns.
     */
    distinct?: Prisma.BuilderRunScalarFieldEnum | Prisma.BuilderRunScalarFieldEnum[];
};
/**
 * BuilderRun findMany
 */
export type BuilderRunFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * Filter, which BuilderRuns to fetch.
     */
    where?: Prisma.BuilderRunWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BuilderRuns to fetch.
     */
    orderBy?: Prisma.BuilderRunOrderByWithRelationInput | Prisma.BuilderRunOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing BuilderRuns.
     */
    cursor?: Prisma.BuilderRunWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BuilderRuns from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BuilderRuns.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BuilderRuns.
     */
    distinct?: Prisma.BuilderRunScalarFieldEnum | Prisma.BuilderRunScalarFieldEnum[];
};
/**
 * BuilderRun create
 */
export type BuilderRunCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * The data needed to create a BuilderRun.
     */
    data: Prisma.XOR<Prisma.BuilderRunCreateInput, Prisma.BuilderRunUncheckedCreateInput>;
};
/**
 * BuilderRun createMany
 */
export type BuilderRunCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many BuilderRuns.
     */
    data: Prisma.BuilderRunCreateManyInput | Prisma.BuilderRunCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * BuilderRun createManyAndReturn
 */
export type BuilderRunCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * The data used to create many BuilderRuns.
     */
    data: Prisma.BuilderRunCreateManyInput | Prisma.BuilderRunCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * BuilderRun update
 */
export type BuilderRunUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * The data needed to update a BuilderRun.
     */
    data: Prisma.XOR<Prisma.BuilderRunUpdateInput, Prisma.BuilderRunUncheckedUpdateInput>;
    /**
     * Choose, which BuilderRun to update.
     */
    where: Prisma.BuilderRunWhereUniqueInput;
};
/**
 * BuilderRun updateMany
 */
export type BuilderRunUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update BuilderRuns.
     */
    data: Prisma.XOR<Prisma.BuilderRunUpdateManyMutationInput, Prisma.BuilderRunUncheckedUpdateManyInput>;
    /**
     * Filter which BuilderRuns to update
     */
    where?: Prisma.BuilderRunWhereInput;
    /**
     * Limit how many BuilderRuns to update.
     */
    limit?: number;
};
/**
 * BuilderRun updateManyAndReturn
 */
export type BuilderRunUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * The data used to update BuilderRuns.
     */
    data: Prisma.XOR<Prisma.BuilderRunUpdateManyMutationInput, Prisma.BuilderRunUncheckedUpdateManyInput>;
    /**
     * Filter which BuilderRuns to update
     */
    where?: Prisma.BuilderRunWhereInput;
    /**
     * Limit how many BuilderRuns to update.
     */
    limit?: number;
};
/**
 * BuilderRun upsert
 */
export type BuilderRunUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * The filter to search for the BuilderRun to update in case it exists.
     */
    where: Prisma.BuilderRunWhereUniqueInput;
    /**
     * In case the BuilderRun found by the `where` argument doesn't exist, create a new BuilderRun with this data.
     */
    create: Prisma.XOR<Prisma.BuilderRunCreateInput, Prisma.BuilderRunUncheckedCreateInput>;
    /**
     * In case the BuilderRun was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.BuilderRunUpdateInput, Prisma.BuilderRunUncheckedUpdateInput>;
};
/**
 * BuilderRun delete
 */
export type BuilderRunDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
    /**
     * Filter which BuilderRun to delete.
     */
    where: Prisma.BuilderRunWhereUniqueInput;
};
/**
 * BuilderRun deleteMany
 */
export type BuilderRunDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which BuilderRuns to delete
     */
    where?: Prisma.BuilderRunWhereInput;
    /**
     * Limit how many BuilderRuns to delete.
     */
    limit?: number;
};
/**
 * BuilderRun.items
 */
export type BuilderRun$itemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRunItem
     */
    select?: Prisma.BuilderRunItemSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRunItem
     */
    omit?: Prisma.BuilderRunItemOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunItemInclude<ExtArgs> | null;
    where?: Prisma.BuilderRunItemWhereInput;
    orderBy?: Prisma.BuilderRunItemOrderByWithRelationInput | Prisma.BuilderRunItemOrderByWithRelationInput[];
    cursor?: Prisma.BuilderRunItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.BuilderRunItemScalarFieldEnum | Prisma.BuilderRunItemScalarFieldEnum[];
};
/**
 * BuilderRun without action
 */
export type BuilderRunDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderRun
     */
    select?: Prisma.BuilderRunSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderRun
     */
    omit?: Prisma.BuilderRunOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.BuilderRunInclude<ExtArgs> | null;
};
//# sourceMappingURL=BuilderRun.d.ts.map
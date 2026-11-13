import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model BuilderDraft
 *
 */
export type BuilderDraftModel = runtime.Types.Result.DefaultSelection<Prisma.$BuilderDraftPayload>;
export type AggregateBuilderDraft = {
    _count: BuilderDraftCountAggregateOutputType | null;
    _avg: BuilderDraftAvgAggregateOutputType | null;
    _sum: BuilderDraftSumAggregateOutputType | null;
    _min: BuilderDraftMinAggregateOutputType | null;
    _max: BuilderDraftMaxAggregateOutputType | null;
};
export type BuilderDraftAvgAggregateOutputType = {
    revision: number | null;
};
export type BuilderDraftSumAggregateOutputType = {
    revision: number | null;
};
export type BuilderDraftMinAggregateOutputType = {
    guildId: string | null;
    updatedById: string | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type BuilderDraftMaxAggregateOutputType = {
    guildId: string | null;
    updatedById: string | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type BuilderDraftCountAggregateOutputType = {
    guildId: number;
    answers: number;
    blueprint: number;
    updatedById: number;
    revision: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type BuilderDraftAvgAggregateInputType = {
    revision?: true;
};
export type BuilderDraftSumAggregateInputType = {
    revision?: true;
};
export type BuilderDraftMinAggregateInputType = {
    guildId?: true;
    updatedById?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type BuilderDraftMaxAggregateInputType = {
    guildId?: true;
    updatedById?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type BuilderDraftCountAggregateInputType = {
    guildId?: true;
    answers?: true;
    blueprint?: true;
    updatedById?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type BuilderDraftAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which BuilderDraft to aggregate.
     */
    where?: Prisma.BuilderDraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BuilderDrafts to fetch.
     */
    orderBy?: Prisma.BuilderDraftOrderByWithRelationInput | Prisma.BuilderDraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.BuilderDraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BuilderDrafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BuilderDrafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned BuilderDrafts
    **/
    _count?: true | BuilderDraftCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: BuilderDraftAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: BuilderDraftSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: BuilderDraftMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: BuilderDraftMaxAggregateInputType;
};
export type GetBuilderDraftAggregateType<T extends BuilderDraftAggregateArgs> = {
    [P in keyof T & keyof AggregateBuilderDraft]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateBuilderDraft[P]> : Prisma.GetScalarType<T[P], AggregateBuilderDraft[P]>;
};
export type BuilderDraftGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BuilderDraftWhereInput;
    orderBy?: Prisma.BuilderDraftOrderByWithAggregationInput | Prisma.BuilderDraftOrderByWithAggregationInput[];
    by: Prisma.BuilderDraftScalarFieldEnum[] | Prisma.BuilderDraftScalarFieldEnum;
    having?: Prisma.BuilderDraftScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: BuilderDraftCountAggregateInputType | true;
    _avg?: BuilderDraftAvgAggregateInputType;
    _sum?: BuilderDraftSumAggregateInputType;
    _min?: BuilderDraftMinAggregateInputType;
    _max?: BuilderDraftMaxAggregateInputType;
};
export type BuilderDraftGroupByOutputType = {
    guildId: string;
    answers: runtime.JsonValue;
    blueprint: runtime.JsonValue;
    updatedById: string | null;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
    _count: BuilderDraftCountAggregateOutputType | null;
    _avg: BuilderDraftAvgAggregateOutputType | null;
    _sum: BuilderDraftSumAggregateOutputType | null;
    _min: BuilderDraftMinAggregateOutputType | null;
    _max: BuilderDraftMaxAggregateOutputType | null;
};
export type GetBuilderDraftGroupByPayload<T extends BuilderDraftGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<BuilderDraftGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof BuilderDraftGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], BuilderDraftGroupByOutputType[P]> : Prisma.GetScalarType<T[P], BuilderDraftGroupByOutputType[P]>;
}>>;
export type BuilderDraftWhereInput = {
    AND?: Prisma.BuilderDraftWhereInput | Prisma.BuilderDraftWhereInput[];
    OR?: Prisma.BuilderDraftWhereInput[];
    NOT?: Prisma.BuilderDraftWhereInput | Prisma.BuilderDraftWhereInput[];
    guildId?: Prisma.StringFilter<"BuilderDraft"> | string;
    answers?: Prisma.JsonFilter<"BuilderDraft">;
    blueprint?: Prisma.JsonFilter<"BuilderDraft">;
    updatedById?: Prisma.StringNullableFilter<"BuilderDraft"> | string | null;
    revision?: Prisma.IntFilter<"BuilderDraft"> | number;
    createdAt?: Prisma.DateTimeFilter<"BuilderDraft"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BuilderDraft"> | Date | string;
};
export type BuilderDraftOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    answers?: Prisma.SortOrder;
    blueprint?: Prisma.SortOrder;
    updatedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BuilderDraftWhereUniqueInput = Prisma.AtLeast<{
    guildId?: string;
    AND?: Prisma.BuilderDraftWhereInput | Prisma.BuilderDraftWhereInput[];
    OR?: Prisma.BuilderDraftWhereInput[];
    NOT?: Prisma.BuilderDraftWhereInput | Prisma.BuilderDraftWhereInput[];
    answers?: Prisma.JsonFilter<"BuilderDraft">;
    blueprint?: Prisma.JsonFilter<"BuilderDraft">;
    updatedById?: Prisma.StringNullableFilter<"BuilderDraft"> | string | null;
    revision?: Prisma.IntFilter<"BuilderDraft"> | number;
    createdAt?: Prisma.DateTimeFilter<"BuilderDraft"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BuilderDraft"> | Date | string;
}, "guildId">;
export type BuilderDraftOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    answers?: Prisma.SortOrder;
    blueprint?: Prisma.SortOrder;
    updatedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.BuilderDraftCountOrderByAggregateInput;
    _avg?: Prisma.BuilderDraftAvgOrderByAggregateInput;
    _max?: Prisma.BuilderDraftMaxOrderByAggregateInput;
    _min?: Prisma.BuilderDraftMinOrderByAggregateInput;
    _sum?: Prisma.BuilderDraftSumOrderByAggregateInput;
};
export type BuilderDraftScalarWhereWithAggregatesInput = {
    AND?: Prisma.BuilderDraftScalarWhereWithAggregatesInput | Prisma.BuilderDraftScalarWhereWithAggregatesInput[];
    OR?: Prisma.BuilderDraftScalarWhereWithAggregatesInput[];
    NOT?: Prisma.BuilderDraftScalarWhereWithAggregatesInput | Prisma.BuilderDraftScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"BuilderDraft"> | string;
    answers?: Prisma.JsonWithAggregatesFilter<"BuilderDraft">;
    blueprint?: Prisma.JsonWithAggregatesFilter<"BuilderDraft">;
    updatedById?: Prisma.StringNullableWithAggregatesFilter<"BuilderDraft"> | string | null;
    revision?: Prisma.IntWithAggregatesFilter<"BuilderDraft"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"BuilderDraft"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"BuilderDraft"> | Date | string;
};
export type BuilderDraftCreateInput = {
    guildId: string;
    answers: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    blueprint: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedById?: string | null;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BuilderDraftUncheckedCreateInput = {
    guildId: string;
    answers: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    blueprint: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedById?: string | null;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BuilderDraftUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    answers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    blueprint?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BuilderDraftUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    answers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    blueprint?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BuilderDraftCreateManyInput = {
    guildId: string;
    answers: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    blueprint: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedById?: string | null;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BuilderDraftUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    answers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    blueprint?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BuilderDraftUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    answers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    blueprint?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    updatedById?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BuilderDraftCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    answers?: Prisma.SortOrder;
    blueprint?: Prisma.SortOrder;
    updatedById?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BuilderDraftAvgOrderByAggregateInput = {
    revision?: Prisma.SortOrder;
};
export type BuilderDraftMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    updatedById?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BuilderDraftMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    updatedById?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BuilderDraftSumOrderByAggregateInput = {
    revision?: Prisma.SortOrder;
};
export type BuilderDraftSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    answers?: boolean;
    blueprint?: boolean;
    updatedById?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["builderDraft"]>;
export type BuilderDraftSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    answers?: boolean;
    blueprint?: boolean;
    updatedById?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["builderDraft"]>;
export type BuilderDraftSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    answers?: boolean;
    blueprint?: boolean;
    updatedById?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["builderDraft"]>;
export type BuilderDraftSelectScalar = {
    guildId?: boolean;
    answers?: boolean;
    blueprint?: boolean;
    updatedById?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type BuilderDraftOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "answers" | "blueprint" | "updatedById" | "revision" | "createdAt" | "updatedAt", ExtArgs["result"]["builderDraft"]>;
export type $BuilderDraftPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "BuilderDraft";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        answers: runtime.JsonValue;
        blueprint: runtime.JsonValue;
        updatedById: string | null;
        revision: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["builderDraft"]>;
    composites: {};
};
export type BuilderDraftGetPayload<S extends boolean | null | undefined | BuilderDraftDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload, S>;
export type BuilderDraftCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<BuilderDraftFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: BuilderDraftCountAggregateInputType | true;
};
export interface BuilderDraftDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['BuilderDraft'];
        meta: {
            name: 'BuilderDraft';
        };
    };
    /**
     * Find zero or one BuilderDraft that matches the filter.
     * @param {BuilderDraftFindUniqueArgs} args - Arguments to find a BuilderDraft
     * @example
     * // Get one BuilderDraft
     * const builderDraft = await prisma.builderDraft.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BuilderDraftFindUniqueArgs>(args: Prisma.SelectSubset<T, BuilderDraftFindUniqueArgs<ExtArgs>>): Prisma.Prisma__BuilderDraftClient<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one BuilderDraft that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BuilderDraftFindUniqueOrThrowArgs} args - Arguments to find a BuilderDraft
     * @example
     * // Get one BuilderDraft
     * const builderDraft = await prisma.builderDraft.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BuilderDraftFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, BuilderDraftFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__BuilderDraftClient<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first BuilderDraft that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderDraftFindFirstArgs} args - Arguments to find a BuilderDraft
     * @example
     * // Get one BuilderDraft
     * const builderDraft = await prisma.builderDraft.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BuilderDraftFindFirstArgs>(args?: Prisma.SelectSubset<T, BuilderDraftFindFirstArgs<ExtArgs>>): Prisma.Prisma__BuilderDraftClient<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first BuilderDraft that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderDraftFindFirstOrThrowArgs} args - Arguments to find a BuilderDraft
     * @example
     * // Get one BuilderDraft
     * const builderDraft = await prisma.builderDraft.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BuilderDraftFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, BuilderDraftFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__BuilderDraftClient<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more BuilderDrafts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderDraftFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BuilderDrafts
     * const builderDrafts = await prisma.builderDraft.findMany()
     *
     * // Get first 10 BuilderDrafts
     * const builderDrafts = await prisma.builderDraft.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const builderDraftWithGuildIdOnly = await prisma.builderDraft.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends BuilderDraftFindManyArgs>(args?: Prisma.SelectSubset<T, BuilderDraftFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a BuilderDraft.
     * @param {BuilderDraftCreateArgs} args - Arguments to create a BuilderDraft.
     * @example
     * // Create one BuilderDraft
     * const BuilderDraft = await prisma.builderDraft.create({
     *   data: {
     *     // ... data to create a BuilderDraft
     *   }
     * })
     *
     */
    create<T extends BuilderDraftCreateArgs>(args: Prisma.SelectSubset<T, BuilderDraftCreateArgs<ExtArgs>>): Prisma.Prisma__BuilderDraftClient<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many BuilderDrafts.
     * @param {BuilderDraftCreateManyArgs} args - Arguments to create many BuilderDrafts.
     * @example
     * // Create many BuilderDrafts
     * const builderDraft = await prisma.builderDraft.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends BuilderDraftCreateManyArgs>(args?: Prisma.SelectSubset<T, BuilderDraftCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many BuilderDrafts and returns the data saved in the database.
     * @param {BuilderDraftCreateManyAndReturnArgs} args - Arguments to create many BuilderDrafts.
     * @example
     * // Create many BuilderDrafts
     * const builderDraft = await prisma.builderDraft.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many BuilderDrafts and only return the `guildId`
     * const builderDraftWithGuildIdOnly = await prisma.builderDraft.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends BuilderDraftCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, BuilderDraftCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a BuilderDraft.
     * @param {BuilderDraftDeleteArgs} args - Arguments to delete one BuilderDraft.
     * @example
     * // Delete one BuilderDraft
     * const BuilderDraft = await prisma.builderDraft.delete({
     *   where: {
     *     // ... filter to delete one BuilderDraft
     *   }
     * })
     *
     */
    delete<T extends BuilderDraftDeleteArgs>(args: Prisma.SelectSubset<T, BuilderDraftDeleteArgs<ExtArgs>>): Prisma.Prisma__BuilderDraftClient<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one BuilderDraft.
     * @param {BuilderDraftUpdateArgs} args - Arguments to update one BuilderDraft.
     * @example
     * // Update one BuilderDraft
     * const builderDraft = await prisma.builderDraft.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends BuilderDraftUpdateArgs>(args: Prisma.SelectSubset<T, BuilderDraftUpdateArgs<ExtArgs>>): Prisma.Prisma__BuilderDraftClient<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more BuilderDrafts.
     * @param {BuilderDraftDeleteManyArgs} args - Arguments to filter BuilderDrafts to delete.
     * @example
     * // Delete a few BuilderDrafts
     * const { count } = await prisma.builderDraft.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends BuilderDraftDeleteManyArgs>(args?: Prisma.SelectSubset<T, BuilderDraftDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more BuilderDrafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderDraftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BuilderDrafts
     * const builderDraft = await prisma.builderDraft.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends BuilderDraftUpdateManyArgs>(args: Prisma.SelectSubset<T, BuilderDraftUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more BuilderDrafts and returns the data updated in the database.
     * @param {BuilderDraftUpdateManyAndReturnArgs} args - Arguments to update many BuilderDrafts.
     * @example
     * // Update many BuilderDrafts
     * const builderDraft = await prisma.builderDraft.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more BuilderDrafts and only return the `guildId`
     * const builderDraftWithGuildIdOnly = await prisma.builderDraft.updateManyAndReturn({
     *   select: { guildId: true },
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
    updateManyAndReturn<T extends BuilderDraftUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, BuilderDraftUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one BuilderDraft.
     * @param {BuilderDraftUpsertArgs} args - Arguments to update or create a BuilderDraft.
     * @example
     * // Update or create a BuilderDraft
     * const builderDraft = await prisma.builderDraft.upsert({
     *   create: {
     *     // ... data to create a BuilderDraft
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BuilderDraft we want to update
     *   }
     * })
     */
    upsert<T extends BuilderDraftUpsertArgs>(args: Prisma.SelectSubset<T, BuilderDraftUpsertArgs<ExtArgs>>): Prisma.Prisma__BuilderDraftClient<runtime.Types.Result.GetResult<Prisma.$BuilderDraftPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of BuilderDrafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderDraftCountArgs} args - Arguments to filter BuilderDrafts to count.
     * @example
     * // Count the number of BuilderDrafts
     * const count = await prisma.builderDraft.count({
     *   where: {
     *     // ... the filter for the BuilderDrafts we want to count
     *   }
     * })
    **/
    count<T extends BuilderDraftCountArgs>(args?: Prisma.Subset<T, BuilderDraftCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], BuilderDraftCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a BuilderDraft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderDraftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BuilderDraftAggregateArgs>(args: Prisma.Subset<T, BuilderDraftAggregateArgs>): Prisma.PrismaPromise<GetBuilderDraftAggregateType<T>>;
    /**
     * Group by BuilderDraft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BuilderDraftGroupByArgs} args - Group by arguments.
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
    groupBy<T extends BuilderDraftGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: BuilderDraftGroupByArgs['orderBy'];
    } : {
        orderBy?: BuilderDraftGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, BuilderDraftGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBuilderDraftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the BuilderDraft model
     */
    readonly fields: BuilderDraftFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for BuilderDraft.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__BuilderDraftClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
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
 * Fields of the BuilderDraft model
 */
export interface BuilderDraftFieldRefs {
    readonly guildId: Prisma.FieldRef<"BuilderDraft", 'String'>;
    readonly answers: Prisma.FieldRef<"BuilderDraft", 'Json'>;
    readonly blueprint: Prisma.FieldRef<"BuilderDraft", 'Json'>;
    readonly updatedById: Prisma.FieldRef<"BuilderDraft", 'String'>;
    readonly revision: Prisma.FieldRef<"BuilderDraft", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"BuilderDraft", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"BuilderDraft", 'DateTime'>;
}
/**
 * BuilderDraft findUnique
 */
export type BuilderDraftFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * Filter, which BuilderDraft to fetch.
     */
    where: Prisma.BuilderDraftWhereUniqueInput;
};
/**
 * BuilderDraft findUniqueOrThrow
 */
export type BuilderDraftFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * Filter, which BuilderDraft to fetch.
     */
    where: Prisma.BuilderDraftWhereUniqueInput;
};
/**
 * BuilderDraft findFirst
 */
export type BuilderDraftFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * Filter, which BuilderDraft to fetch.
     */
    where?: Prisma.BuilderDraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BuilderDrafts to fetch.
     */
    orderBy?: Prisma.BuilderDraftOrderByWithRelationInput | Prisma.BuilderDraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for BuilderDrafts.
     */
    cursor?: Prisma.BuilderDraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BuilderDrafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BuilderDrafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BuilderDrafts.
     */
    distinct?: Prisma.BuilderDraftScalarFieldEnum | Prisma.BuilderDraftScalarFieldEnum[];
};
/**
 * BuilderDraft findFirstOrThrow
 */
export type BuilderDraftFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * Filter, which BuilderDraft to fetch.
     */
    where?: Prisma.BuilderDraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BuilderDrafts to fetch.
     */
    orderBy?: Prisma.BuilderDraftOrderByWithRelationInput | Prisma.BuilderDraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for BuilderDrafts.
     */
    cursor?: Prisma.BuilderDraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BuilderDrafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BuilderDrafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BuilderDrafts.
     */
    distinct?: Prisma.BuilderDraftScalarFieldEnum | Prisma.BuilderDraftScalarFieldEnum[];
};
/**
 * BuilderDraft findMany
 */
export type BuilderDraftFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * Filter, which BuilderDrafts to fetch.
     */
    where?: Prisma.BuilderDraftWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BuilderDrafts to fetch.
     */
    orderBy?: Prisma.BuilderDraftOrderByWithRelationInput | Prisma.BuilderDraftOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing BuilderDrafts.
     */
    cursor?: Prisma.BuilderDraftWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BuilderDrafts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BuilderDrafts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BuilderDrafts.
     */
    distinct?: Prisma.BuilderDraftScalarFieldEnum | Prisma.BuilderDraftScalarFieldEnum[];
};
/**
 * BuilderDraft create
 */
export type BuilderDraftCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * The data needed to create a BuilderDraft.
     */
    data: Prisma.XOR<Prisma.BuilderDraftCreateInput, Prisma.BuilderDraftUncheckedCreateInput>;
};
/**
 * BuilderDraft createMany
 */
export type BuilderDraftCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many BuilderDrafts.
     */
    data: Prisma.BuilderDraftCreateManyInput | Prisma.BuilderDraftCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * BuilderDraft createManyAndReturn
 */
export type BuilderDraftCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * The data used to create many BuilderDrafts.
     */
    data: Prisma.BuilderDraftCreateManyInput | Prisma.BuilderDraftCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * BuilderDraft update
 */
export type BuilderDraftUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * The data needed to update a BuilderDraft.
     */
    data: Prisma.XOR<Prisma.BuilderDraftUpdateInput, Prisma.BuilderDraftUncheckedUpdateInput>;
    /**
     * Choose, which BuilderDraft to update.
     */
    where: Prisma.BuilderDraftWhereUniqueInput;
};
/**
 * BuilderDraft updateMany
 */
export type BuilderDraftUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update BuilderDrafts.
     */
    data: Prisma.XOR<Prisma.BuilderDraftUpdateManyMutationInput, Prisma.BuilderDraftUncheckedUpdateManyInput>;
    /**
     * Filter which BuilderDrafts to update
     */
    where?: Prisma.BuilderDraftWhereInput;
    /**
     * Limit how many BuilderDrafts to update.
     */
    limit?: number;
};
/**
 * BuilderDraft updateManyAndReturn
 */
export type BuilderDraftUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * The data used to update BuilderDrafts.
     */
    data: Prisma.XOR<Prisma.BuilderDraftUpdateManyMutationInput, Prisma.BuilderDraftUncheckedUpdateManyInput>;
    /**
     * Filter which BuilderDrafts to update
     */
    where?: Prisma.BuilderDraftWhereInput;
    /**
     * Limit how many BuilderDrafts to update.
     */
    limit?: number;
};
/**
 * BuilderDraft upsert
 */
export type BuilderDraftUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * The filter to search for the BuilderDraft to update in case it exists.
     */
    where: Prisma.BuilderDraftWhereUniqueInput;
    /**
     * In case the BuilderDraft found by the `where` argument doesn't exist, create a new BuilderDraft with this data.
     */
    create: Prisma.XOR<Prisma.BuilderDraftCreateInput, Prisma.BuilderDraftUncheckedCreateInput>;
    /**
     * In case the BuilderDraft was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.BuilderDraftUpdateInput, Prisma.BuilderDraftUncheckedUpdateInput>;
};
/**
 * BuilderDraft delete
 */
export type BuilderDraftDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
    /**
     * Filter which BuilderDraft to delete.
     */
    where: Prisma.BuilderDraftWhereUniqueInput;
};
/**
 * BuilderDraft deleteMany
 */
export type BuilderDraftDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which BuilderDrafts to delete
     */
    where?: Prisma.BuilderDraftWhereInput;
    /**
     * Limit how many BuilderDrafts to delete.
     */
    limit?: number;
};
/**
 * BuilderDraft without action
 */
export type BuilderDraftDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BuilderDraft
     */
    select?: Prisma.BuilderDraftSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BuilderDraft
     */
    omit?: Prisma.BuilderDraftOmit<ExtArgs> | null;
};
//# sourceMappingURL=BuilderDraft.d.ts.map
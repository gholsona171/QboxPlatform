import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model GiveawayCounter
 *
 */
export type GiveawayCounterModel = runtime.Types.Result.DefaultSelection<Prisma.$GiveawayCounterPayload>;
export type AggregateGiveawayCounter = {
    _count: GiveawayCounterCountAggregateOutputType | null;
    _avg: GiveawayCounterAvgAggregateOutputType | null;
    _sum: GiveawayCounterSumAggregateOutputType | null;
    _min: GiveawayCounterMinAggregateOutputType | null;
    _max: GiveawayCounterMaxAggregateOutputType | null;
};
export type GiveawayCounterAvgAggregateOutputType = {
    nextNumber: number | null;
};
export type GiveawayCounterSumAggregateOutputType = {
    nextNumber: number | null;
};
export type GiveawayCounterMinAggregateOutputType = {
    guildId: string | null;
    nextNumber: number | null;
};
export type GiveawayCounterMaxAggregateOutputType = {
    guildId: string | null;
    nextNumber: number | null;
};
export type GiveawayCounterCountAggregateOutputType = {
    guildId: number;
    nextNumber: number;
    _all: number;
};
export type GiveawayCounterAvgAggregateInputType = {
    nextNumber?: true;
};
export type GiveawayCounterSumAggregateInputType = {
    nextNumber?: true;
};
export type GiveawayCounterMinAggregateInputType = {
    guildId?: true;
    nextNumber?: true;
};
export type GiveawayCounterMaxAggregateInputType = {
    guildId?: true;
    nextNumber?: true;
};
export type GiveawayCounterCountAggregateInputType = {
    guildId?: true;
    nextNumber?: true;
    _all?: true;
};
export type GiveawayCounterAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GiveawayCounter to aggregate.
     */
    where?: Prisma.GiveawayCounterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GiveawayCounters to fetch.
     */
    orderBy?: Prisma.GiveawayCounterOrderByWithRelationInput | Prisma.GiveawayCounterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.GiveawayCounterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GiveawayCounters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GiveawayCounters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned GiveawayCounters
    **/
    _count?: true | GiveawayCounterCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: GiveawayCounterAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: GiveawayCounterSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: GiveawayCounterMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: GiveawayCounterMaxAggregateInputType;
};
export type GetGiveawayCounterAggregateType<T extends GiveawayCounterAggregateArgs> = {
    [P in keyof T & keyof AggregateGiveawayCounter]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGiveawayCounter[P]> : Prisma.GetScalarType<T[P], AggregateGiveawayCounter[P]>;
};
export type GiveawayCounterGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GiveawayCounterWhereInput;
    orderBy?: Prisma.GiveawayCounterOrderByWithAggregationInput | Prisma.GiveawayCounterOrderByWithAggregationInput[];
    by: Prisma.GiveawayCounterScalarFieldEnum[] | Prisma.GiveawayCounterScalarFieldEnum;
    having?: Prisma.GiveawayCounterScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GiveawayCounterCountAggregateInputType | true;
    _avg?: GiveawayCounterAvgAggregateInputType;
    _sum?: GiveawayCounterSumAggregateInputType;
    _min?: GiveawayCounterMinAggregateInputType;
    _max?: GiveawayCounterMaxAggregateInputType;
};
export type GiveawayCounterGroupByOutputType = {
    guildId: string;
    nextNumber: number;
    _count: GiveawayCounterCountAggregateOutputType | null;
    _avg: GiveawayCounterAvgAggregateOutputType | null;
    _sum: GiveawayCounterSumAggregateOutputType | null;
    _min: GiveawayCounterMinAggregateOutputType | null;
    _max: GiveawayCounterMaxAggregateOutputType | null;
};
export type GetGiveawayCounterGroupByPayload<T extends GiveawayCounterGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GiveawayCounterGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GiveawayCounterGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GiveawayCounterGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GiveawayCounterGroupByOutputType[P]>;
}>>;
export type GiveawayCounterWhereInput = {
    AND?: Prisma.GiveawayCounterWhereInput | Prisma.GiveawayCounterWhereInput[];
    OR?: Prisma.GiveawayCounterWhereInput[];
    NOT?: Prisma.GiveawayCounterWhereInput | Prisma.GiveawayCounterWhereInput[];
    guildId?: Prisma.StringFilter<"GiveawayCounter"> | string;
    nextNumber?: Prisma.IntFilter<"GiveawayCounter"> | number;
};
export type GiveawayCounterOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    nextNumber?: Prisma.SortOrder;
};
export type GiveawayCounterWhereUniqueInput = Prisma.AtLeast<{
    guildId?: string;
    AND?: Prisma.GiveawayCounterWhereInput | Prisma.GiveawayCounterWhereInput[];
    OR?: Prisma.GiveawayCounterWhereInput[];
    NOT?: Prisma.GiveawayCounterWhereInput | Prisma.GiveawayCounterWhereInput[];
    nextNumber?: Prisma.IntFilter<"GiveawayCounter"> | number;
}, "guildId">;
export type GiveawayCounterOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    nextNumber?: Prisma.SortOrder;
    _count?: Prisma.GiveawayCounterCountOrderByAggregateInput;
    _avg?: Prisma.GiveawayCounterAvgOrderByAggregateInput;
    _max?: Prisma.GiveawayCounterMaxOrderByAggregateInput;
    _min?: Prisma.GiveawayCounterMinOrderByAggregateInput;
    _sum?: Prisma.GiveawayCounterSumOrderByAggregateInput;
};
export type GiveawayCounterScalarWhereWithAggregatesInput = {
    AND?: Prisma.GiveawayCounterScalarWhereWithAggregatesInput | Prisma.GiveawayCounterScalarWhereWithAggregatesInput[];
    OR?: Prisma.GiveawayCounterScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GiveawayCounterScalarWhereWithAggregatesInput | Prisma.GiveawayCounterScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"GiveawayCounter"> | string;
    nextNumber?: Prisma.IntWithAggregatesFilter<"GiveawayCounter"> | number;
};
export type GiveawayCounterCreateInput = {
    guildId: string;
    nextNumber?: number;
};
export type GiveawayCounterUncheckedCreateInput = {
    guildId: string;
    nextNumber?: number;
};
export type GiveawayCounterUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    nextNumber?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GiveawayCounterUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    nextNumber?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GiveawayCounterCreateManyInput = {
    guildId: string;
    nextNumber?: number;
};
export type GiveawayCounterUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    nextNumber?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GiveawayCounterUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    nextNumber?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type GiveawayCounterCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    nextNumber?: Prisma.SortOrder;
};
export type GiveawayCounterAvgOrderByAggregateInput = {
    nextNumber?: Prisma.SortOrder;
};
export type GiveawayCounterMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    nextNumber?: Prisma.SortOrder;
};
export type GiveawayCounterMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    nextNumber?: Prisma.SortOrder;
};
export type GiveawayCounterSumOrderByAggregateInput = {
    nextNumber?: Prisma.SortOrder;
};
export type GiveawayCounterSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    nextNumber?: boolean;
}, ExtArgs["result"]["giveawayCounter"]>;
export type GiveawayCounterSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    nextNumber?: boolean;
}, ExtArgs["result"]["giveawayCounter"]>;
export type GiveawayCounterSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    nextNumber?: boolean;
}, ExtArgs["result"]["giveawayCounter"]>;
export type GiveawayCounterSelectScalar = {
    guildId?: boolean;
    nextNumber?: boolean;
};
export type GiveawayCounterOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "nextNumber", ExtArgs["result"]["giveawayCounter"]>;
export type $GiveawayCounterPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GiveawayCounter";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        nextNumber: number;
    }, ExtArgs["result"]["giveawayCounter"]>;
    composites: {};
};
export type GiveawayCounterGetPayload<S extends boolean | null | undefined | GiveawayCounterDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload, S>;
export type GiveawayCounterCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GiveawayCounterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GiveawayCounterCountAggregateInputType | true;
};
export interface GiveawayCounterDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GiveawayCounter'];
        meta: {
            name: 'GiveawayCounter';
        };
    };
    /**
     * Find zero or one GiveawayCounter that matches the filter.
     * @param {GiveawayCounterFindUniqueArgs} args - Arguments to find a GiveawayCounter
     * @example
     * // Get one GiveawayCounter
     * const giveawayCounter = await prisma.giveawayCounter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GiveawayCounterFindUniqueArgs>(args: Prisma.SelectSubset<T, GiveawayCounterFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GiveawayCounterClient<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one GiveawayCounter that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GiveawayCounterFindUniqueOrThrowArgs} args - Arguments to find a GiveawayCounter
     * @example
     * // Get one GiveawayCounter
     * const giveawayCounter = await prisma.giveawayCounter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GiveawayCounterFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GiveawayCounterFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GiveawayCounterClient<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GiveawayCounter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiveawayCounterFindFirstArgs} args - Arguments to find a GiveawayCounter
     * @example
     * // Get one GiveawayCounter
     * const giveawayCounter = await prisma.giveawayCounter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GiveawayCounterFindFirstArgs>(args?: Prisma.SelectSubset<T, GiveawayCounterFindFirstArgs<ExtArgs>>): Prisma.Prisma__GiveawayCounterClient<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GiveawayCounter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiveawayCounterFindFirstOrThrowArgs} args - Arguments to find a GiveawayCounter
     * @example
     * // Get one GiveawayCounter
     * const giveawayCounter = await prisma.giveawayCounter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GiveawayCounterFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GiveawayCounterFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GiveawayCounterClient<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more GiveawayCounters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiveawayCounterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GiveawayCounters
     * const giveawayCounters = await prisma.giveawayCounter.findMany()
     *
     * // Get first 10 GiveawayCounters
     * const giveawayCounters = await prisma.giveawayCounter.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const giveawayCounterWithGuildIdOnly = await prisma.giveawayCounter.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends GiveawayCounterFindManyArgs>(args?: Prisma.SelectSubset<T, GiveawayCounterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a GiveawayCounter.
     * @param {GiveawayCounterCreateArgs} args - Arguments to create a GiveawayCounter.
     * @example
     * // Create one GiveawayCounter
     * const GiveawayCounter = await prisma.giveawayCounter.create({
     *   data: {
     *     // ... data to create a GiveawayCounter
     *   }
     * })
     *
     */
    create<T extends GiveawayCounterCreateArgs>(args: Prisma.SelectSubset<T, GiveawayCounterCreateArgs<ExtArgs>>): Prisma.Prisma__GiveawayCounterClient<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many GiveawayCounters.
     * @param {GiveawayCounterCreateManyArgs} args - Arguments to create many GiveawayCounters.
     * @example
     * // Create many GiveawayCounters
     * const giveawayCounter = await prisma.giveawayCounter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends GiveawayCounterCreateManyArgs>(args?: Prisma.SelectSubset<T, GiveawayCounterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many GiveawayCounters and returns the data saved in the database.
     * @param {GiveawayCounterCreateManyAndReturnArgs} args - Arguments to create many GiveawayCounters.
     * @example
     * // Create many GiveawayCounters
     * const giveawayCounter = await prisma.giveawayCounter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many GiveawayCounters and only return the `guildId`
     * const giveawayCounterWithGuildIdOnly = await prisma.giveawayCounter.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends GiveawayCounterCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, GiveawayCounterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a GiveawayCounter.
     * @param {GiveawayCounterDeleteArgs} args - Arguments to delete one GiveawayCounter.
     * @example
     * // Delete one GiveawayCounter
     * const GiveawayCounter = await prisma.giveawayCounter.delete({
     *   where: {
     *     // ... filter to delete one GiveawayCounter
     *   }
     * })
     *
     */
    delete<T extends GiveawayCounterDeleteArgs>(args: Prisma.SelectSubset<T, GiveawayCounterDeleteArgs<ExtArgs>>): Prisma.Prisma__GiveawayCounterClient<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one GiveawayCounter.
     * @param {GiveawayCounterUpdateArgs} args - Arguments to update one GiveawayCounter.
     * @example
     * // Update one GiveawayCounter
     * const giveawayCounter = await prisma.giveawayCounter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends GiveawayCounterUpdateArgs>(args: Prisma.SelectSubset<T, GiveawayCounterUpdateArgs<ExtArgs>>): Prisma.Prisma__GiveawayCounterClient<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more GiveawayCounters.
     * @param {GiveawayCounterDeleteManyArgs} args - Arguments to filter GiveawayCounters to delete.
     * @example
     * // Delete a few GiveawayCounters
     * const { count } = await prisma.giveawayCounter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends GiveawayCounterDeleteManyArgs>(args?: Prisma.SelectSubset<T, GiveawayCounterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GiveawayCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiveawayCounterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GiveawayCounters
     * const giveawayCounter = await prisma.giveawayCounter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends GiveawayCounterUpdateManyArgs>(args: Prisma.SelectSubset<T, GiveawayCounterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GiveawayCounters and returns the data updated in the database.
     * @param {GiveawayCounterUpdateManyAndReturnArgs} args - Arguments to update many GiveawayCounters.
     * @example
     * // Update many GiveawayCounters
     * const giveawayCounter = await prisma.giveawayCounter.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more GiveawayCounters and only return the `guildId`
     * const giveawayCounterWithGuildIdOnly = await prisma.giveawayCounter.updateManyAndReturn({
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
    updateManyAndReturn<T extends GiveawayCounterUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, GiveawayCounterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one GiveawayCounter.
     * @param {GiveawayCounterUpsertArgs} args - Arguments to update or create a GiveawayCounter.
     * @example
     * // Update or create a GiveawayCounter
     * const giveawayCounter = await prisma.giveawayCounter.upsert({
     *   create: {
     *     // ... data to create a GiveawayCounter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GiveawayCounter we want to update
     *   }
     * })
     */
    upsert<T extends GiveawayCounterUpsertArgs>(args: Prisma.SelectSubset<T, GiveawayCounterUpsertArgs<ExtArgs>>): Prisma.Prisma__GiveawayCounterClient<runtime.Types.Result.GetResult<Prisma.$GiveawayCounterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of GiveawayCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiveawayCounterCountArgs} args - Arguments to filter GiveawayCounters to count.
     * @example
     * // Count the number of GiveawayCounters
     * const count = await prisma.giveawayCounter.count({
     *   where: {
     *     // ... the filter for the GiveawayCounters we want to count
     *   }
     * })
    **/
    count<T extends GiveawayCounterCountArgs>(args?: Prisma.Subset<T, GiveawayCounterCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GiveawayCounterCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a GiveawayCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiveawayCounterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GiveawayCounterAggregateArgs>(args: Prisma.Subset<T, GiveawayCounterAggregateArgs>): Prisma.PrismaPromise<GetGiveawayCounterAggregateType<T>>;
    /**
     * Group by GiveawayCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GiveawayCounterGroupByArgs} args - Group by arguments.
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
    groupBy<T extends GiveawayCounterGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GiveawayCounterGroupByArgs['orderBy'];
    } : {
        orderBy?: GiveawayCounterGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GiveawayCounterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGiveawayCounterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the GiveawayCounter model
     */
    readonly fields: GiveawayCounterFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for GiveawayCounter.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__GiveawayCounterClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the GiveawayCounter model
 */
export interface GiveawayCounterFieldRefs {
    readonly guildId: Prisma.FieldRef<"GiveawayCounter", 'String'>;
    readonly nextNumber: Prisma.FieldRef<"GiveawayCounter", 'Int'>;
}
/**
 * GiveawayCounter findUnique
 */
export type GiveawayCounterFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * Filter, which GiveawayCounter to fetch.
     */
    where: Prisma.GiveawayCounterWhereUniqueInput;
};
/**
 * GiveawayCounter findUniqueOrThrow
 */
export type GiveawayCounterFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * Filter, which GiveawayCounter to fetch.
     */
    where: Prisma.GiveawayCounterWhereUniqueInput;
};
/**
 * GiveawayCounter findFirst
 */
export type GiveawayCounterFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * Filter, which GiveawayCounter to fetch.
     */
    where?: Prisma.GiveawayCounterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GiveawayCounters to fetch.
     */
    orderBy?: Prisma.GiveawayCounterOrderByWithRelationInput | Prisma.GiveawayCounterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GiveawayCounters.
     */
    cursor?: Prisma.GiveawayCounterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GiveawayCounters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GiveawayCounters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GiveawayCounters.
     */
    distinct?: Prisma.GiveawayCounterScalarFieldEnum | Prisma.GiveawayCounterScalarFieldEnum[];
};
/**
 * GiveawayCounter findFirstOrThrow
 */
export type GiveawayCounterFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * Filter, which GiveawayCounter to fetch.
     */
    where?: Prisma.GiveawayCounterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GiveawayCounters to fetch.
     */
    orderBy?: Prisma.GiveawayCounterOrderByWithRelationInput | Prisma.GiveawayCounterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GiveawayCounters.
     */
    cursor?: Prisma.GiveawayCounterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GiveawayCounters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GiveawayCounters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GiveawayCounters.
     */
    distinct?: Prisma.GiveawayCounterScalarFieldEnum | Prisma.GiveawayCounterScalarFieldEnum[];
};
/**
 * GiveawayCounter findMany
 */
export type GiveawayCounterFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * Filter, which GiveawayCounters to fetch.
     */
    where?: Prisma.GiveawayCounterWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GiveawayCounters to fetch.
     */
    orderBy?: Prisma.GiveawayCounterOrderByWithRelationInput | Prisma.GiveawayCounterOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing GiveawayCounters.
     */
    cursor?: Prisma.GiveawayCounterWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GiveawayCounters from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GiveawayCounters.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GiveawayCounters.
     */
    distinct?: Prisma.GiveawayCounterScalarFieldEnum | Prisma.GiveawayCounterScalarFieldEnum[];
};
/**
 * GiveawayCounter create
 */
export type GiveawayCounterCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * The data needed to create a GiveawayCounter.
     */
    data: Prisma.XOR<Prisma.GiveawayCounterCreateInput, Prisma.GiveawayCounterUncheckedCreateInput>;
};
/**
 * GiveawayCounter createMany
 */
export type GiveawayCounterCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many GiveawayCounters.
     */
    data: Prisma.GiveawayCounterCreateManyInput | Prisma.GiveawayCounterCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GiveawayCounter createManyAndReturn
 */
export type GiveawayCounterCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * The data used to create many GiveawayCounters.
     */
    data: Prisma.GiveawayCounterCreateManyInput | Prisma.GiveawayCounterCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GiveawayCounter update
 */
export type GiveawayCounterUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * The data needed to update a GiveawayCounter.
     */
    data: Prisma.XOR<Prisma.GiveawayCounterUpdateInput, Prisma.GiveawayCounterUncheckedUpdateInput>;
    /**
     * Choose, which GiveawayCounter to update.
     */
    where: Prisma.GiveawayCounterWhereUniqueInput;
};
/**
 * GiveawayCounter updateMany
 */
export type GiveawayCounterUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update GiveawayCounters.
     */
    data: Prisma.XOR<Prisma.GiveawayCounterUpdateManyMutationInput, Prisma.GiveawayCounterUncheckedUpdateManyInput>;
    /**
     * Filter which GiveawayCounters to update
     */
    where?: Prisma.GiveawayCounterWhereInput;
    /**
     * Limit how many GiveawayCounters to update.
     */
    limit?: number;
};
/**
 * GiveawayCounter updateManyAndReturn
 */
export type GiveawayCounterUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * The data used to update GiveawayCounters.
     */
    data: Prisma.XOR<Prisma.GiveawayCounterUpdateManyMutationInput, Prisma.GiveawayCounterUncheckedUpdateManyInput>;
    /**
     * Filter which GiveawayCounters to update
     */
    where?: Prisma.GiveawayCounterWhereInput;
    /**
     * Limit how many GiveawayCounters to update.
     */
    limit?: number;
};
/**
 * GiveawayCounter upsert
 */
export type GiveawayCounterUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * The filter to search for the GiveawayCounter to update in case it exists.
     */
    where: Prisma.GiveawayCounterWhereUniqueInput;
    /**
     * In case the GiveawayCounter found by the `where` argument doesn't exist, create a new GiveawayCounter with this data.
     */
    create: Prisma.XOR<Prisma.GiveawayCounterCreateInput, Prisma.GiveawayCounterUncheckedCreateInput>;
    /**
     * In case the GiveawayCounter was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.GiveawayCounterUpdateInput, Prisma.GiveawayCounterUncheckedUpdateInput>;
};
/**
 * GiveawayCounter delete
 */
export type GiveawayCounterDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
    /**
     * Filter which GiveawayCounter to delete.
     */
    where: Prisma.GiveawayCounterWhereUniqueInput;
};
/**
 * GiveawayCounter deleteMany
 */
export type GiveawayCounterDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GiveawayCounters to delete
     */
    where?: Prisma.GiveawayCounterWhereInput;
    /**
     * Limit how many GiveawayCounters to delete.
     */
    limit?: number;
};
/**
 * GiveawayCounter without action
 */
export type GiveawayCounterDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GiveawayCounter
     */
    select?: Prisma.GiveawayCounterSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GiveawayCounter
     */
    omit?: Prisma.GiveawayCounterOmit<ExtArgs> | null;
};
//# sourceMappingURL=GiveawayCounter.d.ts.map
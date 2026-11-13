import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model GamesSettings
 *
 */
export type GamesSettingsModel = runtime.Types.Result.DefaultSelection<Prisma.$GamesSettingsPayload>;
export type AggregateGamesSettings = {
    _count: GamesSettingsCountAggregateOutputType | null;
    _avg: GamesSettingsAvgAggregateOutputType | null;
    _sum: GamesSettingsSumAggregateOutputType | null;
    _min: GamesSettingsMinAggregateOutputType | null;
    _max: GamesSettingsMaxAggregateOutputType | null;
};
export type GamesSettingsAvgAggregateOutputType = {
    revision: number | null;
};
export type GamesSettingsSumAggregateOutputType = {
    revision: number | null;
};
export type GamesSettingsMinAggregateOutputType = {
    guildId: string | null;
    playerCountTemplate: string | null;
    playerCountOfflineTemplate: string | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type GamesSettingsMaxAggregateOutputType = {
    guildId: string | null;
    playerCountTemplate: string | null;
    playerCountOfflineTemplate: string | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type GamesSettingsCountAggregateOutputType = {
    guildId: number;
    playerCountTemplate: number;
    playerCountOfflineTemplate: number;
    revision: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type GamesSettingsAvgAggregateInputType = {
    revision?: true;
};
export type GamesSettingsSumAggregateInputType = {
    revision?: true;
};
export type GamesSettingsMinAggregateInputType = {
    guildId?: true;
    playerCountTemplate?: true;
    playerCountOfflineTemplate?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type GamesSettingsMaxAggregateInputType = {
    guildId?: true;
    playerCountTemplate?: true;
    playerCountOfflineTemplate?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type GamesSettingsCountAggregateInputType = {
    guildId?: true;
    playerCountTemplate?: true;
    playerCountOfflineTemplate?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type GamesSettingsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GamesSettings to aggregate.
     */
    where?: Prisma.GamesSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GamesSettings to fetch.
     */
    orderBy?: Prisma.GamesSettingsOrderByWithRelationInput | Prisma.GamesSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.GamesSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GamesSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GamesSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned GamesSettings
    **/
    _count?: true | GamesSettingsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: GamesSettingsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: GamesSettingsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: GamesSettingsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: GamesSettingsMaxAggregateInputType;
};
export type GetGamesSettingsAggregateType<T extends GamesSettingsAggregateArgs> = {
    [P in keyof T & keyof AggregateGamesSettings]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGamesSettings[P]> : Prisma.GetScalarType<T[P], AggregateGamesSettings[P]>;
};
export type GamesSettingsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GamesSettingsWhereInput;
    orderBy?: Prisma.GamesSettingsOrderByWithAggregationInput | Prisma.GamesSettingsOrderByWithAggregationInput[];
    by: Prisma.GamesSettingsScalarFieldEnum[] | Prisma.GamesSettingsScalarFieldEnum;
    having?: Prisma.GamesSettingsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GamesSettingsCountAggregateInputType | true;
    _avg?: GamesSettingsAvgAggregateInputType;
    _sum?: GamesSettingsSumAggregateInputType;
    _min?: GamesSettingsMinAggregateInputType;
    _max?: GamesSettingsMaxAggregateInputType;
};
export type GamesSettingsGroupByOutputType = {
    guildId: string;
    playerCountTemplate: string;
    playerCountOfflineTemplate: string;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
    _count: GamesSettingsCountAggregateOutputType | null;
    _avg: GamesSettingsAvgAggregateOutputType | null;
    _sum: GamesSettingsSumAggregateOutputType | null;
    _min: GamesSettingsMinAggregateOutputType | null;
    _max: GamesSettingsMaxAggregateOutputType | null;
};
export type GetGamesSettingsGroupByPayload<T extends GamesSettingsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GamesSettingsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GamesSettingsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GamesSettingsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GamesSettingsGroupByOutputType[P]>;
}>>;
export type GamesSettingsWhereInput = {
    AND?: Prisma.GamesSettingsWhereInput | Prisma.GamesSettingsWhereInput[];
    OR?: Prisma.GamesSettingsWhereInput[];
    NOT?: Prisma.GamesSettingsWhereInput | Prisma.GamesSettingsWhereInput[];
    guildId?: Prisma.StringFilter<"GamesSettings"> | string;
    playerCountTemplate?: Prisma.StringFilter<"GamesSettings"> | string;
    playerCountOfflineTemplate?: Prisma.StringFilter<"GamesSettings"> | string;
    revision?: Prisma.IntFilter<"GamesSettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"GamesSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"GamesSettings"> | Date | string;
};
export type GamesSettingsOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    playerCountTemplate?: Prisma.SortOrder;
    playerCountOfflineTemplate?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GamesSettingsWhereUniqueInput = Prisma.AtLeast<{
    guildId?: string;
    AND?: Prisma.GamesSettingsWhereInput | Prisma.GamesSettingsWhereInput[];
    OR?: Prisma.GamesSettingsWhereInput[];
    NOT?: Prisma.GamesSettingsWhereInput | Prisma.GamesSettingsWhereInput[];
    playerCountTemplate?: Prisma.StringFilter<"GamesSettings"> | string;
    playerCountOfflineTemplate?: Prisma.StringFilter<"GamesSettings"> | string;
    revision?: Prisma.IntFilter<"GamesSettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"GamesSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"GamesSettings"> | Date | string;
}, "guildId">;
export type GamesSettingsOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    playerCountTemplate?: Prisma.SortOrder;
    playerCountOfflineTemplate?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.GamesSettingsCountOrderByAggregateInput;
    _avg?: Prisma.GamesSettingsAvgOrderByAggregateInput;
    _max?: Prisma.GamesSettingsMaxOrderByAggregateInput;
    _min?: Prisma.GamesSettingsMinOrderByAggregateInput;
    _sum?: Prisma.GamesSettingsSumOrderByAggregateInput;
};
export type GamesSettingsScalarWhereWithAggregatesInput = {
    AND?: Prisma.GamesSettingsScalarWhereWithAggregatesInput | Prisma.GamesSettingsScalarWhereWithAggregatesInput[];
    OR?: Prisma.GamesSettingsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GamesSettingsScalarWhereWithAggregatesInput | Prisma.GamesSettingsScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"GamesSettings"> | string;
    playerCountTemplate?: Prisma.StringWithAggregatesFilter<"GamesSettings"> | string;
    playerCountOfflineTemplate?: Prisma.StringWithAggregatesFilter<"GamesSettings"> | string;
    revision?: Prisma.IntWithAggregatesFilter<"GamesSettings"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"GamesSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"GamesSettings"> | Date | string;
};
export type GamesSettingsCreateInput = {
    guildId: string;
    playerCountTemplate?: string;
    playerCountOfflineTemplate?: string;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GamesSettingsUncheckedCreateInput = {
    guildId: string;
    playerCountTemplate?: string;
    playerCountOfflineTemplate?: string;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GamesSettingsUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerCountTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    playerCountOfflineTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesSettingsUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerCountTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    playerCountOfflineTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesSettingsCreateManyInput = {
    guildId: string;
    playerCountTemplate?: string;
    playerCountOfflineTemplate?: string;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type GamesSettingsUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerCountTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    playerCountOfflineTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesSettingsUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    playerCountTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    playerCountOfflineTemplate?: Prisma.StringFieldUpdateOperationsInput | string;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesSettingsCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    playerCountTemplate?: Prisma.SortOrder;
    playerCountOfflineTemplate?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GamesSettingsAvgOrderByAggregateInput = {
    revision?: Prisma.SortOrder;
};
export type GamesSettingsMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    playerCountTemplate?: Prisma.SortOrder;
    playerCountOfflineTemplate?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GamesSettingsMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    playerCountTemplate?: Prisma.SortOrder;
    playerCountOfflineTemplate?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type GamesSettingsSumOrderByAggregateInput = {
    revision?: Prisma.SortOrder;
};
export type GamesSettingsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    playerCountTemplate?: boolean;
    playerCountOfflineTemplate?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["gamesSettings"]>;
export type GamesSettingsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    playerCountTemplate?: boolean;
    playerCountOfflineTemplate?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["gamesSettings"]>;
export type GamesSettingsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    playerCountTemplate?: boolean;
    playerCountOfflineTemplate?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["gamesSettings"]>;
export type GamesSettingsSelectScalar = {
    guildId?: boolean;
    playerCountTemplate?: boolean;
    playerCountOfflineTemplate?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type GamesSettingsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "playerCountTemplate" | "playerCountOfflineTemplate" | "revision" | "createdAt" | "updatedAt", ExtArgs["result"]["gamesSettings"]>;
export type $GamesSettingsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GamesSettings";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        playerCountTemplate: string;
        playerCountOfflineTemplate: string;
        revision: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["gamesSettings"]>;
    composites: {};
};
export type GamesSettingsGetPayload<S extends boolean | null | undefined | GamesSettingsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload, S>;
export type GamesSettingsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GamesSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GamesSettingsCountAggregateInputType | true;
};
export interface GamesSettingsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GamesSettings'];
        meta: {
            name: 'GamesSettings';
        };
    };
    /**
     * Find zero or one GamesSettings that matches the filter.
     * @param {GamesSettingsFindUniqueArgs} args - Arguments to find a GamesSettings
     * @example
     * // Get one GamesSettings
     * const gamesSettings = await prisma.gamesSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GamesSettingsFindUniqueArgs>(args: Prisma.SelectSubset<T, GamesSettingsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GamesSettingsClient<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one GamesSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GamesSettingsFindUniqueOrThrowArgs} args - Arguments to find a GamesSettings
     * @example
     * // Get one GamesSettings
     * const gamesSettings = await prisma.gamesSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GamesSettingsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GamesSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GamesSettingsClient<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GamesSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesSettingsFindFirstArgs} args - Arguments to find a GamesSettings
     * @example
     * // Get one GamesSettings
     * const gamesSettings = await prisma.gamesSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GamesSettingsFindFirstArgs>(args?: Prisma.SelectSubset<T, GamesSettingsFindFirstArgs<ExtArgs>>): Prisma.Prisma__GamesSettingsClient<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GamesSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesSettingsFindFirstOrThrowArgs} args - Arguments to find a GamesSettings
     * @example
     * // Get one GamesSettings
     * const gamesSettings = await prisma.gamesSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GamesSettingsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GamesSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GamesSettingsClient<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more GamesSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GamesSettings
     * const gamesSettings = await prisma.gamesSettings.findMany()
     *
     * // Get first 10 GamesSettings
     * const gamesSettings = await prisma.gamesSettings.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const gamesSettingsWithGuildIdOnly = await prisma.gamesSettings.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends GamesSettingsFindManyArgs>(args?: Prisma.SelectSubset<T, GamesSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a GamesSettings.
     * @param {GamesSettingsCreateArgs} args - Arguments to create a GamesSettings.
     * @example
     * // Create one GamesSettings
     * const GamesSettings = await prisma.gamesSettings.create({
     *   data: {
     *     // ... data to create a GamesSettings
     *   }
     * })
     *
     */
    create<T extends GamesSettingsCreateArgs>(args: Prisma.SelectSubset<T, GamesSettingsCreateArgs<ExtArgs>>): Prisma.Prisma__GamesSettingsClient<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many GamesSettings.
     * @param {GamesSettingsCreateManyArgs} args - Arguments to create many GamesSettings.
     * @example
     * // Create many GamesSettings
     * const gamesSettings = await prisma.gamesSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends GamesSettingsCreateManyArgs>(args?: Prisma.SelectSubset<T, GamesSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many GamesSettings and returns the data saved in the database.
     * @param {GamesSettingsCreateManyAndReturnArgs} args - Arguments to create many GamesSettings.
     * @example
     * // Create many GamesSettings
     * const gamesSettings = await prisma.gamesSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many GamesSettings and only return the `guildId`
     * const gamesSettingsWithGuildIdOnly = await prisma.gamesSettings.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends GamesSettingsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, GamesSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a GamesSettings.
     * @param {GamesSettingsDeleteArgs} args - Arguments to delete one GamesSettings.
     * @example
     * // Delete one GamesSettings
     * const GamesSettings = await prisma.gamesSettings.delete({
     *   where: {
     *     // ... filter to delete one GamesSettings
     *   }
     * })
     *
     */
    delete<T extends GamesSettingsDeleteArgs>(args: Prisma.SelectSubset<T, GamesSettingsDeleteArgs<ExtArgs>>): Prisma.Prisma__GamesSettingsClient<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one GamesSettings.
     * @param {GamesSettingsUpdateArgs} args - Arguments to update one GamesSettings.
     * @example
     * // Update one GamesSettings
     * const gamesSettings = await prisma.gamesSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends GamesSettingsUpdateArgs>(args: Prisma.SelectSubset<T, GamesSettingsUpdateArgs<ExtArgs>>): Prisma.Prisma__GamesSettingsClient<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more GamesSettings.
     * @param {GamesSettingsDeleteManyArgs} args - Arguments to filter GamesSettings to delete.
     * @example
     * // Delete a few GamesSettings
     * const { count } = await prisma.gamesSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends GamesSettingsDeleteManyArgs>(args?: Prisma.SelectSubset<T, GamesSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GamesSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GamesSettings
     * const gamesSettings = await prisma.gamesSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends GamesSettingsUpdateManyArgs>(args: Prisma.SelectSubset<T, GamesSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GamesSettings and returns the data updated in the database.
     * @param {GamesSettingsUpdateManyAndReturnArgs} args - Arguments to update many GamesSettings.
     * @example
     * // Update many GamesSettings
     * const gamesSettings = await prisma.gamesSettings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more GamesSettings and only return the `guildId`
     * const gamesSettingsWithGuildIdOnly = await prisma.gamesSettings.updateManyAndReturn({
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
    updateManyAndReturn<T extends GamesSettingsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, GamesSettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one GamesSettings.
     * @param {GamesSettingsUpsertArgs} args - Arguments to update or create a GamesSettings.
     * @example
     * // Update or create a GamesSettings
     * const gamesSettings = await prisma.gamesSettings.upsert({
     *   create: {
     *     // ... data to create a GamesSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GamesSettings we want to update
     *   }
     * })
     */
    upsert<T extends GamesSettingsUpsertArgs>(args: Prisma.SelectSubset<T, GamesSettingsUpsertArgs<ExtArgs>>): Prisma.Prisma__GamesSettingsClient<runtime.Types.Result.GetResult<Prisma.$GamesSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of GamesSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesSettingsCountArgs} args - Arguments to filter GamesSettings to count.
     * @example
     * // Count the number of GamesSettings
     * const count = await prisma.gamesSettings.count({
     *   where: {
     *     // ... the filter for the GamesSettings we want to count
     *   }
     * })
    **/
    count<T extends GamesSettingsCountArgs>(args?: Prisma.Subset<T, GamesSettingsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GamesSettingsCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a GamesSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GamesSettingsAggregateArgs>(args: Prisma.Subset<T, GamesSettingsAggregateArgs>): Prisma.PrismaPromise<GetGamesSettingsAggregateType<T>>;
    /**
     * Group by GamesSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesSettingsGroupByArgs} args - Group by arguments.
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
    groupBy<T extends GamesSettingsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GamesSettingsGroupByArgs['orderBy'];
    } : {
        orderBy?: GamesSettingsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GamesSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGamesSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the GamesSettings model
     */
    readonly fields: GamesSettingsFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for GamesSettings.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__GamesSettingsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the GamesSettings model
 */
export interface GamesSettingsFieldRefs {
    readonly guildId: Prisma.FieldRef<"GamesSettings", 'String'>;
    readonly playerCountTemplate: Prisma.FieldRef<"GamesSettings", 'String'>;
    readonly playerCountOfflineTemplate: Prisma.FieldRef<"GamesSettings", 'String'>;
    readonly revision: Prisma.FieldRef<"GamesSettings", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"GamesSettings", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"GamesSettings", 'DateTime'>;
}
/**
 * GamesSettings findUnique
 */
export type GamesSettingsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which GamesSettings to fetch.
     */
    where: Prisma.GamesSettingsWhereUniqueInput;
};
/**
 * GamesSettings findUniqueOrThrow
 */
export type GamesSettingsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which GamesSettings to fetch.
     */
    where: Prisma.GamesSettingsWhereUniqueInput;
};
/**
 * GamesSettings findFirst
 */
export type GamesSettingsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which GamesSettings to fetch.
     */
    where?: Prisma.GamesSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GamesSettings to fetch.
     */
    orderBy?: Prisma.GamesSettingsOrderByWithRelationInput | Prisma.GamesSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GamesSettings.
     */
    cursor?: Prisma.GamesSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GamesSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GamesSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GamesSettings.
     */
    distinct?: Prisma.GamesSettingsScalarFieldEnum | Prisma.GamesSettingsScalarFieldEnum[];
};
/**
 * GamesSettings findFirstOrThrow
 */
export type GamesSettingsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which GamesSettings to fetch.
     */
    where?: Prisma.GamesSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GamesSettings to fetch.
     */
    orderBy?: Prisma.GamesSettingsOrderByWithRelationInput | Prisma.GamesSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GamesSettings.
     */
    cursor?: Prisma.GamesSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GamesSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GamesSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GamesSettings.
     */
    distinct?: Prisma.GamesSettingsScalarFieldEnum | Prisma.GamesSettingsScalarFieldEnum[];
};
/**
 * GamesSettings findMany
 */
export type GamesSettingsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which GamesSettings to fetch.
     */
    where?: Prisma.GamesSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GamesSettings to fetch.
     */
    orderBy?: Prisma.GamesSettingsOrderByWithRelationInput | Prisma.GamesSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing GamesSettings.
     */
    cursor?: Prisma.GamesSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GamesSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GamesSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GamesSettings.
     */
    distinct?: Prisma.GamesSettingsScalarFieldEnum | Prisma.GamesSettingsScalarFieldEnum[];
};
/**
 * GamesSettings create
 */
export type GamesSettingsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * The data needed to create a GamesSettings.
     */
    data: Prisma.XOR<Prisma.GamesSettingsCreateInput, Prisma.GamesSettingsUncheckedCreateInput>;
};
/**
 * GamesSettings createMany
 */
export type GamesSettingsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many GamesSettings.
     */
    data: Prisma.GamesSettingsCreateManyInput | Prisma.GamesSettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GamesSettings createManyAndReturn
 */
export type GamesSettingsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * The data used to create many GamesSettings.
     */
    data: Prisma.GamesSettingsCreateManyInput | Prisma.GamesSettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GamesSettings update
 */
export type GamesSettingsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * The data needed to update a GamesSettings.
     */
    data: Prisma.XOR<Prisma.GamesSettingsUpdateInput, Prisma.GamesSettingsUncheckedUpdateInput>;
    /**
     * Choose, which GamesSettings to update.
     */
    where: Prisma.GamesSettingsWhereUniqueInput;
};
/**
 * GamesSettings updateMany
 */
export type GamesSettingsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update GamesSettings.
     */
    data: Prisma.XOR<Prisma.GamesSettingsUpdateManyMutationInput, Prisma.GamesSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which GamesSettings to update
     */
    where?: Prisma.GamesSettingsWhereInput;
    /**
     * Limit how many GamesSettings to update.
     */
    limit?: number;
};
/**
 * GamesSettings updateManyAndReturn
 */
export type GamesSettingsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * The data used to update GamesSettings.
     */
    data: Prisma.XOR<Prisma.GamesSettingsUpdateManyMutationInput, Prisma.GamesSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which GamesSettings to update
     */
    where?: Prisma.GamesSettingsWhereInput;
    /**
     * Limit how many GamesSettings to update.
     */
    limit?: number;
};
/**
 * GamesSettings upsert
 */
export type GamesSettingsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * The filter to search for the GamesSettings to update in case it exists.
     */
    where: Prisma.GamesSettingsWhereUniqueInput;
    /**
     * In case the GamesSettings found by the `where` argument doesn't exist, create a new GamesSettings with this data.
     */
    create: Prisma.XOR<Prisma.GamesSettingsCreateInput, Prisma.GamesSettingsUncheckedCreateInput>;
    /**
     * In case the GamesSettings was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.GamesSettingsUpdateInput, Prisma.GamesSettingsUncheckedUpdateInput>;
};
/**
 * GamesSettings delete
 */
export type GamesSettingsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
    /**
     * Filter which GamesSettings to delete.
     */
    where: Prisma.GamesSettingsWhereUniqueInput;
};
/**
 * GamesSettings deleteMany
 */
export type GamesSettingsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GamesSettings to delete
     */
    where?: Prisma.GamesSettingsWhereInput;
    /**
     * Limit how many GamesSettings to delete.
     */
    limit?: number;
};
/**
 * GamesSettings without action
 */
export type GamesSettingsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesSettings
     */
    select?: Prisma.GamesSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesSettings
     */
    omit?: Prisma.GamesSettingsOmit<ExtArgs> | null;
};
//# sourceMappingURL=GamesSettings.d.ts.map
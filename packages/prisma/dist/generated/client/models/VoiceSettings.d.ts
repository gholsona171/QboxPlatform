import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model VoiceSettings
 *
 */
export type VoiceSettingsModel = runtime.Types.Result.DefaultSelection<Prisma.$VoiceSettingsPayload>;
export type AggregateVoiceSettings = {
    _count: VoiceSettingsCountAggregateOutputType | null;
    _avg: VoiceSettingsAvgAggregateOutputType | null;
    _sum: VoiceSettingsSumAggregateOutputType | null;
    _min: VoiceSettingsMinAggregateOutputType | null;
    _max: VoiceSettingsMaxAggregateOutputType | null;
};
export type VoiceSettingsAvgAggregateOutputType = {
    revision: number | null;
};
export type VoiceSettingsSumAggregateOutputType = {
    revision: number | null;
};
export type VoiceSettingsMinAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    controlPanel: boolean | null;
    allowClaim: boolean | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type VoiceSettingsMaxAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    controlPanel: boolean | null;
    allowClaim: boolean | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type VoiceSettingsCountAggregateOutputType = {
    guildId: number;
    enabled: number;
    controlPanel: number;
    allowClaim: number;
    revision: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type VoiceSettingsAvgAggregateInputType = {
    revision?: true;
};
export type VoiceSettingsSumAggregateInputType = {
    revision?: true;
};
export type VoiceSettingsMinAggregateInputType = {
    guildId?: true;
    enabled?: true;
    controlPanel?: true;
    allowClaim?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type VoiceSettingsMaxAggregateInputType = {
    guildId?: true;
    enabled?: true;
    controlPanel?: true;
    allowClaim?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type VoiceSettingsCountAggregateInputType = {
    guildId?: true;
    enabled?: true;
    controlPanel?: true;
    allowClaim?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type VoiceSettingsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VoiceSettings to aggregate.
     */
    where?: Prisma.VoiceSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VoiceSettings to fetch.
     */
    orderBy?: Prisma.VoiceSettingsOrderByWithRelationInput | Prisma.VoiceSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.VoiceSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VoiceSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VoiceSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned VoiceSettings
    **/
    _count?: true | VoiceSettingsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: VoiceSettingsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: VoiceSettingsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: VoiceSettingsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: VoiceSettingsMaxAggregateInputType;
};
export type GetVoiceSettingsAggregateType<T extends VoiceSettingsAggregateArgs> = {
    [P in keyof T & keyof AggregateVoiceSettings]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateVoiceSettings[P]> : Prisma.GetScalarType<T[P], AggregateVoiceSettings[P]>;
};
export type VoiceSettingsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.VoiceSettingsWhereInput;
    orderBy?: Prisma.VoiceSettingsOrderByWithAggregationInput | Prisma.VoiceSettingsOrderByWithAggregationInput[];
    by: Prisma.VoiceSettingsScalarFieldEnum[] | Prisma.VoiceSettingsScalarFieldEnum;
    having?: Prisma.VoiceSettingsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: VoiceSettingsCountAggregateInputType | true;
    _avg?: VoiceSettingsAvgAggregateInputType;
    _sum?: VoiceSettingsSumAggregateInputType;
    _min?: VoiceSettingsMinAggregateInputType;
    _max?: VoiceSettingsMaxAggregateInputType;
};
export type VoiceSettingsGroupByOutputType = {
    guildId: string;
    enabled: boolean;
    controlPanel: boolean;
    allowClaim: boolean;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
    _count: VoiceSettingsCountAggregateOutputType | null;
    _avg: VoiceSettingsAvgAggregateOutputType | null;
    _sum: VoiceSettingsSumAggregateOutputType | null;
    _min: VoiceSettingsMinAggregateOutputType | null;
    _max: VoiceSettingsMaxAggregateOutputType | null;
};
export type GetVoiceSettingsGroupByPayload<T extends VoiceSettingsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<VoiceSettingsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof VoiceSettingsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], VoiceSettingsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], VoiceSettingsGroupByOutputType[P]>;
}>>;
export type VoiceSettingsWhereInput = {
    AND?: Prisma.VoiceSettingsWhereInput | Prisma.VoiceSettingsWhereInput[];
    OR?: Prisma.VoiceSettingsWhereInput[];
    NOT?: Prisma.VoiceSettingsWhereInput | Prisma.VoiceSettingsWhereInput[];
    guildId?: Prisma.StringFilter<"VoiceSettings"> | string;
    enabled?: Prisma.BoolFilter<"VoiceSettings"> | boolean;
    controlPanel?: Prisma.BoolFilter<"VoiceSettings"> | boolean;
    allowClaim?: Prisma.BoolFilter<"VoiceSettings"> | boolean;
    revision?: Prisma.IntFilter<"VoiceSettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"VoiceSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"VoiceSettings"> | Date | string;
};
export type VoiceSettingsOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    controlPanel?: Prisma.SortOrder;
    allowClaim?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VoiceSettingsWhereUniqueInput = Prisma.AtLeast<{
    guildId?: string;
    AND?: Prisma.VoiceSettingsWhereInput | Prisma.VoiceSettingsWhereInput[];
    OR?: Prisma.VoiceSettingsWhereInput[];
    NOT?: Prisma.VoiceSettingsWhereInput | Prisma.VoiceSettingsWhereInput[];
    enabled?: Prisma.BoolFilter<"VoiceSettings"> | boolean;
    controlPanel?: Prisma.BoolFilter<"VoiceSettings"> | boolean;
    allowClaim?: Prisma.BoolFilter<"VoiceSettings"> | boolean;
    revision?: Prisma.IntFilter<"VoiceSettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"VoiceSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"VoiceSettings"> | Date | string;
}, "guildId">;
export type VoiceSettingsOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    controlPanel?: Prisma.SortOrder;
    allowClaim?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.VoiceSettingsCountOrderByAggregateInput;
    _avg?: Prisma.VoiceSettingsAvgOrderByAggregateInput;
    _max?: Prisma.VoiceSettingsMaxOrderByAggregateInput;
    _min?: Prisma.VoiceSettingsMinOrderByAggregateInput;
    _sum?: Prisma.VoiceSettingsSumOrderByAggregateInput;
};
export type VoiceSettingsScalarWhereWithAggregatesInput = {
    AND?: Prisma.VoiceSettingsScalarWhereWithAggregatesInput | Prisma.VoiceSettingsScalarWhereWithAggregatesInput[];
    OR?: Prisma.VoiceSettingsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.VoiceSettingsScalarWhereWithAggregatesInput | Prisma.VoiceSettingsScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"VoiceSettings"> | string;
    enabled?: Prisma.BoolWithAggregatesFilter<"VoiceSettings"> | boolean;
    controlPanel?: Prisma.BoolWithAggregatesFilter<"VoiceSettings"> | boolean;
    allowClaim?: Prisma.BoolWithAggregatesFilter<"VoiceSettings"> | boolean;
    revision?: Prisma.IntWithAggregatesFilter<"VoiceSettings"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"VoiceSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"VoiceSettings"> | Date | string;
};
export type VoiceSettingsCreateInput = {
    guildId: string;
    enabled?: boolean;
    controlPanel?: boolean;
    allowClaim?: boolean;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VoiceSettingsUncheckedCreateInput = {
    guildId: string;
    enabled?: boolean;
    controlPanel?: boolean;
    allowClaim?: boolean;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VoiceSettingsUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    controlPanel?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    allowClaim?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VoiceSettingsUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    controlPanel?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    allowClaim?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VoiceSettingsCreateManyInput = {
    guildId: string;
    enabled?: boolean;
    controlPanel?: boolean;
    allowClaim?: boolean;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VoiceSettingsUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    controlPanel?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    allowClaim?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VoiceSettingsUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    controlPanel?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    allowClaim?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VoiceSettingsCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    controlPanel?: Prisma.SortOrder;
    allowClaim?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VoiceSettingsAvgOrderByAggregateInput = {
    revision?: Prisma.SortOrder;
};
export type VoiceSettingsMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    controlPanel?: Prisma.SortOrder;
    allowClaim?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VoiceSettingsMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    controlPanel?: Prisma.SortOrder;
    allowClaim?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VoiceSettingsSumOrderByAggregateInput = {
    revision?: Prisma.SortOrder;
};
export type VoiceSettingsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    controlPanel?: boolean;
    allowClaim?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["voiceSettings"]>;
export type VoiceSettingsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    controlPanel?: boolean;
    allowClaim?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["voiceSettings"]>;
export type VoiceSettingsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    controlPanel?: boolean;
    allowClaim?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["voiceSettings"]>;
export type VoiceSettingsSelectScalar = {
    guildId?: boolean;
    enabled?: boolean;
    controlPanel?: boolean;
    allowClaim?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type VoiceSettingsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "enabled" | "controlPanel" | "allowClaim" | "revision" | "createdAt" | "updatedAt", ExtArgs["result"]["voiceSettings"]>;
export type $VoiceSettingsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "VoiceSettings";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        enabled: boolean;
        controlPanel: boolean;
        allowClaim: boolean;
        revision: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["voiceSettings"]>;
    composites: {};
};
export type VoiceSettingsGetPayload<S extends boolean | null | undefined | VoiceSettingsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload, S>;
export type VoiceSettingsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<VoiceSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: VoiceSettingsCountAggregateInputType | true;
};
export interface VoiceSettingsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['VoiceSettings'];
        meta: {
            name: 'VoiceSettings';
        };
    };
    /**
     * Find zero or one VoiceSettings that matches the filter.
     * @param {VoiceSettingsFindUniqueArgs} args - Arguments to find a VoiceSettings
     * @example
     * // Get one VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VoiceSettingsFindUniqueArgs>(args: Prisma.SelectSubset<T, VoiceSettingsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__VoiceSettingsClient<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one VoiceSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VoiceSettingsFindUniqueOrThrowArgs} args - Arguments to find a VoiceSettings
     * @example
     * // Get one VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VoiceSettingsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, VoiceSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__VoiceSettingsClient<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VoiceSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoiceSettingsFindFirstArgs} args - Arguments to find a VoiceSettings
     * @example
     * // Get one VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VoiceSettingsFindFirstArgs>(args?: Prisma.SelectSubset<T, VoiceSettingsFindFirstArgs<ExtArgs>>): Prisma.Prisma__VoiceSettingsClient<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VoiceSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoiceSettingsFindFirstOrThrowArgs} args - Arguments to find a VoiceSettings
     * @example
     * // Get one VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VoiceSettingsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, VoiceSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__VoiceSettingsClient<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more VoiceSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoiceSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.findMany()
     *
     * // Get first 10 VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const voiceSettingsWithGuildIdOnly = await prisma.voiceSettings.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends VoiceSettingsFindManyArgs>(args?: Prisma.SelectSubset<T, VoiceSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a VoiceSettings.
     * @param {VoiceSettingsCreateArgs} args - Arguments to create a VoiceSettings.
     * @example
     * // Create one VoiceSettings
     * const VoiceSettings = await prisma.voiceSettings.create({
     *   data: {
     *     // ... data to create a VoiceSettings
     *   }
     * })
     *
     */
    create<T extends VoiceSettingsCreateArgs>(args: Prisma.SelectSubset<T, VoiceSettingsCreateArgs<ExtArgs>>): Prisma.Prisma__VoiceSettingsClient<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many VoiceSettings.
     * @param {VoiceSettingsCreateManyArgs} args - Arguments to create many VoiceSettings.
     * @example
     * // Create many VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends VoiceSettingsCreateManyArgs>(args?: Prisma.SelectSubset<T, VoiceSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many VoiceSettings and returns the data saved in the database.
     * @param {VoiceSettingsCreateManyAndReturnArgs} args - Arguments to create many VoiceSettings.
     * @example
     * // Create many VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many VoiceSettings and only return the `guildId`
     * const voiceSettingsWithGuildIdOnly = await prisma.voiceSettings.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends VoiceSettingsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, VoiceSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a VoiceSettings.
     * @param {VoiceSettingsDeleteArgs} args - Arguments to delete one VoiceSettings.
     * @example
     * // Delete one VoiceSettings
     * const VoiceSettings = await prisma.voiceSettings.delete({
     *   where: {
     *     // ... filter to delete one VoiceSettings
     *   }
     * })
     *
     */
    delete<T extends VoiceSettingsDeleteArgs>(args: Prisma.SelectSubset<T, VoiceSettingsDeleteArgs<ExtArgs>>): Prisma.Prisma__VoiceSettingsClient<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one VoiceSettings.
     * @param {VoiceSettingsUpdateArgs} args - Arguments to update one VoiceSettings.
     * @example
     * // Update one VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends VoiceSettingsUpdateArgs>(args: Prisma.SelectSubset<T, VoiceSettingsUpdateArgs<ExtArgs>>): Prisma.Prisma__VoiceSettingsClient<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more VoiceSettings.
     * @param {VoiceSettingsDeleteManyArgs} args - Arguments to filter VoiceSettings to delete.
     * @example
     * // Delete a few VoiceSettings
     * const { count } = await prisma.voiceSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends VoiceSettingsDeleteManyArgs>(args?: Prisma.SelectSubset<T, VoiceSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VoiceSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoiceSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends VoiceSettingsUpdateManyArgs>(args: Prisma.SelectSubset<T, VoiceSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VoiceSettings and returns the data updated in the database.
     * @param {VoiceSettingsUpdateManyAndReturnArgs} args - Arguments to update many VoiceSettings.
     * @example
     * // Update many VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more VoiceSettings and only return the `guildId`
     * const voiceSettingsWithGuildIdOnly = await prisma.voiceSettings.updateManyAndReturn({
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
    updateManyAndReturn<T extends VoiceSettingsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, VoiceSettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one VoiceSettings.
     * @param {VoiceSettingsUpsertArgs} args - Arguments to update or create a VoiceSettings.
     * @example
     * // Update or create a VoiceSettings
     * const voiceSettings = await prisma.voiceSettings.upsert({
     *   create: {
     *     // ... data to create a VoiceSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VoiceSettings we want to update
     *   }
     * })
     */
    upsert<T extends VoiceSettingsUpsertArgs>(args: Prisma.SelectSubset<T, VoiceSettingsUpsertArgs<ExtArgs>>): Prisma.Prisma__VoiceSettingsClient<runtime.Types.Result.GetResult<Prisma.$VoiceSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of VoiceSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoiceSettingsCountArgs} args - Arguments to filter VoiceSettings to count.
     * @example
     * // Count the number of VoiceSettings
     * const count = await prisma.voiceSettings.count({
     *   where: {
     *     // ... the filter for the VoiceSettings we want to count
     *   }
     * })
    **/
    count<T extends VoiceSettingsCountArgs>(args?: Prisma.Subset<T, VoiceSettingsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], VoiceSettingsCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a VoiceSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoiceSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VoiceSettingsAggregateArgs>(args: Prisma.Subset<T, VoiceSettingsAggregateArgs>): Prisma.PrismaPromise<GetVoiceSettingsAggregateType<T>>;
    /**
     * Group by VoiceSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoiceSettingsGroupByArgs} args - Group by arguments.
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
    groupBy<T extends VoiceSettingsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: VoiceSettingsGroupByArgs['orderBy'];
    } : {
        orderBy?: VoiceSettingsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, VoiceSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVoiceSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the VoiceSettings model
     */
    readonly fields: VoiceSettingsFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for VoiceSettings.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__VoiceSettingsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the VoiceSettings model
 */
export interface VoiceSettingsFieldRefs {
    readonly guildId: Prisma.FieldRef<"VoiceSettings", 'String'>;
    readonly enabled: Prisma.FieldRef<"VoiceSettings", 'Boolean'>;
    readonly controlPanel: Prisma.FieldRef<"VoiceSettings", 'Boolean'>;
    readonly allowClaim: Prisma.FieldRef<"VoiceSettings", 'Boolean'>;
    readonly revision: Prisma.FieldRef<"VoiceSettings", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"VoiceSettings", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"VoiceSettings", 'DateTime'>;
}
/**
 * VoiceSettings findUnique
 */
export type VoiceSettingsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VoiceSettings to fetch.
     */
    where: Prisma.VoiceSettingsWhereUniqueInput;
};
/**
 * VoiceSettings findUniqueOrThrow
 */
export type VoiceSettingsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VoiceSettings to fetch.
     */
    where: Prisma.VoiceSettingsWhereUniqueInput;
};
/**
 * VoiceSettings findFirst
 */
export type VoiceSettingsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VoiceSettings to fetch.
     */
    where?: Prisma.VoiceSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VoiceSettings to fetch.
     */
    orderBy?: Prisma.VoiceSettingsOrderByWithRelationInput | Prisma.VoiceSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VoiceSettings.
     */
    cursor?: Prisma.VoiceSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VoiceSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VoiceSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VoiceSettings.
     */
    distinct?: Prisma.VoiceSettingsScalarFieldEnum | Prisma.VoiceSettingsScalarFieldEnum[];
};
/**
 * VoiceSettings findFirstOrThrow
 */
export type VoiceSettingsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VoiceSettings to fetch.
     */
    where?: Prisma.VoiceSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VoiceSettings to fetch.
     */
    orderBy?: Prisma.VoiceSettingsOrderByWithRelationInput | Prisma.VoiceSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VoiceSettings.
     */
    cursor?: Prisma.VoiceSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VoiceSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VoiceSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VoiceSettings.
     */
    distinct?: Prisma.VoiceSettingsScalarFieldEnum | Prisma.VoiceSettingsScalarFieldEnum[];
};
/**
 * VoiceSettings findMany
 */
export type VoiceSettingsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VoiceSettings to fetch.
     */
    where?: Prisma.VoiceSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VoiceSettings to fetch.
     */
    orderBy?: Prisma.VoiceSettingsOrderByWithRelationInput | Prisma.VoiceSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing VoiceSettings.
     */
    cursor?: Prisma.VoiceSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VoiceSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VoiceSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VoiceSettings.
     */
    distinct?: Prisma.VoiceSettingsScalarFieldEnum | Prisma.VoiceSettingsScalarFieldEnum[];
};
/**
 * VoiceSettings create
 */
export type VoiceSettingsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * The data needed to create a VoiceSettings.
     */
    data: Prisma.XOR<Prisma.VoiceSettingsCreateInput, Prisma.VoiceSettingsUncheckedCreateInput>;
};
/**
 * VoiceSettings createMany
 */
export type VoiceSettingsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many VoiceSettings.
     */
    data: Prisma.VoiceSettingsCreateManyInput | Prisma.VoiceSettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VoiceSettings createManyAndReturn
 */
export type VoiceSettingsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * The data used to create many VoiceSettings.
     */
    data: Prisma.VoiceSettingsCreateManyInput | Prisma.VoiceSettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VoiceSettings update
 */
export type VoiceSettingsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * The data needed to update a VoiceSettings.
     */
    data: Prisma.XOR<Prisma.VoiceSettingsUpdateInput, Prisma.VoiceSettingsUncheckedUpdateInput>;
    /**
     * Choose, which VoiceSettings to update.
     */
    where: Prisma.VoiceSettingsWhereUniqueInput;
};
/**
 * VoiceSettings updateMany
 */
export type VoiceSettingsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update VoiceSettings.
     */
    data: Prisma.XOR<Prisma.VoiceSettingsUpdateManyMutationInput, Prisma.VoiceSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which VoiceSettings to update
     */
    where?: Prisma.VoiceSettingsWhereInput;
    /**
     * Limit how many VoiceSettings to update.
     */
    limit?: number;
};
/**
 * VoiceSettings updateManyAndReturn
 */
export type VoiceSettingsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * The data used to update VoiceSettings.
     */
    data: Prisma.XOR<Prisma.VoiceSettingsUpdateManyMutationInput, Prisma.VoiceSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which VoiceSettings to update
     */
    where?: Prisma.VoiceSettingsWhereInput;
    /**
     * Limit how many VoiceSettings to update.
     */
    limit?: number;
};
/**
 * VoiceSettings upsert
 */
export type VoiceSettingsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * The filter to search for the VoiceSettings to update in case it exists.
     */
    where: Prisma.VoiceSettingsWhereUniqueInput;
    /**
     * In case the VoiceSettings found by the `where` argument doesn't exist, create a new VoiceSettings with this data.
     */
    create: Prisma.XOR<Prisma.VoiceSettingsCreateInput, Prisma.VoiceSettingsUncheckedCreateInput>;
    /**
     * In case the VoiceSettings was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.VoiceSettingsUpdateInput, Prisma.VoiceSettingsUncheckedUpdateInput>;
};
/**
 * VoiceSettings delete
 */
export type VoiceSettingsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
    /**
     * Filter which VoiceSettings to delete.
     */
    where: Prisma.VoiceSettingsWhereUniqueInput;
};
/**
 * VoiceSettings deleteMany
 */
export type VoiceSettingsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VoiceSettings to delete
     */
    where?: Prisma.VoiceSettingsWhereInput;
    /**
     * Limit how many VoiceSettings to delete.
     */
    limit?: number;
};
/**
 * VoiceSettings without action
 */
export type VoiceSettingsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoiceSettings
     */
    select?: Prisma.VoiceSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VoiceSettings
     */
    omit?: Prisma.VoiceSettingsOmit<ExtArgs> | null;
};
//# sourceMappingURL=VoiceSettings.d.ts.map
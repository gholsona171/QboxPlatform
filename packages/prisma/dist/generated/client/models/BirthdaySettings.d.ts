import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model BirthdaySettings
 *
 */
export type BirthdaySettingsModel = runtime.Types.Result.DefaultSelection<Prisma.$BirthdaySettingsPayload>;
export type AggregateBirthdaySettings = {
    _count: BirthdaySettingsCountAggregateOutputType | null;
    _avg: BirthdaySettingsAvgAggregateOutputType | null;
    _sum: BirthdaySettingsSumAggregateOutputType | null;
    _min: BirthdaySettingsMinAggregateOutputType | null;
    _max: BirthdaySettingsMaxAggregateOutputType | null;
};
export type BirthdaySettingsAvgAggregateOutputType = {
    announceHour: number | null;
    revision: number | null;
};
export type BirthdaySettingsSumAggregateOutputType = {
    announceHour: number | null;
    revision: number | null;
};
export type BirthdaySettingsMinAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    channelId: string | null;
    message: string | null;
    embedColor: string | null;
    roleId: string | null;
    announceHour: number | null;
    pingRoleId: string | null;
    allowYear: boolean | null;
    requireConfirmation: boolean | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type BirthdaySettingsMaxAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    channelId: string | null;
    message: string | null;
    embedColor: string | null;
    roleId: string | null;
    announceHour: number | null;
    pingRoleId: string | null;
    allowYear: boolean | null;
    requireConfirmation: boolean | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type BirthdaySettingsCountAggregateOutputType = {
    guildId: number;
    enabled: number;
    channelId: number;
    message: number;
    embedColor: number;
    roleId: number;
    announceHour: number;
    pingRoleId: number;
    allowYear: number;
    requireConfirmation: number;
    revision: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type BirthdaySettingsAvgAggregateInputType = {
    announceHour?: true;
    revision?: true;
};
export type BirthdaySettingsSumAggregateInputType = {
    announceHour?: true;
    revision?: true;
};
export type BirthdaySettingsMinAggregateInputType = {
    guildId?: true;
    enabled?: true;
    channelId?: true;
    message?: true;
    embedColor?: true;
    roleId?: true;
    announceHour?: true;
    pingRoleId?: true;
    allowYear?: true;
    requireConfirmation?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type BirthdaySettingsMaxAggregateInputType = {
    guildId?: true;
    enabled?: true;
    channelId?: true;
    message?: true;
    embedColor?: true;
    roleId?: true;
    announceHour?: true;
    pingRoleId?: true;
    allowYear?: true;
    requireConfirmation?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type BirthdaySettingsCountAggregateInputType = {
    guildId?: true;
    enabled?: true;
    channelId?: true;
    message?: true;
    embedColor?: true;
    roleId?: true;
    announceHour?: true;
    pingRoleId?: true;
    allowYear?: true;
    requireConfirmation?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type BirthdaySettingsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which BirthdaySettings to aggregate.
     */
    where?: Prisma.BirthdaySettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BirthdaySettings to fetch.
     */
    orderBy?: Prisma.BirthdaySettingsOrderByWithRelationInput | Prisma.BirthdaySettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.BirthdaySettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BirthdaySettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BirthdaySettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned BirthdaySettings
    **/
    _count?: true | BirthdaySettingsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: BirthdaySettingsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: BirthdaySettingsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: BirthdaySettingsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: BirthdaySettingsMaxAggregateInputType;
};
export type GetBirthdaySettingsAggregateType<T extends BirthdaySettingsAggregateArgs> = {
    [P in keyof T & keyof AggregateBirthdaySettings]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateBirthdaySettings[P]> : Prisma.GetScalarType<T[P], AggregateBirthdaySettings[P]>;
};
export type BirthdaySettingsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.BirthdaySettingsWhereInput;
    orderBy?: Prisma.BirthdaySettingsOrderByWithAggregationInput | Prisma.BirthdaySettingsOrderByWithAggregationInput[];
    by: Prisma.BirthdaySettingsScalarFieldEnum[] | Prisma.BirthdaySettingsScalarFieldEnum;
    having?: Prisma.BirthdaySettingsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: BirthdaySettingsCountAggregateInputType | true;
    _avg?: BirthdaySettingsAvgAggregateInputType;
    _sum?: BirthdaySettingsSumAggregateInputType;
    _min?: BirthdaySettingsMinAggregateInputType;
    _max?: BirthdaySettingsMaxAggregateInputType;
};
export type BirthdaySettingsGroupByOutputType = {
    guildId: string;
    enabled: boolean;
    channelId: string | null;
    message: string;
    embedColor: string;
    roleId: string | null;
    announceHour: number;
    pingRoleId: string | null;
    allowYear: boolean;
    requireConfirmation: boolean;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
    _count: BirthdaySettingsCountAggregateOutputType | null;
    _avg: BirthdaySettingsAvgAggregateOutputType | null;
    _sum: BirthdaySettingsSumAggregateOutputType | null;
    _min: BirthdaySettingsMinAggregateOutputType | null;
    _max: BirthdaySettingsMaxAggregateOutputType | null;
};
export type GetBirthdaySettingsGroupByPayload<T extends BirthdaySettingsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<BirthdaySettingsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof BirthdaySettingsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], BirthdaySettingsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], BirthdaySettingsGroupByOutputType[P]>;
}>>;
export type BirthdaySettingsWhereInput = {
    AND?: Prisma.BirthdaySettingsWhereInput | Prisma.BirthdaySettingsWhereInput[];
    OR?: Prisma.BirthdaySettingsWhereInput[];
    NOT?: Prisma.BirthdaySettingsWhereInput | Prisma.BirthdaySettingsWhereInput[];
    guildId?: Prisma.StringFilter<"BirthdaySettings"> | string;
    enabled?: Prisma.BoolFilter<"BirthdaySettings"> | boolean;
    channelId?: Prisma.StringNullableFilter<"BirthdaySettings"> | string | null;
    message?: Prisma.StringFilter<"BirthdaySettings"> | string;
    embedColor?: Prisma.StringFilter<"BirthdaySettings"> | string;
    roleId?: Prisma.StringNullableFilter<"BirthdaySettings"> | string | null;
    announceHour?: Prisma.IntFilter<"BirthdaySettings"> | number;
    pingRoleId?: Prisma.StringNullableFilter<"BirthdaySettings"> | string | null;
    allowYear?: Prisma.BoolFilter<"BirthdaySettings"> | boolean;
    requireConfirmation?: Prisma.BoolFilter<"BirthdaySettings"> | boolean;
    revision?: Prisma.IntFilter<"BirthdaySettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"BirthdaySettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BirthdaySettings"> | Date | string;
};
export type BirthdaySettingsOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    message?: Prisma.SortOrder;
    embedColor?: Prisma.SortOrder;
    roleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    announceHour?: Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    allowYear?: Prisma.SortOrder;
    requireConfirmation?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BirthdaySettingsWhereUniqueInput = Prisma.AtLeast<{
    guildId?: string;
    AND?: Prisma.BirthdaySettingsWhereInput | Prisma.BirthdaySettingsWhereInput[];
    OR?: Prisma.BirthdaySettingsWhereInput[];
    NOT?: Prisma.BirthdaySettingsWhereInput | Prisma.BirthdaySettingsWhereInput[];
    enabled?: Prisma.BoolFilter<"BirthdaySettings"> | boolean;
    channelId?: Prisma.StringNullableFilter<"BirthdaySettings"> | string | null;
    message?: Prisma.StringFilter<"BirthdaySettings"> | string;
    embedColor?: Prisma.StringFilter<"BirthdaySettings"> | string;
    roleId?: Prisma.StringNullableFilter<"BirthdaySettings"> | string | null;
    announceHour?: Prisma.IntFilter<"BirthdaySettings"> | number;
    pingRoleId?: Prisma.StringNullableFilter<"BirthdaySettings"> | string | null;
    allowYear?: Prisma.BoolFilter<"BirthdaySettings"> | boolean;
    requireConfirmation?: Prisma.BoolFilter<"BirthdaySettings"> | boolean;
    revision?: Prisma.IntFilter<"BirthdaySettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"BirthdaySettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"BirthdaySettings"> | Date | string;
}, "guildId">;
export type BirthdaySettingsOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    message?: Prisma.SortOrder;
    embedColor?: Prisma.SortOrder;
    roleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    announceHour?: Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    allowYear?: Prisma.SortOrder;
    requireConfirmation?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.BirthdaySettingsCountOrderByAggregateInput;
    _avg?: Prisma.BirthdaySettingsAvgOrderByAggregateInput;
    _max?: Prisma.BirthdaySettingsMaxOrderByAggregateInput;
    _min?: Prisma.BirthdaySettingsMinOrderByAggregateInput;
    _sum?: Prisma.BirthdaySettingsSumOrderByAggregateInput;
};
export type BirthdaySettingsScalarWhereWithAggregatesInput = {
    AND?: Prisma.BirthdaySettingsScalarWhereWithAggregatesInput | Prisma.BirthdaySettingsScalarWhereWithAggregatesInput[];
    OR?: Prisma.BirthdaySettingsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.BirthdaySettingsScalarWhereWithAggregatesInput | Prisma.BirthdaySettingsScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"BirthdaySettings"> | string;
    enabled?: Prisma.BoolWithAggregatesFilter<"BirthdaySettings"> | boolean;
    channelId?: Prisma.StringNullableWithAggregatesFilter<"BirthdaySettings"> | string | null;
    message?: Prisma.StringWithAggregatesFilter<"BirthdaySettings"> | string;
    embedColor?: Prisma.StringWithAggregatesFilter<"BirthdaySettings"> | string;
    roleId?: Prisma.StringNullableWithAggregatesFilter<"BirthdaySettings"> | string | null;
    announceHour?: Prisma.IntWithAggregatesFilter<"BirthdaySettings"> | number;
    pingRoleId?: Prisma.StringNullableWithAggregatesFilter<"BirthdaySettings"> | string | null;
    allowYear?: Prisma.BoolWithAggregatesFilter<"BirthdaySettings"> | boolean;
    requireConfirmation?: Prisma.BoolWithAggregatesFilter<"BirthdaySettings"> | boolean;
    revision?: Prisma.IntWithAggregatesFilter<"BirthdaySettings"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"BirthdaySettings"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"BirthdaySettings"> | Date | string;
};
export type BirthdaySettingsCreateInput = {
    guildId: string;
    enabled?: boolean;
    channelId?: string | null;
    message: string;
    embedColor?: string;
    roleId?: string | null;
    announceHour?: number;
    pingRoleId?: string | null;
    allowYear?: boolean;
    requireConfirmation?: boolean;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BirthdaySettingsUncheckedCreateInput = {
    guildId: string;
    enabled?: boolean;
    channelId?: string | null;
    message: string;
    embedColor?: string;
    roleId?: string | null;
    announceHour?: number;
    pingRoleId?: string | null;
    allowYear?: boolean;
    requireConfirmation?: boolean;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BirthdaySettingsUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
    embedColor?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    announceHour?: Prisma.IntFieldUpdateOperationsInput | number;
    pingRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    allowYear?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requireConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BirthdaySettingsUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
    embedColor?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    announceHour?: Prisma.IntFieldUpdateOperationsInput | number;
    pingRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    allowYear?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requireConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BirthdaySettingsCreateManyInput = {
    guildId: string;
    enabled?: boolean;
    channelId?: string | null;
    message: string;
    embedColor?: string;
    roleId?: string | null;
    announceHour?: number;
    pingRoleId?: string | null;
    allowYear?: boolean;
    requireConfirmation?: boolean;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type BirthdaySettingsUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
    embedColor?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    announceHour?: Prisma.IntFieldUpdateOperationsInput | number;
    pingRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    allowYear?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requireConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BirthdaySettingsUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    channelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    message?: Prisma.StringFieldUpdateOperationsInput | string;
    embedColor?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    announceHour?: Prisma.IntFieldUpdateOperationsInput | number;
    pingRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    allowYear?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    requireConfirmation?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type BirthdaySettingsCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    message?: Prisma.SortOrder;
    embedColor?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    announceHour?: Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrder;
    allowYear?: Prisma.SortOrder;
    requireConfirmation?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BirthdaySettingsAvgOrderByAggregateInput = {
    announceHour?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
};
export type BirthdaySettingsMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    message?: Prisma.SortOrder;
    embedColor?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    announceHour?: Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrder;
    allowYear?: Prisma.SortOrder;
    requireConfirmation?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BirthdaySettingsMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    message?: Prisma.SortOrder;
    embedColor?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    announceHour?: Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrder;
    allowYear?: Prisma.SortOrder;
    requireConfirmation?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type BirthdaySettingsSumOrderByAggregateInput = {
    announceHour?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
};
export type BirthdaySettingsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    channelId?: boolean;
    message?: boolean;
    embedColor?: boolean;
    roleId?: boolean;
    announceHour?: boolean;
    pingRoleId?: boolean;
    allowYear?: boolean;
    requireConfirmation?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["birthdaySettings"]>;
export type BirthdaySettingsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    channelId?: boolean;
    message?: boolean;
    embedColor?: boolean;
    roleId?: boolean;
    announceHour?: boolean;
    pingRoleId?: boolean;
    allowYear?: boolean;
    requireConfirmation?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["birthdaySettings"]>;
export type BirthdaySettingsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    channelId?: boolean;
    message?: boolean;
    embedColor?: boolean;
    roleId?: boolean;
    announceHour?: boolean;
    pingRoleId?: boolean;
    allowYear?: boolean;
    requireConfirmation?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["birthdaySettings"]>;
export type BirthdaySettingsSelectScalar = {
    guildId?: boolean;
    enabled?: boolean;
    channelId?: boolean;
    message?: boolean;
    embedColor?: boolean;
    roleId?: boolean;
    announceHour?: boolean;
    pingRoleId?: boolean;
    allowYear?: boolean;
    requireConfirmation?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type BirthdaySettingsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "enabled" | "channelId" | "message" | "embedColor" | "roleId" | "announceHour" | "pingRoleId" | "allowYear" | "requireConfirmation" | "revision" | "createdAt" | "updatedAt", ExtArgs["result"]["birthdaySettings"]>;
export type $BirthdaySettingsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "BirthdaySettings";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        enabled: boolean;
        channelId: string | null;
        message: string;
        embedColor: string;
        roleId: string | null;
        announceHour: number;
        pingRoleId: string | null;
        allowYear: boolean;
        requireConfirmation: boolean;
        revision: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["birthdaySettings"]>;
    composites: {};
};
export type BirthdaySettingsGetPayload<S extends boolean | null | undefined | BirthdaySettingsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload, S>;
export type BirthdaySettingsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<BirthdaySettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: BirthdaySettingsCountAggregateInputType | true;
};
export interface BirthdaySettingsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['BirthdaySettings'];
        meta: {
            name: 'BirthdaySettings';
        };
    };
    /**
     * Find zero or one BirthdaySettings that matches the filter.
     * @param {BirthdaySettingsFindUniqueArgs} args - Arguments to find a BirthdaySettings
     * @example
     * // Get one BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BirthdaySettingsFindUniqueArgs>(args: Prisma.SelectSubset<T, BirthdaySettingsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__BirthdaySettingsClient<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one BirthdaySettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BirthdaySettingsFindUniqueOrThrowArgs} args - Arguments to find a BirthdaySettings
     * @example
     * // Get one BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BirthdaySettingsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, BirthdaySettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__BirthdaySettingsClient<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first BirthdaySettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BirthdaySettingsFindFirstArgs} args - Arguments to find a BirthdaySettings
     * @example
     * // Get one BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BirthdaySettingsFindFirstArgs>(args?: Prisma.SelectSubset<T, BirthdaySettingsFindFirstArgs<ExtArgs>>): Prisma.Prisma__BirthdaySettingsClient<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first BirthdaySettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BirthdaySettingsFindFirstOrThrowArgs} args - Arguments to find a BirthdaySettings
     * @example
     * // Get one BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BirthdaySettingsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, BirthdaySettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__BirthdaySettingsClient<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more BirthdaySettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BirthdaySettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.findMany()
     *
     * // Get first 10 BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const birthdaySettingsWithGuildIdOnly = await prisma.birthdaySettings.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends BirthdaySettingsFindManyArgs>(args?: Prisma.SelectSubset<T, BirthdaySettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a BirthdaySettings.
     * @param {BirthdaySettingsCreateArgs} args - Arguments to create a BirthdaySettings.
     * @example
     * // Create one BirthdaySettings
     * const BirthdaySettings = await prisma.birthdaySettings.create({
     *   data: {
     *     // ... data to create a BirthdaySettings
     *   }
     * })
     *
     */
    create<T extends BirthdaySettingsCreateArgs>(args: Prisma.SelectSubset<T, BirthdaySettingsCreateArgs<ExtArgs>>): Prisma.Prisma__BirthdaySettingsClient<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many BirthdaySettings.
     * @param {BirthdaySettingsCreateManyArgs} args - Arguments to create many BirthdaySettings.
     * @example
     * // Create many BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends BirthdaySettingsCreateManyArgs>(args?: Prisma.SelectSubset<T, BirthdaySettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many BirthdaySettings and returns the data saved in the database.
     * @param {BirthdaySettingsCreateManyAndReturnArgs} args - Arguments to create many BirthdaySettings.
     * @example
     * // Create many BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many BirthdaySettings and only return the `guildId`
     * const birthdaySettingsWithGuildIdOnly = await prisma.birthdaySettings.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends BirthdaySettingsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, BirthdaySettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a BirthdaySettings.
     * @param {BirthdaySettingsDeleteArgs} args - Arguments to delete one BirthdaySettings.
     * @example
     * // Delete one BirthdaySettings
     * const BirthdaySettings = await prisma.birthdaySettings.delete({
     *   where: {
     *     // ... filter to delete one BirthdaySettings
     *   }
     * })
     *
     */
    delete<T extends BirthdaySettingsDeleteArgs>(args: Prisma.SelectSubset<T, BirthdaySettingsDeleteArgs<ExtArgs>>): Prisma.Prisma__BirthdaySettingsClient<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one BirthdaySettings.
     * @param {BirthdaySettingsUpdateArgs} args - Arguments to update one BirthdaySettings.
     * @example
     * // Update one BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends BirthdaySettingsUpdateArgs>(args: Prisma.SelectSubset<T, BirthdaySettingsUpdateArgs<ExtArgs>>): Prisma.Prisma__BirthdaySettingsClient<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more BirthdaySettings.
     * @param {BirthdaySettingsDeleteManyArgs} args - Arguments to filter BirthdaySettings to delete.
     * @example
     * // Delete a few BirthdaySettings
     * const { count } = await prisma.birthdaySettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends BirthdaySettingsDeleteManyArgs>(args?: Prisma.SelectSubset<T, BirthdaySettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more BirthdaySettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BirthdaySettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends BirthdaySettingsUpdateManyArgs>(args: Prisma.SelectSubset<T, BirthdaySettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more BirthdaySettings and returns the data updated in the database.
     * @param {BirthdaySettingsUpdateManyAndReturnArgs} args - Arguments to update many BirthdaySettings.
     * @example
     * // Update many BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more BirthdaySettings and only return the `guildId`
     * const birthdaySettingsWithGuildIdOnly = await prisma.birthdaySettings.updateManyAndReturn({
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
    updateManyAndReturn<T extends BirthdaySettingsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, BirthdaySettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one BirthdaySettings.
     * @param {BirthdaySettingsUpsertArgs} args - Arguments to update or create a BirthdaySettings.
     * @example
     * // Update or create a BirthdaySettings
     * const birthdaySettings = await prisma.birthdaySettings.upsert({
     *   create: {
     *     // ... data to create a BirthdaySettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BirthdaySettings we want to update
     *   }
     * })
     */
    upsert<T extends BirthdaySettingsUpsertArgs>(args: Prisma.SelectSubset<T, BirthdaySettingsUpsertArgs<ExtArgs>>): Prisma.Prisma__BirthdaySettingsClient<runtime.Types.Result.GetResult<Prisma.$BirthdaySettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of BirthdaySettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BirthdaySettingsCountArgs} args - Arguments to filter BirthdaySettings to count.
     * @example
     * // Count the number of BirthdaySettings
     * const count = await prisma.birthdaySettings.count({
     *   where: {
     *     // ... the filter for the BirthdaySettings we want to count
     *   }
     * })
    **/
    count<T extends BirthdaySettingsCountArgs>(args?: Prisma.Subset<T, BirthdaySettingsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], BirthdaySettingsCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a BirthdaySettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BirthdaySettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends BirthdaySettingsAggregateArgs>(args: Prisma.Subset<T, BirthdaySettingsAggregateArgs>): Prisma.PrismaPromise<GetBirthdaySettingsAggregateType<T>>;
    /**
     * Group by BirthdaySettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BirthdaySettingsGroupByArgs} args - Group by arguments.
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
    groupBy<T extends BirthdaySettingsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: BirthdaySettingsGroupByArgs['orderBy'];
    } : {
        orderBy?: BirthdaySettingsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, BirthdaySettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBirthdaySettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the BirthdaySettings model
     */
    readonly fields: BirthdaySettingsFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for BirthdaySettings.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__BirthdaySettingsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the BirthdaySettings model
 */
export interface BirthdaySettingsFieldRefs {
    readonly guildId: Prisma.FieldRef<"BirthdaySettings", 'String'>;
    readonly enabled: Prisma.FieldRef<"BirthdaySettings", 'Boolean'>;
    readonly channelId: Prisma.FieldRef<"BirthdaySettings", 'String'>;
    readonly message: Prisma.FieldRef<"BirthdaySettings", 'String'>;
    readonly embedColor: Prisma.FieldRef<"BirthdaySettings", 'String'>;
    readonly roleId: Prisma.FieldRef<"BirthdaySettings", 'String'>;
    readonly announceHour: Prisma.FieldRef<"BirthdaySettings", 'Int'>;
    readonly pingRoleId: Prisma.FieldRef<"BirthdaySettings", 'String'>;
    readonly allowYear: Prisma.FieldRef<"BirthdaySettings", 'Boolean'>;
    readonly requireConfirmation: Prisma.FieldRef<"BirthdaySettings", 'Boolean'>;
    readonly revision: Prisma.FieldRef<"BirthdaySettings", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"BirthdaySettings", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"BirthdaySettings", 'DateTime'>;
}
/**
 * BirthdaySettings findUnique
 */
export type BirthdaySettingsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * Filter, which BirthdaySettings to fetch.
     */
    where: Prisma.BirthdaySettingsWhereUniqueInput;
};
/**
 * BirthdaySettings findUniqueOrThrow
 */
export type BirthdaySettingsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * Filter, which BirthdaySettings to fetch.
     */
    where: Prisma.BirthdaySettingsWhereUniqueInput;
};
/**
 * BirthdaySettings findFirst
 */
export type BirthdaySettingsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * Filter, which BirthdaySettings to fetch.
     */
    where?: Prisma.BirthdaySettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BirthdaySettings to fetch.
     */
    orderBy?: Prisma.BirthdaySettingsOrderByWithRelationInput | Prisma.BirthdaySettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for BirthdaySettings.
     */
    cursor?: Prisma.BirthdaySettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BirthdaySettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BirthdaySettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BirthdaySettings.
     */
    distinct?: Prisma.BirthdaySettingsScalarFieldEnum | Prisma.BirthdaySettingsScalarFieldEnum[];
};
/**
 * BirthdaySettings findFirstOrThrow
 */
export type BirthdaySettingsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * Filter, which BirthdaySettings to fetch.
     */
    where?: Prisma.BirthdaySettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BirthdaySettings to fetch.
     */
    orderBy?: Prisma.BirthdaySettingsOrderByWithRelationInput | Prisma.BirthdaySettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for BirthdaySettings.
     */
    cursor?: Prisma.BirthdaySettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BirthdaySettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BirthdaySettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BirthdaySettings.
     */
    distinct?: Prisma.BirthdaySettingsScalarFieldEnum | Prisma.BirthdaySettingsScalarFieldEnum[];
};
/**
 * BirthdaySettings findMany
 */
export type BirthdaySettingsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * Filter, which BirthdaySettings to fetch.
     */
    where?: Prisma.BirthdaySettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of BirthdaySettings to fetch.
     */
    orderBy?: Prisma.BirthdaySettingsOrderByWithRelationInput | Prisma.BirthdaySettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing BirthdaySettings.
     */
    cursor?: Prisma.BirthdaySettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` BirthdaySettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` BirthdaySettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of BirthdaySettings.
     */
    distinct?: Prisma.BirthdaySettingsScalarFieldEnum | Prisma.BirthdaySettingsScalarFieldEnum[];
};
/**
 * BirthdaySettings create
 */
export type BirthdaySettingsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * The data needed to create a BirthdaySettings.
     */
    data: Prisma.XOR<Prisma.BirthdaySettingsCreateInput, Prisma.BirthdaySettingsUncheckedCreateInput>;
};
/**
 * BirthdaySettings createMany
 */
export type BirthdaySettingsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many BirthdaySettings.
     */
    data: Prisma.BirthdaySettingsCreateManyInput | Prisma.BirthdaySettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * BirthdaySettings createManyAndReturn
 */
export type BirthdaySettingsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * The data used to create many BirthdaySettings.
     */
    data: Prisma.BirthdaySettingsCreateManyInput | Prisma.BirthdaySettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * BirthdaySettings update
 */
export type BirthdaySettingsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * The data needed to update a BirthdaySettings.
     */
    data: Prisma.XOR<Prisma.BirthdaySettingsUpdateInput, Prisma.BirthdaySettingsUncheckedUpdateInput>;
    /**
     * Choose, which BirthdaySettings to update.
     */
    where: Prisma.BirthdaySettingsWhereUniqueInput;
};
/**
 * BirthdaySettings updateMany
 */
export type BirthdaySettingsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update BirthdaySettings.
     */
    data: Prisma.XOR<Prisma.BirthdaySettingsUpdateManyMutationInput, Prisma.BirthdaySettingsUncheckedUpdateManyInput>;
    /**
     * Filter which BirthdaySettings to update
     */
    where?: Prisma.BirthdaySettingsWhereInput;
    /**
     * Limit how many BirthdaySettings to update.
     */
    limit?: number;
};
/**
 * BirthdaySettings updateManyAndReturn
 */
export type BirthdaySettingsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * The data used to update BirthdaySettings.
     */
    data: Prisma.XOR<Prisma.BirthdaySettingsUpdateManyMutationInput, Prisma.BirthdaySettingsUncheckedUpdateManyInput>;
    /**
     * Filter which BirthdaySettings to update
     */
    where?: Prisma.BirthdaySettingsWhereInput;
    /**
     * Limit how many BirthdaySettings to update.
     */
    limit?: number;
};
/**
 * BirthdaySettings upsert
 */
export type BirthdaySettingsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * The filter to search for the BirthdaySettings to update in case it exists.
     */
    where: Prisma.BirthdaySettingsWhereUniqueInput;
    /**
     * In case the BirthdaySettings found by the `where` argument doesn't exist, create a new BirthdaySettings with this data.
     */
    create: Prisma.XOR<Prisma.BirthdaySettingsCreateInput, Prisma.BirthdaySettingsUncheckedCreateInput>;
    /**
     * In case the BirthdaySettings was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.BirthdaySettingsUpdateInput, Prisma.BirthdaySettingsUncheckedUpdateInput>;
};
/**
 * BirthdaySettings delete
 */
export type BirthdaySettingsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
    /**
     * Filter which BirthdaySettings to delete.
     */
    where: Prisma.BirthdaySettingsWhereUniqueInput;
};
/**
 * BirthdaySettings deleteMany
 */
export type BirthdaySettingsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which BirthdaySettings to delete
     */
    where?: Prisma.BirthdaySettingsWhereInput;
    /**
     * Limit how many BirthdaySettings to delete.
     */
    limit?: number;
};
/**
 * BirthdaySettings without action
 */
export type BirthdaySettingsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BirthdaySettings
     */
    select?: Prisma.BirthdaySettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the BirthdaySettings
     */
    omit?: Prisma.BirthdaySettingsOmit<ExtArgs> | null;
};
//# sourceMappingURL=BirthdaySettings.d.ts.map
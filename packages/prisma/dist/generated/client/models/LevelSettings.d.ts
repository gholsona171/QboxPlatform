import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model LevelSettings
 *
 */
export type LevelSettingsModel = runtime.Types.Result.DefaultSelection<Prisma.$LevelSettingsPayload>;
export type AggregateLevelSettings = {
    _count: LevelSettingsCountAggregateOutputType | null;
    _avg: LevelSettingsAvgAggregateOutputType | null;
    _sum: LevelSettingsSumAggregateOutputType | null;
    _min: LevelSettingsMinAggregateOutputType | null;
    _max: LevelSettingsMaxAggregateOutputType | null;
};
export type LevelSettingsAvgAggregateOutputType = {
    messageXpMin: number | null;
    messageXpMax: number | null;
    cooldownSeconds: number | null;
    voiceXpPerMinute: number | null;
    curveBase: number | null;
    curveExponent: number | null;
    curveLinear: number | null;
    maxLevel: number | null;
    revision: number | null;
};
export type LevelSettingsSumAggregateOutputType = {
    messageXpMin: number | null;
    messageXpMax: number | null;
    cooldownSeconds: number | null;
    voiceXpPerMinute: number | null;
    curveBase: number | null;
    curveExponent: number | null;
    curveLinear: number | null;
    maxLevel: number | null;
    revision: number | null;
};
export type LevelSettingsMinAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    messageXpMin: number | null;
    messageXpMax: number | null;
    cooldownSeconds: number | null;
    voiceXpPerMinute: number | null;
    curveBase: number | null;
    curveExponent: number | null;
    curveLinear: number | null;
    levelUpMode: $Enums.LevelUpMode | null;
    levelUpChannelId: string | null;
    levelUpMessage: string | null;
    rewardMode: $Enums.LevelRewardMode | null;
    removeRewardsOnReset: boolean | null;
    maxLevel: number | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type LevelSettingsMaxAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    messageXpMin: number | null;
    messageXpMax: number | null;
    cooldownSeconds: number | null;
    voiceXpPerMinute: number | null;
    curveBase: number | null;
    curveExponent: number | null;
    curveLinear: number | null;
    levelUpMode: $Enums.LevelUpMode | null;
    levelUpChannelId: string | null;
    levelUpMessage: string | null;
    rewardMode: $Enums.LevelRewardMode | null;
    removeRewardsOnReset: boolean | null;
    maxLevel: number | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type LevelSettingsCountAggregateOutputType = {
    guildId: number;
    enabled: number;
    messageXpMin: number;
    messageXpMax: number;
    cooldownSeconds: number;
    voiceXpPerMinute: number;
    curveBase: number;
    curveExponent: number;
    curveLinear: number;
    roleMultipliers: number;
    channelMultipliers: number;
    noXpRoleIds: number;
    noXpChannelIds: number;
    levelUpMode: number;
    levelUpChannelId: number;
    levelUpMessage: number;
    rewards: number;
    rewardMode: number;
    removeRewardsOnReset: number;
    maxLevel: number;
    revision: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type LevelSettingsAvgAggregateInputType = {
    messageXpMin?: true;
    messageXpMax?: true;
    cooldownSeconds?: true;
    voiceXpPerMinute?: true;
    curveBase?: true;
    curveExponent?: true;
    curveLinear?: true;
    maxLevel?: true;
    revision?: true;
};
export type LevelSettingsSumAggregateInputType = {
    messageXpMin?: true;
    messageXpMax?: true;
    cooldownSeconds?: true;
    voiceXpPerMinute?: true;
    curveBase?: true;
    curveExponent?: true;
    curveLinear?: true;
    maxLevel?: true;
    revision?: true;
};
export type LevelSettingsMinAggregateInputType = {
    guildId?: true;
    enabled?: true;
    messageXpMin?: true;
    messageXpMax?: true;
    cooldownSeconds?: true;
    voiceXpPerMinute?: true;
    curveBase?: true;
    curveExponent?: true;
    curveLinear?: true;
    levelUpMode?: true;
    levelUpChannelId?: true;
    levelUpMessage?: true;
    rewardMode?: true;
    removeRewardsOnReset?: true;
    maxLevel?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type LevelSettingsMaxAggregateInputType = {
    guildId?: true;
    enabled?: true;
    messageXpMin?: true;
    messageXpMax?: true;
    cooldownSeconds?: true;
    voiceXpPerMinute?: true;
    curveBase?: true;
    curveExponent?: true;
    curveLinear?: true;
    levelUpMode?: true;
    levelUpChannelId?: true;
    levelUpMessage?: true;
    rewardMode?: true;
    removeRewardsOnReset?: true;
    maxLevel?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type LevelSettingsCountAggregateInputType = {
    guildId?: true;
    enabled?: true;
    messageXpMin?: true;
    messageXpMax?: true;
    cooldownSeconds?: true;
    voiceXpPerMinute?: true;
    curveBase?: true;
    curveExponent?: true;
    curveLinear?: true;
    roleMultipliers?: true;
    channelMultipliers?: true;
    noXpRoleIds?: true;
    noXpChannelIds?: true;
    levelUpMode?: true;
    levelUpChannelId?: true;
    levelUpMessage?: true;
    rewards?: true;
    rewardMode?: true;
    removeRewardsOnReset?: true;
    maxLevel?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type LevelSettingsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which LevelSettings to aggregate.
     */
    where?: Prisma.LevelSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of LevelSettings to fetch.
     */
    orderBy?: Prisma.LevelSettingsOrderByWithRelationInput | Prisma.LevelSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.LevelSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` LevelSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` LevelSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned LevelSettings
    **/
    _count?: true | LevelSettingsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: LevelSettingsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: LevelSettingsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: LevelSettingsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: LevelSettingsMaxAggregateInputType;
};
export type GetLevelSettingsAggregateType<T extends LevelSettingsAggregateArgs> = {
    [P in keyof T & keyof AggregateLevelSettings]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateLevelSettings[P]> : Prisma.GetScalarType<T[P], AggregateLevelSettings[P]>;
};
export type LevelSettingsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LevelSettingsWhereInput;
    orderBy?: Prisma.LevelSettingsOrderByWithAggregationInput | Prisma.LevelSettingsOrderByWithAggregationInput[];
    by: Prisma.LevelSettingsScalarFieldEnum[] | Prisma.LevelSettingsScalarFieldEnum;
    having?: Prisma.LevelSettingsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: LevelSettingsCountAggregateInputType | true;
    _avg?: LevelSettingsAvgAggregateInputType;
    _sum?: LevelSettingsSumAggregateInputType;
    _min?: LevelSettingsMinAggregateInputType;
    _max?: LevelSettingsMaxAggregateInputType;
};
export type LevelSettingsGroupByOutputType = {
    guildId: string;
    enabled: boolean;
    messageXpMin: number;
    messageXpMax: number;
    cooldownSeconds: number;
    voiceXpPerMinute: number;
    curveBase: number;
    curveExponent: number;
    curveLinear: number;
    roleMultipliers: runtime.JsonValue;
    channelMultipliers: runtime.JsonValue;
    noXpRoleIds: string[];
    noXpChannelIds: string[];
    levelUpMode: $Enums.LevelUpMode;
    levelUpChannelId: string | null;
    levelUpMessage: string;
    rewards: runtime.JsonValue;
    rewardMode: $Enums.LevelRewardMode;
    removeRewardsOnReset: boolean;
    maxLevel: number;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
    _count: LevelSettingsCountAggregateOutputType | null;
    _avg: LevelSettingsAvgAggregateOutputType | null;
    _sum: LevelSettingsSumAggregateOutputType | null;
    _min: LevelSettingsMinAggregateOutputType | null;
    _max: LevelSettingsMaxAggregateOutputType | null;
};
export type GetLevelSettingsGroupByPayload<T extends LevelSettingsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<LevelSettingsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof LevelSettingsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], LevelSettingsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], LevelSettingsGroupByOutputType[P]>;
}>>;
export type LevelSettingsWhereInput = {
    AND?: Prisma.LevelSettingsWhereInput | Prisma.LevelSettingsWhereInput[];
    OR?: Prisma.LevelSettingsWhereInput[];
    NOT?: Prisma.LevelSettingsWhereInput | Prisma.LevelSettingsWhereInput[];
    guildId?: Prisma.StringFilter<"LevelSettings"> | string;
    enabled?: Prisma.BoolFilter<"LevelSettings"> | boolean;
    messageXpMin?: Prisma.IntFilter<"LevelSettings"> | number;
    messageXpMax?: Prisma.IntFilter<"LevelSettings"> | number;
    cooldownSeconds?: Prisma.IntFilter<"LevelSettings"> | number;
    voiceXpPerMinute?: Prisma.IntFilter<"LevelSettings"> | number;
    curveBase?: Prisma.FloatFilter<"LevelSettings"> | number;
    curveExponent?: Prisma.FloatFilter<"LevelSettings"> | number;
    curveLinear?: Prisma.FloatFilter<"LevelSettings"> | number;
    roleMultipliers?: Prisma.JsonFilter<"LevelSettings">;
    channelMultipliers?: Prisma.JsonFilter<"LevelSettings">;
    noXpRoleIds?: Prisma.StringNullableListFilter<"LevelSettings">;
    noXpChannelIds?: Prisma.StringNullableListFilter<"LevelSettings">;
    levelUpMode?: Prisma.EnumLevelUpModeFilter<"LevelSettings"> | $Enums.LevelUpMode;
    levelUpChannelId?: Prisma.StringNullableFilter<"LevelSettings"> | string | null;
    levelUpMessage?: Prisma.StringFilter<"LevelSettings"> | string;
    rewards?: Prisma.JsonFilter<"LevelSettings">;
    rewardMode?: Prisma.EnumLevelRewardModeFilter<"LevelSettings"> | $Enums.LevelRewardMode;
    removeRewardsOnReset?: Prisma.BoolFilter<"LevelSettings"> | boolean;
    maxLevel?: Prisma.IntFilter<"LevelSettings"> | number;
    revision?: Prisma.IntFilter<"LevelSettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"LevelSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"LevelSettings"> | Date | string;
};
export type LevelSettingsOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    messageXpMin?: Prisma.SortOrder;
    messageXpMax?: Prisma.SortOrder;
    cooldownSeconds?: Prisma.SortOrder;
    voiceXpPerMinute?: Prisma.SortOrder;
    curveBase?: Prisma.SortOrder;
    curveExponent?: Prisma.SortOrder;
    curveLinear?: Prisma.SortOrder;
    roleMultipliers?: Prisma.SortOrder;
    channelMultipliers?: Prisma.SortOrder;
    noXpRoleIds?: Prisma.SortOrder;
    noXpChannelIds?: Prisma.SortOrder;
    levelUpMode?: Prisma.SortOrder;
    levelUpChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    levelUpMessage?: Prisma.SortOrder;
    rewards?: Prisma.SortOrder;
    rewardMode?: Prisma.SortOrder;
    removeRewardsOnReset?: Prisma.SortOrder;
    maxLevel?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LevelSettingsWhereUniqueInput = Prisma.AtLeast<{
    guildId?: string;
    AND?: Prisma.LevelSettingsWhereInput | Prisma.LevelSettingsWhereInput[];
    OR?: Prisma.LevelSettingsWhereInput[];
    NOT?: Prisma.LevelSettingsWhereInput | Prisma.LevelSettingsWhereInput[];
    enabled?: Prisma.BoolFilter<"LevelSettings"> | boolean;
    messageXpMin?: Prisma.IntFilter<"LevelSettings"> | number;
    messageXpMax?: Prisma.IntFilter<"LevelSettings"> | number;
    cooldownSeconds?: Prisma.IntFilter<"LevelSettings"> | number;
    voiceXpPerMinute?: Prisma.IntFilter<"LevelSettings"> | number;
    curveBase?: Prisma.FloatFilter<"LevelSettings"> | number;
    curveExponent?: Prisma.FloatFilter<"LevelSettings"> | number;
    curveLinear?: Prisma.FloatFilter<"LevelSettings"> | number;
    roleMultipliers?: Prisma.JsonFilter<"LevelSettings">;
    channelMultipliers?: Prisma.JsonFilter<"LevelSettings">;
    noXpRoleIds?: Prisma.StringNullableListFilter<"LevelSettings">;
    noXpChannelIds?: Prisma.StringNullableListFilter<"LevelSettings">;
    levelUpMode?: Prisma.EnumLevelUpModeFilter<"LevelSettings"> | $Enums.LevelUpMode;
    levelUpChannelId?: Prisma.StringNullableFilter<"LevelSettings"> | string | null;
    levelUpMessage?: Prisma.StringFilter<"LevelSettings"> | string;
    rewards?: Prisma.JsonFilter<"LevelSettings">;
    rewardMode?: Prisma.EnumLevelRewardModeFilter<"LevelSettings"> | $Enums.LevelRewardMode;
    removeRewardsOnReset?: Prisma.BoolFilter<"LevelSettings"> | boolean;
    maxLevel?: Prisma.IntFilter<"LevelSettings"> | number;
    revision?: Prisma.IntFilter<"LevelSettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"LevelSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"LevelSettings"> | Date | string;
}, "guildId">;
export type LevelSettingsOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    messageXpMin?: Prisma.SortOrder;
    messageXpMax?: Prisma.SortOrder;
    cooldownSeconds?: Prisma.SortOrder;
    voiceXpPerMinute?: Prisma.SortOrder;
    curveBase?: Prisma.SortOrder;
    curveExponent?: Prisma.SortOrder;
    curveLinear?: Prisma.SortOrder;
    roleMultipliers?: Prisma.SortOrder;
    channelMultipliers?: Prisma.SortOrder;
    noXpRoleIds?: Prisma.SortOrder;
    noXpChannelIds?: Prisma.SortOrder;
    levelUpMode?: Prisma.SortOrder;
    levelUpChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    levelUpMessage?: Prisma.SortOrder;
    rewards?: Prisma.SortOrder;
    rewardMode?: Prisma.SortOrder;
    removeRewardsOnReset?: Prisma.SortOrder;
    maxLevel?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.LevelSettingsCountOrderByAggregateInput;
    _avg?: Prisma.LevelSettingsAvgOrderByAggregateInput;
    _max?: Prisma.LevelSettingsMaxOrderByAggregateInput;
    _min?: Prisma.LevelSettingsMinOrderByAggregateInput;
    _sum?: Prisma.LevelSettingsSumOrderByAggregateInput;
};
export type LevelSettingsScalarWhereWithAggregatesInput = {
    AND?: Prisma.LevelSettingsScalarWhereWithAggregatesInput | Prisma.LevelSettingsScalarWhereWithAggregatesInput[];
    OR?: Prisma.LevelSettingsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.LevelSettingsScalarWhereWithAggregatesInput | Prisma.LevelSettingsScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"LevelSettings"> | string;
    enabled?: Prisma.BoolWithAggregatesFilter<"LevelSettings"> | boolean;
    messageXpMin?: Prisma.IntWithAggregatesFilter<"LevelSettings"> | number;
    messageXpMax?: Prisma.IntWithAggregatesFilter<"LevelSettings"> | number;
    cooldownSeconds?: Prisma.IntWithAggregatesFilter<"LevelSettings"> | number;
    voiceXpPerMinute?: Prisma.IntWithAggregatesFilter<"LevelSettings"> | number;
    curveBase?: Prisma.FloatWithAggregatesFilter<"LevelSettings"> | number;
    curveExponent?: Prisma.FloatWithAggregatesFilter<"LevelSettings"> | number;
    curveLinear?: Prisma.FloatWithAggregatesFilter<"LevelSettings"> | number;
    roleMultipliers?: Prisma.JsonWithAggregatesFilter<"LevelSettings">;
    channelMultipliers?: Prisma.JsonWithAggregatesFilter<"LevelSettings">;
    noXpRoleIds?: Prisma.StringNullableListFilter<"LevelSettings">;
    noXpChannelIds?: Prisma.StringNullableListFilter<"LevelSettings">;
    levelUpMode?: Prisma.EnumLevelUpModeWithAggregatesFilter<"LevelSettings"> | $Enums.LevelUpMode;
    levelUpChannelId?: Prisma.StringNullableWithAggregatesFilter<"LevelSettings"> | string | null;
    levelUpMessage?: Prisma.StringWithAggregatesFilter<"LevelSettings"> | string;
    rewards?: Prisma.JsonWithAggregatesFilter<"LevelSettings">;
    rewardMode?: Prisma.EnumLevelRewardModeWithAggregatesFilter<"LevelSettings"> | $Enums.LevelRewardMode;
    removeRewardsOnReset?: Prisma.BoolWithAggregatesFilter<"LevelSettings"> | boolean;
    maxLevel?: Prisma.IntWithAggregatesFilter<"LevelSettings"> | number;
    revision?: Prisma.IntWithAggregatesFilter<"LevelSettings"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"LevelSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"LevelSettings"> | Date | string;
};
export type LevelSettingsCreateInput = {
    guildId: string;
    enabled?: boolean;
    messageXpMin?: number;
    messageXpMax?: number;
    cooldownSeconds?: number;
    voiceXpPerMinute?: number;
    curveBase?: number;
    curveExponent?: number;
    curveLinear?: number;
    roleMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    channelMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    noXpRoleIds?: Prisma.LevelSettingsCreatenoXpRoleIdsInput | string[];
    noXpChannelIds?: Prisma.LevelSettingsCreatenoXpChannelIdsInput | string[];
    levelUpMode?: $Enums.LevelUpMode;
    levelUpChannelId?: string | null;
    levelUpMessage?: string;
    rewards?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    rewardMode?: $Enums.LevelRewardMode;
    removeRewardsOnReset?: boolean;
    maxLevel?: number;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LevelSettingsUncheckedCreateInput = {
    guildId: string;
    enabled?: boolean;
    messageXpMin?: number;
    messageXpMax?: number;
    cooldownSeconds?: number;
    voiceXpPerMinute?: number;
    curveBase?: number;
    curveExponent?: number;
    curveLinear?: number;
    roleMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    channelMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    noXpRoleIds?: Prisma.LevelSettingsCreatenoXpRoleIdsInput | string[];
    noXpChannelIds?: Prisma.LevelSettingsCreatenoXpChannelIdsInput | string[];
    levelUpMode?: $Enums.LevelUpMode;
    levelUpChannelId?: string | null;
    levelUpMessage?: string;
    rewards?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    rewardMode?: $Enums.LevelRewardMode;
    removeRewardsOnReset?: boolean;
    maxLevel?: number;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LevelSettingsUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    messageXpMin?: Prisma.IntFieldUpdateOperationsInput | number;
    messageXpMax?: Prisma.IntFieldUpdateOperationsInput | number;
    cooldownSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    voiceXpPerMinute?: Prisma.IntFieldUpdateOperationsInput | number;
    curveBase?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveExponent?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveLinear?: Prisma.FloatFieldUpdateOperationsInput | number;
    roleMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    channelMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    noXpRoleIds?: Prisma.LevelSettingsUpdatenoXpRoleIdsInput | string[];
    noXpChannelIds?: Prisma.LevelSettingsUpdatenoXpChannelIdsInput | string[];
    levelUpMode?: Prisma.EnumLevelUpModeFieldUpdateOperationsInput | $Enums.LevelUpMode;
    levelUpChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    levelUpMessage?: Prisma.StringFieldUpdateOperationsInput | string;
    rewards?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    rewardMode?: Prisma.EnumLevelRewardModeFieldUpdateOperationsInput | $Enums.LevelRewardMode;
    removeRewardsOnReset?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    maxLevel?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LevelSettingsUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    messageXpMin?: Prisma.IntFieldUpdateOperationsInput | number;
    messageXpMax?: Prisma.IntFieldUpdateOperationsInput | number;
    cooldownSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    voiceXpPerMinute?: Prisma.IntFieldUpdateOperationsInput | number;
    curveBase?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveExponent?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveLinear?: Prisma.FloatFieldUpdateOperationsInput | number;
    roleMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    channelMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    noXpRoleIds?: Prisma.LevelSettingsUpdatenoXpRoleIdsInput | string[];
    noXpChannelIds?: Prisma.LevelSettingsUpdatenoXpChannelIdsInput | string[];
    levelUpMode?: Prisma.EnumLevelUpModeFieldUpdateOperationsInput | $Enums.LevelUpMode;
    levelUpChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    levelUpMessage?: Prisma.StringFieldUpdateOperationsInput | string;
    rewards?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    rewardMode?: Prisma.EnumLevelRewardModeFieldUpdateOperationsInput | $Enums.LevelRewardMode;
    removeRewardsOnReset?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    maxLevel?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LevelSettingsCreateManyInput = {
    guildId: string;
    enabled?: boolean;
    messageXpMin?: number;
    messageXpMax?: number;
    cooldownSeconds?: number;
    voiceXpPerMinute?: number;
    curveBase?: number;
    curveExponent?: number;
    curveLinear?: number;
    roleMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    channelMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    noXpRoleIds?: Prisma.LevelSettingsCreatenoXpRoleIdsInput | string[];
    noXpChannelIds?: Prisma.LevelSettingsCreatenoXpChannelIdsInput | string[];
    levelUpMode?: $Enums.LevelUpMode;
    levelUpChannelId?: string | null;
    levelUpMessage?: string;
    rewards?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    rewardMode?: $Enums.LevelRewardMode;
    removeRewardsOnReset?: boolean;
    maxLevel?: number;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LevelSettingsUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    messageXpMin?: Prisma.IntFieldUpdateOperationsInput | number;
    messageXpMax?: Prisma.IntFieldUpdateOperationsInput | number;
    cooldownSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    voiceXpPerMinute?: Prisma.IntFieldUpdateOperationsInput | number;
    curveBase?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveExponent?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveLinear?: Prisma.FloatFieldUpdateOperationsInput | number;
    roleMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    channelMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    noXpRoleIds?: Prisma.LevelSettingsUpdatenoXpRoleIdsInput | string[];
    noXpChannelIds?: Prisma.LevelSettingsUpdatenoXpChannelIdsInput | string[];
    levelUpMode?: Prisma.EnumLevelUpModeFieldUpdateOperationsInput | $Enums.LevelUpMode;
    levelUpChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    levelUpMessage?: Prisma.StringFieldUpdateOperationsInput | string;
    rewards?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    rewardMode?: Prisma.EnumLevelRewardModeFieldUpdateOperationsInput | $Enums.LevelRewardMode;
    removeRewardsOnReset?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    maxLevel?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LevelSettingsUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    messageXpMin?: Prisma.IntFieldUpdateOperationsInput | number;
    messageXpMax?: Prisma.IntFieldUpdateOperationsInput | number;
    cooldownSeconds?: Prisma.IntFieldUpdateOperationsInput | number;
    voiceXpPerMinute?: Prisma.IntFieldUpdateOperationsInput | number;
    curveBase?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveExponent?: Prisma.FloatFieldUpdateOperationsInput | number;
    curveLinear?: Prisma.FloatFieldUpdateOperationsInput | number;
    roleMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    channelMultipliers?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    noXpRoleIds?: Prisma.LevelSettingsUpdatenoXpRoleIdsInput | string[];
    noXpChannelIds?: Prisma.LevelSettingsUpdatenoXpChannelIdsInput | string[];
    levelUpMode?: Prisma.EnumLevelUpModeFieldUpdateOperationsInput | $Enums.LevelUpMode;
    levelUpChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    levelUpMessage?: Prisma.StringFieldUpdateOperationsInput | string;
    rewards?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    rewardMode?: Prisma.EnumLevelRewardModeFieldUpdateOperationsInput | $Enums.LevelRewardMode;
    removeRewardsOnReset?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    maxLevel?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LevelSettingsCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    messageXpMin?: Prisma.SortOrder;
    messageXpMax?: Prisma.SortOrder;
    cooldownSeconds?: Prisma.SortOrder;
    voiceXpPerMinute?: Prisma.SortOrder;
    curveBase?: Prisma.SortOrder;
    curveExponent?: Prisma.SortOrder;
    curveLinear?: Prisma.SortOrder;
    roleMultipliers?: Prisma.SortOrder;
    channelMultipliers?: Prisma.SortOrder;
    noXpRoleIds?: Prisma.SortOrder;
    noXpChannelIds?: Prisma.SortOrder;
    levelUpMode?: Prisma.SortOrder;
    levelUpChannelId?: Prisma.SortOrder;
    levelUpMessage?: Prisma.SortOrder;
    rewards?: Prisma.SortOrder;
    rewardMode?: Prisma.SortOrder;
    removeRewardsOnReset?: Prisma.SortOrder;
    maxLevel?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LevelSettingsAvgOrderByAggregateInput = {
    messageXpMin?: Prisma.SortOrder;
    messageXpMax?: Prisma.SortOrder;
    cooldownSeconds?: Prisma.SortOrder;
    voiceXpPerMinute?: Prisma.SortOrder;
    curveBase?: Prisma.SortOrder;
    curveExponent?: Prisma.SortOrder;
    curveLinear?: Prisma.SortOrder;
    maxLevel?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
};
export type LevelSettingsMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    messageXpMin?: Prisma.SortOrder;
    messageXpMax?: Prisma.SortOrder;
    cooldownSeconds?: Prisma.SortOrder;
    voiceXpPerMinute?: Prisma.SortOrder;
    curveBase?: Prisma.SortOrder;
    curveExponent?: Prisma.SortOrder;
    curveLinear?: Prisma.SortOrder;
    levelUpMode?: Prisma.SortOrder;
    levelUpChannelId?: Prisma.SortOrder;
    levelUpMessage?: Prisma.SortOrder;
    rewardMode?: Prisma.SortOrder;
    removeRewardsOnReset?: Prisma.SortOrder;
    maxLevel?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LevelSettingsMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    messageXpMin?: Prisma.SortOrder;
    messageXpMax?: Prisma.SortOrder;
    cooldownSeconds?: Prisma.SortOrder;
    voiceXpPerMinute?: Prisma.SortOrder;
    curveBase?: Prisma.SortOrder;
    curveExponent?: Prisma.SortOrder;
    curveLinear?: Prisma.SortOrder;
    levelUpMode?: Prisma.SortOrder;
    levelUpChannelId?: Prisma.SortOrder;
    levelUpMessage?: Prisma.SortOrder;
    rewardMode?: Prisma.SortOrder;
    removeRewardsOnReset?: Prisma.SortOrder;
    maxLevel?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LevelSettingsSumOrderByAggregateInput = {
    messageXpMin?: Prisma.SortOrder;
    messageXpMax?: Prisma.SortOrder;
    cooldownSeconds?: Prisma.SortOrder;
    voiceXpPerMinute?: Prisma.SortOrder;
    curveBase?: Prisma.SortOrder;
    curveExponent?: Prisma.SortOrder;
    curveLinear?: Prisma.SortOrder;
    maxLevel?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
};
export type LevelSettingsCreatenoXpRoleIdsInput = {
    set: string[];
};
export type LevelSettingsCreatenoXpChannelIdsInput = {
    set: string[];
};
export type FloatFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type LevelSettingsUpdatenoXpRoleIdsInput = {
    set?: string[];
    push?: string | string[];
};
export type LevelSettingsUpdatenoXpChannelIdsInput = {
    set?: string[];
    push?: string | string[];
};
export type EnumLevelUpModeFieldUpdateOperationsInput = {
    set?: $Enums.LevelUpMode;
};
export type EnumLevelRewardModeFieldUpdateOperationsInput = {
    set?: $Enums.LevelRewardMode;
};
export type LevelSettingsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    messageXpMin?: boolean;
    messageXpMax?: boolean;
    cooldownSeconds?: boolean;
    voiceXpPerMinute?: boolean;
    curveBase?: boolean;
    curveExponent?: boolean;
    curveLinear?: boolean;
    roleMultipliers?: boolean;
    channelMultipliers?: boolean;
    noXpRoleIds?: boolean;
    noXpChannelIds?: boolean;
    levelUpMode?: boolean;
    levelUpChannelId?: boolean;
    levelUpMessage?: boolean;
    rewards?: boolean;
    rewardMode?: boolean;
    removeRewardsOnReset?: boolean;
    maxLevel?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["levelSettings"]>;
export type LevelSettingsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    messageXpMin?: boolean;
    messageXpMax?: boolean;
    cooldownSeconds?: boolean;
    voiceXpPerMinute?: boolean;
    curveBase?: boolean;
    curveExponent?: boolean;
    curveLinear?: boolean;
    roleMultipliers?: boolean;
    channelMultipliers?: boolean;
    noXpRoleIds?: boolean;
    noXpChannelIds?: boolean;
    levelUpMode?: boolean;
    levelUpChannelId?: boolean;
    levelUpMessage?: boolean;
    rewards?: boolean;
    rewardMode?: boolean;
    removeRewardsOnReset?: boolean;
    maxLevel?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["levelSettings"]>;
export type LevelSettingsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    messageXpMin?: boolean;
    messageXpMax?: boolean;
    cooldownSeconds?: boolean;
    voiceXpPerMinute?: boolean;
    curveBase?: boolean;
    curveExponent?: boolean;
    curveLinear?: boolean;
    roleMultipliers?: boolean;
    channelMultipliers?: boolean;
    noXpRoleIds?: boolean;
    noXpChannelIds?: boolean;
    levelUpMode?: boolean;
    levelUpChannelId?: boolean;
    levelUpMessage?: boolean;
    rewards?: boolean;
    rewardMode?: boolean;
    removeRewardsOnReset?: boolean;
    maxLevel?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["levelSettings"]>;
export type LevelSettingsSelectScalar = {
    guildId?: boolean;
    enabled?: boolean;
    messageXpMin?: boolean;
    messageXpMax?: boolean;
    cooldownSeconds?: boolean;
    voiceXpPerMinute?: boolean;
    curveBase?: boolean;
    curveExponent?: boolean;
    curveLinear?: boolean;
    roleMultipliers?: boolean;
    channelMultipliers?: boolean;
    noXpRoleIds?: boolean;
    noXpChannelIds?: boolean;
    levelUpMode?: boolean;
    levelUpChannelId?: boolean;
    levelUpMessage?: boolean;
    rewards?: boolean;
    rewardMode?: boolean;
    removeRewardsOnReset?: boolean;
    maxLevel?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type LevelSettingsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "enabled" | "messageXpMin" | "messageXpMax" | "cooldownSeconds" | "voiceXpPerMinute" | "curveBase" | "curveExponent" | "curveLinear" | "roleMultipliers" | "channelMultipliers" | "noXpRoleIds" | "noXpChannelIds" | "levelUpMode" | "levelUpChannelId" | "levelUpMessage" | "rewards" | "rewardMode" | "removeRewardsOnReset" | "maxLevel" | "revision" | "createdAt" | "updatedAt", ExtArgs["result"]["levelSettings"]>;
export type $LevelSettingsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "LevelSettings";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        enabled: boolean;
        messageXpMin: number;
        messageXpMax: number;
        cooldownSeconds: number;
        voiceXpPerMinute: number;
        curveBase: number;
        curveExponent: number;
        curveLinear: number;
        roleMultipliers: runtime.JsonValue;
        channelMultipliers: runtime.JsonValue;
        noXpRoleIds: string[];
        noXpChannelIds: string[];
        levelUpMode: $Enums.LevelUpMode;
        levelUpChannelId: string | null;
        levelUpMessage: string;
        rewards: runtime.JsonValue;
        rewardMode: $Enums.LevelRewardMode;
        removeRewardsOnReset: boolean;
        maxLevel: number;
        revision: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["levelSettings"]>;
    composites: {};
};
export type LevelSettingsGetPayload<S extends boolean | null | undefined | LevelSettingsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload, S>;
export type LevelSettingsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<LevelSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: LevelSettingsCountAggregateInputType | true;
};
export interface LevelSettingsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['LevelSettings'];
        meta: {
            name: 'LevelSettings';
        };
    };
    /**
     * Find zero or one LevelSettings that matches the filter.
     * @param {LevelSettingsFindUniqueArgs} args - Arguments to find a LevelSettings
     * @example
     * // Get one LevelSettings
     * const levelSettings = await prisma.levelSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LevelSettingsFindUniqueArgs>(args: Prisma.SelectSubset<T, LevelSettingsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__LevelSettingsClient<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one LevelSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LevelSettingsFindUniqueOrThrowArgs} args - Arguments to find a LevelSettings
     * @example
     * // Get one LevelSettings
     * const levelSettings = await prisma.levelSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LevelSettingsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, LevelSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__LevelSettingsClient<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first LevelSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelSettingsFindFirstArgs} args - Arguments to find a LevelSettings
     * @example
     * // Get one LevelSettings
     * const levelSettings = await prisma.levelSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LevelSettingsFindFirstArgs>(args?: Prisma.SelectSubset<T, LevelSettingsFindFirstArgs<ExtArgs>>): Prisma.Prisma__LevelSettingsClient<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first LevelSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelSettingsFindFirstOrThrowArgs} args - Arguments to find a LevelSettings
     * @example
     * // Get one LevelSettings
     * const levelSettings = await prisma.levelSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LevelSettingsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, LevelSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__LevelSettingsClient<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more LevelSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LevelSettings
     * const levelSettings = await prisma.levelSettings.findMany()
     *
     * // Get first 10 LevelSettings
     * const levelSettings = await prisma.levelSettings.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const levelSettingsWithGuildIdOnly = await prisma.levelSettings.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends LevelSettingsFindManyArgs>(args?: Prisma.SelectSubset<T, LevelSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a LevelSettings.
     * @param {LevelSettingsCreateArgs} args - Arguments to create a LevelSettings.
     * @example
     * // Create one LevelSettings
     * const LevelSettings = await prisma.levelSettings.create({
     *   data: {
     *     // ... data to create a LevelSettings
     *   }
     * })
     *
     */
    create<T extends LevelSettingsCreateArgs>(args: Prisma.SelectSubset<T, LevelSettingsCreateArgs<ExtArgs>>): Prisma.Prisma__LevelSettingsClient<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many LevelSettings.
     * @param {LevelSettingsCreateManyArgs} args - Arguments to create many LevelSettings.
     * @example
     * // Create many LevelSettings
     * const levelSettings = await prisma.levelSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends LevelSettingsCreateManyArgs>(args?: Prisma.SelectSubset<T, LevelSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many LevelSettings and returns the data saved in the database.
     * @param {LevelSettingsCreateManyAndReturnArgs} args - Arguments to create many LevelSettings.
     * @example
     * // Create many LevelSettings
     * const levelSettings = await prisma.levelSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many LevelSettings and only return the `guildId`
     * const levelSettingsWithGuildIdOnly = await prisma.levelSettings.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends LevelSettingsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, LevelSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a LevelSettings.
     * @param {LevelSettingsDeleteArgs} args - Arguments to delete one LevelSettings.
     * @example
     * // Delete one LevelSettings
     * const LevelSettings = await prisma.levelSettings.delete({
     *   where: {
     *     // ... filter to delete one LevelSettings
     *   }
     * })
     *
     */
    delete<T extends LevelSettingsDeleteArgs>(args: Prisma.SelectSubset<T, LevelSettingsDeleteArgs<ExtArgs>>): Prisma.Prisma__LevelSettingsClient<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one LevelSettings.
     * @param {LevelSettingsUpdateArgs} args - Arguments to update one LevelSettings.
     * @example
     * // Update one LevelSettings
     * const levelSettings = await prisma.levelSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends LevelSettingsUpdateArgs>(args: Prisma.SelectSubset<T, LevelSettingsUpdateArgs<ExtArgs>>): Prisma.Prisma__LevelSettingsClient<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more LevelSettings.
     * @param {LevelSettingsDeleteManyArgs} args - Arguments to filter LevelSettings to delete.
     * @example
     * // Delete a few LevelSettings
     * const { count } = await prisma.levelSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends LevelSettingsDeleteManyArgs>(args?: Prisma.SelectSubset<T, LevelSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more LevelSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LevelSettings
     * const levelSettings = await prisma.levelSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends LevelSettingsUpdateManyArgs>(args: Prisma.SelectSubset<T, LevelSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more LevelSettings and returns the data updated in the database.
     * @param {LevelSettingsUpdateManyAndReturnArgs} args - Arguments to update many LevelSettings.
     * @example
     * // Update many LevelSettings
     * const levelSettings = await prisma.levelSettings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more LevelSettings and only return the `guildId`
     * const levelSettingsWithGuildIdOnly = await prisma.levelSettings.updateManyAndReturn({
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
    updateManyAndReturn<T extends LevelSettingsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, LevelSettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one LevelSettings.
     * @param {LevelSettingsUpsertArgs} args - Arguments to update or create a LevelSettings.
     * @example
     * // Update or create a LevelSettings
     * const levelSettings = await prisma.levelSettings.upsert({
     *   create: {
     *     // ... data to create a LevelSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LevelSettings we want to update
     *   }
     * })
     */
    upsert<T extends LevelSettingsUpsertArgs>(args: Prisma.SelectSubset<T, LevelSettingsUpsertArgs<ExtArgs>>): Prisma.Prisma__LevelSettingsClient<runtime.Types.Result.GetResult<Prisma.$LevelSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of LevelSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelSettingsCountArgs} args - Arguments to filter LevelSettings to count.
     * @example
     * // Count the number of LevelSettings
     * const count = await prisma.levelSettings.count({
     *   where: {
     *     // ... the filter for the LevelSettings we want to count
     *   }
     * })
    **/
    count<T extends LevelSettingsCountArgs>(args?: Prisma.Subset<T, LevelSettingsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], LevelSettingsCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a LevelSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LevelSettingsAggregateArgs>(args: Prisma.Subset<T, LevelSettingsAggregateArgs>): Prisma.PrismaPromise<GetLevelSettingsAggregateType<T>>;
    /**
     * Group by LevelSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelSettingsGroupByArgs} args - Group by arguments.
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
    groupBy<T extends LevelSettingsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: LevelSettingsGroupByArgs['orderBy'];
    } : {
        orderBy?: LevelSettingsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, LevelSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLevelSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the LevelSettings model
     */
    readonly fields: LevelSettingsFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for LevelSettings.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__LevelSettingsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the LevelSettings model
 */
export interface LevelSettingsFieldRefs {
    readonly guildId: Prisma.FieldRef<"LevelSettings", 'String'>;
    readonly enabled: Prisma.FieldRef<"LevelSettings", 'Boolean'>;
    readonly messageXpMin: Prisma.FieldRef<"LevelSettings", 'Int'>;
    readonly messageXpMax: Prisma.FieldRef<"LevelSettings", 'Int'>;
    readonly cooldownSeconds: Prisma.FieldRef<"LevelSettings", 'Int'>;
    readonly voiceXpPerMinute: Prisma.FieldRef<"LevelSettings", 'Int'>;
    readonly curveBase: Prisma.FieldRef<"LevelSettings", 'Float'>;
    readonly curveExponent: Prisma.FieldRef<"LevelSettings", 'Float'>;
    readonly curveLinear: Prisma.FieldRef<"LevelSettings", 'Float'>;
    readonly roleMultipliers: Prisma.FieldRef<"LevelSettings", 'Json'>;
    readonly channelMultipliers: Prisma.FieldRef<"LevelSettings", 'Json'>;
    readonly noXpRoleIds: Prisma.FieldRef<"LevelSettings", 'String[]'>;
    readonly noXpChannelIds: Prisma.FieldRef<"LevelSettings", 'String[]'>;
    readonly levelUpMode: Prisma.FieldRef<"LevelSettings", 'LevelUpMode'>;
    readonly levelUpChannelId: Prisma.FieldRef<"LevelSettings", 'String'>;
    readonly levelUpMessage: Prisma.FieldRef<"LevelSettings", 'String'>;
    readonly rewards: Prisma.FieldRef<"LevelSettings", 'Json'>;
    readonly rewardMode: Prisma.FieldRef<"LevelSettings", 'LevelRewardMode'>;
    readonly removeRewardsOnReset: Prisma.FieldRef<"LevelSettings", 'Boolean'>;
    readonly maxLevel: Prisma.FieldRef<"LevelSettings", 'Int'>;
    readonly revision: Prisma.FieldRef<"LevelSettings", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"LevelSettings", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"LevelSettings", 'DateTime'>;
}
/**
 * LevelSettings findUnique
 */
export type LevelSettingsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which LevelSettings to fetch.
     */
    where: Prisma.LevelSettingsWhereUniqueInput;
};
/**
 * LevelSettings findUniqueOrThrow
 */
export type LevelSettingsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which LevelSettings to fetch.
     */
    where: Prisma.LevelSettingsWhereUniqueInput;
};
/**
 * LevelSettings findFirst
 */
export type LevelSettingsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which LevelSettings to fetch.
     */
    where?: Prisma.LevelSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of LevelSettings to fetch.
     */
    orderBy?: Prisma.LevelSettingsOrderByWithRelationInput | Prisma.LevelSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for LevelSettings.
     */
    cursor?: Prisma.LevelSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` LevelSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` LevelSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of LevelSettings.
     */
    distinct?: Prisma.LevelSettingsScalarFieldEnum | Prisma.LevelSettingsScalarFieldEnum[];
};
/**
 * LevelSettings findFirstOrThrow
 */
export type LevelSettingsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which LevelSettings to fetch.
     */
    where?: Prisma.LevelSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of LevelSettings to fetch.
     */
    orderBy?: Prisma.LevelSettingsOrderByWithRelationInput | Prisma.LevelSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for LevelSettings.
     */
    cursor?: Prisma.LevelSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` LevelSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` LevelSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of LevelSettings.
     */
    distinct?: Prisma.LevelSettingsScalarFieldEnum | Prisma.LevelSettingsScalarFieldEnum[];
};
/**
 * LevelSettings findMany
 */
export type LevelSettingsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which LevelSettings to fetch.
     */
    where?: Prisma.LevelSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of LevelSettings to fetch.
     */
    orderBy?: Prisma.LevelSettingsOrderByWithRelationInput | Prisma.LevelSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing LevelSettings.
     */
    cursor?: Prisma.LevelSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` LevelSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` LevelSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of LevelSettings.
     */
    distinct?: Prisma.LevelSettingsScalarFieldEnum | Prisma.LevelSettingsScalarFieldEnum[];
};
/**
 * LevelSettings create
 */
export type LevelSettingsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * The data needed to create a LevelSettings.
     */
    data: Prisma.XOR<Prisma.LevelSettingsCreateInput, Prisma.LevelSettingsUncheckedCreateInput>;
};
/**
 * LevelSettings createMany
 */
export type LevelSettingsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many LevelSettings.
     */
    data: Prisma.LevelSettingsCreateManyInput | Prisma.LevelSettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * LevelSettings createManyAndReturn
 */
export type LevelSettingsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * The data used to create many LevelSettings.
     */
    data: Prisma.LevelSettingsCreateManyInput | Prisma.LevelSettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * LevelSettings update
 */
export type LevelSettingsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * The data needed to update a LevelSettings.
     */
    data: Prisma.XOR<Prisma.LevelSettingsUpdateInput, Prisma.LevelSettingsUncheckedUpdateInput>;
    /**
     * Choose, which LevelSettings to update.
     */
    where: Prisma.LevelSettingsWhereUniqueInput;
};
/**
 * LevelSettings updateMany
 */
export type LevelSettingsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update LevelSettings.
     */
    data: Prisma.XOR<Prisma.LevelSettingsUpdateManyMutationInput, Prisma.LevelSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which LevelSettings to update
     */
    where?: Prisma.LevelSettingsWhereInput;
    /**
     * Limit how many LevelSettings to update.
     */
    limit?: number;
};
/**
 * LevelSettings updateManyAndReturn
 */
export type LevelSettingsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * The data used to update LevelSettings.
     */
    data: Prisma.XOR<Prisma.LevelSettingsUpdateManyMutationInput, Prisma.LevelSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which LevelSettings to update
     */
    where?: Prisma.LevelSettingsWhereInput;
    /**
     * Limit how many LevelSettings to update.
     */
    limit?: number;
};
/**
 * LevelSettings upsert
 */
export type LevelSettingsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * The filter to search for the LevelSettings to update in case it exists.
     */
    where: Prisma.LevelSettingsWhereUniqueInput;
    /**
     * In case the LevelSettings found by the `where` argument doesn't exist, create a new LevelSettings with this data.
     */
    create: Prisma.XOR<Prisma.LevelSettingsCreateInput, Prisma.LevelSettingsUncheckedCreateInput>;
    /**
     * In case the LevelSettings was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.LevelSettingsUpdateInput, Prisma.LevelSettingsUncheckedUpdateInput>;
};
/**
 * LevelSettings delete
 */
export type LevelSettingsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
    /**
     * Filter which LevelSettings to delete.
     */
    where: Prisma.LevelSettingsWhereUniqueInput;
};
/**
 * LevelSettings deleteMany
 */
export type LevelSettingsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which LevelSettings to delete
     */
    where?: Prisma.LevelSettingsWhereInput;
    /**
     * Limit how many LevelSettings to delete.
     */
    limit?: number;
};
/**
 * LevelSettings without action
 */
export type LevelSettingsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelSettings
     */
    select?: Prisma.LevelSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelSettings
     */
    omit?: Prisma.LevelSettingsOmit<ExtArgs> | null;
};
//# sourceMappingURL=LevelSettings.d.ts.map
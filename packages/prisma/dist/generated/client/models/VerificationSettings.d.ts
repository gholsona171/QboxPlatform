import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model VerificationSettings
 *
 */
export type VerificationSettingsModel = runtime.Types.Result.DefaultSelection<Prisma.$VerificationSettingsPayload>;
export type AggregateVerificationSettings = {
    _count: VerificationSettingsCountAggregateOutputType | null;
    _avg: VerificationSettingsAvgAggregateOutputType | null;
    _sum: VerificationSettingsSumAggregateOutputType | null;
    _min: VerificationSettingsMinAggregateOutputType | null;
    _max: VerificationSettingsMaxAggregateOutputType | null;
};
export type VerificationSettingsAvgAggregateOutputType = {
    minAccountAgeDays: number | null;
    kickUnverifiedMinutes: number | null;
    maxAttempts: number | null;
    cooldownMinutes: number | null;
    revision: number | null;
};
export type VerificationSettingsSumAggregateOutputType = {
    minAccountAgeDays: number | null;
    kickUnverifiedMinutes: number | null;
    maxAttempts: number | null;
    cooldownMinutes: number | null;
    revision: number | null;
};
export type VerificationSettingsMinAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    mode: $Enums.VerificationMode | null;
    unverifiedRoleId: string | null;
    channelId: string | null;
    panelTitle: string | null;
    panelDescription: string | null;
    panelColor: string | null;
    panelButtonLabel: string | null;
    panelChannelId: string | null;
    panelMessageId: string | null;
    logChannelId: string | null;
    minAccountAgeDays: number | null;
    ageAction: $Enums.VerificationAgeAction | null;
    kickUnverifiedMinutes: number | null;
    maxAttempts: number | null;
    cooldownMinutes: number | null;
    dmOnSuccess: boolean | null;
    successMessage: string | null;
    welcomeChannelId: string | null;
    welcomeMessage: string | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type VerificationSettingsMaxAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    mode: $Enums.VerificationMode | null;
    unverifiedRoleId: string | null;
    channelId: string | null;
    panelTitle: string | null;
    panelDescription: string | null;
    panelColor: string | null;
    panelButtonLabel: string | null;
    panelChannelId: string | null;
    panelMessageId: string | null;
    logChannelId: string | null;
    minAccountAgeDays: number | null;
    ageAction: $Enums.VerificationAgeAction | null;
    kickUnverifiedMinutes: number | null;
    maxAttempts: number | null;
    cooldownMinutes: number | null;
    dmOnSuccess: boolean | null;
    successMessage: string | null;
    welcomeChannelId: string | null;
    welcomeMessage: string | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type VerificationSettingsCountAggregateOutputType = {
    guildId: number;
    enabled: number;
    mode: number;
    verifiedRoleIds: number;
    unverifiedRoleId: number;
    channelId: number;
    panelTitle: number;
    panelDescription: number;
    panelColor: number;
    panelButtonLabel: number;
    panelChannelId: number;
    panelMessageId: number;
    questions: number;
    logChannelId: number;
    minAccountAgeDays: number;
    ageAction: number;
    kickUnverifiedMinutes: number;
    maxAttempts: number;
    cooldownMinutes: number;
    dmOnSuccess: number;
    successMessage: number;
    welcomeChannelId: number;
    welcomeMessage: number;
    revision: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type VerificationSettingsAvgAggregateInputType = {
    minAccountAgeDays?: true;
    kickUnverifiedMinutes?: true;
    maxAttempts?: true;
    cooldownMinutes?: true;
    revision?: true;
};
export type VerificationSettingsSumAggregateInputType = {
    minAccountAgeDays?: true;
    kickUnverifiedMinutes?: true;
    maxAttempts?: true;
    cooldownMinutes?: true;
    revision?: true;
};
export type VerificationSettingsMinAggregateInputType = {
    guildId?: true;
    enabled?: true;
    mode?: true;
    unverifiedRoleId?: true;
    channelId?: true;
    panelTitle?: true;
    panelDescription?: true;
    panelColor?: true;
    panelButtonLabel?: true;
    panelChannelId?: true;
    panelMessageId?: true;
    logChannelId?: true;
    minAccountAgeDays?: true;
    ageAction?: true;
    kickUnverifiedMinutes?: true;
    maxAttempts?: true;
    cooldownMinutes?: true;
    dmOnSuccess?: true;
    successMessage?: true;
    welcomeChannelId?: true;
    welcomeMessage?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type VerificationSettingsMaxAggregateInputType = {
    guildId?: true;
    enabled?: true;
    mode?: true;
    unverifiedRoleId?: true;
    channelId?: true;
    panelTitle?: true;
    panelDescription?: true;
    panelColor?: true;
    panelButtonLabel?: true;
    panelChannelId?: true;
    panelMessageId?: true;
    logChannelId?: true;
    minAccountAgeDays?: true;
    ageAction?: true;
    kickUnverifiedMinutes?: true;
    maxAttempts?: true;
    cooldownMinutes?: true;
    dmOnSuccess?: true;
    successMessage?: true;
    welcomeChannelId?: true;
    welcomeMessage?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type VerificationSettingsCountAggregateInputType = {
    guildId?: true;
    enabled?: true;
    mode?: true;
    verifiedRoleIds?: true;
    unverifiedRoleId?: true;
    channelId?: true;
    panelTitle?: true;
    panelDescription?: true;
    panelColor?: true;
    panelButtonLabel?: true;
    panelChannelId?: true;
    panelMessageId?: true;
    questions?: true;
    logChannelId?: true;
    minAccountAgeDays?: true;
    ageAction?: true;
    kickUnverifiedMinutes?: true;
    maxAttempts?: true;
    cooldownMinutes?: true;
    dmOnSuccess?: true;
    successMessage?: true;
    welcomeChannelId?: true;
    welcomeMessage?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type VerificationSettingsAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationSettings to aggregate.
     */
    where?: Prisma.VerificationSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationSettings to fetch.
     */
    orderBy?: Prisma.VerificationSettingsOrderByWithRelationInput | Prisma.VerificationSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.VerificationSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned VerificationSettings
    **/
    _count?: true | VerificationSettingsCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: VerificationSettingsAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: VerificationSettingsSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: VerificationSettingsMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: VerificationSettingsMaxAggregateInputType;
};
export type GetVerificationSettingsAggregateType<T extends VerificationSettingsAggregateArgs> = {
    [P in keyof T & keyof AggregateVerificationSettings]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateVerificationSettings[P]> : Prisma.GetScalarType<T[P], AggregateVerificationSettings[P]>;
};
export type VerificationSettingsGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.VerificationSettingsWhereInput;
    orderBy?: Prisma.VerificationSettingsOrderByWithAggregationInput | Prisma.VerificationSettingsOrderByWithAggregationInput[];
    by: Prisma.VerificationSettingsScalarFieldEnum[] | Prisma.VerificationSettingsScalarFieldEnum;
    having?: Prisma.VerificationSettingsScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: VerificationSettingsCountAggregateInputType | true;
    _avg?: VerificationSettingsAvgAggregateInputType;
    _sum?: VerificationSettingsSumAggregateInputType;
    _min?: VerificationSettingsMinAggregateInputType;
    _max?: VerificationSettingsMaxAggregateInputType;
};
export type VerificationSettingsGroupByOutputType = {
    guildId: string;
    enabled: boolean;
    mode: $Enums.VerificationMode;
    verifiedRoleIds: string[];
    unverifiedRoleId: string | null;
    channelId: string | null;
    panelTitle: string;
    panelDescription: string;
    panelColor: string;
    panelButtonLabel: string;
    panelChannelId: string | null;
    panelMessageId: string | null;
    questions: runtime.JsonValue;
    logChannelId: string | null;
    minAccountAgeDays: number;
    ageAction: $Enums.VerificationAgeAction;
    kickUnverifiedMinutes: number;
    maxAttempts: number;
    cooldownMinutes: number;
    dmOnSuccess: boolean;
    successMessage: string | null;
    welcomeChannelId: string | null;
    welcomeMessage: string | null;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
    _count: VerificationSettingsCountAggregateOutputType | null;
    _avg: VerificationSettingsAvgAggregateOutputType | null;
    _sum: VerificationSettingsSumAggregateOutputType | null;
    _min: VerificationSettingsMinAggregateOutputType | null;
    _max: VerificationSettingsMaxAggregateOutputType | null;
};
export type GetVerificationSettingsGroupByPayload<T extends VerificationSettingsGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<VerificationSettingsGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof VerificationSettingsGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], VerificationSettingsGroupByOutputType[P]> : Prisma.GetScalarType<T[P], VerificationSettingsGroupByOutputType[P]>;
}>>;
export type VerificationSettingsWhereInput = {
    AND?: Prisma.VerificationSettingsWhereInput | Prisma.VerificationSettingsWhereInput[];
    OR?: Prisma.VerificationSettingsWhereInput[];
    NOT?: Prisma.VerificationSettingsWhereInput | Prisma.VerificationSettingsWhereInput[];
    guildId?: Prisma.StringFilter<"VerificationSettings"> | string;
    enabled?: Prisma.BoolFilter<"VerificationSettings"> | boolean;
    mode?: Prisma.EnumVerificationModeFilter<"VerificationSettings"> | $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.StringNullableListFilter<"VerificationSettings">;
    unverifiedRoleId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    channelId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    panelTitle?: Prisma.StringFilter<"VerificationSettings"> | string;
    panelDescription?: Prisma.StringFilter<"VerificationSettings"> | string;
    panelColor?: Prisma.StringFilter<"VerificationSettings"> | string;
    panelButtonLabel?: Prisma.StringFilter<"VerificationSettings"> | string;
    panelChannelId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    panelMessageId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    questions?: Prisma.JsonFilter<"VerificationSettings">;
    logChannelId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    minAccountAgeDays?: Prisma.IntFilter<"VerificationSettings"> | number;
    ageAction?: Prisma.EnumVerificationAgeActionFilter<"VerificationSettings"> | $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: Prisma.IntFilter<"VerificationSettings"> | number;
    maxAttempts?: Prisma.IntFilter<"VerificationSettings"> | number;
    cooldownMinutes?: Prisma.IntFilter<"VerificationSettings"> | number;
    dmOnSuccess?: Prisma.BoolFilter<"VerificationSettings"> | boolean;
    successMessage?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    welcomeChannelId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    welcomeMessage?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    revision?: Prisma.IntFilter<"VerificationSettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"VerificationSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"VerificationSettings"> | Date | string;
};
export type VerificationSettingsOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    verifiedRoleIds?: Prisma.SortOrder;
    unverifiedRoleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    channelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    panelTitle?: Prisma.SortOrder;
    panelDescription?: Prisma.SortOrder;
    panelColor?: Prisma.SortOrder;
    panelButtonLabel?: Prisma.SortOrder;
    panelChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    panelMessageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    questions?: Prisma.SortOrder;
    logChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    minAccountAgeDays?: Prisma.SortOrder;
    ageAction?: Prisma.SortOrder;
    kickUnverifiedMinutes?: Prisma.SortOrder;
    maxAttempts?: Prisma.SortOrder;
    cooldownMinutes?: Prisma.SortOrder;
    dmOnSuccess?: Prisma.SortOrder;
    successMessage?: Prisma.SortOrderInput | Prisma.SortOrder;
    welcomeChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    welcomeMessage?: Prisma.SortOrderInput | Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VerificationSettingsWhereUniqueInput = Prisma.AtLeast<{
    guildId?: string;
    AND?: Prisma.VerificationSettingsWhereInput | Prisma.VerificationSettingsWhereInput[];
    OR?: Prisma.VerificationSettingsWhereInput[];
    NOT?: Prisma.VerificationSettingsWhereInput | Prisma.VerificationSettingsWhereInput[];
    enabled?: Prisma.BoolFilter<"VerificationSettings"> | boolean;
    mode?: Prisma.EnumVerificationModeFilter<"VerificationSettings"> | $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.StringNullableListFilter<"VerificationSettings">;
    unverifiedRoleId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    channelId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    panelTitle?: Prisma.StringFilter<"VerificationSettings"> | string;
    panelDescription?: Prisma.StringFilter<"VerificationSettings"> | string;
    panelColor?: Prisma.StringFilter<"VerificationSettings"> | string;
    panelButtonLabel?: Prisma.StringFilter<"VerificationSettings"> | string;
    panelChannelId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    panelMessageId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    questions?: Prisma.JsonFilter<"VerificationSettings">;
    logChannelId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    minAccountAgeDays?: Prisma.IntFilter<"VerificationSettings"> | number;
    ageAction?: Prisma.EnumVerificationAgeActionFilter<"VerificationSettings"> | $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: Prisma.IntFilter<"VerificationSettings"> | number;
    maxAttempts?: Prisma.IntFilter<"VerificationSettings"> | number;
    cooldownMinutes?: Prisma.IntFilter<"VerificationSettings"> | number;
    dmOnSuccess?: Prisma.BoolFilter<"VerificationSettings"> | boolean;
    successMessage?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    welcomeChannelId?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    welcomeMessage?: Prisma.StringNullableFilter<"VerificationSettings"> | string | null;
    revision?: Prisma.IntFilter<"VerificationSettings"> | number;
    createdAt?: Prisma.DateTimeFilter<"VerificationSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"VerificationSettings"> | Date | string;
}, "guildId">;
export type VerificationSettingsOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    verifiedRoleIds?: Prisma.SortOrder;
    unverifiedRoleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    channelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    panelTitle?: Prisma.SortOrder;
    panelDescription?: Prisma.SortOrder;
    panelColor?: Prisma.SortOrder;
    panelButtonLabel?: Prisma.SortOrder;
    panelChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    panelMessageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    questions?: Prisma.SortOrder;
    logChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    minAccountAgeDays?: Prisma.SortOrder;
    ageAction?: Prisma.SortOrder;
    kickUnverifiedMinutes?: Prisma.SortOrder;
    maxAttempts?: Prisma.SortOrder;
    cooldownMinutes?: Prisma.SortOrder;
    dmOnSuccess?: Prisma.SortOrder;
    successMessage?: Prisma.SortOrderInput | Prisma.SortOrder;
    welcomeChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    welcomeMessage?: Prisma.SortOrderInput | Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.VerificationSettingsCountOrderByAggregateInput;
    _avg?: Prisma.VerificationSettingsAvgOrderByAggregateInput;
    _max?: Prisma.VerificationSettingsMaxOrderByAggregateInput;
    _min?: Prisma.VerificationSettingsMinOrderByAggregateInput;
    _sum?: Prisma.VerificationSettingsSumOrderByAggregateInput;
};
export type VerificationSettingsScalarWhereWithAggregatesInput = {
    AND?: Prisma.VerificationSettingsScalarWhereWithAggregatesInput | Prisma.VerificationSettingsScalarWhereWithAggregatesInput[];
    OR?: Prisma.VerificationSettingsScalarWhereWithAggregatesInput[];
    NOT?: Prisma.VerificationSettingsScalarWhereWithAggregatesInput | Prisma.VerificationSettingsScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"VerificationSettings"> | string;
    enabled?: Prisma.BoolWithAggregatesFilter<"VerificationSettings"> | boolean;
    mode?: Prisma.EnumVerificationModeWithAggregatesFilter<"VerificationSettings"> | $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.StringNullableListFilter<"VerificationSettings">;
    unverifiedRoleId?: Prisma.StringNullableWithAggregatesFilter<"VerificationSettings"> | string | null;
    channelId?: Prisma.StringNullableWithAggregatesFilter<"VerificationSettings"> | string | null;
    panelTitle?: Prisma.StringWithAggregatesFilter<"VerificationSettings"> | string;
    panelDescription?: Prisma.StringWithAggregatesFilter<"VerificationSettings"> | string;
    panelColor?: Prisma.StringWithAggregatesFilter<"VerificationSettings"> | string;
    panelButtonLabel?: Prisma.StringWithAggregatesFilter<"VerificationSettings"> | string;
    panelChannelId?: Prisma.StringNullableWithAggregatesFilter<"VerificationSettings"> | string | null;
    panelMessageId?: Prisma.StringNullableWithAggregatesFilter<"VerificationSettings"> | string | null;
    questions?: Prisma.JsonWithAggregatesFilter<"VerificationSettings">;
    logChannelId?: Prisma.StringNullableWithAggregatesFilter<"VerificationSettings"> | string | null;
    minAccountAgeDays?: Prisma.IntWithAggregatesFilter<"VerificationSettings"> | number;
    ageAction?: Prisma.EnumVerificationAgeActionWithAggregatesFilter<"VerificationSettings"> | $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: Prisma.IntWithAggregatesFilter<"VerificationSettings"> | number;
    maxAttempts?: Prisma.IntWithAggregatesFilter<"VerificationSettings"> | number;
    cooldownMinutes?: Prisma.IntWithAggregatesFilter<"VerificationSettings"> | number;
    dmOnSuccess?: Prisma.BoolWithAggregatesFilter<"VerificationSettings"> | boolean;
    successMessage?: Prisma.StringNullableWithAggregatesFilter<"VerificationSettings"> | string | null;
    welcomeChannelId?: Prisma.StringNullableWithAggregatesFilter<"VerificationSettings"> | string | null;
    welcomeMessage?: Prisma.StringNullableWithAggregatesFilter<"VerificationSettings"> | string | null;
    revision?: Prisma.IntWithAggregatesFilter<"VerificationSettings"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"VerificationSettings"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"VerificationSettings"> | Date | string;
};
export type VerificationSettingsCreateInput = {
    guildId: string;
    enabled?: boolean;
    mode?: $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.VerificationSettingsCreateverifiedRoleIdsInput | string[];
    unverifiedRoleId?: string | null;
    channelId?: string | null;
    panelTitle: string;
    panelDescription: string;
    panelColor?: string;
    panelButtonLabel?: string;
    panelChannelId?: string | null;
    panelMessageId?: string | null;
    questions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logChannelId?: string | null;
    minAccountAgeDays?: number;
    ageAction?: $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: number;
    maxAttempts?: number;
    cooldownMinutes?: number;
    dmOnSuccess?: boolean;
    successMessage?: string | null;
    welcomeChannelId?: string | null;
    welcomeMessage?: string | null;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VerificationSettingsUncheckedCreateInput = {
    guildId: string;
    enabled?: boolean;
    mode?: $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.VerificationSettingsCreateverifiedRoleIdsInput | string[];
    unverifiedRoleId?: string | null;
    channelId?: string | null;
    panelTitle: string;
    panelDescription: string;
    panelColor?: string;
    panelButtonLabel?: string;
    panelChannelId?: string | null;
    panelMessageId?: string | null;
    questions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logChannelId?: string | null;
    minAccountAgeDays?: number;
    ageAction?: $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: number;
    maxAttempts?: number;
    cooldownMinutes?: number;
    dmOnSuccess?: boolean;
    successMessage?: string | null;
    welcomeChannelId?: string | null;
    welcomeMessage?: string | null;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VerificationSettingsUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    mode?: Prisma.EnumVerificationModeFieldUpdateOperationsInput | $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.VerificationSettingsUpdateverifiedRoleIdsInput | string[];
    unverifiedRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    panelTitle?: Prisma.StringFieldUpdateOperationsInput | string;
    panelDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    panelColor?: Prisma.StringFieldUpdateOperationsInput | string;
    panelButtonLabel?: Prisma.StringFieldUpdateOperationsInput | string;
    panelChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    panelMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    questions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minAccountAgeDays?: Prisma.IntFieldUpdateOperationsInput | number;
    ageAction?: Prisma.EnumVerificationAgeActionFieldUpdateOperationsInput | $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    maxAttempts?: Prisma.IntFieldUpdateOperationsInput | number;
    cooldownMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    dmOnSuccess?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    successMessage?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    welcomeChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    welcomeMessage?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationSettingsUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    mode?: Prisma.EnumVerificationModeFieldUpdateOperationsInput | $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.VerificationSettingsUpdateverifiedRoleIdsInput | string[];
    unverifiedRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    panelTitle?: Prisma.StringFieldUpdateOperationsInput | string;
    panelDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    panelColor?: Prisma.StringFieldUpdateOperationsInput | string;
    panelButtonLabel?: Prisma.StringFieldUpdateOperationsInput | string;
    panelChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    panelMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    questions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minAccountAgeDays?: Prisma.IntFieldUpdateOperationsInput | number;
    ageAction?: Prisma.EnumVerificationAgeActionFieldUpdateOperationsInput | $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    maxAttempts?: Prisma.IntFieldUpdateOperationsInput | number;
    cooldownMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    dmOnSuccess?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    successMessage?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    welcomeChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    welcomeMessage?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationSettingsCreateManyInput = {
    guildId: string;
    enabled?: boolean;
    mode?: $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.VerificationSettingsCreateverifiedRoleIdsInput | string[];
    unverifiedRoleId?: string | null;
    channelId?: string | null;
    panelTitle: string;
    panelDescription: string;
    panelColor?: string;
    panelButtonLabel?: string;
    panelChannelId?: string | null;
    panelMessageId?: string | null;
    questions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logChannelId?: string | null;
    minAccountAgeDays?: number;
    ageAction?: $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: number;
    maxAttempts?: number;
    cooldownMinutes?: number;
    dmOnSuccess?: boolean;
    successMessage?: string | null;
    welcomeChannelId?: string | null;
    welcomeMessage?: string | null;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type VerificationSettingsUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    mode?: Prisma.EnumVerificationModeFieldUpdateOperationsInput | $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.VerificationSettingsUpdateverifiedRoleIdsInput | string[];
    unverifiedRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    panelTitle?: Prisma.StringFieldUpdateOperationsInput | string;
    panelDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    panelColor?: Prisma.StringFieldUpdateOperationsInput | string;
    panelButtonLabel?: Prisma.StringFieldUpdateOperationsInput | string;
    panelChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    panelMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    questions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minAccountAgeDays?: Prisma.IntFieldUpdateOperationsInput | number;
    ageAction?: Prisma.EnumVerificationAgeActionFieldUpdateOperationsInput | $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    maxAttempts?: Prisma.IntFieldUpdateOperationsInput | number;
    cooldownMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    dmOnSuccess?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    successMessage?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    welcomeChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    welcomeMessage?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationSettingsUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    mode?: Prisma.EnumVerificationModeFieldUpdateOperationsInput | $Enums.VerificationMode;
    verifiedRoleIds?: Prisma.VerificationSettingsUpdateverifiedRoleIdsInput | string[];
    unverifiedRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    channelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    panelTitle?: Prisma.StringFieldUpdateOperationsInput | string;
    panelDescription?: Prisma.StringFieldUpdateOperationsInput | string;
    panelColor?: Prisma.StringFieldUpdateOperationsInput | string;
    panelButtonLabel?: Prisma.StringFieldUpdateOperationsInput | string;
    panelChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    panelMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    questions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    logChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    minAccountAgeDays?: Prisma.IntFieldUpdateOperationsInput | number;
    ageAction?: Prisma.EnumVerificationAgeActionFieldUpdateOperationsInput | $Enums.VerificationAgeAction;
    kickUnverifiedMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    maxAttempts?: Prisma.IntFieldUpdateOperationsInput | number;
    cooldownMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    dmOnSuccess?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    successMessage?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    welcomeChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    welcomeMessage?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationSettingsCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    verifiedRoleIds?: Prisma.SortOrder;
    unverifiedRoleId?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    panelTitle?: Prisma.SortOrder;
    panelDescription?: Prisma.SortOrder;
    panelColor?: Prisma.SortOrder;
    panelButtonLabel?: Prisma.SortOrder;
    panelChannelId?: Prisma.SortOrder;
    panelMessageId?: Prisma.SortOrder;
    questions?: Prisma.SortOrder;
    logChannelId?: Prisma.SortOrder;
    minAccountAgeDays?: Prisma.SortOrder;
    ageAction?: Prisma.SortOrder;
    kickUnverifiedMinutes?: Prisma.SortOrder;
    maxAttempts?: Prisma.SortOrder;
    cooldownMinutes?: Prisma.SortOrder;
    dmOnSuccess?: Prisma.SortOrder;
    successMessage?: Prisma.SortOrder;
    welcomeChannelId?: Prisma.SortOrder;
    welcomeMessage?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VerificationSettingsAvgOrderByAggregateInput = {
    minAccountAgeDays?: Prisma.SortOrder;
    kickUnverifiedMinutes?: Prisma.SortOrder;
    maxAttempts?: Prisma.SortOrder;
    cooldownMinutes?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
};
export type VerificationSettingsMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    unverifiedRoleId?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    panelTitle?: Prisma.SortOrder;
    panelDescription?: Prisma.SortOrder;
    panelColor?: Prisma.SortOrder;
    panelButtonLabel?: Prisma.SortOrder;
    panelChannelId?: Prisma.SortOrder;
    panelMessageId?: Prisma.SortOrder;
    logChannelId?: Prisma.SortOrder;
    minAccountAgeDays?: Prisma.SortOrder;
    ageAction?: Prisma.SortOrder;
    kickUnverifiedMinutes?: Prisma.SortOrder;
    maxAttempts?: Prisma.SortOrder;
    cooldownMinutes?: Prisma.SortOrder;
    dmOnSuccess?: Prisma.SortOrder;
    successMessage?: Prisma.SortOrder;
    welcomeChannelId?: Prisma.SortOrder;
    welcomeMessage?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VerificationSettingsMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    unverifiedRoleId?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    panelTitle?: Prisma.SortOrder;
    panelDescription?: Prisma.SortOrder;
    panelColor?: Prisma.SortOrder;
    panelButtonLabel?: Prisma.SortOrder;
    panelChannelId?: Prisma.SortOrder;
    panelMessageId?: Prisma.SortOrder;
    logChannelId?: Prisma.SortOrder;
    minAccountAgeDays?: Prisma.SortOrder;
    ageAction?: Prisma.SortOrder;
    kickUnverifiedMinutes?: Prisma.SortOrder;
    maxAttempts?: Prisma.SortOrder;
    cooldownMinutes?: Prisma.SortOrder;
    dmOnSuccess?: Prisma.SortOrder;
    successMessage?: Prisma.SortOrder;
    welcomeChannelId?: Prisma.SortOrder;
    welcomeMessage?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type VerificationSettingsSumOrderByAggregateInput = {
    minAccountAgeDays?: Prisma.SortOrder;
    kickUnverifiedMinutes?: Prisma.SortOrder;
    maxAttempts?: Prisma.SortOrder;
    cooldownMinutes?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
};
export type VerificationSettingsCreateverifiedRoleIdsInput = {
    set: string[];
};
export type EnumVerificationModeFieldUpdateOperationsInput = {
    set?: $Enums.VerificationMode;
};
export type VerificationSettingsUpdateverifiedRoleIdsInput = {
    set?: string[];
    push?: string | string[];
};
export type EnumVerificationAgeActionFieldUpdateOperationsInput = {
    set?: $Enums.VerificationAgeAction;
};
export type VerificationSettingsSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    mode?: boolean;
    verifiedRoleIds?: boolean;
    unverifiedRoleId?: boolean;
    channelId?: boolean;
    panelTitle?: boolean;
    panelDescription?: boolean;
    panelColor?: boolean;
    panelButtonLabel?: boolean;
    panelChannelId?: boolean;
    panelMessageId?: boolean;
    questions?: boolean;
    logChannelId?: boolean;
    minAccountAgeDays?: boolean;
    ageAction?: boolean;
    kickUnverifiedMinutes?: boolean;
    maxAttempts?: boolean;
    cooldownMinutes?: boolean;
    dmOnSuccess?: boolean;
    successMessage?: boolean;
    welcomeChannelId?: boolean;
    welcomeMessage?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["verificationSettings"]>;
export type VerificationSettingsSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    mode?: boolean;
    verifiedRoleIds?: boolean;
    unverifiedRoleId?: boolean;
    channelId?: boolean;
    panelTitle?: boolean;
    panelDescription?: boolean;
    panelColor?: boolean;
    panelButtonLabel?: boolean;
    panelChannelId?: boolean;
    panelMessageId?: boolean;
    questions?: boolean;
    logChannelId?: boolean;
    minAccountAgeDays?: boolean;
    ageAction?: boolean;
    kickUnverifiedMinutes?: boolean;
    maxAttempts?: boolean;
    cooldownMinutes?: boolean;
    dmOnSuccess?: boolean;
    successMessage?: boolean;
    welcomeChannelId?: boolean;
    welcomeMessage?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["verificationSettings"]>;
export type VerificationSettingsSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    mode?: boolean;
    verifiedRoleIds?: boolean;
    unverifiedRoleId?: boolean;
    channelId?: boolean;
    panelTitle?: boolean;
    panelDescription?: boolean;
    panelColor?: boolean;
    panelButtonLabel?: boolean;
    panelChannelId?: boolean;
    panelMessageId?: boolean;
    questions?: boolean;
    logChannelId?: boolean;
    minAccountAgeDays?: boolean;
    ageAction?: boolean;
    kickUnverifiedMinutes?: boolean;
    maxAttempts?: boolean;
    cooldownMinutes?: boolean;
    dmOnSuccess?: boolean;
    successMessage?: boolean;
    welcomeChannelId?: boolean;
    welcomeMessage?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["verificationSettings"]>;
export type VerificationSettingsSelectScalar = {
    guildId?: boolean;
    enabled?: boolean;
    mode?: boolean;
    verifiedRoleIds?: boolean;
    unverifiedRoleId?: boolean;
    channelId?: boolean;
    panelTitle?: boolean;
    panelDescription?: boolean;
    panelColor?: boolean;
    panelButtonLabel?: boolean;
    panelChannelId?: boolean;
    panelMessageId?: boolean;
    questions?: boolean;
    logChannelId?: boolean;
    minAccountAgeDays?: boolean;
    ageAction?: boolean;
    kickUnverifiedMinutes?: boolean;
    maxAttempts?: boolean;
    cooldownMinutes?: boolean;
    dmOnSuccess?: boolean;
    successMessage?: boolean;
    welcomeChannelId?: boolean;
    welcomeMessage?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type VerificationSettingsOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "enabled" | "mode" | "verifiedRoleIds" | "unverifiedRoleId" | "channelId" | "panelTitle" | "panelDescription" | "panelColor" | "panelButtonLabel" | "panelChannelId" | "panelMessageId" | "questions" | "logChannelId" | "minAccountAgeDays" | "ageAction" | "kickUnverifiedMinutes" | "maxAttempts" | "cooldownMinutes" | "dmOnSuccess" | "successMessage" | "welcomeChannelId" | "welcomeMessage" | "revision" | "createdAt" | "updatedAt", ExtArgs["result"]["verificationSettings"]>;
export type $VerificationSettingsPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "VerificationSettings";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        enabled: boolean;
        mode: $Enums.VerificationMode;
        verifiedRoleIds: string[];
        unverifiedRoleId: string | null;
        channelId: string | null;
        panelTitle: string;
        panelDescription: string;
        panelColor: string;
        panelButtonLabel: string;
        panelChannelId: string | null;
        panelMessageId: string | null;
        questions: runtime.JsonValue;
        logChannelId: string | null;
        minAccountAgeDays: number;
        ageAction: $Enums.VerificationAgeAction;
        kickUnverifiedMinutes: number;
        maxAttempts: number;
        cooldownMinutes: number;
        dmOnSuccess: boolean;
        successMessage: string | null;
        welcomeChannelId: string | null;
        welcomeMessage: string | null;
        revision: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["verificationSettings"]>;
    composites: {};
};
export type VerificationSettingsGetPayload<S extends boolean | null | undefined | VerificationSettingsDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload, S>;
export type VerificationSettingsCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<VerificationSettingsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: VerificationSettingsCountAggregateInputType | true;
};
export interface VerificationSettingsDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['VerificationSettings'];
        meta: {
            name: 'VerificationSettings';
        };
    };
    /**
     * Find zero or one VerificationSettings that matches the filter.
     * @param {VerificationSettingsFindUniqueArgs} args - Arguments to find a VerificationSettings
     * @example
     * // Get one VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationSettingsFindUniqueArgs>(args: Prisma.SelectSubset<T, VerificationSettingsFindUniqueArgs<ExtArgs>>): Prisma.Prisma__VerificationSettingsClient<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one VerificationSettings that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationSettingsFindUniqueOrThrowArgs} args - Arguments to find a VerificationSettings
     * @example
     * // Get one VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationSettingsFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, VerificationSettingsFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationSettingsClient<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VerificationSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationSettingsFindFirstArgs} args - Arguments to find a VerificationSettings
     * @example
     * // Get one VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationSettingsFindFirstArgs>(args?: Prisma.SelectSubset<T, VerificationSettingsFindFirstArgs<ExtArgs>>): Prisma.Prisma__VerificationSettingsClient<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VerificationSettings that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationSettingsFindFirstOrThrowArgs} args - Arguments to find a VerificationSettings
     * @example
     * // Get one VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationSettingsFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, VerificationSettingsFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationSettingsClient<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more VerificationSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationSettingsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.findMany()
     *
     * // Get first 10 VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const verificationSettingsWithGuildIdOnly = await prisma.verificationSettings.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends VerificationSettingsFindManyArgs>(args?: Prisma.SelectSubset<T, VerificationSettingsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a VerificationSettings.
     * @param {VerificationSettingsCreateArgs} args - Arguments to create a VerificationSettings.
     * @example
     * // Create one VerificationSettings
     * const VerificationSettings = await prisma.verificationSettings.create({
     *   data: {
     *     // ... data to create a VerificationSettings
     *   }
     * })
     *
     */
    create<T extends VerificationSettingsCreateArgs>(args: Prisma.SelectSubset<T, VerificationSettingsCreateArgs<ExtArgs>>): Prisma.Prisma__VerificationSettingsClient<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many VerificationSettings.
     * @param {VerificationSettingsCreateManyArgs} args - Arguments to create many VerificationSettings.
     * @example
     * // Create many VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends VerificationSettingsCreateManyArgs>(args?: Prisma.SelectSubset<T, VerificationSettingsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many VerificationSettings and returns the data saved in the database.
     * @param {VerificationSettingsCreateManyAndReturnArgs} args - Arguments to create many VerificationSettings.
     * @example
     * // Create many VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many VerificationSettings and only return the `guildId`
     * const verificationSettingsWithGuildIdOnly = await prisma.verificationSettings.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends VerificationSettingsCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, VerificationSettingsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a VerificationSettings.
     * @param {VerificationSettingsDeleteArgs} args - Arguments to delete one VerificationSettings.
     * @example
     * // Delete one VerificationSettings
     * const VerificationSettings = await prisma.verificationSettings.delete({
     *   where: {
     *     // ... filter to delete one VerificationSettings
     *   }
     * })
     *
     */
    delete<T extends VerificationSettingsDeleteArgs>(args: Prisma.SelectSubset<T, VerificationSettingsDeleteArgs<ExtArgs>>): Prisma.Prisma__VerificationSettingsClient<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one VerificationSettings.
     * @param {VerificationSettingsUpdateArgs} args - Arguments to update one VerificationSettings.
     * @example
     * // Update one VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends VerificationSettingsUpdateArgs>(args: Prisma.SelectSubset<T, VerificationSettingsUpdateArgs<ExtArgs>>): Prisma.Prisma__VerificationSettingsClient<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more VerificationSettings.
     * @param {VerificationSettingsDeleteManyArgs} args - Arguments to filter VerificationSettings to delete.
     * @example
     * // Delete a few VerificationSettings
     * const { count } = await prisma.verificationSettings.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends VerificationSettingsDeleteManyArgs>(args?: Prisma.SelectSubset<T, VerificationSettingsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VerificationSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationSettingsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends VerificationSettingsUpdateManyArgs>(args: Prisma.SelectSubset<T, VerificationSettingsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VerificationSettings and returns the data updated in the database.
     * @param {VerificationSettingsUpdateManyAndReturnArgs} args - Arguments to update many VerificationSettings.
     * @example
     * // Update many VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more VerificationSettings and only return the `guildId`
     * const verificationSettingsWithGuildIdOnly = await prisma.verificationSettings.updateManyAndReturn({
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
    updateManyAndReturn<T extends VerificationSettingsUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, VerificationSettingsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one VerificationSettings.
     * @param {VerificationSettingsUpsertArgs} args - Arguments to update or create a VerificationSettings.
     * @example
     * // Update or create a VerificationSettings
     * const verificationSettings = await prisma.verificationSettings.upsert({
     *   create: {
     *     // ... data to create a VerificationSettings
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationSettings we want to update
     *   }
     * })
     */
    upsert<T extends VerificationSettingsUpsertArgs>(args: Prisma.SelectSubset<T, VerificationSettingsUpsertArgs<ExtArgs>>): Prisma.Prisma__VerificationSettingsClient<runtime.Types.Result.GetResult<Prisma.$VerificationSettingsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of VerificationSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationSettingsCountArgs} args - Arguments to filter VerificationSettings to count.
     * @example
     * // Count the number of VerificationSettings
     * const count = await prisma.verificationSettings.count({
     *   where: {
     *     // ... the filter for the VerificationSettings we want to count
     *   }
     * })
    **/
    count<T extends VerificationSettingsCountArgs>(args?: Prisma.Subset<T, VerificationSettingsCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], VerificationSettingsCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a VerificationSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationSettingsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VerificationSettingsAggregateArgs>(args: Prisma.Subset<T, VerificationSettingsAggregateArgs>): Prisma.PrismaPromise<GetVerificationSettingsAggregateType<T>>;
    /**
     * Group by VerificationSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationSettingsGroupByArgs} args - Group by arguments.
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
    groupBy<T extends VerificationSettingsGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: VerificationSettingsGroupByArgs['orderBy'];
    } : {
        orderBy?: VerificationSettingsGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, VerificationSettingsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationSettingsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the VerificationSettings model
     */
    readonly fields: VerificationSettingsFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for VerificationSettings.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__VerificationSettingsClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the VerificationSettings model
 */
export interface VerificationSettingsFieldRefs {
    readonly guildId: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly enabled: Prisma.FieldRef<"VerificationSettings", 'Boolean'>;
    readonly mode: Prisma.FieldRef<"VerificationSettings", 'VerificationMode'>;
    readonly verifiedRoleIds: Prisma.FieldRef<"VerificationSettings", 'String[]'>;
    readonly unverifiedRoleId: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly channelId: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly panelTitle: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly panelDescription: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly panelColor: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly panelButtonLabel: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly panelChannelId: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly panelMessageId: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly questions: Prisma.FieldRef<"VerificationSettings", 'Json'>;
    readonly logChannelId: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly minAccountAgeDays: Prisma.FieldRef<"VerificationSettings", 'Int'>;
    readonly ageAction: Prisma.FieldRef<"VerificationSettings", 'VerificationAgeAction'>;
    readonly kickUnverifiedMinutes: Prisma.FieldRef<"VerificationSettings", 'Int'>;
    readonly maxAttempts: Prisma.FieldRef<"VerificationSettings", 'Int'>;
    readonly cooldownMinutes: Prisma.FieldRef<"VerificationSettings", 'Int'>;
    readonly dmOnSuccess: Prisma.FieldRef<"VerificationSettings", 'Boolean'>;
    readonly successMessage: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly welcomeChannelId: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly welcomeMessage: Prisma.FieldRef<"VerificationSettings", 'String'>;
    readonly revision: Prisma.FieldRef<"VerificationSettings", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"VerificationSettings", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"VerificationSettings", 'DateTime'>;
}
/**
 * VerificationSettings findUnique
 */
export type VerificationSettingsFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationSettings to fetch.
     */
    where: Prisma.VerificationSettingsWhereUniqueInput;
};
/**
 * VerificationSettings findUniqueOrThrow
 */
export type VerificationSettingsFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationSettings to fetch.
     */
    where: Prisma.VerificationSettingsWhereUniqueInput;
};
/**
 * VerificationSettings findFirst
 */
export type VerificationSettingsFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationSettings to fetch.
     */
    where?: Prisma.VerificationSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationSettings to fetch.
     */
    orderBy?: Prisma.VerificationSettingsOrderByWithRelationInput | Prisma.VerificationSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VerificationSettings.
     */
    cursor?: Prisma.VerificationSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationSettings.
     */
    distinct?: Prisma.VerificationSettingsScalarFieldEnum | Prisma.VerificationSettingsScalarFieldEnum[];
};
/**
 * VerificationSettings findFirstOrThrow
 */
export type VerificationSettingsFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationSettings to fetch.
     */
    where?: Prisma.VerificationSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationSettings to fetch.
     */
    orderBy?: Prisma.VerificationSettingsOrderByWithRelationInput | Prisma.VerificationSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VerificationSettings.
     */
    cursor?: Prisma.VerificationSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationSettings.
     */
    distinct?: Prisma.VerificationSettingsScalarFieldEnum | Prisma.VerificationSettingsScalarFieldEnum[];
};
/**
 * VerificationSettings findMany
 */
export type VerificationSettingsFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationSettings to fetch.
     */
    where?: Prisma.VerificationSettingsWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationSettings to fetch.
     */
    orderBy?: Prisma.VerificationSettingsOrderByWithRelationInput | Prisma.VerificationSettingsOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing VerificationSettings.
     */
    cursor?: Prisma.VerificationSettingsWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationSettings from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationSettings.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationSettings.
     */
    distinct?: Prisma.VerificationSettingsScalarFieldEnum | Prisma.VerificationSettingsScalarFieldEnum[];
};
/**
 * VerificationSettings create
 */
export type VerificationSettingsCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * The data needed to create a VerificationSettings.
     */
    data: Prisma.XOR<Prisma.VerificationSettingsCreateInput, Prisma.VerificationSettingsUncheckedCreateInput>;
};
/**
 * VerificationSettings createMany
 */
export type VerificationSettingsCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationSettings.
     */
    data: Prisma.VerificationSettingsCreateManyInput | Prisma.VerificationSettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VerificationSettings createManyAndReturn
 */
export type VerificationSettingsCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * The data used to create many VerificationSettings.
     */
    data: Prisma.VerificationSettingsCreateManyInput | Prisma.VerificationSettingsCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VerificationSettings update
 */
export type VerificationSettingsUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * The data needed to update a VerificationSettings.
     */
    data: Prisma.XOR<Prisma.VerificationSettingsUpdateInput, Prisma.VerificationSettingsUncheckedUpdateInput>;
    /**
     * Choose, which VerificationSettings to update.
     */
    where: Prisma.VerificationSettingsWhereUniqueInput;
};
/**
 * VerificationSettings updateMany
 */
export type VerificationSettingsUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationSettings.
     */
    data: Prisma.XOR<Prisma.VerificationSettingsUpdateManyMutationInput, Prisma.VerificationSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which VerificationSettings to update
     */
    where?: Prisma.VerificationSettingsWhereInput;
    /**
     * Limit how many VerificationSettings to update.
     */
    limit?: number;
};
/**
 * VerificationSettings updateManyAndReturn
 */
export type VerificationSettingsUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * The data used to update VerificationSettings.
     */
    data: Prisma.XOR<Prisma.VerificationSettingsUpdateManyMutationInput, Prisma.VerificationSettingsUncheckedUpdateManyInput>;
    /**
     * Filter which VerificationSettings to update
     */
    where?: Prisma.VerificationSettingsWhereInput;
    /**
     * Limit how many VerificationSettings to update.
     */
    limit?: number;
};
/**
 * VerificationSettings upsert
 */
export type VerificationSettingsUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * The filter to search for the VerificationSettings to update in case it exists.
     */
    where: Prisma.VerificationSettingsWhereUniqueInput;
    /**
     * In case the VerificationSettings found by the `where` argument doesn't exist, create a new VerificationSettings with this data.
     */
    create: Prisma.XOR<Prisma.VerificationSettingsCreateInput, Prisma.VerificationSettingsUncheckedCreateInput>;
    /**
     * In case the VerificationSettings was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.VerificationSettingsUpdateInput, Prisma.VerificationSettingsUncheckedUpdateInput>;
};
/**
 * VerificationSettings delete
 */
export type VerificationSettingsDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
    /**
     * Filter which VerificationSettings to delete.
     */
    where: Prisma.VerificationSettingsWhereUniqueInput;
};
/**
 * VerificationSettings deleteMany
 */
export type VerificationSettingsDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationSettings to delete
     */
    where?: Prisma.VerificationSettingsWhereInput;
    /**
     * Limit how many VerificationSettings to delete.
     */
    limit?: number;
};
/**
 * VerificationSettings without action
 */
export type VerificationSettingsDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationSettings
     */
    select?: Prisma.VerificationSettingsSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationSettings
     */
    omit?: Prisma.VerificationSettingsOmit<ExtArgs> | null;
};
//# sourceMappingURL=VerificationSettings.d.ts.map
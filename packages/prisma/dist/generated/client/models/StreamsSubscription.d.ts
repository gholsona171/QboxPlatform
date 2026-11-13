import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model StreamsSubscription
 *
 */
export type StreamsSubscriptionModel = runtime.Types.Result.DefaultSelection<Prisma.$StreamsSubscriptionPayload>;
export type AggregateStreamsSubscription = {
    _count: StreamsSubscriptionCountAggregateOutputType | null;
    _avg: StreamsSubscriptionAvgAggregateOutputType | null;
    _sum: StreamsSubscriptionSumAggregateOutputType | null;
    _min: StreamsSubscriptionMinAggregateOutputType | null;
    _max: StreamsSubscriptionMaxAggregateOutputType | null;
};
export type StreamsSubscriptionAvgAggregateOutputType = {
    offlineStreak: number | null;
    failureStreak: number | null;
};
export type StreamsSubscriptionSumAggregateOutputType = {
    offlineStreak: number | null;
    failureStreak: number | null;
};
export type StreamsSubscriptionMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    platform: $Enums.StreamsPlatform | null;
    handle: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    platformId: string | null;
    announceChannelId: string | null;
    pingRoleId: string | null;
    messageText: string | null;
    announceVideos: boolean | null;
    enabled: boolean | null;
    lastStreamId: string | null;
    liveSince: Date | null;
    lastAnnouncementChannelId: string | null;
    lastAnnouncementMessageId: string | null;
    lastVideoId: string | null;
    lastCheckedAt: Date | null;
    offlineStreak: number | null;
    failureStreak: number | null;
    lastError: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StreamsSubscriptionMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    platform: $Enums.StreamsPlatform | null;
    handle: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    platformId: string | null;
    announceChannelId: string | null;
    pingRoleId: string | null;
    messageText: string | null;
    announceVideos: boolean | null;
    enabled: boolean | null;
    lastStreamId: string | null;
    liveSince: Date | null;
    lastAnnouncementChannelId: string | null;
    lastAnnouncementMessageId: string | null;
    lastVideoId: string | null;
    lastCheckedAt: Date | null;
    offlineStreak: number | null;
    failureStreak: number | null;
    lastError: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type StreamsSubscriptionCountAggregateOutputType = {
    id: number;
    guildId: number;
    platform: number;
    handle: number;
    displayName: number;
    avatarUrl: number;
    platformId: number;
    announceChannelId: number;
    pingRoleId: number;
    messageText: number;
    announceVideos: number;
    enabled: number;
    lastStreamId: number;
    liveSince: number;
    lastAnnouncementChannelId: number;
    lastAnnouncementMessageId: number;
    lastVideoId: number;
    lastCheckedAt: number;
    offlineStreak: number;
    failureStreak: number;
    lastError: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type StreamsSubscriptionAvgAggregateInputType = {
    offlineStreak?: true;
    failureStreak?: true;
};
export type StreamsSubscriptionSumAggregateInputType = {
    offlineStreak?: true;
    failureStreak?: true;
};
export type StreamsSubscriptionMinAggregateInputType = {
    id?: true;
    guildId?: true;
    platform?: true;
    handle?: true;
    displayName?: true;
    avatarUrl?: true;
    platformId?: true;
    announceChannelId?: true;
    pingRoleId?: true;
    messageText?: true;
    announceVideos?: true;
    enabled?: true;
    lastStreamId?: true;
    liveSince?: true;
    lastAnnouncementChannelId?: true;
    lastAnnouncementMessageId?: true;
    lastVideoId?: true;
    lastCheckedAt?: true;
    offlineStreak?: true;
    failureStreak?: true;
    lastError?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StreamsSubscriptionMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    platform?: true;
    handle?: true;
    displayName?: true;
    avatarUrl?: true;
    platformId?: true;
    announceChannelId?: true;
    pingRoleId?: true;
    messageText?: true;
    announceVideos?: true;
    enabled?: true;
    lastStreamId?: true;
    liveSince?: true;
    lastAnnouncementChannelId?: true;
    lastAnnouncementMessageId?: true;
    lastVideoId?: true;
    lastCheckedAt?: true;
    offlineStreak?: true;
    failureStreak?: true;
    lastError?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type StreamsSubscriptionCountAggregateInputType = {
    id?: true;
    guildId?: true;
    platform?: true;
    handle?: true;
    displayName?: true;
    avatarUrl?: true;
    platformId?: true;
    announceChannelId?: true;
    pingRoleId?: true;
    messageText?: true;
    announceVideos?: true;
    enabled?: true;
    lastStreamId?: true;
    liveSince?: true;
    lastAnnouncementChannelId?: true;
    lastAnnouncementMessageId?: true;
    lastVideoId?: true;
    lastCheckedAt?: true;
    offlineStreak?: true;
    failureStreak?: true;
    lastError?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type StreamsSubscriptionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which StreamsSubscription to aggregate.
     */
    where?: Prisma.StreamsSubscriptionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of StreamsSubscriptions to fetch.
     */
    orderBy?: Prisma.StreamsSubscriptionOrderByWithRelationInput | Prisma.StreamsSubscriptionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.StreamsSubscriptionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` StreamsSubscriptions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` StreamsSubscriptions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned StreamsSubscriptions
    **/
    _count?: true | StreamsSubscriptionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: StreamsSubscriptionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: StreamsSubscriptionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: StreamsSubscriptionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: StreamsSubscriptionMaxAggregateInputType;
};
export type GetStreamsSubscriptionAggregateType<T extends StreamsSubscriptionAggregateArgs> = {
    [P in keyof T & keyof AggregateStreamsSubscription]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateStreamsSubscription[P]> : Prisma.GetScalarType<T[P], AggregateStreamsSubscription[P]>;
};
export type StreamsSubscriptionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.StreamsSubscriptionWhereInput;
    orderBy?: Prisma.StreamsSubscriptionOrderByWithAggregationInput | Prisma.StreamsSubscriptionOrderByWithAggregationInput[];
    by: Prisma.StreamsSubscriptionScalarFieldEnum[] | Prisma.StreamsSubscriptionScalarFieldEnum;
    having?: Prisma.StreamsSubscriptionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: StreamsSubscriptionCountAggregateInputType | true;
    _avg?: StreamsSubscriptionAvgAggregateInputType;
    _sum?: StreamsSubscriptionSumAggregateInputType;
    _min?: StreamsSubscriptionMinAggregateInputType;
    _max?: StreamsSubscriptionMaxAggregateInputType;
};
export type StreamsSubscriptionGroupByOutputType = {
    id: string;
    guildId: string;
    platform: $Enums.StreamsPlatform;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
    platformId: string;
    announceChannelId: string | null;
    pingRoleId: string | null;
    messageText: string | null;
    announceVideos: boolean;
    enabled: boolean;
    lastStreamId: string | null;
    liveSince: Date | null;
    lastAnnouncementChannelId: string | null;
    lastAnnouncementMessageId: string | null;
    lastVideoId: string | null;
    lastCheckedAt: Date | null;
    offlineStreak: number;
    failureStreak: number;
    lastError: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: StreamsSubscriptionCountAggregateOutputType | null;
    _avg: StreamsSubscriptionAvgAggregateOutputType | null;
    _sum: StreamsSubscriptionSumAggregateOutputType | null;
    _min: StreamsSubscriptionMinAggregateOutputType | null;
    _max: StreamsSubscriptionMaxAggregateOutputType | null;
};
export type GetStreamsSubscriptionGroupByPayload<T extends StreamsSubscriptionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<StreamsSubscriptionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof StreamsSubscriptionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], StreamsSubscriptionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], StreamsSubscriptionGroupByOutputType[P]>;
}>>;
export type StreamsSubscriptionWhereInput = {
    AND?: Prisma.StreamsSubscriptionWhereInput | Prisma.StreamsSubscriptionWhereInput[];
    OR?: Prisma.StreamsSubscriptionWhereInput[];
    NOT?: Prisma.StreamsSubscriptionWhereInput | Prisma.StreamsSubscriptionWhereInput[];
    id?: Prisma.UuidFilter<"StreamsSubscription"> | string;
    guildId?: Prisma.StringFilter<"StreamsSubscription"> | string;
    platform?: Prisma.EnumStreamsPlatformFilter<"StreamsSubscription"> | $Enums.StreamsPlatform;
    handle?: Prisma.StringFilter<"StreamsSubscription"> | string;
    displayName?: Prisma.StringFilter<"StreamsSubscription"> | string;
    avatarUrl?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    platformId?: Prisma.StringFilter<"StreamsSubscription"> | string;
    announceChannelId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    pingRoleId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    messageText?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    announceVideos?: Prisma.BoolFilter<"StreamsSubscription"> | boolean;
    enabled?: Prisma.BoolFilter<"StreamsSubscription"> | boolean;
    lastStreamId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    liveSince?: Prisma.DateTimeNullableFilter<"StreamsSubscription"> | Date | string | null;
    lastAnnouncementChannelId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    lastAnnouncementMessageId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    lastVideoId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    lastCheckedAt?: Prisma.DateTimeNullableFilter<"StreamsSubscription"> | Date | string | null;
    offlineStreak?: Prisma.IntFilter<"StreamsSubscription"> | number;
    failureStreak?: Prisma.IntFilter<"StreamsSubscription"> | number;
    lastError?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"StreamsSubscription"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StreamsSubscription"> | Date | string;
};
export type StreamsSubscriptionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    handle?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    platformId?: Prisma.SortOrder;
    announceChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    messageText?: Prisma.SortOrderInput | Prisma.SortOrder;
    announceVideos?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    lastStreamId?: Prisma.SortOrderInput | Prisma.SortOrder;
    liveSince?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastAnnouncementChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastAnnouncementMessageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastVideoId?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastCheckedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    offlineStreak?: Prisma.SortOrder;
    failureStreak?: Prisma.SortOrder;
    lastError?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StreamsSubscriptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    guildId_platform_platformId?: Prisma.StreamsSubscriptionGuildIdPlatformPlatformIdCompoundUniqueInput;
    AND?: Prisma.StreamsSubscriptionWhereInput | Prisma.StreamsSubscriptionWhereInput[];
    OR?: Prisma.StreamsSubscriptionWhereInput[];
    NOT?: Prisma.StreamsSubscriptionWhereInput | Prisma.StreamsSubscriptionWhereInput[];
    guildId?: Prisma.StringFilter<"StreamsSubscription"> | string;
    platform?: Prisma.EnumStreamsPlatformFilter<"StreamsSubscription"> | $Enums.StreamsPlatform;
    handle?: Prisma.StringFilter<"StreamsSubscription"> | string;
    displayName?: Prisma.StringFilter<"StreamsSubscription"> | string;
    avatarUrl?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    platformId?: Prisma.StringFilter<"StreamsSubscription"> | string;
    announceChannelId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    pingRoleId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    messageText?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    announceVideos?: Prisma.BoolFilter<"StreamsSubscription"> | boolean;
    enabled?: Prisma.BoolFilter<"StreamsSubscription"> | boolean;
    lastStreamId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    liveSince?: Prisma.DateTimeNullableFilter<"StreamsSubscription"> | Date | string | null;
    lastAnnouncementChannelId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    lastAnnouncementMessageId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    lastVideoId?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    lastCheckedAt?: Prisma.DateTimeNullableFilter<"StreamsSubscription"> | Date | string | null;
    offlineStreak?: Prisma.IntFilter<"StreamsSubscription"> | number;
    failureStreak?: Prisma.IntFilter<"StreamsSubscription"> | number;
    lastError?: Prisma.StringNullableFilter<"StreamsSubscription"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"StreamsSubscription"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"StreamsSubscription"> | Date | string;
}, "id" | "guildId_platform_platformId">;
export type StreamsSubscriptionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    handle?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    platformId?: Prisma.SortOrder;
    announceChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrderInput | Prisma.SortOrder;
    messageText?: Prisma.SortOrderInput | Prisma.SortOrder;
    announceVideos?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    lastStreamId?: Prisma.SortOrderInput | Prisma.SortOrder;
    liveSince?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastAnnouncementChannelId?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastAnnouncementMessageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastVideoId?: Prisma.SortOrderInput | Prisma.SortOrder;
    lastCheckedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    offlineStreak?: Prisma.SortOrder;
    failureStreak?: Prisma.SortOrder;
    lastError?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.StreamsSubscriptionCountOrderByAggregateInput;
    _avg?: Prisma.StreamsSubscriptionAvgOrderByAggregateInput;
    _max?: Prisma.StreamsSubscriptionMaxOrderByAggregateInput;
    _min?: Prisma.StreamsSubscriptionMinOrderByAggregateInput;
    _sum?: Prisma.StreamsSubscriptionSumOrderByAggregateInput;
};
export type StreamsSubscriptionScalarWhereWithAggregatesInput = {
    AND?: Prisma.StreamsSubscriptionScalarWhereWithAggregatesInput | Prisma.StreamsSubscriptionScalarWhereWithAggregatesInput[];
    OR?: Prisma.StreamsSubscriptionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.StreamsSubscriptionScalarWhereWithAggregatesInput | Prisma.StreamsSubscriptionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"StreamsSubscription"> | string;
    guildId?: Prisma.StringWithAggregatesFilter<"StreamsSubscription"> | string;
    platform?: Prisma.EnumStreamsPlatformWithAggregatesFilter<"StreamsSubscription"> | $Enums.StreamsPlatform;
    handle?: Prisma.StringWithAggregatesFilter<"StreamsSubscription"> | string;
    displayName?: Prisma.StringWithAggregatesFilter<"StreamsSubscription"> | string;
    avatarUrl?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    platformId?: Prisma.StringWithAggregatesFilter<"StreamsSubscription"> | string;
    announceChannelId?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    pingRoleId?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    messageText?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    announceVideos?: Prisma.BoolWithAggregatesFilter<"StreamsSubscription"> | boolean;
    enabled?: Prisma.BoolWithAggregatesFilter<"StreamsSubscription"> | boolean;
    lastStreamId?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    liveSince?: Prisma.DateTimeNullableWithAggregatesFilter<"StreamsSubscription"> | Date | string | null;
    lastAnnouncementChannelId?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    lastAnnouncementMessageId?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    lastVideoId?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    lastCheckedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"StreamsSubscription"> | Date | string | null;
    offlineStreak?: Prisma.IntWithAggregatesFilter<"StreamsSubscription"> | number;
    failureStreak?: Prisma.IntWithAggregatesFilter<"StreamsSubscription"> | number;
    lastError?: Prisma.StringNullableWithAggregatesFilter<"StreamsSubscription"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"StreamsSubscription"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"StreamsSubscription"> | Date | string;
};
export type StreamsSubscriptionCreateInput = {
    id?: string;
    guildId: string;
    platform: $Enums.StreamsPlatform;
    handle: string;
    displayName: string;
    avatarUrl?: string | null;
    platformId: string;
    announceChannelId?: string | null;
    pingRoleId?: string | null;
    messageText?: string | null;
    announceVideos?: boolean;
    enabled?: boolean;
    lastStreamId?: string | null;
    liveSince?: Date | string | null;
    lastAnnouncementChannelId?: string | null;
    lastAnnouncementMessageId?: string | null;
    lastVideoId?: string | null;
    lastCheckedAt?: Date | string | null;
    offlineStreak?: number;
    failureStreak?: number;
    lastError?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StreamsSubscriptionUncheckedCreateInput = {
    id?: string;
    guildId: string;
    platform: $Enums.StreamsPlatform;
    handle: string;
    displayName: string;
    avatarUrl?: string | null;
    platformId: string;
    announceChannelId?: string | null;
    pingRoleId?: string | null;
    messageText?: string | null;
    announceVideos?: boolean;
    enabled?: boolean;
    lastStreamId?: string | null;
    liveSince?: Date | string | null;
    lastAnnouncementChannelId?: string | null;
    lastAnnouncementMessageId?: string | null;
    lastVideoId?: string | null;
    lastCheckedAt?: Date | string | null;
    offlineStreak?: number;
    failureStreak?: number;
    lastError?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StreamsSubscriptionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.EnumStreamsPlatformFieldUpdateOperationsInput | $Enums.StreamsPlatform;
    handle?: Prisma.StringFieldUpdateOperationsInput | string;
    displayName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    platformId?: Prisma.StringFieldUpdateOperationsInput | string;
    announceChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pingRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    messageText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    announceVideos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    lastStreamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    liveSince?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    lastAnnouncementChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastAnnouncementMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastVideoId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastCheckedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    offlineStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    failureStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    lastError?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StreamsSubscriptionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.EnumStreamsPlatformFieldUpdateOperationsInput | $Enums.StreamsPlatform;
    handle?: Prisma.StringFieldUpdateOperationsInput | string;
    displayName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    platformId?: Prisma.StringFieldUpdateOperationsInput | string;
    announceChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pingRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    messageText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    announceVideos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    lastStreamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    liveSince?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    lastAnnouncementChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastAnnouncementMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastVideoId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastCheckedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    offlineStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    failureStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    lastError?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StreamsSubscriptionCreateManyInput = {
    id?: string;
    guildId: string;
    platform: $Enums.StreamsPlatform;
    handle: string;
    displayName: string;
    avatarUrl?: string | null;
    platformId: string;
    announceChannelId?: string | null;
    pingRoleId?: string | null;
    messageText?: string | null;
    announceVideos?: boolean;
    enabled?: boolean;
    lastStreamId?: string | null;
    liveSince?: Date | string | null;
    lastAnnouncementChannelId?: string | null;
    lastAnnouncementMessageId?: string | null;
    lastVideoId?: string | null;
    lastCheckedAt?: Date | string | null;
    offlineStreak?: number;
    failureStreak?: number;
    lastError?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type StreamsSubscriptionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.EnumStreamsPlatformFieldUpdateOperationsInput | $Enums.StreamsPlatform;
    handle?: Prisma.StringFieldUpdateOperationsInput | string;
    displayName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    platformId?: Prisma.StringFieldUpdateOperationsInput | string;
    announceChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pingRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    messageText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    announceVideos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    lastStreamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    liveSince?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    lastAnnouncementChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastAnnouncementMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastVideoId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastCheckedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    offlineStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    failureStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    lastError?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StreamsSubscriptionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    platform?: Prisma.EnumStreamsPlatformFieldUpdateOperationsInput | $Enums.StreamsPlatform;
    handle?: Prisma.StringFieldUpdateOperationsInput | string;
    displayName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    platformId?: Prisma.StringFieldUpdateOperationsInput | string;
    announceChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    pingRoleId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    messageText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    announceVideos?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    lastStreamId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    liveSince?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    lastAnnouncementChannelId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastAnnouncementMessageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastVideoId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    lastCheckedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    offlineStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    failureStreak?: Prisma.IntFieldUpdateOperationsInput | number;
    lastError?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type StreamsSubscriptionGuildIdPlatformPlatformIdCompoundUniqueInput = {
    guildId: string;
    platform: $Enums.StreamsPlatform;
    platformId: string;
};
export type StreamsSubscriptionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    handle?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrder;
    platformId?: Prisma.SortOrder;
    announceChannelId?: Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrder;
    messageText?: Prisma.SortOrder;
    announceVideos?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    lastStreamId?: Prisma.SortOrder;
    liveSince?: Prisma.SortOrder;
    lastAnnouncementChannelId?: Prisma.SortOrder;
    lastAnnouncementMessageId?: Prisma.SortOrder;
    lastVideoId?: Prisma.SortOrder;
    lastCheckedAt?: Prisma.SortOrder;
    offlineStreak?: Prisma.SortOrder;
    failureStreak?: Prisma.SortOrder;
    lastError?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StreamsSubscriptionAvgOrderByAggregateInput = {
    offlineStreak?: Prisma.SortOrder;
    failureStreak?: Prisma.SortOrder;
};
export type StreamsSubscriptionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    handle?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrder;
    platformId?: Prisma.SortOrder;
    announceChannelId?: Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrder;
    messageText?: Prisma.SortOrder;
    announceVideos?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    lastStreamId?: Prisma.SortOrder;
    liveSince?: Prisma.SortOrder;
    lastAnnouncementChannelId?: Prisma.SortOrder;
    lastAnnouncementMessageId?: Prisma.SortOrder;
    lastVideoId?: Prisma.SortOrder;
    lastCheckedAt?: Prisma.SortOrder;
    offlineStreak?: Prisma.SortOrder;
    failureStreak?: Prisma.SortOrder;
    lastError?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StreamsSubscriptionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    platform?: Prisma.SortOrder;
    handle?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrder;
    platformId?: Prisma.SortOrder;
    announceChannelId?: Prisma.SortOrder;
    pingRoleId?: Prisma.SortOrder;
    messageText?: Prisma.SortOrder;
    announceVideos?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    lastStreamId?: Prisma.SortOrder;
    liveSince?: Prisma.SortOrder;
    lastAnnouncementChannelId?: Prisma.SortOrder;
    lastAnnouncementMessageId?: Prisma.SortOrder;
    lastVideoId?: Prisma.SortOrder;
    lastCheckedAt?: Prisma.SortOrder;
    offlineStreak?: Prisma.SortOrder;
    failureStreak?: Prisma.SortOrder;
    lastError?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type StreamsSubscriptionSumOrderByAggregateInput = {
    offlineStreak?: Prisma.SortOrder;
    failureStreak?: Prisma.SortOrder;
};
export type EnumStreamsPlatformFieldUpdateOperationsInput = {
    set?: $Enums.StreamsPlatform;
};
export type StreamsSubscriptionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    platform?: boolean;
    handle?: boolean;
    displayName?: boolean;
    avatarUrl?: boolean;
    platformId?: boolean;
    announceChannelId?: boolean;
    pingRoleId?: boolean;
    messageText?: boolean;
    announceVideos?: boolean;
    enabled?: boolean;
    lastStreamId?: boolean;
    liveSince?: boolean;
    lastAnnouncementChannelId?: boolean;
    lastAnnouncementMessageId?: boolean;
    lastVideoId?: boolean;
    lastCheckedAt?: boolean;
    offlineStreak?: boolean;
    failureStreak?: boolean;
    lastError?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["streamsSubscription"]>;
export type StreamsSubscriptionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    platform?: boolean;
    handle?: boolean;
    displayName?: boolean;
    avatarUrl?: boolean;
    platformId?: boolean;
    announceChannelId?: boolean;
    pingRoleId?: boolean;
    messageText?: boolean;
    announceVideos?: boolean;
    enabled?: boolean;
    lastStreamId?: boolean;
    liveSince?: boolean;
    lastAnnouncementChannelId?: boolean;
    lastAnnouncementMessageId?: boolean;
    lastVideoId?: boolean;
    lastCheckedAt?: boolean;
    offlineStreak?: boolean;
    failureStreak?: boolean;
    lastError?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["streamsSubscription"]>;
export type StreamsSubscriptionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    platform?: boolean;
    handle?: boolean;
    displayName?: boolean;
    avatarUrl?: boolean;
    platformId?: boolean;
    announceChannelId?: boolean;
    pingRoleId?: boolean;
    messageText?: boolean;
    announceVideos?: boolean;
    enabled?: boolean;
    lastStreamId?: boolean;
    liveSince?: boolean;
    lastAnnouncementChannelId?: boolean;
    lastAnnouncementMessageId?: boolean;
    lastVideoId?: boolean;
    lastCheckedAt?: boolean;
    offlineStreak?: boolean;
    failureStreak?: boolean;
    lastError?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["streamsSubscription"]>;
export type StreamsSubscriptionSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    platform?: boolean;
    handle?: boolean;
    displayName?: boolean;
    avatarUrl?: boolean;
    platformId?: boolean;
    announceChannelId?: boolean;
    pingRoleId?: boolean;
    messageText?: boolean;
    announceVideos?: boolean;
    enabled?: boolean;
    lastStreamId?: boolean;
    liveSince?: boolean;
    lastAnnouncementChannelId?: boolean;
    lastAnnouncementMessageId?: boolean;
    lastVideoId?: boolean;
    lastCheckedAt?: boolean;
    offlineStreak?: boolean;
    failureStreak?: boolean;
    lastError?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type StreamsSubscriptionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "platform" | "handle" | "displayName" | "avatarUrl" | "platformId" | "announceChannelId" | "pingRoleId" | "messageText" | "announceVideos" | "enabled" | "lastStreamId" | "liveSince" | "lastAnnouncementChannelId" | "lastAnnouncementMessageId" | "lastVideoId" | "lastCheckedAt" | "offlineStreak" | "failureStreak" | "lastError" | "createdAt" | "updatedAt", ExtArgs["result"]["streamsSubscription"]>;
export type $StreamsSubscriptionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "StreamsSubscription";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        platform: $Enums.StreamsPlatform;
        handle: string;
        displayName: string;
        avatarUrl: string | null;
        platformId: string;
        announceChannelId: string | null;
        pingRoleId: string | null;
        messageText: string | null;
        announceVideos: boolean;
        enabled: boolean;
        lastStreamId: string | null;
        liveSince: Date | null;
        lastAnnouncementChannelId: string | null;
        lastAnnouncementMessageId: string | null;
        lastVideoId: string | null;
        lastCheckedAt: Date | null;
        offlineStreak: number;
        failureStreak: number;
        lastError: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["streamsSubscription"]>;
    composites: {};
};
export type StreamsSubscriptionGetPayload<S extends boolean | null | undefined | StreamsSubscriptionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload, S>;
export type StreamsSubscriptionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<StreamsSubscriptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: StreamsSubscriptionCountAggregateInputType | true;
};
export interface StreamsSubscriptionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['StreamsSubscription'];
        meta: {
            name: 'StreamsSubscription';
        };
    };
    /**
     * Find zero or one StreamsSubscription that matches the filter.
     * @param {StreamsSubscriptionFindUniqueArgs} args - Arguments to find a StreamsSubscription
     * @example
     * // Get one StreamsSubscription
     * const streamsSubscription = await prisma.streamsSubscription.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StreamsSubscriptionFindUniqueArgs>(args: Prisma.SelectSubset<T, StreamsSubscriptionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__StreamsSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one StreamsSubscription that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StreamsSubscriptionFindUniqueOrThrowArgs} args - Arguments to find a StreamsSubscription
     * @example
     * // Get one StreamsSubscription
     * const streamsSubscription = await prisma.streamsSubscription.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StreamsSubscriptionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, StreamsSubscriptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__StreamsSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first StreamsSubscription that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StreamsSubscriptionFindFirstArgs} args - Arguments to find a StreamsSubscription
     * @example
     * // Get one StreamsSubscription
     * const streamsSubscription = await prisma.streamsSubscription.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StreamsSubscriptionFindFirstArgs>(args?: Prisma.SelectSubset<T, StreamsSubscriptionFindFirstArgs<ExtArgs>>): Prisma.Prisma__StreamsSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first StreamsSubscription that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StreamsSubscriptionFindFirstOrThrowArgs} args - Arguments to find a StreamsSubscription
     * @example
     * // Get one StreamsSubscription
     * const streamsSubscription = await prisma.streamsSubscription.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StreamsSubscriptionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, StreamsSubscriptionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__StreamsSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more StreamsSubscriptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StreamsSubscriptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StreamsSubscriptions
     * const streamsSubscriptions = await prisma.streamsSubscription.findMany()
     *
     * // Get first 10 StreamsSubscriptions
     * const streamsSubscriptions = await prisma.streamsSubscription.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const streamsSubscriptionWithIdOnly = await prisma.streamsSubscription.findMany({ select: { id: true } })
     *
     */
    findMany<T extends StreamsSubscriptionFindManyArgs>(args?: Prisma.SelectSubset<T, StreamsSubscriptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a StreamsSubscription.
     * @param {StreamsSubscriptionCreateArgs} args - Arguments to create a StreamsSubscription.
     * @example
     * // Create one StreamsSubscription
     * const StreamsSubscription = await prisma.streamsSubscription.create({
     *   data: {
     *     // ... data to create a StreamsSubscription
     *   }
     * })
     *
     */
    create<T extends StreamsSubscriptionCreateArgs>(args: Prisma.SelectSubset<T, StreamsSubscriptionCreateArgs<ExtArgs>>): Prisma.Prisma__StreamsSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many StreamsSubscriptions.
     * @param {StreamsSubscriptionCreateManyArgs} args - Arguments to create many StreamsSubscriptions.
     * @example
     * // Create many StreamsSubscriptions
     * const streamsSubscription = await prisma.streamsSubscription.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends StreamsSubscriptionCreateManyArgs>(args?: Prisma.SelectSubset<T, StreamsSubscriptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many StreamsSubscriptions and returns the data saved in the database.
     * @param {StreamsSubscriptionCreateManyAndReturnArgs} args - Arguments to create many StreamsSubscriptions.
     * @example
     * // Create many StreamsSubscriptions
     * const streamsSubscription = await prisma.streamsSubscription.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many StreamsSubscriptions and only return the `id`
     * const streamsSubscriptionWithIdOnly = await prisma.streamsSubscription.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends StreamsSubscriptionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, StreamsSubscriptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a StreamsSubscription.
     * @param {StreamsSubscriptionDeleteArgs} args - Arguments to delete one StreamsSubscription.
     * @example
     * // Delete one StreamsSubscription
     * const StreamsSubscription = await prisma.streamsSubscription.delete({
     *   where: {
     *     // ... filter to delete one StreamsSubscription
     *   }
     * })
     *
     */
    delete<T extends StreamsSubscriptionDeleteArgs>(args: Prisma.SelectSubset<T, StreamsSubscriptionDeleteArgs<ExtArgs>>): Prisma.Prisma__StreamsSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one StreamsSubscription.
     * @param {StreamsSubscriptionUpdateArgs} args - Arguments to update one StreamsSubscription.
     * @example
     * // Update one StreamsSubscription
     * const streamsSubscription = await prisma.streamsSubscription.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends StreamsSubscriptionUpdateArgs>(args: Prisma.SelectSubset<T, StreamsSubscriptionUpdateArgs<ExtArgs>>): Prisma.Prisma__StreamsSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more StreamsSubscriptions.
     * @param {StreamsSubscriptionDeleteManyArgs} args - Arguments to filter StreamsSubscriptions to delete.
     * @example
     * // Delete a few StreamsSubscriptions
     * const { count } = await prisma.streamsSubscription.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends StreamsSubscriptionDeleteManyArgs>(args?: Prisma.SelectSubset<T, StreamsSubscriptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more StreamsSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StreamsSubscriptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StreamsSubscriptions
     * const streamsSubscription = await prisma.streamsSubscription.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends StreamsSubscriptionUpdateManyArgs>(args: Prisma.SelectSubset<T, StreamsSubscriptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more StreamsSubscriptions and returns the data updated in the database.
     * @param {StreamsSubscriptionUpdateManyAndReturnArgs} args - Arguments to update many StreamsSubscriptions.
     * @example
     * // Update many StreamsSubscriptions
     * const streamsSubscription = await prisma.streamsSubscription.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more StreamsSubscriptions and only return the `id`
     * const streamsSubscriptionWithIdOnly = await prisma.streamsSubscription.updateManyAndReturn({
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
    updateManyAndReturn<T extends StreamsSubscriptionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, StreamsSubscriptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one StreamsSubscription.
     * @param {StreamsSubscriptionUpsertArgs} args - Arguments to update or create a StreamsSubscription.
     * @example
     * // Update or create a StreamsSubscription
     * const streamsSubscription = await prisma.streamsSubscription.upsert({
     *   create: {
     *     // ... data to create a StreamsSubscription
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StreamsSubscription we want to update
     *   }
     * })
     */
    upsert<T extends StreamsSubscriptionUpsertArgs>(args: Prisma.SelectSubset<T, StreamsSubscriptionUpsertArgs<ExtArgs>>): Prisma.Prisma__StreamsSubscriptionClient<runtime.Types.Result.GetResult<Prisma.$StreamsSubscriptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of StreamsSubscriptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StreamsSubscriptionCountArgs} args - Arguments to filter StreamsSubscriptions to count.
     * @example
     * // Count the number of StreamsSubscriptions
     * const count = await prisma.streamsSubscription.count({
     *   where: {
     *     // ... the filter for the StreamsSubscriptions we want to count
     *   }
     * })
    **/
    count<T extends StreamsSubscriptionCountArgs>(args?: Prisma.Subset<T, StreamsSubscriptionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], StreamsSubscriptionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a StreamsSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StreamsSubscriptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StreamsSubscriptionAggregateArgs>(args: Prisma.Subset<T, StreamsSubscriptionAggregateArgs>): Prisma.PrismaPromise<GetStreamsSubscriptionAggregateType<T>>;
    /**
     * Group by StreamsSubscription.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StreamsSubscriptionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends StreamsSubscriptionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: StreamsSubscriptionGroupByArgs['orderBy'];
    } : {
        orderBy?: StreamsSubscriptionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, StreamsSubscriptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStreamsSubscriptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the StreamsSubscription model
     */
    readonly fields: StreamsSubscriptionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for StreamsSubscription.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__StreamsSubscriptionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the StreamsSubscription model
 */
export interface StreamsSubscriptionFieldRefs {
    readonly id: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly guildId: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly platform: Prisma.FieldRef<"StreamsSubscription", 'StreamsPlatform'>;
    readonly handle: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly displayName: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly avatarUrl: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly platformId: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly announceChannelId: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly pingRoleId: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly messageText: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly announceVideos: Prisma.FieldRef<"StreamsSubscription", 'Boolean'>;
    readonly enabled: Prisma.FieldRef<"StreamsSubscription", 'Boolean'>;
    readonly lastStreamId: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly liveSince: Prisma.FieldRef<"StreamsSubscription", 'DateTime'>;
    readonly lastAnnouncementChannelId: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly lastAnnouncementMessageId: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly lastVideoId: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly lastCheckedAt: Prisma.FieldRef<"StreamsSubscription", 'DateTime'>;
    readonly offlineStreak: Prisma.FieldRef<"StreamsSubscription", 'Int'>;
    readonly failureStreak: Prisma.FieldRef<"StreamsSubscription", 'Int'>;
    readonly lastError: Prisma.FieldRef<"StreamsSubscription", 'String'>;
    readonly createdAt: Prisma.FieldRef<"StreamsSubscription", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"StreamsSubscription", 'DateTime'>;
}
/**
 * StreamsSubscription findUnique
 */
export type StreamsSubscriptionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * Filter, which StreamsSubscription to fetch.
     */
    where: Prisma.StreamsSubscriptionWhereUniqueInput;
};
/**
 * StreamsSubscription findUniqueOrThrow
 */
export type StreamsSubscriptionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * Filter, which StreamsSubscription to fetch.
     */
    where: Prisma.StreamsSubscriptionWhereUniqueInput;
};
/**
 * StreamsSubscription findFirst
 */
export type StreamsSubscriptionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * Filter, which StreamsSubscription to fetch.
     */
    where?: Prisma.StreamsSubscriptionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of StreamsSubscriptions to fetch.
     */
    orderBy?: Prisma.StreamsSubscriptionOrderByWithRelationInput | Prisma.StreamsSubscriptionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for StreamsSubscriptions.
     */
    cursor?: Prisma.StreamsSubscriptionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` StreamsSubscriptions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` StreamsSubscriptions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of StreamsSubscriptions.
     */
    distinct?: Prisma.StreamsSubscriptionScalarFieldEnum | Prisma.StreamsSubscriptionScalarFieldEnum[];
};
/**
 * StreamsSubscription findFirstOrThrow
 */
export type StreamsSubscriptionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * Filter, which StreamsSubscription to fetch.
     */
    where?: Prisma.StreamsSubscriptionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of StreamsSubscriptions to fetch.
     */
    orderBy?: Prisma.StreamsSubscriptionOrderByWithRelationInput | Prisma.StreamsSubscriptionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for StreamsSubscriptions.
     */
    cursor?: Prisma.StreamsSubscriptionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` StreamsSubscriptions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` StreamsSubscriptions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of StreamsSubscriptions.
     */
    distinct?: Prisma.StreamsSubscriptionScalarFieldEnum | Prisma.StreamsSubscriptionScalarFieldEnum[];
};
/**
 * StreamsSubscription findMany
 */
export type StreamsSubscriptionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * Filter, which StreamsSubscriptions to fetch.
     */
    where?: Prisma.StreamsSubscriptionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of StreamsSubscriptions to fetch.
     */
    orderBy?: Prisma.StreamsSubscriptionOrderByWithRelationInput | Prisma.StreamsSubscriptionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing StreamsSubscriptions.
     */
    cursor?: Prisma.StreamsSubscriptionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` StreamsSubscriptions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` StreamsSubscriptions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of StreamsSubscriptions.
     */
    distinct?: Prisma.StreamsSubscriptionScalarFieldEnum | Prisma.StreamsSubscriptionScalarFieldEnum[];
};
/**
 * StreamsSubscription create
 */
export type StreamsSubscriptionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * The data needed to create a StreamsSubscription.
     */
    data: Prisma.XOR<Prisma.StreamsSubscriptionCreateInput, Prisma.StreamsSubscriptionUncheckedCreateInput>;
};
/**
 * StreamsSubscription createMany
 */
export type StreamsSubscriptionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many StreamsSubscriptions.
     */
    data: Prisma.StreamsSubscriptionCreateManyInput | Prisma.StreamsSubscriptionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * StreamsSubscription createManyAndReturn
 */
export type StreamsSubscriptionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * The data used to create many StreamsSubscriptions.
     */
    data: Prisma.StreamsSubscriptionCreateManyInput | Prisma.StreamsSubscriptionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * StreamsSubscription update
 */
export type StreamsSubscriptionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * The data needed to update a StreamsSubscription.
     */
    data: Prisma.XOR<Prisma.StreamsSubscriptionUpdateInput, Prisma.StreamsSubscriptionUncheckedUpdateInput>;
    /**
     * Choose, which StreamsSubscription to update.
     */
    where: Prisma.StreamsSubscriptionWhereUniqueInput;
};
/**
 * StreamsSubscription updateMany
 */
export type StreamsSubscriptionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update StreamsSubscriptions.
     */
    data: Prisma.XOR<Prisma.StreamsSubscriptionUpdateManyMutationInput, Prisma.StreamsSubscriptionUncheckedUpdateManyInput>;
    /**
     * Filter which StreamsSubscriptions to update
     */
    where?: Prisma.StreamsSubscriptionWhereInput;
    /**
     * Limit how many StreamsSubscriptions to update.
     */
    limit?: number;
};
/**
 * StreamsSubscription updateManyAndReturn
 */
export type StreamsSubscriptionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * The data used to update StreamsSubscriptions.
     */
    data: Prisma.XOR<Prisma.StreamsSubscriptionUpdateManyMutationInput, Prisma.StreamsSubscriptionUncheckedUpdateManyInput>;
    /**
     * Filter which StreamsSubscriptions to update
     */
    where?: Prisma.StreamsSubscriptionWhereInput;
    /**
     * Limit how many StreamsSubscriptions to update.
     */
    limit?: number;
};
/**
 * StreamsSubscription upsert
 */
export type StreamsSubscriptionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * The filter to search for the StreamsSubscription to update in case it exists.
     */
    where: Prisma.StreamsSubscriptionWhereUniqueInput;
    /**
     * In case the StreamsSubscription found by the `where` argument doesn't exist, create a new StreamsSubscription with this data.
     */
    create: Prisma.XOR<Prisma.StreamsSubscriptionCreateInput, Prisma.StreamsSubscriptionUncheckedCreateInput>;
    /**
     * In case the StreamsSubscription was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.StreamsSubscriptionUpdateInput, Prisma.StreamsSubscriptionUncheckedUpdateInput>;
};
/**
 * StreamsSubscription delete
 */
export type StreamsSubscriptionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
    /**
     * Filter which StreamsSubscription to delete.
     */
    where: Prisma.StreamsSubscriptionWhereUniqueInput;
};
/**
 * StreamsSubscription deleteMany
 */
export type StreamsSubscriptionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which StreamsSubscriptions to delete
     */
    where?: Prisma.StreamsSubscriptionWhereInput;
    /**
     * Limit how many StreamsSubscriptions to delete.
     */
    limit?: number;
};
/**
 * StreamsSubscription without action
 */
export type StreamsSubscriptionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StreamsSubscription
     */
    select?: Prisma.StreamsSubscriptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the StreamsSubscription
     */
    omit?: Prisma.StreamsSubscriptionOmit<ExtArgs> | null;
};
//# sourceMappingURL=StreamsSubscription.d.ts.map
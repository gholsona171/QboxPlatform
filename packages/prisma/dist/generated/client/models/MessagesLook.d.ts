import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model MessagesLook
 *
 */
export type MessagesLookModel = runtime.Types.Result.DefaultSelection<Prisma.$MessagesLookPayload>;
export type AggregateMessagesLook = {
    _count: MessagesLookCountAggregateOutputType | null;
    _avg: MessagesLookAvgAggregateOutputType | null;
    _sum: MessagesLookSumAggregateOutputType | null;
    _min: MessagesLookMinAggregateOutputType | null;
    _max: MessagesLookMaxAggregateOutputType | null;
};
export type MessagesLookAvgAggregateOutputType = {
    revision: number | null;
};
export type MessagesLookSumAggregateOutputType = {
    revision: number | null;
};
export type MessagesLookMinAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    accentColor: string | null;
    footerText: string | null;
    footerIconUrl: string | null;
    authorName: string | null;
    authorIconUrl: string | null;
    thumbnailUrl: string | null;
    showTimestamp: boolean | null;
    mode: $Enums.MessagesLookMode | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MessagesLookMaxAggregateOutputType = {
    guildId: string | null;
    enabled: boolean | null;
    accentColor: string | null;
    footerText: string | null;
    footerIconUrl: string | null;
    authorName: string | null;
    authorIconUrl: string | null;
    thumbnailUrl: string | null;
    showTimestamp: boolean | null;
    mode: $Enums.MessagesLookMode | null;
    revision: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MessagesLookCountAggregateOutputType = {
    guildId: number;
    enabled: number;
    accentColor: number;
    footerText: number;
    footerIconUrl: number;
    authorName: number;
    authorIconUrl: number;
    thumbnailUrl: number;
    showTimestamp: number;
    mode: number;
    revision: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type MessagesLookAvgAggregateInputType = {
    revision?: true;
};
export type MessagesLookSumAggregateInputType = {
    revision?: true;
};
export type MessagesLookMinAggregateInputType = {
    guildId?: true;
    enabled?: true;
    accentColor?: true;
    footerText?: true;
    footerIconUrl?: true;
    authorName?: true;
    authorIconUrl?: true;
    thumbnailUrl?: true;
    showTimestamp?: true;
    mode?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MessagesLookMaxAggregateInputType = {
    guildId?: true;
    enabled?: true;
    accentColor?: true;
    footerText?: true;
    footerIconUrl?: true;
    authorName?: true;
    authorIconUrl?: true;
    thumbnailUrl?: true;
    showTimestamp?: true;
    mode?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MessagesLookCountAggregateInputType = {
    guildId?: true;
    enabled?: true;
    accentColor?: true;
    footerText?: true;
    footerIconUrl?: true;
    authorName?: true;
    authorIconUrl?: true;
    thumbnailUrl?: true;
    showTimestamp?: true;
    mode?: true;
    revision?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type MessagesLookAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MessagesLook to aggregate.
     */
    where?: Prisma.MessagesLookWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MessagesLooks to fetch.
     */
    orderBy?: Prisma.MessagesLookOrderByWithRelationInput | Prisma.MessagesLookOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.MessagesLookWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MessagesLooks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MessagesLooks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned MessagesLooks
    **/
    _count?: true | MessagesLookCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: MessagesLookAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: MessagesLookSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: MessagesLookMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: MessagesLookMaxAggregateInputType;
};
export type GetMessagesLookAggregateType<T extends MessagesLookAggregateArgs> = {
    [P in keyof T & keyof AggregateMessagesLook]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMessagesLook[P]> : Prisma.GetScalarType<T[P], AggregateMessagesLook[P]>;
};
export type MessagesLookGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MessagesLookWhereInput;
    orderBy?: Prisma.MessagesLookOrderByWithAggregationInput | Prisma.MessagesLookOrderByWithAggregationInput[];
    by: Prisma.MessagesLookScalarFieldEnum[] | Prisma.MessagesLookScalarFieldEnum;
    having?: Prisma.MessagesLookScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MessagesLookCountAggregateInputType | true;
    _avg?: MessagesLookAvgAggregateInputType;
    _sum?: MessagesLookSumAggregateInputType;
    _min?: MessagesLookMinAggregateInputType;
    _max?: MessagesLookMaxAggregateInputType;
};
export type MessagesLookGroupByOutputType = {
    guildId: string;
    enabled: boolean;
    accentColor: string | null;
    footerText: string | null;
    footerIconUrl: string | null;
    authorName: string | null;
    authorIconUrl: string | null;
    thumbnailUrl: string | null;
    showTimestamp: boolean;
    mode: $Enums.MessagesLookMode;
    revision: number;
    createdAt: Date;
    updatedAt: Date;
    _count: MessagesLookCountAggregateOutputType | null;
    _avg: MessagesLookAvgAggregateOutputType | null;
    _sum: MessagesLookSumAggregateOutputType | null;
    _min: MessagesLookMinAggregateOutputType | null;
    _max: MessagesLookMaxAggregateOutputType | null;
};
export type GetMessagesLookGroupByPayload<T extends MessagesLookGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MessagesLookGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MessagesLookGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MessagesLookGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MessagesLookGroupByOutputType[P]>;
}>>;
export type MessagesLookWhereInput = {
    AND?: Prisma.MessagesLookWhereInput | Prisma.MessagesLookWhereInput[];
    OR?: Prisma.MessagesLookWhereInput[];
    NOT?: Prisma.MessagesLookWhereInput | Prisma.MessagesLookWhereInput[];
    guildId?: Prisma.StringFilter<"MessagesLook"> | string;
    enabled?: Prisma.BoolFilter<"MessagesLook"> | boolean;
    accentColor?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    footerText?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    footerIconUrl?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    authorName?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    authorIconUrl?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    thumbnailUrl?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    showTimestamp?: Prisma.BoolFilter<"MessagesLook"> | boolean;
    mode?: Prisma.EnumMessagesLookModeFilter<"MessagesLook"> | $Enums.MessagesLookMode;
    revision?: Prisma.IntFilter<"MessagesLook"> | number;
    createdAt?: Prisma.DateTimeFilter<"MessagesLook"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MessagesLook"> | Date | string;
};
export type MessagesLookOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    accentColor?: Prisma.SortOrderInput | Prisma.SortOrder;
    footerText?: Prisma.SortOrderInput | Prisma.SortOrder;
    footerIconUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    authorName?: Prisma.SortOrderInput | Prisma.SortOrder;
    authorIconUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    showTimestamp?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MessagesLookWhereUniqueInput = Prisma.AtLeast<{
    guildId?: string;
    AND?: Prisma.MessagesLookWhereInput | Prisma.MessagesLookWhereInput[];
    OR?: Prisma.MessagesLookWhereInput[];
    NOT?: Prisma.MessagesLookWhereInput | Prisma.MessagesLookWhereInput[];
    enabled?: Prisma.BoolFilter<"MessagesLook"> | boolean;
    accentColor?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    footerText?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    footerIconUrl?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    authorName?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    authorIconUrl?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    thumbnailUrl?: Prisma.StringNullableFilter<"MessagesLook"> | string | null;
    showTimestamp?: Prisma.BoolFilter<"MessagesLook"> | boolean;
    mode?: Prisma.EnumMessagesLookModeFilter<"MessagesLook"> | $Enums.MessagesLookMode;
    revision?: Prisma.IntFilter<"MessagesLook"> | number;
    createdAt?: Prisma.DateTimeFilter<"MessagesLook"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MessagesLook"> | Date | string;
}, "guildId">;
export type MessagesLookOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    accentColor?: Prisma.SortOrderInput | Prisma.SortOrder;
    footerText?: Prisma.SortOrderInput | Prisma.SortOrder;
    footerIconUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    authorName?: Prisma.SortOrderInput | Prisma.SortOrder;
    authorIconUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    showTimestamp?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.MessagesLookCountOrderByAggregateInput;
    _avg?: Prisma.MessagesLookAvgOrderByAggregateInput;
    _max?: Prisma.MessagesLookMaxOrderByAggregateInput;
    _min?: Prisma.MessagesLookMinOrderByAggregateInput;
    _sum?: Prisma.MessagesLookSumOrderByAggregateInput;
};
export type MessagesLookScalarWhereWithAggregatesInput = {
    AND?: Prisma.MessagesLookScalarWhereWithAggregatesInput | Prisma.MessagesLookScalarWhereWithAggregatesInput[];
    OR?: Prisma.MessagesLookScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MessagesLookScalarWhereWithAggregatesInput | Prisma.MessagesLookScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"MessagesLook"> | string;
    enabled?: Prisma.BoolWithAggregatesFilter<"MessagesLook"> | boolean;
    accentColor?: Prisma.StringNullableWithAggregatesFilter<"MessagesLook"> | string | null;
    footerText?: Prisma.StringNullableWithAggregatesFilter<"MessagesLook"> | string | null;
    footerIconUrl?: Prisma.StringNullableWithAggregatesFilter<"MessagesLook"> | string | null;
    authorName?: Prisma.StringNullableWithAggregatesFilter<"MessagesLook"> | string | null;
    authorIconUrl?: Prisma.StringNullableWithAggregatesFilter<"MessagesLook"> | string | null;
    thumbnailUrl?: Prisma.StringNullableWithAggregatesFilter<"MessagesLook"> | string | null;
    showTimestamp?: Prisma.BoolWithAggregatesFilter<"MessagesLook"> | boolean;
    mode?: Prisma.EnumMessagesLookModeWithAggregatesFilter<"MessagesLook"> | $Enums.MessagesLookMode;
    revision?: Prisma.IntWithAggregatesFilter<"MessagesLook"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"MessagesLook"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"MessagesLook"> | Date | string;
};
export type MessagesLookCreateInput = {
    guildId: string;
    enabled?: boolean;
    accentColor?: string | null;
    footerText?: string | null;
    footerIconUrl?: string | null;
    authorName?: string | null;
    authorIconUrl?: string | null;
    thumbnailUrl?: string | null;
    showTimestamp?: boolean;
    mode?: $Enums.MessagesLookMode;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MessagesLookUncheckedCreateInput = {
    guildId: string;
    enabled?: boolean;
    accentColor?: string | null;
    footerText?: string | null;
    footerIconUrl?: string | null;
    authorName?: string | null;
    authorIconUrl?: string | null;
    thumbnailUrl?: string | null;
    showTimestamp?: boolean;
    mode?: $Enums.MessagesLookMode;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MessagesLookUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    accentColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    footerText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    footerIconUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorIconUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    thumbnailUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    showTimestamp?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    mode?: Prisma.EnumMessagesLookModeFieldUpdateOperationsInput | $Enums.MessagesLookMode;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MessagesLookUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    accentColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    footerText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    footerIconUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorIconUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    thumbnailUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    showTimestamp?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    mode?: Prisma.EnumMessagesLookModeFieldUpdateOperationsInput | $Enums.MessagesLookMode;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MessagesLookCreateManyInput = {
    guildId: string;
    enabled?: boolean;
    accentColor?: string | null;
    footerText?: string | null;
    footerIconUrl?: string | null;
    authorName?: string | null;
    authorIconUrl?: string | null;
    thumbnailUrl?: string | null;
    showTimestamp?: boolean;
    mode?: $Enums.MessagesLookMode;
    revision?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MessagesLookUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    accentColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    footerText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    footerIconUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorIconUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    thumbnailUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    showTimestamp?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    mode?: Prisma.EnumMessagesLookModeFieldUpdateOperationsInput | $Enums.MessagesLookMode;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MessagesLookUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    enabled?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    accentColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    footerText?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    footerIconUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    authorIconUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    thumbnailUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    showTimestamp?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    mode?: Prisma.EnumMessagesLookModeFieldUpdateOperationsInput | $Enums.MessagesLookMode;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MessagesLookCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    accentColor?: Prisma.SortOrder;
    footerText?: Prisma.SortOrder;
    footerIconUrl?: Prisma.SortOrder;
    authorName?: Prisma.SortOrder;
    authorIconUrl?: Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrder;
    showTimestamp?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MessagesLookAvgOrderByAggregateInput = {
    revision?: Prisma.SortOrder;
};
export type MessagesLookMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    accentColor?: Prisma.SortOrder;
    footerText?: Prisma.SortOrder;
    footerIconUrl?: Prisma.SortOrder;
    authorName?: Prisma.SortOrder;
    authorIconUrl?: Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrder;
    showTimestamp?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MessagesLookMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    enabled?: Prisma.SortOrder;
    accentColor?: Prisma.SortOrder;
    footerText?: Prisma.SortOrder;
    footerIconUrl?: Prisma.SortOrder;
    authorName?: Prisma.SortOrder;
    authorIconUrl?: Prisma.SortOrder;
    thumbnailUrl?: Prisma.SortOrder;
    showTimestamp?: Prisma.SortOrder;
    mode?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MessagesLookSumOrderByAggregateInput = {
    revision?: Prisma.SortOrder;
};
export type EnumMessagesLookModeFieldUpdateOperationsInput = {
    set?: $Enums.MessagesLookMode;
};
export type MessagesLookSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    accentColor?: boolean;
    footerText?: boolean;
    footerIconUrl?: boolean;
    authorName?: boolean;
    authorIconUrl?: boolean;
    thumbnailUrl?: boolean;
    showTimestamp?: boolean;
    mode?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["messagesLook"]>;
export type MessagesLookSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    accentColor?: boolean;
    footerText?: boolean;
    footerIconUrl?: boolean;
    authorName?: boolean;
    authorIconUrl?: boolean;
    thumbnailUrl?: boolean;
    showTimestamp?: boolean;
    mode?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["messagesLook"]>;
export type MessagesLookSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    enabled?: boolean;
    accentColor?: boolean;
    footerText?: boolean;
    footerIconUrl?: boolean;
    authorName?: boolean;
    authorIconUrl?: boolean;
    thumbnailUrl?: boolean;
    showTimestamp?: boolean;
    mode?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["messagesLook"]>;
export type MessagesLookSelectScalar = {
    guildId?: boolean;
    enabled?: boolean;
    accentColor?: boolean;
    footerText?: boolean;
    footerIconUrl?: boolean;
    authorName?: boolean;
    authorIconUrl?: boolean;
    thumbnailUrl?: boolean;
    showTimestamp?: boolean;
    mode?: boolean;
    revision?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type MessagesLookOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "enabled" | "accentColor" | "footerText" | "footerIconUrl" | "authorName" | "authorIconUrl" | "thumbnailUrl" | "showTimestamp" | "mode" | "revision" | "createdAt" | "updatedAt", ExtArgs["result"]["messagesLook"]>;
export type $MessagesLookPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MessagesLook";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        enabled: boolean;
        accentColor: string | null;
        footerText: string | null;
        footerIconUrl: string | null;
        authorName: string | null;
        authorIconUrl: string | null;
        thumbnailUrl: string | null;
        showTimestamp: boolean;
        mode: $Enums.MessagesLookMode;
        revision: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["messagesLook"]>;
    composites: {};
};
export type MessagesLookGetPayload<S extends boolean | null | undefined | MessagesLookDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload, S>;
export type MessagesLookCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MessagesLookFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MessagesLookCountAggregateInputType | true;
};
export interface MessagesLookDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MessagesLook'];
        meta: {
            name: 'MessagesLook';
        };
    };
    /**
     * Find zero or one MessagesLook that matches the filter.
     * @param {MessagesLookFindUniqueArgs} args - Arguments to find a MessagesLook
     * @example
     * // Get one MessagesLook
     * const messagesLook = await prisma.messagesLook.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MessagesLookFindUniqueArgs>(args: Prisma.SelectSubset<T, MessagesLookFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MessagesLookClient<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one MessagesLook that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MessagesLookFindUniqueOrThrowArgs} args - Arguments to find a MessagesLook
     * @example
     * // Get one MessagesLook
     * const messagesLook = await prisma.messagesLook.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MessagesLookFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MessagesLookFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MessagesLookClient<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MessagesLook that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessagesLookFindFirstArgs} args - Arguments to find a MessagesLook
     * @example
     * // Get one MessagesLook
     * const messagesLook = await prisma.messagesLook.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MessagesLookFindFirstArgs>(args?: Prisma.SelectSubset<T, MessagesLookFindFirstArgs<ExtArgs>>): Prisma.Prisma__MessagesLookClient<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MessagesLook that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessagesLookFindFirstOrThrowArgs} args - Arguments to find a MessagesLook
     * @example
     * // Get one MessagesLook
     * const messagesLook = await prisma.messagesLook.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MessagesLookFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MessagesLookFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MessagesLookClient<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more MessagesLooks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessagesLookFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MessagesLooks
     * const messagesLooks = await prisma.messagesLook.findMany()
     *
     * // Get first 10 MessagesLooks
     * const messagesLooks = await prisma.messagesLook.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const messagesLookWithGuildIdOnly = await prisma.messagesLook.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends MessagesLookFindManyArgs>(args?: Prisma.SelectSubset<T, MessagesLookFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a MessagesLook.
     * @param {MessagesLookCreateArgs} args - Arguments to create a MessagesLook.
     * @example
     * // Create one MessagesLook
     * const MessagesLook = await prisma.messagesLook.create({
     *   data: {
     *     // ... data to create a MessagesLook
     *   }
     * })
     *
     */
    create<T extends MessagesLookCreateArgs>(args: Prisma.SelectSubset<T, MessagesLookCreateArgs<ExtArgs>>): Prisma.Prisma__MessagesLookClient<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many MessagesLooks.
     * @param {MessagesLookCreateManyArgs} args - Arguments to create many MessagesLooks.
     * @example
     * // Create many MessagesLooks
     * const messagesLook = await prisma.messagesLook.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MessagesLookCreateManyArgs>(args?: Prisma.SelectSubset<T, MessagesLookCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many MessagesLooks and returns the data saved in the database.
     * @param {MessagesLookCreateManyAndReturnArgs} args - Arguments to create many MessagesLooks.
     * @example
     * // Create many MessagesLooks
     * const messagesLook = await prisma.messagesLook.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many MessagesLooks and only return the `guildId`
     * const messagesLookWithGuildIdOnly = await prisma.messagesLook.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MessagesLookCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MessagesLookCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a MessagesLook.
     * @param {MessagesLookDeleteArgs} args - Arguments to delete one MessagesLook.
     * @example
     * // Delete one MessagesLook
     * const MessagesLook = await prisma.messagesLook.delete({
     *   where: {
     *     // ... filter to delete one MessagesLook
     *   }
     * })
     *
     */
    delete<T extends MessagesLookDeleteArgs>(args: Prisma.SelectSubset<T, MessagesLookDeleteArgs<ExtArgs>>): Prisma.Prisma__MessagesLookClient<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one MessagesLook.
     * @param {MessagesLookUpdateArgs} args - Arguments to update one MessagesLook.
     * @example
     * // Update one MessagesLook
     * const messagesLook = await prisma.messagesLook.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MessagesLookUpdateArgs>(args: Prisma.SelectSubset<T, MessagesLookUpdateArgs<ExtArgs>>): Prisma.Prisma__MessagesLookClient<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more MessagesLooks.
     * @param {MessagesLookDeleteManyArgs} args - Arguments to filter MessagesLooks to delete.
     * @example
     * // Delete a few MessagesLooks
     * const { count } = await prisma.messagesLook.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MessagesLookDeleteManyArgs>(args?: Prisma.SelectSubset<T, MessagesLookDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MessagesLooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessagesLookUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MessagesLooks
     * const messagesLook = await prisma.messagesLook.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MessagesLookUpdateManyArgs>(args: Prisma.SelectSubset<T, MessagesLookUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MessagesLooks and returns the data updated in the database.
     * @param {MessagesLookUpdateManyAndReturnArgs} args - Arguments to update many MessagesLooks.
     * @example
     * // Update many MessagesLooks
     * const messagesLook = await prisma.messagesLook.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more MessagesLooks and only return the `guildId`
     * const messagesLookWithGuildIdOnly = await prisma.messagesLook.updateManyAndReturn({
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
    updateManyAndReturn<T extends MessagesLookUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MessagesLookUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one MessagesLook.
     * @param {MessagesLookUpsertArgs} args - Arguments to update or create a MessagesLook.
     * @example
     * // Update or create a MessagesLook
     * const messagesLook = await prisma.messagesLook.upsert({
     *   create: {
     *     // ... data to create a MessagesLook
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MessagesLook we want to update
     *   }
     * })
     */
    upsert<T extends MessagesLookUpsertArgs>(args: Prisma.SelectSubset<T, MessagesLookUpsertArgs<ExtArgs>>): Prisma.Prisma__MessagesLookClient<runtime.Types.Result.GetResult<Prisma.$MessagesLookPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of MessagesLooks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessagesLookCountArgs} args - Arguments to filter MessagesLooks to count.
     * @example
     * // Count the number of MessagesLooks
     * const count = await prisma.messagesLook.count({
     *   where: {
     *     // ... the filter for the MessagesLooks we want to count
     *   }
     * })
    **/
    count<T extends MessagesLookCountArgs>(args?: Prisma.Subset<T, MessagesLookCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MessagesLookCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a MessagesLook.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessagesLookAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MessagesLookAggregateArgs>(args: Prisma.Subset<T, MessagesLookAggregateArgs>): Prisma.PrismaPromise<GetMessagesLookAggregateType<T>>;
    /**
     * Group by MessagesLook.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessagesLookGroupByArgs} args - Group by arguments.
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
    groupBy<T extends MessagesLookGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MessagesLookGroupByArgs['orderBy'];
    } : {
        orderBy?: MessagesLookGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MessagesLookGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMessagesLookGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the MessagesLook model
     */
    readonly fields: MessagesLookFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for MessagesLook.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__MessagesLookClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the MessagesLook model
 */
export interface MessagesLookFieldRefs {
    readonly guildId: Prisma.FieldRef<"MessagesLook", 'String'>;
    readonly enabled: Prisma.FieldRef<"MessagesLook", 'Boolean'>;
    readonly accentColor: Prisma.FieldRef<"MessagesLook", 'String'>;
    readonly footerText: Prisma.FieldRef<"MessagesLook", 'String'>;
    readonly footerIconUrl: Prisma.FieldRef<"MessagesLook", 'String'>;
    readonly authorName: Prisma.FieldRef<"MessagesLook", 'String'>;
    readonly authorIconUrl: Prisma.FieldRef<"MessagesLook", 'String'>;
    readonly thumbnailUrl: Prisma.FieldRef<"MessagesLook", 'String'>;
    readonly showTimestamp: Prisma.FieldRef<"MessagesLook", 'Boolean'>;
    readonly mode: Prisma.FieldRef<"MessagesLook", 'MessagesLookMode'>;
    readonly revision: Prisma.FieldRef<"MessagesLook", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"MessagesLook", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"MessagesLook", 'DateTime'>;
}
/**
 * MessagesLook findUnique
 */
export type MessagesLookFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * Filter, which MessagesLook to fetch.
     */
    where: Prisma.MessagesLookWhereUniqueInput;
};
/**
 * MessagesLook findUniqueOrThrow
 */
export type MessagesLookFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * Filter, which MessagesLook to fetch.
     */
    where: Prisma.MessagesLookWhereUniqueInput;
};
/**
 * MessagesLook findFirst
 */
export type MessagesLookFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * Filter, which MessagesLook to fetch.
     */
    where?: Prisma.MessagesLookWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MessagesLooks to fetch.
     */
    orderBy?: Prisma.MessagesLookOrderByWithRelationInput | Prisma.MessagesLookOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MessagesLooks.
     */
    cursor?: Prisma.MessagesLookWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MessagesLooks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MessagesLooks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MessagesLooks.
     */
    distinct?: Prisma.MessagesLookScalarFieldEnum | Prisma.MessagesLookScalarFieldEnum[];
};
/**
 * MessagesLook findFirstOrThrow
 */
export type MessagesLookFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * Filter, which MessagesLook to fetch.
     */
    where?: Prisma.MessagesLookWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MessagesLooks to fetch.
     */
    orderBy?: Prisma.MessagesLookOrderByWithRelationInput | Prisma.MessagesLookOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MessagesLooks.
     */
    cursor?: Prisma.MessagesLookWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MessagesLooks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MessagesLooks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MessagesLooks.
     */
    distinct?: Prisma.MessagesLookScalarFieldEnum | Prisma.MessagesLookScalarFieldEnum[];
};
/**
 * MessagesLook findMany
 */
export type MessagesLookFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * Filter, which MessagesLooks to fetch.
     */
    where?: Prisma.MessagesLookWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MessagesLooks to fetch.
     */
    orderBy?: Prisma.MessagesLookOrderByWithRelationInput | Prisma.MessagesLookOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing MessagesLooks.
     */
    cursor?: Prisma.MessagesLookWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MessagesLooks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MessagesLooks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MessagesLooks.
     */
    distinct?: Prisma.MessagesLookScalarFieldEnum | Prisma.MessagesLookScalarFieldEnum[];
};
/**
 * MessagesLook create
 */
export type MessagesLookCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * The data needed to create a MessagesLook.
     */
    data: Prisma.XOR<Prisma.MessagesLookCreateInput, Prisma.MessagesLookUncheckedCreateInput>;
};
/**
 * MessagesLook createMany
 */
export type MessagesLookCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many MessagesLooks.
     */
    data: Prisma.MessagesLookCreateManyInput | Prisma.MessagesLookCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MessagesLook createManyAndReturn
 */
export type MessagesLookCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * The data used to create many MessagesLooks.
     */
    data: Prisma.MessagesLookCreateManyInput | Prisma.MessagesLookCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MessagesLook update
 */
export type MessagesLookUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * The data needed to update a MessagesLook.
     */
    data: Prisma.XOR<Prisma.MessagesLookUpdateInput, Prisma.MessagesLookUncheckedUpdateInput>;
    /**
     * Choose, which MessagesLook to update.
     */
    where: Prisma.MessagesLookWhereUniqueInput;
};
/**
 * MessagesLook updateMany
 */
export type MessagesLookUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update MessagesLooks.
     */
    data: Prisma.XOR<Prisma.MessagesLookUpdateManyMutationInput, Prisma.MessagesLookUncheckedUpdateManyInput>;
    /**
     * Filter which MessagesLooks to update
     */
    where?: Prisma.MessagesLookWhereInput;
    /**
     * Limit how many MessagesLooks to update.
     */
    limit?: number;
};
/**
 * MessagesLook updateManyAndReturn
 */
export type MessagesLookUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * The data used to update MessagesLooks.
     */
    data: Prisma.XOR<Prisma.MessagesLookUpdateManyMutationInput, Prisma.MessagesLookUncheckedUpdateManyInput>;
    /**
     * Filter which MessagesLooks to update
     */
    where?: Prisma.MessagesLookWhereInput;
    /**
     * Limit how many MessagesLooks to update.
     */
    limit?: number;
};
/**
 * MessagesLook upsert
 */
export type MessagesLookUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * The filter to search for the MessagesLook to update in case it exists.
     */
    where: Prisma.MessagesLookWhereUniqueInput;
    /**
     * In case the MessagesLook found by the `where` argument doesn't exist, create a new MessagesLook with this data.
     */
    create: Prisma.XOR<Prisma.MessagesLookCreateInput, Prisma.MessagesLookUncheckedCreateInput>;
    /**
     * In case the MessagesLook was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.MessagesLookUpdateInput, Prisma.MessagesLookUncheckedUpdateInput>;
};
/**
 * MessagesLook delete
 */
export type MessagesLookDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
    /**
     * Filter which MessagesLook to delete.
     */
    where: Prisma.MessagesLookWhereUniqueInput;
};
/**
 * MessagesLook deleteMany
 */
export type MessagesLookDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MessagesLooks to delete
     */
    where?: Prisma.MessagesLookWhereInput;
    /**
     * Limit how many MessagesLooks to delete.
     */
    limit?: number;
};
/**
 * MessagesLook without action
 */
export type MessagesLookDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MessagesLook
     */
    select?: Prisma.MessagesLookSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MessagesLook
     */
    omit?: Prisma.MessagesLookOmit<ExtArgs> | null;
};
//# sourceMappingURL=MessagesLook.d.ts.map
import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model VerificationAttempt
 *
 */
export type VerificationAttemptModel = runtime.Types.Result.DefaultSelection<Prisma.$VerificationAttemptPayload>;
export type AggregateVerificationAttempt = {
    _count: VerificationAttemptCountAggregateOutputType | null;
    _min: VerificationAttemptMinAggregateOutputType | null;
    _max: VerificationAttemptMaxAggregateOutputType | null;
};
export type VerificationAttemptMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    userId: string | null;
    userName: string | null;
    result: $Enums.VerificationAttemptResult | null;
    reason: string | null;
    staffId: string | null;
    staffName: string | null;
    source: $Enums.VerificationAttemptSource | null;
    createdAt: Date | null;
};
export type VerificationAttemptMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    userId: string | null;
    userName: string | null;
    result: $Enums.VerificationAttemptResult | null;
    reason: string | null;
    staffId: string | null;
    staffName: string | null;
    source: $Enums.VerificationAttemptSource | null;
    createdAt: Date | null;
};
export type VerificationAttemptCountAggregateOutputType = {
    id: number;
    guildId: number;
    userId: number;
    userName: number;
    result: number;
    reason: number;
    staffId: number;
    staffName: number;
    source: number;
    createdAt: number;
    _all: number;
};
export type VerificationAttemptMinAggregateInputType = {
    id?: true;
    guildId?: true;
    userId?: true;
    userName?: true;
    result?: true;
    reason?: true;
    staffId?: true;
    staffName?: true;
    source?: true;
    createdAt?: true;
};
export type VerificationAttemptMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    userId?: true;
    userName?: true;
    result?: true;
    reason?: true;
    staffId?: true;
    staffName?: true;
    source?: true;
    createdAt?: true;
};
export type VerificationAttemptCountAggregateInputType = {
    id?: true;
    guildId?: true;
    userId?: true;
    userName?: true;
    result?: true;
    reason?: true;
    staffId?: true;
    staffName?: true;
    source?: true;
    createdAt?: true;
    _all?: true;
};
export type VerificationAttemptAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationAttempt to aggregate.
     */
    where?: Prisma.VerificationAttemptWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationAttempts to fetch.
     */
    orderBy?: Prisma.VerificationAttemptOrderByWithRelationInput | Prisma.VerificationAttemptOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.VerificationAttemptWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationAttempts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationAttempts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned VerificationAttempts
    **/
    _count?: true | VerificationAttemptCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: VerificationAttemptMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: VerificationAttemptMaxAggregateInputType;
};
export type GetVerificationAttemptAggregateType<T extends VerificationAttemptAggregateArgs> = {
    [P in keyof T & keyof AggregateVerificationAttempt]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateVerificationAttempt[P]> : Prisma.GetScalarType<T[P], AggregateVerificationAttempt[P]>;
};
export type VerificationAttemptGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.VerificationAttemptWhereInput;
    orderBy?: Prisma.VerificationAttemptOrderByWithAggregationInput | Prisma.VerificationAttemptOrderByWithAggregationInput[];
    by: Prisma.VerificationAttemptScalarFieldEnum[] | Prisma.VerificationAttemptScalarFieldEnum;
    having?: Prisma.VerificationAttemptScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: VerificationAttemptCountAggregateInputType | true;
    _min?: VerificationAttemptMinAggregateInputType;
    _max?: VerificationAttemptMaxAggregateInputType;
};
export type VerificationAttemptGroupByOutputType = {
    id: string;
    guildId: string;
    userId: string;
    userName: string;
    result: $Enums.VerificationAttemptResult;
    reason: string | null;
    staffId: string | null;
    staffName: string | null;
    source: $Enums.VerificationAttemptSource;
    createdAt: Date;
    _count: VerificationAttemptCountAggregateOutputType | null;
    _min: VerificationAttemptMinAggregateOutputType | null;
    _max: VerificationAttemptMaxAggregateOutputType | null;
};
export type GetVerificationAttemptGroupByPayload<T extends VerificationAttemptGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<VerificationAttemptGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof VerificationAttemptGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], VerificationAttemptGroupByOutputType[P]> : Prisma.GetScalarType<T[P], VerificationAttemptGroupByOutputType[P]>;
}>>;
export type VerificationAttemptWhereInput = {
    AND?: Prisma.VerificationAttemptWhereInput | Prisma.VerificationAttemptWhereInput[];
    OR?: Prisma.VerificationAttemptWhereInput[];
    NOT?: Prisma.VerificationAttemptWhereInput | Prisma.VerificationAttemptWhereInput[];
    id?: Prisma.UuidFilter<"VerificationAttempt"> | string;
    guildId?: Prisma.StringFilter<"VerificationAttempt"> | string;
    userId?: Prisma.StringFilter<"VerificationAttempt"> | string;
    userName?: Prisma.StringFilter<"VerificationAttempt"> | string;
    result?: Prisma.EnumVerificationAttemptResultFilter<"VerificationAttempt"> | $Enums.VerificationAttemptResult;
    reason?: Prisma.StringNullableFilter<"VerificationAttempt"> | string | null;
    staffId?: Prisma.StringNullableFilter<"VerificationAttempt"> | string | null;
    staffName?: Prisma.StringNullableFilter<"VerificationAttempt"> | string | null;
    source?: Prisma.EnumVerificationAttemptSourceFilter<"VerificationAttempt"> | $Enums.VerificationAttemptSource;
    createdAt?: Prisma.DateTimeFilter<"VerificationAttempt"> | Date | string;
};
export type VerificationAttemptOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userName?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    reason?: Prisma.SortOrderInput | Prisma.SortOrder;
    staffId?: Prisma.SortOrderInput | Prisma.SortOrder;
    staffName?: Prisma.SortOrderInput | Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type VerificationAttemptWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.VerificationAttemptWhereInput | Prisma.VerificationAttemptWhereInput[];
    OR?: Prisma.VerificationAttemptWhereInput[];
    NOT?: Prisma.VerificationAttemptWhereInput | Prisma.VerificationAttemptWhereInput[];
    guildId?: Prisma.StringFilter<"VerificationAttempt"> | string;
    userId?: Prisma.StringFilter<"VerificationAttempt"> | string;
    userName?: Prisma.StringFilter<"VerificationAttempt"> | string;
    result?: Prisma.EnumVerificationAttemptResultFilter<"VerificationAttempt"> | $Enums.VerificationAttemptResult;
    reason?: Prisma.StringNullableFilter<"VerificationAttempt"> | string | null;
    staffId?: Prisma.StringNullableFilter<"VerificationAttempt"> | string | null;
    staffName?: Prisma.StringNullableFilter<"VerificationAttempt"> | string | null;
    source?: Prisma.EnumVerificationAttemptSourceFilter<"VerificationAttempt"> | $Enums.VerificationAttemptSource;
    createdAt?: Prisma.DateTimeFilter<"VerificationAttempt"> | Date | string;
}, "id">;
export type VerificationAttemptOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userName?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    reason?: Prisma.SortOrderInput | Prisma.SortOrder;
    staffId?: Prisma.SortOrderInput | Prisma.SortOrder;
    staffName?: Prisma.SortOrderInput | Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.VerificationAttemptCountOrderByAggregateInput;
    _max?: Prisma.VerificationAttemptMaxOrderByAggregateInput;
    _min?: Prisma.VerificationAttemptMinOrderByAggregateInput;
};
export type VerificationAttemptScalarWhereWithAggregatesInput = {
    AND?: Prisma.VerificationAttemptScalarWhereWithAggregatesInput | Prisma.VerificationAttemptScalarWhereWithAggregatesInput[];
    OR?: Prisma.VerificationAttemptScalarWhereWithAggregatesInput[];
    NOT?: Prisma.VerificationAttemptScalarWhereWithAggregatesInput | Prisma.VerificationAttemptScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"VerificationAttempt"> | string;
    guildId?: Prisma.StringWithAggregatesFilter<"VerificationAttempt"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"VerificationAttempt"> | string;
    userName?: Prisma.StringWithAggregatesFilter<"VerificationAttempt"> | string;
    result?: Prisma.EnumVerificationAttemptResultWithAggregatesFilter<"VerificationAttempt"> | $Enums.VerificationAttemptResult;
    reason?: Prisma.StringNullableWithAggregatesFilter<"VerificationAttempt"> | string | null;
    staffId?: Prisma.StringNullableWithAggregatesFilter<"VerificationAttempt"> | string | null;
    staffName?: Prisma.StringNullableWithAggregatesFilter<"VerificationAttempt"> | string | null;
    source?: Prisma.EnumVerificationAttemptSourceWithAggregatesFilter<"VerificationAttempt"> | $Enums.VerificationAttemptSource;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"VerificationAttempt"> | Date | string;
};
export type VerificationAttemptCreateInput = {
    id?: string;
    guildId: string;
    userId: string;
    userName: string;
    result: $Enums.VerificationAttemptResult;
    reason?: string | null;
    staffId?: string | null;
    staffName?: string | null;
    source?: $Enums.VerificationAttemptSource;
    createdAt?: Date | string;
};
export type VerificationAttemptUncheckedCreateInput = {
    id?: string;
    guildId: string;
    userId: string;
    userName: string;
    result: $Enums.VerificationAttemptResult;
    reason?: string | null;
    staffId?: string | null;
    staffName?: string | null;
    source?: $Enums.VerificationAttemptSource;
    createdAt?: Date | string;
};
export type VerificationAttemptUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    userName?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumVerificationAttemptResultFieldUpdateOperationsInput | $Enums.VerificationAttemptResult;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    staffId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    staffName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    source?: Prisma.EnumVerificationAttemptSourceFieldUpdateOperationsInput | $Enums.VerificationAttemptSource;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationAttemptUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    userName?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumVerificationAttemptResultFieldUpdateOperationsInput | $Enums.VerificationAttemptResult;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    staffId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    staffName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    source?: Prisma.EnumVerificationAttemptSourceFieldUpdateOperationsInput | $Enums.VerificationAttemptSource;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationAttemptCreateManyInput = {
    id?: string;
    guildId: string;
    userId: string;
    userName: string;
    result: $Enums.VerificationAttemptResult;
    reason?: string | null;
    staffId?: string | null;
    staffName?: string | null;
    source?: $Enums.VerificationAttemptSource;
    createdAt?: Date | string;
};
export type VerificationAttemptUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    userName?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumVerificationAttemptResultFieldUpdateOperationsInput | $Enums.VerificationAttemptResult;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    staffId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    staffName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    source?: Prisma.EnumVerificationAttemptSourceFieldUpdateOperationsInput | $Enums.VerificationAttemptSource;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationAttemptUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    userName?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.EnumVerificationAttemptResultFieldUpdateOperationsInput | $Enums.VerificationAttemptResult;
    reason?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    staffId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    staffName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    source?: Prisma.EnumVerificationAttemptSourceFieldUpdateOperationsInput | $Enums.VerificationAttemptSource;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type VerificationAttemptCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userName?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    staffId?: Prisma.SortOrder;
    staffName?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type VerificationAttemptMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userName?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    staffId?: Prisma.SortOrder;
    staffName?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type VerificationAttemptMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    userName?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    reason?: Prisma.SortOrder;
    staffId?: Prisma.SortOrder;
    staffName?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type EnumVerificationAttemptResultFieldUpdateOperationsInput = {
    set?: $Enums.VerificationAttemptResult;
};
export type EnumVerificationAttemptSourceFieldUpdateOperationsInput = {
    set?: $Enums.VerificationAttemptSource;
};
export type VerificationAttemptSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    userId?: boolean;
    userName?: boolean;
    result?: boolean;
    reason?: boolean;
    staffId?: boolean;
    staffName?: boolean;
    source?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["verificationAttempt"]>;
export type VerificationAttemptSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    userId?: boolean;
    userName?: boolean;
    result?: boolean;
    reason?: boolean;
    staffId?: boolean;
    staffName?: boolean;
    source?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["verificationAttempt"]>;
export type VerificationAttemptSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    userId?: boolean;
    userName?: boolean;
    result?: boolean;
    reason?: boolean;
    staffId?: boolean;
    staffName?: boolean;
    source?: boolean;
    createdAt?: boolean;
}, ExtArgs["result"]["verificationAttempt"]>;
export type VerificationAttemptSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    userId?: boolean;
    userName?: boolean;
    result?: boolean;
    reason?: boolean;
    staffId?: boolean;
    staffName?: boolean;
    source?: boolean;
    createdAt?: boolean;
};
export type VerificationAttemptOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "userId" | "userName" | "result" | "reason" | "staffId" | "staffName" | "source" | "createdAt", ExtArgs["result"]["verificationAttempt"]>;
export type $VerificationAttemptPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "VerificationAttempt";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        userId: string;
        userName: string;
        result: $Enums.VerificationAttemptResult;
        reason: string | null;
        staffId: string | null;
        staffName: string | null;
        source: $Enums.VerificationAttemptSource;
        createdAt: Date;
    }, ExtArgs["result"]["verificationAttempt"]>;
    composites: {};
};
export type VerificationAttemptGetPayload<S extends boolean | null | undefined | VerificationAttemptDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload, S>;
export type VerificationAttemptCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<VerificationAttemptFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: VerificationAttemptCountAggregateInputType | true;
};
export interface VerificationAttemptDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['VerificationAttempt'];
        meta: {
            name: 'VerificationAttempt';
        };
    };
    /**
     * Find zero or one VerificationAttempt that matches the filter.
     * @param {VerificationAttemptFindUniqueArgs} args - Arguments to find a VerificationAttempt
     * @example
     * // Get one VerificationAttempt
     * const verificationAttempt = await prisma.verificationAttempt.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationAttemptFindUniqueArgs>(args: Prisma.SelectSubset<T, VerificationAttemptFindUniqueArgs<ExtArgs>>): Prisma.Prisma__VerificationAttemptClient<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one VerificationAttempt that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationAttemptFindUniqueOrThrowArgs} args - Arguments to find a VerificationAttempt
     * @example
     * // Get one VerificationAttempt
     * const verificationAttempt = await prisma.verificationAttempt.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationAttemptFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, VerificationAttemptFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationAttemptClient<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VerificationAttempt that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAttemptFindFirstArgs} args - Arguments to find a VerificationAttempt
     * @example
     * // Get one VerificationAttempt
     * const verificationAttempt = await prisma.verificationAttempt.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationAttemptFindFirstArgs>(args?: Prisma.SelectSubset<T, VerificationAttemptFindFirstArgs<ExtArgs>>): Prisma.Prisma__VerificationAttemptClient<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VerificationAttempt that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAttemptFindFirstOrThrowArgs} args - Arguments to find a VerificationAttempt
     * @example
     * // Get one VerificationAttempt
     * const verificationAttempt = await prisma.verificationAttempt.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationAttemptFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, VerificationAttemptFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationAttemptClient<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more VerificationAttempts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAttemptFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationAttempts
     * const verificationAttempts = await prisma.verificationAttempt.findMany()
     *
     * // Get first 10 VerificationAttempts
     * const verificationAttempts = await prisma.verificationAttempt.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const verificationAttemptWithIdOnly = await prisma.verificationAttempt.findMany({ select: { id: true } })
     *
     */
    findMany<T extends VerificationAttemptFindManyArgs>(args?: Prisma.SelectSubset<T, VerificationAttemptFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a VerificationAttempt.
     * @param {VerificationAttemptCreateArgs} args - Arguments to create a VerificationAttempt.
     * @example
     * // Create one VerificationAttempt
     * const VerificationAttempt = await prisma.verificationAttempt.create({
     *   data: {
     *     // ... data to create a VerificationAttempt
     *   }
     * })
     *
     */
    create<T extends VerificationAttemptCreateArgs>(args: Prisma.SelectSubset<T, VerificationAttemptCreateArgs<ExtArgs>>): Prisma.Prisma__VerificationAttemptClient<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many VerificationAttempts.
     * @param {VerificationAttemptCreateManyArgs} args - Arguments to create many VerificationAttempts.
     * @example
     * // Create many VerificationAttempts
     * const verificationAttempt = await prisma.verificationAttempt.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends VerificationAttemptCreateManyArgs>(args?: Prisma.SelectSubset<T, VerificationAttemptCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many VerificationAttempts and returns the data saved in the database.
     * @param {VerificationAttemptCreateManyAndReturnArgs} args - Arguments to create many VerificationAttempts.
     * @example
     * // Create many VerificationAttempts
     * const verificationAttempt = await prisma.verificationAttempt.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many VerificationAttempts and only return the `id`
     * const verificationAttemptWithIdOnly = await prisma.verificationAttempt.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends VerificationAttemptCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, VerificationAttemptCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a VerificationAttempt.
     * @param {VerificationAttemptDeleteArgs} args - Arguments to delete one VerificationAttempt.
     * @example
     * // Delete one VerificationAttempt
     * const VerificationAttempt = await prisma.verificationAttempt.delete({
     *   where: {
     *     // ... filter to delete one VerificationAttempt
     *   }
     * })
     *
     */
    delete<T extends VerificationAttemptDeleteArgs>(args: Prisma.SelectSubset<T, VerificationAttemptDeleteArgs<ExtArgs>>): Prisma.Prisma__VerificationAttemptClient<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one VerificationAttempt.
     * @param {VerificationAttemptUpdateArgs} args - Arguments to update one VerificationAttempt.
     * @example
     * // Update one VerificationAttempt
     * const verificationAttempt = await prisma.verificationAttempt.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends VerificationAttemptUpdateArgs>(args: Prisma.SelectSubset<T, VerificationAttemptUpdateArgs<ExtArgs>>): Prisma.Prisma__VerificationAttemptClient<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more VerificationAttempts.
     * @param {VerificationAttemptDeleteManyArgs} args - Arguments to filter VerificationAttempts to delete.
     * @example
     * // Delete a few VerificationAttempts
     * const { count } = await prisma.verificationAttempt.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends VerificationAttemptDeleteManyArgs>(args?: Prisma.SelectSubset<T, VerificationAttemptDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VerificationAttempts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAttemptUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationAttempts
     * const verificationAttempt = await prisma.verificationAttempt.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends VerificationAttemptUpdateManyArgs>(args: Prisma.SelectSubset<T, VerificationAttemptUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VerificationAttempts and returns the data updated in the database.
     * @param {VerificationAttemptUpdateManyAndReturnArgs} args - Arguments to update many VerificationAttempts.
     * @example
     * // Update many VerificationAttempts
     * const verificationAttempt = await prisma.verificationAttempt.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more VerificationAttempts and only return the `id`
     * const verificationAttemptWithIdOnly = await prisma.verificationAttempt.updateManyAndReturn({
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
    updateManyAndReturn<T extends VerificationAttemptUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, VerificationAttemptUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one VerificationAttempt.
     * @param {VerificationAttemptUpsertArgs} args - Arguments to update or create a VerificationAttempt.
     * @example
     * // Update or create a VerificationAttempt
     * const verificationAttempt = await prisma.verificationAttempt.upsert({
     *   create: {
     *     // ... data to create a VerificationAttempt
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationAttempt we want to update
     *   }
     * })
     */
    upsert<T extends VerificationAttemptUpsertArgs>(args: Prisma.SelectSubset<T, VerificationAttemptUpsertArgs<ExtArgs>>): Prisma.Prisma__VerificationAttemptClient<runtime.Types.Result.GetResult<Prisma.$VerificationAttemptPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of VerificationAttempts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAttemptCountArgs} args - Arguments to filter VerificationAttempts to count.
     * @example
     * // Count the number of VerificationAttempts
     * const count = await prisma.verificationAttempt.count({
     *   where: {
     *     // ... the filter for the VerificationAttempts we want to count
     *   }
     * })
    **/
    count<T extends VerificationAttemptCountArgs>(args?: Prisma.Subset<T, VerificationAttemptCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], VerificationAttemptCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a VerificationAttempt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAttemptAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VerificationAttemptAggregateArgs>(args: Prisma.Subset<T, VerificationAttemptAggregateArgs>): Prisma.PrismaPromise<GetVerificationAttemptAggregateType<T>>;
    /**
     * Group by VerificationAttempt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationAttemptGroupByArgs} args - Group by arguments.
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
    groupBy<T extends VerificationAttemptGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: VerificationAttemptGroupByArgs['orderBy'];
    } : {
        orderBy?: VerificationAttemptGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, VerificationAttemptGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationAttemptGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the VerificationAttempt model
     */
    readonly fields: VerificationAttemptFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for VerificationAttempt.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__VerificationAttemptClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the VerificationAttempt model
 */
export interface VerificationAttemptFieldRefs {
    readonly id: Prisma.FieldRef<"VerificationAttempt", 'String'>;
    readonly guildId: Prisma.FieldRef<"VerificationAttempt", 'String'>;
    readonly userId: Prisma.FieldRef<"VerificationAttempt", 'String'>;
    readonly userName: Prisma.FieldRef<"VerificationAttempt", 'String'>;
    readonly result: Prisma.FieldRef<"VerificationAttempt", 'VerificationAttemptResult'>;
    readonly reason: Prisma.FieldRef<"VerificationAttempt", 'String'>;
    readonly staffId: Prisma.FieldRef<"VerificationAttempt", 'String'>;
    readonly staffName: Prisma.FieldRef<"VerificationAttempt", 'String'>;
    readonly source: Prisma.FieldRef<"VerificationAttempt", 'VerificationAttemptSource'>;
    readonly createdAt: Prisma.FieldRef<"VerificationAttempt", 'DateTime'>;
}
/**
 * VerificationAttempt findUnique
 */
export type VerificationAttemptFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationAttempt to fetch.
     */
    where: Prisma.VerificationAttemptWhereUniqueInput;
};
/**
 * VerificationAttempt findUniqueOrThrow
 */
export type VerificationAttemptFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationAttempt to fetch.
     */
    where: Prisma.VerificationAttemptWhereUniqueInput;
};
/**
 * VerificationAttempt findFirst
 */
export type VerificationAttemptFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationAttempt to fetch.
     */
    where?: Prisma.VerificationAttemptWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationAttempts to fetch.
     */
    orderBy?: Prisma.VerificationAttemptOrderByWithRelationInput | Prisma.VerificationAttemptOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VerificationAttempts.
     */
    cursor?: Prisma.VerificationAttemptWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationAttempts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationAttempts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationAttempts.
     */
    distinct?: Prisma.VerificationAttemptScalarFieldEnum | Prisma.VerificationAttemptScalarFieldEnum[];
};
/**
 * VerificationAttempt findFirstOrThrow
 */
export type VerificationAttemptFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationAttempt to fetch.
     */
    where?: Prisma.VerificationAttemptWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationAttempts to fetch.
     */
    orderBy?: Prisma.VerificationAttemptOrderByWithRelationInput | Prisma.VerificationAttemptOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VerificationAttempts.
     */
    cursor?: Prisma.VerificationAttemptWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationAttempts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationAttempts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationAttempts.
     */
    distinct?: Prisma.VerificationAttemptScalarFieldEnum | Prisma.VerificationAttemptScalarFieldEnum[];
};
/**
 * VerificationAttempt findMany
 */
export type VerificationAttemptFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationAttempts to fetch.
     */
    where?: Prisma.VerificationAttemptWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationAttempts to fetch.
     */
    orderBy?: Prisma.VerificationAttemptOrderByWithRelationInput | Prisma.VerificationAttemptOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing VerificationAttempts.
     */
    cursor?: Prisma.VerificationAttemptWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationAttempts from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationAttempts.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationAttempts.
     */
    distinct?: Prisma.VerificationAttemptScalarFieldEnum | Prisma.VerificationAttemptScalarFieldEnum[];
};
/**
 * VerificationAttempt create
 */
export type VerificationAttemptCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * The data needed to create a VerificationAttempt.
     */
    data: Prisma.XOR<Prisma.VerificationAttemptCreateInput, Prisma.VerificationAttemptUncheckedCreateInput>;
};
/**
 * VerificationAttempt createMany
 */
export type VerificationAttemptCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationAttempts.
     */
    data: Prisma.VerificationAttemptCreateManyInput | Prisma.VerificationAttemptCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VerificationAttempt createManyAndReturn
 */
export type VerificationAttemptCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * The data used to create many VerificationAttempts.
     */
    data: Prisma.VerificationAttemptCreateManyInput | Prisma.VerificationAttemptCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VerificationAttempt update
 */
export type VerificationAttemptUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * The data needed to update a VerificationAttempt.
     */
    data: Prisma.XOR<Prisma.VerificationAttemptUpdateInput, Prisma.VerificationAttemptUncheckedUpdateInput>;
    /**
     * Choose, which VerificationAttempt to update.
     */
    where: Prisma.VerificationAttemptWhereUniqueInput;
};
/**
 * VerificationAttempt updateMany
 */
export type VerificationAttemptUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationAttempts.
     */
    data: Prisma.XOR<Prisma.VerificationAttemptUpdateManyMutationInput, Prisma.VerificationAttemptUncheckedUpdateManyInput>;
    /**
     * Filter which VerificationAttempts to update
     */
    where?: Prisma.VerificationAttemptWhereInput;
    /**
     * Limit how many VerificationAttempts to update.
     */
    limit?: number;
};
/**
 * VerificationAttempt updateManyAndReturn
 */
export type VerificationAttemptUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * The data used to update VerificationAttempts.
     */
    data: Prisma.XOR<Prisma.VerificationAttemptUpdateManyMutationInput, Prisma.VerificationAttemptUncheckedUpdateManyInput>;
    /**
     * Filter which VerificationAttempts to update
     */
    where?: Prisma.VerificationAttemptWhereInput;
    /**
     * Limit how many VerificationAttempts to update.
     */
    limit?: number;
};
/**
 * VerificationAttempt upsert
 */
export type VerificationAttemptUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * The filter to search for the VerificationAttempt to update in case it exists.
     */
    where: Prisma.VerificationAttemptWhereUniqueInput;
    /**
     * In case the VerificationAttempt found by the `where` argument doesn't exist, create a new VerificationAttempt with this data.
     */
    create: Prisma.XOR<Prisma.VerificationAttemptCreateInput, Prisma.VerificationAttemptUncheckedCreateInput>;
    /**
     * In case the VerificationAttempt was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.VerificationAttemptUpdateInput, Prisma.VerificationAttemptUncheckedUpdateInput>;
};
/**
 * VerificationAttempt delete
 */
export type VerificationAttemptDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
    /**
     * Filter which VerificationAttempt to delete.
     */
    where: Prisma.VerificationAttemptWhereUniqueInput;
};
/**
 * VerificationAttempt deleteMany
 */
export type VerificationAttemptDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationAttempts to delete
     */
    where?: Prisma.VerificationAttemptWhereInput;
    /**
     * Limit how many VerificationAttempts to delete.
     */
    limit?: number;
};
/**
 * VerificationAttempt without action
 */
export type VerificationAttemptDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationAttempt
     */
    select?: Prisma.VerificationAttemptSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationAttempt
     */
    omit?: Prisma.VerificationAttemptOmit<ExtArgs> | null;
};
//# sourceMappingURL=VerificationAttempt.d.ts.map
import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model LevelMember
 *
 */
export type LevelMemberModel = runtime.Types.Result.DefaultSelection<Prisma.$LevelMemberPayload>;
export type AggregateLevelMember = {
    _count: LevelMemberCountAggregateOutputType | null;
    _avg: LevelMemberAvgAggregateOutputType | null;
    _sum: LevelMemberSumAggregateOutputType | null;
    _min: LevelMemberMinAggregateOutputType | null;
    _max: LevelMemberMaxAggregateOutputType | null;
};
export type LevelMemberAvgAggregateOutputType = {
    xp: number | null;
    level: number | null;
    messages: number | null;
    voiceMinutes: number | null;
};
export type LevelMemberSumAggregateOutputType = {
    xp: number | null;
    level: number | null;
    messages: number | null;
    voiceMinutes: number | null;
};
export type LevelMemberMinAggregateOutputType = {
    guildId: string | null;
    userId: string | null;
    displayName: string | null;
    xp: number | null;
    level: number | null;
    messages: number | null;
    voiceMinutes: number | null;
    lastMessageAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type LevelMemberMaxAggregateOutputType = {
    guildId: string | null;
    userId: string | null;
    displayName: string | null;
    xp: number | null;
    level: number | null;
    messages: number | null;
    voiceMinutes: number | null;
    lastMessageAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type LevelMemberCountAggregateOutputType = {
    guildId: number;
    userId: number;
    displayName: number;
    xp: number;
    level: number;
    messages: number;
    voiceMinutes: number;
    lastMessageAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type LevelMemberAvgAggregateInputType = {
    xp?: true;
    level?: true;
    messages?: true;
    voiceMinutes?: true;
};
export type LevelMemberSumAggregateInputType = {
    xp?: true;
    level?: true;
    messages?: true;
    voiceMinutes?: true;
};
export type LevelMemberMinAggregateInputType = {
    guildId?: true;
    userId?: true;
    displayName?: true;
    xp?: true;
    level?: true;
    messages?: true;
    voiceMinutes?: true;
    lastMessageAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type LevelMemberMaxAggregateInputType = {
    guildId?: true;
    userId?: true;
    displayName?: true;
    xp?: true;
    level?: true;
    messages?: true;
    voiceMinutes?: true;
    lastMessageAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type LevelMemberCountAggregateInputType = {
    guildId?: true;
    userId?: true;
    displayName?: true;
    xp?: true;
    level?: true;
    messages?: true;
    voiceMinutes?: true;
    lastMessageAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type LevelMemberAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which LevelMember to aggregate.
     */
    where?: Prisma.LevelMemberWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of LevelMembers to fetch.
     */
    orderBy?: Prisma.LevelMemberOrderByWithRelationInput | Prisma.LevelMemberOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.LevelMemberWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` LevelMembers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` LevelMembers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned LevelMembers
    **/
    _count?: true | LevelMemberCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: LevelMemberAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: LevelMemberSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: LevelMemberMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: LevelMemberMaxAggregateInputType;
};
export type GetLevelMemberAggregateType<T extends LevelMemberAggregateArgs> = {
    [P in keyof T & keyof AggregateLevelMember]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateLevelMember[P]> : Prisma.GetScalarType<T[P], AggregateLevelMember[P]>;
};
export type LevelMemberGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LevelMemberWhereInput;
    orderBy?: Prisma.LevelMemberOrderByWithAggregationInput | Prisma.LevelMemberOrderByWithAggregationInput[];
    by: Prisma.LevelMemberScalarFieldEnum[] | Prisma.LevelMemberScalarFieldEnum;
    having?: Prisma.LevelMemberScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: LevelMemberCountAggregateInputType | true;
    _avg?: LevelMemberAvgAggregateInputType;
    _sum?: LevelMemberSumAggregateInputType;
    _min?: LevelMemberMinAggregateInputType;
    _max?: LevelMemberMaxAggregateInputType;
};
export type LevelMemberGroupByOutputType = {
    guildId: string;
    userId: string;
    displayName: string;
    xp: number;
    level: number;
    messages: number;
    voiceMinutes: number;
    lastMessageAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: LevelMemberCountAggregateOutputType | null;
    _avg: LevelMemberAvgAggregateOutputType | null;
    _sum: LevelMemberSumAggregateOutputType | null;
    _min: LevelMemberMinAggregateOutputType | null;
    _max: LevelMemberMaxAggregateOutputType | null;
};
export type GetLevelMemberGroupByPayload<T extends LevelMemberGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<LevelMemberGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof LevelMemberGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], LevelMemberGroupByOutputType[P]> : Prisma.GetScalarType<T[P], LevelMemberGroupByOutputType[P]>;
}>>;
export type LevelMemberWhereInput = {
    AND?: Prisma.LevelMemberWhereInput | Prisma.LevelMemberWhereInput[];
    OR?: Prisma.LevelMemberWhereInput[];
    NOT?: Prisma.LevelMemberWhereInput | Prisma.LevelMemberWhereInput[];
    guildId?: Prisma.StringFilter<"LevelMember"> | string;
    userId?: Prisma.StringFilter<"LevelMember"> | string;
    displayName?: Prisma.StringFilter<"LevelMember"> | string;
    xp?: Prisma.IntFilter<"LevelMember"> | number;
    level?: Prisma.IntFilter<"LevelMember"> | number;
    messages?: Prisma.IntFilter<"LevelMember"> | number;
    voiceMinutes?: Prisma.IntFilter<"LevelMember"> | number;
    lastMessageAt?: Prisma.DateTimeNullableFilter<"LevelMember"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"LevelMember"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"LevelMember"> | Date | string;
};
export type LevelMemberOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    xp?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    voiceMinutes?: Prisma.SortOrder;
    lastMessageAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LevelMemberWhereUniqueInput = Prisma.AtLeast<{
    guildId_userId?: Prisma.LevelMemberGuildIdUserIdCompoundUniqueInput;
    AND?: Prisma.LevelMemberWhereInput | Prisma.LevelMemberWhereInput[];
    OR?: Prisma.LevelMemberWhereInput[];
    NOT?: Prisma.LevelMemberWhereInput | Prisma.LevelMemberWhereInput[];
    guildId?: Prisma.StringFilter<"LevelMember"> | string;
    userId?: Prisma.StringFilter<"LevelMember"> | string;
    displayName?: Prisma.StringFilter<"LevelMember"> | string;
    xp?: Prisma.IntFilter<"LevelMember"> | number;
    level?: Prisma.IntFilter<"LevelMember"> | number;
    messages?: Prisma.IntFilter<"LevelMember"> | number;
    voiceMinutes?: Prisma.IntFilter<"LevelMember"> | number;
    lastMessageAt?: Prisma.DateTimeNullableFilter<"LevelMember"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"LevelMember"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"LevelMember"> | Date | string;
}, "guildId_userId">;
export type LevelMemberOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    xp?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    voiceMinutes?: Prisma.SortOrder;
    lastMessageAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.LevelMemberCountOrderByAggregateInput;
    _avg?: Prisma.LevelMemberAvgOrderByAggregateInput;
    _max?: Prisma.LevelMemberMaxOrderByAggregateInput;
    _min?: Prisma.LevelMemberMinOrderByAggregateInput;
    _sum?: Prisma.LevelMemberSumOrderByAggregateInput;
};
export type LevelMemberScalarWhereWithAggregatesInput = {
    AND?: Prisma.LevelMemberScalarWhereWithAggregatesInput | Prisma.LevelMemberScalarWhereWithAggregatesInput[];
    OR?: Prisma.LevelMemberScalarWhereWithAggregatesInput[];
    NOT?: Prisma.LevelMemberScalarWhereWithAggregatesInput | Prisma.LevelMemberScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"LevelMember"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"LevelMember"> | string;
    displayName?: Prisma.StringWithAggregatesFilter<"LevelMember"> | string;
    xp?: Prisma.IntWithAggregatesFilter<"LevelMember"> | number;
    level?: Prisma.IntWithAggregatesFilter<"LevelMember"> | number;
    messages?: Prisma.IntWithAggregatesFilter<"LevelMember"> | number;
    voiceMinutes?: Prisma.IntWithAggregatesFilter<"LevelMember"> | number;
    lastMessageAt?: Prisma.DateTimeNullableWithAggregatesFilter<"LevelMember"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"LevelMember"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"LevelMember"> | Date | string;
};
export type LevelMemberCreateInput = {
    guildId: string;
    userId: string;
    displayName?: string;
    xp?: number;
    level?: number;
    messages?: number;
    voiceMinutes?: number;
    lastMessageAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LevelMemberUncheckedCreateInput = {
    guildId: string;
    userId: string;
    displayName?: string;
    xp?: number;
    level?: number;
    messages?: number;
    voiceMinutes?: number;
    lastMessageAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LevelMemberUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    displayName?: Prisma.StringFieldUpdateOperationsInput | string;
    xp?: Prisma.IntFieldUpdateOperationsInput | number;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    messages?: Prisma.IntFieldUpdateOperationsInput | number;
    voiceMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastMessageAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LevelMemberUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    displayName?: Prisma.StringFieldUpdateOperationsInput | string;
    xp?: Prisma.IntFieldUpdateOperationsInput | number;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    messages?: Prisma.IntFieldUpdateOperationsInput | number;
    voiceMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastMessageAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LevelMemberCreateManyInput = {
    guildId: string;
    userId: string;
    displayName?: string;
    xp?: number;
    level?: number;
    messages?: number;
    voiceMinutes?: number;
    lastMessageAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type LevelMemberUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    displayName?: Prisma.StringFieldUpdateOperationsInput | string;
    xp?: Prisma.IntFieldUpdateOperationsInput | number;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    messages?: Prisma.IntFieldUpdateOperationsInput | number;
    voiceMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastMessageAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LevelMemberUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    displayName?: Prisma.StringFieldUpdateOperationsInput | string;
    xp?: Prisma.IntFieldUpdateOperationsInput | number;
    level?: Prisma.IntFieldUpdateOperationsInput | number;
    messages?: Prisma.IntFieldUpdateOperationsInput | number;
    voiceMinutes?: Prisma.IntFieldUpdateOperationsInput | number;
    lastMessageAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type LevelMemberGuildIdUserIdCompoundUniqueInput = {
    guildId: string;
    userId: string;
};
export type LevelMemberCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    xp?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    voiceMinutes?: Prisma.SortOrder;
    lastMessageAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LevelMemberAvgOrderByAggregateInput = {
    xp?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    voiceMinutes?: Prisma.SortOrder;
};
export type LevelMemberMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    xp?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    voiceMinutes?: Prisma.SortOrder;
    lastMessageAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LevelMemberMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    displayName?: Prisma.SortOrder;
    xp?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    voiceMinutes?: Prisma.SortOrder;
    lastMessageAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type LevelMemberSumOrderByAggregateInput = {
    xp?: Prisma.SortOrder;
    level?: Prisma.SortOrder;
    messages?: Prisma.SortOrder;
    voiceMinutes?: Prisma.SortOrder;
};
export type LevelMemberSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    userId?: boolean;
    displayName?: boolean;
    xp?: boolean;
    level?: boolean;
    messages?: boolean;
    voiceMinutes?: boolean;
    lastMessageAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["levelMember"]>;
export type LevelMemberSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    userId?: boolean;
    displayName?: boolean;
    xp?: boolean;
    level?: boolean;
    messages?: boolean;
    voiceMinutes?: boolean;
    lastMessageAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["levelMember"]>;
export type LevelMemberSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    userId?: boolean;
    displayName?: boolean;
    xp?: boolean;
    level?: boolean;
    messages?: boolean;
    voiceMinutes?: boolean;
    lastMessageAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["levelMember"]>;
export type LevelMemberSelectScalar = {
    guildId?: boolean;
    userId?: boolean;
    displayName?: boolean;
    xp?: boolean;
    level?: boolean;
    messages?: boolean;
    voiceMinutes?: boolean;
    lastMessageAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type LevelMemberOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "userId" | "displayName" | "xp" | "level" | "messages" | "voiceMinutes" | "lastMessageAt" | "createdAt" | "updatedAt", ExtArgs["result"]["levelMember"]>;
export type $LevelMemberPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "LevelMember";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        userId: string;
        displayName: string;
        xp: number;
        level: number;
        messages: number;
        voiceMinutes: number;
        lastMessageAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["levelMember"]>;
    composites: {};
};
export type LevelMemberGetPayload<S extends boolean | null | undefined | LevelMemberDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload, S>;
export type LevelMemberCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<LevelMemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: LevelMemberCountAggregateInputType | true;
};
export interface LevelMemberDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['LevelMember'];
        meta: {
            name: 'LevelMember';
        };
    };
    /**
     * Find zero or one LevelMember that matches the filter.
     * @param {LevelMemberFindUniqueArgs} args - Arguments to find a LevelMember
     * @example
     * // Get one LevelMember
     * const levelMember = await prisma.levelMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LevelMemberFindUniqueArgs>(args: Prisma.SelectSubset<T, LevelMemberFindUniqueArgs<ExtArgs>>): Prisma.Prisma__LevelMemberClient<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one LevelMember that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LevelMemberFindUniqueOrThrowArgs} args - Arguments to find a LevelMember
     * @example
     * // Get one LevelMember
     * const levelMember = await prisma.levelMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LevelMemberFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, LevelMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__LevelMemberClient<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first LevelMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelMemberFindFirstArgs} args - Arguments to find a LevelMember
     * @example
     * // Get one LevelMember
     * const levelMember = await prisma.levelMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LevelMemberFindFirstArgs>(args?: Prisma.SelectSubset<T, LevelMemberFindFirstArgs<ExtArgs>>): Prisma.Prisma__LevelMemberClient<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first LevelMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelMemberFindFirstOrThrowArgs} args - Arguments to find a LevelMember
     * @example
     * // Get one LevelMember
     * const levelMember = await prisma.levelMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LevelMemberFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, LevelMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__LevelMemberClient<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more LevelMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LevelMembers
     * const levelMembers = await prisma.levelMember.findMany()
     *
     * // Get first 10 LevelMembers
     * const levelMembers = await prisma.levelMember.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const levelMemberWithGuildIdOnly = await prisma.levelMember.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends LevelMemberFindManyArgs>(args?: Prisma.SelectSubset<T, LevelMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a LevelMember.
     * @param {LevelMemberCreateArgs} args - Arguments to create a LevelMember.
     * @example
     * // Create one LevelMember
     * const LevelMember = await prisma.levelMember.create({
     *   data: {
     *     // ... data to create a LevelMember
     *   }
     * })
     *
     */
    create<T extends LevelMemberCreateArgs>(args: Prisma.SelectSubset<T, LevelMemberCreateArgs<ExtArgs>>): Prisma.Prisma__LevelMemberClient<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many LevelMembers.
     * @param {LevelMemberCreateManyArgs} args - Arguments to create many LevelMembers.
     * @example
     * // Create many LevelMembers
     * const levelMember = await prisma.levelMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends LevelMemberCreateManyArgs>(args?: Prisma.SelectSubset<T, LevelMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many LevelMembers and returns the data saved in the database.
     * @param {LevelMemberCreateManyAndReturnArgs} args - Arguments to create many LevelMembers.
     * @example
     * // Create many LevelMembers
     * const levelMember = await prisma.levelMember.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many LevelMembers and only return the `guildId`
     * const levelMemberWithGuildIdOnly = await prisma.levelMember.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends LevelMemberCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, LevelMemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a LevelMember.
     * @param {LevelMemberDeleteArgs} args - Arguments to delete one LevelMember.
     * @example
     * // Delete one LevelMember
     * const LevelMember = await prisma.levelMember.delete({
     *   where: {
     *     // ... filter to delete one LevelMember
     *   }
     * })
     *
     */
    delete<T extends LevelMemberDeleteArgs>(args: Prisma.SelectSubset<T, LevelMemberDeleteArgs<ExtArgs>>): Prisma.Prisma__LevelMemberClient<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one LevelMember.
     * @param {LevelMemberUpdateArgs} args - Arguments to update one LevelMember.
     * @example
     * // Update one LevelMember
     * const levelMember = await prisma.levelMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends LevelMemberUpdateArgs>(args: Prisma.SelectSubset<T, LevelMemberUpdateArgs<ExtArgs>>): Prisma.Prisma__LevelMemberClient<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more LevelMembers.
     * @param {LevelMemberDeleteManyArgs} args - Arguments to filter LevelMembers to delete.
     * @example
     * // Delete a few LevelMembers
     * const { count } = await prisma.levelMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends LevelMemberDeleteManyArgs>(args?: Prisma.SelectSubset<T, LevelMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more LevelMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LevelMembers
     * const levelMember = await prisma.levelMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends LevelMemberUpdateManyArgs>(args: Prisma.SelectSubset<T, LevelMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more LevelMembers and returns the data updated in the database.
     * @param {LevelMemberUpdateManyAndReturnArgs} args - Arguments to update many LevelMembers.
     * @example
     * // Update many LevelMembers
     * const levelMember = await prisma.levelMember.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more LevelMembers and only return the `guildId`
     * const levelMemberWithGuildIdOnly = await prisma.levelMember.updateManyAndReturn({
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
    updateManyAndReturn<T extends LevelMemberUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, LevelMemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one LevelMember.
     * @param {LevelMemberUpsertArgs} args - Arguments to update or create a LevelMember.
     * @example
     * // Update or create a LevelMember
     * const levelMember = await prisma.levelMember.upsert({
     *   create: {
     *     // ... data to create a LevelMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LevelMember we want to update
     *   }
     * })
     */
    upsert<T extends LevelMemberUpsertArgs>(args: Prisma.SelectSubset<T, LevelMemberUpsertArgs<ExtArgs>>): Prisma.Prisma__LevelMemberClient<runtime.Types.Result.GetResult<Prisma.$LevelMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of LevelMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelMemberCountArgs} args - Arguments to filter LevelMembers to count.
     * @example
     * // Count the number of LevelMembers
     * const count = await prisma.levelMember.count({
     *   where: {
     *     // ... the filter for the LevelMembers we want to count
     *   }
     * })
    **/
    count<T extends LevelMemberCountArgs>(args?: Prisma.Subset<T, LevelMemberCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], LevelMemberCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a LevelMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LevelMemberAggregateArgs>(args: Prisma.Subset<T, LevelMemberAggregateArgs>): Prisma.PrismaPromise<GetLevelMemberAggregateType<T>>;
    /**
     * Group by LevelMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LevelMemberGroupByArgs} args - Group by arguments.
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
    groupBy<T extends LevelMemberGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: LevelMemberGroupByArgs['orderBy'];
    } : {
        orderBy?: LevelMemberGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, LevelMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLevelMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the LevelMember model
     */
    readonly fields: LevelMemberFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for LevelMember.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__LevelMemberClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the LevelMember model
 */
export interface LevelMemberFieldRefs {
    readonly guildId: Prisma.FieldRef<"LevelMember", 'String'>;
    readonly userId: Prisma.FieldRef<"LevelMember", 'String'>;
    readonly displayName: Prisma.FieldRef<"LevelMember", 'String'>;
    readonly xp: Prisma.FieldRef<"LevelMember", 'Int'>;
    readonly level: Prisma.FieldRef<"LevelMember", 'Int'>;
    readonly messages: Prisma.FieldRef<"LevelMember", 'Int'>;
    readonly voiceMinutes: Prisma.FieldRef<"LevelMember", 'Int'>;
    readonly lastMessageAt: Prisma.FieldRef<"LevelMember", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"LevelMember", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"LevelMember", 'DateTime'>;
}
/**
 * LevelMember findUnique
 */
export type LevelMemberFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * Filter, which LevelMember to fetch.
     */
    where: Prisma.LevelMemberWhereUniqueInput;
};
/**
 * LevelMember findUniqueOrThrow
 */
export type LevelMemberFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * Filter, which LevelMember to fetch.
     */
    where: Prisma.LevelMemberWhereUniqueInput;
};
/**
 * LevelMember findFirst
 */
export type LevelMemberFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * Filter, which LevelMember to fetch.
     */
    where?: Prisma.LevelMemberWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of LevelMembers to fetch.
     */
    orderBy?: Prisma.LevelMemberOrderByWithRelationInput | Prisma.LevelMemberOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for LevelMembers.
     */
    cursor?: Prisma.LevelMemberWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` LevelMembers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` LevelMembers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of LevelMembers.
     */
    distinct?: Prisma.LevelMemberScalarFieldEnum | Prisma.LevelMemberScalarFieldEnum[];
};
/**
 * LevelMember findFirstOrThrow
 */
export type LevelMemberFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * Filter, which LevelMember to fetch.
     */
    where?: Prisma.LevelMemberWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of LevelMembers to fetch.
     */
    orderBy?: Prisma.LevelMemberOrderByWithRelationInput | Prisma.LevelMemberOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for LevelMembers.
     */
    cursor?: Prisma.LevelMemberWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` LevelMembers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` LevelMembers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of LevelMembers.
     */
    distinct?: Prisma.LevelMemberScalarFieldEnum | Prisma.LevelMemberScalarFieldEnum[];
};
/**
 * LevelMember findMany
 */
export type LevelMemberFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * Filter, which LevelMembers to fetch.
     */
    where?: Prisma.LevelMemberWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of LevelMembers to fetch.
     */
    orderBy?: Prisma.LevelMemberOrderByWithRelationInput | Prisma.LevelMemberOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing LevelMembers.
     */
    cursor?: Prisma.LevelMemberWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` LevelMembers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` LevelMembers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of LevelMembers.
     */
    distinct?: Prisma.LevelMemberScalarFieldEnum | Prisma.LevelMemberScalarFieldEnum[];
};
/**
 * LevelMember create
 */
export type LevelMemberCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * The data needed to create a LevelMember.
     */
    data: Prisma.XOR<Prisma.LevelMemberCreateInput, Prisma.LevelMemberUncheckedCreateInput>;
};
/**
 * LevelMember createMany
 */
export type LevelMemberCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many LevelMembers.
     */
    data: Prisma.LevelMemberCreateManyInput | Prisma.LevelMemberCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * LevelMember createManyAndReturn
 */
export type LevelMemberCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * The data used to create many LevelMembers.
     */
    data: Prisma.LevelMemberCreateManyInput | Prisma.LevelMemberCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * LevelMember update
 */
export type LevelMemberUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * The data needed to update a LevelMember.
     */
    data: Prisma.XOR<Prisma.LevelMemberUpdateInput, Prisma.LevelMemberUncheckedUpdateInput>;
    /**
     * Choose, which LevelMember to update.
     */
    where: Prisma.LevelMemberWhereUniqueInput;
};
/**
 * LevelMember updateMany
 */
export type LevelMemberUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update LevelMembers.
     */
    data: Prisma.XOR<Prisma.LevelMemberUpdateManyMutationInput, Prisma.LevelMemberUncheckedUpdateManyInput>;
    /**
     * Filter which LevelMembers to update
     */
    where?: Prisma.LevelMemberWhereInput;
    /**
     * Limit how many LevelMembers to update.
     */
    limit?: number;
};
/**
 * LevelMember updateManyAndReturn
 */
export type LevelMemberUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * The data used to update LevelMembers.
     */
    data: Prisma.XOR<Prisma.LevelMemberUpdateManyMutationInput, Prisma.LevelMemberUncheckedUpdateManyInput>;
    /**
     * Filter which LevelMembers to update
     */
    where?: Prisma.LevelMemberWhereInput;
    /**
     * Limit how many LevelMembers to update.
     */
    limit?: number;
};
/**
 * LevelMember upsert
 */
export type LevelMemberUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * The filter to search for the LevelMember to update in case it exists.
     */
    where: Prisma.LevelMemberWhereUniqueInput;
    /**
     * In case the LevelMember found by the `where` argument doesn't exist, create a new LevelMember with this data.
     */
    create: Prisma.XOR<Prisma.LevelMemberCreateInput, Prisma.LevelMemberUncheckedCreateInput>;
    /**
     * In case the LevelMember was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.LevelMemberUpdateInput, Prisma.LevelMemberUncheckedUpdateInput>;
};
/**
 * LevelMember delete
 */
export type LevelMemberDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
    /**
     * Filter which LevelMember to delete.
     */
    where: Prisma.LevelMemberWhereUniqueInput;
};
/**
 * LevelMember deleteMany
 */
export type LevelMemberDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which LevelMembers to delete
     */
    where?: Prisma.LevelMemberWhereInput;
    /**
     * Limit how many LevelMembers to delete.
     */
    limit?: number;
};
/**
 * LevelMember without action
 */
export type LevelMemberDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LevelMember
     */
    select?: Prisma.LevelMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the LevelMember
     */
    omit?: Prisma.LevelMemberOmit<ExtArgs> | null;
};
//# sourceMappingURL=LevelMember.d.ts.map
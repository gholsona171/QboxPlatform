import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model VerificationPendingMember
 *
 */
export type VerificationPendingMemberModel = runtime.Types.Result.DefaultSelection<Prisma.$VerificationPendingMemberPayload>;
export type AggregateVerificationPendingMember = {
    _count: VerificationPendingMemberCountAggregateOutputType | null;
    _min: VerificationPendingMemberMinAggregateOutputType | null;
    _max: VerificationPendingMemberMaxAggregateOutputType | null;
};
export type VerificationPendingMemberMinAggregateOutputType = {
    guildId: string | null;
    userId: string | null;
    joinedAt: Date | null;
    flagged: boolean | null;
};
export type VerificationPendingMemberMaxAggregateOutputType = {
    guildId: string | null;
    userId: string | null;
    joinedAt: Date | null;
    flagged: boolean | null;
};
export type VerificationPendingMemberCountAggregateOutputType = {
    guildId: number;
    userId: number;
    joinedAt: number;
    flagged: number;
    _all: number;
};
export type VerificationPendingMemberMinAggregateInputType = {
    guildId?: true;
    userId?: true;
    joinedAt?: true;
    flagged?: true;
};
export type VerificationPendingMemberMaxAggregateInputType = {
    guildId?: true;
    userId?: true;
    joinedAt?: true;
    flagged?: true;
};
export type VerificationPendingMemberCountAggregateInputType = {
    guildId?: true;
    userId?: true;
    joinedAt?: true;
    flagged?: true;
    _all?: true;
};
export type VerificationPendingMemberAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationPendingMember to aggregate.
     */
    where?: Prisma.VerificationPendingMemberWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationPendingMembers to fetch.
     */
    orderBy?: Prisma.VerificationPendingMemberOrderByWithRelationInput | Prisma.VerificationPendingMemberOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.VerificationPendingMemberWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationPendingMembers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationPendingMembers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned VerificationPendingMembers
    **/
    _count?: true | VerificationPendingMemberCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: VerificationPendingMemberMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: VerificationPendingMemberMaxAggregateInputType;
};
export type GetVerificationPendingMemberAggregateType<T extends VerificationPendingMemberAggregateArgs> = {
    [P in keyof T & keyof AggregateVerificationPendingMember]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateVerificationPendingMember[P]> : Prisma.GetScalarType<T[P], AggregateVerificationPendingMember[P]>;
};
export type VerificationPendingMemberGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.VerificationPendingMemberWhereInput;
    orderBy?: Prisma.VerificationPendingMemberOrderByWithAggregationInput | Prisma.VerificationPendingMemberOrderByWithAggregationInput[];
    by: Prisma.VerificationPendingMemberScalarFieldEnum[] | Prisma.VerificationPendingMemberScalarFieldEnum;
    having?: Prisma.VerificationPendingMemberScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: VerificationPendingMemberCountAggregateInputType | true;
    _min?: VerificationPendingMemberMinAggregateInputType;
    _max?: VerificationPendingMemberMaxAggregateInputType;
};
export type VerificationPendingMemberGroupByOutputType = {
    guildId: string;
    userId: string;
    joinedAt: Date;
    flagged: boolean;
    _count: VerificationPendingMemberCountAggregateOutputType | null;
    _min: VerificationPendingMemberMinAggregateOutputType | null;
    _max: VerificationPendingMemberMaxAggregateOutputType | null;
};
export type GetVerificationPendingMemberGroupByPayload<T extends VerificationPendingMemberGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<VerificationPendingMemberGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof VerificationPendingMemberGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], VerificationPendingMemberGroupByOutputType[P]> : Prisma.GetScalarType<T[P], VerificationPendingMemberGroupByOutputType[P]>;
}>>;
export type VerificationPendingMemberWhereInput = {
    AND?: Prisma.VerificationPendingMemberWhereInput | Prisma.VerificationPendingMemberWhereInput[];
    OR?: Prisma.VerificationPendingMemberWhereInput[];
    NOT?: Prisma.VerificationPendingMemberWhereInput | Prisma.VerificationPendingMemberWhereInput[];
    guildId?: Prisma.StringFilter<"VerificationPendingMember"> | string;
    userId?: Prisma.StringFilter<"VerificationPendingMember"> | string;
    joinedAt?: Prisma.DateTimeFilter<"VerificationPendingMember"> | Date | string;
    flagged?: Prisma.BoolFilter<"VerificationPendingMember"> | boolean;
};
export type VerificationPendingMemberOrderByWithRelationInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    flagged?: Prisma.SortOrder;
};
export type VerificationPendingMemberWhereUniqueInput = Prisma.AtLeast<{
    guildId_userId?: Prisma.VerificationPendingMemberGuildIdUserIdCompoundUniqueInput;
    AND?: Prisma.VerificationPendingMemberWhereInput | Prisma.VerificationPendingMemberWhereInput[];
    OR?: Prisma.VerificationPendingMemberWhereInput[];
    NOT?: Prisma.VerificationPendingMemberWhereInput | Prisma.VerificationPendingMemberWhereInput[];
    guildId?: Prisma.StringFilter<"VerificationPendingMember"> | string;
    userId?: Prisma.StringFilter<"VerificationPendingMember"> | string;
    joinedAt?: Prisma.DateTimeFilter<"VerificationPendingMember"> | Date | string;
    flagged?: Prisma.BoolFilter<"VerificationPendingMember"> | boolean;
}, "guildId_userId">;
export type VerificationPendingMemberOrderByWithAggregationInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    flagged?: Prisma.SortOrder;
    _count?: Prisma.VerificationPendingMemberCountOrderByAggregateInput;
    _max?: Prisma.VerificationPendingMemberMaxOrderByAggregateInput;
    _min?: Prisma.VerificationPendingMemberMinOrderByAggregateInput;
};
export type VerificationPendingMemberScalarWhereWithAggregatesInput = {
    AND?: Prisma.VerificationPendingMemberScalarWhereWithAggregatesInput | Prisma.VerificationPendingMemberScalarWhereWithAggregatesInput[];
    OR?: Prisma.VerificationPendingMemberScalarWhereWithAggregatesInput[];
    NOT?: Prisma.VerificationPendingMemberScalarWhereWithAggregatesInput | Prisma.VerificationPendingMemberScalarWhereWithAggregatesInput[];
    guildId?: Prisma.StringWithAggregatesFilter<"VerificationPendingMember"> | string;
    userId?: Prisma.StringWithAggregatesFilter<"VerificationPendingMember"> | string;
    joinedAt?: Prisma.DateTimeWithAggregatesFilter<"VerificationPendingMember"> | Date | string;
    flagged?: Prisma.BoolWithAggregatesFilter<"VerificationPendingMember"> | boolean;
};
export type VerificationPendingMemberCreateInput = {
    guildId: string;
    userId: string;
    joinedAt: Date | string;
    flagged?: boolean;
};
export type VerificationPendingMemberUncheckedCreateInput = {
    guildId: string;
    userId: string;
    joinedAt: Date | string;
    flagged?: boolean;
};
export type VerificationPendingMemberUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    flagged?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type VerificationPendingMemberUncheckedUpdateInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    flagged?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type VerificationPendingMemberCreateManyInput = {
    guildId: string;
    userId: string;
    joinedAt: Date | string;
    flagged?: boolean;
};
export type VerificationPendingMemberUpdateManyMutationInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    flagged?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type VerificationPendingMemberUncheckedUpdateManyInput = {
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    joinedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    flagged?: Prisma.BoolFieldUpdateOperationsInput | boolean;
};
export type VerificationPendingMemberGuildIdUserIdCompoundUniqueInput = {
    guildId: string;
    userId: string;
};
export type VerificationPendingMemberCountOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    flagged?: Prisma.SortOrder;
};
export type VerificationPendingMemberMaxOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    flagged?: Prisma.SortOrder;
};
export type VerificationPendingMemberMinOrderByAggregateInput = {
    guildId?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    joinedAt?: Prisma.SortOrder;
    flagged?: Prisma.SortOrder;
};
export type VerificationPendingMemberSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    userId?: boolean;
    joinedAt?: boolean;
    flagged?: boolean;
}, ExtArgs["result"]["verificationPendingMember"]>;
export type VerificationPendingMemberSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    userId?: boolean;
    joinedAt?: boolean;
    flagged?: boolean;
}, ExtArgs["result"]["verificationPendingMember"]>;
export type VerificationPendingMemberSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    guildId?: boolean;
    userId?: boolean;
    joinedAt?: boolean;
    flagged?: boolean;
}, ExtArgs["result"]["verificationPendingMember"]>;
export type VerificationPendingMemberSelectScalar = {
    guildId?: boolean;
    userId?: boolean;
    joinedAt?: boolean;
    flagged?: boolean;
};
export type VerificationPendingMemberOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"guildId" | "userId" | "joinedAt" | "flagged", ExtArgs["result"]["verificationPendingMember"]>;
export type $VerificationPendingMemberPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "VerificationPendingMember";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        guildId: string;
        userId: string;
        joinedAt: Date;
        flagged: boolean;
    }, ExtArgs["result"]["verificationPendingMember"]>;
    composites: {};
};
export type VerificationPendingMemberGetPayload<S extends boolean | null | undefined | VerificationPendingMemberDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload, S>;
export type VerificationPendingMemberCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<VerificationPendingMemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: VerificationPendingMemberCountAggregateInputType | true;
};
export interface VerificationPendingMemberDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['VerificationPendingMember'];
        meta: {
            name: 'VerificationPendingMember';
        };
    };
    /**
     * Find zero or one VerificationPendingMember that matches the filter.
     * @param {VerificationPendingMemberFindUniqueArgs} args - Arguments to find a VerificationPendingMember
     * @example
     * // Get one VerificationPendingMember
     * const verificationPendingMember = await prisma.verificationPendingMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VerificationPendingMemberFindUniqueArgs>(args: Prisma.SelectSubset<T, VerificationPendingMemberFindUniqueArgs<ExtArgs>>): Prisma.Prisma__VerificationPendingMemberClient<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one VerificationPendingMember that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VerificationPendingMemberFindUniqueOrThrowArgs} args - Arguments to find a VerificationPendingMember
     * @example
     * // Get one VerificationPendingMember
     * const verificationPendingMember = await prisma.verificationPendingMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VerificationPendingMemberFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, VerificationPendingMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationPendingMemberClient<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VerificationPendingMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationPendingMemberFindFirstArgs} args - Arguments to find a VerificationPendingMember
     * @example
     * // Get one VerificationPendingMember
     * const verificationPendingMember = await prisma.verificationPendingMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VerificationPendingMemberFindFirstArgs>(args?: Prisma.SelectSubset<T, VerificationPendingMemberFindFirstArgs<ExtArgs>>): Prisma.Prisma__VerificationPendingMemberClient<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first VerificationPendingMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationPendingMemberFindFirstOrThrowArgs} args - Arguments to find a VerificationPendingMember
     * @example
     * // Get one VerificationPendingMember
     * const verificationPendingMember = await prisma.verificationPendingMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VerificationPendingMemberFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, VerificationPendingMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__VerificationPendingMemberClient<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more VerificationPendingMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationPendingMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VerificationPendingMembers
     * const verificationPendingMembers = await prisma.verificationPendingMember.findMany()
     *
     * // Get first 10 VerificationPendingMembers
     * const verificationPendingMembers = await prisma.verificationPendingMember.findMany({ take: 10 })
     *
     * // Only select the `guildId`
     * const verificationPendingMemberWithGuildIdOnly = await prisma.verificationPendingMember.findMany({ select: { guildId: true } })
     *
     */
    findMany<T extends VerificationPendingMemberFindManyArgs>(args?: Prisma.SelectSubset<T, VerificationPendingMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a VerificationPendingMember.
     * @param {VerificationPendingMemberCreateArgs} args - Arguments to create a VerificationPendingMember.
     * @example
     * // Create one VerificationPendingMember
     * const VerificationPendingMember = await prisma.verificationPendingMember.create({
     *   data: {
     *     // ... data to create a VerificationPendingMember
     *   }
     * })
     *
     */
    create<T extends VerificationPendingMemberCreateArgs>(args: Prisma.SelectSubset<T, VerificationPendingMemberCreateArgs<ExtArgs>>): Prisma.Prisma__VerificationPendingMemberClient<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many VerificationPendingMembers.
     * @param {VerificationPendingMemberCreateManyArgs} args - Arguments to create many VerificationPendingMembers.
     * @example
     * // Create many VerificationPendingMembers
     * const verificationPendingMember = await prisma.verificationPendingMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends VerificationPendingMemberCreateManyArgs>(args?: Prisma.SelectSubset<T, VerificationPendingMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many VerificationPendingMembers and returns the data saved in the database.
     * @param {VerificationPendingMemberCreateManyAndReturnArgs} args - Arguments to create many VerificationPendingMembers.
     * @example
     * // Create many VerificationPendingMembers
     * const verificationPendingMember = await prisma.verificationPendingMember.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many VerificationPendingMembers and only return the `guildId`
     * const verificationPendingMemberWithGuildIdOnly = await prisma.verificationPendingMember.createManyAndReturn({
     *   select: { guildId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends VerificationPendingMemberCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, VerificationPendingMemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a VerificationPendingMember.
     * @param {VerificationPendingMemberDeleteArgs} args - Arguments to delete one VerificationPendingMember.
     * @example
     * // Delete one VerificationPendingMember
     * const VerificationPendingMember = await prisma.verificationPendingMember.delete({
     *   where: {
     *     // ... filter to delete one VerificationPendingMember
     *   }
     * })
     *
     */
    delete<T extends VerificationPendingMemberDeleteArgs>(args: Prisma.SelectSubset<T, VerificationPendingMemberDeleteArgs<ExtArgs>>): Prisma.Prisma__VerificationPendingMemberClient<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one VerificationPendingMember.
     * @param {VerificationPendingMemberUpdateArgs} args - Arguments to update one VerificationPendingMember.
     * @example
     * // Update one VerificationPendingMember
     * const verificationPendingMember = await prisma.verificationPendingMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends VerificationPendingMemberUpdateArgs>(args: Prisma.SelectSubset<T, VerificationPendingMemberUpdateArgs<ExtArgs>>): Prisma.Prisma__VerificationPendingMemberClient<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more VerificationPendingMembers.
     * @param {VerificationPendingMemberDeleteManyArgs} args - Arguments to filter VerificationPendingMembers to delete.
     * @example
     * // Delete a few VerificationPendingMembers
     * const { count } = await prisma.verificationPendingMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends VerificationPendingMemberDeleteManyArgs>(args?: Prisma.SelectSubset<T, VerificationPendingMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VerificationPendingMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationPendingMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VerificationPendingMembers
     * const verificationPendingMember = await prisma.verificationPendingMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends VerificationPendingMemberUpdateManyArgs>(args: Prisma.SelectSubset<T, VerificationPendingMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more VerificationPendingMembers and returns the data updated in the database.
     * @param {VerificationPendingMemberUpdateManyAndReturnArgs} args - Arguments to update many VerificationPendingMembers.
     * @example
     * // Update many VerificationPendingMembers
     * const verificationPendingMember = await prisma.verificationPendingMember.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more VerificationPendingMembers and only return the `guildId`
     * const verificationPendingMemberWithGuildIdOnly = await prisma.verificationPendingMember.updateManyAndReturn({
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
    updateManyAndReturn<T extends VerificationPendingMemberUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, VerificationPendingMemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one VerificationPendingMember.
     * @param {VerificationPendingMemberUpsertArgs} args - Arguments to update or create a VerificationPendingMember.
     * @example
     * // Update or create a VerificationPendingMember
     * const verificationPendingMember = await prisma.verificationPendingMember.upsert({
     *   create: {
     *     // ... data to create a VerificationPendingMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VerificationPendingMember we want to update
     *   }
     * })
     */
    upsert<T extends VerificationPendingMemberUpsertArgs>(args: Prisma.SelectSubset<T, VerificationPendingMemberUpsertArgs<ExtArgs>>): Prisma.Prisma__VerificationPendingMemberClient<runtime.Types.Result.GetResult<Prisma.$VerificationPendingMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of VerificationPendingMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationPendingMemberCountArgs} args - Arguments to filter VerificationPendingMembers to count.
     * @example
     * // Count the number of VerificationPendingMembers
     * const count = await prisma.verificationPendingMember.count({
     *   where: {
     *     // ... the filter for the VerificationPendingMembers we want to count
     *   }
     * })
    **/
    count<T extends VerificationPendingMemberCountArgs>(args?: Prisma.Subset<T, VerificationPendingMemberCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], VerificationPendingMemberCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a VerificationPendingMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationPendingMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends VerificationPendingMemberAggregateArgs>(args: Prisma.Subset<T, VerificationPendingMemberAggregateArgs>): Prisma.PrismaPromise<GetVerificationPendingMemberAggregateType<T>>;
    /**
     * Group by VerificationPendingMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VerificationPendingMemberGroupByArgs} args - Group by arguments.
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
    groupBy<T extends VerificationPendingMemberGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: VerificationPendingMemberGroupByArgs['orderBy'];
    } : {
        orderBy?: VerificationPendingMemberGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, VerificationPendingMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVerificationPendingMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the VerificationPendingMember model
     */
    readonly fields: VerificationPendingMemberFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for VerificationPendingMember.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__VerificationPendingMemberClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
 * Fields of the VerificationPendingMember model
 */
export interface VerificationPendingMemberFieldRefs {
    readonly guildId: Prisma.FieldRef<"VerificationPendingMember", 'String'>;
    readonly userId: Prisma.FieldRef<"VerificationPendingMember", 'String'>;
    readonly joinedAt: Prisma.FieldRef<"VerificationPendingMember", 'DateTime'>;
    readonly flagged: Prisma.FieldRef<"VerificationPendingMember", 'Boolean'>;
}
/**
 * VerificationPendingMember findUnique
 */
export type VerificationPendingMemberFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationPendingMember to fetch.
     */
    where: Prisma.VerificationPendingMemberWhereUniqueInput;
};
/**
 * VerificationPendingMember findUniqueOrThrow
 */
export type VerificationPendingMemberFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationPendingMember to fetch.
     */
    where: Prisma.VerificationPendingMemberWhereUniqueInput;
};
/**
 * VerificationPendingMember findFirst
 */
export type VerificationPendingMemberFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationPendingMember to fetch.
     */
    where?: Prisma.VerificationPendingMemberWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationPendingMembers to fetch.
     */
    orderBy?: Prisma.VerificationPendingMemberOrderByWithRelationInput | Prisma.VerificationPendingMemberOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VerificationPendingMembers.
     */
    cursor?: Prisma.VerificationPendingMemberWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationPendingMembers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationPendingMembers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationPendingMembers.
     */
    distinct?: Prisma.VerificationPendingMemberScalarFieldEnum | Prisma.VerificationPendingMemberScalarFieldEnum[];
};
/**
 * VerificationPendingMember findFirstOrThrow
 */
export type VerificationPendingMemberFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationPendingMember to fetch.
     */
    where?: Prisma.VerificationPendingMemberWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationPendingMembers to fetch.
     */
    orderBy?: Prisma.VerificationPendingMemberOrderByWithRelationInput | Prisma.VerificationPendingMemberOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for VerificationPendingMembers.
     */
    cursor?: Prisma.VerificationPendingMemberWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationPendingMembers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationPendingMembers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationPendingMembers.
     */
    distinct?: Prisma.VerificationPendingMemberScalarFieldEnum | Prisma.VerificationPendingMemberScalarFieldEnum[];
};
/**
 * VerificationPendingMember findMany
 */
export type VerificationPendingMemberFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * Filter, which VerificationPendingMembers to fetch.
     */
    where?: Prisma.VerificationPendingMemberWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of VerificationPendingMembers to fetch.
     */
    orderBy?: Prisma.VerificationPendingMemberOrderByWithRelationInput | Prisma.VerificationPendingMemberOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing VerificationPendingMembers.
     */
    cursor?: Prisma.VerificationPendingMemberWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` VerificationPendingMembers from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` VerificationPendingMembers.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of VerificationPendingMembers.
     */
    distinct?: Prisma.VerificationPendingMemberScalarFieldEnum | Prisma.VerificationPendingMemberScalarFieldEnum[];
};
/**
 * VerificationPendingMember create
 */
export type VerificationPendingMemberCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * The data needed to create a VerificationPendingMember.
     */
    data: Prisma.XOR<Prisma.VerificationPendingMemberCreateInput, Prisma.VerificationPendingMemberUncheckedCreateInput>;
};
/**
 * VerificationPendingMember createMany
 */
export type VerificationPendingMemberCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many VerificationPendingMembers.
     */
    data: Prisma.VerificationPendingMemberCreateManyInput | Prisma.VerificationPendingMemberCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VerificationPendingMember createManyAndReturn
 */
export type VerificationPendingMemberCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * The data used to create many VerificationPendingMembers.
     */
    data: Prisma.VerificationPendingMemberCreateManyInput | Prisma.VerificationPendingMemberCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * VerificationPendingMember update
 */
export type VerificationPendingMemberUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * The data needed to update a VerificationPendingMember.
     */
    data: Prisma.XOR<Prisma.VerificationPendingMemberUpdateInput, Prisma.VerificationPendingMemberUncheckedUpdateInput>;
    /**
     * Choose, which VerificationPendingMember to update.
     */
    where: Prisma.VerificationPendingMemberWhereUniqueInput;
};
/**
 * VerificationPendingMember updateMany
 */
export type VerificationPendingMemberUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update VerificationPendingMembers.
     */
    data: Prisma.XOR<Prisma.VerificationPendingMemberUpdateManyMutationInput, Prisma.VerificationPendingMemberUncheckedUpdateManyInput>;
    /**
     * Filter which VerificationPendingMembers to update
     */
    where?: Prisma.VerificationPendingMemberWhereInput;
    /**
     * Limit how many VerificationPendingMembers to update.
     */
    limit?: number;
};
/**
 * VerificationPendingMember updateManyAndReturn
 */
export type VerificationPendingMemberUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * The data used to update VerificationPendingMembers.
     */
    data: Prisma.XOR<Prisma.VerificationPendingMemberUpdateManyMutationInput, Prisma.VerificationPendingMemberUncheckedUpdateManyInput>;
    /**
     * Filter which VerificationPendingMembers to update
     */
    where?: Prisma.VerificationPendingMemberWhereInput;
    /**
     * Limit how many VerificationPendingMembers to update.
     */
    limit?: number;
};
/**
 * VerificationPendingMember upsert
 */
export type VerificationPendingMemberUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * The filter to search for the VerificationPendingMember to update in case it exists.
     */
    where: Prisma.VerificationPendingMemberWhereUniqueInput;
    /**
     * In case the VerificationPendingMember found by the `where` argument doesn't exist, create a new VerificationPendingMember with this data.
     */
    create: Prisma.XOR<Prisma.VerificationPendingMemberCreateInput, Prisma.VerificationPendingMemberUncheckedCreateInput>;
    /**
     * In case the VerificationPendingMember was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.VerificationPendingMemberUpdateInput, Prisma.VerificationPendingMemberUncheckedUpdateInput>;
};
/**
 * VerificationPendingMember delete
 */
export type VerificationPendingMemberDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
    /**
     * Filter which VerificationPendingMember to delete.
     */
    where: Prisma.VerificationPendingMemberWhereUniqueInput;
};
/**
 * VerificationPendingMember deleteMany
 */
export type VerificationPendingMemberDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which VerificationPendingMembers to delete
     */
    where?: Prisma.VerificationPendingMemberWhereInput;
    /**
     * Limit how many VerificationPendingMembers to delete.
     */
    limit?: number;
};
/**
 * VerificationPendingMember without action
 */
export type VerificationPendingMemberDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VerificationPendingMember
     */
    select?: Prisma.VerificationPendingMemberSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the VerificationPendingMember
     */
    omit?: Prisma.VerificationPendingMemberOmit<ExtArgs> | null;
};
//# sourceMappingURL=VerificationPendingMember.d.ts.map
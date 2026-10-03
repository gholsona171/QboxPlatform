import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model DiscordGuildMembershipRole
 *
 */
export type DiscordGuildMembershipRoleModel = runtime.Types.Result.DefaultSelection<Prisma.$DiscordGuildMembershipRolePayload>;
export type AggregateDiscordGuildMembershipRole = {
    _count: DiscordGuildMembershipRoleCountAggregateOutputType | null;
    _min: DiscordGuildMembershipRoleMinAggregateOutputType | null;
    _max: DiscordGuildMembershipRoleMaxAggregateOutputType | null;
};
export type DiscordGuildMembershipRoleMinAggregateOutputType = {
    membershipId: string | null;
    roleId: string | null;
    createdAt: Date | null;
};
export type DiscordGuildMembershipRoleMaxAggregateOutputType = {
    membershipId: string | null;
    roleId: string | null;
    createdAt: Date | null;
};
export type DiscordGuildMembershipRoleCountAggregateOutputType = {
    membershipId: number;
    roleId: number;
    createdAt: number;
    _all: number;
};
export type DiscordGuildMembershipRoleMinAggregateInputType = {
    membershipId?: true;
    roleId?: true;
    createdAt?: true;
};
export type DiscordGuildMembershipRoleMaxAggregateInputType = {
    membershipId?: true;
    roleId?: true;
    createdAt?: true;
};
export type DiscordGuildMembershipRoleCountAggregateInputType = {
    membershipId?: true;
    roleId?: true;
    createdAt?: true;
    _all?: true;
};
export type DiscordGuildMembershipRoleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DiscordGuildMembershipRole to aggregate.
     */
    where?: Prisma.DiscordGuildMembershipRoleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DiscordGuildMembershipRoles to fetch.
     */
    orderBy?: Prisma.DiscordGuildMembershipRoleOrderByWithRelationInput | Prisma.DiscordGuildMembershipRoleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DiscordGuildMembershipRoles from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DiscordGuildMembershipRoles.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DiscordGuildMembershipRoles
    **/
    _count?: true | DiscordGuildMembershipRoleCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: DiscordGuildMembershipRoleMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: DiscordGuildMembershipRoleMaxAggregateInputType;
};
export type GetDiscordGuildMembershipRoleAggregateType<T extends DiscordGuildMembershipRoleAggregateArgs> = {
    [P in keyof T & keyof AggregateDiscordGuildMembershipRole]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDiscordGuildMembershipRole[P]> : Prisma.GetScalarType<T[P], AggregateDiscordGuildMembershipRole[P]>;
};
export type DiscordGuildMembershipRoleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DiscordGuildMembershipRoleWhereInput;
    orderBy?: Prisma.DiscordGuildMembershipRoleOrderByWithAggregationInput | Prisma.DiscordGuildMembershipRoleOrderByWithAggregationInput[];
    by: Prisma.DiscordGuildMembershipRoleScalarFieldEnum[] | Prisma.DiscordGuildMembershipRoleScalarFieldEnum;
    having?: Prisma.DiscordGuildMembershipRoleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DiscordGuildMembershipRoleCountAggregateInputType | true;
    _min?: DiscordGuildMembershipRoleMinAggregateInputType;
    _max?: DiscordGuildMembershipRoleMaxAggregateInputType;
};
export type DiscordGuildMembershipRoleGroupByOutputType = {
    membershipId: string;
    roleId: string;
    createdAt: Date;
    _count: DiscordGuildMembershipRoleCountAggregateOutputType | null;
    _min: DiscordGuildMembershipRoleMinAggregateOutputType | null;
    _max: DiscordGuildMembershipRoleMaxAggregateOutputType | null;
};
export type GetDiscordGuildMembershipRoleGroupByPayload<T extends DiscordGuildMembershipRoleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DiscordGuildMembershipRoleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DiscordGuildMembershipRoleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DiscordGuildMembershipRoleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DiscordGuildMembershipRoleGroupByOutputType[P]>;
}>>;
export type DiscordGuildMembershipRoleWhereInput = {
    AND?: Prisma.DiscordGuildMembershipRoleWhereInput | Prisma.DiscordGuildMembershipRoleWhereInput[];
    OR?: Prisma.DiscordGuildMembershipRoleWhereInput[];
    NOT?: Prisma.DiscordGuildMembershipRoleWhereInput | Prisma.DiscordGuildMembershipRoleWhereInput[];
    membershipId?: Prisma.UuidFilter<"DiscordGuildMembershipRole"> | string;
    roleId?: Prisma.StringFilter<"DiscordGuildMembershipRole"> | string;
    createdAt?: Prisma.DateTimeFilter<"DiscordGuildMembershipRole"> | Date | string;
    membership?: Prisma.XOR<Prisma.DiscordGuildMembershipScalarRelationFilter, Prisma.DiscordGuildMembershipWhereInput>;
};
export type DiscordGuildMembershipRoleOrderByWithRelationInput = {
    membershipId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    membership?: Prisma.DiscordGuildMembershipOrderByWithRelationInput;
};
export type DiscordGuildMembershipRoleWhereUniqueInput = Prisma.AtLeast<{
    membershipId_roleId?: Prisma.DiscordGuildMembershipRoleMembershipIdRoleIdCompoundUniqueInput;
    AND?: Prisma.DiscordGuildMembershipRoleWhereInput | Prisma.DiscordGuildMembershipRoleWhereInput[];
    OR?: Prisma.DiscordGuildMembershipRoleWhereInput[];
    NOT?: Prisma.DiscordGuildMembershipRoleWhereInput | Prisma.DiscordGuildMembershipRoleWhereInput[];
    membershipId?: Prisma.UuidFilter<"DiscordGuildMembershipRole"> | string;
    roleId?: Prisma.StringFilter<"DiscordGuildMembershipRole"> | string;
    createdAt?: Prisma.DateTimeFilter<"DiscordGuildMembershipRole"> | Date | string;
    membership?: Prisma.XOR<Prisma.DiscordGuildMembershipScalarRelationFilter, Prisma.DiscordGuildMembershipWhereInput>;
}, "membershipId_roleId">;
export type DiscordGuildMembershipRoleOrderByWithAggregationInput = {
    membershipId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.DiscordGuildMembershipRoleCountOrderByAggregateInput;
    _max?: Prisma.DiscordGuildMembershipRoleMaxOrderByAggregateInput;
    _min?: Prisma.DiscordGuildMembershipRoleMinOrderByAggregateInput;
};
export type DiscordGuildMembershipRoleScalarWhereWithAggregatesInput = {
    AND?: Prisma.DiscordGuildMembershipRoleScalarWhereWithAggregatesInput | Prisma.DiscordGuildMembershipRoleScalarWhereWithAggregatesInput[];
    OR?: Prisma.DiscordGuildMembershipRoleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DiscordGuildMembershipRoleScalarWhereWithAggregatesInput | Prisma.DiscordGuildMembershipRoleScalarWhereWithAggregatesInput[];
    membershipId?: Prisma.UuidWithAggregatesFilter<"DiscordGuildMembershipRole"> | string;
    roleId?: Prisma.StringWithAggregatesFilter<"DiscordGuildMembershipRole"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DiscordGuildMembershipRole"> | Date | string;
};
export type DiscordGuildMembershipRoleCreateInput = {
    roleId: string;
    createdAt?: Date | string;
    membership: Prisma.DiscordGuildMembershipCreateNestedOneWithoutRolesInput;
};
export type DiscordGuildMembershipRoleUncheckedCreateInput = {
    membershipId: string;
    roleId: string;
    createdAt?: Date | string;
};
export type DiscordGuildMembershipRoleUpdateInput = {
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    membership?: Prisma.DiscordGuildMembershipUpdateOneRequiredWithoutRolesNestedInput;
};
export type DiscordGuildMembershipRoleUncheckedUpdateInput = {
    membershipId?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordGuildMembershipRoleCreateManyInput = {
    membershipId: string;
    roleId: string;
    createdAt?: Date | string;
};
export type DiscordGuildMembershipRoleUpdateManyMutationInput = {
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordGuildMembershipRoleUncheckedUpdateManyInput = {
    membershipId?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordGuildMembershipRoleListRelationFilter = {
    every?: Prisma.DiscordGuildMembershipRoleWhereInput;
    some?: Prisma.DiscordGuildMembershipRoleWhereInput;
    none?: Prisma.DiscordGuildMembershipRoleWhereInput;
};
export type DiscordGuildMembershipRoleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DiscordGuildMembershipRoleMembershipIdRoleIdCompoundUniqueInput = {
    membershipId: string;
    roleId: string;
};
export type DiscordGuildMembershipRoleCountOrderByAggregateInput = {
    membershipId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DiscordGuildMembershipRoleMaxOrderByAggregateInput = {
    membershipId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DiscordGuildMembershipRoleMinOrderByAggregateInput = {
    membershipId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DiscordGuildMembershipRoleCreateNestedManyWithoutMembershipInput = {
    create?: Prisma.XOR<Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput, Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput> | Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput[] | Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput[];
    connectOrCreate?: Prisma.DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput[];
    createMany?: Prisma.DiscordGuildMembershipRoleCreateManyMembershipInputEnvelope;
    connect?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
};
export type DiscordGuildMembershipRoleUncheckedCreateNestedManyWithoutMembershipInput = {
    create?: Prisma.XOR<Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput, Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput> | Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput[] | Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput[];
    connectOrCreate?: Prisma.DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput[];
    createMany?: Prisma.DiscordGuildMembershipRoleCreateManyMembershipInputEnvelope;
    connect?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
};
export type DiscordGuildMembershipRoleUpdateManyWithoutMembershipNestedInput = {
    create?: Prisma.XOR<Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput, Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput> | Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput[] | Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput[];
    connectOrCreate?: Prisma.DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput[];
    upsert?: Prisma.DiscordGuildMembershipRoleUpsertWithWhereUniqueWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleUpsertWithWhereUniqueWithoutMembershipInput[];
    createMany?: Prisma.DiscordGuildMembershipRoleCreateManyMembershipInputEnvelope;
    set?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
    disconnect?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
    delete?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
    connect?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
    update?: Prisma.DiscordGuildMembershipRoleUpdateWithWhereUniqueWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleUpdateWithWhereUniqueWithoutMembershipInput[];
    updateMany?: Prisma.DiscordGuildMembershipRoleUpdateManyWithWhereWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleUpdateManyWithWhereWithoutMembershipInput[];
    deleteMany?: Prisma.DiscordGuildMembershipRoleScalarWhereInput | Prisma.DiscordGuildMembershipRoleScalarWhereInput[];
};
export type DiscordGuildMembershipRoleUncheckedUpdateManyWithoutMembershipNestedInput = {
    create?: Prisma.XOR<Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput, Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput> | Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput[] | Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput[];
    connectOrCreate?: Prisma.DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput[];
    upsert?: Prisma.DiscordGuildMembershipRoleUpsertWithWhereUniqueWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleUpsertWithWhereUniqueWithoutMembershipInput[];
    createMany?: Prisma.DiscordGuildMembershipRoleCreateManyMembershipInputEnvelope;
    set?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
    disconnect?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
    delete?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
    connect?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput | Prisma.DiscordGuildMembershipRoleWhereUniqueInput[];
    update?: Prisma.DiscordGuildMembershipRoleUpdateWithWhereUniqueWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleUpdateWithWhereUniqueWithoutMembershipInput[];
    updateMany?: Prisma.DiscordGuildMembershipRoleUpdateManyWithWhereWithoutMembershipInput | Prisma.DiscordGuildMembershipRoleUpdateManyWithWhereWithoutMembershipInput[];
    deleteMany?: Prisma.DiscordGuildMembershipRoleScalarWhereInput | Prisma.DiscordGuildMembershipRoleScalarWhereInput[];
};
export type DiscordGuildMembershipRoleCreateWithoutMembershipInput = {
    roleId: string;
    createdAt?: Date | string;
};
export type DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput = {
    roleId: string;
    createdAt?: Date | string;
};
export type DiscordGuildMembershipRoleCreateOrConnectWithoutMembershipInput = {
    where: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
    create: Prisma.XOR<Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput, Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput>;
};
export type DiscordGuildMembershipRoleCreateManyMembershipInputEnvelope = {
    data: Prisma.DiscordGuildMembershipRoleCreateManyMembershipInput | Prisma.DiscordGuildMembershipRoleCreateManyMembershipInput[];
    skipDuplicates?: boolean;
};
export type DiscordGuildMembershipRoleUpsertWithWhereUniqueWithoutMembershipInput = {
    where: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
    update: Prisma.XOR<Prisma.DiscordGuildMembershipRoleUpdateWithoutMembershipInput, Prisma.DiscordGuildMembershipRoleUncheckedUpdateWithoutMembershipInput>;
    create: Prisma.XOR<Prisma.DiscordGuildMembershipRoleCreateWithoutMembershipInput, Prisma.DiscordGuildMembershipRoleUncheckedCreateWithoutMembershipInput>;
};
export type DiscordGuildMembershipRoleUpdateWithWhereUniqueWithoutMembershipInput = {
    where: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
    data: Prisma.XOR<Prisma.DiscordGuildMembershipRoleUpdateWithoutMembershipInput, Prisma.DiscordGuildMembershipRoleUncheckedUpdateWithoutMembershipInput>;
};
export type DiscordGuildMembershipRoleUpdateManyWithWhereWithoutMembershipInput = {
    where: Prisma.DiscordGuildMembershipRoleScalarWhereInput;
    data: Prisma.XOR<Prisma.DiscordGuildMembershipRoleUpdateManyMutationInput, Prisma.DiscordGuildMembershipRoleUncheckedUpdateManyWithoutMembershipInput>;
};
export type DiscordGuildMembershipRoleScalarWhereInput = {
    AND?: Prisma.DiscordGuildMembershipRoleScalarWhereInput | Prisma.DiscordGuildMembershipRoleScalarWhereInput[];
    OR?: Prisma.DiscordGuildMembershipRoleScalarWhereInput[];
    NOT?: Prisma.DiscordGuildMembershipRoleScalarWhereInput | Prisma.DiscordGuildMembershipRoleScalarWhereInput[];
    membershipId?: Prisma.UuidFilter<"DiscordGuildMembershipRole"> | string;
    roleId?: Prisma.StringFilter<"DiscordGuildMembershipRole"> | string;
    createdAt?: Prisma.DateTimeFilter<"DiscordGuildMembershipRole"> | Date | string;
};
export type DiscordGuildMembershipRoleCreateManyMembershipInput = {
    roleId: string;
    createdAt?: Date | string;
};
export type DiscordGuildMembershipRoleUpdateWithoutMembershipInput = {
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordGuildMembershipRoleUncheckedUpdateWithoutMembershipInput = {
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordGuildMembershipRoleUncheckedUpdateManyWithoutMembershipInput = {
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DiscordGuildMembershipRoleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    membershipId?: boolean;
    roleId?: boolean;
    createdAt?: boolean;
    membership?: boolean | Prisma.DiscordGuildMembershipDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["discordGuildMembershipRole"]>;
export type DiscordGuildMembershipRoleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    membershipId?: boolean;
    roleId?: boolean;
    createdAt?: boolean;
    membership?: boolean | Prisma.DiscordGuildMembershipDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["discordGuildMembershipRole"]>;
export type DiscordGuildMembershipRoleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    membershipId?: boolean;
    roleId?: boolean;
    createdAt?: boolean;
    membership?: boolean | Prisma.DiscordGuildMembershipDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["discordGuildMembershipRole"]>;
export type DiscordGuildMembershipRoleSelectScalar = {
    membershipId?: boolean;
    roleId?: boolean;
    createdAt?: boolean;
};
export type DiscordGuildMembershipRoleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"membershipId" | "roleId" | "createdAt", ExtArgs["result"]["discordGuildMembershipRole"]>;
export type DiscordGuildMembershipRoleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    membership?: boolean | Prisma.DiscordGuildMembershipDefaultArgs<ExtArgs>;
};
export type DiscordGuildMembershipRoleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    membership?: boolean | Prisma.DiscordGuildMembershipDefaultArgs<ExtArgs>;
};
export type DiscordGuildMembershipRoleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    membership?: boolean | Prisma.DiscordGuildMembershipDefaultArgs<ExtArgs>;
};
export type $DiscordGuildMembershipRolePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DiscordGuildMembershipRole";
    objects: {
        membership: Prisma.$DiscordGuildMembershipPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        membershipId: string;
        roleId: string;
        createdAt: Date;
    }, ExtArgs["result"]["discordGuildMembershipRole"]>;
    composites: {};
};
export type DiscordGuildMembershipRoleGetPayload<S extends boolean | null | undefined | DiscordGuildMembershipRoleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload, S>;
export type DiscordGuildMembershipRoleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DiscordGuildMembershipRoleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DiscordGuildMembershipRoleCountAggregateInputType | true;
};
export interface DiscordGuildMembershipRoleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DiscordGuildMembershipRole'];
        meta: {
            name: 'DiscordGuildMembershipRole';
        };
    };
    /**
     * Find zero or one DiscordGuildMembershipRole that matches the filter.
     * @param {DiscordGuildMembershipRoleFindUniqueArgs} args - Arguments to find a DiscordGuildMembershipRole
     * @example
     * // Get one DiscordGuildMembershipRole
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DiscordGuildMembershipRoleFindUniqueArgs>(args: Prisma.SelectSubset<T, DiscordGuildMembershipRoleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipRoleClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one DiscordGuildMembershipRole that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DiscordGuildMembershipRoleFindUniqueOrThrowArgs} args - Arguments to find a DiscordGuildMembershipRole
     * @example
     * // Get one DiscordGuildMembershipRole
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DiscordGuildMembershipRoleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DiscordGuildMembershipRoleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipRoleClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DiscordGuildMembershipRole that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordGuildMembershipRoleFindFirstArgs} args - Arguments to find a DiscordGuildMembershipRole
     * @example
     * // Get one DiscordGuildMembershipRole
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DiscordGuildMembershipRoleFindFirstArgs>(args?: Prisma.SelectSubset<T, DiscordGuildMembershipRoleFindFirstArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipRoleClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first DiscordGuildMembershipRole that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordGuildMembershipRoleFindFirstOrThrowArgs} args - Arguments to find a DiscordGuildMembershipRole
     * @example
     * // Get one DiscordGuildMembershipRole
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DiscordGuildMembershipRoleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DiscordGuildMembershipRoleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipRoleClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more DiscordGuildMembershipRoles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordGuildMembershipRoleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DiscordGuildMembershipRoles
     * const discordGuildMembershipRoles = await prisma.discordGuildMembershipRole.findMany()
     *
     * // Get first 10 DiscordGuildMembershipRoles
     * const discordGuildMembershipRoles = await prisma.discordGuildMembershipRole.findMany({ take: 10 })
     *
     * // Only select the `membershipId`
     * const discordGuildMembershipRoleWithMembershipIdOnly = await prisma.discordGuildMembershipRole.findMany({ select: { membershipId: true } })
     *
     */
    findMany<T extends DiscordGuildMembershipRoleFindManyArgs>(args?: Prisma.SelectSubset<T, DiscordGuildMembershipRoleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a DiscordGuildMembershipRole.
     * @param {DiscordGuildMembershipRoleCreateArgs} args - Arguments to create a DiscordGuildMembershipRole.
     * @example
     * // Create one DiscordGuildMembershipRole
     * const DiscordGuildMembershipRole = await prisma.discordGuildMembershipRole.create({
     *   data: {
     *     // ... data to create a DiscordGuildMembershipRole
     *   }
     * })
     *
     */
    create<T extends DiscordGuildMembershipRoleCreateArgs>(args: Prisma.SelectSubset<T, DiscordGuildMembershipRoleCreateArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipRoleClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many DiscordGuildMembershipRoles.
     * @param {DiscordGuildMembershipRoleCreateManyArgs} args - Arguments to create many DiscordGuildMembershipRoles.
     * @example
     * // Create many DiscordGuildMembershipRoles
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DiscordGuildMembershipRoleCreateManyArgs>(args?: Prisma.SelectSubset<T, DiscordGuildMembershipRoleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many DiscordGuildMembershipRoles and returns the data saved in the database.
     * @param {DiscordGuildMembershipRoleCreateManyAndReturnArgs} args - Arguments to create many DiscordGuildMembershipRoles.
     * @example
     * // Create many DiscordGuildMembershipRoles
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DiscordGuildMembershipRoles and only return the `membershipId`
     * const discordGuildMembershipRoleWithMembershipIdOnly = await prisma.discordGuildMembershipRole.createManyAndReturn({
     *   select: { membershipId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DiscordGuildMembershipRoleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DiscordGuildMembershipRoleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a DiscordGuildMembershipRole.
     * @param {DiscordGuildMembershipRoleDeleteArgs} args - Arguments to delete one DiscordGuildMembershipRole.
     * @example
     * // Delete one DiscordGuildMembershipRole
     * const DiscordGuildMembershipRole = await prisma.discordGuildMembershipRole.delete({
     *   where: {
     *     // ... filter to delete one DiscordGuildMembershipRole
     *   }
     * })
     *
     */
    delete<T extends DiscordGuildMembershipRoleDeleteArgs>(args: Prisma.SelectSubset<T, DiscordGuildMembershipRoleDeleteArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipRoleClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one DiscordGuildMembershipRole.
     * @param {DiscordGuildMembershipRoleUpdateArgs} args - Arguments to update one DiscordGuildMembershipRole.
     * @example
     * // Update one DiscordGuildMembershipRole
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DiscordGuildMembershipRoleUpdateArgs>(args: Prisma.SelectSubset<T, DiscordGuildMembershipRoleUpdateArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipRoleClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more DiscordGuildMembershipRoles.
     * @param {DiscordGuildMembershipRoleDeleteManyArgs} args - Arguments to filter DiscordGuildMembershipRoles to delete.
     * @example
     * // Delete a few DiscordGuildMembershipRoles
     * const { count } = await prisma.discordGuildMembershipRole.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DiscordGuildMembershipRoleDeleteManyArgs>(args?: Prisma.SelectSubset<T, DiscordGuildMembershipRoleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DiscordGuildMembershipRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordGuildMembershipRoleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DiscordGuildMembershipRoles
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DiscordGuildMembershipRoleUpdateManyArgs>(args: Prisma.SelectSubset<T, DiscordGuildMembershipRoleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more DiscordGuildMembershipRoles and returns the data updated in the database.
     * @param {DiscordGuildMembershipRoleUpdateManyAndReturnArgs} args - Arguments to update many DiscordGuildMembershipRoles.
     * @example
     * // Update many DiscordGuildMembershipRoles
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more DiscordGuildMembershipRoles and only return the `membershipId`
     * const discordGuildMembershipRoleWithMembershipIdOnly = await prisma.discordGuildMembershipRole.updateManyAndReturn({
     *   select: { membershipId: true },
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
    updateManyAndReturn<T extends DiscordGuildMembershipRoleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DiscordGuildMembershipRoleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one DiscordGuildMembershipRole.
     * @param {DiscordGuildMembershipRoleUpsertArgs} args - Arguments to update or create a DiscordGuildMembershipRole.
     * @example
     * // Update or create a DiscordGuildMembershipRole
     * const discordGuildMembershipRole = await prisma.discordGuildMembershipRole.upsert({
     *   create: {
     *     // ... data to create a DiscordGuildMembershipRole
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DiscordGuildMembershipRole we want to update
     *   }
     * })
     */
    upsert<T extends DiscordGuildMembershipRoleUpsertArgs>(args: Prisma.SelectSubset<T, DiscordGuildMembershipRoleUpsertArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipRoleClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipRolePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of DiscordGuildMembershipRoles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordGuildMembershipRoleCountArgs} args - Arguments to filter DiscordGuildMembershipRoles to count.
     * @example
     * // Count the number of DiscordGuildMembershipRoles
     * const count = await prisma.discordGuildMembershipRole.count({
     *   where: {
     *     // ... the filter for the DiscordGuildMembershipRoles we want to count
     *   }
     * })
    **/
    count<T extends DiscordGuildMembershipRoleCountArgs>(args?: Prisma.Subset<T, DiscordGuildMembershipRoleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DiscordGuildMembershipRoleCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a DiscordGuildMembershipRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordGuildMembershipRoleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DiscordGuildMembershipRoleAggregateArgs>(args: Prisma.Subset<T, DiscordGuildMembershipRoleAggregateArgs>): Prisma.PrismaPromise<GetDiscordGuildMembershipRoleAggregateType<T>>;
    /**
     * Group by DiscordGuildMembershipRole.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordGuildMembershipRoleGroupByArgs} args - Group by arguments.
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
    groupBy<T extends DiscordGuildMembershipRoleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DiscordGuildMembershipRoleGroupByArgs['orderBy'];
    } : {
        orderBy?: DiscordGuildMembershipRoleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DiscordGuildMembershipRoleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiscordGuildMembershipRoleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DiscordGuildMembershipRole model
     */
    readonly fields: DiscordGuildMembershipRoleFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for DiscordGuildMembershipRole.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__DiscordGuildMembershipRoleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    membership<T extends Prisma.DiscordGuildMembershipDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DiscordGuildMembershipDefaultArgs<ExtArgs>>): Prisma.Prisma__DiscordGuildMembershipClient<runtime.Types.Result.GetResult<Prisma.$DiscordGuildMembershipPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the DiscordGuildMembershipRole model
 */
export interface DiscordGuildMembershipRoleFieldRefs {
    readonly membershipId: Prisma.FieldRef<"DiscordGuildMembershipRole", 'String'>;
    readonly roleId: Prisma.FieldRef<"DiscordGuildMembershipRole", 'String'>;
    readonly createdAt: Prisma.FieldRef<"DiscordGuildMembershipRole", 'DateTime'>;
}
/**
 * DiscordGuildMembershipRole findUnique
 */
export type DiscordGuildMembershipRoleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * Filter, which DiscordGuildMembershipRole to fetch.
     */
    where: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
};
/**
 * DiscordGuildMembershipRole findUniqueOrThrow
 */
export type DiscordGuildMembershipRoleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * Filter, which DiscordGuildMembershipRole to fetch.
     */
    where: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
};
/**
 * DiscordGuildMembershipRole findFirst
 */
export type DiscordGuildMembershipRoleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * Filter, which DiscordGuildMembershipRole to fetch.
     */
    where?: Prisma.DiscordGuildMembershipRoleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DiscordGuildMembershipRoles to fetch.
     */
    orderBy?: Prisma.DiscordGuildMembershipRoleOrderByWithRelationInput | Prisma.DiscordGuildMembershipRoleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DiscordGuildMembershipRoles.
     */
    cursor?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DiscordGuildMembershipRoles from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DiscordGuildMembershipRoles.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DiscordGuildMembershipRoles.
     */
    distinct?: Prisma.DiscordGuildMembershipRoleScalarFieldEnum | Prisma.DiscordGuildMembershipRoleScalarFieldEnum[];
};
/**
 * DiscordGuildMembershipRole findFirstOrThrow
 */
export type DiscordGuildMembershipRoleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * Filter, which DiscordGuildMembershipRole to fetch.
     */
    where?: Prisma.DiscordGuildMembershipRoleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DiscordGuildMembershipRoles to fetch.
     */
    orderBy?: Prisma.DiscordGuildMembershipRoleOrderByWithRelationInput | Prisma.DiscordGuildMembershipRoleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DiscordGuildMembershipRoles.
     */
    cursor?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DiscordGuildMembershipRoles from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DiscordGuildMembershipRoles.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DiscordGuildMembershipRoles.
     */
    distinct?: Prisma.DiscordGuildMembershipRoleScalarFieldEnum | Prisma.DiscordGuildMembershipRoleScalarFieldEnum[];
};
/**
 * DiscordGuildMembershipRole findMany
 */
export type DiscordGuildMembershipRoleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * Filter, which DiscordGuildMembershipRoles to fetch.
     */
    where?: Prisma.DiscordGuildMembershipRoleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DiscordGuildMembershipRoles to fetch.
     */
    orderBy?: Prisma.DiscordGuildMembershipRoleOrderByWithRelationInput | Prisma.DiscordGuildMembershipRoleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DiscordGuildMembershipRoles.
     */
    cursor?: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DiscordGuildMembershipRoles from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DiscordGuildMembershipRoles.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DiscordGuildMembershipRoles.
     */
    distinct?: Prisma.DiscordGuildMembershipRoleScalarFieldEnum | Prisma.DiscordGuildMembershipRoleScalarFieldEnum[];
};
/**
 * DiscordGuildMembershipRole create
 */
export type DiscordGuildMembershipRoleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * The data needed to create a DiscordGuildMembershipRole.
     */
    data: Prisma.XOR<Prisma.DiscordGuildMembershipRoleCreateInput, Prisma.DiscordGuildMembershipRoleUncheckedCreateInput>;
};
/**
 * DiscordGuildMembershipRole createMany
 */
export type DiscordGuildMembershipRoleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many DiscordGuildMembershipRoles.
     */
    data: Prisma.DiscordGuildMembershipRoleCreateManyInput | Prisma.DiscordGuildMembershipRoleCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * DiscordGuildMembershipRole createManyAndReturn
 */
export type DiscordGuildMembershipRoleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * The data used to create many DiscordGuildMembershipRoles.
     */
    data: Prisma.DiscordGuildMembershipRoleCreateManyInput | Prisma.DiscordGuildMembershipRoleCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * DiscordGuildMembershipRole update
 */
export type DiscordGuildMembershipRoleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * The data needed to update a DiscordGuildMembershipRole.
     */
    data: Prisma.XOR<Prisma.DiscordGuildMembershipRoleUpdateInput, Prisma.DiscordGuildMembershipRoleUncheckedUpdateInput>;
    /**
     * Choose, which DiscordGuildMembershipRole to update.
     */
    where: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
};
/**
 * DiscordGuildMembershipRole updateMany
 */
export type DiscordGuildMembershipRoleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update DiscordGuildMembershipRoles.
     */
    data: Prisma.XOR<Prisma.DiscordGuildMembershipRoleUpdateManyMutationInput, Prisma.DiscordGuildMembershipRoleUncheckedUpdateManyInput>;
    /**
     * Filter which DiscordGuildMembershipRoles to update
     */
    where?: Prisma.DiscordGuildMembershipRoleWhereInput;
    /**
     * Limit how many DiscordGuildMembershipRoles to update.
     */
    limit?: number;
};
/**
 * DiscordGuildMembershipRole updateManyAndReturn
 */
export type DiscordGuildMembershipRoleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * The data used to update DiscordGuildMembershipRoles.
     */
    data: Prisma.XOR<Prisma.DiscordGuildMembershipRoleUpdateManyMutationInput, Prisma.DiscordGuildMembershipRoleUncheckedUpdateManyInput>;
    /**
     * Filter which DiscordGuildMembershipRoles to update
     */
    where?: Prisma.DiscordGuildMembershipRoleWhereInput;
    /**
     * Limit how many DiscordGuildMembershipRoles to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * DiscordGuildMembershipRole upsert
 */
export type DiscordGuildMembershipRoleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * The filter to search for the DiscordGuildMembershipRole to update in case it exists.
     */
    where: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
    /**
     * In case the DiscordGuildMembershipRole found by the `where` argument doesn't exist, create a new DiscordGuildMembershipRole with this data.
     */
    create: Prisma.XOR<Prisma.DiscordGuildMembershipRoleCreateInput, Prisma.DiscordGuildMembershipRoleUncheckedCreateInput>;
    /**
     * In case the DiscordGuildMembershipRole was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.DiscordGuildMembershipRoleUpdateInput, Prisma.DiscordGuildMembershipRoleUncheckedUpdateInput>;
};
/**
 * DiscordGuildMembershipRole delete
 */
export type DiscordGuildMembershipRoleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
    /**
     * Filter which DiscordGuildMembershipRole to delete.
     */
    where: Prisma.DiscordGuildMembershipRoleWhereUniqueInput;
};
/**
 * DiscordGuildMembershipRole deleteMany
 */
export type DiscordGuildMembershipRoleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which DiscordGuildMembershipRoles to delete
     */
    where?: Prisma.DiscordGuildMembershipRoleWhereInput;
    /**
     * Limit how many DiscordGuildMembershipRoles to delete.
     */
    limit?: number;
};
/**
 * DiscordGuildMembershipRole without action
 */
export type DiscordGuildMembershipRoleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordGuildMembershipRole
     */
    select?: Prisma.DiscordGuildMembershipRoleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DiscordGuildMembershipRole
     */
    omit?: Prisma.DiscordGuildMembershipRoleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DiscordGuildMembershipRoleInclude<ExtArgs> | null;
};
//# sourceMappingURL=DiscordGuildMembershipRole.d.ts.map
import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model AutoroleRule
 *
 */
export type AutoroleRuleModel = runtime.Types.Result.DefaultSelection<Prisma.$AutoroleRulePayload>;
export type AggregateAutoroleRule = {
    _count: AutoroleRuleCountAggregateOutputType | null;
    _avg: AutoroleRuleAvgAggregateOutputType | null;
    _sum: AutoroleRuleSumAggregateOutputType | null;
    _min: AutoroleRuleMinAggregateOutputType | null;
    _max: AutoroleRuleMaxAggregateOutputType | null;
};
export type AutoroleRuleAvgAggregateOutputType = {
    position: number | null;
};
export type AutoroleRuleSumAggregateOutputType = {
    position: number | null;
};
export type AutoroleRuleMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    roleId: string | null;
    position: number | null;
    createdAt: Date | null;
};
export type AutoroleRuleMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    roleId: string | null;
    position: number | null;
    createdAt: Date | null;
};
export type AutoroleRuleCountAggregateOutputType = {
    id: number;
    guildId: number;
    roleId: number;
    position: number;
    createdAt: number;
    _all: number;
};
export type AutoroleRuleAvgAggregateInputType = {
    position?: true;
};
export type AutoroleRuleSumAggregateInputType = {
    position?: true;
};
export type AutoroleRuleMinAggregateInputType = {
    id?: true;
    guildId?: true;
    roleId?: true;
    position?: true;
    createdAt?: true;
};
export type AutoroleRuleMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    roleId?: true;
    position?: true;
    createdAt?: true;
};
export type AutoroleRuleCountAggregateInputType = {
    id?: true;
    guildId?: true;
    roleId?: true;
    position?: true;
    createdAt?: true;
    _all?: true;
};
export type AutoroleRuleAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AutoroleRule to aggregate.
     */
    where?: Prisma.AutoroleRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AutoroleRules to fetch.
     */
    orderBy?: Prisma.AutoroleRuleOrderByWithRelationInput | Prisma.AutoroleRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.AutoroleRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AutoroleRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AutoroleRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned AutoroleRules
    **/
    _count?: true | AutoroleRuleCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: AutoroleRuleAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: AutoroleRuleSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: AutoroleRuleMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: AutoroleRuleMaxAggregateInputType;
};
export type GetAutoroleRuleAggregateType<T extends AutoroleRuleAggregateArgs> = {
    [P in keyof T & keyof AggregateAutoroleRule]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateAutoroleRule[P]> : Prisma.GetScalarType<T[P], AggregateAutoroleRule[P]>;
};
export type AutoroleRuleGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.AutoroleRuleWhereInput;
    orderBy?: Prisma.AutoroleRuleOrderByWithAggregationInput | Prisma.AutoroleRuleOrderByWithAggregationInput[];
    by: Prisma.AutoroleRuleScalarFieldEnum[] | Prisma.AutoroleRuleScalarFieldEnum;
    having?: Prisma.AutoroleRuleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AutoroleRuleCountAggregateInputType | true;
    _avg?: AutoroleRuleAvgAggregateInputType;
    _sum?: AutoroleRuleSumAggregateInputType;
    _min?: AutoroleRuleMinAggregateInputType;
    _max?: AutoroleRuleMaxAggregateInputType;
};
export type AutoroleRuleGroupByOutputType = {
    id: string;
    guildId: string;
    roleId: string;
    position: number;
    createdAt: Date;
    _count: AutoroleRuleCountAggregateOutputType | null;
    _avg: AutoroleRuleAvgAggregateOutputType | null;
    _sum: AutoroleRuleSumAggregateOutputType | null;
    _min: AutoroleRuleMinAggregateOutputType | null;
    _max: AutoroleRuleMaxAggregateOutputType | null;
};
export type GetAutoroleRuleGroupByPayload<T extends AutoroleRuleGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<AutoroleRuleGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof AutoroleRuleGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], AutoroleRuleGroupByOutputType[P]> : Prisma.GetScalarType<T[P], AutoroleRuleGroupByOutputType[P]>;
}>>;
export type AutoroleRuleWhereInput = {
    AND?: Prisma.AutoroleRuleWhereInput | Prisma.AutoroleRuleWhereInput[];
    OR?: Prisma.AutoroleRuleWhereInput[];
    NOT?: Prisma.AutoroleRuleWhereInput | Prisma.AutoroleRuleWhereInput[];
    id?: Prisma.UuidFilter<"AutoroleRule"> | string;
    guildId?: Prisma.UuidFilter<"AutoroleRule"> | string;
    roleId?: Prisma.StringFilter<"AutoroleRule"> | string;
    position?: Prisma.IntFilter<"AutoroleRule"> | number;
    createdAt?: Prisma.DateTimeFilter<"AutoroleRule"> | Date | string;
    guild?: Prisma.XOR<Prisma.GuildScalarRelationFilter, Prisma.GuildWhereInput>;
};
export type AutoroleRuleOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    guild?: Prisma.GuildOrderByWithRelationInput;
};
export type AutoroleRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    guildId_roleId?: Prisma.AutoroleRuleGuildIdRoleIdCompoundUniqueInput;
    guildId_position?: Prisma.AutoroleRuleGuildIdPositionCompoundUniqueInput;
    AND?: Prisma.AutoroleRuleWhereInput | Prisma.AutoroleRuleWhereInput[];
    OR?: Prisma.AutoroleRuleWhereInput[];
    NOT?: Prisma.AutoroleRuleWhereInput | Prisma.AutoroleRuleWhereInput[];
    guildId?: Prisma.UuidFilter<"AutoroleRule"> | string;
    roleId?: Prisma.StringFilter<"AutoroleRule"> | string;
    position?: Prisma.IntFilter<"AutoroleRule"> | number;
    createdAt?: Prisma.DateTimeFilter<"AutoroleRule"> | Date | string;
    guild?: Prisma.XOR<Prisma.GuildScalarRelationFilter, Prisma.GuildWhereInput>;
}, "id" | "guildId_roleId" | "guildId_position">;
export type AutoroleRuleOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.AutoroleRuleCountOrderByAggregateInput;
    _avg?: Prisma.AutoroleRuleAvgOrderByAggregateInput;
    _max?: Prisma.AutoroleRuleMaxOrderByAggregateInput;
    _min?: Prisma.AutoroleRuleMinOrderByAggregateInput;
    _sum?: Prisma.AutoroleRuleSumOrderByAggregateInput;
};
export type AutoroleRuleScalarWhereWithAggregatesInput = {
    AND?: Prisma.AutoroleRuleScalarWhereWithAggregatesInput | Prisma.AutoroleRuleScalarWhereWithAggregatesInput[];
    OR?: Prisma.AutoroleRuleScalarWhereWithAggregatesInput[];
    NOT?: Prisma.AutoroleRuleScalarWhereWithAggregatesInput | Prisma.AutoroleRuleScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"AutoroleRule"> | string;
    guildId?: Prisma.UuidWithAggregatesFilter<"AutoroleRule"> | string;
    roleId?: Prisma.StringWithAggregatesFilter<"AutoroleRule"> | string;
    position?: Prisma.IntWithAggregatesFilter<"AutoroleRule"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"AutoroleRule"> | Date | string;
};
export type AutoroleRuleCreateInput = {
    id?: string;
    roleId: string;
    position: number;
    createdAt?: Date | string;
    guild: Prisma.GuildCreateNestedOneWithoutAutoroleRulesInput;
};
export type AutoroleRuleUncheckedCreateInput = {
    id?: string;
    guildId: string;
    roleId: string;
    position: number;
    createdAt?: Date | string;
};
export type AutoroleRuleUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    guild?: Prisma.GuildUpdateOneRequiredWithoutAutoroleRulesNestedInput;
};
export type AutoroleRuleUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AutoroleRuleCreateManyInput = {
    id?: string;
    guildId: string;
    roleId: string;
    position: number;
    createdAt?: Date | string;
};
export type AutoroleRuleUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AutoroleRuleUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AutoroleRuleListRelationFilter = {
    every?: Prisma.AutoroleRuleWhereInput;
    some?: Prisma.AutoroleRuleWhereInput;
    none?: Prisma.AutoroleRuleWhereInput;
};
export type AutoroleRuleOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type AutoroleRuleGuildIdRoleIdCompoundUniqueInput = {
    guildId: string;
    roleId: string;
};
export type AutoroleRuleGuildIdPositionCompoundUniqueInput = {
    guildId: string;
    position: number;
};
export type AutoroleRuleCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AutoroleRuleAvgOrderByAggregateInput = {
    position?: Prisma.SortOrder;
};
export type AutoroleRuleMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AutoroleRuleMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type AutoroleRuleSumOrderByAggregateInput = {
    position?: Prisma.SortOrder;
};
export type AutoroleRuleCreateNestedManyWithoutGuildInput = {
    create?: Prisma.XOR<Prisma.AutoroleRuleCreateWithoutGuildInput, Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput> | Prisma.AutoroleRuleCreateWithoutGuildInput[] | Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.AutoroleRuleCreateOrConnectWithoutGuildInput | Prisma.AutoroleRuleCreateOrConnectWithoutGuildInput[];
    createMany?: Prisma.AutoroleRuleCreateManyGuildInputEnvelope;
    connect?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
};
export type AutoroleRuleUncheckedCreateNestedManyWithoutGuildInput = {
    create?: Prisma.XOR<Prisma.AutoroleRuleCreateWithoutGuildInput, Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput> | Prisma.AutoroleRuleCreateWithoutGuildInput[] | Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.AutoroleRuleCreateOrConnectWithoutGuildInput | Prisma.AutoroleRuleCreateOrConnectWithoutGuildInput[];
    createMany?: Prisma.AutoroleRuleCreateManyGuildInputEnvelope;
    connect?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
};
export type AutoroleRuleUpdateManyWithoutGuildNestedInput = {
    create?: Prisma.XOR<Prisma.AutoroleRuleCreateWithoutGuildInput, Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput> | Prisma.AutoroleRuleCreateWithoutGuildInput[] | Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.AutoroleRuleCreateOrConnectWithoutGuildInput | Prisma.AutoroleRuleCreateOrConnectWithoutGuildInput[];
    upsert?: Prisma.AutoroleRuleUpsertWithWhereUniqueWithoutGuildInput | Prisma.AutoroleRuleUpsertWithWhereUniqueWithoutGuildInput[];
    createMany?: Prisma.AutoroleRuleCreateManyGuildInputEnvelope;
    set?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
    disconnect?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
    delete?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
    connect?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
    update?: Prisma.AutoroleRuleUpdateWithWhereUniqueWithoutGuildInput | Prisma.AutoroleRuleUpdateWithWhereUniqueWithoutGuildInput[];
    updateMany?: Prisma.AutoroleRuleUpdateManyWithWhereWithoutGuildInput | Prisma.AutoroleRuleUpdateManyWithWhereWithoutGuildInput[];
    deleteMany?: Prisma.AutoroleRuleScalarWhereInput | Prisma.AutoroleRuleScalarWhereInput[];
};
export type AutoroleRuleUncheckedUpdateManyWithoutGuildNestedInput = {
    create?: Prisma.XOR<Prisma.AutoroleRuleCreateWithoutGuildInput, Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput> | Prisma.AutoroleRuleCreateWithoutGuildInput[] | Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput[];
    connectOrCreate?: Prisma.AutoroleRuleCreateOrConnectWithoutGuildInput | Prisma.AutoroleRuleCreateOrConnectWithoutGuildInput[];
    upsert?: Prisma.AutoroleRuleUpsertWithWhereUniqueWithoutGuildInput | Prisma.AutoroleRuleUpsertWithWhereUniqueWithoutGuildInput[];
    createMany?: Prisma.AutoroleRuleCreateManyGuildInputEnvelope;
    set?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
    disconnect?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
    delete?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
    connect?: Prisma.AutoroleRuleWhereUniqueInput | Prisma.AutoroleRuleWhereUniqueInput[];
    update?: Prisma.AutoroleRuleUpdateWithWhereUniqueWithoutGuildInput | Prisma.AutoroleRuleUpdateWithWhereUniqueWithoutGuildInput[];
    updateMany?: Prisma.AutoroleRuleUpdateManyWithWhereWithoutGuildInput | Prisma.AutoroleRuleUpdateManyWithWhereWithoutGuildInput[];
    deleteMany?: Prisma.AutoroleRuleScalarWhereInput | Prisma.AutoroleRuleScalarWhereInput[];
};
export type AutoroleRuleCreateWithoutGuildInput = {
    id?: string;
    roleId: string;
    position: number;
    createdAt?: Date | string;
};
export type AutoroleRuleUncheckedCreateWithoutGuildInput = {
    id?: string;
    roleId: string;
    position: number;
    createdAt?: Date | string;
};
export type AutoroleRuleCreateOrConnectWithoutGuildInput = {
    where: Prisma.AutoroleRuleWhereUniqueInput;
    create: Prisma.XOR<Prisma.AutoroleRuleCreateWithoutGuildInput, Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput>;
};
export type AutoroleRuleCreateManyGuildInputEnvelope = {
    data: Prisma.AutoroleRuleCreateManyGuildInput | Prisma.AutoroleRuleCreateManyGuildInput[];
    skipDuplicates?: boolean;
};
export type AutoroleRuleUpsertWithWhereUniqueWithoutGuildInput = {
    where: Prisma.AutoroleRuleWhereUniqueInput;
    update: Prisma.XOR<Prisma.AutoroleRuleUpdateWithoutGuildInput, Prisma.AutoroleRuleUncheckedUpdateWithoutGuildInput>;
    create: Prisma.XOR<Prisma.AutoroleRuleCreateWithoutGuildInput, Prisma.AutoroleRuleUncheckedCreateWithoutGuildInput>;
};
export type AutoroleRuleUpdateWithWhereUniqueWithoutGuildInput = {
    where: Prisma.AutoroleRuleWhereUniqueInput;
    data: Prisma.XOR<Prisma.AutoroleRuleUpdateWithoutGuildInput, Prisma.AutoroleRuleUncheckedUpdateWithoutGuildInput>;
};
export type AutoroleRuleUpdateManyWithWhereWithoutGuildInput = {
    where: Prisma.AutoroleRuleScalarWhereInput;
    data: Prisma.XOR<Prisma.AutoroleRuleUpdateManyMutationInput, Prisma.AutoroleRuleUncheckedUpdateManyWithoutGuildInput>;
};
export type AutoroleRuleScalarWhereInput = {
    AND?: Prisma.AutoroleRuleScalarWhereInput | Prisma.AutoroleRuleScalarWhereInput[];
    OR?: Prisma.AutoroleRuleScalarWhereInput[];
    NOT?: Prisma.AutoroleRuleScalarWhereInput | Prisma.AutoroleRuleScalarWhereInput[];
    id?: Prisma.UuidFilter<"AutoroleRule"> | string;
    guildId?: Prisma.UuidFilter<"AutoroleRule"> | string;
    roleId?: Prisma.StringFilter<"AutoroleRule"> | string;
    position?: Prisma.IntFilter<"AutoroleRule"> | number;
    createdAt?: Prisma.DateTimeFilter<"AutoroleRule"> | Date | string;
};
export type AutoroleRuleCreateManyGuildInput = {
    id?: string;
    roleId: string;
    position: number;
    createdAt?: Date | string;
};
export type AutoroleRuleUpdateWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AutoroleRuleUncheckedUpdateWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AutoroleRuleUncheckedUpdateManyWithoutGuildInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type AutoroleRuleSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    roleId?: boolean;
    position?: boolean;
    createdAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["autoroleRule"]>;
export type AutoroleRuleSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    roleId?: boolean;
    position?: boolean;
    createdAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["autoroleRule"]>;
export type AutoroleRuleSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    roleId?: boolean;
    position?: boolean;
    createdAt?: boolean;
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["autoroleRule"]>;
export type AutoroleRuleSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    roleId?: boolean;
    position?: boolean;
    createdAt?: boolean;
};
export type AutoroleRuleOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "roleId" | "position" | "createdAt", ExtArgs["result"]["autoroleRule"]>;
export type AutoroleRuleInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type AutoroleRuleIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type AutoroleRuleIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    guild?: boolean | Prisma.GuildDefaultArgs<ExtArgs>;
};
export type $AutoroleRulePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "AutoroleRule";
    objects: {
        guild: Prisma.$GuildPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        roleId: string;
        position: number;
        createdAt: Date;
    }, ExtArgs["result"]["autoroleRule"]>;
    composites: {};
};
export type AutoroleRuleGetPayload<S extends boolean | null | undefined | AutoroleRuleDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload, S>;
export type AutoroleRuleCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<AutoroleRuleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AutoroleRuleCountAggregateInputType | true;
};
export interface AutoroleRuleDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['AutoroleRule'];
        meta: {
            name: 'AutoroleRule';
        };
    };
    /**
     * Find zero or one AutoroleRule that matches the filter.
     * @param {AutoroleRuleFindUniqueArgs} args - Arguments to find a AutoroleRule
     * @example
     * // Get one AutoroleRule
     * const autoroleRule = await prisma.autoroleRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AutoroleRuleFindUniqueArgs>(args: Prisma.SelectSubset<T, AutoroleRuleFindUniqueArgs<ExtArgs>>): Prisma.Prisma__AutoroleRuleClient<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one AutoroleRule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AutoroleRuleFindUniqueOrThrowArgs} args - Arguments to find a AutoroleRule
     * @example
     * // Get one AutoroleRule
     * const autoroleRule = await prisma.autoroleRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AutoroleRuleFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, AutoroleRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__AutoroleRuleClient<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AutoroleRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AutoroleRuleFindFirstArgs} args - Arguments to find a AutoroleRule
     * @example
     * // Get one AutoroleRule
     * const autoroleRule = await prisma.autoroleRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AutoroleRuleFindFirstArgs>(args?: Prisma.SelectSubset<T, AutoroleRuleFindFirstArgs<ExtArgs>>): Prisma.Prisma__AutoroleRuleClient<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first AutoroleRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AutoroleRuleFindFirstOrThrowArgs} args - Arguments to find a AutoroleRule
     * @example
     * // Get one AutoroleRule
     * const autoroleRule = await prisma.autoroleRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AutoroleRuleFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, AutoroleRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__AutoroleRuleClient<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more AutoroleRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AutoroleRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AutoroleRules
     * const autoroleRules = await prisma.autoroleRule.findMany()
     *
     * // Get first 10 AutoroleRules
     * const autoroleRules = await prisma.autoroleRule.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const autoroleRuleWithIdOnly = await prisma.autoroleRule.findMany({ select: { id: true } })
     *
     */
    findMany<T extends AutoroleRuleFindManyArgs>(args?: Prisma.SelectSubset<T, AutoroleRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a AutoroleRule.
     * @param {AutoroleRuleCreateArgs} args - Arguments to create a AutoroleRule.
     * @example
     * // Create one AutoroleRule
     * const AutoroleRule = await prisma.autoroleRule.create({
     *   data: {
     *     // ... data to create a AutoroleRule
     *   }
     * })
     *
     */
    create<T extends AutoroleRuleCreateArgs>(args: Prisma.SelectSubset<T, AutoroleRuleCreateArgs<ExtArgs>>): Prisma.Prisma__AutoroleRuleClient<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many AutoroleRules.
     * @param {AutoroleRuleCreateManyArgs} args - Arguments to create many AutoroleRules.
     * @example
     * // Create many AutoroleRules
     * const autoroleRule = await prisma.autoroleRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends AutoroleRuleCreateManyArgs>(args?: Prisma.SelectSubset<T, AutoroleRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many AutoroleRules and returns the data saved in the database.
     * @param {AutoroleRuleCreateManyAndReturnArgs} args - Arguments to create many AutoroleRules.
     * @example
     * // Create many AutoroleRules
     * const autoroleRule = await prisma.autoroleRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many AutoroleRules and only return the `id`
     * const autoroleRuleWithIdOnly = await prisma.autoroleRule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends AutoroleRuleCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, AutoroleRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a AutoroleRule.
     * @param {AutoroleRuleDeleteArgs} args - Arguments to delete one AutoroleRule.
     * @example
     * // Delete one AutoroleRule
     * const AutoroleRule = await prisma.autoroleRule.delete({
     *   where: {
     *     // ... filter to delete one AutoroleRule
     *   }
     * })
     *
     */
    delete<T extends AutoroleRuleDeleteArgs>(args: Prisma.SelectSubset<T, AutoroleRuleDeleteArgs<ExtArgs>>): Prisma.Prisma__AutoroleRuleClient<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one AutoroleRule.
     * @param {AutoroleRuleUpdateArgs} args - Arguments to update one AutoroleRule.
     * @example
     * // Update one AutoroleRule
     * const autoroleRule = await prisma.autoroleRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends AutoroleRuleUpdateArgs>(args: Prisma.SelectSubset<T, AutoroleRuleUpdateArgs<ExtArgs>>): Prisma.Prisma__AutoroleRuleClient<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more AutoroleRules.
     * @param {AutoroleRuleDeleteManyArgs} args - Arguments to filter AutoroleRules to delete.
     * @example
     * // Delete a few AutoroleRules
     * const { count } = await prisma.autoroleRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends AutoroleRuleDeleteManyArgs>(args?: Prisma.SelectSubset<T, AutoroleRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more AutoroleRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AutoroleRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AutoroleRules
     * const autoroleRule = await prisma.autoroleRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends AutoroleRuleUpdateManyArgs>(args: Prisma.SelectSubset<T, AutoroleRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more AutoroleRules and returns the data updated in the database.
     * @param {AutoroleRuleUpdateManyAndReturnArgs} args - Arguments to update many AutoroleRules.
     * @example
     * // Update many AutoroleRules
     * const autoroleRule = await prisma.autoroleRule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more AutoroleRules and only return the `id`
     * const autoroleRuleWithIdOnly = await prisma.autoroleRule.updateManyAndReturn({
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
    updateManyAndReturn<T extends AutoroleRuleUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, AutoroleRuleUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one AutoroleRule.
     * @param {AutoroleRuleUpsertArgs} args - Arguments to update or create a AutoroleRule.
     * @example
     * // Update or create a AutoroleRule
     * const autoroleRule = await prisma.autoroleRule.upsert({
     *   create: {
     *     // ... data to create a AutoroleRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AutoroleRule we want to update
     *   }
     * })
     */
    upsert<T extends AutoroleRuleUpsertArgs>(args: Prisma.SelectSubset<T, AutoroleRuleUpsertArgs<ExtArgs>>): Prisma.Prisma__AutoroleRuleClient<runtime.Types.Result.GetResult<Prisma.$AutoroleRulePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of AutoroleRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AutoroleRuleCountArgs} args - Arguments to filter AutoroleRules to count.
     * @example
     * // Count the number of AutoroleRules
     * const count = await prisma.autoroleRule.count({
     *   where: {
     *     // ... the filter for the AutoroleRules we want to count
     *   }
     * })
    **/
    count<T extends AutoroleRuleCountArgs>(args?: Prisma.Subset<T, AutoroleRuleCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], AutoroleRuleCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a AutoroleRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AutoroleRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AutoroleRuleAggregateArgs>(args: Prisma.Subset<T, AutoroleRuleAggregateArgs>): Prisma.PrismaPromise<GetAutoroleRuleAggregateType<T>>;
    /**
     * Group by AutoroleRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AutoroleRuleGroupByArgs} args - Group by arguments.
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
    groupBy<T extends AutoroleRuleGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: AutoroleRuleGroupByArgs['orderBy'];
    } : {
        orderBy?: AutoroleRuleGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, AutoroleRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAutoroleRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the AutoroleRule model
     */
    readonly fields: AutoroleRuleFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for AutoroleRule.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__AutoroleRuleClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    guild<T extends Prisma.GuildDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.GuildDefaultArgs<ExtArgs>>): Prisma.Prisma__GuildClient<runtime.Types.Result.GetResult<Prisma.$GuildPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the AutoroleRule model
 */
export interface AutoroleRuleFieldRefs {
    readonly id: Prisma.FieldRef<"AutoroleRule", 'String'>;
    readonly guildId: Prisma.FieldRef<"AutoroleRule", 'String'>;
    readonly roleId: Prisma.FieldRef<"AutoroleRule", 'String'>;
    readonly position: Prisma.FieldRef<"AutoroleRule", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"AutoroleRule", 'DateTime'>;
}
/**
 * AutoroleRule findUnique
 */
export type AutoroleRuleFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * Filter, which AutoroleRule to fetch.
     */
    where: Prisma.AutoroleRuleWhereUniqueInput;
};
/**
 * AutoroleRule findUniqueOrThrow
 */
export type AutoroleRuleFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * Filter, which AutoroleRule to fetch.
     */
    where: Prisma.AutoroleRuleWhereUniqueInput;
};
/**
 * AutoroleRule findFirst
 */
export type AutoroleRuleFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * Filter, which AutoroleRule to fetch.
     */
    where?: Prisma.AutoroleRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AutoroleRules to fetch.
     */
    orderBy?: Prisma.AutoroleRuleOrderByWithRelationInput | Prisma.AutoroleRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AutoroleRules.
     */
    cursor?: Prisma.AutoroleRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AutoroleRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AutoroleRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AutoroleRules.
     */
    distinct?: Prisma.AutoroleRuleScalarFieldEnum | Prisma.AutoroleRuleScalarFieldEnum[];
};
/**
 * AutoroleRule findFirstOrThrow
 */
export type AutoroleRuleFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * Filter, which AutoroleRule to fetch.
     */
    where?: Prisma.AutoroleRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AutoroleRules to fetch.
     */
    orderBy?: Prisma.AutoroleRuleOrderByWithRelationInput | Prisma.AutoroleRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for AutoroleRules.
     */
    cursor?: Prisma.AutoroleRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AutoroleRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AutoroleRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AutoroleRules.
     */
    distinct?: Prisma.AutoroleRuleScalarFieldEnum | Prisma.AutoroleRuleScalarFieldEnum[];
};
/**
 * AutoroleRule findMany
 */
export type AutoroleRuleFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * Filter, which AutoroleRules to fetch.
     */
    where?: Prisma.AutoroleRuleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of AutoroleRules to fetch.
     */
    orderBy?: Prisma.AutoroleRuleOrderByWithRelationInput | Prisma.AutoroleRuleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing AutoroleRules.
     */
    cursor?: Prisma.AutoroleRuleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` AutoroleRules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` AutoroleRules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of AutoroleRules.
     */
    distinct?: Prisma.AutoroleRuleScalarFieldEnum | Prisma.AutoroleRuleScalarFieldEnum[];
};
/**
 * AutoroleRule create
 */
export type AutoroleRuleCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * The data needed to create a AutoroleRule.
     */
    data: Prisma.XOR<Prisma.AutoroleRuleCreateInput, Prisma.AutoroleRuleUncheckedCreateInput>;
};
/**
 * AutoroleRule createMany
 */
export type AutoroleRuleCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many AutoroleRules.
     */
    data: Prisma.AutoroleRuleCreateManyInput | Prisma.AutoroleRuleCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * AutoroleRule createManyAndReturn
 */
export type AutoroleRuleCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * The data used to create many AutoroleRules.
     */
    data: Prisma.AutoroleRuleCreateManyInput | Prisma.AutoroleRuleCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * AutoroleRule update
 */
export type AutoroleRuleUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * The data needed to update a AutoroleRule.
     */
    data: Prisma.XOR<Prisma.AutoroleRuleUpdateInput, Prisma.AutoroleRuleUncheckedUpdateInput>;
    /**
     * Choose, which AutoroleRule to update.
     */
    where: Prisma.AutoroleRuleWhereUniqueInput;
};
/**
 * AutoroleRule updateMany
 */
export type AutoroleRuleUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update AutoroleRules.
     */
    data: Prisma.XOR<Prisma.AutoroleRuleUpdateManyMutationInput, Prisma.AutoroleRuleUncheckedUpdateManyInput>;
    /**
     * Filter which AutoroleRules to update
     */
    where?: Prisma.AutoroleRuleWhereInput;
    /**
     * Limit how many AutoroleRules to update.
     */
    limit?: number;
};
/**
 * AutoroleRule updateManyAndReturn
 */
export type AutoroleRuleUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * The data used to update AutoroleRules.
     */
    data: Prisma.XOR<Prisma.AutoroleRuleUpdateManyMutationInput, Prisma.AutoroleRuleUncheckedUpdateManyInput>;
    /**
     * Filter which AutoroleRules to update
     */
    where?: Prisma.AutoroleRuleWhereInput;
    /**
     * Limit how many AutoroleRules to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * AutoroleRule upsert
 */
export type AutoroleRuleUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * The filter to search for the AutoroleRule to update in case it exists.
     */
    where: Prisma.AutoroleRuleWhereUniqueInput;
    /**
     * In case the AutoroleRule found by the `where` argument doesn't exist, create a new AutoroleRule with this data.
     */
    create: Prisma.XOR<Prisma.AutoroleRuleCreateInput, Prisma.AutoroleRuleUncheckedCreateInput>;
    /**
     * In case the AutoroleRule was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.AutoroleRuleUpdateInput, Prisma.AutoroleRuleUncheckedUpdateInput>;
};
/**
 * AutoroleRule delete
 */
export type AutoroleRuleDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
    /**
     * Filter which AutoroleRule to delete.
     */
    where: Prisma.AutoroleRuleWhereUniqueInput;
};
/**
 * AutoroleRule deleteMany
 */
export type AutoroleRuleDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which AutoroleRules to delete
     */
    where?: Prisma.AutoroleRuleWhereInput;
    /**
     * Limit how many AutoroleRules to delete.
     */
    limit?: number;
};
/**
 * AutoroleRule without action
 */
export type AutoroleRuleDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AutoroleRule
     */
    select?: Prisma.AutoroleRuleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the AutoroleRule
     */
    omit?: Prisma.AutoroleRuleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.AutoroleRuleInclude<ExtArgs> | null;
};
//# sourceMappingURL=AutoroleRule.d.ts.map
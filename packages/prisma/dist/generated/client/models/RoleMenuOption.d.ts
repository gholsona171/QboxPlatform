import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model RoleMenuOption
 *
 */
export type RoleMenuOptionModel = runtime.Types.Result.DefaultSelection<Prisma.$RoleMenuOptionPayload>;
export type AggregateRoleMenuOption = {
    _count: RoleMenuOptionCountAggregateOutputType | null;
    _avg: RoleMenuOptionAvgAggregateOutputType | null;
    _sum: RoleMenuOptionSumAggregateOutputType | null;
    _min: RoleMenuOptionMinAggregateOutputType | null;
    _max: RoleMenuOptionMaxAggregateOutputType | null;
};
export type RoleMenuOptionAvgAggregateOutputType = {
    position: number | null;
    revision: number | null;
};
export type RoleMenuOptionSumAggregateOutputType = {
    position: number | null;
    revision: number | null;
};
export type RoleMenuOptionMinAggregateOutputType = {
    id: string | null;
    roleMenuId: string | null;
    roleId: string | null;
    label: string | null;
    description: string | null;
    emoji: string | null;
    position: number | null;
    revision: number | null;
    lastOperationSource: string | null;
    createdAt: Date | null;
};
export type RoleMenuOptionMaxAggregateOutputType = {
    id: string | null;
    roleMenuId: string | null;
    roleId: string | null;
    label: string | null;
    description: string | null;
    emoji: string | null;
    position: number | null;
    revision: number | null;
    lastOperationSource: string | null;
    createdAt: Date | null;
};
export type RoleMenuOptionCountAggregateOutputType = {
    id: number;
    roleMenuId: number;
    roleId: number;
    label: number;
    description: number;
    emoji: number;
    position: number;
    revision: number;
    lastOperationSource: number;
    createdAt: number;
    _all: number;
};
export type RoleMenuOptionAvgAggregateInputType = {
    position?: true;
    revision?: true;
};
export type RoleMenuOptionSumAggregateInputType = {
    position?: true;
    revision?: true;
};
export type RoleMenuOptionMinAggregateInputType = {
    id?: true;
    roleMenuId?: true;
    roleId?: true;
    label?: true;
    description?: true;
    emoji?: true;
    position?: true;
    revision?: true;
    lastOperationSource?: true;
    createdAt?: true;
};
export type RoleMenuOptionMaxAggregateInputType = {
    id?: true;
    roleMenuId?: true;
    roleId?: true;
    label?: true;
    description?: true;
    emoji?: true;
    position?: true;
    revision?: true;
    lastOperationSource?: true;
    createdAt?: true;
};
export type RoleMenuOptionCountAggregateInputType = {
    id?: true;
    roleMenuId?: true;
    roleId?: true;
    label?: true;
    description?: true;
    emoji?: true;
    position?: true;
    revision?: true;
    lastOperationSource?: true;
    createdAt?: true;
    _all?: true;
};
export type RoleMenuOptionAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which RoleMenuOption to aggregate.
     */
    where?: Prisma.RoleMenuOptionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RoleMenuOptions to fetch.
     */
    orderBy?: Prisma.RoleMenuOptionOrderByWithRelationInput | Prisma.RoleMenuOptionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.RoleMenuOptionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RoleMenuOptions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RoleMenuOptions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned RoleMenuOptions
    **/
    _count?: true | RoleMenuOptionCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: RoleMenuOptionAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: RoleMenuOptionSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: RoleMenuOptionMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: RoleMenuOptionMaxAggregateInputType;
};
export type GetRoleMenuOptionAggregateType<T extends RoleMenuOptionAggregateArgs> = {
    [P in keyof T & keyof AggregateRoleMenuOption]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRoleMenuOption[P]> : Prisma.GetScalarType<T[P], AggregateRoleMenuOption[P]>;
};
export type RoleMenuOptionGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RoleMenuOptionWhereInput;
    orderBy?: Prisma.RoleMenuOptionOrderByWithAggregationInput | Prisma.RoleMenuOptionOrderByWithAggregationInput[];
    by: Prisma.RoleMenuOptionScalarFieldEnum[] | Prisma.RoleMenuOptionScalarFieldEnum;
    having?: Prisma.RoleMenuOptionScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RoleMenuOptionCountAggregateInputType | true;
    _avg?: RoleMenuOptionAvgAggregateInputType;
    _sum?: RoleMenuOptionSumAggregateInputType;
    _min?: RoleMenuOptionMinAggregateInputType;
    _max?: RoleMenuOptionMaxAggregateInputType;
};
export type RoleMenuOptionGroupByOutputType = {
    id: string;
    roleMenuId: string;
    roleId: string;
    label: string;
    description: string | null;
    emoji: string | null;
    position: number;
    revision: number;
    lastOperationSource: string;
    createdAt: Date;
    _count: RoleMenuOptionCountAggregateOutputType | null;
    _avg: RoleMenuOptionAvgAggregateOutputType | null;
    _sum: RoleMenuOptionSumAggregateOutputType | null;
    _min: RoleMenuOptionMinAggregateOutputType | null;
    _max: RoleMenuOptionMaxAggregateOutputType | null;
};
export type GetRoleMenuOptionGroupByPayload<T extends RoleMenuOptionGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RoleMenuOptionGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RoleMenuOptionGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RoleMenuOptionGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RoleMenuOptionGroupByOutputType[P]>;
}>>;
export type RoleMenuOptionWhereInput = {
    AND?: Prisma.RoleMenuOptionWhereInput | Prisma.RoleMenuOptionWhereInput[];
    OR?: Prisma.RoleMenuOptionWhereInput[];
    NOT?: Prisma.RoleMenuOptionWhereInput | Prisma.RoleMenuOptionWhereInput[];
    id?: Prisma.UuidFilter<"RoleMenuOption"> | string;
    roleMenuId?: Prisma.UuidFilter<"RoleMenuOption"> | string;
    roleId?: Prisma.StringFilter<"RoleMenuOption"> | string;
    label?: Prisma.StringFilter<"RoleMenuOption"> | string;
    description?: Prisma.StringNullableFilter<"RoleMenuOption"> | string | null;
    emoji?: Prisma.StringNullableFilter<"RoleMenuOption"> | string | null;
    position?: Prisma.IntFilter<"RoleMenuOption"> | number;
    revision?: Prisma.IntFilter<"RoleMenuOption"> | number;
    lastOperationSource?: Prisma.StringFilter<"RoleMenuOption"> | string;
    createdAt?: Prisma.DateTimeFilter<"RoleMenuOption"> | Date | string;
    roleMenu?: Prisma.XOR<Prisma.RoleMenuScalarRelationFilter, Prisma.RoleMenuWhereInput>;
};
export type RoleMenuOptionOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    roleMenuId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    label?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    emoji?: Prisma.SortOrderInput | Prisma.SortOrder;
    position?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    lastOperationSource?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    roleMenu?: Prisma.RoleMenuOrderByWithRelationInput;
};
export type RoleMenuOptionWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    roleMenuId_position?: Prisma.RoleMenuOptionRoleMenuIdPositionCompoundUniqueInput;
    roleMenuId_roleId?: Prisma.RoleMenuOptionRoleMenuIdRoleIdCompoundUniqueInput;
    AND?: Prisma.RoleMenuOptionWhereInput | Prisma.RoleMenuOptionWhereInput[];
    OR?: Prisma.RoleMenuOptionWhereInput[];
    NOT?: Prisma.RoleMenuOptionWhereInput | Prisma.RoleMenuOptionWhereInput[];
    roleMenuId?: Prisma.UuidFilter<"RoleMenuOption"> | string;
    roleId?: Prisma.StringFilter<"RoleMenuOption"> | string;
    label?: Prisma.StringFilter<"RoleMenuOption"> | string;
    description?: Prisma.StringNullableFilter<"RoleMenuOption"> | string | null;
    emoji?: Prisma.StringNullableFilter<"RoleMenuOption"> | string | null;
    position?: Prisma.IntFilter<"RoleMenuOption"> | number;
    revision?: Prisma.IntFilter<"RoleMenuOption"> | number;
    lastOperationSource?: Prisma.StringFilter<"RoleMenuOption"> | string;
    createdAt?: Prisma.DateTimeFilter<"RoleMenuOption"> | Date | string;
    roleMenu?: Prisma.XOR<Prisma.RoleMenuScalarRelationFilter, Prisma.RoleMenuWhereInput>;
}, "id" | "roleMenuId_position" | "roleMenuId_roleId">;
export type RoleMenuOptionOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    roleMenuId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    label?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    emoji?: Prisma.SortOrderInput | Prisma.SortOrder;
    position?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    lastOperationSource?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.RoleMenuOptionCountOrderByAggregateInput;
    _avg?: Prisma.RoleMenuOptionAvgOrderByAggregateInput;
    _max?: Prisma.RoleMenuOptionMaxOrderByAggregateInput;
    _min?: Prisma.RoleMenuOptionMinOrderByAggregateInput;
    _sum?: Prisma.RoleMenuOptionSumOrderByAggregateInput;
};
export type RoleMenuOptionScalarWhereWithAggregatesInput = {
    AND?: Prisma.RoleMenuOptionScalarWhereWithAggregatesInput | Prisma.RoleMenuOptionScalarWhereWithAggregatesInput[];
    OR?: Prisma.RoleMenuOptionScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RoleMenuOptionScalarWhereWithAggregatesInput | Prisma.RoleMenuOptionScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"RoleMenuOption"> | string;
    roleMenuId?: Prisma.UuidWithAggregatesFilter<"RoleMenuOption"> | string;
    roleId?: Prisma.StringWithAggregatesFilter<"RoleMenuOption"> | string;
    label?: Prisma.StringWithAggregatesFilter<"RoleMenuOption"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"RoleMenuOption"> | string | null;
    emoji?: Prisma.StringNullableWithAggregatesFilter<"RoleMenuOption"> | string | null;
    position?: Prisma.IntWithAggregatesFilter<"RoleMenuOption"> | number;
    revision?: Prisma.IntWithAggregatesFilter<"RoleMenuOption"> | number;
    lastOperationSource?: Prisma.StringWithAggregatesFilter<"RoleMenuOption"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"RoleMenuOption"> | Date | string;
};
export type RoleMenuOptionCreateInput = {
    id?: string;
    roleId: string;
    label: string;
    description?: string | null;
    emoji?: string | null;
    position: number;
    revision?: number;
    lastOperationSource?: string;
    createdAt?: Date | string;
    roleMenu: Prisma.RoleMenuCreateNestedOneWithoutOptionsInput;
};
export type RoleMenuOptionUncheckedCreateInput = {
    id?: string;
    roleMenuId: string;
    roleId: string;
    label: string;
    description?: string | null;
    emoji?: string | null;
    position: number;
    revision?: number;
    lastOperationSource?: string;
    createdAt?: Date | string;
};
export type RoleMenuOptionUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    label?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    emoji?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    lastOperationSource?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    roleMenu?: Prisma.RoleMenuUpdateOneRequiredWithoutOptionsNestedInput;
};
export type RoleMenuOptionUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleMenuId?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    label?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    emoji?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    lastOperationSource?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoleMenuOptionCreateManyInput = {
    id?: string;
    roleMenuId: string;
    roleId: string;
    label: string;
    description?: string | null;
    emoji?: string | null;
    position: number;
    revision?: number;
    lastOperationSource?: string;
    createdAt?: Date | string;
};
export type RoleMenuOptionUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    label?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    emoji?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    lastOperationSource?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoleMenuOptionUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleMenuId?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    label?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    emoji?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    lastOperationSource?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoleMenuOptionListRelationFilter = {
    every?: Prisma.RoleMenuOptionWhereInput;
    some?: Prisma.RoleMenuOptionWhereInput;
    none?: Prisma.RoleMenuOptionWhereInput;
};
export type RoleMenuOptionOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RoleMenuOptionRoleMenuIdPositionCompoundUniqueInput = {
    roleMenuId: string;
    position: number;
};
export type RoleMenuOptionRoleMenuIdRoleIdCompoundUniqueInput = {
    roleMenuId: string;
    roleId: string;
};
export type RoleMenuOptionCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    roleMenuId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    label?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    emoji?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    lastOperationSource?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RoleMenuOptionAvgOrderByAggregateInput = {
    position?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
};
export type RoleMenuOptionMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    roleMenuId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    label?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    emoji?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    lastOperationSource?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RoleMenuOptionMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    roleMenuId?: Prisma.SortOrder;
    roleId?: Prisma.SortOrder;
    label?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    emoji?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
    lastOperationSource?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RoleMenuOptionSumOrderByAggregateInput = {
    position?: Prisma.SortOrder;
    revision?: Prisma.SortOrder;
};
export type RoleMenuOptionCreateNestedManyWithoutRoleMenuInput = {
    create?: Prisma.XOR<Prisma.RoleMenuOptionCreateWithoutRoleMenuInput, Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput> | Prisma.RoleMenuOptionCreateWithoutRoleMenuInput[] | Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput[];
    connectOrCreate?: Prisma.RoleMenuOptionCreateOrConnectWithoutRoleMenuInput | Prisma.RoleMenuOptionCreateOrConnectWithoutRoleMenuInput[];
    createMany?: Prisma.RoleMenuOptionCreateManyRoleMenuInputEnvelope;
    connect?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
};
export type RoleMenuOptionUncheckedCreateNestedManyWithoutRoleMenuInput = {
    create?: Prisma.XOR<Prisma.RoleMenuOptionCreateWithoutRoleMenuInput, Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput> | Prisma.RoleMenuOptionCreateWithoutRoleMenuInput[] | Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput[];
    connectOrCreate?: Prisma.RoleMenuOptionCreateOrConnectWithoutRoleMenuInput | Prisma.RoleMenuOptionCreateOrConnectWithoutRoleMenuInput[];
    createMany?: Prisma.RoleMenuOptionCreateManyRoleMenuInputEnvelope;
    connect?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
};
export type RoleMenuOptionUpdateManyWithoutRoleMenuNestedInput = {
    create?: Prisma.XOR<Prisma.RoleMenuOptionCreateWithoutRoleMenuInput, Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput> | Prisma.RoleMenuOptionCreateWithoutRoleMenuInput[] | Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput[];
    connectOrCreate?: Prisma.RoleMenuOptionCreateOrConnectWithoutRoleMenuInput | Prisma.RoleMenuOptionCreateOrConnectWithoutRoleMenuInput[];
    upsert?: Prisma.RoleMenuOptionUpsertWithWhereUniqueWithoutRoleMenuInput | Prisma.RoleMenuOptionUpsertWithWhereUniqueWithoutRoleMenuInput[];
    createMany?: Prisma.RoleMenuOptionCreateManyRoleMenuInputEnvelope;
    set?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
    disconnect?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
    delete?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
    connect?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
    update?: Prisma.RoleMenuOptionUpdateWithWhereUniqueWithoutRoleMenuInput | Prisma.RoleMenuOptionUpdateWithWhereUniqueWithoutRoleMenuInput[];
    updateMany?: Prisma.RoleMenuOptionUpdateManyWithWhereWithoutRoleMenuInput | Prisma.RoleMenuOptionUpdateManyWithWhereWithoutRoleMenuInput[];
    deleteMany?: Prisma.RoleMenuOptionScalarWhereInput | Prisma.RoleMenuOptionScalarWhereInput[];
};
export type RoleMenuOptionUncheckedUpdateManyWithoutRoleMenuNestedInput = {
    create?: Prisma.XOR<Prisma.RoleMenuOptionCreateWithoutRoleMenuInput, Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput> | Prisma.RoleMenuOptionCreateWithoutRoleMenuInput[] | Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput[];
    connectOrCreate?: Prisma.RoleMenuOptionCreateOrConnectWithoutRoleMenuInput | Prisma.RoleMenuOptionCreateOrConnectWithoutRoleMenuInput[];
    upsert?: Prisma.RoleMenuOptionUpsertWithWhereUniqueWithoutRoleMenuInput | Prisma.RoleMenuOptionUpsertWithWhereUniqueWithoutRoleMenuInput[];
    createMany?: Prisma.RoleMenuOptionCreateManyRoleMenuInputEnvelope;
    set?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
    disconnect?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
    delete?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
    connect?: Prisma.RoleMenuOptionWhereUniqueInput | Prisma.RoleMenuOptionWhereUniqueInput[];
    update?: Prisma.RoleMenuOptionUpdateWithWhereUniqueWithoutRoleMenuInput | Prisma.RoleMenuOptionUpdateWithWhereUniqueWithoutRoleMenuInput[];
    updateMany?: Prisma.RoleMenuOptionUpdateManyWithWhereWithoutRoleMenuInput | Prisma.RoleMenuOptionUpdateManyWithWhereWithoutRoleMenuInput[];
    deleteMany?: Prisma.RoleMenuOptionScalarWhereInput | Prisma.RoleMenuOptionScalarWhereInput[];
};
export type RoleMenuOptionCreateWithoutRoleMenuInput = {
    id?: string;
    roleId: string;
    label: string;
    description?: string | null;
    emoji?: string | null;
    position: number;
    revision?: number;
    lastOperationSource?: string;
    createdAt?: Date | string;
};
export type RoleMenuOptionUncheckedCreateWithoutRoleMenuInput = {
    id?: string;
    roleId: string;
    label: string;
    description?: string | null;
    emoji?: string | null;
    position: number;
    revision?: number;
    lastOperationSource?: string;
    createdAt?: Date | string;
};
export type RoleMenuOptionCreateOrConnectWithoutRoleMenuInput = {
    where: Prisma.RoleMenuOptionWhereUniqueInput;
    create: Prisma.XOR<Prisma.RoleMenuOptionCreateWithoutRoleMenuInput, Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput>;
};
export type RoleMenuOptionCreateManyRoleMenuInputEnvelope = {
    data: Prisma.RoleMenuOptionCreateManyRoleMenuInput | Prisma.RoleMenuOptionCreateManyRoleMenuInput[];
    skipDuplicates?: boolean;
};
export type RoleMenuOptionUpsertWithWhereUniqueWithoutRoleMenuInput = {
    where: Prisma.RoleMenuOptionWhereUniqueInput;
    update: Prisma.XOR<Prisma.RoleMenuOptionUpdateWithoutRoleMenuInput, Prisma.RoleMenuOptionUncheckedUpdateWithoutRoleMenuInput>;
    create: Prisma.XOR<Prisma.RoleMenuOptionCreateWithoutRoleMenuInput, Prisma.RoleMenuOptionUncheckedCreateWithoutRoleMenuInput>;
};
export type RoleMenuOptionUpdateWithWhereUniqueWithoutRoleMenuInput = {
    where: Prisma.RoleMenuOptionWhereUniqueInput;
    data: Prisma.XOR<Prisma.RoleMenuOptionUpdateWithoutRoleMenuInput, Prisma.RoleMenuOptionUncheckedUpdateWithoutRoleMenuInput>;
};
export type RoleMenuOptionUpdateManyWithWhereWithoutRoleMenuInput = {
    where: Prisma.RoleMenuOptionScalarWhereInput;
    data: Prisma.XOR<Prisma.RoleMenuOptionUpdateManyMutationInput, Prisma.RoleMenuOptionUncheckedUpdateManyWithoutRoleMenuInput>;
};
export type RoleMenuOptionScalarWhereInput = {
    AND?: Prisma.RoleMenuOptionScalarWhereInput | Prisma.RoleMenuOptionScalarWhereInput[];
    OR?: Prisma.RoleMenuOptionScalarWhereInput[];
    NOT?: Prisma.RoleMenuOptionScalarWhereInput | Prisma.RoleMenuOptionScalarWhereInput[];
    id?: Prisma.UuidFilter<"RoleMenuOption"> | string;
    roleMenuId?: Prisma.UuidFilter<"RoleMenuOption"> | string;
    roleId?: Prisma.StringFilter<"RoleMenuOption"> | string;
    label?: Prisma.StringFilter<"RoleMenuOption"> | string;
    description?: Prisma.StringNullableFilter<"RoleMenuOption"> | string | null;
    emoji?: Prisma.StringNullableFilter<"RoleMenuOption"> | string | null;
    position?: Prisma.IntFilter<"RoleMenuOption"> | number;
    revision?: Prisma.IntFilter<"RoleMenuOption"> | number;
    lastOperationSource?: Prisma.StringFilter<"RoleMenuOption"> | string;
    createdAt?: Prisma.DateTimeFilter<"RoleMenuOption"> | Date | string;
};
export type RoleMenuOptionCreateManyRoleMenuInput = {
    id?: string;
    roleId: string;
    label: string;
    description?: string | null;
    emoji?: string | null;
    position: number;
    revision?: number;
    lastOperationSource?: string;
    createdAt?: Date | string;
};
export type RoleMenuOptionUpdateWithoutRoleMenuInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    label?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    emoji?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    lastOperationSource?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoleMenuOptionUncheckedUpdateWithoutRoleMenuInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    label?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    emoji?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    lastOperationSource?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoleMenuOptionUncheckedUpdateManyWithoutRoleMenuInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    roleId?: Prisma.StringFieldUpdateOperationsInput | string;
    label?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    emoji?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    revision?: Prisma.IntFieldUpdateOperationsInput | number;
    lastOperationSource?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RoleMenuOptionSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    roleMenuId?: boolean;
    roleId?: boolean;
    label?: boolean;
    description?: boolean;
    emoji?: boolean;
    position?: boolean;
    revision?: boolean;
    lastOperationSource?: boolean;
    createdAt?: boolean;
    roleMenu?: boolean | Prisma.RoleMenuDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["roleMenuOption"]>;
export type RoleMenuOptionSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    roleMenuId?: boolean;
    roleId?: boolean;
    label?: boolean;
    description?: boolean;
    emoji?: boolean;
    position?: boolean;
    revision?: boolean;
    lastOperationSource?: boolean;
    createdAt?: boolean;
    roleMenu?: boolean | Prisma.RoleMenuDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["roleMenuOption"]>;
export type RoleMenuOptionSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    roleMenuId?: boolean;
    roleId?: boolean;
    label?: boolean;
    description?: boolean;
    emoji?: boolean;
    position?: boolean;
    revision?: boolean;
    lastOperationSource?: boolean;
    createdAt?: boolean;
    roleMenu?: boolean | Prisma.RoleMenuDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["roleMenuOption"]>;
export type RoleMenuOptionSelectScalar = {
    id?: boolean;
    roleMenuId?: boolean;
    roleId?: boolean;
    label?: boolean;
    description?: boolean;
    emoji?: boolean;
    position?: boolean;
    revision?: boolean;
    lastOperationSource?: boolean;
    createdAt?: boolean;
};
export type RoleMenuOptionOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "roleMenuId" | "roleId" | "label" | "description" | "emoji" | "position" | "revision" | "lastOperationSource" | "createdAt", ExtArgs["result"]["roleMenuOption"]>;
export type RoleMenuOptionInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    roleMenu?: boolean | Prisma.RoleMenuDefaultArgs<ExtArgs>;
};
export type RoleMenuOptionIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    roleMenu?: boolean | Prisma.RoleMenuDefaultArgs<ExtArgs>;
};
export type RoleMenuOptionIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    roleMenu?: boolean | Prisma.RoleMenuDefaultArgs<ExtArgs>;
};
export type $RoleMenuOptionPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RoleMenuOption";
    objects: {
        roleMenu: Prisma.$RoleMenuPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        roleMenuId: string;
        roleId: string;
        label: string;
        description: string | null;
        emoji: string | null;
        position: number;
        revision: number;
        lastOperationSource: string;
        createdAt: Date;
    }, ExtArgs["result"]["roleMenuOption"]>;
    composites: {};
};
export type RoleMenuOptionGetPayload<S extends boolean | null | undefined | RoleMenuOptionDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload, S>;
export type RoleMenuOptionCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RoleMenuOptionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RoleMenuOptionCountAggregateInputType | true;
};
export interface RoleMenuOptionDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RoleMenuOption'];
        meta: {
            name: 'RoleMenuOption';
        };
    };
    /**
     * Find zero or one RoleMenuOption that matches the filter.
     * @param {RoleMenuOptionFindUniqueArgs} args - Arguments to find a RoleMenuOption
     * @example
     * // Get one RoleMenuOption
     * const roleMenuOption = await prisma.roleMenuOption.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RoleMenuOptionFindUniqueArgs>(args: Prisma.SelectSubset<T, RoleMenuOptionFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RoleMenuOptionClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one RoleMenuOption that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RoleMenuOptionFindUniqueOrThrowArgs} args - Arguments to find a RoleMenuOption
     * @example
     * // Get one RoleMenuOption
     * const roleMenuOption = await prisma.roleMenuOption.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RoleMenuOptionFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RoleMenuOptionFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RoleMenuOptionClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first RoleMenuOption that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleMenuOptionFindFirstArgs} args - Arguments to find a RoleMenuOption
     * @example
     * // Get one RoleMenuOption
     * const roleMenuOption = await prisma.roleMenuOption.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RoleMenuOptionFindFirstArgs>(args?: Prisma.SelectSubset<T, RoleMenuOptionFindFirstArgs<ExtArgs>>): Prisma.Prisma__RoleMenuOptionClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first RoleMenuOption that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleMenuOptionFindFirstOrThrowArgs} args - Arguments to find a RoleMenuOption
     * @example
     * // Get one RoleMenuOption
     * const roleMenuOption = await prisma.roleMenuOption.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RoleMenuOptionFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RoleMenuOptionFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RoleMenuOptionClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more RoleMenuOptions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleMenuOptionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RoleMenuOptions
     * const roleMenuOptions = await prisma.roleMenuOption.findMany()
     *
     * // Get first 10 RoleMenuOptions
     * const roleMenuOptions = await prisma.roleMenuOption.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const roleMenuOptionWithIdOnly = await prisma.roleMenuOption.findMany({ select: { id: true } })
     *
     */
    findMany<T extends RoleMenuOptionFindManyArgs>(args?: Prisma.SelectSubset<T, RoleMenuOptionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a RoleMenuOption.
     * @param {RoleMenuOptionCreateArgs} args - Arguments to create a RoleMenuOption.
     * @example
     * // Create one RoleMenuOption
     * const RoleMenuOption = await prisma.roleMenuOption.create({
     *   data: {
     *     // ... data to create a RoleMenuOption
     *   }
     * })
     *
     */
    create<T extends RoleMenuOptionCreateArgs>(args: Prisma.SelectSubset<T, RoleMenuOptionCreateArgs<ExtArgs>>): Prisma.Prisma__RoleMenuOptionClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many RoleMenuOptions.
     * @param {RoleMenuOptionCreateManyArgs} args - Arguments to create many RoleMenuOptions.
     * @example
     * // Create many RoleMenuOptions
     * const roleMenuOption = await prisma.roleMenuOption.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends RoleMenuOptionCreateManyArgs>(args?: Prisma.SelectSubset<T, RoleMenuOptionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many RoleMenuOptions and returns the data saved in the database.
     * @param {RoleMenuOptionCreateManyAndReturnArgs} args - Arguments to create many RoleMenuOptions.
     * @example
     * // Create many RoleMenuOptions
     * const roleMenuOption = await prisma.roleMenuOption.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many RoleMenuOptions and only return the `id`
     * const roleMenuOptionWithIdOnly = await prisma.roleMenuOption.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends RoleMenuOptionCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RoleMenuOptionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a RoleMenuOption.
     * @param {RoleMenuOptionDeleteArgs} args - Arguments to delete one RoleMenuOption.
     * @example
     * // Delete one RoleMenuOption
     * const RoleMenuOption = await prisma.roleMenuOption.delete({
     *   where: {
     *     // ... filter to delete one RoleMenuOption
     *   }
     * })
     *
     */
    delete<T extends RoleMenuOptionDeleteArgs>(args: Prisma.SelectSubset<T, RoleMenuOptionDeleteArgs<ExtArgs>>): Prisma.Prisma__RoleMenuOptionClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one RoleMenuOption.
     * @param {RoleMenuOptionUpdateArgs} args - Arguments to update one RoleMenuOption.
     * @example
     * // Update one RoleMenuOption
     * const roleMenuOption = await prisma.roleMenuOption.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends RoleMenuOptionUpdateArgs>(args: Prisma.SelectSubset<T, RoleMenuOptionUpdateArgs<ExtArgs>>): Prisma.Prisma__RoleMenuOptionClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more RoleMenuOptions.
     * @param {RoleMenuOptionDeleteManyArgs} args - Arguments to filter RoleMenuOptions to delete.
     * @example
     * // Delete a few RoleMenuOptions
     * const { count } = await prisma.roleMenuOption.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends RoleMenuOptionDeleteManyArgs>(args?: Prisma.SelectSubset<T, RoleMenuOptionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more RoleMenuOptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleMenuOptionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RoleMenuOptions
     * const roleMenuOption = await prisma.roleMenuOption.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends RoleMenuOptionUpdateManyArgs>(args: Prisma.SelectSubset<T, RoleMenuOptionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more RoleMenuOptions and returns the data updated in the database.
     * @param {RoleMenuOptionUpdateManyAndReturnArgs} args - Arguments to update many RoleMenuOptions.
     * @example
     * // Update many RoleMenuOptions
     * const roleMenuOption = await prisma.roleMenuOption.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more RoleMenuOptions and only return the `id`
     * const roleMenuOptionWithIdOnly = await prisma.roleMenuOption.updateManyAndReturn({
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
    updateManyAndReturn<T extends RoleMenuOptionUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RoleMenuOptionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one RoleMenuOption.
     * @param {RoleMenuOptionUpsertArgs} args - Arguments to update or create a RoleMenuOption.
     * @example
     * // Update or create a RoleMenuOption
     * const roleMenuOption = await prisma.roleMenuOption.upsert({
     *   create: {
     *     // ... data to create a RoleMenuOption
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RoleMenuOption we want to update
     *   }
     * })
     */
    upsert<T extends RoleMenuOptionUpsertArgs>(args: Prisma.SelectSubset<T, RoleMenuOptionUpsertArgs<ExtArgs>>): Prisma.Prisma__RoleMenuOptionClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuOptionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of RoleMenuOptions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleMenuOptionCountArgs} args - Arguments to filter RoleMenuOptions to count.
     * @example
     * // Count the number of RoleMenuOptions
     * const count = await prisma.roleMenuOption.count({
     *   where: {
     *     // ... the filter for the RoleMenuOptions we want to count
     *   }
     * })
    **/
    count<T extends RoleMenuOptionCountArgs>(args?: Prisma.Subset<T, RoleMenuOptionCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RoleMenuOptionCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a RoleMenuOption.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleMenuOptionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends RoleMenuOptionAggregateArgs>(args: Prisma.Subset<T, RoleMenuOptionAggregateArgs>): Prisma.PrismaPromise<GetRoleMenuOptionAggregateType<T>>;
    /**
     * Group by RoleMenuOption.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RoleMenuOptionGroupByArgs} args - Group by arguments.
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
    groupBy<T extends RoleMenuOptionGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RoleMenuOptionGroupByArgs['orderBy'];
    } : {
        orderBy?: RoleMenuOptionGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RoleMenuOptionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRoleMenuOptionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the RoleMenuOption model
     */
    readonly fields: RoleMenuOptionFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for RoleMenuOption.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__RoleMenuOptionClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    roleMenu<T extends Prisma.RoleMenuDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.RoleMenuDefaultArgs<ExtArgs>>): Prisma.Prisma__RoleMenuClient<runtime.Types.Result.GetResult<Prisma.$RoleMenuPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the RoleMenuOption model
 */
export interface RoleMenuOptionFieldRefs {
    readonly id: Prisma.FieldRef<"RoleMenuOption", 'String'>;
    readonly roleMenuId: Prisma.FieldRef<"RoleMenuOption", 'String'>;
    readonly roleId: Prisma.FieldRef<"RoleMenuOption", 'String'>;
    readonly label: Prisma.FieldRef<"RoleMenuOption", 'String'>;
    readonly description: Prisma.FieldRef<"RoleMenuOption", 'String'>;
    readonly emoji: Prisma.FieldRef<"RoleMenuOption", 'String'>;
    readonly position: Prisma.FieldRef<"RoleMenuOption", 'Int'>;
    readonly revision: Prisma.FieldRef<"RoleMenuOption", 'Int'>;
    readonly lastOperationSource: Prisma.FieldRef<"RoleMenuOption", 'String'>;
    readonly createdAt: Prisma.FieldRef<"RoleMenuOption", 'DateTime'>;
}
/**
 * RoleMenuOption findUnique
 */
export type RoleMenuOptionFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * Filter, which RoleMenuOption to fetch.
     */
    where: Prisma.RoleMenuOptionWhereUniqueInput;
};
/**
 * RoleMenuOption findUniqueOrThrow
 */
export type RoleMenuOptionFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * Filter, which RoleMenuOption to fetch.
     */
    where: Prisma.RoleMenuOptionWhereUniqueInput;
};
/**
 * RoleMenuOption findFirst
 */
export type RoleMenuOptionFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * Filter, which RoleMenuOption to fetch.
     */
    where?: Prisma.RoleMenuOptionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RoleMenuOptions to fetch.
     */
    orderBy?: Prisma.RoleMenuOptionOrderByWithRelationInput | Prisma.RoleMenuOptionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RoleMenuOptions.
     */
    cursor?: Prisma.RoleMenuOptionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RoleMenuOptions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RoleMenuOptions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RoleMenuOptions.
     */
    distinct?: Prisma.RoleMenuOptionScalarFieldEnum | Prisma.RoleMenuOptionScalarFieldEnum[];
};
/**
 * RoleMenuOption findFirstOrThrow
 */
export type RoleMenuOptionFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * Filter, which RoleMenuOption to fetch.
     */
    where?: Prisma.RoleMenuOptionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RoleMenuOptions to fetch.
     */
    orderBy?: Prisma.RoleMenuOptionOrderByWithRelationInput | Prisma.RoleMenuOptionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RoleMenuOptions.
     */
    cursor?: Prisma.RoleMenuOptionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RoleMenuOptions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RoleMenuOptions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RoleMenuOptions.
     */
    distinct?: Prisma.RoleMenuOptionScalarFieldEnum | Prisma.RoleMenuOptionScalarFieldEnum[];
};
/**
 * RoleMenuOption findMany
 */
export type RoleMenuOptionFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * Filter, which RoleMenuOptions to fetch.
     */
    where?: Prisma.RoleMenuOptionWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RoleMenuOptions to fetch.
     */
    orderBy?: Prisma.RoleMenuOptionOrderByWithRelationInput | Prisma.RoleMenuOptionOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing RoleMenuOptions.
     */
    cursor?: Prisma.RoleMenuOptionWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RoleMenuOptions from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RoleMenuOptions.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RoleMenuOptions.
     */
    distinct?: Prisma.RoleMenuOptionScalarFieldEnum | Prisma.RoleMenuOptionScalarFieldEnum[];
};
/**
 * RoleMenuOption create
 */
export type RoleMenuOptionCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * The data needed to create a RoleMenuOption.
     */
    data: Prisma.XOR<Prisma.RoleMenuOptionCreateInput, Prisma.RoleMenuOptionUncheckedCreateInput>;
};
/**
 * RoleMenuOption createMany
 */
export type RoleMenuOptionCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many RoleMenuOptions.
     */
    data: Prisma.RoleMenuOptionCreateManyInput | Prisma.RoleMenuOptionCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * RoleMenuOption createManyAndReturn
 */
export type RoleMenuOptionCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * The data used to create many RoleMenuOptions.
     */
    data: Prisma.RoleMenuOptionCreateManyInput | Prisma.RoleMenuOptionCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * RoleMenuOption update
 */
export type RoleMenuOptionUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * The data needed to update a RoleMenuOption.
     */
    data: Prisma.XOR<Prisma.RoleMenuOptionUpdateInput, Prisma.RoleMenuOptionUncheckedUpdateInput>;
    /**
     * Choose, which RoleMenuOption to update.
     */
    where: Prisma.RoleMenuOptionWhereUniqueInput;
};
/**
 * RoleMenuOption updateMany
 */
export type RoleMenuOptionUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update RoleMenuOptions.
     */
    data: Prisma.XOR<Prisma.RoleMenuOptionUpdateManyMutationInput, Prisma.RoleMenuOptionUncheckedUpdateManyInput>;
    /**
     * Filter which RoleMenuOptions to update
     */
    where?: Prisma.RoleMenuOptionWhereInput;
    /**
     * Limit how many RoleMenuOptions to update.
     */
    limit?: number;
};
/**
 * RoleMenuOption updateManyAndReturn
 */
export type RoleMenuOptionUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * The data used to update RoleMenuOptions.
     */
    data: Prisma.XOR<Prisma.RoleMenuOptionUpdateManyMutationInput, Prisma.RoleMenuOptionUncheckedUpdateManyInput>;
    /**
     * Filter which RoleMenuOptions to update
     */
    where?: Prisma.RoleMenuOptionWhereInput;
    /**
     * Limit how many RoleMenuOptions to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * RoleMenuOption upsert
 */
export type RoleMenuOptionUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * The filter to search for the RoleMenuOption to update in case it exists.
     */
    where: Prisma.RoleMenuOptionWhereUniqueInput;
    /**
     * In case the RoleMenuOption found by the `where` argument doesn't exist, create a new RoleMenuOption with this data.
     */
    create: Prisma.XOR<Prisma.RoleMenuOptionCreateInput, Prisma.RoleMenuOptionUncheckedCreateInput>;
    /**
     * In case the RoleMenuOption was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.RoleMenuOptionUpdateInput, Prisma.RoleMenuOptionUncheckedUpdateInput>;
};
/**
 * RoleMenuOption delete
 */
export type RoleMenuOptionDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
    /**
     * Filter which RoleMenuOption to delete.
     */
    where: Prisma.RoleMenuOptionWhereUniqueInput;
};
/**
 * RoleMenuOption deleteMany
 */
export type RoleMenuOptionDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which RoleMenuOptions to delete
     */
    where?: Prisma.RoleMenuOptionWhereInput;
    /**
     * Limit how many RoleMenuOptions to delete.
     */
    limit?: number;
};
/**
 * RoleMenuOption without action
 */
export type RoleMenuOptionDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RoleMenuOption
     */
    select?: Prisma.RoleMenuOptionSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RoleMenuOption
     */
    omit?: Prisma.RoleMenuOptionOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RoleMenuOptionInclude<ExtArgs> | null;
};
//# sourceMappingURL=RoleMenuOption.d.ts.map
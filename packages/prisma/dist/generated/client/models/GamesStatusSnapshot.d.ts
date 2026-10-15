import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model GamesStatusSnapshot
 *
 */
export type GamesStatusSnapshotModel = runtime.Types.Result.DefaultSelection<Prisma.$GamesStatusSnapshotPayload>;
export type AggregateGamesStatusSnapshot = {
    _count: GamesStatusSnapshotCountAggregateOutputType | null;
    _avg: GamesStatusSnapshotAvgAggregateOutputType | null;
    _sum: GamesStatusSnapshotSumAggregateOutputType | null;
    _min: GamesStatusSnapshotMinAggregateOutputType | null;
    _max: GamesStatusSnapshotMaxAggregateOutputType | null;
};
export type GamesStatusSnapshotAvgAggregateOutputType = {
    players: number | null;
    maxPlayers: number | null;
};
export type GamesStatusSnapshotSumAggregateOutputType = {
    players: number | null;
    maxPlayers: number | null;
};
export type GamesStatusSnapshotMinAggregateOutputType = {
    id: string | null;
    serverId: string | null;
    online: boolean | null;
    players: number | null;
    maxPlayers: number | null;
    at: Date | null;
};
export type GamesStatusSnapshotMaxAggregateOutputType = {
    id: string | null;
    serverId: string | null;
    online: boolean | null;
    players: number | null;
    maxPlayers: number | null;
    at: Date | null;
};
export type GamesStatusSnapshotCountAggregateOutputType = {
    id: number;
    serverId: number;
    online: number;
    players: number;
    maxPlayers: number;
    at: number;
    _all: number;
};
export type GamesStatusSnapshotAvgAggregateInputType = {
    players?: true;
    maxPlayers?: true;
};
export type GamesStatusSnapshotSumAggregateInputType = {
    players?: true;
    maxPlayers?: true;
};
export type GamesStatusSnapshotMinAggregateInputType = {
    id?: true;
    serverId?: true;
    online?: true;
    players?: true;
    maxPlayers?: true;
    at?: true;
};
export type GamesStatusSnapshotMaxAggregateInputType = {
    id?: true;
    serverId?: true;
    online?: true;
    players?: true;
    maxPlayers?: true;
    at?: true;
};
export type GamesStatusSnapshotCountAggregateInputType = {
    id?: true;
    serverId?: true;
    online?: true;
    players?: true;
    maxPlayers?: true;
    at?: true;
    _all?: true;
};
export type GamesStatusSnapshotAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GamesStatusSnapshot to aggregate.
     */
    where?: Prisma.GamesStatusSnapshotWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GamesStatusSnapshots to fetch.
     */
    orderBy?: Prisma.GamesStatusSnapshotOrderByWithRelationInput | Prisma.GamesStatusSnapshotOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.GamesStatusSnapshotWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GamesStatusSnapshots from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GamesStatusSnapshots.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned GamesStatusSnapshots
    **/
    _count?: true | GamesStatusSnapshotCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: GamesStatusSnapshotAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: GamesStatusSnapshotSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: GamesStatusSnapshotMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: GamesStatusSnapshotMaxAggregateInputType;
};
export type GetGamesStatusSnapshotAggregateType<T extends GamesStatusSnapshotAggregateArgs> = {
    [P in keyof T & keyof AggregateGamesStatusSnapshot]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateGamesStatusSnapshot[P]> : Prisma.GetScalarType<T[P], AggregateGamesStatusSnapshot[P]>;
};
export type GamesStatusSnapshotGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.GamesStatusSnapshotWhereInput;
    orderBy?: Prisma.GamesStatusSnapshotOrderByWithAggregationInput | Prisma.GamesStatusSnapshotOrderByWithAggregationInput[];
    by: Prisma.GamesStatusSnapshotScalarFieldEnum[] | Prisma.GamesStatusSnapshotScalarFieldEnum;
    having?: Prisma.GamesStatusSnapshotScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: GamesStatusSnapshotCountAggregateInputType | true;
    _avg?: GamesStatusSnapshotAvgAggregateInputType;
    _sum?: GamesStatusSnapshotSumAggregateInputType;
    _min?: GamesStatusSnapshotMinAggregateInputType;
    _max?: GamesStatusSnapshotMaxAggregateInputType;
};
export type GamesStatusSnapshotGroupByOutputType = {
    id: string;
    serverId: string;
    online: boolean;
    players: number;
    maxPlayers: number;
    at: Date;
    _count: GamesStatusSnapshotCountAggregateOutputType | null;
    _avg: GamesStatusSnapshotAvgAggregateOutputType | null;
    _sum: GamesStatusSnapshotSumAggregateOutputType | null;
    _min: GamesStatusSnapshotMinAggregateOutputType | null;
    _max: GamesStatusSnapshotMaxAggregateOutputType | null;
};
export type GetGamesStatusSnapshotGroupByPayload<T extends GamesStatusSnapshotGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<GamesStatusSnapshotGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof GamesStatusSnapshotGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], GamesStatusSnapshotGroupByOutputType[P]> : Prisma.GetScalarType<T[P], GamesStatusSnapshotGroupByOutputType[P]>;
}>>;
export type GamesStatusSnapshotWhereInput = {
    AND?: Prisma.GamesStatusSnapshotWhereInput | Prisma.GamesStatusSnapshotWhereInput[];
    OR?: Prisma.GamesStatusSnapshotWhereInput[];
    NOT?: Prisma.GamesStatusSnapshotWhereInput | Prisma.GamesStatusSnapshotWhereInput[];
    id?: Prisma.UuidFilter<"GamesStatusSnapshot"> | string;
    serverId?: Prisma.UuidFilter<"GamesStatusSnapshot"> | string;
    online?: Prisma.BoolFilter<"GamesStatusSnapshot"> | boolean;
    players?: Prisma.IntFilter<"GamesStatusSnapshot"> | number;
    maxPlayers?: Prisma.IntFilter<"GamesStatusSnapshot"> | number;
    at?: Prisma.DateTimeFilter<"GamesStatusSnapshot"> | Date | string;
    server?: Prisma.XOR<Prisma.GamesServerScalarRelationFilter, Prisma.GamesServerWhereInput>;
};
export type GamesStatusSnapshotOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    serverId?: Prisma.SortOrder;
    online?: Prisma.SortOrder;
    players?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    at?: Prisma.SortOrder;
    server?: Prisma.GamesServerOrderByWithRelationInput;
};
export type GamesStatusSnapshotWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.GamesStatusSnapshotWhereInput | Prisma.GamesStatusSnapshotWhereInput[];
    OR?: Prisma.GamesStatusSnapshotWhereInput[];
    NOT?: Prisma.GamesStatusSnapshotWhereInput | Prisma.GamesStatusSnapshotWhereInput[];
    serverId?: Prisma.UuidFilter<"GamesStatusSnapshot"> | string;
    online?: Prisma.BoolFilter<"GamesStatusSnapshot"> | boolean;
    players?: Prisma.IntFilter<"GamesStatusSnapshot"> | number;
    maxPlayers?: Prisma.IntFilter<"GamesStatusSnapshot"> | number;
    at?: Prisma.DateTimeFilter<"GamesStatusSnapshot"> | Date | string;
    server?: Prisma.XOR<Prisma.GamesServerScalarRelationFilter, Prisma.GamesServerWhereInput>;
}, "id">;
export type GamesStatusSnapshotOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    serverId?: Prisma.SortOrder;
    online?: Prisma.SortOrder;
    players?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    at?: Prisma.SortOrder;
    _count?: Prisma.GamesStatusSnapshotCountOrderByAggregateInput;
    _avg?: Prisma.GamesStatusSnapshotAvgOrderByAggregateInput;
    _max?: Prisma.GamesStatusSnapshotMaxOrderByAggregateInput;
    _min?: Prisma.GamesStatusSnapshotMinOrderByAggregateInput;
    _sum?: Prisma.GamesStatusSnapshotSumOrderByAggregateInput;
};
export type GamesStatusSnapshotScalarWhereWithAggregatesInput = {
    AND?: Prisma.GamesStatusSnapshotScalarWhereWithAggregatesInput | Prisma.GamesStatusSnapshotScalarWhereWithAggregatesInput[];
    OR?: Prisma.GamesStatusSnapshotScalarWhereWithAggregatesInput[];
    NOT?: Prisma.GamesStatusSnapshotScalarWhereWithAggregatesInput | Prisma.GamesStatusSnapshotScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"GamesStatusSnapshot"> | string;
    serverId?: Prisma.UuidWithAggregatesFilter<"GamesStatusSnapshot"> | string;
    online?: Prisma.BoolWithAggregatesFilter<"GamesStatusSnapshot"> | boolean;
    players?: Prisma.IntWithAggregatesFilter<"GamesStatusSnapshot"> | number;
    maxPlayers?: Prisma.IntWithAggregatesFilter<"GamesStatusSnapshot"> | number;
    at?: Prisma.DateTimeWithAggregatesFilter<"GamesStatusSnapshot"> | Date | string;
};
export type GamesStatusSnapshotCreateInput = {
    id?: string;
    online: boolean;
    players: number;
    maxPlayers: number;
    at?: Date | string;
    server: Prisma.GamesServerCreateNestedOneWithoutSnapshotsInput;
};
export type GamesStatusSnapshotUncheckedCreateInput = {
    id?: string;
    serverId: string;
    online: boolean;
    players: number;
    maxPlayers: number;
    at?: Date | string;
};
export type GamesStatusSnapshotUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    online?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    players?: Prisma.IntFieldUpdateOperationsInput | number;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    server?: Prisma.GamesServerUpdateOneRequiredWithoutSnapshotsNestedInput;
};
export type GamesStatusSnapshotUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serverId?: Prisma.StringFieldUpdateOperationsInput | string;
    online?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    players?: Prisma.IntFieldUpdateOperationsInput | number;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesStatusSnapshotCreateManyInput = {
    id?: string;
    serverId: string;
    online: boolean;
    players: number;
    maxPlayers: number;
    at?: Date | string;
};
export type GamesStatusSnapshotUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    online?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    players?: Prisma.IntFieldUpdateOperationsInput | number;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesStatusSnapshotUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    serverId?: Prisma.StringFieldUpdateOperationsInput | string;
    online?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    players?: Prisma.IntFieldUpdateOperationsInput | number;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesStatusSnapshotListRelationFilter = {
    every?: Prisma.GamesStatusSnapshotWhereInput;
    some?: Prisma.GamesStatusSnapshotWhereInput;
    none?: Prisma.GamesStatusSnapshotWhereInput;
};
export type GamesStatusSnapshotOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type GamesStatusSnapshotCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    serverId?: Prisma.SortOrder;
    online?: Prisma.SortOrder;
    players?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    at?: Prisma.SortOrder;
};
export type GamesStatusSnapshotAvgOrderByAggregateInput = {
    players?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
};
export type GamesStatusSnapshotMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    serverId?: Prisma.SortOrder;
    online?: Prisma.SortOrder;
    players?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    at?: Prisma.SortOrder;
};
export type GamesStatusSnapshotMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    serverId?: Prisma.SortOrder;
    online?: Prisma.SortOrder;
    players?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
    at?: Prisma.SortOrder;
};
export type GamesStatusSnapshotSumOrderByAggregateInput = {
    players?: Prisma.SortOrder;
    maxPlayers?: Prisma.SortOrder;
};
export type GamesStatusSnapshotCreateNestedManyWithoutServerInput = {
    create?: Prisma.XOR<Prisma.GamesStatusSnapshotCreateWithoutServerInput, Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput> | Prisma.GamesStatusSnapshotCreateWithoutServerInput[] | Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput[];
    connectOrCreate?: Prisma.GamesStatusSnapshotCreateOrConnectWithoutServerInput | Prisma.GamesStatusSnapshotCreateOrConnectWithoutServerInput[];
    createMany?: Prisma.GamesStatusSnapshotCreateManyServerInputEnvelope;
    connect?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
};
export type GamesStatusSnapshotUncheckedCreateNestedManyWithoutServerInput = {
    create?: Prisma.XOR<Prisma.GamesStatusSnapshotCreateWithoutServerInput, Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput> | Prisma.GamesStatusSnapshotCreateWithoutServerInput[] | Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput[];
    connectOrCreate?: Prisma.GamesStatusSnapshotCreateOrConnectWithoutServerInput | Prisma.GamesStatusSnapshotCreateOrConnectWithoutServerInput[];
    createMany?: Prisma.GamesStatusSnapshotCreateManyServerInputEnvelope;
    connect?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
};
export type GamesStatusSnapshotUpdateManyWithoutServerNestedInput = {
    create?: Prisma.XOR<Prisma.GamesStatusSnapshotCreateWithoutServerInput, Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput> | Prisma.GamesStatusSnapshotCreateWithoutServerInput[] | Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput[];
    connectOrCreate?: Prisma.GamesStatusSnapshotCreateOrConnectWithoutServerInput | Prisma.GamesStatusSnapshotCreateOrConnectWithoutServerInput[];
    upsert?: Prisma.GamesStatusSnapshotUpsertWithWhereUniqueWithoutServerInput | Prisma.GamesStatusSnapshotUpsertWithWhereUniqueWithoutServerInput[];
    createMany?: Prisma.GamesStatusSnapshotCreateManyServerInputEnvelope;
    set?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
    disconnect?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
    delete?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
    connect?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
    update?: Prisma.GamesStatusSnapshotUpdateWithWhereUniqueWithoutServerInput | Prisma.GamesStatusSnapshotUpdateWithWhereUniqueWithoutServerInput[];
    updateMany?: Prisma.GamesStatusSnapshotUpdateManyWithWhereWithoutServerInput | Prisma.GamesStatusSnapshotUpdateManyWithWhereWithoutServerInput[];
    deleteMany?: Prisma.GamesStatusSnapshotScalarWhereInput | Prisma.GamesStatusSnapshotScalarWhereInput[];
};
export type GamesStatusSnapshotUncheckedUpdateManyWithoutServerNestedInput = {
    create?: Prisma.XOR<Prisma.GamesStatusSnapshotCreateWithoutServerInput, Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput> | Prisma.GamesStatusSnapshotCreateWithoutServerInput[] | Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput[];
    connectOrCreate?: Prisma.GamesStatusSnapshotCreateOrConnectWithoutServerInput | Prisma.GamesStatusSnapshotCreateOrConnectWithoutServerInput[];
    upsert?: Prisma.GamesStatusSnapshotUpsertWithWhereUniqueWithoutServerInput | Prisma.GamesStatusSnapshotUpsertWithWhereUniqueWithoutServerInput[];
    createMany?: Prisma.GamesStatusSnapshotCreateManyServerInputEnvelope;
    set?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
    disconnect?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
    delete?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
    connect?: Prisma.GamesStatusSnapshotWhereUniqueInput | Prisma.GamesStatusSnapshotWhereUniqueInput[];
    update?: Prisma.GamesStatusSnapshotUpdateWithWhereUniqueWithoutServerInput | Prisma.GamesStatusSnapshotUpdateWithWhereUniqueWithoutServerInput[];
    updateMany?: Prisma.GamesStatusSnapshotUpdateManyWithWhereWithoutServerInput | Prisma.GamesStatusSnapshotUpdateManyWithWhereWithoutServerInput[];
    deleteMany?: Prisma.GamesStatusSnapshotScalarWhereInput | Prisma.GamesStatusSnapshotScalarWhereInput[];
};
export type GamesStatusSnapshotCreateWithoutServerInput = {
    id?: string;
    online: boolean;
    players: number;
    maxPlayers: number;
    at?: Date | string;
};
export type GamesStatusSnapshotUncheckedCreateWithoutServerInput = {
    id?: string;
    online: boolean;
    players: number;
    maxPlayers: number;
    at?: Date | string;
};
export type GamesStatusSnapshotCreateOrConnectWithoutServerInput = {
    where: Prisma.GamesStatusSnapshotWhereUniqueInput;
    create: Prisma.XOR<Prisma.GamesStatusSnapshotCreateWithoutServerInput, Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput>;
};
export type GamesStatusSnapshotCreateManyServerInputEnvelope = {
    data: Prisma.GamesStatusSnapshotCreateManyServerInput | Prisma.GamesStatusSnapshotCreateManyServerInput[];
    skipDuplicates?: boolean;
};
export type GamesStatusSnapshotUpsertWithWhereUniqueWithoutServerInput = {
    where: Prisma.GamesStatusSnapshotWhereUniqueInput;
    update: Prisma.XOR<Prisma.GamesStatusSnapshotUpdateWithoutServerInput, Prisma.GamesStatusSnapshotUncheckedUpdateWithoutServerInput>;
    create: Prisma.XOR<Prisma.GamesStatusSnapshotCreateWithoutServerInput, Prisma.GamesStatusSnapshotUncheckedCreateWithoutServerInput>;
};
export type GamesStatusSnapshotUpdateWithWhereUniqueWithoutServerInput = {
    where: Prisma.GamesStatusSnapshotWhereUniqueInput;
    data: Prisma.XOR<Prisma.GamesStatusSnapshotUpdateWithoutServerInput, Prisma.GamesStatusSnapshotUncheckedUpdateWithoutServerInput>;
};
export type GamesStatusSnapshotUpdateManyWithWhereWithoutServerInput = {
    where: Prisma.GamesStatusSnapshotScalarWhereInput;
    data: Prisma.XOR<Prisma.GamesStatusSnapshotUpdateManyMutationInput, Prisma.GamesStatusSnapshotUncheckedUpdateManyWithoutServerInput>;
};
export type GamesStatusSnapshotScalarWhereInput = {
    AND?: Prisma.GamesStatusSnapshotScalarWhereInput | Prisma.GamesStatusSnapshotScalarWhereInput[];
    OR?: Prisma.GamesStatusSnapshotScalarWhereInput[];
    NOT?: Prisma.GamesStatusSnapshotScalarWhereInput | Prisma.GamesStatusSnapshotScalarWhereInput[];
    id?: Prisma.UuidFilter<"GamesStatusSnapshot"> | string;
    serverId?: Prisma.UuidFilter<"GamesStatusSnapshot"> | string;
    online?: Prisma.BoolFilter<"GamesStatusSnapshot"> | boolean;
    players?: Prisma.IntFilter<"GamesStatusSnapshot"> | number;
    maxPlayers?: Prisma.IntFilter<"GamesStatusSnapshot"> | number;
    at?: Prisma.DateTimeFilter<"GamesStatusSnapshot"> | Date | string;
};
export type GamesStatusSnapshotCreateManyServerInput = {
    id?: string;
    online: boolean;
    players: number;
    maxPlayers: number;
    at?: Date | string;
};
export type GamesStatusSnapshotUpdateWithoutServerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    online?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    players?: Prisma.IntFieldUpdateOperationsInput | number;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesStatusSnapshotUncheckedUpdateWithoutServerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    online?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    players?: Prisma.IntFieldUpdateOperationsInput | number;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesStatusSnapshotUncheckedUpdateManyWithoutServerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    online?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    players?: Prisma.IntFieldUpdateOperationsInput | number;
    maxPlayers?: Prisma.IntFieldUpdateOperationsInput | number;
    at?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type GamesStatusSnapshotSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    serverId?: boolean;
    online?: boolean;
    players?: boolean;
    maxPlayers?: boolean;
    at?: boolean;
    server?: boolean | Prisma.GamesServerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["gamesStatusSnapshot"]>;
export type GamesStatusSnapshotSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    serverId?: boolean;
    online?: boolean;
    players?: boolean;
    maxPlayers?: boolean;
    at?: boolean;
    server?: boolean | Prisma.GamesServerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["gamesStatusSnapshot"]>;
export type GamesStatusSnapshotSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    serverId?: boolean;
    online?: boolean;
    players?: boolean;
    maxPlayers?: boolean;
    at?: boolean;
    server?: boolean | Prisma.GamesServerDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["gamesStatusSnapshot"]>;
export type GamesStatusSnapshotSelectScalar = {
    id?: boolean;
    serverId?: boolean;
    online?: boolean;
    players?: boolean;
    maxPlayers?: boolean;
    at?: boolean;
};
export type GamesStatusSnapshotOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "serverId" | "online" | "players" | "maxPlayers" | "at", ExtArgs["result"]["gamesStatusSnapshot"]>;
export type GamesStatusSnapshotInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    server?: boolean | Prisma.GamesServerDefaultArgs<ExtArgs>;
};
export type GamesStatusSnapshotIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    server?: boolean | Prisma.GamesServerDefaultArgs<ExtArgs>;
};
export type GamesStatusSnapshotIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    server?: boolean | Prisma.GamesServerDefaultArgs<ExtArgs>;
};
export type $GamesStatusSnapshotPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "GamesStatusSnapshot";
    objects: {
        server: Prisma.$GamesServerPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        serverId: string;
        online: boolean;
        players: number;
        maxPlayers: number;
        at: Date;
    }, ExtArgs["result"]["gamesStatusSnapshot"]>;
    composites: {};
};
export type GamesStatusSnapshotGetPayload<S extends boolean | null | undefined | GamesStatusSnapshotDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload, S>;
export type GamesStatusSnapshotCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<GamesStatusSnapshotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: GamesStatusSnapshotCountAggregateInputType | true;
};
export interface GamesStatusSnapshotDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['GamesStatusSnapshot'];
        meta: {
            name: 'GamesStatusSnapshot';
        };
    };
    /**
     * Find zero or one GamesStatusSnapshot that matches the filter.
     * @param {GamesStatusSnapshotFindUniqueArgs} args - Arguments to find a GamesStatusSnapshot
     * @example
     * // Get one GamesStatusSnapshot
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GamesStatusSnapshotFindUniqueArgs>(args: Prisma.SelectSubset<T, GamesStatusSnapshotFindUniqueArgs<ExtArgs>>): Prisma.Prisma__GamesStatusSnapshotClient<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one GamesStatusSnapshot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GamesStatusSnapshotFindUniqueOrThrowArgs} args - Arguments to find a GamesStatusSnapshot
     * @example
     * // Get one GamesStatusSnapshot
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GamesStatusSnapshotFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, GamesStatusSnapshotFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__GamesStatusSnapshotClient<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GamesStatusSnapshot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesStatusSnapshotFindFirstArgs} args - Arguments to find a GamesStatusSnapshot
     * @example
     * // Get one GamesStatusSnapshot
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GamesStatusSnapshotFindFirstArgs>(args?: Prisma.SelectSubset<T, GamesStatusSnapshotFindFirstArgs<ExtArgs>>): Prisma.Prisma__GamesStatusSnapshotClient<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first GamesStatusSnapshot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesStatusSnapshotFindFirstOrThrowArgs} args - Arguments to find a GamesStatusSnapshot
     * @example
     * // Get one GamesStatusSnapshot
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GamesStatusSnapshotFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, GamesStatusSnapshotFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__GamesStatusSnapshotClient<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more GamesStatusSnapshots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesStatusSnapshotFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GamesStatusSnapshots
     * const gamesStatusSnapshots = await prisma.gamesStatusSnapshot.findMany()
     *
     * // Get first 10 GamesStatusSnapshots
     * const gamesStatusSnapshots = await prisma.gamesStatusSnapshot.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const gamesStatusSnapshotWithIdOnly = await prisma.gamesStatusSnapshot.findMany({ select: { id: true } })
     *
     */
    findMany<T extends GamesStatusSnapshotFindManyArgs>(args?: Prisma.SelectSubset<T, GamesStatusSnapshotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a GamesStatusSnapshot.
     * @param {GamesStatusSnapshotCreateArgs} args - Arguments to create a GamesStatusSnapshot.
     * @example
     * // Create one GamesStatusSnapshot
     * const GamesStatusSnapshot = await prisma.gamesStatusSnapshot.create({
     *   data: {
     *     // ... data to create a GamesStatusSnapshot
     *   }
     * })
     *
     */
    create<T extends GamesStatusSnapshotCreateArgs>(args: Prisma.SelectSubset<T, GamesStatusSnapshotCreateArgs<ExtArgs>>): Prisma.Prisma__GamesStatusSnapshotClient<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many GamesStatusSnapshots.
     * @param {GamesStatusSnapshotCreateManyArgs} args - Arguments to create many GamesStatusSnapshots.
     * @example
     * // Create many GamesStatusSnapshots
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends GamesStatusSnapshotCreateManyArgs>(args?: Prisma.SelectSubset<T, GamesStatusSnapshotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many GamesStatusSnapshots and returns the data saved in the database.
     * @param {GamesStatusSnapshotCreateManyAndReturnArgs} args - Arguments to create many GamesStatusSnapshots.
     * @example
     * // Create many GamesStatusSnapshots
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many GamesStatusSnapshots and only return the `id`
     * const gamesStatusSnapshotWithIdOnly = await prisma.gamesStatusSnapshot.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends GamesStatusSnapshotCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, GamesStatusSnapshotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a GamesStatusSnapshot.
     * @param {GamesStatusSnapshotDeleteArgs} args - Arguments to delete one GamesStatusSnapshot.
     * @example
     * // Delete one GamesStatusSnapshot
     * const GamesStatusSnapshot = await prisma.gamesStatusSnapshot.delete({
     *   where: {
     *     // ... filter to delete one GamesStatusSnapshot
     *   }
     * })
     *
     */
    delete<T extends GamesStatusSnapshotDeleteArgs>(args: Prisma.SelectSubset<T, GamesStatusSnapshotDeleteArgs<ExtArgs>>): Prisma.Prisma__GamesStatusSnapshotClient<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one GamesStatusSnapshot.
     * @param {GamesStatusSnapshotUpdateArgs} args - Arguments to update one GamesStatusSnapshot.
     * @example
     * // Update one GamesStatusSnapshot
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends GamesStatusSnapshotUpdateArgs>(args: Prisma.SelectSubset<T, GamesStatusSnapshotUpdateArgs<ExtArgs>>): Prisma.Prisma__GamesStatusSnapshotClient<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more GamesStatusSnapshots.
     * @param {GamesStatusSnapshotDeleteManyArgs} args - Arguments to filter GamesStatusSnapshots to delete.
     * @example
     * // Delete a few GamesStatusSnapshots
     * const { count } = await prisma.gamesStatusSnapshot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends GamesStatusSnapshotDeleteManyArgs>(args?: Prisma.SelectSubset<T, GamesStatusSnapshotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GamesStatusSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesStatusSnapshotUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GamesStatusSnapshots
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends GamesStatusSnapshotUpdateManyArgs>(args: Prisma.SelectSubset<T, GamesStatusSnapshotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more GamesStatusSnapshots and returns the data updated in the database.
     * @param {GamesStatusSnapshotUpdateManyAndReturnArgs} args - Arguments to update many GamesStatusSnapshots.
     * @example
     * // Update many GamesStatusSnapshots
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more GamesStatusSnapshots and only return the `id`
     * const gamesStatusSnapshotWithIdOnly = await prisma.gamesStatusSnapshot.updateManyAndReturn({
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
    updateManyAndReturn<T extends GamesStatusSnapshotUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, GamesStatusSnapshotUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one GamesStatusSnapshot.
     * @param {GamesStatusSnapshotUpsertArgs} args - Arguments to update or create a GamesStatusSnapshot.
     * @example
     * // Update or create a GamesStatusSnapshot
     * const gamesStatusSnapshot = await prisma.gamesStatusSnapshot.upsert({
     *   create: {
     *     // ... data to create a GamesStatusSnapshot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GamesStatusSnapshot we want to update
     *   }
     * })
     */
    upsert<T extends GamesStatusSnapshotUpsertArgs>(args: Prisma.SelectSubset<T, GamesStatusSnapshotUpsertArgs<ExtArgs>>): Prisma.Prisma__GamesStatusSnapshotClient<runtime.Types.Result.GetResult<Prisma.$GamesStatusSnapshotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of GamesStatusSnapshots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesStatusSnapshotCountArgs} args - Arguments to filter GamesStatusSnapshots to count.
     * @example
     * // Count the number of GamesStatusSnapshots
     * const count = await prisma.gamesStatusSnapshot.count({
     *   where: {
     *     // ... the filter for the GamesStatusSnapshots we want to count
     *   }
     * })
    **/
    count<T extends GamesStatusSnapshotCountArgs>(args?: Prisma.Subset<T, GamesStatusSnapshotCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], GamesStatusSnapshotCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a GamesStatusSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesStatusSnapshotAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends GamesStatusSnapshotAggregateArgs>(args: Prisma.Subset<T, GamesStatusSnapshotAggregateArgs>): Prisma.PrismaPromise<GetGamesStatusSnapshotAggregateType<T>>;
    /**
     * Group by GamesStatusSnapshot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GamesStatusSnapshotGroupByArgs} args - Group by arguments.
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
    groupBy<T extends GamesStatusSnapshotGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: GamesStatusSnapshotGroupByArgs['orderBy'];
    } : {
        orderBy?: GamesStatusSnapshotGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, GamesStatusSnapshotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGamesStatusSnapshotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the GamesStatusSnapshot model
     */
    readonly fields: GamesStatusSnapshotFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for GamesStatusSnapshot.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__GamesStatusSnapshotClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    server<T extends Prisma.GamesServerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.GamesServerDefaultArgs<ExtArgs>>): Prisma.Prisma__GamesServerClient<runtime.Types.Result.GetResult<Prisma.$GamesServerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the GamesStatusSnapshot model
 */
export interface GamesStatusSnapshotFieldRefs {
    readonly id: Prisma.FieldRef<"GamesStatusSnapshot", 'String'>;
    readonly serverId: Prisma.FieldRef<"GamesStatusSnapshot", 'String'>;
    readonly online: Prisma.FieldRef<"GamesStatusSnapshot", 'Boolean'>;
    readonly players: Prisma.FieldRef<"GamesStatusSnapshot", 'Int'>;
    readonly maxPlayers: Prisma.FieldRef<"GamesStatusSnapshot", 'Int'>;
    readonly at: Prisma.FieldRef<"GamesStatusSnapshot", 'DateTime'>;
}
/**
 * GamesStatusSnapshot findUnique
 */
export type GamesStatusSnapshotFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * Filter, which GamesStatusSnapshot to fetch.
     */
    where: Prisma.GamesStatusSnapshotWhereUniqueInput;
};
/**
 * GamesStatusSnapshot findUniqueOrThrow
 */
export type GamesStatusSnapshotFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * Filter, which GamesStatusSnapshot to fetch.
     */
    where: Prisma.GamesStatusSnapshotWhereUniqueInput;
};
/**
 * GamesStatusSnapshot findFirst
 */
export type GamesStatusSnapshotFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * Filter, which GamesStatusSnapshot to fetch.
     */
    where?: Prisma.GamesStatusSnapshotWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GamesStatusSnapshots to fetch.
     */
    orderBy?: Prisma.GamesStatusSnapshotOrderByWithRelationInput | Prisma.GamesStatusSnapshotOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GamesStatusSnapshots.
     */
    cursor?: Prisma.GamesStatusSnapshotWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GamesStatusSnapshots from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GamesStatusSnapshots.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GamesStatusSnapshots.
     */
    distinct?: Prisma.GamesStatusSnapshotScalarFieldEnum | Prisma.GamesStatusSnapshotScalarFieldEnum[];
};
/**
 * GamesStatusSnapshot findFirstOrThrow
 */
export type GamesStatusSnapshotFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * Filter, which GamesStatusSnapshot to fetch.
     */
    where?: Prisma.GamesStatusSnapshotWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GamesStatusSnapshots to fetch.
     */
    orderBy?: Prisma.GamesStatusSnapshotOrderByWithRelationInput | Prisma.GamesStatusSnapshotOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for GamesStatusSnapshots.
     */
    cursor?: Prisma.GamesStatusSnapshotWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GamesStatusSnapshots from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GamesStatusSnapshots.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GamesStatusSnapshots.
     */
    distinct?: Prisma.GamesStatusSnapshotScalarFieldEnum | Prisma.GamesStatusSnapshotScalarFieldEnum[];
};
/**
 * GamesStatusSnapshot findMany
 */
export type GamesStatusSnapshotFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * Filter, which GamesStatusSnapshots to fetch.
     */
    where?: Prisma.GamesStatusSnapshotWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of GamesStatusSnapshots to fetch.
     */
    orderBy?: Prisma.GamesStatusSnapshotOrderByWithRelationInput | Prisma.GamesStatusSnapshotOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing GamesStatusSnapshots.
     */
    cursor?: Prisma.GamesStatusSnapshotWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` GamesStatusSnapshots from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` GamesStatusSnapshots.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of GamesStatusSnapshots.
     */
    distinct?: Prisma.GamesStatusSnapshotScalarFieldEnum | Prisma.GamesStatusSnapshotScalarFieldEnum[];
};
/**
 * GamesStatusSnapshot create
 */
export type GamesStatusSnapshotCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * The data needed to create a GamesStatusSnapshot.
     */
    data: Prisma.XOR<Prisma.GamesStatusSnapshotCreateInput, Prisma.GamesStatusSnapshotUncheckedCreateInput>;
};
/**
 * GamesStatusSnapshot createMany
 */
export type GamesStatusSnapshotCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many GamesStatusSnapshots.
     */
    data: Prisma.GamesStatusSnapshotCreateManyInput | Prisma.GamesStatusSnapshotCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * GamesStatusSnapshot createManyAndReturn
 */
export type GamesStatusSnapshotCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * The data used to create many GamesStatusSnapshots.
     */
    data: Prisma.GamesStatusSnapshotCreateManyInput | Prisma.GamesStatusSnapshotCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * GamesStatusSnapshot update
 */
export type GamesStatusSnapshotUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * The data needed to update a GamesStatusSnapshot.
     */
    data: Prisma.XOR<Prisma.GamesStatusSnapshotUpdateInput, Prisma.GamesStatusSnapshotUncheckedUpdateInput>;
    /**
     * Choose, which GamesStatusSnapshot to update.
     */
    where: Prisma.GamesStatusSnapshotWhereUniqueInput;
};
/**
 * GamesStatusSnapshot updateMany
 */
export type GamesStatusSnapshotUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update GamesStatusSnapshots.
     */
    data: Prisma.XOR<Prisma.GamesStatusSnapshotUpdateManyMutationInput, Prisma.GamesStatusSnapshotUncheckedUpdateManyInput>;
    /**
     * Filter which GamesStatusSnapshots to update
     */
    where?: Prisma.GamesStatusSnapshotWhereInput;
    /**
     * Limit how many GamesStatusSnapshots to update.
     */
    limit?: number;
};
/**
 * GamesStatusSnapshot updateManyAndReturn
 */
export type GamesStatusSnapshotUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * The data used to update GamesStatusSnapshots.
     */
    data: Prisma.XOR<Prisma.GamesStatusSnapshotUpdateManyMutationInput, Prisma.GamesStatusSnapshotUncheckedUpdateManyInput>;
    /**
     * Filter which GamesStatusSnapshots to update
     */
    where?: Prisma.GamesStatusSnapshotWhereInput;
    /**
     * Limit how many GamesStatusSnapshots to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * GamesStatusSnapshot upsert
 */
export type GamesStatusSnapshotUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * The filter to search for the GamesStatusSnapshot to update in case it exists.
     */
    where: Prisma.GamesStatusSnapshotWhereUniqueInput;
    /**
     * In case the GamesStatusSnapshot found by the `where` argument doesn't exist, create a new GamesStatusSnapshot with this data.
     */
    create: Prisma.XOR<Prisma.GamesStatusSnapshotCreateInput, Prisma.GamesStatusSnapshotUncheckedCreateInput>;
    /**
     * In case the GamesStatusSnapshot was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.GamesStatusSnapshotUpdateInput, Prisma.GamesStatusSnapshotUncheckedUpdateInput>;
};
/**
 * GamesStatusSnapshot delete
 */
export type GamesStatusSnapshotDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
    /**
     * Filter which GamesStatusSnapshot to delete.
     */
    where: Prisma.GamesStatusSnapshotWhereUniqueInput;
};
/**
 * GamesStatusSnapshot deleteMany
 */
export type GamesStatusSnapshotDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which GamesStatusSnapshots to delete
     */
    where?: Prisma.GamesStatusSnapshotWhereInput;
    /**
     * Limit how many GamesStatusSnapshots to delete.
     */
    limit?: number;
};
/**
 * GamesStatusSnapshot without action
 */
export type GamesStatusSnapshotDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GamesStatusSnapshot
     */
    select?: Prisma.GamesStatusSnapshotSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the GamesStatusSnapshot
     */
    omit?: Prisma.GamesStatusSnapshotOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.GamesStatusSnapshotInclude<ExtArgs> | null;
};
//# sourceMappingURL=GamesStatusSnapshot.d.ts.map
import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model MusicPlaylist
 *
 */
export type MusicPlaylistModel = runtime.Types.Result.DefaultSelection<Prisma.$MusicPlaylistPayload>;
export type AggregateMusicPlaylist = {
    _count: MusicPlaylistCountAggregateOutputType | null;
    _min: MusicPlaylistMinAggregateOutputType | null;
    _max: MusicPlaylistMaxAggregateOutputType | null;
};
export type MusicPlaylistMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    name: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MusicPlaylistMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    name: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MusicPlaylistCountAggregateOutputType = {
    id: number;
    guildId: number;
    name: number;
    description: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type MusicPlaylistMinAggregateInputType = {
    id?: true;
    guildId?: true;
    name?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MusicPlaylistMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    name?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MusicPlaylistCountAggregateInputType = {
    id?: true;
    guildId?: true;
    name?: true;
    description?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type MusicPlaylistAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MusicPlaylist to aggregate.
     */
    where?: Prisma.MusicPlaylistWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicPlaylists to fetch.
     */
    orderBy?: Prisma.MusicPlaylistOrderByWithRelationInput | Prisma.MusicPlaylistOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.MusicPlaylistWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicPlaylists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicPlaylists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned MusicPlaylists
    **/
    _count?: true | MusicPlaylistCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: MusicPlaylistMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: MusicPlaylistMaxAggregateInputType;
};
export type GetMusicPlaylistAggregateType<T extends MusicPlaylistAggregateArgs> = {
    [P in keyof T & keyof AggregateMusicPlaylist]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMusicPlaylist[P]> : Prisma.GetScalarType<T[P], AggregateMusicPlaylist[P]>;
};
export type MusicPlaylistGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MusicPlaylistWhereInput;
    orderBy?: Prisma.MusicPlaylistOrderByWithAggregationInput | Prisma.MusicPlaylistOrderByWithAggregationInput[];
    by: Prisma.MusicPlaylistScalarFieldEnum[] | Prisma.MusicPlaylistScalarFieldEnum;
    having?: Prisma.MusicPlaylistScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MusicPlaylistCountAggregateInputType | true;
    _min?: MusicPlaylistMinAggregateInputType;
    _max?: MusicPlaylistMaxAggregateInputType;
};
export type MusicPlaylistGroupByOutputType = {
    id: string;
    guildId: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: MusicPlaylistCountAggregateOutputType | null;
    _min: MusicPlaylistMinAggregateOutputType | null;
    _max: MusicPlaylistMaxAggregateOutputType | null;
};
export type GetMusicPlaylistGroupByPayload<T extends MusicPlaylistGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MusicPlaylistGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MusicPlaylistGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MusicPlaylistGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MusicPlaylistGroupByOutputType[P]>;
}>>;
export type MusicPlaylistWhereInput = {
    AND?: Prisma.MusicPlaylistWhereInput | Prisma.MusicPlaylistWhereInput[];
    OR?: Prisma.MusicPlaylistWhereInput[];
    NOT?: Prisma.MusicPlaylistWhereInput | Prisma.MusicPlaylistWhereInput[];
    id?: Prisma.UuidFilter<"MusicPlaylist"> | string;
    guildId?: Prisma.StringFilter<"MusicPlaylist"> | string;
    name?: Prisma.StringFilter<"MusicPlaylist"> | string;
    description?: Prisma.StringNullableFilter<"MusicPlaylist"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MusicPlaylist"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MusicPlaylist"> | Date | string;
    tracks?: Prisma.MusicPlaylistTrackListRelationFilter;
};
export type MusicPlaylistOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    tracks?: Prisma.MusicPlaylistTrackOrderByRelationAggregateInput;
};
export type MusicPlaylistWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.MusicPlaylistWhereInput | Prisma.MusicPlaylistWhereInput[];
    OR?: Prisma.MusicPlaylistWhereInput[];
    NOT?: Prisma.MusicPlaylistWhereInput | Prisma.MusicPlaylistWhereInput[];
    guildId?: Prisma.StringFilter<"MusicPlaylist"> | string;
    name?: Prisma.StringFilter<"MusicPlaylist"> | string;
    description?: Prisma.StringNullableFilter<"MusicPlaylist"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MusicPlaylist"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MusicPlaylist"> | Date | string;
    tracks?: Prisma.MusicPlaylistTrackListRelationFilter;
}, "id">;
export type MusicPlaylistOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.MusicPlaylistCountOrderByAggregateInput;
    _max?: Prisma.MusicPlaylistMaxOrderByAggregateInput;
    _min?: Prisma.MusicPlaylistMinOrderByAggregateInput;
};
export type MusicPlaylistScalarWhereWithAggregatesInput = {
    AND?: Prisma.MusicPlaylistScalarWhereWithAggregatesInput | Prisma.MusicPlaylistScalarWhereWithAggregatesInput[];
    OR?: Prisma.MusicPlaylistScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MusicPlaylistScalarWhereWithAggregatesInput | Prisma.MusicPlaylistScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"MusicPlaylist"> | string;
    guildId?: Prisma.StringWithAggregatesFilter<"MusicPlaylist"> | string;
    name?: Prisma.StringWithAggregatesFilter<"MusicPlaylist"> | string;
    description?: Prisma.StringNullableWithAggregatesFilter<"MusicPlaylist"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"MusicPlaylist"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"MusicPlaylist"> | Date | string;
};
export type MusicPlaylistCreateInput = {
    id?: string;
    guildId: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tracks?: Prisma.MusicPlaylistTrackCreateNestedManyWithoutPlaylistInput;
};
export type MusicPlaylistUncheckedCreateInput = {
    id?: string;
    guildId: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tracks?: Prisma.MusicPlaylistTrackUncheckedCreateNestedManyWithoutPlaylistInput;
};
export type MusicPlaylistUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tracks?: Prisma.MusicPlaylistTrackUpdateManyWithoutPlaylistNestedInput;
};
export type MusicPlaylistUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tracks?: Prisma.MusicPlaylistTrackUncheckedUpdateManyWithoutPlaylistNestedInput;
};
export type MusicPlaylistCreateManyInput = {
    id?: string;
    guildId: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MusicPlaylistUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MusicPlaylistUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MusicPlaylistCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MusicPlaylistMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MusicPlaylistMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MusicPlaylistScalarRelationFilter = {
    is?: Prisma.MusicPlaylistWhereInput;
    isNot?: Prisma.MusicPlaylistWhereInput;
};
export type MusicPlaylistCreateNestedOneWithoutTracksInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistCreateWithoutTracksInput, Prisma.MusicPlaylistUncheckedCreateWithoutTracksInput>;
    connectOrCreate?: Prisma.MusicPlaylistCreateOrConnectWithoutTracksInput;
    connect?: Prisma.MusicPlaylistWhereUniqueInput;
};
export type MusicPlaylistUpdateOneRequiredWithoutTracksNestedInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistCreateWithoutTracksInput, Prisma.MusicPlaylistUncheckedCreateWithoutTracksInput>;
    connectOrCreate?: Prisma.MusicPlaylistCreateOrConnectWithoutTracksInput;
    upsert?: Prisma.MusicPlaylistUpsertWithoutTracksInput;
    connect?: Prisma.MusicPlaylistWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MusicPlaylistUpdateToOneWithWhereWithoutTracksInput, Prisma.MusicPlaylistUpdateWithoutTracksInput>, Prisma.MusicPlaylistUncheckedUpdateWithoutTracksInput>;
};
export type MusicPlaylistCreateWithoutTracksInput = {
    id?: string;
    guildId: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MusicPlaylistUncheckedCreateWithoutTracksInput = {
    id?: string;
    guildId: string;
    name: string;
    description?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MusicPlaylistCreateOrConnectWithoutTracksInput = {
    where: Prisma.MusicPlaylistWhereUniqueInput;
    create: Prisma.XOR<Prisma.MusicPlaylistCreateWithoutTracksInput, Prisma.MusicPlaylistUncheckedCreateWithoutTracksInput>;
};
export type MusicPlaylistUpsertWithoutTracksInput = {
    update: Prisma.XOR<Prisma.MusicPlaylistUpdateWithoutTracksInput, Prisma.MusicPlaylistUncheckedUpdateWithoutTracksInput>;
    create: Prisma.XOR<Prisma.MusicPlaylistCreateWithoutTracksInput, Prisma.MusicPlaylistUncheckedCreateWithoutTracksInput>;
    where?: Prisma.MusicPlaylistWhereInput;
};
export type MusicPlaylistUpdateToOneWithWhereWithoutTracksInput = {
    where?: Prisma.MusicPlaylistWhereInput;
    data: Prisma.XOR<Prisma.MusicPlaylistUpdateWithoutTracksInput, Prisma.MusicPlaylistUncheckedUpdateWithoutTracksInput>;
};
export type MusicPlaylistUpdateWithoutTracksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MusicPlaylistUncheckedUpdateWithoutTracksInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type MusicPlaylistCountOutputType
 */
export type MusicPlaylistCountOutputType = {
    tracks: number;
};
export type MusicPlaylistCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tracks?: boolean | MusicPlaylistCountOutputTypeCountTracksArgs;
};
/**
 * MusicPlaylistCountOutputType without action
 */
export type MusicPlaylistCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylistCountOutputType
     */
    select?: Prisma.MusicPlaylistCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * MusicPlaylistCountOutputType without action
 */
export type MusicPlaylistCountOutputTypeCountTracksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MusicPlaylistTrackWhereInput;
};
export type MusicPlaylistSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    name?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tracks?: boolean | Prisma.MusicPlaylist$tracksArgs<ExtArgs>;
    _count?: boolean | Prisma.MusicPlaylistCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["musicPlaylist"]>;
export type MusicPlaylistSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    name?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["musicPlaylist"]>;
export type MusicPlaylistSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    name?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["musicPlaylist"]>;
export type MusicPlaylistSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    name?: boolean;
    description?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type MusicPlaylistOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "name" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["musicPlaylist"]>;
export type MusicPlaylistInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tracks?: boolean | Prisma.MusicPlaylist$tracksArgs<ExtArgs>;
    _count?: boolean | Prisma.MusicPlaylistCountOutputTypeDefaultArgs<ExtArgs>;
};
export type MusicPlaylistIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type MusicPlaylistIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $MusicPlaylistPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MusicPlaylist";
    objects: {
        tracks: Prisma.$MusicPlaylistTrackPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["musicPlaylist"]>;
    composites: {};
};
export type MusicPlaylistGetPayload<S extends boolean | null | undefined | MusicPlaylistDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload, S>;
export type MusicPlaylistCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MusicPlaylistFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MusicPlaylistCountAggregateInputType | true;
};
export interface MusicPlaylistDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MusicPlaylist'];
        meta: {
            name: 'MusicPlaylist';
        };
    };
    /**
     * Find zero or one MusicPlaylist that matches the filter.
     * @param {MusicPlaylistFindUniqueArgs} args - Arguments to find a MusicPlaylist
     * @example
     * // Get one MusicPlaylist
     * const musicPlaylist = await prisma.musicPlaylist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MusicPlaylistFindUniqueArgs>(args: Prisma.SelectSubset<T, MusicPlaylistFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one MusicPlaylist that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MusicPlaylistFindUniqueOrThrowArgs} args - Arguments to find a MusicPlaylist
     * @example
     * // Get one MusicPlaylist
     * const musicPlaylist = await prisma.musicPlaylist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MusicPlaylistFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MusicPlaylistFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MusicPlaylist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistFindFirstArgs} args - Arguments to find a MusicPlaylist
     * @example
     * // Get one MusicPlaylist
     * const musicPlaylist = await prisma.musicPlaylist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MusicPlaylistFindFirstArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistFindFirstArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MusicPlaylist that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistFindFirstOrThrowArgs} args - Arguments to find a MusicPlaylist
     * @example
     * // Get one MusicPlaylist
     * const musicPlaylist = await prisma.musicPlaylist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MusicPlaylistFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more MusicPlaylists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MusicPlaylists
     * const musicPlaylists = await prisma.musicPlaylist.findMany()
     *
     * // Get first 10 MusicPlaylists
     * const musicPlaylists = await prisma.musicPlaylist.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const musicPlaylistWithIdOnly = await prisma.musicPlaylist.findMany({ select: { id: true } })
     *
     */
    findMany<T extends MusicPlaylistFindManyArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a MusicPlaylist.
     * @param {MusicPlaylistCreateArgs} args - Arguments to create a MusicPlaylist.
     * @example
     * // Create one MusicPlaylist
     * const MusicPlaylist = await prisma.musicPlaylist.create({
     *   data: {
     *     // ... data to create a MusicPlaylist
     *   }
     * })
     *
     */
    create<T extends MusicPlaylistCreateArgs>(args: Prisma.SelectSubset<T, MusicPlaylistCreateArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many MusicPlaylists.
     * @param {MusicPlaylistCreateManyArgs} args - Arguments to create many MusicPlaylists.
     * @example
     * // Create many MusicPlaylists
     * const musicPlaylist = await prisma.musicPlaylist.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MusicPlaylistCreateManyArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many MusicPlaylists and returns the data saved in the database.
     * @param {MusicPlaylistCreateManyAndReturnArgs} args - Arguments to create many MusicPlaylists.
     * @example
     * // Create many MusicPlaylists
     * const musicPlaylist = await prisma.musicPlaylist.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many MusicPlaylists and only return the `id`
     * const musicPlaylistWithIdOnly = await prisma.musicPlaylist.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MusicPlaylistCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a MusicPlaylist.
     * @param {MusicPlaylistDeleteArgs} args - Arguments to delete one MusicPlaylist.
     * @example
     * // Delete one MusicPlaylist
     * const MusicPlaylist = await prisma.musicPlaylist.delete({
     *   where: {
     *     // ... filter to delete one MusicPlaylist
     *   }
     * })
     *
     */
    delete<T extends MusicPlaylistDeleteArgs>(args: Prisma.SelectSubset<T, MusicPlaylistDeleteArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one MusicPlaylist.
     * @param {MusicPlaylistUpdateArgs} args - Arguments to update one MusicPlaylist.
     * @example
     * // Update one MusicPlaylist
     * const musicPlaylist = await prisma.musicPlaylist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MusicPlaylistUpdateArgs>(args: Prisma.SelectSubset<T, MusicPlaylistUpdateArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more MusicPlaylists.
     * @param {MusicPlaylistDeleteManyArgs} args - Arguments to filter MusicPlaylists to delete.
     * @example
     * // Delete a few MusicPlaylists
     * const { count } = await prisma.musicPlaylist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MusicPlaylistDeleteManyArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MusicPlaylists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MusicPlaylists
     * const musicPlaylist = await prisma.musicPlaylist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MusicPlaylistUpdateManyArgs>(args: Prisma.SelectSubset<T, MusicPlaylistUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MusicPlaylists and returns the data updated in the database.
     * @param {MusicPlaylistUpdateManyAndReturnArgs} args - Arguments to update many MusicPlaylists.
     * @example
     * // Update many MusicPlaylists
     * const musicPlaylist = await prisma.musicPlaylist.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more MusicPlaylists and only return the `id`
     * const musicPlaylistWithIdOnly = await prisma.musicPlaylist.updateManyAndReturn({
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
    updateManyAndReturn<T extends MusicPlaylistUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MusicPlaylistUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one MusicPlaylist.
     * @param {MusicPlaylistUpsertArgs} args - Arguments to update or create a MusicPlaylist.
     * @example
     * // Update or create a MusicPlaylist
     * const musicPlaylist = await prisma.musicPlaylist.upsert({
     *   create: {
     *     // ... data to create a MusicPlaylist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MusicPlaylist we want to update
     *   }
     * })
     */
    upsert<T extends MusicPlaylistUpsertArgs>(args: Prisma.SelectSubset<T, MusicPlaylistUpsertArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of MusicPlaylists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistCountArgs} args - Arguments to filter MusicPlaylists to count.
     * @example
     * // Count the number of MusicPlaylists
     * const count = await prisma.musicPlaylist.count({
     *   where: {
     *     // ... the filter for the MusicPlaylists we want to count
     *   }
     * })
    **/
    count<T extends MusicPlaylistCountArgs>(args?: Prisma.Subset<T, MusicPlaylistCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MusicPlaylistCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a MusicPlaylist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MusicPlaylistAggregateArgs>(args: Prisma.Subset<T, MusicPlaylistAggregateArgs>): Prisma.PrismaPromise<GetMusicPlaylistAggregateType<T>>;
    /**
     * Group by MusicPlaylist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistGroupByArgs} args - Group by arguments.
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
    groupBy<T extends MusicPlaylistGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MusicPlaylistGroupByArgs['orderBy'];
    } : {
        orderBy?: MusicPlaylistGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MusicPlaylistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMusicPlaylistGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the MusicPlaylist model
     */
    readonly fields: MusicPlaylistFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for MusicPlaylist.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__MusicPlaylistClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    tracks<T extends Prisma.MusicPlaylist$tracksArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MusicPlaylist$tracksArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the MusicPlaylist model
 */
export interface MusicPlaylistFieldRefs {
    readonly id: Prisma.FieldRef<"MusicPlaylist", 'String'>;
    readonly guildId: Prisma.FieldRef<"MusicPlaylist", 'String'>;
    readonly name: Prisma.FieldRef<"MusicPlaylist", 'String'>;
    readonly description: Prisma.FieldRef<"MusicPlaylist", 'String'>;
    readonly createdAt: Prisma.FieldRef<"MusicPlaylist", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"MusicPlaylist", 'DateTime'>;
}
/**
 * MusicPlaylist findUnique
 */
export type MusicPlaylistFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * Filter, which MusicPlaylist to fetch.
     */
    where: Prisma.MusicPlaylistWhereUniqueInput;
};
/**
 * MusicPlaylist findUniqueOrThrow
 */
export type MusicPlaylistFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * Filter, which MusicPlaylist to fetch.
     */
    where: Prisma.MusicPlaylistWhereUniqueInput;
};
/**
 * MusicPlaylist findFirst
 */
export type MusicPlaylistFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * Filter, which MusicPlaylist to fetch.
     */
    where?: Prisma.MusicPlaylistWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicPlaylists to fetch.
     */
    orderBy?: Prisma.MusicPlaylistOrderByWithRelationInput | Prisma.MusicPlaylistOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MusicPlaylists.
     */
    cursor?: Prisma.MusicPlaylistWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicPlaylists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicPlaylists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicPlaylists.
     */
    distinct?: Prisma.MusicPlaylistScalarFieldEnum | Prisma.MusicPlaylistScalarFieldEnum[];
};
/**
 * MusicPlaylist findFirstOrThrow
 */
export type MusicPlaylistFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * Filter, which MusicPlaylist to fetch.
     */
    where?: Prisma.MusicPlaylistWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicPlaylists to fetch.
     */
    orderBy?: Prisma.MusicPlaylistOrderByWithRelationInput | Prisma.MusicPlaylistOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MusicPlaylists.
     */
    cursor?: Prisma.MusicPlaylistWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicPlaylists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicPlaylists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicPlaylists.
     */
    distinct?: Prisma.MusicPlaylistScalarFieldEnum | Prisma.MusicPlaylistScalarFieldEnum[];
};
/**
 * MusicPlaylist findMany
 */
export type MusicPlaylistFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * Filter, which MusicPlaylists to fetch.
     */
    where?: Prisma.MusicPlaylistWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicPlaylists to fetch.
     */
    orderBy?: Prisma.MusicPlaylistOrderByWithRelationInput | Prisma.MusicPlaylistOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing MusicPlaylists.
     */
    cursor?: Prisma.MusicPlaylistWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicPlaylists from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicPlaylists.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicPlaylists.
     */
    distinct?: Prisma.MusicPlaylistScalarFieldEnum | Prisma.MusicPlaylistScalarFieldEnum[];
};
/**
 * MusicPlaylist create
 */
export type MusicPlaylistCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * The data needed to create a MusicPlaylist.
     */
    data: Prisma.XOR<Prisma.MusicPlaylistCreateInput, Prisma.MusicPlaylistUncheckedCreateInput>;
};
/**
 * MusicPlaylist createMany
 */
export type MusicPlaylistCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many MusicPlaylists.
     */
    data: Prisma.MusicPlaylistCreateManyInput | Prisma.MusicPlaylistCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MusicPlaylist createManyAndReturn
 */
export type MusicPlaylistCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * The data used to create many MusicPlaylists.
     */
    data: Prisma.MusicPlaylistCreateManyInput | Prisma.MusicPlaylistCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MusicPlaylist update
 */
export type MusicPlaylistUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * The data needed to update a MusicPlaylist.
     */
    data: Prisma.XOR<Prisma.MusicPlaylistUpdateInput, Prisma.MusicPlaylistUncheckedUpdateInput>;
    /**
     * Choose, which MusicPlaylist to update.
     */
    where: Prisma.MusicPlaylistWhereUniqueInput;
};
/**
 * MusicPlaylist updateMany
 */
export type MusicPlaylistUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update MusicPlaylists.
     */
    data: Prisma.XOR<Prisma.MusicPlaylistUpdateManyMutationInput, Prisma.MusicPlaylistUncheckedUpdateManyInput>;
    /**
     * Filter which MusicPlaylists to update
     */
    where?: Prisma.MusicPlaylistWhereInput;
    /**
     * Limit how many MusicPlaylists to update.
     */
    limit?: number;
};
/**
 * MusicPlaylist updateManyAndReturn
 */
export type MusicPlaylistUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * The data used to update MusicPlaylists.
     */
    data: Prisma.XOR<Prisma.MusicPlaylistUpdateManyMutationInput, Prisma.MusicPlaylistUncheckedUpdateManyInput>;
    /**
     * Filter which MusicPlaylists to update
     */
    where?: Prisma.MusicPlaylistWhereInput;
    /**
     * Limit how many MusicPlaylists to update.
     */
    limit?: number;
};
/**
 * MusicPlaylist upsert
 */
export type MusicPlaylistUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * The filter to search for the MusicPlaylist to update in case it exists.
     */
    where: Prisma.MusicPlaylistWhereUniqueInput;
    /**
     * In case the MusicPlaylist found by the `where` argument doesn't exist, create a new MusicPlaylist with this data.
     */
    create: Prisma.XOR<Prisma.MusicPlaylistCreateInput, Prisma.MusicPlaylistUncheckedCreateInput>;
    /**
     * In case the MusicPlaylist was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.MusicPlaylistUpdateInput, Prisma.MusicPlaylistUncheckedUpdateInput>;
};
/**
 * MusicPlaylist delete
 */
export type MusicPlaylistDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
    /**
     * Filter which MusicPlaylist to delete.
     */
    where: Prisma.MusicPlaylistWhereUniqueInput;
};
/**
 * MusicPlaylist deleteMany
 */
export type MusicPlaylistDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MusicPlaylists to delete
     */
    where?: Prisma.MusicPlaylistWhereInput;
    /**
     * Limit how many MusicPlaylists to delete.
     */
    limit?: number;
};
/**
 * MusicPlaylist.tracks
 */
export type MusicPlaylist$tracksArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylistTrack
     */
    select?: Prisma.MusicPlaylistTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylistTrack
     */
    omit?: Prisma.MusicPlaylistTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistTrackInclude<ExtArgs> | null;
    where?: Prisma.MusicPlaylistTrackWhereInput;
    orderBy?: Prisma.MusicPlaylistTrackOrderByWithRelationInput | Prisma.MusicPlaylistTrackOrderByWithRelationInput[];
    cursor?: Prisma.MusicPlaylistTrackWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.MusicPlaylistTrackScalarFieldEnum | Prisma.MusicPlaylistTrackScalarFieldEnum[];
};
/**
 * MusicPlaylist without action
 */
export type MusicPlaylistDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylist
     */
    select?: Prisma.MusicPlaylistSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylist
     */
    omit?: Prisma.MusicPlaylistOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistInclude<ExtArgs> | null;
};
//# sourceMappingURL=MusicPlaylist.d.ts.map
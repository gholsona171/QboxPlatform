import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model MusicPlaylistTrack
 *
 */
export type MusicPlaylistTrackModel = runtime.Types.Result.DefaultSelection<Prisma.$MusicPlaylistTrackPayload>;
export type AggregateMusicPlaylistTrack = {
    _count: MusicPlaylistTrackCountAggregateOutputType | null;
    _avg: MusicPlaylistTrackAvgAggregateOutputType | null;
    _sum: MusicPlaylistTrackSumAggregateOutputType | null;
    _min: MusicPlaylistTrackMinAggregateOutputType | null;
    _max: MusicPlaylistTrackMaxAggregateOutputType | null;
};
export type MusicPlaylistTrackAvgAggregateOutputType = {
    position: number | null;
};
export type MusicPlaylistTrackSumAggregateOutputType = {
    position: number | null;
};
export type MusicPlaylistTrackMinAggregateOutputType = {
    playlistId: string | null;
    position: number | null;
    trackId: string | null;
};
export type MusicPlaylistTrackMaxAggregateOutputType = {
    playlistId: string | null;
    position: number | null;
    trackId: string | null;
};
export type MusicPlaylistTrackCountAggregateOutputType = {
    playlistId: number;
    position: number;
    trackId: number;
    _all: number;
};
export type MusicPlaylistTrackAvgAggregateInputType = {
    position?: true;
};
export type MusicPlaylistTrackSumAggregateInputType = {
    position?: true;
};
export type MusicPlaylistTrackMinAggregateInputType = {
    playlistId?: true;
    position?: true;
    trackId?: true;
};
export type MusicPlaylistTrackMaxAggregateInputType = {
    playlistId?: true;
    position?: true;
    trackId?: true;
};
export type MusicPlaylistTrackCountAggregateInputType = {
    playlistId?: true;
    position?: true;
    trackId?: true;
    _all?: true;
};
export type MusicPlaylistTrackAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MusicPlaylistTrack to aggregate.
     */
    where?: Prisma.MusicPlaylistTrackWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicPlaylistTracks to fetch.
     */
    orderBy?: Prisma.MusicPlaylistTrackOrderByWithRelationInput | Prisma.MusicPlaylistTrackOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.MusicPlaylistTrackWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicPlaylistTracks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicPlaylistTracks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned MusicPlaylistTracks
    **/
    _count?: true | MusicPlaylistTrackCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: MusicPlaylistTrackAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: MusicPlaylistTrackSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: MusicPlaylistTrackMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: MusicPlaylistTrackMaxAggregateInputType;
};
export type GetMusicPlaylistTrackAggregateType<T extends MusicPlaylistTrackAggregateArgs> = {
    [P in keyof T & keyof AggregateMusicPlaylistTrack]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMusicPlaylistTrack[P]> : Prisma.GetScalarType<T[P], AggregateMusicPlaylistTrack[P]>;
};
export type MusicPlaylistTrackGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MusicPlaylistTrackWhereInput;
    orderBy?: Prisma.MusicPlaylistTrackOrderByWithAggregationInput | Prisma.MusicPlaylistTrackOrderByWithAggregationInput[];
    by: Prisma.MusicPlaylistTrackScalarFieldEnum[] | Prisma.MusicPlaylistTrackScalarFieldEnum;
    having?: Prisma.MusicPlaylistTrackScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MusicPlaylistTrackCountAggregateInputType | true;
    _avg?: MusicPlaylistTrackAvgAggregateInputType;
    _sum?: MusicPlaylistTrackSumAggregateInputType;
    _min?: MusicPlaylistTrackMinAggregateInputType;
    _max?: MusicPlaylistTrackMaxAggregateInputType;
};
export type MusicPlaylistTrackGroupByOutputType = {
    playlistId: string;
    position: number;
    trackId: string;
    _count: MusicPlaylistTrackCountAggregateOutputType | null;
    _avg: MusicPlaylistTrackAvgAggregateOutputType | null;
    _sum: MusicPlaylistTrackSumAggregateOutputType | null;
    _min: MusicPlaylistTrackMinAggregateOutputType | null;
    _max: MusicPlaylistTrackMaxAggregateOutputType | null;
};
export type GetMusicPlaylistTrackGroupByPayload<T extends MusicPlaylistTrackGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MusicPlaylistTrackGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MusicPlaylistTrackGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MusicPlaylistTrackGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MusicPlaylistTrackGroupByOutputType[P]>;
}>>;
export type MusicPlaylistTrackWhereInput = {
    AND?: Prisma.MusicPlaylistTrackWhereInput | Prisma.MusicPlaylistTrackWhereInput[];
    OR?: Prisma.MusicPlaylistTrackWhereInput[];
    NOT?: Prisma.MusicPlaylistTrackWhereInput | Prisma.MusicPlaylistTrackWhereInput[];
    playlistId?: Prisma.UuidFilter<"MusicPlaylistTrack"> | string;
    position?: Prisma.IntFilter<"MusicPlaylistTrack"> | number;
    trackId?: Prisma.UuidFilter<"MusicPlaylistTrack"> | string;
    playlist?: Prisma.XOR<Prisma.MusicPlaylistScalarRelationFilter, Prisma.MusicPlaylistWhereInput>;
    track?: Prisma.XOR<Prisma.MusicTrackScalarRelationFilter, Prisma.MusicTrackWhereInput>;
};
export type MusicPlaylistTrackOrderByWithRelationInput = {
    playlistId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    trackId?: Prisma.SortOrder;
    playlist?: Prisma.MusicPlaylistOrderByWithRelationInput;
    track?: Prisma.MusicTrackOrderByWithRelationInput;
};
export type MusicPlaylistTrackWhereUniqueInput = Prisma.AtLeast<{
    playlistId_position?: Prisma.MusicPlaylistTrackPlaylistIdPositionCompoundUniqueInput;
    AND?: Prisma.MusicPlaylistTrackWhereInput | Prisma.MusicPlaylistTrackWhereInput[];
    OR?: Prisma.MusicPlaylistTrackWhereInput[];
    NOT?: Prisma.MusicPlaylistTrackWhereInput | Prisma.MusicPlaylistTrackWhereInput[];
    playlistId?: Prisma.UuidFilter<"MusicPlaylistTrack"> | string;
    position?: Prisma.IntFilter<"MusicPlaylistTrack"> | number;
    trackId?: Prisma.UuidFilter<"MusicPlaylistTrack"> | string;
    playlist?: Prisma.XOR<Prisma.MusicPlaylistScalarRelationFilter, Prisma.MusicPlaylistWhereInput>;
    track?: Prisma.XOR<Prisma.MusicTrackScalarRelationFilter, Prisma.MusicTrackWhereInput>;
}, "playlistId_position">;
export type MusicPlaylistTrackOrderByWithAggregationInput = {
    playlistId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    trackId?: Prisma.SortOrder;
    _count?: Prisma.MusicPlaylistTrackCountOrderByAggregateInput;
    _avg?: Prisma.MusicPlaylistTrackAvgOrderByAggregateInput;
    _max?: Prisma.MusicPlaylistTrackMaxOrderByAggregateInput;
    _min?: Prisma.MusicPlaylistTrackMinOrderByAggregateInput;
    _sum?: Prisma.MusicPlaylistTrackSumOrderByAggregateInput;
};
export type MusicPlaylistTrackScalarWhereWithAggregatesInput = {
    AND?: Prisma.MusicPlaylistTrackScalarWhereWithAggregatesInput | Prisma.MusicPlaylistTrackScalarWhereWithAggregatesInput[];
    OR?: Prisma.MusicPlaylistTrackScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MusicPlaylistTrackScalarWhereWithAggregatesInput | Prisma.MusicPlaylistTrackScalarWhereWithAggregatesInput[];
    playlistId?: Prisma.UuidWithAggregatesFilter<"MusicPlaylistTrack"> | string;
    position?: Prisma.IntWithAggregatesFilter<"MusicPlaylistTrack"> | number;
    trackId?: Prisma.UuidWithAggregatesFilter<"MusicPlaylistTrack"> | string;
};
export type MusicPlaylistTrackCreateInput = {
    position: number;
    playlist: Prisma.MusicPlaylistCreateNestedOneWithoutTracksInput;
    track: Prisma.MusicTrackCreateNestedOneWithoutPlaylistsInput;
};
export type MusicPlaylistTrackUncheckedCreateInput = {
    playlistId: string;
    position: number;
    trackId: string;
};
export type MusicPlaylistTrackUpdateInput = {
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    playlist?: Prisma.MusicPlaylistUpdateOneRequiredWithoutTracksNestedInput;
    track?: Prisma.MusicTrackUpdateOneRequiredWithoutPlaylistsNestedInput;
};
export type MusicPlaylistTrackUncheckedUpdateInput = {
    playlistId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    trackId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MusicPlaylistTrackCreateManyInput = {
    playlistId: string;
    position: number;
    trackId: string;
};
export type MusicPlaylistTrackUpdateManyMutationInput = {
    position?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type MusicPlaylistTrackUncheckedUpdateManyInput = {
    playlistId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    trackId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MusicPlaylistTrackListRelationFilter = {
    every?: Prisma.MusicPlaylistTrackWhereInput;
    some?: Prisma.MusicPlaylistTrackWhereInput;
    none?: Prisma.MusicPlaylistTrackWhereInput;
};
export type MusicPlaylistTrackOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type MusicPlaylistTrackPlaylistIdPositionCompoundUniqueInput = {
    playlistId: string;
    position: number;
};
export type MusicPlaylistTrackCountOrderByAggregateInput = {
    playlistId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    trackId?: Prisma.SortOrder;
};
export type MusicPlaylistTrackAvgOrderByAggregateInput = {
    position?: Prisma.SortOrder;
};
export type MusicPlaylistTrackMaxOrderByAggregateInput = {
    playlistId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    trackId?: Prisma.SortOrder;
};
export type MusicPlaylistTrackMinOrderByAggregateInput = {
    playlistId?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    trackId?: Prisma.SortOrder;
};
export type MusicPlaylistTrackSumOrderByAggregateInput = {
    position?: Prisma.SortOrder;
};
export type MusicPlaylistTrackCreateNestedManyWithoutTrackInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutTrackInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput> | Prisma.MusicPlaylistTrackCreateWithoutTrackInput[] | Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput[];
    connectOrCreate?: Prisma.MusicPlaylistTrackCreateOrConnectWithoutTrackInput | Prisma.MusicPlaylistTrackCreateOrConnectWithoutTrackInput[];
    createMany?: Prisma.MusicPlaylistTrackCreateManyTrackInputEnvelope;
    connect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
};
export type MusicPlaylistTrackUncheckedCreateNestedManyWithoutTrackInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutTrackInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput> | Prisma.MusicPlaylistTrackCreateWithoutTrackInput[] | Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput[];
    connectOrCreate?: Prisma.MusicPlaylistTrackCreateOrConnectWithoutTrackInput | Prisma.MusicPlaylistTrackCreateOrConnectWithoutTrackInput[];
    createMany?: Prisma.MusicPlaylistTrackCreateManyTrackInputEnvelope;
    connect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
};
export type MusicPlaylistTrackUpdateManyWithoutTrackNestedInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutTrackInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput> | Prisma.MusicPlaylistTrackCreateWithoutTrackInput[] | Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput[];
    connectOrCreate?: Prisma.MusicPlaylistTrackCreateOrConnectWithoutTrackInput | Prisma.MusicPlaylistTrackCreateOrConnectWithoutTrackInput[];
    upsert?: Prisma.MusicPlaylistTrackUpsertWithWhereUniqueWithoutTrackInput | Prisma.MusicPlaylistTrackUpsertWithWhereUniqueWithoutTrackInput[];
    createMany?: Prisma.MusicPlaylistTrackCreateManyTrackInputEnvelope;
    set?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    disconnect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    delete?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    connect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    update?: Prisma.MusicPlaylistTrackUpdateWithWhereUniqueWithoutTrackInput | Prisma.MusicPlaylistTrackUpdateWithWhereUniqueWithoutTrackInput[];
    updateMany?: Prisma.MusicPlaylistTrackUpdateManyWithWhereWithoutTrackInput | Prisma.MusicPlaylistTrackUpdateManyWithWhereWithoutTrackInput[];
    deleteMany?: Prisma.MusicPlaylistTrackScalarWhereInput | Prisma.MusicPlaylistTrackScalarWhereInput[];
};
export type MusicPlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutTrackInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput> | Prisma.MusicPlaylistTrackCreateWithoutTrackInput[] | Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput[];
    connectOrCreate?: Prisma.MusicPlaylistTrackCreateOrConnectWithoutTrackInput | Prisma.MusicPlaylistTrackCreateOrConnectWithoutTrackInput[];
    upsert?: Prisma.MusicPlaylistTrackUpsertWithWhereUniqueWithoutTrackInput | Prisma.MusicPlaylistTrackUpsertWithWhereUniqueWithoutTrackInput[];
    createMany?: Prisma.MusicPlaylistTrackCreateManyTrackInputEnvelope;
    set?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    disconnect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    delete?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    connect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    update?: Prisma.MusicPlaylistTrackUpdateWithWhereUniqueWithoutTrackInput | Prisma.MusicPlaylistTrackUpdateWithWhereUniqueWithoutTrackInput[];
    updateMany?: Prisma.MusicPlaylistTrackUpdateManyWithWhereWithoutTrackInput | Prisma.MusicPlaylistTrackUpdateManyWithWhereWithoutTrackInput[];
    deleteMany?: Prisma.MusicPlaylistTrackScalarWhereInput | Prisma.MusicPlaylistTrackScalarWhereInput[];
};
export type MusicPlaylistTrackCreateNestedManyWithoutPlaylistInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput> | Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput[] | Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput[];
    connectOrCreate?: Prisma.MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput | Prisma.MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput[];
    createMany?: Prisma.MusicPlaylistTrackCreateManyPlaylistInputEnvelope;
    connect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
};
export type MusicPlaylistTrackUncheckedCreateNestedManyWithoutPlaylistInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput> | Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput[] | Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput[];
    connectOrCreate?: Prisma.MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput | Prisma.MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput[];
    createMany?: Prisma.MusicPlaylistTrackCreateManyPlaylistInputEnvelope;
    connect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
};
export type MusicPlaylistTrackUpdateManyWithoutPlaylistNestedInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput> | Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput[] | Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput[];
    connectOrCreate?: Prisma.MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput | Prisma.MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput[];
    upsert?: Prisma.MusicPlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput | Prisma.MusicPlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput[];
    createMany?: Prisma.MusicPlaylistTrackCreateManyPlaylistInputEnvelope;
    set?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    disconnect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    delete?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    connect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    update?: Prisma.MusicPlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput | Prisma.MusicPlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput[];
    updateMany?: Prisma.MusicPlaylistTrackUpdateManyWithWhereWithoutPlaylistInput | Prisma.MusicPlaylistTrackUpdateManyWithWhereWithoutPlaylistInput[];
    deleteMany?: Prisma.MusicPlaylistTrackScalarWhereInput | Prisma.MusicPlaylistTrackScalarWhereInput[];
};
export type MusicPlaylistTrackUncheckedUpdateManyWithoutPlaylistNestedInput = {
    create?: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput> | Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput[] | Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput[];
    connectOrCreate?: Prisma.MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput | Prisma.MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput[];
    upsert?: Prisma.MusicPlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput | Prisma.MusicPlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput[];
    createMany?: Prisma.MusicPlaylistTrackCreateManyPlaylistInputEnvelope;
    set?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    disconnect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    delete?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    connect?: Prisma.MusicPlaylistTrackWhereUniqueInput | Prisma.MusicPlaylistTrackWhereUniqueInput[];
    update?: Prisma.MusicPlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput | Prisma.MusicPlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput[];
    updateMany?: Prisma.MusicPlaylistTrackUpdateManyWithWhereWithoutPlaylistInput | Prisma.MusicPlaylistTrackUpdateManyWithWhereWithoutPlaylistInput[];
    deleteMany?: Prisma.MusicPlaylistTrackScalarWhereInput | Prisma.MusicPlaylistTrackScalarWhereInput[];
};
export type MusicPlaylistTrackCreateWithoutTrackInput = {
    position: number;
    playlist: Prisma.MusicPlaylistCreateNestedOneWithoutTracksInput;
};
export type MusicPlaylistTrackUncheckedCreateWithoutTrackInput = {
    playlistId: string;
    position: number;
};
export type MusicPlaylistTrackCreateOrConnectWithoutTrackInput = {
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
    create: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutTrackInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput>;
};
export type MusicPlaylistTrackCreateManyTrackInputEnvelope = {
    data: Prisma.MusicPlaylistTrackCreateManyTrackInput | Prisma.MusicPlaylistTrackCreateManyTrackInput[];
    skipDuplicates?: boolean;
};
export type MusicPlaylistTrackUpsertWithWhereUniqueWithoutTrackInput = {
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
    update: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateWithoutTrackInput, Prisma.MusicPlaylistTrackUncheckedUpdateWithoutTrackInput>;
    create: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutTrackInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutTrackInput>;
};
export type MusicPlaylistTrackUpdateWithWhereUniqueWithoutTrackInput = {
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
    data: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateWithoutTrackInput, Prisma.MusicPlaylistTrackUncheckedUpdateWithoutTrackInput>;
};
export type MusicPlaylistTrackUpdateManyWithWhereWithoutTrackInput = {
    where: Prisma.MusicPlaylistTrackScalarWhereInput;
    data: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateManyMutationInput, Prisma.MusicPlaylistTrackUncheckedUpdateManyWithoutTrackInput>;
};
export type MusicPlaylistTrackScalarWhereInput = {
    AND?: Prisma.MusicPlaylistTrackScalarWhereInput | Prisma.MusicPlaylistTrackScalarWhereInput[];
    OR?: Prisma.MusicPlaylistTrackScalarWhereInput[];
    NOT?: Prisma.MusicPlaylistTrackScalarWhereInput | Prisma.MusicPlaylistTrackScalarWhereInput[];
    playlistId?: Prisma.UuidFilter<"MusicPlaylistTrack"> | string;
    position?: Prisma.IntFilter<"MusicPlaylistTrack"> | number;
    trackId?: Prisma.UuidFilter<"MusicPlaylistTrack"> | string;
};
export type MusicPlaylistTrackCreateWithoutPlaylistInput = {
    position: number;
    track: Prisma.MusicTrackCreateNestedOneWithoutPlaylistsInput;
};
export type MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput = {
    position: number;
    trackId: string;
};
export type MusicPlaylistTrackCreateOrConnectWithoutPlaylistInput = {
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
    create: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput>;
};
export type MusicPlaylistTrackCreateManyPlaylistInputEnvelope = {
    data: Prisma.MusicPlaylistTrackCreateManyPlaylistInput | Prisma.MusicPlaylistTrackCreateManyPlaylistInput[];
    skipDuplicates?: boolean;
};
export type MusicPlaylistTrackUpsertWithWhereUniqueWithoutPlaylistInput = {
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
    update: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateWithoutPlaylistInput, Prisma.MusicPlaylistTrackUncheckedUpdateWithoutPlaylistInput>;
    create: Prisma.XOR<Prisma.MusicPlaylistTrackCreateWithoutPlaylistInput, Prisma.MusicPlaylistTrackUncheckedCreateWithoutPlaylistInput>;
};
export type MusicPlaylistTrackUpdateWithWhereUniqueWithoutPlaylistInput = {
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
    data: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateWithoutPlaylistInput, Prisma.MusicPlaylistTrackUncheckedUpdateWithoutPlaylistInput>;
};
export type MusicPlaylistTrackUpdateManyWithWhereWithoutPlaylistInput = {
    where: Prisma.MusicPlaylistTrackScalarWhereInput;
    data: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateManyMutationInput, Prisma.MusicPlaylistTrackUncheckedUpdateManyWithoutPlaylistInput>;
};
export type MusicPlaylistTrackCreateManyTrackInput = {
    playlistId: string;
    position: number;
};
export type MusicPlaylistTrackUpdateWithoutTrackInput = {
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    playlist?: Prisma.MusicPlaylistUpdateOneRequiredWithoutTracksNestedInput;
};
export type MusicPlaylistTrackUncheckedUpdateWithoutTrackInput = {
    playlistId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type MusicPlaylistTrackUncheckedUpdateManyWithoutTrackInput = {
    playlistId?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type MusicPlaylistTrackCreateManyPlaylistInput = {
    position: number;
    trackId: string;
};
export type MusicPlaylistTrackUpdateWithoutPlaylistInput = {
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    track?: Prisma.MusicTrackUpdateOneRequiredWithoutPlaylistsNestedInput;
};
export type MusicPlaylistTrackUncheckedUpdateWithoutPlaylistInput = {
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    trackId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MusicPlaylistTrackUncheckedUpdateManyWithoutPlaylistInput = {
    position?: Prisma.IntFieldUpdateOperationsInput | number;
    trackId?: Prisma.StringFieldUpdateOperationsInput | string;
};
export type MusicPlaylistTrackSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    playlistId?: boolean;
    position?: boolean;
    trackId?: boolean;
    playlist?: boolean | Prisma.MusicPlaylistDefaultArgs<ExtArgs>;
    track?: boolean | Prisma.MusicTrackDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["musicPlaylistTrack"]>;
export type MusicPlaylistTrackSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    playlistId?: boolean;
    position?: boolean;
    trackId?: boolean;
    playlist?: boolean | Prisma.MusicPlaylistDefaultArgs<ExtArgs>;
    track?: boolean | Prisma.MusicTrackDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["musicPlaylistTrack"]>;
export type MusicPlaylistTrackSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    playlistId?: boolean;
    position?: boolean;
    trackId?: boolean;
    playlist?: boolean | Prisma.MusicPlaylistDefaultArgs<ExtArgs>;
    track?: boolean | Prisma.MusicTrackDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["musicPlaylistTrack"]>;
export type MusicPlaylistTrackSelectScalar = {
    playlistId?: boolean;
    position?: boolean;
    trackId?: boolean;
};
export type MusicPlaylistTrackOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"playlistId" | "position" | "trackId", ExtArgs["result"]["musicPlaylistTrack"]>;
export type MusicPlaylistTrackInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    playlist?: boolean | Prisma.MusicPlaylistDefaultArgs<ExtArgs>;
    track?: boolean | Prisma.MusicTrackDefaultArgs<ExtArgs>;
};
export type MusicPlaylistTrackIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    playlist?: boolean | Prisma.MusicPlaylistDefaultArgs<ExtArgs>;
    track?: boolean | Prisma.MusicTrackDefaultArgs<ExtArgs>;
};
export type MusicPlaylistTrackIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    playlist?: boolean | Prisma.MusicPlaylistDefaultArgs<ExtArgs>;
    track?: boolean | Prisma.MusicTrackDefaultArgs<ExtArgs>;
};
export type $MusicPlaylistTrackPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MusicPlaylistTrack";
    objects: {
        playlist: Prisma.$MusicPlaylistPayload<ExtArgs>;
        track: Prisma.$MusicTrackPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        playlistId: string;
        position: number;
        trackId: string;
    }, ExtArgs["result"]["musicPlaylistTrack"]>;
    composites: {};
};
export type MusicPlaylistTrackGetPayload<S extends boolean | null | undefined | MusicPlaylistTrackDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload, S>;
export type MusicPlaylistTrackCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MusicPlaylistTrackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MusicPlaylistTrackCountAggregateInputType | true;
};
export interface MusicPlaylistTrackDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MusicPlaylistTrack'];
        meta: {
            name: 'MusicPlaylistTrack';
        };
    };
    /**
     * Find zero or one MusicPlaylistTrack that matches the filter.
     * @param {MusicPlaylistTrackFindUniqueArgs} args - Arguments to find a MusicPlaylistTrack
     * @example
     * // Get one MusicPlaylistTrack
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MusicPlaylistTrackFindUniqueArgs>(args: Prisma.SelectSubset<T, MusicPlaylistTrackFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one MusicPlaylistTrack that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MusicPlaylistTrackFindUniqueOrThrowArgs} args - Arguments to find a MusicPlaylistTrack
     * @example
     * // Get one MusicPlaylistTrack
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MusicPlaylistTrackFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MusicPlaylistTrackFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MusicPlaylistTrack that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistTrackFindFirstArgs} args - Arguments to find a MusicPlaylistTrack
     * @example
     * // Get one MusicPlaylistTrack
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MusicPlaylistTrackFindFirstArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistTrackFindFirstArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MusicPlaylistTrack that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistTrackFindFirstOrThrowArgs} args - Arguments to find a MusicPlaylistTrack
     * @example
     * // Get one MusicPlaylistTrack
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MusicPlaylistTrackFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistTrackFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more MusicPlaylistTracks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistTrackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MusicPlaylistTracks
     * const musicPlaylistTracks = await prisma.musicPlaylistTrack.findMany()
     *
     * // Get first 10 MusicPlaylistTracks
     * const musicPlaylistTracks = await prisma.musicPlaylistTrack.findMany({ take: 10 })
     *
     * // Only select the `playlistId`
     * const musicPlaylistTrackWithPlaylistIdOnly = await prisma.musicPlaylistTrack.findMany({ select: { playlistId: true } })
     *
     */
    findMany<T extends MusicPlaylistTrackFindManyArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistTrackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a MusicPlaylistTrack.
     * @param {MusicPlaylistTrackCreateArgs} args - Arguments to create a MusicPlaylistTrack.
     * @example
     * // Create one MusicPlaylistTrack
     * const MusicPlaylistTrack = await prisma.musicPlaylistTrack.create({
     *   data: {
     *     // ... data to create a MusicPlaylistTrack
     *   }
     * })
     *
     */
    create<T extends MusicPlaylistTrackCreateArgs>(args: Prisma.SelectSubset<T, MusicPlaylistTrackCreateArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many MusicPlaylistTracks.
     * @param {MusicPlaylistTrackCreateManyArgs} args - Arguments to create many MusicPlaylistTracks.
     * @example
     * // Create many MusicPlaylistTracks
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MusicPlaylistTrackCreateManyArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistTrackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many MusicPlaylistTracks and returns the data saved in the database.
     * @param {MusicPlaylistTrackCreateManyAndReturnArgs} args - Arguments to create many MusicPlaylistTracks.
     * @example
     * // Create many MusicPlaylistTracks
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many MusicPlaylistTracks and only return the `playlistId`
     * const musicPlaylistTrackWithPlaylistIdOnly = await prisma.musicPlaylistTrack.createManyAndReturn({
     *   select: { playlistId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MusicPlaylistTrackCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistTrackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a MusicPlaylistTrack.
     * @param {MusicPlaylistTrackDeleteArgs} args - Arguments to delete one MusicPlaylistTrack.
     * @example
     * // Delete one MusicPlaylistTrack
     * const MusicPlaylistTrack = await prisma.musicPlaylistTrack.delete({
     *   where: {
     *     // ... filter to delete one MusicPlaylistTrack
     *   }
     * })
     *
     */
    delete<T extends MusicPlaylistTrackDeleteArgs>(args: Prisma.SelectSubset<T, MusicPlaylistTrackDeleteArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one MusicPlaylistTrack.
     * @param {MusicPlaylistTrackUpdateArgs} args - Arguments to update one MusicPlaylistTrack.
     * @example
     * // Update one MusicPlaylistTrack
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MusicPlaylistTrackUpdateArgs>(args: Prisma.SelectSubset<T, MusicPlaylistTrackUpdateArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more MusicPlaylistTracks.
     * @param {MusicPlaylistTrackDeleteManyArgs} args - Arguments to filter MusicPlaylistTracks to delete.
     * @example
     * // Delete a few MusicPlaylistTracks
     * const { count } = await prisma.musicPlaylistTrack.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MusicPlaylistTrackDeleteManyArgs>(args?: Prisma.SelectSubset<T, MusicPlaylistTrackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MusicPlaylistTracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistTrackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MusicPlaylistTracks
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MusicPlaylistTrackUpdateManyArgs>(args: Prisma.SelectSubset<T, MusicPlaylistTrackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MusicPlaylistTracks and returns the data updated in the database.
     * @param {MusicPlaylistTrackUpdateManyAndReturnArgs} args - Arguments to update many MusicPlaylistTracks.
     * @example
     * // Update many MusicPlaylistTracks
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more MusicPlaylistTracks and only return the `playlistId`
     * const musicPlaylistTrackWithPlaylistIdOnly = await prisma.musicPlaylistTrack.updateManyAndReturn({
     *   select: { playlistId: true },
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
    updateManyAndReturn<T extends MusicPlaylistTrackUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MusicPlaylistTrackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one MusicPlaylistTrack.
     * @param {MusicPlaylistTrackUpsertArgs} args - Arguments to update or create a MusicPlaylistTrack.
     * @example
     * // Update or create a MusicPlaylistTrack
     * const musicPlaylistTrack = await prisma.musicPlaylistTrack.upsert({
     *   create: {
     *     // ... data to create a MusicPlaylistTrack
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MusicPlaylistTrack we want to update
     *   }
     * })
     */
    upsert<T extends MusicPlaylistTrackUpsertArgs>(args: Prisma.SelectSubset<T, MusicPlaylistTrackUpsertArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of MusicPlaylistTracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistTrackCountArgs} args - Arguments to filter MusicPlaylistTracks to count.
     * @example
     * // Count the number of MusicPlaylistTracks
     * const count = await prisma.musicPlaylistTrack.count({
     *   where: {
     *     // ... the filter for the MusicPlaylistTracks we want to count
     *   }
     * })
    **/
    count<T extends MusicPlaylistTrackCountArgs>(args?: Prisma.Subset<T, MusicPlaylistTrackCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MusicPlaylistTrackCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a MusicPlaylistTrack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistTrackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MusicPlaylistTrackAggregateArgs>(args: Prisma.Subset<T, MusicPlaylistTrackAggregateArgs>): Prisma.PrismaPromise<GetMusicPlaylistTrackAggregateType<T>>;
    /**
     * Group by MusicPlaylistTrack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicPlaylistTrackGroupByArgs} args - Group by arguments.
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
    groupBy<T extends MusicPlaylistTrackGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MusicPlaylistTrackGroupByArgs['orderBy'];
    } : {
        orderBy?: MusicPlaylistTrackGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MusicPlaylistTrackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMusicPlaylistTrackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the MusicPlaylistTrack model
     */
    readonly fields: MusicPlaylistTrackFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for MusicPlaylistTrack.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__MusicPlaylistTrackClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    playlist<T extends Prisma.MusicPlaylistDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MusicPlaylistDefaultArgs<ExtArgs>>): Prisma.Prisma__MusicPlaylistClient<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    track<T extends Prisma.MusicTrackDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MusicTrackDefaultArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
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
 * Fields of the MusicPlaylistTrack model
 */
export interface MusicPlaylistTrackFieldRefs {
    readonly playlistId: Prisma.FieldRef<"MusicPlaylistTrack", 'String'>;
    readonly position: Prisma.FieldRef<"MusicPlaylistTrack", 'Int'>;
    readonly trackId: Prisma.FieldRef<"MusicPlaylistTrack", 'String'>;
}
/**
 * MusicPlaylistTrack findUnique
 */
export type MusicPlaylistTrackFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which MusicPlaylistTrack to fetch.
     */
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
};
/**
 * MusicPlaylistTrack findUniqueOrThrow
 */
export type MusicPlaylistTrackFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which MusicPlaylistTrack to fetch.
     */
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
};
/**
 * MusicPlaylistTrack findFirst
 */
export type MusicPlaylistTrackFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which MusicPlaylistTrack to fetch.
     */
    where?: Prisma.MusicPlaylistTrackWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicPlaylistTracks to fetch.
     */
    orderBy?: Prisma.MusicPlaylistTrackOrderByWithRelationInput | Prisma.MusicPlaylistTrackOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MusicPlaylistTracks.
     */
    cursor?: Prisma.MusicPlaylistTrackWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicPlaylistTracks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicPlaylistTracks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicPlaylistTracks.
     */
    distinct?: Prisma.MusicPlaylistTrackScalarFieldEnum | Prisma.MusicPlaylistTrackScalarFieldEnum[];
};
/**
 * MusicPlaylistTrack findFirstOrThrow
 */
export type MusicPlaylistTrackFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which MusicPlaylistTrack to fetch.
     */
    where?: Prisma.MusicPlaylistTrackWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicPlaylistTracks to fetch.
     */
    orderBy?: Prisma.MusicPlaylistTrackOrderByWithRelationInput | Prisma.MusicPlaylistTrackOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MusicPlaylistTracks.
     */
    cursor?: Prisma.MusicPlaylistTrackWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicPlaylistTracks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicPlaylistTracks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicPlaylistTracks.
     */
    distinct?: Prisma.MusicPlaylistTrackScalarFieldEnum | Prisma.MusicPlaylistTrackScalarFieldEnum[];
};
/**
 * MusicPlaylistTrack findMany
 */
export type MusicPlaylistTrackFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter, which MusicPlaylistTracks to fetch.
     */
    where?: Prisma.MusicPlaylistTrackWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicPlaylistTracks to fetch.
     */
    orderBy?: Prisma.MusicPlaylistTrackOrderByWithRelationInput | Prisma.MusicPlaylistTrackOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing MusicPlaylistTracks.
     */
    cursor?: Prisma.MusicPlaylistTrackWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicPlaylistTracks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicPlaylistTracks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicPlaylistTracks.
     */
    distinct?: Prisma.MusicPlaylistTrackScalarFieldEnum | Prisma.MusicPlaylistTrackScalarFieldEnum[];
};
/**
 * MusicPlaylistTrack create
 */
export type MusicPlaylistTrackCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to create a MusicPlaylistTrack.
     */
    data: Prisma.XOR<Prisma.MusicPlaylistTrackCreateInput, Prisma.MusicPlaylistTrackUncheckedCreateInput>;
};
/**
 * MusicPlaylistTrack createMany
 */
export type MusicPlaylistTrackCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many MusicPlaylistTracks.
     */
    data: Prisma.MusicPlaylistTrackCreateManyInput | Prisma.MusicPlaylistTrackCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MusicPlaylistTrack createManyAndReturn
 */
export type MusicPlaylistTrackCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylistTrack
     */
    select?: Prisma.MusicPlaylistTrackSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylistTrack
     */
    omit?: Prisma.MusicPlaylistTrackOmit<ExtArgs> | null;
    /**
     * The data used to create many MusicPlaylistTracks.
     */
    data: Prisma.MusicPlaylistTrackCreateManyInput | Prisma.MusicPlaylistTrackCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistTrackIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * MusicPlaylistTrack update
 */
export type MusicPlaylistTrackUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The data needed to update a MusicPlaylistTrack.
     */
    data: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateInput, Prisma.MusicPlaylistTrackUncheckedUpdateInput>;
    /**
     * Choose, which MusicPlaylistTrack to update.
     */
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
};
/**
 * MusicPlaylistTrack updateMany
 */
export type MusicPlaylistTrackUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update MusicPlaylistTracks.
     */
    data: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateManyMutationInput, Prisma.MusicPlaylistTrackUncheckedUpdateManyInput>;
    /**
     * Filter which MusicPlaylistTracks to update
     */
    where?: Prisma.MusicPlaylistTrackWhereInput;
    /**
     * Limit how many MusicPlaylistTracks to update.
     */
    limit?: number;
};
/**
 * MusicPlaylistTrack updateManyAndReturn
 */
export type MusicPlaylistTrackUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicPlaylistTrack
     */
    select?: Prisma.MusicPlaylistTrackSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicPlaylistTrack
     */
    omit?: Prisma.MusicPlaylistTrackOmit<ExtArgs> | null;
    /**
     * The data used to update MusicPlaylistTracks.
     */
    data: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateManyMutationInput, Prisma.MusicPlaylistTrackUncheckedUpdateManyInput>;
    /**
     * Filter which MusicPlaylistTracks to update
     */
    where?: Prisma.MusicPlaylistTrackWhereInput;
    /**
     * Limit how many MusicPlaylistTracks to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicPlaylistTrackIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * MusicPlaylistTrack upsert
 */
export type MusicPlaylistTrackUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * The filter to search for the MusicPlaylistTrack to update in case it exists.
     */
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
    /**
     * In case the MusicPlaylistTrack found by the `where` argument doesn't exist, create a new MusicPlaylistTrack with this data.
     */
    create: Prisma.XOR<Prisma.MusicPlaylistTrackCreateInput, Prisma.MusicPlaylistTrackUncheckedCreateInput>;
    /**
     * In case the MusicPlaylistTrack was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.MusicPlaylistTrackUpdateInput, Prisma.MusicPlaylistTrackUncheckedUpdateInput>;
};
/**
 * MusicPlaylistTrack delete
 */
export type MusicPlaylistTrackDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
    /**
     * Filter which MusicPlaylistTrack to delete.
     */
    where: Prisma.MusicPlaylistTrackWhereUniqueInput;
};
/**
 * MusicPlaylistTrack deleteMany
 */
export type MusicPlaylistTrackDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MusicPlaylistTracks to delete
     */
    where?: Prisma.MusicPlaylistTrackWhereInput;
    /**
     * Limit how many MusicPlaylistTracks to delete.
     */
    limit?: number;
};
/**
 * MusicPlaylistTrack without action
 */
export type MusicPlaylistTrackDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
};
//# sourceMappingURL=MusicPlaylistTrack.d.ts.map
import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model MusicTrack
 * An audio file a manager uploaded. Files live on disk under MUSIC_STORAGE_DIR/<guildId>/<fileName>.
 */
export type MusicTrackModel = runtime.Types.Result.DefaultSelection<Prisma.$MusicTrackPayload>;
export type AggregateMusicTrack = {
    _count: MusicTrackCountAggregateOutputType | null;
    _avg: MusicTrackAvgAggregateOutputType | null;
    _sum: MusicTrackSumAggregateOutputType | null;
    _min: MusicTrackMinAggregateOutputType | null;
    _max: MusicTrackMaxAggregateOutputType | null;
};
export type MusicTrackAvgAggregateOutputType = {
    trackNumber: number | null;
    durationSeconds: number | null;
    sizeBytes: number | null;
};
export type MusicTrackSumAggregateOutputType = {
    trackNumber: number | null;
    durationSeconds: number | null;
    sizeBytes: number | null;
};
export type MusicTrackMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    title: string | null;
    artist: string | null;
    album: string | null;
    trackNumber: number | null;
    durationSeconds: number | null;
    fileName: string | null;
    coverFileName: string | null;
    contentType: string | null;
    sizeBytes: number | null;
    sha256: string | null;
    originalName: string | null;
    uploadedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MusicTrackMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    title: string | null;
    artist: string | null;
    album: string | null;
    trackNumber: number | null;
    durationSeconds: number | null;
    fileName: string | null;
    coverFileName: string | null;
    contentType: string | null;
    sizeBytes: number | null;
    sha256: string | null;
    originalName: string | null;
    uploadedBy: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type MusicTrackCountAggregateOutputType = {
    id: number;
    guildId: number;
    title: number;
    artist: number;
    album: number;
    trackNumber: number;
    durationSeconds: number;
    fileName: number;
    coverFileName: number;
    contentType: number;
    sizeBytes: number;
    sha256: number;
    originalName: number;
    uploadedBy: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type MusicTrackAvgAggregateInputType = {
    trackNumber?: true;
    durationSeconds?: true;
    sizeBytes?: true;
};
export type MusicTrackSumAggregateInputType = {
    trackNumber?: true;
    durationSeconds?: true;
    sizeBytes?: true;
};
export type MusicTrackMinAggregateInputType = {
    id?: true;
    guildId?: true;
    title?: true;
    artist?: true;
    album?: true;
    trackNumber?: true;
    durationSeconds?: true;
    fileName?: true;
    coverFileName?: true;
    contentType?: true;
    sizeBytes?: true;
    sha256?: true;
    originalName?: true;
    uploadedBy?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MusicTrackMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    title?: true;
    artist?: true;
    album?: true;
    trackNumber?: true;
    durationSeconds?: true;
    fileName?: true;
    coverFileName?: true;
    contentType?: true;
    sizeBytes?: true;
    sha256?: true;
    originalName?: true;
    uploadedBy?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type MusicTrackCountAggregateInputType = {
    id?: true;
    guildId?: true;
    title?: true;
    artist?: true;
    album?: true;
    trackNumber?: true;
    durationSeconds?: true;
    fileName?: true;
    coverFileName?: true;
    contentType?: true;
    sizeBytes?: true;
    sha256?: true;
    originalName?: true;
    uploadedBy?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type MusicTrackAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MusicTrack to aggregate.
     */
    where?: Prisma.MusicTrackWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicTracks to fetch.
     */
    orderBy?: Prisma.MusicTrackOrderByWithRelationInput | Prisma.MusicTrackOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.MusicTrackWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicTracks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicTracks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned MusicTracks
    **/
    _count?: true | MusicTrackCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: MusicTrackAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: MusicTrackSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: MusicTrackMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: MusicTrackMaxAggregateInputType;
};
export type GetMusicTrackAggregateType<T extends MusicTrackAggregateArgs> = {
    [P in keyof T & keyof AggregateMusicTrack]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateMusicTrack[P]> : Prisma.GetScalarType<T[P], AggregateMusicTrack[P]>;
};
export type MusicTrackGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MusicTrackWhereInput;
    orderBy?: Prisma.MusicTrackOrderByWithAggregationInput | Prisma.MusicTrackOrderByWithAggregationInput[];
    by: Prisma.MusicTrackScalarFieldEnum[] | Prisma.MusicTrackScalarFieldEnum;
    having?: Prisma.MusicTrackScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: MusicTrackCountAggregateInputType | true;
    _avg?: MusicTrackAvgAggregateInputType;
    _sum?: MusicTrackSumAggregateInputType;
    _min?: MusicTrackMinAggregateInputType;
    _max?: MusicTrackMaxAggregateInputType;
};
export type MusicTrackGroupByOutputType = {
    id: string;
    guildId: string;
    title: string;
    artist: string | null;
    album: string | null;
    trackNumber: number | null;
    durationSeconds: number | null;
    fileName: string;
    coverFileName: string | null;
    contentType: string;
    sizeBytes: number;
    sha256: string;
    originalName: string;
    uploadedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: MusicTrackCountAggregateOutputType | null;
    _avg: MusicTrackAvgAggregateOutputType | null;
    _sum: MusicTrackSumAggregateOutputType | null;
    _min: MusicTrackMinAggregateOutputType | null;
    _max: MusicTrackMaxAggregateOutputType | null;
};
export type GetMusicTrackGroupByPayload<T extends MusicTrackGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<MusicTrackGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof MusicTrackGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], MusicTrackGroupByOutputType[P]> : Prisma.GetScalarType<T[P], MusicTrackGroupByOutputType[P]>;
}>>;
export type MusicTrackWhereInput = {
    AND?: Prisma.MusicTrackWhereInput | Prisma.MusicTrackWhereInput[];
    OR?: Prisma.MusicTrackWhereInput[];
    NOT?: Prisma.MusicTrackWhereInput | Prisma.MusicTrackWhereInput[];
    id?: Prisma.UuidFilter<"MusicTrack"> | string;
    guildId?: Prisma.StringFilter<"MusicTrack"> | string;
    title?: Prisma.StringFilter<"MusicTrack"> | string;
    artist?: Prisma.StringNullableFilter<"MusicTrack"> | string | null;
    album?: Prisma.StringNullableFilter<"MusicTrack"> | string | null;
    trackNumber?: Prisma.IntNullableFilter<"MusicTrack"> | number | null;
    durationSeconds?: Prisma.IntNullableFilter<"MusicTrack"> | number | null;
    fileName?: Prisma.StringFilter<"MusicTrack"> | string;
    coverFileName?: Prisma.StringNullableFilter<"MusicTrack"> | string | null;
    contentType?: Prisma.StringFilter<"MusicTrack"> | string;
    sizeBytes?: Prisma.IntFilter<"MusicTrack"> | number;
    sha256?: Prisma.StringFilter<"MusicTrack"> | string;
    originalName?: Prisma.StringFilter<"MusicTrack"> | string;
    uploadedBy?: Prisma.StringNullableFilter<"MusicTrack"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MusicTrack"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MusicTrack"> | Date | string;
    playlists?: Prisma.MusicPlaylistTrackListRelationFilter;
};
export type MusicTrackOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    artist?: Prisma.SortOrderInput | Prisma.SortOrder;
    album?: Prisma.SortOrderInput | Prisma.SortOrder;
    trackNumber?: Prisma.SortOrderInput | Prisma.SortOrder;
    durationSeconds?: Prisma.SortOrderInput | Prisma.SortOrder;
    fileName?: Prisma.SortOrder;
    coverFileName?: Prisma.SortOrderInput | Prisma.SortOrder;
    contentType?: Prisma.SortOrder;
    sizeBytes?: Prisma.SortOrder;
    sha256?: Prisma.SortOrder;
    originalName?: Prisma.SortOrder;
    uploadedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    playlists?: Prisma.MusicPlaylistTrackOrderByRelationAggregateInput;
};
export type MusicTrackWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    guildId_sha256?: Prisma.MusicTrackGuildIdSha256CompoundUniqueInput;
    AND?: Prisma.MusicTrackWhereInput | Prisma.MusicTrackWhereInput[];
    OR?: Prisma.MusicTrackWhereInput[];
    NOT?: Prisma.MusicTrackWhereInput | Prisma.MusicTrackWhereInput[];
    guildId?: Prisma.StringFilter<"MusicTrack"> | string;
    title?: Prisma.StringFilter<"MusicTrack"> | string;
    artist?: Prisma.StringNullableFilter<"MusicTrack"> | string | null;
    album?: Prisma.StringNullableFilter<"MusicTrack"> | string | null;
    trackNumber?: Prisma.IntNullableFilter<"MusicTrack"> | number | null;
    durationSeconds?: Prisma.IntNullableFilter<"MusicTrack"> | number | null;
    fileName?: Prisma.StringFilter<"MusicTrack"> | string;
    coverFileName?: Prisma.StringNullableFilter<"MusicTrack"> | string | null;
    contentType?: Prisma.StringFilter<"MusicTrack"> | string;
    sizeBytes?: Prisma.IntFilter<"MusicTrack"> | number;
    sha256?: Prisma.StringFilter<"MusicTrack"> | string;
    originalName?: Prisma.StringFilter<"MusicTrack"> | string;
    uploadedBy?: Prisma.StringNullableFilter<"MusicTrack"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"MusicTrack"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"MusicTrack"> | Date | string;
    playlists?: Prisma.MusicPlaylistTrackListRelationFilter;
}, "id" | "guildId_sha256">;
export type MusicTrackOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    artist?: Prisma.SortOrderInput | Prisma.SortOrder;
    album?: Prisma.SortOrderInput | Prisma.SortOrder;
    trackNumber?: Prisma.SortOrderInput | Prisma.SortOrder;
    durationSeconds?: Prisma.SortOrderInput | Prisma.SortOrder;
    fileName?: Prisma.SortOrder;
    coverFileName?: Prisma.SortOrderInput | Prisma.SortOrder;
    contentType?: Prisma.SortOrder;
    sizeBytes?: Prisma.SortOrder;
    sha256?: Prisma.SortOrder;
    originalName?: Prisma.SortOrder;
    uploadedBy?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.MusicTrackCountOrderByAggregateInput;
    _avg?: Prisma.MusicTrackAvgOrderByAggregateInput;
    _max?: Prisma.MusicTrackMaxOrderByAggregateInput;
    _min?: Prisma.MusicTrackMinOrderByAggregateInput;
    _sum?: Prisma.MusicTrackSumOrderByAggregateInput;
};
export type MusicTrackScalarWhereWithAggregatesInput = {
    AND?: Prisma.MusicTrackScalarWhereWithAggregatesInput | Prisma.MusicTrackScalarWhereWithAggregatesInput[];
    OR?: Prisma.MusicTrackScalarWhereWithAggregatesInput[];
    NOT?: Prisma.MusicTrackScalarWhereWithAggregatesInput | Prisma.MusicTrackScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"MusicTrack"> | string;
    guildId?: Prisma.StringWithAggregatesFilter<"MusicTrack"> | string;
    title?: Prisma.StringWithAggregatesFilter<"MusicTrack"> | string;
    artist?: Prisma.StringNullableWithAggregatesFilter<"MusicTrack"> | string | null;
    album?: Prisma.StringNullableWithAggregatesFilter<"MusicTrack"> | string | null;
    trackNumber?: Prisma.IntNullableWithAggregatesFilter<"MusicTrack"> | number | null;
    durationSeconds?: Prisma.IntNullableWithAggregatesFilter<"MusicTrack"> | number | null;
    fileName?: Prisma.StringWithAggregatesFilter<"MusicTrack"> | string;
    coverFileName?: Prisma.StringNullableWithAggregatesFilter<"MusicTrack"> | string | null;
    contentType?: Prisma.StringWithAggregatesFilter<"MusicTrack"> | string;
    sizeBytes?: Prisma.IntWithAggregatesFilter<"MusicTrack"> | number;
    sha256?: Prisma.StringWithAggregatesFilter<"MusicTrack"> | string;
    originalName?: Prisma.StringWithAggregatesFilter<"MusicTrack"> | string;
    uploadedBy?: Prisma.StringNullableWithAggregatesFilter<"MusicTrack"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"MusicTrack"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"MusicTrack"> | Date | string;
};
export type MusicTrackCreateInput = {
    id: string;
    guildId: string;
    title: string;
    artist?: string | null;
    album?: string | null;
    trackNumber?: number | null;
    durationSeconds?: number | null;
    fileName: string;
    coverFileName?: string | null;
    contentType: string;
    sizeBytes: number;
    sha256: string;
    originalName: string;
    uploadedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    playlists?: Prisma.MusicPlaylistTrackCreateNestedManyWithoutTrackInput;
};
export type MusicTrackUncheckedCreateInput = {
    id: string;
    guildId: string;
    title: string;
    artist?: string | null;
    album?: string | null;
    trackNumber?: number | null;
    durationSeconds?: number | null;
    fileName: string;
    coverFileName?: string | null;
    contentType: string;
    sizeBytes: number;
    sha256: string;
    originalName: string;
    uploadedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    playlists?: Prisma.MusicPlaylistTrackUncheckedCreateNestedManyWithoutTrackInput;
};
export type MusicTrackUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    artist?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    album?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trackNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    durationSeconds?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fileName?: Prisma.StringFieldUpdateOperationsInput | string;
    coverFileName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contentType?: Prisma.StringFieldUpdateOperationsInput | string;
    sizeBytes?: Prisma.IntFieldUpdateOperationsInput | number;
    sha256?: Prisma.StringFieldUpdateOperationsInput | string;
    originalName?: Prisma.StringFieldUpdateOperationsInput | string;
    uploadedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    playlists?: Prisma.MusicPlaylistTrackUpdateManyWithoutTrackNestedInput;
};
export type MusicTrackUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    artist?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    album?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trackNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    durationSeconds?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fileName?: Prisma.StringFieldUpdateOperationsInput | string;
    coverFileName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contentType?: Prisma.StringFieldUpdateOperationsInput | string;
    sizeBytes?: Prisma.IntFieldUpdateOperationsInput | number;
    sha256?: Prisma.StringFieldUpdateOperationsInput | string;
    originalName?: Prisma.StringFieldUpdateOperationsInput | string;
    uploadedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    playlists?: Prisma.MusicPlaylistTrackUncheckedUpdateManyWithoutTrackNestedInput;
};
export type MusicTrackCreateManyInput = {
    id: string;
    guildId: string;
    title: string;
    artist?: string | null;
    album?: string | null;
    trackNumber?: number | null;
    durationSeconds?: number | null;
    fileName: string;
    coverFileName?: string | null;
    contentType: string;
    sizeBytes: number;
    sha256: string;
    originalName: string;
    uploadedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MusicTrackUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    artist?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    album?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trackNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    durationSeconds?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fileName?: Prisma.StringFieldUpdateOperationsInput | string;
    coverFileName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contentType?: Prisma.StringFieldUpdateOperationsInput | string;
    sizeBytes?: Prisma.IntFieldUpdateOperationsInput | number;
    sha256?: Prisma.StringFieldUpdateOperationsInput | string;
    originalName?: Prisma.StringFieldUpdateOperationsInput | string;
    uploadedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MusicTrackUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    artist?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    album?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trackNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    durationSeconds?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fileName?: Prisma.StringFieldUpdateOperationsInput | string;
    coverFileName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contentType?: Prisma.StringFieldUpdateOperationsInput | string;
    sizeBytes?: Prisma.IntFieldUpdateOperationsInput | number;
    sha256?: Prisma.StringFieldUpdateOperationsInput | string;
    originalName?: Prisma.StringFieldUpdateOperationsInput | string;
    uploadedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MusicTrackGuildIdSha256CompoundUniqueInput = {
    guildId: string;
    sha256: string;
};
export type MusicTrackCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    artist?: Prisma.SortOrder;
    album?: Prisma.SortOrder;
    trackNumber?: Prisma.SortOrder;
    durationSeconds?: Prisma.SortOrder;
    fileName?: Prisma.SortOrder;
    coverFileName?: Prisma.SortOrder;
    contentType?: Prisma.SortOrder;
    sizeBytes?: Prisma.SortOrder;
    sha256?: Prisma.SortOrder;
    originalName?: Prisma.SortOrder;
    uploadedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MusicTrackAvgOrderByAggregateInput = {
    trackNumber?: Prisma.SortOrder;
    durationSeconds?: Prisma.SortOrder;
    sizeBytes?: Prisma.SortOrder;
};
export type MusicTrackMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    artist?: Prisma.SortOrder;
    album?: Prisma.SortOrder;
    trackNumber?: Prisma.SortOrder;
    durationSeconds?: Prisma.SortOrder;
    fileName?: Prisma.SortOrder;
    coverFileName?: Prisma.SortOrder;
    contentType?: Prisma.SortOrder;
    sizeBytes?: Prisma.SortOrder;
    sha256?: Prisma.SortOrder;
    originalName?: Prisma.SortOrder;
    uploadedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MusicTrackMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    artist?: Prisma.SortOrder;
    album?: Prisma.SortOrder;
    trackNumber?: Prisma.SortOrder;
    durationSeconds?: Prisma.SortOrder;
    fileName?: Prisma.SortOrder;
    coverFileName?: Prisma.SortOrder;
    contentType?: Prisma.SortOrder;
    sizeBytes?: Prisma.SortOrder;
    sha256?: Prisma.SortOrder;
    originalName?: Prisma.SortOrder;
    uploadedBy?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type MusicTrackSumOrderByAggregateInput = {
    trackNumber?: Prisma.SortOrder;
    durationSeconds?: Prisma.SortOrder;
    sizeBytes?: Prisma.SortOrder;
};
export type MusicTrackScalarRelationFilter = {
    is?: Prisma.MusicTrackWhereInput;
    isNot?: Prisma.MusicTrackWhereInput;
};
export type MusicTrackCreateNestedOneWithoutPlaylistsInput = {
    create?: Prisma.XOR<Prisma.MusicTrackCreateWithoutPlaylistsInput, Prisma.MusicTrackUncheckedCreateWithoutPlaylistsInput>;
    connectOrCreate?: Prisma.MusicTrackCreateOrConnectWithoutPlaylistsInput;
    connect?: Prisma.MusicTrackWhereUniqueInput;
};
export type MusicTrackUpdateOneRequiredWithoutPlaylistsNestedInput = {
    create?: Prisma.XOR<Prisma.MusicTrackCreateWithoutPlaylistsInput, Prisma.MusicTrackUncheckedCreateWithoutPlaylistsInput>;
    connectOrCreate?: Prisma.MusicTrackCreateOrConnectWithoutPlaylistsInput;
    upsert?: Prisma.MusicTrackUpsertWithoutPlaylistsInput;
    connect?: Prisma.MusicTrackWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.MusicTrackUpdateToOneWithWhereWithoutPlaylistsInput, Prisma.MusicTrackUpdateWithoutPlaylistsInput>, Prisma.MusicTrackUncheckedUpdateWithoutPlaylistsInput>;
};
export type MusicTrackCreateWithoutPlaylistsInput = {
    id: string;
    guildId: string;
    title: string;
    artist?: string | null;
    album?: string | null;
    trackNumber?: number | null;
    durationSeconds?: number | null;
    fileName: string;
    coverFileName?: string | null;
    contentType: string;
    sizeBytes: number;
    sha256: string;
    originalName: string;
    uploadedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MusicTrackUncheckedCreateWithoutPlaylistsInput = {
    id: string;
    guildId: string;
    title: string;
    artist?: string | null;
    album?: string | null;
    trackNumber?: number | null;
    durationSeconds?: number | null;
    fileName: string;
    coverFileName?: string | null;
    contentType: string;
    sizeBytes: number;
    sha256: string;
    originalName: string;
    uploadedBy?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type MusicTrackCreateOrConnectWithoutPlaylistsInput = {
    where: Prisma.MusicTrackWhereUniqueInput;
    create: Prisma.XOR<Prisma.MusicTrackCreateWithoutPlaylistsInput, Prisma.MusicTrackUncheckedCreateWithoutPlaylistsInput>;
};
export type MusicTrackUpsertWithoutPlaylistsInput = {
    update: Prisma.XOR<Prisma.MusicTrackUpdateWithoutPlaylistsInput, Prisma.MusicTrackUncheckedUpdateWithoutPlaylistsInput>;
    create: Prisma.XOR<Prisma.MusicTrackCreateWithoutPlaylistsInput, Prisma.MusicTrackUncheckedCreateWithoutPlaylistsInput>;
    where?: Prisma.MusicTrackWhereInput;
};
export type MusicTrackUpdateToOneWithWhereWithoutPlaylistsInput = {
    where?: Prisma.MusicTrackWhereInput;
    data: Prisma.XOR<Prisma.MusicTrackUpdateWithoutPlaylistsInput, Prisma.MusicTrackUncheckedUpdateWithoutPlaylistsInput>;
};
export type MusicTrackUpdateWithoutPlaylistsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    artist?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    album?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trackNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    durationSeconds?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fileName?: Prisma.StringFieldUpdateOperationsInput | string;
    coverFileName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contentType?: Prisma.StringFieldUpdateOperationsInput | string;
    sizeBytes?: Prisma.IntFieldUpdateOperationsInput | number;
    sha256?: Prisma.StringFieldUpdateOperationsInput | string;
    originalName?: Prisma.StringFieldUpdateOperationsInput | string;
    uploadedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type MusicTrackUncheckedUpdateWithoutPlaylistsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    artist?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    album?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    trackNumber?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    durationSeconds?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    fileName?: Prisma.StringFieldUpdateOperationsInput | string;
    coverFileName?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    contentType?: Prisma.StringFieldUpdateOperationsInput | string;
    sizeBytes?: Prisma.IntFieldUpdateOperationsInput | number;
    sha256?: Prisma.StringFieldUpdateOperationsInput | string;
    originalName?: Prisma.StringFieldUpdateOperationsInput | string;
    uploadedBy?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type MusicTrackCountOutputType
 */
export type MusicTrackCountOutputType = {
    playlists: number;
};
export type MusicTrackCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    playlists?: boolean | MusicTrackCountOutputTypeCountPlaylistsArgs;
};
/**
 * MusicTrackCountOutputType without action
 */
export type MusicTrackCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrackCountOutputType
     */
    select?: Prisma.MusicTrackCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * MusicTrackCountOutputType without action
 */
export type MusicTrackCountOutputTypeCountPlaylistsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.MusicPlaylistTrackWhereInput;
};
export type MusicTrackSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    title?: boolean;
    artist?: boolean;
    album?: boolean;
    trackNumber?: boolean;
    durationSeconds?: boolean;
    fileName?: boolean;
    coverFileName?: boolean;
    contentType?: boolean;
    sizeBytes?: boolean;
    sha256?: boolean;
    originalName?: boolean;
    uploadedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    playlists?: boolean | Prisma.MusicTrack$playlistsArgs<ExtArgs>;
    _count?: boolean | Prisma.MusicTrackCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["musicTrack"]>;
export type MusicTrackSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    title?: boolean;
    artist?: boolean;
    album?: boolean;
    trackNumber?: boolean;
    durationSeconds?: boolean;
    fileName?: boolean;
    coverFileName?: boolean;
    contentType?: boolean;
    sizeBytes?: boolean;
    sha256?: boolean;
    originalName?: boolean;
    uploadedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["musicTrack"]>;
export type MusicTrackSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    title?: boolean;
    artist?: boolean;
    album?: boolean;
    trackNumber?: boolean;
    durationSeconds?: boolean;
    fileName?: boolean;
    coverFileName?: boolean;
    contentType?: boolean;
    sizeBytes?: boolean;
    sha256?: boolean;
    originalName?: boolean;
    uploadedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["musicTrack"]>;
export type MusicTrackSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    title?: boolean;
    artist?: boolean;
    album?: boolean;
    trackNumber?: boolean;
    durationSeconds?: boolean;
    fileName?: boolean;
    coverFileName?: boolean;
    contentType?: boolean;
    sizeBytes?: boolean;
    sha256?: boolean;
    originalName?: boolean;
    uploadedBy?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type MusicTrackOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "title" | "artist" | "album" | "trackNumber" | "durationSeconds" | "fileName" | "coverFileName" | "contentType" | "sizeBytes" | "sha256" | "originalName" | "uploadedBy" | "createdAt" | "updatedAt", ExtArgs["result"]["musicTrack"]>;
export type MusicTrackInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    playlists?: boolean | Prisma.MusicTrack$playlistsArgs<ExtArgs>;
    _count?: boolean | Prisma.MusicTrackCountOutputTypeDefaultArgs<ExtArgs>;
};
export type MusicTrackIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type MusicTrackIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $MusicTrackPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "MusicTrack";
    objects: {
        playlists: Prisma.$MusicPlaylistTrackPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        title: string;
        artist: string | null;
        album: string | null;
        trackNumber: number | null;
        durationSeconds: number | null;
        fileName: string;
        coverFileName: string | null;
        contentType: string;
        sizeBytes: number;
        sha256: string;
        originalName: string;
        uploadedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["musicTrack"]>;
    composites: {};
};
export type MusicTrackGetPayload<S extends boolean | null | undefined | MusicTrackDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload, S>;
export type MusicTrackCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<MusicTrackFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: MusicTrackCountAggregateInputType | true;
};
export interface MusicTrackDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['MusicTrack'];
        meta: {
            name: 'MusicTrack';
        };
    };
    /**
     * Find zero or one MusicTrack that matches the filter.
     * @param {MusicTrackFindUniqueArgs} args - Arguments to find a MusicTrack
     * @example
     * // Get one MusicTrack
     * const musicTrack = await prisma.musicTrack.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MusicTrackFindUniqueArgs>(args: Prisma.SelectSubset<T, MusicTrackFindUniqueArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one MusicTrack that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MusicTrackFindUniqueOrThrowArgs} args - Arguments to find a MusicTrack
     * @example
     * // Get one MusicTrack
     * const musicTrack = await prisma.musicTrack.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MusicTrackFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, MusicTrackFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MusicTrack that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicTrackFindFirstArgs} args - Arguments to find a MusicTrack
     * @example
     * // Get one MusicTrack
     * const musicTrack = await prisma.musicTrack.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MusicTrackFindFirstArgs>(args?: Prisma.SelectSubset<T, MusicTrackFindFirstArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first MusicTrack that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicTrackFindFirstOrThrowArgs} args - Arguments to find a MusicTrack
     * @example
     * // Get one MusicTrack
     * const musicTrack = await prisma.musicTrack.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MusicTrackFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, MusicTrackFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more MusicTracks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicTrackFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MusicTracks
     * const musicTracks = await prisma.musicTrack.findMany()
     *
     * // Get first 10 MusicTracks
     * const musicTracks = await prisma.musicTrack.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const musicTrackWithIdOnly = await prisma.musicTrack.findMany({ select: { id: true } })
     *
     */
    findMany<T extends MusicTrackFindManyArgs>(args?: Prisma.SelectSubset<T, MusicTrackFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a MusicTrack.
     * @param {MusicTrackCreateArgs} args - Arguments to create a MusicTrack.
     * @example
     * // Create one MusicTrack
     * const MusicTrack = await prisma.musicTrack.create({
     *   data: {
     *     // ... data to create a MusicTrack
     *   }
     * })
     *
     */
    create<T extends MusicTrackCreateArgs>(args: Prisma.SelectSubset<T, MusicTrackCreateArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many MusicTracks.
     * @param {MusicTrackCreateManyArgs} args - Arguments to create many MusicTracks.
     * @example
     * // Create many MusicTracks
     * const musicTrack = await prisma.musicTrack.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends MusicTrackCreateManyArgs>(args?: Prisma.SelectSubset<T, MusicTrackCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many MusicTracks and returns the data saved in the database.
     * @param {MusicTrackCreateManyAndReturnArgs} args - Arguments to create many MusicTracks.
     * @example
     * // Create many MusicTracks
     * const musicTrack = await prisma.musicTrack.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many MusicTracks and only return the `id`
     * const musicTrackWithIdOnly = await prisma.musicTrack.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends MusicTrackCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, MusicTrackCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a MusicTrack.
     * @param {MusicTrackDeleteArgs} args - Arguments to delete one MusicTrack.
     * @example
     * // Delete one MusicTrack
     * const MusicTrack = await prisma.musicTrack.delete({
     *   where: {
     *     // ... filter to delete one MusicTrack
     *   }
     * })
     *
     */
    delete<T extends MusicTrackDeleteArgs>(args: Prisma.SelectSubset<T, MusicTrackDeleteArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one MusicTrack.
     * @param {MusicTrackUpdateArgs} args - Arguments to update one MusicTrack.
     * @example
     * // Update one MusicTrack
     * const musicTrack = await prisma.musicTrack.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends MusicTrackUpdateArgs>(args: Prisma.SelectSubset<T, MusicTrackUpdateArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more MusicTracks.
     * @param {MusicTrackDeleteManyArgs} args - Arguments to filter MusicTracks to delete.
     * @example
     * // Delete a few MusicTracks
     * const { count } = await prisma.musicTrack.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends MusicTrackDeleteManyArgs>(args?: Prisma.SelectSubset<T, MusicTrackDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MusicTracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicTrackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MusicTracks
     * const musicTrack = await prisma.musicTrack.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends MusicTrackUpdateManyArgs>(args: Prisma.SelectSubset<T, MusicTrackUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more MusicTracks and returns the data updated in the database.
     * @param {MusicTrackUpdateManyAndReturnArgs} args - Arguments to update many MusicTracks.
     * @example
     * // Update many MusicTracks
     * const musicTrack = await prisma.musicTrack.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more MusicTracks and only return the `id`
     * const musicTrackWithIdOnly = await prisma.musicTrack.updateManyAndReturn({
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
    updateManyAndReturn<T extends MusicTrackUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, MusicTrackUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one MusicTrack.
     * @param {MusicTrackUpsertArgs} args - Arguments to update or create a MusicTrack.
     * @example
     * // Update or create a MusicTrack
     * const musicTrack = await prisma.musicTrack.upsert({
     *   create: {
     *     // ... data to create a MusicTrack
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MusicTrack we want to update
     *   }
     * })
     */
    upsert<T extends MusicTrackUpsertArgs>(args: Prisma.SelectSubset<T, MusicTrackUpsertArgs<ExtArgs>>): Prisma.Prisma__MusicTrackClient<runtime.Types.Result.GetResult<Prisma.$MusicTrackPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of MusicTracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicTrackCountArgs} args - Arguments to filter MusicTracks to count.
     * @example
     * // Count the number of MusicTracks
     * const count = await prisma.musicTrack.count({
     *   where: {
     *     // ... the filter for the MusicTracks we want to count
     *   }
     * })
    **/
    count<T extends MusicTrackCountArgs>(args?: Prisma.Subset<T, MusicTrackCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], MusicTrackCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a MusicTrack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicTrackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends MusicTrackAggregateArgs>(args: Prisma.Subset<T, MusicTrackAggregateArgs>): Prisma.PrismaPromise<GetMusicTrackAggregateType<T>>;
    /**
     * Group by MusicTrack.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MusicTrackGroupByArgs} args - Group by arguments.
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
    groupBy<T extends MusicTrackGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: MusicTrackGroupByArgs['orderBy'];
    } : {
        orderBy?: MusicTrackGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, MusicTrackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMusicTrackGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the MusicTrack model
     */
    readonly fields: MusicTrackFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for MusicTrack.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__MusicTrackClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    playlists<T extends Prisma.MusicTrack$playlistsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.MusicTrack$playlistsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$MusicPlaylistTrackPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
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
 * Fields of the MusicTrack model
 */
export interface MusicTrackFieldRefs {
    readonly id: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly guildId: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly title: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly artist: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly album: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly trackNumber: Prisma.FieldRef<"MusicTrack", 'Int'>;
    readonly durationSeconds: Prisma.FieldRef<"MusicTrack", 'Int'>;
    readonly fileName: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly coverFileName: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly contentType: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly sizeBytes: Prisma.FieldRef<"MusicTrack", 'Int'>;
    readonly sha256: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly originalName: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly uploadedBy: Prisma.FieldRef<"MusicTrack", 'String'>;
    readonly createdAt: Prisma.FieldRef<"MusicTrack", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"MusicTrack", 'DateTime'>;
}
/**
 * MusicTrack findUnique
 */
export type MusicTrackFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * Filter, which MusicTrack to fetch.
     */
    where: Prisma.MusicTrackWhereUniqueInput;
};
/**
 * MusicTrack findUniqueOrThrow
 */
export type MusicTrackFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * Filter, which MusicTrack to fetch.
     */
    where: Prisma.MusicTrackWhereUniqueInput;
};
/**
 * MusicTrack findFirst
 */
export type MusicTrackFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * Filter, which MusicTrack to fetch.
     */
    where?: Prisma.MusicTrackWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicTracks to fetch.
     */
    orderBy?: Prisma.MusicTrackOrderByWithRelationInput | Prisma.MusicTrackOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MusicTracks.
     */
    cursor?: Prisma.MusicTrackWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicTracks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicTracks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicTracks.
     */
    distinct?: Prisma.MusicTrackScalarFieldEnum | Prisma.MusicTrackScalarFieldEnum[];
};
/**
 * MusicTrack findFirstOrThrow
 */
export type MusicTrackFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * Filter, which MusicTrack to fetch.
     */
    where?: Prisma.MusicTrackWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicTracks to fetch.
     */
    orderBy?: Prisma.MusicTrackOrderByWithRelationInput | Prisma.MusicTrackOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for MusicTracks.
     */
    cursor?: Prisma.MusicTrackWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicTracks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicTracks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicTracks.
     */
    distinct?: Prisma.MusicTrackScalarFieldEnum | Prisma.MusicTrackScalarFieldEnum[];
};
/**
 * MusicTrack findMany
 */
export type MusicTrackFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * Filter, which MusicTracks to fetch.
     */
    where?: Prisma.MusicTrackWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of MusicTracks to fetch.
     */
    orderBy?: Prisma.MusicTrackOrderByWithRelationInput | Prisma.MusicTrackOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing MusicTracks.
     */
    cursor?: Prisma.MusicTrackWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` MusicTracks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` MusicTracks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of MusicTracks.
     */
    distinct?: Prisma.MusicTrackScalarFieldEnum | Prisma.MusicTrackScalarFieldEnum[];
};
/**
 * MusicTrack create
 */
export type MusicTrackCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * The data needed to create a MusicTrack.
     */
    data: Prisma.XOR<Prisma.MusicTrackCreateInput, Prisma.MusicTrackUncheckedCreateInput>;
};
/**
 * MusicTrack createMany
 */
export type MusicTrackCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many MusicTracks.
     */
    data: Prisma.MusicTrackCreateManyInput | Prisma.MusicTrackCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MusicTrack createManyAndReturn
 */
export type MusicTrackCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * The data used to create many MusicTracks.
     */
    data: Prisma.MusicTrackCreateManyInput | Prisma.MusicTrackCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * MusicTrack update
 */
export type MusicTrackUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * The data needed to update a MusicTrack.
     */
    data: Prisma.XOR<Prisma.MusicTrackUpdateInput, Prisma.MusicTrackUncheckedUpdateInput>;
    /**
     * Choose, which MusicTrack to update.
     */
    where: Prisma.MusicTrackWhereUniqueInput;
};
/**
 * MusicTrack updateMany
 */
export type MusicTrackUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update MusicTracks.
     */
    data: Prisma.XOR<Prisma.MusicTrackUpdateManyMutationInput, Prisma.MusicTrackUncheckedUpdateManyInput>;
    /**
     * Filter which MusicTracks to update
     */
    where?: Prisma.MusicTrackWhereInput;
    /**
     * Limit how many MusicTracks to update.
     */
    limit?: number;
};
/**
 * MusicTrack updateManyAndReturn
 */
export type MusicTrackUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * The data used to update MusicTracks.
     */
    data: Prisma.XOR<Prisma.MusicTrackUpdateManyMutationInput, Prisma.MusicTrackUncheckedUpdateManyInput>;
    /**
     * Filter which MusicTracks to update
     */
    where?: Prisma.MusicTrackWhereInput;
    /**
     * Limit how many MusicTracks to update.
     */
    limit?: number;
};
/**
 * MusicTrack upsert
 */
export type MusicTrackUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * The filter to search for the MusicTrack to update in case it exists.
     */
    where: Prisma.MusicTrackWhereUniqueInput;
    /**
     * In case the MusicTrack found by the `where` argument doesn't exist, create a new MusicTrack with this data.
     */
    create: Prisma.XOR<Prisma.MusicTrackCreateInput, Prisma.MusicTrackUncheckedCreateInput>;
    /**
     * In case the MusicTrack was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.MusicTrackUpdateInput, Prisma.MusicTrackUncheckedUpdateInput>;
};
/**
 * MusicTrack delete
 */
export type MusicTrackDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
    /**
     * Filter which MusicTrack to delete.
     */
    where: Prisma.MusicTrackWhereUniqueInput;
};
/**
 * MusicTrack deleteMany
 */
export type MusicTrackDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which MusicTracks to delete
     */
    where?: Prisma.MusicTrackWhereInput;
    /**
     * Limit how many MusicTracks to delete.
     */
    limit?: number;
};
/**
 * MusicTrack.playlists
 */
export type MusicTrack$playlistsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
 * MusicTrack without action
 */
export type MusicTrackDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MusicTrack
     */
    select?: Prisma.MusicTrackSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the MusicTrack
     */
    omit?: Prisma.MusicTrackOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.MusicTrackInclude<ExtArgs> | null;
};
//# sourceMappingURL=MusicTrack.d.ts.map
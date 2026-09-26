import {
  MusicError,
  defaultMusicSettings,
  isUuid,
  type MusicLibraryUsage,
  type MusicLoopMode,
  type MusicPlayerState,
  type MusicPlaylist,
  type MusicPlaylistInput,
  type MusicQueueEntry,
  type MusicRepository,
  type MusicSession,
  type MusicSessionSave,
  type MusicSettings,
  type MusicSettingsInput,
  type MusicStation,
  type MusicStationInput,
  type MusicTrack,
  type MusicTrackCreate,
  type MusicTrackPatch,
} from "@qbox/music";
import type { MusicLoopMode as DbLoopMode, MusicPlayerState as DbPlayerState, Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "musicSettings" | "musicTrack" | "musicPlaylist" | "musicPlaylistTrack" | "musicStation" | "musicSession" | "$transaction">;
type SettingsRow = Prisma.MusicSettingsGetPayload<object>;
type TrackRow = Prisma.MusicTrackGetPayload<object>;
type PlaylistRow = Prisma.MusicPlaylistGetPayload<{ include: { tracks: true } }>;
type StationRow = Prisma.MusicStationGetPayload<object>;
type SessionRow = Prisma.MusicSessionGetPayload<object>;

const withTracks = { tracks: { orderBy: { position: "asc" } } } as const;

/** PostgreSQL music settings, library, playlists, stations and sessions. `guildId` is the Discord guild ID. */
export class PrismaMusicRepository implements MusicRepository {
  public constructor(private readonly client: Client) {}

  public async getSettings(guildId: string): Promise<MusicSettings | undefined> {
    const row = await this.client.musicSettings.findUnique({ where: { guildId } });
    return row ? mapSettings(row) : undefined;
  }

  public async saveSettings(input: MusicSettingsInput): Promise<MusicSettings> {
    const data = {
      enabled: input.enabled,
      djRoleIds: [...input.djRoleIds],
      defaultVolume: input.defaultVolume,
      maxQueue: input.maxQueue,
      announceChannelId: input.announceChannelId ?? null,
      nowPlayingPanel: input.nowPlayingPanel,
      stayConnected247: input.stayConnected247,
      homeChannelId: input.homeChannelId ?? null,
      autoLeaveMinutes: input.autoLeaveMinutes,
      idleRadioStationId: input.idleRadioStationId ?? null,
    };
    const existing = await this.client.musicSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new MusicError("CONFLICT", "Music settings changed since they were loaded.", { currentRevision: 0 });
      return mapSettings(await this.client.musicSettings.create({ data: { guildId: input.guildId, ...data } }));
    }
    const result = await this.client.musicSettings.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0) throw new MusicError("CONFLICT", "Music settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapSettings(await this.client.musicSettings.findUniqueOrThrow({ where: { guildId: input.guildId } }));
  }

  public async listStayConnected(): Promise<readonly MusicSettings[]> {
    return (await this.client.musicSettings.findMany({ where: { enabled: true, stayConnected247: true }, take: 1000 })).map(mapSettings);
  }

  public async listTracks(guildId: string): Promise<readonly MusicTrack[]> {
    return (await this.client.musicTrack.findMany({ where: { guildId }, orderBy: [{ createdAt: "desc" }, { title: "asc" }], take: 10_000 })).map(mapTrack);
  }

  public async getTrack(guildId: string, id: string): Promise<MusicTrack | undefined> {
    if (!isUuid(id)) return undefined;
    const row = await this.client.musicTrack.findFirst({ where: { guildId, id } });
    return row ? mapTrack(row) : undefined;
  }

  public async findTrackByHash(guildId: string, sha256: string): Promise<MusicTrack | undefined> {
    const row = await this.client.musicTrack.findUnique({ where: { guildId_sha256: { guildId, sha256 } } });
    return row ? mapTrack(row) : undefined;
  }

  public async createTrack(input: MusicTrackCreate): Promise<MusicTrack> {
    return mapTrack(await this.client.musicTrack.create({
      data: {
        id: input.id,
        guildId: input.guildId,
        title: input.title,
        artist: input.artist ?? null,
        album: input.album ?? null,
        trackNumber: input.trackNumber ?? null,
        durationSeconds: input.durationSeconds ?? null,
        fileName: input.fileName,
        coverFileName: input.coverFileName ?? null,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        sha256: input.sha256,
        originalName: input.originalName,
        uploadedBy: input.uploadedBy ?? null,
      },
    }));
  }

  public async updateTrack(guildId: string, id: string, patch: MusicTrackPatch): Promise<MusicTrack> {
    const result = await this.client.musicTrack.updateMany({ where: { guildId, id }, data: { title: patch.title, artist: patch.artist ?? null, album: patch.album ?? null } });
    if (result.count === 0) throw new MusicError("NOT_FOUND", "That song is not in the library.");
    return mapTrack(await this.client.musicTrack.findUniqueOrThrow({ where: { id } }));
  }

  public async deleteTrack(guildId: string, id: string): Promise<boolean> {
    if (!isUuid(id)) return false;
    return this.client.$transaction(async (transaction) => {
      const affected = await transaction.musicPlaylistTrack.findMany({ where: { trackId: id, playlist: { guildId } }, select: { playlistId: true }, distinct: ["playlistId"] });
      const deleted = (await transaction.musicTrack.deleteMany({ where: { guildId, id } })).count > 0;
      for (const { playlistId } of affected) await renumber(transaction, playlistId);
      return deleted;
    });
  }

  public async libraryUsage(guildId: string): Promise<MusicLibraryUsage> {
    const result = await this.client.musicTrack.aggregate({ where: { guildId }, _count: { _all: true }, _sum: { sizeBytes: true } });
    return { tracks: result._count._all, bytes: result._sum.sizeBytes ?? 0 };
  }

  public async listPlaylists(guildId: string): Promise<readonly MusicPlaylist[]> {
    return (await this.client.musicPlaylist.findMany({ where: { guildId }, include: withTracks, orderBy: { name: "asc" } })).map(mapPlaylist);
  }

  public async getPlaylist(guildId: string, id: string): Promise<MusicPlaylist | undefined> {
    if (!isUuid(id)) return undefined;
    const row = await this.client.musicPlaylist.findFirst({ where: { guildId, id }, include: withTracks });
    return row ? mapPlaylist(row) : undefined;
  }

  public async createPlaylist(input: MusicPlaylistInput): Promise<MusicPlaylist> {
    return mapPlaylist(await this.client.musicPlaylist.create({ data: { guildId: input.guildId, name: input.name, description: input.description ?? null }, include: withTracks }));
  }

  public async updatePlaylist(guildId: string, id: string, input: MusicPlaylistInput): Promise<MusicPlaylist> {
    const result = await this.client.musicPlaylist.updateMany({ where: { guildId, id }, data: { name: input.name, description: input.description ?? null } });
    if (result.count === 0) throw new MusicError("NOT_FOUND", "That playlist does not exist.");
    return mapPlaylist(await this.client.musicPlaylist.findUniqueOrThrow({ where: { id }, include: withTracks }));
  }

  public async setPlaylistTracks(guildId: string, id: string, trackIds: readonly string[]): Promise<MusicPlaylist> {
    return this.client.$transaction(async (transaction) => {
      const playlist = await transaction.musicPlaylist.findFirst({ where: { guildId, id }, select: { id: true } });
      if (!playlist) throw new MusicError("NOT_FOUND", "That playlist does not exist.");
      await transaction.musicPlaylistTrack.deleteMany({ where: { playlistId: id } });
      if (trackIds.length) await transaction.musicPlaylistTrack.createMany({ data: trackIds.map((trackId, position) => ({ playlistId: id, trackId, position })) });
      return mapPlaylist(await transaction.musicPlaylist.update({ where: { id }, data: { updatedAt: new Date() }, include: withTracks }));
    });
  }

  public async deletePlaylist(guildId: string, id: string): Promise<boolean> {
    if (!isUuid(id)) return false;
    return (await this.client.musicPlaylist.deleteMany({ where: { guildId, id } })).count > 0;
  }

  public async listStations(guildId: string): Promise<readonly MusicStation[]> {
    return (await this.client.musicStation.findMany({ where: { guildId }, orderBy: [{ name: "asc" }, { createdAt: "asc" }] })).map(mapStation);
  }

  public async getStation(guildId: string, id: string): Promise<MusicStation | undefined> {
    if (!isUuid(id)) return undefined;
    const row = await this.client.musicStation.findFirst({ where: { guildId, id } });
    return row ? mapStation(row) : undefined;
  }

  public async createStation(input: MusicStationInput): Promise<MusicStation> {
    return mapStation(await this.client.musicStation.create({ data: { guildId: input.guildId, name: input.name, url: input.url, faviconUrl: input.faviconUrl ?? null, tags: [...input.tags] } }));
  }

  public async deleteStation(guildId: string, id: string): Promise<boolean> {
    if (!isUuid(id)) return false;
    return (await this.client.musicStation.deleteMany({ where: { guildId, id } })).count > 0;
  }

  public async getSession(guildId: string): Promise<MusicSession | undefined> {
    const row = await this.client.musicSession.findUnique({ where: { guildId } });
    return row ? mapSession(row) : undefined;
  }

  public async saveSession(session: MusicSessionSave): Promise<void> {
    const data = {
      channelId: session.channelId ?? null,
      textChannelId: session.textChannelId ?? null,
      panelChannelId: session.panelChannelId ?? null,
      panelMessageId: session.panelMessageId ?? null,
      queue: session.queue as unknown as Prisma.InputJsonValue,
      index: session.index,
      positionSeconds: Math.max(0, Math.floor(session.positionSeconds)),
      state: session.state.toUpperCase() as DbPlayerState,
      loop: session.loop.toUpperCase() as DbLoopMode,
      shuffle: session.shuffle,
      volume: session.volume,
    };
    await this.client.musicSession.upsert({ where: { guildId: session.guildId }, create: { guildId: session.guildId, ...data }, update: data });
  }

  public async listActiveSessions(): Promise<readonly MusicSession[]> {
    return (await this.client.musicSession.findMany({ where: { state: { in: ["PLAYING", "BUFFERING"] } }, take: 1000 })).map(mapSession);
  }
}

async function renumber(transaction: Prisma.TransactionClient, playlistId: string): Promise<void> {
  const rows = await transaction.musicPlaylistTrack.findMany({ where: { playlistId }, orderBy: { position: "asc" } });
  await transaction.musicPlaylistTrack.deleteMany({ where: { playlistId } });
  if (rows.length) await transaction.musicPlaylistTrack.createMany({ data: rows.map((row, position) => ({ playlistId, trackId: row.trackId, position })) });
}

function mapSettings(row: SettingsRow): MusicSettings {
  const defaults = defaultMusicSettings(row.guildId);
  return {
    ...defaults,
    enabled: row.enabled,
    djRoleIds: row.djRoleIds,
    defaultVolume: row.defaultVolume,
    maxQueue: row.maxQueue,
    ...(row.announceChannelId ? { announceChannelId: row.announceChannelId } : {}),
    nowPlayingPanel: row.nowPlayingPanel,
    stayConnected247: row.stayConnected247,
    ...(row.homeChannelId ? { homeChannelId: row.homeChannelId } : {}),
    autoLeaveMinutes: row.autoLeaveMinutes,
    ...(row.idleRadioStationId ? { idleRadioStationId: row.idleRadioStationId } : {}),
    revision: row.revision,
  };
}

function mapTrack(row: TrackRow): MusicTrack {
  return {
    id: row.id,
    guildId: row.guildId,
    title: row.title,
    ...(row.artist ? { artist: row.artist } : {}),
    ...(row.album ? { album: row.album } : {}),
    ...(row.trackNumber === null ? {} : { trackNumber: row.trackNumber }),
    ...(row.durationSeconds === null ? {} : { durationSeconds: row.durationSeconds }),
    fileName: row.fileName,
    ...(row.coverFileName ? { coverFileName: row.coverFileName } : {}),
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
    sha256: row.sha256,
    originalName: row.originalName,
    ...(row.uploadedBy ? { uploadedBy: row.uploadedBy } : {}),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapPlaylist(row: PlaylistRow): MusicPlaylist {
  return {
    id: row.id,
    guildId: row.guildId,
    name: row.name,
    ...(row.description ? { description: row.description } : {}),
    trackIds: row.tracks.map((track) => track.trackId),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapStation(row: StationRow): MusicStation {
  return {
    id: row.id,
    guildId: row.guildId,
    name: row.name,
    url: row.url,
    ...(row.faviconUrl ? { faviconUrl: row.faviconUrl } : {}),
    tags: row.tags,
    createdAt: row.createdAt,
  };
}

function mapSession(row: SessionRow): MusicSession {
  return {
    guildId: row.guildId,
    ...(row.channelId ? { channelId: row.channelId } : {}),
    ...(row.textChannelId ? { textChannelId: row.textChannelId } : {}),
    ...(row.panelChannelId ? { panelChannelId: row.panelChannelId } : {}),
    ...(row.panelMessageId ? { panelMessageId: row.panelMessageId } : {}),
    queue: Array.isArray(row.queue) ? (row.queue as unknown as MusicQueueEntry[]) : [],
    index: row.index,
    positionSeconds: row.positionSeconds,
    state: row.state.toLowerCase() as MusicPlayerState,
    loop: row.loop.toLowerCase() as MusicLoopMode,
    shuffle: row.shuffle,
    volume: row.volume,
    updatedAt: row.updatedAt,
  };
}

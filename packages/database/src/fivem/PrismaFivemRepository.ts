import {
  FivemError,
  type FivemGuildConfig,
  type FivemMonitorState,
  type FivemRepository,
  type FivemSettings,
  type FivemSettingsInput,
  type FivemSnapshot,
} from "@qbox/fivem";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type Client = Pick<PrismaClient, "fivemSettings" | "fivemStatusSnapshot">;
type SettingsRow = Prisma.FivemSettingsGetPayload<object>;

/** PostgreSQL FiveM settings, monitor state, and status snapshots. `guildId` is the Discord guild ID. */
export class PrismaFivemRepository implements FivemRepository {
  public constructor(private readonly client: Client) {}

  public async get(guildId: string): Promise<FivemGuildConfig | undefined> {
    const row = await this.client.fivemSettings.findUnique({ where: { guildId } });
    return row ? mapConfig(row) : undefined;
  }

  public async saveSettings(input: FivemSettingsInput): Promise<FivemSettings> {
    const data = {
      serverAddress: input.serverAddress ?? null,
      connectUrl: input.connectUrl ?? null,
      statusChannelId: input.statusChannelId ?? null,
      updateIntervalSeconds: input.updateIntervalSeconds,
      alertChannelId: input.alertChannelId ?? null,
      alertRoleId: input.alertRoleId ?? null,
      restartTimes: [...input.restartTimes],
      timeZone: input.timeZone,
      restartWarningMinutes: [...input.restartWarningMinutes],
    };
    const existing = await this.client.fivemSettings.findUnique({ where: { guildId: input.guildId }, select: { revision: true } });
    if (!existing) {
      if (input.expectedRevision !== undefined && input.expectedRevision !== 0)
        throw new FivemError("CONFLICT", "FiveM settings changed since they were loaded.", { currentRevision: 0 });
      return mapConfig(await this.client.fivemSettings.create({ data: { guildId: input.guildId, sentRestartWarnings: [], ...data } })).settings;
    }
    const result = await this.client.fivemSettings.updateMany({
      where: { guildId: input.guildId, ...(input.expectedRevision === undefined ? {} : { revision: input.expectedRevision }) },
      data: { ...data, revision: { increment: 1 } },
    });
    if (result.count === 0)
      throw new FivemError("CONFLICT", "FiveM settings changed since they were loaded.", { currentRevision: existing.revision });
    return mapConfig(await this.client.fivemSettings.findUniqueOrThrow({ where: { guildId: input.guildId } })).settings;
  }

  public async saveState(guildId: string, state: Partial<FivemMonitorState>): Promise<void> {
    const data: Prisma.FivemSettingsUpdateManyMutationInput = {};
    if ("statusMessageId" in state) data.statusMessageId = state.statusMessageId ?? null;
    if ("lastOnline" in state) data.lastOnline = state.lastOnline ?? null;
    if ("onlineSince" in state) data.onlineSince = state.onlineSince ?? null;
    if (state.failureStreak !== undefined) data.failureStreak = state.failureStreak;
    if ("lastPolledAt" in state) data.lastPolledAt = state.lastPolledAt ?? null;
    if (state.sentRestartWarnings !== undefined) data.sentRestartWarnings = [...state.sentRestartWarnings];
    // State belongs to saved settings; without a settings row there is nothing to monitor.
    await this.client.fivemSettings.updateMany({ where: { guildId }, data });
  }

  public async listMonitored(): Promise<readonly FivemGuildConfig[]> {
    const rows = await this.client.fivemSettings.findMany({ where: { serverAddress: { not: null } }, take: 500 });
    return rows.map(mapConfig);
  }

  public async addSnapshot(guildId: string, snapshot: FivemSnapshot): Promise<void> {
    await this.client.fivemStatusSnapshot.create({ data: { guildId, online: snapshot.online, players: snapshot.players, maxPlayers: snapshot.maxPlayers, at: snapshot.at } });
  }

  public async listSnapshots(guildId: string, since: Date): Promise<readonly FivemSnapshot[]> {
    const rows = await this.client.fivemStatusSnapshot.findMany({
      where: { guildId, at: { gte: since } },
      orderBy: { at: "asc" },
      select: { online: true, players: true, maxPlayers: true, at: true },
      take: 20_000,
    });
    return rows;
  }

  public async pruneSnapshots(before: Date): Promise<number> {
    return (await this.client.fivemStatusSnapshot.deleteMany({ where: { at: { lt: before } } })).count;
  }
}

function mapConfig(row: SettingsRow): FivemGuildConfig {
  return {
    settings: {
      guildId: row.guildId,
      ...(row.serverAddress ? { serverAddress: row.serverAddress } : {}),
      ...(row.connectUrl ? { connectUrl: row.connectUrl } : {}),
      ...(row.statusChannelId ? { statusChannelId: row.statusChannelId } : {}),
      updateIntervalSeconds: row.updateIntervalSeconds,
      ...(row.alertChannelId ? { alertChannelId: row.alertChannelId } : {}),
      ...(row.alertRoleId ? { alertRoleId: row.alertRoleId } : {}),
      restartTimes: row.restartTimes,
      timeZone: row.timeZone,
      restartWarningMinutes: row.restartWarningMinutes,
      revision: row.revision,
    },
    state: {
      ...(row.statusMessageId ? { statusMessageId: row.statusMessageId } : {}),
      ...(row.lastOnline === null ? {} : { lastOnline: row.lastOnline }),
      ...(row.onlineSince ? { onlineSince: row.onlineSince } : {}),
      failureStreak: row.failureStreak,
      ...(row.lastPolledAt ? { lastPolledAt: row.lastPolledAt } : {}),
      sentRestartWarnings: row.sentRestartWarnings,
    },
  };
}

import { randomUUID } from "node:crypto";

import { defaultVoiceSettings } from "./VoiceRoomService.js";
import type { VoiceHub, VoiceHubInput, VoiceRepository, VoiceRoom, VoiceRoomCreateData, VoiceRoomPatch, VoiceSettings, VoiceSettingsInput } from "./types.js";
import { VoiceError } from "./validation.js";

/** Process-local repository for tests. Not for production use. */
export class InMemoryVoiceRepository implements VoiceRepository {
  public readonly settingsByGuild = new Map<string, VoiceSettings>();
  public readonly hubList: VoiceHub[] = [];
  public readonly roomList: VoiceRoom[] = [];

  public constructor(private readonly now: () => Date = () => new Date()) {}

  public async getSettings(guildId: string): Promise<VoiceSettings | undefined> {
    return this.settingsByGuild.get(guildId);
  }

  public async saveSettings(input: VoiceSettingsInput): Promise<VoiceSettings> {
    const current = this.settingsByGuild.get(input.guildId) ?? defaultVoiceSettings(input.guildId);
    if (input.expectedRevision !== undefined && input.expectedRevision !== current.revision)
      throw new VoiceError("CONFLICT", "Voice room settings changed since they were loaded.", { currentRevision: current.revision });
    const { expectedRevision: _expected, ...rest } = input;
    const saved = { ...rest, revision: current.revision + 1 };
    this.settingsByGuild.set(input.guildId, saved);
    return saved;
  }

  public async listHubs(guildId: string): Promise<readonly VoiceHub[]> {
    return this.hubList.filter((hub) => hub.guildId === guildId);
  }

  public async getHub(guildId: string, id: string): Promise<VoiceHub | undefined> {
    return this.hubList.find((hub) => hub.guildId === guildId && hub.id === id);
  }

  public async findHubByChannel(guildId: string, channelId: string): Promise<VoiceHub | undefined> {
    return this.hubList.find((hub) => hub.guildId === guildId && hub.channelId === channelId);
  }

  public async createHub(guildId: string, input: VoiceHubInput): Promise<VoiceHub> {
    const hub: VoiceHub = { ...input, id: randomUUID(), guildId, createdAt: this.now(), updatedAt: this.now() };
    this.hubList.push(hub);
    return hub;
  }

  public async updateHub(guildId: string, id: string, input: VoiceHubInput): Promise<VoiceHub> {
    const index = this.hubList.findIndex((hub) => hub.guildId === guildId && hub.id === id);
    const current = this.hubList[index];
    if (!current) throw new VoiceError("NOT_FOUND", "That hub no longer exists.");
    const { categoryId, ...rest } = input;
    const updated: VoiceHub = { id, guildId, createdAt: current.createdAt, ...rest, ...(categoryId ? { categoryId } : {}), updatedAt: this.now() };
    this.hubList[index] = updated;
    return updated;
  }

  public async deleteHub(guildId: string, id: string): Promise<void> {
    const index = this.hubList.findIndex((hub) => hub.guildId === guildId && hub.id === id);
    if (index >= 0) this.hubList.splice(index, 1);
    for (const [roomIndex, room] of this.roomList.entries())
      if (room.hubId === id) {
        const { hubId: _hub, ...rest } = room;
        this.roomList[roomIndex] = rest;
      }
  }

  public async listRooms(guildId?: string): Promise<readonly VoiceRoom[]> {
    return this.roomList.filter((room) => !guildId || room.guildId === guildId);
  }

  public async getRoom(guildId: string, id: string): Promise<VoiceRoom | undefined> {
    return this.roomList.find((room) => room.guildId === guildId && room.id === id);
  }

  public async findRoomByChannel(channelId: string): Promise<VoiceRoom | undefined> {
    return this.roomList.find((room) => room.channelId === channelId);
  }

  public async findRoomByOwner(guildId: string, ownerId: string): Promise<VoiceRoom | undefined> {
    return this.roomList.find((room) => room.guildId === guildId && room.ownerId === ownerId);
  }

  public async countRooms(guildId: string, hubId: string): Promise<number> {
    return this.roomList.filter((room) => room.guildId === guildId && room.hubId === hubId).length;
  }

  public async createRoom(input: VoiceRoomCreateData): Promise<VoiceRoom> {
    const room: VoiceRoom = { ...input, id: randomUUID(), createdAt: this.now() };
    this.roomList.push(room);
    return room;
  }

  public async updateRoom(id: string, patch: VoiceRoomPatch): Promise<VoiceRoom> {
    const index = this.roomList.findIndex((room) => room.id === id);
    const current = this.roomList[index];
    if (!current) throw new VoiceError("NOT_FOUND", "That room no longer exists.");
    const next: Record<string, unknown> = { ...current };
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) delete next[key];
      else if (value !== undefined) next[key] = value;
    }
    const updated = next as unknown as VoiceRoom;
    this.roomList[index] = updated;
    return updated;
  }

  public async deleteRoom(id: string): Promise<void> {
    const index = this.roomList.findIndex((room) => room.id === id);
    if (index >= 0) this.roomList.splice(index, 1);
  }
}

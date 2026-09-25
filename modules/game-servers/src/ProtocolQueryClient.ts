import { MinecraftBedrockClient } from "./MinecraftBedrockClient.js";
import { MinecraftJavaClient } from "./MinecraftJavaClient.js";
import { SteamQueryClient } from "./SteamQueryClient.js";
import type { GameServerQueryClient, GameServerStatus, GamesServerKind } from "./types.js";

/** Picks the protocol client for a server kind. Never throws: failures come back as offline. */
export class ProtocolQueryClient implements GameServerQueryClient {
  public constructor(
    private readonly java: MinecraftJavaClient = new MinecraftJavaClient(),
    private readonly bedrock: MinecraftBedrockClient = new MinecraftBedrockClient(),
    private readonly steam: SteamQueryClient = new SteamQueryClient(),
  ) {}

  public async query(kind: GamesServerKind, address: string): Promise<GameServerStatus> {
    if (kind === "minecraft-java") return this.java.query(address);
    if (kind === "minecraft-bedrock") return this.bedrock.query(address);
    return this.steam.query(address);
  }
}

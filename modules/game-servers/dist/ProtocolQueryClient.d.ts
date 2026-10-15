import { MinecraftBedrockClient } from "./MinecraftBedrockClient.js";
import { MinecraftJavaClient } from "./MinecraftJavaClient.js";
import { SteamQueryClient } from "./SteamQueryClient.js";
import type { GameServerQueryClient, GameServerStatus, GamesServerKind } from "./types.js";
/** Picks the protocol client for a server kind. Never throws: failures come back as offline. */
export declare class ProtocolQueryClient implements GameServerQueryClient {
    private readonly java;
    private readonly bedrock;
    private readonly steam;
    constructor(java?: MinecraftJavaClient, bedrock?: MinecraftBedrockClient, steam?: SteamQueryClient);
    query(kind: GamesServerKind, address: string): Promise<GameServerStatus>;
}
//# sourceMappingURL=ProtocolQueryClient.d.ts.map